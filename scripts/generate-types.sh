#!/bin/bash

# Homey App - Generate Production TypeScript Types
# This script generates a comprehensive types.ts file for the frontend API layer

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TYPES_DIR="src/types"
TYPES_FILE="$TYPES_DIR/api.ts"
# BACKUP_DIR="src/lib/types/backups"

echo -e "${BLUE}🚀 Generating Homey API Types...${NC}"

# Create directories if they don't exist
mkdir -p "$TYPES_DIR"
# mkdir -p "$BACKUP_DIR"

# # Backup existing types file if it exists
# if [ -f "$TYPES_FILE" ]; then
#     TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
#     BACKUP_FILE="$BACKUP_DIR/api_${TIMESTAMP}.ts"
#     echo -e "${YELLOW}📦 Backing up existing types to: $BACKUP_FILE${NC}"
#     cp "$TYPES_FILE" "$BACKUP_FILE"
# fi

# Generate the types file
echo -e "${BLUE}📝 Generating new types file...${NC}"

cat > "$TYPES_FILE" << 'EOF'
/**
 * Homey API Types
 * Auto-generated TypeScript types for the Homey household management app
 * Corresponds to FastAPI Pydantic models
 * 
 * 🔄 Generated on: $(date)
 * 📱 Mobile-first household management with glassmorphic design
 */

// ============================================================================
// Base Types & Utilities
// ============================================================================

export type UUID = string;
export type EmailAddress = string;
export type ISODateTime = string;
export type ISODate = string;
export type DecimalString = string; // Decimal values as strings for precision

// ============================================================================
// Enums (Frontend-managed)
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}

export enum RecurrencePattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum BillStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue'
}

export enum MessageType {
  TEXT = 'text',
  POLL = 'poll',
  SYSTEM = 'system'
}

export enum SwapStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  BILL_DUE = 'bill_due',
  SWAP_REQUEST = 'swap_request',
  PAYMENT_RECEIVED = 'payment_received',
  TASK_COMPLETED = 'task_completed'
}

export enum TaskCategory {
  CLEANING = 'cleaning',
  KITCHEN = 'kitchen',
  SHOPPING = 'shopping',
  MAINTENANCE = 'maintenance',
  UTILITIES = 'utilities',
  OTHER = 'other'
}

export enum BillCategory {
  RENT = 'rent',
  UTILITIES = 'utilities',
  GROCERIES = 'groceries',
  INTERNET = 'internet',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

export enum DevicePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web'
}

// ============================================================================
// Base Models & Common Patterns
// ============================================================================

export interface TimestampMixin {
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Authentication Models
// ============================================================================

export interface AuthRequest {
  email: EmailAddress;
  password: string; // min 8 chars
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ============================================================================
// User & Profile Models
// ============================================================================

export interface UserProfile extends TimestampMixin {
  id: UUID;
  email: EmailAddress;
  full_name: string;
  avatar_url?: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface InviteValidationRequest {
  invite_code: string;
}

export interface InviteValidationResponse {
  household: Record<string, any>;
  valid: boolean;
}

export interface JoinHouseholdRequest {
  invite_code: string;
}

export interface JoinHouseholdResponse {
  household_id: UUID;
  role: UserRole;
  joined_at: ISODateTime;
}

// ============================================================================
// Household Models
// ============================================================================

export interface HouseholdBase {
  name: string;
  max_members: number; // default 5, range 2-20
  address?: string;
  lease_start_date?: ISODate;
  lease_end_date?: ISODate;
}

export interface CreateHouseholdRequest extends HouseholdBase {
  data_retention_days?: number; // default 365, range 30-2555
}

export interface Household extends HouseholdBase, TimestampMixin {
  id: UUID;
  admin_id: UUID;
  invite_code: string;
  member_count?: number;
  data_retention_days: number;
  role?: UserRole; // User's role in this household
  joined_at?: ISODateTime; // When user joined this household
}

export interface HouseholdMember {
  id: UUID;
  user_id: UUID;
  full_name: string;
  email: EmailAddress;
  avatar_url?: string;
  role: UserRole;
  joined_at: ISODateTime;
}

export interface InviteCodeResponse {
  invite_code: string;
  invite_link: string;
  expires_at?: ISODateTime;
}

export interface RemoveMemberRequest {
  user_id: UUID;
  transfer_tasks_to?: UUID;
  reason?: string;
}

export interface LeaveHouseholdRequest {
  transfer_admin_to?: UUID; // If leaving member is admin
}

export interface HouseholdSettings {
  default_currency: string; // default "USD"
  task_reminder_days: number; // default 1, range 0-7
  bill_reminder_days: number; // default 3, range 0-30
  auto_assign_tasks: boolean; // default false
  require_task_photos: boolean; // default false
}

// ============================================================================
// Dashboard Models
// ============================================================================

export interface DashboardKPIs {
  outstanding_tasks: number;
  total_balance_owed: DecimalString;
  upcoming_deadlines: number;
  recent_activity_count: number;
}

export interface CalendarEvent {
  id: UUID;
  title: string;
  date: ISODate;
  type: string; // 'bill' or 'task'
  amount?: DecimalString;
  assigned_to?: string;
}

export interface ActivityItem {
  id: UUID;
  type: string;
  message: string;
  timestamp: ISODateTime;
  user: {
    name: string;
    avatar_url?: string;
  };
}

export interface DashboardData {
  kpis: DashboardKPIs;
  calendar_events: CalendarEvent[];
  recent_activity: ActivityItem[];
}

// ============================================================================
// Task Models
// ============================================================================

export interface TaskAssignment {
  id: UUID;
  assigned_to: UUID;
  assigned_to_name: string;
  assigned_to_avatar?: string;
  assigned_at: ISODateTime;
  completed_at?: ISODateTime;
}

export interface TaskSwapRequest {
  id: UUID;
  task_id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  status: SwapStatus;
  notes?: string;
  requested_at: ISODateTime;
  responded_at?: ISODateTime;
}

export interface TaskBase {
  title: string;
  description?: string;
  due_date?: ISODateTime;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number; // range 1-365
  category?: string;
}

export interface CreateTaskRequest extends TaskBase {
  assigned_to?: UUID[];
}

export interface Task extends TaskBase, TimestampMixin {
  id: UUID;
  household_id: UUID;
  created_by: UUID;
  status: TaskStatus;
  assignments: TaskAssignment[];
  swap_requests: TaskSwapRequest[];
}

export interface TaskCompletionResponse {
  id: UUID;
  status: TaskStatus;
  completed_at: ISODateTime;
  completed_by: UUID;
}

export interface CreateTaskSwapRequest {
  to_user_id: UUID;
  notes?: string;
}

export interface TaskSwapWithDetails {
  id: UUID;
  task: {
    id: UUID;
    title: string;
    due_date?: ISODateTime;
  };
  from_user: {
    id: UUID;
    name: string;
    avatar_url?: string;
  };
  to_user: {
    id: UUID;
    name: string;
    avatar_url?: string;
  };
  status: SwapStatus;
  notes?: string;
  requested_at: ISODateTime;
}

export interface TaskFilterParams {
  status?: string;
  assigned_to?: UUID;
  category?: string;
  due_after?: ISODateTime;
  due_before?: ISODateTime;
}

// ============================================================================
// Bill Models
// ============================================================================

export interface BillSplitBase {
  user_id: UUID;
  amount_owed?: DecimalString;
  percentage?: DecimalString; // range 0-100
}

export interface BillSplit extends BillSplitBase {
  id: UUID;
  user_name: string;
  paid_amount: DecimalString;
  paid_date?: ISODateTime;
}

export interface BillBase {
  title: string;
  description?: string;
  total_amount: DecimalString;
  currency: string; // default "USD"
  due_date: ISODate;
  paid_date?: ISODate;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  category?: string;
}

export interface CreateBillRequest extends BillBase {
  splits: BillSplitBase[];
}

export interface Bill extends BillBase, TimestampMixin {
  id: UUID;
  household_id: UUID;
  paid_by: UUID;
  paid_by_name: string;
  status: BillStatus;
  created_by: UUID;
  splits: BillSplit[];
}

export interface MemberBalance {
  user_id: UUID;
  user_name: string;
  avatar_url?: string;
  total_owed: DecimalString;
  total_paid: DecimalString;
  net_balance: DecimalString;
}

export interface RecentTransaction {
  id: UUID;
  bill_title: string;
  user_name: string;
  amount: DecimalString;
  paid_date: ISODateTime;
}

export interface BalanceSummary {
  total_owed_to_household: DecimalString;
  total_owed_by_household: DecimalString;
  net_balance: DecimalString;
}

export interface HouseholdBalances {
  summary: BalanceSummary;
  member_balances: MemberBalance[];
  recent_transactions: RecentTransaction[];
}

export interface RecordPaymentRequest {
  split_id: UUID;
  amount: DecimalString;
  paid_date?: ISODateTime;
}

export interface PaymentResponse {
  split_id: UUID;
  amount_paid: DecimalString;
  paid_date: ISODateTime;
  remaining_balance: DecimalString;
}

export interface BillFilterParams {
  status?: string;
  paid_by?: UUID;
  category?: string;
  amount_min?: DecimalString;
  amount_max?: DecimalString;
}

// ============================================================================
// Chat & Messaging Models
// ============================================================================

export interface PollVote {
  user_id: UUID;
  user_name: string;
  user_avatar?: string;
  selected_options: number[];
  voted_at: ISODateTime;
}

export interface Poll {
  id: UUID;
  question: string;
  options: string[];
  multiple_choice: boolean;
  expires_at?: ISODateTime;
  votes: PollVote[];
  vote_counts: number[];
  total_votes?: number;
}

export interface PollCreate {
  question: string;
  options: string[]; // min 2, max 10
  multiple_choice: boolean;
  expires_at?: ISODateTime;
}

export interface MessageBase {
  content: string; // max 2000 chars
  message_type: MessageType;
  replied_to?: UUID;
}

export interface CreateMessageRequest extends MessageBase {
  poll?: PollCreate;
}

export interface Message extends MessageBase, TimestampMixin {
  id: UUID;
  household_id: UUID;
  user_id: UUID;
  user_name: string;
  user_avatar?: string;
  edited_at?: ISODateTime;
  deleted_at?: ISODateTime;
  poll?: Poll;
}

export interface CreatePollVoteRequest {
  selected_options: number[];
}

export interface PollVoteResponse {
  poll_id: UUID;
  user_id: UUID;
  selected_options: number[];
  voted_at: ISODateTime;
  updated_vote_counts: number[];
}

// ============================================================================
// Notification Models
// ============================================================================

export interface Notification extends TimestampMixin {
  id: UUID;
  user_id: UUID;
  household_id: UUID;
  title: string;
  message: string;
  type: NotificationType;
  related_id?: UUID;
  related_table?: string;
  read_at?: ISODateTime;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: Record<string, any>; // includes unread_count and pagination
}

export interface NotificationReadResponse {
  id: UUID;
  read_at: ISODateTime;
}

export interface ReadAllNotificationsResponse {
  marked_read_count: number;
}

export interface DeviceToken {
  user_id: UUID;
  token: string;
  platform: string; // DevicePlatform enum values
  active: boolean;
}

// ============================================================================
// Response Models with Pagination
// ============================================================================

export interface TaskListResponse {
  data: Task[];
  meta: Record<string, any>; // pagination info
}

export interface BillListResponse {
  data: Bill[];
  meta: Record<string, any>; // pagination info
}

export interface MessageListResponse {
  data: Message[];
  meta: Record<string, any>; // pagination info
}

export interface HouseholdListResponse {
  data: Household[];
}

export interface HouseholdMemberListResponse {
  data: HouseholdMember[];
}

export interface TaskSwapListResponse {
  data: TaskSwapWithDetails[];
}

// ============================================================================
// API Client Configuration Types
// ============================================================================

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// ============================================================================
// Real-time Subscription Types
// ============================================================================

export interface RealtimeSubscriptionConfig {
  channel: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  old?: T;
  new?: T;
  errors?: any[];
}

// ============================================================================
// Query Parameters & Filters
// ============================================================================

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TaskQueryParams extends BaseQueryParams, TaskFilterParams {}
export interface BillQueryParams extends BaseQueryParams, BillFilterParams {}

export interface MessageQueryParams extends BaseQueryParams {
  before?: ISODateTime;
  after?: ISODateTime;
  type?: MessageType;
}

export interface NotificationQueryParams extends BaseQueryParams {
  read?: boolean;
  type?: NotificationType;
}

// ============================================================================
// Utility Types
// ============================================================================

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Partial<Pick<T, K>>;

// Helper types for API responses
export type ApiSuccess<T> = ApiResponse<T>;
export type ApiFailure = ApiError;
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

// Helper type guards
export const isApiError = (response: any): response is ApiError => {
  return response && typeof response.error === 'object' && typeof response.error.code === 'string';
};

export const isApiSuccess = <T>(response: any): response is ApiSuccess<T> => {
  return response && response.data !== undefined && !isApiError(response);
};

// ============================================================================
// Export all enums as const assertions for better type safety
// ============================================================================

export const USER_ROLES = Object.values(UserRole) as const;
export const TASK_STATUSES = Object.values(TaskStatus) as const;
export const RECURRENCE_PATTERNS = Object.values(RecurrencePattern) as const;
export const BILL_STATUSES = Object.values(BillStatus) as const;
export const MESSAGE_TYPES = Object.values(MessageType) as const;
export const SWAP_STATUSES = Object.values(SwapStatus) as const;
export const NOTIFICATION_TYPES = Object.values(NotificationType) as const;
export const TASK_CATEGORIES = Object.values(TaskCategory) as const;
export const BILL_CATEGORIES = Object.values(BillCategory) as const;
export const DEVICE_PLATFORMS = Object.values(DevicePlatform) as const;
EOF

# Replace the timestamp placeholder
sed -i "s/\$(date)/$(date)/" "$TYPES_FILE"

echo -e "${GREEN}✅ Types file generated successfully!${NC}"
echo -e "${BLUE}📍 Location: $TYPES_FILE${NC}"

# Generate API endpoints reference file
ENDPOINTS_FILE="$TYPES_DIR/endpoints.ts"
echo -e "${BLUE}📝 Generating API endpoints reference...${NC}"

cat > "$ENDPOINTS_FILE" << 'EOF'
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
EOF

echo -e "${GREEN}✅ API endpoints reference generated!${NC}"
echo -e "${BLUE}📍 Location: $ENDPOINTS_FILE${NC}"

# Generate index file for clean imports
INDEX_FILE="$TYPES_DIR/index.ts"
echo -e "${BLUE}📝 Generating index file...${NC}"

cat > "$INDEX_FILE" << 'EOF'
/**
 * Homey Types - Main Export
 * Clean imports for all API types and endpoints
 */

// Export all types
export * from './api';

// Export endpoints
export * from './endpoints';

// Re-export commonly used types for convenience
export type {
  ApiResponse,
  ApiError,
  UserProfile,
  Household,
  Task,
  Bill,
  Message,
  Notification,
  DashboardData,
} from './api';

// Re-export enums
export {
  UserRole,
  TaskStatus,
  BillStatus,
  MessageType,
  NotificationType,
  TaskCategory,
  BillCategory,
} from './api';
EOF

echo -e "${GREEN}✅ Index file generated!${NC}"
echo -e "${BLUE}📍 Location: $INDEX_FILE${NC}"

# Generate TypeScript validation helpers
VALIDATION_FILE="$TYPES_DIR/validation.ts"
echo -e "${BLUE}📝 Generating validation helpers...${NC}"

cat > "$VALIDATION_FILE" << 'EOF'
/**
 * Homey API Validation Helpers
 * Runtime validation and type guards for API responses
 */

import type { ApiError, ApiResponse } from './api';

// Type guards
export const isApiError = (response: unknown): response is ApiError => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as any).error === 'object' &&
    typeof (response as any).error.code === 'string'
  );
};

export const isApiSuccess = <T>(response: unknown): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    !isApiError(response)
  );
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\d{9,15}$/;
  return phoneRegex.test(phone);
};

// Form validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCreateHousehold = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Household name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Household name must be 100 characters or less';
  }
  
  if (data.max_members && (data.max_members < 2 || data.max_members > 20)) {
    errors.max_members = 'Max members must be between 2 and 20';
  }
  
  if (data.address && data.address.length > 255) {
    errors.address = 'Address must be 255 characters or less';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreateTask = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Task title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Task title must be 200 characters or less';
  }
  
  if (data.description && data.description.length > 1000) {
    errors.description = 'Task description must be 1000 characters or less';
  }
  
  if (data.is_recurring && !data.recurrence_pattern) {
    errors.recurrence_pattern = 'Recurrence pattern is required for recurring tasks';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreateBill = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Bill title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Bill title must be 200 characters or less';
  }
  
  if (!data.total_amount || parseFloat(data.total_amount) <= 0) {
    errors.total_amount = 'Total amount must be greater than 0';
  }
  
  if (!data.due_date) {
    errors.due_date = 'Due date is required';
  }
  
  if (!data.splits || !Array.isArray(data.splits) || data.splits.length === 0) {
    errors.splits = 'At least one bill split is required';
  } else {
    // Validate splits
    const hasPercentages = data.splits.some((split: any) => split.percentage !== undefined);
    const hasAmounts = data.splits.some((split: any) => split.amount_owed !== undefined);
    
    if (hasPercentages && hasAmounts) {
      errors.splits = 'Cannot mix percentage and amount-based splits';
    } else if (hasPercentages) {
      const totalPercentage = data.splits.reduce((sum: number, split: any) => 
        sum + (parseFloat(split.percentage) || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.splits = 'Percentage splits must total 100%';
      }
    } else if (hasAmounts) {
      const totalSplitAmount = data.splits.reduce((sum: number, split: any) => 
        sum + (parseFloat(split.amount_owed) || 0), 0);
      if (Math.abs(totalSplitAmount - parseFloat(data.total_amount)) > 0.01) {
        errors.splits = 'Split amounts must equal total bill amount';
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Decimal helpers for precise money calculations
export const formatCurrency = (amount: string | number, currency = 'USD'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const parseCurrencyToDecimal = (currencyString: string): string => {
  const cleaned = currencyString.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Date helpers
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isDateInPast = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

export const daysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
EOF

echo -e "${GREEN}✅ Validation helpers generated!${NC}"
echo -e "${BLUE}📍 Location: $VALIDATION_FILE${NC}"

# Create a README for the types directory
README_FILE="$TYPES_DIR/README.md"
echo -e "${BLUE}📝 Generating types documentation...${NC}"

cat > "$README_FILE" << 'EOF'
# Homey API Types

This directory contains all TypeScript type definitions for the Homey household management app API.

## Files

- **`api.ts`** - Complete type definitions matching FastAPI Pydantic models
- **`endpoints.ts`** - Centralized API endpoint definitions
- **`validation.ts`** - Runtime validation helpers and type guards
- **`index.ts`** - Main export file for clean imports

## Usage

### Basic Import
```typescript
import { UserProfile, Task, Bill, API_ENDPOINTS } from '@/types';
```

### API Response Handling
```typescript
import { ApiResponse, isApiSuccess, isApiError } from '@/types';

const response = await fetch('/api/households');
const data = await response.json();

if (isApiSuccess<Household[]>(data)) {
  // TypeScript knows data.data is Household[]
  console.log(data.data);
} else if (isApiError(data)) {
  // TypeScript knows data.error exists
  console.error(data.error.message);
}
```

### Endpoint Usage
```typescript
import { API_ENDPOINTS } from '@/types';

// Type-safe endpoint building
const url = API_ENDPOINTS.HOUSEHOLDS.GET(householdId);
const tasksUrl = API_ENDPOINTS.HOUSEHOLDS.TASKS(householdId);
```

### Validation
```typescript
import { validateCreateTask, validateEmail } from '@/types';

const taskData = { title: '', description: 'Test task' };
const validation = validateCreateTask(taskData);

if (!validation.isValid) {
  console.log(validation.errors); // { title: 'Task title is required' }
}
```

## Type Safety Guidelines

1. **Always use type guards** for API responses
2. **Validate user input** before sending to API
3. **Use enums** instead of string literals
4. **Handle decimal precision** with string types for money

## Real-time Subscriptions

```typescript
import { REALTIME_CHANNELS, RealtimePayload, Message } from '@/types';

const channel = supabase.channel(REALTIME_CHANNELS.CHAT(householdId));
channel.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'messages',
  filter: `household_id=eq.${householdId}`
}, (payload: RealtimePayload<Message>) => {
  // Handle real-time message updates
});
```

## Regeneration

To regenerate these types, run:
```bash
./scripts/generate-types.sh
```

This will backup existing types and generate fresh ones based on the latest Pydantic models.
EOF

echo -e "${GREEN}✅ Documentation generated!${NC}"
echo -e "${BLUE}📍 Location: $README_FILE${NC}"

# Create package.json script entry
echo -e "${BLUE}📝 Adding npm script...${NC}"

if [ -f "package.json" ]; then
    # Check if the script already exists
    if grep -q '"generate:types"' package.json; then
        echo -e "${YELLOW}⚠️  'generate:types' script already exists in package.json${NC}"
    else
        # Add the script (this is a simple approach - in production you might want to use jq)
        sed -i 's/"scripts": {/"scripts": {\n    "generate:types": ".\/scripts\/generate-types.sh",/' package.json
        echo -e "${GREEN}✅ Added 'generate:types' script to package.json${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  package.json not found - you can manually add: \"generate:types\": \"./scripts/generate-types.sh\"${NC}"
fi

# Create scripts directory and copy this script there
SCRIPTS_DIR="scripts"
mkdir -p "$SCRIPTS_DIR"
cp "$0" "$SCRIPTS_DIR/generate-types.sh" 2>/dev/null || echo -e "${YELLOW}⚠️  Could not copy script to scripts directory${NC}"

# Final summary
echo ""
echo -e "${GREEN}🎉 Homey API Types Generation Complete!${NC}"
echo ""
echo -e "${BLUE}📁 Generated Files:${NC}"
echo -e "   📄 $TYPES_FILE"
echo -e "   📄 $ENDPOINTS_FILE" 
echo -e "   📄 $VALIDATION_FILE"
echo -e "   📄 $INDEX_FILE"
echo -e "   📄 $README_FILE"
echo ""
echo -e "${BLUE}🔧 Usage:${NC}"
echo -e "   Import: ${GREEN}import { UserProfile, API_ENDPOINTS } from '@/types';${NC}"
echo -e "   Script: ${GREEN}npm run generate:types${NC}"
echo ""
echo -e "${BLUE}🔄 Next Steps:${NC}"
echo -e "   1. Update your tsconfig.json paths if needed"
echo -e "   2. Install runtime validation library (zod, yup, etc.) if desired"
echo -e "   3. Integrate with your API client layer"
echo ""
echo -e "${GREEN}✨ Happy coding with type safety!${NC}"