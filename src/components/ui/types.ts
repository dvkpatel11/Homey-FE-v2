import { HTMLMotionProps } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// Base props that many components share
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Button variant types
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

// Glass component variants
export type GlassVariant = "default" | "subtle" | "strong" | "violet";
export type TextVariant = "default" | "secondary" | "muted";
export type PaddingSize = "none" | "sm" | "md" | "lg" | "xl";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Component-specific prop interfaces
export interface FloatingActionButtonProps extends HTMLMotionProps<"button"> {
  icon?: LucideIcon;
  color?: string;
}

export interface GlassButtonProps extends HTMLMotionProps<"button"> {
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

export interface GlassContainerProps extends HTMLMotionProps<"div"> {
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
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
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

export interface IconButtonProps extends HTMLMotionProps<"button"> {
  icon: LucideIcon;
  size?: ButtonSize;
  variant?: "ghost" | "primary" | "danger";
}
