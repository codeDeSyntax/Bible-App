import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  ArrowDownToLine,
  CloudDownload,
} from "lucide-react";

type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "up-to-date"
  | "error";

const UpdateManager: React.FC = () => {
  const [updateReady, setUpdateReady] = useState(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [isManualChecking, setIsManualChecking] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onDownloaded = (_e: any, info?: { version?: string }) => {
      setUpdateReady(true);
      setUpdateVersion(info?.version ?? null);
      setUpdateStatus("idle");
    };
    const onAvailable = (_e: any, arg: { newVersion?: string }) => {
      if (arg?.newVersion) setUpdateVersion(arg.newVersion);
    };
    const onStatus = (
      _e: any,
      arg: {
        status: string;
        version?: string;
        percent?: number;
        message?: string;
      },
    ) => {
      if (arg.status === "checking") {
        setUpdateStatus("checking");
      } else if (arg.status === "available") {
        setUpdateStatus("available");
        if (arg.version) setUpdateVersion(arg.version);
      } else if (arg.status === "downloading") {
        setUpdateStatus("downloading");
        if (arg.percent !== undefined)
          setDownloadPercent(Math.round(arg.percent));
        if (arg.version) setUpdateVersion(arg.version);
      } else if (arg.status === "up-to-date") {
        setUpdateStatus("up-to-date");
        setTimeout(() => setUpdateStatus("idle"), 5000);
      } else if (arg.status === "error") {
        setUpdateStatus("error");
        setUpdateError(arg.message ?? "Unknown error");
        setTimeout(() => setUpdateStatus("idle"), 8000);
      } else if (arg.status === "ready") {
        setUpdateStatus("idle");
      }
    };

    window.ipcRenderer.on("update-downloaded", onDownloaded);
    window.ipcRenderer.on("update-can-available", onAvailable);
    window.ipcRenderer.on("update-status", onStatus);
    return () => {
      window.ipcRenderer.off("update-downloaded", onDownloaded);
      window.ipcRenderer.off("update-can-available", onAvailable);
      window.ipcRenderer.off("update-status", onStatus);
    };
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setShowPanel(false);
      }
    };
    if (showPanel) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPanel]);

  const handleManualCheck = async () => {
    setIsManualChecking(true);
    setUpdateStatus("checking");
    try {
      await window.ipcRenderer.invoke("check-update");
    } catch {
      setUpdateStatus("error");
      setUpdateError("Check failed");
    } finally {
      setIsManualChecking(false);
    }
  };

  const handleDownload = async () => {
    setUpdateStatus("downloading");
    try {
      await window.ipcRenderer.invoke("download-update");
    } catch {
      setUpdateStatus("error");
      setUpdateError("Download failed");
    }
  };

  const iconColor = updateReady
    ? "text-yellow-400"
    : updateStatus === "downloading"
      ? "text-blue-400"
      : updateStatus === "available"
        ? "text-green-400"
        : updateStatus === "error"
          ? "text-red-400"
          : "text-text-primary";

  return (
    <div className="relative">
      {/* Trigger button - Sleek Update Tag */}
      <button
        ref={btnRef}
        onClick={() => setShowPanel((v) => !v)}
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className={`h-6 px-2.5 rounded-full flex items-center gap-1.5 text-[11px] font-mono transition-all cursor-pointer relative select-none ${
          updateReady
            ? showPanel
              ? "!bg-amber-500/25 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              : "!bg-amber-500/12 hover:!bg-amber-500/22 text-amber-400 dark:text-amber-300 border border-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.16)] active:scale-95"
            : updateStatus === "available"
              ? "!bg-emerald-500/12 hover:!bg-emerald-500/22 text-emerald-400 dark:text-emerald-300 border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.16)]"
              : updateStatus === "downloading"
                ? "!bg-sky-500/12 hover:!bg-sky-500/22 text-sky-400 dark:text-sky-300 border border-sky-500/35"
                : showPanel
                  ? "!bg-white/15 dark:!bg-white/15 text-text-primary"
                  : "!bg-transparent text-text-secondary hover:text-text-primary hover:!bg-black/5 dark:hover:!bg-white/10"
        }`}
        title={
          updateReady
            ? `Update ready to install (v${updateVersion})`
            : updateStatus === "available"
              ? `Update available (v${updateVersion})`
              : updateStatus === "downloading"
                ? `Downloading update (${downloadPercent}%)`
                : "Software updates"
        }
      >
        {updateReady ? (
          <CloudDownload
            className="w-3.5 h-3.5 text-amber-400 animate-pulse drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
            strokeWidth={2.4}
          />
        ) : updateStatus === "available" ? (
          <CloudDownload
            className="w-3.5 h-3.5 text-emerald-400 animate-pulse drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]"
            strokeWidth={2.4}
          />
        ) : updateStatus === "downloading" ? (
          <ArrowDownToLine
            className="w-3.5 h-3.5 text-sky-400 animate-bounce"
            strokeWidth={2.4}
          />
        ) : (
          <RefreshCcw
            className={`w-3.5 h-3.5 ${
              updateStatus === "checking"
                ? "animate-spin text-text-primary"
                : "opacity-70"
            }`}
            strokeWidth={2.4}
          />
        )}

        <span className="tracking-tight font-semibold">
          {updateReady
            ? `Update v${updateVersion || "2.1.0"}`
            : updateStatus === "downloading"
              ? `${downloadPercent}%`
              : updateStatus === "available"
                ? "Update"
                : updateStatus === "checking"
                  ? "Checking…"
                  : `v${__APP_VERSION__}`}
        </span>
      </button>

      {/* Floating panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="update-popup"
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.88, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -10 }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 300,
              mass: 0.7,
            }}
            className="absolute right-0 top-[calc(100%+6px)] z-[99999] w-64 rounded-xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.4)] bg-card-bg-alt text-text-primary select-none origin-top-right"
          >
          {/* Header */}
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCcw
                className="w-3.5 h-3.5 text-text-secondary"
                strokeWidth={2.2}
              />
              <span className="text-xs font-semibold tracking-tight text-text-primary">
                Software Update
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-black/5 dark:bg-white/10 text-text-secondary">
              v{__APP_VERSION__}
            </span>
          </div>

          {/* Body */}
          <div className="px-3.5 pb-3.5 space-y-3">
            {/* Status row */}
            <div className="flex items-center gap-3">
              {updateReady ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <CloudDownload
                      className="w-4 h-4 text-amber-400"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      Ready to install
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      v{updateVersion} downloaded &amp; ready
                    </p>
                  </div>
                </>
              ) : updateStatus === "available" ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <CloudDownload
                      className="w-4 h-4 text-emerald-400"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      Update available
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      v{updateVersion} — ready to download
                    </p>
                  </div>
                </>
              ) : updateStatus === "downloading" ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                    <ArrowDownToLine
                      className="w-4 h-4 text-sky-400 animate-bounce"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      Downloading{updateVersion ? ` v${updateVersion}` : ""}
                    </p>
                    {downloadPercent > 0 && (
                      <div className="mt-1.5 w-full h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-sky-400 transition-all duration-300"
                          style={{ width: `${downloadPercent}%` }}
                        />
                      </div>
                    )}
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {downloadPercent > 0
                        ? `${downloadPercent}%`
                        : "Starting download..."}
                    </p>
                  </div>
                </>
              ) : updateStatus === "checking" ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCcw
                      className="w-4 h-4 text-text-secondary animate-spin"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      Checking for updates…
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      Connecting to server
                    </p>
                  </div>
                </>
              ) : updateStatus === "error" ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                    <AlertCircle
                      className="w-4 h-4 text-rose-400"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary">
                      Update check failed
                    </p>
                    <p className="text-[11px] text-rose-400/80 mt-0.5 line-clamp-2">
                      {updateError || "Unable to check updates"}
                    </p>
                  </div>
                </>
              ) : updateStatus === "up-to-date" ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-400"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      You're up to date
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      v{__APP_VERSION__} is the latest version
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCcw
                      className="w-4 h-4 text-text-secondary"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      Bible Book-Of-Redemption
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      Automatic background checks
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Action button */}
            <div className="pt-0.5">
              {updateReady ? (
                <button
                  onClick={() => {
                    setShowPanel(false);
                    window.ipcRenderer.invoke("quit-and-install");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 h-7 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCcw className="w-3 h-3" strokeWidth={2.4} />
                  Restart &amp; Install v{updateVersion}
                </button>
              ) : updateStatus === "available" ? (
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-1.5 h-7 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 cursor-pointer"
                >
                  <ArrowDownToLine className="w-3 h-3" strokeWidth={2.4} />
                  Download v{updateVersion}
                </button>
              ) : (
                <button
                  onClick={handleManualCheck}
                  disabled={
                    updateStatus === "checking" ||
                    updateStatus === "downloading"
                  }
                  className="w-full flex items-center justify-center gap-1.5 h-7 text-xs font-medium rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-text-primary transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RefreshCcw
                    className={`w-3 h-3 ${isManualChecking ? "animate-spin" : ""}`}
                    strokeWidth={2.2}
                  />
                  {updateStatus === "checking"
                    ? "Checking…"
                    : updateStatus === "downloading"
                      ? "Downloading…"
                      : "Check for Updates"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
};

export default UpdateManager;
