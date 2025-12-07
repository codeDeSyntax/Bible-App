import { app, BrowserWindow, ipcMain, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
// Import secret logger
import { logSystemInfo } from "../../src/utils/SecretLogger";
// Import managers and handlers
import * as projectionManager from "./projectionManager";
import { registerImageProtocol, setupImageHandlers } from "./imageManager";
import { setupSecretLoggingHandlers } from "./secretLoggingHandlers";
import { setupPresetHandlers } from "./presetHandlers";
import { setupUtilityHandlers } from "./utilityHandlers";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWin: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const projectionHtml = path.join(RENDERER_DIST, "projection.html");

async function createMainWindow() {
  // Detect the internal (laptop) display for the controller
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  // Strategy: Main window should go to internal display (laptop screen)
  const internalDisplay = displays.find((d) => d.internal);
  const controllerDisplay = internalDisplay || primaryDisplay;

  console.log("🖥️ Main Window Display Selection:", {
    totalDisplays: displays.length,
    selectedDisplay: controllerDisplay.id,
    isInternal: controllerDisplay.internal,
    bounds: controllerDisplay.bounds,
  });

  mainWin = new BrowserWindow({
    title: "Main window",
    frame: false,
    x: controllerDisplay.bounds.x,
    y: controllerDisplay.bounds.y,
    width: controllerDisplay.bounds.width,
    height: controllerDisplay.bounds.height,
    icon: path.join(process.env.VITE_PUBLIC, "bibleicon.png"),
    webPreferences: {
      preload,
      // devTools: false,
      nodeIntegration: false,
      contextIsolation: true,
      zoomFactor: 1.0,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWin.loadURL(VITE_DEV_SERVER_URL);
    mainWin.maximize();
    mainWin.setMenuBarVisibility(false);
    mainWin.webContents.openDevTools();
    mainWin.webContents.setZoomFactor(1.0);
  } else {
    mainWin.maximize();
    mainWin.setMenuBarVisibility(false);
    // mainWin.webContents.openDevTools();
    mainWin.loadFile(indexHtml);
  }

  mainWin.webContents.on("before-input-event", (event, input) => {
    if (
      input.key === "F12" || // Disable F12 for dev tools
      (input.key === "I" && input.control && input.shift) || // Disable Ctrl+Shift+I or Cmd+Opt+I
      (input.key === "R" && input.control) || // Disable Ctrl+R for reload
      (input.key === "R" && input.meta) // Disable Cmd+R for reload on macOS
    ) {
      event.preventDefault();
    }

    // Global ESC handler - minimize projection window from main window
    if (input.type === "keyDown" && input.key === "Escape") {
      const { biblePresentationWin } = projectionManager.getProjectionState();
      if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
        console.log(
          "🔽 ESC pressed from main window - minimizing projection window"
        );
        biblePresentationWin.minimize();
      }
    }
  });

  ipcMain.on("minimizeApp", () => {
    mainWin?.minimize();
  });
  ipcMain.on("maximizeApp", () => {
    if (mainWin?.isMaximized()) {
      mainWin?.unmaximize();
    } else {
      mainWin?.maximize();
    }
  });
  ipcMain.on("closeApp", () => {
    mainWin?.close();
  });

  // Handle main window close event to cleanup all child windows
  mainWin.on("closed", () => {
    const { biblePresentationWin } = projectionManager.getProjectionState();

    logSystemInfo("Main application window closed", {
      biblePresentationActive: !!(
        biblePresentationWin && !biblePresentationWin.isDestroyed()
      ),
    });

    // Close all projection windows using projection manager
    projectionManager.closeAllProjectionWindows();

    // Clear main window reference
    mainWin = null;
  });

  // Ensure main window stays focused when clicked (church presentation mode)
  // This prevents projection window from ever taking over the controller's screen
  mainWin.on("focus", () => {
    console.log("✅ Main window focused - controller screen active");
  });

  // If main window is shown or restored, ensure it gets focus
  mainWin.on("show", () => {
    mainWin?.focus();
  });

  mainWin.on("restore", () => {
    mainWin?.focus();
  });

  return mainWin;
}

app.whenReady().then(() => {
  // Register custom protocol for images
  registerImageProtocol();

  // Initialize projection manager with required paths
  projectionManager.initProjectionManager(
    preload,
    indexHtml,
    VITE_DEV_SERVER_URL
  );

  createMainWindow();

  // Set main window reference in projection manager
  if (mainWin) {
    projectionManager.setMainWindow(mainWin);
  }

  // Setup display monitoring for automatic external display detection
  projectionManager.setupDisplayMonitoring();

  // Setup all IPC handlers
  projectionManager.setupProjectionHandlers();
  setupImageHandlers();
  setupUtilityHandlers();
  setupSecretLoggingHandlers();
  setupPresetHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  // Log system startup with display information
  const displays = screen.getAllDisplays();
  const externalDisplay = projectionManager.detectExternalDisplay();

  logSystemInfo("Application started successfully", {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    totalDisplays: displays.length,
    hasExternalDisplay: !!externalDisplay,
    externalDisplayInfo: externalDisplay
      ? {
          id: externalDisplay.id,
          bounds: externalDisplay.bounds,
          resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
        }
      : null,
  });
});

// Handle app quit - ensure all child windows are closed before quitting
app.on("before-quit", (event) => {
  console.log("App is quitting - cleaning up all windows...");

  // Close all projection windows using projection manager
  projectionManager.closeAllProjectionWindows();
});

// Ensure app quits when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Final cleanup before app terminates
app.on("will-quit", () => {
  console.log("App will quit - final cleanup...");

  // Force close any remaining windows
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.destroy();
    }
  });

  // Reset all variables
  mainWin = null;
});
