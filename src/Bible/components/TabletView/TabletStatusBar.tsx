import React from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface TabletStatusBarProps {
  currentBook: string;
  currentChapter: number;
  isBookDropdownOpen: boolean;
  setIsBookDropdownOpen: (open: boolean) => void;
  isChapterDropdownOpen: boolean;
  setIsChapterDropdownOpen: (open: boolean) => void;
  handleBookSelect: (book: string) => void;
  handleChapterSelect: (chapter: number) => void;
  getChapters: () => number[];
  bookList: any[];
  bookDropdownRef: React.RefObject<HTMLDivElement>;
  chapterDropdownRef: React.RefObject<HTMLDivElement>;
}

const TabletStatusBar: React.FC<TabletStatusBarProps> = ({
  currentBook,
  currentChapter,
  isBookDropdownOpen,
  setIsBookDropdownOpen,
  isChapterDropdownOpen,
  setIsChapterDropdownOpen,
  handleBookSelect,
  handleChapterSelect,
  getChapters,
  bookList,
  bookDropdownRef,
  chapterDropdownRef,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-20 border-b transition-colors duration-300 rounded-t-lg"
      style={{
        backgroundColor: isDarkMode ? "#352b25" : "#f8f9fa",
        borderBottomColor: isDarkMode ? "#3d332a" : "#e9ecef",
      }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-4 h-4 text-white" />

          {/* Book Dropdown */}
          <div className="relative book-dropdown" ref={bookDropdownRef}>
            <button
              onClick={() => {
                setIsBookDropdownOpen(!isBookDropdownOpen);
                setIsChapterDropdownOpen(false);
              }}
              className="flex items-center justify-center gap-1 h-8 px-2 rounded-lg ring-1 dark:ring-yellow-800 focus:outline-none shadow transition-colors duration-200 bg-white dark:bg-[#30261d]/20 hover:bg-primary/10 dark:hover:bg-[#3d332a] text-stone-600 dark:text-stone-300"
            >
              <span className="text-[12px] font-medium font-bitter text-stone-500 dark:text-gray-50">
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
              <div
                className="absolute left-0 mt-2 w-[38vw] bg-white dark:bg-[#3d332a] rounded-br-3xl rounded-bl-sm shadow-lg z-[30] max-h-96 overflow-y-auto no-scrollbar"
                style={{
                  maxWidth: "calc(100vw - 2rem)",
                }}
              >
                <div className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {bookList.map((book: any, index: number) => (
                      <div
                        key={book.name}
                        className={`p-2 cursor-pointer text-[12px] flex items-center justify-center hover:ring-1 hover:ring-primary/70 hover:rounded-sm dark:hover:ring-white transition-colors duration-150 ${
                          currentBook === book.name
                            ? "bg-primary shadow text-white dark:bg-primary dark:text-white font-medium ring-2 ring-primary/20 dark:ring-primary/40"
                            : "text-stone-500 dark:text-[#faeed1] bg-gradient-to-r from-transparent dark:via-primary/50 via-primary/20 to-transparent cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                        }`}
                        onClick={() => {
                          handleBookSelect(book.name);
                          setIsBookDropdownOpen(false);
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

          {/* Chapter Dropdown */}
          <div className="relative chapter-dropdown" ref={chapterDropdownRef}>
            <button
              onClick={() => {
                setIsChapterDropdownOpen(!isChapterDropdownOpen);
                setIsBookDropdownOpen(false);
              }}
              className="flex items-center justify-center gap-1 h-8 px-2 rounded-lg ring-1 ring-stone-300 dark:ring-yellow-800 focus:outline-none shadow transition-colors duration-200 bg-white dark:bg-[#30261d]/20 hover:bg-primary/10 dark:hover:bg-[#4a3e34] text-stone-600 dark:text-stone-300"
            >
              <span className="text-[12px] font-medium font-bitter text-stone-500 dark:text-gray-50">
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
              <div className="absolute mt-2 w-52 bg-white dark:bg-[#3d332a] rounded-br-3xl shadow-lg z-[30] max-h-60 overflow-y-auto no-scrollbar p-2">
                <div className="grid grid-cols-5 gap-1">
                  {getChapters().map((chapter) => (
                    <div
                      key={chapter}
                      className={`p-2 z-50 cursor-pointer text-[12px] flex items-center justify-center hover:ring-1 hover:ring-primary/70 dark:hover:ring-white transition-colors duration-150 ${
                        currentChapter === chapter
                          ? "bg-primary shadow text-white dark:bg-primary dark:text-white font-medium ring-2 ring-primary/20 dark:ring-primary/40"
                          : "text-stone-500 dark:text-[#faeed1] bg-gradient-to-r from-transparent dark:via-primary/50 via-primary/20 to-transparent cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                      }`}
                      onClick={() => {
                        handleChapterSelect(chapter);
                        setIsChapterDropdownOpen(false);
                      }}
                    >
                      {chapter}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-1">
        <div className="w-1 h-1 rounded-full bg-white" />
        <div className="w-1 h-1 rounded-full bg-white" />
        <div className="w-1 h-1 rounded-full bg-white" />
      </div>
    </div>
  );
};

export default TabletStatusBar;
