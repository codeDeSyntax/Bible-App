import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  nativeImage,
  screen,
  protocol,
} from "electron";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";
// Import secret logger
import {
  secretLogger,
  logSystemInfo,
  logSystemError,
} from "../../src/utils/SecretLogger";

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
let projectionWin: BrowserWindow | null = null;
let biblePresentationWin: BrowserWindow | null = null;
let isProjectionMinimized = false;
let isBiblePresentationMinimized = false;
let isProjectionActive = false; // Track projection state separately
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const projectionHtml = path.join(RENDERER_DIST, "projection.html");

async function createMainWindow() {
  mainWin = new BrowserWindow({
    title: "Main window",
    frame: false,
    minWidth: 1000,
    minHeight: 800,
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
    logSystemInfo("Main application window closed", {
      biblePresentationActive: !!(
        biblePresentationWin && !biblePresentationWin.isDestroyed()
      ),
      projectionWinActive: !!(projectionWin && !projectionWin.isDestroyed()),
    });

    // Close all projection windows when main window closes
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      biblePresentationWin.close();
      biblePresentationWin = null;
    }
    if (projectionWin && !projectionWin.isDestroyed()) {
      projectionWin.close();
      projectionWin = null;
    }

    // Reset projection states
    isProjectionActive = false;
    isBiblePresentationMinimized = false;
    isProjectionMinimized = false;

    // Clear main window reference
    mainWin = null;
  });

  return mainWin;
}

// Handle Bible presentation updates from control room
ipcMain.on("bible-presentation-update", (event, data) => {
  console.log("Main process: Received bible-presentation-update", data);
  try {
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      console.log("Main process: Forwarding to presentation window", data);
      biblePresentationWin.webContents.send("bible-presentation-update", data);
    } else {
      console.log("Main process: Bible presentation window not available");
    }
  } catch (error) {
    console.error("Error forwarding Bible presentation update:", error);
  }
});

async function createBiblePresentationWindow() {
  const displays = screen.getAllDisplays();
  console.log(
    "🖥️ Bible Presentation - All displays detected:",
    displays.length
  );
  displays.forEach((display, index) => {
    console.log(`🖥️ Display ${index}:`, {
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      rotation: display.rotation,
      internal: display.internal,
    });
  });

  let presentationDisplay = displays[0]; // Default to primary display
  let isExternalDisplay = false;

  // Find external display (projector) if available
  if (displays.length > 1) {
    // Improved external display detection
    const externalDisplay = displays.find(
      (display) =>
        !display.internal || display.bounds.x !== 0 || display.bounds.y !== 0
    );
    if (externalDisplay) {
      presentationDisplay = externalDisplay;
      isExternalDisplay = true;
      console.log("🎯 Bible Presentation - Using external display:", {
        id: externalDisplay.id,
        bounds: externalDisplay.bounds,
        internal: externalDisplay.internal,
      });
    } else {
      console.log(
        "⚠️ Bible Presentation - No external display found, using primary"
      );
    }
  } else {
    console.log(
      "⚠️ Bible Presentation - Only one display detected, using primary"
    );
  }

  // Create Bible presentation window
  biblePresentationWin = new BrowserWindow({
    title: "Bible Presentation",
    x: isExternalDisplay ? presentationDisplay.bounds.x : undefined,
    y: isExternalDisplay ? presentationDisplay.bounds.y : undefined,
    width: isExternalDisplay ? presentationDisplay.bounds.width : 1024,
    height: isExternalDisplay ? presentationDisplay.bounds.height : 768,
    frame: false,
    show: true,
    fullscreen: !isExternalDisplay, // Use fullscreen for primary display
    alwaysOnTop: false,
    skipTaskbar: true,
    icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log("🪟 Bible Presentation Window created with:", {
    x: biblePresentationWin.getBounds().x,
    y: biblePresentationWin.getBounds().y,
    width: biblePresentationWin.getBounds().width,
    height: biblePresentationWin.getBounds().height,
    isExternalDisplay,
    targetDisplay: presentationDisplay.bounds,
  });

  // For external displays, manually set bounds after creation to ensure proper coverage
  if (isExternalDisplay) {
    console.log("🔧 Setting manual bounds for external display...");
    biblePresentationWin.setBounds({
      x: presentationDisplay.bounds.x,
      y: presentationDisplay.bounds.y,
      width: presentationDisplay.bounds.width,
      height: presentationDisplay.bounds.height,
    });
    console.log("✅ Manual bounds set:", biblePresentationWin.getBounds());
  } else {
    console.log("📱 Using primary display - no manual bounds needed");
  }

  // Load the presentation display page
  if (VITE_DEV_SERVER_URL) {
    biblePresentationWin.loadURL(
      `${VITE_DEV_SERVER_URL}/#/bible-presentation-display`
    );
    // biblePresentationWin.webContents.openDevTools(); // Open dev tools for debugging
  } else {
    biblePresentationWin.loadFile(indexHtml, {
      hash: "bible-presentation-display",
    });
  }

  biblePresentationWin.on("closed", () => {
    biblePresentationWin = null;
    isBiblePresentationMinimized = false;
    isProjectionActive = false; // Set projection as inactive when window is closed
    // Notify main window that projection is no longer active
    console.log("Sending Bible projection state change: false (closed)");
    mainWin?.webContents.send("projection-state-changed", false);
  });

  // Track minimization state - but don't affect projection active state for external displays
  biblePresentationWin.on("minimize", () => {
    isBiblePresentationMinimized = true;
    // Only consider projection inactive if user explicitly minimized (not auto-minimize to external display)
    // We'll keep projection active even when minimized to external display
    console.log(
      "Bible window minimized - keeping projection active for external display"
    );
  });

  biblePresentationWin.on("restore", () => {
    isBiblePresentationMinimized = false;
    // Ensure projection is marked as active when restored
    if (isProjectionActive) {
      console.log("Sending Bible projection state change: true (restored)");
      mainWin?.webContents.send("projection-state-changed", true);
    }
  });

  return biblePresentationWin;
}

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  // Log system startup
  logSystemInfo("Application started successfully", {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    node: process.version,
  });
});

// Handle app quit - ensure all child windows are closed before quitting
app.on("before-quit", (event) => {
  console.log("App is quitting - cleaning up all windows...");

  // Close all projection windows
  if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
    biblePresentationWin.close();
    biblePresentationWin = null;
  }
  if (projectionWin && !projectionWin.isDestroyed()) {
    projectionWin.close();
    projectionWin = null;
  }

  // Reset all projection states
  isProjectionActive = false;
  isBiblePresentationMinimized = false;
  isProjectionMinimized = false;
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
  biblePresentationWin = null;
  projectionWin = null;
});

// Add handler to check if projection window is open
ipcMain.handle("is-projection-active", async () => {
  const isBibleActive =
    isProjectionActive &&
    biblePresentationWin &&
    !biblePresentationWin.isDestroyed();

  const isActive = isBibleActive;
  console.log("Checking projection state:", {
    isActive,
    isBibleActive,
  });

  // Log projection state check
  logSystemInfo("Projection state checked", {
    isActive,
    isBibleActive,
    bibleWindowExists: !!(
      biblePresentationWin && !biblePresentationWin.isDestroyed()
    ),
  });

  return isActive;
});

// Add handler to close projection window
ipcMain.handle("close-projection-window", async () => {
  let closed = false;

  // Close Bible presentation window if it exists
  if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
    isProjectionActive = false; // Set projection as inactive before closing
    biblePresentationWin.close();
    closed = true;
  }

  return closed;
});

// Handle selecting a directory via the file dialog
ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

async function loadImagesFromDirectory(dirPath: string) {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

  try {
    const files = await new Promise<string[]>((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    const imageFiles = files
      .filter((file) =>
        allowedExtensions.includes(path.extname(file).toLowerCase())
      )
      .slice(0, 10); // Increase limit to 7 images for better selection

    // Return custom protocol URLs instead of file:// URLs for security
    const imagePaths = imageFiles.map((file) => {
      const fullPath = path.join(dirPath, file);
      // Use our custom protocol to serve local images
      const customUrl = `local-image://${encodeURIComponent(fullPath)}`;
      return customUrl;
    });

    console.log(
      "📁 loadImagesFromDirectory: Returning custom protocol URLs:",
      imagePaths.slice(0, 3),
      "..."
    );

    // Log detailed image loading info
    logSystemInfo("Background images loaded from directory", {
      directory: dirPath,
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      allowedExtensions,
      sampleImages: imagePaths
        .slice(0, 3)
        .map((url) => decodeURIComponent(url.replace("local-image://", ""))),
    });

    return imagePaths;
  } catch (error) {
    console.error("Error loading images:", error);
    logSystemError("Failed to load background images", {
      directory: dirPath,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

ipcMain.handle("get-images", async (event, dirPath) => {
  return loadImagesFromDirectory(dirPath); // Return the list of file:// URLs
});

// Generic Presentation Window handler (for presets)
ipcMain.handle("create-presentation-window", async (event, data) => {
  try {
    console.log("Creating presentation window for preset:", data);

    // Set projection as active
    isProjectionActive = true;

    // Close existing Bible presentation window if open
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      biblePresentationWin.close();
      biblePresentationWin = null;
    }

    // Get display info
    const displays = screen.getAllDisplays();
    console.log(
      "🖥️ Preset Presentation - All displays detected:",
      displays.length
    );

    let presentationDisplay = displays[0];
    let isExternalDisplay = false;

    // Find external display if available
    if (displays.length > 1) {
      const externalDisplay = displays.find(
        (display) =>
          !display.internal || display.bounds.x !== 0 || display.bounds.y !== 0
      );
      if (externalDisplay) {
        presentationDisplay = externalDisplay;
        isExternalDisplay = true;
        console.log("🎯 Using external display for preset");
      }
    }

    // Create presentation window
    biblePresentationWin = new BrowserWindow({
      title: "Preset Presentation",
      x: isExternalDisplay ? presentationDisplay.bounds.x : undefined,
      y: isExternalDisplay ? presentationDisplay.bounds.y : undefined,
      width: isExternalDisplay ? presentationDisplay.bounds.width : 1024,
      height: isExternalDisplay ? presentationDisplay.bounds.height : 768,
      frame: false,
      show: true,
      fullscreen: !isExternalDisplay,
      alwaysOnTop: false,
      skipTaskbar: true,
      icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
      webPreferences: {
        preload,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Set bounds for external display
    if (isExternalDisplay) {
      biblePresentationWin.setBounds({
        x: presentationDisplay.bounds.x,
        y: presentationDisplay.bounds.y,
        width: presentationDisplay.bounds.width,
        height: presentationDisplay.bounds.height,
      });
    }

    // Load the preset presentation URL
    const presetId = data.presetId;
    if (VITE_DEV_SERVER_URL) {
      biblePresentationWin.loadURL(
        `${VITE_DEV_SERVER_URL}/#/presentation?presetId=${presetId}`
      );
    } else {
      biblePresentationWin.loadFile(indexHtml, {
        hash: `/presentation?presetId=${presetId}`,
      });
    }

    console.log("✅ Loading preset URL with ID:", presetId);

    biblePresentationWin.on("closed", () => {
      biblePresentationWin = null;
      isBiblePresentationMinimized = false;
      isProjectionActive = false;
      console.log("Preset projection closed");
      mainWin?.webContents.send("projection-state-changed", false);
      mainWin?.webContents.send("preset-projection-closed");
    });

    biblePresentationWin.on("minimize", () => {
      isBiblePresentationMinimized = true;
    });

    biblePresentationWin.on("restore", () => {
      isBiblePresentationMinimized = false;
      if (isProjectionActive) {
        mainWin?.webContents.send("projection-state-changed", true);
      }
    });

    // Notify main window that projection is active
    console.log("Sending projection state change: true (preset projection)");
    mainWin?.webContents.send("projection-state-changed", true);

    // Log preset projection
    logSystemInfo("Preset projection started", {
      presetId: data.presetId,
      presetType: data.presetType,
      presetName: data.presetName,
    });
  } catch (error) {
    console.error("Error creating presentation window:", error);
    logSystemInfo("Preset projection failed", {
      error: error instanceof Error ? error.message : String(error),
      presetId: data.presetId,
    });
  }
});

// Handle sending control updates to presentation window
ipcMain.handle("send-to-presentation-window", async (event, data) => {
  try {
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      console.log("📡 Forwarding control data to presentation window:", data);
      biblePresentationWin.webContents.send(
        "presentation-control-update",
        data
      );
      return { success: true };
    } else {
      console.warn("⚠️ No presentation window available to send controls");
      return { success: false, error: "No presentation window" };
    }
  } catch (error) {
    console.error("❌ Error sending to presentation window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Bible Presentation Window handlers
ipcMain.handle("create-bible-presentation-window", async (event, data) => {
  try {
    console.log("Creating Bible presentation window:", data);

    // Set projection as active
    isProjectionActive = true;

    // Check if window exists but is minimized
    if (
      biblePresentationWin &&
      !biblePresentationWin.isDestroyed() &&
      isBiblePresentationMinimized
    ) {
      biblePresentationWin.restore();
      isBiblePresentationMinimized = false;
      setTimeout(() => {
        if (data.presentationData) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-data",
            data: data.presentationData,
          });
        }
        if (data.settings) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-settings",
            data: data.settings,
          });
        }
        biblePresentationWin?.focus();
        biblePresentationWin?.moveTop();
      }, 300); // Short delay to ensure window is restored before sending data
      // Notify main window about projection state change
      console.log("Sending Bible projection state change: true (restored)");
      mainWin?.webContents.send("projection-state-changed", true);
      return;
    }

    // If window doesn't exist or was destroyed, create a new one
    if (!biblePresentationWin || biblePresentationWin.isDestroyed()) {
      await createBiblePresentationWindow();

      // Wait for window to be ready before sending initial data
      biblePresentationWin?.once("ready-to-show", () => {
        if (data.presentationData) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-data",
            data: data.presentationData,
          });
        }
        if (data.settings) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-settings",
            data: data.settings,
          });
        }
        // Ensure window is properly focused and visible
        biblePresentationWin?.show();
        biblePresentationWin?.focus();
        biblePresentationWin?.moveTop();
        // Notify main window about projection state change
        console.log("Sending Bible projection state change: true (new window)");
        mainWin?.webContents.send("projection-state-changed", true);
      });
    } else {
      // Window exists, just focus it and update data
      if (data.presentationData) {
        biblePresentationWin.webContents.send("bible-presentation-update", {
          type: "update-data",
          data: data.presentationData,
        });
      }
      if (data.settings) {
        biblePresentationWin.webContents.send("bible-presentation-update", {
          type: "update-settings",
          data: data.settings,
        });
      }
      biblePresentationWin.focus();
      // Notify main window about projection state change
      console.log(
        "Sending Bible projection state change: true (existing window)"
      );
      mainWin?.webContents.send("projection-state-changed", true);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating Bible presentation window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

ipcMain.handle("send-to-bible-presentation", async (event, { type, data }) => {
  try {
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      biblePresentationWin.webContents.send("bible-presentation-update", {
        type,
        data,
      });
      return { success: true };
    }
    return { success: false, error: "Presentation window not found" };
  } catch (error) {
    console.error("Error sending to Bible presentation window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Handler to focus the main window from presentation
ipcMain.handle("focus-main-window", async () => {
  try {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.focus();
      mainWin.show();
      return { success: true };
    }
    return { success: false, error: "Main window not found" };
  } catch (error) {
    console.error("Error focusing main window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Handler to get display information for debugging
ipcMain.handle("get-display-info", async () => {
  try {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();

    const displayInfo = {
      totalDisplays: displays.length,
      primaryDisplay: {
        id: primaryDisplay.id,
        bounds: primaryDisplay.bounds,
        workArea: primaryDisplay.workArea,
        scaleFactor: primaryDisplay.scaleFactor,
        internal: primaryDisplay.internal,
      },
      allDisplays: displays.map((display) => ({
        id: display.id,
        bounds: display.bounds,
        workArea: display.workArea,
        scaleFactor: display.scaleFactor,
        rotation: display.rotation,
        internal: display.internal,
        isPrimary: display.id === primaryDisplay.id,
      })),
    };

    console.log("📊 Display Info Request:", displayInfo);
    logSystemInfo("Display information requested", displayInfo);
    return { success: true, data: displayInfo };
  } catch (error) {
    console.error("Error getting display info:", error);
    logSystemError("Failed to get display information", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Secret Logging System Handlers
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
    console.log("Opening file:", normalizedPath);

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

// Register custom protocol for local images
app.whenReady().then(() => {
  // Register custom protocol to serve local images
  protocol.registerFileProtocol("local-image", (request, callback) => {
    try {
      // Extract the file path from the URL
      const url = request.url.substring("local-image://".length);
      const filePath = decodeURIComponent(url);

      console.log("🖼️ Custom protocol serving image:", filePath);

      // Security check - ensure the file exists and is an image
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const allowedExtensions = [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".bmp",
          ".webp",
        ];

        if (allowedExtensions.includes(ext)) {
          // Log successful image serving
          logSystemInfo("Background image served via custom protocol", {
            filePath,
            extension: ext,
            fileSize: fs.statSync(filePath).size,
          });
          callback({ path: filePath });
        } else {
          console.error("❌ File is not an allowed image type:", ext);
          logSystemError("Invalid image type requested", {
            filePath,
            extension: ext,
            allowedExtensions,
          });
          callback({ error: -6 }); // INVALID_URL
        }
      } else {
        console.error("❌ Image file not found:", filePath);
        callback({ error: -6 }); // INVALID_URL
      }
    } catch (error) {
      console.error("❌ Error in custom protocol handler:", error);
      callback({ error: -6 }); // INVALID_URL
    }
  });
});
