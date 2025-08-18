// src/lib/hooks/form/useFormValidation.ts
import { useCallback } from "react";
import { useDebouncedValidation } from "../useDebounce";
import type {
  FormErrors,
  FormValues,
  UseBasicFormReturn,
  UseFormValidationOptions,
  ValidationRule,
  ValidationSchema,
} from "./types";

export interface UseFormValidationReturn<T extends FormValues = FormValues> {
  isValidating: boolean;
  validate: () => Promise<FormErrors>;
  setValueWithValidation: <K extends keyof T>(name: K, value: T[K]) => void;
  handleBlurWithValidation: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export function useFormValidation<T extends FormValues = FormValues>(
  validationSchema: ValidationSchema | null,
  form: UseBasicFormReturn<T>,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> | null {
  const { validateOnChange = false, validateOnBlur = true } = options;

  // If no validation schema, return null
  if (!validationSchema) {
    return null;
  }

  const { validate: debouncedValidate, isValidating } = useDebouncedValidation(validationSchema, 300);

  // Enhanced setValue with validation
  const setValueWithValidation = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      form.setValue(name, value);

      if (validateOnChange && validationSchema) {
        const newValues = { ...form.values, [name]: value };
        debouncedValidate(newValues).then((errors) => {
          // Only update errors for the specific field to avoid clearing other field errors
          if (errors[name as string]) {
            form.setFieldError(name, errors[name as string]!);
          } else {
            form.clearFieldError(name);
          }
        });
      }
    },
    [form, validateOnChange, validationSchema, debouncedValidate]
  );

  // Enhanced handleBlur with validation
  const handleBlurWithValidation = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      form.handleBlur(event);

      if (validateOnBlur && validationSchema) {
        debouncedValidate(form.values).then((errors) => {
          // Update all errors after blur validation
          Object.entries(errors).forEach(([field, error]) => {
            if (error) {
              form.setFieldError(field as keyof T, error);
            }
          });
        });
      }
    },
    [form, validateOnBlur, validationSchema, debouncedValidate]
  );

  // Validate entire form
  const validate = useCallback(async (): Promise<FormErrors> => {
    if (!validationSchema) return {};

    try {
      const validationErrors = await debouncedValidate(form.values);

      // Clear all existing errors first
      Object.keys(form.errors).forEach((field) => {
        form.clearFieldError(field as keyof T);
      });

      // Set new errors
      Object.entries(validationErrors).forEach(([field, error]) => {
        if (error) {
          form.setFieldError(field as keyof T, error);
        }
      });

      return validationErrors;
    } catch (error) {
      console.error("Validation error:", error);
      const globalError = { _global: "Validation failed" };
      return globalError;
    }
  }, [form, validationSchema, debouncedValidate]);

  return {
    isValidating,
    validate,
    setValueWithValidation,
    handleBlurWithValidation,
  };
}

// Validation schema builder
export function createValidationSchema<T extends FormValues>(
  rules: Record<keyof T, ValidationRule[]>
): ValidationSchema {
  return rules as ValidationSchema;
}

// Common validation rules
export const validationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value: any) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim().length > 0;
      return value != null && value !== "";
    },
    message,
  }),

  email: (message = "Please enter a valid email address"): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  pattern: (regex: RegExp, message = "Invalid format"): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number | "") => {
      if (value === null || value === undefined || value === "") return true;
      return Number(value) >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number | "") => {
      if (value === null || value === undefined || value === "") return true;
      return Number(value) <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  matches: (otherField: string, message = "Fields must match"): ValidationRule => ({
    validate: (value: any, allValues?: FormValues) => {
      if (!allValues) return true;
      return value === allValues[otherField];
    },
    message,
  }),

  phone: (message = "Please enter a valid phone number"): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""));
    },
    message,
  }),

  url: (message = "Please enter a valid URL"): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  custom: <T = any>(
    validateFn: (value: T, allValues?: FormValues) => boolean | Promise<boolean>,
    message: string
  ): ValidationRule<T> => ({
    validate: validateFn,
    message,
  }),
};
