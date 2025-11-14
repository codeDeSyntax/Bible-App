import React, { useState, useEffect } from "react";
import { BookOpen, ChevronDown, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBooks, setFilteredBooks] = useState(bookList);
  const [filteredChapters, setFilteredChapters] = useState(getChapters());

  // Filter books based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBooks(bookList);
    } else {
      const filtered = bookList.filter((book: any) =>
        book.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, bookList]);

  // Filter chapters based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredChapters(getChapters());
    } else {
      const chapters = getChapters();
      const filtered = chapters.filter((chapter: number) =>
        chapter.toString().includes(searchTerm)
      );
      setFilteredChapters(filtered);
    }
  }, [searchTerm, getChapters]);

  // Clear search when dropdowns close
  useEffect(() => {
    if (!isBookDropdownOpen && !isChapterDropdownOpen) {
      setSearchTerm("");
    }
  }, [isBookDropdownOpen, isChapterDropdownOpen]);

  const isSearchVisible = isBookDropdownOpen || isChapterDropdownOpen;

  return (
    <div
      className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-50 border-b transition-colors duration-300 rounded-t-lg"
      style={{
        // backgroundColor: isDarkMode ? "#313131" : "#f8f9fa",
        borderBottomColor: isDarkMode ? "#313131" : "#e9ecef",
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
              className="flex items-center justify-center gap-1 h-6 px-2 rounded transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-inner focus:outline-none"
              style={{
                background: isDarkMode
                  ? "linear-gradient(145deg, #303030, #303030)"
                  : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                boxShadow: isDarkMode
                  ? "inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2)"
                  : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)",
                border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
              }}
            >
              <span
                className={`text-[12px] font-medium font-bitter ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {currentBook}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isDarkMode ? "text-gray-200" : "text-gray-600"
                } ${isBookDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isBookDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-[38vw] rounded-lg z-[30] max-h-96 overflow-y-auto no-scrollbar"
                style={{
                  maxWidth: "calc(100vw - 2rem)",
                  background: isDarkMode
                    ? "linear-gradient(145deg, #3a3a3a, #2a2a2a)"
                    : "linear-gradient(145deg, #f5f5f5, #e5e5e5)",
                  boxShadow: isDarkMode
                    ? "inset 2px 2px 4px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.3)"
                    : "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.1)",
                  border: `2px solid ${isDarkMode ? "#555" : "#ccc"}`,
                }}
              >
                <div className="p-3">
                  {filteredBooks.length === 0 ? (
                    <div className="text-center py-4">
                      <span
                        className={`text-[12px] ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        No books found
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {filteredBooks.map((book: any, index: number) => (
                        <div
                          key={book.name}
                          className="p-2 cursor-pointer text-[12px] flex items-center justify-center rounded transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-inner"
                          style={{
                            background:
                              currentBook === book.name
                                ? isDarkMode
                                  ? "linear-gradient(145deg, #fbbf24, #f59e0b)" // Selected: golden gradient
                                  : "linear-gradient(145deg, #fbbf24, #f59e0b)"
                                : isDarkMode
                                ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)" // Normal: game button style
                                : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                            boxShadow:
                              currentBook === book.name
                                ? "inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.2), 0 3px 6px rgba(0,0,0,0.2)"
                                : isDarkMode
                                ? "inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1)"
                                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                            border: `1px solid ${
                              currentBook === book.name
                                ? "#d97706"
                                : isDarkMode
                                ? "#555"
                                : "#ccc"
                            }`,
                            color:
                              currentBook === book.name
                                ? "#000"
                                : isDarkMode
                                ? "#e5e7eb"
                                : "#374151",
                            fontWeight:
                              currentBook === book.name ? "600" : "normal",
                          }}
                          onClick={() => {
                            handleBookSelect(book.name);
                            setIsBookDropdownOpen(false);
                          }}
                        >
                          {book.name}
                        </div>
                      ))}
                    </div>
                  )}
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
              className="flex items-center justify-center gap-1 h-6 px-2 rounded transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-inner focus:outline-none"
              style={{
                background: isDarkMode
                  ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                  : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                boxShadow: isDarkMode
                  ? "inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2)"
                  : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)",
                border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
              }}
            >
              <span
                className={`text-[12px] font-medium font-bitter ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {currentChapter}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isDarkMode ? "text-gray-200" : "text-gray-600"
                } ${isChapterDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isChapterDropdownOpen && (
              <div
                className="absolute mt-2 w-52 rounded-lg z-[30] max-h-60 overflow-y-auto no-scrollbar p-2"
                style={{
                  background: isDarkMode
                    ? "linear-gradient(145deg, #3a3a3a, #2a2a2a)"
                    : "linear-gradient(145deg, #f5f5f5, #e5e5e5)",
                  boxShadow: isDarkMode
                    ? "inset 2px 2px 4px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.3)"
                    : "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.1)",
                  border: `2px solid ${isDarkMode ? "#555" : "#ccc"}`,
                }}
              >
                {filteredChapters.length === 0 ? (
                  <div className="text-center py-4">
                    <span
                      className={`text-[12px] ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No chapters found
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-1">
                    {filteredChapters.map((chapter) => (
                      <div
                        key={chapter}
                        className="p-2 z-50 cursor-pointer text-[12px] flex items-center justify-center rounded transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-inner"
                        style={{
                          background:
                            currentChapter === chapter
                              ? isDarkMode
                                ? "linear-gradient(145deg, #fbbf24, #f59e0b)" // Selected: golden gradient
                                : "linear-gradient(145deg, #fbbf24, #f59e0b)"
                              : isDarkMode
                              ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)" // Normal: game button style
                              : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                          boxShadow:
                            currentChapter === chapter
                              ? "inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.2), 0 3px 6px rgba(0,0,0,0.2)"
                              : isDarkMode
                              ? "inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1)"
                              : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                          border: `1px solid ${
                            currentChapter === chapter
                              ? "#d97706"
                              : isDarkMode
                              ? "#555"
                              : "#ccc"
                          }`,
                          color:
                            currentChapter === chapter
                              ? "#000"
                              : isDarkMode
                              ? "#e5e7eb"
                              : "#374151",
                          fontWeight:
                            currentChapter === chapter ? "600" : "normal",
                        }}
                        onClick={() => {
                          handleChapterSelect(chapter);
                          setIsChapterDropdownOpen(false);
                        }}
                      >
                        {chapter}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Input */}
          {isSearchVisible && (
            <div className="relative">
              <div className="flex items-center">
                <Search
                  size={12}
                  className={`absolute left-2 z-10 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isBookDropdownOpen
                      ? "Search books..."
                      : "Search chapters..."
                  }
                  className="h-6 pl-7 pr-3 text-[12px] rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  style={{
                    width: "120px",
                    background: isDarkMode
                      ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                      : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                    boxShadow: isDarkMode
                      ? "inset 2px 2px 4px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.1)"
                      : "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8)",
                    border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
                    color: isDarkMode ? "#e5e7eb" : "#374151",
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchTerm("");
                      setIsBookDropdownOpen(false);
                      setIsChapterDropdownOpen(false);
                    } else if (e.key === "Enter") {
                      if (isBookDropdownOpen && filteredBooks.length > 0) {
                        handleBookSelect(filteredBooks[0].name);
                        setIsBookDropdownOpen(false);
                      } else if (
                        isChapterDropdownOpen &&
                        filteredChapters.length > 0
                      ) {
                        handleChapterSelect(filteredChapters[0]);
                        setIsChapterDropdownOpen(false);
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
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
