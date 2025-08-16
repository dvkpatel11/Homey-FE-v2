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
  isApiError,
  isApiSuccess,
} from "@/types";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "./useLocalStorage";
import { useMobile } from "./useMobile";

export interface ExpenseState {
  bills: Bill[];
  balances: HouseholdBalances | null;
  loading: boolean;
  creating: boolean;
  paying: boolean;
  selectedBills: Set<UUID>;
  filters: BillFilterParams;
}

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
  const { lightImpact } = useMobile().hapticFeedback || { lightImpact: () => {} };

  const [state, setState] = useState<ExpenseState>({
    bills: [],
    balances: null,
    loading: false,
    creating: false,
    paying: false,
    selectedBills: new Set(),
    filters: {},
  });

  // Persistent filter preferences
  const [savedFilters, setSavedFilters] = useLocalStorage<BillFilterParams>(
    `expense-filters-${currentHousehold?.id || "none"}`,
    {}
  );

  // Load bills and balances when household changes
  useEffect(() => {
    if (currentHousehold) {
      setState((prev) => ({ ...prev, filters: savedFilters }));
      refreshData();

      // Set up real-time subscription
      const unsubscribe = subscribeToExpenseUpdates();
      return unsubscribe;
    } else {
      setState((prev) => ({
        ...prev,
        bills: [],
        balances: null,
        selectedBills: new Set(),
        filters: {},
      }));
    }
  }, [currentHousehold, savedFilters]);

  // Save filters when they change
  useEffect(() => {
    setSavedFilters(state.filters);
  }, [state.filters, setSavedFilters]);

  const loadBills = async (filters?: BillFilterParams) => {
    if (!currentHousehold) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const activeFilters = filters || state.filters;
      const response = await billsApi.getBills(currentHousehold.id, activeFilters);

      if (isApiSuccess<BillListResponse>(response)) {
        setState((prev) => ({ ...prev, bills: response.data.data }));
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error("Load bills error:", error);
      toast.error("Failed to load bills");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const createBill = async (data: CreateBillRequest): Promise<Bill | null> => {
    if (!currentHousehold) return null;

    try {
      setState((prev) => ({ ...prev, creating: true }));

      const response = await billsApi.createBill(currentHousehold.id, data);

      if (isApiSuccess<Bill>(response)) {
        setState((prev) => ({
          ...prev,
          bills: [response.data, ...prev.bills],
        }));

        // Refresh balances after creating bill
        await loadBalances();

        lightImpact?.();
        toast.success("Bill created successfully");
        return response.data;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return null;
    } catch (error) {
      console.error("Create bill error:", error);
      toast.error("Failed to create bill");
      return null;
    } finally {
      setState((prev) => ({ ...prev, creating: false }));
    }
  };

  const updateBill = async (billId: UUID, data: Partial<Bill>): Promise<boolean> => {
    try {
      const response = await billsApi.updateBill(billId, data);

      if (isApiSuccess<Bill>(response)) {
        setState((prev) => ({
          ...prev,
          bills: prev.bills.map((bill) => (bill.id === billId ? response.data : bill)),
        }));

        lightImpact?.();
        toast.success("Bill updated successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Update bill error:", error);
      toast.error("Failed to update bill");
      return false;
    }
  };

  const deleteBill = async (billId: UUID): Promise<boolean> => {
    try {
      const response = await billsApi.deleteBill(billId);

      if (isApiSuccess(response)) {
        setState((prev) => ({
          ...prev,
          bills: prev.bills.filter((bill) => bill.id !== billId),
          selectedBills: new Set([...prev.selectedBills].filter((id) => id !== billId)),
        }));

        // Refresh balances after deleting bill
        await loadBalances();

        lightImpact?.();
        toast.success("Bill deleted successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Delete bill error:", error);
      toast.error("Failed to delete bill");
      return false;
    }
  };

  const recordPayment = async (data: RecordPaymentRequest): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, paying: true }));

      const response = await billsApi.recordPayment(data);

      if (isApiSuccess(response)) {
        // Refresh bills and balances to reflect payment
        await Promise.all([loadBills(), loadBalances()]);

        lightImpact?.();
        toast.success("Payment recorded successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Record payment error:", error);
      toast.error("Failed to record payment");
      return false;
    } finally {
      setState((prev) => ({ ...prev, paying: false }));
    }
  };

  const loadBalances = async () => {
    if (!currentHousehold) return;

    try {
      const response = await billsApi.getBalances(currentHousehold.id);

      if (isApiSuccess<HouseholdBalances>(response)) {
        setState((prev) => ({ ...prev, balances: response.data }));
      }
    } catch (error) {
      console.error("Load balances error:", error);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadBills(), loadBalances()]);
  };

  const setFilters = useCallback((filters: Partial<BillFilterParams>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({ ...prev, filters: {} }));
  }, []);

  const selectBill = useCallback((billId: UUID) => {
    setState((prev) => ({
      ...prev,
      selectedBills: new Set([...prev.selectedBills, billId]),
    }));
  }, []);

  const deselectBill = useCallback((billId: UUID) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedBills);
      newSelected.delete(billId);
      return { ...prev, selectedBills: newSelected };
    });
  }, []);

  const selectAllBills = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedBills: new Set(prev.bills.map((bill) => bill.id)),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedBills: new Set() }));
  }, []);

  const bulkMarkPaid = async () => {
    if (state.selectedBills.size === 0) return;

    try {
      const billIds = Array.from(state.selectedBills);
      const response = await billsApi.bulkMarkPaid(billIds);

      if (isApiSuccess(response)) {
        await refreshData();
        clearSelection();
        lightImpact?.();
        toast.success(`${response.data.marked_count} bills marked as paid`);
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error("Bulk mark paid error:", error);
      toast.error("Failed to mark bills as paid");
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
        lightImpact?.();
        toast.success(`${response.data.deleted_count} bills deleted`);
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete bills");
    }
  };

  const subscribeToExpenseUpdates = useCallback((): (() => void) => {
    if (!currentHousehold) return () => {};

    const unsubscribeBills = subscribeToHousehold("*", "bills", (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      // Handle bill updates...
    });

    const unsubscribeSplits = subscribeToHousehold("*", "bill_splits", () => {
      loadBalances(); // Refresh balances on payment changes
    });

    return () => {
      unsubscribeBills();
      unsubscribeSplits();
    };
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
