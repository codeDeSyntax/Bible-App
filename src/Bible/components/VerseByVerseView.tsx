import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  setCurrentChapter,
  setCurrentVerse,
  addBookmark,
  removeBookmark,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import FloatingActionBar from "./FloatingActionBar";

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

  // Helper function to convert projection font size to pixels
  const getProjectionFontSize = () => `${projectionFontSize}px`;

  const { getCurrentChapterVerses } = useBibleOperations();
  const containerRef = useRef<HTMLDivElement>(null);

  //   const fontSize = useAppSelector((state) => state.bible.fontSize);
  //   const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  //   const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);

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

  // Scroll to top when verse changes (for navigation)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentVerse, currentChapter, currentBook]);

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
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVerse, currentChapter]);

  // Debug effect to track color changes
  useEffect(() => {
    console.log(
      "VerseByVerseView - projectionTextColor changed:",
      projectionTextColor
    );
    console.log("VerseByVerseView - isDarkMode:", isDarkMode);
  }, [projectionTextColor, isDarkMode]);

  const getChapterVerseCount = (chapter: number) => {
    const verses = getVerses();
    return verses.length;
  };

  const onVerseSelect = (verse: number) => {
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

  // Only allow background if in fullscreen
  const showBackground = imageBackgroundMode && isFullScreen;

  // Debug effect to track background image changes
  useEffect(() => {
    console.log(
      "VerseByVerseView - projectionBackgroundImage changed:",
      projectionBackgroundImage
    );
    console.log("VerseByVerseView - showBackground:", showBackground);
    console.log("VerseByVerseView - imageBackgroundMode:", imageBackgroundMode);
    console.log("VerseByVerseView - isFullScreen:", isFullScreen);
  }, [
    projectionBackgroundImage,
    showBackground,
    imageBackgroundMode,
    isFullScreen,
  ]);

  // Determine text color based on background and theme
  const getTextColor = () => {
    // If there's a background image, always use white for readability
    if (showBackground) {
      return "#ffffff";
    }

    // Always use the projection text color from appearance settings
    // This is what the appearance section in the control room controls
    console.log(
      "Using projectionTextColor from appearance section:",
      projectionTextColor
    );
    return projectionTextColor;
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-start min-h-screen w-full overflow-x-hidden overflow-y-scroll no-scrollbar ${
        showBackground
          ? "bg-cover bg-center bg-no-repeat"
          : "bg-white dark:bg-ltgray"
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
          : {}
      }
    >
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

      {/* Verse Display */}
      <div className="flex-1 flex items-center justify-center w-full px-8 md:px-8 lg:px-8">
        {/* Large Verse Number for Audience - Top Left */}

        <AnimatePresence>
          {!(
            isBookDropdownOpen ||
            isChapterDropdownOpen ||
            isVerseDropdownOpen
          ) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-center pb-20 max-w-3xl px-4 md:max-w-7xl leading-relaxed font-bold`}
              style={{
                fontFamily: projectionFontFamily,
                fontWeight: "bold",
                lineHeight: "1.3",
                fontSize: getProjectionFontSize(),
                color: getTextColor(),
              }}
            >
              <span className="font-normal italic mr-5 font-bitter text-red-500">
                {displayVerse}
              </span>
              {currentVerseText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-8">
        <button
          onClick={handlePrevVerse}
          disabled={currentVerse === 1 && currentChapter === 1}
          className={`p-4 rounded-full ${
            showBackground
              ? "bg-black/40 text-white"
              : "bg-white dark:bg-[#3d332a] text-stone-600 dark:text-stone-300"
          } hover:bg-opacity-80 transition-colors duration-200 ${
            currentVerse === 1 && currentChapter === 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNextVerse}
          disabled={
            currentVerse === totalVerses && currentChapter === chapterCount
          }
          className={`p-4 rounded-full ${
            showBackground
              ? "bg-black/40 text-white"
              : "bg-white dark:bg-[#3d332a] text-stone-600 dark:text-stone-300"
          } hover:bg-opacity-80 transition-colors duration-200 ${
            currentVerse === totalVerses && currentChapter === chapterCount
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Display current verse number and total verses */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 text-sm">
        <span
          className={
            showBackground ? "text-white" : "text-gray-600 dark:text-gray-300"
          }
        >
          Verse {displayVerse} of {totalVerses}
        </span>
      </div>
    </div>
  );
};

export default VerseByVerseView;
