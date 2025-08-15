import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { forwardRef } from "react";
import type { FloatingActionButtonProps } from "./types";

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ onClick, icon: Icon = Plus, className = "", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className={`
          fixed bottom-24 sm:bottom-32 right-4 sm:right-6 z-30
          w-14 h-14 sm:w-16 sm:h-16
          bg-primary-dark
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
          delay: 0.5,
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
