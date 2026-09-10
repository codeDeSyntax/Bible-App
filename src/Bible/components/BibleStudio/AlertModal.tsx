import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Megaphone,
  Loader2,
  Undo2,
  Type,
  Layers2,
  Smile,
  ScrollText,
  ChevronsRight,
  BookOpen,
  LayoutTemplate,
  Pill,
  Radio,
  Sparkles,
  ChevronDown,
  Check,
  FlaskConical,
} from "lucide-react";
import { Tooltip, Popover } from "antd";
import { useTheme } from "@/Provider/Theme";
import { useAppSelector } from "@/store";
import {
  ALERT_TEMPLATES,
  ALERT_TYPES,
  AlertTemplateId,
  AlertType,
  AlertStructuredData,
} from "@/Bible/components/AlertTemplates/alertTemplateTypes";
import {
  ensureHighContrast,
  composeAlertMarkup,
  decomposeAlertMarkup,
  parseColoredText,
  stripMarkup,
} from "@/Bible/components/AlertTemplates/alertParser";

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

/** Custom Church Cross Icon */
const CrossIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = "w-3 h-3",
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 2v20M5 8h14" />
  </svg>
);

interface AlertModalProps {
  visible: boolean;
  initialText?: string;
  initialColor?: string;
  initialTemplateId?: string;
  initialAlertType?: AlertType | string;
  initialStructuredData?: AlertStructuredData;
  editingAlertId?: string | null;
  onCancel: () => void;
  onSave: (payload: {
    text: string;
    backgroundColor?: string;
    themeName?: string;
    templateId?: string;
    isAiGenerated?: boolean;
    id?: string;
    alertType?: AlertType;
    structuredData?: AlertStructuredData;
  }) => void;
}

// Color mapping
const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#38bdf8",
  green: "#22c55e",
  yellow: "#facc15",
  gold: "#fbbf24",
  amber: "#f59e0b",
  purple: "#c084fc",
  violet: "#a78bfa",
  indigo: "#818cf8",
  orange: "#fb923c",
  pink: "#f472b6",
  rose: "#fb7185",
  cyan: "#22d3ee",
  teal: "#2dd4bf",
  white: "#ffffff",
  black: "#000000",
  lime: "#bef264",
  lemon: "#bef264",
  lemongreen: "#bef264",
  emerald: "#10b981",
};

type ColorRange = {
  start: number;
  end: number;
  color: string;
};

type TextSnapshot = {
  text: string;
  ranges: ColorRange[];
  structuredData: AlertStructuredData;
  alertType: AlertType;
};

const colorTokenFromHex = (hexColor: string) => {
  const namedColor = Object.entries(colorMap).find(
    ([, hex]) => hex.toLowerCase() === hexColor.toLowerCase(),
  )?.[0];

  return namedColor || hexColor.replace("#", "");
};

const cleanStructuredData = (struct?: AlertStructuredData | null): AlertStructuredData => {
  if (!struct) return {};
  const res: AlertStructuredData = {};
  for (const [k, v] of Object.entries(struct)) {
    if (typeof v === "string") {
      res[k as keyof AlertStructuredData] = stripMarkup(v);
    } else {
      (res as any)[k] = v;
    }
  }
  return res;
};

const parseAlertMarkup = (text: string) => {
  const regex = /\{([a-zA-Z0-9#]+)\}([^{]*?)\{\/\1\}/gi;
  const ranges: ColorRange[] = [];
  let plainText = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const rawBefore = text.slice(lastIndex, match.index).replace(/\{[^\}]+\}/g, "");
    plainText += rawBefore;

    const color = match[1].toLowerCase();
    const coloredText = match[2].replace(/\{[^\}]+\}/g, "");
    const start = plainText.length;

    plainText += coloredText;
    const cleanColor = color.replace(/^#/, "");
    ranges.push({
      start,
      end: plainText.length,
      color:
        colorMap[cleanColor] ||
        (/^[a-f0-9]{3,8}$/i.test(cleanColor) ? `#${cleanColor}` : colorMap.white),
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

const TYPE_ICON_MAP: Record<
  AlertType,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  sermon: CrossIcon,
  news: Megaphone,
  scripture: BookOpen,
  general: Radio,
};

const SAMPLE_TEST_DATA: Record<AlertType, AlertStructuredData[]> = {
  sermon: [
    {
      title: "Walking in Divine Dominion",
      scriptures: "Romans 8:28, Ephesians 1:3",
      speaker: "Pastor David",
      notes: "Faith over fear, Standing firm in God's promises",
    },
    {
      title: "The Power of Answered Prayer",
      scriptures: "James 5:16, Philippians 4:6-7",
      speaker: "Rev. Emmanuel",
      notes: "Pray without ceasing, Trust His perfect timing",
    },
    {
      title: "Grace Abounding in Every Season",
      scriptures: "2 Corinthians 12:9, Hebrews 4:16",
      speaker: "Pastor Sarah",
      notes: "His strength made perfect in weakness, Boldness in worship",
    },
  ],
  news: [
    {
      headline: "Night of Supernatural Worship & Praise",
      dateTime: "This Friday @ 6:00 PM",
      venue: "Main Auditorium",
      contact: "055-123-4567 / info@church.org",
      details: "Join us for an unforgettable evening of high praise and encounter with God!",
    },
    {
      headline: "Church Workers & Leaders Conference",
      dateTime: "Saturday @ 8:30 AM",
      venue: "Fellowship Hall",
      contact: "Admin Desk / Ext 104",
      details: "Empowerment & vision casting session for all ministry leads and volunteers.",
    },
    {
      headline: "Annual Youth & Teens Camp 2026",
      dateTime: "July 15-18",
      venue: "Mount Zion Retreat Center",
      contact: "Youth Hotline: 024-987-6543",
      details: "Registration is open! Secure your spot early at the info desk.",
    },
  ],
  scripture: [
    {
      reference: "Psalm 23:1-3, Romans 8:31",
      verseText: "The Lord is my shepherd, I shall not want. He makes me lie down in green pastures.",
      focus: "Divine Providence & Everlasting Peace",
    },
    {
      reference: "Isaiah 40:31",
      verseText: "Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.",
      focus: "Renewed Strength & Patience in Faith",
    },
    {
      reference: "John 14:27",
      verseText: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you.",
      focus: "Unshakable Peace in Christ",
    },
  ],
  general: [
    {
      title: "Welcome to Sunday Celebration Service!",
      message: "We are overjoyed to worship with you. Kindly silence mobile devices during service.",
    },
    {
      title: "Community Outreach & Food Drive",
      message: "Partner with us this week to distribute food supplies to local families in need.",
    },
    {
      title: "Midweek Bible Study & Communion",
      message: "Deepen your understanding of God's Word every Wednesday at 6:30 PM in-person & online.",
    },
  ],
};

export const AlertModal: React.FC<AlertModalProps & { initialThemeName?: string }> = ({
  visible,
  onCancel,
  onSave,
  initialText = "",
  initialColor,
  initialThemeName,
  initialTemplateId,
  initialAlertType,
  initialStructuredData,
  editingAlertId = null,
}) => {
  const { isDarkMode } = useTheme();
  const themeDefaultBg = isDarkMode ? "#000000" : "#ffffff";
  const themeDefaultTextColor = isDarkMode ? "#bef264" : "#000000";

  // Read default template from Redux store
  const defaultTemplateId = useAppSelector(
    (s) => (s.bible.alertTemplateId as AlertTemplateId) || "marquee-classic",
  );

  // Active Alert Category / Type
  const [alertType, setAlertType] = useState<AlertType>(
    (initialAlertType as AlertType) || "sermon",
  );

  // Structured Field Data
  const [structuredData, setStructuredData] = useState<AlertStructuredData>(() =>
    initialStructuredData ||
    decomposeAlertMarkup(initialText, (initialAlertType as AlertType) || "sermon"),
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
    editingAlertId ? "Edit Broadcast Alert" : "Create Broadcast Alert",
  );

  // Active input ref for color/symbol targeting
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const [textHistory, setTextHistory] = useState<TextSnapshot[]>([
    {
      text: parsedInitialText.plainText,
      ranges: parsedInitialText.ranges,
      structuredData:
        initialStructuredData ||
        decomposeAlertMarkup(initialText, (initialAlertType as AlertType) || "sermon"),
      alertType: (initialAlertType as AlertType) || "sermon",
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Popover open states
  const [symbolsPopoverOpen, setSymbolsPopoverOpen] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);

  // AI Styling State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiThemeName, setAiThemeName] = useState<string | null>(initialThemeName || null);

  // Template selector
  const [selectedTemplateId, setSelectedTemplateId] = useState<AlertTemplateId>(
    (initialTemplateId as AlertTemplateId) || defaultTemplateId,
  );

  const internalText = buildAlertMarkup(displayText, colorRanges);

  const pushHistory = useCallback(
    (
      newText: string,
      newRanges: ColorRange[],
      newData: AlertStructuredData,
      newType: AlertType,
    ) => {
      const snapshot: TextSnapshot = {
        text: newText,
        ranges: newRanges,
        structuredData: newData,
        alertType: newType,
      };
      setTextHistory((prev) => [...prev.slice(0, historyIndex + 1), snapshot]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  // Re-initialize state when modal opens
  useEffect(() => {
    if (visible) {
      const parsedText = parseAlertMarkup(initialText || "");
      const bgColorToSet = editingAlertId
        ? initialColor || themeDefaultBg
        : initialColor || themeDefaultBg;
      const templateToSet = (initialTemplateId as AlertTemplateId) || defaultTemplateId;

      // Detect alert type from text or template if editing
      let typeToSet: AlertType = (initialAlertType as AlertType) || "sermon";
      if (!initialAlertType) {
        if (initialTemplateId === "broadcast-ticker") typeToSet = "news";
        else if (initialTemplateId === "scripture-badge") typeToSet = "scripture";
        else if (initialTemplateId === "marquee-classic") typeToSet = "general";
      }

      const rawStruct =
        initialStructuredData || decomposeAlertMarkup(initialText || "", typeToSet);
      const structToSet = cleanStructuredData(rawStruct);

      setAlertType(typeToSet);
      setStructuredData(structToSet);
      setDisplayText(parsedText.plainText);
      setColorRanges(parsedText.ranges);
      setBgColor(bgColorToSet);
      setAlertTitle(editingAlertId ? "Edit Broadcast Alert" : "Create Broadcast Alert");
      setTextHistory([
        {
          text: parsedText.plainText,
          ranges: parsedText.ranges,
          structuredData: structToSet,
          alertType: typeToSet,
        },
      ]);
      setHistoryIndex(0);
      setAiError(null);
      setIsGeneratingAi(false);
      setAiThemeName(initialThemeName || null);
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
  }, [
    visible,
    initialText,
    initialColor,
    initialThemeName,
    initialTemplateId,
    initialAlertType,
    initialStructuredData,
    editingAlertId,
    defaultTemplateId,
  ]);

  // Update structured field and synchronize full displayText
  const handleFieldChange = (field: keyof AlertStructuredData, value: string) => {
    const updated = { ...structuredData, [field]: value };
    setStructuredData(updated);

    const composed = composeAlertMarkup(alertType, updated);
    const nextRanges = updateRangesForTextChange(displayText, composed, colorRanges);

    setDisplayText(composed);
    setColorRanges(nextRanges);
    pushHistory(composed, nextRanges, updated, alertType);
  };

  // Switch alert category tab
  const handleTypeSelect = (type: AlertType) => {
    setAlertType(type);
    const typeInfo = ALERT_TYPES.find((t) => t.id === type);
    if (typeInfo) {
      setSelectedTemplateId(typeInfo.defaultTemplate);
    }

    // Recompose text for newly selected type
    const composed = composeAlertMarkup(type, structuredData);
    const nextRanges = updateRangesForTextChange(displayText, composed, colorRanges);
    setDisplayText(composed);
    setColorRanges(nextRanges);
    pushHistory(composed, nextRanges, structuredData, type);
  };

  // Dev mode: Autofill random sample test data for active alert type
  const handleAutofillTestData = () => {
    const list = SAMPLE_TEST_DATA[alertType] || SAMPLE_TEST_DATA.sermon;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    setStructuredData(randomItem);

    const composed = composeAlertMarkup(alertType, randomItem);
    const nextRanges = updateRangesForTextChange(displayText, composed, colorRanges);
    setDisplayText(composed);
    setColorRanges(nextRanges);
    pushHistory(composed, nextRanges, randomItem, alertType);
  };

  // AI Styling
  const handleAiStyle = async () => {
    if (!displayText || displayText.trim().length === 0) return;
    if (!window.api?.generateStyledAlert) {
      setAiError("AI service not available in this window.");
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await window.api.generateStyledAlert(
        displayText,
        alertType,
        structuredData,
      );
      if (res.success && res.data) {
        const data = res.data;
        let nextBg = bgColor;
        if (data.backgroundColor) {
          nextBg = data.backgroundColor;
          setBgColor(data.backgroundColor);
        }
        if (
          data.templateId &&
          ALERT_TEMPLATES.some((t) => t.id === data.templateId)
        ) {
          setSelectedTemplateId(data.templateId as AlertTemplateId);
        }
        let nextDisplay = displayText;
        let nextRanges = colorRanges;
        if (data.markupText) {
          const parsed = parseAlertMarkup(data.markupText);
          nextDisplay = parsed.plainText;
          nextRanges = parsed.ranges;
          setDisplayText(parsed.plainText);
          setColorRanges(parsed.ranges);
        }
        let nextData = structuredData;
        if (data.structuredData) {
          nextData = {
            ...structuredData,
            ...cleanStructuredData(data.structuredData),
          };
          setStructuredData(nextData);
        }
        if (data.themeName) {
          setAiThemeName(data.themeName);
        }
        pushHistory(nextDisplay, nextRanges, nextData, alertType);
      } else {
        setAiError(res.error || "Failed to generate alert design.");
      }
    } catch (err: any) {
      console.error("AI alert generation failed:", err);
      setAiError(err.message || "Failed to generate alert design.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = () => {
    if (isEmpty) return;
    const cleanData = cleanStructuredData(structuredData);

    onSave({
      text: internalText,
      backgroundColor: bgColor,
      themeName: aiThemeName || undefined,
      templateId: selectedTemplateId,
      isAiGenerated: Boolean(aiThemeName),
      id: editingAlertId || undefined,
      alertType,
      structuredData: cleanData,
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
      setStructuredData(snapshot.structuredData);
      setAlertType(snapshot.alertType);
    }
  };

  const applyColorToSelection = (hexColor: string) => {
    const activeEl = activeInputRef.current;
    if (!activeEl) {
      if (displayText.length > 0) {
        const nextRanges = [{ start: 0, end: displayText.length, color: hexColor }];
        setColorRanges(nextRanges);
        pushHistory(displayText, nextRanges, structuredData, alertType);
      }
      return;
    }

    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const selectedText = activeEl.value.substring(start, end);

    if (selectedText.length === 0) {
      if (displayText.length > 0) {
        const nextRanges = [{ start: 0, end: displayText.length, color: hexColor }];
        setColorRanges(nextRanges);
        pushHistory(displayText, nextRanges, structuredData, alertType);
      }
      return;
    }

    // Find position of selectedText in full displayText
    const globalStart = displayText.indexOf(selectedText);
    if (globalStart !== -1) {
      const globalEnd = globalStart + selectedText.length;
      const nextRanges = [
        ...colorRanges.filter(
          (range) => range.end <= globalStart || range.start >= globalEnd,
        ),
        { start: globalStart, end: globalEnd, color: hexColor },
      ];
      setColorRanges(nextRanges);
      pushHistory(displayText, nextRanges, structuredData, alertType);
    }
  };

  const insertEmoji = (symbol: string) => {
    const activeEl = activeInputRef.current;
    if (!activeEl) {
      const newText = displayText + symbol;
      setDisplayText(newText);
      return;
    }

    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const val = activeEl.value;
    const newVal = val.substring(0, start) + symbol + val.substring(end);

    activeEl.value = newVal;
    const fieldName = activeEl.dataset.field as keyof AlertStructuredData;
    if (fieldName) {
      handleFieldChange(fieldName, newVal);
    }

    setTimeout(() => {
      activeEl.focus();
      activeEl.setSelectionRange(start + symbol.length, start + symbol.length);
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
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      />

      {/* Landscape Modal Card */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-[640px] max-w-[95vw] rounded-2xl overflow-hidden shadow-2xl select-none ${
          isDarkMode
            ? "bg-zinc-900 text-zinc-100 ring-1 ring-white/10"
            : "bg-white text-zinc-900 ring-1 ring-black/10"
        }`}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: "spring", damping: 30, stiffness: 420 }}
      >
        <div className="p-3.5 sm:p-4 flex flex-col gap-2.5">
          {/* ── Header row ── */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              placeholder="Alert headline or title..."
              className={`flex-1 min-w-0 bg-transparent outline-none font-sans text-[0.85rem] font-bold p-0 leading-tight tracking-tight ${
                isDarkMode
                  ? "text-zinc-100 placeholder:text-zinc-500"
                  : "text-zinc-900 placeholder:text-zinc-400"
              }`}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {Boolean(import.meta.env.DEV) && (
                <Tooltip title="Autofill sample test data (Dev Mode)" placement="top">
                  <button
                    type="button"
                    onClick={handleAutofillTestData}
                    className={`h-5.5 px-1.5 rounded-md flex items-center gap-1 text-[0.66rem] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      isDarkMode
                        ? "text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20"
                        : "text-amber-800 bg-amber-100/80 hover:bg-amber-200 border border-amber-300/40"
                    }`}
                    aria-label="Autofill sample test data"
                  >
                    <FlaskConical size={11} className="shrink-0" />
                    <span>Dev Fill</span>
                  </button>
                </Tooltip>
              )}

              <Tooltip title="Close (Esc)" placement="top">
                <button
                  type="button"
                  onClick={onCancel}
                  className={`w-5.5 h-5.5 rounded-md flex items-center justify-center bg-transparent transition-colors cursor-pointer flex-shrink-0 ${
                    isDarkMode
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                  }`}
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* ── AI Error (if any) ── */}
          {aiError && (
            <div className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[0.68rem] flex items-center justify-between">
              <span>{aiError}</span>
              <button
                type="button"
                onClick={() => setAiError(null)}
                className="font-bold ml-2 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Dynamic Form Fields for Chosen Alert Type ── */}
          <div className="flex flex-col gap-1.5">
            {/* SERMON TYPE INPUTS */}
            {alertType === "sermon" && (
              <>
                <input
                  type="text"
                  data-field="title"
                  ref={(el) => {
                    if (el && !activeInputRef.current) activeInputRef.current = el;
                  }}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="Sermon Title or Topic (e.g. Walking in Divine Dominion)..."
                  className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />

                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    data-field="scriptures"
                    onFocus={(e) => (activeInputRef.current = e.target)}
                    value={structuredData.scriptures || ""}
                    onChange={(e) => handleFieldChange("scriptures", e.target.value)}
                    placeholder="Scriptures (separate with commas, e.g. Romans 8:28, Eph 1:3)..."
                    className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                        : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                    }`}
                  />
                  <input
                    type="text"
                    data-field="speaker"
                    onFocus={(e) => (activeInputRef.current = e.target)}
                    value={structuredData.speaker || ""}
                    onChange={(e) => handleFieldChange("speaker", e.target.value)}
                    placeholder="Minister / Preacher (e.g. Pastor David)..."
                    className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                        : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                    }`}
                  />
                </div>

                <input
                  type="text"
                  data-field="notes"
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.notes || ""}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  placeholder="Key Points / Takeaways (separate with commas, e.g. Faith over fear, Daily prayer)..."
                  className={`w-full outline-none font-sans text-[0.75rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />
              </>
            )}

            {/* NEWS & EVENTS INPUTS */}
            {alertType === "news" && (
              <>
                <input
                  type="text"
                  data-field="headline"
                  ref={(el) => {
                    if (el && !activeInputRef.current) activeInputRef.current = el;
                  }}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.headline || ""}
                  onChange={(e) => handleFieldChange("headline", e.target.value)}
                  placeholder="Event Name / Announcement Headline (e.g. Youth Mega Worship Night)..."
                  className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />

                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="text"
                    data-field="dateTime"
                    onFocus={(e) => (activeInputRef.current = e.target)}
                    value={structuredData.dateTime || ""}
                    onChange={(e) => handleFieldChange("dateTime", e.target.value)}
                    placeholder="Date & Time (e.g. This Friday @ 6:00 PM)..."
                    className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                        : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                    }`}
                  />
                  <input
                    type="text"
                    data-field="venue"
                    onFocus={(e) => (activeInputRef.current = e.target)}
                    value={structuredData.venue || ""}
                    onChange={(e) => handleFieldChange("venue", e.target.value)}
                    placeholder="Venue / Location (e.g. Main Auditorium)..."
                    className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                        : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                    }`}
                  />
                  <input
                    type="text"
                    data-field="contact"
                    onFocus={(e) => (activeInputRef.current = e.target)}
                    value={structuredData.contact || ""}
                    onChange={(e) => handleFieldChange("contact", e.target.value)}
                    placeholder="Contact / Inquiries (e.g. 055-123-4567)..."
                    className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                        : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                    }`}
                  />
                </div>

                <textarea
                  rows={2}
                  data-field="details"
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.details || ""}
                  onChange={(e) => handleFieldChange("details", e.target.value)}
                  placeholder="Event details or announcement message..."
                  className={`w-full outline-none font-sans text-[0.75rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors resize-none no-scrollbar min-h-[38px] ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />
              </>
            )}

            {/* SCRIPTURE READING INPUTS */}
            {alertType === "scripture" && (
              <>
                <input
                  type="text"
                  data-field="reference"
                  ref={(el) => {
                    if (el && !activeInputRef.current) activeInputRef.current = el;
                  }}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.reference || ""}
                  onChange={(e) => handleFieldChange("reference", e.target.value)}
                  placeholder="Scriptures (separate multiple with commas, e.g. Psalm 23:1-3, 2 Cor 5:17)..."
                  className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />

                <textarea
                  rows={2}
                  data-field="verseText"
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.verseText || ""}
                  onChange={(e) => handleFieldChange("verseText", e.target.value)}
                  placeholder="Passage / Verse text (e.g. The Lord is my shepherd, I shall not want...)..."
                  className={`w-full outline-none font-sans text-[0.75rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors resize-none no-scrollbar min-h-[38px] ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />

                <input
                  type="text"
                  data-field="focus"
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.focus || ""}
                  onChange={(e) => handleFieldChange("focus", e.target.value)}
                  placeholder="Theme / Devotional Focus (optional)..."
                  className={`w-full outline-none font-sans text-[0.75rem] font-medium leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />
              </>
            )}

            {/* GENERAL / CUSTOM ALERT INPUTS */}
            {alertType === "general" && (
              <>
                <input
                  type="text"
                  data-field="title"
                  ref={(el) => {
                    if (el && !activeInputRef.current) activeInputRef.current = el;
                  }}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="Headline / Header (optional)..."
                  className={`w-full outline-none font-sans text-[0.78rem] font-semibold leading-snug py-1.5 px-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />

                <textarea
                  rows={2}
                  data-field="message"
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  value={structuredData.message || ""}
                  onChange={(e) => handleFieldChange("message", e.target.value)}
                  placeholder="Type your alert message or church announcement here..."
                  className={`w-full outline-none font-sans text-[0.78rem] font-normal leading-snug py-1.5 px-2.5 rounded-lg transition-colors resize-none no-scrollbar min-h-[40px] ${
                    isDarkMode
                      ? "bg-zinc-800/70 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-800 placeholder:text-zinc-400 focus:bg-zinc-100/80"
                  }`}
                />
              </>
            )}
          </div>

          {/* ── Live preview strip ── */}
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
                <div className="max-w-[480px] pb-0.5">
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
                          {parseColoredText(
                            internalText,
                            isDarkColor(bgColor) ? "#ffffff" : "#0f172a",
                            "'Outfit', sans-serif",
                            bgColor,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Horizontal Tool Chips Row ── */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Text colour picker */}
            <Tooltip title="Text colour (highlight text to style)" placement="top">
              <label
                className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                <Type
                  className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
                />
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

            {/* Background colour picker */}
            <Tooltip title="Background colour for the alert" placement="top">
              <label
                className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                <Layers2
                  className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
                />
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

            {/* Alert Type / Category Selector Button */}
            <Popover
              open={typePopoverOpen}
              onOpenChange={setTypePopoverOpen}
              trigger="click"
              placement="bottom"
              arrow={false}
              styles={{
                container: {
                  backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                  borderRadius: "12px",
                  padding: "8px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
                  border: isDarkMode
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid rgba(0,0,0,0.1)",
                },
              }}
              content={
                <div className="flex flex-col gap-1 w-[240px]">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800 px-1">
                    <span className="text-[0.66rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Alert Type
                    </span>
                    <button
                      type="button"
                      onClick={() => setTypePopoverOpen(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 py-1">
                    {ALERT_TYPES.map((typeItem) => {
                      const isSelected = alertType === typeItem.id;
                      const Icon = TYPE_ICON_MAP[typeItem.id] || Radio;

                      return (
                        <button
                          key={typeItem.id}
                          type="button"
                          onClick={() => {
                            handleTypeSelect(typeItem.id);
                            setTypePopoverOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                            isSelected
                              ? isDarkMode
                                ? "bg-zinc-800 text-white font-semibold ring-1 ring-white/10"
                                : "bg-zinc-100 text-zinc-900 font-semibold ring-1 ring-black/5"
                              : isDarkMode
                              ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? isDarkMode
                                    ? "bg-zinc-700 text-lime-400"
                                    : "bg-zinc-200 text-lime-600"
                                  : isDarkMode
                                  ? "bg-zinc-800 text-zinc-400"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="leading-tight font-medium text-[0.76rem]">{typeItem.label}</span>
                              <span className="text-[0.62rem] text-zinc-400 dark:text-zinc-500 font-normal leading-tight">
                                {typeItem.description}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-lime-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              }
            >
              <button
                type="button"
                className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
                  typePopoverOpen
                    ? isDarkMode
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-200 text-zinc-900"
                    : isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                {(() => {
                  const CurrentIcon = TYPE_ICON_MAP[alertType] || Radio;
                  const currentLabel =
                    ALERT_TYPES.find((t) => t.id === alertType)?.label || "Type";
                  return (
                    <>
                      <CurrentIcon
                        className={`w-3 h-3 ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      />
                      <span>{currentLabel}</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                    </>
                  );
                })()}
              </button>
            </Popover>

            {/* AI Auto-Style chip */}
            <Tooltip
              title={isEmpty ? "Type content first" : `Auto-format ${alertType} with AI`}
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
                  border: isDarkMode
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid rgba(0,0,0,0.1)",
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
                <Smile
                  className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
                />
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

          {/* ── Two-Column Bottom Section (Templates Tag-Wrapping + Action Buttons) ── */}
          <div className="flex items-stretch gap-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
            {/* Left Column: Template Styles */}
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
                  const Icon =
                    TEMPLATE_ICON_MAP[tmpl.id as AlertTemplateId] || ScrollText;
                  const baseBg = isDarkMode ? "#27272a" : "#f4f4f5";

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
                    <Tooltip
                      key={tmpl.id}
                      title={`${tmpl.label} — ${tmpl.description}`}
                      placement="top"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTemplateId(tmpl.id as AlertTemplateId)
                        }
                        className={`h-7 px-2 rounded-lg text-[0.68rem] shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 border ${
                          isActive
                            ? "font-bold text-zinc-100 dark:text-zinc-100 border-transparent"
                            : isDarkMode
                            ? "font-medium text-zinc-300 hover:text-zinc-100 border-zinc-700/50 hover:border-zinc-600"
                            : "font-medium text-zinc-700 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300"
                        }`}
                        style={gradientStyle}
                      >
                        <div
                          className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            backgroundColor: isActive
                              ? "rgba(255, 255, 255, 0.22)"
                              : `color-mix(in srgb, ${tmpl.accentColor} 25%, ${
                                  isDarkMode ? "#18181b" : "#ffffff"
                                })`,
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

            {/* Right Column: Action Buttons */}
            <div className="w-[25%] min-w-[130px] shrink-0 flex flex-col justify-center gap-2 pl-3 border-l border-zinc-200/60 dark:border-zinc-800/60">
              <Tooltip
                title={isEmpty ? "Type a message first" : "Save to alert list"}
                placement="top"
              >
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
