// contexts/ThemeContext.tsx

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature } from "@/store/slices/bibleSlice";
import {
  selectIsDarkMode,
  toggleDarkMode as toggleDarkModeAction,
  initializeTheme,
} from "@/store/themeSlice";

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
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectIsDarkMode);

  // Ensure the theme classes are applied consistently from Redux state
  useEffect(() => {
    // initialize theme classes on mount (applies theme and dark class)
    dispatch(initializeTheme());
    // remove legacy key if present to avoid conflicting toggles
    try {
      if (localStorage.getItem("bibleDarkMode") !== null) {
        localStorage.removeItem("bibleDarkMode");
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDarkMode = () => {
    dispatch(toggleDarkModeAction());
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
