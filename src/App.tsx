import * as UI from "@/components/ui/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 checkered-violet flex items-center justify-center safe-area-inset relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl animate-float"></div>
        <div
          className="absolute top-3/4 right-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

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
    </div>
  );
};

// Simple demo content component
const DemoContent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = useCallback(() => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      // Your app logic here
    }, 2000);
  }, []);

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 checkered-violet relative overflow-hidden safe-area-inset">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl animate-float"></div>
        <div
          className="absolute top-3/4 right-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <UI.GlassContainer className="max-w-2xl w-full text-center">
          <div className="space-y-8">
            {/* Hero section */}
            <div className="space-y-4">
              <UI.GlassHeading
                level={1}
                className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent"
              >
                Your New Project
              </UI.GlassHeading>
              <UI.GlassText className="text-lg sm:text-xl opacity-80 max-w-lg mx-auto">
                A beautiful foundation built with TypeScript, React, and glassmorphic design
              </UI.GlassText>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-12">
              <UI.GlassCard className="p-6 glass-card-hover">
                <div className="w-12 h-12 rounded-full bg-violet-500/20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <UI.GlassHeading level={3} className="text-sm font-semibold mb-2">
                  Fast
                </UI.GlassHeading>
                <UI.GlassText className="text-xs opacity-70">
                  Built with Vite and optimized for performance
                </UI.GlassText>
              </UI.GlassCard>

              <UI.GlassCard className="p-6 glass-card-hover">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <UI.GlassHeading level={3} className="text-sm font-semibold mb-2">
                  Type Safe
                </UI.GlassHeading>
                <UI.GlassText className="text-xs opacity-70">
                  Full TypeScript support with strict type checking
                </UI.GlassText>
              </UI.GlassCard>

              <UI.GlassCard className="p-6 glass-card-hover">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                    />
                  </svg>
                </div>
                <UI.GlassHeading level={3} className="text-sm font-semibold mb-2">
                  Beautiful
                </UI.GlassHeading>
                <UI.GlassText className="text-xs opacity-70">
                  Glassmorphic UI components and smooth animations
                </UI.GlassText>
              </UI.GlassCard>
            </div>

            {/* CTA section */}
            <div className="space-y-4">
              <UI.GlassButton onClick={handleGetStarted} className="px-8 py-3 text-lg font-semibold glass-button">
                Get Started
              </UI.GlassButton>
              <UI.GlassText className="text-sm opacity-60">Ready to build something amazing?</UI.GlassText>
            </div>
          </div>
        </UI.GlassContainer>
      </main>
    </div>
  );
};

// Root App Component with all providers
const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        {/* <DemoContent /> */}
        <UIPreview />
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
    </ErrorBoundary>
  );
};

export default App;
