import { ipcMain, dialog } from "electron";
import fs from "node:fs";
import {
  secretLogger,
  logSystemInfo,
  logSystemError,
} from "../../src/utils/SecretLogger";

/**
 * Secret Logging Handlers Module
 * Handles all IPC communication for the secret logging system
 */

export function setupSecretLoggingHandlers() {
  // Log to secret logger
  ipcMain.handle(
    "log-to-secret-logger",
    async (_, { application, category, message, details }) => {
      try {
        secretLogger.log(application, category, message, details);
        return { success: true };
      } catch (error) {
        console.error("Error logging to secret logger:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );

  // Get secret logs
  ipcMain.handle("get-secret-logs", async () => {
    try {
      const logs = secretLogger.getLogs();
      logSystemInfo("Secret logs accessed by admin", { logCount: logs.length });
      return { success: true, logs };
    } catch (error) {
      console.error("Error getting secret logs:", error);
      logSystemError("Failed to retrieve secret logs", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Clear secret logs
  ipcMain.handle("clear-secret-logs", async () => {
    try {
      secretLogger.clearAllLogs();
      logSystemInfo("All secret logs cleared by admin");
      return { success: true };
    } catch (error) {
      console.error("Error clearing secret logs:", error);
      logSystemError("Failed to clear secret logs", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Get log settings
  ipcMain.handle("get-log-settings", async () => {
    try {
      const settings = secretLogger.getSettings();
      logSystemInfo("Log settings accessed by admin", settings);
      return { success: true, settings };
    } catch (error) {
      console.error("Error getting log settings:", error);
      logSystemError("Failed to retrieve log settings", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Update log settings
  ipcMain.handle("update-log-settings", async (event, newSettings) => {
    try {
      secretLogger.updateSettings(newSettings);
      logSystemInfo("Log settings updated by admin", newSettings);
      return { success: true };
    } catch (error) {
      console.error("Error updating log settings:", error);
      logSystemError("Failed to update log settings", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Export secret logs
  ipcMain.handle("export-secret-logs", async () => {
    try {
      const logs = secretLogger.getLogs();
      const result = await dialog.showSaveDialog({
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "Text Files", extensions: ["txt"] },
        ],
        defaultPath: `blessed-music-logs-${
          new Date().toISOString().split("T")[0]
        }.json`,
      });

      if (!result.canceled && result.filePath) {
        const exportData = {
          exportDate: new Date().toISOString(),
          totalLogs: logs.length,
          logs: logs,
        };

        fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
        logSystemInfo("Secret logs exported by admin", {
          filePath: result.filePath,
          logCount: logs.length,
        });
        return { success: true, filePath: result.filePath };
      }

      return { success: false, error: "Export cancelled" };
    } catch (error) {
      console.error("Error exporting secret logs:", error);
      logSystemError("Failed to export secret logs", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  console.log("✅ Secret logging handlers registered");
}
