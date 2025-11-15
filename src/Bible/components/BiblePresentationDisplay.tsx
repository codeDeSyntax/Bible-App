import React, { useEffect, useState, useRef, useCallback } from "react";
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

  // Refs for auto-sizing
  const verseContentRef = useRef<HTMLDivElement>(null);
  const verseContainerRef = useRef<HTMLDivElement>(null);

  // Auto-sizing state
  const [autoFontSize, setAutoFontSize] = useState(60);
  const [isResizing, setIsResizing] = useState(false);
  const presentationAutoSize = useAppSelector(
    (state) => state.bible.presentationAutoSize
  );

  // Auto-resize function using simple recursive approach (like VerseByVerseView)
  const resizeToFit = useCallback(() => {
    if (!verseContentRef.current || !verseContainerRef.current || isResizing)
      return;

    setIsResizing(true);

    const content = verseContentRef.current;
    const container = verseContainerRef.current;

    console.log("🔍 Starting presentation resize - container dimensions:", {
      containerHeight: container.clientHeight,
      containerWidth: container.clientWidth,
      contentText: content.textContent?.substring(0, 50) + "...",
    });

    // Simple recursive approach: start big and reduce until it fits
    const recursiveResize = (currentSize: number): number => {
      // Apply the font size
      content.style.fontSize = `${currentSize}px`;

      // Set line height based on font size (tighter for larger fonts)
      let lineHeight;
      if (currentSize >= 85) {
        lineHeight = 1.3;
      } else if (currentSize >= 75) {
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

    // Start with 100px and work down
    const finalSize = recursiveResize(85);

    // Update state
    setAutoFontSize(finalSize);
    setIsResizing(false);

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

      // Wait for Framer Motion transition to complete (600ms total)
      // Transition duration is 400ms + stagger delay up to 200ms
      const timer = setTimeout(resizeToFit, 650);
      return () => clearTimeout(timer);
    }
  }, [
    currentVerseIndex,
    currentBook,
    currentChapter,
    // Don't include currentVerses directly to avoid frequent updates
    resizeToFit,
  ]);

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
      <LiveBorder />

      <BackgroundRenderer
        projectionBackgroundImage={projectionBackgroundImage}
        projectionGradientColors={projectionGradientColors}
        projectionBackgroundColor={projectionBackgroundColor}
        isBackgroundLoading={isBackgroundLoading}
      />

      <div
        ref={contentRef}
        className="relative z-10 w-full h-full flex flex-col justify-center items-center px-6 overflow-y-auto no-scrollbar"
        style={{ minHeight: "100vh" }}
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

      <ControlPanel
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
      />

      <AmbientEffects />
    </div>
  );
};

export default BiblePresentationDisplay;
