/**
 * Notifications API
 * Handles push notifications, device registration, and notification management
 */

import {
  ApiResponse,
  DeviceToken,
  Notification,
  NotificationListResponse,
  NotificationQueryParams,
  NotificationReadResponse,
  ReadAllNotificationsResponse,
  UUID,
} from "@/types";
import { API_ENDPOINTS } from "@/types/endpoints";
import { apiClient } from "./client";

export const notificationApi = {
  // Notification Management
  async getNotifications(params?: NotificationQueryParams): Promise<ApiResponse<NotificationListResponse>> {
    return apiClient.get<NotificationListResponse>(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
  },

  async getNotification(notificationId: UUID): Promise<ApiResponse<Notification>> {
    return apiClient.get<Notification>(`/api/notifications/${notificationId}`);
  },

  async markAsRead(notificationId: UUID): Promise<ApiResponse<NotificationReadResponse>> {
    return apiClient.put<NotificationReadResponse>(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId));
  },

  async markAllAsRead(): Promise<ApiResponse<ReadAllNotificationsResponse>> {
    return apiClient.put<ReadAllNotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
  },

  async deleteNotification(notificationId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
  },

  async deleteAllRead(): Promise<ApiResponse<{ deleted_count: number }>> {
    return apiClient.delete<{ deleted_count: number }>("/api/notifications/read");
  },

  async deleteAll(): Promise<ApiResponse<{ deleted_count: number }>> {
    return apiClient.delete<{ deleted_count: number }>("/api/notifications");
  },

  // Push Notification Device Management
  async registerDevice(deviceToken: DeviceToken): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.NOTIFICATIONS.DEVICE, deviceToken);
  },

  async unregisterDevice(token: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.NOTIFICATIONS.REMOVE_DEVICE(token));
  },

  async getRegisteredDevices(): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        platform: string;
        created_at: string;
        last_used: string;
        active: boolean;
      }>
    >
  > {
    return apiClient.get("/api/notifications/devices");
  },

  async updateDeviceStatus(deviceId: UUID, active: boolean): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.patch<{ success: boolean }>(`/api/notifications/devices/${deviceId}`, { active });
  },

  // Notification Preferences
  async getPreferences(): Promise<
    ApiResponse<{
      email_notifications: boolean;
      push_notifications: boolean;
      task_reminders: boolean;
      bill_reminders: boolean;
      chat_messages: boolean;
      household_updates: boolean;
      quiet_hours: {
        enabled: boolean;
        start_time: string;
        end_time: string;
      };
    }>
  > {
    return apiClient.get("/api/notifications/preferences");
  },

  async updatePreferences(preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    task_reminders?: boolean;
    bill_reminders?: boolean;
    chat_messages?: boolean;
    household_updates?: boolean;
    quiet_hours?: {
      enabled?: boolean;
      start_time?: string;
      end_time?: string;
    };
  }): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put<{ success: boolean }>("/api/notifications/preferences", preferences);
  },

  // Manual Notifications (Admin/System)
  async sendNotification(
    userIds: UUID[],
    notification: {
      title: string;
      message: string;
      type: string;
      related_id?: UUID;
      related_table?: string;
    }
  ): Promise<ApiResponse<{ success: boolean; sent_count: number }>> {
    return apiClient.post<{ success: boolean; sent_count: number }>("/api/notifications/send", {
      user_ids: userIds,
      ...notification,
    });
  },

  async sendHouseholdNotification(
    householdId: UUID,
    notification: {
      title: string;
      message: string;
      type: string;
      related_id?: UUID;
      related_table?: string;
    }
  ): Promise<ApiResponse<{ success: boolean; sent_count: number }>> {
    return apiClient.post<{ success: boolean; sent_count: number }>(
      `/api/households/${householdId}/notifications/send`,
      notification
    );
  },

  // Notification Templates
  async getTemplates(): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        name: string;
        title_template: string;
        message_template: string;
        type: string;
        variables: string[];
      }>
    >
  > {
    return apiClient.get("/api/notifications/templates");
  },

  async sendTemplateNotification(
    templateId: UUID,
    userIds: UUID[],
    variables: Record<string, string>
  ): Promise<ApiResponse<{ success: boolean; sent_count: number }>> {
    return apiClient.post<{ success: boolean; sent_count: number }>(`/api/notifications/templates/${templateId}/send`, {
      user_ids: userIds,
      variables,
    });
  },

  // Bulk Operations
  async bulkMarkAsRead(notificationIds: UUID[]): Promise<ApiResponse<{ success: boolean; marked_count: number }>> {
    return apiClient.post<{ success: boolean; marked_count: number }>("/api/notifications/bulk-read", {
      notification_ids: notificationIds,
    });
  },

  async bulkDelete(notificationIds: UUID[]): Promise<ApiResponse<{ success: boolean; deleted_count: number }>> {
    return apiClient.post<{ success: boolean; deleted_count: number }>("/api/notifications/bulk-delete", {
      notification_ids: notificationIds,
    });
  },

  // Notification Statistics
  async getStatistics(): Promise<
    ApiResponse<{
      total_notifications: number;
      unread_count: number;
      notifications_by_type: Record<string, number>;
      notifications_by_day: Array<{ date: string; count: number }>;
      average_response_time: number;
    }>
  > {
    return apiClient.get("/api/notifications/statistics");
  },

  // Test Notifications
  async sendTestNotification(platform: "web" | "email" | "push"): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>("/api/notifications/test", { platform });
  },

  // Notification Delivery Status
  async getDeliveryStatus(notificationId: UUID): Promise<
    ApiResponse<{
      sent_at: string;
      delivered_at?: string;
      read_at?: string;
      failed_at?: string;
      error_message?: string;
    }>
  > {
    return apiClient.get(`/api/notifications/${notificationId}/delivery-status`);
  },
};

export default notificationApi;
