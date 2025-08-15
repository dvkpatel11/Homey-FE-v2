import { forwardRef } from "react";
import GlassHeading from "./GlassHeading";
import GlassText from "./GlassText";
import type { GlassSectionProps } from "./types";

const GlassSection = forwardRef<HTMLDivElement, GlassSectionProps>(
  ({ children, title, subtitle, action, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`space-y-4 ${className}`} {...props}>
        {(title || subtitle || action) && (
          <div className="flex items-center justify-between">
            <div>
              {title && <GlassHeading level={3}>{title}</GlassHeading>}
              {subtitle && (
                <GlassText variant="secondary" className="mt-1">
                  {subtitle}
                </GlassText>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

GlassSection.displayName = "GlassSection";
export default GlassSection;
