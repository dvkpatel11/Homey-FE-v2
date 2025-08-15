// ==========================================
// FIXED: src/lib/config/colors.ts
// ==========================================

// Type definitions
export interface ColorPalette {
  [key: string]: string;
}

export interface GlassColors {
  [key: string]: string;
  light: string;
  medium: string;
  strong: string;
  border: string;
  glow: string;
}

export interface ThemeColors {
  primary: string;
  primaryBright: string;
  primaryDark: string;
  glassBackground: string;
  glassBorder: string;
  glassViolet: string;
  background: string;
  text: string;
  textSecondary: string;
  textMuted: string;
}

export interface CSSVariables {
  [key: string]: string;
}

export const VIOLET_PALETTE = {
  // Core violet colors
  violet: {
    50: "#f3f0ff",
    100: "#e9e2ff",
    200: "#d4c5ff",
    300: "#b79aff",
    400: "#9c6cff",
    500: "#8b5cf6", // Primary violet
    600: "#7c3aed", // Light mode primary
    700: "#6d28d9", // Deeper violet
    800: "#5b21b6", // Darkest violet
    900: "#4c1d95",
  },

  // Bright variants for dark mode
  violetBright: {
    400: "#a78bfa", // Dark mode primary
    500: "#c4b5fd", // Dark mode bright
    600: "#8b5cf6", // Dark mode dark
  },

  // Glass-specific colors with opacity
  glass: {
    light: "rgba(139, 92, 246, 0.1)",
    medium: "rgba(139, 92, 246, 0.15)",
    strong: "rgba(139, 92, 246, 0.25)",
    border: "rgba(139, 92, 246, 0.2)",
    glow: "rgba(139, 92, 246, 0.4)",
  } as GlassColors,

  // Glass backgrounds
  glassBackground: {
    dark: "rgba(0, 0, 0, 0.25)",
    light: "rgba(255, 255, 255, 0.15)",
    subtle: "rgba(255, 255, 255, 0.05)",
  },

  // Glass borders
  glassBorder: {
    light: "rgba(255, 255, 255, 0.1)",
    medium: "rgba(255, 255, 255, 0.15)",
    strong: "rgba(255, 255, 255, 0.25)",
  },

  // Status colors that complement violet
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Background colors
  background: {
    black: "#0a0a0a",
    beige: "#f5f5dc",
    darkPattern: "#0f0f0f",
    lightPattern: "#fafafa",
  },
} as const;

// FIXED: Theme-specific color mappings
export const LIGHT_THEME_COLORS: ThemeColors = {
  primary: "#7c3aed", // Light mode uses darker violet
  primaryBright: "#8b5cf6",
  primaryDark: "#6d28d9",

  glassBackground: "rgba(255, 255, 255, 0.15)",
  glassBorder: "rgba(255, 255, 255, 0.2)",
  glassViolet: "rgba(139, 92, 246, 0.1)",

  text: "#1e293b", // Dark text for light background
  textSecondary: "#334155",
  textMuted: "#475569",
  background: "#f5f5dc",
};

export const DARK_THEME_COLORS: ThemeColors = {
  primary: "#a78bfa", // Dark mode uses brighter violet
  primaryBright: "#c4b5fd",
  primaryDark: "#8b5cf6",

  glassBackground: "rgba(0, 0, 0, 0.25)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  glassViolet: "rgba(139, 92, 246, 0.15)",

  text: "#ffffff", // Light text for dark background
  textSecondary: "rgba(255, 255, 255, 0.9)",
  textMuted: "rgba(255, 255, 255, 0.7)",
  background: "#0a0a0a", // Dark background
};

// FIXED: CSS Custom Property generators
export const generateCSSVars = (theme: ThemeColors): CSSVariables => {
  return {
    "--homey-primary": theme.primary, // FIXED: Was missing theme.
    "--homey-primary-bright": theme.primaryBright,
    "--homey-primary-dark": theme.primaryDark,
    "--homey-glass-bg": theme.glassBackground,
    "--homey-glass-border": theme.glassBorder,
    "--homey-glass-violet": theme.glassViolet,
    "--homey-bg": theme.background,
    "--homey-text": theme.text,
    "--homey-text-secondary": theme.textSecondary,
    "--homey-text-muted": theme.textMuted,

    // Status colors
    "--color-success": "#10b981",
    "--color-warning": "#f59e0b",
    "--color-error": "#ef4444",
    "--color-info": "#3b82f6",
    "--color-cancel": "#6b7280",

    // Dynamic surface colors
    "--surface-1": theme.text === "#ffffff" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    "--surface-2": theme.text === "#ffffff" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    "--surface-3": theme.text === "#ffffff" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
    "--glass-input-bg": theme.text === "#ffffff" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)",
  };
};

// Tailwind color object
export const TAILWIND_COLORS = {
  "homey-violet": VIOLET_PALETTE.violet,
  "homey-violet-bright": VIOLET_PALETTE.violetBright,
  "homey-glass": VIOLET_PALETTE.glass,
  "homey-glass-bg": VIOLET_PALETTE.glassBackground,
  "homey-glass-border": VIOLET_PALETTE.glassBorder,
  "homey-status": VIOLET_PALETTE.status,
  "homey-background": VIOLET_PALETTE.background,
} as const;
