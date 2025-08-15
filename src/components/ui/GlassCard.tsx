import { forwardRef } from "react";
import type { GlassCardProps } from "./types";

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = "", hover = true, variant = "default", ...props }, ref) => {
    const variants = {
      default: "glass-card",
      subtle: "glass-card-subtle",
      strong: "glass-card-strong",
      violet: "glass-card-violet",
    };

    const hoverClass = hover ? "glass-card-hover" : "";

    return (
      <div ref={ref} className={`${variants[variant]} ${hoverClass} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;
