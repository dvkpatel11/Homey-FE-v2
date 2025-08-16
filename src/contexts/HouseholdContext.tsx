import { STORAGE_KEYS } from "@/lib/hooks/useLocalStorage";
import {
  CreateHouseholdRequest,
  DashboardData,
  Household,
  HouseholdMember,
  HouseholdSettings,
  InviteCodeResponse,
  isApiError,
  isApiSuccess,
  JoinHouseholdRequest,
  LeaveHouseholdRequest,
  RemoveMemberRequest,
  UserRole,
  UUID,
} from "@/types/api";
import { API_ENDPOINTS } from "@/types/endpoints";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import { useAuth, useAuthenticatedRequest } from "./AuthContext";
import { useHouseholdRealtime, useRealtime } from "./RealtimeContext";

interface HouseholdState {
  households: Household[];
  currentHousehold: Household | null;
  members: HouseholdMember[];
  settings: HouseholdSettings | null;
  dashboardData: DashboardData | null;
  loading: boolean;
  membersLoading: boolean;
  dashboardLoading: boolean;
  lastRefresh: number | null;
  error: string | null;
}

type HouseholdAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_MEMBERS_LOADING"; loading: boolean }
  | { type: "SET_DASHBOARD_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_HOUSEHOLDS"; households: Household[] }
  | { type: "SET_CURRENT_HOUSEHOLD"; household: Household | null }
  | { type: "SET_MEMBERS"; members: HouseholdMember[] }
  | { type: "SET_SETTINGS"; settings: HouseholdSettings }
  | { type: "SET_DASHBOARD_DATA"; data: DashboardData }
  | { type: "ADD_HOUSEHOLD"; household: Household }
  | { type: "UPDATE_HOUSEHOLD"; household: Household }
  | { type: "REMOVE_HOUSEHOLD"; householdId: UUID }
  | { type: "ADD_MEMBER"; member: HouseholdMember }
  | { type: "REMOVE_MEMBER"; memberId: UUID }
  | { type: "UPDATE_MEMBER"; member: HouseholdMember }
  | { type: "SET_LAST_REFRESH"; timestamp: number }
  | { type: "CLEAR_HOUSEHOLD_DATA" };

const householdReducer = (state: HouseholdState, action: HouseholdAction): HouseholdState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_MEMBERS_LOADING":
      return { ...state, membersLoading: action.loading };

    case "SET_DASHBOARD_LOADING":
      return { ...state, dashboardLoading: action.loading };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_HOUSEHOLDS":
      return { ...state, households: action.households, error: null };

    case "SET_CURRENT_HOUSEHOLD":
      return { ...state, currentHousehold: action.household, error: null };

    case "SET_MEMBERS":
      return { ...state, members: action.members, error: null };

    case "SET_SETTINGS":
      return { ...state, settings: action.settings, error: null };

    case "SET_DASHBOARD_DATA":
      return { ...state, dashboardData: action.data, error: null };

    case "ADD_HOUSEHOLD":
      return {
        ...state,
        households: [...state.households, action.household],
        error: null,
      };

    case "UPDATE_HOUSEHOLD":
      return {
        ...state,
        households: state.households.map((h) => (h.id === action.household.id ? action.household : h)),
        currentHousehold:
          state.currentHousehold?.id === action.household.id ? action.household : state.currentHousehold,
        error: null,
      };

    case "REMOVE_HOUSEHOLD":
      return {
        ...state,
        households: state.households.filter((h) => h.id !== action.householdId),
        currentHousehold: state.currentHousehold?.id === action.householdId ? null : state.currentHousehold,
        error: null,
      };

    case "ADD_MEMBER":
      return {
        ...state,
        members: [...state.members, action.member],
        error: null,
      };

    case "UPDATE_MEMBER":
      return {
        ...state,
        members: state.members.map((m) => (m.id === action.member.id ? action.member : m)),
        error: null,
      };

    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.memberId),
        error: null,
      };

    case "SET_LAST_REFRESH":
      return { ...state, lastRefresh: action.timestamp };

    case "CLEAR_HOUSEHOLD_DATA":
      return {
        ...state,
        currentHousehold: null,
        members: [],
        settings: null,
        dashboardData: null,
        error: null,
      };

    default:
      return state;
  }
};

interface HouseholdContextType extends HouseholdState {
  // Household management
  loadHouseholds: () => Promise<void>;
  createHousehold: (data: CreateHouseholdRequest) => Promise<Household | null>;
  selectHousehold: (householdId: UUID) => Promise<void>;
  updateHousehold: (householdId: UUID, data: Partial<Household>) => Promise<boolean>;
  deleteHousehold: (householdId: UUID) => Promise<boolean>;
  leaveHousehold: (data: LeaveHouseholdRequest) => Promise<boolean>;

  // Invite management
  generateInviteCode: (householdId: UUID) => Promise<InviteCodeResponse | null>;
  joinHousehold: (data: JoinHouseholdRequest) => Promise<boolean>;
  validateInviteCode: (inviteCode: string) => Promise<boolean>;

  // Member management
  loadMembers: (householdId?: UUID) => Promise<void>;
  removeMember: (householdId: UUID, data: RemoveMemberRequest) => Promise<boolean>;
  refreshMembers: () => Promise<void>;

  // Settings
  loadSettings: (householdId?: UUID) => Promise<void>;
  updateSettings: (householdId: UUID, settings: Partial<HouseholdSettings>) => Promise<boolean>;

  // Dashboard
  loadDashboardData: (householdId?: UUID) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Utilities
  clearError: () => void;
  isStale: () => boolean;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

// API client class for household operations
class HouseholdApiClient {
  constructor(private authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseURL =
      process.env.NODE_ENV === "development" ? "http://localhost:8000" : process.env.REACT_APP_API_URL || "";

    const response = await this.authenticatedFetch(`${baseURL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: "Network error", code: "NETWORK_ERROR" },
      }));
      throw new Error(errorData.error?.message || "Request failed");
    }

    return response.json();
  }

  async getHouseholds() {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.LIST);
  }

  async createHousehold(data: CreateHouseholdRequest) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHousehold(id: string) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.GET(id));
  }

  async updateHousehold(id: string, data: Partial<Household>) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteHousehold(id: string) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.DELETE(id), {
      method: "DELETE",
    });
  }

  async getMembers(id: string) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.MEMBERS(id));
  }

  async removeMember(householdId: string, data: RemoveMemberRequest) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.REMOVE_MEMBER(householdId, data.user_id), {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }

  async leaveHousehold(id: string, data: LeaveHouseholdRequest) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.LEAVE(id), {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async generateInviteCode(id: string) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.INVITE_CODE(id), {
      method: "POST",
    });
  }

  async joinHousehold(data: JoinHouseholdRequest) {
    return this.request(API_ENDPOINTS.INVITE.JOIN, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async validateInviteCode(inviteCode: string) {
    return this.request(API_ENDPOINTS.INVITE.VALIDATE, {
      method: "POST",
      body: JSON.stringify({ invite_code: inviteCode }),
    });
  }

  async getSettings(id: string) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.SETTINGS(id));
  }

  async updateSettings(id: string, settings: Partial<HouseholdSettings>) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.SETTINGS(id), {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  async getDashboardData(id: string) {
    return this.request(API_ENDPOINTS.HOUSEHOLDS.DASHBOARD(id));
  }
}

interface HouseholdProviderProps {
  children: ReactNode;
}

export const HouseholdProvider: React.FC<HouseholdProviderProps> = ({ children }) => {
  const { user, initialized: authInitialized } = useAuth();
  const { authenticatedFetch } = useAuthenticatedRequest();
  const { connected: realtimeConnected } = useRealtime();

  const [state, dispatch] = useReducer(householdReducer, {
    households: [],
    currentHousehold: null,
    members: [],
    settings: null,
    dashboardData: null,
    loading: false,
    membersLoading: false,
    dashboardLoading: false,
    lastRefresh: null,
    error: null,
  });

  const householdApi = new HouseholdApiClient(authenticatedFetch);

  // Set up realtime subscriptions for current household
  const { subscribeToHouseholdChanges, subscribeToMemberChanges } = useHouseholdRealtime();

  // Subscribe to realtime updates
  useEffect(() => {
    if (!state.currentHousehold || !realtimeConnected) return;

    const unsubscribeHousehold = subscribeToHouseholdChanges((payload) => {
      if (payload.eventType === "UPDATE" && payload.new) {
        dispatch({ type: "UPDATE_HOUSEHOLD", household: payload.new });
      }
    });

    const unsubscribeMembers = subscribeToMemberChanges((payload) => {
      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            dispatch({ type: "ADD_MEMBER", member: payload.new });
            toast.success(`${payload.new.full_name} joined the household`);
          }
          break;
        case "DELETE":
          if (payload.old) {
            dispatch({ type: "REMOVE_MEMBER", memberId: payload.old.id });
            toast.custom(`${payload.old.full_name} left the household`);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            dispatch({ type: "UPDATE_MEMBER", member: payload.new });
          }
          break;
      }
    });

    return () => {
      unsubscribeHousehold();
      unsubscribeMembers();
    };
  }, [state.currentHousehold, realtimeConnected, subscribeToHouseholdChanges, subscribeToMemberChanges]);

  // Load households when user changes
  useEffect(() => {
    if (authInitialized && user) {
      loadHouseholds();
    } else if (authInitialized && !user) {
      dispatch({ type: "CLEAR_HOUSEHOLD_DATA" });
    }
  }, [user, authInitialized]);

  // Cache management - persist current household to localStorage
  useEffect(() => {
    if (state.currentHousehold) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_HOUSEHOLD, JSON.stringify(state.currentHousehold));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_HOUSEHOLD);
    }
  }, [state.currentHousehold]);

  // Restore current household from cache on initialization
  useEffect(() => {
    if (authInitialized && user && !state.currentHousehold && state.households.length > 0) {
      const cachedHousehold = localStorage.getItem(STORAGE_KEYS.CURRENT_HOUSEHOLD);
      if (cachedHousehold) {
        try {
          const household = JSON.parse(cachedHousehold) as Household;
          const exists = state.households.find((h) => h.id === household.id);
          if (exists) {
            selectHousehold(household.id);
          }
        } catch (error) {
          console.error("Failed to restore cached household:", error);
        }
      } else {
        // Auto-select first household if none cached
        selectHousehold(state.households[0].id);
      }
    }
  }, [authInitialized, user, state.households, state.currentHousehold]);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  const isStale = useCallback((): boolean => {
    if (!state.lastRefresh) return true;
    const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    return Date.now() - state.lastRefresh > STALE_THRESHOLD;
  }, [state.lastRefresh]);

  const loadHouseholds = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });

      const response = await householdApi.getHouseholds();

      if (isApiSuccess<Household[]>(response)) {
        dispatch({ type: "SET_HOUSEHOLDS", households: response.data });
        dispatch({ type: "SET_LAST_REFRESH", timestamp: Date.now() });
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load households";
      console.error("Load households error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const createHousehold = async (data: CreateHouseholdRequest): Promise<Household | null> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      // Optimistic update
      const tempHousehold: Household = {
        id: `temp-${Date.now()}`,
        ...data,
        admin_id: user?.id || "",
        invite_code: "",
        member_count: 1,
        data_retention_days: data.data_retention_days || 365,
        role: UserRole.ADMIN,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch({ type: "ADD_HOUSEHOLD", household: tempHousehold });

      const response = await householdApi.createHousehold(data);

      if (isApiSuccess<Household>(response)) {
        // Replace temp household with real one
        dispatch({ type: "REMOVE_HOUSEHOLD", householdId: tempHousehold.id });
        dispatch({ type: "ADD_HOUSEHOLD", household: response.data });
        toast.success("Household created successfully");
        return response.data;
      } else if (isApiError(response)) {
        // Revert optimistic update
        dispatch({ type: "REMOVE_HOUSEHOLD", householdId: tempHousehold.id });
        toast.error(response.error.message);
      }

      return null;
    } catch (error) {
      console.error("Create household error:", error);
      toast.error("Failed to create household");
      return null;
    }
  };

  const selectHousehold = async (householdId: UUID): Promise<void> => {
    try {
      const household = state.households.find((h) => h.id === householdId);

      if (household) {
        dispatch({ type: "SET_CURRENT_HOUSEHOLD", household });

        // Load related data in parallel
        await Promise.all([loadMembers(householdId), loadSettings(householdId), loadDashboardData(householdId)]);
      }
    } catch (error) {
      console.error("Select household error:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to load household data" });
      toast.error("Failed to load household data");
    }
  };

  const updateHousehold = async (householdId: UUID, data: Partial<Household>): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await householdApi.updateHousehold(householdId, data);

      if (isApiSuccess<Household>(response)) {
        dispatch({ type: "UPDATE_HOUSEHOLD", household: response.data });
        toast.success("Household updated successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Update household error:", error);
      toast.error("Failed to update household");
      return false;
    }
  };

  const deleteHousehold = async (householdId: UUID): Promise<boolean> => {
    try {
      const response = await householdApi.deleteHousehold(householdId);

      if (isApiSuccess(response)) {
        dispatch({ type: "REMOVE_HOUSEHOLD", householdId });
        toast.success("Household deleted successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Delete household error:", error);
      toast.error("Failed to delete household");
      return false;
    }
  };

  const leaveHousehold = async (data: LeaveHouseholdRequest): Promise<boolean> => {
    try {
      if (!state.currentHousehold) return false;

      const response = await householdApi.leaveHousehold(state.currentHousehold.id, data);

      if (isApiSuccess(response)) {
        dispatch({ type: "REMOVE_HOUSEHOLD", householdId: state.currentHousehold.id });
        toast.success("Left household successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Leave household error:", error);
      toast.error("Failed to leave household");
      return false;
    }
  };

  const generateInviteCode = async (householdId: UUID): Promise<InviteCodeResponse | null> => {
    try {
      const response = await householdApi.generateInviteCode(householdId);

      if (isApiSuccess<InviteCodeResponse>(response)) {
        toast.success("Invite code generated");
        return response.data;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return null;
    } catch (error) {
      console.error("Generate invite code error:", error);
      toast.error("Failed to generate invite code");
      return null;
    }
  };

  const validateInviteCode = async (inviteCode: string): Promise<boolean> => {
    try {
      const response = await householdApi.validateInviteCode(inviteCode);

      if (isApiSuccess(response)) {
        return response.data.valid;
      }

      return false;
    } catch (error) {
      console.error("Validate invite code error:", error);
      return false;
    }
  };

  const joinHousehold = async (data: JoinHouseholdRequest): Promise<boolean> => {
    try {
      const response = await householdApi.joinHousehold(data);

      if (isApiSuccess(response)) {
        await loadHouseholds(); // Refresh households
        toast.success("Joined household successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Join household error:", error);
      toast.error("Failed to join household");
      return false;
    }
  };

  const loadMembers = async (householdId?: UUID): Promise<void> => {
    const targetHouseholdId = householdId || state.currentHousehold?.id;
    if (!targetHouseholdId) return;

    try {
      dispatch({ type: "SET_MEMBERS_LOADING", loading: true });

      const response = await householdApi.getMembers(targetHouseholdId);

      if (isApiSuccess<HouseholdMember[]>(response)) {
        dispatch({ type: "SET_MEMBERS", members: response.data });
      }
    } catch (error) {
      console.error("Load members error:", error);
      toast.error("Failed to load members");
    } finally {
      dispatch({ type: "SET_MEMBERS_LOADING", loading: false });
    }
  };

  const refreshMembers = async (): Promise<void> => {
    if (state.currentHousehold) {
      await loadMembers(state.currentHousehold.id);
    }
  };

  const removeMember = async (householdId: UUID, data: RemoveMemberRequest): Promise<boolean> => {
    try {
      // Optimistic update
      dispatch({ type: "REMOVE_MEMBER", memberId: data.user_id });

      const response = await householdApi.removeMember(householdId, data);

      if (isApiSuccess(response)) {
        toast.success("Member removed successfully");
        return true;
      } else {
        // Revert optimistic update
        await loadMembers(householdId);
        if (isApiError(response)) {
          toast.error(response.error.message);
        }
      }

      return false;
    } catch (error) {
      // Revert optimistic update
      await loadMembers(householdId);
      console.error("Remove member error:", error);
      toast.error("Failed to remove member");
      return false;
    }
  };

  const loadSettings = async (householdId?: UUID): Promise<void> => {
    const targetHouseholdId = householdId || state.currentHousehold?.id;
    if (!targetHouseholdId) return;

    try {
      const response = await householdApi.getSettings(targetHouseholdId);

      if (isApiSuccess<HouseholdSettings>(response)) {
        dispatch({ type: "SET_SETTINGS", settings: response.data });
      }
    } catch (error) {
      console.error("Load settings error:", error);
    }
  };

  const updateSettings = async (householdId: UUID, settings: Partial<HouseholdSettings>): Promise<boolean> => {
    try {
      const response = await householdApi.updateSettings(householdId, settings);

      if (isApiSuccess<HouseholdSettings>(response)) {
        dispatch({ type: "SET_SETTINGS", settings: response.data });
        toast.success("Settings updated successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Update settings error:", error);
      toast.error("Failed to update settings");
      return false;
    }
  };

  const loadDashboardData = async (householdId?: UUID): Promise<void> => {
    const targetHouseholdId = householdId || state.currentHousehold?.id;
    if (!targetHouseholdId) return;

    try {
      dispatch({ type: "SET_DASHBOARD_LOADING", loading: true });

      const response = await householdApi.getDashboardData(targetHouseholdId);

      if (isApiSuccess<DashboardData>(response)) {
        dispatch({ type: "SET_DASHBOARD_DATA", data: response.data });
      }
    } catch (error) {
      console.error("Load dashboard data error:", error);
    } finally {
      dispatch({ type: "SET_DASHBOARD_LOADING", loading: false });
    }
  };

  const refreshDashboard = async (): Promise<void> => {
    if (state.currentHousehold) {
      await loadDashboardData(state.currentHousehold.id);
    }
  };

  const refreshAll = async (): Promise<void> => {
    if (state.currentHousehold) {
      await Promise.all([
        loadMembers(state.currentHousehold.id),
        loadSettings(state.currentHousehold.id),
        loadDashboardData(state.currentHousehold.id),
      ]);
      dispatch({ type: "SET_LAST_REFRESH", timestamp: Date.now() });
    }
  };

  const value: HouseholdContextType = {
    ...state,
    loadHouseholds,
    createHousehold,
    selectHousehold,
    updateHousehold,
    deleteHousehold,
    leaveHousehold,
    generateInviteCode,
    validateInviteCode,
    joinHousehold,
    loadMembers,
    refreshMembers,
    removeMember,
    loadSettings,
    updateSettings,
    loadDashboardData,
    refreshDashboard,
    refreshAll,
    clearError,
    isStale,
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};

export const useHousehold = (): HouseholdContextType => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
};
