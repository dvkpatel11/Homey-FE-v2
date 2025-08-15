import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Shield,
  Sun,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import * as UI from "./ui";

interface DashboardProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isDark, toggleTheme }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showHouseholdMenu, setShowHouseholdMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data for demonstration
  const mockData = {
    user: { name: "Alex Johnson", avatar: "AJ" },
    household: { name: "The Johnson Family", members: 4 },
    notifications: 3,
    tasks: { pending: 5, overdue: 2 },
    expenses: { pending: 3, total: 1247.5 },
    temperature: 72,
    energy: 85,
    security: "Armed",
  };

  // Navigation tabs with your existing structure
  const tabs = [
    {
      id: "dashboard",
      icon: Home,
      label: "Home",
      color: "from-primary to-primary-bright",
      count: 0,
    },
    {
      id: "tasks",
      icon: CheckSquare,
      label: "Tasks",
      color: "from-amber-500 to-orange-500",
      count: mockData.tasks.pending + mockData.tasks.overdue,
    },
    {
      id: "expenses",
      icon: DollarSign,
      label: "Bills",
      color: "from-emerald-500 to-emerald-600",
      count: mockData.expenses.pending,
    },
    {
      id: "announcements",
      icon: MessageSquare,
      label: "Chat",
      color: "from-blue-500 to-indigo-600",
      count: mockData.notifications,
    },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden safe-area-inset"
      style={{ backgroundColor: "var(--homey-bg)" }}
    >
      {/* Header - Adapted from your existing Header.jsx */}
      <motion.div
        className="glass-card glass-card-violet mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-glass-xl p-4 sm:p-6 
                   flex justify-between items-center sticky top-4 sm:top-6 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side - Brand + Household */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          {/* Homey Logo */}
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark 
                       rounded-glass-lg flex items-center justify-center shadow-glass-violet flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>

          {/* Brand + Household Name */}
          <div className="min-w-0 flex-1">
            <UI.GlassHeading level={2} className="text-xl sm:text-2xl font-light tracking-wide truncate">
              Homey
            </UI.GlassHeading>
            <button
              onClick={() => setShowHouseholdMenu(!showHouseholdMenu)}
              className="flex items-center space-x-1 text-glass-secondary hover:text-glass 
                         transition-colors group"
            >
              <span className="text-sm truncate max-w-32 sm:max-w-48">{mockData.household.name}</span>
            </button>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Notifications */}
          <motion.div className="relative">
            <UI.IconButton
              icon={Bell}
              variant="ghost"
              size="md"
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {mockData.notifications > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full 
                           flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <span className="text-xs text-white font-medium">
                  {mockData.notifications > 9 ? "9+" : mockData.notifications}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Theme Toggle */}
          <UI.IconButton
            icon={isDark ? Sun : Moon}
            variant="ghost"
            size="md"
            onClick={toggleTheme}
            className={isDark ? "text-amber-400" : "text-glass-secondary"}
          />

          {/* Settings */}
          <UI.IconButton icon={Settings} variant="ghost" size="md" />

          {/* Logout */}
          <UI.IconButton icon={LogOut} variant="danger" size="md" />
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="relative z-10 p-4 sm:p-6 pb-24 sm:pb-28 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <UI.GlassHeading level={1} className="text-2xl sm:text-3xl mb-2">
            Good morning, {mockData.user.name.split(" ")[0]}! 👋
          </UI.GlassHeading>
          <UI.GlassText variant="secondary">Here's what's happening in your home today</UI.GlassText>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Temperature */}
          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="w-5 h-5 text-blue-400" />
              <UI.GlassText variant="muted" className="text-xs">
                °F
              </UI.GlassText>
            </div>
            <UI.GlassHeading level={3} className="text-xl mb-1">
              {mockData.temperature}°
            </UI.GlassHeading>
            <UI.GlassText variant="muted" className="text-xs">
              Temperature
            </UI.GlassText>
          </UI.GlassCard>

          {/* Energy */}
          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <UI.GlassText variant="muted" className="text-xs">
                %
              </UI.GlassText>
            </div>
            <UI.GlassHeading level={3} className="text-xl mb-1">
              {mockData.energy}%
            </UI.GlassHeading>
            <UI.GlassText variant="muted" className="text-xs">
              Energy Saved
            </UI.GlassText>
          </UI.GlassCard>

          {/* Security */}
          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <UI.GlassHeading level={3} className="text-sm mb-1">
              {mockData.security}
            </UI.GlassHeading>
            <UI.GlassText variant="muted" className="text-xs">
              Security
            </UI.GlassText>
          </UI.GlassCard>

          {/* WiFi */}
          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="w-5 h-5 text-purple-400" />
              <UI.GlassText variant="muted" className="text-xs">
                Mbps
              </UI.GlassText>
            </div>
            <UI.GlassHeading level={3} className="text-xl mb-1">
              123
            </UI.GlassHeading>
            <UI.GlassText variant="muted" className="text-xs">
              Internet
            </UI.GlassText>
          </UI.GlassCard>
        </motion.div>

        {/* Today's Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <UI.GlassSection title="Today's Overview" className="mb-4">
            <UI.GlassContainer padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tasks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <UI.GlassText className="font-medium">Tasks</UI.GlassText>
                    <UI.GlassButton variant="ghost" size="sm">
                      <Plus className="w-4 h-4" />
                    </UI.GlassButton>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 glass-input rounded-glass">
                      <UI.GlassText className="text-sm">Take out trash</UI.GlassText>
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 glass-input rounded-glass">
                      <UI.GlassText className="text-sm">Grocery shopping</UI.GlassText>
                      <Clock className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Bills */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <UI.GlassText className="font-medium">Bills</UI.GlassText>
                    <UI.GlassText variant="muted" className="text-sm">
                      ${mockData.expenses.total}
                    </UI.GlassText>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 glass-input rounded-glass">
                      <UI.GlassText className="text-sm">Electricity</UI.GlassText>
                      <UI.GlassText className="text-sm">$127.50</UI.GlassText>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-input rounded-glass">
                      <UI.GlassText className="text-sm">Internet</UI.GlassText>
                      <UI.GlassText className="text-sm">$89.99</UI.GlassText>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <UI.GlassText className="font-medium">Recent Activity</UI.GlassText>
                  <div className="space-y-2">
                    <div className="p-3 glass-input rounded-glass">
                      <UI.GlassText className="text-sm mb-1">Sarah completed "Dishes"</UI.GlassText>
                      <UI.GlassText variant="muted" className="text-xs">
                        2 hours ago
                      </UI.GlassText>
                    </div>
                    <div className="p-3 glass-input rounded-glass">
                      <UI.GlassText className="text-sm mb-1">Mike added grocery expense</UI.GlassText>
                      <UI.GlassText variant="muted" className="text-xs">
                        4 hours ago
                      </UI.GlassText>
                    </div>
                  </div>
                </div>
              </div>
            </UI.GlassContainer>
          </UI.GlassSection>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <UI.GlassSection title="Quick Actions" subtitle="Manage your home efficiently">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <UI.GlassButton variant="primary" className="p-4 flex-col h-auto">
                <Plus className="w-6 h-6 mb-2" />
                <span className="text-sm">Add Task</span>
              </UI.GlassButton>

              <UI.GlassButton variant="success" className="p-4 flex-col h-auto">
                <DollarSign className="w-6 h-6 mb-2" />
                <span className="text-sm">Add Bill</span>
              </UI.GlassButton>

              <UI.GlassButton variant="ghost" className="p-4 flex-col h-auto">
                <MessageSquare className="w-6 h-6 mb-2" />
                <span className="text-sm">Send Message</span>
              </UI.GlassButton>

              <UI.GlassButton variant="secondary" className="p-4 flex-col h-auto">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">Schedule</span>
              </UI.GlassButton>
            </div>
          </UI.GlassSection>
        </motion.div>
      </main>

      {/* Bottom Navigation - Adapted from your existing Navigation.jsx */}
      <motion.div
        className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 
                   glass-card glass-card-violet rounded-glass-xl p-3 sm:p-4 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex justify-around items-center">
          {tabs.map((tab, index) => {
            const isActive = currentPage === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`
                  relative flex flex-col items-center space-y-1 sm:space-y-2 
                  p-2 sm:p-3 rounded-glass transition-all duration-300
                  ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-glass-lg`
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
                  {tab.count > 0 && !isActive && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 
                                 bg-red-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <span className="text-xs text-white font-medium">{tab.count > 9 ? "9+" : tab.count}</span>
                    </motion.div>
                  )}
                </div>

                {/* Label */}
                <span className="text-xs font-medium hidden xs:block">{tab.label}</span>

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
      </motion.div>

      {/* Overlay to close dropdowns */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false);
          }}
        />
      )}

      {/* Floating Action Button */}
      <UI.FloatingActionButton icon={Plus} onClick={() => console.log("FAB clicked!")} />
    </div>
  );
};

export default Dashboard;
