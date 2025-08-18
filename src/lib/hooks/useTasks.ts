/**
 * useTasks - Task management with assignments, swaps, and real-time updates
 * Handles task operations, completion tracking, and collaborative features
 * Uses existing tasksApi module for clean separation of concerns
 */
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { tasksApi } from "@/lib/api";
import {
  CreateTaskRequest,
  CreateTaskSwapRequest,
  Task,
  TaskFilterParams,
  TaskListResponse,
  TaskSwapListResponse,
  TaskSwapWithDetails,
  UUID,
  isApiError,
  isApiSuccess,
} from "@/types/api";
import { useCallback, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "./useLocalStorage";

export interface TaskState {
  tasks: Task[];
  swaps: TaskSwapWithDetails[];
  loading: boolean;
  creating: boolean;
  completing: boolean;
  selectedTasks: Set<UUID>;
  filters: TaskFilterParams;
  viewMode: "list" | "kanban" | "calendar";
  error: string | null;
}

type TaskAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_CREATING"; creating: boolean }
  | { type: "SET_COMPLETING"; completing: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_TASKS"; tasks: Task[] }
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; task: Task }
  | { type: "REMOVE_TASK"; taskId: UUID }
  | { type: "SET_SWAPS"; swaps: TaskSwapWithDetails[] }
  | { type: "SET_FILTERS"; filters: TaskFilterParams }
  | { type: "UPDATE_FILTERS"; filters: Partial<TaskFilterParams> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_VIEW_MODE"; viewMode: "list" | "kanban" | "calendar" }
  | { type: "SELECT_TASK"; taskId: UUID }
  | { type: "DESELECT_TASK"; taskId: UUID }
  | { type: "SELECT_ALL_TASKS"; taskIds: UUID[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "RESET_STATE" };

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_CREATING":
      return { ...state, creating: action.creating };

    case "SET_COMPLETING":
      return { ...state, completing: action.completing };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_TASKS":
      return { ...state, tasks: action.tasks };

    case "ADD_TASK":
      // Avoid duplicates
      if (state.tasks.find((task) => task.id === action.task.id)) {
        return state;
      }
      return { ...state, tasks: [action.task, ...state.tasks] };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.task.id ? action.task : task)),
      };

    case "REMOVE_TASK":
      const newSelectedTasks = new Set(state.selectedTasks);
      newSelectedTasks.delete(action.taskId);
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
        selectedTasks: newSelectedTasks,
      };

    case "SET_SWAPS":
      return { ...state, swaps: action.swaps };

    case "SET_FILTERS":
      return { ...state, filters: action.filters };

    case "UPDATE_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.filters } };

    case "CLEAR_FILTERS":
      return { ...state, filters: {} };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.viewMode };

    case "SELECT_TASK":
      return {
        ...state,
        selectedTasks: new Set([...state.selectedTasks, action.taskId]),
      };

    case "DESELECT_TASK":
      const updatedSelection = new Set(state.selectedTasks);
      updatedSelection.delete(action.taskId);
      return { ...state, selectedTasks: updatedSelection };

    case "SELECT_ALL_TASKS":
      return { ...state, selectedTasks: new Set(action.taskIds) };

    case "CLEAR_SELECTION":
      return { ...state, selectedTasks: new Set() };

    case "RESET_STATE":
      return {
        ...state,
        tasks: [],
        swaps: [],
        selectedTasks: new Set(),
        filters: {},
        error: null,
      };

    default:
      return state;
  }
};

export interface TaskComputedValues {
  myTasks: Task[];
  completedTasks: Task[];
  pendingTasks: Task[];
  overdueTasks: Task[];
  tasksByCategory: Record<string, number>;
  myPendingSwaps: TaskSwapWithDetails[];
  myOutgoingSwaps: TaskSwapWithDetails[];
  hasSelection: boolean;
  isAllSelected: boolean;
  selectedCount: number;
  completionRate: number;
  hasOverdue: boolean;
  hasPendingSwaps: boolean;
}

export interface TaskActions {
  loadTasks: (filters?: TaskFilterParams) => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task | null>;
  updateTask: (taskId: UUID, data: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: UUID) => Promise<boolean>;
  assignTask: (taskId: UUID, userIds: UUID[]) => Promise<boolean>;
  completeTask: (taskId: UUID, photo?: File) => Promise<boolean>;
  uncompleteTask: (taskId: UUID) => Promise<boolean>;
  requestSwap: (taskId: UUID, data: CreateTaskSwapRequest) => Promise<boolean>;
  respondToSwap: (swapId: UUID, accept: boolean) => Promise<boolean>;
  loadSwaps: () => Promise<void>;
  setFilters: (filters: Partial<TaskFilterParams>) => void;
  clearFilters: () => void;
  setViewMode: (mode: "list" | "kanban" | "calendar") => void;
  selectTask: (taskId: UUID) => void;
  deselectTask: (taskId: UUID) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  bulkComplete: () => Promise<void>;
  bulkAssign: (userId: UUID) => Promise<void>;
  bulkDelete: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useTasks = (): TaskState & TaskActions & TaskComputedValues => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { subscribeToHousehold } = useRealtime();

  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    swaps: [],
    loading: false,
    creating: false,
    completing: false,
    selectedTasks: new Set<string>(),
    filters: {},
    viewMode: "list",
    error: null,
  });

  // Persistent preferences
  const [savedFilters, setSavedFilters] = useLocalStorage<TaskFilterParams>(
    currentHousehold ? `task-filters-${currentHousehold.id}` : null,
    {}
  );

  const [savedViewMode, setSavedViewMode] = useLocalStorage<"list" | "kanban" | "calendar">(
    currentHousehold ? `task-view-mode-${currentHousehold.id}` : null,
    "list"
  );

  // Load tasks when household changes
  useEffect(() => {
    if (currentHousehold) {
      dispatch({ type: "SET_FILTERS", filters: savedFilters });
      dispatch({ type: "SET_VIEW_MODE", viewMode: savedViewMode });
      refreshData();
    } else {
      dispatch({ type: "RESET_STATE" });
    }
  }, [currentHousehold?.id, savedFilters, savedViewMode]);

  // Subscribe to real-time task updates
  useEffect(() => {
    if (!currentHousehold) return;

    const unsubscribe = subscribeToHousehold(currentHousehold.id, "tasks", "*", (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case "INSERT":
          if (newRecord) {
            dispatch({ type: "ADD_TASK", task: newRecord as Task });

            // Show notification for tasks created by others
            if (newRecord.created_by !== user?.id) {
              toast(`New task: ${newRecord.title}`, { icon: "✅" });
            }
          }
          break;
        case "UPDATE":
          if (newRecord) {
            dispatch({ type: "UPDATE_TASK", task: newRecord as Task });

            // Show notification for task completion by others
            if (newRecord.created_by !== user?.id && newRecord.status === "completed") {
              toast(`Task completed: ${newRecord.title}`, { icon: "🎉" });
            }
          }
          break;
        case "DELETE":
          if (oldRecord) {
            dispatch({ type: "REMOVE_TASK", taskId: oldRecord.id });
          }
          break;
      }
    });

    return unsubscribe;
  }, [currentHousehold?.id, user?.id, subscribeToHousehold]);

  // Save preferences when they change
  useEffect(() => {
    if (currentHousehold) {
      setSavedFilters(state.filters);
    }
  }, [state.filters, setSavedFilters, currentHousehold]);

  useEffect(() => {
    if (currentHousehold) {
      setSavedViewMode(state.viewMode);
    }
  }, [state.viewMode, setSavedViewMode, currentHousehold]);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  const loadTasks = async (filters?: TaskFilterParams) => {
    if (!currentHousehold) return;

    try {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });

      const activeFilters = filters || state.filters;
      const response = await tasksApi.getTasks(currentHousehold.id, activeFilters);

      if (isApiSuccess<TaskListResponse>(response)) {
        dispatch({ type: "SET_TASKS", tasks: response.data.data });
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load tasks";
      console.error("Load tasks error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const createTask = async (data: CreateTaskRequest): Promise<Task | null> => {
    if (!currentHousehold) return null;

    try {
      dispatch({ type: "SET_CREATING", creating: true });
      dispatch({ type: "SET_ERROR", error: null });

      const response = await tasksApi.createTask(currentHousehold.id, data);

      if (isApiSuccess<Task>(response)) {
        // Task will be added via real-time subscription
        toast.success("Task created successfully");
        return response.data;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create task";
      console.error("Create task error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      dispatch({ type: "SET_CREATING", creating: false });
    }
  };

  const updateTask = async (taskId: UUID, data: Partial<Task>): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await tasksApi.updateTask(taskId, data);

      if (isApiSuccess<Task>(response)) {
        // Task will be updated via real-time subscription
        toast.success("Task updated successfully");
        return true;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update task";
      console.error("Update task error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteTask = async (taskId: UUID): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await tasksApi.deleteTask(taskId);

      if (isApiSuccess(response)) {
        // Task will be removed via real-time subscription
        toast.success("Task deleted successfully");
        return true;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete task";
      console.error("Delete task error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const assignTask = async (taskId: UUID, userIds: UUID[]): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await tasksApi.assignTask(taskId, userIds);

      if (isApiSuccess(response)) {
        // Refresh tasks to get updated assignments
        await loadTasks();
        toast.success("Task assigned successfully");
        return true;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign task";
      console.error("Assign task error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const completeTask = async (taskId: UUID, photo?: File): Promise<boolean> => {
    try {
      dispatch({ type: "SET_COMPLETING", completing: true });
      dispatch({ type: "SET_ERROR", error: null });

      const response = photo
        ? await tasksApi.markCompleteWithPhoto(taskId, photo)
        : await tasksApi.markComplete(taskId);

      if (isApiSuccess(response)) {
        // Task will be updated via real-time subscription
        toast.success("Task completed! 🎉", {
          duration: 4000,
          icon: "✅",
        });
        return true;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete task";
      console.error("Complete task error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: "SET_COMPLETING", completing: false });
    }
  };

  const uncompleteTask = async (taskId: UUID): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await tasksApi.markIncomplete(taskId);

      if (isApiSuccess(response)) {
        // Task will be updated via real-time subscription
        toast.success("Task marked as incomplete");
        return true;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark task as incomplete";
      console.error("Uncomplete task error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const requestSwap = async (taskId: UUID, data: CreateTaskSwapRequest): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await tasksApi.requestSwap(taskId, data);

      if (isApiSuccess(response)) {
        await loadSwaps(); // Refresh swaps
        toast.success("Swap request sent");
        return true;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to request swap";
      console.error("Request swap error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const respondToSwap = async (swapId: UUID, accept: boolean): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = accept ? await tasksApi.acceptSwap(swapId) : await tasksApi.declineSwap(swapId);

      if (isApiSuccess(response)) {
        await Promise.all([loadTasks(), loadSwaps()]); // Refresh both
        toast.success(accept ? "Swap accepted" : "Swap declined");
        return true;
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to respond to swap";
      console.error("Respond to swap error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const loadSwaps = async () => {
    if (!currentHousehold) return;

    try {
      const response = await tasksApi.getSwaps(currentHousehold.id);

      if (isApiSuccess<TaskSwapListResponse>(response)) {
        dispatch({ type: "SET_SWAPS", swaps: response.data.data });
      }
    } catch (error) {
      console.error("Load swaps error:", error);
    }
  };

  const setFilters = useCallback((filters: Partial<TaskFilterParams>) => {
    dispatch({ type: "UPDATE_FILTERS", filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const setViewMode = useCallback((mode: "list" | "kanban" | "calendar") => {
    dispatch({ type: "SET_VIEW_MODE", viewMode: mode });
  }, []);

  const selectTask = useCallback((taskId: UUID) => {
    dispatch({ type: "SELECT_TASK", taskId });
  }, []);

  const deselectTask = useCallback((taskId: UUID) => {
    dispatch({ type: "DESELECT_TASK", taskId });
  }, []);

  const selectAllTasks = useCallback(() => {
    const taskIds = state.tasks.map((task) => task.id);
    dispatch({ type: "SELECT_ALL_TASKS", taskIds });
  }, [state.tasks]);

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  const bulkComplete = async () => {
    if (state.selectedTasks.size === 0) return;

    try {
      dispatch({ type: "SET_ERROR", error: null });

      const taskIds = Array.from(state.selectedTasks);
      const response = await tasksApi.bulkComplete(taskIds);

      if (isApiSuccess(response)) {
        await loadTasks();
        clearSelection();
        toast.success(`${response.data.completed_count} tasks completed`);
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete tasks";
      console.error("Bulk complete error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const bulkAssign = async (userId: UUID) => {
    if (state.selectedTasks.size === 0) return;

    try {
      dispatch({ type: "SET_ERROR", error: null });

      const taskIds = Array.from(state.selectedTasks);
      const response = await tasksApi.bulkAssign(taskIds, userId);

      if (isApiSuccess(response)) {
        await loadTasks();
        clearSelection();
        toast.success(`${response.data.assigned_count} tasks assigned`);
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign tasks";
      console.error("Bulk assign error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const bulkDelete = async () => {
    if (state.selectedTasks.size === 0) return;

    try {
      dispatch({ type: "SET_ERROR", error: null });

      const taskIds = Array.from(state.selectedTasks);
      const response = await tasksApi.bulkDelete(taskIds);

      if (isApiSuccess(response)) {
        await loadTasks();
        clearSelection();
        toast.success(`${response.data.deleted_count} tasks deleted`);
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete tasks";
      console.error("Bulk delete error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadTasks(), loadSwaps()]);
  };

  // Computed values
  const myTasks = state.tasks.filter((task) =>
    task.assignments.some((assignment) => assignment.assigned_to === user?.id)
  );

  const completedTasks = state.tasks.filter((task) => task.status === "completed");
  const pendingTasks = state.tasks.filter((task) => task.status === "pending");
  const overdueTasks = state.tasks.filter((task) => task.status === "overdue");

  const tasksByCategory = state.tasks.reduce(
    (acc, task) => {
      const category = task.category || "other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const myPendingSwaps = state.swaps.filter((swap) => swap.to_user.id === user?.id && swap.status === "pending");
  const myOutgoingSwaps = state.swaps.filter((swap) => swap.from_user.id === user?.id);

  const hasSelection = state.selectedTasks.size > 0;
  const isAllSelected = state.selectedTasks.size === state.tasks.length && state.tasks.length > 0;

  return {
    ...state,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    completeTask,
    uncompleteTask,
    requestSwap,
    respondToSwap,
    loadSwaps,
    setFilters,
    clearFilters,
    setViewMode,
    selectTask,
    deselectTask,
    selectAllTasks,
    clearSelection,
    bulkComplete,
    bulkAssign,
    bulkDelete,
    refreshData,
    clearError,
    myTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    tasksByCategory,
    myPendingSwaps,
    myOutgoingSwaps,
    hasSelection,
    isAllSelected,
    selectedCount: state.selectedTasks.size,
    completionRate: state.tasks.length > 0 ? Math.round((completedTasks.length / state.tasks.length) * 100) : 0,
    hasOverdue: overdueTasks.length > 0,
    hasPendingSwaps: myPendingSwaps.length > 0,
  };
};

// Specialized hook for task completion with photo
export const useTaskCompletion = () => {
  const [uploading, setUploading] = useState(false);
  const { completeTask } = useTasks();

  const completeWithPhoto = async (taskId: UUID, photo: File) => {
    setUploading(true);
    try {
      return await completeTask(taskId, photo);
    } finally {
      setUploading(false);
    }
  };

  return {
    completeWithPhoto,
    uploading,
  };
};

export default useTasks;
