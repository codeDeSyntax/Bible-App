import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Megaphone, Sparkles, Loader2 } from "lucide-react";
import { Tooltip } from "antd";

interface AlertModalProps {
  visible: boolean;
  initialText?: string;
  initialColor?: string;
  editingAlertId?: string | null;
  onCancel: () => void;
  onSave: (payload: {
    text: string;
    backgroundColor?: string;
    themeName?: string;
    isAiGenerated?: boolean;
    id?: string;
  }) => void;
}

// Color mapping
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

type ColorRange = {
  start: number;
  end: number;
  color: string;
};

type TextSnapshot = {
  text: string;
  ranges: ColorRange[];
};

const colorTokenFromHex = (hexColor: string) => {
  const namedColor = Object.entries(colorMap).find(
    ([, hex]) => hex.toLowerCase() === hexColor.toLowerCase(),
  )?.[0];

  return namedColor || hexColor.replace("#", "");
};

const parseAlertMarkup = (text: string) => {
  const regex = /\{([a-zA-Z0-9]+)\}([^{]*?)\{\/\1\}/gi;
  const ranges: ColorRange[] = [];
  let plainText = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const rawBefore = text.slice(lastIndex, match.index).replace(/\{[^\}]+\}/g, "");
    plainText += rawBefore;

    const color = match[1].toLowerCase();
    const coloredText = match[2];
    const start = plainText.length;

    plainText += coloredText;
    ranges.push({
      start,
      end: plainText.length,
      color:
        colorMap[color] ||
        (/^[a-f0-9]{6}$/i.test(color) ? `#${color}` : colorMap.white),
    });

    lastIndex = regex.lastIndex;
  }

  const rawRemaining = text.slice(lastIndex).replace(/\{[^\}]+\}/g, "");
  plainText += rawRemaining;
  return { plainText, ranges };
};

const buildAlertMarkup = (text: string, ranges: ColorRange[]) => {
  const sortedRanges = [...ranges]
    .map((range) => ({
      ...range,
      start: Math.max(0, Math.min(text.length, range.start)),
      end: Math.max(0, Math.min(text.length, range.end)),
    }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start);

  const parts: string[] = [];
  let cursor = 0;

  sortedRanges.forEach((range) => {
    if (range.start < cursor) return;

    parts.push(text.slice(cursor, range.start));
    const token = colorTokenFromHex(range.color);
    parts.push(`{${token}}${text.slice(range.start, range.end)}{/${token}}`);
    cursor = range.end;
  });

  parts.push(text.slice(cursor));
  return parts.join("");
};

const updateRangesForTextChange = (
  oldText: string,
  newText: string,
  ranges: ColorRange[],
) => {
  if (oldText === newText) return ranges;
  if (!ranges || ranges.length === 0) return [];

  let prefixLength = 0;
  const minLength = Math.min(oldText.length, newText.length);
  while (
    prefixLength < minLength &&
    oldText[prefixLength] === newText[prefixLength]
  ) {
    prefixLength++;
  }

  let suffixLength = 0;
  while (
    suffixLength < oldText.length - prefixLength &&
    suffixLength < newText.length - prefixLength &&
    oldText[oldText.length - 1 - suffixLength] ===
      newText[newText.length - 1 - suffixLength]
  ) {
    suffixLength++;
  }

  const changeStart = prefixLength;
  const oldChangeEnd = oldText.length - suffixLength;
  const newChangeEnd = newText.length - suffixLength;
  const delta = newText.length - oldText.length;

  return ranges
    .map((range) => {
      // 1. Range is completely BEFORE the edit
      if (range.end <= changeStart) {
        return range;
      }

      // 2. Range is completely AFTER the edit
      if (range.start >= oldChangeEnd) {
        return {
          ...range,
          start: range.start + delta,
          end: range.end + delta,
        };
      }

      // 3. Edit occurred INSIDE the range
      if (range.start <= changeStart && range.end >= oldChangeEnd) {
        const newEnd = range.end + delta;
        if (newEnd > range.start) {
          return {
            ...range,
            end: newEnd,
          };
        }
        return null;
      }

      // 4. Edit overlaps start boundary
      if (range.start >= changeStart && range.start < oldChangeEnd && range.end >= oldChangeEnd) {
        const newStart = Math.min(newChangeEnd, range.end + delta);
        const newEnd = range.end + delta;
        if (newEnd > newStart) {
          return {
            ...range,
            start: newStart,
            end: newEnd,
          };
        }
        return null;
      }

      // 5. Edit overlaps end boundary
      if (range.start <= changeStart && range.end > changeStart && range.end <= oldChangeEnd) {
        const newEnd = changeStart;
        if (newEnd > range.start) {
          return {
            ...range,
            end: newEnd,
          };
        }
        return null;
      }

      // 6. Range was completely replaced/overwritten by edit
      if (range.start >= changeStart && range.end <= oldChangeEnd) {
        if (newChangeEnd > changeStart) {
          return {
            ...range,
            start: changeStart,
            end: newChangeEnd,
          };
        }
        return null;
      }

      return null;
    })
    .filter((range): range is ColorRange => !!range)
    .filter((range) => range.start >= 0 && range.end <= newText.length && range.end > range.start);
};

// Parse colored text for rendering
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
      colorValue = `#${color}`;
    } else {
      colorValue = colorMap.red;
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

export const AlertModal: React.FC<AlertModalProps & { initialThemeName?: string }> = ({
  visible,
  onCancel,
  onSave,
  initialText = "",
  initialColor = "#000000",
  initialThemeName,
  editingAlertId = null,
}) => {
  const parsedInitialText = parseAlertMarkup(initialText);
  const [displayText, setDisplayText] = useState(parsedInitialText.plainText);
  const [colorRanges, setColorRanges] = useState<ColorRange[]>(
    parsedInitialText.ranges,
  );
  const [bgColor, setBgColor] = useState(initialColor);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textHistory, setTextHistory] = useState<TextSnapshot[]>([
    { text: parsedInitialText.plainText, ranges: parsedInitialText.ranges },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // AI Styling State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiThemeName, setAiThemeName] = useState<string | null>(initialThemeName || null);

  const internalText = buildAlertMarkup(displayText, colorRanges);

  useEffect(() => {
    if (visible) {
      const parsedText = parseAlertMarkup(initialText || "");
      const bgColorToSet = initialColor || "#000000";

      setDisplayText(parsedText.plainText);
      setColorRanges(parsedText.ranges);
      setBgColor(bgColorToSet);
      setTextHistory([
        { text: parsedText.plainText, ranges: parsedText.ranges },
      ]);
      setHistoryIndex(0);
      setAiError(null);
      setIsGeneratingAi(false);
      setAiThemeName(initialThemeName || null);
      document.body.style.overflow = "hidden";
    } else {
      setIsGeneratingAi(false);
      document.body.style.overflow = "";
    }

    return () => {
      setIsGeneratingAi(false);
      document.body.style.overflow = "";
    };
  }, [visible, initialText, initialColor, initialThemeName]);

  const handleAiStyle = async () => {
    if (!displayText || displayText.trim().length === 0) return;
    if (!window.api?.generateStyledAlert) {
      setAiError("AI service not available in this window.");
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await window.api.generateStyledAlert(displayText);
      if (res.success && res.data) {
        if (res.data.backgroundColor) {
          setBgColor(res.data.backgroundColor);
        }
        if (res.data.markupText) {
          const parsed = parseAlertMarkup(res.data.markupText);
          setDisplayText(parsed.plainText);
          setColorRanges(parsed.ranges);
          pushHistory(parsed.plainText, parsed.ranges);
        }
        if (res.data.themeName) {
          setAiThemeName(res.data.themeName);
        }
      } else if (res.error) {
        setAiError(res.error);
      }
    } catch (err: any) {
      console.error("AI Alert Design failed:", err);
      setAiError(err.message || "Failed to style alert with AI");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const pushHistory = (text: string, ranges: ColorRange[]) => {
    const currentSnapshot = textHistory[historyIndex];
    const rangesChanged =
      JSON.stringify(currentSnapshot?.ranges || []) !== JSON.stringify(ranges);

    if (text !== currentSnapshot?.text || rangesChanged) {
      const newHistory = textHistory.slice(0, historyIndex + 1);
      newHistory.push({ text, ranges });
      setTextHistory(newHistory.slice(-30));
      setHistoryIndex(Math.min(newHistory.length - 1, 29));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    if (visible) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onCancel, historyIndex, textHistory]);

  const handleSave = () => {
    if (!displayText || displayText.trim().length === 0) return;
    // Save the internal text with color syntax, include ID if editing
    onSave({
      text: buildAlertMarkup(displayText, colorRanges).trim(),
      backgroundColor: bgColor,
      themeName: aiThemeName || undefined,
      isAiGenerated: Boolean(aiThemeName),
      id: editingAlertId || undefined,
    });
    setDisplayText("");
    setColorRanges([]);
    setBgColor(initialColor);
    setAiThemeName(null);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const snapshot = textHistory[newIndex];
      setHistoryIndex(newIndex);
      setDisplayText(snapshot.text);
      setColorRanges(snapshot.ranges);
    }
  };

  const handleTextChange = (newDisplayText: string) => {
    const nextRanges = updateRangesForTextChange(
      displayText,
      newDisplayText,
      colorRanges,
    );

    setDisplayText(newDisplayText);
    setColorRanges(nextRanges);
    pushHistory(newDisplayText, nextRanges);
  };

  const applyColorToSelection = (hexColor: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = displayText.substring(start, end);

    if (selectedText.length === 0) return;

    const nextRanges = [
      ...colorRanges.filter(
        (range) => range.end <= start || range.start >= end,
      ),
      { start, end, color: hexColor },
    ];

    setColorRanges(nextRanges);
    pushHistory(displayText, nextRanges);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = displayText.substring(0, start);
    const afterText = displayText.substring(end);
    const newDisplayText = beforeText + emoji + afterText;
    const nextRanges = updateRangesForTextChange(
      displayText,
      newDisplayText,
      colorRanges,
    );

    setDisplayText(newDisplayText);
    setColorRanges(nextRanges);
    pushHistory(newDisplayText, nextRanges);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  if (!visible) return null;

  const isEmpty = !displayText || displayText.trim().length === 0;
  const quickTextColors = Object.entries(colorMap).filter(
    ([name]) => name !== "black",
  );

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      />

      {/* Modal panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-[380px] max-w-[92vw] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-card-bg border border-neutral-200/80 dark:border-transparent"
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: "spring", damping: 26, stiffness: 360 }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3.5 py-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-btn-active-from text-white shadow-2xs">
            <Megaphone className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.78rem] font-semibold text-text-primary leading-tight truncate">
              {editingAlertId ? "Edit Marquee Alert" : "New Marquee Alert"}
            </p>
            <p className="text-[0.6rem] text-text-secondary leading-tight truncate">
              Save here, publish from the alert list
            </p>
          </div>
          <Tooltip title="Close (Esc)">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-studio-bg dark:hover:bg-select-hover transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={13} className="text-text-primary" />
            </button>
          </Tooltip>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="px-3.5 pb-3.5 space-y-2.5">
          {/* AI Error Banner */}
          {aiError && (
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[0.68rem] flex items-center justify-between">
              <span>{aiError}</span>
              <button
                type="button"
                onClick={() => setAiError(null)}
                className="font-bold text-red-500 hover:text-red-700 ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Message textarea with AI Style button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest">
                Message
              </p>
              <Tooltip title={isEmpty ? "Type a message first to auto-style" : "Auto-design broadcast colors & formatting with AI"}>
                <button
                  type="button"
                  onClick={handleAiStyle}
                  disabled={isEmpty || isGeneratingAi}
                  className={`relative group overflow-hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold tracking-tight transition-all duration-300 ${
                    isGeneratingAi
                      ? "bg-lime-400 text-lime-950 shadow-md shadow-lime-400/50 animate-pulse cursor-wait ring-2 ring-lime-300"
                      : isEmpty
                        ? "bg-select-bg text-text-secondary opacity-40 cursor-not-allowed"
                        : "bg-lime-400 hover:bg-lime-300 text-lime-950 shadow-md shadow-lime-400/40 ring-1 ring-lime-400/80 hover:shadow-lime-400/60 cursor-pointer animate-pulse"
                  }`}
                >
                  {!isEmpty && !isGeneratingAi && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-950 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-950"></span>
                    </span>
                  )}
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-lime-950 flex-shrink-0" />
                      <span>Styling with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className={`w-3 h-3 text-lime-950 flex-shrink-0 ${!isEmpty ? "animate-spin" : ""}`} style={{ animationDuration: "4s" }} />
                      <span>AI Style</span>
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
            <textarea
              ref={textareaRef}
              value={displayText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={2}
              placeholder="Type your marquee message…"
              spellCheck={false}
              className="w-full px-2.5 py-2 rounded-xl text-[0.75rem] resize-none no-scrollbar outline-none transition-colors text-text-primary placeholder:text-text-secondary leading-snug bg-neutral-50 dark:bg-studio-bg border-0 shadow-none focus:ring-1 focus:ring-btn-active-from"
            />
          </div>

          {/* Text color + hint row */}
          <div className="flex items-center gap-2 rounded-xl px-2.5 py-2 bg-neutral-50 dark:bg-studio-bg border-0 shadow-none">
            <div className="flex items-center gap-2">
              <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest whitespace-nowrap">
                Text
              </p>
              <input
                type="color"
                defaultValue={colorMap.white}
                onChange={(e) => applyColorToSelection(e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border-0 outline-none bg-neutral-50 dark:bg-studio-bg p-[2px] shadow-none"
                aria-label="Text color"
              />
            </div>
            <div className="flex items-center gap-1">
              {quickTextColors.map(([name, hex]) => (
                <Tooltip key={name} title={`Apply ${name}`}>
                  <button
                    type="button"
                    onClick={() => applyColorToSelection(hex)}
                    className="w-4 h-4 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-xs"
                    style={{ backgroundColor: hex }}
                    aria-label={`Apply ${name} text color`}
                  />
                </Tooltip>
              ))}
            </div>
            <p className="ml-auto text-[0.57rem] text-text-secondary whitespace-nowrap">
              Select first
            </p>
          </div>

          {/* Symbol picker */}
          <div className="space-y-1">
            <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest">
              Symbols
            </p>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-1" style={{ minWidth: "min-content" }}>
                {[
                  "▲",
                  "▼",
                  "◄",
                  "►",
                  "●",
                  "○",
                  "•",
                  "◆",
                  "◇",
                  "■",
                  "□",
                  "▪",
                  "▫",
                  "│",
                  "║",
                  "┃",
                  "─",
                  "═",
                  "━",
                  "▬",
                  "┌",
                  "┐",
                  "└",
                  "┘",
                  "╔",
                  "╗",
                  "╚",
                  "╝",
                  "⬆",
                  "⬇",
                  "⬅",
                  "➡",
                ]
                  .slice()
                  .map((symbol) => (
                    <Tooltip key={symbol} title={`Insert ${symbol}`}>
                      <button
                        onClick={() => insertEmoji(symbol)}
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[0.7rem] font-mono text-text-primary transition-colors cursor-pointer bg-neutral-50 hover:bg-neutral-100 dark:bg-studio-bg dark:hover:bg-select-hover border-0 shadow-none"
                      >
                        {symbol}
                      </button>
                    </Tooltip>
                  ))}
              </div>
            </div>
          </div>

          {/* Background color + live preview side-by-side */}
          <div className="flex gap-2.5">
            {/* BG color */}
            <div className="space-y-1 flex-shrink-0">
              <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest">
                Background
              </p>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-xl cursor-pointer border-0 outline-none bg-neutral-50 dark:bg-studio-bg p-[2px] shadow-none"
                aria-label="Background color"
              />
            </div>

            {/* Preview */}
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest">
                  Preview
                </p>
                {aiThemeName && (
                  <span className="text-[0.55rem] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-full">
                    {aiThemeName}
                  </span>
                )}
              </div>
              <motion.div
                className="rounded-xl flex items-center justify-center min-h-[2.15rem] px-2.5 py-1.5 overflow-hidden shadow-inner"
                style={{ backgroundColor: bgColor }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="text-[0.7rem] text-center whitespace-pre-wrap leading-snug line-clamp-2">
                  {internalText ? (
                    parseColoredText(internalText)
                  ) : (
                    <span
                      className="italic"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Preview
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 justify-end pt-1">
            <button
              onClick={onCancel}
              className="px-3.5 py-1.5 text-[0.72rem] font-medium rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-studio-bg text-text-primary dark:hover:bg-select-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Tooltip
              title={isEmpty ? "Enter a message first" : "Save to alert list"}
            >
              <button
                onClick={handleSave}
                disabled={isEmpty}
                className={`px-4 py-1.5 text-[0.72rem] font-semibold rounded-xl text-white transition-all ${
                  isEmpty
                    ? "opacity-40 cursor-not-allowed bg-select-bg"
                    : "cursor-pointer bg-gradient-to-r from-btn-active-from to-btn-active-to hover:opacity-90 shadow-xs"
                }`}
              >
                {editingAlertId ? "Update" : "Save"}
              </button>
            </Tooltip>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
