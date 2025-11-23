import React from "react";
import { motion } from "framer-motion";

interface StudioButtonProps {
  isActive?: boolean;
  isDarkMode: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable styled button component matching FloatingActionBar design
 * Extracted from FloatingActionBar for consistency across Bible Studio
 */
export const StudioButton: React.FC<StudioButtonProps> = ({
  isActive = false,
  isDarkMode,
  onClick,
  children,
  className = "",
  disabled = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      style={{
        background: isActive
          ? isDarkMode
            ? "linear-gradient(145deg, #6a6865, #5a5856)" // Selected: deeper golden gradient
            : "linear-gradient(145deg, #989898, #d5d4d3)"
          : isDarkMode
          ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)" // Normal: deeper game button style
          : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
        boxShadow: isActive
          ? "inset 1px 1px 3px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(255,255,255,0.15), 0 3px 6px rgba(0,0,0,0.3)"
          : isDarkMode
          ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
          : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
        border: `1px solid ${
          isActive ? "#a0a0a0" : isDarkMode ? "#444" : "#ccc"
        }`,
        color: isActive ? "#ffffff" : isDarkMode ? "#e5e7eb" : "#374151",
        fontWeight: isActive ? "600" : "normal",
      }}
      className={`p-2 cursor-pointer rounded-md text-[12px] flex items-center justify-center hover:ring-1 hover:ring-primary/70 dark:hover:ring-white transition-all duration-150 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </motion.div>
  );
};
