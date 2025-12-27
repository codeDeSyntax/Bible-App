import React from "react";
import { RainPattern } from "./RainPattern";

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isDarkMode: boolean;
  icon?: React.ReactNode;
  transparent?: boolean;
  blackBackground?: boolean;
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
  blackBackground = false,
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
              border: `1px solid var(--select-border)`,
              fontFamily: "garamond",
            }
          : {
              background:
                blackBackground && isDarkMode
                  ? "#000000"
                  : `linear-gradient(145deg, var(--card-bg), var(--card-bg-alt))`,
              backgroundImage:
                blackBackground && isDarkMode
                  ? "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255, 255, 255, 0.015) 20px, rgba(255, 255, 255, 0.015) 21px), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255, 255, 255, 0.015) 20px, rgba(255, 255, 255, 0.015) 21px)"
                  : isDarkMode
                  ? "linear-gradient(145deg, var(--card-bg), var(--card-bg-alt)), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255, 255, 255, 0.015) 20px, rgba(255, 255, 255, 0.015) 21px), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255, 255, 255, 0.015) 20px, rgba(255, 255, 255, 0.015) 21px)"
                  : "linear-gradient(145deg, var(--card-bg), var(--card-bg-alt)), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0, 0, 0, 0.02) 20px, rgba(0, 0, 0, 0.02) 21px), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 0, 0, 0.02) 20px, rgba(0, 0, 0, 0.02) 21px)",
              boxShadow:
                blackBackground && isDarkMode
                  ? "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.02), 0 4px 8px rgba(0,0,0,0.2)"
                  : isDarkMode
                  ? "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.03), 0 4px 8px rgba(0,0,0,0.15)"
                  : "inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.05)",
              border: `1px solid var(--select-border)`,
            }
      }
    >
      {/* Animated Slant Rain Pattern Background */}
      {!transparent && <RainPattern isDarkMode={isDarkMode} />}

      {title && (
        <div className="flex items-center gap-2 mb-2 flex-shrink-0 relative z-10">
          {icon && (
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md"
              style={{
                background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
              }}
            >
              {icon}
            </div>
          )}
          <h3 className="text-[0.9rem] font-semibold text-text-primary">
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
