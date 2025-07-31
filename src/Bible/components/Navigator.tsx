import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Grid3X3,
  AlignLeft,
} from "lucide-react";
import { ViewMode } from "../ScriptureContent";

interface Book {
  name: string;
  testament: string;
  chapters: { chapter: number }[];
}

interface NavigationBarProps {
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  selectedVerse: number | null;
  chapterCount: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isBookDropdownOpen: boolean;
  setIsBookDropdownOpen: (open: boolean) => void;
  isChapterDropdownOpen: boolean;
  setIsChapterDropdownOpen: (open: boolean) => void;
  isVerseDropdownOpen: boolean;
  setIsVerseDropdownOpen: (open: boolean) => void;
  handlePreviousChapter: () => void;
  handleNextChapter: () => void;
  handleBookSelect: (book: string) => void;
  handleChapterSelect: (chapter: number) => void;
  handleVerseSelect: (verse: number) => void;
  getChapters: () => number[];
  getVerses: () => number[];
  bookList: Book[];
  iconColors: {
    color1: string;
    color2: string;
    color3: string;
    color4: string;
  };
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  selectedVerse,
  chapterCount,
  viewMode,
  setViewMode,
  isBookDropdownOpen,
  setIsBookDropdownOpen,
  isChapterDropdownOpen,
  setIsChapterDropdownOpen,
  isVerseDropdownOpen,
  setIsVerseDropdownOpen,
  handlePreviousChapter,
  handleNextChapter,
  handleBookSelect,
  handleChapterSelect,
  handleVerseSelect,
  getChapters,
  getVerses,
  bookList,
  iconColors,
}) => {
  const oldTestamentBooks = bookList.filter((book) => book.testament === "old");
  const newTestamentBooks = bookList.filter((book) => book.testament === "new");

  return (
    <div className="w-[50%]  fixed flex items-center justify-between px-4 py-2 z-10 border-b border-gray-800 ">
      <button
        onClick={handlePreviousChapter}
        disabled={currentChapter <= 1}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-50 bg-gray-200 dark:bg-bgray shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <ChevronLeft size={14} className="text-[12px]" />
      </button>

      <div className="flex items-center space-x-2">
        {/* Book selector */}
        <div className="relative book-dropdown">
          <button
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-bgray focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-gray-300 transition-colors duration-200"
            onClick={() => {
              setIsBookDropdownOpen(!isBookDropdownOpen);
              setIsChapterDropdownOpen(false);
              setIsVerseDropdownOpen(false);
            }}
          >
            <BookOpen size={16} className="text-gray-400 text-[12px]" />
            <span className="text-[12px] font-bold text-stone-500 dark:text-gray-50 font-serif">
              {currentBook}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 text-gray-400 ${
                isBookDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isBookDropdownOpen && (
            <div className="absolute left-0 mt-2 w-[38vw] bg-gray-50 dark:bg-bgray rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto no-scrollbar">
              <div className="p-3">
                <h2 className="text-sm flex items-center justify-between font-semibold mb-2 font-serif text-stone-400">
                  Old Testament {"   "}
                  <span
                    className="underline font-serif"
                    style={{
                      color: iconColors.color2,
                    }}
                  >
                    Bk:: {currentBook}
                    {currentChapter}:
                    {currentVerse === null ? "1" : currentVerse}
                  </span>
                </h2>
                <div className="grid grid-cols-3 gap-1 mb-4">
                  {oldTestamentBooks.map((book) => (
                    <div
                      key={book.name}
                      className={`p-2 text-[12px] flex items-center justify-center bg-white dark:bg-transparent dark:shadow-black shadow rounded-full transition-colors duration-150 ${
                        currentBook === book.name
                          ? "bg-transparent text-stone-500 hover:text-stone-900 cursor-not-allowed dark:text-gray-50 font-medium"
                          : "text-stone-400 dark:text-gray-400 cursor-pointer hover:text-stone-500 dark:hover:text-gray-200"
                      }`}
                      onClick={() => handleBookSelect(book.name)}
                      style={{
                        borderWidth: 2,
                        borderStyle:
                          currentBook === book.name ? "dotted" : "none",
                        borderColor:
                          currentBook === book.name
                            ? "#949495"
                            : iconColors.color2,
                      }}
                    >
                      {book.name}
                    </div>
                  ))}
                </div>
                <h2 className="text-sm font-semibold mb-2 pt-2 border-t border-gray-800 text-stone-400">
                  New Testament
                </h2>
                <div className="grid grid-cols-3 gap-1">
                  {newTestamentBooks.map((book) => (
                    <div
                      key={book.name}
                      className={`p-2 text-[12px] flex items-center justify-center bg-white dark:bg-transparent dark:shadow-black cursor-pointer shadow rounded-full transition-colors duration-150 ${
                        currentBook === book.name
                          ? "bg-transparent text-stone-500 hover:text-stone-900 pointer-events-none dark:text-gray-50 font-medium"
                          : "text-stone-400 dark:text-gray-400 cursor-pointer hover:text-stone-500 dark:hover:text-gray-200"
                      }`}
                      onClick={() => handleBookSelect(book.name)}
                      style={{
                        borderWidth: 2,
                        borderStyle:
                          currentBook === book.name ? "dotted" : "none",
                        borderColor:
                          currentBook === book.name
                            ? iconColors.color3
                            : iconColors.color4,
                      }}
                    >
                      {book.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chapter selector */}
        <div className="relative chapter-dropdown">
          <button
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-bgray focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-gray-300 transition-colors duration-200 text-stone-500 dark:text-gray-50"
            onClick={() => {
              setIsChapterDropdownOpen(!isChapterDropdownOpen);
              setIsBookDropdownOpen(false);
              setIsVerseDropdownOpen(false);
            }}
          >
            <span className="text-[12px] font-medium font-bitter">
              {currentChapter}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 text-gray-400 ${
                isChapterDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isChapterDropdownOpen && (
            <div className="absolute mt-2 w-52 bg-white dark:bg-bgray border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto no-scrollbar">
              <div className="p-2 grid grid-cols-5 gap-1">
                {getChapters().map((chapter) => (
                  <div
                    key={Number(chapter)}
                    className={`p-2 text-[12px] flex items-center justify-center dark:shadow-black shadow rounded transition-colors duration-150 ${
                      Number(currentChapter) === Number(chapter)
                        ? "bg-transparent text-stone-500 hover:text-stone-900 pointer-events-none hover:cursor-pointer dark:text-gray-50 font-medium"
                        : "text-stone-500 dark:text-gray-400 cursor-pointer hover:text-stone-500 dark:hover:text-gray-200"
                    }`}
                    onClick={() => handleChapterSelect(chapter)}
                    style={{
                      borderWidth: 2,
                      borderStyle:
                        Number(currentChapter) === Number(chapter)
                          ? "dotted"
                          : "none",
                      borderColor:
                        Number(currentChapter) === Number(chapter)
                          ? iconColors.color2
                          : iconColors.color4,
                    }}
                  >
                    {chapter}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verse selector */}
        <div className="relative verse-dropdown">
          <button
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-bgray focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-gray-300 transition-colors duration-200"
            onClick={() => {
              setIsVerseDropdownOpen(!isVerseDropdownOpen);
              setIsBookDropdownOpen(false);
              setIsChapterDropdownOpen(false);
            }}
          >
            <span className="text-[12px] font-medium font-bitter text-stone-500 dark:text-gray-50">
              v {selectedVerse || 1}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 text-gray-400 ${
                isVerseDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isVerseDropdownOpen && (
            <div className="absolute mt-2 w-52 bg-white dark:bg-bgray border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto no-scrollbar">
              <div className="p-2 grid grid-cols-5 gap-1">
                {getVerses().map((verse) => (
                  <div
                    key={verse}
                    className={`p-2 text-[12px] flex items-center justify-center dark:shadow-black shadow rounded transition-colors duration-150 ${
                      currentVerse === verse
                        ? "bg-transparent text-stone-500 hover:text-stone-900 cursor-not-allowed pointer-events-none dark:text-gray-50 font-medium"
                        : "text-stone-400 dark:text-gray-400 cursor-pointer hover:text-stone-500 dark:hover:text-gray-200"
                    }`}
                    onClick={() => handleVerseSelect(verse)}
                    style={{
                      borderWidth: 2,
                      borderStyle: selectedVerse === verse ? "dotted" : "none",
                      borderColor:
                        selectedVerse === verse
                          ? iconColors.color1
                          : iconColors.color2,
                    }}
                  >
                    {verse}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-200 dark:bg-bgray rounded-lg shadow p-1">
          <button
            onClick={() => setViewMode("block")}
            className={`p-1.5 rounded transition-colors duration-200 ${
              viewMode === "block"
                ? "bg-white dark:bg-ltgray text-stone-600 dark:text-gray-200 shadow-sm"
                : "text-gray-500 bg-transparent dark:text-gray-400 hover:text-stone-600 dark:hover:text-gray-200"
            }`}
            title="Block view"
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("paragraph")}
            className={`p-1.5 rounded transition-colors duration-200 ${
              viewMode === "paragraph"
                ? "bg-white dark:bg-ltgray text-stone-600 dark:text-gray-200 shadow-sm"
                : "text-gray-500 bg-transparent  dark:text-gray-400 hover:text-stone-600 dark:hover:text-gray-200"
            }`}
            title="Paragraph view"
          >
            <AlignLeft size={14} />
          </button>
        </div>
      </div>

      <button
        onClick={handleNextChapter}
        disabled={currentChapter >= chapterCount}
        className="p-2 rounded-lg bg-gray-200 dark:bg-bgray shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-stone-500 dark:text-gray-50"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default NavigationBar;
