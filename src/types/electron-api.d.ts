interface DisplayInfo {
  isExternalDisplay: boolean;
  displayBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface DetailedDisplayInfo {
  totalDisplays: number;
  primaryDisplay: {
    id: number;
    bounds: { x: number; y: number; width: number; height: number };
    workArea: { x: number; y: number; width: number; height: number };
    scaleFactor: number;
    internal: boolean;
  };
  allDisplays: Array<{
    id: number;
    bounds: { x: number; y: number; width: number; height: number };
    workArea: { x: number; y: number; width: number; height: number };
    scaleFactor: number;
    rotation: number;
    internal: boolean;
    isPrimary: boolean;
  }>;
}

interface ElectronAPI {
  minimizeApp: () => void;
  maximizeApp: () => void;
  closeApp: () => void;
  isProjectionActive: () => Promise<boolean>;
  closeProjectionWindow: () => Promise<boolean>;
  onProjectionStateChanged: (
    callback: (isActive: boolean) => void
  ) => () => void;
  onDisplayInfo: (callback: (info: DisplayInfo) => void) => () => void;
  getImages: (dirPath: string) => Promise<string[]>;
  selectDirectory: () => Promise<string | null>;
  getSystemFonts: () => Promise<string[]>;
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
    data?: DetailedDisplayInfo;
    error?: string;
  }>;
  onBiblePresentationUpdate: (callback: (data: any) => void) => () => void;
  onPresentationControlUpdate: (callback: (data: any) => void) => () => void;

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
  // Add other API methods as needed
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export { DisplayInfo, DetailedDisplayInfo, ElectronAPI };
