/**
 * Authentication API
 * Handles user authentication, profile management, and session handling
 */

import {
  ApiResponse,
  AuthRequest,
  AuthResponse,
  InviteValidationRequest,
  InviteValidationResponse,
  JoinHouseholdRequest,
  JoinHouseholdResponse,
  RefreshTokenRequest,
  UpdateProfileRequest,
  UserProfile,
} from "@/types";
import { API_ENDPOINTS } from "@/types/endpoints";
import { apiClient } from "./client";

export const authApi = {
  // Authentication
  async login(credentials: AuthRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
      skipAuth: true,
    });
  },

  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, data, {
      skipAuth: true,
    });
  },

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Profile Management
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(API_ENDPOINTS.PROFILE.GET);
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>(API_ENDPOINTS.PROFILE.UPDATE, data);
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append("avatar", file);

    return apiClient.post<{ avatar_url: string }>(API_ENDPOINTS.PROFILE.AVATAR, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Invitation System
  async validateInvite(data: InviteValidationRequest): Promise<ApiResponse<InviteValidationResponse>> {
    return apiClient.post<InviteValidationResponse>(API_ENDPOINTS.INVITE.VALIDATE, data, { skipAuth: true });
  },

  async joinHousehold(data: JoinHouseholdRequest): Promise<ApiResponse<JoinHouseholdResponse>> {
    return apiClient.post<JoinHouseholdResponse>(API_ENDPOINTS.INVITE.JOIN, data);
  },

  // Password Reset (handled by Supabase, but keeping for completeness)
  async requestPasswordReset(email: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(
      "/api/auth/reset-password",
      { email },
      {
        skipAuth: true,
      }
    );
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(
      "/api/auth/reset-password/confirm",
      {
        token,
        password: newPassword,
      },
      {
        skipAuth: true,
      }
    );
  },

  // Account Management
  async deleteAccount(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>("/api/auth/account");
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>("/api/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Session Management
  async verifySession(): Promise<ApiResponse<{ valid: boolean; user?: UserProfile }>> {
    return apiClient.get<{ valid: boolean; user?: UserProfile }>("/api/auth/verify");
  },

  async refreshSession(): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>("/api/auth/refresh-session");
  },
};

export default authApi;
