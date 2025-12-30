import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import appSlice, { AppState } from "./slices/appSlice";
import bibleSlice from "./slices/bibleSlice";
import themeSlice from "./themeSlice";

/**
 * Redux store configuration optimized for Bible functionality.
 * Uses redux-persist for automatic state persistence and better performance.
 */

// Persist configuration for app state
const appPersistConfig = {
  key: "app",
  storage,
  whitelist: [
    "currentScreen",
    "theme",
    "presentationbgs",
    "bibleBgs",
    "isFirstTime",
    "presets",
    "activePreset",
  ], // Only persist these fields
  blacklist: ["isFullscreen", "windowDimensions"], // Don't persist these
  // Custom merge to ensure default presets are always present
  merge: (persistedState: any, currentState: AppState) => {
    if (persistedState && persistedState.presets) {
      // Get default preset IDs
      const defaultPresetIds = new Set([
        "default-shalom",
        "default-see-you-again",
        "default-the-promise",
      ]);

      // Filter out default presets from persisted state
      const userPresets = persistedState.presets.filter(
        (p: any) => !defaultPresetIds.has(p.id)
      );

      // Get default presets from current state
      const defaultPresets = currentState.presets.filter((p: any) =>
        defaultPresetIds.has(p.id)
      );

      // Merge: default presets first, then user presets
      return {
        ...currentState,
        ...persistedState,
        presets: [...defaultPresets, ...userPresets],
      };
    }
    return { ...currentState, ...persistedState };
  },
};

// Persist configuration for bible state
const biblePersistConfig = {
  key: "bible",
  storage,
  whitelist: [
    "currentTranslation",
    "currentBook",
    "currentChapter",
    "currentVerse",
    "bookmarks",
    "history",
    "savedScriptures",
    "savedAlerts",
    "fontSize",
    "fontFamily",
    "fontWeight",
    "verseTextColor",
    "theme",
    "viewMode",
    "appMode",
    "verseByVerseMode",
    "imageBackgroundMode",
    "isFullScreen",
    "selectedBackground",
    // Projection settings
    "projectionFontSize",
    "projectionFontFamily",
    "projectionBackgroundColor",
    "projectionGradientColors",
    "projectionBackgroundImage",
    "projectionTextColor",
    "standaloneFontMultiplier",
    // Verse-by-verse settings
    "verseByVerseFontSize",
    "verseByVerseFontFamily",
    "verseByVerseTextColor",
    "verseByVerseBackgroundImage",
    "verseByVerseGradientColors",
    "verseByVerseBackgroundColor",
    "verseByVerseAutoSize",
    "presentationAutoSize",
    "highlightJesusWords",
    "showScriptureReference",
    "scriptureReferenceColor",
    "showWatermarkBackground",
  ],
  blacklist: [
    "bibleData",
    "searchOpen",
    "sidebarExpanded",
    "readerSettingsOpen",
    "searchResults",
    "searchTerm",
    "exactMatch",
    "wholeWords",
    "isLoading",
    "error",
  ],
};

// Create persisted reducers
const persistedAppReducer = persistReducer(appPersistConfig, appSlice);
const persistedBibleReducer = persistReducer(biblePersistConfig, bibleSlice);

const rootReducer = combineReducers({
  app: persistedAppReducer,
  bible: persistedBibleReducer,
  theme: themeSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Increase warning threshold to avoid noisy warnings for large operations
        // during development. The middleware is disabled in production builds.
        warnAfter: 1000,
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Note: loadBibleState() removed - redux-persist handles rehydration automatically

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
