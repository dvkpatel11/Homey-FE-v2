/**
 * Chat/Messaging API
 * Handles real-time messaging, polls, and chat functionality
 */

import {
  ApiResponse,
  CreateMessageRequest,
  CreatePollVoteRequest,
  Message,
  MessageListResponse,
  MessageQueryParams,
  Poll,
  PollVoteResponse,
  UUID,
} from "@/types";
import { API_ENDPOINTS } from "@/types/endpoints";
import { apiClient } from "./client";

export const chatApi = {
  // Message Management
  async getMessages(householdId: UUID, params?: MessageQueryParams): Promise<ApiResponse<MessageListResponse>> {
    return apiClient.get<MessageListResponse>(API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId), { params });
  },

  async getMessage(messageId: UUID): Promise<ApiResponse<Message>> {
    return apiClient.get<Message>(API_ENDPOINTS.MESSAGES.GET(messageId));
  },

  async sendMessage(householdId: UUID, data: CreateMessageRequest): Promise<ApiResponse<Message>> {
    return apiClient.post<Message>(API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId), data);
  },

  async editMessage(messageId: UUID, data: { content: string }): Promise<ApiResponse<Message>> {
    return apiClient.put<Message>(API_ENDPOINTS.MESSAGES.UPDATE(messageId), data);
  },

  async deleteMessage(messageId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.MESSAGES.DELETE(messageId));
  },

  // Quick Actions
  async sendQuickMessage(householdId: UUID, content: string): Promise<ApiResponse<Message>> {
    return this.sendMessage(householdId, {
      content,
      message_type: "text",
    });
  },

  async sendSystemMessage(householdId: UUID, content: string): Promise<ApiResponse<Message>> {
    return apiClient.post<Message>(`${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/system`, { content });
  },

  // Message Reactions
  async addReaction(messageId: UUID, emoji: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.MESSAGES.GET(messageId)}/reactions`, { emoji });
  },

  async removeReaction(messageId: UUID, emoji: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`${API_ENDPOINTS.MESSAGES.GET(messageId)}/reactions/${emoji}`);
  },

  async getReactions(messageId: UUID): Promise<
    ApiResponse<
      Array<{
        emoji: string;
        count: number;
        users: Array<{ id: UUID; name: string }>;
      }>
    >
  > {
    return apiClient.get(`${API_ENDPOINTS.MESSAGES.GET(messageId)}/reactions`);
  },

  // Poll Management
  async createPoll(
    householdId: UUID,
    question: string,
    options: string[],
    settings?: {
      multiple_choice?: boolean;
      expires_at?: string;
      anonymous?: boolean;
    }
  ): Promise<ApiResponse<Message>> {
    return this.sendMessage(householdId, {
      content: question,
      message_type: "poll",
      poll: {
        question,
        options,
        multiple_choice: settings?.multiple_choice || false,
        expires_at: settings?.expires_at,
      },
    });
  },

  async voteOnPoll(pollId: UUID, data: CreatePollVoteRequest): Promise<ApiResponse<PollVoteResponse>> {
    return apiClient.post<PollVoteResponse>(API_ENDPOINTS.POLLS.VOTE(pollId), data);
  },

  async getPollResults(pollId: UUID): Promise<ApiResponse<Poll>> {
    return apiClient.get<Poll>(API_ENDPOINTS.POLLS.RESULTS(pollId));
  },

  async closePoll(pollId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.POLLS.RESULTS(pollId)}/close`);
  },

  // File Sharing
  async uploadFile(householdId: UUID, file: File, caption?: string): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);

    return apiClient.post<Message>(`${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async uploadImage(householdId: UUID, image: File, caption?: string): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append("image", image);
    if (caption) formData.append("caption", caption);

    return apiClient.post<Message>(`${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Message Search
  async searchMessages(
    householdId: UUID,
    query: string,
    options?: {
      type?: "text" | "poll" | "system";
      user_id?: UUID;
      before?: string;
      after?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<MessageListResponse>> {
    return apiClient.get<MessageListResponse>(`${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/search`, {
      params: {
        q: query,
        ...options,
      },
    });
  },

  // Message Threading
  async replyToMessage(householdId: UUID, messageId: UUID, content: string): Promise<ApiResponse<Message>> {
    return this.sendMessage(householdId, {
      content,
      message_type: "text",
      replied_to: messageId,
    });
  },

  async getMessageThread(messageId: UUID): Promise<ApiResponse<Message[]>> {
    return apiClient.get<Message[]>(`${API_ENDPOINTS.MESSAGES.GET(messageId)}/thread`);
  },

  // Chat Statistics
  async getChatStats(
    householdId: UUID,
    period?: "day" | "week" | "month"
  ): Promise<
    ApiResponse<{
      total_messages: number;
      active_users: number;
      messages_by_user: Record<UUID, number>;
      messages_by_day: Array<{ date: string; count: number }>;
      popular_reactions: Array<{ emoji: string; count: number }>;
    }>
  > {
    return apiClient.get(`${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/statistics`, { params: { period } });
  },

  // Message Export
  async exportChatHistory(
    householdId: UUID,
    options: {
      start_date?: string;
      end_date?: string;
      format?: "json" | "txt" | "pdf";
      include_media?: boolean;
    }
  ): Promise<
    ApiResponse<{
      export_url: string;
      expires_at: string;
    }>
  > {
    return apiClient.post(`${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/export`, options);
  },

  // Typing Indicators (for real-time)
  async sendTypingIndicator(householdId: UUID, isTyping: boolean = true): Promise<void> {
    // This would typically be handled via WebSocket
    // but included for completeness
    await apiClient.post(
      `${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/typing`,
      { is_typing: isTyping },
      { skipErrorToast: true }
    );
  },

  // Message Moderation
  async flagMessage(messageId: UUID, reason: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.MESSAGES.GET(messageId)}/flag`, { reason });
  },

  async pinMessage(messageId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.MESSAGES.GET(messageId)}/pin`);
  },

  async unpinMessage(messageId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`${API_ENDPOINTS.MESSAGES.GET(messageId)}/pin`);
  },

  async getPinnedMessages(householdId: UUID): Promise<ApiResponse<Message[]>> {
    return apiClient.get<Message[]>(`${API_ENDPOINTS.HOUSEHOLDS.MESSAGES(householdId)}/pinned`);
  },
};

export default chatApi;
