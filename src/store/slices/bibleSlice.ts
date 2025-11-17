import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "..";

// Define view modes for reader (verse-by-verse is handled separately with verseByVerseMode boolean)
export type ViewMode = "block" | "paragraph";

// Define types for our Bible data
export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  testament: string;
  chapters: Chapter[];
}

export interface BibleTranslation {
  translation: string;
  books: Book[];
}

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface HistoryEntry {
  reference: string;
  timestamp: number;
}

// Define available translations
export const TRANSLATIONS = {
  KJV: {
    name: "King James Version",
    path: "./assets/newkjv.json",
  },
  TWI: {
    name: "Twi Bible",
    path: "./assets/twiBible.json",
  },
  EWE: {
    name: "Ewe Bible",
    path: "./assets/eweBible.json",
  },
  FRENCH: {
    name: "French Bible",
    path: "./assets/frenchBible.json",
  },
};

// Old and New Testament books
const oldTestamentBooks: Book[] = [
  { name: "Genesis", chapters: [], testament: "old" },
  { name: "Exodus", chapters: [], testament: "old" },
  { name: "Leviticus", chapters: [], testament: "old" },
  { name: "Malachi", chapters: [], testament: "old" },
];

const newTestamentBooks: Book[] = [
  { name: "Matthew", chapters: [], testament: "new" },
  { name: "Mark", chapters: [], testament: "new" },
  { name: "Luke", chapters: [], testament: "new" },
  { name: "Revelation", chapters: [], testament: "new" },
];

const allBooks: Book[] = [...oldTestamentBooks, ...newTestamentBooks];

export interface BibleState {
  // App state
  theme: string;
  currentScreen: string;

  // UI state
  sidebarExpanded: boolean;
  activeFeature: string | null;
  searchOpen: boolean;

  // Mode states
  appMode: "reader" | "audience"; // New state for app mode
  readerSettingsOpen: boolean; // New state for reader settings dropdown
  viewMode: ViewMode; // View mode for scripture display

  // Bible content state
  bibleData: { [key: string]: BibleTranslation };
  currentTranslation: string;
  availableTranslations: string[];
  translationsLoaded: { [key: string]: boolean };
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  bookList: Book[];

  // User preferences
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  verseTextColor: string;

  // Bookmarks
  bookmarks: string[];

  // History
  history: HistoryEntry[];

  // Search
  searchResults: SearchResult[];
  searchTerm: string;
  exactMatch: boolean;
  wholeWords: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // New state fields
  verseByVerseMode: boolean;
  isFullScreen: boolean;
  imageBackgroundMode: boolean;

  // New state fields
  selectedBackground: string | null;

  // Projection-specific settings
  projectionFontSize: number;
  projectionFontFamily: string;
  projectionBackgroundColor: string;
  projectionGradientColors: string[];
  projectionBackgroundImage: string;
  projectionTextColor: string;

  // Standalone projection settings (separate from in-app projection)
  standaloneFontMultiplier: number;

  // Settings sharing configuration
  shareSettingsWithVerseByVerse: boolean;
  shareFontSize: boolean;
  shareFontFamily: boolean;
  shareTextColor: boolean;
  shareBackground: boolean;

  // Verse-by-verse independent settings (used when not sharing)
  verseByVerseFontSize: number;
  verseByVerseFontFamily: string;
  verseByVerseTextColor: string;
  verseByVerseBackgroundImage: string;
  verseByVerseGradientColors: string[];
  verseByVerseBackgroundColor: string;

  // Auto-sizing setting for verse-by-verse view
  verseByVerseAutoSize: boolean;

  // Auto-sizing setting for presentation display
  presentationAutoSize: boolean;

  // Jesus words highlighting setting
  highlightJesusWords: boolean;

  // Scripture reference settings
  showScriptureReference: boolean;
  scriptureReferenceColor: string;

  // Watermark background setting
  showWatermarkBackground: boolean;
}

const initialState: BibleState = {
  // App state - redux-persist will restore from storage
  theme: "dark",
  currentScreen: "Home",

  // UI state - redux-persist will restore from storage
  sidebarExpanded: true,
  activeFeature: null,
  searchOpen: false,

  // Mode states - redux-persist will restore from storage
  appMode: "reader",
  readerSettingsOpen: false,
  viewMode: "block",

  // Bible content state - redux-persist will restore from storage
  bibleData: {},
  currentTranslation: "KJV",
  availableTranslations: [],
  translationsLoaded: {},
  currentBook: "Revelation",
  currentChapter: 3,
  currentVerse: null,
  bookList: allBooks,

  // User preferences - redux-persist will restore from storage
  fontSize: "small",
  fontWeight: "normal",
  fontFamily: "garamond",
  verseTextColor: "#fcd8c0",

  // Bookmarks - redux-persist will restore from storage
  bookmarks: [],

  // History - redux-persist will restore from storage
  history: [],

  // Search
  searchResults: [],
  searchTerm: "",
  exactMatch: false,
  wholeWords: false,

  // Loading states
  isLoading: false,
  error: null,

  // New state fields
  verseByVerseMode: false,
  isFullScreen: false,
  imageBackgroundMode: false,

  // New state fields
  selectedBackground: null,

  // Projection-specific settings - redux-persist will restore from storage
  projectionFontSize: 48,
  projectionFontFamily: "garamond",
  projectionBackgroundColor: "#000000",
  projectionGradientColors: ["#000000", "#050505"],
  projectionBackgroundImage: "",
  projectionTextColor: "#fcd8c0",

  // Standalone projection settings - redux-persist will restore from storage
  standaloneFontMultiplier: 1.0,

  // Settings sharing configuration - redux-persist will restore from storage
  shareSettingsWithVerseByVerse: false,
  shareFontSize: true,
  shareFontFamily: true,
  shareTextColor: true,
  shareBackground: true,

  // Verse-by-verse independent settings - redux-persist will restore from storage
  verseByVerseFontSize: 50,
  verseByVerseFontFamily: "garamond",
  verseByVerseTextColor: "#ffffff",
  verseByVerseBackgroundImage: "",
  verseByVerseGradientColors: [],
  verseByVerseBackgroundColor: "#1e293b",

  // Auto-sizing setting for verse-by-verse view
  verseByVerseAutoSize: true,

  // Auto-sizing setting for presentation display
  presentationAutoSize: true,

  // Jesus words highlighting setting
  highlightJesusWords: true,

  // Scripture reference settings
  showScriptureReference: true,
  scriptureReferenceColor: "#ef4444",

  // Watermark background setting
  showWatermarkBackground: true,
};

const bibleSlice = createSlice({
  name: "bible",
  initialState,
  reducers: {
    // App state actions
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
    },

    // UI state actions
    setSidebarExpanded: (state, action: PayloadAction<boolean>) => {
      state.sidebarExpanded = action.payload;
    },
    setActiveFeature: (state, action: PayloadAction<string | null>) => {
      state.activeFeature = action.payload;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },

    // Bible content state actions
    setBibleData: (
      state,
      action: PayloadAction<{ [key: string]: BibleTranslation }>
    ) => {
      state.bibleData = action.payload;
    },
    addTranslationData: (
      state,
      action: PayloadAction<{ translation: string; data: BibleTranslation }>
    ) => {
      const { translation, data } = action.payload;
      state.bibleData[translation] = data;
    },
    setCurrentTranslation: (state, action: PayloadAction<string>) => {
      state.currentTranslation = action.payload;
    },
    setAvailableTranslations: (state, action: PayloadAction<string[]>) => {
      state.availableTranslations = action.payload;
    },
    setTranslationLoaded: (
      state,
      action: PayloadAction<{ translation: string; loaded: boolean }>
    ) => {
      const { translation, loaded } = action.payload;
      state.translationsLoaded[translation] = loaded;
    },
    setCurrentBook: (state, action: PayloadAction<string>) => {
      state.currentBook = action.payload;
    },
    setCurrentChapter: (state, action: PayloadAction<number>) => {
      state.currentChapter = action.payload;
    },
    setCurrentVerse: (state, action: PayloadAction<number | null>) => {
      state.currentVerse = action.payload;
    },
    setBookList: (state, action: PayloadAction<Book[]>) => {
      state.bookList = action.payload;
    },

    // Mode actions
    setAppMode: (state, action: PayloadAction<"reader" | "audience">) => {
      state.appMode = action.payload;
    },
    setReaderSettingsOpen: (state, action: PayloadAction<boolean>) => {
      state.readerSettingsOpen = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },

    // User preferences actions
    setFontSize: (state, action: PayloadAction<string>) => {
      state.fontSize = action.payload;
    },
    setFontWeight: (state, action: PayloadAction<string>) => {
      state.fontWeight = action.payload;
    },
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.fontFamily = action.payload;
    },
    setVerseTextColor: (state, action: PayloadAction<string>) => {
      state.verseTextColor = action.payload;
    },

    // Bookmarks actions
    addBookmark: (state, action: PayloadAction<string>) => {
      const bookmark = action.payload;
      if (!state.bookmarks.includes(bookmark)) {
        state.bookmarks = [bookmark, ...state.bookmarks];
      }
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      const bookmark = action.payload;
      state.bookmarks = state.bookmarks.filter((b) => b !== bookmark);
    },
    setBookmarks: (state, action: PayloadAction<string[]>) => {
      state.bookmarks = action.payload;
    },

    // History actions
    addToHistory: (state, action: PayloadAction<string>) => {
      const reference = action.payload;
      const newEntry: HistoryEntry = { reference, timestamp: Date.now() };
      const histories = [newEntry, ...state.history.slice(0, 19)];
      state.history = histories;
    },
    setHistory: (state, action: PayloadAction<HistoryEntry[]>) => {
      state.history = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
    },

    // Search actions
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setExactMatch: (state, action: PayloadAction<boolean>) => {
      state.exactMatch = action.payload;
    },
    setWholeWords: (state, action: PayloadAction<boolean>) => {
      state.wholeWords = action.payload;
    },
    clearSearch: (state) => {
      state.searchTerm = "";
      state.searchResults = [];
    },

    // Loading state actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Complex actions that combine multiple state updates
    navigateToVerse: (
      state,
      action: PayloadAction<{ book: string; chapter: number; verse?: number }>
    ) => {
      const { book, chapter, verse } = action.payload;
      state.currentBook = book;
      state.currentChapter = chapter;
      state.currentVerse = verse || null;

      // Add to history
      const reference = verse
        ? `${book} ${chapter}:${verse}`
        : `${book} ${chapter}`;
      const newEntry: HistoryEntry = { reference, timestamp: Date.now() };
      const histories = [newEntry, ...state.history.slice(0, 19)];
      state.history = histories;
    },

    // Reset actions
    resetBibleState: (state) => {
      // Reset to initial state - redux-persist will restore saved values on next load
      Object.assign(state, initialState);
    },

    // New state actions
    setVerseByVerseMode: (state, action: PayloadAction<boolean>) => {
      const previousValue = state.verseByVerseMode;
      state.verseByVerseMode = action.payload;

      // Debug logging to track when verseByVerseMode changes
      console.log(
        "🔍 [setVerseByVerseMode] Changed from",
        previousValue,
        "to",
        action.payload
      );
      if (action.payload === true && previousValue === false) {
        console.log(
          "🔍 [setVerseByVerseMode] VERSE-BY-VERSE MODE ACTIVATED - Stack trace:"
        );
        console.trace();
      }
    },
    setImageBackgroundMode: (state, action: PayloadAction<boolean>) => {
      state.imageBackgroundMode = action.payload;
    },
    setFullScreen: (state, action: PayloadAction<boolean>) => {
      const previousValue = state.isFullScreen;
      state.isFullScreen = action.payload;

      // Debug logging to track fullscreen changes
      console.log(
        "🔍 [setFullScreen] Changed from",
        previousValue,
        "to",
        action.payload
      );
    },

    // Projection-specific settings actions
    setProjectionFontSize: (state, action: PayloadAction<number>) => {
      state.projectionFontSize = action.payload;
    },
    setProjectionFontFamily: (state, action: PayloadAction<string>) => {
      state.projectionFontFamily = action.payload;
    },
    setProjectionBackgroundColor: (state, action: PayloadAction<string>) => {
      state.projectionBackgroundColor = action.payload;
    },
    setProjectionGradientColors: (state, action: PayloadAction<string[]>) => {
      state.projectionGradientColors = action.payload;
    },
    setProjectionBackgroundImage: (state, action: PayloadAction<string>) => {
      state.projectionBackgroundImage = action.payload;
    },
    setProjectionTextColor: (state, action: PayloadAction<string>) => {
      state.projectionTextColor = action.payload;
    },

    // Standalone projection settings
    setStandaloneFontMultiplier: (state, action: PayloadAction<number>) => {
      state.standaloneFontMultiplier = action.payload;
    },

    // Settings sharing configuration
    setShareSettingsWithVerseByVerse: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.shareSettingsWithVerseByVerse = action.payload;
    },
    setShareFontSize: (state, action: PayloadAction<boolean>) => {
      state.shareFontSize = action.payload;
    },
    setShareFontFamily: (state, action: PayloadAction<boolean>) => {
      state.shareFontFamily = action.payload;
    },
    setShareTextColor: (state, action: PayloadAction<boolean>) => {
      state.shareTextColor = action.payload;
    },

    // Verse-by-verse independent settings
    setVerseByVerseFontSize: (state, action: PayloadAction<number>) => {
      state.verseByVerseFontSize = action.payload;
    },
    setVerseByVerseFontFamily: (state, action: PayloadAction<string>) => {
      state.verseByVerseFontFamily = action.payload;
    },
    setVerseByVerseTextColor: (state, action: PayloadAction<string>) => {
      state.verseByVerseTextColor = action.payload;
    },
    setVerseByVerseAutoSize: (state, action: PayloadAction<boolean>) => {
      state.verseByVerseAutoSize = action.payload;
    },
    setPresentationAutoSize: (state, action: PayloadAction<boolean>) => {
      state.presentationAutoSize = action.payload;
    },
    setHighlightJesusWords: (state, action: PayloadAction<boolean>) => {
      state.highlightJesusWords = action.payload;
    },
    setShowScriptureReference: (state, action: PayloadAction<boolean>) => {
      state.showScriptureReference = action.payload;
    },
    setScriptureReferenceColor: (state, action: PayloadAction<string>) => {
      state.scriptureReferenceColor = action.payload;
    },
    setShowWatermarkBackground: (state, action: PayloadAction<boolean>) => {
      state.showWatermarkBackground = action.payload;
    },

    // New state actions
    setSelectedBackground: (state, action: PayloadAction<string | null>) => {
      state.selectedBackground = action.payload;
    },
  },
});

export const {
  setTheme,
  setCurrentScreen,
  setSidebarExpanded,
  setActiveFeature,
  setSearchOpen,
  setAppMode,
  setReaderSettingsOpen,
  setViewMode,
  setBibleData,
  addTranslationData,
  setCurrentTranslation,
  setAvailableTranslations,
  setTranslationLoaded,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setBookList,
  setFontSize,
  setFontWeight,
  setFontFamily,
  setVerseTextColor,
  addBookmark,
  removeBookmark,
  setBookmarks,
  addToHistory,
  setHistory,
  clearHistory,
  setSearchResults,
  setSearchTerm,
  setExactMatch,
  setWholeWords,
  clearSearch,
  setLoading,
  setError,
  navigateToVerse,
  resetBibleState,
  setVerseByVerseMode,
  setImageBackgroundMode,
  setFullScreen,
  setSelectedBackground,
  setProjectionFontSize,
  setProjectionFontFamily,
  setProjectionBackgroundColor,
  setProjectionGradientColors,
  setProjectionBackgroundImage,
  setProjectionTextColor,
  setStandaloneFontMultiplier,
  setShareSettingsWithVerseByVerse,
  setShareFontSize,
  setShareFontFamily,
  setShareTextColor,
  setVerseByVerseFontSize,
  setVerseByVerseFontFamily,
  setVerseByVerseTextColor,
  setVerseByVerseAutoSize,
  setPresentationAutoSize,
  setHighlightJesusWords,
  setShowScriptureReference,
  setScriptureReferenceColor,
  setShowWatermarkBackground,
} = bibleSlice.actions;

// Note: loadBibleState thunk removed - redux-persist handles rehydration automatically

export default bibleSlice.reducer;
