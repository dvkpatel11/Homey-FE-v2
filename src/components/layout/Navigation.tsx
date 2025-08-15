// ==========================================
// Navigation.tsx - Production Ready

import { motion } from "framer-motion";

// ==========================================
interface NavigationProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
    badge?: number;
    color?: string;
  }>;
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ items, currentPath, onNavigate, className = "" }) => {
  return (
    <motion.nav
      className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 
                 glass-card glass-card-violet rounded-glass-xl p-3 sm:p-4 z-40 safe-area-bottom ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-around items-center">
        {items.map((item, index) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.path)}
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
