/**
 * Households API
 * Handles household management, members, settings, and dashboard data
 */

import {
  ApiResponse,
  CreateHouseholdRequest,
  DashboardData,
  Household,
  HouseholdMember,
  HouseholdSettings,
  InviteCodeResponse,
  LeaveHouseholdRequest,
  RemoveMemberRequest,
  UUID,
} from "@/types";
import { API_ENDPOINTS } from "@/types/endpoints";
import { apiClient } from "./client";

export const householdApi = {
  // Household CRUD
  async getHouseholds(): Promise<ApiResponse<Household[]>> {
    return apiClient.get<Household[]>(API_ENDPOINTS.HOUSEHOLDS.LIST);
  },

  async getHousehold(id: UUID): Promise<ApiResponse<Household>> {
    return apiClient.get<Household>(API_ENDPOINTS.HOUSEHOLDS.GET(id));
  },

  async createHousehold(data: CreateHouseholdRequest): Promise<ApiResponse<Household>> {
    return apiClient.post<Household>(API_ENDPOINTS.HOUSEHOLDS.CREATE, data);
  },

  async updateHousehold(id: UUID, data: Partial<Household>): Promise<ApiResponse<Household>> {
    return apiClient.put<Household>(API_ENDPOINTS.HOUSEHOLDS.UPDATE(id), data);
  },

  async deleteHousehold(id: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.HOUSEHOLDS.DELETE(id));
  },

  // Member Management
  async getMembers(householdId: UUID): Promise<ApiResponse<HouseholdMember[]>> {
    return apiClient.get<HouseholdMember[]>(API_ENDPOINTS.HOUSEHOLDS.MEMBERS(householdId));
  },

  async removeMember(householdId: UUID, data: RemoveMemberRequest): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.HOUSEHOLDS.REMOVE_MEMBER(householdId, data.user_id), {
      data,
    });
  },

  async leaveHousehold(householdId: UUID, data: LeaveHouseholdRequest): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.HOUSEHOLDS.LEAVE(householdId), data);
  },

  // Invite Management
  async generateInviteCode(householdId: UUID): Promise<ApiResponse<InviteCodeResponse>> {
    return apiClient.post<InviteCodeResponse>(API_ENDPOINTS.HOUSEHOLDS.INVITE_CODE(householdId));
  },

  async joinHousehold(data: { invite_code: string }): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>("/api/households/join", data);
  },

  // Settings Management
  async getSettings(householdId: UUID): Promise<ApiResponse<HouseholdSettings>> {
    return apiClient.get<HouseholdSettings>(API_ENDPOINTS.HOUSEHOLDS.SETTINGS(householdId));
  },

  async updateSettings(
    householdId: UUID,
    settings: Partial<HouseholdSettings>
  ): Promise<ApiResponse<HouseholdSettings>> {
    return apiClient.put<HouseholdSettings>(API_ENDPOINTS.HOUSEHOLDS.SETTINGS(householdId), settings);
  },

  // Dashboard Data
  async getDashboardData(householdId: UUID): Promise<ApiResponse<DashboardData>> {
    return apiClient.get<DashboardData>(API_ENDPOINTS.HOUSEHOLDS.DASHBOARD(householdId));
  },

  // Bulk Operations
  async updateMemberRoles(
    householdId: UUID,
    updates: Array<{ user_id: UUID; role: string }>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.patch<{ success: boolean }>(`${API_ENDPOINTS.HOUSEHOLDS.MEMBERS(householdId)}/roles`, { updates });
  },

  async transferOwnership(householdId: UUID, newOwnerId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.HOUSEHOLDS.GET(householdId)}/transfer-ownership`, {
      new_owner_id: newOwnerId,
    });
  },

  // Household Statistics
  async getStatistics(householdId: UUID): Promise<
    ApiResponse<{
      member_count: number;
      task_completion_rate: number;
      bill_payment_rate: number;
      active_days: number;
      created_at: string;
    }>
  > {
    return apiClient.get(`${API_ENDPOINTS.HOUSEHOLDS.GET(householdId)}/statistics`);
  },

  // Export Data
  async exportData(
    householdId: UUID,
    format: "json" | "csv" = "json"
  ): Promise<
    ApiResponse<{
      download_url: string;
      expires_at: string;
    }>
  > {
    return apiClient.post(`${API_ENDPOINTS.HOUSEHOLDS.GET(householdId)}/export`, { format });
  },

  // Search Households (for admin or future features)
  async searchHouseholds(query: string, limit: number = 20): Promise<ApiResponse<Household[]>> {
    return apiClient.get<Household[]>("/api/households/search", {
      params: { q: query, limit },
    });
  },
};

export default householdApi;
