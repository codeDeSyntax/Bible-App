import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";

export type ThemeName =
  | "grayscale"
  | "warm"
  | "royal"
  | "ocean"
  | "forest"
  | "sky"
  | "lavender";

interface ThemeState {
  currentTheme: ThemeName;
  isDarkMode: boolean;
}

// Load persisted theme from localStorage
const loadPersistedTheme = (): ThemeName => {
  try {
    const saved = localStorage.getItem("app-theme");
    if (
      saved &&
      [
        "grayscale",
        "warm",
        "royal",
        "ocean",
        "forest",
        "sky",
        "lavender",
      ].includes(saved)
    ) {
      return saved as ThemeName;
    }
  } catch (error) {
    console.error("Failed to load theme from localStorage:", error);
  }
  return "grayscale"; // Default theme
};

// Load persisted dark mode from localStorage
const loadPersistedDarkMode = (): boolean => {
  try {
    const saved = localStorage.getItem("dark-mode");
    return saved === "true";
  } catch (error) {
    console.error("Failed to load dark mode from localStorage:", error);
  }
  return false; // Default to light mode
};

const initialState: ThemeState = {
  currentTheme: loadPersistedTheme(),
  isDarkMode: loadPersistedDarkMode(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeName>) => {
      state.currentTheme = action.payload;
      // Persist to localStorage
      try {
        localStorage.setItem("app-theme", action.payload);
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
      }
      // Apply theme class to document
      applyThemeClass(action.payload, state.isDarkMode);
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Persist to localStorage
      try {
        localStorage.setItem("dark-mode", String(state.isDarkMode));
      } catch (error) {
        console.error("Failed to save dark mode to localStorage:", error);
      }
      // Apply theme class to document
      applyThemeClass(state.currentTheme, state.isDarkMode);
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      // Persist to localStorage
      try {
        localStorage.setItem("dark-mode", String(action.payload));
      } catch (error) {
        console.error("Failed to save dark mode to localStorage:", error);
      }
      // Apply theme class to document
      applyThemeClass(state.currentTheme, action.payload);
    },
    initializeTheme: (state) => {
      // Apply theme class on app startup
      applyThemeClass(state.currentTheme, state.isDarkMode);
    },
  },
});

// Helper function to apply theme classes to document
function applyThemeClass(theme: ThemeName, isDark: boolean): void {
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove(
    "theme-grayscale",
    "theme-warm",
    "theme-royal",
    "theme-ocean",
    "theme-forest",
    "theme-sky",
    "theme-lavender"
  );

  // Add current theme class (grayscale is default, no class needed)
  if (theme !== "grayscale") {
    root.classList.add(`theme-${theme}`);
  }

  // Apply dark mode class
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Remove preload class after a short delay to enable transitions
  // This prevents FOUC (Flash of Unstyled Content) on initial load
  setTimeout(() => {
    root.classList.remove("preload");
  }, 100);
}

export const { setTheme, toggleDarkMode, setDarkMode, initializeTheme } =
  themeSlice.actions;

// Selectors
export const selectCurrentTheme = (state: RootState): ThemeName =>
  state.theme.currentTheme;
export const selectIsDarkMode = (state: RootState): boolean =>
  state.theme.isDarkMode;

export default themeSlice.reducer;
