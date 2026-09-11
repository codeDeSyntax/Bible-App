import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
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
  composeAlertMarkup,
  decomposeAlertMarkup,
} from "@/Bible/components/AlertTemplates/alertParser";
import {
  AlertModalProps,
  ColorRange,
  TextSnapshot,
} from "./AlertModal/AlertModalTypes";
import {
  SAMPLE_TEST_DATA,
  PencilSparkles,
  CrossIcon,
} from "./AlertModal/AlertModalConstants";
import {
  cleanStructuredData,
  parseAlertMarkup,
  buildAlertMarkup,
  updateRangesForTextChange,
} from "./AlertModal/AlertModalUtils";
import { AlertModalHeader } from "./AlertModal/AlertModalHeader";
import { AlertFormFields } from "./AlertModal/AlertFormFields";
import { AlertPreviewStrip } from "./AlertModal/AlertPreviewStrip";
import { AlertToolbar } from "./AlertModal/AlertToolbar";
import { AlertTemplateSelector } from "./AlertModal/AlertTemplateSelector";

export { PencilSparkles, CrossIcon };
export type { AlertModalProps };

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
    cleanStructuredData(
      decomposeAlertMarkup(initialText, (initialAlertType as AlertType) || "sermon"),
    ),
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
      structuredData: initialStructuredData || {},
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
          {/* Header Row (Title, Dev Fill, AI Error, Close Button) */}
          <AlertModalHeader
            alertTitle={alertTitle}
            onTitleChange={setAlertTitle}
            onAutofillTestData={handleAutofillTestData}
            onCancel={onCancel}
            aiError={aiError}
            onClearAiError={() => setAiError(null)}
            isDarkMode={isDarkMode}
          />

          {/* Dynamic Form Fields for Chosen Alert Type */}
          <AlertFormFields
            alertType={alertType}
            structuredData={structuredData}
            onFieldChange={handleFieldChange}
            activeInputRef={activeInputRef}
            isDarkMode={isDarkMode}
          />

          {/* Live Preview Strip */}
          <AlertPreviewStrip
            isEmpty={isEmpty}
            bgColor={bgColor}
            internalText={internalText}
            isDarkMode={isDarkMode}
          />

          {/* Horizontal Tool Chips Row (Colors, Category, AI Style, Symbols, Undo) */}
          <AlertToolbar
            isDarkMode={isDarkMode}
            themeDefaultTextColor={themeDefaultTextColor}
            applyColorToSelection={applyColorToSelection}
            bgColor={bgColor}
            setBgColor={setBgColor}
            alertType={alertType}
            onTypeSelect={handleTypeSelect}
            typePopoverOpen={typePopoverOpen}
            setTypePopoverOpen={setTypePopoverOpen}
            handleAiStyle={handleAiStyle}
            isGeneratingAi={isGeneratingAi}
            isEmpty={isEmpty}
            symbolsPopoverOpen={symbolsPopoverOpen}
            setSymbolsPopoverOpen={setSymbolsPopoverOpen}
            insertEmoji={insertEmoji}
            historyIndex={historyIndex}
            handleUndo={handleUndo}
          />

          {/* Two-Column Bottom Section (Template Styles & Actions) */}
          <AlertTemplateSelector
            isDarkMode={isDarkMode}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            isEmpty={isEmpty}
            editingAlertId={editingAlertId}
            onSave={handleSave}
            onCancel={onCancel}
          />
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
