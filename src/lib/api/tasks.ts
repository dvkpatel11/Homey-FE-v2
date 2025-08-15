/**
 * Tasks API
 * Handles task management, assignments, swaps, and completion tracking
 */

import {
  ApiResponse,
  CreateTaskRequest,
  CreateTaskSwapRequest,
  Task,
  TaskCompletionResponse,
  TaskFilterParams,
  TaskListResponse,
  TaskSwapRequest,
  TaskSwapWithDetails,
  UUID,
} from "@/types";
import { API_ENDPOINTS } from "@/types/endpoints";
import { apiClient } from "./client";

export const tasksApi = {
  // Task CRUD
  async getTasks(householdId: UUID, filters?: TaskFilterParams): Promise<ApiResponse<TaskListResponse>> {
    return apiClient.get<TaskListResponse>(API_ENDPOINTS.HOUSEHOLDS.TASKS(householdId), { params: filters });
  },

  async getTask(taskId: UUID): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(API_ENDPOINTS.TASKS.GET(taskId));
  },

  async createTask(householdId: UUID, data: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(API_ENDPOINTS.HOUSEHOLDS.TASKS(householdId), data);
  },

  async updateTask(taskId: UUID, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(API_ENDPOINTS.TASKS.UPDATE(taskId), data);
  },

  async deleteTask(taskId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.TASKS.DELETE(taskId));
  },

  // Task Assignments
  async assignTask(taskId: UUID, userIds: UUID[]): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.TASKS.ASSIGN(taskId), { user_ids: userIds });
  },

  async unassignTask(taskId: UUID, userId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`${API_ENDPOINTS.TASKS.ASSIGN(taskId)}/${userId}`);
  },

  // Task Completion
  async markComplete(taskId: UUID): Promise<ApiResponse<TaskCompletionResponse>> {
    return apiClient.put<TaskCompletionResponse>(API_ENDPOINTS.TASKS.COMPLETE(taskId));
  },

  async markIncomplete(taskId: UUID): Promise<ApiResponse<TaskCompletionResponse>> {
    return apiClient.put<TaskCompletionResponse>(API_ENDPOINTS.TASKS.UNCOMPLETE(taskId));
  },

  async markCompleteWithPhoto(taskId: UUID, photo: File): Promise<ApiResponse<TaskCompletionResponse>> {
    const formData = new FormData();
    formData.append("photo", photo);

    return apiClient.post<TaskCompletionResponse>(`${API_ENDPOINTS.TASKS.COMPLETE(taskId)}/with-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Task Swapping
  async requestSwap(taskId: UUID, data: CreateTaskSwapRequest): Promise<ApiResponse<TaskSwapRequest>> {
    return apiClient.post<TaskSwapRequest>(API_ENDPOINTS.TASKS.SWAP_REQUEST(taskId), data);
  },

  async acceptSwap(swapId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.TASK_SWAPS.ACCEPT(swapId));
  },

  async declineSwap(swapId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.TASK_SWAPS.DECLINE(swapId));
  },

  async getSwaps(householdId: UUID): Promise<ApiResponse<TaskSwapWithDetails[]>> {
    return apiClient.get<TaskSwapWithDetails[]>(API_ENDPOINTS.HOUSEHOLDS.TASK_SWAPS(householdId));
  },

  async cancelSwap(swapId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/api/task-swaps/${swapId}`);
  },

  // Bulk Operations
  async bulkAssign(taskIds: UUID[], userId: UUID): Promise<ApiResponse<{ success: boolean; assigned_count: number }>> {
    return apiClient.post<{ success: boolean; assigned_count: number }>("/api/tasks/bulk-assign", {
      task_ids: taskIds,
      user_id: userId,
    });
  },

  async bulkComplete(taskIds: UUID[]): Promise<ApiResponse<{ success: boolean; completed_count: number }>> {
    return apiClient.post<{ success: boolean; completed_count: number }>("/api/tasks/bulk-complete", {
      task_ids: taskIds,
    });
  },

  async bulkDelete(taskIds: UUID[]): Promise<ApiResponse<{ success: boolean; deleted_count: number }>> {
    return apiClient.post<{ success: boolean; deleted_count: number }>("/api/tasks/bulk-delete", { task_ids: taskIds });
  },

  // Task Templates
  async getTemplates(): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        name: string;
        description: string;
        category: string;
        estimated_duration: number;
        difficulty: string;
      }>
    >
  > {
    return apiClient.get("/api/tasks/templates");
  },

  async createFromTemplate(
    householdId: UUID,
    templateId: UUID,
    overrides?: Partial<CreateTaskRequest>
  ): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/api/tasks/templates/${templateId}/create`, {
      household_id: householdId,
      ...overrides,
    });
  },

  // Task Statistics
  async getTaskStats(
    householdId: UUID,
    period?: "week" | "month" | "year"
  ): Promise<
    ApiResponse<{
      total_tasks: number;
      completed_tasks: number;
      completion_rate: number;
      average_completion_time: number;
      top_performers: Array<{ user_id: UUID; user_name: string; completed_count: number }>;
      category_breakdown: Record<string, number>;
    }>
  > {
    return apiClient.get(`${API_ENDPOINTS.HOUSEHOLDS.TASKS(householdId)}/statistics`, { params: { period } });
  },

  // Recurring Tasks
  async createRecurringTask(
    householdId: UUID,
    data: CreateTaskRequest & {
      recurrence_pattern: string;
      recurrence_interval: number;
      end_date?: string;
    }
  ): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`${API_ENDPOINTS.HOUSEHOLDS.TASKS(householdId)}/recurring`, data);
  },

  async pauseRecurringTask(taskId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.TASKS.GET(taskId)}/pause-recurrence`);
  },

  async resumeRecurringTask(taskId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.TASKS.GET(taskId)}/resume-recurrence`);
  },

  // Task Comments/Notes
  async addComment(
    taskId: UUID,
    comment: string
  ): Promise<ApiResponse<{ id: UUID; comment: string; created_at: string }>> {
    return apiClient.post(`${API_ENDPOINTS.TASKS.GET(taskId)}/comments`, { comment });
  },

  async getComments(taskId: UUID): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        comment: string;
        user_name: string;
        created_at: string;
      }>
    >
  > {
    return apiClient.get(`${API_ENDPOINTS.TASKS.GET(taskId)}/comments`);
  },
};

export default tasksApi;
