import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setFontSize,
  setFontFamily,
  setReaderSettingsOpen,
  setViewMode,
  setFontWeight,
  setVerseByVerseMode,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  removeBookmark,
  setSearchTerm,
  setExactMatch,
  setWholeWords,
} from "@/store/slices/bibleSlice";
import { performSearch } from "@/store/slices/bibleThunks";
import {
  Type,
  X,
  LayoutGrid,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bookmark,
  Search as SearchIcon,
  Star,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";

type ViewState =
  | "settings"
  | "bookmarks"
  | "search"
  | "fontFamily"
  | "fontSize";

const ReaderSettingsDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<ViewState>("settings");
  const {
    fontSize,
    fontFamily,
    readerSettingsOpen,
    viewMode,
    verseByVerseMode,
    bookmarks,
    searchTerm,
    searchResults,
    exactMatch,
    wholeWords,
    bibleData,
    currentTranslation,
  } = useAppSelector((state) => state.bible);

  const fontFamilyOptions = [
    { value: "EB Garamond", text: "EB Garamond" },
    { value: "Anton SC", text: "Anton SC" },
    { value: "Big Shoulders Thin", text: "Big Shoulders" },
    { value: "Bitter Thin", text: "Bitter" },
    { value: "Oswald ExtraLight", text: "Oswald" },
    { value: "Archivo Black", text: "Archivo Black" },
    { value: "Roboto Thin", text: "Roboto" },
    { value: "Cooper Black", text: "Cooper Black" },
    { value: "Impact", text: "Impact" },
    { value: "Teko Light", text: "Teko" },
    { value: "serif", text: "Times New Roman" },
    { value: "sans-serif", text: "Arial" },
  ];

  const fontSizeOptions = [
    { value: "xs", text: "Extra Small", description: "0.75rem" },
    { value: "sm", text: "Small", description: "0.875rem" },
    { value: "base", text: "Base", description: "1rem" },
    { value: "small", text: "Small+", description: "1.125rem" },
    { value: "medium", text: "Medium", description: "1.25rem" },
    { value: "large", text: "Large", description: "1.5rem" },
  ];

  // Perform search when search term changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchTerm && currentView === "search") {
        dispatch(performSearch(searchTerm));
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, exactMatch, wholeWords, dispatch, currentView]);

  // Reset view when dropdown closes
  React.useEffect(() => {
    if (!readerSettingsOpen) {
      setCurrentView("settings");
    }
  }, [readerSettingsOpen]);

  const handleBookmarkClick = (bookmark: string) => {
    // Parse the bookmark format "Book Chapter:Verse"
    const parts = bookmark.split(" ");
    const chapterVerse = parts[parts.length - 1];
    const bookName = parts.slice(0, parts.length - 1).join(" ");

    if (chapterVerse.includes(":")) {
      const [chapter, verse] = chapterVerse.split(":");
      dispatch(setCurrentBook(bookName));
      dispatch(setCurrentChapter(parseInt(chapter)));
      dispatch(setCurrentVerse(parseInt(verse)));
    } else {
      dispatch(setCurrentBook(bookName));
      dispatch(setCurrentChapter(parseInt(chapterVerse)));
      dispatch(setCurrentVerse(1));
    }

    dispatch(setReaderSettingsOpen(false));
  };

  const handleSearchResultClick = (
    book: string,
    chapter: number,
    verse: number
  ) => {
    dispatch(setCurrentBook(book));
    dispatch(setCurrentChapter(chapter));
    dispatch(setCurrentVerse(verse));
    dispatch(setReaderSettingsOpen(false));
  };

  // Helper function to get scripture text for a bookmark reference
  const getScriptureText = (bookmark: string): string => {
    try {
      const parts = bookmark.split(" ");
      const chapterVerse = parts[parts.length - 1];
      const bookName = parts.slice(0, parts.length - 1).join(" ");

      if (
        !bibleData ||
        !currentTranslation ||
        !bibleData[currentTranslation] ||
        !bibleData[currentTranslation].books
      ) {
        return "Loading scripture text...";
      }

      // Find the book
      const book = bibleData[currentTranslation].books.find(
        (b: any) => b.name.toLowerCase() === bookName.toLowerCase()
      );

      if (!book) return "Book not found";

      if (chapterVerse.includes(":")) {
        const [chapterNum, verseNum] = chapterVerse.split(":");
        const chapter = book.chapters.find(
          (c: any) => c.chapter === parseInt(chapterNum)
        );
        if (!chapter) return "Chapter not found";

        const verse = chapter.verses.find(
          (v: any) => v.verse === parseInt(verseNum)
        );
        return verse ? verse.text : "Verse not found";
      } else {
        // Just chapter reference, return first verse
        const chapter = book.chapters.find(
          (c: any) => c.chapter === parseInt(chapterVerse)
        );
        if (!chapter || !chapter.verses.length) return "Chapter not found";

        return chapter.verses[0].text;
      }
    } catch (error) {
      console.error("Error loading scripture text:", error);
      return "Error loading scripture text";
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;

    const cleanTerm = term.replace(/\[|\]/g, "").trim();
    const regex = new RegExp(`(${cleanTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded font-medium"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const renderHeader = () => {
    const getTitle = () => {
      switch (currentView) {
        case "settings":
          return "Reader Settings";
        case "bookmarks":
          return "Bookmarks";
        case "search":
          return "Search Scripture";
        case "fontFamily":
          return "Select Font Family";
        case "fontSize":
          return "Select Font Size";
        default:
          return "Reader Tools";
      }
    };

    const getIcon = () => {
      switch (currentView) {
        case "settings":
          return <Settings className="w-3 h-3 text-primary" />;
        case "bookmarks":
          return <Bookmark className="w-3 h-3 text-primary" />;
        case "search":
          return <SearchIcon className="w-3 h-3 text-primary" />;
        case "fontFamily":
        case "fontSize":
          return <Type className="w-3 h-3 text-primary" />;
        default:
          return <Type className="w-3 h-3 text-primary" />;
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          {(currentView === "fontFamily" || currentView === "fontSize") && (
            <div
              onClick={() => setCurrentView("settings")}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-200 mr-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
            {getIcon()}
          </div>
          <span className="text-sm  font-semibold text-gray-800 dark:text-gray-200">
            Reader Tools
          </span>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-1">
          <div
            onClick={() => setCurrentView("settings")}
            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              currentView === "settings" ||
              currentView === "fontFamily" ||
              currentView === "fontSize"
                ? "text-primary bg-primary/20"
                : "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10"
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </div>

          <div
            onClick={() => setCurrentView("bookmarks")}
            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer relative ${
              currentView === "bookmarks"
                ? "text-primary bg-primary/20"
                : "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10"
            }`}
            title="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                {bookmarks.length > 9 ? "9" : bookmarks.length}
              </div>
            )}
          </div>

          <div
            onClick={() => setCurrentView("search")}
            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              currentView === "search"
                ? "text-primary bg-primary/20"
                : "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10"
            }`}
            title="Search"
          >
            <SearchIcon className="w-4 h-4" />
          </div>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

          <div
            onClick={() => dispatch(setReaderSettingsOpen(false))}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  const renderBookmarksView = () => (
    <div className="p-3 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {bookmarks.length > 0 ? (
          <div className="space-y-0">
            {bookmarks.map((bookmark, index) => {
              // Parse bookmark to get book and verse info
              const parts = bookmark.split(" ");
              const chapterVerse = parts[parts.length - 1];
              const bookName = parts.slice(0, parts.length - 1).join(" ");
              const scriptureText = getScriptureText(bookmark);

              return (
                <div key={index} className="relative group">
                  <div
                    onClick={() => handleBookmarkClick(bookmark)}
                    className="w-full pt-1 px-3 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-gray-200/50 dark:border-gray-700/50 last:border-b-0 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star
                            size={12}
                            className="text-amber-500 flex-shrink-0"
                          />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {bookmark}
                          </span>
                        </div>
                        {/* Scripture Text Preview */}
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed ">
                          "{truncateText(scriptureText, 100)}"
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Remove bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeBookmark(bookmark));
                    }}
                    className="absolute top-6 right-1.5 p-1 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X size={10} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bookmark
              size={40}
              className="text-gray-300 dark:text-gray-600 mb-3"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              No bookmarks yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Your saved verses will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSearchView = () => (
    <div className="p-3 h-full flex flex-col">
      {/* Search Input */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            placeholder="Search scripture..."
            className="w-full rounded-lg px-3 py-2.5 pl-9 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
          />
          <SearchIcon
            size={16}
            className="absolute left-2.5 top-2.5 text-gray-400 dark:text-gray-500"
          />
        </div>

        {/* Search Options */}
        <div className="flex items-center space-x-3 mt-2.5">
          <div
            onClick={() => dispatch(setExactMatch(!exactMatch))}
            className="flex items-center space-x-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors cursor-pointer"
          >
            {exactMatch ? (
              <ToggleRight size={14} className="text-primary" />
            ) : (
              <ToggleLeft size={14} />
            )}
            <span>Exact match</span>
          </div>
          <div
            onClick={() => dispatch(setWholeWords(!wholeWords))}
            className="flex items-center space-x-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors cursor-pointer"
          >
            {wholeWords ? (
              <ToggleRight size={14} className="text-primary" />
            ) : (
              <ToggleLeft size={14} />
            )}
            <span>Whole words</span>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {searchResults.length > 0 ? (
          <div className="space-y-0">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() =>
                  handleSearchResultClick(
                    result.book,
                    result.chapter,
                    result.verse
                  )
                }
                className="w-full py-1 px-3 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-gray-200/50 dark:border-gray-700/50 last:border-b-0 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {result.book} {result.chapter}:{result.verse}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {highlightSearchTerm(
                        truncateText(result.text, 120),
                        searchTerm
                      )}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <SearchIcon
              size={40}
              className="text-gray-300 dark:text-gray-600 mb-3"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              No results found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <SearchIcon
              size={40}
              className="text-gray-300 dark:text-gray-600 mb-3"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Enter a search term
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Search through scripture content
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="p-4 space-y-5 h-full">
      {/* Reading View Toggle */}
      <div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Reading View
        </div>
        <div className="flex bg-gray-100/80 dark:bg-primary/20 rounded-xl p-1.5">
          <div
            onClick={() => dispatch(setViewMode("block"))}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              viewMode === "block"
                ? "bg-white dark:bg-primary/50 text-primary dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Block
          </div>
          <div
            onClick={() => dispatch(setViewMode("paragraph"))}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              viewMode === "paragraph"
                ? "bg-white dark:bg-primary/50 text-primary shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Paragraph
          </div>
        </div>
      </div>

      {/* Font Size Button */}
      <div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Font Size
        </div>
        <div
          onClick={() => setCurrentView("fontSize")}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 cursor-pointer rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set Font Size
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-sm">
              {fontSizeOptions.find((opt) => opt.value === fontSize)?.text}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          </div>
        </div>
      </div>

      {/* Font Family Button */}
      <div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Font Family
        </div>
        <div
          onClick={() => setCurrentView("fontFamily")}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 cursor-pointer rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set Font Family
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-sm">
              {fontFamilyOptions.find((opt) => opt.value === fontFamily)?.text}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Preview
        </div>
        <div className="text-center py-4 px-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
          <p
            className="text-gray-900 dark:text-white font-medium mb-2"
            style={{
              fontFamily: fontFamily,
              fontSize:
                fontSize === "xs"
                  ? "11px"
                  : fontSize === "sm"
                  ? "12px"
                  : fontSize === "base"
                  ? "14px"
                  : fontSize === "small"
                  ? "16px"
                  : fontSize === "medium"
                  ? "18px"
                  : fontSize === "large"
                  ? "20px"
                  : fontSize === "xl"
                  ? "22px"
                  : "24px",
            }}
          >
            "For God so loved the world..."
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            John 3:16
          </div>
        </div>
      </div>
    </div>
  );

  const renderFontSizeView = () => (
    <div className="p-4">
      <div className="space-y-2 max-h-[calc(80vh-80px)] overflow-y-auto no-scrollbar">
        {fontSizeOptions.map((option) => (
          <div
            key={option.value}
            onClick={() => {
              dispatch(setFontSize(option.value));
              setCurrentView("settings");
            }}
            className={`w-full cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
              fontSize === option.value
                ? "bg-gradient-to-r from-primary/10 to-primary/15 dark:from-primary/15 dark:to-primary/10 border-primary/30 text-primary"
                : "bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/20 hover:border-primary/30 text-primary/70 hover:text-primary"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-left">
                <div className="font-medium">{option.text}</div>
                <div className="text-xs text-primary/60">
                  {option.description}
                </div>
              </div>
            </div>
            <div className="text-sm" style={{ fontSize: option.description }}>
              Aa
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFontFamilyView = () => (
    <div className="p-4">
      <div className="space-y-0 max-h-[calc(80vh-80px)] overflow-y-auto no-scrollbar">
        {fontFamilyOptions.map((option, index) => (
          <div
            key={option.value}
            onClick={() => {
              dispatch(setFontFamily(option.value));
              setCurrentView("settings");
            }}
            className={`w-full p-4 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-primary/20 last:border-b-0 cursor-pointer ${
              fontFamily === option.value
                ? "text-orange-300"
                : "text-primary hover:text-primary"
            }`}
          >
            <div className="text-left">
              <div className="font-medium mb-1">{option.text}</div>
              <div
                className="text-sm text-primary dark:text-white/60"
                style={{ fontFamily: option.value }}
              >
                "For God so loved the world..."
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!readerSettingsOpen || verseByVerseMode) return null;

  return (
    <AnimatePresence>
      {readerSettingsOpen && !verseByVerseMode && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={() => dispatch(setReaderSettingsOpen(false))}
          />

          {/* Multi-View Floating Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.5,
            }}
            className="absolute top-8 right-0 z-50 w-[300px] h-[80vh] bg-white/95 dark:bg-[#1f1c1a] bakdrop-blur-xl rounded-2xl border border-primary/20 dark:border-primary/30 shadow-2xl overflow-hidden"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            {renderHeader()}

            {/* Animated Content Views */}
            <div className="relative h-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.5,
                  }}
                  className="absolute inset-0"
                >
                  {currentView === "settings" && renderSettingsView()}
                  {currentView === "bookmarks" && renderBookmarksView()}
                  {currentView === "search" && renderSearchView()}
                  {currentView === "fontSize" && renderFontSizeView()}
                  {currentView === "fontFamily" && renderFontFamilyView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReaderSettingsDropdown;
