import { useMemo } from "react";
import type { FormValues, UseFormOptions, UseFormReturn } from "./types";
import { useBasicForm } from "./useBasicForm.ts";
import { useFormAutoSave, useFormPersistence } from "./useFormPersistence.ts";
import { useFormValidation } from "./useFormValidation.ts";

export function useForm<T extends FormValues = FormValues>(
  initialValues: T,
  options: UseFormOptions<T> = {}
): UseFormReturn<T> {
  const {
    validationSchema,
    validateOnChange = false,
    validateOnBlur = true,
    persistKey,
    autoSave,
    ...formOptions
  } = options;

  // Core form functionality
  const form = useBasicForm(initialValues, formOptions);

  // Add validation if schema provided
  const validation = useFormValidation(validationSchema || null, form, { validateOnChange, validateOnBlur });

  // Add persistence if key provided
  const persistence = useFormPersistence(form, persistKey || null);

  // Add auto-save if enabled
  useFormAutoSave(form, autoSave?.enabled ? autoSave.saveFunction : null, autoSave?.options);

  // Memoize the enhanced form object to prevent unnecessary re-renders
  const enhancedForm = useMemo(
    (): UseFormReturn<T> => ({
      ...form,
      // Enhanced methods with validation (fallback to original if no validation)
      setValue: validation?.setValueWithValidation || form.setValue,
      handleBlur: validation?.handleBlurWithValidation || form.handleBlur,
      validate: validation?.validate,
      isValidating: validation?.isValidating || false,
      // Persistence methods (undefined if no persistence)
      clearPersistedData: persistence?.clearPersistedData,
      hasPersistedData: persistence?.hasPersistedData,
    }),
    [form, validation, persistence]
  );

  return enhancedForm;
}

// Convenience hook for creating forms with explicit types
export function useTypedForm<T extends Record<string, any>>(
  initialValues: T,
  options?: UseFormOptions<T>
): UseFormReturn<T> {
  return useForm<T>(initialValues, options);
}

export type * from "./types";
export { useBasicForm } from "./useBasicForm.ts";
export { useFieldArray } from "./useFieldArray.ts";
export { useFormAutoSave, useFormPersistence } from "./useFormPersistence.ts";
export { createValidationSchema, useFormValidation, validationRules } from "./useFormValidation.ts";
export { useMultiStepForm } from "./useMultiStepForm.ts";
