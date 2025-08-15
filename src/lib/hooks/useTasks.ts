/**
 * useTasks - Task management with assignments, swaps, and real-time updates
 * Handles task operations, completion tracking, and collaborative features
 */

import { supabase, useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { tasksApi } from "@/lib/api";
import {
  CreateTaskRequest,
  CreateTaskSwapRequest,
  Task,
  TaskFilterParams,
  TaskListResponse,
  TaskSwapWithDetails,
  UUID,
  isApiError,
  isApiSuccess,
} from "@/types";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "./useLocalStorage";
import { useMobile } from "./useMobile";

export interface TaskState {
  tasks: Task[];
  swaps: TaskSwapWithDetails[];
  loading: boolean;
  creating: boolean;
  completing: boolean;
  selectedTasks: Set<UUID>;
  filters: TaskFilterParams;
  viewMode: "list" | "kanban" | "calendar";
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
}

export const useTasks = () => {
  const { currentHousehold } = useHousehold();
  const { user } = useAuth();
  const { lightImpact, success } = useMobile().hapticFeedback || {
    lightImpact: () => {},
    success: () => {},
  };

  const [state, setState] = useState<TaskState>({
    tasks: [],
    swaps: [],
    loading: false,
    creating: false,
    completing: false,
    selectedTasks: new Set(),
    filters: {},
    viewMode: "list",
  });

  // Persistent preferences
  const [savedFilters, setSavedFilters] = useLocalStorage<TaskFilterParams>(
    `task-filters-${currentHousehold?.id || "none"}`,
    {}
  );

  const [savedViewMode, setSavedViewMode] = useLocalStorage<"list" | "kanban" | "calendar">(
    `task-view-mode-${currentHousehold?.id || "none"}`,
    "list"
  );

  // Load tasks when household changes
  useEffect(() => {
    if (currentHousehold) {
      setState((prev) => ({
        ...prev,
        filters: savedFilters,
        viewMode: savedViewMode,
      }));
      refreshData();

      // Set up real-time subscription
      const unsubscribe = subscribeToTaskUpdates();
      return unsubscribe;
    } else {
      setState((prev) => ({
        ...prev,
        tasks: [],
        swaps: [],
        selectedTasks: new Set(),
        filters: {},
      }));
    }
  }, [currentHousehold, savedFilters, savedViewMode]);

  // Save preferences when they change
  useEffect(() => {
    setSavedFilters(state.filters);
  }, [state.filters, setSavedFilters]);

  useEffect(() => {
    setSavedViewMode(state.viewMode);
  }, [state.viewMode, setSavedViewMode]);

  const loadTasks = async (filters?: TaskFilterParams) => {
    if (!currentHousehold) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const activeFilters = filters || state.filters;
      const response = await tasksApi.getTasks(currentHousehold.id, activeFilters);

      if (isApiSuccess<TaskListResponse>(response)) {
        setState((prev) => ({ ...prev, tasks: response.data.data }));
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error("Load tasks error:", error);
      toast.error("Failed to load tasks");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const createTask = async (data: CreateTaskRequest): Promise<Task | null> => {
    if (!currentHousehold) return null;

    try {
      setState((prev) => ({ ...prev, creating: true }));

      const response = await tasksApi.createTask(currentHousehold.id, data);

      if (isApiSuccess<Task>(response)) {
        setState((prev) => ({
          ...prev,
          tasks: [response.data, ...prev.tasks],
        }));

        lightImpact?.();
        toast.success("Task created successfully");
        return response.data;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return null;
    } catch (error) {
      console.error("Create task error:", error);
      toast.error("Failed to create task");
      return null;
    } finally {
      setState((prev) => ({ ...prev, creating: false }));
    }
  };

  const updateTask = async (taskId: UUID, data: Partial<Task>): Promise<boolean> => {
    try {
      const response = await tasksApi.updateTask(taskId, data);

      if (isApiSuccess<Task>(response)) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((task) => (task.id === taskId ? response.data : task)),
        }));

        lightImpact?.();
        toast.success("Task updated successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Update task error:", error);
      toast.error("Failed to update task");
      return false;
    }
  };

  const deleteTask = async (taskId: UUID): Promise<boolean> => {
    try {
      const response = await tasksApi.deleteTask(taskId);

      if (isApiSuccess(response)) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((task) => task.id !== taskId),
          selectedTasks: new Set([...prev.selectedTasks].filter((id) => id !== taskId)),
        }));

        lightImpact?.();
        toast.success("Task deleted successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Delete task error:", error);
      toast.error("Failed to delete task");
      return false;
    }
  };

  const assignTask = async (taskId: UUID, userIds: UUID[]): Promise<boolean> => {
    try {
      const response = await tasksApi.assignTask(taskId, userIds);

      if (isApiSuccess(response)) {
        // Refresh tasks to get updated assignments
        await loadTasks();

        lightImpact?.();
        toast.success("Task assigned successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Assign task error:", error);
      toast.error("Failed to assign task");
      return false;
    }
  };

  const completeTask = async (taskId: UUID, photo?: File): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, completing: true }));

      const response = photo
        ? await tasksApi.markCompleteWithPhoto(taskId, photo)
        : await tasksApi.markComplete(taskId);

      if (isApiSuccess(response)) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, status: "completed" as const } : task)),
        }));

        success?.();
        toast.success("Task completed! 🎉", {
          duration: 4000,
          icon: "✅",
        });
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Complete task error:", error);
      toast.error("Failed to complete task");
      return false;
    } finally {
      setState((prev) => ({ ...prev, completing: false }));
    }
  };

  const uncompleteTask = async (taskId: UUID): Promise<boolean> => {
    try {
      const response = await tasksApi.markIncomplete(taskId);

      if (isApiSuccess(response)) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, status: "pending" as const } : task)),
        }));

        lightImpact?.();
        toast.success("Task marked as incomplete");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Uncomplete task error:", error);
      toast.error("Failed to mark task as incomplete");
      return false;
    }
  };

  const requestSwap = async (taskId: UUID, data: CreateTaskSwapRequest): Promise<boolean> => {
    try {
      const response = await tasksApi.requestSwap(taskId, data);

      if (isApiSuccess(response)) {
        await loadSwaps(); // Refresh swaps

        lightImpact?.();
        toast.success("Swap request sent");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Request swap error:", error);
      toast.error("Failed to request swap");
      return false;
    }
  };

  const respondToSwap = async (swapId: UUID, accept: boolean): Promise<boolean> => {
    try {
      const response = accept ? await tasksApi.acceptSwap(swapId) : await tasksApi.declineSwap(swapId);

      if (isApiSuccess(response)) {
        await Promise.all([loadTasks(), loadSwaps()]); // Refresh both

        lightImpact?.();
        toast.success(accept ? "Swap accepted" : "Swap declined");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Respond to swap error:", error);
      toast.error("Failed to respond to swap");
      return false;
    }
  };

  const loadSwaps = async () => {
    if (!currentHousehold) return;

    try {
      const response = await tasksApi.getSwaps(currentHousehold.id);

      if (isApiSuccess<TaskSwapWithDetails[]>(response)) {
        setState((prev) => ({ ...prev, swaps: response.data }));
      }
    } catch (error) {
      console.error("Load swaps error:", error);
    }
  };

  const setFilters = useCallback((filters: Partial<TaskFilterParams>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({ ...prev, filters: {} }));
  }, []);

  const setViewMode = useCallback((mode: "list" | "kanban" | "calendar") => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const selectTask = useCallback((taskId: UUID) => {
    setState((prev) => ({
      ...prev,
      selectedTasks: new Set([...prev.selectedTasks, taskId]),
    }));
  }, []);

  const deselectTask = useCallback((taskId: UUID) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedTasks);
      newSelected.delete(taskId);
      return { ...prev, selectedTasks: newSelected };
    });
  }, []);

  const selectAllTasks = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedTasks: new Set(prev.tasks.map((task) => task.id)),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedTasks: new Set() }));
  }, []);

  const bulkComplete = async () => {
    if (state.selectedTasks.size === 0) return;

    try {
      const taskIds = Array.from(state.selectedTasks);
      const response = await tasksApi.bulkComplete(taskIds);

      if (isApiSuccess(response)) {
        await loadTasks();
        clearSelection();
        success?.();
        toast.success(`${response.data.assigned_count} tasks assigned`);
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error("Bulk assign error:", error);
      toast.error("Failed to assign tasks");
    }
  };

  const bulkDelete = async () => {
    if (state.selectedTasks.size === 0) return;

    try {
      const taskIds = Array.from(state.selectedTasks);
      const response = await tasksApi.bulkDelete(taskIds);

      if (isApiSuccess(response)) {
        await loadTasks();
        clearSelection();
        lightImpact?.();
        toast.success(`${response.data.deleted_count} tasks deleted`);
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete tasks");
    }
  };

  const refreshData = async () => {
    await Promise.all([loadTasks(), loadSwaps()]);
  };

  const subscribeToTaskUpdates = (): (() => void) => {
    if (!currentHousehold) return () => {};

    const channel = supabase
      .channel(`tasks:${currentHousehold.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `household_id=eq.${currentHousehold.id}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setState((prev) => {
            let newTasks = [...prev.tasks];

            switch (eventType) {
              case "INSERT":
                // Avoid duplicates (in case user created it)
                if (!newTasks.find((task) => task.id === newRecord.id)) {
                  newTasks = [newRecord as Task, ...newTasks];
                }
                break;
              case "UPDATE":
                newTasks = newTasks.map((task) => (task.id === newRecord.id ? (newRecord as Task) : task));
                break;
              case "DELETE":
                newTasks = newTasks.filter((task) => task.id !== oldRecord.id);
                break;
            }

            return { ...prev, tasks: newTasks };
          });

          // Show notifications for task updates from other users
          if (newRecord && newRecord.created_by !== user?.id) {
            if (payload.eventType === "INSERT") {
              toast(`New task: ${newRecord.title}`, { icon: "✅" });
            } else if (payload.eventType === "UPDATE" && newRecord.status === "completed") {
              toast(`Task completed: ${newRecord.title}`, { icon: "🎉" });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_swaps",
        },
        () => {
          // Refresh swaps when swap requests change
          loadSwaps();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_assignments",
          filter: `assigned_to=eq.${user?.id}`,
        },
        () => {
          // Refresh tasks when user assignments change
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const actions: TaskActions = {
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
    ...actions,
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
