import React, { useEffect } from "react";
import {
  Search as SearchIcon,
  X,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setSearchTerm,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setExactMatch,
  setWholeWords,
  setActiveFeature,
} from "@/store/slices/bibleSlice";
import { performSearch } from "@/store/slices/bibleThunks";
import { useTheme } from "@/Provider/Theme";

const SearchPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchTerm, searchResults, exactMatch, wholeWords } = useAppSelector(
    (state) => state.bible
  );
  const { isDarkMode } = useTheme();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus search input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Perform search when search term changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchTerm) {
        dispatch(performSearch(searchTerm));
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, exactMatch, wholeWords, dispatch]);

  const handleResultClick = (book: string, chapter: number, verse: number) => {
    dispatch(setCurrentBook(book));
    dispatch(setCurrentChapter(chapter));
    dispatch(setCurrentVerse(verse));
    dispatch(setActiveFeature(null));
  };

  // Helper functions for better search result display
  const truncateText = (text: string, maxLength: number = 120) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;

    // Clean and normalize the search term
    const cleanTerm = term.replace(/\[|\]/g, "").replace(/\s+/g, " ").trim();
    if (!cleanTerm) return text;

    // Split search term into individual words for more flexible highlighting
    const searchWords = cleanTerm
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Create a regex pattern that matches any of the search words
    const escapedWords = searchWords.map((word) =>
      word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");

    // Split text by the regex pattern
    const parts = text.split(regex);

    return parts.map((part, index) => {
      // Check if this part matches any of our search words (case insensitive)
      const isMatch = searchWords.some(
        (word) => part.toLowerCase() === word.toLowerCase()
      );

      return isMatch ? (
        <span
          key={index}
          className="bg-gray-100 dark:bg-stone-900 text-black font-bold dark:text-white px-1 py-0.5 rounded"
        >
          {part}
        </span>
      ) : (
        part
      );
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-white/10 dark:bg-[#2c2c2c]/20  backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
        <div
          className="bg-[#fef6f1] dark:bg-[#352921] shadow dark:shadow-primary rounded-3xl w-full max-w-[24rem] h-[90vh] overflow-hidden pointer-events-auto font-garamond"
          style={{
            background: isDarkMode
              ? "linear-gradient(145deg, #3a3a3a, #2a2a2a)"
              : "linear-gradient(145deg, #ffffff, #ffffff)",
            boxShadow: isDarkMode
              ? "inset 2px 2px 4px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.3)"
              : "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8), 0 8px 16px rgba(236, 236, 236, 0.1)",
            border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Search
              </h2>
              {searchResults.length > 0 && (
                <span className="text-base text-gray-500 dark:text-gray-400">
                  ({searchResults.length} results)
                </span>
              )}
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-4 border-b flex items-center gap-4 pb-4 border-gray-200 dark:border-gray-700/50">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                spellCheck={false}
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                placeholder="Search scripture..."
                className="w-full border-none rounded-full px-4 py-3 pl-10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 font-garamond"
              />
              <SearchIcon
                size={18}
                className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
              />
            </div>
            <div className="flex items-center justify-center space-x-3 ">
              <button
                onClick={() => dispatch(setExactMatch(!exactMatch))}
                className="flex items-center justify-center p-2 bg-gray-50 dark:bg-black/20 rounded-full transition-colors"
                title="Exact match"
              >
                {exactMatch ? (
                  <ToggleRight size={20} className="text-primary" />
                ) : (
                  <ToggleLeft size={20} className="text-gray-400" />
                )}
              </button>
              <button
                onClick={() => dispatch(setWholeWords(!wholeWords))}
                className="flex items-center justify-center p-2 bg-gray-50 dark:bg-black/20 rounded-full transition-colors"
                title="Whole words"
              >
                {wholeWords ? (
                  <ToggleRight size={20} className="text-primary" />
                ) : (
                  <ToggleLeft size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="px-4 overflow-y-auto no-scrollbar"
            style={{ height: "calc(85vh - 10rem)" }}
          >
            {searchResults.length > 0 ? (
              <div>
                {searchResults.map((result, index) => (
                  <p
                    key={index}
                    onClick={() =>
                      handleResultClick(
                        result.book,
                        result.chapter,
                        result.verse
                      )
                    }
                    className="group cursor-pointer font-[garamond] py-1 px-2 hover:bg-primary/5 dark:hover:bg-white/5 transition-all duration-200 text-base text-gray-700 dark:text-stone-300 leading-relaxed border-b border-x-0 border-t-0 border-solid border-yellow-900/20 dark:border-yellow-300/10"
                  >
                    <span className="font-semibold text-stone-500 dark:text-[#f9fafb] mr-2">
                      {result.book} {result.chapter}:{result.verse}
                    </span>
                    {highlightSearchTerm(
                      truncateText(result.text, 140),
                      searchTerm
                    )}
                  </p>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="flex flex-col items-center justify-center h-full text-center font-garamond">
                <SearchIcon
                  size={48}
                  className="text-gray-300 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">
                  No results found
                </p>
                <p className="text-base text-gray-400 dark:text-gray-500 mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center font-garamond">
                <SearchIcon
                  size={48}
                  className="text-gray-300 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">
                  Enter a search term
                </p>
                <p className="text-base text-gray-400 dark:text-gray-500 mt-1">
                  Search through scripture content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPanel;
