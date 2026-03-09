import type { ProgressInfo } from "electron-updater";
import { useCallback, useEffect } from "react";

const Update = () => {
  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: any) => {
      console.log("[updater] update available:", arg1.newVersion);
    },
    [],
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      console.log("[updater] progress:", arg1.percent?.toFixed(1) + "%");
    },
    [],
  );

  useEffect(() => {
    window.ipcRenderer.on("update-can-available", onUpdateCanAvailable);
    window.ipcRenderer.on("download-progress", onDownloadProgress);
    window.ipcRenderer.invoke("check-update").catch(() => {});

    return () => {
      window.ipcRenderer.off("update-can-available", onUpdateCanAvailable);
      window.ipcRenderer.off("download-progress", onDownloadProgress);
    };
  }, []);

  return null;
};

export default Update;
