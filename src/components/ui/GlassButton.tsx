import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { GlassButtonProps } from "./types";

const GlassButton = forwardRef<any, GlassButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon: Icon,
      rightIcon: RightIcon,
      loading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const variants: any = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      success: "btn-success",
      ghost: "glass-button",
      danger: "btn-danger",
      warning: "btn-secondary",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-4 text-base",
      xl: "px-8 py-5 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 rounded-glass font-medium
          transition-all duration-300 relative overflow-hidden
          ${variants[variant]} ${sizes[size]}
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
          ${className}
        `}
        disabled={disabled || loading}
        whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className={`flex items-center gap-2 ${loading ? "opacity-0" : ""}`}>
          {Icon && <Icon className="w-4 h-4" />}
          <span>{children as React.ReactNode}</span>
          {RightIcon && <RightIcon className="w-4 h-4" />}
        </div>
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";
export default GlassButton;
