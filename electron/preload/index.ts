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
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  getSystemFonts: () => ipcRenderer.invoke("get-system-fonts"),

  // Bible Presentation API
  createBiblePresentationWindow: (data: any) =>
    ipcRenderer.invoke("create-bible-presentation-window", data),
  createPresentationWindow: (data: any) =>
    ipcRenderer.invoke("create-presentation-window", data),
  sendToPresentationWindow: (data: { type: string; data: any }) =>
    ipcRenderer.invoke("send-to-presentation-window", data),
  sendToBiblePresentation: (data: { type: string; data: any }) =>
    ipcRenderer.invoke("send-to-bible-presentation", data),
  onPresentationControlUpdate: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on("presentation-control-update", listener);
    return () => {
      ipcRenderer.removeListener("presentation-control-update", listener);
    };
  },
  onBiblePresentationUpdate: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on("bible-presentation-update", listener);
    return () => {
      ipcRenderer.removeListener("bible-presentation-update", listener);
    };
  },
  onPresetProjectionClosed: (callback: () => void) => {
    ipcRenderer.on("preset-projection-closed", callback);
    return () => {
      ipcRenderer.removeAllListeners("preset-projection-closed");
    };
  },
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
  const className = `loaders-css__books-animation`;
  const styleContent = `
@keyframes float-books-1 {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) translateX(2px) rotate(1deg);
  }
  50% {
    transform: translateY(-4px) translateX(-1px) rotate(-0.5deg);
  }
  75% {
    transform: translateY(-12px) translateX(1px) rotate(0.5deg);
  }
}

@keyframes float-books-2 {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-6px) translateX(-2px) rotate(-1deg);
  }
  66% {
    transform: translateY(-10px) translateX(1px) rotate(0.8deg);
  }
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 10px 25px rgba(144, 97, 64, 0.3));
  }
  50% {
    filter: drop-shadow(0 15px 35px rgba(144, 97, 64, 0.5));
  }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #faeed1;
  z-index: 9;
}

.${className} {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.books-stack-1 {
  position: absolute;
  animation: float-books-1 4s ease-in-out infinite, pulse-glow 3s ease-in-out infinite;
  z-index: 2;
}

.books-stack-2 {
  position: absolute;
  animation: float-books-2 3.5s ease-in-out infinite reverse, pulse-glow 2.5s ease-in-out infinite;
  transform: translateX(20px) translateY(10px);
  opacity: 0.85;
  z-index: 1;
}

.app-loading-text {
  color: #906140;
  font-family: impact;
  font-size: 32px;
  font-weight: 700;
  margin-top: 40px;
  letter-spacing: 1px;
  animation: fade-in-up 1s ease-out 0.8s both;
  text-shadow: 0 2px 4px rgba(144, 97, 64, 0.2);
}

.app-loading-subtitle {
  color: #7d5439;
  font-family: monospace;
  font-size: 16px;
  font-weight: 500;
  font-style: italic; 
  margin-top: 12px;
  letter-spacing: 0.5px;
  animation: fade-in-up 1s ease-out 1.2s both;
  opacity: 0.9;
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-top: 32px;
  animation: fade-in-up 1s ease-out 1.6s both;
}

.loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #906140;
  animation: dot-bounce 1.4s ease-in-out infinite both;
  box-shadow: 0 2px 4px rgba(144, 97, 64, 0.3);
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }
.loading-dot:nth-child(3) { animation-delay: 0s; }

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.3);
    opacity: 1;
  }
}
    `;

  const booksStackSVG = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Bottom Book -->
      <rect x="15" y="65" width="70" height="12" rx="2" fill="#7d5439" transform="rotate(-3 50 71)"/>
      <rect x="15" y="63" width="70" height="12" rx="2" fill="#906140" transform="rotate(-3 50 69)"/>
      <rect x="18" y="64" width="2" height="10" fill="#6b4931" transform="rotate(-3 19 69)"/>
      
      <!-- Middle Book (shifted inward) -->
      <rect x="25" y="45" width="60" height="12" rx="2" fill="#8b5d40" transform="rotate(2 55 51)"/>
      <rect x="25" y="43" width="60" height="12" rx="2" fill="#a66b47" transform="rotate(2 55 49)"/>
      <rect x="28" y="44" width="2" height="10" fill="#6b4931" transform="rotate(2 29 49)"/>
      
      <!-- Top Book -->
      <rect x="20" y="25" width="65" height="12" rx="2" fill="#6b4931" transform="rotate(-1 52.5 31)"/>
      <rect x="20" y="23" width="65" height="12" rx="2" fill="#7d5439" transform="rotate(-1 52.5 29)"/>
      <rect x="23" y="24" width="2" height="10" fill="#5a3e28" transform="rotate(-1 24 29)"/>
    </svg>
  `;

  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `
    <div class="${className}">
      <div class="books-stack-1">${booksStackSVG}</div>
      <div class="books-stack-2">${booksStackSVG}</div>
    </div>
    <div class="app-loading-text">God's Word</div>
    <div class="app-loading-subtitle">The Book of Redemption</div>
    <div class="loading-dots">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  `;

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

setTimeout(removeLoading, 9999);
