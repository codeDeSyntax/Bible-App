import React, { useState, useRef, useEffect, useMemo } from "react";
import { BentoCard } from "./BentoCard";
import { StudioButton } from "./StudioButton";
import { Book, Search, BookOpen, Hash, List } from "lucide-react";
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
  const getFilteredChapters = () => {
    const chapters = getChapters();
    if (!chapterSearchQuery) return chapters;
    return chapters.filter((chapter) =>
      chapter.toString().includes(chapterSearchQuery),
    );
  };

  // Filter verses based on search
  const getFilteredVerses = () => {
    const verses = getVerses();
    if (!verseSearchQuery) return verses;
    return verses.filter((verse) =>
      verse.toString().includes(verseSearchQuery),
    );
  };

  // Hoist chapter verses lookup — O(n) operation, must not run inside .map()
  const chapterVerses = useMemo(
    () => getCurrentChapterVerses(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentBook, currentChapter],
  );

  // Focus search input when tab changes
  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  const handleBookSelect = (bookName: string) => {
    onBookSelect(bookName);
    setBookSearchQuery(""); // Clear book search when book is selected
    setActiveTab("chapters");
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterSelect(chapter);
    setChapterSearchQuery(""); // Clear chapter search when chapter is selected
    setActiveTab("verses");
  };

  const handleVerseSelect = (verse: number) => {
    onVerseSelect(verse);
    setVerseSearchQuery(""); // Clear verse search when verse is selected
  };

  const handleToggleVerseText = () => {
    const newValue = !showVerseText;
    setShowVerseText(newValue);
    localStorage.setItem("bibleStudio_showVerseText", String(newValue));
  };

  return (
    <BentoCard
      title="Bible Navigation"
      isDarkMode={isDarkMode}
      icon={<Book className="w-4 h-4" style={{ color: "white" }} />}
      className="col-span-2 row-span-3 border-double border-4 border-select-border "
    >
      <div className="flex flex-col h-full gap-2">
        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Segmented tab control */}
          <div className="flex p-0.5 rounded-lg bg-studio-bg border border-select-border gap-0.5 border-double border-4 border-select-border">
            {(["books", "chapters", "verses"] as const).map((tab) => {
              const icons = {
                books: <BookOpen className="w-3.5 h-3.5" />,
                chapters: <Hash className="w-3.5 h-3.5" />,
                verses: <List className="w-3.5 h-3.5" />,
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  title={tab.charAt(0).toUpperCase() + tab.slice(1)}
                  className={`p-1.5 rounded-md transition-colors duration-150 cursor-pointer ${
                    activeTab === tab
                      ? "bg-gradient-to-br from-btn-active-from to-btn-active-to text-white"
                      : "text-text-secondary bg-white dark:bg-header-gradient-from hover:text-text-primary hover:bg-select-hover"
                  }`}
                >
                  {icons[tab]}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-studio-bg border border-select-border">
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
              placeholder={`Search ${activeTab}\u2026`}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none text-[0.78rem] border-none"
            />
          </div>

          {/* A-Z toggle */}
          {activeTab === "books" && (
            <StudioButton
              isActive={isAlphabetical}
              onClick={() => setIsAlphabetical(!isAlphabetical)}
            >
              <span className="text-[10px] font-bold tracking-tight">A–Z</span>
            </StudioButton>
          )}

          {/* Verse text toggle */}
          {activeTab === "verses" && (
            <StudioButton
              isActive={showVerseText}
              onClick={handleToggleVerseText}
            >
              <span className="text-[10px] font-bold">
                {showVerseText ? "123" : "Abc"}
              </span>
            </StudioButton>
          )}
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Books */}
          {activeTab === "books" && (
            <div className="flex flex-col gap-3">
              {[
                { label: "New Testament", books: filteredNewTestament },
                { label: "Old Testament", books: filteredOldTestament },
              ].map(({ label, books }) => (
                <div key={label}>
                  <p className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest mb-1.5 px-0.5">
                    {label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <AnimatePresence mode="popLayout">
                      {books.map((book, i) => (
                        <motion.div
                          key={book.name}
                          layout
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.75 }}
                          transition={{ duration: 0.18, delay: i * 0.012 }}
                        >
                          <StudioButton
                            isActive={currentBook === book.name}
                            onClick={() => handleBookSelect(book.name)}
                          >
                            {book.name}
                          </StudioButton>
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
            <div className="grid grid-cols-7 gap-1">
              {getFilteredChapters().map((chapter) => (
                <StudioButton
                  key={chapter}
                  isActive={currentChapter === chapter}
                  onClick={() => handleChapterSelect(chapter)}
                >
                  {chapter}
                </StudioButton>
              ))}
            </div>
          )}

          {/* Verses */}
          {activeTab === "verses" && (
            <div
              className={
                showVerseText ? "flex flex-col" : "grid grid-cols-7 gap-1"
              }
            >
              {getFilteredVerses().map((verse) => {
                const verseText =
                  chapterVerses && chapterVerses[verse - 1]
                    ? typeof chapterVerses[verse - 1] === "string"
                      ? String(chapterVerses[verse - 1])
                      : String((chapterVerses[verse - 1] as any).text || "")
                    : "";

                return showVerseText ? (
                  <div
                    key={verse}
                    onClick={() => handleVerseSelect(verse)}
                    className={`flex gap-3 px-2 py-1.5 border-b border-select-border cursor-pointer transition-colors duration-150 ${
                      currentVerse === verse
                        ? "bg-gradient-to-r from-btn-active-from to-btn-active-to"
                        : "hover:bg-select-hover"
                    }`}
                  >
                    <span
                      className={`text-[0.72rem] font-bold flex-shrink-0 w-5 text-right ${currentVerse === verse ? "text-white" : "text-text-secondary"}`}
                    >
                      {verse}
                    </span>
                    <span
                      className={`text-[0.78rem] leading-relaxed ${currentVerse === verse ? "text-white" : "text-text-primary"}`}
                    >
                      {verseText}
                    </span>
                  </div>
                ) : (
                  <StudioButton
                    key={verse}
                    isActive={currentVerse === verse}
                    onClick={() => handleVerseSelect(verse)}
                  >
                    {verse}
                  </StudioButton>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BentoCard>
  );
};
