import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

interface AlertModalProps {
  visible: boolean;
  initialText?: string;
  initialColor?: string;
  onCancel: () => void;
  onSave: (payload: { text: string; backgroundColor?: string }) => void;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textHistory, setTextHistory] = useState<string[]>([initialText]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setBgColor(initialColor);
      setTextHistory([initialText]);
      setHistoryIndex(0);
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
    onSave({ text, backgroundColor: bgColor });
    setText("");
    setBgColor(initialColor);
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
        <span key={i} style={{ color: hex || "var(--text-primary)" }}>
          {p.text}
        </span>
      );
    });
  };

  if (!visible) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-[520px] max-w-[95%] rounded-lg shadow-xl"
      >
        <div className="p-4 rounded-lg bg-studio-bg border border-select-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Create Marquee Alert
            </h3>
            <button
              onClick={onCancel}
              className="text-text-secondary hover:bg-white/5 rounded px-2 py-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-text-secondary">Alert Text</label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={4}
              placeholder="Enter the marquee text to display"
              className="w-full p-2 rounded-xl bg-card-bg text-text-primary border-none outline-none resize-none"
            />

            {/* Color Picker */}
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Text Colors</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "red", color: "#ef4444" },
                  { name: "blue", color: "#3b82f6" },
                  { name: "green", color: "#10b981" },
                  { name: "yellow", color: "#f59e0b" },
                  { name: "purple", color: "#8b5cf6" },
                  { name: "orange", color: "#f97316" },
                  { name: "pink", color: "#ec4899" },
                  { name: "cyan", color: "#06b6d4" },
                ].map(({ name, color }) => (
                  <button
                    key={name}
                    onClick={() => applyColor(name)}
                    className="w-8 h-8 rounded-full  border-2 border-card-bg-alt hover:border-select-border transition-colors"
                    style={{ backgroundColor: color }}
                    title={`Apply ${name} color`}
                    type="button"
                  />
                ))}
              </div>
              <div className="text-xs text-text-secondary">
                Select text in the box above, then click a color to apply it
                <br />
                <strong>Undo:</strong> Press Ctrl+Z to undo your last change
              </div>
            </div>

            {/* Live rendered preview of the resulting alert text */}
            <motion.div
              className="mt-3"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-sm text-text-secondary mb-1">Preview</div>
              <div
                className="p-3 rounded-lg max-h-40 overflow-auto"
                style={{ backgroundColor: bgColor }}
                aria-live="polite"
              >
                <div className="text-lg font-semibold whitespace-pre-wrap">
                  {renderParsedText(text)}
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm text-text-secondary block mb-1">
                  Background
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-8 p-0 border-0 rounded"
                  aria-label="Background color"
                />
              </div>
              <div className="text-xs text-text-secondary">
                Pick a background color for the alert pill
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <div
                onClick={onCancel}
                className="px-3 py-1.5 rounded text-xs font-medium bg-select-bg text-text-primary cursor-pointer"
              >
                Cancel
              </div>

              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded text-xs font-medium text-white"
                style={{
                  background:
                    "linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))",
                }}
              >
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
