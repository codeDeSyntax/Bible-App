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
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<"books" | "chapters" | "verses">(
    "books"
  );
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter books based on search
  const filteredOldTestament =
    bookList
      ?.filter((book) => book.testament === "old")
      .filter((book) =>
        book.name.toLowerCase().includes(bookSearchQuery.toLowerCase())
      ) || [];

  const filteredNewTestament =
    bookList
      ?.filter((book) => book.testament === "new")
      .filter((book) =>
        book.name.toLowerCase().includes(bookSearchQuery.toLowerCase())
      ) || [];

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
    setActiveTab("chapters");
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterSelect(chapter);
    setActiveTab("verses");
  };

  return (
    <BentoCard
      title="Bible Navigation"
      isDarkMode={isDarkMode}
      icon={<Book className="w-4 h-4 text-white" />}
      className="col-span-2 row-span-3"
    >
      <div className="space-y-2 flex flex-col h-full">
        {/* Tab Selector */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("books")}
            className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
            style={{
              background:
                activeTab === "books"
                  ? isDarkMode
                    ? "linear-gradient(145deg, #6a6865, #5a5856)"
                    : "linear-gradient(145deg, #989898, #d5d4d3)"
                  : isDarkMode
                  ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                  : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
              color: isDarkMode ? "#e5e5e5" : "#4a4a4a",
            }}
            title="Books"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab("chapters")}
            className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
            style={{
              background:
                activeTab === "chapters"
                  ? isDarkMode
                    ? "linear-gradient(145deg, #6a6865, #5a5856)"
                    : "linear-gradient(145deg, #989898, #d5d4d3)"
                  : isDarkMode
                  ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                  : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
              color: isDarkMode ? "#e5e5e5" : "#4a4a4a",
            }}
            title="Chapters"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab("verses")}
            className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center"
            style={{
              background:
                activeTab === "verses"
                  ? isDarkMode
                    ? "linear-gradient(145deg, #6a6865, #5a5856)"
                    : "linear-gradient(145deg, #989898, #d5d4d3)"
                  : isDarkMode
                  ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                  : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
              color: isDarkMode ? "#e5e5e5" : "#4a4a4a",
            }}
            title="Verses"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex-shrink-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400 dark:text-gray-500" />
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
            className="w-full py-2 pl-9 pr-3 bg-stone-200 dark:bg-black/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 focus:bg-stone-100 dark:focus:bg-black/20 text-gray-600 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-500 outline-none text-xs transition-colors duration-200 border-none "
          />
        </div>

        {/* Content Area */}
        <div
          className="overflow-y-auto no-scrollbar"
          style={{ maxHeight: "calc(100% - 100px)" }}
        >
          {activeTab === "books" && (
            <div className="space-y-3">
              {/* New Testament */}
              <div>
                <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
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
                <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
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
            <div className="grid grid-cols-7 gap-1">
              {getFilteredVerses().map((verse) => (
                <StudioButton
                  key={verse}
                  isActive={currentVerse === verse}
                  isDarkMode={isDarkMode}
                  onClick={() => onVerseSelect(verse)}
                >
                  {verse}
                </StudioButton>
              ))}
            </div>
          )}
        </div>
      </div>
    </BentoCard>
  );
};
