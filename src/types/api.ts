/**
 * Homey API Types
 * Auto-generated TypeScript types for the Homey household management app
 * Corresponds to FastAPI Pydantic models
 *
 * 🔄 Generated on: Fri Aug 15 16:46:31 EDT 2025
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
  ADMIN = "admin",
  MEMBER = "member",
}

export enum TaskStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  OVERDUE = "overdue",
}

export enum RecurrencePattern {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum BillStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
}

export enum MessageType {
  TEXT = "text",
  POLL = "poll",
  SYSTEM = "system",
}

export enum SwapStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export enum NotificationType {
  TASK_ASSIGNED = "task_assigned",
  BILL_DUE = "bill_due",
  SWAP_REQUEST = "swap_request",
  PAYMENT_RECEIVED = "payment_received",
  TASK_COMPLETED = "task_completed",
}

export enum TaskCategory {
  CLEANING = "cleaning",
  KITCHEN = "kitchen",
  SHOPPING = "shopping",
  MAINTENANCE = "maintenance",
  UTILITIES = "utilities",
  OTHER = "other",
}

export enum BillCategory {
  RENT = "rent",
  UTILITIES = "utilities",
  GROCERIES = "groceries",
  INTERNET = "internet",
  CLEANING = "cleaning",
  MAINTENANCE = "maintenance",
  OTHER = "other",
}

export enum DevicePlatform {
  IOS = "ios",
  ANDROID = "android",
  WEB = "web",
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
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
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
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
}

export interface RealtimePayload<T = any> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
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
  sort_order?: "asc" | "desc";
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
  return response && typeof response.error === "object" && typeof response.error.code === "string";
};

export const isApiSuccess = <T>(response: any): response is ApiSuccess<T> => {
  return response && response.data !== undefined && !isApiError(response);
};
