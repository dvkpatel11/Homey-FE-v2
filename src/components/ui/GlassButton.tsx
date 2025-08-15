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
      primary: "bg-violet-600 text-white border-violet-600 hover:bg-violet-600/70 hover:border-violet-600/70",
      secondary: "bg-red-500/80 text-white border-red-500/80 hover:bg-red-500/50 hover:border-red-500/50",
      success: "bg-emerald-500/80 text-white border-emerald-500/80 hover:bg-emerald-500/50 hover:border-emerald-500/50",
      ghost: "bg-white/10 text-white border-white/20 hover:bg-white/5 hover:border-white/10",
      danger: "bg-red-500/80 text-white border-red-500/80 hover:bg-red-500/50 hover:border-red-500/50",
      warning: "bg-yellow-500/80 text-white border-yellow-500/80 hover:bg-yellow-500/50 hover:border-yellow-500/50",
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
          inline-flex items-center justify-center space-x-2 rounded-glass font-medium
          transition-all duration-300 relative overflow-hidden border
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

        <div className={`flex items-center space-x-2 ${loading ? "opacity-0" : ""}`}>
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
