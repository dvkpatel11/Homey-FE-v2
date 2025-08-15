// src/lib/hooks/useDebounce.ts
import { useCallback, useRef, useState } from "react";
import type { FormErrors, FormValues, ValidationSchema } from "./form/types";

// Basic debounce hook
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return [debouncedCallback, cancel];
}

// Specialized debounced validation hook
export function useDebouncedValidation(validationSchema: ValidationSchema | null, delay: number = 300) {
  const [isValidating, setIsValidating] = useState(false);

  const validateForm = useCallback(
    async (values: FormValues): Promise<FormErrors> => {
      if (!validationSchema) return {};

      setIsValidating(true);
      try {
        const errors: FormErrors = {};

        for (const [field, fieldRules] of Object.entries(validationSchema)) {
          const value = values[field];

          for (const rule of fieldRules) {
            try {
              const isValid = await rule.validate(value, values);
              if (!isValid) {
                errors[field] = rule.message;
                break;
              }
            } catch (error) {
              errors[field] = error instanceof Error ? error.message : "Validation failed";
              break;
            }
          }
        }

        return errors;
      } finally {
        setIsValidating(false);
      }
    },
    [validationSchema]
  );

  const [debouncedValidate] = useDebounce(validateForm, delay);

  const validate = useCallback(
    async (values: FormValues): Promise<FormErrors> => {
      return debouncedValidate(values);
    },
    [debouncedValidate]
  );

  return {
    validate,
    isValidating,
  };
}
