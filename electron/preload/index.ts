import { ipcRenderer, contextBridge, dialog } from "electron";
import { DisplayInfo } from "@/types/electron-api";
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
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

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("api", {
  maximizeApp: () => ipcRenderer.send("maximizeApp"),
  minimizeApp: () => {
    console.log("Minimize action triggered");
    ipcRenderer.send("minimizeApp");
  },
  closeApp: () => {
    console.log("Close action triggered");
    ipcRenderer.send("closeApp");
  },
  isProjectionActive: () => ipcRenderer.invoke("is-projection-active"),
  closeProjectionWindow: () => ipcRenderer.invoke("close-projection-window"),
  onProjectionStateChanged: (callback: (isActive: boolean) => void) => {
    ipcRenderer.on("projection-state-changed", (event, isActive) =>
      callback(isActive)
    );
    return () => {
      ipcRenderer.removeAllListeners("projection-state-changed");
    };
  },
  onDisplayInfo: (callback: (info: DisplayInfo) => void) => {
    ipcRenderer.on("display-info", (event, info) => callback(info));
    return () => {
      ipcRenderer.removeAllListeners("display-info");
    };
  },
  getImages: (dirPath: string) => ipcRenderer.invoke("get-images", dirPath),

  // Bible Presentation API
  createBiblePresentationWindow: (data: any) =>
    ipcRenderer.invoke("create-bible-presentation-window", data),
  sendToBiblePresentation: (data: { type: string; data: any }) =>
    ipcRenderer.invoke("send-to-bible-presentation", data),
  focusMainWindow: () => ipcRenderer.invoke("focus-main-window"),
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
});

// --------- Preload scripts loading ---------
function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"]
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
  const className = `loaders-css__image-spin`;
  const styleContent = `
@keyframes image-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.${className} > img {
  width: 50px;
  height: 50px;
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
  background: #faeed1;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><img src="./evv.png" alt="Loading..." /></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);
