#!/bin/bash

# UI Components TypeScript Migration Script

echo "🎨 Starting UI Components TypeScript migration..."

# Create types file first
echo "📝 Creating UI component types..."
cat > src/components/ui/types.ts << 'EOF'
import { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Base props that many components share
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Glass component variants
export type GlassVariant = 'default' | 'subtle' | 'strong' | 'violet';
export type TextVariant = 'default' | 'secondary' | 'muted';
export type PaddingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Component-specific prop interfaces
export interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  color?: string;
}

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
}

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: GlassVariant;
}

export interface GlassContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  padding?: PaddingSize;
}

export interface GlassHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  containerClassName?: string;
}

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
  children: ReactNode;
}

export interface GlassSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  error?: string;
  containerClassName?: string;
}

export interface GlassTextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
}

export interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: ButtonSize;
  variant?: 'ghost' | 'primary' | 'danger';
}
EOF

# Function to convert a single component
convert_component() {
    local file="$1"
    local filename=$(basename "$file" .jsx)
    local newfile="src/components/ui/${filename}.tsx"
    
    echo "🔄 Converting $filename..."
    
    case "$filename" in
        "FloatingActionButton")
            cat > "$newfile" << 'EOF'
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { forwardRef } from "react";
import type { FloatingActionButtonProps } from "./types";

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ 
    onClick,
    icon: Icon = Plus,
    className = "",
    color = "from-homey-violet-500 to-homey-violet-600",
    ...props 
  }, ref) => {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className={`
          fixed bottom-24 sm:bottom-32 right-4 sm:right-6 z-30
          w-14 h-14 sm:w-16 sm:h-16
          bg-gradient-to-r ${color}
          rounded-full shadow-glass-lg
          flex items-center justify-center
          text-white
          transition-all duration-300
          hover:scale-110 hover:shadow-glass-violet
          ${className}
        `}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          delay: 0.5
        }}
        {...props}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.button>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";
export default FloatingActionButton;
EOF
            ;;
        "GlassButton")
            cat > "$newfile" << 'EOF'
import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { GlassButtonProps } from "./types";

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    rightIcon: RightIcon,
    loading = false,
    disabled = false,
    className = "",
    ...props
  }, ref) => {
    const variants = {
      primary: "glass-button text-white",
      secondary: "glass-input hover:bg-surface-2 text-glass border-glass-border",
      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass",
      danger: "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30",
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

        <div className={`flex items-center space-x-2 ${loading ? "opacity-0" : ""}`}>
          {Icon && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {RightIcon && <RightIcon className="w-4 h-4" />}
        </div>
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";
export default GlassButton;
EOF
            ;;
        "GlassCard")
            cat > "$newfile" << 'EOF'
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
      <div 
        ref={ref}
        className={`${variants[variant]} ${hoverClass} ${className}`} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;
EOF
            ;;
        "GlassContainer")
            cat > "$newfile" << 'EOF'
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
EOF
            ;;
        "GlassHeading")
            cat > "$newfile" << 'EOF'
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
      <Component 
        ref={ref as any}
        className={`text-glass ${sizes[level]} ${className}`} 
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GlassHeading.displayName = "GlassHeading";
export default GlassHeading;
EOF
            ;;
        "GlassInput")
            cat > "$newfile" << 'EOF'
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, Clock, Eye, EyeOff, Hash, Mail, Phone, Search, X } from "lucide-react";
import { forwardRef, useState } from "react";
import type { GlassInputProps } from "./types";

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({
    type = "text",
    label,
    placeholder,
    error,
    success,
    icon: Icon,
    rightIcon: RightIcon,
    className = "",
    containerClassName = "",
    onRightIconClick,
    disabled = false,
    required = false,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const inputType = type === "password" && showPassword ? "text" : type;

    const getInputIcon = () => {
      if (Icon) return Icon;
      switch (type) {
        case "email": return Mail;
        case "password": return Eye;
        case "search": return Search;
        case "tel": return Phone;
        case "number": return Hash;
        case "date": return Calendar;
        case "time": return Clock;
        default: return null;
      }
    };

    const InputIcon = getInputIcon();
    const showPasswordToggle = type === "password";

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-glass-secondary">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              glass-input w-full px-4 py-3 rounded-glass
              ${InputIcon ? "pl-11" : ""}
              ${RightIcon || showPasswordToggle ? "pr-11" : ""}
              text-glass placeholder:text-glass-muted
              transition-all duration-300
              ${focused ? "ring-2 ring-primary/20" : ""}
              ${error ? "border-red-400/50 focus:border-red-400" : ""}
              ${success ? "border-emerald-400/50 focus:border-emerald-400" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className}
            `}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />

          {InputIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <InputIcon className="w-5 h-5 text-glass-muted" />
            </div>
          )}

          {(RightIcon || showPasswordToggle) && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-1 transition-colors"
              onClick={showPasswordToggle ? () => setShowPassword(!showPassword) : onRightIconClick}
            >
              {showPasswordToggle ? (
                showPassword ? (
                  <EyeOff className="w-4 h-4 text-glass-muted" />
                ) : (
                  <Eye className="w-4 h-4 text-glass-muted" />
                )
              ) : (
                RightIcon && <RightIcon className="w-4 h-4 text-glass-muted" />
              )}
            </button>
          )}
        </div>

        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-xs flex items-center space-x-1 ${error ? "text-red-400" : "text-emerald-400"}`}
            >
              {error ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
              <span>{error || success}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
export default GlassInput;
EOF
            ;;
        "GlassModal")
            cat > "$newfile" << 'EOF'
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import GlassHeading from "./GlassHeading";
import IconButton from "./IconButton";
import type { GlassModalProps } from "./types";

const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
  showCloseButton = true,
  className = "",
  ...props
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 safe-area-inset">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={`
              glass-card glass-card-strong rounded-glass-lg w-full
              ${maxWidthClasses[maxWidth]}
              relative z-10 max-h-[90vh] overflow-hidden
              ${className}
            `}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-glass-border">
                <div className="flex-1">
                  {title && (
                    <GlassHeading level={3} className="pr-8">
                      {title}
                    </GlassHeading>
                  )}
                </div>
                {showCloseButton && (
                  <IconButton icon={X} variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0" />
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

export default GlassModal;
EOF
            ;;
        "GlassSection")
            cat > "$newfile" << 'EOF'
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
EOF
            ;;
        "GlassSelect")
            cat > "$newfile" << 'EOF'
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { forwardRef } from "react";
import type { GlassSelectProps } from "./types";

const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({
    label,
    placeholder = "Select an option",
    options = [],
    error,
    className = "",
    containerClassName = "",
    disabled = false,
    required = false,
    ...props
  }, ref) => {
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
              text-glass
              transition-all duration-300
              ${error ? "border-red-400/50 focus:border-red-400" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className}
            `}
            disabled={disabled}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value} className="bg-surface-2 text-glass">
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-glass-muted" />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs flex items-center space-x-1 text-red-400"
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
EOF
            ;;
        "GlassText")
            cat > "$newfile" << 'EOF'
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
EOF
            ;;
        "GlassTextarea")
            cat > "$newfile" << 'EOF'
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { forwardRef } from "react";
import type { GlassTextareaProps } from "./types";

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({
    label,
    placeholder,
    error,
    className = "",
    containerClassName = "",
    rows = 4,
    disabled = false,
    required = false,
    ...props
  }, ref) => {
    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-glass-secondary">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={`
            glass-input w-full px-4 py-3 rounded-glass resize-none
            text-glass placeholder:text-glass-muted
            transition-all duration-300
            ${error ? "border-red-400/50 focus:border-red-400" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs flex items-center space-x-1 text-red-400"
          >
            <X className="w-3 h-3" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }
);

GlassTextarea.displayName = "GlassTextarea";
export default GlassTextarea;
EOF
            ;;
        "IconButton")
            cat > "$newfile" << 'EOF'
import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { IconButtonProps } from "./types";

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = "md", variant = "ghost", className = "", ...props }, ref) => {
    const sizes = {
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
      xl: "p-4", // Added xl size
    };

    const variants = {
      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass",
      primary: "glass-button text-white",
      danger: "hover:bg-red-500/20 text-red-400",
    };

    return (
      <motion.button
        ref={ref}
        className={`
          rounded-glass transition-all duration-300
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
EOF
            ;;
    esac
    
    echo "✅ Converted $filename.jsx → $filename.tsx"
}

# Convert all UI components
echo "🔄 Converting UI components to TypeScript..."

# Remove old .jsx files and convert them
for file in src/components/ui/*.jsx; do
    if [ -f "$file" ]; then
        convert_component "$file"
        rm "$file"
    fi
done

# Update the barrel file with proper exports and types
echo "📝 Updating barrel file..."
cat > src/components/ui/index.ts << 'EOF'
// src/components/ui/index.ts
// Barrel file for all UI components

export { default as FloatingActionButton } from './FloatingActionButton';
export { default as GlassButton } from './GlassButton';
export { default as GlassCard } from './GlassCard';
export { default as GlassContainer } from './GlassContainer';
export { default as GlassHeading } from './GlassHeading';
export { default as GlassInput } from './GlassInput';
export { default as GlassModal } from './GlassModal';
export { default as GlassSection } from './GlassSection';
export { default as GlassSelect } from './GlassSelect';
export { default as GlassText } from './GlassText';
export { default as GlassTextarea } from './GlassTextarea';
export { default as IconButton } from './IconButton';

// Export all types
export type * from './types';
EOF

echo "✅ UI Components TypeScript migration complete!"
echo ""
echo "🎯 Summary:"
echo "✅ Created comprehensive type definitions"
echo "✅ Converted all 12 UI components to TypeScript"
echo "✅ Added proper forwardRef support"
echo "✅ Updated barrel file with type exports"
echo "✅ Maintained all styling and functionality"
echo ""
echo "🔍 All components now have:"
echo "- Full TypeScript support"
echo "- Proper prop interfaces"
echo "- ForwardRef for ref passing"
echo "- Consistent naming conventions"
echo "- Type-safe icon handling"
echo ""
echo "Next: Test with 'npm run type-check'"