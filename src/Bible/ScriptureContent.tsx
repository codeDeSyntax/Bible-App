import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useTheme } from "@/Provider/Theme";
// import ScriptureBlockView from "./components/ScriptureBlockView";
// import ScriptureParagraphView from "./components/ScriptureParagraphView";
// TabletView removed: replaced by simpler layout placeholder
import { BibleStudio } from "./components/BibleStudio";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useNotification } from "@/hooks/useNotification";
import { useBibleDataCache } from "@/hooks/useBibleDataCache";
import { Toaster } from "@/components/Notification";
import {
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setVerseTextColor,
  addBookmark,
  removeBookmark,
  addToHistory,
  ViewMode,
} from "@/store/slices/bibleSlice";

interface Book {
  name: string;
  testament: string;
  chapters: { chapter: number }[];
}

// Notification component for Bible projection feedback
const BibleNotification = ({
  message,
  type = "error",
}: {
  message: string;
  type?: "success" | "error" | "warning";
}) => {
  const config = {
    success: {
      bg: "bg-gradient-to-r from-gray-800 to-gray-700",
      border: "border-gray-600",
      icon: "text-gray-300",
      glow: "0 4px 12px rgba(156, 163, 175, 0.3), 0 0 20px rgba(156, 163, 175, 0.15)",
    },
    error: {
      bg: "bg-gradient-to-r from-red-900 to-red-800",
      border: "border-red-700",
      icon: "text-red-300",
      glow: "0 4px 12px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.15)",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-900 to-amber-800",
      border: "border-amber-700",
      icon: "text-amber-300",
      glow: "0 4px 12px rgba(251, 191, 36, 0.3), 0 0 20px rgba(251, 191, 36, 0.15)",
    },
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-8 left-1/2 z-50"
    >
      <div
        className={`flex items-center gap-3 ${config.bg} ${config.border} border backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-lg`}
        style={{ boxShadow: config.glow }}
      >
        {type === "success" ? (
          <div className="relative">
            <CheckCircle className={`w-5 h-5 ${config.icon}`} />
            <div
              className="absolute inset-0 bg-gray-400 rounded-full blur-sm"
              style={{ opacity: 0.3 }}
            />
          </div>
        ) : (
          <AlertCircle className={`w-5 h-5 ${config.icon}`} />
        )}
        <span className="font-medium text-[0.9rem] tracking-wide">
          {message}
        </span>
      </div>
    </motion.div>
  );
};

const ScriptureContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { getCurrentChapterVerses, getBookChapterCount, initializeBibleData } =
    useBibleOperations();
  const { toasts, showNotification, dismissToast } = useNotification();

  // Select state from Redux
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const theme = useAppSelector((state) => state.bible.theme);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const bookList = useAppSelector((state) => state.bible.bookList);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
  const isFullScreen = useAppSelector((state) => state.bible.isFullScreen);
  const imageBackgroundMode = useAppSelector(
    (state) => state.bible.imageBackgroundMode,
  );
  const selectedBackground = useAppSelector(
    (state) => state.bible.selectedBackground,
  );
  const projectionFontFamily = useAppSelector(
    (state) => state.bible.projectionFontFamily,
  );
  const projectionFontSize = useAppSelector(
    (state) => state.bible.projectionFontSize,
  );
  const projectionTextColor = useAppSelector(
    (state) => state.bible.projectionTextColor,
  );
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage,
  );
  const projectionGradientColors = useAppSelector(
    (state) => state.bible.projectionGradientColors,
  );

  const { isDarkMode } = useTheme();

  // State for dropdowns
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);

  // State for verse tracking and interaction
  const [visibleVerses, setVisibleVerses] = useState<number[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(
    currentVerse || null,
  );
  const [highlightedVerses, setHighlightedVerses] = useState<{
    [key: string]: string;
  }>({});
  const [activeDropdownVerse, setActiveDropdownVerse] = useState<number | null>(
    null,
  );

  // Sync selectedVerse with currentVerse when currentVerse changes from bookmarks/search
  useEffect(() => {
    if (currentVerse !== null && currentVerse !== selectedVerse) {
      setSelectedVerse(currentVerse);
    }
  }, [currentVerse, selectedVerse]);

  // New state for view mode - now from Redux
  const viewMode = useAppSelector((state) => state.bible.viewMode);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(25); // pixels per second for comfortable reading speed
  const [autoScrollStatus, setAutoScrollStatus] = useState<string | null>(null); // Status message for auto-scroll
  const autoScrollAnimationRef = useRef<number | null>(null);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUserScrollRef = useRef<number>(0);
  const isNavigatingRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const accumulatedScrollRef = useRef<number>(0); // Auto-scroll functions - truly smooth continuous flow using requestAnimationFrame
  const startAutoScroll = useCallback(() => {
    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current);
    }

    // Start from current verse position if available and not currently navigating
    if (
      currentVerse &&
      verseRefs.current[currentVerse] &&
      !isNavigatingRef.current
    ) {
      verseRefs.current[currentVerse]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // Reset timing and accumulation
    lastTimeRef.current = 0;
    accumulatedScrollRef.current = 0;

    const animateScroll = (currentTime: number) => {
      if (!isAutoScrolling) return;

      // Initialize timing on first frame
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        autoScrollAnimationRef.current = requestAnimationFrame(animateScroll);
        return;
      }

      // Calculate time delta for smooth, frame-rate independent scrolling
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Only scroll if user hasn't interacted recently
      const now = Date.now();
      if (now - lastUserScrollRef.current > 1000 && contentRef.current) {
        const container = contentRef.current;
        const scrollHeight = container.scrollHeight - container.clientHeight;

        // Calculate smooth scroll distance based on speed and time delta
        // This creates truly continuous, flowing movement
        const scrollDistance = (autoScrollSpeed * deltaTime) / 1000; // pixels per frame
        accumulatedScrollRef.current += scrollDistance;

        // Apply the accumulated scroll in small, smooth increments
        const currentScroll = container.scrollTop;
        if (currentScroll < scrollHeight) {
          // Smooth continuous scrolling - no discrete jumps
          container.scrollTop = Math.min(
            currentScroll + scrollDistance,
            scrollHeight,
          );
        } else {
          // Reached the bottom - pause and restart
          cancelAnimationFrame(autoScrollAnimationRef.current!);
          setAutoScrollStatus("Pausing...");
          // Clear any existing restart timers before creating new ones
          if (autoScrollRestartTimeoutRef.current) clearTimeout(autoScrollRestartTimeoutRef.current);
          if (autoScrollResumeTimeoutRef.current) clearTimeout(autoScrollResumeTimeoutRef.current);
          autoScrollRestartTimeoutRef.current = setTimeout(() => {
            autoScrollRestartTimeoutRef.current = null;
            if (isAutoScrolling && contentRef.current) {
              setAutoScrollStatus("Restarting...");
              contentRef.current.scrollTop = 0;
              accumulatedScrollRef.current = 0;
              autoScrollResumeTimeoutRef.current = setTimeout(() => {
                autoScrollResumeTimeoutRef.current = null;
                setAutoScrollStatus(null);
                if (isAutoScrolling) {
                  startAutoScroll();
                }
              }, 500);
            }
          }, 3000);
          return;
        }
      }

      // Continue the animation loop
      autoScrollAnimationRef.current = requestAnimationFrame(animateScroll);
    };

    // Start the smooth animation loop
    autoScrollAnimationRef.current = requestAnimationFrame(animateScroll);
  }, [autoScrollSpeed, currentVerse, isAutoScrolling]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current);
      autoScrollAnimationRef.current = null;
    }
    setAutoScrollStatus(null);
    accumulatedScrollRef.current = 0;
  }, []);

  const pauseAutoScrollTemporarily = useCallback(() => {
    if (isAutoScrolling && !isNavigatingRef.current) {
      lastUserScrollRef.current = Date.now();

      // Clear existing timeout
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }

      // Resume auto-scroll after 4 seconds of no user interaction
      userInteractionTimeoutRef.current = setTimeout(() => {
        if (isAutoScrolling) {
          lastUserScrollRef.current = 0; // Reset to allow auto-scroll to resume
        }
      }, 4000);
    }
  }, [isAutoScrolling]);

  const toggleAutoScroll = useCallback(() => {
    // Auto-scroll functionality disabled to prevent unwanted scrolling behavior
    /*
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      stopAutoScroll();
      // Clear user interaction timeout when manually stopping
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    } else {
      setIsAutoScrolling(true);
      lastUserScrollRef.current = 0; // Reset user interaction tracking
      startAutoScroll();
    }
    */
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  // Handle user scroll interaction
  useEffect(() => {
    const handleUserScroll = (e: Event) => {
      // Don't interfere if this is navigation-triggered scroll
      if (isNavigatingRef.current) return;

      pauseAutoScrollTemporarily();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
          e.key,
        )
      ) {
        pauseAutoScrollTemporarily();
      }
    };

    if (isAutoScrolling && contentRef.current) {
      // Listen for scroll events on the main content container
      contentRef.current.addEventListener("scroll", handleUserScroll, {
        passive: true,
      });
      contentRef.current.addEventListener("wheel", handleUserScroll, {
        passive: true,
      });
      contentRef.current.addEventListener("touchmove", handleUserScroll, {
        passive: true,
      });
      // Listen for keyboard events on the window
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", handleUserScroll);
        contentRef.current.removeEventListener("wheel", handleUserScroll);
        contentRef.current.removeEventListener("touchmove", handleUserScroll);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAutoScrolling, pauseAutoScrollTemporarily]);

  // Handle navigation changes - temporarily pause auto-scroll during navigation
  useEffect(() => {
    isNavigatingRef.current = true;
    const timeoutId = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000); // Allow 1 second for navigation to complete

    return () => clearTimeout(timeoutId);
  }, [currentBook, currentChapter, currentVerse]);

  // Start/stop auto-scroll when state changes - DISABLED for paragraph view
  useEffect(() => {
    // Auto-scroll functionality disabled to prevent unwanted scrolling
    // if (isAutoScrolling) {
    //   startAutoScroll();
    // } else {
    //   stopAutoScroll();
    // }

    return () => {
      stopAutoScroll();
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScrollAnimationRef.current) {
        cancelAnimationFrame(autoScrollAnimationRef.current);
      }
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
      if (autoScrollRestartTimeoutRef.current) {
        clearTimeout(autoScrollRestartTimeoutRef.current);
      }
      if (autoScrollResumeTimeoutRef.current) {
        clearTimeout(autoScrollResumeTimeoutRef.current);
      }
    };
  }, []);

  // Function to open Bible presentation window directly
  const handleOpenBiblePresentation = async () => {
    // Open Bible presentation (no debug logging)

    // If Bible data is not loaded, try to initialize it first
    if (!bibleData || Object.keys(bibleData).length === 0) {
      // Bible data not loaded; attempting to initialize
      showNotification("Loading Bible data...", "warning");
      try {
        await initializeBibleData();
        // Wait a bit for the data to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("❌ Failed to initialize Bible data:", error);
        showNotification("Failed to load Bible data", "error");
        return;
      }
    }

    // Prepare presentation data
    if (!currentBook) {
      console.error("❌ Cannot open presentation: No current book selected");
      showNotification("Please select a book first", "error");
      return;
    }

    if (!currentChapter) {
      console.error("❌ Cannot open presentation: No current chapter selected");
      showNotification("Please select a chapter first", "error");
      return;
    }

    if (!bibleData) {
      console.error("❌ Cannot open presentation: Bible data not loaded");
      showNotification("Bible data not available. Please try again.", "error");
      return;
    }

    if (!currentTranslation) {
      console.error(
        "❌ Cannot open presentation: No current translation selected",
      );
      showNotification("Please select a Bible translation first", "error");
      return;
    }

    const translationData = bibleData[currentTranslation];
    if (!translationData) {
      console.error(
        `❌ Cannot open presentation: Translation data not found for ${currentTranslation}`,
      );
      showNotification(
        `Translation '${currentTranslation}' not found`,
        "error",
      );
      return;
    }

    if (!translationData.books) {
      console.error(
        `❌ Cannot open presentation: Books data not found for ${currentTranslation}`,
      );
      showNotification("Translation data incomplete", "error");
      return;
    }

    const bookData = translationData.books.find(
      (book: any) => book.name === currentBook,
    );

    if (!bookData) {
      console.error(
        `❌ Cannot open presentation: Book data not found for ${currentBook}`,
      );
      showNotification(
        `Book '${currentBook}' not found in ${currentTranslation}`,
        "error",
      );
      return;
    }

    const chapterData = bookData.chapters?.find(
      (ch: any) => ch.chapter === currentChapter,
    );

    if (!chapterData?.verses) {
      console.error(
        `❌ Cannot open presentation: Chapter data or verses not found for ${currentBook} ${currentChapter}`,
      );
      showNotification(
        `Chapter ${currentChapter} not found in ${currentBook}`,
        "error",
      );
      return;
    }

    const presentationData = {
      book: currentBook,
      chapter: currentChapter,
      verses: chapterData.verses,
      translation: currentTranslation,
      selectedVerse: currentVerse || undefined,
    };

    // Default settings
    const settings = {
      fontSize: 6,
      textColor: "#ffffff",
      backgroundColor: "#1e293b",
      versesPerSlide: 1,
    };

    // Presentation data prepared

    // Open external presentation window directly
    if (typeof window !== "undefined" && window.api) {
      try {
        showNotification(
          `Projecting ${currentBook} ${currentChapter}`,
          "success",
        );
        window.api.createBiblePresentationWindow({
          presentationData,
          settings,
        });
      } catch (error) {
        console.error("❌ Failed to create Bible presentation window:", error);
        showNotification("Failed to open projection window", "error");
      }
    } else {
      console.error("❌ Cannot open presentation: Window API not available");
    }
  };

  // Initialize the memoized Bible data cache for O(1) verse lookups
  const { getChapterVerses } = useBibleDataCache(bibleData);

  // Function to send live updates to presentation window (optimized with caching)
  const sendLiveUpdateToPresentation = useCallback(() => {
    // If a book/chapter change happened very recently, skip this send to avoid
    // triggering projection navigation on book/chapter selection (we only
    // want explicit verse selections to navigate the projection).
    try {
      const now = Date.now();
      const recentBookChange =
        lastBookChangeRef.current && now - lastBookChangeRef.current < 800;
      const recentChapterChange =
        lastChapterChangeRef.current &&
        now - lastChapterChangeRef.current < 800;
      if (recentBookChange || recentChapterChange) return;
    } catch (e) {
      // ignore
    }

    if (currentBook && currentChapter && currentTranslation) {
      // Use the memoized cache for O(1) lookup instead of O(n) .find() operations
      // This eliminates the 200-400ms delay from synchronous Bible data searches
      const { verses } = getChapterVerses(
        currentTranslation,
        currentBook,
        currentChapter,
      );

      if (verses && verses.length > 0) {
        const presentationData = {
          book: currentBook,
          chapter: currentChapter,
          verses: verses,
          translation: currentTranslation,
          selectedVerse: currentVerse || undefined,
        };

        // Send update to presentation window
        if (typeof window !== "undefined" && window.api) {
          window.api.sendToBiblePresentation({
            type: "update-data",
            data: presentationData,
          });
        }
      }
    }
  }, [
    currentBook,
    currentChapter,
    currentTranslation,
    currentVerse,
    getChapterVerses,
  ]);

  const verses = useMemo(() => {
    return getCurrentChapterVerses();
  }, [currentBook, currentChapter, currentTranslation, bibleData]);

  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const chapterCount = getBookChapterCount(currentBook);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);

  const bookmarkNavigationRef = useRef(false);

  // Detect rapid state changes (like bookmark navigation) and temporarily disable updateVisibleVerses
  const lastBookChangeRef = useRef(0);
  const lastChapterChangeRef = useRef(0);
  const lastVerseChangeRef = useRef(0);

  // Auto-sync presentation on book and chapter changes
  useEffect(() => {
    sendLiveUpdateToPresentation();
  }, [
    currentBook,
    currentChapter,
    currentTranslation,
    sendLiveUpdateToPresentation,
  ]);

  useEffect(() => {
    lastVerseChangeRef.current = Date.now();

    // If book, chapter, and verse all changed within a short time window (bookmark navigation)
    const now = Date.now();
    const isRapidNavigation =
      now - lastBookChangeRef.current < 1000 &&
      now - lastChapterChangeRef.current < 1000 &&
      now - lastVerseChangeRef.current < 1000;

    if (isRapidNavigation) {
      bookmarkNavigationRef.current = true;
      // Reset the flag after scroll completes
      setTimeout(() => {
        bookmarkNavigationRef.current = false;
      }, 2000);
    }

    // Auto-sync presentation on verse change
    sendLiveUpdateToPresentation();
  }, [currentVerse, sendLiveUpdateToPresentation]);

  // Update visible verses logic with throttling to prevent excessive renders
  const updateVisibleVerses = useCallback(() => {
    // Don't update visible verses during bookmark navigation to prevent interference
    if (!contentRef.current || bookmarkNavigationRef.current) return;

    const container = contentRef.current;
    const visibleVerseNumbers: number[] = [];

    Object.entries(verseRefs.current).forEach(([verseNum, ref]) => {
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const topRelativeToContainer = rect.top - containerRect.top;
      const bottomRelativeToContainer = rect.bottom - containerRect.top;

      if (
        bottomRelativeToContainer > 0 &&
        topRelativeToContainer < container.clientHeight
      ) {
        visibleVerseNumbers.push(parseInt(verseNum));
      }
    });

    if (
      visibleVerseNumbers.length > 0 &&
      visibleVerseNumbers[0] !== selectedVerse
    ) {
      const newVerse = visibleVerseNumbers[0];
      setSelectedVerse(newVerse);
      // Also update Redux state so auto-sync can detect the change and update projection
      dispatch(setCurrentVerse(newVerse));
    }
  }, [selectedVerse, dispatch]);

  // Auto-switch text color based on theme, but preserve custom colors
  useEffect(() => {
    // Only auto-switch if using default theme colors
    if (
      verseTextColor === "#fcd8c0" ||
      verseTextColor === "#ffffff" ||
      verseTextColor === "#1d1c1c"
    ) {
      if (isDarkMode) {
        dispatch(setVerseTextColor("#fcd8c0"));
      } else {
        dispatch(setVerseTextColor("#ffffff"));
      }
    }
  }, [isDarkMode, dispatch, verseTextColor]);

  // Throttling ref
  const tickingRef = useRef(false);

  // Throttled scroll handler to prevent excessive renders
  const throttledUpdateVisibleVerses = useCallback(() => {
    if (!tickingRef.current) {
      requestAnimationFrame(() => {
        updateVisibleVerses();
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, [updateVisibleVerses]);

  // Scroll event listener with throttling
  useEffect(() => {
    const container = contentRef.current;
    if (container) {
      container.addEventListener("scroll", throttledUpdateVisibleVerses);
      return () => {
        container.removeEventListener("scroll", throttledUpdateVisibleVerses);
      };
    }
  }, [throttledUpdateVisibleVerses]);

  // Reset when book or chapter changes (but NOT when verse changes from scrolling)
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setSelectedVerse(null);
    setIsVerseDropdownOpen(false);
  }, [currentBook, currentChapter]);

  // Scroll to current verse - runs after book/chapter reset
  useEffect(() => {
    if (currentVerse) {
      // Use a shorter timeout to ensure DOM updates complete
      // Reduced from 150ms to 80ms for snappier verse navigation
      const timeout = setTimeout(() => {
        // Try multiple methods to find and scroll to the verse
        const scrollToVerse = () => {
          // Method 1: Use ref
          const verseElement = verseRefs.current[currentVerse];
          if (verseElement) {
            verseElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
            return true;
          }

          // Method 2: Use data attribute selector
          const verseByDataAttr = document.querySelector(
            `[data-verse="${currentVerse}"]`,
          ) as HTMLElement;
          if (verseByDataAttr) {
            verseByDataAttr.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
            return true;
          }

          return false;
        };

        // Try immediately
        if (!scrollToVerse()) {
          // If first attempt fails, try again after a short delay (reduced from 200ms to 100ms)
          setTimeout(scrollToVerse, 100);
        }
      }, 80); // Reduced from 150ms for faster response

      return () => clearTimeout(timeout);
    }
  }, [currentVerse, currentBook, currentChapter, viewMode]);

  // Navigation handlers
  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      dispatch(
        addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`),
      );
      // mark immediate chapter change to suppress automatic projection sends
      lastChapterChangeRef.current = Date.now();
      dispatch(setCurrentChapter(Number(currentChapter) - 1));
    }
    dispatch(setCurrentVerse(1));
  };

  const handleNextChapter = () => {
    if (currentChapter < chapterCount) {
      dispatch(addToHistory(`${currentBook} ${currentChapter}`));
      // mark immediate chapter change to suppress automatic projection sends
      lastChapterChangeRef.current = Date.now();
      dispatch(setCurrentChapter(Number(currentChapter) + 1));
      dispatch(setCurrentVerse(1));
    }
  };

  // Bookmark functions
  const isBookmarked = (verse: number) => {
    return bookmarks.includes(`${currentBook} ${currentChapter}:${verse}`);
  };

  const toggleBookmark = (verse: number) => {
    const reference = `${currentBook} ${currentChapter}:${verse}`;
    if (isBookmarked(verse)) {
      dispatch(removeBookmark(reference));
    } else {
      dispatch(addBookmark(reference));
    }
  };

  // Highlight functions
  const highlightVerse = (verse: number, color: string) => {
    const verseKey = `${currentBook}-${currentChapter}-${verse}`;

    if (color === "reset") {
      const newHighlights = { ...highlightedVerses };
      delete newHighlights[verseKey];
      setHighlightedVerses(newHighlights);
    } else {
      setHighlightedVerses({
        ...highlightedVerses,
        [verseKey]: color,
      });
    }
  };

  const getVerseHighlight = (verse: number) => {
    const verseKey = `${currentBook}-${currentChapter}-${verse}`;
    return highlightedVerses[verseKey] || null;
  };

  // Convert fontSize string to numeric rem value for components
  const getFontSizeRem = () => {
    switch (fontSize) {
      case "xs":
        return 0.75; // 12px
      case "sm":
        return 0.875; // 14px
      case "base":
        return 1; // 16px
      case "small":
        return 1.25; // 20px (text-xl)
      case "medium":
        return 2.25; // 36px (text-4xl)
      case "large":
        return 3.75; // 60px (text-6xl)
      case "xl":
        return 6; // 96px (text-8xl)
      case "2xl":
        return 8; // 128px (text-9xl)
      default:
        return 1; // 16px
    }
  };

  // Share function
  const handleShare = async (text: string, title: string) => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: window.location.href,
        });
        console.log("Content shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        const shareText = `${title}\n\n${text}`;
        await navigator.clipboard.writeText(shareText);

        const notification = document.createElement("div");
        notification.textContent = "Copied to clipboard!";
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.left = "50%";
        notification.style.transform = "translateX(-50%)";
        notification.style.backgroundColor =
          theme === "dark" ? "#333" : "#f0f0f0";
        notification.style.color = theme === "dark" ? "#fff" : "#333";
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "5px";
        notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
        notification.style.zIndex = "1000";

        document.body.appendChild(notification);

        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        alert(
          "Failed to copy to clipboard. Your browser may not support this feature.",
        );
      }
    }
  };

  // Selection handlers
  const handleBookSelect = (book: string) => {
    if (currentBook !== book) {
      dispatch(
        addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`),
      );
    }

    // mark immediate book change so presentation guards can detect it
    lastBookChangeRef.current = Date.now();
    dispatch(setCurrentBook(book));
    dispatch(setCurrentChapter(1));
    dispatch(setCurrentVerse(1));
    setSelectedVerse(1);
    setIsBookDropdownOpen(false);

    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      setIsChapterDropdownOpen(true);
    }, 100);
  };

  const handleChapterSelect = (chapter: number) => {
    if (currentChapter !== chapter) {
      dispatch(
        addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`),
      );
    }

    // mark immediate chapter change so presentation guards can detect it
    lastChapterChangeRef.current = Date.now();
    dispatch(setCurrentChapter(chapter));
    dispatch(setCurrentVerse(1));
    setSelectedVerse(1);
    setIsChapterDropdownOpen(false);

    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      setIsVerseDropdownOpen(true);
    }, 100);
  };

  const handleVerseSelect = useCallback(
    (verse: number) => {
      // Only update if verse actually changed
      if (selectedVerse !== verse) {
        setSelectedVerse(verse);
        dispatch(setCurrentVerse(verse));

        // Send immediate update to presentation
        sendLiveUpdateToPresentation();

        if (verseRefs.current[verse]) {
          verseRefs.current[verse]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        dispatch(addToHistory(`${currentBook} ${currentChapter}:${verse}`));
        addToHistory(`${currentBook} ${currentChapter}:${verse}`);
      }
      setIsVerseDropdownOpen(false);
    },
    [
      selectedVerse,
      dispatch,
      currentBook,
      currentChapter,
      sendLiveUpdateToPresentation,
      addToHistory,
    ],
  );

  // Handler for verse clicks to set current verse
  const handleVerseClick = useCallback(
    (verse: number) => {
      // Only send projection updates when verse changed
      if (selectedVerse !== verse) {
        setSelectedVerse(verse);
        dispatch(setCurrentVerse(verse));

        // Send immediate update to presentation (same as handleVerseSelect)
        setTimeout(() => {
          sendLiveUpdateToPresentation();
        }, 50);

        // Removed scrollIntoView to prevent unwanted scroll-to-top behavior
        dispatch(addToHistory(`${currentBook} ${currentChapter}:${verse}`));
      }
    },
    [
      selectedVerse,
      dispatch,
      sendLiveUpdateToPresentation,
      currentBook,
      currentChapter,
      verseRefs,
    ],
  );

  // Get chapters and verses
  const getChapters = () => {
    const bookData = bibleData[currentTranslation]?.books.find(
      (b: Book) => b.name === currentBook,
    );
    return bookData?.chapters.map((chapter) => chapter.chapter) || [];
  };

  const getVerses = () => {
    return verses.map((verse) => verse.verse);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".book-dropdown") && isBookDropdownOpen) {
        setIsBookDropdownOpen(false);
      }
      if (!target.closest(".chapter-dropdown") && isChapterDropdownOpen) {
        setIsChapterDropdownOpen(false);
      }
      if (!target.closest(".verse-dropdown") && isVerseDropdownOpen) {
        setIsVerseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  // Handle verse-by-verse navigation
  const handleVerseByVerseNavigation = (direction: "prev" | "next") => {
    if (direction === "prev") {
      handlePreviousChapter();
    } else {
      handleNextChapter();
    }
  };

  // Initialize current verse if not set
  useEffect(() => {
    if (!currentVerse) {
      dispatch(setCurrentVerse(1));
    }
  }, [currentVerse, dispatch]);

  return (
    <div
      className={`h-screen flex flex-col overflow-y-scroll bg-white dark:bg-[#1c1c1c] no-scrollbar text-gray-900 dark:text-gray-100`}
      id="biblediv"
      ref={contentRef}
      style={{
        backgroundImage: "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Auto-scroll status indicator */}
      {autoScrollStatus && (
        <div className="fixed bottom-20 right-6 z-50">
          <div className=" text-white px-3 py-1.5 rounded-full text-[0.9rem] font-medium shadow-lg backdrop-blur-sm animate-pulse">
            {autoScrollStatus}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-left"
        isDarkMode={isDarkMode}
      />

      <BibleStudio
        currentBook={currentBook}
        currentChapter={currentChapter}
        currentVerse={currentVerse || 1}
        selectedVerse={selectedVerse}
        bookList={bookList}
        onBookSelect={handleBookSelect}
        onChapterSelect={handleChapterSelect}
        onVerseSelect={handleVerseSelect}
        getChapters={getChapters}
        getVerses={getVerses}
        isDarkMode={isDarkMode}
        onOpenPresentation={handleOpenBiblePresentation}
        projectionFontFamily={projectionFontFamily}
        projectionFontSize={projectionFontSize}
        projectionTextColor={projectionTextColor}
        projectionBackgroundImage={projectionBackgroundImage}
        projectionGradientColors={projectionGradientColors}
        currentTranslation={currentTranslation}
        bibleBgs={bibleBgs}
      />
    </div>
  );
};

export default ScriptureContent;
