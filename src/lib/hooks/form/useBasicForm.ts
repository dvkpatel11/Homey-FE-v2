// src/lib/hooks/form/useBasicForm.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FieldProps,
  FieldState,
  FormErrors,
  FormSubmissionResult,
  FormTouched,
  FormValues,
  UseBasicFormOptions,
  UseBasicFormReturn,
} from "./types";

export function useBasicForm<T extends FormValues = FormValues>(
  initialValues: T,
  options: UseBasicFormOptions<T> = {}
): UseBasicFormReturn<T> {
  const { onSubmit, resetOnSubmit = false } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const initialValuesRef = useRef<T>(initialValues);

  // Check if form is dirty
  useEffect(() => {
    const hasChanged = Object.keys(values).some((key) => values[key] !== initialValuesRef.current[key]);
    setIsDirty(hasChanged);
  }, [values]);

  // Set field value
  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear field error when user starts typing
      if (errors[name as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Set multiple values
  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target;
      const target = event.target as HTMLInputElement;
      const fieldValue = type === "checkbox" ? target.checked : value;
      setValue(name as keyof T, fieldValue as T[keyof T]);
    },
    [setValue]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = event.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    []
  );

  // Set field error
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name as string]: error }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((name: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as string];
      return newErrors;
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (event?: React.FormEvent): Promise<FormSubmissionResult> => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      setIsSubmitting(true);

      try {
        let result: FormSubmissionResult = { success: true, data: values };

        if (onSubmit) {
          result = await onSubmit(values);
        }

        if (resetOnSubmit && result.success) {
          reset();
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Form submission failed";
        console.error("Form submission error:", error);
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, resetOnSubmit]
  );

  // Reset form
  const reset = useCallback(
    (newValues: T = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsDirty(false);
    },
    [initialValues]
  );

  // Get field props for easy binding
  const getFieldProps = useCallback(
    (name: keyof T): FieldProps => ({
      name: name as string,
      value: values[name] ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  // Get field state
  const getFieldState = useCallback(
    (name: keyof T): FieldState => ({
      value: values[name],
      error: errors[name as string],
      touched: touched[name as string],
      hasError: Boolean(errors[name as string]),
      isTouched: Boolean(touched[name as string]),
    }),
    [values, errors, touched]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    setValue,
    updateValues,
    setFieldError,
    clearFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    getFieldState,
  };
}
