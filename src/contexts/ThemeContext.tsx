/**
 * ThemeContext - Theme management with glassmorphic design system
 * Handles light/dark theme switching and CSS variable management
 */

import { DARK_THEME_COLORS, generateCSSVars, LIGHT_THEME_COLORS, type ThemeColors } from "@/lib/config/colors";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
  storageKey = "homey-theme",
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setThemeState(stored);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setThemeState("system");
      setResolvedTheme(systemTheme);
    }
  }, [storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const colors = resolvedTheme === "dark" ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
    const cssVars = generateCSSVars(colors);

    // Apply CSS variables
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply theme class
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    // Apply glassmorphic background patterns
    document.body.style.background =
      resolvedTheme === "dark"
        ? `
          radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 100%)
        `
        : `
          radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, #f5f5dc 0%, #fafafa 100%)
        `;

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", colors.primary);
    }

    // Update status bar style for iOS PWA
    const metaStatusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaStatusBarStyle) {
      metaStatusBarStyle.setAttribute("content", resolvedTheme === "dark" ? "black-translucent" : "default");
    }

    // Update manifest theme_color dynamically
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      // This would require dynamic manifest generation on the server
      // For now, we'll just update the meta tag
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  const colors = resolvedTheme === "dark" ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    colors,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    isSystem: theme === "system",
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

// Hook for glassmorphic components with automatic theme adaptation
export const useGlassEffect = () => {
  const { resolvedTheme, colors } = useTheme();

  return {
    // Basic glass card style
    cardStyle: {
      background: colors.glassBackground,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: `1px solid ${colors.glassBorder}`,
      borderRadius: "1rem",
      boxShadow:
        resolvedTheme === "dark"
          ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          : "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.2)",
    },

    // Glass button style
    buttonStyle: {
      background: colors.glassViolet,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid ${colors.glassBorder}`,
      borderRadius: "0.75rem",
      transition: "all 0.3s ease",
    },

    // Glass input style
    inputStyle: {
      background: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid ${colors.glassBorder}`,
      borderRadius: "0.75rem",
      color: colors.text,
    },

    // Utility values
    isDark: resolvedTheme === "dark",
    colors,
    theme: resolvedTheme,
  };
};

// Hook for theme-aware animations
export const useThemeAnimations = () => {
  const { resolvedTheme } = useTheme();

  return {
    // Smooth theme transition
    themeTransition: {
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },

    // Glass hover effects
    glassHover: {
      transform: "translateY(-2px) scale(1.02)",
      boxShadow:
        resolvedTheme === "dark"
          ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(139, 92, 246, 0.3)"
          : "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 60px rgba(139, 92, 246, 0.2)",
    },

    // Floating animation for cards
    floating: {
      animation: "float 6s ease-in-out infinite",
    },

    // Shimmer effect for loading states
    shimmer: {
      background:
        resolvedTheme === "dark"
          ? "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)"
          : "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
      backgroundSize: "200% 100%",
      animation: "shimmer 2s infinite",
    },
  };
};

// Hook for responsive theme values
export const useResponsiveTheme = () => {
  const { colors, resolvedTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return {
    // Adaptive spacing
    spacing: {
      xs: isMobile ? "0.5rem" : "0.75rem",
      sm: isMobile ? "0.75rem" : "1rem",
      md: isMobile ? "1rem" : "1.5rem",
      lg: isMobile ? "1.5rem" : "2rem",
      xl: isMobile ? "2rem" : "3rem",
    },

    // Adaptive border radius
    borderRadius: {
      sm: isMobile ? "0.5rem" : "0.75rem",
      md: isMobile ? "0.75rem" : "1rem",
      lg: isMobile ? "1rem" : "1.25rem",
      xl: isMobile ? "1.25rem" : "1.5rem",
    },

    // Adaptive shadows
    shadows: {
      glass: isMobile ? "0 4px 16px rgba(0, 0, 0, 0.15)" : "0 8px 32px rgba(0, 0, 0, 0.12)",
      elevated: isMobile ? "0 8px 25px rgba(0, 0, 0, 0.2)" : "0 20px 40px rgba(0, 0, 0, 0.15)",
    },

    // Screen info
    isMobile,
    isDesktop: !isMobile,
    colors,
    theme: resolvedTheme,
  };
};

// Hook for theme-aware text colors with accessibility
export const useThemeText = () => {
  const { colors, resolvedTheme } = useTheme();

  return {
    // Semantic text colors
    primary: colors.text,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    accent: colors.primary,

    // Status colors with theme awareness
    success: resolvedTheme === "dark" ? "#10b981" : "#059669",
    warning: resolvedTheme === "dark" ? "#f59e0b" : "#d97706",
    error: resolvedTheme === "dark" ? "#ef4444" : "#dc2626",
    info: resolvedTheme === "dark" ? "#3b82f6" : "#2563eb",

    // Interactive states
    interactive: {
      default: colors.text,
      hover: colors.primary,
      active: colors.primaryDark,
      disabled: colors.textMuted,
    },

    // Link colors
    link: {
      default: colors.primary,
      hover: colors.primaryBright,
      visited: resolvedTheme === "dark" ? "#a78bfa" : "#7c3aed",
    },
  };
};
