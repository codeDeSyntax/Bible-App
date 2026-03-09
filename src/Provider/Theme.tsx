// contexts/ThemeContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature } from "@/store/slices/bibleSlice";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleActiveFeature: (feature: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  toggleActiveFeature: () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Always use bible theme since app now always starts on bible screen
    const storedPreference = localStorage.getItem("bibleDarkMode");
    const isDark = storedPreference ? storedPreference === "true" : true;
    return isDark;
  });
  const dispatch = useAppDispatch();

  // Handle theme persistence
  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Store user preference
    localStorage.setItem("bibleDarkMode", String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleActiveFeature = (feature: string | null) => {
    dispatch(setActiveFeature(feature));
  };

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleDarkMode, toggleActiveFeature }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
