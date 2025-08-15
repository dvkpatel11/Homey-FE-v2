/**
 * API Client - Main Export
 * Centralized exports for all API modules
 */

// Export base client
export { apiClient, handleApiResponse, apiCall } from './client';
export type { RequestConfig } from './client';

// Export individual API modules
export { default as authApi } from './auth';
export { default as householdApi } from './households';
export { default as tasksApi } from './tasks';
export { default as billsApi } from './bills';
export { default as chatApi } from './chat';
export { default as notificationApi } from './notifications';

// Re-export for convenience
export const api = {
  auth: authApi,
  households: householdApi,
  tasks: tasksApi,
  bills: billsApi,
  chat: chatApi,
  notifications: notificationApi,
} as const;

// Export configuration
export { API_CONFIG } from '@/lib/config/api';

// Helper function to initialize API
export const initializeApi = () => {
  // Any global API initialization can go here
  console.log('🌐 API Client initialized');
  
  // Set up global error handlers if needed
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled API error:', event.reason);
  });
};

// Export types for external use
export type {
  ApiResponse,
  ApiError,
  UUID,
} from '@/lib/types';
