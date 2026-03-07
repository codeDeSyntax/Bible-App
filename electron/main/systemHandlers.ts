/**
 * systemHandlers.ts
 *
 * Robust system-level Electron integrations:
 *  1. PowerSaveBlocker  — prevents display sleep during live projection
 *  2. Tray              — system-tray icon + dynamic context menu
 *  3. Notifications     — native OS notifications with auto-sound
 */

import {
  app,
  ipcMain,
  powerSaveBlocker,
  Tray,
  Menu,
  Notification,
  nativeImage,
  BrowserWindow,
} from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────
// Shared state
// ─────────────────────────────────────────────────────────────────
let mainWinRef: BrowserWindow | null = null;

/** Call once during app.whenReady to store the main window reference */
export function setSystemMainWindow(win: BrowserWindow) {
  mainWinRef = win;
}

// ═════════════════════════════════════════════════════════════════
// 1.  POWER SAVE BLOCKER
// ═════════════════════════════════════════════════════════════════
let psbId: number | null = null;
let psbAutoMode = true; // when true, auto-starts/stops with projection

function isPowerSaveActive(): boolean {
  return psbId !== null && powerSaveBlocker.isStarted(psbId);
}

function startPowerSave(reason = "manual"): boolean {
  if (isPowerSaveActive()) return true; // already active
  try {
    psbId = powerSaveBlocker.start("prevent-display-sleep");
    console.log(`⚡ PowerSaveBlocker STARTED [id=${psbId}] reason=${reason}`);
    showNotification({
      title: "Screen Sleep Blocked",
      body: "Display will stay on during live projection.",
      silent: true,
    });
    // push status to renderer
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("power-save-status", { active: true, id: psbId }),
    );
    return true;
  } catch (err) {
    console.error("PowerSaveBlocker start failed:", err);
    return false;
  }
}

function stopPowerSave(reason = "manual"): boolean {
  if (!isPowerSaveActive()) return true;
  try {
    powerSaveBlocker.stop(psbId!);
    console.log(`💤 PowerSaveBlocker STOPPED [id=${psbId}] reason=${reason}`);
    psbId = null;
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("power-save-status", { active: false, id: null }),
    );
    return true;
  } catch (err) {
    console.error("PowerSaveBlocker stop failed:", err);
    return false;
  }
}

/** Called by projectionManager when a presentation window opens/closes */
export function onProjectionStateChange(isActive: boolean) {
  if (!psbAutoMode) return;
  if (isActive) {
    startPowerSave("projection-start");
  } else {
    stopPowerSave("projection-stop");
  }
  updateTrayMenu();
}

function setupPowerSaveHandlers() {
  ipcMain.removeAllListeners("power-save-start");
  ipcMain.removeAllListeners("power-save-stop");
  ipcMain.removeAllListeners("power-save-status");
  ipcMain.removeAllListeners("power-save-set-auto");

  ipcMain.handle("power-save-start", () => {
    const ok = startPowerSave("ipc");
    return { success: ok, active: isPowerSaveActive() };
  });

  ipcMain.handle("power-save-stop", () => {
    const ok = stopPowerSave("ipc");
    return { success: ok, active: isPowerSaveActive() };
  });

  ipcMain.handle("power-save-status", () => ({
    active: isPowerSaveActive(),
    id: psbId,
    autoMode: psbAutoMode,
  }));

  ipcMain.handle("power-save-set-auto", (_e, enabled: boolean) => {
    psbAutoMode = enabled;
    return { success: true, autoMode: psbAutoMode };
  });

  // Guarantee cleanup on app quit — never leak the blocker
  app.on("before-quit", () => {
    if (isPowerSaveActive()) stopPowerSave("app-quit");
  });
}

// ═════════════════════════════════════════════════════════════════
// 2.  SYSTEM TRAY
// ═════════════════════════════════════════════════════════════════
let tray: Tray | null = null;

// Track live UI state so the menu is always accurate
const trayState = {
  projectionActive: false,
  blankScreen: false,
  presetName: "",
};

function getTrayIcon(): Electron.NativeImage {
  const iconPath = path.join(__dirname, "../../public", "bibleicon.png");
  try {
    const img = nativeImage.createFromPath(iconPath);
    if (!img.isEmpty()) {
      // Resize to 16×16 for Windows tray; macOS handles it natively
      return img.resize({ width: 16, height: 16 });
    }
  } catch (_) {}
  // Fallback — 1×1 transparent PNG as nativeImage
  return nativeImage.createEmpty();
}

function buildTrayMenu(): Electron.Menu {
  return Menu.buildFromTemplate([
    {
      label: "📖  God's Word — Bible App",
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Show App",
      click: () => {
        if (mainWinRef && !mainWinRef.isDestroyed()) {
          if (mainWinRef.isMinimized()) mainWinRef.restore();
          mainWinRef.show();
          mainWinRef.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: trayState.projectionActive
        ? `🟢  Projecting: ${trayState.presetName || "Live"}`
        : "⚫  No Active Projection",
      enabled: false,
    },
    {
      label: trayState.blankScreen ? "🔲  Blank Screen ON" : "Blank Screen",
      enabled: trayState.projectionActive,
      click: () => {
        mainWinRef?.webContents.send("tray-action", {
          action: "blank-screen",
        });
      },
    },
    { type: "separator" },
    {
      label: isPowerSaveActive()
        ? "⚡  Display Sleep: BLOCKED"
        : "💤  Display Sleep: Allowed",
      enabled: false,
    },
    {
      label: isPowerSaveActive()
        ? "Allow Display Sleep"
        : "Block Display Sleep Now",
      click: () => {
        if (isPowerSaveActive()) {
          psbAutoMode = false; // manual override
          stopPowerSave("tray-menu");
        } else {
          psbAutoMode = false;
          startPowerSave("tray-menu");
        }
        updateTrayMenu();
      },
    },
    {
      label: `Auto-manage Sleep: ${psbAutoMode ? "ON" : "OFF"}`,
      click: () => {
        psbAutoMode = !psbAutoMode;
        updateTrayMenu();
        mainWinRef?.webContents.send("power-save-status", {
          active: isPowerSaveActive(),
          id: psbId,
          autoMode: psbAutoMode,
        });
      },
    },
    { type: "separator" },
    {
      label: "Quit App",
      role: "quit",
    },
  ]);
}

function updateTrayMenu() {
  if (!tray || tray.isDestroyed()) return;
  tray.setContextMenu(buildTrayMenu());
}

/** Call from renderer via IPC to keep tray state synced */
export function syncTrayState(updates: Partial<typeof trayState>) {
  Object.assign(trayState, updates);
  updateTrayMenu();
}

function setupTray() {
  if (tray && !tray.isDestroyed()) return; // already set up

  tray = new Tray(getTrayIcon());
  tray.setToolTip("God's Word — Bible App");
  tray.setContextMenu(buildTrayMenu());

  // Double-click → restore main window
  tray.on("double-click", () => {
    if (mainWinRef && !mainWinRef.isDestroyed()) {
      if (mainWinRef.isMinimized()) mainWinRef.restore();
      mainWinRef.show();
      mainWinRef.focus();
    }
  });

  // Re-create tray if it somehow gets destroyed (rare Windows edge case)
  tray.on("click", () => {
    tray?.popUpContextMenu();
  });

  app.on("before-quit", () => {
    tray?.destroy();
    tray = null;
  });

  console.log("🔲 System tray initialized");
}

function setupTrayHandlers() {
  ipcMain.removeAllListeners("tray-sync-state");
  ipcMain.removeAllListeners("tray-update-tooltip");

  ipcMain.handle("tray-sync-state", (_e, state: Partial<typeof trayState>) => {
    syncTrayState(state);
    return { success: true };
  });

  ipcMain.handle("tray-update-tooltip", (_e, tooltip: string) => {
    tray?.setToolTip(tooltip);
    return { success: true };
  });
}

// ═════════════════════════════════════════════════════════════════
// 3.  NATIVE NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════
interface NotificationOptions {
  title: string;
  body: string;
  silent?: boolean;
  urgency?: "normal" | "critical" | "low";
  timeoutType?: "default" | "never";
}

/**
 * Show a native OS notification.
 * Skips if Notification.isSupported() returns false (headless/CI).
 */
export function showNotification(opts: NotificationOptions): boolean {
  if (!Notification.isSupported()) return false;
  try {
    const n = new Notification({
      title: opts.title,
      body: opts.body,
      silent: opts.silent ?? false,
      urgency: opts.urgency ?? "normal",
      timeoutType: opts.timeoutType ?? "default",
      icon: path.join(__dirname, "../../public/bibleicon.png"),
    });

    // Clicking the notification focuses the main window
    n.on("click", () => {
      if (mainWinRef && !mainWinRef.isDestroyed()) {
        if (mainWinRef.isMinimized()) mainWinRef.restore();
        mainWinRef.show();
        mainWinRef.focus();
      }
    });

    n.show();
    return true;
  } catch (err) {
    console.error("Notification failed:", err);
    return false;
  }
}

function setupNotificationHandlers() {
  ipcMain.removeAllListeners("show-notification");
  ipcMain.removeAllListeners("notification-supported");

  ipcMain.handle("show-notification", (_e, opts: NotificationOptions) => {
    const ok = showNotification(opts);
    return { success: ok };
  });

  ipcMain.handle("notification-supported", () => ({
    supported: Notification.isSupported(),
  }));
}

// ═════════════════════════════════════════════════════════════════
// BOOT — call this once from app.whenReady
// ═════════════════════════════════════════════════════════════════
export function setupSystemHandlers() {
  setupPowerSaveHandlers();
  setupTray();
  setupTrayHandlers();
  setupNotificationHandlers();

  // Feed projection state changes into power-save + tray
  ipcMain.on(
    "projection-state-changed-system",
    (_e, isActive: boolean, presetName?: string) => {
      trayState.projectionActive = isActive;
      trayState.presetName = presetName ?? "";
      onProjectionStateChange(isActive);
      // Fire a notification when projection starts/stops
      if (isActive) {
        showNotification({
          title: "Projection Started",
          body: presetName
            ? `Now projecting: "${presetName}"`
            : "Live presentation is active.",
          silent: true,
        });
      } else {
        showNotification({
          title: "Projection Ended",
          body: "The presentation screen has been closed.",
          silent: true,
        });
      }
    },
  );

  console.log("🛡️  System handlers (PSB + Tray + Notifications) ready");
}
