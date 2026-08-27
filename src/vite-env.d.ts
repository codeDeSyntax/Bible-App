/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface Window {
  // Expose ipcRenderer in preload
  ipcRenderer: import("electron").IpcRenderer;
}
