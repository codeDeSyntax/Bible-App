import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  addTextHighlight,
  updateTextHighlight,
  removeTextHighlight,
  setBlankScreenMode,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
// import { logBibleAction, logBibleProjection } from "@/utils/ClientSecretLogger";

// Import the modular components
import { useBiblePresentation } from "./Biblewindowcomponents/hooks/useBiblePresentation";
import { useBiblePresentationEffects } from "./Biblewindowcomponents/hooks/useBiblePresentationEffects";
import { BackgroundRenderer } from "./Biblewindowcomponents/BackgroundRenderer";
import { WelcomeScreen } from "./Biblewindowcomponents/WelcomeScreen";
import { VerseDisplay } from "./Biblewindowcomponents/VerseDisplay";
import { AlertTemplateRenderer } from "./AlertTemplates/AlertTemplateRenderer";
import type { AlertPayload } from "./AlertTemplates/alertTemplateTypes";
// import { AmbientEffects } from "./Biblewindowcomponents/AmbientEffects";

// Alert / Marquee types — now extended to support design templates
type MarqueeAlert = AlertPayload;


interface BiblePresentationDisplayProps {
  initialData?: {
    book: string;
    chapter: number;
    verses: Array<{ verse: number; text: string }>;
    translation: string;
    selectedVerse?: number;
  };
  initialSettings?: {
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    versesPerSlide: number;
  };
}

const BiblePresentationDisplay: React.FC<BiblePresentationDisplayProps> = ({
  initialData,
  initialSettings,
}) => {
  const dispatch = useAppDispatch();
  const { getCurrentChapterVerses, initializeBibleData } = useBibleOperations();
  const contentRef = useRef<HTMLDivElement>(null);

  // Marquee alerts state and timers
  const [marqueeAlerts, setMarqueeAlerts] = useState<MarqueeAlert[]>([]);
  const marqueeTimers = useRef<Record<string, number>>({});

  // Unified IPC handler for all message types
  useEffect(() => {
    console.log("🔧 Setting up unified IPC listener...");

    const handleUnifiedMessage = (event: any, message: any) => {
      if (!message) return;
      const { type, data } = message;

      console.log("📨 BiblePresentation received IPC message:", { type, data });

      if (type === "addTextHighlight") {
        console.log("✅ Dispatching addTextHighlight:", data);
        dispatch(addTextHighlight(data));
      } else if (type === "updateTextHighlight") {
        console.log("✅ Dispatching updateTextHighlight:", data);
        dispatch(updateTextHighlight(data));
      } else if (type === "removeTextHighlight") {
        console.log("✅ Dispatching removeTextHighlight:", data);
        dispatch(removeTextHighlight(data));
      } else if (type === "hideAlert") {
        console.log("🚫 Hiding all alerts");
        setMarqueeAlerts([]);
        Object.values(marqueeTimers.current).forEach((id) => clearTimeout(id));
        marqueeTimers.current = {};
      } else if (type === "blank-screen-mode") {
        try {
          const isBlank = !!data?.isBlank;
          dispatch(setBlankScreenMode(isBlank));
          console.log("📺 Presentation blank screen mode set to:", isBlank);
        } catch (err) {
          console.error("Error applying blank-screen-mode:", err);
        }
      } else if (type === "publishAlert") {
        console.log("🎬 BiblePresentationDisplay received publishAlert:", {
          backgroundColor: data?.backgroundColor,
          text: data?.text,
          fullData: data,
        });

        const alert: MarqueeAlert = {
          id: data?.id || `alert-${Date.now()}`,
          text: data?.text || "",
          speed: typeof data?.speed === "number" ? data.speed : typeof data?.animationSpeed === "number" ? data.animationSpeed : 24,
          backgroundColor: data?.backgroundColor,
          position: data?.position || "bottom",
          templateId: data?.templateId || undefined,
          alertType: data?.alertType || undefined,
          structuredData: data?.structuredData || undefined,
        };
        console.log("🎬 Created alert object:", alert);

        // Clear any existing alerts first
        setMarqueeAlerts([]);

        // Clear any existing timers
        Object.values(marqueeTimers.current).forEach((id) => clearTimeout(id));
        marqueeTimers.current = {};

        // Add the new alert
        setMarqueeAlerts((prev) => [...prev, alert]);

        // Alerts remain visible until manually removed via hideAlert or close button
        // No auto-hide - user must explicitly dismiss (was previously 120 seconds = 2 minutes)
      } else if (type === "updateAlertPosition") {
        console.log("📍 Updating alert position:", {
          alertId: data?.alertId,
          position: data?.position,
        });
        // Update the position of an existing alert in real-time
        setMarqueeAlerts((prev) =>
          prev.map((alert) =>
            alert.id === data?.alertId
              ? { ...alert, position: data?.position }
              : alert,
          ),
        );
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log("🎧 BiblePresentation: Setting up unified IPC listener");
      window.ipcRenderer.on("bible-presentation-update", handleUnifiedMessage);

      return () => {
        console.log("🔇 BiblePresentation: Removing unified IPC listener");
        window.ipcRenderer.off(
          "bible-presentation-update",
          handleUnifiedMessage,
        );
        // Clear all timers on unmount
        Object.values(marqueeTimers.current).forEach((id) => clearTimeout(id));
        marqueeTimers.current = {};
      };
    } else {
      console.warn("⚠️ BiblePresentation: No IPC renderer available");
    }
  }, [dispatch]);

  // Refs for verse display (kept for compatibility)
  const verseContentRef = useRef<HTMLDivElement>(null);
  const verseContainerRef = useRef<HTMLDivElement>(null);

  const isBlankScreenMode = useAppSelector(
    (state) => state.bible.isBlankScreenMode,
  );

  // Use the modular hooks for all business logic
  const hookResult = useBiblePresentation(initialData, initialSettings);

  // Destructure what we need from the hook
  const {
    // Redux state
    projectionFontSize,
    projectionFontFamily,
    projectionBackgroundColor,
    projectionGradientColors,
    projectionBackgroundImage,
    currentBook,
    currentChapter,
    selectedBackground,

    // Local state
    settings,
    currentVerseIndex,
    isBackgroundLoading,
    selectedGradient,
    useImageBackground,

    // Helper functions
    getBaseFontSize,
    getFontFamilyClass,
    getCurrentVerses,
    getEffectiveTextColor,
    getEffectiveFontFamily,

    // Constants
    backgroundGradients,
  } = hookResult;

  // Use the effects hook with the complete hook result
  useBiblePresentationEffects(hookResult);

  // Override text color to white if image or gradient is set
  const forceWhiteText =
    (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") ||
    (projectionGradientColors && projectionGradientColors.length >= 2);
  const getPresentationTextColor = () =>
    forceWhiteText ? "#fff" : getEffectiveTextColor();

  const currentVerses = getCurrentVerses();
  let verses = getCurrentChapterVerses();

  if (!verses.length && initialData?.verses) {
    verses = initialData.verses;
  }

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* <LiveBorder /> */}

      <BackgroundRenderer
        projectionBackgroundImage={projectionBackgroundImage}
        projectionGradientColors={projectionGradientColors}
        projectionBackgroundColor={projectionBackgroundColor}
        isBackgroundLoading={isBackgroundLoading}
      />

      <div
        ref={contentRef}
        className="relative z-10 w-full h-full flex flex-col justify-center items-center px-3 overflow-y-auto no-scrollbar"
        style={{
          height: "100vh",
        }}
      >
        {/* Hide verse content when blank screen mode is active */}
        {verses.length > 0 && !isBlankScreenMode && (
          <VerseDisplay
            currentVerseIndex={currentVerseIndex}
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentVerses={currentVerses}
            useImageBackground={useImageBackground}
            settings={settings}
            getEffectiveTextColor={getPresentationTextColor}
            getFontFamilyClass={getFontFamilyClass}
            getEffectiveFontFamily={getEffectiveFontFamily}
            getBaseFontSize={getBaseFontSize}
            verseContentRef={verseContentRef}
            verseContainerRef={verseContainerRef}
            projectionFontFamily={projectionFontFamily}
            projectionBackgroundImage={projectionBackgroundImage}
          />
        )}

        {/* If no verses and no alerts are active, show standby WelcomeScreen */}
        {verses.length === 0 && marqueeAlerts.length === 0 && (
          <WelcomeScreen />
        )}
      </div>

      {/* Alert Template Renderer — renders the correct visual design template */}
      <AlertTemplateRenderer alerts={marqueeAlerts} />
    </div>
  );
};

export default BiblePresentationDisplay;
