import React, { useEffect, useState, useRef, useCallback } from "react";
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
// import { AmbientEffects } from "./Biblewindowcomponents/AmbientEffects";

// Alert / Marquee types
type MarqueeAlert = {
  id: string;
  text: string;
  duration?: number; // seconds
  speed?: number; // seconds for one full scroll (lower = faster)
  backgroundColor?: string; // color for the background
  textColor?: string; // color for the text
};

// Color mapping for text coloring
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

// Function to parse color syntax in text
const parseColoredText = (text: string): (string | JSX.Element)[] => {
  const regex = /\{(\w+)\}([^{]*)\{\/\1\}/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const color = match[1];
    const coloredText = match[2];
    const colorValue = colorMap[color] || colorMap.red; // fallback to red

    parts.push(
      <span
        key={key++}
        style={{ color: colorValue }}
        className="font-[Tahoma] "
      >
        {coloredText}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

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
          textColor: data?.textColor,
          backgroundColor: data?.backgroundColor,
          text: data?.text,
          fullData: data,
        });

        const alert: MarqueeAlert = {
          id: data?.id || `alert-${Date.now()}`,
          text: data?.text || "",
          speed: typeof data?.speed === "number" ? data.speed : 10,
          backgroundColor: data?.backgroundColor,
          textColor: data?.textColor,
        };
        console.log("🎬 Created alert object with textColor:", alert.textColor);

        // Clear any existing alerts first
        setMarqueeAlerts([]);

        // Clear any existing timers
        Object.values(marqueeTimers.current).forEach((id) => clearTimeout(id));
        marqueeTimers.current = {};

        // Add the new alert
        setMarqueeAlerts((prev) => [...prev, alert]);

        // Auto-hide alert after 2 minutes (120 seconds)
        const timerId = window.setTimeout(() => {
          console.log("⏰ Auto-hiding alert after 2 minutes:", alert.id);
          setMarqueeAlerts((prev) => prev.filter((a) => a.id !== alert.id));
          delete marqueeTimers.current[alert.id];
        }, 120000); // 120 seconds = 2 minutes

        // Store the timer ID
        marqueeTimers.current[alert.id] = timerId;
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log("🎧 BiblePresentation: Setting up unified IPC listener");
      window.ipcRenderer.on("bible-presentation-update", handleUnifiedMessage);

      return () => {
        console.log("🔇 BiblePresentation: Removing unified IPC listener");
        window.ipcRenderer.off(
          "bible-presentation-update",
          handleUnifiedMessage
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
    (state) => state.bible.isBlankScreenMode
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
    projectionTextColor,
    currentTranslation,
    currentBook,
    currentChapter,
    selectedBackground,

    // Local state
    settings,
    currentVerseIndex,
    isTranslationSwitching,
    showScriptureReference,
    isControlPanelVisible,
    isBackgroundLoading,
    selectedGradient,
    useImageBackground,

    // Helper functions
    getBaseFontSize,
    getFontFamilyClass,
    getCurrentVerses,
    getEffectiveTextColor,
    getEffectiveFontFamily,

    // Event handlers
    handleMouseEnterTopRegion,
    handleMouseLeaveTopRegion,
    switchTranslation,
    toggleControlPanel,

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

  if (!verses.length) {
    return <WelcomeScreen />;
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
          minHeight: "100vh",
        }}
      >
        {/* Hide verse content when blank screen mode is active */}
        {!isBlankScreenMode && (
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

        {/* Optional: Show blank screen indicator when in blank mode (for debugging) */}
        {/* When blank screen mode is active we intentionally render no overlays
            so only the background is visible. */}
      </div>

      {/* <ControlPanel
        isControlPanelVisible={isControlPanelVisible}
        currentBook={currentBook}
        currentChapter={currentChapter}
        currentVerses={currentVerses}
        settings={settings}
        currentTranslation={currentTranslation}
        isTranslationSwitching={isTranslationSwitching}
        currentVerseIndex={currentVerseIndex}
        verses={verses}
        switchTranslation={switchTranslation}
        toggleControlPanel={toggleControlPanel}
      /> */}

      {/* <AmbientEffects /> */}
      {/* Marquee Alerts Overlay */}
      {marqueeAlerts.length > 0 && (
        <div className="fixed left-0 w-screen bottom-0 flex flex-col pointer-events-none z-50">
          <style>{`
            /* Start visible (translateX(0)), then after delay animate leftwards to -100% */
            @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
            @keyframes alertFadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          `}</style>
          {marqueeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="w-full h-[5.2rem] pointer-events-auto overflow-hidden border border-select-border flex items-center"
              style={{
                backgroundColor: alert.backgroundColor
                  ? `${alert.backgroundColor}E6`
                  : "rgba(0,0,0,0.9)",
                padding: "6px 2px",
                animation: "alertFadeIn 0.5s ease-out forwards",
              }}
            >
              <div style={{ overflow: "hidden", width: "100%" }}>
                <div
                  className="text-[3.3rem] font-[Tahoma] "
                  style={{
                    // Use pre to preserve sequences of spaces exactly as authored
                    whiteSpace: "pre",
                    display: "inline-block",
                    // Start visible for 5s (animationDelay) then scroll. Use alert.speed if provided else default to 30s.
                    animation: `marqueeScroll ${20}s linear infinite`,
                    animationDelay: `7s`,
                    fontWeight: 600,
                    color: alert.textColor || "#ffffff",
                    textShadow: "0 0 10px rgba(0,0,0,0.4)",
                  }}
                >
                  {"\u00A0"}
                  {"\u00A0"}
                  {"\u00A0"}
                  {"\u00A0"}
                  {"\u00A0"}
                  {"\u00A0"}
                  {parseColoredText(alert.text)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BiblePresentationDisplay;
