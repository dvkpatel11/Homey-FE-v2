/**
 * Homey API Validation Helpers
 * Runtime validation and type guards for API responses
 */

import type { ApiError, ApiResponse } from './api';

// Type guards
export const isApiError = (response: unknown): response is ApiError => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as any).error === 'object' &&
    typeof (response as any).error.code === 'string'
  );
};

export const isApiSuccess = <T>(response: unknown): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    !isApiError(response)
  );
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\d{9,15}$/;
  return phoneRegex.test(phone);
};

// Form validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCreateHousehold = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Household name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Household name must be 100 characters or less';
  }
  
  if (data.max_members && (data.max_members < 2 || data.max_members > 20)) {
    errors.max_members = 'Max members must be between 2 and 20';
  }
  
  if (data.address && data.address.length > 255) {
    errors.address = 'Address must be 255 characters or less';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreateTask = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Task title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Task title must be 200 characters or less';
  }
  
  if (data.description && data.description.length > 1000) {
    errors.description = 'Task description must be 1000 characters or less';
  }
  
  if (data.is_recurring && !data.recurrence_pattern) {
    errors.recurrence_pattern = 'Recurrence pattern is required for recurring tasks';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCreateBill = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Bill title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Bill title must be 200 characters or less';
  }
  
  if (!data.total_amount || parseFloat(data.total_amount) <= 0) {
    errors.total_amount = 'Total amount must be greater than 0';
  }
  
  if (!data.due_date) {
    errors.due_date = 'Due date is required';
  }
  
  if (!data.splits || !Array.isArray(data.splits) || data.splits.length === 0) {
    errors.splits = 'At least one bill split is required';
  } else {
    // Validate splits
    const hasPercentages = data.splits.some((split: any) => split.percentage !== undefined);
    const hasAmounts = data.splits.some((split: any) => split.amount_owed !== undefined);
    
    if (hasPercentages && hasAmounts) {
      errors.splits = 'Cannot mix percentage and amount-based splits';
    } else if (hasPercentages) {
      const totalPercentage = data.splits.reduce((sum: number, split: any) => 
        sum + (parseFloat(split.percentage) || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.splits = 'Percentage splits must total 100%';
      }
    } else if (hasAmounts) {
      const totalSplitAmount = data.splits.reduce((sum: number, split: any) => 
        sum + (parseFloat(split.amount_owed) || 0), 0);
      if (Math.abs(totalSplitAmount - parseFloat(data.total_amount)) > 0.01) {
        errors.splits = 'Split amounts must equal total bill amount';
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Decimal helpers for precise money calculations
export const formatCurrency = (amount: string | number, currency = 'USD'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const parseCurrencyToDecimal = (currencyString: string): string => {
  const cleaned = currencyString.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Date helpers
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isDateInPast = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

export const daysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
