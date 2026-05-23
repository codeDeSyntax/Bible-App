import React, { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { Studiodiv } from "./Studiodiv";
import {
  BookmarkCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertOctagon,
  Copy,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Clock3,
  BookOpen,
} from "lucide-react";
import { Tooltip } from "antd";
import type { Preset } from "@/store/slices/appSlice";
import type { HistoryEntry, SavedAlert } from "@/store/slices/bibleSlice";
import { BentoCard } from "./BentoCard";
import { DepthButton, DepthSurface } from "@/shared/DepthElement";

// Color mapping for text coloring
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

// Function to strip color syntax from text for copying
const stripColorSyntax = (text: string): string => {
  return text.replace(/\{[a-zA-Z0-9]+\}([^{]*)\{\/[a-zA-Z0-9]+\}/g, "$1");
};

// Function to parse color syntax in text
const parseColoredText = (text: string): (string | JSX.Element)[] => {
  const regex = /\{([a-zA-Z0-9]+)\}([^{]*)\{\/\1\}/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      parts.push(
        <span key={key++} style={{ color: "#ffffff" }}>
          {plainText}
        </span>,
      );
    }

    const color = match[1];
    const coloredText = match[2];

    // Check if color is in colorMap or if it's a hex value
    let colorValue: string;
    if (colorMap[color]) {
      colorValue = colorMap[color];
    } else if (/^[a-f0-9]{6}$/i.test(color)) {
      // If it's a hex value (6 hex digits), use it directly
      colorValue = `#${color}`;
    } else {
      colorValue = colorMap.red; // fallback to red
    }

    parts.push(
      <span key={key++} style={{ color: colorValue }}>
        {coloredText}
      </span>,
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    parts.push(
      <span key={key++} style={{ color: "#ffffff" }}>
        {remainingText}
      </span>,
    );
  }

  return parts;
};

// Pure utility — stable reference, no re-creation per render
const getContrastColor = (hex?: string): string => {
  try {
    if (!hex) return "#ffffff";
    const h = hex.replace("#", "").trim();
    const bigint = parseInt(
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h,
      16,
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.6 ? "#000000" : "#ffffff";
  } catch {
    return "#ffffff";
  }
};

interface ScripturePresetsCardProps {
  presets: Preset[];
  onPresetSelect: (preset: Preset) => void;
  onPresetDelete: (presetId: string) => void;
  isDarkMode: boolean;
  alerts?: SavedAlert[];
  onAlertDelete?: (id: string) => void;
  onAlertActivated?: (alertId: string) => void;
  onHideAlert?: () => void;
  activeAlertId?: string | null;
  showNotification?: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;
  onAlertEdit?: (id: string) => void;
  onOpenFlyerGenerator?: () => void;
  history?: HistoryEntry[];
  currentBook?: string;
  currentChapter?: number;
  getChapters?: () => number[];
  onChapterSelect?: (chapter: number) => void;
  onHistoryReferenceSelect?: (reference: string) => void;
}

/**
 * Card 5: All Presets
 * Shows all saved presets for quick access
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
  onOpenFlyerGenerator,
  history = [],
  currentBook = "",
  currentChapter,
  getChapters,
  onChapterSelect,
  onHistoryReferenceSelect,
}) => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const [row1Arrows, setRow1Arrows] = useState({ left: false, right: false });
  const [row2Arrows, setRow2Arrows] = useState({ left: false, right: false });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [alertPositions, setAlertPositions] = useState<
    Record<string, "top" | "bottom">
  >({});

  const visitedScriptureHistory = useMemo(
    () =>
      history.filter((entry) => /\d+:\d+/.test(entry.reference)).slice(0, 8),
    [history],
  );

  const chapters = useMemo(() => getChapters?.() || [], [getChapters]);

  // Discriminated union for items rendered in the presets grid
  type CardItem =
    | { kind: "alert"; id: string; alert: SavedAlert; createdAt: number }
    | { kind: "preset"; id: string; preset: Preset; createdAt?: number };

  // Memoized pipeline — only recomputes when alerts or presets change
  const TTL = 5 * 60 * 60 * 1000; // 5 hours
  const { allPresets, row1Presets, row2Presets } = useMemo(() => {
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
      createdAt: (p as any).createdAt || 0,
    }));
    const all: CardItem[] = [...alertItems, ...presetItems]
      .filter((item) => !(item.id && String(item.id).startsWith("default-")))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 12);
    return {
      allPresets: all,
      row1Presets: all.slice(0, 12),
      row2Presets: all.slice(12, 12),
    };
  }, [alerts, presets]);

  // Check scroll position for a specific row
  const checkScroll = (
    ref: React.RefObject<HTMLDivElement>,
    setArrows: React.Dispatch<
      React.SetStateAction<{ left: boolean; right: boolean }>
    >,
  ) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setArrows({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 10,
      });
    }
  };

  // Handle scroll for both rows
  React.useEffect(() => {
    const checkRow1 = () => checkScroll(row1Ref, setRow1Arrows);
    const checkRow2 = () => checkScroll(row2Ref, setRow2Arrows);

    checkRow1();
    checkRow2();

    const container1 = row1Ref.current;
    const container2 = row2Ref.current;

    if (container1) container1.addEventListener("scroll", checkRow1);
    if (container2) container2.addEventListener("scroll", checkRow2);

    return () => {
      if (container1) container1.removeEventListener("scroll", checkRow1);
      if (container2) container2.removeEventListener("scroll", checkRow2);
    };
  }, [presets.length]);

  // Scroll handlers for each row
  const scrollRow = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Handle delete div click - open modal
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
    }
    setDeleteModalOpen(false);
    setPresetToDelete(null);
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPresetToDelete(null);
  };

  const isMaxReached = allPresets.length >= 12;
  const flyerButton = (
    <motion.button
      onClick={() => {
        if (isMaxReached) {
          showNotification?.(
            "Max presets reached (12). Delete a preset to generate a new AI Flyer.",
            "warning",
          );
        } else {
          onOpenFlyerGenerator?.();
        }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="absolute bottom-1 right-1 top-1 z-30 flex w-11 select-none items-center justify-center overflow-hidden rounded-xl text-[0.62rem] font-bold uppercase"
      style={{
        background: isMaxReached
          ? "var(--card-bg)"
          : "linear-gradient(135deg, var(--btn-normal-from) 0%, var(--btn-normal-to) 100%)",
        color: isMaxReached ? "#fbbf24" : "var(--text-primary)",
        border: isMaxReached
          ? "1px solid rgba(245,158,11,0.4)"
          : "1px solid var(--select-border)",
        boxShadow: isMaxReached
          ? "none"
          : "0 2px 10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
        letterSpacing: "0.03em",
      }}
    >
      {!isMaxReached && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.13) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1.4,
          }}
        />
      )}
      <span className="relative z-10 flex rotate-180 items-center gap-1 [writing-mode:vertical-rl]">
        <Sparkles size={12} className="flex-shrink-0" />
        <span>{isMaxReached ? "Max" : "Flyer"}</span>
      </span>
    </motion.button>
  );

  return (
    <DepthSurface
      className="col-span-3 row-span-3 rounded-2xl flex flex-col overflow-hidden relative cursor-pointer"
      surfaceClassName="bg-gradient-to-br from-card-bg via-select-hover to-card-bg-alt border border-select-border"
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-track {
          display: inline-block;
          white-space: nowrap;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
      {/* Alerts now appear as cards in the presets grid (prepended) */}
      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center  justify-center backdrop-blur-sm rounded-xl"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <BentoCard
            isDarkMode={isDarkMode}
            className="w-1/2"
            // className={`w-[280px] rounded-lg p-4 shadow-xl ${
            //   isDarkMode
            //     ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]"
            //     : "bg-gradient-to-br from-white to-gray-50"
            // }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(239, 68, 68, 0.1)",
                  }}
                >
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Delete Preset?
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                Delete{" "}
                <span
                  className={`font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  "{presetToDelete?.name}"
                </span>
                ?
              </p>
              <div className="flex gap-2 mt-2">
                <div
                  onClick={cancelDelete}
                  className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all bg-select-bg hover:bg-select-hover text-text-primary"
                >
                  Cancel
                </div>
                <div
                  onClick={confirmDelete}
                  className="flex-1 px-3 py-1.5 rounded text-xs font-medium text-white transition-all"
                  style={{
                    background: "linear-gradient(145deg, #ef4444, #dc2626)",
                  }}
                >
                  Delete
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      )}

      {/* Content */}
      <div
        className="grid h-full grid-rows-[minmax(0,1fr)_5.5rem] gap-2 overflow-hidden p-3"
        style={{ minHeight: 0 }}
      >
        <div className="grid min-h-0 grid-cols-2 gap-2">
          <DepthSurface
            className="min-h-0 rounded-xl overflow-hidden"
            surfaceClassName="bg-gradient-to-br from-select-bg via-select-hover to-select-bg-alt border border-select-border"
          >
            <div className="flex h-full flex-col overflow-hidden p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 flex-shrink-0 text-text-secondary" />
                  <span className="truncate text-[0.72rem] font-bold uppercase tracking-wide text-text-secondary">
                    Visited scriptures
                  </span>
                </div>
                <span className="text-[0.65rem] font-semibold text-text-secondary">
                  {visitedScriptureHistory.length}
                </span>
              </div>

              <div className="flex max-h-[calc(100%-1.6rem)] flex-wrap content-start gap-1 overflow-y-auto pr-1 no-scrollbar">
                {visitedScriptureHistory.length > 0 ? (
                  visitedScriptureHistory.map((entry) => (
                    <DepthButton
                      key={`${entry.reference}-${entry.timestamp}`}
                      type="button"
                      onClick={() =>
                        onHistoryReferenceSelect?.(entry.reference)
                      }
                      sizeClassName="max-w-full px-2 py-1 rounded-lg"
                      inactiveClassName="text-text-primary border-select-border hover:text-text-primary"
                      className="text-[0.68rem] font-semibold"
                      title={entry.reference}
                    >
                      <span className="block max-w-[7.5rem] truncate">
                        {entry.reference}
                      </span>
                    </DepthButton>
                  ))
                ) : (
                  <div className="flex h-20 w-full items-center justify-center rounded-lg border border-dashed border-select-border text-[0.74rem] text-text-secondary">
                    No visited scriptures yet
                  </div>
                )}
              </div>
            </div>
          </DepthSurface>

          <DepthSurface
            className="min-h-0 rounded-xl overflow-hidden"
            surfaceClassName="bg-gradient-to-br from-select-bg via-select-hover to-select-bg-alt border border-select-border"
          >
            <div className="h-full overflow-hidden p-2">
              <div className="mb-1.5 flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-text-secondary" />
                <span className="truncate text-[0.72rem] font-bold uppercase tracking-wide text-text-secondary">
                  {currentBook || "Book"} chapters
                </span>
              </div>

              <div className="grid min-h-0 flex-1 auto-cols-[2.75rem] grid-flow-col grid-rows-3 gap-1 overflow-x-auto overflow-y-hidden py-1 pr-1 no-scrollbar">
                {chapters.map((chapter) => (
                  <DepthButton
                    key={chapter}
                    type="button"
                    onClick={() => onChapterSelect?.(chapter)}
                    active={currentChapter === chapter}
                    sizeClassName="h-7 w-11 rounded-lg"
                    inactiveClassName="text-text-secondary border-select-border hover:text-text-primary"
                    activeClassName="text-text-primary border-btn-active-from"
                    className="text-[1.2rem] font-bold"
                  >
                    {chapter}
                  </DepthButton>
                ))}
              </div>
            </div>
          </DepthSurface>
        </div>

        {allPresets.length === 0 ? (
          <DepthSurface
            className="min-h-0 rounded-xl"
            surfaceClassName="bg-gradient-to-br from-select-bg via-select-hover to-select-bg-alt border border-select-border"
          >
            <div className="flex h-full flex-col items-center justify-center px-3 pr-16">
              <p className="text-center text-[0.78rem] text-text-secondary">
                No presets saved yet. Save a preset to fill this row.
              </p>
            </div>
            {flyerButton}
          </DepthSurface>
        ) : (
          <>
            {/* Row 1 */}
            <DepthSurface
              className="min-h-0 rounded-xl cursor-pointer"
              surfaceClassName="bg-card-bg-alt border border-select-border"
            >
              {row1Arrows.left && (
                <div
                  onClick={() => scrollRow(row1Ref, "left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  style={{
                    background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                  }}
                >
                  <ChevronLeft size={20} className="text-text-primary" />
                </div>
              )}

              {row1Arrows.right && (
                <div
                  onClick={() => scrollRow(row1Ref, "right")}
                  className="absolute right-14 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  style={{
                    background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                  }}
                >
                  <ChevronRight size={20} className="text-text-primary" />
                </div>
              )}

              <div
                ref={row1Ref}
                className="h-full overflow-x-auto overflow-y-hidden no-scrollbar p-1"
              >
                <div className="flex h-full gap-1">
                  {row1Presets.map((item) => {
                    if (item.kind === "alert") {
                      const a = item.alert;
                      return (
                        <div
                          key={item.id}
                          className="relative group h-full w-[11rem] flex-shrink-0 p-0 cursor-pointer border-dashed border-2 rounded-lg border-select-hover"
                          onClick={() => {
                            // Publish alert to presentation
                            if (
                              typeof window !== "undefined" &&
                              window.api &&
                              window.api.sendToBiblePresentation
                            ) {
                              window.api.sendToBiblePresentation({
                                type: "publishAlert",
                                data: {
                                  id: a.id,
                                  text: a.text,
                                  backgroundColor: a.backgroundColor,
                                  position: alertPositions[a.id] || "bottom",
                                },
                              });
                            }
                            // Show notification
                            showNotification &&
                              showNotification(
                                "Alert published to presentation",
                                "success",
                              );
                            // Update active alert state
                            onAlertActivated && onAlertActivated(a.id);
                          }}
                        >
                          <div className="relative bg-card-bg dark:bg-studio-bg w-full h-full rounded-lg overflow-hidden p-0">
                            <div className=" z-10 p-2 flex items-center justify-center h-full overflow-hidden">
                              <AlertOctagon className="w-6 h-6 mr-2 flex-shrink-0" />
                              <div
                                className=" absolute bottom-0 w-full "
                                style={{
                                  backgroundColor:
                                    a.backgroundColor || "var(--card-bg-alt)",
                                }}
                              >
                                <mark
                                  className="text-[0.9rem] marquee-track w-full font-semibold drop-shadow-lg"
                                  style={{
                                    color: "white",
                                    backgroundColor:
                                      a.backgroundColor || "var(--card-bg-alt)",
                                    animationName: "marquee",
                                    animationDuration: `10s`,
                                  }}
                                >
                                  {parseColoredText(a.text)}
                                </mark>
                              </div>
                            </div>
                          </div>

                          <div className="absolute z-50 top-1 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {activeAlertId === a.id && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentPos =
                                      alertPositions[a.id] || "bottom";
                                    const newPosition =
                                      currentPos === "bottom"
                                        ? "top"
                                        : "bottom";
                                    setAlertPositions({
                                      ...alertPositions,
                                      [a.id]: newPosition,
                                    });
                                    // Send immediate IPC update for position change
                                    window.api.sendToBiblePresentation({
                                      type: "updateAlertPosition",
                                      data: {
                                        alertId: a.id,
                                        position: newPosition,
                                      },
                                    });
                                  }}
                                  className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                                  title={`Alert position: ${
                                    alertPositions[a.id] || "bottom"
                                  } (click to toggle)`}
                                >
                                  {(alertPositions[a.id] || "bottom") ===
                                  "bottom" ? (
                                    <ArrowDown
                                      size={10}
                                      className="text-[var(--text-primary)]"
                                    />
                                  ) : (
                                    <ArrowUp
                                      size={10}
                                      className="text-[var(--text-primary)]"
                                    />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onHideAlert?.();
                                  }}
                                  className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black  rounded-full flex items-center justify-center"
                                  title="Close active alert"
                                >
                                  <X
                                    size={14}
                                    className="text-[var(--text-primary)]"
                                  />
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard
                                  .writeText(stripColorSyntax(a.text))
                                  .then(() => {
                                    showNotification &&
                                      showNotification(
                                        "Alert text copied to clipboard",
                                        "success",
                                      );
                                  })
                                  .catch(() => {
                                    showNotification &&
                                      showNotification(
                                        "Failed to copy text",
                                        "error",
                                      );
                                  });
                              }}
                              className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                              title="Copy alert text"
                            >
                              <Copy
                                size={10}
                                className="text-[var(--text-primary)]"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAlertEdit?.(a.id);
                              }}
                              className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                              title="Edit alert"
                            >
                              <AlertTriangle
                                size={10}
                                className="text-[var(--text-primary)]"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAlertDelete && onAlertDelete(item.alert.id);
                              }}
                              className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                              title="Delete alert"
                            >
                              <Trash2
                                size={10}
                                className="text-[var(--text-primary)]"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const preset = item.preset;

                    return (
                      <div
                        key={preset.id}
                        className="relative cursor-pointer group h-full w-[11rem] flex-shrink-0 p-0 border-none outline-none ring-0"
                      >
                        <Tooltip
                          title={preset.data?.text || ""}
                          placement="top"
                        >
                          <div
                            onClick={() => onPresetSelect(preset)}
                            className="w-full text-left h-full rounded-lg outline-none ring-0 border-2 border-dashed border-select-hover"
                          >
                            <div
                              className="relative w-full h-full rounded-lg overflow-hidden p-0 border-none outline-none ring-0"
                              style={{
                                background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                              }}
                            >
                              {/* Video Background - Priority */}
                              {preset.data?.videoBackground ? (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="absolute inset-0 w-full h-full object-cover"
                                >
                                  <source
                                    src={preset.data.videoBackground}
                                    type="video/mp4"
                                  />
                                </video>
                              ) : (preset.type === "image" ||
                                  preset.type === "flyer") &&
                                preset.data?.images &&
                                Array.isArray(preset.data.images) &&
                                preset.data.images.length > 0 ? (
                                /* Image / Flyer Preset - Show first image or grid if multiple */
                                preset.data.images.length === 1 ? (
                                  <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                      backgroundImage: `url(${preset.data.images[0]})`,
                                    }}
                                  />
                                ) : (
                                  /* Multiple images - show in grid */
                                  <div
                                    className="absolute inset-0 grid gap-0.5 h-full w-full"
                                    style={{
                                      gridTemplateColumns: "repeat(2, 1fr)",
                                      gridTemplateRows:
                                        preset.data.images.length <= 2
                                          ? "1fr"
                                          : "repeat(2, 1fr)",
                                    }}
                                  >
                                    {preset.data.images
                                      .slice(0, 4)
                                      .map((img: string, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-cover bg-center w-full h-full"
                                          style={{
                                            backgroundImage: `url(${img})`,
                                          }}
                                        />
                                      ))}
                                  </div>
                                )
                              ) : preset.data?.backgroundImage ? (
                                /* Background Image - Fallback for other preset types */
                                <div
                                  className="absolute inset-0 bg-cover bg-center p-0 "
                                  style={{
                                    backgroundImage: `url(${preset.data.backgroundImage})`,
                                  }}
                                />
                              ) : null}

                              {/* Content overlay — skip for AI flyers (text is baked into the image) */}
                              {preset.type !== "flyer" && (
                                <div className="relative z-10 p-2 flex flex-col gap-1 h-full">
                                  <span className="text-[0.9rem] font-semibold text-white drop-shadow-lg truncate w-full">
                                    {preset.data?.reference || preset.name}
                                  </span>
                                  <span className="text-[0.9rem] font-ThePriest text-white drop-shadow-md line-clamp-2  w-full">
                                    {preset.data?.text || ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Tooltip>

                        {/* AI Flyer badge */}
                        {preset.type === "flyer" && (
                          <div
                            className="absolute bottom-1 left-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                              fontSize: "0.58rem",
                              fontWeight: 700,
                              color: "#fff",
                              letterSpacing: "0.04em",
                              boxShadow: "0 1px 6px rgba(124,58,237,0.55)",
                            }}
                          >
                            <Sparkles size={7} />
                            AI
                          </div>
                        )}

                        {/* Delete div */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(preset);
                          }}
                          className="absolute z-50 top-1 right-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(145deg, #ef4444, #dc2626)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        >
                          <Trash2
                            size={10}
                            className="text-[var(--text-primary)]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {flyerButton}
            </DepthSurface>

            {/* Row 2 */}
            {row2Presets.length > 0 && (
              <div className="relative flex-">
                {row2Arrows.left && (
                  <div
                    onClick={() => scrollRow(row2Ref, "left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    style={{
                      background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                    }}
                  >
                    <ChevronLeft size={20} className="text-text-primary" />
                  </div>
                )}

                {row2Arrows.right && (
                  <div
                    onClick={() => scrollRow(row2Ref, "right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(145deg, #2a2a2a, #1f1f1f)"
                        : "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    }}
                  >
                    <ChevronRight size={20} className="text-text-primary" />
                  </div>
                )}

                <div
                  ref={row2Ref}
                  className=" overflow-x-auto overflow-y-hidden no-scrollbar"
                >
                  <div className="flex gap-1 ">
                    {row2Presets.map((item) => {
                      if (item.kind === "alert") {
                        const a = item.alert;
                        return (
                          <div
                            key={item.id}
                            className="relative group h-[5.3rem] w-[14vw] flex-shrink-0 p-0 cursor-pointer border-dashed border-2 rounded-lg border-select-hover"
                            onClick={() => {
                              // Publish alert to presentation
                              if (
                                typeof window !== "undefined" &&
                                window.api &&
                                window.api.sendToBiblePresentation
                              ) {
                                window.api.sendToBiblePresentation({
                                  type: "publishAlert",
                                  data: {
                                    id: a.id,
                                    text: a.text,
                                    backgroundColor: a.backgroundColor,
                                    speed: 12,
                                    position: alertPositions[a.id] || "bottom",
                                  },
                                });
                              }
                              // Show notification
                              showNotification &&
                                showNotification(
                                  "Alert published to presentation",
                                  "success",
                                );
                            }}
                          >
                            <div
                              className="relative w-full h-full rounded-lg overflow-hidden p-0"
                              style={{
                                background:
                                  a.backgroundColor || "var(--card-bg-alt)",
                              }}
                            >
                              <div className="relative z-10 p-2 flex items-center h-full overflow-hidden">
                                <div
                                  className="marquee-track"
                                  style={{
                                    animationName: "marquee",
                                    animationDuration: `10s`,
                                  }}
                                >
                                  <span
                                    className="text-[0.9rem] font-semibold drop-shadow-lg"
                                    style={{
                                      color: getContrastColor(
                                        a.backgroundColor,
                                      ),
                                    }}
                                  >
                                    {parseColoredText(a.text)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="absolute z-50 top-1 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {activeAlertId === a.id && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentPos =
                                        alertPositions[a.id] || "bottom";
                                      const newPosition =
                                        currentPos === "bottom"
                                          ? "top"
                                          : "bottom";
                                      setAlertPositions({
                                        ...alertPositions,
                                        [a.id]: newPosition,
                                      });
                                      // Send immediate IPC update for position change
                                      window.api.sendToBiblePresentation({
                                        type: "updateAlertPosition",
                                        data: {
                                          alertId: a.id,
                                          position: newPosition,
                                        },
                                      });
                                    }}
                                    className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                                    title={`Alert position: ${
                                      alertPositions[a.id] || "bottom"
                                    } (click to toggle)`}
                                  >
                                    {(alertPositions[a.id] || "bottom") ===
                                    "bottom" ? (
                                      <ArrowDown
                                        size={10}
                                        className="text-[var(--text-primary)]"
                                      />
                                    ) : (
                                      <ArrowUp
                                        size={10}
                                        className="text-[var(--text-primary)]"
                                      />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onHideAlert?.();
                                    }}
                                    className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                                    title="Close active alert"
                                  >
                                    <X
                                      size={10}
                                      className="text-[var(--text-primary)]"
                                    />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard
                                    .writeText(stripColorSyntax(a.text))
                                    .then(() => {
                                      showNotification &&
                                        showNotification(
                                          "Alert text copied to clipboard",
                                          "success",
                                        );
                                    })
                                    .catch(() => {
                                      showNotification &&
                                        showNotification(
                                          "Failed to copy text",
                                          "error",
                                        );
                                    });
                                }}
                                className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                                // style={{
                                //   background:"var(--bg"
                                // }}
                                title="Copy alert text"
                              >
                                <Copy
                                  size={10}
                                  className="text-[var(--text-primary)]"
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAlertEdit?.(a.id);
                                }}
                                className="w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                                title="Edit alert"
                              >
                                <AlertTriangle
                                  size={10}
                                  className="text-[var(--text-primary)]"
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAlertDelete && onAlertDelete(item.alert.id);
                                }}
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                  background:
                                    "linear-gradient(145deg, #ef4444, #dc2626)",
                                }}
                                title="Delete alert"
                              >
                                <Trash2
                                  size={10}
                                  className="text-[var(--text-primary)]"
                                />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      const preset = item.preset;

                      return (
                        <div
                          key={preset.id}
                          className="relative cursor-pointer group h-[5.3rem] w-[14vw] flex-shrink-0 p-0 border-none outline-none ring-0"
                        >
                          <Tooltip
                            title={preset.data?.text || ""}
                            placement="top"
                          >
                            <div
                              onClick={() => onPresetSelect(preset)}
                              className="w-full text-left h-full border-none outline-none ring-0"
                            >
                              <div
                                className="relative cursor-pointer w-full h-full rounded-lg overflow-hidden p-0 border-none outline-none ring-0"
                                style={{
                                  background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                                }}
                              >
                                {/* Video Background - Priority */}
                                {preset.data?.videoBackground ? (
                                  <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                  >
                                    <source
                                      src={preset.data.videoBackground}
                                      type="video/mp4"
                                    />
                                  </video>
                                ) : (preset.type === "image" ||
                                    preset.type === "flyer") &&
                                  preset.data?.images &&
                                  Array.isArray(preset.data.images) &&
                                  preset.data.images.length > 0 ? (
                                  preset.data.images.length === 1 ? (
                                    <div
                                      className="absolute inset-0 bg-cover bg-center"
                                      style={{
                                        backgroundImage: `url(${preset.data.images[0]})`,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="absolute inset-0 grid gap-0.5 h-full w-full"
                                      style={{
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gridTemplateRows:
                                          preset.data.images.length <= 2
                                            ? "1fr"
                                            : "repeat(2, 1fr)",
                                      }}
                                    >
                                      {preset.data.images
                                        .slice(0, 4)
                                        .map((img: string, idx: number) => (
                                          <div
                                            key={idx}
                                            className="bg-cover bg-center w-full h-full"
                                            style={{
                                              backgroundImage: `url(${img})`,
                                            }}
                                          />
                                        ))}
                                    </div>
                                  )
                                ) : preset.data?.backgroundImage ? (
                                  <div
                                    className="absolute inset-0 bg-cover bg-center p-0"
                                    style={{
                                      backgroundImage: `url(${preset.data.backgroundImage})`,
                                    }}
                                  />
                                ) : null}

                                {/* Content overlay — skip for AI flyers (text is baked into the image) */}
                                {preset.type !== "flyer" && (
                                  <div className="relative cursor-pointer z-10 p-2 flex flex-col gap-1 h-full">
                                    <span className="text-[0.9rem] font-semibold text-white drop-shadow-lg truncate w-full">
                                      {preset.data?.reference || preset.name}
                                    </span>
                                    <span className="text-[0.9rem] font-ThePriest text-white drop-shadow-md line-clamp-2  w-full">
                                      {preset.data?.text || ""}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Tooltip>

                          {/* AI Flyer badge */}
                          {preset.type === "flyer" && (
                            <div
                              className="absolute bottom-1 left-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full pointer-events-none"
                              style={{
                                background:
                                  "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                                fontSize: "0.58rem",
                                fontWeight: 700,
                                color: "#fff",
                                letterSpacing: "0.04em",
                                boxShadow: "0 1px 6px rgba(124,58,237,0.55)",
                              }}
                            >
                              <Sparkles size={7} />
                              AI
                            </div>
                          )}

                          {/* Delete div */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(preset);
                            }}
                            className="absolute z-50 top-1 right-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-6 h-6 bg-transparent shadow shadow-[var(--text-primary)] dark:shadow-black rounded-full flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(145deg, #ef4444, #dc2626)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          >
                            <Trash2
                              size={10}
                              className="text-[var(--text-primary)]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Generate AI Flyer button — always visible at bottom */}
      {false && (() => {
        const isMaxReached = allPresets.length >= 12;
        return (
          <div className="absolute top-3 right-3 z-30">
            <motion.button
              onClick={() => {
                if (isMaxReached) {
                  showNotification?.(
                    "Max presets reached (12). Delete a preset to generate a new AI Flyer.",
                    "warning",
                  );
                } else {
                  onOpenFlyerGenerator?.();
                }
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.73rem] font-bold cursor-pointer select-none"
              style={{
                background: isMaxReached
                  ? "var(--card-bg)"
                  : "linear-gradient(135deg, var(--btn-normal-from) 0%, var(--btn-normal-to) 100%)",
                color: isMaxReached ? "#fbbf24" : "var(--text-primary)",
                border: isMaxReached
                  ? "1px solid rgba(245,158,11,0.4)"
                  : "1px solid var(--select-border)",
                boxShadow: isMaxReached
                  ? "none"
                  : "0 2px 10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
                letterSpacing: "0.03em",
              }}
            >
              {/* Shimmer sweep */}
              {!isMaxReached && (
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.13) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1.4,
                  }}
                />
              )}

              {/* Pulsing dot */}
              {!isMaxReached && (
                <motion.span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--text-primary)" }}
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              <Sparkles size={12} className="flex-shrink-0" />
              <span>Generate AI Flyer</span>

              {isMaxReached && (
                <span
                  className="ml-1 px-1 py-0.5 rounded text-[0.6rem] font-extrabold leading-none"
                  style={{
                    background: "rgba(245,158,11,0.18)",
                    color: "#fbbf24",
                    border: "1px solid rgba(245,158,11,0.35)",
                  }}
                >
                  MAX
                </span>
              )}
            </motion.button>
          </div>
        );
      })()}
    </DepthSurface>
  );
};
