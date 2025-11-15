import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CurrentScreen = "bible" | "welcome";

export type Theme = "dark" | "light" | "creamy";

export interface Preset {
  id: string;
  type: "image" | "scripture" | "text";
  name: string;
  data: {
    url?: string;
    images?: string[];
    count?: number;
    reference?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: "left" | "center" | "right";
    textColor?: string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
  createdAt: number;
}

export interface PresentationControls {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
}

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
  presets: Preset[];
  activePreset: string | null;
  projectedPreset: string | null;
  presentationControls: PresentationControls;
}

const initialState: AppState = {
  currentScreen:
    (localStorage.getItem("lastScreen") as CurrentScreen) || "bible",
  theme: (localStorage.getItem("theme") as Theme) || "creamy",
  presentationbgs: [],
  bibleBgs: [],
  isFullscreen: false,
  isFirstTime:
    !localStorage.getItem("hasVisitedApp") ||
    localStorage.getItem("lastScreen") === "welcome",
  windowDimensions: {
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  },
  presets: [],
  activePreset: null,
  projectedPreset: null,
  presentationControls: {
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCurrentScreen: (state, action: PayloadAction<CurrentScreen>) => {
      state.currentScreen = action.payload;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
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
    },
    goToWelcomeScreen: (state) => {
      state.isFirstTime = true;
      state.currentScreen = "welcome";
    },
    // Preset management actions
    addPreset: (state, action: PayloadAction<Preset>) => {
      state.presets.push(action.payload);
    },
    updatePreset: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Preset> }>
    ) => {
      const index = state.presets.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.presets[index] = {
          ...state.presets[index],
          ...action.payload.updates,
        };
      }
    },
    deletePreset: (state, action: PayloadAction<string>) => {
      state.presets = state.presets.filter((p) => p.id !== action.payload);
      if (state.activePreset === action.payload) {
        state.activePreset = null;
      }
    },
    setActivePreset: (state, action: PayloadAction<string | null>) => {
      state.activePreset = action.payload;
    },
    setProjectedPreset: (state, action: PayloadAction<string | null>) => {
      state.projectedPreset = action.payload;
    },
    clearAllPresets: (state) => {
      state.presets = [];
      state.activePreset = null;
      state.projectedPreset = null;
    },
    setPresentationControls: (
      state,
      action: PayloadAction<Partial<PresentationControls>>
    ) => {
      state.presentationControls = {
        ...state.presentationControls,
        ...action.payload,
      };
    },
    resetPresentationControls: (state) => {
      state.presentationControls = {
        zoom: 1,
        panX: 0,
        panY: 0,
        rotation: 0,
      };
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
  addPreset,
  updatePreset,
  deletePreset,
  setActivePreset,
  setProjectedPreset,
  clearAllPresets,
  setPresentationControls,
  resetPresentationControls,
  minimizeApp,
  maximizeApp,
  closeApp,
} = appSlice.actions;

export default appSlice.reducer;
