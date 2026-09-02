import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  RefreshCw,
  Search,
  Download,
  Settings,
  Clock,
  Save,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: number;
  date: string;
  application: "SONGS" | "BIBLE" | "EVPRESENTER" | "SYSTEM";
  category:
    | "INFO"
    | "WARNING"
    | "ERROR"
    | "ACTION"
    | "PROJECTION"
    | "FILE_OPERATION";
  message: string;
  details?: string;
  age: string;
}

interface LogCleanupSettings {
  autoCleanup: boolean;
  interval: number;
  unit: "minutes" | "hours" | "days" | "weeks";
  customInterval: number;
}

interface SecretLogsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretLogsWindow: React.FC<SecretLogsWindowProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const [settings, setSettings] = useState<LogCleanupSettings>({
    autoCleanup: true,
    interval: 10 * 60 * 1000,
    unit: "minutes",
    customInterval: 10,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await window.api.getSecretLogs();
      if (result.success && result.logs) {
        setLogs(result.logs);
        setFilteredLogs(result.logs);
      } else {
        setLogs([]);
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const result = await window.api.getLogSettings();
      if (result.success && result.settings) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    try {
      const result = await window.api.updateLogSettings(settings);
      if (result.success) {
        showToast("Auto-cleanup settings saved successfully!", "success");
      } else {
        showToast(`Failed to save settings: ${result.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Failed to save settings. Please try again.", "error");
    } finally {
      setSettingsLoading(false);
    }
  };

  const clearLogs = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all telemetry logs? This cannot be undone."
      )
    ) {
      try {
        const result = await window.api.clearSecretLogs();
        if (result.success) {
          setLogs([]);
          setFilteredLogs([]);
          setSelectedLog(null);
          showToast("All telemetry logs cleared successfully.", "info");
        } else {
          showToast(`Failed to clear logs: ${result.error || "Unknown error"}`, "error");
        }
      } catch (error) {
        console.error("Failed to clear logs:", error);
        showToast("Failed to clear logs. Please try again.", "error");
      }
    }
  };

  const exportLogs = async () => {
    try {
      const result = await window.api.exportSecretLogs();
      if (result.success && result.filePath) {
        showToast(`Logs exported to: ${result.filePath}`, "success");
      } else {
        showToast(`Failed to export logs: ${result.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Failed to export logs:", error);
      showToast("Failed to export logs. Please try again.", "error");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      fetchSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedApp !== "ALL") {
      filtered = filtered.filter((log) => log.application === selectedApp);
    }

    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((log) => log.category === selectedCategory);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedApp, selectedCategory]);

  const getAppBadge = (app: string) => {
    switch (app) {
      case "SONGS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "BIBLE":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "EVPRESENTER":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "SYSTEM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "ERROR":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "WARNING":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "ACTION":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "PROJECTION":
        return "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30";
      case "FILE_OPERATION":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "INFO":
        return "bg-neutral-800 text-neutral-300 border-neutral-700/60";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-lg"
        />

        {/* Main Console Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative z-10 w-[94vw] max-w-6xl h-[88vh] bg-neutral-950 border border-neutral-800/80 rounded-3xl shadow-2xl shadow-black flex flex-col overflow-hidden text-neutral-100 font-sans"
        >
          {/* ── Top Bar / Header ─────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center shadow-inner">
                <Terminal className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-tight text-neutral-100">
                    System Telemetry & Live Diagnostics
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[0.72rem] text-neutral-400">
                  {filteredLogs.length} of {logs.length} events logged in session
                </p>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={fetchLogs}
                disabled={loading}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-neutral-100 text-neutral-400 transition-all cursor-pointer disabled:opacity-50"
                title="Refresh Logs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  showSettings
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100"
                }`}
                title="Auto-Cleanup Retention Settings"
              >
                <Clock className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={exportLogs}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-sky-400 text-neutral-400 transition-all cursor-pointer"
                title="Export Logs (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={clearLogs}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-400 transition-all cursor-pointer"
                title="Purge Telemetry History"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-neutral-800 mx-1" />

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-all cursor-pointer"
                title="Close Window (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Filter Bar ───────────────────────────────────────────── */}
          <div className="px-6 py-3 border-b border-neutral-800/80 bg-neutral-900/40 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search telemetry, events, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* App Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[0.7rem] text-neutral-500 font-medium uppercase tracking-wider">
                App:
              </span>
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-xl px-3 py-1.5 text-xs font-medium outline-none cursor-pointer transition-colors"
              >
                <option value="ALL">All Services</option>
                <option value="SONGS">Songs</option>
                <option value="BIBLE">Bible Studio</option>
                <option value="EVPRESENTER">EvPresenter</option>
                <option value="SYSTEM">Core System</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[0.7rem] text-neutral-500 font-medium uppercase tracking-wider">
                Severity:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-xl px-3 py-1.5 text-xs font-medium outline-none cursor-pointer transition-colors"
              >
                <option value="ALL">All Categories</option>
                <option value="ACTION">Actions</option>
                <option value="PROJECTION">Projections</option>
                <option value="FILE_OPERATION">File Ops</option>
                <option value="ERROR">Errors</option>
                <option value="WARNING">Warnings</option>
                <option value="INFO">Info</option>
              </select>
            </div>
          </div>

          {/* ── Auto-Cleanup Drawer ──────────────────────────────────── */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-neutral-800 bg-neutral-900/90 overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                        Automated Retention & Storage Manager
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={saveSettings}
                      disabled={settingsLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {settingsLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Policy</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Toggle */}
                    <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-neutral-200">
                          Automated Housekeeping
                        </div>
                        <div className="text-[0.7rem] text-neutral-500 mt-0.5">
                          Prunes expired logs periodically in the background.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoCleanup}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              autoCleanup: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                      </label>
                    </div>

                    {/* Retention Window */}
                    <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-center">
                      <div className="font-semibold text-neutral-200 mb-1.5">
                        Log Retention Window
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={settings.customInterval}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            const unitMultipliers = {
                              minutes: 60 * 1000,
                              hours: 60 * 60 * 1000,
                              days: 24 * 60 * 60 * 1000,
                              weeks: 7 * 24 * 60 * 60 * 1000,
                            };
                            setSettings({
                              ...settings,
                              customInterval: value,
                              interval: value * unitMultipliers[settings.unit],
                            });
                          }}
                          className="w-20 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 outline-none"
                        />
                        <select
                          value={settings.unit}
                          onChange={(e) => {
                            const unit = e.target.value as
                              | "minutes"
                              | "hours"
                              | "days"
                              | "weeks";
                            const unitMultipliers = {
                              minutes: 60 * 1000,
                              hours: 60 * 60 * 1000,
                              days: 24 * 60 * 60 * 1000,
                              weeks: 7 * 24 * 60 * 60 * 1000,
                            };
                            setSettings({
                              ...settings,
                              unit,
                              interval:
                                settings.customInterval * unitMultipliers[unit],
                            });
                          }}
                          className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 outline-none cursor-pointer"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                      </div>
                    </div>

                    {/* Status overview */}
                    <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-center">
                      <div className="font-semibold text-neutral-200 mb-1">
                        Active Policy
                      </div>
                      <div className="text-[0.72rem] text-neutral-400 space-y-0.5">
                        <div>
                          Status:{" "}
                          <span
                            className={`font-semibold ${
                              settings.autoCleanup
                                ? "text-emerald-400"
                                : "text-neutral-500"
                            }`}
                          >
                            {settings.autoCleanup ? "Active (10m Check)" : "Disabled"}
                          </span>
                        </div>
                        <div>
                          Max Age: {settings.customInterval} {settings.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Logs Body (Split View) ──────────────────────────── */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Logs List Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs select-text">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>Loading telemetry stream...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500">
                  <Terminal className="w-8 h-8 text-neutral-700" />
                  <span>No events match your active filters</span>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-neutral-900 border-neutral-700 shadow-md"
                          : "bg-neutral-950/60 hover:bg-neutral-900/60 border-neutral-900 hover:border-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Timestamp */}
                        <span className="text-[0.72rem] text-neutral-500 flex-shrink-0 w-16">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>

                        {/* App Badge */}
                        <span
                          className={`text-[0.62rem] font-semibold uppercase px-2 py-0.5 rounded-md border flex-shrink-0 ${getAppBadge(
                            log.application
                          )}`}
                        >
                          {log.application}
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`text-[0.62rem] font-semibold uppercase px-2 py-0.5 rounded-md border flex-shrink-0 ${getCategoryBadge(
                            log.category
                          )}`}
                        >
                          {log.category}
                        </span>

                        {/* Message */}
                        <span className="text-neutral-200 truncate flex-1 font-sans text-xs">
                          {log.message}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-[0.68rem] text-neutral-500 font-sans">
                          {log.age}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Log Details Inspector Panel */}
            <AnimatePresence>
              {selectedLog && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "380px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="border-l border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex flex-col overflow-hidden"
                >
                  {/* Inspector Header */}
                  <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                        Event Inspector
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedLog, null, 2),
                            selectedLog.id
                          )
                        }
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Copy Raw JSON"
                      >
                        {copiedLogId === selectedLog.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLog(null)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Close details"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inspector Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
                    {/* Meta summary card */}
                    <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-neutral-500 uppercase font-semibold">
                          Timestamp
                        </span>
                        <span className="text-neutral-300 font-mono text-[0.75rem]">
                          {new Date(selectedLog.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-neutral-500 uppercase font-semibold">
                          Service
                        </span>
                        <span
                          className={`text-[0.68rem] font-semibold uppercase px-2 py-0.5 rounded-md border ${getAppBadge(
                            selectedLog.application
                          )}`}
                        >
                          {selectedLog.application}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-neutral-500 uppercase font-semibold">
                          Severity
                        </span>
                        <span
                          className={`text-[0.68rem] font-semibold uppercase px-2 py-0.5 rounded-md border ${getCategoryBadge(
                            selectedLog.category
                          )}`}
                        >
                          {selectedLog.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-neutral-500 uppercase font-semibold">
                          Log ID
                        </span>
                        <span className="text-neutral-400 font-mono text-[0.7rem]">
                          {selectedLog.id}
                        </span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="space-y-1.5">
                      <label className="text-[0.7rem] font-semibold text-neutral-400 uppercase tracking-wider">
                        Log Message
                      </label>
                      <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
                        {selectedLog.message}
                      </div>
                    </div>

                    {/* Extended Details */}
                    {selectedLog.details && (
                      <div className="space-y-1.5">
                        <label className="text-[0.7rem] font-semibold text-neutral-400 uppercase tracking-wider">
                          Extended Telemetry Details
                        </label>
                        <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-[0.72rem] text-cyan-300 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                          {selectedLog.details}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div className="px-6 py-2.5 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between text-[0.72rem] text-neutral-500">
            <div className="flex items-center gap-2">
              <span>Confidential System Diagnostics</span>
              <span>•</span>
              <span>
                Auto-pruning:{" "}
                <strong className="text-neutral-400">
                  {settings.autoCleanup
                    ? `${settings.customInterval} ${settings.unit}`
                    : "Disabled"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[0.68rem] text-neutral-500">
              <span>Shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                Ctrl+`
              </kbd>
            </div>
          </div>
        </motion.div>

        {/* Floating Toast Feedback */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-[10000] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900/95 border border-neutral-800 text-neutral-200 text-xs shadow-2xl backdrop-blur-xl"
            >
              {notification.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              {notification.type === "error" && (
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              )}
              {notification.type === "info" && (
                <Info className="w-4 h-4 text-sky-400" />
              )}
              <span>{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
