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

// Strip color syntax to get plain text
const stripColorSyntax = (text: string): string => {
  return text.replace(/\{[a-zA-Z0-9]+\}([^{]*)\{\/[a-zA-Z0-9]+\}/g, "$1");
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
  // Internal colored text with syntax (stored version)
  const [internalText, setInternalText] = useState(initialText);
  // Display text without color syntax (what user sees and edits)
  const [displayText, setDisplayText] = useState(stripColorSyntax(initialText));
  const [bgColor, setBgColor] = useState(initialColor);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textHistory, setTextHistory] = useState<string[]>([
    stripColorSyntax(initialText),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedColorRange, setSelectedColorRange] = useState<{
    start: number;
    end: number;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      const textToDisplay = initialText || "";
      const bgColorToSet = initialColor || "#000000";

      setInternalText(textToDisplay);
      setDisplayText(stripColorSyntax(textToDisplay));
      setBgColor(bgColorToSet);
      setTextHistory([stripColorSyntax(textToDisplay)]);
      setHistoryIndex(0);
      setSelectedColorRange(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [visible, initialText, initialColor]);

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
    if (!internalText || internalText.trim().length === 0) return;
    // Save the internal text with color syntax, include ID if editing
    onSave({
      text: internalText,
      backgroundColor: bgColor,
      id: editingAlertId || undefined,
    });
    setInternalText("");
    setDisplayText("");
    setBgColor(initialColor);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDisplayText(textHistory[newIndex]);
      updateInternalText(textHistory[newIndex]);
    }
  };

  const handleTextChange = (newDisplayText: string) => {
    setDisplayText(newDisplayText);
    updateInternalText(newDisplayText);

    // Add to history if it's a significant change
    if (newDisplayText !== textHistory[historyIndex]) {
      const newHistory = textHistory.slice(0, historyIndex + 1);
      newHistory.push(newDisplayText);
      setTextHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Update internal text when display text changes
  const updateInternalText = (newDisplayText: string) => {
    setInternalText(newDisplayText);
  };

  const applyColorToSelection = (hexColor: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = displayText.substring(start, end);

    if (selectedText.length === 0) return;

    // Convert hex to color name if it matches a known color
    let colorName = Object.entries(colorMap).find(
      ([_, hex]) => hex === hexColor,
    )?.[0];
    if (!colorName) {
      colorName = hexColor.replace("#", "");
    }

    const beforeText = displayText.substring(0, start);
    const afterText = displayText.substring(end);

    // Update display text (without syntax)
    const newDisplayText = beforeText + selectedText + afterText;
    setDisplayText(newDisplayText);

    // Update internal text (with syntax)
    const coloredText = `{${colorName}}${selectedText}{/${colorName}}`;
    const newInternalText = beforeText + coloredText + afterText;
    setInternalText(newInternalText);

    // Update history
    if (newDisplayText !== textHistory[historyIndex]) {
      const newHistory = textHistory.slice(0, historyIndex + 1);
      newHistory.push(newDisplayText);
      setTextHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

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

    setDisplayText(newDisplayText);
    updateInternalText(newDisplayText);

    // Add to history
    if (newDisplayText !== textHistory[historyIndex]) {
      const newHistory = textHistory.slice(0, historyIndex + 1);
      newHistory.push(newDisplayText);
      setTextHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  if (!visible) return null;

  const isEmpty = !internalText || internalText.trim().length === 0;

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
        className="relative z-10 w-[460px] max-w-[92vw] rounded-2xl overflow-hidden border border-select-border"
        style={{ background: "var(--card-bg)" }}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: "spring", damping: 26, stiffness: 360 }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-select-border">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))",
            }}
          >
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[0.82rem] font-semibold text-text-primary leading-tight">
              {editingAlertId ? "Edit Marquee Alert" : "New Marquee Alert"}
            </p>
            <p className="text-[0.67rem] text-text-secondary leading-tight">
              Scrolling message shown on the presentation screen
            </p>
          </div>
          <Tooltip title="Close (Esc)">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-studio-bg hover:bg-select-hover border border-select-border transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={13} className="text-text-primary" />
            </button>
          </Tooltip>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="p-4 space-y-4">
          {/* Message textarea */}
          <div className="space-y-1.5">
            <p className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest">
              Message
            </p>
            <textarea
              ref={textareaRef}
              value={displayText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={3}
              placeholder="Type your marquee message…"
              spellCheck={false}
              className="w-full px-3 py-2 rounded-xl border border-select-border text-[0.8rem] resize-none no-scrollbar outline-none transition-colors focus:border-text-secondary text-text-primary placeholder:text-text-secondary"
              style={{ background: "var(--studio-bg)" }}
            />
          </div>

          {/* Text color + hint row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <p className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest whitespace-nowrap">
                Text Color
              </p>
              <input
                type="color"
                defaultValue="#ffffff"
                onChange={(e) => applyColorToSelection(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-select-border"
                style={{ background: "var(--studio-bg)", padding: "2px" }}
                aria-label="Text color"
              />
            </div>
            <p className="text-[0.68rem] text-text-secondary italic">
              Select text in the box first, then pick a color
            </p>
          </div>

          {/* Symbol picker */}
          <div className="space-y-1.5">
            <p className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest">
              Symbols
            </p>
            <div className="overflow-x-auto no-scrollbar">
              <div
                className="flex gap-1 pb-1"
                style={{ minWidth: "min-content" }}
              >
                {[
                  "─",
                  "═",
                  "━",
                  "▬",
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
                  "┌",
                  "┐",
                  "└",
                  "┘",
                  "╔",
                  "╗",
                  "╚",
                  "╝",
                  "▲",
                  "▼",
                  "◄",
                  "►",
                  "⬆",
                  "⬇",
                  "⬅",
                  "➡",
                ].map((symbol) => (
                  <Tooltip key={symbol} title={`Insert ${symbol}`}>
                    <button
                      onClick={() => insertEmoji(symbol)}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[0.75rem] font-mono text-text-primary transition-colors cursor-pointer border border-select-border hover:bg-select-hover"
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
          <div className="flex gap-3">
            {/* BG color */}
            <div className="space-y-1.5 flex-shrink-0">
              <p className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest">
                Background
              </p>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-select-border"
                style={{ background: "var(--studio-bg)", padding: "2px" }}
                aria-label="Background color"
              />
            </div>

            {/* Preview */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <p className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest">
                Preview
              </p>
              <motion.div
                className="rounded-xl border border-select-border flex items-center justify-center min-h-[2.75rem] px-3 py-2"
                style={{ backgroundColor: bgColor }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="text-[0.78rem] text-center whitespace-pre-wrap leading-snug">
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
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 text-[0.78rem] font-medium rounded-xl border border-select-border bg-studio-bg text-text-primary hover:bg-select-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Tooltip
              title={isEmpty ? "Enter a message first" : "Save and publish"}
            >
              <button
                onClick={handleSave}
                disabled={isEmpty}
                className={`px-4 py-1.5 text-[0.78rem] font-semibold rounded-xl text-white transition-all ${
                  isEmpty
                    ? "opacity-40 cursor-not-allowed bg-select-bg"
                    : "cursor-pointer bg-gradient-to-r from-btn-active-from to-btn-active-to hover:opacity-90"
                }`}
              >
                {editingAlertId ? "Update" : "Publish"}
              </button>
            </Tooltip>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
