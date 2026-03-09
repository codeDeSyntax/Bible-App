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
  setExactMatch,
  setWholeWords,
  setActiveFeature,
  navigateToVerse,
} from "@/store/slices/bibleSlice";
import { performSearch } from "@/store/slices/bibleThunks";
import { useTheme } from "@/Provider/Theme";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

const SearchPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchTerm, searchResults, exactMatch, wholeWords } = useAppSelector(
    (state) => state.bible,
  );
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );
  const { bibleData } = useBibleOperations();
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
    // Single atomic dispatch — prevents partial state from firing auto-sync
    dispatch(navigateToVerse({ book, chapter, verse }));
    dispatch(setActiveFeature(null));

    // Also send an explicit presentation update so clicking a search result
    // opens the correct chapter/verse on the bible presentation immediately.
    try {
      if (
        typeof window !== "undefined" &&
        (window as any).api &&
        bibleData &&
        currentTranslation
      ) {
        const translationData = bibleData[currentTranslation];
        const bookData = translationData?.books?.find(
          (b: any) => b.name.toLowerCase() === book.toLowerCase(),
        );

        const chapterData = bookData?.chapters?.find(
          (c: any) => c.chapter === chapter,
        );

        if (chapterData?.verses) {
          const presentationData = {
            book,
            chapter,
            verses: chapterData.verses,
            translation: currentTranslation,
            selectedVerse: verse || undefined,
          };

          (window as any).api.sendToBiblePresentation({
            type: "update-data",
            data: presentationData,
          });

          // Re-send shortly after to overcome potential racing updates
          setTimeout(() => {
            try {
              (window as any).api.sendToBiblePresentation({
                type: "update-data",
                data: presentationData,
              });
            } catch (err) {
              /* ignore */
            }
          }, 160);
        }
      }
    } catch (e) {
      // ignore presentation errors
    }
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
      word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    );
    const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");

    // Split text by the regex pattern
    const parts = text.split(regex);

    return parts.map((part, index) => {
      // Check if this part matches any of our search words (case insensitive)
      const isMatch = searchWords.some(
        (word) => part.toLowerCase() === word.toLowerCase(),
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
        className="fixed inset-0 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
        style={{
          backgroundColor: isDarkMode
            ? "rgba(44,44,44,0.2)"
            : "rgba(255,255,255,0.1)",
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
        <div
          className="rounded-3xl w-full max-w-[24rem] h-[90vh] overflow-hidden pointer-events-auto font-garamond shadow-md"
          style={{
            background: isDarkMode ? "var(--card-bg-alt)" : "var(--card-bg)",
            border: "1px solid var(--select-border)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--select-border)" }}
          >
            <div className="flex items-center space-x-2">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Search
              </h2>
              {searchResults.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({searchResults.length} results)
                </span>
              )}
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 rounded-full transition-colors"
              style={{ background: "transparent" }}
            >
              <X
                size={20}
                className=""
                style={{ color: "var(--text-muted)" }}
              />
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
                className="w-full border-none rounded-full px-4 py-3 pl-10 bg-[var(--card-bg-alt)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/20 font-garamond"
              />
              <SearchIcon
                size={18}
                className="absolute left-3 top-2.5"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <div className="flex items-center justify-center space-x-3 ">
              <button
                onClick={() => dispatch(setExactMatch(!exactMatch))}
                className="flex items-center justify-center p-2 bg-[var(--card-bg-alt)] rounded-full transition-colors"
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
                className="flex items-center justify-center p-2 bg-[var(--card-bg-alt)] rounded-full transition-colors"
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
                        result.verse,
                      )
                    }
                    className="group cursor-pointer font-[garamond] py-1 px-2 transition-all duration-200 text-sm leading-relaxed"
                    style={{
                      color: "var(--text-primary)",
                      borderBottom: "1px solid var(--select-border)",
                    }}
                  >
                    <span
                      className="font-semibold mr-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {result.book} {result.chapter}:{result.verse}
                    </span>
                    {highlightSearchTerm(
                      truncateText(result.text, 140),
                      searchTerm,
                    )}
                  </p>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="flex flex-col items-center justify-center h-full text-center font-garamond">
                <SearchIcon
                  size={48}
                  className="mb-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <p style={{ color: "var(--text-muted)" }}>No results found</p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center font-garamond">
                <SearchIcon
                  size={48}
                  className="mb-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <p style={{ color: "var(--text-muted)" }}>
                  Enter a search term
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
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
