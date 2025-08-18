// src/components/layout/Navigation.tsx - Updated for routing
import { useNotifications } from "@/contexts/NotificationContext";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { useTasks } from "@/lib/hooks/useTasks";
import { motion } from "framer-motion";
import { Bell, Calendar, CheckSquare, DollarSign, Home, MessageCircle, Settings, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  color?: string;
}

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

// Mobile Navigation Component
export const MobileNavigation: React.FC<NavigationProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { hasOverdue: hasOverdueTasks } = useTasks();
  const { hasOverdue: hasOverdueBills } = useExpenses();

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Home",
      icon: Home,
      path: "/dashboard",
      color: "from-violet-500 to-violet-600",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
      badge: hasOverdueTasks ? 1 : 0,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "expenses",
      label: "Bills",
      icon: DollarSign,
      path: "/expenses",
      badge: hasOverdueBills ? 1 : 0,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
      path: "/chat",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      path: "/calendar",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <motion.nav
      className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 
                 glass-card glass-card-violet rounded-glass-xl p-3 sm:p-4 z-40 safe-area-bottom lg:hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-around items-center">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className={`
                relative flex flex-col items-center space-y-1 sm:space-y-2 
                p-2 sm:p-3 rounded-glass transition-all duration-300
                ${
                  isActive
                    ? `bg-gradient-to-r ${item.color || "from-primary to-primary-bright"} text-white shadow-glass-lg`
                    : `text-glass-secondary hover:text-glass hover:bg-surface-1`
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Icon with badge */}
              <div className="relative">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />

                {/* Badge for counts */}
                {item.badge && item.badge > 0 && !isActive && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 
                               bg-red-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <span className="text-xs text-white font-medium">{item.badge > 9 ? "9+" : item.badge}</span>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span className="text-xs font-medium hidden xs:block">{item.label}</span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-1 h-1 bg-white rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Floating indicator line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
                   from-transparent via-white/20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
    </motion.nav>
  );
};

// Desktop Navigation Component
export const DesktopNavigation: React.FC<
  NavigationProps & {
    isOpen: boolean;
    onClose: () => void;
  }
> = ({ isOpen, onClose, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { hasOverdue: hasOverdueTasks, pendingTasks } = useTasks();
  const { hasOverdue: hasOverdueBills, upcomingBills } = useExpenses();

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      color: "from-violet-500 to-violet-600",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
      badge: pendingTasks.length,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: DollarSign,
      path: "/expenses",
      badge: upcomingBills.length,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
      path: "/chat",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      path: "/calendar",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge: unreadCount,
      color: "from-red-500 to-red-600",
    },
    {
      id: "household",
      label: "Members",
      icon: Users,
      path: "/household/members",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
      color: "from-gray-500 to-gray-600",
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 h-full w-80 z-30 hidden lg:block transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full p-6 pt-24">
          <div className="glass-card-strong h-full p-6 rounded-glass-xl">
            {/* Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full p-4 rounded-glass text-left transition-all duration-200 ${
                      isActive
                        ? `glass-button text-white bg-gradient-to-r ${item.color || "from-primary to-primary-bright"}`
                        : "glass-input hover:glass-button hover:text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>

                      {item.badge && item.badge > 0 && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">{item.badge > 9 ? "9+" : item.badge}</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />}
    </>
  );
};
