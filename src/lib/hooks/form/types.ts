// src/lib/hooks/form/types.ts

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormTouched {
  [key: string]: boolean | undefined;
}

export interface FormValues {
  [key: string]: any;
}

// Validation rule interface
export interface ValidationRule<T = any> {
  validate: (value: T, allValues?: FormValues) => boolean | Promise<boolean>;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

// Basic form options
export interface UseBasicFormOptions<T extends FormValues = FormValues> {
  onSubmit?: (values: T) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  resetOnSubmit?: boolean;
}

// Form validation options
export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Form persistence options
export interface UseFormPersistenceOptions {
  persistKey: string;
}

// Auto-save options
export interface UseFormAutoSaveOptions<T extends FormValues = FormValues> {
  delay?: number;
  enabled?: boolean;
  onSaveSuccess?: (values: T) => void;
  onSaveError?: (error: Error, values: T) => void;
}

// Multi-step form options
export interface UseMultiStepFormOptions {
  persistKey?: string;
  onStepChange?: (step: number, stepData: any) => void;
}

// Complete form options interface
export interface UseFormOptions<T extends FormValues = FormValues> extends UseBasicFormOptions<T> {
  validationSchema?: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  persistKey?: string;
  autoSave?: {
    enabled: boolean;
    saveFunction: (values: T) => Promise<void>;
    options?: Omit<UseFormAutoSaveOptions<T>, "enabled">;
  };
}

// Field state interface
export interface FieldState<T = any> {
  value: T;
  error?: string;
  touched?: boolean;
  hasError: boolean;
  isTouched: boolean;
}

// Field props interface for easy binding
export interface FieldProps {
  name: string;
  value: any;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

// Form submission result
export interface FormSubmissionResult {
  success: boolean;
  data?: FormValues;
  error?: string;
}

// Basic form return interface
export interface UseBasicFormReturn<T extends FormValues = FormValues> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  updateValues: (newValues: Partial<T>) => void;
  setFieldError: (name: keyof T, error: string) => void;
  clearFieldError: (name: keyof T) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (event?: React.FormEvent) => Promise<FormSubmissionResult>;
  reset: (newValues?: T) => void;
  getFieldProps: (name: keyof T) => FieldProps;
  getFieldState: (name: keyof T) => FieldState;
}

// Enhanced form return interface (with validation, persistence, etc.)
export interface UseFormReturn<T extends FormValues = FormValues> extends UseBasicFormReturn<T> {
  validate?: () => Promise<FormErrors>;
  isValidating?: boolean;
  clearPersistedData?: () => void;
  hasPersistedData?: () => boolean;
}

// Field array return interface
export interface UseFieldArrayReturn<T = any> {
  fields: T[];
  append: (value: T) => void;
  prepend: (value: T) => void;
  remove: (index: number) => void;
  insert: (index: number, value: T) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  replace: (index: number, value: T) => void;
  update: (index: number, updater: (current: T) => T) => void;
  clear: () => void;
  length: number;
  getFieldProps: (index: number, fieldName: string) => FieldProps;
}

// Multi-step form step interface
export interface FormStep {
  id: string;
  title: string;
  component?: React.ComponentType<any>;
  validation?: ValidationSchema;
}

// Multi-step form return interface
export interface UseMultiStepFormReturn {
  currentStep: number;
  currentStepData: FormStep;
  completedSteps: number[];
  steps: FormStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  completeStep: (step?: number) => void;
  isStepCompleted: (step: number) => boolean;
  canGoToStep: (step: number) => boolean;
  setStepFormData: (step: number, data: FormValues) => void;
  getStepFormData: (step: number) => FormValues;
  getAllFormData: () => FormValues;
  progress: number;
  completionRate: number;
}

// Type-safe form schema builder
export type FormSchema<T extends FormValues> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// Helper type for inferring form values from initial values
export type InferFormValues<T> = T extends FormValues ? T : FormValues;
