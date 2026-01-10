import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Tooltip } from "antd";

interface AlertModalProps {
  visible: boolean;
  initialText?: string;
  initialColor?: string;
  onCancel: () => void;
  onSave: (payload: {
    text: string;
    backgroundColor?: string;
    textColor?: string;
  }) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onCancel,
  onSave,
  initialText = "",
  initialColor = "#000000",
}) => {
  const [text, setText] = useState(initialText);
  const [bgColor, setBgColor] = useState(initialColor);
  const [textColor, setTextColor] = useState("#ffffff");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textHistory, setTextHistory] = useState<string[]>([initialText]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setBgColor(initialColor);
      setTextColor("#ffffff");
      setTextHistory([initialText]);
      setHistoryIndex(0);
      setShowColorPicker(false);
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
    if (!text || text.trim().length === 0) return;
    // Preserve spacing exactly as entered when publishing
    onSave({ text, backgroundColor: bgColor, textColor });
    setText("");
    setBgColor(initialColor);
    setTextColor("#ffffff");
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(textHistory[newIndex]);
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);

    // Add to history if it's a significant change
    if (newText !== textHistory[historyIndex]) {
      const newHistory = textHistory.slice(0, historyIndex + 1);
      newHistory.push(newText);
      setTextHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const applyColor = (colorName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    if (selectedText.length === 0) return; // No text selected

    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);
    const coloredText = `{${colorName}}${selectedText}{/${colorName}}`;

    const newText = beforeText + coloredText + afterText;
    handleTextChange(newText);

    // Restore cursor position after the colored text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + coloredText.length,
        start + coloredText.length
      );
    }, 0);
  };

  const applyTextColor = (hexColor: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    if (selectedText.length === 0) return;

    // Convert hex to color name if it matches a known color, otherwise use hex
    let colorName = Object.entries(colorMap).find(
      ([_, hex]) => hex === hexColor
    )?.[0];
    if (!colorName) {
      // For custom colors, we could store them differently, but for now just use hex
      colorName = hexColor.replace("#", "");
    }

    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);
    const coloredText = `{${colorName}}${selectedText}{/${colorName}}`;

    const newText = beforeText + coloredText + afterText;
    handleTextChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + coloredText.length,
        start + coloredText.length
      );
    }, 0);

    setShowColorPicker(false);
  };

  const colorMap: Record<string, string> = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#10b981",
    yellow: "#f59e0b",
    purple: "#8b5cf6",
    orange: "#f97316",
    pink: "#ec4899",
    cyan: "#06b6d4",
  };

  const renderParsedText = (input: string) => {
    // Simple parser for {color}...{/color} tags — non-nested
    const parts: Array<{ text: string; color?: string }> = [];
    const tagRegex = /\{(\/)?([a-zA-Z]+)\}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const stack: string[] = [];

    while ((match = tagRegex.exec(input)) !== null) {
      const [full, closing, colorName] = match;
      const idx = match.index;

      if (idx > lastIndex) {
        parts.push({
          text: input.slice(lastIndex, idx),
          color: stack[stack.length - 1],
        });
      }

      if (closing) {
        // pop
        if (stack.length && stack[stack.length - 1] === colorName) {
          stack.pop();
        }
      } else {
        // open
        stack.push(colorName);
      }

      lastIndex = idx + full.length;
    }

    if (lastIndex < input.length) {
      parts.push({
        text: input.slice(lastIndex),
        color: stack[stack.length - 1],
      });
    }

    return parts.map((p, i) => {
      const hex =
        p.color && colorMap[p.color.toLowerCase()]
          ? colorMap[p.color.toLowerCase()]
          : undefined;
      return (
        <span
          key={i}
          style={{ color: hex || "inherit", fontFamily: "cursive" }}
        >
          {p.text}
        </span>
      );
    });
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
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={3}
              placeholder="Type message..."
              spellCheck={false}
              className="w-full px-2 py-1.5 rounded border-none text-xs resize-y no-scrollbar outline-none transition-all"
              style={{
                backgroundColor: "var(--select-border)",
                color: "var(--text-primary)",
                // border: "1px solid var(--select-border)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--focus-border)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--select-border)";
              }}
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 flex gap-2 items-center">
              <label
                className="text-xs font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Text
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-1/2 h-10 rounded cursor-pointer"
                style={{
                  border: "1px solid var(--select-border)",
                  backgroundColor: "var(--select-bg)",
                }}
                aria-label="Text color"
              />
            </div>
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
              <div
                className="text-xs text-center whitespace-pre-wrap"
                style={{ color: textColor }}
              >
                {text ? (
                  renderParsedText(text)
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
                !text || text.trim().length === 0
                  ? "Enter text"
                  : "Save and publish"
              }
            >
              <button
                onClick={handleSave}
                disabled={!text || text.trim().length === 0}
                className="px-3 py-1.5 text-xs font-semibold text-white rounded transition-all disabled:opacity-50"
                style={{
                  background:
                    !text || text.trim().length === 0
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
