/**
 * API Configuration
 * Enhanced configuration with mock server integration
 */

// Environment detection helper
const getApiMode = () => {
  const mode = import.meta.env.VITE_API_MODE || "development";
  return mode;
};

// Base URL detection based on mode
const getBaseUrl = () => {
  const mode = getApiMode();

  switch (mode) {
    case "mock":
      return "http://localhost:8000";
    case "development":
      return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    case "production":
      return import.meta.env.VITE_API_BASE_URL || "https://your-api.com/api/v1";
    default:
      return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  }
};

// Mock-specific configuration
const getMockConfig = () => {
  const mockDelay = parseInt(import.meta.env.VITE_API_MOCK_DELAY) || 300;
  const mockErrorRate = parseFloat(import.meta.env.VITE_API_MOCK_ERROR_RATE) || 0;

  return {
    enabled: getApiMode() === "mock",
    delay: mockDelay,
    errorRate: mockErrorRate,
    bypassAuth: true,
  };
};

export const API_CONFIG = {
  // Base configuration
  baseURL: getBaseUrl(),
  version: "v1",
  mode: getApiMode(),

  // Timeouts and retries
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retryAttempts: parseInt(import.meta.env.VITE_API_RETRIES) || 3,
  retryDelay: 1000,

  // Feature flags
  enableCaching: import.meta.env.VITE_ENABLE_API_CACHING !== "false",
  enableRetry: import.meta.env.VITE_ENABLE_API_RETRY !== "false",
  enableLogging: import.meta.env.MODE === "development" || getApiMode() === "mock",

  // Mock configuration
  mock: getMockConfig(),

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

  // Real-time configuration
  realtime: {
    enabled: import.meta.env.VITE_REALTIME_ENABLED === "true",
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    wsUrl: import.meta.env.VITE_WS_URL,
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

  // Logging utility
  log: (...args: any[]) => {
    if (API_CONFIG.enableLogging) {
      const prefix = API_CONFIG.mock.enabled ? "[MOCK API]" : "[API]";
      console.log(prefix, ...args);
    }
  },

  // Debug utility
  debug: (...args: any[]) => {
    if (API_CONFIG.enableLogging && API_CONFIG.mode === "development") {
      console.debug("[API DEBUG]", ...args);
    }
  },

  // Warn utility
  warn: (...args: any[]) => {
    if (API_CONFIG.enableLogging) {
      console.warn("[API WARN]", ...args);
    }
  },

  // Environment helpers
  isDevelopment: import.meta.env.MODE === "development",
  isProduction: import.meta.env.MODE === "production",
  isMock: getApiMode() === "mock",

  // Feature detection helpers
  hasRealtime: () => API_CONFIG.realtime.enabled && API_CONFIG.realtime.supabaseUrl,
  hasCaching: () => API_CONFIG.enableCaching,
  hasRetry: () => API_CONFIG.enableRetry,
} as const;

export type ApiConfig = typeof API_CONFIG;

// Environment-specific configurations
export const ENV_CONFIGS = {
  development: {
    timeout: 10000,
    retryAttempts: 2,
    enableLogging: true,
  },
  mock: {
    timeout: 5000,
    retryAttempts: 1,
    enableLogging: true,
    bypassAuth: true,
  },
  production: {
    timeout: 30000,
    retryAttempts: 3,
    enableLogging: false,
  },
} as const;

// Apply environment-specific overrides
const envConfig = ENV_CONFIGS[API_CONFIG.mode as keyof typeof ENV_CONFIGS];
if (envConfig) {
  Object.assign(API_CONFIG, envConfig);
}

// Startup logging
API_CONFIG.log("API Configuration initialized:", {
  mode: API_CONFIG.mode,
  baseURL: API_CONFIG.baseURL,
  mock: API_CONFIG.mock.enabled,
  realtime: API_CONFIG.hasRealtime(),
  caching: API_CONFIG.hasCaching(),
  retry: API_CONFIG.hasRetry(),
});

export default API_CONFIG;
