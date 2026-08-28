import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Book,
  Search,
  BookOpen,
  Hash,
  List,
  BookTemplate,
  HandshakeIcon,
  LucideAlignVerticalDistributeCenter,
  LucideAlignHorizontalDistributeCenter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BooksListCardProps {
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  bookList: any[];
  onBookSelect: (book: string) => void;
  onChapterSelect: (chapter: number) => void;
  onVerseSelect: (verse: number) => void;
  getChapters: () => number[];
  getVerses: () => number[];
  getCurrentChapterVerses: () => any[];
  isDarkMode: boolean;
}

/**
 * Card 2: Books, Chapters & Verses List
 * Organized navigation through Bible structure
 */
export const BooksListCard: React.FC<BooksListCardProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  bookList,
  onBookSelect,
  onChapterSelect,
  onVerseSelect,
  getChapters,
  getVerses,
  getCurrentChapterVerses,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<"books" | "chapters" | "verses">(
    "books",
  );
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const [isAlphabetical, setIsAlphabetical] = useState(false);
  const [showVerseText, setShowVerseText] = useState(
    localStorage.getItem("bibleStudio_showVerseText") === "true",
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter books based on search
  const filteredOldTestament =
    bookList
      ?.filter((book) => book.testament === "old")
      .filter((book) =>
        book.name.toLowerCase().includes(bookSearchQuery.toLowerCase()),
      )
      .sort((a, b) => (isAlphabetical ? a.name.localeCompare(b.name) : 0)) ||
    [];

  const filteredNewTestament =
    bookList
      ?.filter((book) => book.testament === "new")
      .filter((book) =>
        book.name.toLowerCase().includes(bookSearchQuery.toLowerCase()),
      )
      .sort((a, b) => (isAlphabetical ? a.name.localeCompare(b.name) : 0)) ||
    [];

  // Filter chapters based on search
  const chapters = getChapters();
  const getFilteredChapters = () => {
    if (!chapterSearchQuery.trim()) return chapters;
    return chapters.filter((chapter) =>
      chapter.toString().includes(chapterSearchQuery.trim()),
    );
  };

  // Filter verses based on search
  const verses = getVerses();
  const getFilteredVerses = () => {
    if (!verseSearchQuery.trim()) return verses;
    return verses.filter((verse) =>
      verse.toString().includes(verseSearchQuery.trim()),
    );
  };

  // Memoize chapter verses to avoid recalculating on every render
  const chapterVerses = useMemo(() => {
    return getCurrentChapterVerses();
  }, [getCurrentChapterVerses]);

  // Keyboard navigation for search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input when '/' is pressed
      if (
        e.key === "/" &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear search and blur on Escape
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        if (activeTab === "books") setBookSearchQuery("");
        else if (activeTab === "chapters") setChapterSearchQuery("");
        else setVerseSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const handleBookSelect = (bookName: string) => {
    onBookSelect(bookName);
    setActiveTab("chapters");
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterSelect(chapter);
    setActiveTab("verses");
  };

  const handleVerseSelect = (verse: number) => {
    onVerseSelect(verse);
  };

  const handleToggleVerseText = () => {
    const newValue = !showVerseText;
    setShowVerseText(newValue);
    localStorage.setItem("bibleStudio_showVerseText", String(newValue));
  };

  return (
    <div className="w-full h-full p-2.5 bg-card-bg overflow-hidden flex flex-col">
      <div className="flex flex-col h-full gap-2 overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-shrink-0 w-full">
          {/* Segmented tab control */}
          <div className="flex p-0.5 rounded-lg bg-card-bg-alt gap-0.5 shadow-2xs">
            {(
              [
                { id: "books", label: "Books", icon: <BookTemplate className="w-3.5 h-3.5" /> },
                { id: "chapters", label: `Ch ${currentChapter || 1}`, icon: <LucideAlignHorizontalDistributeCenter className="w-3.5 h-3.5" /> },
                { id: "verses", label: `Vs ${currentVerse || 1}`, icon: <LucideAlignVerticalDistributeCenter className="w-3.5 h-3.5" /> },
              ] as const
            ).map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  title={tab.label}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all duration-150 cursor-pointer text-xs font-semibold ${
                    isSelected
                      ? "bg-btn-active-from text-white shadow-xs font-bold"
                      : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
                  }`}
                >
                  {tab.icon}
                  <span className="text-[11px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* A-Z toggle */}
          {activeTab === "books" && (
            <button
              type="button"
              onClick={() => setIsAlphabetical(!isAlphabetical)}
              className={`p-1.5 px-2 rounded-md text-[10px] font-bold tracking-tight transition-all duration-150 cursor-pointer shadow-2xs ${
                isAlphabetical
                  ? "bg-btn-active-from text-white shadow-xs"
                  : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
              }`}
            >
              <span>A–Z</span>
            </button>
          )}

          {/* Verse text toggle */}
          {activeTab === "verses" && (
            <button
              type="button"
              onClick={handleToggleVerseText}
              className={`p-1.5 px-2 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer shadow-2xs ${
                showVerseText
                  ? "bg-btn-active-from text-white shadow-xs"
                  : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
              }`}
            >
              <span>{showVerseText ? "123" : "Abc"}</span>
            </button>
          )}

          {/* Search */}
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card-bg-alt min-w-0 shadow-2xs">
            <Search size={12} className="text-text-secondary flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={
                activeTab === "books"
                  ? bookSearchQuery
                  : activeTab === "chapters"
                    ? chapterSearchQuery
                    : verseSearchQuery
              }
              onChange={(e) => {
                if (activeTab === "books") setBookSearchQuery(e.target.value);
                else if (activeTab === "chapters")
                  setChapterSearchQuery(e.target.value);
                else setVerseSearchQuery(e.target.value);
              }}
              placeholder={`Search ${activeTab}…`}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none text-[0.78rem] border-none w-full min-w-0"
            />
            {(activeTab === "books" ? bookSearchQuery : activeTab === "chapters" ? chapterSearchQuery : verseSearchQuery) && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "books") setBookSearchQuery("");
                  else if (activeTab === "chapters") setChapterSearchQuery("");
                  else setVerseSearchQuery("");
                }}
                className="text-[10px] text-text-secondary hover:text-text-primary cursor-pointer px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-0.5 pb-8">
          {/* Books */}
          {activeTab === "books" && (
            <div className="grid grid-cols-2 gap-3 pb-6 items-start">
              {[
                { label: "Old Testament", books: filteredOldTestament },
                { label: "New Testament", books: filteredNewTestament },
              ].map(({ label, books }) => (
                <div key={label} className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-2 px-2.5 py-1.5 rounded-lg bg-card-bg-alt shadow-2xs sticky top-0 z-10">
                    <p className="text-[0.68rem] font-bold text-text-primary uppercase tracking-wider truncate">
                      {label}
                    </p>
                    <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-md bg-card-bg text-text-primary shadow-xs flex-shrink-0">
                      {books.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <AnimatePresence mode="popLayout">
                      {books.map((book, i) => (
                        <motion.div
                          key={book.name}
                          layout
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.75 }}
                          transition={{ duration: 0.15, delay: Math.min(i * 0.006, 0.15) }}
                        >
                          <button
                            type="button"
                            onClick={() => handleBookSelect(book.name)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer shadow-2xs hover:scale-102 active:scale-95 ${
                              currentBook === book.name
                                ? "bg-btn-active-from text-white shadow-xs font-bold scale-102"
                                : "bg-btn-normal-from hover:bg-select-hover text-text-primary border border-white/5 dark:border-white/5"
                            }`}
                          >
                            {book.name}
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chapters */}
          {activeTab === "chapters" && (
            <div className="space-y-2 pb-6">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[0.68rem] font-bold text-text-secondary uppercase tracking-wider">
                  {currentBook} — Chapters
                </span>
                <span className="text-[0.62rem] font-semibold text-text-secondary opacity-70">
                  {getFilteredChapters().length} total
                </span>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
                {getFilteredChapters().map((chapter) => (
                  <button
                    key={chapter}
                    type="button"
                    onClick={() => handleChapterSelect(chapter)}
                    className={`h-8 rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 ${
                      currentChapter === chapter
                        ? "bg-btn-active-from text-white shadow-xs scale-105"
                        : "bg-btn-normal-from hover:bg-select-hover text-text-primary border border-white/5 dark:border-white/5"
                    }`}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verses */}
          {activeTab === "verses" && (
            <div className="space-y-2 pb-6">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[0.68rem] font-bold text-text-secondary uppercase tracking-wider">
                  {currentBook} {currentChapter} — Verses
                </span>
                <span className="text-[0.62rem] font-semibold text-text-secondary opacity-70">
                  {getFilteredVerses().length} verses
                </span>
              </div>

              {showVerseText ? (
                <div className="flex flex-col gap-0.5">
                  {getFilteredVerses().map((verse) => {
                    const verseText =
                      chapterVerses && chapterVerses[verse - 1]
                        ? typeof chapterVerses[verse - 1] === "string"
                          ? chapterVerses[verse - 1]
                          : (chapterVerses[verse - 1] as any)?.text || ""
                        : "";

                    const isSelected = currentVerse === verse;

                    return (
                      <div
                        key={verse}
                        onClick={() => handleVerseSelect(verse)}
                        className={`flex items-start gap-2 px-2 py-1 rounded-md cursor-pointer transition-all duration-150 shadow-2xs ${
                          isSelected
                            ? "bg-btn-active-from text-white shadow-xs font-semibold"
                            : "bg-btn-normal-from hover:bg-select-hover text-text-primary border border-white/5 dark:border-white/5"
                        }`}
                      >
                        <span
                          className={`text-[0.68rem] font-bold flex-shrink-0 w-4 text-right pt-0.5 ${
                            isSelected ? "text-white" : "text-text-secondary opacity-80"
                          }`}
                        >
                          {verse}
                        </span>
                        <span
                          className={`text-[0.68rem] leading-snug ${
                            isSelected ? "text-white" : "text-text-primary"
                          }`}
                        >
                          {verseText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
                  {getFilteredVerses().map((verse) => (
                    <button
                      key={verse}
                      type="button"
                      onClick={() => handleVerseSelect(verse)}
                      className={`h-8 rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 ${
                        currentVerse === verse
                          ? "bg-btn-active-from text-white shadow-xs scale-105"
                          : "bg-btn-normal-from hover:bg-select-hover text-text-primary border border-white/5 dark:border-white/5"
                      }`}
                    >
                      {verse}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
