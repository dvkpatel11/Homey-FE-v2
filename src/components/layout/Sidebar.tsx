// ==========================================
// Sidebar.tsx - Production Ready
// ==========================================
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";
import * as UI from "../ui";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
    badge?: number;
    color?: string;
  }>;
  currentPath: string;
  onNavigate: (path: string) => void;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  navigationItems,
  currentPath,
  onNavigate,
  user,
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 h-full w-80 z-30 hidden lg:block transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full p-6">
          <UI.GlassCard variant="strong" className="h-full p-6">
            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3 pb-6 border-b border-glass-border mb-6">
                <div
                  className="w-12 h-12 bg-gradient-to-br from-primary to-primary-bright 
                                rounded-full flex items-center justify-center text-white font-medium text-lg"
                >
                  {user.avatar || user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <UI.GlassText className="font-medium truncate">{user.name}</UI.GlassText>
                  {user.role && (
                    <UI.GlassText variant="muted" className="text-sm">
                      {user.role}
                    </UI.GlassText>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.path;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.path)}
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
          </UI.GlassCard>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Sidebar Panel */}
            <motion.aside
              className="fixed left-0 top-0 h-full w-80 z-50 lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="h-full p-6">
                <UI.GlassCard variant="strong" className="h-full p-6">
                  {/* Close Button */}
                  <div className="flex justify-end mb-6">
                    <UI.IconButton icon={X} variant="ghost" size="md" onClick={onClose} />
                  </div>

                  {/* User Profile */}
                  {user && (
                    <div className="flex items-center space-x-3 pb-6 border-b border-glass-border mb-6">
                      <div
                        className="w-12 h-12 bg-gradient-to-br from-primary to-primary-bright 
                                      rounded-full flex items-center justify-center text-white font-medium text-lg"
                      >
                        {user.avatar || user.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <UI.GlassText className="font-medium truncate">{user.name}</UI.GlassText>
                        {user.role && (
                          <UI.GlassText variant="muted" className="text-sm">
                            {user.role}
                          </UI.GlassText>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const isActive = currentPath === item.path;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.path);
                            onClose();
                          }}
                          className={`w-full p-4 rounded-glass text-left transition-all duration-200 ${
                            isActive
                              ? `glass-button text-white bg-gradient-to-r ${item.color || "from-primary to-primary-bright"}`
                              : "glass-input hover:glass-button hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{item.label}</span>
                            </div>

                            {item.badge && item.badge > 0 && (
                              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  {item.badge > 9 ? "9+" : item.badge}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </UI.GlassCard>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
