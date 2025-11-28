import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CurrentScreen = "bible" | "welcome";

export type Theme = "dark" | "light" | "creamy";

export interface Preset {
  id: string;
  type: "image" | "scripture" | "text" | "default" | "promise";
  name: string;
  pinned?: boolean;
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
    videoBackground?: string;
    enableConfetti?: boolean;
    // Scripture preset properties
    book?: string;
    chapter?: number;
    verse?: number;
    // Text preset type properties
    presetType?: "quote" | "title";
    quoteText?: string;
    author?: string;
    title?: string;
    listItems?: string[];
    subtitle?: string;
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

// Default presets with fixed background assignments
const defaultPresets: Preset[] = [
  {
    id: "default-shalom",
    type: "default",
    name: "Shalom & Blessings",
    data: {
      text: "Shalom and God bless you",
      fontSize: 72,
      fontFamily: "Brush Script MT, cursive",
      textAlign: "center",
      textColor: "#ffffff",
      backgroundColor: "#313131",
      backgroundImage: "./evdefault.jpg",
      enableConfetti: true,
    },
    createdAt: Date.now(),
  },
  {
    id: "default-the-promise",
    type: "promise",
    name: "The Promise",
    data: {
      text: "The Token • The Kingdom of God • Baptism of the Holy Spirit • Capstone • Headstone • The Promise ❗",
      fontSize: 48,
      fontFamily: "Georgia",
      textAlign: "center",
      textColor: "#ffffff",
      backgroundColor: "#000000",
      videoBackground: "./blue_particle.mp4",
    },
    createdAt: Date.now(),
  },
  {
    id: "default-random-scripture",
    type: "default",
    name: "Random Scripture",
    data: {
      text: "Random Scripture",
      fontSize: 48,
      fontFamily: "Arial",
      textAlign: "center",
      textColor: "#ffffff",
      backgroundColor: "#313131",
      backgroundImage: "./waterglass.mp4",
    },
    createdAt: Date.now(),
  },
];

// Helper function to ensure default presets are always present
const ensureDefaultPresets = (presets: Preset[]): Preset[] => {
  const presetIds = new Set(presets.map((p) => p.id));
  const missingDefaults = defaultPresets.filter((dp) => !presetIds.has(dp.id));
  return [...missingDefaults, ...presets];
};

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
  presets: ensureDefaultPresets([]),
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
      // Prevent updating default presets
      if (action.payload.id.startsWith("default-")) {
        console.warn("Cannot update default preset");
        return;
      }
      const index = state.presets.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.presets[index] = {
          ...state.presets[index],
          ...action.payload.updates,
        };
      }
    },
    deletePreset: (state, action: PayloadAction<string>) => {
      // Prevent deletion of default presets
      if (action.payload.startsWith("default-")) {
        console.warn("Cannot delete default preset");
        return;
      }
      state.presets = state.presets.filter((p) => p.id !== action.payload);
      if (state.activePreset === action.payload) {
        state.activePreset = null;
      }
    },
    togglePinPreset: (state, action: PayloadAction<string>) => {
      const index = state.presets.findIndex((p) => p.id === action.payload);
      if (index !== -1) {
        state.presets[index].pinned = !state.presets[index].pinned;
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
    // Initialize default presets - ensures they exist
    initializeDefaultPresets: (state) => {
      // Remove any existing default presets
      state.presets = state.presets.filter((p) => !p.id.startsWith("default-"));

      // Add the fixed default presets to the beginning
      state.presets = [...defaultPresets, ...state.presets];
    },
    // Load presets from file system
    loadPresetsFromFile: (state, action: PayloadAction<Preset[]>) => {
      // Merge with default presets
      state.presets = ensureDefaultPresets(action.payload);
    },
    // Replace all presets (used after import)
    replaceAllPresets: (state, action: PayloadAction<Preset[]>) => {
      state.presets = ensureDefaultPresets(action.payload);
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
  togglePinPreset,
  setActivePreset,
  setProjectedPreset,
  clearAllPresets,
  initializeDefaultPresets,
  loadPresetsFromFile,
  replaceAllPresets,
  setPresentationControls,
  resetPresentationControls,
  minimizeApp,
  maximizeApp,
  closeApp,
} = appSlice.actions;

export default appSlice.reducer;
