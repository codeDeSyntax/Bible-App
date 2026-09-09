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
  Smile,
  ScrollText,
  ChevronsRight,
  BookOpen,
  LayoutTemplate,
  Pill,
  Radio,
} from "lucide-react";
import { Tooltip, Popover } from "antd";
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
  initialTemplateId?: string;
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
  lime: "#bef264",
  lemon: "#bef264",
  lemongreen: "#bef264",
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

  const isBlackBg =
    currentBgColor?.toLowerCase() === "#000000" ||
    currentBgColor?.toLowerCase() === "#000" ||
    currentBgColor?.toLowerCase() === "black";

  const isWhiteBg =
    currentBgColor?.toLowerCase() === "#ffffff" ||
    currentBgColor?.toLowerCase() === "#fff" ||
    currentBgColor?.toLowerCase() === "white";

  const defaultColor = isBlackBg
    ? "#bef264"
    : isWhiteBg
    ? "#000000"
    : isDarkBg
    ? "#ffffff"
    : "#18181b";

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

const TEMPLATE_ICON_MAP: Record<
  AlertTemplateId,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  "marquee-classic": ScrollText,
  "chevron-lower-third": ChevronsRight,
  "scripture-badge": BookOpen,
  "headline-card": LayoutTemplate,
  "topic-pill": Pill,
  "broadcast-ticker": Radio,
};

export const AlertModal: React.FC<AlertModalProps & { initialThemeName?: string }> = ({
  visible,
  onCancel,
  onSave,
  initialText = "",
  initialColor,
  initialThemeName,
  initialTemplateId,
  editingAlertId = null,
}) => {
  const { isDarkMode } = useTheme();
  const themeDefaultBg = isDarkMode ? "#000000" : "#ffffff";
  const themeDefaultTextColor = isDarkMode ? "#bef264" : "#000000";

  // Read default template from Redux store
  const defaultTemplateId = useAppSelector(
    (s) => (s.bible.alertTemplateId as AlertTemplateId) || "marquee-classic",
  );
  const parsedInitialText = parseAlertMarkup(initialText);
  const [displayText, setDisplayText] = useState(parsedInitialText.plainText);
  const [colorRanges, setColorRanges] = useState<ColorRange[]>(
    parsedInitialText.ranges,
  );
  const [bgColor, setBgColor] = useState(() =>
    editingAlertId ? initialColor || themeDefaultBg : initialColor || themeDefaultBg,
  );
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

  // AI Styling State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiThemeName, setAiThemeName] = useState<string | null>(initialThemeName || null);
  // Template selector — defaults to initialTemplateId when editing, or global Redux preference
  const [selectedTemplateId, setSelectedTemplateId] = useState<AlertTemplateId>(
    (initialTemplateId as AlertTemplateId) || defaultTemplateId,
  );

  const internalText = buildAlertMarkup(displayText, colorRanges);

  useEffect(() => {
    if (visible) {
      const parsedText = parseAlertMarkup(initialText || "");
      const bgColorToSet = editingAlertId
        ? initialColor || themeDefaultBg
        : initialColor || themeDefaultBg;
      const templateToSet = (initialTemplateId as AlertTemplateId) || defaultTemplateId;

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
      // Restore alert's template when editing, or use global default for new alert
      setSelectedTemplateId(templateToSet);
      document.body.style.overflow = "hidden";
    } else {
      setIsGeneratingAi(false);
      document.body.style.overflow = "";
    }

    return () => {
      setIsGeneratingAi(false);
      document.body.style.overflow = "";
    };
  }, [visible, initialText, initialColor, initialThemeName, initialTemplateId, editingAlertId, defaultTemplateId]);

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
    setBgColor(initialColor || themeDefaultBg);
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
        className={`relative z-10 w-[580px] max-w-[95vw] rounded-2xl overflow-hidden shadow-2xl select-none ${
          isDarkMode
            ? "bg-zinc-900 text-zinc-100 ring-1 ring-white/10"
            : "bg-white text-zinc-900 ring-1 ring-black/10"
        }`}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: "spring", damping: 30, stiffness: 420 }}
      >
        <div className="p-4.5 sm:p-5 flex flex-col gap-3">

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
                  key={themeDefaultTextColor}
                  type="color"
                  defaultValue={themeDefaultTextColor}
                  onChange={(e) => applyColorToSelection(e.target.value)}
                  className="sr-only"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-black/20 dark:ring-white/30"
                  style={{ backgroundColor: themeDefaultTextColor }}
                />
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

            {/* Symbols Popover Menu Chip */}
            <Popover
              open={symbolsPopoverOpen}
              onOpenChange={setSymbolsPopoverOpen}
              trigger="click"
              placement="bottom"
              arrow={false}
              styles={{
                container: {
                  backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                  borderRadius: "12px",
                  padding: "8px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
                  border: isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)",
                },
              }}
              content={
                <div className="flex flex-col gap-1.5 w-[220px]">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800 px-1">
                    <span className="text-[0.66rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Insert Symbol
                    </span>
                    <button
                      type="button"
                      onClick={() => setSymbolsPopoverOpen(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1 max-h-[160px] overflow-y-auto no-scrollbar p-0.5">
                    {SYMBOL_LIST.map((symbol) => (
                      <button
                        key={symbol}
                        type="button"
                        onClick={() => {
                          insertEmoji(symbol);
                          setSymbolsPopoverOpen(false);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[0.85rem] font-mono active:scale-90 transition-all cursor-pointer ${
                          isDarkMode
                            ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                        }`}
                        title={symbol}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              }
            >
              <button
                type="button"
                className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
                  symbolsPopoverOpen
                    ? isDarkMode
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-200 text-zinc-900"
                    : isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                <Smile className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`} />
                <span>Symbols</span>
              </button>
            </Popover>

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

          {/* ── Two-Column Bottom Section (75% Templates Tag-Wrapping, 25% Action Buttons) ── */}
          <div className="flex items-stretch gap-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
            {/* Left Column (75%): Tag Wrapping Templates */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
              <span
                className={`text-[0.62rem] font-bold uppercase tracking-wider ${
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Template Style
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {ALERT_TEMPLATES.map((tmpl) => {
                  const isActive = selectedTemplateId === tmpl.id;
                  const Icon = TEMPLATE_ICON_MAP[tmpl.id as AlertTemplateId] || ScrollText;
                  const baseBg = isDarkMode ? "#27272a" : "#f4f4f5";

                  // ~20% gradient from the beginning showing its color theme, then fading into its current button color
                  const gradientStyle: React.CSSProperties = isActive
                    ? {
                        background: isDarkMode
                          ? `linear-gradient(90deg, ${tmpl.accentColor} 0%, ${tmpl.accentColor} 20%, color-mix(in srgb, ${tmpl.accentColor} 35%, #27272a) 45%, #27272a 100%)`
                          : `linear-gradient(90deg, ${tmpl.accentColor} 0%, ${tmpl.accentColor} 20%, color-mix(in srgb, ${tmpl.accentColor} 25%, #f4f4f5) 45%, #f4f4f5 100%)`,
                        boxShadow: `0 0 0 1.5px ${tmpl.accentColor}`,
                      }
                    : {
                        background: `linear-gradient(90deg, color-mix(in srgb, ${tmpl.accentColor} 75%, transparent) 0%, color-mix(in srgb, ${tmpl.accentColor} 55%, transparent) 18%, color-mix(in srgb, ${tmpl.accentColor} 15%, ${baseBg}) 30%, ${baseBg} 45%, ${baseBg} 100%)`,
                      };

                  return (
                    <Tooltip key={tmpl.id} title={`${tmpl.label} — ${tmpl.description}`} placement="top">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(tmpl.id as AlertTemplateId)}
                        className={`h-7 px-2 rounded-lg text-[0.68rem] shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 border ${
                          isActive
                            ? "font-bold text-zinc-100 dark:text-zinc-100 border-transparent"
                            : isDarkMode
                            ? "font-medium text-zinc-300 hover:text-zinc-100 border-zinc-700/50 hover:border-zinc-600"
                            : "font-medium text-zinc-700 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300"
                        }`}
                        style={gradientStyle}
                      >
                        {/* Monochrome icon with shades of the color */}
                        <div
                          className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            backgroundColor: isActive
                              ? "rgba(255, 255, 255, 0.22)"
                              : `color-mix(in srgb, ${tmpl.accentColor} 25%, ${isDarkMode ? "#18181b" : "#ffffff"})`,
                          }}
                        >
                          <Icon
                            className="w-2.5 h-2.5 shrink-0"
                            style={{
                              color: isActive ? "#ffffff" : tmpl.accentColor,
                            }}
                          />
                        </div>
                        <span className="pr-1">{tmpl.label}</span>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Right Column (25%): Normal, Spacious Action Buttons */}
            <div className="w-[25%] min-w-[130px] shrink-0 flex flex-col justify-center gap-2 pl-3 border-l border-zinc-200/60 dark:border-zinc-800/60">
              <Tooltip title={isEmpty ? "Type a message first" : "Save to alert list"} placement="top">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isEmpty}
                  className={`w-full h-9 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isEmpty
                      ? "opacity-40 cursor-not-allowed bg-select-bg text-text-secondary"
                      : "cursor-pointer bg-gradient-to-r from-btn-active-from to-btn-active-to hover:opacity-90 text-white active:scale-98"
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0" />
                  <span>{editingAlertId ? "Update Alert" : "Save Alert"}</span>
                </button>
              </Tooltip>

              <button
                type="button"
                onClick={onCancel}
                className="w-full h-8 px-3 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-studio-bg dark:hover:bg-select-hover text-text-primary transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
              >
                Cancel
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};

