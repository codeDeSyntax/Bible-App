import React from "react";
import { SunMoon } from "lucide-react";
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
      className="w-6 h-6 p-0 rounded-md flex items-center justify-center !bg-transparent text-text-secondary hover:text-text-primary hover:!bg-black/5 dark:hover:!bg-white/10 transition-colors cursor-pointer"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <SunMoon className="w-5 h-5" strokeWidth={2.4} />
    </button>
  );
};
