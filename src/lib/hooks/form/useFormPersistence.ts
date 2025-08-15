// src/lib/hooks/form/useFormPersistence.ts
import { useCallback, useEffect } from "react";
import { useLocalStorage } from "../useLocalStorage";
import type { FormValues, UseBasicFormReturn, UseFormAutoSaveOptions } from "./types";

export interface UseFormPersistenceReturn {
  clearPersistedData: () => void;
  hasPersistedData: () => boolean;
}

/**
 * Form persistence hook using centralized localStorage hook
 */
export function useFormPersistence<T extends FormValues = FormValues>(
  form: UseBasicFormReturn<T>,
  persistKey: string | null
): UseFormPersistenceReturn | null {
  const storageKey = persistKey ? `form_${persistKey}` : null;
  const [persistedData, setPersistedData, removePersistedData, hasPersistedData] = useLocalStorage<T | null>(
    storageKey,
    null
  );

  // Load persisted data on mount
  useEffect(() => {
    if (!persistKey || !persistedData) return;

    try {
      // Merge persisted values with current form values
      const mergedValues: T = { ...form.values, ...persistedData };
      form.updateValues(mergedValues);
    } catch (error) {
      console.error("Failed to load persisted form data:", error);
    }
  }, [persistKey, persistedData, form]);

  // Save data when form values change (but only if form is dirty)
  useEffect(() => {
    if (!persistKey || !form.isDirty) return;

    try {
      setPersistedData(form.values);
    } catch (error) {
      console.error("Failed to persist form data:", error);
    }
  }, [form.values, form.isDirty, persistKey, setPersistedData]);

  // If no persist key, return null
  if (!persistKey) {
    return null;
  }

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    removePersistedData();
  }, [removePersistedData]);

  // Check if persisted data exists
  const hasData = useCallback((): boolean => {
    return hasPersistedData();
  }, [hasPersistedData]);

  return {
    clearPersistedData,
    hasPersistedData: hasData,
  };
}

// Auto-save hook for forms
export function useFormAutoSave<T extends FormValues = FormValues>(
  form: UseBasicFormReturn<T>,
  saveFunction: ((values: T) => Promise<void>) | null,
  options: UseFormAutoSaveOptions<T> = {}
): void {
  const {
    delay = 2000, // 2 seconds
    enabled = true,
    onSaveSuccess,
    onSaveError,
  } = options;

  useEffect(() => {
    if (!enabled || !form.isDirty || !saveFunction) return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveFunction(form.values);
        onSaveSuccess?.(form.values);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error("Auto-save failed");
        console.error("Auto-save failed:", errorObj);
        onSaveError?.(errorObj, form.values);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [form.values, form.isDirty, delay, enabled, saveFunction, onSaveSuccess, onSaveError]);
}
