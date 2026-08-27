import { ipcRenderer, contextBridge } from "electron";
import { DisplayInfo } from "@/types/electron-api";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

contextBridge.exposeInMainWorld("api", {
  maximizeApp: () => ipcRenderer.send("maximizeApp"),
  minimizeApp: () => ipcRenderer.send("minimizeApp"),
  closeApp: () => ipcRenderer.send("closeApp"),
  isProjectionActive: () => ipcRenderer.invoke("is-projection-active"),
  closeProjectionWindow: () => ipcRenderer.invoke("close-projection-window"),
  onProjectionStateChanged: (callback: (isActive: boolean) => void) => {
    ipcRenderer.on("projection-state-changed", (_event, isActive) =>
      callback(isActive),
    );
    return () => {
      ipcRenderer.removeAllListeners("projection-state-changed");
    };
  },
  onDisplayInfo: (callback: (info: DisplayInfo) => void) => {
    ipcRenderer.on("display-info", (_event, info) => callback(info));
    return () => {
      ipcRenderer.removeAllListeners("display-info");
    };
  },
  getImages: (dirPath: string) => ipcRenderer.invoke("get-images", dirPath),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  getSystemFonts: () => ipcRenderer.invoke("get-system-fonts"),

  // Bible Presentation API
  createBiblePresentationWindow: (data: any) =>
    ipcRenderer.invoke("create-bible-presentation-window", data),
  sendToBiblePresentation: (data: { type: string; data: any }) =>
    ipcRenderer.invoke("send-to-bible-presentation", data),
  onBiblePresentationUpdate: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on("bible-presentation-update", listener);
    return () => {
      ipcRenderer.removeListener("bible-presentation-update", listener);
    };
  },
  focusMainWindow: () => ipcRenderer.invoke("focus-main-window"),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  openInAppBrowser: (url: string) =>
    ipcRenderer.invoke("open-in-app-browser", url),
  downloadImage: (url: string, filename: string) =>
    ipcRenderer.invoke("download-image", { url, filename }),
  openFileInDefaultApp: (filePath: string) =>
    ipcRenderer.invoke("open-file-in-default-app", filePath),
  constructFilePath: (basePath: string, fileName: string) =>
    ipcRenderer.invoke("construct-file-path", basePath, fileName),
  getDisplayInfo: () => ipcRenderer.invoke("get-display-info"),
  logToSecretLogger: (logData: {
    application: string;
    category: string;
    message: string;
    details?: any;
  }) => ipcRenderer.invoke("log-to-secret-logger", logData),
  getSecretLogs: () => ipcRenderer.invoke("get-secret-logs"),
  clearSecretLogs: () => ipcRenderer.invoke("clear-secret-logs"),
  exportSecretLogs: () => ipcRenderer.invoke("export-secret-logs"),
  getLogSettings: () => ipcRenderer.invoke("get-log-settings"),
  updateLogSettings: (settings: any) =>
    ipcRenderer.invoke("update-log-settings", settings),

  // Display Management API
  getAllDisplays: () => ipcRenderer.invoke("get-all-displays"),
  setProjectionDisplay: (displayId: number) =>
    ipcRenderer.invoke("set-projection-display", displayId),

  // Preset Storage API
  getPresetsDirectory: () => ipcRenderer.invoke("get-presets-directory"),
  savePreset: (preset: any) => ipcRenderer.invoke("save-preset", preset),
  loadPreset: (presetId: string) => ipcRenderer.invoke("load-preset", presetId),
  deletePreset: (presetId: string) =>
    ipcRenderer.invoke("delete-preset", presetId),
  loadPresetMetadata: () => ipcRenderer.invoke("load-preset-metadata"),
  loadAllPresets: () => ipcRenderer.invoke("load-all-presets"),
  exportPresets: () => ipcRenderer.invoke("export-presets"),
  importPresets: () => ipcRenderer.invoke("import-presets"),
  searchPresets: (query: string, type?: string) =>
    ipcRenderer.invoke("search-presets", query, type),
  getStorageStats: () => ipcRenderer.invoke("get-storage-stats"),

  // Preset Settings API
  getPresetSettings: () => ipcRenderer.invoke("get-preset-settings"),
  updatePresetSettings: (settings: any) =>
    ipcRenderer.invoke("update-preset-settings", settings),

  // Projection Effects API
  toggleProjectionGrayscale: () =>
    ipcRenderer.invoke("toggle-projection-grayscale"),

  // Bible API proxy — routes through main process to bypass CORS
  bibleApiFetch: (apiPath: string) =>
    ipcRenderer.invoke("bible-api-fetch", apiPath),

  // SerpAPI Google AI Mode proxy — routes through main process to bypass CORS
  serpApiSearch: (query: string, token?: string) =>
    ipcRenderer.invoke("serp-api-search", { query, token }),

  // SerpAPI Google Images proxy — routes through main process to bypass CORS
  serpApiImages: (query: string) =>
    ipcRenderer.invoke("serp-api-images", { query }),

  // SerpAPI Google Autocomplete proxy — returns suggestions for a query prefix
  serpApiAutocomplete: (query: string) =>
    ipcRenderer.invoke("serp-api-autocomplete", { query }),

  // AI Image Generation — downloads image to user-chosen dir, returns local-image:// URL
  generateAiImage: (data: { prompt: string; saveDir: string }) =>
    ipcRenderer.invoke("generate-ai-image", data),

  // ── System: Native Notifications ────────────────────────────────────────
  showNativeNotification: (opts: {
    title: string;
    body: string;
    silent?: boolean;
    urgency?: "normal" | "critical" | "low";
  }) => ipcRenderer.invoke("show-notification", opts),
  isNotificationSupported: () => ipcRenderer.invoke("notification-supported"),

  // ── System: PowerSaveBlocker ─────────────────────────────────────────────
  powerSaveStart: () => ipcRenderer.invoke("power-save-start"),
  powerSaveStop: () => ipcRenderer.invoke("power-save-stop"),
  powerSaveStatus: () => ipcRenderer.invoke("power-save-status"),
  powerSaveSetAuto: (enabled: boolean) =>
    ipcRenderer.invoke("power-save-set-auto", enabled),
  onPowerSaveStatus: (
    cb: (status: {
      active: boolean;
      id: number | null;
      autoMode?: boolean;
    }) => void,
  ) => {
    const listener = (_e: any, data: any) => cb(data);
    ipcRenderer.on("power-save-status", listener);
    return () => ipcRenderer.removeListener("power-save-status", listener);
  },

  // ── System: Tray ─────────────────────────────────────────────────────────
  traySyncState: (state: {
    projectionActive?: boolean;
    blankScreen?: boolean;
    presetName?: string;
  }) => ipcRenderer.invoke("tray-sync-state", state),
  trayUpdateTooltip: (tooltip: string) =>
    ipcRenderer.invoke("tray-update-tooltip", tooltip),
  onTrayAction: (cb: (action: { action: string }) => void) => {
    const listener = (_e: any, data: any) => cb(data);
    ipcRenderer.on("tray-action", listener);
    return () => ipcRenderer.removeListener("tray-action", listener);
  },

  // ── Smart Scripture Listening & Projection ────────────────────────────────
  startSmartListening: () =>
    ipcRenderer.invoke("smart-projection:start-streaming"),
  sendAudioChunk: (chunk: ArrayBuffer | Uint8Array) =>
    ipcRenderer.send("smart-projection:audio-chunk", chunk),
  stopSmartListening: () =>
    ipcRenderer.invoke("smart-projection:stop-streaming"),
  extractScriptureReference: (transcript: string) =>
    ipcRenderer.invoke("smart-projection:extract-reference", transcript),
  getSmartProjectionKeyStatus: () =>
    ipcRenderer.invoke("smart-projection:get-keys-status"),
  saveSmartProjectionKeys: (keys: {
    assemblyAiKey?: string;
    groqKey?: string;
    geminiKey?: string;
    selectedAiProvider?: "groq" | "gemini";
  }) => ipcRenderer.invoke("smart-projection:save-keys", keys),
  onSmartTranscript: (
    cb: (result: {
      text: string;
      isFinal: boolean;
      confidence?: number;
    }) => void,
  ) => {
    const listener = (_e: any, data: any) => cb(data);
    ipcRenderer.on("smart-projection:transcript", listener);
    return () =>
      ipcRenderer.removeListener("smart-projection:transcript", listener);
  },
  onSmartProjectionStatus: (
    cb: (status: { connected: boolean; isStreaming: boolean }) => void,
  ) => {
    const listener = (_e: any, data: any) => cb(data);
    ipcRenderer.on("smart-projection:status", listener);
    return () =>
      ipcRenderer.removeListener("smart-projection:status", listener);
  },
  onSmartProjectionError: (cb: (err: { message: string }) => void) => {
    const listener = (_e: any, data: any) => cb(data);
    ipcRenderer.on("smart-projection:error", listener);
    return () => ipcRenderer.removeListener("smart-projection:error", listener);
  },
});

// --------- Preload scripts loading ---------
function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"],
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const styleContent = `
@keyframes splash-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(12px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes icon-hover-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes shimmer-move {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.85;
  }
}

.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1c1c1c;
  z-index: 99999;
  user-select: none;
  overflow: hidden;
  font-family: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: opacity 0.45s ease-out, transform 0.45s ease-out;
}

.app-loading-wrap.fade-out {
  opacity: 0;
  transform: scale(1.03);
  pointer-events: none;
}

/* Master Splash Container */
.splash-container {
  position: relative;
  width: 630px;
  height: 340px;
  display: flex;
  align-items: center;
  animation: splash-pop-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Left Pill Card (Solid Pure White with BOR & THE BOOK OF REDEMPTION) */
.splash-left-card {
  position: absolute;
  left: 0;
  width: 460px;
  height: 310px;
  background: #ffffff;
  border-radius: 155px 36px 36px 155px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 56px;
  padding-right: 175px;
  box-sizing: border-box;
  z-index: 1;
}

.left-card-bor {
  color: #18181b;
  font-size: 52px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 2px;
  margin: 0;
}

.left-card-title {
  color: #27272a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: 2.2px;
  text-transform: uppercase;
  margin: 8px 0 0 0;
}

.left-card-subtitle {
  color: #71717a;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin: 4px 0 0 0;
  text-transform: uppercase;
}

/* Shimmer Progress in White Card */
.left-progress-track {
  width: 140px;
  height: 3px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  margin-top: 24px;
}

.left-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 55px;
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, transparent, #18181b, transparent);
  animation: shimmer-move 1.4s ease-in-out infinite;
}

.left-status {
  color: #71717a;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 8px;
  animation: pulse-subtle 2.4s ease-in-out infinite;
}

/* Right Overlapping Disc (Dark Theme with Only Big App Icon) */
.splash-right-disc {
  position: absolute;
  right: 0;
  width: 320px;
  height: 320px;
  background: #141414;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  box-shadow: -18px 0 45px rgba(0, 0, 0, 0.65), 0 25px 55px rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-sizing: border-box;
}

.big-app-icon {
  width: 175px;
  height: 175px;
  object-fit: contain;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.65));
  animation: icon-hover-float 3.5s ease-in-out infinite alternate;
}
  `;

  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `
    <div class="splash-container">
      <!-- Left Pill Card (White Portion with BOR & THE BOOK OF REDEMPTION) -->
      <div class="splash-left-card">
        <h1 class="left-card-bor">BOR</h1>
        <h2 class="left-card-title">The Book of<br/>Redemption</h2>
        <p class="left-card-subtitle">Presentation Studio</p>
        <div class="left-progress-track">
          <div class="left-progress-bar"></div>
        </div>
        <span class="left-status">Initializing workspace...</span>
      </div>

      <!-- Right Overlapping Disc (Dark Theme with Big App Icon Only) -->
      <div class="splash-right-disc">
        <img src="./bibleicon.png" alt="The Book of Redemption Icon" class="big-app-icon" />
      </div>
    </div>
  `;

  let isRemoved = false;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      if (isRemoved) return;
      isRemoved = true;
      oDiv.classList.add("fade-out");
      setTimeout(() => {
        safeDOM.remove(document.head, oStyle);
        safeDOM.remove(document.body, oDiv);
      }, 450);
    },
  };
}


// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 8000);



