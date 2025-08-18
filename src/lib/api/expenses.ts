/**
 * Bills/Expenses API
 * Handles bill management, payments, splits, and balance tracking
 */

import {
  ApiResponse,
  Bill,
  BillFilterParams,
  BillListResponse,
  BillSplit,
  CreateBillRequest,
  HouseholdBalances,
  PaymentResponse,
  RecordPaymentRequest,
  UUID,
} from "@/types";
import { API_ENDPOINTS } from "@/types/endpoints";
import { apiClient } from "./client";

export const billsApi = {
  // Bill CRUD
  async getBills(householdId: UUID, filters?: BillFilterParams): Promise<ApiResponse<BillListResponse>> {
    return apiClient.get<BillListResponse>(API_ENDPOINTS.HOUSEHOLDS.BILLS(householdId), { params: filters });
  },

  async getBill(billId: UUID): Promise<ApiResponse<Bill>> {
    return apiClient.get<Bill>(API_ENDPOINTS.BILLS.GET(billId));
  },

  async createBill(householdId: UUID, data: CreateBillRequest): Promise<ApiResponse<Bill>> {
    return apiClient.post<Bill>(API_ENDPOINTS.HOUSEHOLDS.BILLS(householdId), data);
  },

  async updateBill(billId: UUID, data: Partial<Bill>): Promise<ApiResponse<Bill>> {
    return apiClient.put<Bill>(API_ENDPOINTS.BILLS.UPDATE(billId), data);
  },

  async deleteBill(billId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.BILLS.DELETE(billId));
  },

  // Bill Splitting
  async getBillSplits(billId: UUID): Promise<ApiResponse<BillSplit[]>> {
    return apiClient.get<BillSplit[]>(API_ENDPOINTS.BILLS.SPLITS(billId));
  },

  async updateBillSplit(
    billId: UUID,
    splits: Array<{ user_id: UUID; amount_owed?: string; percentage?: string }>
  ): Promise<ApiResponse<BillSplit[]>> {
    return apiClient.put<BillSplit[]>(API_ENDPOINTS.BILLS.SPLIT(billId), { splits });
  },

  // Payments
  async recordPayment(data: RecordPaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(API_ENDPOINTS.BILL_SPLITS.PAYMENT(data.split_id), data);
  },

  async getPaymentHistory(billId: UUID): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        user_name: string;
        amount: string;
        paid_date: string;
        payment_method?: string;
      }>
    >
  > {
    return apiClient.get(`${API_ENDPOINTS.BILLS.GET(billId)}/payments`);
  },

  async uploadReceipt(billId: UUID, receipt: File): Promise<ApiResponse<{ receipt_url: string }>> {
    const formData = new FormData();
    formData.append("receipt", receipt);

    return apiClient.post<{ receipt_url: string }>(`${API_ENDPOINTS.BILLS.GET(billId)}/receipt`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Balance Management
  async getBalances(householdId: UUID): Promise<ApiResponse<HouseholdBalances>> {
    return apiClient.get<HouseholdBalances>(API_ENDPOINTS.HOUSEHOLDS.BALANCES(householdId));
  },

  async getUserBalance(
    householdId: UUID,
    userId: UUID
  ): Promise<
    ApiResponse<{
      total_owed: string;
      total_paid: string;
      net_balance: string;
    }>
  > {
    return apiClient.get(API_ENDPOINTS.HOUSEHOLDS.USER_BALANCE(householdId, userId));
  },

  async settleBalance(
    householdId: UUID,
    fromUserId: UUID,
    toUserId: UUID,
    amount: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.HOUSEHOLDS.BALANCES(householdId)}/settle`, {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
    });
  },

  // Bulk Operations
  async bulkMarkPaid(billIds: UUID[]): Promise<ApiResponse<{ success: boolean; marked_count: number }>> {
    return apiClient.post<{ success: boolean; marked_count: number }>("/api/bills/bulk-mark-paid", {
      bill_ids: billIds,
    });
  },

  async bulkDelete(billIds: UUID[]): Promise<ApiResponse<{ success: boolean; deleted_count: number }>> {
    return apiClient.post<{ success: boolean; deleted_count: number }>("/api/bills/bulk-delete", { bill_ids: billIds });
  },

  // Recurring Bills
  async createRecurringBill(
    householdId: UUID,
    data: CreateBillRequest & {
      recurrence_pattern: string;
      recurrence_interval: number;
      end_date?: string;
    }
  ): Promise<ApiResponse<Bill>> {
    return apiClient.post<Bill>(`${API_ENDPOINTS.HOUSEHOLDS.BILLS(householdId)}/recurring`, data);
  },

  async pauseRecurringBill(billId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.BILLS.GET(billId)}/pause-recurrence`);
  },

  async resumeRecurringBill(billId: UUID): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${API_ENDPOINTS.BILLS.GET(billId)}/resume-recurrence`);
  },

  // Bill Categories and Templates
  async getCategories(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        icon: string;
        default_recurrence?: string;
      }>
    >
  > {
    return apiClient.get("/api/bills/categories");
  },

  async getBillTemplates(): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        name: string;
        description: string;
        category: string;
        typical_amount?: string;
      }>
    >
  > {
    return apiClient.get("/api/bills/templates");
  },

  // Expense Reports
  async generateExpenseReport(
    householdId: UUID,
    options: {
      start_date: string;
      end_date: string;
      format?: "json" | "csv" | "pdf";
      include_receipts?: boolean;
    }
  ): Promise<
    ApiResponse<{
      report_url: string;
      expires_at: string;
    }>
  > {
    return apiClient.post(`${API_ENDPOINTS.HOUSEHOLDS.BILLS(householdId)}/report`, options);
  },

  // Bill Statistics
  async getBillStats(
    householdId: UUID,
    period?: "month" | "quarter" | "year"
  ): Promise<
    ApiResponse<{
      total_bills: number;
      total_amount: string;
      paid_amount: string;
      outstanding_amount: string;
      average_bill_amount: string;
      category_breakdown: Record<string, string>;
      payment_trends: Array<{ month: string; amount: string }>;
    }>
  > {
    return apiClient.get(`${API_ENDPOINTS.HOUSEHOLDS.BILLS(householdId)}/statistics`, { params: { period } });
  },

  // Split Calculations
  async calculateSplit(
    totalAmount: string,
    splitType: "equal" | "percentage" | "custom",
    memberIds: UUID[],
    customSplits?: Record<UUID, string>
  ): Promise<
    ApiResponse<
      Array<{
        user_id: UUID;
        amount_owed: string;
        percentage: string;
      }>
    >
  > {
    return apiClient.post("/api/bills/calculate-split", {
      total_amount: totalAmount,
      split_type: splitType,
      member_ids: memberIds,
      custom_splits: customSplits,
    });
  },
};

export default billsApi;
