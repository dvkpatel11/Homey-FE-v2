/**
 * Enhanced API Client with Mock Server Integration
 * Seamlessly switches between mock and production APIs
 */

// import { supabase } from "@/contexts/AuthContext";
// import { API_CONFIG } from "@/lib/config/api";
// import { ApiError, ApiResponse, isApiError, isApiSuccess } from "@/types";
// import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
// import toast from "react-hot-toast";

// export interface RequestConfig extends AxiosRequestConfig {
//   skipAuth?: boolean;
//   skipErrorToast?: boolean;
//   retries?: number;
//   mockDelay?: number; // Override mock delay for specific requests
// }

// export class ApiClient {
//   private client: AxiosInstance;
//   private cache = new Map<string, { data: any; timestamp: number }>();
//   private requestQueue = new Map<string, Promise<any>>();

//   constructor() {
//     this.client = axios.create({
//       baseURL: API_CONFIG.baseURL,
//       timeout: API_CONFIG.timeout,
//       headers: API_CONFIG.headers,
//     });

//     this.setupInterceptors();
//     this.logInitialization();
//   }

//   private logInitialization() {
//     API_CONFIG.log("API Client initialized:", {
//       baseURL: API_CONFIG.baseURL,
//       timeout: API_CONFIG.timeout,
//       mockMode: API_CONFIG.mock.enabled,
//       environment: API_CONFIG.mode,
//     });
//   }

//   private setupInterceptors() {
//     // Request interceptor
//     this.client.interceptors.request.use(
//       async (config: any) => {
//         // Add request ID for tracking
//         config.headers["X-Request-ID"] = crypto.randomUUID();

//         // Mock delay simulation
//         if (API_CONFIG.mock.enabled) {
//           const delay = (config as RequestConfig).mockDelay || API_CONFIG.mock.delay;
//           if (delay > 0) {
//             await new Promise((resolve) => setTimeout(resolve, delay));
//           }
//         }

//         // Add auth token if not skipped and not in mock mode
//         if (!API_CONFIG.mock.bypassAuth) {
//           const {
//             data: { session },
//           } = await supabase.auth.getSession();
//           if (session?.access_token) {
//             config.headers.Authorization = `Bearer ${session.access_token}`;
//           }
//         }

//         // Mock mode special headers
//         if (API_CONFIG.mock.enabled) {
//           config.headers["X-Mock-Mode"] = "true";
//           config.headers["X-Mock-User"] = "user-1"; // Always authenticate as user-1 in mock
//         }

//         API_CONFIG.debug("Request:", {
//           method: config.method?.toUpperCase(),
//           url: config.url,
//           mockMode: API_CONFIG.mock.enabled,
//           skipAuth: config.skipAuth,
//         });

//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // Response interceptor
//     this.client.interceptors.response.use(
//       (response) => {
//         API_CONFIG.debug("Response:", {
//           status: response.status,
//           url: response.config.url,
//           mockMode: API_CONFIG.mock.enabled,
//         });
//         return response;
//       },
//       async (error: AxiosError) => {
//         const config = error.config as RequestConfig;

//         API_CONFIG.warn("Request failed:", {
//           status: error.response?.status,
//           url: config?.url,
//           message: error.message,
//           mockMode: API_CONFIG.mock.enabled,
//         });

//         // Handle mock error simulation
//         if (API_CONFIG.mock.enabled && API_CONFIG.mock.errorRate > 0) {
//           if (Math.random() < API_CONFIG.mock.errorRate) {
//             API_CONFIG.log("Simulating random error for testing");
//             const mockError = new Error("Mock API Error (Simulated)");
//             (mockError as any).response = {
//               status: 500,
//               data: {
//                 error: {
//                   code: "MOCK_ERROR",
//                   message: "This is a simulated error for testing error handling",
//                 },
//               },
//             };
//             throw mockError;
//           }
//         }

//         // Handle 401 errors (token refresh) - skip in mock mode
//         if (error.response?.status === 401 && !config.skipAuth && !API_CONFIG.mock.enabled) {
//           try {
//             const { error: refreshError } = await supabase.auth.refreshSession();
//             if (!refreshError && this.client) {
//               return this.client.request(config);
//             }
//           } catch (refreshError) {
//             API_CONFIG.warn("Token refresh failed:", refreshError);
//           }
//         }

//         // Handle retry logic
//         const retries = config.retries || 0;
//         if (retries < API_CONFIG.retryAttempts && this.shouldRetry(error) && API_CONFIG.hasRetry()) {
//           config.retries = retries + 1;

//           // Exponential backoff
//           const delay = API_CONFIG.retryDelay * Math.pow(2, retries);
//           await new Promise((resolve) => setTimeout(resolve, delay));

//           API_CONFIG.log(`Retrying request (attempt ${retries + 1}/${API_CONFIG.retryAttempts})`);
//           return this.client.request(config);
//         }

//         // Show error toast if not skipped
//         if (!config.skipErrorToast) {
//           this.handleErrorToast(error);
//         }

//         return Promise.reject(error);
//       }
//     );
//   }

//   private shouldRetry(error: AxiosError): boolean {
//     // Don't retry in mock mode unless it's a network error
//     if (API_CONFIG.mock.enabled) {
//       return error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED";
//     }

//     // Retry on network errors or 5xx status codes
//     return (
//       !error.response || error.response.status >= 500 || error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED"
//     );
//   }

//   private handleErrorToast(error: AxiosError) {
//     const status = error.response?.status;
//     const data = error.response?.data as any;

//     let message = "Something went wrong";

//     if (data?.error?.message) {
//       message = data.error.message;
//     } else if (status) {
//       switch (status) {
//         case 400:
//           message = "Invalid request";
//           break;
//         case 401:
//           message = API_CONFIG.mock.enabled ? "Mock auth error" : "Please sign in again";
//           break;
//         case 403:
//           message = "Access denied";
//           break;
//         case 404:
//           message = "Not found";
//           break;
//         case 429:
//           message = "Too many requests. Please wait.";
//           break;
//         case 500:
//           message = API_CONFIG.mock.enabled ? "Mock server error" : "Server error. Please try again.";
//           break;
//       }
//     }

//     // Add mock mode indicator to error messages
//     if (API_CONFIG.mock.enabled) {
//       message = `[Mock] ${message}`;
//     }

//     toast.error(message);
//   }

//   // Cache methods (enhanced for mock mode)
//   private getCacheKey(method: string, url: string, params?: any): string {
//     const mockPrefix = API_CONFIG.mock.enabled ? "mock:" : "";
//     return `${mockPrefix}${method}:${url}:${JSON.stringify(params || {})}`;
//   }

//   private getCachedResponse<T>(key: string): T | null {
//     if (!API_CONFIG.hasCaching()) return null;

//     const cached = this.cache.get(key);
//     if (cached && Date.now() - cached.timestamp < API_CONFIG.cache.ttl) {
//       API_CONFIG.debug("Cache hit:", key);
//       return cached.data;
//     }
//     this.cache.delete(key);
//     return null;
//   }

//   private setCachedResponse(key: string, data: any): void {
//     if (!API_CONFIG.hasCaching()) return;

//     if (this.cache.size >= API_CONFIG.cache.maxSize) {
//       const oldestKey = this.cache.keys().next().value;
//       this.cache.delete(oldestKey ?? "");
//     }
//     this.cache.set(key, { data, timestamp: Date.now() });
//     API_CONFIG.debug("Cache set:", key);
//   }

//   // Request deduplication
//   private getDuplicateRequest<T>(key: string): Promise<T> | null {
//     return this.requestQueue.get(key) || null;
//   }

//   private setDuplicateRequest<T>(key: string, promise: Promise<T>): Promise<T> {
//     this.requestQueue.set(key, promise);
//     promise.finally(() => this.requestQueue.delete(key));
//     return promise;
//   }

//   // Main request method
//   async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
//     const { method = "GET", url, params, data } = config;
//     const requestKey = this.getCacheKey(method, url || "", params || data);

//     // Check for duplicate requests
//     const duplicateRequest = this.getDuplicateRequest<ApiResponse<T>>(requestKey);
//     if (duplicateRequest && method === "GET") {
//       API_CONFIG.debug("Duplicate request detected, returning existing promise");
//       return duplicateRequest;
//     }

//     // Check cache for GET requests
//     if (method === "GET") {
//       const cached = this.getCachedResponse<ApiResponse<T>>(requestKey);
//       if (cached) {
//         return cached;
//       }
//     }

//     // Make request
//     const requestPromise = this.makeRequest<T>(config);

//     // Add to request queue for deduplication
//     if (method === "GET") {
//       this.setDuplicateRequest(requestKey, requestPromise);
//     }

//     const response = await requestPromise;

//     // Cache successful GET requests
//     if (method === "GET" && isApiSuccess(response)) {
//       this.setCachedResponse(requestKey, response);
//     }

//     return response;
//   }

//   private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
//     try {
//       const response: AxiosResponse = await this.client.request(config);

//       // Handle different response formats
//       if (response.data && typeof response.data === "object") {
//         // FastAPI format with data wrapper
//         if ("data" in response.data) {
//           return response.data as ApiResponse<T>;
//         }

//         // Direct data response
//         return {
//           data: response.data as T,
//           message: response.statusText,
//           meta: {
//             status: response.status,
//             headers: response.headers,
//             mockMode: API_CONFIG.mock.enabled,
//           },
//         };
//       }

//       // Fallback for primitive responses
//       return {
//         data: response.data as T,
//         message: response.statusText,
//         meta: {
//           mockMode: API_CONFIG.mock.enabled,
//         },
//       };
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         const apiError: ApiError = {
//           error: {
//             code: error.code || "UNKNOWN_ERROR",
//             message: error.message,
//             details: error.response?.data,
//           },
//         };
//         return apiError as any; // Type assertion for error case
//       }

//       throw error;
//     }
//   }

//   // Convenience methods with mock-aware logging
//   async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
//     API_CONFIG.debug("GET request:", url);
//     return this.request<T>({ ...config, method: "GET", url });
//   }

//   async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
//     API_CONFIG.debug("POST request:", url);
//     return this.request<T>({ ...config, method: "POST", url, data });
//   }

//   async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
//     API_CONFIG.debug("PUT request:", url);
//     return this.request<T>({ ...config, method: "PUT", url, data });
//   }

//   async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
//     API_CONFIG.debug("PATCH request:", url);
//     return this.request<T>({ ...config, method: "PATCH", url, data });
//   }

//   async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
//     API_CONFIG.debug("DELETE request:", url);
//     return this.request<T>({ ...config, method: "DELETE", url });
//   }

//   // Utility methods enhanced for mock mode
//   clearCache(): void {
//     const size = this.cache.size;
//     this.cache.clear();
//     API_CONFIG.log(`Cache cleared (${size} entries removed)`);
//   }

//   clearCachePattern(pattern: string): void {
//     let removed = 0;
//     for (const key of this.cache.keys()) {
//       if (key.includes(pattern)) {
//         this.cache.delete(key);
//         removed++;
//       }
//     }
//     API_CONFIG.log(`Cache pattern cleared: "${pattern}" (${removed} entries removed)`);
//   }

//   setDefaultHeader(key: string, value: string): void {
//     this.client.defaults.headers.common[key] = value;
//     API_CONFIG.debug("Default header set:", key, value);
//   }

//   removeDefaultHeader(key: string): void {
//     delete this.client.defaults.headers.common[key];
//     API_CONFIG.debug("Default header removed:", key);
//   }

//   // Mock mode helpers
//   isMockMode(): boolean {
//     return API_CONFIG.mock.enabled;
//   }

//   getMockConfig() {
//     return API_CONFIG.mock;
//   }

//   getEnvironment() {
//     return {
//       mode: API_CONFIG.mode,
//       baseURL: API_CONFIG.baseURL,
//       mock: API_CONFIG.mock.enabled,
//       realtime: API_CONFIG.hasRealtime(),
//       caching: API_CONFIG.hasCaching(),
//       retry: API_CONFIG.hasRetry(),
//     };
//   }
// }

// // Create singleton instance
// export const apiClient = new ApiClient();

// // Helper function to handle API responses consistently
// export const handleApiResponse = <T>(response: ApiResponse<T> | ApiError): T => {
//   if (isApiSuccess<T>(response)) {
//     return response.data;
//   } else if (isApiError(response)) {
//     throw new Error(response.error.message);
//   } else {
//     throw new Error("Invalid API response format");
//   }
// };

// // Type-safe API call wrapper with mock mode awareness
// export const apiCall = async <T>(apiFunction: () => Promise<ApiResponse<T>>): Promise<T> => {
//   const response = await apiFunction();
//   return handleApiResponse(response);
// };

// // Environment helpers
// export const isProductionAPI = () => API_CONFIG.mode === "production";
// export const isDevelopmentAPI = () => API_CONFIG.mode === "development";
// export const isMockAPI = () => API_CONFIG.mock.enabled;

/**
 * Enhanced API Client with Mock Server Integration
 * Seamlessly switches between mock and production APIs
 * Integrated with custom AuthContext instead of Supabase
 */

import { API_CONFIG } from "@/lib/config/api";
import { ApiError, ApiResponse, isApiError, isApiSuccess } from "@/types/api";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import toast from "react-hot-toast";

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorToast?: boolean;
  retries?: number;
  mockDelay?: number; // Override mock delay for specific requests
}

// Token provider interface for dependency injection
export interface TokenProvider {
  getToken: () => string | null;
  refreshToken: () => Promise<boolean>;
}

export class ApiClient {
  private client: AxiosInstance;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestQueue = new Map<string, Promise<any>>();
  private tokenProvider: TokenProvider | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
    this.logInitialization();
  }

  // Set token provider (called by AuthContext)
  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
    API_CONFIG.debug("Token provider set");
  }

  private logInitialization() {
    API_CONFIG.log("API Client initialized:", {
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      mockMode: API_CONFIG.mock.enabled,
      environment: API_CONFIG.mode,
    });
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: any) => {
        // Add request ID for tracking
        config.headers["X-Request-ID"] = crypto.randomUUID();

        // Mock delay simulation
        if (API_CONFIG.mock.enabled) {
          const delay = (config as RequestConfig).mockDelay || API_CONFIG.mock.delay;
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        // Add auth token if not skipped
        if (!(config as RequestConfig).skipAuth) {
          if (API_CONFIG.mock.enabled && API_CONFIG.mock.bypassAuth) {
            // Mock mode: add mock headers
            config.headers["X-Mock-Mode"] = "true";
            config.headers["X-Mock-User"] = "user-1"; // Always authenticate as user-1 in mock
          } else if (this.tokenProvider) {
            // Production/Development: use real token
            const token = this.tokenProvider.getToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        }

        API_CONFIG.debug("Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          mockMode: API_CONFIG.mock.enabled,
          skipAuth: (config as RequestConfig).skipAuth,
          hasToken: !!config.headers.Authorization,
        });

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        API_CONFIG.debug("Response:", {
          status: response.status,
          url: response.config.url,
          mockMode: API_CONFIG.mock.enabled,
        });
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as RequestConfig;

        API_CONFIG.warn("Request failed:", {
          status: error.response?.status,
          url: config?.url,
          message: error.message,
          mockMode: API_CONFIG.mock.enabled,
        });

        // Handle mock error simulation
        if (API_CONFIG.mock.enabled && API_CONFIG.mock.errorRate > 0) {
          if (Math.random() < API_CONFIG.mock.errorRate) {
            API_CONFIG.log("Simulating random error for testing");
            const mockError = new Error("Mock API Error (Simulated)");
            (mockError as any).response = {
              status: 500,
              data: {
                error: {
                  code: "MOCK_ERROR",
                  message: "This is a simulated error for testing error handling",
                },
              },
            };
            throw mockError;
          }
        }

        // Handle 401 errors (token refresh) - skip in mock mode with bypass auth
        if (
          error.response?.status === 401 &&
          !config.skipAuth &&
          !(API_CONFIG.mock.enabled && API_CONFIG.mock.bypassAuth) &&
          this.tokenProvider
        ) {
          try {
            const refreshSuccess = await this.tokenProvider.refreshToken();
            if (refreshSuccess && this.client) {
              // Retry the original request with new token
              const newToken = this.tokenProvider.getToken();
              if (newToken && config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.client.request(config);
            }
          } catch (refreshError) {
            API_CONFIG.warn("Token refresh failed:", refreshError);
            // Let the error fall through to logout the user
          }
        }

        // Handle retry logic
        const retries = config.retries || 0;
        if (retries < API_CONFIG.retryAttempts && this.shouldRetry(error) && API_CONFIG.hasRetry()) {
          config.retries = retries + 1;

          // Exponential backoff
          const delay = API_CONFIG.retryDelay * Math.pow(2, retries);
          await new Promise((resolve) => setTimeout(resolve, delay));

          API_CONFIG.log(`Retrying request (attempt ${retries + 1}/${API_CONFIG.retryAttempts})`);
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
    // Don't retry in mock mode unless it's a network error
    if (API_CONFIG.mock.enabled) {
      return error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED";
    }

    // Don't retry auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }

    // Retry on network errors or 5xx status codes
    return (
      !error.response || error.response.status >= 500 || error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED"
    );
  }

  private handleErrorToast(error: AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as any;

    let message = "Something went wrong";

    if (data?.error?.message) {
      message = data.error.message;
    } else if (status) {
      switch (status) {
        case 400:
          message = "Invalid request";
          break;
        case 401:
          message = API_CONFIG.mock.enabled ? "Mock auth error" : "Please sign in again";
          break;
        case 403:
          message = "Access denied";
          break;
        case 404:
          message = "Not found";
          break;
        case 429:
          message = "Too many requests. Please wait.";
          break;
        case 500:
          message = API_CONFIG.mock.enabled ? "Mock server error" : "Server error. Please try again.";
          break;
        default:
          message = `Request failed (${status})`;
      }
    }

    // Add mock mode indicator to error messages
    if (API_CONFIG.mock.enabled) {
      message = `[Mock] ${message}`;
    }

    toast.error(message);
  }

  // Cache methods (enhanced for mock mode)
  private getCacheKey(method: string, url: string, params?: any): string {
    const mockPrefix = API_CONFIG.mock.enabled ? "mock:" : "";
    return `${mockPrefix}${method}:${url}:${JSON.stringify(params || {})}`;
  }

  private getCachedResponse<T>(key: string): T | null {
    if (!API_CONFIG.hasCaching()) return null;

    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < API_CONFIG.cache.ttl) {
      API_CONFIG.debug("Cache hit:", key);
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedResponse(key: string, data: any): void {
    if (!API_CONFIG.hasCaching()) return;

    if (this.cache.size >= API_CONFIG.cache.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey ?? "");
    }
    this.cache.set(key, { data, timestamp: Date.now() });
    API_CONFIG.debug("Cache set:", key);
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
    const { method = "GET", url, params, data } = config;
    const requestKey = this.getCacheKey(method, url || "", params || data);

    // Check for duplicate requests
    const duplicateRequest = this.getDuplicateRequest<ApiResponse<T>>(requestKey);
    if (duplicateRequest && method === "GET") {
      API_CONFIG.debug("Duplicate request detected, returning existing promise");
      return duplicateRequest;
    }

    // Check cache for GET requests
    if (method === "GET") {
      const cached = this.getCachedResponse<ApiResponse<T>>(requestKey);
      if (cached) {
        return cached;
      }
    }

    // Make request
    const requestPromise = this.makeRequest<T>(config);

    // Add to request queue for deduplication
    if (method === "GET") {
      this.setDuplicateRequest(requestKey, requestPromise);
    }

    const response = await requestPromise;

    // Cache successful GET requests
    if (method === "GET" && isApiSuccess(response)) {
      this.setCachedResponse(requestKey, response);
    }

    return response;
  }

  private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await this.client.request(config);

      // Handle different response formats
      if (response.data && typeof response.data === "object") {
        // FastAPI format with data wrapper (your mock server format)
        if ("data" in response.data) {
          return response.data as ApiResponse<T>;
        }

        // Direct data response
        return {
          data: response.data as T,
          message: response.statusText,
          meta: {
            status: response.status,
            headers: response.headers,
            mockMode: API_CONFIG.mock.enabled,
          },
        };
      }

      // Fallback for primitive responses
      return {
        data: response.data as T,
        message: response.statusText,
        meta: {
          mockMode: API_CONFIG.mock.enabled,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError: ApiError = {
          error: {
            code: error.code || "UNKNOWN_ERROR",
            message: error.message,
            details: error.response?.data,
          },
        };
        return apiError as any; // Type assertion for error case
      }

      throw error;
    }
  }

  // Convenience methods with mock-aware logging
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    API_CONFIG.debug("GET request:", url);
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    API_CONFIG.debug("POST request:", url);
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    API_CONFIG.debug("PUT request:", url);
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    API_CONFIG.debug("PATCH request:", url);
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    API_CONFIG.debug("DELETE request:", url);
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  // Utility methods enhanced for mock mode
  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    API_CONFIG.log(`Cache cleared (${size} entries removed)`);
  }

  clearCachePattern(pattern: string): void {
    let removed = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        removed++;
      }
    }
    API_CONFIG.log(`Cache pattern cleared: "${pattern}" (${removed} entries removed)`);
  }

  setDefaultHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
    API_CONFIG.debug("Default header set:", key, value);
  }

  removeDefaultHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
    API_CONFIG.debug("Default header removed:", key);
  }

  // Mock mode helpers
  isMockMode(): boolean {
    return API_CONFIG.mock.enabled;
  }

  getMockConfig() {
    return API_CONFIG.mock;
  }

  getEnvironment() {
    return {
      mode: API_CONFIG.mode,
      baseURL: API_CONFIG.baseURL,
      mock: API_CONFIG.mock.enabled,
      realtime: API_CONFIG.hasRealtime(),
      caching: API_CONFIG.hasCaching(),
      retry: API_CONFIG.hasRetry(),
    };
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper function to handle API responses consistently
export const handleApiResponse = <T>(response: ApiResponse<T> | ApiError): T => {
  if (isApiSuccess<T>(response)) {
    return response.data;
  } else if (isApiError(response)) {
    throw new Error(response.error.message);
  } else {
    throw new Error("Invalid API response format");
  }
};

// Type-safe API call wrapper with mock mode awareness
export const apiCall = async <T>(apiFunction: () => Promise<ApiResponse<T>>): Promise<T> => {
  const response = await apiFunction();
  return handleApiResponse(response);
};

// Environment helpers
export const isProductionAPI = () => API_CONFIG.mode === "production";
export const isDevelopmentAPI = () => API_CONFIG.mode === "development";
export const isMockAPI = () => API_CONFIG.mock.enabled;

// Token provider implementation for AuthContext
export const createTokenProvider = (
  getToken: () => string | null,
  refreshToken: () => Promise<boolean>
): TokenProvider => ({
  getToken,
  refreshToken,
});

// Initialize API client with token provider (call this from AuthContext)
export const initializeApiClient = (tokenProvider: TokenProvider): void => {
  apiClient.setTokenProvider(tokenProvider);
};
