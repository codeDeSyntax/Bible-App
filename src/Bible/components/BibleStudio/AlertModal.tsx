import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

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
  initialColor = "#111827",
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
    onSave({ text: text.trim(), backgroundColor: bgColor });
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
              className="w-full p-2 rounded bg-card-bg-alt text-text-primary border border- resize-none"
            />

            <div className="text-xs text-text-secondary">
              <strong>Text Colors:</strong> Select text above, then click a
              color button to apply coloring.
              <br />
              Available colors: red, blue, green, yellow, purple, orange, pink,
              cyan
            </div>

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
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
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
