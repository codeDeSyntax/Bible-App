import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CurrentScreen = "bible" | "welcome";

export type Theme = "dark" | "light" | "creamy";

export interface AppState {
  currentScreen: CurrentScreen;
  theme: Theme;
  presentationbgs: string[];
  bibleBgs: string[];
  isFullscreen: boolean;
  isFirstTime: boolean;
  windowDimensions: {
    width: number;
    height: number;
  };
}

const initialState: AppState = {
  currentScreen:
    (localStorage.getItem("lastScreen") as CurrentScreen) || "bible",
  theme: (localStorage.getItem("theme") as Theme) || "creamy",
  presentationbgs: [],
  bibleBgs: [], // Initialize as empty since we'll only use custom images
  isFullscreen: false,
  isFirstTime:
    !localStorage.getItem("hasVisitedApp") ||
    localStorage.getItem("lastScreen") === "welcome",
  windowDimensions: {
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCurrentScreen: (state, action: PayloadAction<CurrentScreen>) => {
      state.currentScreen = action.payload;
      localStorage.setItem("lastScreen", action.payload);
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    setPresentationBgs: (state, action: PayloadAction<string[]>) => {
      state.presentationbgs = action.payload;
    },
    setBibleBgs: (state, action: PayloadAction<string[]>) => {
      state.bibleBgs = action.payload;
    },
    clearBibleBgs: (state) => {
      state.bibleBgs = [];
    },
    setWindowDimensions: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.windowDimensions = action.payload;
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setFirstTimeVisited: (state) => {
      state.isFirstTime = false;
      localStorage.setItem("hasVisitedApp", "true");
    },
    goToWelcomeScreen: (state) => {
      state.isFirstTime = true;
      state.currentScreen = "welcome";
      localStorage.setItem("lastScreen", "welcome");
    },
    // Window control actions
    minimizeApp: () => {
      window.api?.minimizeApp();
    },
    maximizeApp: () => {
      window.api?.maximizeApp();
    },
    closeApp: () => {
      window.api?.closeApp();
    },
  },
});

export const {
  setCurrentScreen,
  setTheme,
  setPresentationBgs,
  setBibleBgs,
  clearBibleBgs,
  setWindowDimensions,
  toggleFullscreen,
  setFirstTimeVisited,
  goToWelcomeScreen,
  minimizeApp,
  maximizeApp,
  closeApp,
} = appSlice.actions;

export default appSlice.reducer;
