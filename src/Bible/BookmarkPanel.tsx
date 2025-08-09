import React, { useMemo } from "react";
import { X, Star, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveFeature,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  removeBookmark,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

export const BookmarkPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const { bibleData } = useBibleOperations();

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
        className="fixed inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white dark:bg-[#352921] shadow shadow-primary rounded-3xl w-[70%] h-[60vh] overflow-hidden pointer-events-auto font-garamond">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Bookmarks
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({reversedBookmarks.length} items)
              </span>
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div
            className="p-4 overflow-y-scroll no-scrollbar"
            style={{ height: "calc(60vh - 4rem)" }}
          >
            {reversedBookmarks.length > 0 ? (
              <div className="space-y-0">
                {reversedBookmarks.map((bookmark, index) => {
                  // Parse bookmark to get book and verse info
                  const parts = bookmark.split(" ");
                  const chapterVerse = parts[parts.length - 1];
                  const bookName = parts.slice(0, parts.length - 1).join(" ");
                  const scriptureText = getScriptureText(bookmark);

                  return (
                    <div key={index} className="relative group">
                      <div
                        onClick={() => handleBookmarkClick(bookmark)}
                        className="w-full  pt-3 px-4 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-gray-200/50 dark:border-gray-700/50 last:border-b-0 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/5 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Star
                                size={14}
                                className="text-amber-500 flex-shrink-0"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {bookmark}
                              </span>
                            </div>
                            {/* Scripture Text Preview */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-6">
                              "{truncateText(scriptureText, 120)}"
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
                <p className="text-sm text-gray-400 dark:text-gray-500">
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
