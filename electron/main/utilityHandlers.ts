import { ipcMain, dialog, shell, app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * Utility Handlers Module
 * Handles miscellaneous utility IPC operations
 */

/**
 * Preset Settings Interface
 */
interface PresetSettings {
  videoAutoPlay: boolean;
  backgroundOpacity: number;
}

/**
 * Get preset settings file path
 */
function getPresetSettingsPath(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "preset-settings.json");
}

/**
 * Load preset settings from file
 */
function loadPresetSettings(): PresetSettings {
  try {
    const settingsPath = getPresetSettingsPath();
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading preset settings:", error);
  }
  // Return default settings
  return {
    videoAutoPlay: true,
    backgroundOpacity: 40,
  };
}

/**
 * Save preset settings to file
 */
function savePresetSettings(settings: Partial<PresetSettings>): void {
  try {
    const settingsPath = getPresetSettingsPath();
    const currentSettings = loadPresetSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));
  } catch (error) {
    console.error("Error saving preset settings:", error);
    throw error;
  }
}

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

    // Font families that should NOT be filtered (these are actual font families, not variants)
    const protectedFontFamilies = [
      "Arial Black",
      "Courier New",
      "Times New Roman",
      "Trebuchet MS",
      "Comic Sans MS",
      "Cooper Black",
      "Archivo Black",
    ];

    // Common font style variants to remove (only if not in protected list)
    // Order matters: check compound variants first (Bold Italic before Bold)
    const styleVariants = [
      "Bold Italic",
      "BoldItalic",
      "Bold",
      "Italic",
      "Light Italic",
      "Light",
      "Medium Italic",
      "Medium",
      "Semibold Italic",
      "Semibold",
      "Heavy Italic",
      "Heavy",
      "Thin Italic",
      "Thin",
      "ExtraLight Italic",
      "ExtraLight",
      "ExtraBold Italic",
      "ExtraBold",
      "Regular",
      "Condensed Bold",
      "Condensed",
      "Extended Bold",
      "Extended",
      "Narrow Bold",
      "Narrow",
    ];

    // Track protected fonts separately to ensure they're preserved
    const protectedFontsFound = new Set<string>();

    for (const line of lines) {
      // Match lines like: "Arial Bold (TrueType)    REG_SZ    arialbd.ttf"
      const match = line.trim().match(/^(.+?)\s+\(.*?\)\s+REG_SZ/);
      if (match) {
        let fontName = match[1].trim();

        // Remove trailing variants in parentheses
        fontName = fontName.replace(/\s+\(.*?\)$/, "");

        // Check if this is a protected font family (add as-is)
        const isProtected = protectedFontFamilies.some(
          (protectedFont) =>
            fontName.toLowerCase() === protectedFont.toLowerCase()
        );

        if (isProtected) {
          fontSet.add(fontName);
          protectedFontsFound.add(fontName.toLowerCase());
        } else {
          // Remove style variants from font name
          let baseFontName = fontName;
          let originalName = fontName;

          for (const variant of styleVariants) {
            // Remove variant if it appears at the end of the font name
            const variantRegex = new RegExp(`\\s+${variant}$`, "i");
            baseFontName = baseFontName.replace(variantRegex, "");
          }

          // Only add the base font if it has content and not a protected font
          if (
            baseFontName &&
            baseFontName.length > 0 &&
            !protectedFontsFound.has(baseFontName.toLowerCase())
          ) {
            fontSet.add(baseFontName);
          }
        }
      }
    }

    // Convert to sorted array
    const fonts = Array.from(fontSet).sort((a, b) => a.localeCompare(b));
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

  // Handler to get preset settings
  ipcMain.handle("get-preset-settings", async () => {
    try {
      const settings = loadPresetSettings();
      return settings;
    } catch (error) {
      console.error("Error getting preset settings:", error);
      return {
        videoAutoPlay: true,
        backgroundOpacity: 40,
      };
    }
  });

  // Handler to update preset settings
  ipcMain.handle(
    "update-preset-settings",
    async (_, settings: Partial<PresetSettings>) => {
      try {
        savePresetSettings(settings);
        return { success: true };
      } catch (error) {
        console.error("Error updating preset settings:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to save settings",
        };
      }
    }
  );

  console.log("✅ Utility handlers registered");
}
