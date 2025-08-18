// src/App.tsx - Updated with React Router
import * as UI from "@/components/ui/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { useState } from "react";
import FloatingElements from "./components/layout/FloatingElements";
import { Header } from "./components/layout/Header";
import { MobileNavigation } from "./components/layout/Navigation";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { HouseholdProvider, useHousehold } from "./contexts/HouseholdContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import "./index.css";

// Import page components (to be created)
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CreateHouseholdPage from "./pages/household/CreateHouseholdPage";
// import JoinHouseholdPage from "./pages/auth/JoinHouseholdPage";
// import LoginPage from "./pages/auth/LoginPage";
// import SignUpPage from "./pages/auth/SignUpPage";
// import CalendarPage from "./pages/CalendarPage";
// import ChatPage from "./pages/ChatPage";
// import ExpensesPage from "./pages/ExpensesPage";
// import CreateHouseholdPage from "./pages/household/CreateHouseholdPage";
// import HouseholdSettingsPage from "./pages/household/HouseholdSettingsPage";
// import MembersPage from "./pages/household/MembersPage";
// import NotificationsPage from "./pages/NotificationsPage";
// import ProfilePage from "./pages/ProfilePage";
// import SettingsPage from "./pages/SettingsPage";
// import TasksPage from "./pages/TasksPage";
// import WelcomePage from "./pages/WelcomePage";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireHousehold?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireHousehold = false }) => {
  const { user, loading } = useAuth();
  const { currentHousehold } = useHousehold();

  if (loading) {
    return <AppLoader />;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  if (requireHousehold && !currentHousehold) {
    return <Navigate to="/household/create" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects if authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout Component for authenticated pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-homey-bg-start to-homey-bg-end">
      <FloatingElements />

      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} showSidebarToggle={true} />

      {/* Desktop Navigation */}
      <MobileNavigation
        currentPath={window.location.pathname}
        onNavigate={(path) => (window.location.href = path)}
        className="hidden lg:flex w-64 fixed left-0 top-16 h-full z-20"
        // isOpen={sidebarOpen}
        // onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 pb-20 lg:pb-6 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation currentPath={window.location.pathname} onNavigate={(path) => (window.location.href = path)} />
    </div>
  );
};

// Error Components
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <UI.GlassCard className="p-8 flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-homey-violet-500/30 border-t-homey-violet-500"></div>
      <UI.GlassText className="text-sm opacity-70">Loading...</UI.GlassText>
    </UI.GlassCard>
  </div>
);

const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => (
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

const AppLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-6 relative z-10">
    <UI.GlassCard className="p-6 glass-card-violet">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-homey-violet-500 to-homey-violet-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
      </div>
    </UI.GlassCard>
    <div className="text-center">
      <UI.GlassHeading level={3} className="mb-2">
        Welcome to Homey
      </UI.GlassHeading>
      <UI.GlassText className="text-sm opacity-70">Loading...</UI.GlassText>
    </div>
  </div>
);

// Toast Configuration
const ToastConfiguration = () => {
  const { isDark } = useTheme();

  return (
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
          iconTheme: { primary: "#10b981", secondary: "#fff" },
        },
        error: {
          style: {
            borderColor: "rgba(239, 68, 68, 0.3)",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--homey-glass-bg))",
          },
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected Routes - Main App (requires household) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireHousehold>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/household/create"
        element={
          <ProtectedRoute>
            <CreateHouseholdPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route
//         path="/welcome"
//         element={
//           <PublicRoute>
//             <WelcomePage />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/login"
//         element={
//           <PublicRoute>
//             <LoginPage />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/signup"
//         element={
//           <PublicRoute>
//             <SignUpPage />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/join/:inviteCode?"
//         element={
//           <PublicRoute>
//             <JoinHouseholdPage />
//           </PublicRoute>
//         }
//       />

//       {/* Protected Routes - Household Creation */}
//       <Route
//         path="/household/create"
//         element={
//           <ProtectedRoute>
//             <CreateHouseholdPage />
//           </ProtectedRoute>
//         }
//       />

//       {/* Protected Routes - Main App (requires household) */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute requireHousehold>
//             <AppLayout>
//               <DashboardPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/tasks"
//         element={
//           <ProtectedRoute requireHousehold>
//             <AppLayout>
//               <TasksPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/expenses"
//         element={
//           <ProtectedRoute requireHousehold>
//             <AppLayout>
//               <ExpensesPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/chat"
//         element={
//           <ProtectedRoute requireHousehold>
//             <AppLayout>
//               <ChatPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/calendar"
//         element={
//           <ProtectedRoute requireHousehold>
//             <AppLayout>
//               <CalendarPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       {/* Settings Routes */}
//       <Route
//         path="/settings"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <SettingsPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/profile"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <ProfilePage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/notifications"
//         element={
//           <ProtectedRoute>
//             <AppLayout>
//               <NotificationsPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       {/* Household Management Routes */}
//       <Route
//         path="/household/settings"
//         element={
//           <ProtectedRoute requireHousehold>
//             <AppLayout>
//               <HouseholdSettingsPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/household/members"
//         element={
//           <ProtectedRoute requireHousehold>
//             <AppLayout>
//               <MembersPage />
//             </AppLayout>
//           </ProtectedRoute>
//         }
//       />

//       {/* Default redirects */}
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />
//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// };

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("App Error:", error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
          <Router>
            <AuthProvider>
              <HouseholdProvider>
                <RealtimeProvider>
                  <NotificationProvider>
                    <AppRoutes />
                    <ToastConfiguration />
                  </NotificationProvider>
                </RealtimeProvider>
              </HouseholdProvider>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
