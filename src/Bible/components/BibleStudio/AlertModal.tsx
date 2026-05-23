import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Megaphone } from "lucide-react";
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
  const regex = /\{([a-zA-Z0-9]+)\}([^{]*)\{\/\1\}/g;
  const ranges: ColorRange[] = [];
  let plainText = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    plainText += text.slice(lastIndex, match.index);

    const color = match[1];
    const coloredText = match[2];
    const start = plainText.length;

    plainText += coloredText;
    ranges.push({
      start,
      end: plainText.length,
      color:
        colorMap[color] ||
        (/^[a-f0-9]{6}$/i.test(color) ? `#${color}` : colorMap.red),
    });

    lastIndex = regex.lastIndex;
  }

  plainText += text.slice(lastIndex);
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

  const oldChangeEnd = oldText.length - suffixLength;
  const delta = newText.length - oldText.length;

  return ranges
    .map((range) => {
      if (range.end <= prefixLength) return range;
      if (range.start >= oldChangeEnd) {
        return {
          ...range,
          start: range.start + delta,
          end: range.end + delta,
        };
      }

      return null;
    })
    .filter((range): range is ColorRange => !!range)
    .filter((range) => range.start >= 0 && range.end <= newText.length);
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

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onCancel,
  onSave,
  initialText = "",
  initialColor = "#000000",
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [visible, initialText, initialColor]);

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
      id: editingAlertId || undefined,
    });
    setDisplayText("");
    setColorRanges([]);
    setBgColor(initialColor);
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
        className="relative z-10 w-[380px] max-w-[92vw] rounded-xl overflow-hidden border border-select-border shadow-2xl"
        style={{ background: "var(--card-bg)" }}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: "spring", damping: 26, stiffness: 360 }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-select-border">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))",
            }}
          >
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
              className="p-1.5 rounded-lg bg-studio-bg hover:bg-select-hover border border-select-border transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={12} className="text-text-primary" />
            </button>
          </Tooltip>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="p-3 space-y-2.5">
          {/* Message textarea */}
          <div className="space-y-1">
            <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest">
              Message
            </p>
            <textarea
              ref={textareaRef}
              value={displayText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={2}
              placeholder="Type your marquee message…"
              spellCheck={false}
              className="w-full px-2.5 py-2 rounded-lg border border-select-border text-[0.75rem] resize-none no-scrollbar outline-none transition-colors focus:border-text-secondary text-text-primary placeholder:text-text-secondary leading-snug"
              style={{ background: "var(--studio-bg)" }}
            />
          </div>

          {/* Text color + hint row */}
          <div className="flex items-center gap-2 rounded-lg border border-select-border px-2.5 py-2">
            <div className="flex items-center gap-2">
              <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest whitespace-nowrap">
                Text
              </p>
              <input
                type="color"
                defaultValue={colorMap.white}
                onChange={(e) => applyColorToSelection(e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border border-select-border"
                style={{ background: "var(--studio-bg)", padding: "2px" }}
                aria-label="Text color"
              />
            </div>
            <div className="flex items-center gap-1">
              {quickTextColors.map(([name, hex]) => (
                <Tooltip key={name} title={`Apply ${name}`}>
                  <button
                    type="button"
                    onClick={() => applyColorToSelection(hex)}
                    className="w-4 h-4 rounded border border-select-border cursor-pointer hover:scale-110 transition-transform"
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
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[0.7rem] font-mono text-text-primary transition-colors cursor-pointer border border-select-border hover:bg-select-hover"
                        style={{ background: "var(--studio-bg)" }}
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
                className="w-8 h-8 rounded-lg cursor-pointer border border-select-border"
                style={{ background: "var(--studio-bg)", padding: "2px" }}
                aria-label="Background color"
              />
            </div>

            {/* Preview */}
            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-widest">
                Preview
              </p>
              <motion.div
                className="rounded-lg border border-select-border flex items-center justify-center min-h-[2.15rem] px-2.5 py-1.5 overflow-hidden"
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
          <div className="flex gap-1.5 justify-end pt-0.5">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-[0.72rem] font-medium rounded-lg border border-select-border bg-studio-bg text-text-primary hover:bg-select-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Tooltip
              title={isEmpty ? "Enter a message first" : "Save to alert list"}
            >
              <button
                onClick={handleSave}
                disabled={isEmpty}
                className={`px-3.5 py-1.5 text-[0.72rem] font-semibold rounded-lg text-white transition-all ${
                  isEmpty
                    ? "opacity-40 cursor-not-allowed bg-select-bg"
                    : "cursor-pointer bg-gradient-to-r from-btn-active-from to-btn-active-to hover:opacity-90"
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
