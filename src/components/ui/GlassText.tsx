import { forwardRef } from "react";
import type { GlassTextProps } from "./types";

const GlassText = forwardRef<HTMLParagraphElement, GlassTextProps>(
  ({ variant = "default", children, className = "", ...props }, ref) => {
    const variants = {
      default: "text-glass",
      secondary: "text-glass-secondary",
      muted: "text-glass-muted",
    };

    return (
      <p ref={ref} className={`${variants[variant]} ${className}`} {...props}>
        {children}
      </p>
    );
  }
);

GlassText.displayName = "GlassText";
export default GlassText;
