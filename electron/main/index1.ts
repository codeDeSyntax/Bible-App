// import {
//   app,
//   BrowserWindow,
//   shell,
//   ipcMain,
//   dialog,
//   nativeImage,
//   screen,
//   protocol,
// } from "electron";
// import fs from "node:fs";
// import { createRequire } from "node:module";
// import { fileURLToPath } from "node:url";
// import path from "node:path";
// import os from "node:os";
// import { v4 as uuidv4 } from "uuid";
// // Import secret logger
// import {
//   secretLogger,
//   logSystemInfo,
//   logSystemError,
// } from "../../src/utils/SecretLogger";
// // Import preset storage service
// import * as presetStorage from "./presetStorage";

// const require = createRequire(import.meta.url);
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // The built directory structure
// //
// // ├─┬ dist-electron
// // │ ├─┬ main
// // │ │ └── index.js    > Electron-Main
// // │ └─┬ preload
// // │   └── index.mjs   > Preload-Scripts
// // ├─┬ dist
// // │ └── index.html    > Electron-Renderer
// //
// process.env.APP_ROOT = path.join(__dirname, "../..");

// export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
// export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
// export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

// process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
//   ? path.join(process.env.APP_ROOT, "public")
//   : RENDERER_DIST;

// // Disable GPU Acceleration for Windows 7
// if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// // Set application name for Windows 10+ notifications
// if (process.platform === "win32") app.setAppUserModelId(app.getName());

// // Prevent multiple instances of the app
// if (!app.requestSingleInstanceLock()) {
//   app.quit();
//   process.exit(0);
// }

// let mainWin: BrowserWindow | null = null;
// let projectionWin: BrowserWindow | null = null;
// let biblePresentationWin: BrowserWindow | null = null;
// let isProjectionMinimized = false;
// let isBiblePresentationMinimized = false;
// let isProjectionActive = false; // Track projection state separately
// let currentExternalDisplay: Electron.Display | null = null; // Track current external display
// const preload = path.join(__dirname, "../preload/index.mjs");
// const indexHtml = path.join(RENDERER_DIST, "index.html");
// const projectionHtml = path.join(RENDERER_DIST, "projection.html");

// // External Display Detection - Multi-Strategy Approach
// function detectExternalDisplay(): Electron.Display | null {
//   const displays = screen.getAllDisplays();
//   const primaryDisplay = screen.getPrimaryDisplay();

//   console.log("🔍 Detecting external display...", {
//     totalDisplays: displays.length,
//     primaryDisplayId: primaryDisplay.id,
//   });

//   if (displays.length === 1) {
//     console.log("⚠️ Only one display detected - using primary");
//     return null;
//   }

//   // Strategy 1: Find non-internal displays (external monitors/projectors)
//   const externalNonInternal = displays.find(
//     (display) => !display.internal && display.id !== primaryDisplay.id
//   );
//   if (externalNonInternal) {
//     console.log("✅ Strategy 1: Found non-internal external display", {
//       id: externalNonInternal.id,
//       bounds: externalNonInternal.bounds,
//     });
//     return externalNonInternal;
//   }

//   // Strategy 2: Find displays not at origin (0,0) - likely secondary monitors
//   const externalNotAtOrigin = displays.find(
//     (display) =>
//       (display.bounds.x !== 0 || display.bounds.y !== 0) &&
//       display.id !== primaryDisplay.id
//   );
//   if (externalNotAtOrigin) {
//     console.log("✅ Strategy 2: Found display not at origin (secondary)", {
//       id: externalNotAtOrigin.id,
//       bounds: externalNotAtOrigin.bounds,
//     });
//     return externalNotAtOrigin;
//   }

//   // Strategy 3: Use second display if multiple exist
//   const secondaryDisplay = displays.find(
//     (display) => display.id !== primaryDisplay.id
//   );
//   if (secondaryDisplay) {
//     console.log("✅ Strategy 3: Using second display as external", {
//       id: secondaryDisplay.id,
//       bounds: secondaryDisplay.bounds,
//     });
//     return secondaryDisplay;
//   }

//   console.log("⚠️ No external display found - falling back to primary");
//   return null;
// }

// // Move projection window to external display
// function moveProjectionToExternalDisplay() {
//   if (!biblePresentationWin || biblePresentationWin.isDestroyed()) {
//     console.log("⚠️ No projection window to move");
//     return;
//   }

//   const externalDisplay = detectExternalDisplay();
//   if (!externalDisplay) {
//     console.log("⚠️ No external display available for projection");
//     return;
//   }

//   console.log("🔄 Moving projection window to external display...", {
//     displayId: externalDisplay.id,
//     bounds: externalDisplay.bounds,
//   });

//   try {
//     // Set bounds to external display
//     biblePresentationWin.setBounds({
//       x: externalDisplay.bounds.x,
//       y: externalDisplay.bounds.y,
//       width: externalDisplay.bounds.width,
//       height: externalDisplay.bounds.height,
//     });

//     // Force fullscreen on the external display
//     biblePresentationWin.setFullScreen(true);
//     biblePresentationWin.setAlwaysOnTop(true);
//     biblePresentationWin.show();
//     // DON'T focus - keep controller on main window (church presentation mode)
//     // biblePresentationWin.focus(); // REMOVED

//     // Ensure main window stays focused for controller
//     if (mainWin && !mainWin.isDestroyed()) {
//       mainWin.focus();
//     }

//     currentExternalDisplay = externalDisplay;

//     console.log("✅ Projection window moved to external display successfully");
//     logSystemInfo("Projection window moved to external display", {
//       displayId: externalDisplay.id,
//       bounds: externalDisplay.bounds,
//       resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
//     });
//   } catch (error) {
//     console.error("❌ Error moving projection window:", error);
//     logSystemError("Failed to move projection window to external display", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//   }
// }

// // Setup display monitoring for automatic external display detection
// function setupDisplayMonitoring() {
//   console.log("👁️ Setting up display monitoring...");

//   // Listen for display changes
//   screen.on("display-added", (event, newDisplay) => {
//     console.log("➕ New display detected:", {
//       id: newDisplay.id,
//       bounds: newDisplay.bounds,
//       internal: newDisplay.internal,
//     });

//     logSystemInfo("New display detected", {
//       displayId: newDisplay.id,
//       bounds: newDisplay.bounds,
//       internal: newDisplay.internal,
//       resolution: `${newDisplay.bounds.width}x${newDisplay.bounds.height}`,
//     });

//     // If projection window exists and a new external display is detected, move projection there
//     const externalDisplay = detectExternalDisplay();
//     if (
//       externalDisplay &&
//       biblePresentationWin &&
//       !biblePresentationWin.isDestroyed() &&
//       isProjectionActive
//     ) {
//       console.log(
//         "🎯 Auto-moving projection to newly detected external display"
//       );
//       moveProjectionToExternalDisplay();
//     }
//   });

//   screen.on("display-removed", (event, oldDisplay) => {
//     console.log("➖ Display removed:", {
//       id: oldDisplay.id,
//       bounds: oldDisplay.bounds,
//     });

//     logSystemInfo("Display disconnected", {
//       displayId: oldDisplay.id,
//       bounds: oldDisplay.bounds,
//       wasExternal: currentExternalDisplay?.id === oldDisplay.id,
//     });

//     // If the removed display was the external display, reposition window
//     if (currentExternalDisplay && currentExternalDisplay.id === oldDisplay.id) {
//       console.log(
//         "⚠️ External display disconnected - repositioning projection"
//       );
//       currentExternalDisplay = null;

//       if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//         const primaryDisplay = screen.getPrimaryDisplay();
//         biblePresentationWin.setBounds({
//           x: primaryDisplay.bounds.x,
//           y: primaryDisplay.bounds.y,
//           width: primaryDisplay.bounds.width,
//           height: primaryDisplay.bounds.height,
//         });
//         biblePresentationWin.setFullScreen(true);
//       }
//     }
//   });

//   screen.on("display-metrics-changed", (event, display, changedMetrics) => {
//     console.log("📐 Display metrics changed:", {
//       displayId: display.id,
//       changedMetrics,
//       newBounds: display.bounds,
//     });

//     logSystemInfo("Display metrics changed", {
//       displayId: display.id,
//       changedMetrics,
//       newBounds: display.bounds,
//       resolution: `${display.bounds.width}x${display.bounds.height}`,
//     });

//     // If current external display metrics changed, adjust projection window
//     if (
//       currentExternalDisplay &&
//       currentExternalDisplay.id === display.id &&
//       biblePresentationWin &&
//       !biblePresentationWin.isDestroyed()
//     ) {
//       console.log("🔄 Adjusting projection window to new display metrics");
//       moveProjectionToExternalDisplay();
//     }
//   });

//   console.log("✅ Display monitoring setup complete");
// }

// async function createMainWindow() {
//   mainWin = new BrowserWindow({
//     title: "Main window",
//     frame: false,
//     minWidth: 1000,
//     minHeight: 800,
//     icon: path.join(process.env.VITE_PUBLIC, "bibleicon.png"),
//     webPreferences: {
//       preload,
//       // devTools: false,
//       nodeIntegration: false,
//       contextIsolation: true,
//       zoomFactor: 1.0,
//     },
//   });

//   if (VITE_DEV_SERVER_URL) {
//     mainWin.loadURL(VITE_DEV_SERVER_URL);
//     mainWin.maximize();
//     mainWin.setMenuBarVisibility(false);
//     mainWin.webContents.openDevTools();
//     mainWin.webContents.setZoomFactor(1.0);
//   } else {
//     mainWin.maximize();
//     mainWin.setMenuBarVisibility(false);
//     // mainWin.webContents.openDevTools();
//     mainWin.loadFile(indexHtml);
//   }

//   mainWin.webContents.on("before-input-event", (event, input) => {
//     if (
//       input.key === "F12" || // Disable F12 for dev tools
//       (input.key === "I" && input.control && input.shift) || // Disable Ctrl+Shift+I or Cmd+Opt+I
//       (input.key === "R" && input.control) || // Disable Ctrl+R for reload
//       (input.key === "R" && input.meta) // Disable Cmd+R for reload on macOS
//     ) {
//       event.preventDefault();
//     }

//     // Global ESC handler - minimize projection window from main window
//     if (input.type === "keyDown" && input.key === "Escape") {
//       if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//         console.log(
//           "🔽 ESC pressed from main window - minimizing projection window"
//         );
//         biblePresentationWin.minimize();
//       }
//     }
//   });

//   ipcMain.on("minimizeApp", () => {
//     mainWin?.minimize();
//   });
//   ipcMain.on("maximizeApp", () => {
//     if (mainWin?.isMaximized()) {
//       mainWin?.unmaximize();
//     } else {
//       mainWin?.maximize();
//     }
//   });
//   ipcMain.on("closeApp", () => {
//     mainWin?.close();
//   });

//   // Handle main window close event to cleanup all child windows
//   mainWin.on("closed", () => {
//     logSystemInfo("Main application window closed", {
//       biblePresentationActive: !!(
//         biblePresentationWin && !biblePresentationWin.isDestroyed()
//       ),
//       projectionWinActive: !!(projectionWin && !projectionWin.isDestroyed()),
//     });

//     // Close all projection windows when main window closes
//     if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//       biblePresentationWin.close();
//       biblePresentationWin = null;
//     }
//     if (projectionWin && !projectionWin.isDestroyed()) {
//       projectionWin.close();
//       projectionWin = null;
//     }

//     // Reset projection states
//     isProjectionActive = false;
//     isBiblePresentationMinimized = false;
//     isProjectionMinimized = false;

//     // Clear main window reference
//     mainWin = null;
//   });

//   // Ensure main window stays focused when clicked (church presentation mode)
//   // This prevents projection window from ever taking over the controller's screen
//   mainWin.on("focus", () => {
//     console.log("✅ Main window focused - controller screen active");
//   });

//   // If main window is shown or restored, ensure it gets focus
//   mainWin.on("show", () => {
//     mainWin?.focus();
//   });

//   mainWin.on("restore", () => {
//     mainWin?.focus();
//   });

//   return mainWin;
// }

// // Handle Bible presentation updates from control room
// ipcMain.on("bible-presentation-update", (event, data) => {
//   console.log("Main process: Received bible-presentation-update", data);
//   try {
//     if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//       console.log("Main process: Forwarding to presentation window", data);
//       biblePresentationWin.webContents.send("bible-presentation-update", data);
//     } else {
//       console.log("Main process: Bible presentation window not available");
//     }
//   } catch (error) {
//     console.error("Error forwarding Bible presentation update:", error);
//   }
// });

// async function createBiblePresentationWindow() {
//   const displays = screen.getAllDisplays();
//   const primaryDisplay = screen.getPrimaryDisplay();

//   console.log(
//     "🖥️ Bible Presentation - All displays detected:",
//     displays.length
//   );
//   displays.forEach((display, index) => {
//     console.log(`🖥️ Display ${index}:`, {
//       id: display.id,
//       bounds: display.bounds,
//       workArea: display.workArea,
//       scaleFactor: display.scaleFactor,
//       rotation: display.rotation,
//       internal: display.internal,
//       isPrimary: display.id === primaryDisplay.id,
//     });
//   });

//   // Use intelligent external display detection
//   const externalDisplay = detectExternalDisplay();
//   let presentationDisplay = externalDisplay || primaryDisplay;
//   let isExternalDisplay = !!externalDisplay;

//   if (isExternalDisplay) {
//     currentExternalDisplay = externalDisplay;
//     console.log("🎯 Bible Presentation - Using detected external display:", {
//       id: externalDisplay!.id,
//       bounds: externalDisplay!.bounds,
//       internal: externalDisplay!.internal,
//       resolution: `${externalDisplay!.bounds.width}x${
//         externalDisplay!.bounds.height
//       }`,
//     });
//   } else {
//     console.log(
//       "⚠️ Bible Presentation - No external display found, using primary display"
//     );
//   }

//   // Create Bible presentation window
//   biblePresentationWin = new BrowserWindow({
//     title: "Bible Presentation",
//     x: presentationDisplay.bounds.x,
//     y: presentationDisplay.bounds.y,
//     width: presentationDisplay.bounds.width,
//     height: presentationDisplay.bounds.height,
//     frame: false,
//     show: false, // Don't show immediately, wait until ready
//     fullscreen: true, // Force fullscreen on all displays
//     alwaysOnTop: true, // Keep on top to prevent taskbar overlap
//     skipTaskbar: true, // Don't show in taskbar
//     kiosk: false, // Use fullscreen instead of kiosk mode
//     resizable: false,
//     movable: false,
//     minimizable: true, // Allow minimizing
//     maximizable: false,
//     closable: true,
//     // REMOVED focusable: false - we need keyboard input for ESC key
//     // Instead we'll handle focus manually with event listeners
//     icon: path.join(process.env.VITE_PUBLIC || "", "bibleicon.png"),
//     webPreferences: {
//       preload,
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//   });

//   console.log("🪟 Bible Presentation Window created with:", {
//     x: biblePresentationWin.getBounds().x,
//     y: biblePresentationWin.getBounds().y,
//     width: biblePresentationWin.getBounds().width,
//     height: biblePresentationWin.getBounds().height,
//     isExternalDisplay,
//     targetDisplay: presentationDisplay.bounds,
//   });

//   // Ensure fullscreen and proper positioning on target display
//   biblePresentationWin.setBounds({
//     x: presentationDisplay.bounds.x,
//     y: presentationDisplay.bounds.y,
//     width: presentationDisplay.bounds.width,
//     height: presentationDisplay.bounds.height,
//   });

//   // Force fullscreen mode to cover entire display including taskbar
//   biblePresentationWin.setFullScreen(true);

//   console.log("✅ Fullscreen bounds set:", biblePresentationWin.getBounds());

//   // Load the presentation display page - use universal display
//   if (VITE_DEV_SERVER_URL) {
//     biblePresentationWin.loadURL(`${VITE_DEV_SERVER_URL}/#/universal-display`);
//     // biblePresentationWin.webContents.openDevTools(); // Open dev tools for debugging
//   } else {
//     biblePresentationWin.loadFile(indexHtml, {
//       hash: "universal-display",
//     });
//   }

//   // Show window when ready - DON'T focus to keep controller on main screen
//   biblePresentationWin.once("ready-to-show", () => {
//     biblePresentationWin?.show();
//     // DON'T call focus() - let controller stay on main window
//     // biblePresentationWin?.focus(); // REMOVED for church presentation mode
//     console.log("✅ Bible Presentation Window shown on external display");

//     // Ensure main window stays focused for controller
//     if (mainWin && !mainWin.isDestroyed()) {
//       mainWin.focus();
//     }
//   });

//   // Add ESC key handler to minimize/hide the presentation window
//   biblePresentationWin.webContents.on("before-input-event", (event, input) => {
//     if (input.type === "keyDown" && input.key === "Escape") {
//       event.preventDefault();
//       console.log("🔽 ESC key pressed - minimizing Bible presentation window");
//       biblePresentationWin?.minimize();
//     }
//   });

//   // Prevent projection window from stealing focus - always return to main window
//   // This ensures controller stays on main screen even if projection is clicked
//   biblePresentationWin.on("focus", () => {
//     console.log(
//       "⚠️ Projection window focused - returning focus to main window"
//     );
//     if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
//       // Immediate focus return - no delay needed
//       mainWin.focus();
//     }
//   });

//   // Also handle blur event - ensure main window gets focus
//   biblePresentationWin.on("blur", () => {
//     console.log("✅ Projection window blurred - ensuring main window focused");
//     if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
//       mainWin.focus();
//     }
//   });

//   biblePresentationWin.on("closed", () => {
//     biblePresentationWin = null;
//     isBiblePresentationMinimized = false;
//     isProjectionActive = false; // Set projection as inactive when window is closed
//     // Notify main window that projection is no longer active
//     console.log("Sending Bible projection state change: false (closed)");
//     mainWin?.webContents.send("projection-state-changed", false);
//   });

//   // Track minimization state - but don't affect projection active state for external displays
//   biblePresentationWin.on("minimize", () => {
//     isBiblePresentationMinimized = true;
//     // Only consider projection inactive if user explicitly minimized (not auto-minimize to external display)
//     // We'll keep projection active even when minimized to external display
//     console.log(
//       "Bible window minimized - keeping projection active for external display"
//     );
//   });

//   biblePresentationWin.on("restore", () => {
//     isBiblePresentationMinimized = false;
//     // Ensure projection is marked as active when restored
//     if (isProjectionActive) {
//       console.log("Sending Bible projection state change: true (restored)");
//       mainWin?.webContents.send("projection-state-changed", true);
//     }
//   });

//   return biblePresentationWin;
// }

// app.whenReady().then(() => {
//   createMainWindow();

//   // Setup display monitoring for automatic external display detection
//   setupDisplayMonitoring();

//   app.on("activate", () => {
//     if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
//   });

//   // Log system startup with display information
//   const displays = screen.getAllDisplays();
//   const externalDisplay = detectExternalDisplay();

//   logSystemInfo("Application started successfully", {
//     version: app.getVersion(),
//     platform: process.platform,
//     arch: process.arch,
//     node: process.version,
//     totalDisplays: displays.length,
//     hasExternalDisplay: !!externalDisplay,
//     externalDisplayInfo: externalDisplay
//       ? {
//           id: externalDisplay.id,
//           bounds: externalDisplay.bounds,
//           resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
//         }
//       : null,
//   });
// });

// // Handle app quit - ensure all child windows are closed before quitting
// app.on("before-quit", (event) => {
//   console.log("App is quitting - cleaning up all windows...");

//   // Close all projection windows
//   if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//     biblePresentationWin.close();
//     biblePresentationWin = null;
//   }
//   if (projectionWin && !projectionWin.isDestroyed()) {
//     projectionWin.close();
//     projectionWin = null;
//   }

//   // Reset all projection states
//   isProjectionActive = false;
//   isBiblePresentationMinimized = false;
//   isProjectionMinimized = false;
// });

// // Ensure app quits when all windows are closed
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });

// // Final cleanup before app terminates
// app.on("will-quit", () => {
//   console.log("App will quit - final cleanup...");

//   // Force close any remaining windows
//   BrowserWindow.getAllWindows().forEach((win) => {
//     if (!win.isDestroyed()) {
//       win.destroy();
//     }
//   });

//   // Reset all variables
//   mainWin = null;
//   biblePresentationWin = null;
//   projectionWin = null;
// });

// // Add handler to check if projection window is open
// ipcMain.handle("is-projection-active", async () => {
//   const isBibleActive =
//     isProjectionActive &&
//     biblePresentationWin &&
//     !biblePresentationWin.isDestroyed();

//   const isActive = isBibleActive;
//   console.log("Checking projection state:", {
//     isActive,
//     isBibleActive,
//   });

//   // Log projection state check
//   logSystemInfo("Projection state checked", {
//     isActive,
//     isBibleActive,
//     bibleWindowExists: !!(
//       biblePresentationWin && !biblePresentationWin.isDestroyed()
//     ),
//   });

//   return isActive;
// });

// // Add handler to close projection window
// ipcMain.handle("close-projection-window", async () => {
//   let closed = false;

//   // Close Bible presentation window if it exists
//   if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//     isProjectionActive = false; // Set projection as inactive before closing
//     biblePresentationWin.close();
//     closed = true;
//   }

//   return closed;
// });

// // Handle selecting a directory via the file dialog
// ipcMain.handle("select-directory", async () => {
//   const result = await dialog.showOpenDialog({
//     properties: ["openDirectory"],
//   });
//   return result.canceled ? null : result.filePaths[0];
// });

// // Handle getting system fonts
// ipcMain.handle("get-system-fonts", async () => {
//   try {
//     const fontList = require("font-list");
//     const fonts = await fontList.getFonts({ disableQuoting: true });
//     console.log(`📝 Loaded ${fonts.length} system fonts`);
//     return fonts;
//   } catch (error) {
//     console.error("Error loading system fonts:", error);
//     // Return default fonts if there's an error
//     return [
//       "Arial",
//       "Times New Roman",
//       "Georgia",
//       "Verdana",
//       "Courier New",
//       "Impact",
//       "Comic Sans MS",
//       "Trebuchet MS",
//       "Tahoma",
//     ];
//   }
// });

// async function loadImagesFromDirectory(dirPath: string) {
//   const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

//   try {
//     const files = await new Promise<string[]>((resolve, reject) => {
//       fs.readdir(dirPath, (err, files) => {
//         if (err) reject(err);
//         else resolve(files);
//       });
//     });

//     const imageFiles = files
//       .filter((file) =>
//         allowedExtensions.includes(path.extname(file).toLowerCase())
//       )
//       .slice(0, 12); // Increase limit to 7 images for better selection

//     // Return custom protocol URLs instead of file:// URLs for security
//     const imagePaths = imageFiles.map((file) => {
//       const fullPath = path.join(dirPath, file);
//       // Use our custom protocol to serve local images
//       const customUrl = `local-image://${encodeURIComponent(fullPath)}`;
//       return customUrl;
//     });

//     console.log(
//       "📁 loadImagesFromDirectory: Returning custom protocol URLs:",
//       imagePaths.slice(0, 3),
//       "..."
//     );

//     // Log detailed image loading info
//     logSystemInfo("Background images loaded from directory", {
//       directory: dirPath,
//       totalFiles: files.length,
//       imageFiles: imageFiles.length,
//       allowedExtensions,
//       sampleImages: imagePaths
//         .slice(0, 3)
//         .map((url) => decodeURIComponent(url.replace("local-image://", ""))),
//     });

//     return imagePaths;
//   } catch (error) {
//     console.error("Error loading images:", error);
//     logSystemError("Failed to load background images", {
//       directory: dirPath,
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return [];
//   }
// }

// ipcMain.handle("get-images", async (event, dirPath) => {
//   return loadImagesFromDirectory(dirPath); // Return the list of file:// URLs
// });

// // Generic Presentation Window handler (for presets)
// ipcMain.handle("create-presentation-window", async (event, data) => {
//   try {
//     console.log("Creating/Updating presentation window for preset:", data);

//     // Set projection as active
//     isProjectionActive = true;

//     // Check if window already exists and is not destroyed
//     if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//       console.log("📡 Window exists - updating preset dynamically (no reload)");

//       // Send IPC message to update the preset without reloading the page
//       biblePresentationWin.webContents.send("bible-presentation-update", {
//         type: "preset-switch",
//         presetId: data.presetId,
//         presetType: data.presetType,
//         presetName: data.presetName,
//         presetData: data.presetData, // Include preset data for immediate rendering
//       });

//       biblePresentationWin.show();
//       // DON'T focus projection window - keep controller on main window
//       // biblePresentationWin.focus(); // REMOVED for church presentation mode

//       // Ensure main window stays focused for controller
//       if (mainWin && !mainWin.isDestroyed()) {
//         mainWin.focus();
//       }

//       // Notify main window
//       mainWin?.webContents.send("projection-state-changed", true);

//       return { success: true };
//     }

//     // No window exists - create new one
//     console.log("🪟 No window exists - creating new presentation window");

//     // Get display info using intelligent detection
//     const displays = screen.getAllDisplays();
//     const primaryDisplay = screen.getPrimaryDisplay();
//     console.log(
//       "🖥️ Preset Presentation - All displays detected:",
//       displays.length
//     );

//     // Use intelligent external display detection
//     const externalDisplay = detectExternalDisplay();
//     let presentationDisplay = externalDisplay || primaryDisplay;
//     let isExternalDisplay = !!externalDisplay;

//     if (isExternalDisplay) {
//       currentExternalDisplay = externalDisplay;
//       console.log("🎯 Using detected external display for preset:", {
//         id: externalDisplay!.id,
//         bounds: externalDisplay!.bounds,
//         resolution: `${externalDisplay!.bounds.width}x${
//           externalDisplay!.bounds.height
//         }`,
//       });
//     } else {
//       console.log("⚠️ No external display found - using primary for preset");
//     }

//     // Create presentation window
//     biblePresentationWin = new BrowserWindow({
//       title: "Preset Presentation",
//       x: presentationDisplay.bounds.x,
//       y: presentationDisplay.bounds.y,
//       width: presentationDisplay.bounds.width,
//       height: presentationDisplay.bounds.height,
//       frame: false,
//       show: false, // Don't show immediately, wait until ready
//       fullscreen: true, // Always fullscreen
//       alwaysOnTop: true, // Keep on top to prevent taskbar overlap
//       skipTaskbar: true, // Don't show in taskbar
//       kiosk: false,
//       resizable: false,
//       movable: false,
//       minimizable: true,
//       maximizable: false,
//       closable: true,
//       // REMOVED focusable: false - we need keyboard input for ESC key
//       // Instead we'll handle focus manually with event listeners
//       icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
//       webPreferences: {
//         preload,
//         nodeIntegration: false,
//         contextIsolation: true,
//       },
//     });

//     // Ensure proper bounds and fullscreen on target display
//     biblePresentationWin.setBounds({
//       x: presentationDisplay.bounds.x,
//       y: presentationDisplay.bounds.y,
//       width: presentationDisplay.bounds.width,
//       height: presentationDisplay.bounds.height,
//     });

//     biblePresentationWin.setFullScreen(true);

//     console.log("✅ Preset presentation window created:", {
//       bounds: biblePresentationWin.getBounds(),
//       isExternalDisplay,
//       targetDisplay: presentationDisplay.bounds,
//     });

//     // Load the preset presentation URL
//     const presetId = data.presetId;
//     if (VITE_DEV_SERVER_URL) {
//       biblePresentationWin.loadURL(
//         `${VITE_DEV_SERVER_URL}/#/universal-display?presetId=${presetId}`
//       );
//     } else {
//       biblePresentationWin.loadFile(indexHtml, {
//         hash: `/universal-display?presetId=${presetId}`,
//       });
//     }

//     console.log("✅ Loading universal display with preset ID:", presetId);

//     // Show window when ready and send preset data - DON'T focus
//     biblePresentationWin.once("ready-to-show", () => {
//       biblePresentationWin?.show();
//       // DON'T focus projection window - keep controller on main window
//       // biblePresentationWin?.focus(); // REMOVED for church presentation mode
//       console.log("✅ Preset presentation window shown on external display");

//       // Ensure main window stays focused for controller
//       if (mainWin && !mainWin.isDestroyed()) {
//         mainWin.focus();
//       }
//     });

//     // Send preset data once the window finishes loading
//     biblePresentationWin.webContents.once("did-finish-load", () => {
//       console.log("🚀 Window loaded - sending preset data via IPC");
//       biblePresentationWin?.webContents.send("bible-presentation-update", {
//         type: "preset-switch",
//         presetId: data.presetId,
//         presetType: data.presetType,
//         presetName: data.presetName,
//         presetData: data.presetData, // Send full preset data immediately
//       });
//     });

//     // Add ESC key handler to minimize the presentation window
//     biblePresentationWin.webContents.on(
//       "before-input-event",
//       (event, input) => {
//         if (input.type === "keyDown" && input.key === "Escape") {
//           event.preventDefault();
//           console.log("🔽 ESC key pressed - minimizing preset presentation");
//           biblePresentationWin?.minimize();
//         }
//       }
//     );

//     // Prevent projection window from stealing focus - always return to main window
//     // This ensures controller stays on main screen even if projection is clicked
//     biblePresentationWin.on("focus", () => {
//       console.log(
//         "⚠️ Projection window focused - returning focus to main window"
//       );
//       if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
//         // Immediate focus return - no delay needed
//         mainWin.focus();
//       }
//     });

//     // Also handle blur event - ensure main window gets focus
//     biblePresentationWin.on("blur", () => {
//       console.log(
//         "✅ Projection window blurred - ensuring main window focused"
//       );
//       if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
//         mainWin.focus();
//       }
//     });

//     biblePresentationWin.on("closed", () => {
//       biblePresentationWin = null;
//       isBiblePresentationMinimized = false;
//       isProjectionActive = false;
//       currentExternalDisplay = null;
//       console.log("Preset projection closed");
//       mainWin?.webContents.send("projection-state-changed", false);
//       mainWin?.webContents.send("preset-projection-closed");
//     });

//     biblePresentationWin.on("minimize", () => {
//       isBiblePresentationMinimized = true;
//     });

//     biblePresentationWin.on("restore", () => {
//       isBiblePresentationMinimized = false;
//       if (isProjectionActive) {
//         mainWin?.webContents.send("projection-state-changed", true);
//       }
//     });

//     // Notify main window that projection is active
//     console.log("Sending projection state change: true (preset projection)");
//     mainWin?.webContents.send("projection-state-changed", true);

//     // Log preset projection
//     logSystemInfo("Preset projection started", {
//       presetId: data.presetId,
//       presetType: data.presetType,
//       presetName: data.presetName,
//     });
//   } catch (error) {
//     console.error("Error creating presentation window:", error);
//     logSystemInfo("Preset projection failed", {
//       error: error instanceof Error ? error.message : String(error),
//       presetId: data.presetId,
//     });
//   }
// });

// // Handle sending control updates to presentation window
// ipcMain.handle("send-to-presentation-window", async (event, data) => {
//   try {
//     if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//       console.log("📡 Forwarding control data to presentation window:", data);
//       biblePresentationWin.webContents.send(
//         "presentation-control-update",
//         data
//       );
//       return { success: true };
//     } else {
//       console.warn("⚠️ No presentation window available to send controls");
//       return { success: false, error: "No presentation window" };
//     }
//   } catch (error) {
//     console.error("❌ Error sending to presentation window:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : String(error),
//     };
//   }
// });

// // Bible Presentation Window handlers
// ipcMain.handle("create-bible-presentation-window", async (event, data) => {
//   try {
//     console.log("📺 Creating/Updating Bible presentation window");
//     console.log("📍 Presentation data:", {
//       book: data.presentationData?.book,
//       chapter: data.presentationData?.chapter,
//       selectedVerse: data.presentationData?.selectedVerse,
//       verseCount: data.presentationData?.verses?.length,
//     });

//     // Set projection as active
//     isProjectionActive = true;

//     // Check if window exists and is not destroyed
//     if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//       console.log(
//         "📡 Bible window exists - switching to scripture mode (no reload)"
//       );

//       // If minimized, restore it
//       if (isBiblePresentationMinimized) {
//         biblePresentationWin.restore();
//         isBiblePresentationMinimized = false;
//       }

//       // Send IPC to switch to scripture mode
//       biblePresentationWin.webContents.send("bible-presentation-update", {
//         type: "scripture-mode",
//         presentationData: data.presentationData,
//         settings: data.settings,
//       });

//       biblePresentationWin.show();
//       // DON'T focus or moveTop - keep controller on main window
//       // biblePresentationWin.focus(); // REMOVED for church presentation mode
//       // biblePresentationWin.moveTop(); // REMOVED for church presentation mode

//       // Ensure main window stays focused for controller
//       if (mainWin && !mainWin.isDestroyed()) {
//         mainWin.focus();
//       }

//       // Notify main window
//       console.log("Sending Bible projection state change: true (updated)");
//       mainWin?.webContents.send("projection-state-changed", true);

//       return { success: true };
//     }

//     // No window exists - create new one
//     console.log("🪟 No Bible window exists - creating new one");

//     // If window doesn't exist or was destroyed, create a new one
//     if (!biblePresentationWin || biblePresentationWin.isDestroyed()) {
//       await createBiblePresentationWindow();

//       // Wait for window to be ready before sending initial data
//       biblePresentationWin?.once("ready-to-show", () => {
//         console.log(
//           "📡 Window ready - sending scripture mode with initial data"
//         );

//         // Send scripture-mode message with all data
//         biblePresentationWin?.webContents.send("bible-presentation-update", {
//           type: "scripture-mode",
//           presentationData: data.presentationData,
//           settings: data.settings,
//         });

//         // Ensure window is visible but DON'T focus or moveTop
//         biblePresentationWin?.show();
//         // DON'T focus or moveTop - keep controller on main window
//         // biblePresentationWin?.focus(); // REMOVED for church presentation mode
//         // biblePresentationWin?.moveTop(); // REMOVED for church presentation mode

//         // Ensure main window stays focused for controller
//         if (mainWin && !mainWin.isDestroyed()) {
//           mainWin.focus();
//         }

//         // Notify main window about projection state change
//         console.log("Sending Bible projection state change: true (new window)");
//         mainWin?.webContents.send("projection-state-changed", true);
//       });
//     } else {
//       // Window exists, just focus it and update data
//       if (data.presentationData) {
//         biblePresentationWin.webContents.send("bible-presentation-update", {
//           type: "update-data",
//           data: data.presentationData,
//         });
//       }
//       if (data.settings) {
//         biblePresentationWin.webContents.send("bible-presentation-update", {
//           type: "update-settings",
//           data: data.settings,
//         });
//       }
//       // DON'T focus projection window - keep controller on main window
//       // biblePresentationWin.focus(); // REMOVED for church presentation mode

//       // Ensure main window stays focused for controller
//       if (mainWin && !mainWin.isDestroyed()) {
//         mainWin.focus();
//       }

//       // Notify main window about projection state change
//       console.log(
//         "Sending Bible projection state change: true (existing window)"
//       );
//       mainWin?.webContents.send("projection-state-changed", true);
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Error creating Bible presentation window:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// ipcMain.handle("send-to-bible-presentation", async (event, { type, data }) => {
//   try {
//     if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
//       biblePresentationWin.webContents.send("bible-presentation-update", {
//         type,
//         data,
//       });
//       return { success: true };
//     }
//     return { success: false, error: "Presentation window not found" };
//   } catch (error) {
//     console.error("Error sending to Bible presentation window:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Handler to focus the main window from presentation
// ipcMain.handle("focus-main-window", async () => {
//   try {
//     if (mainWin && !mainWin.isDestroyed()) {
//       mainWin.focus();
//       mainWin.show();
//       return { success: true };
//     }
//     return { success: false, error: "Main window not found" };
//   } catch (error) {
//     console.error("Error focusing main window:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Handler to get display information for debugging
// ipcMain.handle("get-display-info", async () => {
//   try {
//     const displays = screen.getAllDisplays();
//     const primaryDisplay = screen.getPrimaryDisplay();
//     const externalDisplay = detectExternalDisplay();

//     const displayInfo = {
//       totalDisplays: displays.length,
//       hasExternalDisplay: !!externalDisplay,
//       primaryDisplay: {
//         id: primaryDisplay.id,
//         bounds: primaryDisplay.bounds,
//         workArea: primaryDisplay.workArea,
//         scaleFactor: primaryDisplay.scaleFactor,
//         internal: primaryDisplay.internal,
//       },
//       externalDisplay: externalDisplay
//         ? {
//             id: externalDisplay.id,
//             bounds: externalDisplay.bounds,
//             workArea: externalDisplay.workArea,
//             scaleFactor: externalDisplay.scaleFactor,
//             internal: externalDisplay.internal,
//             resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
//           }
//         : null,
//       allDisplays: displays.map((display) => ({
//         id: display.id,
//         bounds: display.bounds,
//         workArea: display.workArea,
//         scaleFactor: display.scaleFactor,
//         rotation: display.rotation,
//         internal: display.internal,
//         isPrimary: display.id === primaryDisplay.id,
//         isExternal: externalDisplay?.id === display.id,
//       })),
//     };

//     console.log("📊 Display Info Request:", displayInfo);
//     logSystemInfo("Display information requested", displayInfo);
//     return { success: true, data: displayInfo };
//   } catch (error) {
//     console.error("Error getting display info:", error);
//     logSystemError("Failed to get display information", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Handler to manually trigger external display detection (for testing)
// ipcMain.handle("detect-external-display", async () => {
//   try {
//     const externalDisplay = detectExternalDisplay();

//     if (externalDisplay) {
//       console.log("🎯 Manual external display detection successful:", {
//         id: externalDisplay.id,
//         bounds: externalDisplay.bounds,
//       });

//       // If projection is active, move it to the external display
//       if (
//         biblePresentationWin &&
//         !biblePresentationWin.isDestroyed() &&
//         isProjectionActive
//       ) {
//         moveProjectionToExternalDisplay();
//       }

//       return {
//         success: true,
//         hasExternalDisplay: true,
//         display: {
//           id: externalDisplay.id,
//           bounds: externalDisplay.bounds,
//           resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
//         },
//       };
//     } else {
//       console.log("⚠️ No external display detected");
//       return {
//         success: true,
//         hasExternalDisplay: false,
//         display: null,
//       };
//     }
//   } catch (error) {
//     console.error("Error detecting external display:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Secret Logging System Handlers
// ipcMain.handle(
//   "log-to-secret-logger",
//   async (_, { application, category, message, details }) => {
//     try {
//       secretLogger.log(application, category, message, details);
//       return { success: true };
//     } catch (error) {
//       console.error("Error logging to secret logger:", error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown error",
//       };
//     }
//   }
// );

// ipcMain.handle("get-secret-logs", async () => {
//   try {
//     const logs = secretLogger.getLogs();
//     logSystemInfo("Secret logs accessed by admin", { logCount: logs.length });
//     return { success: true, logs };
//   } catch (error) {
//     console.error("Error getting secret logs:", error);
//     logSystemError("Failed to retrieve secret logs", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// ipcMain.handle("clear-secret-logs", async () => {
//   try {
//     secretLogger.clearAllLogs();
//     logSystemInfo("All secret logs cleared by admin");
//     return { success: true };
//   } catch (error) {
//     console.error("Error clearing secret logs:", error);
//     logSystemError("Failed to clear secret logs", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// ipcMain.handle("get-log-settings", async () => {
//   try {
//     const settings = secretLogger.getSettings();
//     logSystemInfo("Log settings accessed by admin", settings);
//     return { success: true, settings };
//   } catch (error) {
//     console.error("Error getting log settings:", error);
//     logSystemError("Failed to retrieve log settings", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// ipcMain.handle("update-log-settings", async (event, newSettings) => {
//   try {
//     secretLogger.updateSettings(newSettings);
//     logSystemInfo("Log settings updated by admin", newSettings);
//     return { success: true };
//   } catch (error) {
//     console.error("Error updating log settings:", error);
//     logSystemError("Failed to update log settings", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// ipcMain.handle("export-secret-logs", async () => {
//   try {
//     const logs = secretLogger.getLogs();
//     const result = await dialog.showSaveDialog({
//       filters: [
//         { name: "JSON Files", extensions: ["json"] },
//         { name: "Text Files", extensions: ["txt"] },
//       ],
//       defaultPath: `blessed-music-logs-${
//         new Date().toISOString().split("T")[0]
//       }.json`,
//     });

//     if (!result.canceled && result.filePath) {
//       const exportData = {
//         exportDate: new Date().toISOString(),
//         totalLogs: logs.length,
//         logs: logs,
//       };

//       fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
//       logSystemInfo("Secret logs exported by admin", {
//         filePath: result.filePath,
//         logCount: logs.length,
//       });
//       return { success: true, filePath: result.filePath };
//     }

//     return { success: false, error: "Export cancelled" };
//   } catch (error) {
//     console.error("Error exporting secret logs:", error);
//     logSystemError("Failed to export secret logs", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Handler to construct file path properly
// ipcMain.handle(
//   "construct-file-path",
//   async (_, basePath: string, fileName: string) => {
//     try {
//       const fullPath = path.join(basePath, fileName);
//       return { success: true, path: fullPath };
//     } catch (error) {
//       console.error("Error constructing file path:", error);
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Failed to construct path",
//       };
//     }
//   }
// );

// // Handler to open file in default app (e.g., notepad for .txt files)
// ipcMain.handle("open-file-in-default-app", async (_, filePath: string) => {
//   try {
//     // Normalize the path to handle different path separators
//     const normalizedPath = path.normalize(filePath);
//     console.log("Opening file:", normalizedPath);

//     // Check if file exists before trying to open
//     if (!fs.existsSync(normalizedPath)) {
//       return {
//         success: false,
//         error: `File not found: ${normalizedPath}`,
//       };
//     }

//     await shell.openPath(normalizedPath);
//     return { success: true };
//   } catch (error) {
//     console.error("Error opening file:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Failed to open file",
//     };
//   }
// });

// // ============================================
// // Preset Storage Handlers (File System)
// // ============================================

// // Get presets directory path
// ipcMain.handle("get-presets-directory", async () => {
//   try {
//     const presetsDir = presetStorage.getPresetsDirectoryPath();
//     return { success: true, path: presetsDir };
//   } catch (error) {
//     console.error("Error getting presets directory:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Save a preset to file system
// ipcMain.handle("save-preset", async (_, preset) => {
//   try {
//     await presetStorage.savePreset(preset);
//     logSystemInfo("Preset saved to file system", {
//       presetId: preset.id,
//       presetName: preset.name,
//       presetType: preset.type,
//     });
//     return { success: true };
//   } catch (error) {
//     console.error("Error saving preset:", error);
//     logSystemError("Failed to save preset", {
//       presetId: preset.id,
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Load a preset from file system
// ipcMain.handle("load-preset", async (_, presetId: string) => {
//   try {
//     const preset = await presetStorage.loadPreset(presetId);
//     if (preset) {
//       return { success: true, preset };
//     } else {
//       return { success: false, error: "Preset not found" };
//     }
//   } catch (error) {
//     console.error("Error loading preset:", error);
//     logSystemError("Failed to load preset", {
//       presetId,
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Delete a preset from file system
// ipcMain.handle("delete-preset", async (_, presetId: string) => {
//   try {
//     const success = await presetStorage.deletePreset(presetId);
//     if (success) {
//       logSystemInfo("Preset deleted from file system", { presetId });
//       return { success: true };
//     } else {
//       return { success: false, error: "Failed to delete preset" };
//     }
//   } catch (error) {
//     console.error("Error deleting preset:", error);
//     logSystemError("Failed to delete preset", {
//       presetId,
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Load all preset metadata (lightweight)
// ipcMain.handle("load-preset-metadata", async () => {
//   try {
//     const metadata = await presetStorage.loadAllPresetMetadata();
//     return { success: true, metadata };
//   } catch (error) {
//     console.error("Error loading preset metadata:", error);
//     logSystemError("Failed to load preset metadata", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Load all presets (full data)
// ipcMain.handle("load-all-presets", async () => {
//   try {
//     const presets = await presetStorage.loadAllPresets();
//     logSystemInfo("All presets loaded from file system", {
//       count: presets.length,
//     });
//     return { success: true, presets };
//   } catch (error) {
//     console.error("Error loading all presets:", error);
//     logSystemError("Failed to load all presets", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Export all presets
// ipcMain.handle("export-presets", async () => {
//   try {
//     const result = await dialog.showSaveDialog({
//       filters: [{ name: "JSON Files", extensions: ["json"] }],
//       defaultPath: `presets-backup-${
//         new Date().toISOString().split("T")[0]
//       }.json`,
//     });

//     if (!result.canceled && result.filePath) {
//       const exportResult = await presetStorage.exportAllPresets(
//         result.filePath
//       );
//       if (exportResult.success) {
//         logSystemInfo("Presets exported", {
//           filePath: result.filePath,
//           count: exportResult.count,
//         });
//       }
//       return exportResult;
//     }

//     return { success: false, count: 0, error: "Export cancelled" };
//   } catch (error) {
//     console.error("Error exporting presets:", error);
//     logSystemError("Failed to export presets", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       count: 0,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Import presets
// ipcMain.handle("import-presets", async () => {
//   try {
//     const result = await dialog.showOpenDialog({
//       filters: [{ name: "JSON Files", extensions: ["json"] }],
//       properties: ["openFile"],
//     });

//     if (!result.canceled && result.filePaths.length > 0) {
//       const importResult = await presetStorage.importPresets(
//         result.filePaths[0]
//       );
//       if (importResult.success) {
//         logSystemInfo("Presets imported", {
//           filePath: result.filePaths[0],
//           count: importResult.count,
//         });
//       }
//       return importResult;
//     }

//     return { success: false, count: 0, error: "Import cancelled" };
//   } catch (error) {
//     console.error("Error importing presets:", error);
//     logSystemError("Failed to import presets", {
//       error: error instanceof Error ? error.message : String(error),
//     });
//     return {
//       success: false,
//       count: 0,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Search presets
// ipcMain.handle("search-presets", async (_, query: string, type?: string) => {
//   try {
//     const results = await presetStorage.searchPresets(query, type as any);
//     return { success: true, results };
//   } catch (error) {
//     console.error("Error searching presets:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Get storage statistics
// ipcMain.handle("get-storage-stats", async () => {
//   try {
//     const stats = await presetStorage.getStorageStats();
//     return { success: true, stats };
//   } catch (error) {
//     console.error("Error getting storage stats:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });

// // Register custom protocol for local images
// app.whenReady().then(() => {
//   // Register custom protocol to serve local images
//   protocol.registerFileProtocol("local-image", (request, callback) => {
//     try {
//       // Extract the file path from the URL
//       const url = request.url.substring("local-image://".length);
//       const filePath = decodeURIComponent(url);

//       console.log("🖼️ Custom protocol serving image:", filePath);

//       // Security check - ensure the file exists and is an image
//       if (fs.existsSync(filePath)) {
//         const ext = path.extname(filePath).toLowerCase();
//         const allowedExtensions = [
//           ".png",
//           ".jpg",
//           ".jpeg",
//           ".gif",
//           ".bmp",
//           ".webp",
//         ];

//         if (allowedExtensions.includes(ext)) {
//           // Log successful image serving
//           logSystemInfo("Background image served via custom protocol", {
//             filePath,
//             extension: ext,
//             fileSize: fs.statSync(filePath).size,
//           });
//           callback({ path: filePath });
//         } else {
//           console.error("❌ File is not an allowed image type:", ext);
//           logSystemError("Invalid image type requested", {
//             filePath,
//             extension: ext,
//             allowedExtensions,
//           });
//           callback({ error: -6 }); // INVALID_URL
//         }
//       } else {
//         console.error("❌ Image file not found:", filePath);
//         callback({ error: -6 }); // INVALID_URL
//       }
//     } catch (error) {
//       console.error("❌ Error in custom protocol handler:", error);
//       callback({ error: -6 }); // INVALID_URL
//     }
//   });
// });
