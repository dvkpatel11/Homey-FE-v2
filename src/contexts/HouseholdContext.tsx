/**
 * HouseholdContext - Household state management
 * Handles current household, members, settings, and household operations
 */

import { householdApi } from "@/lib/api";
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
  UUID,
} from "@/types";
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

interface HouseholdState {
  households: Household[];
  currentHousehold: Household | null;
  members: HouseholdMember[];
  settings: HouseholdSettings | null;
  dashboardData: DashboardData | null;
  loading: boolean;
  membersLoading: boolean;
}

type HouseholdAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_MEMBERS_LOADING"; loading: boolean }
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
  | { type: "CLEAR_HOUSEHOLD_DATA" };

const householdReducer = (state: HouseholdState, action: HouseholdAction): HouseholdState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_MEMBERS_LOADING":
      return { ...state, membersLoading: action.loading };

    case "SET_HOUSEHOLDS":
      return { ...state, households: action.households };

    case "SET_CURRENT_HOUSEHOLD":
      return { ...state, currentHousehold: action.household };

    case "SET_MEMBERS":
      return { ...state, members: action.members };

    case "SET_SETTINGS":
      return { ...state, settings: action.settings };

    case "SET_DASHBOARD_DATA":
      return { ...state, dashboardData: action.data };

    case "ADD_HOUSEHOLD":
      return {
        ...state,
        households: [...state.households, action.household],
      };

    case "UPDATE_HOUSEHOLD":
      return {
        ...state,
        households: state.households.map((h) => (h.id === action.household.id ? action.household : h)),
        currentHousehold:
          state.currentHousehold?.id === action.household.id ? action.household : state.currentHousehold,
      };

    case "REMOVE_HOUSEHOLD":
      return {
        ...state,
        households: state.households.filter((h) => h.id !== action.householdId),
        currentHousehold: state.currentHousehold?.id === action.householdId ? null : state.currentHousehold,
      };

    case "ADD_MEMBER":
      return {
        ...state,
        members: [...state.members, action.member],
      };

    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.memberId),
      };

    case "CLEAR_HOUSEHOLD_DATA":
      return {
        ...state,
        currentHousehold: null,
        members: [],
        settings: null,
        dashboardData: null,
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

  // Member management
  loadMembers: (householdId: UUID) => Promise<void>;
  removeMember: (householdId: UUID, data: RemoveMemberRequest) => Promise<boolean>;

  // Settings
  loadSettings: (householdId: UUID) => Promise<void>;
  updateSettings: (householdId: UUID, settings: Partial<HouseholdSettings>) => Promise<boolean>;

  // Dashboard
  loadDashboardData: (householdId: UUID) => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

interface HouseholdProviderProps {
  children: ReactNode;
}

export const HouseholdProvider: React.FC<HouseholdProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(householdReducer, {
    households: [],
    currentHousehold: null,
    members: [],
    settings: null,
    dashboardData: null,
    loading: false,
    membersLoading: false,
  });

  // Load households when user changes
  useEffect(() => {
    if (user) {
      loadHouseholds();
    } else {
      dispatch({ type: "CLEAR_HOUSEHOLD_DATA" });
    }
  }, [user]);

  const loadHouseholds = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });

      const response = await householdApi.getHouseholds();

      if (isApiSuccess<Household[]>(response)) {
        dispatch({ type: "SET_HOUSEHOLDS", households: response.data });

        // Auto-select first household if none selected
        if (response.data.length > 0 && !state.currentHousehold) {
          await selectHousehold(response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Load households error:", error);
      toast.error("Failed to load households");
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const createHousehold = async (data: CreateHouseholdRequest): Promise<Household | null> => {
    try {
      const response = await householdApi.createHousehold(data);

      if (isApiSuccess<Household>(response)) {
        dispatch({ type: "ADD_HOUSEHOLD", household: response.data });
        toast.success("Household created successfully");
        return response.data;
      } else if (isApiError(response)) {
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

        // Load related data
        await Promise.all([loadMembers(householdId), loadSettings(householdId), loadDashboardData(householdId)]);
      }
    } catch (error) {
      console.error("Select household error:", error);
      toast.error("Failed to load household data");
    }
  };

  const updateHousehold = async (householdId: UUID, data: Partial<Household>): Promise<boolean> => {
    try {
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

  const loadMembers = async (householdId: UUID): Promise<void> => {
    try {
      dispatch({ type: "SET_MEMBERS_LOADING", loading: true });

      const response = await householdApi.getMembers(householdId);

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

  const removeMember = async (householdId: UUID, data: RemoveMemberRequest): Promise<boolean> => {
    try {
      const response = await householdApi.removeMember(householdId, data);

      if (isApiSuccess(response)) {
        dispatch({ type: "REMOVE_MEMBER", memberId: data.user_id });
        toast.success("Member removed successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error("Failed to remove member");
      return false;
    }
  };

  const loadSettings = async (householdId: UUID): Promise<void> => {
    try {
      const response = await householdApi.getSettings(householdId);

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

  const loadDashboardData = async (householdId: UUID): Promise<void> => {
    try {
      const response = await householdApi.getDashboardData(householdId);

      if (isApiSuccess<DashboardData>(response)) {
        dispatch({ type: "SET_DASHBOARD_DATA", data: response.data });
      }
    } catch (error) {
      console.error("Load dashboard data error:", error);
    }
  };

  const refreshDashboard = async (): Promise<void> => {
    if (state.currentHousehold) {
      await loadDashboardData(state.currentHousehold.id);
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
    joinHousehold,
    loadMembers,
    removeMember,
    loadSettings,
    updateSettings,
    loadDashboardData,
    refreshDashboard,
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
