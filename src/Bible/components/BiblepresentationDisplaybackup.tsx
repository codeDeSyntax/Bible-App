import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Debug logging to confirm component is loaded
  useEffect(() => {
    console.log("BiblePresentationDisplay component mounted");
    console.log("Window location:", window.location.href);
    console.log("Hash:", window.location.hash);
  }, []);

  // Connect to Redux store for projection settings and Bible data
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

  // Get sharing settings
  const shareSettingsWithVerseByVerse = useAppSelector(
    (state) => state.bible.shareSettingsWithVerseByVerse
  );
  const shareFontSize = useAppSelector((state) => state.bible.shareFontSize);
  const shareFontFamily = useAppSelector(
    (state) => state.bible.shareFontFamily
  );
  const shareTextColor = useAppSelector((state) => state.bible.shareTextColor);

  // Get verse-by-verse independent settings
  const verseByVerseFontSize = useAppSelector(
    (state) => state.bible.verseByVerseFontSize
  );
  const verseByVerseFontFamily = useAppSelector(
    (state) => state.bible.verseByVerseFontFamily
  );
  const verseByVerseTextColor = useAppSelector(
    (state) => state.bible.verseByVerseTextColor
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

  // Helper functions to get effective settings based on sharing configuration
  const getEffectiveFontSize = () => {
    if (shareSettingsWithVerseByVerse && shareFontSize) {
      // Use Control Room projection font size when sharing
      return projectionFontSize;
    }
    return verseByVerseFontSize;
  };

  const getEffectiveFontFamily = () => {
    if (shareSettingsWithVerseByVerse && shareFontFamily) {
      // Use Control Room projection font family when sharing
      return projectionFontFamily;
    }
    return verseByVerseFontFamily;
  };

  const getEffectiveTextColor = () => {
    if (shareSettingsWithVerseByVerse && shareTextColor) {
      // Use Control Room projection text color when sharing
      return projectionTextColor;
    }
    return verseByVerseTextColor;
  };

  // Initialize Bible data if not already loaded
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Checking Bible data initialization:", {
        bibleDataKeys: Object.keys(bibleData || {}),
        currentTranslation,
      });
    }

    if (
      currentTranslation &&
      Object.keys(TRANSLATIONS).includes(currentTranslation)
    ) {
      if (!bibleData || Object.keys(bibleData).length === 0) {
        console.log("Initializing Bible data...");
        initializeBibleData();
      }
    }
  }, [bibleData, initializeBibleData, currentTranslation]);

  // Initialize Redux state from initial data if provided, or set defaults
  useEffect(() => {
    if (initialData && process.env.NODE_ENV === "development") {
      console.log("Initializing presentation display with:", initialData);
    }

    if (initialData) {
      // Always update Redux state with initial data
      if (initialData.book !== currentBook) {
        if (process.env.NODE_ENV === "development")
          console.log("Setting book:", initialData.book);
        dispatch(setCurrentBook(initialData.book));
      }
      if (initialData.chapter !== currentChapter) {
        if (process.env.NODE_ENV === "development")
          console.log("Setting chapter:", initialData.chapter);
        dispatch(setCurrentChapter(initialData.chapter));
      }
      if (initialData.translation !== currentTranslation) {
        if (process.env.NODE_ENV === "development")
          console.log("Setting translation:", initialData.translation);
        dispatch(setCurrentTranslation(initialData.translation));
      }
    } else if (!currentBook || !currentChapter || !currentTranslation) {
      // Set defaults if no initial data and Redux state is empty
      if (process.env.NODE_ENV === "development")
        console.log("Setting default values for presentation display");
      if (!currentBook) dispatch(setCurrentBook("Genesis"));
      if (!currentChapter) dispatch(setCurrentChapter(1));
      if (!currentTranslation) dispatch(setCurrentTranslation("KJV"));
    }
  }, [initialData, dispatch, currentBook, currentChapter, currentTranslation]);
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
  // State for floating scripture reference
  const [showScriptureReference, setShowScriptureReference] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [backgroundLoadingTimeout, setBackgroundLoadingTimeout] =
    useState<NodeJS.Timeout | null>(null);

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
    }, 1000); // 1000ms (1 second) delay before hiding
    setHoverTimeoutId(timeoutId);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutId) {
        clearTimeout(hoverTimeoutId);
      }
      if (backgroundLoadingTimeout) {
        clearTimeout(backgroundLoadingTimeout);
      }
    };
  }, [hoverTimeoutId, backgroundLoadingTimeout]);

  // Monitor background changes for loading state
  useEffect(() => {
    // Show loading state when background image changes
    if (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") {
      setIsBackgroundLoading(true);

      // Clear any existing timeout
      if (backgroundLoadingTimeout) {
        clearTimeout(backgroundLoadingTimeout);
      }

      // Set timeout to hide loading state
      const timeout = setTimeout(() => {
        setIsBackgroundLoading(false);
      }, 1000); // Hide after 1 second

      setBackgroundLoadingTimeout(timeout);
    } else {
      setIsBackgroundLoading(false);
    }
  }, [projectionBackgroundImage]);

  // Local state for background management (using Redux for persistence but local for UI)
  const [backgroundImage, setBackgroundImage] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [useImageBackground, setUseImageBackground] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Available translations
  const availableTranslations = Object.keys(TRANSLATIONS);

  // Background gradient options - expanded with more colors
  const backgroundGradients = [
    "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900", // Current default
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

  // Base font size calculation - use effective font size based on sharing settings
  const baseFontSize = getEffectiveFontSize();

  // Helper functions for localStorage
  const getLocalStorageItem = (
    key: string,
    defaultValue: string | null = null
  ) => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch (error) {
      console.error(`Error accessing localStorage for key ${key}:`, error);
      return defaultValue;
    }
  };

  const setLocalStorageItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
    }
  };

  // Load settings from localStorage - simplified to only handle background settings
  useEffect(() => {
    // Font multiplier is now handled by Redux, no need to load from localStorage

    // Always use selectedBackground from Redux store (same as VerseByVerseView)
    if (selectedBackground) {
      setBackgroundImage(selectedBackground);
    }

    const savedUseImage = getLocalStorageItem(
      "bibleUseImageBackground",
      "false"
    );
    setUseImageBackground(savedUseImage === "true");
  }, [selectedBackground]);

  // Load background images from custom directory if not already loaded
  useEffect(() => {
    const loadBackgroundImages = async () => {
      // Only load if we don't have images yet
      if (bibleBgs.length === 0) {
        const customImagesPath = localStorage.getItem("bibleCustomImagesPath");
        try {
          if (customImagesPath) {
            console.log(
              "BiblePresentationDisplay: Loading custom images from:",
              customImagesPath
            );
            const images = await window.api.getImages(customImagesPath);
            console.log(
              "BiblePresentationDisplay: Loaded",
              images.length,
              "custom images"
            );
            dispatch(setBibleBgs(images));
          } else {
            // Load default backgrounds if no custom path
            const defaultBackgrounds = [
              "./wood2.jpg",
              "./snow1.jpg",
              "./wood6.jpg",
              "./wood7.png",
              "./pic2.jpg",
              "./wood10.jpg",
              "./wood11.jpg",
            ];
            console.log(
              "BiblePresentationDisplay: Loading default backgrounds"
            );
            dispatch(setBibleBgs(defaultBackgrounds));
          }
        } catch (error) {
          console.error(
            "BiblePresentationDisplay: Failed to load background images:",
            error
          );
          // Load default backgrounds if loading fails
          const defaultBackgrounds = [
            "./wood2.jpg",
            "./snow1.jpg",
            "./wood6.jpg",
            "./wood7.png",
            "./pic2.jpg",
            "./wood10.jpg",
            "./wood11.jpg",
          ];
          dispatch(setBibleBgs(defaultBackgrounds));
        }
      }
    };

    loadBackgroundImages();
  }, [dispatch, bibleBgs.length]);

  // Base font size for the presenter - independent of main Bible font size
  // Use projection settings from Redux instead of local state for main styling
  const getBaseFontSize = () => `${getEffectiveFontSize()}px`; // Use effective font size based on sharing settings

  // Dynamic background based on projection settings
  const getBackgroundStyle = () => {
    console.log("BiblePresentationDisplay: getBackgroundStyle called with:", {
      projectionBackgroundImage,
      projectionGradientColors,
      projectionBackgroundColor,
    });

    // Priority order: Image -> Gradient -> Solid color
    if (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") {
      let imageUrl = projectionBackgroundImage;

      // Handle different image path formats
      if (projectionBackgroundImage.startsWith("./")) {
        // Relative path from public folder (e.g., "./wood2.jpg")
        imageUrl = projectionBackgroundImage;
      } else if (projectionBackgroundImage.match(/^[A-Za-z]:\\/)) {
        // Absolute Windows path (e.g., "C:\Users\...")
        imageUrl = `file:///${projectionBackgroundImage.replace(/\\/g, "/")}`;
      } else if (projectionBackgroundImage.startsWith("/")) {
        // Absolute Unix path (e.g., "/home/user/...")
        imageUrl = `file://${projectionBackgroundImage}`;
      } else if (
        !projectionBackgroundImage.startsWith("http") &&
        !projectionBackgroundImage.startsWith("file://")
      ) {
        // Assume it's a relative path and try as-is first, then as file protocol
        imageUrl = projectionBackgroundImage;
      }

      const style = {
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // Add transition for smooth background changes
        transition: "background-image 0.3s ease-in-out",
      };
      console.log("BiblePresentationDisplay: Using background image:", {
        original: projectionBackgroundImage,
        processed: imageUrl,
        style,
      });
      return style;
    } else if (
      projectionGradientColors &&
      projectionGradientColors.length >= 2
    ) {
      const style = {
        background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
        transition: "background 0.3s ease-in-out",
      };
      console.log(
        "BiblePresentationDisplay: Using gradient background:",
        style
      );
      return style;
    } else {
      const style = {
        backgroundColor: projectionBackgroundColor || "#1e293b",
        transition: "background-color 0.3s ease-in-out",
      };
      console.log("BiblePresentationDisplay: Using solid background:", style);
      return style;
    }
  };

  // Get current verses to display - now from Redux via useBibleOperations with fallback to initialData
  const getCurrentVerses = useCallback(() => {
    let verses = getCurrentChapterVerses();

    // Fallback to initialData if Redux doesn't have verses yet
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

    return verses.slice(startIndex, endIndex);
  }, [
    getCurrentChapterVerses,
    currentVerseIndex,
    settings.versesPerSlide,
    initialData?.verses,
  ]);

  const currentVerses = getCurrentVerses();

  // Calculate dynamic text size based on text length (same as PresentationOverlay and VerseByVerseView)
  const getTextSizeClass = (text: string) => {
    const textLength = text.length;

    if (textLength > 400) return "text-2xl sm:text-3xl md:text-5xl lg:text-5xl";
    if (textLength > 200) return "text-3xl sm:text-4xl md:text-5xl lg:text-6xl";
    return "text-3xl sm:text-4xl md:text-6xl lg:text-7xl";
  };

  // Get font family class - match the in-app Bible presenter exactly
  const getFontFamilyClass = () => {
    const currentFontFamily = getEffectiveFontFamily(); // Use effective font family based on sharing settings

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
        return "font-bitter"; // Default to bitter like PresentationOverlay
    }
  };

  // Calculate optimal font size based on content
  const calculateOptimalFontSize = useCallback(
    (verses: Array<{ verse: number; text: string }>) => {
      if (!contentRef.current || !verses.length) return baseFontSize;

      const container = contentRef.current;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      // Target 80% of screen height for content
      const targetHeight = containerHeight * 0.8;
      const targetWidth = containerWidth * 0.9;

      // Test different font sizes
      let testSize = baseFontSize;
      const maxSize = Math.min(containerHeight * 0.25, 300);
      const minSize = 20;

      // Create temporary element for measurement
      const temp = document.createElement("div");
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      temp.style.width = targetWidth + "px";
      temp.style.fontFamily = "Georgia, serif";
      temp.style.lineHeight = "1.4";
      temp.style.padding = "0";
      temp.style.margin = "0";
      document.body.appendChild(temp);

      // Test current verse content
      const testContent = verses.map((v) => v.text).join(" ");

      temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;

      let iterations = 0;
      while (iterations < 50) {
        const testHeight = temp.scrollHeight;

        if (testHeight <= targetHeight && testSize <= maxSize) {
          // Try larger
          testSize += 2;
          temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;
        } else if (testHeight > targetHeight && testSize > minSize) {
          // Go smaller
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
    [standaloneFontMultiplier]
  );

  const optimalFontSize = calculateOptimalFontSize(currentVerses);

  // Font size adjustment functions - now using Redux
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

  // Translation switching function - now uses Redux like the main app
  const switchTranslation = useCallback(async () => {
    if (isTranslationSwitching) return;

    setIsTranslationSwitching(true);

    try {
      const currentIndex = availableTranslations.indexOf(currentTranslation);
      const nextIndex = (currentIndex + 1) % availableTranslations.length;
      const nextTranslation = availableTranslations[nextIndex];

      console.log("Switching from", currentTranslation, "to", nextTranslation);

      // Dispatch Redux action to update translation
      dispatch(setCurrentTranslation(nextTranslation));
    } catch (error) {
      console.error("Error switching translation:", error);
    } finally {
      // Add a small delay to show the loading state
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
  const selectGradient = useCallback((gradientIndex: number) => {
    setSelectedGradient(gradientIndex);
    setUseImageBackground(false);
    setLocalStorageItem("bibleUseImageBackground", "false");
  }, []);

  // Image background selection function
  const selectImageBackground = useCallback(
    (imageSrc?: string) => {
      const imageToUse = imageSrc || selectedBackground;
      if (imageToUse) {
        setBackgroundImage(imageToUse);
        setUseImageBackground(true);
        setLocalStorageItem("bibleUseImageBackground", "true");

        // Update Redux store with the selected background if it's different
        if (imageToUse !== selectedBackground) {
          dispatch(setSelectedBackground(imageToUse));
        }
      }
    },
    [selectedBackground, dispatch]
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

  // Real-time updates for font changes from Redux store
  useEffect(() => {
    // This effect will trigger whenever fontFamily, fontWeight, or fontSize changes in Redux
    // No need for additional polling since Redux updates are immediate
  }, [fontFamily, fontWeight, fontSize]);

  // Reset verse index when book or chapter changes (from live updates)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Book/Chapter changed, resetting verse index");
    }
    setCurrentVerseIndex(0);
  }, [currentBook, currentChapter]);

  // Real-time background image and font updates - sync with localStorage changes and Redux
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bibleFontMultiplier" && e.newValue) {
        dispatch(setStandaloneFontMultiplier(parseFloat(e.newValue) || 1.0));
      }
      if (e.key === "bibleUseImageBackground" && e.newValue) {
        setUseImageBackground(e.newValue === "true");
      }
    };

    // Check for changes every second to sync with localStorage and Redux
    const changeCheck = setInterval(() => {
      // Always sync selectedBackground from Redux store
      if (selectedBackground && selectedBackground !== backgroundImage) {
        setBackgroundImage(selectedBackground);
      }

      // Font multiplier is now handled by Redux, no need to check localStorage
      // Redux will automatically update when the state changes

      const currentUseImage = getLocalStorageItem(
        "bibleUseImageBackground",
        "false"
      );
      if ((currentUseImage === "true") !== useImageBackground) {
        setUseImageBackground(currentUseImage === "true");
      }
    }, 1000);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(changeCheck);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [
    selectedBackground,
    backgroundImage,
    standaloneFontMultiplier,
    useImageBackground,
    dispatch,
  ]);

  // Listen for IPC messages if in Electron context
  useEffect(() => {
    if (typeof window !== "undefined" && window.ipcRenderer) {
      const handleBiblePresentationUpdate = (event: any, data: any) => {
        switch (data.type) {
          case "update-data":
            // Handle live updates from main app
            if (process.env.NODE_ENV === "development") {
              console.log("Received live update from main app:", data.data);
            }

            // Check if this is just a verse change (same book/chapter)
            const isSameBookChapter =
              data.data.book === currentBook &&
              data.data.chapter === currentChapter &&
              data.data.translation === currentTranslation;

            // Update Redux state with the new data
            if (data.data.book !== currentBook) {
              dispatch(setCurrentBook(data.data.book));
            }
            if (data.data.chapter !== currentChapter) {
              dispatch(setCurrentChapter(data.data.chapter));
            }
            if (data.data.translation !== currentTranslation) {
              dispatch(setCurrentTranslation(data.data.translation));
            }

            // Always update the verse index if selectedVerse is provided
            if (data.data.selectedVerse !== undefined) {
              const verseIndex = Math.max(0, data.data.selectedVerse - 1); // Convert to 0-based index
              setCurrentVerseIndex(verseIndex);
            } else if (!isSameBookChapter) {
              // Reset to first verse only when book/chapter changes and no specific verse is provided
              setCurrentVerseIndex(0);
            }
            break;
          case "update-settings":
            setSettings((prev) => ({ ...prev, ...data.data }));
            // Also handle fontMultiplier in Redux
            if (data.data.fontMultiplier) {
              dispatch(setStandaloneFontMultiplier(data.data.fontMultiplier));
            }
            break;
          case "navigate":
            // Handle navigation updates from main Bible view
            if (data.data.book && data.data.chapter) {
              // Check if book or chapter changed
              const needsBookUpdate = data.data.book !== currentBook;
              const needsChapterUpdate = data.data.chapter !== currentChapter;
              const needsTranslationUpdate =
                data.data.translation &&
                data.data.translation !== currentTranslation;

              // Update Redux state if needed
              if (needsTranslationUpdate) {
                dispatch(setCurrentTranslation(data.data.translation));
              }
              if (needsBookUpdate) {
                dispatch(setCurrentBook(data.data.book));
              }
              if (needsChapterUpdate) {
                dispatch(setCurrentChapter(data.data.chapter));
              }

              // Handle verse navigation
              if (data.data.verse !== undefined && data.data.verse !== null) {
                // Navigate to specific verse (1-based to 0-based index)
                const verseIndex = Math.max(0, data.data.verse - 1);
                setCurrentVerseIndex(verseIndex);
              } else if (needsBookUpdate || needsChapterUpdate) {
                // Reset to first verse when book/chapter changes without specific verse
                setCurrentVerseIndex(0);
              }

              console.log("Bible projection navigated:", {
                book: data.data.book,
                chapter: data.data.chapter,
                verse: data.data.verse,
                verseIndex: data.data.verse ? data.data.verse - 1 : 0,
              });
            } else {
              // Handle direction-based navigation
              if (data.data.direction === "next") {
                setCurrentVerseIndex((prev) =>
                  Math.min(prev + 1, getCurrentChapterVerses().length - 1)
                );
              } else if (data.data.direction === "prev") {
                setCurrentVerseIndex((prev) => Math.max(prev - 1, 0));
              } else if (data.data.direction === "goto") {
                setCurrentVerseIndex(data.data.index || 0);
              }
            }
            break;
          case "updateStyle":
            // Handle style updates from control room
            console.log(
              "BiblePresentationDisplay: Received style update",
              data.data
            );
            if (data.data.fontSize) {
              dispatch(setProjectionFontSize(data.data.fontSize));
            }
            if (data.data.fontFamily) {
              dispatch(setProjectionFontFamily(data.data.fontFamily));
            }
            if (data.data.backgroundColor) {
              dispatch(setProjectionBackgroundColor(data.data.backgroundColor));
            }
            if (data.data.gradientColors) {
              dispatch(setProjectionGradientColors(data.data.gradientColors));
              // Clear background image when setting gradient
              if (data.data.gradientColors.length > 0) {
                dispatch(setProjectionBackgroundImage(""));
              }
            }
            if (data.data.backgroundImage !== undefined) {
              dispatch(setProjectionBackgroundImage(data.data.backgroundImage));
              // Clear gradients when setting background image
              if (data.data.backgroundImage !== "") {
                dispatch(setProjectionGradientColors([]));
              }
            }
            if (data.data.textColor) {
              dispatch(setProjectionTextColor(data.data.textColor));
            }
            if (data.data.fontMultiplier) {
              dispatch(setStandaloneFontMultiplier(data.data.fontMultiplier));
            }
            console.log(
              "BiblePresentationDisplay: Style update applied, current state:",
              {
                backgroundImage: data.data.backgroundImage,
                gradientColors: data.data.gradientColors,
              }
            );
            break;
        }
      };

      // Listen for updates from main process
      window.ipcRenderer.on(
        "bible-presentation-update",
        handleBiblePresentationUpdate
      );

      return () => {
        window.ipcRenderer.off(
          "bible-presentation-update",
          handleBiblePresentationUpdate
        );
      };
    }
  }, [
    getCurrentChapterVerses,
    dispatch,
    currentBook,
    currentChapter,
    currentTranslation,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+H for control panel toggle
      if (e.ctrlKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        toggleControlPanel();
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          setCurrentVerseIndex((prev) => {
            const verses = getCurrentChapterVerses();
            return Math.min(prev + 1, verses.length - 1);
          });
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentVerseIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          setCurrentVerseIndex(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentVerseIndex(() => {
            const verses = getCurrentChapterVerses();
            return verses.length - 1;
          });
          break;
        case "=":
        case "+":
          e.preventDefault();
          increaseFontSize();
          break;
        case "-":
        case "_":
          e.preventDefault();
          decreaseFontSize();
          break;
        case "t":
        case "T":
          e.preventDefault();
          switchTranslation();
          break;
        case "Escape":
          e.preventDefault();
          // Focus the main window
          if (
            typeof window !== "undefined" &&
            window.api &&
            window.api.focusMainWindow
          ) {
            window.api.focusMainWindow().catch(console.error);
          }
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          const gradientIndex = parseInt(e.key) - 1;
          if (
            gradientIndex >= 0 &&
            gradientIndex < backgroundGradients.length
          ) {
            selectGradient(gradientIndex);
          }
          break;
        case "0":
          e.preventDefault();
          // Key '0' selects gradient index 9 (10th gradient)
          if (9 < backgroundGradients.length) {
            selectGradient(9);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    increaseFontSize,
    decreaseFontSize,
    switchTranslation,
    selectGradient,
    toggleControlPanel,
    backgroundGradients.length,
    getCurrentChapterVerses,
  ]);

  // Auto-adjust font size on content change - removed restrictions
  useEffect(() => {
    // This effect is now minimal since we allow unlimited font size
    // and rely on scrolling for overflow content
  }, [currentVerseIndex, getCurrentChapterVerses, standaloneFontMultiplier]);

  // Check if we have any verses to display
  let verses = getCurrentChapterVerses();

  // Fallback to initialData if Redux doesn't have verses yet
  if (!verses.length && initialData?.verses) {
    verses = initialData.verses;
  }

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("BiblePresentationDisplay State:", {
        currentTranslation,
        currentBook,
        currentChapter,
        bibleDataKeys: Object.keys(bibleData || {}),
        versesFromRedux: getCurrentChapterVerses().length,
        versesFromInitialData: initialData?.verses?.length || 0,
        finalVersesLength: verses.length,
        currentVerseIndex,
      });
    }
  }, [
    currentTranslation,
    currentBook,
    currentChapter,
    bibleData,
    verses.length,
    initialData,
    getCurrentChapterVerses,
    currentVerseIndex,
  ]);
  if (!verses.length) {
    return (
      <div className="w-full h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className={`w-full h-full ${backgroundGradients[selectedGradient]}`}
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Welcome Content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-6xl"
          >
            <div className="relative">
              <h1
                style={{
                  fontSize: `calc(${getBaseFontSize()} * 2.5)`,
                  textShadow:
                    "0 6px 30px rgba(0,0,0,0.9), 0 3px 12px rgba(0,0,0,0.7)",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #dbeafe 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  // lineHeight: "1.4",
                  fontWeight: "bold",
                  fontFamily: getEffectiveFontFamily(),
                }}
                className={`text-3xl drop-shadow-2xl mb-6 truncate `}
              >
                The Word
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`text-white/80 font-light tracking-wide truncate text-2xl `}
                style={{
                  fontFamily: getEffectiveFontFamily(),
                  fontWeight: "normal",
                }}
              >
                Waiting for Scripture...
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* Live Red Border - Solid border around entire window */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {/* Main red border */}
        <div className="absolute inset-0 border-1 border-opacity-45 border-dashed border-red-500 shadow-lg shadow-red-500/30"></div>
      </div>

      {/* Thin White Liquid Overlay */}
      {/* <div className="absolute inset-0 z-40 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.1) 20%, 
              rgba(255, 255, 255, 0.3) 40%, 
              rgba(255, 255, 255, 0.4) 50%, 
              rgba(255, 255, 255, 0.3) 60%, 
              rgba(255, 255, 255, 0.1) 80%, 
              transparent 100%)`,
            backgroundSize: "100% 100%",
            animation: "liquidFlow 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(270deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.05) 30%, 
              rgba(255, 255, 255, 0.15) 50%, 
              rgba(255, 255, 255, 0.05) 70%, 
              transparent 100%)`,
            backgroundSize: "200% 100%",
            animation: "liquidFlow 3s ease-in-out infinite reverse",
          }}
        />
      </div> */}

      {/* Enhanced Background - Using Redux projection settings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full" style={getBackgroundStyle()} />

        {/* Background Loading Overlay */}
        {isBackgroundLoading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white font-medium">
                  Loading Background...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Overlay effects for depth - adaptive based on background type */}
        {projectionBackgroundImage &&
        projectionBackgroundImage.trim() !== "" ? (
          <>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent" />
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/15" />
          </>
        )}
      </div>

      {/* Main Content - improved layout to keep text centered at large font sizes */}
      <div
        ref={contentRef}
        className="relative z-10 w-full h-full flex flex-col justify-center items-center px-6 overflow-y-auto no-scrollbar"
        style={{
          minHeight: "100vh",
        }}
      >
        {/* Hover Detection Area for Scripture Reference - Extended Top Region */}
        <div
          className="fixed top-0 left-0 w-full h-40 z-30"
          onMouseEnter={handleMouseEnterTopRegion}
          onMouseLeave={handleMouseLeaveTopRegion}
        />

        {/* Additional Detection Area specifically around where the UI appears */}
        <div
          className="fixed top-0 left-0 w-96 h-32 z-30"
          onMouseEnter={handleMouseEnterTopRegion}
          onMouseLeave={handleMouseLeaveTopRegion}
        />

        {/* Floating Scripture Reference UI */}
        <AnimatePresence>
          {showScriptureReference && (
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
                scale: 0.95,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1], // Smooth easing
              }}
              className="fixed top-4 left-8 z-50"
              onMouseEnter={handleMouseEnterTopRegion}
              onMouseLeave={handleMouseLeaveTopRegion}
            >
              {/* Simple White Container */}
              <div
                className="bg-white rounded-full px-6  shadow-2xl border border-gray-200"
                onMouseEnter={handleMouseEnterTopRegion}
                onMouseLeave={handleMouseLeaveTopRegion}
              >
                {/* Scripture Reference Content */}
                <h3
                  className={`text-gray-800 font-bold tracking-wide ${getFontFamilyClass()} font-impact`}
                  style={{
                    fontSize: "3rem",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {currentBook} {currentChapter}:
                  <span className="font-normal ml-2">
                    {currentVerses.length > 0
                      ? settings.versesPerSlide === 1
                        ? currentVerses[0]?.verse
                        : `${currentVerses[0]?.verse}-${
                            currentVerses[currentVerses.length - 1]?.verse
                          }`
                      : "1"}
                  </span>
                </h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Verse Display - improved centering for large fonts with top visibility */}
        <div className="flex-1 flex items-start justify-center w-full min-h-[90vh] pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentVerseIndex}-${currentBook}-${currentChapter}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{
                duration: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="verse-content text-center w-full flex flex-col items-center justify-start max-w-[90vw]"
            >
              {/* Content Background Effect - no blur for image backgrounds */}
              <div
                className={`absolute inset-0 -m-12 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/10 ${
                  useImageBackground ? "" : "backdrop-blur-0"
                }`}
              />

              {/* Verses Container - aligned to top to prevent cutoff */}
              <div className="relative z-10 w-full flex flex-col items-center justify-start max-w-[85vw] mx-auto">
                {currentVerses.map((verse, index) => (
                  <motion.div
                    key={verse.verse}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: index * 0.1 + 0.2,
                      duration: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="w-full flex flex-col items-center justify-start mb-4"
                  >
                    {/* Verse Text - aligned to top to prevent cutoff */}
                    <div className="w-full text-center">
                      <p
                        className={`tracking-wide drop-shadow-xl text-center leading-relaxed ${getFontFamilyClass()} break-words`}
                        style={{
                          color: getEffectiveTextColor() || "#ffffff",
                          textShadow: "0 4px 8px rgba(0,0,0,0.5)",
                          lineHeight: "1.3",
                          fontWeight: "bold",
                          fontFamily: getEffectiveFontFamily(),
                          fontSize: getBaseFontSize(),
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        <span className="font-normal italic mr-5 font-bitter text-red-500">
                          {currentVerses.length > 0
                            ? settings.versesPerSlide === 1
                              ? currentVerses[0]?.verse
                              : `${currentVerses[0]?.verse}-${
                                  currentVerses[currentVerses.length - 1]?.verse
                                }`
                            : "1"}
                        </span>
                        {verse.text}
                      </p>
                    </div>
                  </motion.div>
                ))}{" "}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Compact Control Panel - Conditionally Visible - KEPT FOR TRANSLATION AND SCRIPTURE REFERENCE ONLY */}
      <AnimatePresence>
        {isControlPanelVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="absolute bottom-4 right-4 z-30"
          >
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 px-2 py-1 shadow-lg relative">
              <div className="flex items-center justify-center space-x-2 text-xs">
                {/* Keyboard shortcuts hint */}
                <div className="text-center">
                  <span className="text-white/50 text-[8px] font-mono">
                    T=Translation • Ctrl+H=Hide • ESC=Focus Main
                  </span>
                </div>

                {/* Scripture Reference */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center">
                  <span className="text-white font-mono text-[10px]">
                    {currentBook} {currentChapter}:
                    {settings.versesPerSlide === 1
                      ? currentVerses[0]?.verse
                      : currentVerses.length > 0
                      ? `${currentVerses[0].verse}-${
                          currentVerses[currentVerses.length - 1].verse
                        }`
                      : "1"}
                  </span>
                </div>

                {/* Translation - Clickable */}
                <button
                  onClick={switchTranslation}
                  disabled={isTranslationSwitching}
                  className={`bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center transition-colors duration-200 ${
                    isTranslationSwitching
                      ? "bg-black/70 cursor-not-allowed"
                      : "hover:bg-black/70"
                  }`}
                  title="Click to switch translation (or press T)"
                >
                  <span className="text-white/80 font-mono text-[10px] uppercase tracking-wide">
                    {isTranslationSwitching ? "..." : currentTranslation}
                  </span>
                </button>

                {/* Current Position */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center">
                  <span className="text-white font-mono text-[10px]">
                    {currentVerseIndex + 1}/{verses.length}
                  </span>
                </div>

                {/* Progress Dots - Mini Version */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10">
                  <div className="flex items-center justify-center space-x-0.5">
                    {Array.from({
                      length: Math.min(
                        8,
                        Math.ceil(verses.length / settings.versesPerSlide)
                      ),
                    }).map((_, index) => (
                      <div
                        key={index}
                        className={`rounded-full transition-all duration-300 ${
                          Math.floor(
                            currentVerseIndex / settings.versesPerSlide
                          ) === index
                            ? "w-1.5 h-1.5 bg-white/80"
                            : "w-1 h-1 bg-white/30"
                        }`}
                      />
                    ))}
                    {verses.length > 8 && (
                      <span className="text-white/50 text-[8px] ml-0.5">
                        ...
                      </span>
                    )}
                  </div>
                </div>

                {/* Note about using Control Room */}
                <div className="bg-blue-500/20 rounded-md px-2 py-1 border border-blue-500/30 text-center">
                  <span className="text-blue-200/80 font-mono text-[8px] uppercase tracking-wide">
                    Use Control Room for Settings
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel Hidden Indicator */}
      <AnimatePresence>
        {!isControlPanelVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4 z-30"
          >
            <button
              onClick={toggleControlPanel}
              className="bg-black/20 backdrop-blur-sm rounded-full p-2 border border-white/10 shadow-lg hover:bg-black/40 transition-all duration-200 group"
              title="Show control panel (Ctrl+H)"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <div className="w-1 h-1 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors duration-200"></div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Light Effects */}
      <div className="absolute inset-0 pointer-events-none z-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-3/4 left-3/4 w-64 h-64 bg-purple-500/6 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
    </div>
  );
};

export default BiblePresentationDisplay;
