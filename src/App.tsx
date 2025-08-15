import * as UI from "@/components/ui/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { DARK_THEME_COLORS, generateCSSVars, LIGHT_THEME_COLORS } from "./lib/config/colors";

import UIPreview from "./components/UiPrev";
import "./index.css";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

// Loading component with glass styling
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <UI.GlassCard className="p-8 flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-homey-violet-500/30 border-t-homey-violet-500"></div>
      <UI.GlassText className="text-sm opacity-70">Loading...</UI.GlassText>
    </UI.GlassCard>
  </div>
);

// Error fallback component
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <UI.GlassCard className="p-8 max-w-md w-full text-center">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 mx-auto mb-3 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <UI.GlassHeading level={2} className="mb-2">
          Something went wrong
        </UI.GlassHeading>
        <UI.GlassText className="mb-6 text-sm opacity-70">{error.message}</UI.GlassText>
      </div>
      <UI.GlassButton onClick={resetErrorBoundary} className="w-full">
        Try again
      </UI.GlassButton>
    </UI.GlassCard>
  </div>
);

// Enhanced loading component with floating elements
const AppLoader = () => {
  return (
    <div className="flex flex-col items-center space-y-6 relative z-10">
      <UI.GlassCard className="p-6 glass-card-violet">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-homey-violet-500 to-homey-violet-600 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
        </div>
      </UI.GlassCard>
      <div className="text-center">
        <UI.GlassHeading level={3} className="mb-2">
          Welcome to Your App
        </UI.GlassHeading>
        <UI.GlassText className="text-sm opacity-70">Loading...</UI.GlassText>
      </div>
    </div>
  );
};

// Root App Component with all providers
const App: React.FC = () => {
  // const [currentPage, setCurrentPage] = useState("dashboard");

  // Mock auth state for development
  // const isLoggedIn = true;
  const [isDark, setIsDark] = useState(false);
  // const { isDark } = useTheme();

  const applyTheme = useCallback((darkMode: boolean) => {
    const theme = darkMode ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
    const cssVars = generateCSSVars(theme);

    Object.entries(cssVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });

    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = savedTheme ? savedTheme === "dark" : systemPrefersDark;

      setIsDark(shouldBeDark);
      applyTheme(shouldBeDark);
    };

    initializeTheme();
  }, [applyTheme]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div>
        {/* Floating background elements */}
        <QueryClientProvider client={queryClient}>
          {/* <DemoContent /> */}
          <UI.GlassButton onClick={toggleTheme} className="fixed top-4 right-4 z-50">
            {isDark ? "☀️" : "🌙"}
          </UI.GlassButton>
          <AppLoader />
          <PageLoader />
          <UIPreview isDark={isDark} />
          {/* Enhanced Toast Notifications with preserved styling */}
          <Toaster
            position="top-center"
            containerClassName="safe-area-top"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--homey-glass-bg)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--homey-glass-border)",
                color: "var(--homey-text)",
                borderRadius: "1rem",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                maxWidth: "calc(100vw - 32px)",
              },
              success: {
                style: {
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--homey-glass-bg))",
                },
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                style: {
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--homey-glass-bg))",
                },
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
              loading: {
                style: {
                  borderColor: "var(--homey-glass-violet)",
                  background: "linear-gradient(135deg, var(--homey-glass-violet), var(--homey-glass-bg))",
                },
              },
            }}
          />
        </QueryClientProvider>
      </div>
    </ErrorBoundary>
  );
};

export default App;
