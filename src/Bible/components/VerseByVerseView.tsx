import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Book,
  Library,
  BookOpen,
} from "lucide-react";
import {
  setCurrentChapter,
  setCurrentVerse,
  addBookmark,
  removeBookmark,
  setProjectionFontSize,
  setVerseByVerseFontSize,
} from "@/store/slices/bibleSlice";
import { setCurrentScreen } from "@/store/slices/appSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import FloatingActionBar from "./FloatingActionBar";
import BookWatermarkBackground from "./BookWatermarkBackground";
import WatermarkToggle from "./WatermarkToggle";
import { logBibleAction, logBibleProjection } from "@/utils/ClientSecretLogger";

interface VerseByVerseViewProps {
  onNavigate: (direction: "prev" | "next") => void;
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  selectedVerse: number | null;
  chapterCount: number;
  isBookDropdownOpen: boolean;
  setIsBookDropdownOpen: (open: boolean) => void;
  isChapterDropdownOpen: boolean;
  setIsChapterDropdownOpen: (open: boolean) => void;
  isVerseDropdownOpen: boolean;
  setIsVerseDropdownOpen: (open: boolean) => void;
  handleBookSelect: (book: string) => void;
  handleChapterSelect: (chapter: number) => void;
  handleVerseSelect: (verse: number) => void;
  getChapters: () => number[];
  getVerses: () => number[];
  bookList: any[];
  isDarkMode: boolean;
  handlePreviousChapter: () => void;
  handleNextChapter: () => void;
  imageBackgroundMode: boolean;
  isFullScreen: boolean;
  onOpenPresentation?: () => void;
}

interface Verse {
  verse: number;
  text: string;
}

const VerseByVerseView: React.FC<VerseByVerseViewProps> = ({
  onNavigate,
  currentBook,
  currentChapter,
  currentVerse,
  selectedVerse,
  chapterCount,
  isBookDropdownOpen,
  setIsBookDropdownOpen,
  isChapterDropdownOpen,
  setIsChapterDropdownOpen,
  isVerseDropdownOpen,
  setIsVerseDropdownOpen,
  handleBookSelect,
  handleChapterSelect,
  handleVerseSelect: parentHandleVerseSelect,
  getChapters,
  getVerses,
  bookList,
  isDarkMode,
  handlePreviousChapter,
  handleNextChapter,
  imageBackgroundMode,
  isFullScreen,
  onOpenPresentation,
}) => {
  const dispatch = useAppDispatch();

  // Get projection settings from Redux for audience display
  const projectionFontSize = useAppSelector(
    (state) => state.bible.projectionFontSize
  );
  const projectionFontFamily = useAppSelector(
    (state) => state.bible.projectionFontFamily
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
  const verseByVerseAutoSize = useAppSelector(
    (state) => state.bible.verseByVerseAutoSize
  );
  const highlightJesusWords = useAppSelector(
    (state) => state.bible.highlightJesusWords
  );

  // Get reader settings for potential sharing
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);

  // Helper functions to get effective settings based on sharing configuration
  const getEffectiveFontSize = () => {
    if (shareSettingsWithVerseByVerse && shareFontSize) {
      // Use Control Room typography font size when sharing
      return projectionFontSize;
    }
    // When not sharing, use display section settings (verse-by-verse independent settings)
    return verseByVerseFontSize;
  };

  const getEffectiveFontFamily = () => {
    if (shareSettingsWithVerseByVerse && shareFontFamily) {
      // Use Control Room typography font family when sharing
      return projectionFontFamily;
    }
    // When not sharing, use display section settings (verse-by-verse independent settings)
    return verseByVerseFontFamily;
  };

  const getEffectiveTextColor = useCallback(() => {
    // Always use verse-by-verse text color (no sharing logic for colors)
    return verseByVerseTextColor;
  }, [verseByVerseTextColor]);

  // ==================== MANUAL FONT SIZE LOGIC ====================
  // Font size change functions (used when auto-size is disabled)
  const handleFontSizeIncrease = useCallback(() => {
    const currentSize = getEffectiveFontSize();
    const newSize = Math.min(80, currentSize + 2);

    if (shareSettingsWithVerseByVerse && shareFontSize) {
      // Update typography settings when sharing
      dispatch(setProjectionFontSize(newSize));
    } else {
      // Update display section settings when not sharing
      dispatch(setVerseByVerseFontSize(newSize));
    }
  }, [
    shareSettingsWithVerseByVerse,
    shareFontSize,
    getEffectiveFontSize,
    dispatch,
  ]);

  const handleFontSizeDecrease = useCallback(() => {
    const currentSize = getEffectiveFontSize();
    const newSize = Math.max(50, currentSize - 2);

    if (shareSettingsWithVerseByVerse && shareFontSize) {
      // Update typography settings when sharing
      dispatch(setProjectionFontSize(newSize));
    } else {
      // Update display section settings when not sharing
      dispatch(setVerseByVerseFontSize(newSize));
    }
  }, [
    shareSettingsWithVerseByVerse,
    shareFontSize,
    getEffectiveFontSize,
    dispatch,
  ]);

  // Helper function to convert font size to pixels
  const getManualFontSize = () => `${getEffectiveFontSize()}px`;

  const { getCurrentChapterVerses } = useBibleOperations();
  const containerRef = useRef<HTMLDivElement>(null);

  //   const fontSize = useAppSelector((state) => state.bible.fontSize);
  //   const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  //   const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const showWatermarkBackground = useAppSelector(
    (state) => state.bible.showWatermarkBackground
  );

  const [currentChapterVerses, setCurrentChapterVerses] = useState<any[]>([]);
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage
  );

  // Initialize with first verse if none selected
  useEffect(() => {
    const verses = getCurrentChapterVerses();
    setCurrentChapterVerses(verses || []);

    // If no verse is selected, select the first verse
    if (!currentVerse && verses && verses.length > 0) {
      dispatch(setCurrentVerse(1));
    }
  }, [
    currentBook,
    currentChapter,
    getCurrentChapterVerses,
    currentVerse,
    dispatch,
  ]);

  // Scroll to top when verse changes (for navigation) - only in auto-size mode
  useEffect(() => {
    if (containerRef.current && verseByVerseAutoSize) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (verseContainerRef.current && !verseByVerseAutoSize) {
      // In manual mode, ensure the beginning of text is visible by scrolling the verse container to top
      verseContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentVerse, currentChapter, currentBook, verseByVerseAutoSize]);

  // Bookmark functions
  const isCurrentVerseBookmarked = () => {
    if (!currentVerse) return false;
    const reference = `${currentBook} ${currentChapter}:${currentVerse}`;
    return bookmarks.includes(reference);
  };

  const toggleCurrentVerseBookmark = () => {
    if (!currentVerse) return;

    const reference = `${currentBook} ${currentChapter}:${currentVerse}`;
    const isBookmarked = bookmarks.includes(reference);

    if (isBookmarked) {
      dispatch(removeBookmark(reference));
      showNotification("Bookmark removed");
    } else {
      dispatch(addBookmark(reference));
      showNotification("Bookmark added");
    }
  };

  // Show notification function
  const showNotification = (message: string) => {
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50";
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevVerse();
    } else if (e.key === "ArrowRight") {
      handleNextVerse();
    } else if (e.key === "Enter") {
      e.preventDefault();
      toggleCurrentVerseBookmark();
    } else if (e.ctrlKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      dispatch(setCurrentScreen("imageViewer"));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVerse, currentChapter]);

  // Debug effect to track color changes
  useEffect(() => {
    console.log("🎨 VerseByVerseView - Color change detected:", {
      projectionTextColor,
      verseByVerseTextColor,
      isDarkMode,
      shareSettingsWithVerseByVerse,
      imageBackgroundMode,
      isFullScreen,
      effectiveColor: getEffectiveTextColor(),
    });
  }, [
    projectionTextColor,
    verseByVerseTextColor,
    isDarkMode,
    shareSettingsWithVerseByVerse,
    imageBackgroundMode,
    isFullScreen,
    getEffectiveTextColor,
  ]);

  const getChapterVerseCount = (chapter: number) => {
    const verses = getVerses();
    return verses.length;
  };

  const onVerseSelect = (verse: number) => {
    console.log("🎯 VerseByVerseView: verse selected", { verse, currentVerse });
    dispatch(setCurrentVerse(verse));
    parentHandleVerseSelect(verse);
  };

  const handlePrevVerse = () => {
    if (currentVerse && currentVerse > 1) {
      dispatch(setCurrentVerse(currentVerse - 1));
    } else if (currentChapter > 1) {
      const prevChapter = currentChapter - 1;

      dispatch(setCurrentChapter(prevChapter));

      setTimeout(() => {
        const verses = getCurrentChapterVerses();
        if (verses && verses.length > 0) {
          const lastVerseOfPrevChapter = verses.length;
          dispatch(setCurrentVerse(1));

          const notification = document.createElement("div");
          notification.className =
            "fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50";
          notification.textContent = `Moving to ${currentBook} ${prevChapter}:${lastVerseOfPrevChapter}`;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 2000);
        }
      }, 100);
    }
  };

  const handleNextVerse = () => {
    const currentVerses = getCurrentChapterVerses();
    if (currentVerse && currentVerses && currentVerse < currentVerses.length) {
      dispatch(setCurrentVerse(currentVerse + 1));
    } else if (currentChapter < chapterCount) {
      const nextChapter = currentChapter + 1;

      dispatch(setCurrentChapter(nextChapter));

      dispatch(setCurrentVerse(1));

      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50";
      notification.textContent = `Moving to ${currentBook} ${nextChapter}:1`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
  };

  // Get current verses for display and navigation
  const verses = getCurrentChapterVerses();
  const totalVerses = verses ? verses.length : 0;

  // Always ensure we have a verse to display
  const displayVerse = currentVerse || 1;
  const currentVerseText =
    verses && verses[displayVerse - 1]
      ? typeof verses[displayVerse - 1] === "string"
        ? String(verses[displayVerse - 1])
        : String((verses[displayVerse - 1] as Verse).text || "")
      : "";

  // Process Jesus words highlighting
  const processJesusWords = useCallback(
    (text: string): string => {
      if (!highlightJesusWords) {
        return text;
      }

      console.log("🔍 Processing Jesus words:", {
        originalText: text,
        highlightEnabled: highlightJesusWords,
        hasAngleBrackets: text.includes("‹") && text.includes("›"),
      });

      // Replace text wrapped in ‹› with red and italic styling (Jesus words)
      let processedText = text.replace(
        /‹([^›]+)›/g,
        '<span className="font-serif" style="color: #ef4444; ; font-family: garamond;">$1</span>'
      );

      console.log("✅ Processed text result:", {
        original: text,
        processed: processedText,
        wasChanged: text !== processedText,
      });

      return processedText;
    },
    [highlightJesusWords]
  );

  // Get processed verse text with Jesus words highlighting if enabled
  const processedVerseText = processJesusWords(currentVerseText);

  // ==================== NEW AUTO-FITTING FONT SIZE LOGIC ====================
  const [autoFontSize, setAutoFontSize] = useState(48); // Default starting size
  const verseContentRef = useRef<HTMLDivElement>(null);
  const verseContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resize function using simple recursive approach (like HTML test)
  const resizeToFit = useCallback(() => {
    if (!verseContentRef.current || !verseContainerRef.current) return;

    const content = verseContentRef.current;
    const container = verseContainerRef.current;

    console.log("🔍 Starting resize - container dimensions:", {
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

      console.log(`📏 Testing ${currentSize}px:`, {
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

    // Start with 120px and work down
    const finalSize = recursiveResize(90);

    // Update state
    setAutoFontSize(finalSize);

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

    console.log("✅ FINAL resize result:", resizeResult);

    // Log auto-sizing result to secret logs
    logBibleProjection("VerseByVerse auto-sizing completed", {
      component: "VerseByVerseView",
      mode: "auto-sizing",
      finalFontSize: finalSize,
      containerDimensions: {
        height: container.clientHeight,
        width: container.clientWidth,
      },
      contentHeight: content.scrollHeight,
      spaceUtilization: resizeResult.utilization,
      currentVerse: currentVerse,
      currentBook: currentBook,
      currentChapter: currentChapter,
      contentPreview: content.textContent?.substring(0, 100) + "...",
    });
  }, [currentVerse, currentBook, currentChapter]);

  // Auto-resize when content changes (only if auto-size is enabled)
  useEffect(() => {
    if (verseByVerseAutoSize) {
      // Log auto-sizing trigger
      logBibleAction("VerseByVerse auto-sizing triggered", {
        component: "VerseByVerseView",
        trigger: "content_change",
        currentBook: currentBook,
        currentChapter: currentChapter,
        currentVerse: currentVerse,
        contentPreview: currentVerseText.substring(0, 100) + "...",
        autoSizeEnabled: verseByVerseAutoSize,
      });

      // Longer delay to ensure DOM is fully updated
      const timer = setTimeout(() => {
        console.log(
          "🔄 Auto-resize triggering for:",
          currentVerseText.substring(0, 50)
        );
        resizeToFit();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [
    currentVerseText,
    currentVerse,
    currentChapter,
    currentBook,
    verseByVerseAutoSize,
    resizeToFit,
  ]);

  // Auto-resize on window resize (only if auto-size is enabled)
  useEffect(() => {
    if (verseByVerseAutoSize) {
      const handleResize = () => {
        resizeToFit();
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [verseByVerseAutoSize, resizeToFit]);

  // Initial resize when component mounts and refs are ready (only if auto-size is enabled)
  useEffect(() => {
    if (
      verseByVerseAutoSize &&
      verseContentRef.current &&
      verseContainerRef.current
    ) {
      console.log("🎬 Component mounted, triggering initial auto-resize");
      const timer = setTimeout(() => {
        resizeToFit();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [verseByVerseAutoSize, resizeToFit]);

  // Helper function to get the appropriate font size based on auto-size setting
  const getFinalFontSize = () => {
    if (verseByVerseAutoSize) {
      return getAutoFittedFontSize(); // Use auto-fitted size
    } else {
      return getManualFontSize(); // Use manual/slider size
    }
  };

  // Helper function to get auto-fitted font size
  const getAutoFittedFontSize = () => `${autoFontSize}px`;

  // Only allow background if in fullscreen
  const showBackground = imageBackgroundMode && isFullScreen;

  // Show faded art when:
  // 1. Image background mode is OFF entirely, OR
  // 2. Image background mode is ON but not in fullscreen (so no actual bg image shows)
  const showFadedArt =
    !imageBackgroundMode || (imageBackgroundMode && !isFullScreen);

  // Debug effect to track background image changes
  useEffect(() => {
    console.log(
      "VerseByVerseView - projectionBackgroundImage changed:",
      projectionBackgroundImage
    );
    console.log("VerseByVerseView - showBackground:", showBackground);
    console.log("VerseByVerseView - showFadedArt:", showFadedArt);
    console.log("VerseByVerseView - imageBackgroundMode:", imageBackgroundMode);
    console.log("VerseByVerseView - isFullScreen:", isFullScreen);
  }, [
    projectionBackgroundImage,
    showBackground,
    showFadedArt,
    imageBackgroundMode,
    isFullScreen,
  ]);

  // Determine text color based on background and theme
  const getTextColor = useCallback(() => {
    // If there's a background image, always use white for readability
    if (showBackground) {
      return "#ffffff";
    }

    // No background: use theme-based colors for proper contrast
    if (isDarkMode) {
      return "#fbdcd4"; // White text on dark background
    } else {
      return "#532d10"; // Black text on light background
    }
  }, [showBackground, isDarkMode]);

  // Debug effect to track final text color
  useEffect(() => {
    console.log("🎨 VerseByVerseView - Final text color:", {
      showBackground,
      isDarkMode,
      finalTextColor: getTextColor(),
    });
  }, [showBackground, isDarkMode, getTextColor]);

  // Debug effect to track auto-size mode changes
  useEffect(() => {
    console.log("🔧 VerseByVerseView - Auto-size mode:", {
      verseByVerseAutoSize,
      mode: verseByVerseAutoSize ? "AUTO-SIZING" : "MANUAL CONTROL",
      fontSize: verseByVerseAutoSize
        ? `${autoFontSize}px (auto)`
        : `${getEffectiveFontSize()}px (manual)`,
    });
  }, [verseByVerseAutoSize, autoFontSize, getEffectiveFontSize]);

  // ==================== KEYBOARD CONTROLS FOR MANUAL FONT SIZE ====================
  // Keyboard event listener for font size controls (only when auto-size is disabled)
  useEffect(() => {
    if (!verseByVerseAutoSize) {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Check if the target is an input or textarea to avoid interfering with typing
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          handleFontSizeIncrease();
        } else if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          handleFontSizeDecrease();
        } else if (event.ctrlKey && event.key.toLowerCase() === "i") {
          event.preventDefault();
          dispatch(setCurrentScreen("imageViewer"));
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [verseByVerseAutoSize, handleFontSizeIncrease, handleFontSizeDecrease]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-start h-screen w-full overflow-x-hidden overflow-y-scroll no-scrollbar ${
        showBackground
          ? "bg-cover bg-center bg-no-repeat"
          : "bg-white dark:bg-[#352921]"
      }`}
      style={
        showBackground
          ? {
              backgroundImage: `url(${
                projectionBackgroundImage || bibleBgs[0]
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : showFadedArt
          ? {
              // Remove vector background images - will use component-based watermark instead
              opacity: "1",
            }
          : {}
      }
    >
      {/* Book and Library Icons Watermark - Show only when no background image is set and setting is enabled */}
      {!showBackground && showWatermarkBackground && (
        <BookWatermarkBackground isDarkMode={isDarkMode} />
      )}

      {/* Floating watermark toggle - only show when not in background image mode */}
      <WatermarkToggle show={!showBackground} />

      {/* Floating Action Bar */}
      <div
        className={`absolute ${
          isFullScreen ? "top-0" : "top-12"
        } left-0 right-0 z-40`}
      >
        <FloatingActionBar
          currentBook={currentBook}
          currentChapter={currentChapter}
          currentVerse={currentVerse}
          selectedVerse={currentVerse}
          chapterCount={chapterCount}
          isBookDropdownOpen={isBookDropdownOpen}
          setIsBookDropdownOpen={setIsBookDropdownOpen}
          isChapterDropdownOpen={isChapterDropdownOpen}
          setIsChapterDropdownOpen={setIsChapterDropdownOpen}
          isVerseDropdownOpen={isVerseDropdownOpen}
          setIsVerseDropdownOpen={setIsVerseDropdownOpen}
          handleBookSelect={handleBookSelect}
          handleChapterSelect={handleChapterSelect}
          handleVerseSelect={onVerseSelect}
          getChapters={getChapters}
          getVerses={getVerses}
          bookList={bookList}
          isDarkMode={isDarkMode}
          handlePreviousChapter={handlePreviousChapter}
          handleNextChapter={handleNextChapter}
          hideLayoutButtons={true}
          isVerseByVerseView={true}
          hasBackgroundImage={showBackground}
          onOpenPresentation={onOpenPresentation}
          isCurrentVerseBookmarked={isCurrentVerseBookmarked()}
          onToggleCurrentVerseBookmark={toggleCurrentVerseBookmark}
        />
      </div>

      {/* Verse Display - Adaptive container based on auto-size mode */}
      <span
        ref={verseContainerRef}
        className="w-full no-scrollbar"
        style={{
          // Different height and overflow behavior based on mode
          height: verseByVerseAutoSize && showBackground ? "100vh" : "96vh", // Fixed for auto, flexible for manual
          width: "100%",
          overflow: verseByVerseAutoSize ? "hidden" : "auto", // No scroll for auto, scroll for manual
          // Smart positioning: center for auto-size, flex-start for manual to prevent cutoff
          display: "flex",
          alignItems: verseByVerseAutoSize ? "center" : "flex-start", // Center only for auto-size to prevent cutoff
          justifyContent: "center", // Always center horizontally
          paddingLeft: "5px",
          paddingRight: "5px",
          paddingTop: verseByVerseAutoSize ? "0" : "20px", // Add some top padding for manual mode
          paddingBottom: verseByVerseAutoSize ? "10px" : "20px", // Add some bottom padding for manual mode
        }}
      >
        <AnimatePresence>
          {!(
            isBookDropdownOpen ||
            isChapterDropdownOpen ||
            isVerseDropdownOpen
          ) && (
            <div
              ref={verseContentRef}
              style={{
                fontFamily: getEffectiveFontFamily(),
                fontWeight: "bold",
                fontSize: getFinalFontSize(),
                color: getTextColor(),
                textAlign: "center",
                lineHeight: verseByVerseAutoSize ? "inherit" : "1.3", // Dynamic line height for auto, fixed for manual
                width: "100%",
                // Keep text inline while providing smart centering
                display: "block", // Use block instead of flex to maintain inline text flow
                // Smart padding: more top margin for shorter content to center it, but ensure longer content starts from top
                padding: verseByVerseAutoSize ? "0" : "0", // No internal padding for manual mode
                marginTop: verseByVerseAutoSize ? "0" : "auto", // Auto margin centers shorter content
                marginBottom: verseByVerseAutoSize ? "0" : "auto", // Auto margin centers shorter content
                minHeight: verseByVerseAutoSize ? "auto" : "fit-content", // Ensure content is always visible
                maxHeight: verseByVerseAutoSize ? "none" : "100%", // Prevent overflow
              }}
              dangerouslySetInnerHTML={{
                __html: `<span style="font-weight: normal; font-style: italic; margin-right: 12px; color: #ef4444; font-family: 'Bitter', serif;">${displayVerse}</span>${processedVerseText}`,
              }}
            />
          )}
        </AnimatePresence>
      </span>

      {/* Navigation Controls */}
      <div className="fixed bottom-14 right-4  transform flex flex-col items-center gap-3">
        <div
          onClick={handlePrevVerse}
          // disabled={currentVerse === 1 && currentChapter === 1}
          className={`p-2 h-8 w-8 rounded-full ${
            showBackground
              ? "bg-gradient-to-r from-transparent via-white to-transparent text-black"
              : "bg-white dark:bg-[#3d332a] text-stone-600 dark:text-stone-300"
          } hover:bg-opacity-80 transition-colors duration-200 ${
            currentVerse === 1 && currentChapter === 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <ChevronLeft size={18} />
        </div>
        <div
          onClick={handleNextVerse}
          // disabled={
          //   currentVerse === totalVerses && currentChapter === chapterCount
          // }
          className={`p-2 w-8 h-8 rounded-full ${
            showBackground
              ? "bg-gradient-to-r from-transparent via-white to-transparent text-black"
              : "bg-white dark:bg-[#3d332a] text-stone-600 dark:text-stone-300"
          } hover:bg-opacity-80 transition-colors duration-200 ${
            currentVerse === totalVerses && currentChapter === chapterCount
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Display current verse number and total verses */}
      <div className="fixed bottom-3 font-bold font-impact right-4 transform -translate-x-1/2 text-sm">
        <span
          className={showBackground ? "text-white" : " dark:text-yellow-500 "}
        >
          {currentBook} {currentChapter} : {currentVerse} of {totalVerses}
        </span>
      </div>
    </div>
  );
};

export default VerseByVerseView;
