import { ipcMain, dialog, shell, app, net, BrowserWindow } from "electron";
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

          const protectedFontsFound = new Set<string>();

          for (const line of lines) {
            const match = line.trim().match(/^(.+?)\s+\(.*?\)\s+REG_SZ/);
            if (match) {
              let fontName = match[1].trim();
              fontName = fontName.replace(/\s+\(.*?\)$/, "");

              const isProtected = protectedFontFamilies.some(
                (p) => fontName.toLowerCase() === p.toLowerCase(),
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
      },
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
    },
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

  // Open a URL in the system default browser (avoids spawning Electron windows)
  ipcMain.handle("open-external", async (_, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Open a URL in an in-app browser window (no external browser)
  ipcMain.handle("open-in-app-browser", async (_, url: string) => {
    try {
      // Check if URL is an image
      const imageExtensions =
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)(\?.*)?$/i;
      const isImage = imageExtensions.test(url);

      let hostname = url;
      let title = "Browser";
      try {
        const urlObj = new URL(url);
        hostname = urlObj.hostname;
        // Extract filename from URL for image titles
        if (isImage) {
          const pathParts = urlObj.pathname.split("/");
          title =
            decodeURIComponent(pathParts[pathParts.length - 1]) || "Image";
        }
      } catch {}

      const browserWin = new BrowserWindow({
        width: isImage ? 1280 : 1280,
        height: isImage ? 860 : 860,
        title: isImage ? title : hostname,
        frame: true,
        autoHideMenuBar: true,
        icon: path.join(process.env.VITE_PUBLIC!, "bibleicon.png"),
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
      });

      if (isImage) {
        // Load image viewer with zoom/pan
        const encodedUrl = encodeURIComponent(url);
        const encodedName = encodeURIComponent(title);
        const viewerUrl = `file://${path.join(process.env.VITE_PUBLIC!, "image-viewer.html")}?url=${encodedUrl}&name=${encodedName}`;
        browserWin.loadURL(viewerUrl);
      } else {
        browserWin.loadURL(url);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Download an image from a URL — prompts the user for a save location
  ipcMain.handle(
    "download-image",
    async (_, { url, filename }: { url: string; filename: string }) => {
      try {
        // Prompt user for save location
        const { filePath, canceled } = await dialog.showSaveDialog({
          defaultPath: path.join(app.getPath("downloads"), filename),
          filters: [
            {
              name: "Images",
              extensions: ["jpg", "jpeg", "png", "webp", "gif"],
            },
            { name: "All Files", extensions: ["*"] },
          ],
        });

        if (canceled || !filePath) return { success: false, canceled: true };

        // Fetch image bytes via net module (bypasses CORS / renderer restrictions)
        const buffer = await new Promise<Buffer>((resolve, reject) => {
          const req = net.request({ url, method: "GET" });
          const chunks: Buffer[] = [];
          req.on("response", (response) => {
            if ((response.statusCode ?? 0) >= 400) {
              reject(new Error(`HTTP ${response.statusCode}`));
              return;
            }
            response.on("data", (chunk: Buffer) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks)));
            response.on("error", reject);
          });
          req.on("error", reject);
          req.end();
        });

        fs.writeFileSync(filePath, buffer);
        return { success: true, filePath };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
  );

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
    },
  );

  // Proxy Bible API requests through the main process to bypass CORS.
  // The renderer cannot call bible-go-api.rkeplin.com directly because the API
  // only allows origin https://bible-ui.rkeplin.com. Node/Electron has no such
  // restriction, so we forward the request here and return the parsed JSON.
  ipcMain.handle(
    "bible-api-fetch",
    async (_, apiPath: string): Promise<unknown> => {
      const url = `https://bible-go-api.rkeplin.com/v1${apiPath}`;

      return new Promise((resolve, reject) => {
        const request = net.request({ url, method: "GET" });

        // Accept JSON; request identity encoding so we always get plain text.
        // If the server ignores this and sends gzip anyway we decompress below.
        request.setHeader("Accept", "application/json");
        request.setHeader("Accept-Encoding", "gzip, deflate, identity");

        const chunks: Buffer[] = [];

        request.on("response", (response) => {
          const encoding =
            (response.headers["content-encoding"] as string | undefined) ?? "";

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
    },
  );

  // SerpAPI proxy — routes through main process to bypass CORS.
  // Renderer calls window.api.serpApiSearch(query, token?) and gets parsed JSON back.
  ipcMain.handle(
    "serp-api-search",
    async (
      _,
      { query, token }: { query: string; token?: string },
    ): Promise<unknown> => {
      const SERP_API_KEY =
        "9152f16b7ae06b728267f6613d48d736b6f1c27573a2e5ae54ffa20a10be9f3e";

      const params = new URLSearchParams({
        engine: "google_ai_mode",
        q: query,
        api_key: SERP_API_KEY,
      });
      if (token) params.set("subsequent_request_token", token);

      const url = `https://serpapi.com/search.json?${params.toString()}`;

      return new Promise((resolve, reject) => {
        const request = net.request({ url, method: "GET" });
        // Request identity (no compression) so we always get plain UTF-8 JSON.
        request.setHeader("Accept", "application/json");
        request.setHeader("Accept-Encoding", "identity");

        const chunks: Buffer[] = [];

        request.on("response", (response) => {
          const encoding =
            (response.headers["content-encoding"] as string | undefined) ?? "";

          const status = response.statusCode ?? 200;
          if (status >= 400) {
            response.on("data", () => {});
            response.on("end", () => {});
            reject(new Error(`SerpAPI returned HTTP ${status}`));
            return;
          }

          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () => {
            const raw = Buffer.concat(chunks);

            const tryParse = (buf: Buffer) => {
              try {
                resolve(JSON.parse(buf.toString("utf-8")));
              } catch {
                reject(new Error("SerpAPI returned invalid JSON"));
              }
            };

            // Defensive: try to decompress if the server ignored our identity request
            if (encoding.includes("gzip")) {
              zlib.gunzip(raw, (err, decoded) =>
                err ? tryParse(raw) : tryParse(decoded),
              );
            } else if (encoding.includes("br")) {
              zlib.brotliDecompress(raw, (err, decoded) =>
                err ? tryParse(raw) : tryParse(decoded),
              );
            } else {
              tryParse(raw);
            }
          });

          response.on("error", (err: Error) => reject(err));
        });

        request.on("error", (err: Error) => reject(err));
        request.end();
      });
    },
  );

  // SerpAPI Google Autocomplete proxy — returns suggestions for a query prefix
  ipcMain.handle(
    "serp-api-autocomplete",
    async (_, { query }: { query: string }): Promise<unknown> => {
      const SERP_API_KEY =
        "9152f16b7ae06b728267f6613d48d736b6f1c27573a2e5ae54ffa20a10be9f3e";

      const params = new URLSearchParams({
        engine: "google_autocomplete",
        q: query,
        hl: "en",
        gl: "us",
        api_key: SERP_API_KEY,
      });

      const url = `https://serpapi.com/search.json?${params.toString()}`;

      return new Promise((resolve, reject) => {
        const request = net.request({ url, method: "GET" });
        request.setHeader("Accept", "application/json");
        request.setHeader("Accept-Encoding", "identity");

        const chunks: Buffer[] = [];
        request.on("response", (response) => {
          const status = response.statusCode ?? 200;
          if (status >= 400) {
            response.on("data", () => {});
            response.on("end", () => {});
            reject(new Error(`SerpAPI autocomplete returned HTTP ${status}`));
            return;
          }
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
            } catch {
              reject(new Error("Invalid JSON"));
            }
          });
          response.on("error", reject);
        });
        request.on("error", reject);
        request.end();
      });
    },
  );

  // SerpAPI Google Images proxy — routes through main process to bypass CORS.
  ipcMain.handle(
    "serp-api-images",
    async (_, { query }: { query: string }): Promise<unknown> => {
      const SERP_API_KEY =
        "9152f16b7ae06b728267f6613d48d736b6f1c27573a2e5ae54ffa20a10be9f3e";

      const params = new URLSearchParams({
        engine: "google_images",
        q: query,
        hl: "en",
        gl: "us",
        api_key: SERP_API_KEY,
      });

      const url = `https://serpapi.com/search.json?${params.toString()}`;

      return new Promise((resolve, reject) => {
        const request = net.request({ url, method: "GET" });
        request.setHeader("Accept", "application/json");
        request.setHeader("Accept-Encoding", "identity");

        const chunks: Buffer[] = [];

        request.on("response", (response) => {
          const encoding =
            (response.headers["content-encoding"] as string | undefined) ?? "";

          const status = response.statusCode ?? 200;
          if (status >= 400) {
            response.on("data", () => {});
            response.on("end", () => {});
            reject(new Error(`SerpAPI Images returned HTTP ${status}`));
            return;
          }

          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () => {
            const raw = Buffer.concat(chunks);
            const tryParse = (buf: Buffer) => {
              try {
                resolve(JSON.parse(buf.toString("utf-8")));
              } catch {
                reject(new Error("SerpAPI Images returned invalid JSON"));
              }
            };
            if (encoding.includes("gzip")) {
              zlib.gunzip(raw, (err, decoded) =>
                err ? tryParse(raw) : tryParse(decoded),
              );
            } else if (encoding.includes("br")) {
              zlib.brotliDecompress(raw, (err, decoded) =>
                err ? tryParse(raw) : tryParse(decoded),
              );
            } else {
              tryParse(raw);
            }
          });

          response.on("error", (err: Error) => reject(err));
        });

        request.on("error", (err: Error) => reject(err));
        request.end();
      });
    },
  );

  // AI Image Generation — downloads image to user-chosen directory,
  // returns a local-image:// URL the renderer can use directly.
  ipcMain.handle(
    "generate-ai-image",
    async (
      _,
      {
        prompt,
        saveDir,
      }: {
        prompt: string;
        saveDir: string;
      },
    ): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
      // Read API keys from process.env or fall back to .env file directly
      const getKey = (key: string): string | undefined => {
        if (process.env[key]) return process.env[key];
        try {
          const appRoot = process.env.APP_ROOT || path.join(__dirname, "../..");
          const envPath = path.join(appRoot, ".env");
          if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf-8");
            const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
            return match?.[1]?.trim();
          }
        } catch {}
        return undefined;
      };

      /** Download image buffer from a URL, save to saveDir, return local-image:// URL */
      const downloadAndSave = async (remoteUrl: string): Promise<string> => {
        const imgRes = await fetch(remoteUrl);
        if (!imgRes.ok)
          throw new Error("Failed to download image from Replicate");
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        // Ensure saveDir exists
        if (!fs.existsSync(saveDir)) {
          fs.mkdirSync(saveDir, { recursive: true });
        }
        const filename = `flyer_${Date.now()}.jpg`;
        const filePath = path.join(saveDir, filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ AI image saved to: ${filePath}`);
        return `local-image://${encodeURIComponent(filePath)}`;
      };

      try {
        if (!saveDir || !saveDir.trim()) {
          return {
            success: false,
            error:
              "No save directory specified. Please choose a folder for AI flyer images first.",
          };
        }

        const apiKey = getKey("REPLICATE_API_TOKEN");
        if (!apiKey)
          return {
            success: false,
            error:
              "Replicate API token not found in .env (REPLICATE_API_TOKEN)",
          };

        // Submit prediction — using "Prefer: wait" for synchronous response (up to 60s)
        const submitRes = await fetch(
          "https://api.replicate.com/v1/models/google/imagen-4/predictions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              Prefer: "wait",
            },
            body: JSON.stringify({
              input: {
                prompt,
                negative_prompt:
                  "people, person, human, man, woman, child, face, portrait, crowd, congregation, pastor, preacher, silhouette of person, hands, body parts, cartoon character, anime character, avatar, realistic human, photo of person",
                aspect_ratio: "16:9",
                image_size: "1K",
                output_format: "jpg",
                safety_filter_level: "block_medium_and_above",
              },
            }),
          },
        );

        if (!submitRes.ok) {
          const errText = await submitRes.text();
          return {
            success: false,
            error: `Replicate error ${submitRes.status}: ${errText.slice(0, 200)}`,
          };
        }

        const prediction = (await submitRes.json()) as {
          id: string;
          status: string;
          output?: string; // imagen-4 returns a single URI string
          urls?: { get: string };
          error?: string;
        };

        // If synchronous response already has output, download & save to disk
        if (prediction.status === "succeeded" && prediction.output) {
          const imageUrl = await downloadAndSave(prediction.output);
          return { success: true, imageUrl };
        }

        if (prediction.status === "failed") {
          return {
            success: false,
            error: prediction.error || "Replicate generation failed",
          };
        }

        // Fallback: poll if "Prefer: wait" timed out and prediction is still processing
        const pollUrl = prediction.urls?.get;
        if (!pollUrl)
          return {
            success: false,
            error: "Replicate did not return a poll URL",
          };

        for (let attempt = 0; attempt < 24; attempt++) {
          await new Promise((r) => setTimeout(r, 2500));

          const pollRes = await fetch(pollUrl, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });

          if (!pollRes.ok) {
            console.warn(
              `Replicate poll attempt ${attempt + 1} returned HTTP ${pollRes.status}`,
            );
            continue;
          }

          const pollData = (await pollRes.json()) as {
            status: string;
            output?: string; // single URI string
            error?: string;
          };

          console.log(
            `Replicate poll attempt ${attempt + 1}: status=${pollData.status}`,
          );

          if (pollData.status === "succeeded" && pollData.output) {
            const imageUrl = await downloadAndSave(pollData.output);
            return { success: true, imageUrl };
          } else if (pollData.status === "failed") {
            return {
              success: false,
              error: pollData.error || "Replicate generation failed",
            };
          }
          // Still processing — keep polling
        }

        return {
          success: false,
          error: "Replicate generation timed out (60s)",
        };
      } catch (err: any) {
        console.error("generate-ai-image error:", err);
        return { success: false, error: err?.message || "Unknown error" };
      }
    },
  );

  console.log("✅ Utility handlers registered");
}
