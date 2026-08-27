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
    <button
      onClick={handleToggle}
      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer ${
        isDarkMode
          ? "bg-select-bg hover:bg-select-hover border-select-border text-text-primary"
          : "bg-select-bg hover:bg-select-hover border-select-border text-text-primary"
      }`}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun className="w-3.5 h-3.5 text-text-primary" strokeWidth={2} />
      ) : (
        <Moon className="w-3.5 h-3.5 text-text-primary" strokeWidth={2} />
      )}
    </button>
  );
};
