import React from "react";
import { DepthSurface } from "@/shared/DepthElement";

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  transparent?: boolean;
  blackBackground?: boolean;
}

/**
 * Reusable Bento Grid Card Component
 * Flat theme-color surface with border — no shadows or gradients.
 */
export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  children,
  className = "",
  isDarkMode,
  icon,
  headerRight,
  transparent = false,
  blackBackground = false,
}) => {
  const surfaceClassName = transparent
    ? "bg-transparent border border-transparent"
    : blackBackground && isDarkMode
      ? "bg-black border border-select-border"
      : "bg-gradient-to-br from-card-bg via-select-hover to-card-bg-alt border border-select-border";

  return (
    <DepthSurface
      surfaceClassName={surfaceClassName}
      className={`rounded-xl p-3  flex flex-col overflow-hidden relative ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          {icon && (
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
              }}
            >
              {icon}
            </div>
          )}
          <p className="text-[0.9rem] font-semibold text-text-primary flex-1">
            {title}
          </p>
          {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto no-scrollbar">{children}</div>
    </DepthSurface>
  );
};
