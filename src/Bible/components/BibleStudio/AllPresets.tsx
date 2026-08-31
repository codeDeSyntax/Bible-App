import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  ArrowUp,
  ArrowDown,
  Edit2,
  FileText,
  Megaphone,
  Sparkles,
  EyeOff,
} from "lucide-react";
import type { Preset } from "@/store/slices/appSlice";
import type { SavedAlert } from "@/store/slices/bibleSlice";

const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#f59e0b",
  purple: "#8b5cf6",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
  white: "#ffffff",
  black: "#000000",
};

const renderAlertTextSnippet = (rawText: string) => {
  if (!rawText) return "";
  const cleanedText = rawText.replace(/<[^>]*>/g, "");
  const regex = /\{([a-zA-Z0-9]+)\}([^{]*?)\{\/\1\}/gi;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(cleanedText)) !== null) {
    if (match.index > lastIndex) {
      const rawBefore = cleanedText.slice(lastIndex, match.index).replace(/\{[^\}]+\}/g, "");
      if (rawBefore) parts.push(rawBefore);
    }
    const color = match[1].toLowerCase();
    const text = match[2];
    const hex = colorMap[color] || (/^[a-f0-9]{6}$/i.test(color) ? `#${color}` : "#ffffff");
    parts.push(
      <span key={key++} style={{ color: hex }} className="font-semibold">
        {text}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < cleanedText.length) {
    const rawRemaining = cleanedText.slice(lastIndex).replace(/\{[^\}]+\}/g, "");
    if (rawRemaining) parts.push(rawRemaining);
  }

  return parts.length > 0 ? parts : cleanedText.replace(/\{[^\}]+\}/g, "");
};

interface ScripturePresetsCardProps {
  presets: Preset[];
  onPresetSelect: (preset: Preset) => void;
  onPresetDelete: (presetId: string) => void;
  isDarkMode: boolean;
  alerts?: SavedAlert[];
  onAlertDelete?: (id: string) => void;
  onAlertActivated?: (id: string | null) => void;
  onHideAlert?: () => void;
  activeAlertId?: string | null;
  showNotification?: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;
  onAlertEdit?: (id: string) => void;
}

/**
 * Card 5: Scripture Presets
 * Compact 1/4 width card displaying saved presets and alerts in a vertical scroll list
 */
export const ScripturePresetsCard: React.FC<ScripturePresetsCardProps> = ({
  presets,
  onPresetSelect,
  onPresetDelete,
  isDarkMode,
  alerts,
  onAlertDelete,
  onAlertActivated,
  onHideAlert,
  activeAlertId,
  showNotification,
  onAlertEdit,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [alertPositions, setAlertPositions] = useState<
    Record<string, "top" | "bottom">
  >({});

  // Discriminated union for items rendered in the presets list
  type CardItem =
    | { kind: "alert"; id: string; alert: SavedAlert; createdAt: number }
    | { kind: "preset"; id: string; preset: Preset; createdAt?: number };

  // Memoized pipeline — only recomputes when alerts or presets change
  const TTL = 5 * 60 * 60 * 1000; // 5 hours
  const allPresets = useMemo(() => {
    const now = Date.now();
    const validAlerts: SavedAlert[] = (alerts || []).filter(
      (a) => now - a.timestamp < TTL,
    );
    const alertItems: CardItem[] = validAlerts.map((a) => ({
      kind: "alert",
      id: a.id,
      alert: a,
      createdAt: a.timestamp,
    }));
    const presetItems: CardItem[] = presets.map((p) => ({
      kind: "preset",
      id: p.id,
      preset: p,
      createdAt: p.createdAt || 0,
    }));

    return [...alertItems, ...presetItems]
      .filter((item) => !(item.id && String(item.id).startsWith("default-")))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [alerts, presets]);

  // Handle delete click - open modal
  const handleDeleteClick = (preset: Preset) => {
    setPresetToDelete({
      id: preset.id,
      name: preset.data?.reference || preset.name,
    });
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (presetToDelete) {
      onPresetDelete(presetToDelete.id);
      setDeleteModalOpen(false);
      setPresetToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPresetToDelete(null);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative bg-card-bg-alt p-1 rounded-bl-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-header-gradient-from to-header-gradient-to shadow-xs">
            <BookmarkCheck className="w-3 h-3 text-white" />
          </div>
          <span className="text-[0.76rem] font-semibold text-text-primary tracking-tight truncate">
            Presets & Alerts
          </span>
        </div>
        <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full bg-select-bg text-text-secondary">
          {allPresets.length}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl p-4 bg-card-bg shadow-2xl flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-red-500">
                <AlertOctagon className="w-5 h-5" />
                <h4 className="text-sm font-bold text-text-primary">Delete Preset?</h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text-primary">
                  &quot;{presetToDelete?.name}&quot;
                </span>
                ?
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-select-bg hover:bg-select-hover text-text-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content — Vertical Scroll List */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-1 py-0.5 pb-8">
        {allPresets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-select-bg text-text-secondary mb-1.5">
              <BookmarkCheck className="w-4 h-4 opacity-60" />
            </div>
            <p className="text-xs text-text-secondary font-medium">
              No presets saved
            </p>
            <p className="text-[0.65rem] text-text-secondary/70 mt-0.5">
              Saved scripture presets and alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {allPresets.map((item) => {
              if (item.kind === "alert") {
                const a = item.alert;
                const isLive = activeAlertId === a.id;
                const currentPos = alertPositions[a.id] || "bottom";
                const alertColor =
                  a.backgroundColor &&
                  a.backgroundColor.toLowerCase() !== "#000000" &&
                  a.backgroundColor.toLowerCase() !== "#ffffff" &&
                  a.backgroundColor.toLowerCase() !== "transparent"
                    ? a.backgroundColor
                    : a.textColor &&
                      a.textColor.toLowerCase() !== "#000000" &&
                      a.textColor.toLowerCase() !== "#ffffff"
                      ? a.textColor
                      : "#f59e0b";

                return (
                  <div
                    key={item.id}
                    style={{
                      background: isLive
                        ? `linear-gradient(90deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.06) 18%, transparent 30%), var(--card-bg)`
                        : `var(--card-bg)`,
                    }}
                    className="group relative flex items-center justify-between px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs gap-2.5 overflow-hidden border-0 hover:bg-select-hover"
                    onClick={() => {
                      if (isLive) {
                        onHideAlert?.();
                        return;
                      }

                      if (
                        typeof window !== "undefined" &&
                        (window as any).api &&
                        (window as any).api.sendToBiblePresentation
                      ) {
                        (window as any).api.sendToBiblePresentation({
                          type: "publishAlert",
                          data: {
                            id: a.id,
                            text: a.text,
                            backgroundColor: a.backgroundColor || "#000000",
                            textColor: a.textColor || "#ffffff",
                            fontSize: a.fontSize || 24,
                            animationSpeed: a.animationSpeed || 15,
                            position: currentPos,
                          },
                        });
                        onAlertActivated?.(a.id);
                        showNotification?.(
                          `Alert published (${currentPos})`,
                          "success",
                        );
                      }
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 w-full">
                      {/* Theme-Adaptive Borderless Megaphone Icon */}
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative bg-select-bg text-text-primary border-0 shadow-none">
                        <Megaphone className="w-4 h-4 text-text-primary" />
                      </div>

                      {/* Text & Badges Details */}
                      <div className="flex flex-col min-w-0 flex-1 w-full">
                        <div className="flex items-center gap-1.5 leading-tight">
                          {a.themeName ? (
                            <span className="text-[0.62rem] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 tracking-tight truncate bg-select-bg text-text-primary border-0 shadow-none">
                              <Sparkles className="w-2.5 h-2.5 flex-shrink-0 text-text-secondary" />
                              {a.themeName}
                            </span>
                          ) : (
                            <span className="text-[0.62rem] font-bold uppercase tracking-tight px-1.5 py-0.2 rounded bg-select-bg text-text-primary border-0 shadow-none">
                              Alert
                            </span>
                          )}
                          <span className="text-[0.56rem] font-semibold uppercase px-1.5 py-0.2 rounded bg-select-bg text-text-secondary border-0 shadow-none">
                            {currentPos}
                          </span>
                          {isLive && (
                            <span className="text-[0.52rem] font-extrabold px-1.5 py-0.2 rounded-full bg-red-500 text-white animate-pulse shadow-2xs">
                              LIVE
                            </span>
                          )}
                        </div>
                        <div
                          className="mt-1 px-2.5 py-1 rounded-md text-[0.72rem] font-medium truncate leading-tight shadow-inner w-full block"
                          style={{
                            backgroundColor: a.backgroundColor || "#18181b",
                            color: a.textColor || "#ffffff",
                          }}
                        >
                          {renderAlertTextSnippet(a.text)}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (floating on hover) */}
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 bg-card-bg/95 backdrop-blur-xs px-1 py-0.5 rounded-lg shadow-sm border border-select-border/40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Hide Live Alert button if currently active */}
                      {isLive && onHideAlert && (
                        <button
                          type="button"
                          onClick={() => onHideAlert()}
                          className="w-5 h-5 p-0 rounded-md flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-2xs"
                          title="Hide live marquee"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Position toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const newPos = currentPos === "bottom" ? "top" : "bottom";
                          setAlertPositions((prev) => ({
                            ...prev,
                            [a.id]: newPos,
                          }));
                          showNotification?.(`Position: ${newPos}`, "info");
                        }}
                        className="w-5 h-5 p-0 rounded-md flex items-center justify-center bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        title={`Switch to ${currentPos === "bottom" ? "top" : "bottom"}`}
                      >
                        {currentPos === "bottom" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                      </button>

                      {/* Edit */}
                      {onAlertEdit && (
                        <button
                          type="button"
                          onClick={() => onAlertEdit(a.id)}
                          className="w-5 h-5 p-0 rounded-md flex items-center justify-center bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          title="Edit alert"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      {onAlertDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            onAlertDelete(a.id);
                            showNotification?.("Alert deleted", "info");
                          }}
                          className="w-5 h-5 p-0 rounded-md flex items-center justify-center hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // Preset Item
              const preset = item.preset;
              const title = preset.data?.reference || preset.name;
              const textSnippet = preset.data?.text || "";

              return (
                <div
                  key={preset.id}
                  onClick={() => onPresetSelect(preset)}
                  className="group flex items-center justify-between px-2.5 py-2 rounded-xl bg-card-bg hover:bg-select-hover transition-all duration-150 cursor-pointer shadow-2xs gap-2 overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Thumbnail icon */}
                    <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-select-bg overflow-hidden relative">
                      {preset.data?.backgroundImage || (preset.data?.images && preset.data.images[0]) ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${preset.data?.backgroundImage || preset.data?.images?.[0]})`,
                          }}
                        />
                      ) : (
                        <FileText className="w-4.5 h-4.5 text-text-secondary" />
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[0.74rem] font-bold text-text-primary group-hover:text-btn-active-from transition-colors truncate leading-tight">
                        {title}
                      </span>
                      {textSnippet && (
                        <span className="text-[0.64rem] text-text-secondary truncate mt-0.5 leading-tight">
                          {textSnippet}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(preset);
                    }}
                    className="w-5 h-5 p-0 rounded-md flex items-center justify-center flex-shrink-0 text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
