import React, { useMemo, useState } from "react";
import {
  X,
  Star,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Trash2,
  BookOpenText,
  Tag,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveFeature,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  removeBookmark,
  setBookmarks,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useTheme } from "@/Provider/Theme";

export const BookmarkPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage
  );
  const projectionGradientColors = useAppSelector(
    (state) => state.bible.projectionGradientColors
  );
  const { bibleData } = useBibleOperations();

  // Check if there's a background image or gradient
  const hasBackgroundImage =
    (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") ||
    (projectionGradientColors && projectionGradientColors.length >= 2);

  // State for toggle between reference-only and full text
  const [showTextOnly, setShowTextOnly] = useState(false);
  const { isDarkMode } = useTheme();

  // Create a memoized reversed copy of bookmarks
  const reversedBookmarks = useMemo(
    () => [...bookmarks].reverse(),
    [bookmarks]
  );

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

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleClearAllBookmarks = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all bookmarks? This action cannot be undone."
      )
    ) {
      dispatch(setBookmarks([]));
    }
  };

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

    dispatch(setActiveFeature(null));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-white/10 dark:bg-[#2c2c2c]/20 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none ">
        <div
          className={`${"bg-[#ffffff] dark:bg-black/90 border-gray-200 dark:border-gray-700/50"} shadow dark:shadow-stone-400 rounded-3xl w-[30%] h-[90vh] overflow-hidden pointer-events-auto font-garamond border`}
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
          <div
            className={`flex items-center justify-between px-4 border-b ${
              hasBackgroundImage
                ? "border-gray-300/30 dark:border-white/20"
                : "border-gray-200 dark:border-gray-700/50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <h2
                className={`text-lg font-semibold text-gray-900 dark:text-[#f9fafb]
                  
                `}
              >
                Bookmarks
              </h2>
              <span
                className={`text-base text-gray-500 dark:text-gray-400
                  
                `}
              >
                ({reversedBookmarks.length} items)
              </span>
            </div>

            <div className="flex items-center space-2">
              {/* Toggle between reference and full text */}
              <div className="flex items-center space-x-1 mr-2 rounded-full">
                <span
                  className={`text-sm ${
                    !showTextOnly
                      ? "text-stone-300 font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }
                   
                  `}
                >
                  <BookOpenText size={14} className="inline mr-1" />
                  Text
                </span>
                <div
                  onClick={() => setShowTextOnly(!showTextOnly)}
                  className="p-1 cursor-pointer hover:scale-105 dark:hover:bg-primary/5 rounded transition-colors"
                  title={
                    showTextOnly ? "Show full text" : "Show references only"
                  }
                >
                  {showTextOnly ? (
                    <ToggleRight
                      size={20}
                      className={`text-primary dark:text-[#faeed1]
                          
                        `}
                    />
                  ) : (
                    <ToggleLeft
                      size={20}
                      className={`text-primary dark:text-[#faeed1]
                         
                        `}
                    />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    showTextOnly
                      ? "text-primary font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }
                       
                  `}
                >
                  <Tag size={14} className="inline mr-1" />
                  Tags
                </span>
              </div>

              {/* Clear all div */}
              {reversedBookmarks.length > 0 && (
                <div
                  onClick={handleClearAllBookmarks}
                  className="p-2 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/20 rounded-full transition-colors text-red-500 dark:text-red-400 cursor-pointer"
                  title="Clear all bookmarks"
                >
                  <Trash2 size={16} />
                </div>
              )}

              <div
                onClick={() => dispatch(setActiveFeature(null))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="px-4 overflow-y-auto no-scrollbar"
            style={{ height: "calc(90vh - 5rem)" }}
          >
            {reversedBookmarks.length > 0 ? (
              <div
                className={`${
                  showTextOnly ? "flex flex-wrap gap-2 py-4" : "space-y-0 py-4"
                }`}
              >
                {reversedBookmarks.map((bookmark, index) => {
                  // Parse bookmark to get book and verse info
                  const parts = bookmark.split(" ");
                  const chapterVerse = parts[parts.length - 1];
                  const bookName = parts.slice(0, parts.length - 1).join(" ");
                  const scriptureText = getScriptureText(bookmark);

                  if (showTextOnly) {
                    // Tag view - just show references as tags
                    return (
                      <div
                        key={index}
                        onClick={() => handleBookmarkClick(bookmark)}
                        className={`relative group inline-flex items-center p-1 px-2   rounded-full cursor-pointer transition-all duration-200
                            bg-gradient-to-r border border-primary/20 dark:border-primary/30 from-stone-50 to-stone-100 dark:from-stone-700 dark:to-[#2c2c2c] 
                           
                          `}
                      >
                        <Star
                          size={12}
                          className="text-stone-500 dark:text-[#f9fafb] mr-2 flex-shrink-0"
                        />
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {bookmark}
                        </span>

                        {/* Remove button for tag */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeBookmark(bookmark));
                          }}
                          className=" absolute p-1 px-2 right-0 bottom-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X
                            size={10}
                            className="text-red-600 dark:text-red-400"
                          />
                        </button>
                      </div>
                    );
                  } else {
                    // Full text view - original layout
                    return (
                      <div key={index} className="relative group">
                        <div
                          onClick={() => handleBookmarkClick(bookmark)}
                          className="w-full py-0  px-4 transition-all duration-200 border border-solid border-x-0 border-t-0 border-primary/20 dark:border-dtext/20 last:border-b-0 cursor-pointer hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 dark:hover:from-[#404040]/10 dark:hover:to-primary/5 "
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Combined text with star icon, reference, and scripture */}
                              <p
                                className={`text-base  leading-relaxed font-[garamond]
                              
                              `}
                              >
                                <span className="animate-bounce">📮</span>
                                <mark
                                  className={` text-stone-600 dark:text-[#f9fafb] bg-white/70 dark:bg-transparent font-bold
                                  
                                  `}
                                >
                                  {bookmark}
                                </mark>
                                <mark className="ml-2 bg-gray-50 dark:bg-[#201f1f]/60  font-[garamond] text-stone-600 dark:text-[#f9fafb]">
                                  "{truncateText(scriptureText, 120)}"
                                </mark>
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-3" />
                          </div>
                        </div>

                        {/* Remove bookmark button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeBookmark(bookmark));
                          }}
                          className="absolute top-3 right-2 p-1.5 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X
                            size={12}
                            className="text-red-600 dark:text-red-400"
                          />
                        </button>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Star
                  size={48}
                  className="text-gray-300 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  No bookmarks yet
                </p>
                <p className="text-base text-gray-400 dark:text-gray-500">
                  Your saved verses will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookmarkPanel;
