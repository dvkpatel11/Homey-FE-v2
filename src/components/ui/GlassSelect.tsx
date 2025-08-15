import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { forwardRef } from "react";
import type { GlassSelectProps } from "./types";

const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  (
    {
      label,
      placeholder = "Select an option",
      options = [],
      error,
      className = "",
      containerClassName = "",
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-glass-secondary">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={`
              glass-input w-full px-4 py-3 pr-10 rounded-glass appearance-none
              ${error ? "border-red-400/50 focus:border-red-400" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className}
            `}
            disabled={disabled}
            style={{
              colorScheme: document.documentElement.classList.contains("dark") ? "dark" : "light",
            }}
            {...props}
          >
            <option
              value=""
              style={{
                backgroundColor: "var(--homey-bg)",
                color: "var(--homey-text)",
              }}
            >
              {placeholder}
            </option>
            {options.map((option, index) => (
              <option
                key={index}
                value={option.value}
                style={{
                  backgroundColor: "var(--homey-bg)",
                  color: "var(--homey-text)",
                }}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 glass-select-arrow" />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs flex items-center gap-1 text-red-400"
          >
            <X className="w-3 h-3" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }
);

GlassSelect.displayName = "GlassSelect";
export default GlassSelect;
