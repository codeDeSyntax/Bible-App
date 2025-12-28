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
  Grid,
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

  // State for toggle between different view modes: 'list', 'tags', 'grid'
  const [viewMode, setViewMode] = useState<string>("list");
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
        className="fixed inset-0 backdrop-blur-sm z-40"
        style={{ backgroundColor: "var(--backdrop-overlay)" }}
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none ">
        <div
          className="shadow rounded-3xl w-[30%] h-[90vh] bg-studio-bg overflow-hidden pointer-events-auto font-garamond border border-select-border"
          style={{
            // background: "var(--card-bg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 border-b border-select-border">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-primary">Bookmarks</h2>
              <span className="text-sm text-secondary">
                ({reversedBookmarks.length} items)
              </span>
            </div>

            <div className="flex items-center space-2">
              {/* View mode toggle - compact version */}
              <div className="flex items-center space-x-1 mr-2">
                <div
                  onClick={() => setViewMode("list")}
                  className={`text-[0.75rem] px-1 py-0.5 rounded transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "text-primary font-medium"
                      : "text-text-secondary hover:text-primary"
                  }`}
                  title="List view"
                >
                  <BookOpenText size={16} className="inline mr-1" />
                </div>
                <span className="text-text-muted dark:text-text-disabled">
                  |
                </span>
                <div
                  onClick={() => setViewMode("tags")}
                  className={`text-[0.75rem] px-1 py-0.5 rounded transition-colors cursor-pointer ${
                    viewMode === "tags"
                      ? "text-primary font-medium"
                      : "text-text-secondary hover:text-primary"
                  }`}
                  title="Tag view"
                >
                  <Tag size={16} className="inline mr-1" />
                </div>
                <span className="text-text-muted dark:text-text-disabled">
                  |
                </span>
                <div
                  onClick={() => setViewMode("grid")}
                  className={`text-[0.75rem] px-1 py-0.5 rounded transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "text-primary font-medium"
                      : "text-text-secondary hover:text-primary"
                  }`}
                  title="Grid view"
                >
                  <Grid size={16} className="inline mr-1" />
                </div>
              </div>

              {/* Clear all div */}
              {reversedBookmarks.length > 0 && (
                <div
                  onClick={handleClearAllBookmarks}
                  className="p-2 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/20 rounded-full transition-colors text-red-500 dark:text-red-400 cursor-pointer"
                  title="Clear all bookmarks"
                >
                  <Trash2 size={16} />
                </div>
              )}

              <div
                onClick={() => dispatch(setActiveFeature(null))}
                className="p-2 hover:bg-select-hover rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-secondary" />
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
                className={`py-4 ${
                  viewMode === "tags"
                    ? "flex flex-wrap gap-2"
                    : viewMode === "grid"
                    ? "grid grid-cols-2 gap-4"
                    : "space-y-0"
                }`}
              >
                {reversedBookmarks.map((bookmark, index) => {
                  // Parse bookmark to get book and verse info
                  const parts = bookmark.split(" ");
                  const chapterVerse = parts[parts.length - 1];
                  const bookName = parts.slice(0, parts.length - 1).join(" ");
                  const scriptureText = getScriptureText(bookmark);

                  // Generate background style based on current projection settings
                  const getBackgroundStyle = () => {
                    if (
                      projectionBackgroundImage &&
                      projectionBackgroundImage.trim() !== ""
                    ) {
                      return {
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${projectionBackgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      };
                    } else if (
                      projectionGradientColors &&
                      projectionGradientColors.length >= 2
                    ) {
                      return {
                        background: `linear-gradient(135deg, ${projectionGradientColors[0]}, ${projectionGradientColors[1]})`,
                      };
                    } else {
                      return {
                        background:
                          "linear-gradient(135deg, var(--card-bg), var(--card-bg-alt))",
                      };
                    }
                  };

                  if (viewMode === "grid") {
                    // Grid view with background images
                    return (
                      <div
                        key={index}
                        onClick={() => handleBookmarkClick(bookmark)}
                        className="relative group cursor-pointer rounded-2xl overflow-hidden border border-select-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        style={{
                          ...getBackgroundStyle(),
                          minHeight: "120px",
                        }}
                      >
                        {/* Content overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-end">
                          <div className="text-white">
                            <div className="flex items-center mb-1">
                              <Star
                                size={12}
                                className="text-yellow-400 mr-1 flex-shrink-0"
                              />
                              <span className="text-xs font-semibold truncate">
                                {bookmark}
                              </span>
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                              "{truncateText(scriptureText, 80)}"
                            </p>
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeBookmark(bookmark));
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    );
                  } else if (viewMode === "tags") {
                  } else if (viewMode === "tags") {
                    // Tag view - just show references as tags
                    return (
                      <div
                        key={index}
                        onClick={() => handleBookmarkClick(bookmark)}
                        className={`relative group inline-flex items-center p-1 px-2 rounded-full cursor-pointer transition-all duration-200
                            bg-gradient-to-r border border-select-border from-card-bg to-card-bg-alt
                          `}
                      >
                        <Star
                          size={12}
                          className="text-secondary mr-2 flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-primary whitespace-nowrap">
                          {bookmark}
                        </span>

                        {/* Remove button for tag */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeBookmark(bookmark));
                          }}
                          className="absolute p-1 px-2 right-0 bottom-4 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                          className="w-full py-0 px-4 transition-all duration-200 border border-solid border-x-0 border-t-0 border-select-border last:border-b-0 cursor-pointer hover:bg-select-hover"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Combined text with star icon, reference, and scripture */}
                              <p className="text-sm leading-relaxed font-[garamond]">
                                <span className="animate-bounce">📮</span>
                                <span className="text-primary bg-select-bg dark:bg-select-bg-alt font-bold px-1 rounded">
                                  {bookmark}
                                </span>
                                <span className="ml-2 bg-card-bg-alt text-primary font-[garamond] px-1 rounded">
                                  "{truncateText(scriptureText, 120)}"
                                </span>
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-3" />
                          </div>
                        </div>

                        {/* Remove bookmark button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeBookmark(bookmark));
                          }}
                          className="absolute top-3 right-2 p-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                <Star size={48} className="text-text-disabled mb-4" />
                <p className="text-text-secondary mb-1">No bookmarks yet</p>
                <p className="text-sm text-text-muted">
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
