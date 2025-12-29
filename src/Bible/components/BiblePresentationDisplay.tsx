import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  addTextHighlight,
  updateTextHighlight,
  removeTextHighlight,
  setBlankScreenMode,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { logBibleAction, logBibleProjection } from "@/utils/ClientSecretLogger";

// Import the modular components
import { useBiblePresentation } from "./Biblewindowcomponents/hooks/useBiblePresentation";
import { useBiblePresentationEffects } from "./Biblewindowcomponents/hooks/useBiblePresentationEffects";
import { BackgroundRenderer } from "./Biblewindowcomponents/BackgroundRenderer";
import { WelcomeScreen } from "./Biblewindowcomponents/WelcomeScreen";
import { VerseDisplay } from "./Biblewindowcomponents/VerseDisplay";
import { AmbientEffects } from "./Biblewindowcomponents/AmbientEffects";

// Alert / Marquee types
type MarqueeAlert = {
  id: string;
  text: string;
  duration?: number; // seconds
  speed?: number; // seconds for one full scroll (lower = faster)
  backgroundColor?: string; // color for the text
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
      <span key={key++} style={{ color: colorValue }} className="font-[Tahoma]">
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

  console.log("🎬 BiblePresentationDisplay component mounted/rendered");
  console.log("🔊 MAIN PROJECTION COMPONENT IS ACTIVE!");
  console.log("📍 Window location:", window.location.href);

  // Listen for text highlight updates and blank screen mode via IPC
  useEffect(() => {
    console.log(
      "🔧 Setting up IPC listeners for highlights and blank screen..."
    );

    const handlePresentationUpdate = (event: any, message: any) => {
      console.log("📨 BiblePresentation received IPC message:", message);

      const { type, data } = message;

      // Handle only specific message types here
      // Other types (like updateStyle) are handled by useBiblePresentationEffects
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
        // Clear all alerts
        setMarqueeAlerts([]);
        Object.values(marqueeTimers.current).forEach((id) => clearTimeout(id));
        marqueeTimers.current = {};
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log(
        "🎧 BiblePresentation: Setting up IPC listeners for highlights and blank screen"
      );
      window.ipcRenderer.on(
        "bible-presentation-update",
        handlePresentationUpdate
      );

      return () => {
        console.log("🔇 BiblePresentation: Removing IPC listeners");
        window.ipcRenderer.off(
          "bible-presentation-update",
          handlePresentationUpdate
        );
      };
    } else {
      console.warn("⚠️ BiblePresentation: No IPC renderer available");
    }
  }, [dispatch]);

  // Marquee alerts state and timers
  const [marqueeAlerts, setMarqueeAlerts] = useState<MarqueeAlert[]>([]);
  const marqueeTimers = useRef<Record<string, number>>({});

  // Extend IPC handler to accept 'publishAlert' messages
  useEffect(() => {
    const handleAlertMessage = (event: any, message: any) => {
      if (!message) return;
      const { type, data } = message;
      if (type === "publishAlert") {
        const alert: MarqueeAlert = {
          id: data.id || `alert-${Date.now()}`,
          text: data.text || "",
          speed: typeof data.speed === "number" ? data.speed : 10,
          backgroundColor: data.backgroundColor,
        };

        // Clear any existing alerts first
        setMarqueeAlerts([]);

        // Add the new alert
        setMarqueeAlerts((prev) => [...prev, alert]);

        // No auto-removal; alerts persist until hidden
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.on("bible-presentation-update", handleAlertMessage);
      return () => {
        window.ipcRenderer.off("bible-presentation-update", handleAlertMessage);
        // clear timers
        Object.values(marqueeTimers.current).forEach((id) => clearTimeout(id));
        marqueeTimers.current = {};
      };
    }
  }, []);

  // Refs for auto-sizing
  const verseContentRef = useRef<HTMLDivElement>(null);
  const verseContainerRef = useRef<HTMLDivElement>(null);
  const previousVerseIndexRef = useRef<number>(0);

  // Auto-sizing state (match VerseByVerseView default)
  const [autoFontSize, setAutoFontSize] = useState(60); // Match VerseByVerseView default
  const [isResizing, setIsResizing] = useState(false);
  const [lastSizedVerseKey, setLastSizedVerseKey] = useState<string>(""); // Track which verse has been sized
  const presentationAutoSize = useAppSelector(
    (state) => state.bible.presentationAutoSize
  );
  const isBlankScreenMode = useAppSelector(
    (state) => state.bible.isBlankScreenMode
  );

  // Auto-resize function using simple recursive approach (matching VerseByVerseView exactly)
  const resizeToFit = useCallback(() => {
    if (!verseContentRef.current || !verseContainerRef.current) {
      console.warn("⚠️ Presentation resize aborted - refs not ready:", {
        contentRef: !!verseContentRef.current,
        containerRef: !!verseContainerRef.current,
      });
      return;
    }

    if (isResizing) {
      console.warn("⚠️ Presentation resize aborted - already resizing");
      return;
    }

    setIsResizing(true);

    const content = verseContentRef.current;
    const container = verseContainerRef.current;

    console.log("🔍 Starting presentation resize - container dimensions:", {
      containerHeight: container.clientHeight,
      containerWidth: container.clientWidth,
      contentText: content.textContent?.substring(0, 50) + "...",
    });

    // Smart recursive approach: start large and reduce until it fits HEIGHT only
    // Width constraint is too restrictive for centered text
    const recursiveResize = (currentSize: number): number => {
      // Apply the font size
      content.style.fontSize = `${currentSize}px`;

      // Set line height based on font size
      let lineHeight;
      if (currentSize >= 100) {
        lineHeight = 1.0;
      } else if (currentSize >= 80) {
        lineHeight = 1.2;
      } else if (currentSize >= 60) {
        lineHeight = 1.2;
      } else if (currentSize >= 40) {
        lineHeight = 1.2;
      } else {
        lineHeight = 1.3;
      }
      content.style.lineHeight = lineHeight.toString();

      // Force reflow to get accurate measurements
      content.offsetHeight;

      const contentHeight = content.scrollHeight;
      const containerHeight = container.clientHeight;

      // Use 3% margin for safety - gives more space to text
      const heightMargin = containerHeight * 0.03;

      // console.log(`📏 Testing presentation ${currentSize}px:`, {
      //   contentHeight,
      //   containerHeight,
      //   heightFits: contentHeight <= containerHeight - heightMargin,
      //   utilization: `${((contentHeight / containerHeight) * 100).toFixed(1)}%`,
      // });

      // Check if content height exceeds container
      if (contentHeight > containerHeight - heightMargin) {
        // Too big, try smaller size
        if (currentSize > 12) {
          return recursiveResize(currentSize - 2);
        } else {
          return 12; // Minimum size
        }
      } else {
        // Fits! This is our size
        return currentSize;
      }
    };

    // Start with 200px to maximize space for short verses
    const finalSize = recursiveResize(200);

    // Update state immediately
    setAutoFontSize(finalSize);
    setIsResizing(false);

    // Signal that resize is complete
    requestAnimationFrame(() => {
      setLastSizedVerseKey("_resized_"); // Temporary marker, will be set properly in effect
    });

    // Debug log
    const resizeResult = {
      fontSize: finalSize,
      containerHeight: container.clientHeight,
      contentHeight: content.scrollHeight,
      utilization: `${(
        (content.scrollHeight / container.clientHeight) *
        100
      ).toFixed(1)}%`,
    };

    console.log("✅ FINAL presentation resize result:", resizeResult);

    // Log auto-sizing result to secret logs
    logBibleProjection("Presentation auto-sizing completed", {
      component: "BiblePresentationDisplay",
      mode: "auto-sizing",
      finalFontSize: finalSize,
      containerDimensions: {
        height: container.clientHeight,
        width: container.clientWidth,
      },
      contentHeight: content.scrollHeight,
      spaceUtilization: resizeResult.utilization,
      contentPreview: content.textContent?.substring(0, 100) + "...",
    });
  }, [isResizing]);

  // Helper function to get the auto-fitted font size (always auto-sizing now)
  const getFinalFontSize = () => {
    return `${autoFontSize}px`; // Always use auto-fitted size
  };

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

  // Reset sized verse key when verse changes using useLayoutEffect
  useLayoutEffect(() => {
    const currentVerseKey = `${currentBook}-${currentChapter}-${currentVerseIndex}`;
    if (previousVerseIndexRef.current !== currentVerseIndex) {
      previousVerseIndexRef.current = currentVerseIndex;
      // Clear the sized verse key to hide content immediately
      setLastSizedVerseKey("");
    }
  }, [currentVerseIndex, currentBook, currentChapter]);

  // Set the verse key after resize completes
  useEffect(() => {
    if (lastSizedVerseKey === "_resized_") {
      const currentVerseKey = `${currentBook}-${currentChapter}-${currentVerseIndex}`;
      setLastSizedVerseKey(currentVerseKey);
    }
  }, [lastSizedVerseKey, currentBook, currentChapter, currentVerseIndex]);

  // Auto-resize when content changes (always enabled now)
  useEffect(() => {
    if (currentVerses.length > 0) {
      // Log auto-sizing trigger
      logBibleAction("Presentation auto-sizing triggered", {
        component: "BiblePresentationDisplay",
        trigger: "content_change",
        currentBook: currentBook,
        currentChapter: currentChapter,
        currentVerseIndex: currentVerseIndex,
        versesCount: currentVerses.length,
      });

      // Use requestAnimationFrame for immediate resize on next frame
      // This is much faster than waiting for animations
      const rafId = requestAnimationFrame(() => {
        console.log("⏰ Auto-resize triggered", {
          hasContentRef: !!verseContentRef.current,
          hasContainerRef: !!verseContainerRef.current,
        });
        resizeToFit();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [
    currentVerseIndex,
    currentBook,
    currentChapter,
    // Don't include currentVerses directly to avoid frequent updates
    resizeToFit,
  ]);

  // Dedicated effect to ensure autosize works when refs become ready
  useEffect(() => {
    if (
      verseContentRef.current &&
      verseContainerRef.current &&
      currentVerses.length > 0
    ) {
      console.log("🔗 Refs and verses are ready, ensuring autosize", {
        currentVerseIndex,
        versesCount: currentVerses.length,
      });

      // Use requestAnimationFrame for immediate resize
      const rafId = requestAnimationFrame(() => {
        resizeToFit();
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [
    verseContentRef.current,
    verseContainerRef.current,
    currentVerses.length,
  ]);

  // Initial autosize on mount when verses are available
  useEffect(() => {
    if (currentVerses.length > 0) {
      console.log("🎬 Verses became available, triggering initial autosize", {
        versesCount: currentVerses.length,
        currentVerseIndex,
      });

      // Use multiple animation frames to ensure DOM is fully ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            console.log("🎯 Attempting initial autosize resize");
            resizeToFit();
          }, 400);
        });
      });
    }
  }, [currentVerses.length]); // Trigger when verses become available

  // Auto-resize on window resize (always enabled now)
  useEffect(() => {
    window.addEventListener("resize", resizeToFit);
    return () => window.removeEventListener("resize", resizeToFit);
  }, [resizeToFit]);

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
          visibility:
            lastSizedVerseKey ===
            `${currentBook}-${currentChapter}-${currentVerseIndex}`
              ? "visible"
              : "hidden",
          opacity:
            lastSizedVerseKey ===
            `${currentBook}-${currentChapter}-${currentVerseIndex}`
              ? 1
              : 0,
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
            getFinalFontSize={getFinalFontSize}
            verseContentRef={verseContentRef}
            verseContainerRef={verseContainerRef}
            projectionFontFamily={projectionFontFamily}
            projectionBackgroundImage={projectionBackgroundImage}
          />
        )}

        {/* Optional: Show blank screen indicator when in blank mode (for debugging) */}
        {isBlankScreenMode && (
          <div className="absolute top-4 left-4 text-white/20 text-sm font-mono z-50">
            BLANK MODE
          </div>
        )}
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
            @keyframes marqueeScroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
            @keyframes alertFadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          `}</style>
          {marqueeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="w-full h-20 pointer-events-auto overflow-hidden border border-select-border flex items-center"
              style={{
                backgroundColor: alert.backgroundColor
                  ? `${alert.backgroundColor}E6`
                  : "rgba(0,0,0,0.9)",
                padding: "6px 12px",
                animation: "alertFadeIn 0.5s ease-out forwards",
              }}
            >
              <div style={{ overflow: "hidden", width: "100%" }}>
                <div
                  className="text-5xl font-[Tahoma]"
                  style={{
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    animation: `marqueeScroll 30s linear infinite`,
                    fontWeight: 600,
                    color: "#ffffff",
                    textShadow:
                      "0 0 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8), 3px 3px 6px rgba(0,0,0,0.8)",
                  }}
                >
                  {parseColoredText(alert.text)}
                  {"\u00A0"}
                  {/* {parseColoredText(alert.text)} */}
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
