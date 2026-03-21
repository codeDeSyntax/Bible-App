// components/ThemeToggle.tsx

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleDarkMode, selectIsDarkMode } from "@/store/themeSlice";
import { DepthButton } from "@/shared/DepthElement";

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectIsDarkMode);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <DepthButton
      onClick={handleToggle}
      sizeClassName="w-6 h-6 rounded-full"
      inactiveClassName="text-text-primary border-select-border hover:text-text-primary"
      activeClassName="text-text-primary border-btn-active-from"
      active={isDarkMode}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun
          className="w-4 h-4 text-text-primary group-hover:text-text-primary transition-colors"
          strokeWidth={2}
        />
      ) : (
        <Moon
          className="w-4 h-4 text-text-primary group-hover:text-text-primary transition-colors"
          strokeWidth={2}
        />
      )}
    </DepthButton>
  );
};
