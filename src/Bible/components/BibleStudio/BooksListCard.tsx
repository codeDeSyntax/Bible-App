import React, { useState, useRef, useEffect } from "react";
import { BentoCard } from "./BentoCard";
import { StudioButton } from "./StudioButton";
import { Book, Search, ChevronDown, BookOpen, Hash, List } from "lucide-react";
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
    "books"
  );
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const [isAlphabetical, setIsAlphabetical] = useState(false);
  const [showVerseText, setShowVerseText] = useState(
    localStorage.getItem("bibleStudio_showVerseText") === "true"
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter books based on search
  const filteredOldTestament =
    bookList
      ?.filter((book) => book.testament === "old")
      .filter((book) =>
        book.name.toLowerCase().includes(bookSearchQuery.toLowerCase())
      )
      .sort((a, b) => (isAlphabetical ? a.name.localeCompare(b.name) : 0)) ||
    [];

  const filteredNewTestament =
    bookList
      ?.filter((book) => book.testament === "new")
      .filter((book) =>
        book.name.toLowerCase().includes(bookSearchQuery.toLowerCase())
      )
      .sort((a, b) => (isAlphabetical ? a.name.localeCompare(b.name) : 0)) ||
    [];

  // Filter chapters based on search
  const getFilteredChapters = () => {
    const chapters = getChapters();
    if (!chapterSearchQuery) return chapters;
    return chapters.filter((chapter) =>
      chapter.toString().includes(chapterSearchQuery)
    );
  };

  // Filter verses based on search
  const getFilteredVerses = () => {
    const verses = getVerses();
    if (!verseSearchQuery) return verses;
    return verses.filter((verse) =>
      verse.toString().includes(verseSearchQuery)
    );
  };

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
      className="col-span-2 row-span-3"
    >
      <div className="space-y-2 flex flex-col h-full">
        {/* Tab Selector */}
        <div className="flex gap-2 flex-shrink-0 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("books")}
              className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
              style={{
                background:
                  activeTab === "books"
                    ? `linear-gradient(145deg, var(--btn-active-from), var(--btn-active-to))`
                    : `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                boxShadow: isDarkMode
                  ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                  : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                color: `var(--text-primary)`,
              }}
              title="Books"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab("chapters")}
              className="px-2 py-2 rounded-lg text-[0.9rem] font-medium transition-all duration-200 flex items-center justify-center"
              style={{
                background:
                  activeTab === "chapters"
                    ? `linear-gradient(145deg, var(--btn-active-from), var(--btn-active-to))`
                    : `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                boxShadow: isDarkMode
                  ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                  : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                color: `var(--text-primary)`,
              }}
              title="Chapters"
            >
              <Hash className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab("verses")}
              className="px-2 py-2 rounded-lg text-[0.9rem] font-medium transition-all duration-200 flex items-center justify-center"
              style={{
                background:
                  activeTab === "verses"
                    ? `linear-gradient(145deg, var(--btn-active-from), var(--btn-active-to))`
                    : `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                boxShadow: isDarkMode
                  ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                  : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                color: `var(--text-primary)`,
              }}
              title="Verses"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative group border border-select-border rounded-xl overflow-hidden flex-shrink-0">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={14} className="text-text-secondary" />
            </div>
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
              placeholder={`Search ${activeTab}...`}
              className="w-full py-2 pl-9 pr-3 bg-select-bg hover:bg-select-bg-alt focus:bg-select-bg-alt text-text-primary placeholder-text-secondary outline-none text-[0.9rem] transition-colors duration-200 border-none"
            />
          </div>

          {/* Alphabetical Toggle - Only visible on Books tab */}
          {activeTab === "books" && (
            <button
              onClick={() => setIsAlphabetical(!isAlphabetical)}
              className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: isAlphabetical
                  ? `linear-gradient(145deg, var(--btn-active-from), var(--btn-active-to))`
                  : `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                boxShadow: isDarkMode
                  ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                  : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                color: `var(--text-primary)`,
              }}
              title={isAlphabetical ? "Biblical Order" : "Alphabetical Order"}
            >
              <span className="text-[10px] font-semibold">A-Z</span>
            </button>
          )}

          {/* Verse Text Toggle - Only visible on Verses tab */}
          {activeTab === "verses" && (
            <button
              onClick={handleToggleVerseText}
              className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: showVerseText
                  ? `linear-gradient(145deg, var(--btn-active-from), var(--btn-active-to))`
                  : `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                boxShadow: isDarkMode
                  ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                  : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                color: `var(--text-primary)`,
              }}
              title={showVerseText ? "Show Verse Numbers" : "Show Verse Text"}
            >
              <span className="text-[10px] font-semibold">
                {showVerseText ? "123" : "Abc"}
              </span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div
          className="overflow-y-auto no-scrollbar"
          style={{ maxHeight: "calc(100% - 15px)" }}
        >
          {activeTab === "books" && (
            <div className="space-y-3">
              {/* New Testament */}
              <div>
                <h4 className="text-[0.9rem] font-semibold mb-2 text-text-secondary">
                  New Testament
                </h4>
                <div className="flex flex-wrap gap-1">
                  <AnimatePresence mode="popLayout">
                    {filteredNewTestament.map((book, index) => (
                      <motion.div
                        key={book.name}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: -5 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.02,
                        }}
                      >
                        <StudioButton
                          isActive={currentBook === book.name}
                          isDarkMode={isDarkMode}
                          onClick={() => handleBookSelect(book.name)}
                        >
                          {book.name}
                        </StudioButton>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Old Testament */}
              <div>
                <h4 className="text-[0.9rem] font-semibold mb-2 text-text-secondary">
                  Old Testament
                </h4>
                <div className="flex flex-wrap gap-1">
                  <AnimatePresence mode="popLayout">
                    {filteredOldTestament.map((book, index) => (
                      <motion.div
                        key={book.name}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: -5 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.02,
                        }}
                      >
                        <StudioButton
                          isActive={currentBook === book.name}
                          isDarkMode={isDarkMode}
                          onClick={() => handleBookSelect(book.name)}
                        >
                          {book.name}
                        </StudioButton>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chapters" && (
            <div className="grid grid-cols-7 gap-1">
              {getFilteredChapters().map((chapter) => (
                <StudioButton
                  key={chapter}
                  isActive={currentChapter === chapter}
                  isDarkMode={isDarkMode}
                  onClick={() => handleChapterSelect(chapter)}
                >
                  {chapter}
                </StudioButton>
              ))}
            </div>
          )}

          {activeTab === "verses" && (
            <div
              className={
                showVerseText ? "flex flex-col gap-0" : "grid grid-cols-7 gap-1"
              }
            >
              {getFilteredVerses().map((verse) => {
                const verses = getCurrentChapterVerses();
                const verseText =
                  verses && verses[verse - 1]
                    ? typeof verses[verse - 1] === "string"
                      ? String(verses[verse - 1])
                      : String((verses[verse - 1] as any).text || "")
                    : "";

                return showVerseText ? (
                  <div
                    key={verse}
                    onClick={() => handleVerseSelect(verse)}
                    className={`flex gap-3 px-2 py-1 border-solid cursor-pointer transition-colors duration-150 border-b border-x-0 border-t-0 border-select-border ${
                      currentVerse === verse ? "" : "hover:bg-card-bg-alt"
                    }`}
                    style={
                      currentVerse === verse
                        ? {
                            background: `linear-gradient(145deg, var(--btn-active-from), var(--btn-active-to))`,
                            boxShadow: isDarkMode
                              ? "inset 1px 1px 3px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(255,255,255,0.15)"
                              : "inset 1px 1px 3px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(255,255,255,0.5)",
                          }
                        : undefined
                    }
                  >
                    <span
                      className={`font-bold flex-shrink-0 text-sm ${
                        currentVerse === verse
                          ? "text-white"
                          : "text-text-secondary"
                      }`}
                    >
                      {verse}
                    </span>
                    <span
                      className={`flex-1 text-sm leading-relaxed ${
                        currentVerse === verse
                          ? "text-white"
                          : "text-text-primary"
                      }`}
                    >
                      {verseText}
                    </span>
                  </div>
                ) : (
                  <StudioButton
                    key={verse}
                    isActive={currentVerse === verse}
                    isDarkMode={isDarkMode}
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
