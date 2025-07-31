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
    // Initialize theme state on component creation
    const currentScreen = localStorage.getItem("lastScreen") || "Home";
    console.log(
      "Global ThemeProvider: Initializing for screen:",
      currentScreen
    );

    if (currentScreen === "bible") {
      const storedPreference = localStorage.getItem("bibleDarkMode");
      const isDark = storedPreference ? storedPreference === "true" : true;
      console.log("Bible theme - stored:", storedPreference, "isDark:", isDark);
      return isDark;
    } else if (currentScreen !== "mpresenter") {
      const storedPreference = localStorage.getItem("darkMode");
      if (storedPreference) {
        const isDark = storedPreference === "true";
        console.log(
          "General theme - stored:",
          storedPreference,
          "isDark:",
          isDark
        );
        return isDark;
      }
      // Check system preference for non-EvPresenter apps
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;
      console.log("System preference:", prefersDark);
      return prefersDark || false;
    }
    console.log(
      "EvPresenter screen detected, returning false (handled by EvPresenterTheme)"
    );
    return false; // Default for mpresenter (handled by its own context)
  });
  const dispatch = useAppDispatch();

  // Get current screen from Redux store
  const currentScreen = useAppSelector((state) => state.app.currentScreen);

  // Handle screen changes (this updates theme when switching between screens)
  useEffect(() => {
    // Check if we're in Bible app only (EvPresenter now has its own theme context)
    const isBibleApp = currentScreen === "bible";

    if (isBibleApp) {
      // For Bible app, use dedicated localStorage key and default to dark mode
      const storedPreference = localStorage.getItem("bibleDarkMode");
      if (storedPreference) {
        setIsDarkMode(storedPreference === "true");
      } else {
        // Default to dark mode for Bible app
        setIsDarkMode(true);
        localStorage.setItem("bibleDarkMode", "true");
      }
    } else if (currentScreen !== "mpresenter") {
      // For other apps (Songs, Home, etc.), use general darkMode key and system preference
      const storedPreference = localStorage.getItem("darkMode");
      if (storedPreference) {
        setIsDarkMode(storedPreference === "true");
      } else {
        // Check system preference for non-EvPresenter apps
        const prefersDark = window.matchMedia?.(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDarkMode(prefersDark || false);
      }
    }
  }, [currentScreen]);

  useEffect(() => {
    // Don't apply theme to document if we're in EvPresenter (it handles its own theme)
    if (currentScreen === "mpresenter") {
      console.log(
        "Global ThemeProvider: Skipping theme application for EvPresenter"
      );
      return;
    }

    console.log(
      "Global ThemeProvider: Applying theme - isDarkMode:",
      isDarkMode,
      "currentScreen:",
      currentScreen
    );

    // Apply dark mode class to document for other screens
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Store user preference with appropriate key
    const isBibleApp = currentScreen === "bible";
    if (isBibleApp) {
      localStorage.setItem("bibleDarkMode", String(isDarkMode));
      console.log("Stored bibleDarkMode:", String(isDarkMode));
    } else {
      localStorage.setItem("darkMode", String(isDarkMode));
      console.log("Stored darkMode:", String(isDarkMode));
    }
  }, [isDarkMode, currentScreen]);

  const toggleDarkMode = () => {
    // Don't allow toggling for EvPresenter (it has its own toggle)
    if (currentScreen === "mpresenter") {
      return;
    }

    setIsDarkMode((prev) => !prev);
    const newMode = !isDarkMode;

    // Update document class
    document.documentElement.classList.toggle("dark", newMode);

    // Store with appropriate key
    const isBibleApp = currentScreen === "bible";
    if (isBibleApp) {
      localStorage.setItem("bibleDarkMode", newMode.toString());
    } else {
      localStorage.setItem("darkMode", newMode.toString());
    }
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
