import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { store, persistor } from "./store";
import { ThemeProvider } from "./Provider/Theme";

import "./index.css";

// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

// Silence verbose debug logs in renderer by default.
// To re-enable logs for troubleshooting, set `localStorage.setItem('enableDebugLogs', 'true')`
// or set `window.__ENABLE_DEBUG_LOGS__ = true` in the devtools console before reload.
try {
  const enableDebug =
    typeof window !== "undefined" &&
    localStorage.getItem("enableDebugLogs") === "true";
  if (!enableDebug) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
  }
} catch (err) {
  // ignore errors when accessing localStorage in some environments
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
