// src/components/layout/Header.tsx - Updated with context integration
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, Home, LogOut, Menu, Moon, Plus, Search, Settings, Sun, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as UI from "../ui";

interface HeaderProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, showSidebarToggle = false }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { currentHousehold, households, selectHousehold, generateInviteCode } = useHousehold();
  const { unreadCount, notifications } = useNotifications();

  const [showHouseholdMenu, setShowHouseholdMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleHouseholdSwitch = async (householdId: string) => {
    await selectHousehold(householdId);
    setShowHouseholdMenu(false);
  };

  const handleCreateHousehold = () => {
    navigate("/household/create");
    setShowHouseholdMenu(false);
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleInvite = async () => {
    if (currentHousehold) {
      const invite = await generateInviteCode(currentHousehold.id);
      if (invite) {
        // Copy invite link to clipboard
        navigator.clipboard.writeText(invite.invite_link);
        // toast.success("Invite link copied to clipboard!");
      }
    }
    setShowHouseholdMenu(false);
  };

  return (
    <>
      {/* Main Header */}
      <motion.header
        className="glass-card glass-card-violet mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-glass-xl p-4 sm:p-6 
                   flex justify-between items-center sticky top-4 sm:top-6 z-40 safe-area-top"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          {/* Sidebar Toggle (Desktop) */}
          {showSidebarToggle && (
            <UI.IconButton icon={Menu} variant="ghost" size="md" onClick={onToggleSidebar} className="hidden lg:flex" />
          )}

          {/* Brand Logo */}
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark 
                       rounded-glass-lg flex items-center justify-center shadow-glass-violet flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            role="button"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>

          {/* Brand + Household */}
          <div className="min-w-0 flex-1">
            <UI.GlassHeading level={2} className="text-xl sm:text-2xl font-light tracking-wide truncate">
              Homey
            </UI.GlassHeading>

            {currentHousehold && (
              <button
                onClick={() => setShowHouseholdMenu(!showHouseholdMenu)}
                className="flex items-center space-x-1 text-glass-secondary hover:text-glass 
                           transition-colors group"
              >
                <span className="text-sm truncate max-w-32 sm:max-w-48">{currentHousehold.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showHouseholdMenu ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Search */}
          <UI.IconButton
            icon={Search}
            variant="ghost"
            size="md"
            className="hidden sm:flex"
            onClick={() => navigate("/search")}
          />

          {/* Notifications */}
          <motion.div className="relative">
            <UI.IconButton
              icon={Bell}
              variant="ghost"
              size="md"
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {unreadCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full 
                           flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <span className="text-xs text-white font-medium">{unreadCount > 9 ? "9+" : unreadCount}</span>
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
          <UI.IconButton
            icon={Settings}
            variant="ghost"
            size="md"
            className="hidden sm:flex"
            onClick={() => navigate("/settings")}
          />

          {/* User Menu */}
          {user ? (
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 glass-input rounded-glass 
                         hover:glass-button transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-8 h-8 bg-gradient-to-br from-primary to-primary-bright 
                              rounded-full flex items-center justify-center text-white text-sm font-medium"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full" />
                ) : (
                  user.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden sm:block text-glass text-sm truncate max-w-20">
                {user.full_name.split(" ")[0]}
              </span>
            </motion.button>
          ) : (
            <UI.GlassButton variant="primary" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </UI.GlassButton>
          )}
        </div>
      </motion.header>

      {/* Household Switcher Dropdown */}
      <AnimatePresence>
        {showHouseholdMenu && (
          <motion.div
            className="absolute top-20 sm:top-24 left-4 sm:left-6 right-4 sm:right-auto sm:w-80 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <UI.GlassCard variant="strong" className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <UI.GlassText className="font-medium">Switch Household</UI.GlassText>
                <div className="flex space-x-2">
                  <UI.IconButton icon={Plus} variant="ghost" size="sm" onClick={handleCreateHousehold} />
                  {currentHousehold?.role === "admin" && (
                    <UI.IconButton icon={Users} variant="ghost" size="sm" onClick={handleInvite} />
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {households.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleHouseholdSwitch(h.id)}
                    className={`w-full p-3 rounded-glass text-left transition-all duration-200 ${
                      currentHousehold?.id === h.id
                        ? "glass-button text-white"
                        : "glass-input hover:glass-button hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{h.name}</div>
                        <div className="text-xs opacity-75">
                          {h.member_count} member{h.member_count !== 1 ? "s" : ""} • {h.role}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </UI.GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="absolute top-20 sm:top-24 right-4 sm:right-6 w-80 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <UI.GlassCard variant="strong" className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <UI.GlassText className="font-medium">Notifications</UI.GlassText>
                <UI.GlassButton variant="ghost" size="sm" onClick={() => navigate("/notifications")}>
                  View All
                </UI.GlassButton>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-glass transition-all duration-200 ${
                      notification.read_at ? "glass-input opacity-75" : "glass-input border-blue-400/30"
                    }`}
                  >
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-xs text-glass-secondary mt-1">{notification.message}</div>
                    <div className="text-xs text-glass-muted mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-4">
                    <Bell className="w-8 h-8 text-glass-muted mx-auto mb-2" />
                    <UI.GlassText variant="secondary">No notifications</UI.GlassText>
                  </div>
                )}
              </div>
            </UI.GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Menu Dropdown */}
      <AnimatePresence>
        {showUserMenu && user && (
          <motion.div
            className="absolute top-20 sm:top-24 right-4 sm:right-6 w-64 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <UI.GlassCard variant="strong" className="p-4 space-y-3">
              <div className="flex items-center space-x-3 pb-3 border-b border-glass-border">
                <div
                  className="w-10 h-10 bg-gradient-to-br from-primary to-primary-bright 
                                rounded-full flex items-center justify-center text-white font-medium"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full" />
                  ) : (
                    user.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <UI.GlassText className="font-medium truncate">{user.full_name}</UI.GlassText>
                  {user.email && (
                    <UI.GlassText variant="muted" className="text-xs truncate">
                      {user.email}
                    </UI.GlassText>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowUserMenu(false);
                  }}
                  className="w-full p-3 rounded-glass text-left glass-input hover:glass-button hover:text-white transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Profile & Settings</span>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full p-3 rounded-glass text-left glass-input hover:bg-red-500/20 
                             hover:border-red-500/30 hover:text-red-400 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </div>
                </button>
              </div>
            </UI.GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdowns */}
      {(showHouseholdMenu || showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowHouseholdMenu(false);
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </>
  );
};
