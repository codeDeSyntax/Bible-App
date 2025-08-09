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
} from "@/store/slices/bibleSlice";
import { setBibleBgs } from "@/store/slices/appSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

// Import the modular components
import { useBiblePresentation } from "./Biblewindowcomponents/hooks/useBiblePresentation";
import { useBiblePresentationEffects } from "./Biblewindowcomponents/hooks/useBiblePresentationEffects";
import { LiveBorder } from "./Biblewindowcomponents/LiveBorder";
import { BackgroundRenderer } from "./Biblewindowcomponents/BackgroundRenderer";
import { WelcomeScreen } from "./Biblewindowcomponents/WelcomeScreen";
import { ScriptureReference } from "./Biblewindowcomponents/ScriptureReference";
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

  const currentVerses = getCurrentVerses();
  let verses = getCurrentChapterVerses();
  
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
        <ScriptureReference
          showScriptureReference={showScriptureReference}
          currentBook={currentBook}
          currentChapter={currentChapter}
          currentVerses={currentVerses}
          settings={settings}
          getFontFamilyClass={getFontFamilyClass}
          handleMouseEnterTopRegion={handleMouseEnterTopRegion}
          handleMouseLeaveTopRegion={handleMouseLeaveTopRegion}
        />

        <VerseDisplay
          currentVerseIndex={currentVerseIndex}
          currentBook={currentBook}
          currentChapter={currentChapter}
          currentVerses={currentVerses}
          useImageBackground={useImageBackground}
          settings={settings}
          getEffectiveTextColor={getEffectiveTextColor}
          getFontFamilyClass={getFontFamilyClass}
          getEffectiveFontFamily={getEffectiveFontFamily}
          getBaseFontSize={getBaseFontSize}
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
