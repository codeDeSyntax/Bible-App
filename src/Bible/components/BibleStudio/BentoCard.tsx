import React from "react";

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  transparent?: boolean;
  blackBackground?: boolean;
  iconWithoutBg?: boolean;
}

/**
 * Reusable Bento Grid Card Component
 * Clean, standard surface matching the rest of the application.
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
  iconWithoutBg = false,
}) => {
  const bgClass = transparent
    ? "bg-transparent"
    : blackBackground && isDarkMode
      ? "bg-black/90 shadow-sm"
      : "bg-card-bg shadow-sm";

  return (
    <div
      className={`w-full h-full p-2.5 flex flex-col overflow-hidden relative ${bgClass} ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          {icon && (
            iconWithoutBg ? (
              <div className="flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            ) : (
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shadow-xs flex-shrink-0"
                style={{
                  background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
                }}
              >
                {icon}
              </div>
            )
          )}
          <p className="text-[0.9rem] font-semibold text-text-primary flex-1 truncate">
            {title}
          </p>
          {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto no-scrollbar">{children}</div>
    </div>
  );
};
