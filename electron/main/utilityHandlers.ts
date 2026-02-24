import { ipcMain, dialog, shell, app, net } from "electron";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import zlib from "node:zlib";

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
 * Get system fonts from Windows Registry (async — does not block main thread)
 */
function getWindowsFonts(): Promise<string[]> {
  const fontsKey =
    "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts";

  return new Promise((resolve) => {
    exec(
      `reg query "${fontsKey}"`,
      { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
      (error, result) => {
        if (error) {
          console.error("Error loading fonts from registry:", error);
          resolve([]);
          return;
        }

        try {
          const lines = result.split("\n");
          const fontSet = new Set<string>();

          const protectedFontFamilies = [
            "Arial Black",
            "Courier New",
            "Times New Roman",
            "Trebuchet MS",
            "Comic Sans MS",
            "Cooper Black",
            "Archivo Black",
          ];

          const styleVariants = [
            "Bold Italic", "BoldItalic", "Bold", "Italic",
            "Light Italic", "Light", "Medium Italic", "Medium",
            "Semibold Italic", "Semibold", "Heavy Italic", "Heavy",
            "Thin Italic", "Thin", "ExtraLight Italic", "ExtraLight",
            "ExtraBold Italic", "ExtraBold", "Regular",
            "Condensed Bold", "Condensed", "Extended Bold", "Extended",
            "Narrow Bold", "Narrow",
          ];

          const protectedFontsFound = new Set<string>();

          for (const line of lines) {
            const match = line.trim().match(/^(.+?)\s+\(.*?\)\s+REG_SZ/);
            if (match) {
              let fontName = match[1].trim();
              fontName = fontName.replace(/\s+\(.*?\)$/, "");

              const isProtected = protectedFontFamilies.some(
                (p) => fontName.toLowerCase() === p.toLowerCase()
              );

              if (isProtected) {
                fontSet.add(fontName);
                protectedFontsFound.add(fontName.toLowerCase());
              } else {
                let baseFontName = fontName;
                for (const variant of styleVariants) {
                  const variantRegex = new RegExp(`\\s+${variant}$`, "i");
                  baseFontName = baseFontName.replace(variantRegex, "");
                }
                if (
                  baseFontName.length > 0 &&
                  !protectedFontsFound.has(baseFontName.toLowerCase())
                ) {
                  fontSet.add(baseFontName);
                }
              }
            }
          }

          resolve(Array.from(fontSet).sort((a, b) => a.localeCompare(b)));
        } catch (parseError) {
          console.error("Error parsing font registry output:", parseError);
          resolve([]);
        }
      }
    );
  });
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
      const fonts = await getWindowsFonts();

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

  // Proxy Bible API requests through the main process to bypass CORS.
  // The renderer cannot call bible-go-api.rkeplin.com directly because the API
  // only allows origin https://bible-ui.rkeplin.com. Node/Electron has no such
  // restriction, so we forward the request here and return the parsed JSON.
  ipcMain.handle("bible-api-fetch", async (_, apiPath: string): Promise<unknown> => {
    const url = `https://bible-go-api.rkeplin.com/v1${apiPath}`;

    return new Promise((resolve, reject) => {
      const request = net.request({ url, method: "GET" });

      // Accept JSON; request identity encoding so we always get plain text.
      // If the server ignores this and sends gzip anyway we decompress below.
      request.setHeader("Accept", "application/json");
      request.setHeader("Accept-Encoding", "gzip, deflate, identity");

      const chunks: Buffer[] = [];

      request.on("response", (response) => {
        const encoding = (response.headers["content-encoding"] as string | undefined) ?? "";

        // Fail fast on HTTP error status
        const status = response.statusCode ?? 200;
        if (status >= 400) {
          // Drain and discard the body so the socket is released
          response.on("data", () => {});
          response.on("end", () => {});
          reject(new Error(`Bible API returned HTTP ${status}`));
          return;
        }

        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const raw = Buffer.concat(chunks);

          const parse = (buf: Buffer) => {
            try {
              resolve(JSON.parse(buf.toString("utf-8")));
            } catch {
              reject(new Error("Bible API returned invalid JSON"));
            }
          };

          if (encoding.includes("gzip")) {
            zlib.gunzip(raw, (err, decoded) => {
              if (err) reject(err);
              else parse(decoded);
            });
          } else if (encoding.includes("deflate")) {
            zlib.inflate(raw, (err, decoded) => {
              if (err) reject(err);
              else parse(decoded);
            });
          } else {
            parse(raw);
          }
        });

        response.on("error", (err: Error) => reject(err));
      });

      request.on("error", (err: Error) => reject(err));
      request.end();
    });
  });

  console.log("✅ Utility handlers registered");
}
