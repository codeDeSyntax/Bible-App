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

  // AI Image Generation — keeps API keys server-side, returns base64 data URL
  ipcMain.handle(
    "generate-ai-image",
    async (
      _,
      {
        provider,
        prompt,
        aspectRatio = "16:9",
      }: {
        provider: "stability" | "picsart";
        prompt: string;
        aspectRatio?: string;
      },
    ): Promise<{ success: boolean; imageDataUrl?: string; error?: string }> => {
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

      try {
        if (provider === "stability") {
          const apiKey = getKey("STABLE_DIFFUSION_API_KEY");
          if (!apiKey)
            return {
              success: false,
              error:
                "Stability AI key not found in .env (STABLE_DIFFUSION_API_KEY)",
            };

          const formData = new FormData();
          formData.append("prompt", prompt);
          formData.append("aspect_ratio", aspectRatio);
          formData.append("output_format", "png");

          const response = await fetch(
            "https://api.stability.ai/v2beta/stable-image/generate/ultra",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "image/*",
              },
              body: formData,
            },
          );

          if (!response.ok) {
            const errText = await response.text();
            return {
              success: false,
              error: `Stability AI error ${response.status}: ${errText.slice(0, 200)}`,
            };
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          return {
            success: true,
            imageDataUrl: `data:image/png;base64,${buffer.toString("base64")}`,
          };
        } else if (provider === "picsart") {
          const apiKey = getKey("PICSART_API_KEY");
          if (!apiKey)
            return {
              success: false,
              error: "Picsart API key not found in .env (PICSART_API_KEY)",
            };

          // Step 1: Submit generation job
          const createRes = await fetch(
            "https://genai-api.picsart.io/v1/text2image",
            {
              method: "POST",
              headers: {
                "X-Picsart-API-Key": apiKey,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              // Picsart has a short prompt limit (~500 chars) — truncate at word boundary
              body: JSON.stringify({
                prompt:
                  prompt.length > 500
                    ? prompt.slice(0, 500).replace(/\s+\S*$/, "") + "…"
                    : prompt,
                width: 1024,
                height: 576,
                count: 1,
              }),
            },
          );

          if (!createRes.ok) {
            const errText = await createRes.text();
            return {
              success: false,
              error: `Picsart submit error ${createRes.status}: ${errText.slice(0, 200)}`,
            };
          }

          const createData = (await createRes.json()) as {
            inference_id: string;
          };
          const inferenceId = createData.inference_id;
          if (!inferenceId)
            return {
              success: false,
              error: "Picsart did not return an inference_id",
            };

          // Step 2: Poll until success (max ~60s, 5s interval)
          for (let attempt = 0; attempt < 12; attempt++) {
            await new Promise((r) => setTimeout(r, 5000));

            const pollRes = await fetch(
              `https://genai-api.picsart.io/v1/text2image/inferences/${inferenceId}`,
              {
                headers: {
                  "X-Picsart-API-Key": apiKey,
                  Accept: "application/json",
                },
              },
            );

            if (!pollRes.ok) {
              console.warn(
                `Picsart poll attempt ${attempt + 1} returned HTTP ${pollRes.status}`,
              );
              continue;
            }

            const pollData = (await pollRes.json()) as {
              status: string;
              data?: Array<{ url: string }>;
            };

            console.log(
              `Picsart poll attempt ${attempt + 1}: status=${pollData.status}`,
            );

            if (pollData.status === "success" && pollData.data?.[0]?.url) {
              const imgRes = await fetch(pollData.data[0].url);
              if (!imgRes.ok)
                return {
                  success: false,
                  error: "Failed to download Picsart image",
                };
              const buffer = Buffer.from(await imgRes.arrayBuffer());
              return {
                success: true,
                imageDataUrl: `data:image/png;base64,${buffer.toString("base64")}`,
              };
            } else if (pollData.status === "failed") {
              return { success: false, error: "Picsart generation failed" };
            }
            // Still processing — keep polling
          }
          return {
            success: false,
            error: "Picsart generation timed out (60s)",
          };
        }

        return { success: false, error: "Unknown provider" };
      } catch (err: any) {
        console.error("generate-ai-image error:", err);
        return { success: false, error: err?.message || "Unknown error" };
      }
    },
  );

  console.log("✅ Utility handlers registered");
}
