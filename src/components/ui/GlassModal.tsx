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
                    <GlassHeading level={3} className="pr-8 !text-white" style={{ color: "var(--homey-primary)" }}>
                      {title}
                    </GlassHeading>
                  )}
                </div>
                {showCloseButton && (
                  <IconButton
                    icon={X}
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="flex-shrink-0 !text-white hover:!bg-white/10"
                  />
                )}
              </div>
            )}

            {/* Content with forced white text */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div
                className="modal-content"
                style={{
                  color: "white",
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

export default GlassModal;
