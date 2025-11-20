import { ipcMain, dialog } from "electron";
import {
  secretLogger,
  logSystemInfo,
  logSystemError,
} from "../../src/utils/SecretLogger";
import * as presetStorage from "./presetStorage";

/**
 * Preset Handlers Module
 * Handles all IPC communication for preset storage operations
 */

export function setupPresetHandlers() {
  // Get presets directory path
  ipcMain.handle("get-presets-directory", async () => {
    try {
      const presetsDir = presetStorage.getPresetsDirectoryPath();
      return { success: true, path: presetsDir };
    } catch (error) {
      console.error("Error getting presets directory:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Save a preset to file system
  ipcMain.handle("save-preset", async (_, preset) => {
    try {
      await presetStorage.savePreset(preset);
      logSystemInfo("Preset saved to file system", {
        presetId: preset.id,
        presetName: preset.name,
        presetType: preset.type,
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving preset:", error);
      logSystemError("Failed to save preset", {
        presetId: preset.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Load a preset from file system
  ipcMain.handle("load-preset", async (_, presetId: string) => {
    try {
      const preset = await presetStorage.loadPreset(presetId);
      if (preset) {
        return { success: true, preset };
      } else {
        return { success: false, error: "Preset not found" };
      }
    } catch (error) {
      console.error("Error loading preset:", error);
      logSystemError("Failed to load preset", {
        presetId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Delete a preset from file system
  ipcMain.handle("delete-preset", async (_, presetId: string) => {
    try {
      const success = await presetStorage.deletePreset(presetId);
      if (success) {
        logSystemInfo("Preset deleted from file system", { presetId });
        return { success: true };
      } else {
        return { success: false, error: "Failed to delete preset" };
      }
    } catch (error) {
      console.error("Error deleting preset:", error);
      logSystemError("Failed to delete preset", {
        presetId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Load all preset metadata (lightweight)
  ipcMain.handle("load-preset-metadata", async () => {
    try {
      const metadata = await presetStorage.loadAllPresetMetadata();
      return { success: true, metadata };
    } catch (error) {
      console.error("Error loading preset metadata:", error);
      logSystemError("Failed to load preset metadata", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Load all presets (full data)
  ipcMain.handle("load-all-presets", async () => {
    try {
      const presets = await presetStorage.loadAllPresets();
      logSystemInfo("All presets loaded from file system", {
        count: presets.length,
      });
      return { success: true, presets };
    } catch (error) {
      console.error("Error loading all presets:", error);
      logSystemError("Failed to load all presets", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Export all presets
  ipcMain.handle("export-presets", async () => {
    try {
      const result = await dialog.showSaveDialog({
        filters: [{ name: "JSON Files", extensions: ["json"] }],
        defaultPath: `presets-backup-${
          new Date().toISOString().split("T")[0]
        }.json`,
      });

      if (!result.canceled && result.filePath) {
        const exportResult = await presetStorage.exportAllPresets(
          result.filePath
        );
        if (exportResult.success) {
          logSystemInfo("Presets exported", {
            filePath: result.filePath,
            count: exportResult.count,
          });
        }
        return exportResult;
      }

      return { success: false, count: 0, error: "Export cancelled" };
    } catch (error) {
      console.error("Error exporting presets:", error);
      logSystemError("Failed to export presets", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Import presets
  ipcMain.handle("import-presets", async () => {
    try {
      const result = await dialog.showOpenDialog({
        filters: [{ name: "JSON Files", extensions: ["json"] }],
        properties: ["openFile"],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const importResult = await presetStorage.importPresets(
          result.filePaths[0]
        );
        if (importResult.success) {
          logSystemInfo("Presets imported", {
            filePath: result.filePaths[0],
            count: importResult.count,
          });
        }
        return importResult;
      }

      return { success: false, count: 0, error: "Import cancelled" };
    } catch (error) {
      console.error("Error importing presets:", error);
      logSystemError("Failed to import presets", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Search presets
  ipcMain.handle("search-presets", async (_, query: string, type?: string) => {
    try {
      const results = await presetStorage.searchPresets(query, type as any);
      return { success: true, results };
    } catch (error) {
      console.error("Error searching presets:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Get storage statistics
  ipcMain.handle("get-storage-stats", async () => {
    try {
      const stats = await presetStorage.getStorageStats();
      return { success: true, stats };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  console.log("✅ Preset handlers registered");
}
