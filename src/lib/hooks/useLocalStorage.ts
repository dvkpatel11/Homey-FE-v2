// src/lib/hooks/useLocalStorage.ts
import { useCallback, useEffect, useState } from "react";

// src/lib/constants/storage.ts
export const STORAGE_KEYS = {
  AUTH_TOKEN: "homey_access_token",
  REFRESH_TOKEN: "homey_refresh_token",
  USER: "homey_user",
  THEME: "homey-theme",
  CURRENT_HOUSEHOLD: "homey_current_household",
} as const;

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

export interface MultiStepData {
  [stepKey: string]: any;
  __currentStep?: number;
  __completedSteps?: number[];
}

export interface UseMultiStepDataReturn {
  stepData: MultiStepData;
  updateStep: (stepKey: string | number, data: any) => void;
  clearAllSteps: () => void;
  getStep: (stepKey: string | number) => any;
  clearStep: (stepKey: string | number) => void;
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

// Types for multi-step form data

/**
 * Hook for managing multi-step form data with localStorage persistence
 * @param storageKey - The key to use for localStorage (null to disable persistence)
 * @returns Object with stepData and management functions
 */
export function useMultiStepData(storageKey: string | null = null): UseMultiStepDataReturn {
  // Initialize state
  const [stepData, setStepData] = useState<MultiStepData>(() => {
    if (!storageKey || typeof window === "undefined") {
      return {};
    }

    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn(`Failed to parse multi-step data from localStorage:`, error);
      return {};
    }
  });

  // Save to localStorage whenever stepData changes
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(stepData));
    } catch (error) {
      console.warn(`Failed to save multi-step data to localStorage:`, error);
    }
  }, [stepData, storageKey]);

  // Update a specific step's data
  const updateStep = useCallback((stepKey: string | number, data: any) => {
    setStepData((prev) => ({
      ...prev,
      [stepKey]: data,
    }));
  }, []);

  // Get data for a specific step
  const getStep = useCallback(
    (stepKey: string | number) => {
      return stepData[stepKey];
    },
    [stepData]
  );

  // Clear data for a specific step
  const clearStep = useCallback((stepKey: string | number) => {
    setStepData((prev) => {
      const newData = { ...prev };
      delete newData[stepKey];
      return newData;
    });
  }, []);

  // Clear all step data
  const clearAllSteps = useCallback(() => {
    setStepData({});

    // Also clear from localStorage if using persistence
    if (storageKey && typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn(`Failed to clear multi-step data from localStorage:`, error);
      }
    }
  }, [storageKey]);

  return {
    stepData,
    updateStep,
    clearAllSteps,
    getStep,
    clearStep,
  };
}
