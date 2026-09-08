import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Megaphone,
  Loader2,
  Undo2,
  ChevronDown,
  Check,
  Tv,
  Type,
  Layers2,
} from "lucide-react";
import { Tooltip } from "antd";
import { useTheme } from "@/Provider/Theme";
import { useAppSelector } from "@/store";
import { ALERT_TEMPLATES, AlertTemplateId } from "@/Bible/components/AlertTemplates/alertTemplateTypes";
import { ensureHighContrast } from "@/Bible/components/AlertTemplates/alertParser";

/** Official Lucide-style PencilSparkles Icon */
export const PencilSparkles: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = "w-3.5 h-3.5",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m14 7 3 3" />
    <path d="M17.5 3.5 19 2l3 3-1.5 1.5" />
    <path d="M16 5 4.5 16.5a2 2 0 0 0-.5.83l-.8 2.8a.5.5 0 0 0 .62.62l2.8-.8a2 2 0 0 0 .83-.5L19 8" />
    <path d="M20 18v3" />
    <path d="M18.5 19.5h3" />
    <path d="M4 4v3" />
    <path d="M2.5 5.5h3" />
  </svg>
);

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
    templateId?: string;
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
      if (range.end <= changeStart) return range;
      if (range.start >= oldChangeEnd) {
        return {
          ...range,
          start: range.start + delta,
          end: range.end + delta,
        };
      }
      if (range.start <= changeStart && range.end >= oldChangeEnd) {
        const newEnd = range.end + delta;
        return newEnd > range.start ? { ...range, end: newEnd } : null;
      }
      if (range.start >= changeStart && range.start < oldChangeEnd && range.end >= oldChangeEnd) {
        const newStart = Math.min(newChangeEnd, range.end + delta);
        const newEnd = range.end + delta;
        return newEnd > newStart ? { ...range, start: newStart, end: newEnd } : null;
      }
      if (range.start <= changeStart && range.end > changeStart && range.end <= oldChangeEnd) {
        const newEnd = changeStart;
        return newEnd > range.start ? { ...range, end: newEnd } : null;
      }
      if (range.start >= changeStart && range.end <= oldChangeEnd) {
        return newChangeEnd > changeStart
          ? { ...range, start: changeStart, end: newChangeEnd }
          : null;
      }
      return null;
    })
    .filter((range): range is ColorRange => !!range)
    .filter((range) => range.start >= 0 && range.end <= newText.length && range.end > range.start);
};

// Helper to check if a background color is dark
const isDarkColor = (hex: string) => {
  if (!hex) return true;
  let cleanHex = hex;
  if (!cleanHex.startsWith("#")) {
    if (colorMap[cleanHex.toLowerCase()]) {
      cleanHex = colorMap[cleanHex.toLowerCase()];
    } else {
      return true;
    }
  }
  if (cleanHex.length < 7) return true;
  const r = parseInt(cleanHex.slice(1, 3), 16) || 0;
  const g = parseInt(cleanHex.slice(3, 5), 16) || 0;
  const b = parseInt(cleanHex.slice(5, 7), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
};

// Parse colored text for rendering in preview
const parseColoredText = (
  text: string,
  isDarkBg: boolean = true,
  currentBgColor?: string,
): (string | JSX.Element)[] => {
  const regex = /\{([a-zA-Z0-9]+)\}([^{]*)\{\/\1\}/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  const defaultColor = isDarkBg ? "#ffffff" : "#18181b";

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      parts.push(
        <span key={key++} style={{ color: defaultColor }}>
          {plainText}
        </span>,
      );
    }

    const color = match[1];
    const coloredText = match[2];
    let rawColorValue: string;
    if (colorMap[color]) {
      rawColorValue = colorMap[color];
    } else if (/^[a-f0-9]{6}$/i.test(color)) {
      rawColorValue = `#${color}`;
    } else {
      rawColorValue = colorMap.red;
    }

    const finalColor = currentBgColor
      ? ensureHighContrast(rawColorValue, currentBgColor)
      : rawColorValue;

    parts.push(
      <span key={key++} style={{ color: finalColor }}>
        {coloredText}
      </span>,
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    parts.push(
      <span key={key++} style={{ color: defaultColor }}>
        {remainingText}
      </span>,
    );
  }

  return parts;
};

const SYMBOL_LIST = [
  "▲", "▼", "◄", "►", "●", "○", "•", "◆", "◇", "■", "□", "▪", "▫",
  "│", "║", "┃", "─", "═", "━", "▬", "┌", "┐", "└", "┘", "╔", "╗", "╚", "╝",
  "⬆", "⬇", "⬅", "➡", "★", "✝", "✦", "⚡", "🔔",
];

const PRESET_BG_COLORS = [
  "#ffffff", "#000000", "#18181b", "#1e293b", "#0f172a", "#7f1d1d", "#831843",
  "#14532d", "#1e3a8a", "#581c87", "#78350f", "#3b82f6", "#10b981",
];

export const AlertModal: React.FC<AlertModalProps & { initialThemeName?: string }> = ({
  visible,
  onCancel,
  onSave,
  initialText = "",
  initialColor = "#ffffff",
  initialThemeName,
  editingAlertId = null,
}) => {
  const { isDarkMode } = useTheme();
  // Read default template from Redux store
  const defaultTemplateId = useAppSelector(
    (s) => (s.bible.alertTemplateId as AlertTemplateId) || "marquee-classic",
  );
  const parsedInitialText = parseAlertMarkup(initialText);
  const [displayText, setDisplayText] = useState(parsedInitialText.plainText);
  const [colorRanges, setColorRanges] = useState<ColorRange[]>(
    parsedInitialText.ranges,
  );
  const [bgColor, setBgColor] = useState(initialColor || "#ffffff");
  const [alertTitle, setAlertTitle] = useState(
    editingAlertId ? "Edit Marquee Alert" : "Create Broadcast Alert",
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textHistory, setTextHistory] = useState<TextSnapshot[]>([
    { text: parsedInitialText.plainText, ranges: parsedInitialText.ranges },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Popover open states
  const [textColorPopoverOpen, setTextColorPopoverOpen] = useState(false);
  const [bgColorPopoverOpen, setBgColorPopoverOpen] = useState(false);
  const [symbolsPopoverOpen, setSymbolsPopoverOpen] = useState(false);
  const [targetScreen, setTargetScreen] = useState("Live Screen (Marquee)");

  // AI Styling State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiThemeName, setAiThemeName] = useState<string | null>(initialThemeName || null);
  // Template selector — defaults to the global Redux preference
  const [selectedTemplateId, setSelectedTemplateId] = useState<AlertTemplateId>(defaultTemplateId);

  const internalText = buildAlertMarkup(displayText, colorRanges);

  useEffect(() => {
    if (visible) {
      const parsedText = parseAlertMarkup(initialText || "");
      const bgColorToSet = initialColor || "#ffffff";

      setDisplayText(parsedText.plainText);
      setColorRanges(parsedText.ranges);
      setBgColor(bgColorToSet);
      setAlertTitle(editingAlertId ? "Edit Marquee Alert" : "Create Broadcast Alert");
      setTextHistory([
        { text: parsedText.plainText, ranges: parsedText.ranges },
      ]);
      setHistoryIndex(0);
      setAiError(null);
      setIsGeneratingAi(false);
      setAiThemeName(initialThemeName || null);
      // Reset template to current global default when modal opens
      setSelectedTemplateId(defaultTemplateId);
      document.body.style.overflow = "hidden";
    } else {
      setIsGeneratingAi(false);
      document.body.style.overflow = "";
    }

    return () => {
      setIsGeneratingAi(false);
      document.body.style.overflow = "";
    };
  }, [visible, initialText, initialColor, initialThemeName, editingAlertId, defaultTemplateId]);

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
        // Auto-apply AI-suggested template if returned
        if (res.data.templateId) {
          setSelectedTemplateId(res.data.templateId as AlertTemplateId);
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
    onSave({
      text: buildAlertMarkup(displayText, colorRanges).trim(),
      backgroundColor: bgColor,
      themeName: aiThemeName || undefined,
      templateId: selectedTemplateId,
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

    if (selectedText.length === 0) {
      // If nothing selected, set all text to this color
      if (displayText.length > 0) {
        const nextRanges = [{ start: 0, end: displayText.length, color: hexColor }];
        setColorRanges(nextRanges);
        pushHistory(displayText, nextRanges);
      }
      return;
    }

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
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      />

      {/* Landscape Modal Card */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-[540px] max-w-[94vw] rounded-2xl overflow-hidden shadow-2xl select-none ${
          isDarkMode
            ? "bg-zinc-900 text-zinc-100 ring-1 ring-white/10"
            : "bg-white text-zinc-900 ring-1 ring-black/10"
        }`}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: "spring", damping: 30, stiffness: 420 }}
      >
        <div className="p-4 sm:p-4.5 flex flex-col gap-2.5">

          {/* ── Title row ── */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              placeholder="Alert headline or title..."
              className={`flex-1 min-w-0 bg-transparent outline-none font-sans text-[0.95rem] font-bold p-0 leading-tight tracking-tight ${
                isDarkMode
                  ? "text-zinc-100 placeholder:text-zinc-500"
                  : "text-zinc-900 placeholder:text-zinc-400"
              }`}
            />
            <Tooltip title="Close (Esc)" placement="top">
              <button
                onClick={onCancel}
                className={`w-6 h-6 rounded-md flex items-center justify-center bg-transparent transition-colors cursor-pointer flex-shrink-0 ${
                  isDarkMode
                    ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                }`}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </Tooltip>
          </div>

          {/* ── AI Error (if any) ── */}
          {aiError && (
            <div className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[0.68rem] flex items-center justify-between">
              <span>{aiError}</span>
              <button type="button" onClick={() => setAiError(null)} className="font-bold ml-2 cursor-pointer text-xs">✕</button>
            </div>
          )}

          {/* ── Message textarea (with background shade) ── */}
          <textarea
            ref={textareaRef}
            value={displayText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={2}
            placeholder="Type your alert message or sermon announcement here..."
            spellCheck={false}
            autoFocus
            className={`w-full outline-none font-sans text-[0.82rem] font-normal leading-snug resize-none p-2.5 rounded-xl transition-colors no-scrollbar min-h-[48px] tracking-normal ${
              isDarkMode
                ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
            }`}
          />

          {/* ── Live marquee preview strip (animates in/out when text is present) ── */}
          <AnimatePresence>
            {!isEmpty && (
              <motion.div
                key="preview-section"
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="max-w-[450px] pb-0.5">
                  <div
                    className={`p-1 rounded-2xl ${
                      isDarkMode ? "bg-zinc-800/70" : "bg-zinc-100"
                    }`}
                  >
                    <div
                      style={{ backgroundColor: bgColor }}
                      className="rounded-xl px-3 py-1.5 min-h-[1.85rem] flex items-center justify-between gap-2 transition-colors duration-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className="text-[0.74rem] truncate font-medium tracking-wide">
                          {parseColoredText(internalText, isDarkColor(bgColor), bgColor)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Horizontal Pill Chips Row ── */}
          <div className="flex items-center gap-1.5 flex-wrap">

            {/* Chip 1: Text colour native picker */}
            <Tooltip title="Text colour (highlight text to style)" placement="top">
              <label
                className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                <Type className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`} />
                <span>Text</span>
                <input
                  type="color"
                  defaultValue="#ffffff"
                  onChange={(e) => applyColorToSelection(e.target.value)}
                  className="sr-only"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-black/20 dark:ring-white/30" />
              </label>
            </Tooltip>

            {/* Chip 2: Background colour native picker */}
            <Tooltip title="Background colour for the marquee" placement="top">
              <label
                className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                <Layers2 className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`} />
                <span>Background</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="sr-only"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-black/20 dark:ring-white/30"
                  style={{ backgroundColor: bgColor }}
                />
              </label>
            </Tooltip>

            {/* Preset background swatches inside rounded pill */}
            <div
              className={`h-6 px-2 rounded-full flex items-center gap-1 shrink-0 shadow-2xs ${
                isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
              }`}
            >
              {PRESET_BG_COLORS.map((hex) => {
                const isSelected = bgColor.toLowerCase() === hex.toLowerCase();
                const isWhiteSwatch = hex.toLowerCase() === "#ffffff";
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setBgColor(hex)}
                    className={`w-3.5 h-3.5 rounded-full shrink-0 cursor-pointer transition-all relative ${
                      isWhiteSwatch
                        ? isDarkMode
                          ? "ring-1 ring-white/20"
                          : "ring-1 ring-black/15"
                        : ""
                    } ${
                      isSelected
                        ? "scale-110 z-10 ring-2 ring-blue-500"
                        : "hover:scale-125 active:scale-95 opacity-90 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  >
                  </button>
                );
              })}
            </div>

            <div className={`w-px h-3 shrink-0 ${isDarkMode ? "bg-zinc-700" : "bg-zinc-200"}`} />

            {/* AI Auto-Style chip */}
            <Tooltip
              title={isEmpty ? "Type a message first" : "Auto-format with AI"}
              placement="top"
            >
              <button
                type="button"
                onClick={handleAiStyle}
                disabled={isEmpty || isGeneratingAi}
                className={`h-6 px-2.5 rounded-lg text-[0.7rem] font-bold flex items-center gap-1 transition-all shrink-0 ${
                  isGeneratingAi
                    ? "bg-lime-400 text-lime-950 animate-pulse cursor-wait"
                    : isEmpty
                      ? isDarkMode
                        ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      : "bg-lime-400 hover:bg-lime-300 text-lime-950 cursor-pointer shadow-xs active:scale-95"
                }`}
              >
                {isGeneratingAi ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <PencilSparkles className="w-3 h-3" />
                )}
                <span>AI Style</span>
              </button>
            </Tooltip>

            {/* Undo */}
            {historyIndex > 0 && (
              <Tooltip title="Undo (Ctrl+Z)" placement="top">
                <button
                  type="button"
                  onClick={handleUndo}
                  className={`h-6 px-2 rounded-lg text-[0.7rem] flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              </Tooltip>
            )}
          </div>

          {/* ── Symbols single horizontal scrolling row ── */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[0.58rem] font-semibold uppercase tracking-wider shrink-0 ${
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Symbols
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
              {SYMBOL_LIST.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => insertEmoji(symbol)}
                  className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[0.74rem] font-mono active:scale-90 transition-all cursor-pointer shadow-2xs ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* ── Template Selector Row ── */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[0.58rem] font-semibold uppercase tracking-wider shrink-0 ${
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Template
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
              {ALERT_TEMPLATES.map((tmpl) => {
                const isActive = selectedTemplateId === tmpl.id;
                return (
                  <Tooltip key={tmpl.id} title={tmpl.description} placement="top">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id as AlertTemplateId)}
                      className={`h-6 px-2.5 rounded-lg text-[0.62rem] font-semibold shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1 ${
                        isActive
                          ? "text-white"
                          : isDarkMode
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                      }`}
                      style={isActive ? { backgroundColor: tmpl.accentColor } : {}}
                    >
                      {isActive && (
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className="shrink-0">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {tmpl.label}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* ── Footer: screen selector + action buttons ── */}
          <div className="flex items-center justify-between pt-1">
            {/* Left: target screen toggle */}
            <button
              type="button"
              onClick={() =>
                setTargetScreen((prev) =>
                  prev.includes("Marquee") ? "Full Overlay" : "Live Screen (Marquee)",
                )
              }
              className={`h-7 px-2.5 rounded-lg text-[0.72rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                isDarkMode
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              <Tv className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`} />
              <span>{targetScreen}</span>
              <ChevronDown
                className={`w-3 h-3 opacity-60 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
              />
            </button>

            {/* Right: cancel + save */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onCancel}
                className={`h-7 px-3 rounded-lg text-[0.72rem] font-medium cursor-pointer transition-colors shadow-2xs ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Cancel
              </button>

              <Tooltip title={isEmpty ? "Type a message first" : "Save to alert list"} placement="top">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isEmpty}
                  className={`h-7 px-3.5 rounded-lg text-[0.72rem] font-bold flex items-center gap-1.5 transition-all ${
                    isEmpty
                      ? isDarkMode
                        ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      : "bg-lime-400 hover:bg-lime-300 text-lime-950 cursor-pointer shadow-xs active:scale-95"
                  }`}
                >
                  <Megaphone className="w-3 h-3" />
                  <span>{editingAlertId ? "Update Alert" : "Save Alert"}</span>
                </button>
              </Tooltip>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};

