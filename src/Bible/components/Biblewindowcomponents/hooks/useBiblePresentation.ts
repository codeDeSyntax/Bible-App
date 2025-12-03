// Custom hook for Bible presentation logic
import { useEffect, useState, useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setCurrentTranslation,
  TRANSLATIONS,
  setSelectedBackground,
  setStandaloneFontMultiplier,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

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

export const useBiblePresentation = (
  initialData?: BiblePresentationDisplayProps["initialData"],
  initialSettings?: BiblePresentationDisplayProps["initialSettings"]
) => {
  const dispatch = useAppDispatch();
  const { getCurrentChapterVerses, initializeBibleData } = useBibleOperations();

  // Redux selectors
  const projectionFontSize = useAppSelector(
    (state) => state.bible.projectionFontSize
  );
  const projectionFontFamily = useAppSelector(
    (state) => state.bible.projectionFontFamily
  );
  const projectionBackgroundColor = useAppSelector(
    (state) => state.bible.projectionBackgroundColor
  );
  const projectionGradientColors = useAppSelector(
    (state) => state.bible.projectionGradientColors
  );
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage
  );
  const projectionTextColor = useAppSelector(
    (state) => state.bible.projectionTextColor
  );

  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const selectedBackground = useAppSelector(
    (state) => state.bible.selectedBackground
  );
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const standaloneFontMultiplier = useAppSelector(
    (state) => state.bible.standaloneFontMultiplier
  );

  // Local state
  const [settings, setSettings] = useState(
    initialSettings || {
      fontSize: 6,
      textColor: "#ffffff",
      backgroundColor: "#1e293b",
      versesPerSlide: 1,
    }
  );
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isTranslationSwitching, setIsTranslationSwitching] = useState(false);
  const [showScriptureReference, setShowScriptureReference] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [backgroundLoadingTimeout, setBackgroundLoadingTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [useImageBackground, setUseImageBackground] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Helper functions to get effective settings based on sharing configuration
  const getEffectiveFontSize = useCallback(() => {
    // Bible display always uses typography settings (projectionFontSize)
    // regardless of sharing state
    return projectionFontSize;
  }, [projectionFontSize]);

  const getEffectiveFontFamily = useCallback(() => {
    // Bible display always uses typography settings (projectionFontFamily)
    // regardless of sharing state
    // Quote font names with spaces for proper CSS syntax
    const fontFamily = projectionFontFamily;
    if (fontFamily.includes(" ")) {
      return `"${fontFamily}"`;
    }
    return fontFamily;
  }, [projectionFontFamily]);

  const getEffectiveTextColor = useCallback(() => {
    // Bible display always uses typography settings (projectionTextColor)
    // regardless of sharing state
    return projectionTextColor;
  }, [projectionTextColor]);

  // Available translations
  const availableTranslations = Object.keys(TRANSLATIONS);

  // Background gradient options
  const backgroundGradients = [
    "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900",
    "bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900",
    "bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900",
    "bg-gradient-to-br from-amber-900 via-orange-900 to-red-900",
    "bg-gradient-to-br from-gray-900 via-zinc-900 to-black",
    "bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900",
    "bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900",
    "bg-gradient-to-br from-red-900 via-pink-800 to-rose-900",
    "bg-gradient-to-br from-yellow-900 via-amber-800 to-orange-900",
    "bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900",
    "bg-gradient-to-br from-cyan-900 via-teal-800 to-green-900",
    "bg-gradient-to-br from-pink-900 via-rose-800 to-red-900",
  ];

  // Base font size calculation
  const baseFontSize = getEffectiveFontSize();

  // Helper functions for localStorage
  const getLocalStorageItem = useCallback(
    (key: string, defaultValue: string | null = null) => {
      try {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
      } catch (error) {
        console.error(`Error accessing localStorage for key ${key}:`, error);
        return defaultValue;
      }
    },
    []
  );

  const setLocalStorageItem = useCallback((key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
    }
  }, []);

  // Base font size for the presenter
  const getBaseFontSize = useCallback(
    () => `${getEffectiveFontSize()}px`,
    [getEffectiveFontSize]
  );

  // Get current verses to display
  const getCurrentVerses = useCallback(() => {
    let verses = getCurrentChapterVerses();

    if (!verses.length && initialData?.verses) {
      console.log("Using fallback verses from initialData");
      verses = initialData.verses;
    }

    if (!verses.length) return [];

    const startIndex = currentVerseIndex;
    const endIndex = Math.min(
      startIndex + settings.versesPerSlide,
      verses.length
    );

    const displayedVerses = verses.slice(startIndex, endIndex);

    console.log("📖 Projection getCurrentVerses:", {
      currentVerseIndex,
      startIndex,
      endIndex,
      versesPerSlide: settings.versesPerSlide,
      totalVerses: verses.length,
      displayedVerses: displayedVerses.map((v) => ({
        verse: v.verse,
        text: v.text.substring(0, 30) + "...",
      })),
    });

    return displayedVerses;
  }, [
    getCurrentChapterVerses,
    currentVerseIndex,
    settings.versesPerSlide,
    initialData?.verses,
  ]);

  // Get font family class
  const getFontFamilyClass = useCallback(() => {
    const currentFontFamily = getEffectiveFontFamily();

    switch (currentFontFamily) {
      case "garamond":
      case "Garamond":
        return "font-garamond";
      case "'Georgia', serif":
      case "Georgia":
        return "font-serif";
      case "serif":
        return "font-serif";
      case "sans-serif":
        return "font-sans";
      case "Palatino":
        return "font-serif";
      case "'Impact', Charcoal, sans-serif":
      case "Impact":
        return "font-sans font-black";
      case "Comic Sans MS":
        return "font-sans";
      case "Trebuchet MS":
        return "font-sans";
      case "Arial Black":
      case "'Arial', sans-serif":
      case "Arial":
        return "font-sans font-black";
      case "cursive":
        return "font-serif";
      case "'Times New Roman', Times, serif":
      case "Times New Roman":
        return "font-serif";
      case "'Helvetica', sans-serif":
      case "Helvetica":
        return "font-sans";
      case "'Courier New', Courier, monospace":
      case "Courier New":
        return "font-mono";
      case "'Verdana', sans-serif":
      case "Verdana":
        return "font-sans";
      default:
        return "font-bitter";
    }
  }, [getEffectiveFontFamily]);

  // Calculate optimal font size based on content
  const calculateOptimalFontSize = useCallback(
    (verses: Array<{ verse: number; text: string }>) => {
      if (!contentRef.current || !verses.length) return baseFontSize;

      const container = contentRef.current;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      const targetHeight = containerHeight * 0.8;
      const targetWidth = containerWidth * 0.9;

      let testSize = baseFontSize;
      const maxSize = Math.min(containerHeight * 0.25, 300);
      const minSize = 20;

      const temp = document.createElement("div");
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      temp.style.width = targetWidth + "px";
      temp.style.fontFamily = "Georgia, serif";
      temp.style.lineHeight = "1.4";
      temp.style.padding = "0";
      temp.style.margin = "0";
      document.body.appendChild(temp);

      const testContent = verses.map((v) => v.text).join(" ");

      temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;

      let iterations = 0;
      while (iterations < 50) {
        const testHeight = temp.scrollHeight;

        if (testHeight <= targetHeight && testSize <= maxSize) {
          testSize += 2;
          temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;
        } else if (testHeight > targetHeight && testSize > minSize) {
          testSize -= 2;
          temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;
        } else {
          break;
        }
        iterations++;
      }

      document.body.removeChild(temp);
      return Math.max(minSize, Math.min(maxSize, testSize));
    },
    [baseFontSize, standaloneFontMultiplier]
  );

  // Font size adjustment functions
  const increaseFontSize = useCallback(() => {
    const newMultiplier = standaloneFontMultiplier + 0.1;
    dispatch(setStandaloneFontMultiplier(newMultiplier));
  }, [standaloneFontMultiplier, dispatch]);

  const decreaseFontSize = useCallback(() => {
    if (standaloneFontMultiplier > 0.1) {
      const newMultiplier = standaloneFontMultiplier - 0.1;
      dispatch(setStandaloneFontMultiplier(newMultiplier));
    }
  }, [standaloneFontMultiplier, dispatch]);

  // Translation switching function
  const switchTranslation = useCallback(async () => {
    if (isTranslationSwitching) return;

    setIsTranslationSwitching(true);

    try {
      const currentIndex = availableTranslations.indexOf(currentTranslation);
      const nextIndex = (currentIndex + 1) % availableTranslations.length;
      const nextTranslation = availableTranslations[nextIndex];

      console.log("Switching from", currentTranslation, "to", nextTranslation);
      dispatch(setCurrentTranslation(nextTranslation));
    } catch (error) {
      console.error("Error switching translation:", error);
    } finally {
      setTimeout(() => {
        setIsTranslationSwitching(false);
      }, 300);
    }
  }, [
    currentTranslation,
    dispatch,
    availableTranslations,
    isTranslationSwitching,
  ]);

  // Gradient selection function
  const selectGradient = useCallback(
    (gradientIndex: number) => {
      setSelectedGradient(gradientIndex);
      setUseImageBackground(false);
      setLocalStorageItem("bibleUseImageBackground", "false");
    },
    [setLocalStorageItem]
  );

  // Image background selection function
  const selectImageBackground = useCallback(
    (imageSrc?: string) => {
      const imageToUse = imageSrc || selectedBackground;
      if (imageToUse) {
        setBackgroundImage(imageToUse);
        setUseImageBackground(true);
        setLocalStorageItem("bibleUseImageBackground", "true");

        if (imageToUse !== selectedBackground) {
          dispatch(setSelectedBackground(imageToUse));
        }
      }
    },
    [selectedBackground, dispatch, setLocalStorageItem]
  );

  // Select specific background image
  const selectSpecificBackground = useCallback(
    (imageSrc: string) => {
      selectImageBackground(imageSrc);
    },
    [selectImageBackground]
  );

  // Control panel toggle function
  const toggleControlPanel = useCallback(() => {
    setIsControlPanelVisible((prev) => !prev);
  }, []);

  // Handle mouse enter/leave for scripture reference
  const handleMouseEnterTopRegion = useCallback(() => {
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    setShowScriptureReference(true);
  }, [hoverTimeoutId]);

  const handleMouseLeaveTopRegion = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setShowScriptureReference(false);
    }, 1000);
    setHoverTimeoutId(timeoutId);
  }, []);

  return {
    // State
    settings,
    setSettings,
    currentVerseIndex,
    setCurrentVerseIndex,
    isTranslationSwitching,
    showScriptureReference,
    isControlPanelVisible,
    isBackgroundLoading,
    setIsBackgroundLoading,
    backgroundImage,
    setBackgroundImage,
    selectedGradient,
    useImageBackground,
    setUseImageBackground,
    contentRef,
    hoverTimeoutId,
    setHoverTimeoutId,
    backgroundLoadingTimeout,
    setBackgroundLoadingTimeout,

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
    bibleData,
    bibleBgs,
    selectedBackground,
    standaloneFontMultiplier,
    fontSize,
    fontFamily,
    fontWeight,

    // Computed values
    availableTranslations,
    backgroundGradients,
    baseFontSize,

    // Functions
    getEffectiveFontSize,
    getEffectiveFontFamily,
    getEffectiveTextColor,
    getLocalStorageItem,
    setLocalStorageItem,
    getBaseFontSize,
    getCurrentVerses,
    getFontFamilyClass,
    calculateOptimalFontSize,
    increaseFontSize,
    decreaseFontSize,
    switchTranslation,
    selectGradient,
    selectImageBackground,
    selectSpecificBackground,
    toggleControlPanel,
    handleMouseEnterTopRegion,
    handleMouseLeaveTopRegion,

    // Hooks
    getCurrentChapterVerses,
    initializeBibleData,
    dispatch,

    // Initial data
    initialData,
  };
};
