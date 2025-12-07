import { BrowserWindow, screen, ipcMain } from "electron";
import path from "node:path";
import { logSystemInfo, logSystemError } from "../../src/utils/SecretLogger";

// Projection window references
let biblePresentationWin: BrowserWindow | null = null;
let projectionWin: BrowserWindow | null = null;

// Projection state
let isProjectionMinimized = false;
let isBiblePresentationMinimized = false;
let isProjectionActive = false;
let currentExternalDisplay: Electron.Display | null = null;
let preferredProjectionDisplayId: number | null = null; // User's preferred display for projections

// Paths
let preload: string;
let indexHtml: string;
let VITE_DEV_SERVER_URL: string | undefined;

/**
 * Initialize the projection manager with required paths
 */
export function initProjectionManager(
  preloadPath: string,
  indexHtmlPath: string,
  devServerUrl?: string
) {
  preload = preloadPath;
  indexHtml = indexHtmlPath;
  VITE_DEV_SERVER_URL = devServerUrl;
}

/**
 * Set main window reference for focus management
 */
let mainWin: BrowserWindow | null = null;
export function setMainWindow(window: BrowserWindow) {
  mainWin = window;
}

/**
 * External Display Detection - Multi-Strategy Approach
 */
export function detectExternalDisplay(): Electron.Display | null {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  console.log("🔍 Detecting external display...", {
    totalDisplays: displays.length,
    primaryDisplayId: primaryDisplay.id,
  });

  if (displays.length === 1) {
    console.log("⚠️ Only one display detected - using primary");
    return null;
  }

  // Strategy 1: Find non-internal displays (external monitors/projectors)
  // This works regardless of which display is set as "primary" in Windows
  const externalNonInternal = displays.find((display) => !display.internal);
  if (externalNonInternal) {
    console.log("✅ Strategy 1: Found non-internal external display", {
      id: externalNonInternal.id,
      bounds: externalNonInternal.bounds,
      isPrimary: externalNonInternal.id === primaryDisplay.id,
    });
    return externalNonInternal;
  }

  // Strategy 2: Find displays not at origin (0,0) - likely secondary monitors
  const externalNotAtOrigin = displays.find(
    (display) =>
      (display.bounds.x !== 0 || display.bounds.y !== 0) &&
      display.id !== primaryDisplay.id
  );
  if (externalNotAtOrigin) {
    console.log("✅ Strategy 2: Found display not at origin (secondary)", {
      id: externalNotAtOrigin.id,
      bounds: externalNotAtOrigin.bounds,
    });
    return externalNotAtOrigin;
  }

  // Strategy 3: Use second display if multiple exist
  const secondaryDisplay = displays.find(
    (display) => display.id !== primaryDisplay.id
  );
  if (secondaryDisplay) {
    console.log("✅ Strategy 3: Using second display as external", {
      id: secondaryDisplay.id,
      bounds: secondaryDisplay.bounds,
    });
    return secondaryDisplay;
  }

  console.log("⚠️ No external display found - falling back to primary");
  return null;
}

/**
 * Move projection window to external display
 */
export function moveProjectionToExternalDisplay() {
  if (!biblePresentationWin || biblePresentationWin.isDestroyed()) {
    console.log("⚠️ No projection window to move");
    return;
  }

  const externalDisplay = detectExternalDisplay();
  if (!externalDisplay) {
    console.log("⚠️ No external display available for projection");
    return;
  }

  console.log("🔄 Moving projection window to external display...", {
    displayId: externalDisplay.id,
    bounds: externalDisplay.bounds,
  });

  try {
    biblePresentationWin.setBounds({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
    });

    biblePresentationWin.setFullScreen(true);
    biblePresentationWin.setAlwaysOnTop(true);
    biblePresentationWin.show();

    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.focus();
    }

    currentExternalDisplay = externalDisplay;

    console.log("✅ Projection window moved to external display successfully");
    logSystemInfo("Projection window moved to external display", {
      displayId: externalDisplay.id,
      bounds: externalDisplay.bounds,
      resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
    });
  } catch (error) {
    console.error("❌ Error moving projection window:", error);
    logSystemError("Failed to move projection window to external display", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Setup display monitoring for automatic external display detection
 */
export function setupDisplayMonitoring() {
  console.log("👁️ Setting up display monitoring...");

  screen.on("display-added", (event, newDisplay) => {
    console.log("➕ New display detected:", {
      id: newDisplay.id,
      bounds: newDisplay.bounds,
      internal: newDisplay.internal,
    });

    logSystemInfo("New display detected", {
      displayId: newDisplay.id,
      bounds: newDisplay.bounds,
      internal: newDisplay.internal,
      resolution: `${newDisplay.bounds.width}x${newDisplay.bounds.height}`,
    });

    const externalDisplay = detectExternalDisplay();
    if (
      externalDisplay &&
      biblePresentationWin &&
      !biblePresentationWin.isDestroyed() &&
      isProjectionActive
    ) {
      console.log(
        "🎯 Auto-moving projection to newly detected external display"
      );
      moveProjectionToExternalDisplay();
    }
  });

  screen.on("display-removed", (event, oldDisplay) => {
    console.log("➖ Display removed:", {
      id: oldDisplay.id,
      bounds: oldDisplay.bounds,
    });

    logSystemInfo("Display disconnected", {
      displayId: oldDisplay.id,
      bounds: oldDisplay.bounds,
      wasExternal: currentExternalDisplay?.id === oldDisplay.id,
    });

    if (currentExternalDisplay && currentExternalDisplay.id === oldDisplay.id) {
      console.log(
        "⚠️ External display disconnected - repositioning projection"
      );
      currentExternalDisplay = null;

      if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
        const primaryDisplay = screen.getPrimaryDisplay();
        biblePresentationWin.setBounds({
          x: primaryDisplay.bounds.x,
          y: primaryDisplay.bounds.y,
          width: primaryDisplay.bounds.width,
          height: primaryDisplay.bounds.height,
        });
        biblePresentationWin.setFullScreen(true);
      }
    }
  });

  screen.on("display-metrics-changed", (event, display, changedMetrics) => {
    console.log("📐 Display metrics changed:", {
      displayId: display.id,
      changedMetrics,
      newBounds: display.bounds,
    });

    logSystemInfo("Display metrics changed", {
      displayId: display.id,
      changedMetrics,
      newBounds: display.bounds,
      resolution: `${display.bounds.width}x${display.bounds.height}`,
    });

    if (
      currentExternalDisplay &&
      currentExternalDisplay.id === display.id &&
      biblePresentationWin &&
      !biblePresentationWin.isDestroyed()
    ) {
      console.log("🔄 Adjusting projection window to new display metrics");
      moveProjectionToExternalDisplay();
    }
  });

  console.log("✅ Display monitoring setup complete");
}

/**
 * Create Bible presentation window
 */
export async function createBiblePresentationWindow() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

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
      isPrimary: display.id === primaryDisplay.id,
    });
  });

  // Determine presentation display - prioritize user preference
  let presentationDisplay: Electron.Display;
  let isExternalDisplay = false;
  let displaySource = "default";

  if (preferredProjectionDisplayId !== null) {
    // User has set a preferred display
    const preferredDisplay = displays.find(
      (d) => d.id === preferredProjectionDisplayId
    );
    if (preferredDisplay) {
      presentationDisplay = preferredDisplay;
      displaySource = "user-preference";
      isExternalDisplay = preferredDisplay.id !== primaryDisplay.id;
      console.log("🎯 Using user-preferred projection display:", {
        id: preferredDisplay.id,
        label: preferredDisplay.label || `Display ${preferredDisplay.id}`,
        bounds: preferredDisplay.bounds,
      });
    } else {
      console.warn("⚠️ Preferred display not found, falling back to detection");
      const externalDisplay = detectExternalDisplay();
      presentationDisplay = externalDisplay || primaryDisplay;
      isExternalDisplay = !!externalDisplay;
      displaySource = isExternalDisplay ? "auto-detected" : "primary-fallback";
    }
  } else {
    // No preference set, use auto-detection
    const externalDisplay = detectExternalDisplay();
    presentationDisplay = externalDisplay || primaryDisplay;
    isExternalDisplay = !!externalDisplay;
    displaySource = isExternalDisplay ? "auto-detected" : "primary-fallback";
  }

  if (isExternalDisplay && displaySource !== "user-preference") {
    currentExternalDisplay = presentationDisplay;
  }

  console.log("✅ Final presentation display selection:", {
    source: displaySource,
    id: presentationDisplay.id,
    bounds: presentationDisplay.bounds,
    isExternal: isExternalDisplay,
    resolution: `${presentationDisplay.bounds.width}x${presentationDisplay.bounds.height}`,
  });

  biblePresentationWin = new BrowserWindow({
    title: "Bible Presentation",
    x: presentationDisplay.bounds.x,
    y: presentationDisplay.bounds.y,
    width: presentationDisplay.bounds.width,
    height: presentationDisplay.bounds.height,
    frame: false,
    show: false,
    fullscreen: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    kiosk: false,
    resizable: false,
    movable: false,
    minimizable: true,
    maximizable: false,
    closable: true,
    icon: path.join(process.env.VITE_PUBLIC || "", "bibleicon.png"),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      zoomFactor: 1.0,
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

  biblePresentationWin.setBounds({
    x: presentationDisplay.bounds.x,
    y: presentationDisplay.bounds.y,
    width: presentationDisplay.bounds.width,
    height: presentationDisplay.bounds.height,
  });

  biblePresentationWin.setFullScreen(true);
  biblePresentationWin.webContents.setZoomFactor(1.0);

  console.log("✅ Fullscreen bounds set:", biblePresentationWin.getBounds());

  if (VITE_DEV_SERVER_URL) {
    biblePresentationWin.loadURL(`${VITE_DEV_SERVER_URL}/#/universal-display`);
    biblePresentationWin.webContents.openDevTools();
  } else {
    biblePresentationWin.loadFile(indexHtml, {
      hash: "universal-display",
    });
  }

  biblePresentationWin.once("ready-to-show", () => {
    biblePresentationWin?.show();
    console.log("✅ Bible Presentation Window shown on external display");

    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.focus();
    }
  });

  biblePresentationWin.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "Escape") {
      event.preventDefault();
      console.log("🔽 ESC key pressed - minimizing Bible presentation window");
      biblePresentationWin?.minimize();
    }
  });

  biblePresentationWin.on("focus", () => {
    console.log(
      "⚠️ Projection window focused - returning focus to main window"
    );
    if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
      mainWin.focus();
    }
  });

  biblePresentationWin.on("blur", () => {
    console.log("✅ Projection window blurred - ensuring main window focused");
    if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
      mainWin.focus();
    }
  });

  biblePresentationWin.on("closed", () => {
    biblePresentationWin = null;
    isBiblePresentationMinimized = false;
    isProjectionActive = false;
    console.log("Sending Bible projection state change: false (closed)");
    mainWin?.webContents.send("projection-state-changed", false);
  });

  biblePresentationWin.on("minimize", () => {
    isBiblePresentationMinimized = true;
    console.log(
      "Bible window minimized - keeping projection active for external display"
    );
  });

  biblePresentationWin.on("restore", () => {
    isBiblePresentationMinimized = false;
    if (isProjectionActive) {
      console.log("Sending Bible projection state change: true (restored)");
      mainWin?.webContents.send("projection-state-changed", true);
    }
  });

  return biblePresentationWin;
}

/**
 * Get projection state
 */
export function getProjectionState() {
  return {
    isProjectionActive,
    biblePresentationWin,
    isBiblePresentationMinimized,
  };
}

/**
 * Set projection active state
 */
export function setProjectionActive(active: boolean) {
  isProjectionActive = active;
}

/**
 * Get Bible presentation window
 */
export function getBiblePresentationWindow() {
  return biblePresentationWin;
}

/**
 * Close all projection windows
 */
export function closeAllProjectionWindows() {
  if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
    biblePresentationWin.close();
    biblePresentationWin = null;
  }
  if (projectionWin && !projectionWin.isDestroyed()) {
    projectionWin.close();
    projectionWin = null;
  }
  isProjectionActive = false;
  isBiblePresentationMinimized = false;
  isProjectionMinimized = false;
}

/**
 * Setup projection IPC handlers
 */
export function setupProjectionHandlers() {
  // Check if projection window is open
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

    logSystemInfo("Projection state checked", {
      isActive,
      isBibleActive,
      bibleWindowExists: !!(
        biblePresentationWin && !biblePresentationWin.isDestroyed()
      ),
    });

    return isActive;
  });

  // Close projection window
  ipcMain.handle("close-projection-window", async () => {
    let closed = false;

    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      isProjectionActive = false;
      biblePresentationWin.close();
      closed = true;
    }

    return closed;
  });

  // Bible presentation update
  ipcMain.on("bible-presentation-update", (event, data) => {
    console.log("Main process: Received bible-presentation-update", data);
    try {
      if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
        console.log("Main process: Forwarding to presentation window", data);
        biblePresentationWin.webContents.send(
          "bible-presentation-update",
          data
        );
      } else {
        console.log("Main process: Bible presentation window not available");
      }
    } catch (error) {
      console.error("Error forwarding Bible presentation update:", error);
    }
  });

  // Create presentation window (for presets)
  ipcMain.handle("create-presentation-window", async (event, data) => {
    try {
      console.log("Creating/Updating presentation window for preset:", data);

      isProjectionActive = true;

      if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
        console.log(
          "📡 Window exists - updating preset dynamically (no reload)"
        );

        biblePresentationWin.webContents.send("bible-presentation-update", {
          type: "preset-switch",
          presetId: data.presetId,
          presetType: data.presetType,
          presetName: data.presetName,
          presetData: data.presetData,
        });

        biblePresentationWin.show();

        if (mainWin && !mainWin.isDestroyed()) {
          mainWin.focus();
        }

        mainWin?.webContents.send("projection-state-changed", true);

        return { success: true };
      }

      console.log("🪟 No window exists - creating new presentation window");

      const displays = screen.getAllDisplays();
      const primaryDisplay = screen.getPrimaryDisplay();
      console.log(
        "🖥️ Preset Presentation - All displays detected:",
        displays.length
      );

      // Determine presentation display - prioritize user preference
      let presentationDisplay: Electron.Display;
      let isExternalDisplay = false;
      let displaySource = "default";

      if (preferredProjectionDisplayId !== null) {
        // User has set a preferred display
        const preferredDisplay = displays.find(
          (d) => d.id === preferredProjectionDisplayId
        );
        if (preferredDisplay) {
          presentationDisplay = preferredDisplay;
          displaySource = "user-preference";
          isExternalDisplay = preferredDisplay.id !== primaryDisplay.id;
          console.log(
            "🎯 Using user-preferred projection display for preset:",
            {
              id: preferredDisplay.id,
              label: preferredDisplay.label || `Display ${preferredDisplay.id}`,
              bounds: preferredDisplay.bounds,
            }
          );
        } else {
          console.warn(
            "⚠️ Preferred display not found, falling back to detection"
          );
          const externalDisplay = detectExternalDisplay();
          presentationDisplay = externalDisplay || primaryDisplay;
          isExternalDisplay = !!externalDisplay;
          displaySource = isExternalDisplay
            ? "auto-detected"
            : "primary-fallback";
        }
      } else {
        // No preference set, use auto-detection
        const externalDisplay = detectExternalDisplay();
        presentationDisplay = externalDisplay || primaryDisplay;
        isExternalDisplay = !!externalDisplay;
        displaySource = isExternalDisplay
          ? "auto-detected"
          : "primary-fallback";
      }

      if (isExternalDisplay && displaySource !== "user-preference") {
        currentExternalDisplay = presentationDisplay;
      }

      console.log("✅ Final preset presentation display selection:", {
        source: displaySource,
        id: presentationDisplay.id,
        bounds: presentationDisplay.bounds,
        isExternal: isExternalDisplay,
        resolution: `${presentationDisplay.bounds.width}x${presentationDisplay.bounds.height}`,
      });

      biblePresentationWin = new BrowserWindow({
        title: "Preset Presentation",
        x: presentationDisplay.bounds.x,
        y: presentationDisplay.bounds.y,
        width: presentationDisplay.bounds.width,
        height: presentationDisplay.bounds.height,
        frame: false,
        show: false,
        fullscreen: true,
        alwaysOnTop: true,
        skipTaskbar: false,
        kiosk: false,
        resizable: false,
        movable: false,
        minimizable: true,
        maximizable: false,
        closable: true,
        icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
        webPreferences: {
          preload,
          nodeIntegration: false,
          contextIsolation: true,
          zoomFactor: 1.0,
        },
      });

      biblePresentationWin.setBounds({
        x: presentationDisplay.bounds.x,
        y: presentationDisplay.bounds.y,
        width: presentationDisplay.bounds.width,
        height: presentationDisplay.bounds.height,
      });

      biblePresentationWin.setFullScreen(true);
      biblePresentationWin.webContents.setZoomFactor(1.0);

      console.log("✅ Preset presentation window created:", {
        bounds: biblePresentationWin.getBounds(),
        isExternalDisplay,
        targetDisplay: presentationDisplay.bounds,
      });

      const presetId = data.presetId;
      if (VITE_DEV_SERVER_URL) {
        biblePresentationWin.loadURL(
          `${VITE_DEV_SERVER_URL}/#/universal-display?presetId=${presetId}`
        );
        // biblePresentationWin.webContents.openDevTools();
      } else {
        biblePresentationWin.loadFile(indexHtml, {
          hash: `/universal-display?presetId=${presetId}`,
        });
      }

      console.log("✅ Loading universal display with preset ID:", presetId);

      biblePresentationWin.once("ready-to-show", () => {
        biblePresentationWin?.show();
        console.log("✅ Preset presentation window shown on external display");

        if (mainWin && !mainWin.isDestroyed()) {
          mainWin.focus();
        }
      });

      biblePresentationWin.webContents.once("did-finish-load", () => {
        console.log("🚀 Window loaded - sending preset data via IPC");
        biblePresentationWin?.webContents.send("bible-presentation-update", {
          type: "preset-switch",
          presetId: data.presetId,
          presetType: data.presetType,
          presetName: data.presetName,
          presetData: data.presetData,
        });
      });

      biblePresentationWin.webContents.on(
        "before-input-event",
        (event, input) => {
          if (input.type === "keyDown" && input.key === "Escape") {
            event.preventDefault();
            console.log("🔽 ESC key pressed - minimizing preset presentation");
            biblePresentationWin?.minimize();
          }
        }
      );

      biblePresentationWin.on("focus", () => {
        console.log(
          "⚠️ Projection window focused - returning focus to main window"
        );
        if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
          mainWin.focus();
        }
      });

      biblePresentationWin.on("blur", () => {
        console.log(
          "✅ Projection window blurred - ensuring main window focused"
        );
        if (mainWin && !mainWin.isDestroyed() && !mainWin.isMinimized()) {
          mainWin.focus();
        }
      });

      biblePresentationWin.on("closed", () => {
        biblePresentationWin = null;
        isBiblePresentationMinimized = false;
        isProjectionActive = false;
        currentExternalDisplay = null;
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

      console.log("Sending projection state change: true (preset projection)");
      mainWin?.webContents.send("projection-state-changed", true);

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

  // Send control updates to presentation window
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
      console.log("📺 Creating/Updating Bible presentation window");
      console.log("📍 Presentation data:", {
        book: data.presentationData?.book,
        chapter: data.presentationData?.chapter,
        selectedVerse: data.presentationData?.selectedVerse,
        verseCount: data.presentationData?.verses?.length,
      });

      isProjectionActive = true;

      if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
        console.log(
          "📡 Bible window exists - switching to scripture mode (no reload)"
        );

        if (isBiblePresentationMinimized) {
          biblePresentationWin.restore();
          isBiblePresentationMinimized = false;
        }

        biblePresentationWin.webContents.send("bible-presentation-update", {
          type: "scripture-mode",
          presentationData: data.presentationData,
          settings: data.settings,
        });

        biblePresentationWin.show();

        if (mainWin && !mainWin.isDestroyed()) {
          mainWin.focus();
        }

        console.log("Sending Bible projection state change: true (updated)");
        mainWin?.webContents.send("projection-state-changed", true);

        return { success: true };
      }

      console.log("🪟 No Bible window exists - creating new one");

      if (!biblePresentationWin || biblePresentationWin.isDestroyed()) {
        await createBiblePresentationWindow();

        biblePresentationWin?.once("ready-to-show", () => {
          console.log(
            "📡 Window ready - sending scripture mode with initial data"
          );

          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "scripture-mode",
            presentationData: data.presentationData,
            settings: data.settings,
          });

          biblePresentationWin?.show();

          if (mainWin && !mainWin.isDestroyed()) {
            mainWin.focus();
          }

          console.log(
            "Sending Bible projection state change: true (new window)"
          );
          mainWin?.webContents.send("projection-state-changed", true);
        });
      } else {
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

        if (mainWin && !mainWin.isDestroyed()) {
          mainWin.focus();
        }

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

  ipcMain.handle(
    "send-to-bible-presentation",
    async (event, { type, data }) => {
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
    }
  );

  // Get display information
  ipcMain.handle("get-display-info", async () => {
    try {
      const displays = screen.getAllDisplays();
      const primaryDisplay = screen.getPrimaryDisplay();
      const externalDisplay = detectExternalDisplay();

      const displayInfo = {
        totalDisplays: displays.length,
        hasExternalDisplay: !!externalDisplay,
        primaryDisplay: {
          id: primaryDisplay.id,
          bounds: primaryDisplay.bounds,
          workArea: primaryDisplay.workArea,
          scaleFactor: primaryDisplay.scaleFactor,
          internal: primaryDisplay.internal,
        },
        externalDisplay: externalDisplay
          ? {
              id: externalDisplay.id,
              bounds: externalDisplay.bounds,
              workArea: externalDisplay.workArea,
              scaleFactor: externalDisplay.scaleFactor,
              internal: externalDisplay.internal,
              resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
            }
          : null,
        allDisplays: displays.map((display) => ({
          id: display.id,
          bounds: display.bounds,
          workArea: display.workArea,
          scaleFactor: display.scaleFactor,
          rotation: display.rotation,
          internal: display.internal,
          isPrimary: display.id === primaryDisplay.id,
          isExternal: externalDisplay?.id === display.id,
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

  // Manual external display detection
  ipcMain.handle("detect-external-display", async () => {
    try {
      const externalDisplay = detectExternalDisplay();

      if (externalDisplay) {
        console.log("🎯 Manual external display detection successful:", {
          id: externalDisplay.id,
          bounds: externalDisplay.bounds,
        });

        if (
          biblePresentationWin &&
          !biblePresentationWin.isDestroyed() &&
          isProjectionActive
        ) {
          moveProjectionToExternalDisplay();
        }

        return {
          success: true,
          hasExternalDisplay: true,
          display: {
            id: externalDisplay.id,
            bounds: externalDisplay.bounds,
            resolution: `${externalDisplay.bounds.width}x${externalDisplay.bounds.height}`,
          },
        };
      } else {
        console.log("⚠️ No external display detected");
        return {
          success: true,
          hasExternalDisplay: false,
          display: null,
        };
      }
    } catch (error) {
      console.error("Error detecting external display:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Get all available displays
  ipcMain.handle("get-all-displays", async () => {
    try {
      const displays = screen.getAllDisplays();
      const primaryDisplay = screen.getPrimaryDisplay();

      return {
        success: true,
        displays: displays.map((display) => ({
          id: display.id,
          label: display.label || `Display ${display.id}`,
          bounds: display.bounds,
          workArea: display.workArea,
          scaleFactor: display.scaleFactor,
          rotation: display.rotation,
          internal: display.internal,
          isPrimary: display.id === primaryDisplay.id,
          resolution: `${display.bounds.width}x${display.bounds.height}`,
        })),
        primaryDisplayId: primaryDisplay.id,
        preferredDisplayId: preferredProjectionDisplayId,
      };
    } catch (error) {
      console.error("Error getting displays:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Set preferred projection display
  ipcMain.handle(
    "set-projection-display",
    async (_event, displayId: number) => {
      try {
        const displays = screen.getAllDisplays();
        const selectedDisplay = displays.find((d) => d.id === displayId);

        if (!selectedDisplay) {
          return {
            success: false,
            error: "Display not found",
          };
        }

        preferredProjectionDisplayId = displayId;
        console.log("✅ Preferred projection display set:", {
          displayId,
          label: selectedDisplay.label || `Display ${displayId}`,
          bounds: selectedDisplay.bounds,
        });

        return {
          success: true,
          displayId,
        };
      } catch (error) {
        console.error("Error setting projection display:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}
