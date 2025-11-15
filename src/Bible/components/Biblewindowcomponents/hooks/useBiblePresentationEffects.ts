// Effect hooks for Bible presentation functionality
import { useEffect } from "react";
import { useBiblePresentation } from "./useBiblePresentation";
import {
  setCurrentTranslation,
  setCurrentBook,
  setCurrentChapter,
  TRANSLATIONS,
  setStandaloneFontMultiplier,
  setProjectionFontSize,
  setProjectionFontFamily,
  setProjectionBackgroundColor,
  setProjectionGradientColors,
  setProjectionBackgroundImage,
  setProjectionTextColor,
  setHighlightJesusWords,
  setShowScriptureReference,
  setScriptureReferenceColor,
} from "@/store/slices/bibleSlice";
import { setBibleBgs } from "@/store/slices/appSlice";

export const useBiblePresentationEffects = (
  hook: ReturnType<typeof useBiblePresentation>
) => {
  const {
    dispatch,
    initializeBibleData,
    bibleData,
    currentTranslation,
    initialData,
    currentBook,
    currentChapter,
    currentVerseIndex,
    setCurrentVerseIndex,
    selectedBackground,
    backgroundImage,
    setBackgroundImage,
    getLocalStorageItem,
    useImageBackground,
    setUseImageBackground,
    bibleBgs,
    projectionBackgroundImage,
    setIsBackgroundLoading,
    backgroundLoadingTimeout,
    setBackgroundLoadingTimeout,
    hoverTimeoutId,
    setHoverTimeoutId,
    setSettings,
    handleMouseEnterTopRegion,
    handleMouseLeaveTopRegion,
    increaseFontSize,
    decreaseFontSize,
    switchTranslation,
    selectGradient,
    toggleControlPanel,
    backgroundGradients,
    getCurrentChapterVerses,
    standaloneFontMultiplier,
    calculateOptimalFontSize,
    getCurrentVerses,
    fontSize,
    fontFamily,
    fontWeight,
  } = hook;

  // Debug logging to confirm component is loaded
  useEffect(() => {
    console.log("BiblePresentationDisplay component mounted");
    console.log("Window location:", window.location.href);
    console.log("Hash:", window.location.hash);
  }, []);

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
              "./wood6.jpg",
              "./wood7.png",
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
            "./wood6.jpg",
            "./wood7.png",
            "./wood10.jpg",
            "./wood11.jpg",
          ];
          dispatch(setBibleBgs(defaultBackgrounds));
        }
      }
    };

    loadBackgroundImages();
  }, [dispatch, bibleBgs.length]);

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
              console.log("📍 Projection received verse update:", {
                selectedVerse: data.data.selectedVerse,
                verseIndex,
                book: data.data.book,
                chapter: data.data.chapter,
              });
              setCurrentVerseIndex(verseIndex);
            } else if (!isSameBookChapter) {
              // Reset to first verse only when book/chapter changes and no specific verse is provided
              console.log(
                "📍 Projection resetting to first verse for new book/chapter"
              );
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
              console.log(
                "🎨 Projection: Received text color update:",
                data.data.textColor
              );
              dispatch(setProjectionTextColor(data.data.textColor));

              // Force a re-render by updating localStorage as well
              localStorage.setItem(
                "bibleProjectionTextColor",
                data.data.textColor
              );
            }
            if (data.data.fontMultiplier) {
              dispatch(setStandaloneFontMultiplier(data.data.fontMultiplier));
            }
            if (data.data.highlightJesusWords !== undefined) {
              console.log(
                "✝️ Projection: Received Jesus words highlight update:",
                data.data.highlightJesusWords
              );
              dispatch(setHighlightJesusWords(data.data.highlightJesusWords));
            }
            if (data.data.showScriptureReference !== undefined) {
              console.log(
                "📖 Projection: Received scripture reference toggle update:",
                data.data.showScriptureReference
              );
              dispatch(
                setShowScriptureReference(data.data.showScriptureReference)
              );
            }
            if (data.data.scriptureReferenceColor) {
              console.log(
                "🎨 Projection: Received scripture reference color update:",
                data.data.scriptureReferenceColor
              );
              dispatch(
                setScriptureReferenceColor(data.data.scriptureReferenceColor)
              );
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
        finalVersesLength: getCurrentVerses().length,
        currentVerseIndex,
      });
    }
  }, [
    currentTranslation,
    currentBook,
    currentChapter,
    bibleData,
    getCurrentVerses().length,
    initialData,
    getCurrentChapterVerses,
    currentVerseIndex,
  ]);
};
