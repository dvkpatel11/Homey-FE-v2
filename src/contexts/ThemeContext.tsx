import { DARK_THEME_COLORS, generateCSSVars, LIGHT_THEME_COLORS } from "@/lib/config/colors";
import { STORAGE_KEYS } from "@/lib/hooks/useLocalStorage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean; // Add this convenience property
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultTheme = "system" }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then default
    const stored = localStorage.getItem("homey-theme") as Theme;
    return stored || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    // Initialize with correct theme immediately
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("homey-theme") as Theme;
      const currentTheme = stored || defaultTheme;

      if (currentTheme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return currentTheme;
    }
    return "dark";
  });

  // Resolve theme (handle 'system' preference)
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return theme;
    };

    const resolved = resolveTheme();
    setResolvedTheme(resolved);

    // Apply theme to document
    applyTheme(resolved);

    // Listen for system theme changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const newResolved = resolveTheme();
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const applyTheme = (resolvedTheme: "light" | "dark") => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(resolvedTheme);

    // Generate and apply CSS variables
    const colors = resolvedTheme === "dark" ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
    const cssVars = generateCSSVars(colors);

    // Apply CSS variables to :root
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", colors.primary);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark", // Add convenience property
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
