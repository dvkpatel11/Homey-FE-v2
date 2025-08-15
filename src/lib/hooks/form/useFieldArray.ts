// src/lib/hooks/form/useFieldArray.ts
import { useCallback } from "react";
import type { FormValues, UseBasicFormReturn, UseFieldArrayReturn } from "./types";

/**
 * Field array hook for dynamic form fields
 *
 * @example
 * ```typescript
 * const form = useForm({
 *   users: [{ name: '', email: '' }]
 * });
 *
 * const userArray = useFieldArray('users', form);
 *
 * // Add new user
 * userArray.append({ name: '', email: '' });
 *
 * // Remove user at index
 * userArray.remove(0);
 *
 * // Move user from index 0 to index 2
 * userArray.move(0, 2);
 * ```
 */
export function useFieldArray<T = any, TForm extends FormValues = FormValues>(
  name: keyof TForm,
  form: UseBasicFormReturn<TForm>
): UseFieldArrayReturn<T> {
  const fieldValue = (form.values[name] as T[]) || [];

  const append = useCallback(
    (value: T) => {
      const newArray = [...fieldValue, value];
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  const prepend = useCallback(
    (value: T) => {
      const newArray = [value, ...fieldValue];
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  const remove = useCallback(
    (index: number) => {
      if (index < 0 || index >= fieldValue.length) {
        console.warn(`useFieldArray: Invalid index ${index} for array of length ${fieldValue.length}`);
        return;
      }
      const newArray = fieldValue.filter((_, i) => i !== index);
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  const insert = useCallback(
    (index: number, value: T) => {
      if (index < 0 || index > fieldValue.length) {
        console.warn(`useFieldArray: Invalid index ${index} for insertion in array of length ${fieldValue.length}`);
        return;
      }
      const newArray = [...fieldValue];
      newArray.splice(index, 0, value);
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  const move = useCallback(
    (from: number, to: number) => {
      if (from < 0 || from >= fieldValue.length || to < 0 || to >= fieldValue.length) {
        console.warn(
          `useFieldArray: Invalid indices - from: ${from}, to: ${to} for array of length ${fieldValue.length}`
        );
        return;
      }
      const newArray = [...fieldValue];
      const item = newArray.splice(from, 1)[0];
      newArray.splice(to, 0, item);
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  const swap = useCallback(
    (indexA: number, indexB: number) => {
      if (indexA < 0 || indexA >= fieldValue.length || indexB < 0 || indexB >= fieldValue.length) {
        console.warn(
          `useFieldArray: Invalid indices - indexA: ${indexA}, indexB: ${indexB} for array of length ${fieldValue.length}`
        );
        return;
      }
      const newArray = [...fieldValue];
      [newArray[indexA], newArray[indexB]] = [newArray[indexB], newArray[indexA]];
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  const replace = useCallback(
    (index: number, value: T) => {
      if (index < 0 || index >= fieldValue.length) {
        console.warn(`useFieldArray: Invalid index ${index} for array of length ${fieldValue.length}`);
        return;
      }
      const newArray = [...fieldValue];
      newArray[index] = value;
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  const clear = useCallback(() => {
    form.setValue(name, [] as TForm[keyof TForm]);
  }, [form, name]);

  const update = useCallback(
    (index: number, updater: (current: T) => T) => {
      if (index < 0 || index >= fieldValue.length) {
        console.warn(`useFieldArray: Invalid index ${index} for array of length ${fieldValue.length}`);
        return;
      }
      const newArray = [...fieldValue];
      newArray[index] = updater(newArray[index]);
      form.setValue(name, newArray as TForm[keyof TForm]);
    },
    [fieldValue, form, name]
  );

  // Helper to get field props for a specific index
  const getFieldProps = useCallback(
    (index: number, fieldName: string) => {
      return form.getFieldProps(`${String(name)}.${index}.${fieldName}` as keyof TForm);
    },
    [form, name]
  );

  return {
    fields: fieldValue,
    append,
    prepend,
    remove,
    insert,
    move,
    swap,
    replace,
    clear,
    update,
    length: fieldValue.length,
    getFieldProps,
  };
}
