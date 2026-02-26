/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import("electron").IpcRenderer;
}

interface Window {
  api: {
    minimizeApp: () => void;
    minimizeProjection: () => void;
    maximizeApp: () => void;
    closeApp: () => void;
    selectDirectory: () => Promise<string | null>;
    saveSong: (directory: string, title: string, content: string) => void;
    editSong: (
      directory: string,
      newTitle: string,
      content: string,
      originalPath: string
    ) => void;
    searchSong: (directory: string, searchTerm: string) => Promise<Song[]>;
    fetchSongs: (directory: string) => Promise<Song[]>;
    deleteSong: (filePath: string) => void;
    onSongsLoaded: (callback: (songs: Song[]) => void) => void;
    getPresentationImages: (directory: string) => Promise<string[]>;
    projectSong: (songs: any) => void;
    isProjectionActive: () => Promise<boolean>;
    closeProjectionWindow: () => Promise<boolean>;
    onProjectionStateChanged: (
      callback: (isActive: boolean) => void
    ) => () => void;
    onDisplaySong: (callback: (songData: Song) => void) => void;
    onDisplayInfo: (callback: (info: any) => void) => void;
    getImages: (dirPath: string) => Promise<string[]>;
    getSystemFonts: () => Promise<string[]>;
    createEvPresentation: (
      path: string,
      presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">
    ) => Promise<Presentation>;
    loadEvPresentations: (path: string) => Promise<Presentation[]>;
    deleteEvPresentation: (id: string, directory: string) => Promise<void>;
    updateEvPresentation: (
      id: string,
      directoryPath: string,
      presentation: Partial<Presentation>
    ) => Promise<Presentation>;
    createBiblePresentationWindow: (
      data: any
    ) => Promise<{ success: boolean; error?: string }>;
    createPresentationWindow: (data: {
      presetId: string;
      presetType: string;
      presetName: string;
      presetData?: any; // Optional full preset data to avoid sync issues
    }) => Promise<{ success: boolean; error?: string }>;
    sendToPresentationWindow: (data: {
      type: string;
      data: any;
    }) => Promise<{ success: boolean; error?: string }>;
    sendToBiblePresentation: (data: {
      type: string;
      data: any;
    }) => Promise<{ success: boolean; error?: string }>;
    onPresentationControlUpdate: (callback: (data: any) => void) => () => void;
    onPresetProjectionClosed: (callback: () => void) => () => void;
    focusMainWindow: () => Promise<{ success: boolean; error?: string }>;
    openFileInDefaultApp: (
      filePath: string
    ) => Promise<{ success: boolean; error?: string }>;
    constructFilePath: (
      basePath: string,
      fileName: string
    ) => Promise<{ success: boolean; path?: string; error?: string }>;
    getDisplayInfo: () => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;
    logToSecretLogger: (logData: {
      application: "SONGS" | "BIBLE" | "SYSTEM";
      category:
        | "INFO"
        | "WARNING"
        | "ERROR"
        | "ACTION"
        | "PROJECTION"
        | "FILE_OPERATION";
      message: string;
      details?: any;
    }) => Promise<{ success: boolean; error?: string }>;
    getSecretLogs: () => Promise<{
      success: boolean;
      logs?: Array<{
        id: string;
        timestamp: number;
        date: string;
        application: "SONGS" | "BIBLE" | "EVPRESENTER" | "SYSTEM";
        category:
          | "INFO"
          | "WARNING"
          | "ERROR"
          | "ACTION"
          | "PROJECTION"
          | "FILE_OPERATION";
        message: string;
        details?: string;
        age: string;
      }>;
      error?: string;
    }>;
    clearSecretLogs: () => Promise<{ success: boolean; error?: string }>;
    exportSecretLogs: () => Promise<{
      success: boolean;
      filePath?: string;
      error?: string;
    }>;
    getLogSettings: () => Promise<{
      success: boolean;
      settings?: {
        autoCleanup: boolean;
        interval: number;
        unit: "minutes" | "hours" | "days" | "weeks";
        customInterval: number;
      };
      error?: string;
    }>;
    updateLogSettings: (settings: {
      autoCleanup: boolean;
      interval: number;
      unit: "minutes" | "hours" | "days" | "weeks";
      customInterval: number;
    }) => Promise<{ success: boolean; error?: string }>;
    sendToSongProjection: (data: {
      type: string;
      command?: string;
      fontSize?: number;
      data?: any;
    }) => Promise<{ success: boolean; error?: string }>;
    onSongProjectionUpdate: (callback: (data: any) => void) => () => void;
    sendToMainWindow: (data: {
      type: string;
      data?: any;
    }) => Promise<{ success: boolean; error?: string }>;
    onSongProjectionCommand: (callback: (data: any) => void) => () => void;
    onFontSizeUpdate: (callback: (fontSize: number) => void) => () => void;
    onMainWindowMessage: (callback: (data: any) => void) => () => void;

    // Preset Storage API
    getPresetsDirectory: () => Promise<{
      success: boolean;
      path?: string;
      error?: string;
    }>;
    savePreset: (preset: any) => Promise<{ success: boolean; error?: string }>;
    loadPreset: (
      presetId: string
    ) => Promise<{ success: boolean; preset?: any; error?: string }>;
    deletePreset: (
      presetId: string
    ) => Promise<{ success: boolean; error?: string }>;
    loadPresetMetadata: () => Promise<{
      success: boolean;
      metadata?: any[];
      error?: string;
    }>;
    loadAllPresets: () => Promise<{
      success: boolean;
      presets?: any[];
      error?: string;
    }>;
    exportPresets: () => Promise<{
      success: boolean;
      count: number;
      error?: string;
    }>;
    importPresets: () => Promise<{
      success: boolean;
      count: number;
      error?: string;
    }>;
    searchPresets: (
      query: string,
      type?: string
    ) => Promise<{ success: boolean; results?: any[]; error?: string }>;
    getStorageStats: () => Promise<{
      success: boolean;
      stats?: {
        totalPresets: number;
        totalSize: number;
        presetsByType: Record<string, number>;
      };
      error?: string;
    }>;

    // Preset Settings API
    getPresetSettings: () => Promise<{
      videoAutoPlay: boolean;
      backgroundOpacity: number;
    }>;
    updatePresetSettings: (settings: {
      videoAutoPlay?: boolean;
      backgroundOpacity?: number;
    }) => Promise<{ success: boolean; error?: string }>;

    // Display Management API
    getAllDisplays: () => Promise<{
      success: boolean;
      displays?: Array<{
        id: number;
        label: string;
        bounds: { x: number; y: number; width: number; height: number };
        workArea: { x: number; y: number; width: number; height: number };
        scaleFactor: number;
        rotation: number;
        internal: boolean;
        isPrimary: boolean;
        resolution: string;
      }>;
      primaryDisplayId?: number;
      preferredDisplayId?: number | null;
      error?: string;
    }>;
    setProjectionDisplay: (displayId: number) => Promise<{
      success: boolean;
      displayId?: number;
      error?: string;
    }>;

    // Bible API proxy — routes through main process to bypass CORS
    bibleApiFetch: (apiPath: string) => Promise<unknown>;

    // AI Image Generation — routes through main process to keep API keys server-side
    generateAiImage: (data: {
      provider: "stability" | "picsart";
      prompt: string;
      aspectRatio?: string;
    }) => Promise<{ success: boolean; imageDataUrl?: string; error?: string }>;
  };
}
