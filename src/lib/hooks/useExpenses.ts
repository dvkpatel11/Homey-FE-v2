/**
 * useExpenses - Bill and expense management
 * Handles bills, payments, splits, and balance calculations with real-time updates
 */
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { billsApi } from "@/lib/api";
import {
  Bill,
  BillFilterParams,
  BillListResponse,
  CreateBillRequest,
  HouseholdBalances,
  RecordPaymentRequest,
  UUID,
  isApiSuccess,
} from "@/types";
import { useCallback, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "./useLocalStorage";

export interface ExpenseState {
  bills: Bill[];
  balances: HouseholdBalances | null;
  loading: boolean;
  creating: boolean;
  paying: boolean;
  selectedBills: Set<UUID>;
  filters: BillFilterParams;
  error: string | null;
}

type ExpenseAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_CREATING"; creating: boolean }
  | { type: "SET_PAYING"; paying: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_BILLS"; bills: Bill[] }
  | { type: "ADD_BILL"; bill: Bill }
  | { type: "UPDATE_BILL"; bill: Bill }
  | { type: "REMOVE_BILL"; billId: UUID }
  | { type: "SET_BALANCES"; balances: HouseholdBalances }
  | { type: "SET_FILTERS"; filters: BillFilterParams }
  | { type: "UPDATE_FILTERS"; filters: Partial<BillFilterParams> }
  | { type: "CLEAR_FILTERS" }
  | { type: "SELECT_BILL"; billId: UUID }
  | { type: "DESELECT_BILL"; billId: UUID }
  | { type: "SELECT_ALL_BILLS"; billIds: UUID[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "RESET_STATE" };

const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_CREATING":
      return { ...state, creating: action.creating };

    case "SET_PAYING":
      return { ...state, paying: action.paying };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_BILLS":
      return { ...state, bills: action.bills };

    case "ADD_BILL":
      return { ...state, bills: [action.bill, ...state.bills] };

    case "UPDATE_BILL":
      return {
        ...state,
        bills: state.bills.map((bill) => (bill.id === action.bill.id ? action.bill : bill)),
      };

    case "REMOVE_BILL":
      const newSelectedBills = new Set(state.selectedBills);
      newSelectedBills.delete(action.billId);
      return {
        ...state,
        bills: state.bills.filter((bill) => bill.id !== action.billId),
        selectedBills: newSelectedBills,
      };

    case "SET_BALANCES":
      return { ...state, balances: action.balances };

    case "SET_FILTERS":
      return { ...state, filters: action.filters };

    case "UPDATE_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.filters } };

    case "CLEAR_FILTERS":
      return { ...state, filters: {} };

    case "SELECT_BILL":
      return {
        ...state,
        selectedBills: new Set([...state.selectedBills, action.billId]),
      };

    case "DESELECT_BILL":
      const updatedSelection = new Set(state.selectedBills);
      updatedSelection.delete(action.billId);
      return { ...state, selectedBills: updatedSelection };

    case "SELECT_ALL_BILLS":
      return { ...state, selectedBills: new Set(action.billIds) };

    case "CLEAR_SELECTION":
      return { ...state, selectedBills: new Set() };

    case "RESET_STATE":
      return {
        ...state,
        bills: [],
        balances: null,
        selectedBills: new Set(),
        filters: {},
        error: null,
      };

    default:
      return state;
  }
};

export interface ExpenseActions {
  loadBills: (filters?: BillFilterParams) => Promise<void>;
  createBill: (data: CreateBillRequest) => Promise<Bill | null>;
  updateBill: (billId: UUID, data: Partial<Bill>) => Promise<boolean>;
  deleteBill: (billId: UUID) => Promise<boolean>;
  recordPayment: (data: RecordPaymentRequest) => Promise<boolean>;
  loadBalances: () => Promise<void>;
  refreshData: () => Promise<void>;
  setFilters: (filters: Partial<BillFilterParams>) => void;
  clearFilters: () => void;
  selectBill: (billId: UUID) => void;
  deselectBill: (billId: UUID) => void;
  selectAllBills: () => void;
  clearSelection: () => void;
  bulkMarkPaid: () => Promise<void>;
  bulkDelete: () => Promise<void>;
  clearError: () => void;
}

// Bill splitting utility hook
export const useBillSplitting = () => {
  const calculateEqualSplit = useCallback((totalAmount: number, memberCount: number) => {
    const amountPerPerson = totalAmount / memberCount;
    return Number(amountPerPerson.toFixed(2));
  }, []);

  const calculatePercentageSplit = useCallback((totalAmount: number, percentage: number) => {
    const amount = (totalAmount * percentage) / 100;
    return Number(amount.toFixed(2));
  }, []);

  const validateSplits = useCallback(
    (
      splits: Array<{ amount_owed?: string; percentage?: string }>,
      totalAmount: number
    ): { isValid: boolean; error?: string } => {
      const hasAmounts = splits.some((s) => s.amount_owed);
      const hasPercentages = splits.some((s) => s.percentage);

      if (hasAmounts && hasPercentages) {
        return { isValid: false, error: "Cannot mix amount and percentage splits" };
      }

      if (hasAmounts) {
        const totalSplit = splits.reduce((sum, split) => sum + parseFloat(split.amount_owed || "0"), 0);

        if (Math.abs(totalSplit - totalAmount) > 0.01) {
          return { isValid: false, error: "Split amounts must equal total amount" };
        }
      }

      if (hasPercentages) {
        const totalPercentage = splits.reduce((sum, split) => sum + parseFloat(split.percentage || "0"), 0);

        if (Math.abs(totalPercentage - 100) > 0.01) {
          return { isValid: false, error: "Percentages must total 100%" };
        }
      }

      return { isValid: true };
    },
    []
  );

  return {
    calculateEqualSplit,
    calculatePercentageSplit,
    validateSplits,
  };
};

export const useExpenses = () => {
  const { currentHousehold } = useHousehold();
  const { user } = useAuth();
  const { subscribeToHousehold } = useRealtime();

  const [state, dispatch] = useReducer(expenseReducer, {
    bills: [],
    balances: null,
    loading: false,
    creating: false,
    paying: false,
    selectedBills: new Set<string>(),
    filters: {},
    error: null,
  });

  // Persistent filter preferences
  const [savedFilters, setSavedFilters] = useLocalStorage<BillFilterParams>(
    `expense-filters-${currentHousehold?.id || "none"}`,
    {}
  );

  // Load bills and balances when household changes
  useEffect(() => {
    if (currentHousehold) {
      dispatch({ type: "SET_FILTERS", filters: savedFilters });
      refreshData();

      // Set up real-time subscription
      const unsubscribe = subscribeToExpenseUpdates();
      return unsubscribe;
    } else {
      dispatch({ type: "RESET_STATE" });
    }
  }, [currentHousehold, savedFilters]);

  // Save filters when they change
  useEffect(() => {
    setSavedFilters(state.filters);
  }, [state.filters, setSavedFilters]);

  const loadBills = async (filters?: BillFilterParams) => {
    if (!currentHousehold) return;

    try {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });

      const activeFilters = filters || state.filters;
      const response = await billsApi.getBills(currentHousehold.id, activeFilters);

      if (isApiSuccess<BillListResponse>(response)) {
        dispatch({ type: "SET_BILLS", bills: response.data.data });
      } else {
        const errorMessage = (response as any)?.error?.message || "Failed to load bills";
        dispatch({ type: "SET_ERROR", error: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load bills";
      console.error("Load bills error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const createBill = async (data: CreateBillRequest): Promise<Bill | null> => {
    if (!currentHousehold) return null;

    try {
      dispatch({ type: "SET_CREATING", creating: true });
      dispatch({ type: "SET_ERROR", error: null });

      const response = await billsApi.createBill(currentHousehold.id, data);

      if (isApiSuccess<Bill>(response)) {
        dispatch({ type: "ADD_BILL", bill: response.data });

        // Refresh balances after creating bill
        await loadBalances();

        toast.success("Bill created successfully");
        return response.data;
      } else {
        const errorMessage = (response as any)?.error?.message || "Failed to create bill";
        dispatch({ type: "SET_ERROR", error: errorMessage });
        toast.error(errorMessage);
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create bill";
      console.error("Create bill error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      dispatch({ type: "SET_CREATING", creating: false });
    }
  };

  const updateBill = async (billId: UUID, data: Partial<Bill>): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await billsApi.updateBill(billId, data);

      if (isApiSuccess<Bill>(response)) {
        dispatch({ type: "UPDATE_BILL", bill: response.data });
        toast.success("Bill updated successfully");
        return true;
      } else {
        const errorMessage = (response as any)?.error?.message || "Failed to update bill";
        dispatch({ type: "SET_ERROR", error: errorMessage });
        toast.error(errorMessage);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update bill";
      console.error("Update bill error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteBill = async (billId: UUID): Promise<boolean> => {
    try {
      dispatch({ type: "SET_ERROR", error: null });

      const response = await billsApi.deleteBill(billId);

      if (isApiSuccess(response)) {
        dispatch({ type: "REMOVE_BILL", billId });

        // Refresh balances after deleting bill
        await loadBalances();

        toast.success("Bill deleted successfully");
        return true;
      } else {
        const errorMessage = (response as any)?.error?.message || "Failed to delete bill";
        dispatch({ type: "SET_ERROR", error: errorMessage });
        toast.error(errorMessage);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete bill";
      console.error("Delete bill error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const recordPayment = async (data: RecordPaymentRequest): Promise<boolean> => {
    try {
      dispatch({ type: "SET_PAYING", paying: true });
      dispatch({ type: "SET_ERROR", error: null });

      const response = await billsApi.recordPayment(data);

      if (isApiSuccess(response)) {
        // Refresh bills and balances to reflect payment
        await Promise.all([loadBills(), loadBalances()]);

        toast.success("Payment recorded successfully");
        return true;
      } else {
        const errorMessage = (response as any)?.error?.message || "Failed to record payment";
        dispatch({ type: "SET_ERROR", error: errorMessage });
        toast.error(errorMessage);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to record payment";
      console.error("Record payment error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: "SET_PAYING", paying: false });
    }
  };

  const loadBalances = async () => {
    if (!currentHousehold) return;

    try {
      const response = await billsApi.getBalances(currentHousehold.id);

      if (isApiSuccess<HouseholdBalances>(response)) {
        dispatch({ type: "SET_BALANCES", balances: response.data });
      }
    } catch (error) {
      console.error("Load balances error:", error);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadBills(), loadBalances()]);
  };

  const setFilters = useCallback((filters: Partial<BillFilterParams>) => {
    dispatch({ type: "UPDATE_FILTERS", filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const selectBill = useCallback((billId: UUID) => {
    dispatch({ type: "SELECT_BILL", billId });
  }, []);

  const deselectBill = useCallback((billId: UUID) => {
    dispatch({ type: "DESELECT_BILL", billId });
  }, []);

  const selectAllBills = useCallback(() => {
    const billIds = state.bills.map((bill) => bill.id);
    dispatch({ type: "SELECT_ALL_BILLS", billIds });
  }, [state.bills]);

  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  const bulkMarkPaid = async () => {
    if (state.selectedBills.size === 0) return;

    try {
      const billIds = Array.from(state.selectedBills);
      const response = await billsApi.bulkMarkPaid(billIds);

      if (isApiSuccess(response)) {
        await refreshData();
        clearSelection();
        toast.success(`${response.data.marked_count} bills marked as paid`);
      } else {
        const errorMessage = (response as any)?.error?.message || "Failed to mark bills as paid";
        dispatch({ type: "SET_ERROR", error: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark bills as paid";
      console.error("Bulk mark paid error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const bulkDelete = async () => {
    if (state.selectedBills.size === 0) return;

    try {
      const billIds = Array.from(state.selectedBills);
      const response = await billsApi.bulkDelete(billIds);

      if (isApiSuccess(response)) {
        await refreshData();
        clearSelection();
        toast.success(`${response.data.deleted_count} bills deleted`);
      } else {
        const errorMessage = (response as any)?.error?.message || "Failed to delete bills";
        dispatch({ type: "SET_ERROR", error: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete bills";
      console.error("Bulk delete error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const subscribeToExpenseUpdates = useCallback((): (() => void) => {
    if (!currentHousehold) return () => {};

    const unsubscribe = subscribeToHousehold(currentHousehold.id, "bills", "*", (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      if (eventType === "INSERT" && newRecord) {
        dispatch({ type: "ADD_BILL", bill: newRecord as Bill });
        toast.success("New bill added");
      } else if (eventType === "UPDATE" && newRecord) {
        dispatch({ type: "UPDATE_BILL", bill: newRecord as Bill });
      } else if (eventType === "DELETE" && oldRecord) {
        dispatch({ type: "REMOVE_BILL", billId: oldRecord.id });
      }

      // Refresh balances on any bill change
      loadBalances();
    });

    return unsubscribe;
  }, [currentHousehold?.id, subscribeToHousehold]);

  const actions: ExpenseActions = {
    loadBills,
    createBill,
    updateBill,
    deleteBill,
    recordPayment,
    loadBalances,
    refreshData,
    setFilters,
    clearFilters,
    selectBill,
    deselectBill,
    selectAllBills,
    clearSelection,
    bulkMarkPaid,
    bulkDelete,
    clearError,
  };

  // Computed values
  const totalOutstanding = state.bills
    .filter((bill) => bill.status === "pending" || bill.status === "overdue")
    .reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);

  const overdueBills = state.bills.filter((bill) => bill.status === "overdue");

  const upcomingBills = state.bills.filter((bill) => {
    if (bill.status !== "pending") return false;
    const dueDate = new Date(bill.due_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate <= weekFromNow;
  });

  const myBalance = state.balances?.member_balances?.find((balance) => balance.user_id === user?.id);

  const hasSelection = state.selectedBills.size > 0;
  const isAllSelected = state.selectedBills.size === state.bills.length && state.bills.length > 0;

  return {
    ...state,
    ...actions,
    totalOutstanding,
    overdueBills,
    upcomingBills,
    myBalance,
    hasOverdue: overdueBills.length > 0,
    hasUpcoming: upcomingBills.length > 0,
    hasSelection,
    isAllSelected,
    selectedCount: state.selectedBills.size,
  };
};
