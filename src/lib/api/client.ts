/**
 * Base API Client
 * Handles authentication, retries, error handling, and response transformation
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from '@types/axios';
import { 
  ApiResponse, 
  ApiError, 
  isApiSuccess, 
  isApiError,
  UUID 
} from '@/lib/types';
import { API_CONFIG } from '@/lib/config/api';
import { supabase } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorToast?: boolean;
  retries?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestQueue = new Map<string, Promise<any>>();

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if not skipped
        if (!config.skipAuth) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
          }
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = crypto.randomUUID();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RequestConfig;
        
        // Handle 401 errors (token refresh)
        if (error.response?.status === 401 && !config.skipAuth) {
          try {
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError) {
              // Retry original request
              return this.client.request(config);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        // Handle retry logic
        const retries = config.retries || 0;
        if (retries < API_CONFIG.retryAttempts && this.shouldRetry(error)) {
          config.retries = retries + 1;
          
          // Exponential backoff
          const delay = API_CONFIG.retryDelay * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.client.request(config);
        }

        // Show error toast if not skipped
        if (!config.skipErrorToast) {
          this.handleErrorToast(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx status codes
    return !error.response || 
           error.response.status >= 500 || 
           error.code === 'NETWORK_ERROR';
  }

  private handleErrorToast(error: AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as any;
    
    let message = 'Something went wrong';
    
    if (data?.error?.message) {
      message = data.error.message;
    } else if (status) {
      switch (status) {
        case 400:
          message = 'Invalid request';
          break;
        case 401:
          message = 'Please sign in again';
          break;
        case 403:
          message = 'Access denied';
          break;
        case 404:
          message = 'Not found';
          break;
        case 429:
          message = 'Too many requests. Please wait.';
          break;
        case 500:
          message = 'Server error. Please try again.';
          break;
      }
    }
    
    toast.error(message);
  }

  // Cache methods
  private getCacheKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  private getCachedResponse<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < API_CONFIG.cache.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedResponse(key: string, data: any): void {
    if (this.cache.size >= API_CONFIG.cache.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Request deduplication
  private getDuplicateRequest<T>(key: string): Promise<T> | null {
    return this.requestQueue.get(key) || null;
  }

  private setDuplicateRequest<T>(key: string, promise: Promise<T>): Promise<T> {
    this.requestQueue.set(key, promise);
    promise.finally(() => this.requestQueue.delete(key));
    return promise;
  }

  // Main request method
  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method = 'GET', url, params, data } = config;
    const requestKey = this.getCacheKey(method, url || '', params || data);

    // Check for duplicate requests
    const duplicateRequest = this.getDuplicateRequest<ApiResponse<T>>(requestKey);
    if (duplicateRequest && method === 'GET') {
      return duplicateRequest;
    }

    // Check cache for GET requests
    if (method === 'GET') {
      const cached = this.getCachedResponse<ApiResponse<T>>(requestKey);
      if (cached) {
        return cached;
      }
    }

    // Make request
    const requestPromise = this.makeRequest<T>(config);

    // Add to request queue for deduplication
    if (method === 'GET') {
      this.setDuplicateRequest(requestKey, requestPromise);
    }

    const response = await requestPromise;

    // Cache successful GET requests
    if (method === 'GET' && isApiSuccess(response)) {
      this.setCachedResponse(requestKey, response);
    }

    return response;
  }

  private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await this.client.request(config);
      
      // Handle different response formats
      if (response.data && typeof response.data === 'object') {
        // FastAPI format with data wrapper
        if ('data' in response.data) {
          return response.data as ApiResponse<T>;
        }
        
        // Direct data response
        return {
          data: response.data as T,
          message: response.statusText,
          meta: {
            status: response.status,
            headers: response.headers,
          },
        };
      }
      
      // Fallback for primitive responses
      return {
        data: response.data as T,
        message: response.statusText,
      };
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError: ApiError = {
          error: {
            code: error.code || 'UNKNOWN_ERROR',
            message: error.message,
            details: error.response?.data,
          },
        };
        return apiError as any; // Type assertion for error case
      }
      
      throw error;
    }
  }

  // Convenience methods
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  setDefaultHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper function to handle API responses consistently
export const handleApiResponse = <T>(
  response: ApiResponse<T> | ApiError
): T => {
  if (isApiSuccess<T>(response)) {
    return response.data;
  } else if (isApiError(response)) {
    throw new Error(response.error.message);
  } else {
    throw new Error('Invalid API response format');
  }
};

// Type-safe API call wrapper
export const apiCall = async <T>(
  apiFunction: () => Promise<ApiResponse<T>>
): Promise<T> => {
  const response = await apiFunction();
  return handleApiResponse(response);
};
