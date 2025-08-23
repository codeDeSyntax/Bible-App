import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature } from "@/store/slices/bibleSlice";
import {
  BookOpen,
  ChevronDown,
  Grid3X3,
  AlignLeft,
  Bookmark,
  History,
  Search,
  Library,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Monitor,
  Play,
  Pause,
  RotateCcw,
  Radio,
  XCircle,
} from "lucide-react";
import { Tooltip } from "antd";
import { ViewMode, setViewMode } from "@/store/slices/bibleSlice";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";
import ShortcutsModal from "./ShortcutsModal";
import { useBibleProjectionState } from "@/features/bible/hooks/useBibleProjectionState";

interface FloatingActionBarProps {
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
  hideLayoutButtons?: boolean;
  isVerseByVerseView?: boolean;
  hasBackgroundImage?: boolean;
  onOpenPresentation?: () => void;
  // Auto-scroll props
  isAutoScrolling?: boolean;
  onToggleAutoScroll?: () => void;
  autoScrollSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  // Bookmark props for verse-by-verse view
  isCurrentVerseBookmarked?: boolean;
  onToggleCurrentVerseBookmark?: () => void;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
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
  handleVerseSelect,
  getChapters,
  getVerses,
  bookList,
  isDarkMode,
  handlePreviousChapter,
  handleNextChapter,
  hideLayoutButtons = false,
  isVerseByVerseView = false,
  hasBackgroundImage = false,
  onOpenPresentation,
  isAutoScrolling = false,
  onToggleAutoScroll,
  autoScrollSpeed = 25,
  onSpeedChange,
  isCurrentVerseBookmarked = false,
  onToggleCurrentVerseBookmark,
}) => {
  const { toggleActiveFeature } = useTheme();
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const viewMode = useAppSelector((state) => state.bible.viewMode);
  const readerSettingsOpen = useAppSelector(
    (state) => state.bible.readerSettingsOpen
  );

  // Projection state management
  const { isProjectionActive, closeProjection } = useBibleProjectionState();
  const [isProjectionLoading, setIsProjectionLoading] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const [filteredOldTestament, setFilteredOldTestament] = useState(
    bookList?.filter((book) => book.testament === "old") || []
  );
  const [filteredNewTestament, setFilteredNewTestament] = useState(
    bookList?.filter((book) => book.testament === "new") || []
  );

  // Refs for click-outside handling
  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const chapterDropdownRef = useRef<HTMLDivElement>(null);
  const verseDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chapterSearchInputRef = useRef<HTMLInputElement>(null);
  const verseSearchInputRef = useRef<HTMLInputElement>(null);

  // Handle projection with loading state
  const handleOpenPresentationWithLoading = async () => {
    if (!onOpenPresentation || isProjectionLoading) return;

    setIsProjectionLoading(true);
    try {
      await onOpenPresentation();
    } catch (error) {
      console.error("Failed to open presentation:", error);
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => setIsProjectionLoading(false), 1000);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Don't show FloatingActionBar if ReaderSettingsDropdown is open
      if (readerSettingsOpen) {
        setIsVisible(false);
        return;
      }

      // Only show when mouse is below title bar area
      if (e.clientY > 48 && e.clientY < 160) {
        setIsVisible(true);
      } else if (
        e.clientY > 200 &&
        !isBookDropdownOpen &&
        !isChapterDropdownOpen &&
        !isVerseDropdownOpen
      ) {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [
    isBookDropdownOpen,
    isChapterDropdownOpen,
    isVerseDropdownOpen,
    readerSettingsOpen,
  ]);

  useEffect(() => {
    const query = bookSearchQuery.toLowerCase();
    setFilteredOldTestament(
      bookList
        ?.filter((book) => book.testament === "old")
        .filter((book) => book.name.toLowerCase().includes(query)) || []
    );
    setFilteredNewTestament(
      bookList
        ?.filter((book) => book.testament === "new")
        .filter((book) => book.name.toLowerCase().includes(query)) || []
    );
  }, [bookSearchQuery, bookList]);

  // Click-outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside book dropdown
      if (
        isBookDropdownOpen &&
        bookDropdownRef.current &&
        !bookDropdownRef.current.contains(target)
      ) {
        setIsBookDropdownOpen(false);
      }

      // Check if click is outside chapter dropdown
      if (
        isChapterDropdownOpen &&
        chapterDropdownRef.current &&
        !chapterDropdownRef.current.contains(target)
      ) {
        setIsChapterDropdownOpen(false);
      }

      // Check if click is outside verse dropdown
      if (
        isVerseDropdownOpen &&
        verseDropdownRef.current &&
        !verseDropdownRef.current.contains(target)
      ) {
        setIsVerseDropdownOpen(false);
      }
    };

    if (isBookDropdownOpen || isChapterDropdownOpen || isVerseDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  // Focus search input when book dropdown opens
  useEffect(() => {
    if (isBookDropdownOpen && searchInputRef.current) {
      // Small delay to ensure the dropdown is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    // Clear search when dropdown closes
    if (!isBookDropdownOpen) {
      setBookSearchQuery("");
    }
  }, [isBookDropdownOpen]);

  // Focus search input when chapter dropdown opens
  useEffect(() => {
    if (isChapterDropdownOpen && chapterSearchInputRef.current) {
      setTimeout(() => {
        chapterSearchInputRef.current?.focus();
      }, 100);
    }

    if (!isChapterDropdownOpen) {
      setChapterSearchQuery("");
    }
  }, [isChapterDropdownOpen]);

  // Focus search input when verse dropdown opens
  useEffect(() => {
    if (isVerseDropdownOpen && verseSearchInputRef.current) {
      setTimeout(() => {
        verseSearchInputRef.current?.focus();
      }, 100);
    }

    if (!isVerseDropdownOpen) {
      setVerseSearchQuery("");
    }
  }, [isVerseDropdownOpen]);

  // Filter chapters based on search query
  const getFilteredChapters = () => {
    const chapters = getChapters();
    if (!chapterSearchQuery) return chapters;
    return chapters.filter((chapter) =>
      chapter.toString().includes(chapterSearchQuery)
    );
  };

  // Filter verses based on search query
  const getFilteredVerses = () => {
    const verses = getVerses();
    if (!verseSearchQuery) return verses;
    return verses.filter((verse) =>
      verse.toString().includes(verseSearchQuery)
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isBookDropdownOpen) {
      if (e.key === "Escape") {
        setIsBookDropdownOpen(false);
        setBookSearchQuery("");
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (
          searchInputRef.current &&
          document.activeElement !== searchInputRef.current
        ) {
          searchInputRef.current.focus();
        }
      }
    }

    if (isChapterDropdownOpen) {
      if (e.key === "Escape") {
        setIsChapterDropdownOpen(false);
        setChapterSearchQuery("");
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (
          chapterSearchInputRef.current &&
          document.activeElement !== chapterSearchInputRef.current
        ) {
          chapterSearchInputRef.current.focus();
        }
      }
    }

    if (isVerseDropdownOpen) {
      if (e.key === "Escape") {
        setIsVerseDropdownOpen(false);
        setVerseSearchQuery("");
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (
          verseSearchInputRef.current &&
          document.activeElement !== verseSearchInputRef.current
        ) {
          verseSearchInputRef.current.focus();
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  const oldTestamentBooks =
    bookList?.filter((book) => book.testament === "old") || [];
  const newTestamentBooks =
    bookList?.filter((book) => book.testament === "new") || [];

  const toggleFeature = (feature: string) => {
    dispatch(setActiveFeature(activeFeature === feature ? null : feature));
  };

  // Wrapper function for book selection that closes dropdown
  const handleBookSelectAndClose = (bookName: string) => {
    handleBookSelect(bookName);
    setIsBookDropdownOpen(false);
    setBookSearchQuery("");
  };

  // Wrapper function for chapter selection that closes dropdown
  const handleChapterSelectAndClose = (chapter: number) => {
    handleChapterSelect(chapter);
    setIsChapterDropdownOpen(false);
    setChapterSearchQuery("");
  };

  // Wrapper function for verse selection that closes dropdown
  const handleVerseSelectAndClose = (verse: number) => {
    handleVerseSelect(verse);
    setIsVerseDropdownOpen(false);
    setVerseSearchQuery("");
  };

  const barVariants = {
    hidden: {
      y: -20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="fixed top-12 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <AnimatePresence>
        {isVisible && !readerSettingsOpen && (
          <motion.div
            variants={barVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex items-center gap-4 px-6 py-3 rounded-full ${
              isVerseByVerseView && hasBackgroundImage
                ? "bg-white/10 dark:bg-black/10 backdrop-blur-md backdrop-saurate-150"
                : "bg-[#f9fafb] dark:bg-primary/20 bg-opacity-5 backdrop-blur-sm bg-f9fafb"
            } shadow-lg pointer-events-auto relative`}
          >
            {/* Navigation Controls */}
            <div className="flex items-center gap-3 ">
              {/* Previous Chapter Button */}
              <button
                onClick={handlePreviousChapter}
                disabled={currentChapter <= 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentChapter <= 1
                    ? "text-stone-300 dark:text-stone-500 cursor-not-allowed"
                    : `text-stone-400 dark:text-[#faeed1] ${
                        isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 dark:bg-black/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20"
                          : "bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                      }`
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Book Dropdown */}
              <div className="relative book-dropdown" ref={bookDropdownRef}>
                <button
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg focus:ring-0 ring-gray-500 focus:outline-none shadow transition-colors duration-200 ${
                    isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/10 dark:bg-black/10 backdrop-blur-3xl text-white hover:bg-white/20 dark:hover:bg-black/20"
                      : "bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] text-stone-600 dark:text-stone-300"
                  }`}
                  onClick={() => {
                    setIsBookDropdownOpen(!isBookDropdownOpen);
                    setIsChapterDropdownOpen(false);
                    setIsVerseDropdownOpen(false);
                  }}
                >
                  <span
                    className={`text-[12px] font-medium font-bitter ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white"
                        : "text-stone-500 dark:text-gray-50"
                    }`}
                  >
                    {currentBook}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white/70"
                        : "text-gray-400"
                    } ${isBookDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Book Dropdown Content */}
                {isBookDropdownOpen && (
                  <div
                    className={`absolute left-0 mt-2 w-[38vw] ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "bg-white/10 dark:bg-white/10 backdrop-blur-xl -150 shadow-xl"
                        : "bg-white dark:bg-[#30261d]"
                    } rounded-3xl shadow-lg z-[30] max-h-96 overflow-y-auto no-scrollbar p-4`}
                    style={{
                      maxWidth: "calc(100vw - 2rem)",
                    }}
                  >
                    <div className="p-3">
                      {/* Search Input */}
                      <div
                        className={`relative mb-4 group border-none w-[50%] ${
                          isVerseByVerseView && hasBackgroundImage
                            ? ""
                            : "border border-gray-200 dark:border-gray-700"
                        } rounded-xl overflow-hidden`}
                      >
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Search
                            size={16}
                            className={
                              isVerseByVerseView && hasBackgroundImage
                                ? "text-white/50"
                                : "text-gray-400 dark:text-gray-500"
                            }
                          />
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={bookSearchQuery}
                          onChange={(e) => setBookSearchQuery(e.target.value)}
                          placeholder="Search books..."
                          className={`w-full py-2.5 pl-10 pr-4 border-none ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-white/50"
                              : "bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 focus:bg-gray-100/50 dark:focus:bg-gray-800/30 text-stone-600 dark:text-stone-300 placeholder-stone-400 dark:placeholder-stone-500"
                          } outline-none text-sm transition-colors duration-200`}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsBookDropdownOpen(false);
                              setBookSearchQuery("");
                            }
                          }}
                        />
                        <div
                          className={`absolute bottom-0 left-0 w-full h-[1px] transition-transform duration-300 transform origin-left ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/30"
                              : "bg-primary/30 dark:bg-primary/20"
                          } scale-x-0 group-focus-within:scale-x-100`}
                        />
                      </div>
                      <h2
                        className={`text-sm font-semibold mb-2 pt-2 border-t ${
                          isVerseByVerseView && hasBackgroundImage
                            ? "border-white/20 text-white"
                            : "border-gray-200 dark:border-gray-700 text-stone-400"
                        }`}
                      >
                        New Testament
                      </h2>
                      <div className="flex flex-wrap gap-1">
                        <AnimatePresence mode="popLayout">
                          {filteredNewTestament.map((book, index) => (
                            <motion.div
                              key={book.name}
                              layout
                              initial={{
                                opacity: 0,
                                scale: 0.8,
                                filter: "blur(4px)",
                                y: 10,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                                y: 0,
                              }}
                              exit={{
                                opacity: 0,
                                scale: 0.6,
                                filter: "blur(6px)",
                                y: -5,
                              }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.02,
                                ease: [0.25, 0.46, 0.45, 0.94],
                                layout: { duration: 0.2 },
                              }}
                              className={`p-2 cursor-pointer text-[12px] flex items-center justify-center hover:ring-1 hover-ring-primary dark:hover:ring-white   transition-colors duration-150 ${
                                currentBook === book.name
                                  ? isVerseByVerseView && hasBackgroundImage
                                    ? " bg-gradient-to-r from-transparent via-white to-transparent shadow  text-black font-medium ring1 ring-white/30 cursor-not-allowed "
                                    : "bg-primary shadow text-white dark:bg-primary dark:text-white font-medium ring-2  ring-primary/20 dark:ring-primary/40"
                                  : isVerseByVerseView && hasBackgroundImage
                                  ? "bg-gradient-to-l shadow from-transparent via-white/20 to-transparent   text-white hover:bg-white/20 "
                                  : "text-stone-500 dark:text-[#faeed1] bg-gradient-to-r from-transparent dark:via-yellow-900 via-primary/20  to-transparent cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                              }`}
                              onClick={() =>
                                handleBookSelectAndClose(book.name)
                              }
                            >
                              {book.name}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      <h2
                        className={`text-sm font-semibold mb-2 font-serif ${
                          isVerseByVerseView && hasBackgroundImage
                            ? "text-white"
                            : "text-stone-500 dark:text-[#faeed1]"
                        }`}
                      >
                        Old Testament
                      </h2>
                      <div className="flex flex-wrap gap-1 mb-4">
                        <AnimatePresence mode="popLayout">
                          {filteredOldTestament.map((book, index) => (
                            <motion.div
                              key={book.name}
                              layout
                              initial={{
                                opacity: 0,
                                scale: 0.8,
                                filter: "blur(4px)",
                                y: 10,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                                y: 0,
                              }}
                              exit={{
                                opacity: 0,
                                scale: 0.6,
                                filter: "blur(6px)",
                                y: -5,
                              }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.02,
                                ease: [0.25, 0.46, 0.45, 0.94],
                                layout: { duration: 0.2 },
                              }}
                              className={`p-2 z-50 cursor-pointer  text-[12px] flex items-center justify-center hover:ring-1 hover-ring-primary dark:hover:ring-white  transition-colors duration-150 ${
                                currentBook === book.name
                                  ? isVerseByVerseView && hasBackgroundImage
                                    ? " bg-gradient-to-r from-transparent via-white to-transparent shadow  text-black font-medium ring1 ring-white/30 cursor-not-allowed "
                                    : "bg-primary shadow text-white dark:bg-primary dark:text-white font-medium ring-2  ring-primary/20 dark:ring-primary/40"
                                  : isVerseByVerseView && hasBackgroundImage
                                  ? "bg-gradient-to-l shadow from-transparent via-white/20 to-transparent   text-white hover:bg-white/20 "
                                  : "text-stone-500 dark:text-[#faeed1] bg-gradient-to-r from-transparent dark:via-yellow-900 via-primary/20  to-transparent cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                              }`}
                              onClick={() =>
                                handleBookSelectAndClose(book.name)
                              }
                            >
                              {book.name}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter Dropdown */}
              <div
                className="relative chapter-dropdown"
                ref={chapterDropdownRef}
              >
                <button
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg focus:ring-0 ring-gray-500 focus:outline-none shadow transition-colors duration-200 ${
                    isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/10 dark:bg-black/10 backdrop-blur-md text-white hover:bg-white/20 dark:hover:bg-black/20"
                      : "bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] text-stone-600 dark:text-stone-300"
                  }`}
                  onClick={() => {
                    setIsChapterDropdownOpen(!isChapterDropdownOpen);
                    setIsBookDropdownOpen(false);
                    setIsVerseDropdownOpen(false);
                  }}
                >
                  <span
                    className={`text-[12px] font-medium font-bitter ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white"
                        : "text-stone-500 dark:text-gray-50"
                    }`}
                  >
                    {currentChapter}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white/70"
                        : "text-gray-400"
                    } ${isChapterDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Chapter Dropdown Content */}
                {isChapterDropdownOpen && (
                  <div
                    className={`absolute mt-2 w-52 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "bg-white/10 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 shadow-xl"
                        : "bg-white dark:bg-[#30261d]"
                    } rounded-3xl shadow-lg z-[30] max-h-60 overflow-y-auto no-scrollbar p-4`}
                  >
                    {/* Chapter Search Input */}
                    <div className="p-2 mb-3">
                      <div
                        className={`relative group border-none ${
                          isVerseByVerseView && hasBackgroundImage
                            ? ""
                            : "border border-gray-200 dark:border-gray-700"
                        } rounded-xl overflow-hidden`}
                      >
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Search
                            size={14}
                            className={
                              isVerseByVerseView && hasBackgroundImage
                                ? "text-white/50"
                                : "text-gray-400 dark:text-gray-500"
                            }
                          />
                        </div>
                        <input
                          ref={chapterSearchInputRef}
                          type="text"
                          value={chapterSearchQuery}
                          onChange={(e) =>
                            setChapterSearchQuery(e.target.value)
                          }
                          placeholder="Search chapters..."
                          className={`w-full py-2 pl-9 pr-3 border-none ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-white/50"
                              : "bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 focus:bg-gray-100/50 dark:focus:bg-gray-800/30 text-stone-600 dark:text-stone-300 placeholder-stone-400 dark:placeholder-stone-500"
                          } outline-none text-xs transition-colors duration-200`}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsChapterDropdownOpen(false);
                              setChapterSearchQuery("");
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-2 grid grid-cols-5 gap-1">
                      {getFilteredChapters().map((chapter) => (
                        <div
                          key={chapter}
                          className={`p-2 text-[12px] flex items-center justify-center shadow rounded-full transition-colors duration-150 ${
                            currentChapter === chapter
                              ? isVerseByVerseView && hasBackgroundImage
                                ? "bg-white/30 text-white font-medium"
                                : "bg-transparent text-stone-700 hover:text-stone-900 cursor-not-allowed dark:text-stone-200 font-medium"
                              : isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "text-stone-500 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                          }`}
                          onClick={() => handleChapterSelectAndClose(chapter)}
                        >
                          {chapter}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verse Dropdown */}
              <div className="relative verse-dropdown" ref={verseDropdownRef}>
                <button
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg focus:ring-0 ring-gray-500 focus:outline-none shadow transition-colors duration-200 ${
                    isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/10 dark:bg-black/10 backdrop-blur-md text-white hover:bg-white/20 dark:hover:bg-black/20"
                      : "bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] text-stone-600 dark:text-stone-300"
                  }`}
                  onClick={() => {
                    setIsVerseDropdownOpen(!isVerseDropdownOpen);
                    setIsBookDropdownOpen(false);
                    setIsChapterDropdownOpen(false);
                  }}
                >
                  <span
                    className={`text-[12px] font-medium font-bitter ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white"
                        : "text-stone-500 dark:text-gray-50"
                    }`}
                  >
                    v {selectedVerse || 1}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white/70"
                        : "text-gray-400"
                    } ${isVerseDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Verse Dropdown Content */}
                {isVerseDropdownOpen && (
                  <div
                    className={`absolute mt-2 w-52 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "bg-white/10 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 shadow-xl"
                        : "bg-white dark:bg-[#30261d]"
                    } rounded-3xl shadow-lg z-[30] max-h-60 overflow-y-auto no-scrollbar p-4`}
                  >
                    {/* Verse Search Input */}
                    <div className="p-2 mb-3">
                      <div
                        className={`relative group border-none ${
                          isVerseByVerseView && hasBackgroundImage
                            ? ""
                            : "border border-gray-200 dark:border-gray-700"
                        } rounded-xl overflow-hidden`}
                      >
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Search
                            size={14}
                            className={
                              isVerseByVerseView && hasBackgroundImage
                                ? "text-white/50"
                                : "text-gray-400 dark:text-gray-500"
                            }
                          />
                        </div>
                        <input
                          ref={verseSearchInputRef}
                          type="text"
                          value={verseSearchQuery}
                          onChange={(e) => setVerseSearchQuery(e.target.value)}
                          placeholder="Search verses..."
                          className={`w-full py-2 pl-9 pr-3 border-none ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-white/50"
                              : "bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 focus:bg-gray-100/50 dark:focus:bg-gray-800/30 text-stone-600 dark:text-stone-300 placeholder-stone-400 dark:placeholder-stone-500"
                          } outline-none text-xs transition-colors duration-200`}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsVerseDropdownOpen(false);
                              setVerseSearchQuery("");
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-2 grid grid-cols-5 gap-1">
                      {getFilteredVerses().map((verse) => (
                        <div
                          key={verse}
                          className={`p-2 text-[12px] flex items-center justify-center shadow rounded-full transition-colors duration-150 ${
                            selectedVerse === verse
                              ? isVerseByVerseView && hasBackgroundImage
                                ? "bg-white/30 text-white font-medium"
                                : "bg-transparent text-stone-700 hover:text-stone-900 cursor-not-allowed dark:text-stone-200 font-medium"
                              : isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "text-stone-500 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                          }`}
                          onClick={() => handleVerseSelectAndClose(verse)}
                        >
                          {verse}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Chapter Button */}
              <button
                onClick={handleNextChapter}
                disabled={currentChapter >= chapterCount}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentChapter >= chapterCount
                    ? "text-stone-300 dark:text-stone-500 cursor-not-allowed"
                    : `text-stone-400 dark:text-[#faeed1] ${
                        isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 dark:bg-black/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20"
                          : "bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                      }`
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Layout Controls - Only show if not hidden */}
            {!hideLayoutButtons && (
              <div className="flex items-center gap-2 ml-2">
                <Tooltip title="Block View" placement="bottom">
                  <button
                    onClick={() => dispatch(setViewMode("block"))}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === "block"
                        ? "bg-primary text-white"
                        : "text-stone-400 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                    }`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                </Tooltip>
                <Tooltip title="Paragraph View" placement="bottom">
                  <button
                    onClick={() => dispatch(setViewMode("paragraph"))}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === "paragraph"
                        ? "bg-primary text-white"
                        : "text-stone-400 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                    }`}
                  >
                    <AlignLeft size={16} />
                  </button>
                </Tooltip>

                {/* Auto-scroll button - only for block and paragraph views */}
                {(viewMode === "block" || viewMode === "paragraph") &&
                  onToggleAutoScroll && (
                    <div className="relative">
                      <Tooltip
                        title="Auto-Scroll (Currently Disabled)"
                        placement="bottom"
                      >
                        <button
                          onClick={() => {}} // Disabled - no action
                          disabled={true}
                          className="p-2 rounded-lg transition-colors duration-200 opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 relative"
                        >
                          <Play size={16} />
                          {/* Disabled indicator */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <XCircle
                              size={8}
                              className="text-red-500 dark:text-primary bg-white dark:bg-[#faeed1] rounded-full"
                            />
                          </div>
                        </button>
                      </Tooltip>

                      {/* Speed selector - absolutely positioned under the play button */}
                      {onSpeedChange && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-30">
                          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full px-1.5 py-0.5 shadow-lg border border-white/20 dark:border-white/10">
                            <div
                              className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide"
                              style={{ maxWidth: "90px" }}
                            >
                              {[
                                400, 600, 800, 1000, 1500, 2000, 3000, 4000,
                                5000, 6000,
                              ].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => onSpeedChange(speed)}
                                  className={`px-1.5 py-0.5 text-[10px] rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 bg-primary ${
                                    autoScrollSpeed === speed
                                      ? "bg-orange-500/80 text-white shadow-sm scale-105"
                                      : "text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/20"
                                  }`}
                                  style={{ minWidth: "18px", fontSize: "9px" }}
                                >
                                  {speed}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* Divider */}
            <div className="h-6 mx-2 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Feature Buttons */}
            <div className="flex items-center gap-2">
              {/* Bookmark current verse button - only for verse-by-verse view */}
              {isVerseByVerseView && onToggleCurrentVerseBookmark && (
                <Tooltip
                  title={
                    isCurrentVerseBookmarked
                      ? "Remove current verse bookmark"
                      : "Bookmark current verse"
                  }
                  placement="bottom"
                >
                  <button
                    onClick={onToggleCurrentVerseBookmark}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isCurrentVerseBookmarked
                        ? isVerseByVerseView && hasBackgroundImage
                          ? "bg-primary/30 text-orange-200 shadow"
                          : "bg-orange-500 text-white shadow"
                        : isVerseByVerseView && hasBackgroundImage
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "text-stone-500 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] hover:bg-orange-500/10 dark:hover:bg-orange-500/10 hover:text-orange-500 dark:hover:text-orange-400"
                    }`}
                  >
                    <Bookmark
                      size={16}
                      fill={isCurrentVerseBookmarked ? "currentColor" : "none"}
                    />
                  </button>
                </Tooltip>
              )}

              {/* Show feature buttons only in verse-by-verse view */}
              {isVerseByVerseView && (
                <>
                  <Tooltip title="View All Bookmarks" placement="bottom">
                    <div className="relative">
                      <button
                        onClick={() => toggleFeature("bookmarks")}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          activeFeature === "bookmarks"
                            ? isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/30 text-white shadow"
                              : "bg-primary text-white shadow"
                            : isVerseByVerseView && hasBackgroundImage
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "text-stone-500 dark:text-[#8e5d37] bg-white dark:bg-primary/20 hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                        }`}
                      >
                        <Bookmark size={16} />
                      </button>
                      {/* Badge showing number of bookmarks */}
                      {bookmarks.length > 0 && (
                        <div
                          className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-medium ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-orange-500 text-white"
                              : "bg-red-500 text-white"
                          } shadow-sm`}
                        >
                          {bookmarks.length > 99 ? "99+" : bookmarks.length}
                        </div>
                      )}
                    </div>
                  </Tooltip>

                  <Tooltip title="History" placement="bottom">
                    <button
                      onClick={() => toggleFeature("history")}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        activeFeature === "history"
                          ? isVerseByVerseView && hasBackgroundImage
                            ? "bg-white/30 text-white shadow"
                            : "bg-primary text-white shadow"
                          : isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "text-stone-500 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                      }`}
                    >
                      <History size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Search" placement="bottom">
                    <button
                      onClick={() => toggleFeature("search")}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        activeFeature === "search"
                          ? isVerseByVerseView && hasBackgroundImage
                            ? "bg-white/30 text-white shadow"
                            : "bg-primary text-white shadow"
                          : isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "text-stone-500 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                      }`}
                    >
                      <Search size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Library" placement="bottom">
                    <button
                      onClick={() => toggleFeature("library")}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        activeFeature === "library"
                          ? isVerseByVerseView && hasBackgroundImage
                            ? "bg-white/30 text-white shadow"
                            : "bg-primary text-white shadow"
                          : isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "text-stone-500 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                      }`}
                    >
                      <Library size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Keyboard Shortcuts" placement="bottom">
                    <button
                      onClick={() => toggleFeature("shortcuts")}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        activeFeature === "shortcuts"
                          ? isVerseByVerseView && hasBackgroundImage
                            ? "bg-white/30 text-white shadow"
                            : "bg-primary text-white shadow"
                          : isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "text-stone-500 dark:text-[#faeed1] bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                      }`}
                    >
                      <Keyboard size={16} />
                    </button>
                  </Tooltip>

                  {onOpenPresentation && (
                    <div className="flex items-center gap-2">
                      <Tooltip
                        title="Open Bible Presentation"
                        placement="bottom"
                      >
                        <button
                          onClick={handleOpenPresentationWithLoading}
                          disabled={isProjectionLoading}
                          className={`p-2 rounded-lg transition-colors duration-200 relative ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "text-orange-500 dark:text-orange-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                          } ${
                            isProjectionLoading
                              ? "opacity-75 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isProjectionLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Monitor size={16} />
                          )}
                        </button>
                      </Tooltip>

                      {/* Live Indicator - only show when projection is active */}
                      {isProjectionActive && (
                        <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-500 bg-opacity-10 border border-red-300">
                          <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                          <span className="text-red-600 text-xs font-medium">
                            LIVE
                          </span>
                          <Tooltip
                            title="Close Bible projection"
                            placement="bottom"
                          >
                            <XCircle
                              className="w-3 h-3 text-red-500 hover:text-red-700 cursor-pointer ml-1"
                              onClick={closeProjection}
                            />
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionBar;
