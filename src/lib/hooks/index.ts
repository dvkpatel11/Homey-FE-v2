/**
 * Hooks - Main Export
 * Centralized exports for all custom hooks
 */

// Form hooks
export * from './form';

// Utility hooks
export { useDebounce, useDebouncedCallback, useDebounceState } from './useDebounce';
export { useLocalStorage, useLocalStorageObject, useLocalStorageArray, useLocalStorageBoolean } from './useLocalStorage';
export { useMobile, usePWA, useMobileInteractions, useHapticFeedback, useSafeArea, useSwipeGestures } from './useMobile';

// Core feature hooks
export { useChat } from './useChat';
export { useExpenses, useBillSplitting } from './useExpenses';
export { useRealtime, useHouseholdRealtime, useUserRealtime } from './useRealtime';
export { useTasks, useTaskCompletion } from './useTasks';

// Type exports for external use
export type {
  ChatState,
  ChatActions,
  ExpenseState,
  ExpenseActions,
  TaskState,
  TaskActions,
  RealtimeSubscription,
  RealtimeStatus,
  RealtimeActions,
} from './useChat';
