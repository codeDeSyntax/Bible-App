import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Marquee from "react-simple-marquee";
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
  position?: "top" | "bottom"; // Position of the alert (default: bottom)
  // textColor is embedded in text via {color}text{/color} syntax, not as a separate field
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
        <span key={key++} style={{ color: "#ffffff", fontFamily: "Tahoma" }}>
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
      // If it's a hex value (6 hex digits), use it directly
      colorValue = `#${color}`;
    } else {
      colorValue = colorMap.red; // fallback to red
    }

    parts.push(
      <span
        key={key++}
        style={{ color: colorValue }}
        className="font-[Tahoma] "
      >
        {coloredText}
      </span>,
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    parts.push(
      <span key={key++} style={{ color: "#ffffff", fontFamily: "Tahoma" }}>
        {remainingText}
      </span>,
    );
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
          backgroundColor: data?.backgroundColor,
          text: data?.text,
          fullData: data,
        });

        const alert: MarqueeAlert = {
          id: data?.id || `alert-${Date.now()}`,
          text: data?.text || "",
          speed: typeof data?.speed === "number" ? data.speed : 10,
          backgroundColor: data?.backgroundColor,
          position: data?.position || "bottom",
          // textColor is not stored - colors are embedded in text via {color}text{/color} syntax
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
    projectionTextColor,
    currentTranslation,
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
          height: "100vh",
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

      {/* <AmbientEffects /> */}
      {/* Marquee Alerts Overlay */}
      {marqueeAlerts.length > 0 && (
        <>
          <style>{`
            @keyframes alertFadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
            .marquee-alert-container {
              will-change: transform;
              transform: translateZ(0);
              backface-visibility: hidden;
            }
          `}</style>
          {marqueeAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              className="fixed left-0 w-screen flex pointer-events-none z-50 marquee-alert-container"
              style={{
                top: (alert.position || "bottom") === "top" ? 0 : "auto",
                bottom: (alert.position || "bottom") === "bottom" ? 0 : "auto",
              }}
              initial={{
                opacity: 0,
                y: (alert.position || "bottom") === "top" ? -20 : 20,
              }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div
                className="w-full h-[5.2rem] pointer-events-auto border border-select-border flex items-center overflow-hidden"
                style={{
                  backgroundColor: alert.backgroundColor || "rgba(0,0,0,0.9)",
                  padding: "6px 0",
                }}
              >
                <Marquee
                  speed={12}
                  // background={alert.backgroundColor || "rgba(0,0,0,0.9)"}
                  // height="100%"
                  // width="100%"
                >
                  <div
                    className="text-[3.3rem] font-[Tahoma] font-bold flex items-center px-12"
                    style={{
                      fontFamily: "Tahoma, sans-serif",
                      textShadow: "0 0 10px rgba(0,0,0,0.4)",
                      whiteSpace: "nowrap",
                      transform: "translateZ(0)",
                    }}
                  >
                    {parseColoredText(alert.text)}
                  </div>
                </Marquee>
              </div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

export default BiblePresentationDisplay;
