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
