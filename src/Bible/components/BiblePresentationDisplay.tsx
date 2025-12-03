import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setCurrentTranslation,
  setCurrentBook,
  setCurrentChapter,
  TRANSLATIONS,
  setSelectedBackground,
  setStandaloneFontMultiplier,
  setProjectionFontSize,
  setProjectionFontFamily,
  setProjectionBackgroundColor,
  setProjectionGradientColors,
  setProjectionBackgroundImage,
  setProjectionTextColor,
  setPresentationAutoSize,
  addTextHighlight,
  updateTextHighlight,
  removeTextHighlight,
} from "@/store/slices/bibleSlice";
import { setBibleBgs } from "@/store/slices/appSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { logBibleAction, logBibleProjection } from "@/utils/ClientSecretLogger";

// Import the modular components
import { useBiblePresentation } from "./Biblewindowcomponents/hooks/useBiblePresentation";
import { useBiblePresentationEffects } from "./Biblewindowcomponents/hooks/useBiblePresentationEffects";
import { LiveBorder } from "./Biblewindowcomponents/LiveBorder";
import { BackgroundRenderer } from "./Biblewindowcomponents/BackgroundRenderer";
import { WelcomeScreen } from "./Biblewindowcomponents/WelcomeScreen";
import { VerseDisplay } from "./Biblewindowcomponents/VerseDisplay";
import { ControlPanel } from "./Biblewindowcomponents/ControlPanel";
import { AmbientEffects } from "./Biblewindowcomponents/AmbientEffects";

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

  // Listen for text highlight updates via IPC
  useEffect(() => {
    console.log("🔧 Setting up text highlight IPC listener...");

    const handleHighlightUpdate = (event: any, message: any) => {
      console.log("📨 BiblePresentation received IPC message:", message);

      const { type, data } = message;

      if (type === "addTextHighlight") {
        console.log("✅ Dispatching addTextHighlight:", data);
        dispatch(addTextHighlight(data));
      } else if (type === "updateTextHighlight") {
        console.log("✅ Dispatching updateTextHighlight:", data);
        dispatch(updateTextHighlight(data));
      } else if (type === "removeTextHighlight") {
        console.log("✅ Dispatching removeTextHighlight:", data);
        dispatch(removeTextHighlight(data));
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log(
        "🎧 BiblePresentation: Setting up IPC listener for highlights"
      );
      window.ipcRenderer.on("bible-presentation-update", handleHighlightUpdate);

      return () => {
        console.log("🔇 BiblePresentation: Removing IPC listener");
        window.ipcRenderer.off(
          "bible-presentation-update",
          handleHighlightUpdate
        );
      };
    } else {
      console.warn("⚠️ BiblePresentation: No IPC renderer available");
    }
  }, [dispatch]);

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

    // Simple recursive approach: start big and reduce until it fits (match VerseByVerseView)
    const recursiveResize = (currentSize: number): number => {
      // Apply the font size
      content.style.fontSize = `${currentSize}px`;

      // Set line height based on font size (match VerseByVerseView exactly)
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

      console.log(`📏 Testing presentation ${currentSize}px:`, {
        contentHeight,
        containerHeight,
        fits: contentHeight <= containerHeight,
      });

      // Check if content height exceeds container (like HTML test)
      if (contentHeight > containerHeight) {
        // Too big, try smaller size
        if (currentSize > 12) {
          return recursiveResize(currentSize - 2); // Decrease by 2 for faster convergence
        } else {
          return 12; // Minimum size
        }
      } else {
        // Fits! This is our size
        return currentSize;
      }
    };

    // Start with 90px and work down (match VerseByVerseView)
    const finalSize = recursiveResize(85);

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
    return (
      <WelcomeScreen
        backgroundGradients={backgroundGradients}
        selectedGradient={selectedGradient}
        getBaseFontSize={getBaseFontSize}
        getEffectiveFontFamily={getEffectiveFontFamily}
      />
    );
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
        />
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

      <AmbientEffects />
    </div>
  );
};

export default BiblePresentationDisplay;
