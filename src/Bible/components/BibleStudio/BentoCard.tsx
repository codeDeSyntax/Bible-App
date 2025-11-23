import React from "react";
import { RainPattern } from "./RainPattern";

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isDarkMode: boolean;
  icon?: React.ReactNode;
  transparent?: boolean;
}

/**
 * Reusable Bento Grid Card Component
 * Consistent styling across all Bible Studio cards
 */
export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  children,
  className = "",
  isDarkMode,
  icon,
  transparent = false,
}) => {
  return (
    <div
      className={`rounded-xl p-3 border flex flex-col overflow-hidden relative ${className} ${
        transparent ? "" : "backdrop-blur-sm"
      }`}
      style={
        transparent
          ? {
              background: "transparent",
              backgroundImage: "none",
              boxShadow: "none",
              border: `1px solid ${isDarkMode ? "#444" : "#ccc"}`,
            }
          : {
              background: isDarkMode
                ? "linear-gradient(145deg, #2c2c2c, #1a1a1a)"
                : "linear-gradient(145deg, #f5f5f5, #ffffff)",
              backgroundImage: isDarkMode
                ? "linear-gradient(145deg, #2c2c2c, #1a1a1a), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255, 255, 255, 0.015) 20px, rgba(255, 255, 255, 0.015) 21px), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255, 255, 255, 0.015) 20px, rgba(255, 255, 255, 0.015) 21px)"
                : "linear-gradient(145deg, #f5f5f5, #ffffff), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0, 0, 0, 0.02) 20px, rgba(0, 0, 0, 0.02) 21px), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 0, 0, 0.02) 20px, rgba(0, 0, 0, 0.02) 21px)",
              boxShadow: isDarkMode
                ? "inset 2px 2px 4px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(255,255,255,0.05), 0 8px 16px rgba(0,0,0,0.4)"
                : "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8), 0 8px 16px rgba(236, 236, 236, 0.1)",
              border: `1px solid ${isDarkMode ? "#444" : "#ccc"}`,
            }
      }
    >
      {/* Animated Slant Rain Pattern Background */}
      {!transparent && <RainPattern isDarkMode={isDarkMode} />}

      {title && (
        <div className="flex items-center gap-2 mb-2 flex-shrink-0 relative z-10">
          {icon && (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#252525] to-[#1a1a1a] flex items-center justify-center shadow-md">
              {icon}
            </div>
          )}
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-auto no-scrollbar relative z-10">
        {children}
      </div>
    </div>
  );
};
