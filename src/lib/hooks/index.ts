/**
 * Hooks - Main Export
 * Centralized exports for all custom hooks
 */

// Form hooks
export * from "./form";

// Utility hooks
export { useDebounce, useDebouncedCallback, useDebounceState } from "./useDebounce";
export {
  useLocalStorage,
  useLocalStorageArray,
  useLocalStorageBoolean,
  useLocalStorageObject,
} from "./useLocalStorage";

// Core feature hooks
export { useChat } from "./useChat";
export { useBillSplitting, useExpenses } from "./useExpenses";
export { useHouseholdRealtime, useRealtime, useUserRealtime } from "./useRealtime";
export { useTaskCompletion, useTasks } from "./useTasks";

// Type exports for external use
export type {
  ChatActions,
  ChatState,
  ExpenseActions,
  ExpenseState,
  RealtimeActions,
  RealtimeStatus,
  RealtimeSubscription,
  TaskActions,
  TaskState,
} from "./useChat";
