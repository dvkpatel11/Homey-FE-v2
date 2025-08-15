/**
 * Homey API Endpoints
 * Centralized endpoint definitions with type safety
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },

  // Profile
  PROFILE: {
    GET: '/api/profile',
    UPDATE: '/api/profile',
    AVATAR: '/api/profile/avatar',
  },

  // Invitations
  INVITE: {
    VALIDATE: '/api/invite/validate',
    JOIN: '/api/invite/join',
  },

  // Households
  HOUSEHOLDS: {
    LIST: '/api/households',
    CREATE: '/api/households',
    GET: (id: string) => `/api/households/${id}`,
    UPDATE: (id: string) => `/api/households/${id}`,
    DELETE: (id: string) => `/api/households/${id}`,
    DASHBOARD: (id: string) => `/api/households/${id}/dashboard`,
    SETTINGS: (id: string) => `/api/households/${id}/settings`,
    
    // Members
    MEMBERS: (id: string) => `/api/households/${id}/members`,
    INVITE_CODE: (id: string) => `/api/households/${id}/invite`,
    REMOVE_MEMBER: (id: string, userId: string) => `/api/households/${id}/members/${userId}`,
    LEAVE: (id: string) => `/api/households/${id}/leave`,
    
    // Tasks
    TASKS: (id: string) => `/api/households/${id}/tasks`,
    TASK_SWAPS: (id: string) => `/api/households/${id}/task-swaps`,
    
    // Bills
    BILLS: (id: string) => `/api/households/${id}/bills`,
    BALANCES: (id: string) => `/api/households/${id}/balances`,
    USER_BALANCE: (id: string, userId: string) => `/api/households/${id}/balances/${userId}`,
    
    // Messages
    MESSAGES: (id: string) => `/api/households/${id}/messages`,
  },

  // Tasks
  TASKS: {
    GET: (id: string) => `/api/tasks/${id}`,
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
    ASSIGN: (id: string) => `/api/tasks/${id}/assign`,
    COMPLETE: (id: string) => `/api/tasks/${id}/complete`,
    UNCOMPLETE: (id: string) => `/api/tasks/${id}/uncomplete`,
    SWAP_REQUEST: (id: string) => `/api/tasks/${id}/swap/request`,
  },

  // Task Swaps
  TASK_SWAPS: {
    ACCEPT: (id: string) => `/api/task-swaps/${id}/accept`,
    DECLINE: (id: string) => `/api/task-swaps/${id}/decline`,
  },

  // Bills
  BILLS: {
    GET: (id: string) => `/api/bills/${id}`,
    UPDATE: (id: string) => `/api/bills/${id}`,
    DELETE: (id: string) => `/api/bills/${id}`,
    SPLIT: (id: string) => `/api/bills/${id}/split`,
    PAY: (id: string) => `/api/bills/${id}/pay`,
    SPLITS: (id: string) => `/api/bills/${id}/splits`,
  },

  // Bill Splits
  BILL_SPLITS: {
    PAYMENT: (id: string) => `/api/bill-splits/${id}/payment`,
  },

  // Messages
  MESSAGES: {
    GET: (id: string) => `/api/messages/${id}`,
    UPDATE: (id: string) => `/api/messages/${id}`,
    DELETE: (id: string) => `/api/messages/${id}`,
    POLL: (id: string) => `/api/messages/${id}/poll`,
  },

  // Polls
  POLLS: {
    VOTE: (id: string) => `/api/polls/${id}/vote`,
    RESULTS: (id: string) => `/api/polls/${id}/results`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    READ: (id: string) => `/api/notifications/${id}/read`,
    READ_ALL: '/api/notifications/read-all',
    DELETE: (id: string) => `/api/notifications/${id}`,
    DEVICE: '/api/notifications/device',
    REMOVE_DEVICE: (token: string) => `/api/notifications/device/${token}`,
  },
} as const;

// Rate limits for different endpoint categories
export const RATE_LIMITS = {
  CHAT_MESSAGES: '30 per minute',
  POLL_VOTING: '10 per minute',
  CHAT_HISTORY: '100 per minute',
  TASK_CREATION: '20 per hour',
  BILL_CREATION: '50 per hour',
  DEFAULT: '1000 per hour',
} as const;

// Real-time channel patterns
export const REALTIME_CHANNELS = {
  CHAT: (householdId: string) => `household:${householdId}:messages`,
  TASKS: (householdId: string) => `household:${householdId}:tasks`,
  BILLS: (householdId: string) => `household:${householdId}:bills`,
  NOTIFICATIONS: (userId: string) => `user:${userId}:notifications`,
  POLLS: (householdId: string) => `household:${householdId}:polls`,
} as const;
