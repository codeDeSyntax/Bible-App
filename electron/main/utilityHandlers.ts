import { ipcMain, dialog, shell } from "electron";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * Utility Handlers Module
 * Handles miscellaneous utility IPC operations
 */

/**
 * Get system fonts from Windows Registry
 */
function getWindowsFonts(): string[] {
  try {
    // Read fonts from Windows Registry
    const fontsKey =
      "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts";
    const result = execSync(`reg query "${fontsKey}"`, {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });

    // Parse font names from registry output
    const lines = result.split("\n");
    const fontSet = new Set<string>();

    for (const line of lines) {
      // Match lines like: "Arial (TrueType)    REG_SZ    arial.ttf"
      const match = line.trim().match(/^(.+?)\s+\(.*?\)\s+REG_SZ/);
      if (match) {
        let fontName = match[1].trim();
        // Clean up font name
        fontName = fontName.replace(/\s+\(.*?\)$/, ""); // Remove trailing variants
        if (fontName && fontName.length > 0) {
          fontSet.add(fontName);
        }
      }
    }

    // Convert to sorted array
    const fonts = Array.from(fontSet).sort((a, b) => a.localeCompare(b));
    console.log(`✅ Loaded ${fonts.length} fonts from Windows Registry`);
    return fonts;
  } catch (error) {
    console.error("Error loading fonts from registry:", error);
    return [];
  }
}

export function setupUtilityHandlers() {
  // Handle selecting a directory via the file dialog
  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // Handle getting system fonts
  ipcMain.handle("get-system-fonts", async () => {
    try {
      const fonts = getWindowsFonts();

      if (fonts.length > 0) {
        return fonts;
      }

      // Fallback to default fonts
      console.warn("⚠️ No fonts found, using defaults");
      return [
        "Arial",
        "Times New Roman",
        "Georgia",
        "Verdana",
        "Courier New",
        "Impact",
        "Comic Sans MS",
        "Trebuchet MS",
        "Tahoma",
      ];
    } catch (error) {
      console.error("Error loading system fonts:", error);
      // Return default fonts if there's an error
      return [
        "Arial",
        "Times New Roman",
        "Georgia",
        "Verdana",
        "Courier New",
        "Impact",
        "Comic Sans MS",
        "Trebuchet MS",
        "Tahoma",
      ];
    }
  });

  // Handler to construct file path properly
  ipcMain.handle(
    "construct-file-path",
    async (_, basePath: string, fileName: string) => {
      try {
        const fullPath = path.join(basePath, fileName);
        return { success: true, path: fullPath };
      } catch (error) {
        console.error("Error constructing file path:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to construct path",
        };
      }
    }
  );

  // Handler to open file in default app (e.g., notepad for .txt files)
  ipcMain.handle("open-file-in-default-app", async (_, filePath: string) => {
    try {
      // Normalize the path to handle different path separators
      const normalizedPath = path.normalize(filePath);

      // Check if file exists before trying to open
      if (!fs.existsSync(normalizedPath)) {
        return {
          success: false,
          error: `File not found: ${normalizedPath}`,
        };
      }

      await shell.openPath(normalizedPath);
      return { success: true };
    } catch (error) {
      console.error("Error opening file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to open file",
      };
    }
  });

  console.log("✅ Utility handlers registered");
}
