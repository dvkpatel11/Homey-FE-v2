import { useForm } from "./index";
import type { FormValues, UseFormOptions, UseFormReturn, ValidationRule, ValidationSchema } from "./types";
import { validationRules } from "./useFormValidation";

// Field configuration interface
export interface FieldConfig<T = any> {
  defaultValue: T;
  validation?: ValidationRule<T>[];
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  required?: boolean;
  disabled?: boolean;
}

// Form configuration type
export type FormConfig<T extends FormValues> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

// Form builder class for fluent API
export class FormBuilder<T extends FormValues = FormValues> {
  private config: Partial<FormConfig<T>> = {};
  private options: UseFormOptions<T> = {};

  // Add a field with configuration
  field<K extends keyof T>(name: K, config: FieldConfig<T[K]>): FormBuilder<T> {
    this.config[name] = config;
    return this;
  }

  // Add validation to existing field
  validate<K extends keyof T>(name: K, rules: ValidationRule<T[K]>[]): FormBuilder<T> {
    if (!this.config[name]) {
      throw new Error(`Field ${String(name)} must be defined before adding validation`);
    }
    this.config[name]!.validation = rules;
    return this;
  }

  // Set form-level options
  withOptions(options: UseFormOptions<T>): FormBuilder<T> {
    this.options = { ...this.options, ...options };
    return this;
  }

  // Enable persistence
  withPersistence(key: string): FormBuilder<T> {
    this.options.persistKey = key;
    return this;
  }

  // Enable auto-save
  withAutoSave(saveFunction: (values: T) => Promise<void>, options?: { delay?: number }): FormBuilder<T> {
    this.options.autoSave = {
      enabled: true,
      saveFunction,
      options,
    };
    return this;
  }

  // Build the form
  build(): UseFormReturn<T> {
    const initialValues = {} as T;
    const validationSchema: ValidationSchema = {};

    // Process field configurations
    for (const [fieldName, fieldConfig] of Object.entries(this.config) as Array<[keyof T, FieldConfig]>) {
      // Set initial value
      (initialValues as any)[fieldName] = fieldConfig.defaultValue;

      // Set validation rules
      if (fieldConfig.validation && fieldConfig.validation.length > 0) {
        validationSchema[fieldName as string] = fieldConfig.validation;
      }

      // Add required validation if specified
      if (fieldConfig.required) {
        const existingRules = validationSchema[fieldName as string] || [];
        validationSchema[fieldName as string] = [validationRules.required(), ...existingRules];
      }
    }

    return useForm(initialValues, {
      ...this.options,
      validationSchema: Object.keys(validationSchema).length > 0 ? validationSchema : undefined,
    });
  }

  // Get field configurations for UI rendering
  getFieldConfigs(): Partial<FormConfig<T>> {
    return this.config;
  }
}

// Factory function for creating form builders
export function createForm<T extends FormValues>(): FormBuilder<T> {
  return new FormBuilder<T>();
}

// Quick form creation utilities
export const formUtils = {
  // Create a simple text field
  textField: (defaultValue = "", required = false): FieldConfig<string> => ({
    defaultValue,
    type: "text",
    required,
  }),

  // Create an email field
  emailField: (defaultValue = "", required = true): FieldConfig<string> => ({
    defaultValue,
    type: "email",
    required,
    validation: [validationRules.email()],
  }),

  // Create a password field
  passwordField: (defaultValue = "", minLength = 8): FieldConfig<string> => ({
    defaultValue,
    type: "password",
    required: true,
    validation: [validationRules.minLength(minLength)],
  }),

  // Create a number field
  numberField: (defaultValue = 0, min?: number, max?: number): FieldConfig<number> => ({
    defaultValue,
    type: "number",
    validation: [
      ...(min !== undefined ? [validationRules.min(min)] : []),
      ...(max !== undefined ? [validationRules.max(max)] : []),
    ],
  }),

  // Create a required text field
  requiredField: (defaultValue = ""): FieldConfig<string> => ({
    defaultValue,
    type: "text",
    required: true,
  }),
};
