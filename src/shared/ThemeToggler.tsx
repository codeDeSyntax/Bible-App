// components/ThemeToggle.tsx

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleDarkMode, selectIsDarkMode } from "@/store/themeSlice";

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectIsDarkMode);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div
      onClick={handleToggle}
      className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
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
    </div>
  );
};
