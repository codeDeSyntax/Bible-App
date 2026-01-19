import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
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

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-[400px] max-w-[90vw] rounded-xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
      >
        {/* Header */}
        <div
          className="px-4 pt-3 flex items-center justify-between border-b"
          style={{
            backgroundColor: "var(--select-bg)",
            borderColor: "var(--select-border)",
          }}
        >
          <div>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Marquee Alert
            </span>
          </div>
          <Tooltip title="Close (Esc)">
            <button
              onClick={onCancel}
              className="p-1 rounded transition-all hover:opacity-70"
              style={{ backgroundColor: "var(--select-bg)" }}
              aria-label="Close"
            >
              <X size={16} style={{ color: "var(--text-primary)" }} />
            </button>
          </Tooltip>
        </div>

        {/* Content */}
        <div
          className="p-4 space-y-3"
          style={{ backgroundColor: "var(--select-bg)" }}
        >
          {/* Text Input */}
          <div className="space-y-1">
            <label
              className="text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Message
            </label>
            <textarea
              ref={textareaRef}
              value={displayText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={3}
              placeholder="Type message..."
              spellCheck={false}
              className="w-full px-2 py-1.5 rounded border-none text-xs resize-y no-scrollbar outline-none transition-all"
              style={{
                backgroundColor: "var(--select-border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--focus-border)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--select-border)";
              }}
            />
          </div>

          {/* Text Color Selector */}
          <div className="space-y-1 flex gap-2 items-center">
            <label
              className="text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Text Color
            </label>
            <input
              type="color"
              defaultValue="#ffffff"
              onChange={(e) => applyColorToSelection(e.target.value)}
              className="w-1/4 h-8 rounded cursor-pointer"
              style={{
                border: "1px solid var(--select-border)",
                backgroundColor: "var(--select-bg)",
              }}
              aria-label="Text color"
            />
            <span className="text-xs text-gray-500">(Select text first)</span>
          </div>

          {/* Emoji/Symbol Picker */}
          <div className="space-y-1">
            <label
              className="text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Formatting Symbols
            </label>
            <div className="overflow-x-auto no-scrollbar pb-2">
              <div
                className="flex gap-1 no-scrollbar"
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
                  "├",
                  "┤",
                  "┬",
                  "┴",
                  "┼",
                  "┅",
                  "┆",
                  "┊",
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
                      className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm transition-all hover:scale-110 font-mono"
                      style={{
                        backgroundColor: "var(--select-border)",
                        border: "1px solid var(--select-border)",
                      }}
                    >
                      {symbol}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-1 flex gap-2 items-center">
            <label
              className="text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Background
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-1/2 h-10 rounded cursor-pointer"
              style={{
                border: "1px solid var(--select-border)",
                backgroundColor: "var(--select-bg)",
              }}
              aria-label="Background color"
            />
          </div>

          {/* Preview */}
          <div className="space-y-1 ">
            <label
              className="text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Preview
            </label>
            <motion.div
              className="p-2 rounded border flex items-center justify-center min-h-12"
              style={{
                backgroundColor: bgColor,
                borderColor: "var(--select-border)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <div className="text-xs text-center whitespace-pre-wrap">
                {internalText ? (
                  parseColoredText(internalText)
                ) : (
                  <span
                    style={{
                      color:
                        bgColor === "#000000" || bgColor === "#111827"
                          ? "#999999"
                          : "#cccccc",
                    }}
                  >
                    Preview
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-1">
            <Tooltip title="Cancel">
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-medium rounded transition-all"
                style={{
                  backgroundColor: "var(--btn-normal-from)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--select-border)",
                }}
              >
                Cancel
              </button>
            </Tooltip>
            <Tooltip
              title={
                !internalText || internalText.trim().length === 0
                  ? "Enter text"
                  : "Save and publish"
              }
            >
              <button
                onClick={handleSave}
                disabled={!internalText || internalText.trim().length === 0}
                className="px-3 py-1.5 text-xs font-semibold text-white rounded transition-all disabled:opacity-50"
                style={{
                  background:
                    !internalText || internalText.trim().length === 0
                      ? "var(--btn-normal-from)"
                      : "linear-gradient(135deg, var(--header-gradient-from), var(--header-gradient-to))",
                }}
              >
                Publish
              </button>
            </Tooltip>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
