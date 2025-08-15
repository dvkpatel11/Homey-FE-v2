/**
 * API Configuration
 * Central configuration for API client
 */

export const API_CONFIG = {
  // Base URLs
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  version: "v1",

  // Timeout settings
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second

  // Headers
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Endpoints
  endpoints: {
    auth: "/api/auth",
    profile: "/api/profile",
    invite: "/api/invite",
    households: "/api/households",
    tasks: "/api/tasks",
    bills: "/api/bills",
    notifications: "/api/notifications",
    upload: "/api/upload",
  },

  // Rate limiting
  rateLimits: {
    default: 1000, // requests per hour
    chat: 30, // messages per minute
    polls: 10, // votes per minute
  },

  // Cache settings
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // max cached responses
  },
} as const;

export type ApiConfig = typeof API_CONFIG;
