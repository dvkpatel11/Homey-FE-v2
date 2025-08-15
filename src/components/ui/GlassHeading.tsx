import { forwardRef } from "react";
import type { GlassHeadingProps } from "./types";

const GlassHeading = forwardRef<HTMLHeadingElement, GlassHeadingProps>(
  ({ level = 1, children, className = "", ...props }, ref) => {
    const Component = `h${level}` as const;
    const sizes = {
      1: "text-3xl font-light",
      2: "text-2xl font-light",
      3: "text-xl font-light",
      4: "text-lg font-medium",
      5: "text-base font-medium",
      6: "text-sm font-medium",
    };

    return (
      <Component ref={ref as any} className={`text-glass ${sizes[level]} ${className}`} {...props}>
        {children}
      </Component>
    );
  }
);

GlassHeading.displayName = "GlassHeading";
export default GlassHeading;
