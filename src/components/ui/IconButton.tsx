import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { IconButtonProps } from "./types";

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = "md", variant = "ghost", className = "", ...props }, ref) => {
    const sizes = {
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
      xl: "p-5",
    };

    // FIXED: Use proper CSS classes and theme-aware colors
    const variants = {
      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass",
      primary: "glass-button",
      danger: "hover:bg-red-500/20 text-red-400 hover:text-red-400",
    };

    return (
      <motion.button
        ref={ref}
        className={`
          rounded-glass transition-all duration-300 flex items-center justify-center
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <Icon className="w-4 h-4" />
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";
export default IconButton;
