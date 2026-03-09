import { app, ipcMain } from "electron";
import { createRequire } from "node:module";
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from "electron-updater";

const { autoUpdater } = createRequire(import.meta.url)("electron-updater");

export function update(win: Electron.BrowserWindow) {
  autoUpdater.autoDownload = true;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;
  // pipe internal electron-updater logs to console
  autoUpdater.logger = console;

  autoUpdater.on("checking-for-update", () => {
    console.log("[updater] checking-for-update");
    win.webContents.send("update-status", { status: "checking" });
  });

  autoUpdater.on("update-available", (arg: UpdateInfo) => {
    console.log("[updater] update-available:", arg?.version);
    win.webContents.send("update-status", {
      status: "downloading",
      version: arg?.version,
    });
    win.webContents.send("update-can-available", {
      update: true,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });

  autoUpdater.on("update-not-available", (arg: UpdateInfo) => {
    console.log("[updater] up-to-date:", arg?.version);
    win.webContents.send("update-status", { status: "up-to-date" });
    win.webContents.send("update-can-available", {
      update: false,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });

  autoUpdater.on("download-progress", (info: ProgressInfo) => {
    console.log("[updater] download-progress:", info.percent?.toFixed(1) + "%");
    win.webContents.send("update-status", {
      status: "downloading",
      percent: info.percent,
    });
  });

  // update downloaded — notify renderer so the badge appears
  autoUpdater.on("update-downloaded", (arg: UpdateDownloadedEvent) => {
    console.log("[updater] update-downloaded:", arg?.version);
    win.webContents.send("update-status", { status: "ready" });
    win.webContents.send("update-downloaded", { version: arg?.version });
  });

  autoUpdater.on("error", (error: Error) => {
    console.error("[updater] error:", error.message);
    win.webContents.send("update-status", {
      status: "error",
      message: error.message,
    });
    win.webContents.send("update-error", { message: error.message });
  });

  // Auto-check once the window finishes loading
  win.webContents.once("did-finish-load", () => {
    setTimeout(() => {
      console.log("[updater] starting startup check...");
      autoUpdater.checkForUpdatesAndNotify().catch((e: Error) => {
        console.error("[updater] startup check failed:", e.message);
        win.webContents.send("update-status", {
          status: "error",
          message: e.message,
        });
      });
    }, 3000);
  });

  // Checking for updates
  ipcMain.handle("check-update", async () => {
    try {
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      return { message: "Network error", error };
    }
  });

  // Start downloading and feedback on progress
  ipcMain.handle("start-download", (event: Electron.IpcMainInvokeEvent) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          // feedback download error message
          event.sender.send("update-error", { message: error.message, error });
        } else {
          // feedback update progress message
          event.sender.send("download-progress", progressInfo);
        }
      },
      () => {
        // feedback update downloaded message
        event.sender.send("update-downloaded");
      },
    );
  });

  // Install now
  ipcMain.handle("quit-and-install", () => {
    autoUpdater.quitAndInstall(false, true);
  });
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void,
) {
  autoUpdater.on("download-progress", (info: ProgressInfo) =>
    callback(null, info),
  );
  autoUpdater.on("error", (error: Error) => callback(error, null));
  autoUpdater.on("update-downloaded", complete);
  autoUpdater.downloadUpdate();
}
