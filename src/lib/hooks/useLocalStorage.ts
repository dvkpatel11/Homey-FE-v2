// src/lib/hooks/useLocalStorage.ts
import { useCallback, useEffect, useState } from "react";

// Basic localStorage hook
export function useLocalStorage<T>(
  key: string | null,
  initialValue: T
): [T, (value: T) => void, () => void, () => boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!key || typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      if (!key || typeof window === "undefined") {
        setStoredValue(value);
        return;
      }

      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    if (!key || typeof window === "undefined") {
      setStoredValue(initialValue);
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  const hasValue = useCallback((): boolean => {
    if (!key || typeof window === "undefined") {
      return false;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item !== null;
    } catch (error) {
      console.error(`Error checking localStorage key "${key}":`, error);
      return false;
    }
  }, [key]);

  return [storedValue, setValue, removeValue, hasValue];
}

// Form persistence hook (alias for your existing code)
export function useFormPersistence<T>(
  key: string | null,
  initialValue: T
): [T, (value: T) => void, () => void, () => boolean] {
  return useLocalStorage(key, initialValue);
}

// Multi-step form data hook
export function useMultiStepData(storageKey: string | null) {
  const [stepData, setStepData, clearStepData, hasStepData] = useLocalStorage<Record<string | number, any>>(
    storageKey,
    {}
  );

  const updateStep = useCallback(
    (step: string | number, data: any) => {
      setStepData((prev: any) => ({
        ...prev,
        [step]: data,
      }));
    },
    [setStepData]
  );

  const getStep = useCallback(
    (step: string | number) => {
      return stepData[step];
    },
    [stepData]
  );

  const clearAllSteps = useCallback(() => {
    clearStepData();
  }, [clearStepData]);

  const removeStep = useCallback(
    (step: string | number) => {
      setStepData((prev: any) => {
        const newData = { ...prev };
        delete newData[step];
        return newData;
      });
    },
    [setStepData]
  );

  return {
    stepData,
    updateStep,
    getStep,
    clearAllSteps,
    removeStep,
    hasStepData,
  };
}

// SSR-safe localStorage hook with sync
export function useLocalStorageSync<T>(
  key: string | null,
  initialValue: T
): [T, (value: T) => void, () => void, () => boolean] {
  const [value, setValue, removeValue, hasValue] = useLocalStorage(key, initialValue);

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    if (!key || typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, setValue]);

  return [value, setValue, removeValue, hasValue];
}
