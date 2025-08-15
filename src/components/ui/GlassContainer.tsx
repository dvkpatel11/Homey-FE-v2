import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { GlassContainerProps } from "./types";

const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ children, variant = "default", padding = "md", className = "", ...props }, ref) => {
    const variants = {
      default: "glass-card",
      subtle: "glass-card glass-card-subtle",
      strong: "glass-card glass-card-strong",
      violet: "glass-card glass-card-violet",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };

    return (
      <motion.div
        ref={ref}
        className={`${variants[variant]} ${paddings[padding]} rounded-glass ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassContainer.displayName = "GlassContainer";
export default GlassContainer;
