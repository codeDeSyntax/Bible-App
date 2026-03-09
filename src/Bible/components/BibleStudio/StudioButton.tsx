import React from "react";

interface StudioButtonProps {
  isActive?: boolean;
  isDarkMode?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const StudioButton: React.FC<StudioButtonProps> = ({
  isActive = false,
  onClick,
  children,
  className = "",
  disabled = false,
}) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`p-1.5 cursor-pointer rounded-md text-[11px] font-medium flex items-center justify-center transition-colors duration-150 border border-select-border ${
        isActive
          ? "bg-gradient-to-br from-btn-active-from to-btn-active-to text-white border-transparent"
          : "bg-studio-bg text-text-primary hover:bg-select-hover"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};
