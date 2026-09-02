import React, { useMemo } from "react";
import {
  X,
  Trash2,
  Bookmark,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveFeature,
  removeBookmark,
  setBookmarks,
  navigateToVerse,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useTheme } from "@/Provider/Theme";

export const BookmarkPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );
  const { bibleData } = useBibleOperations();
  const { isDarkMode } = useTheme();

  // Show newest bookmarks first
  const orderedBookmarks = useMemo(() => [...bookmarks], [bookmarks]);

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
        return "";
      }

      // Find the book
      const book = bibleData[currentTranslation].books.find(
        (b: any) => b.name.toLowerCase() === bookName.toLowerCase(),
      );

      if (!book) return "";

      if (chapterVerse.includes(":")) {
        const [chapterNum, verseNum] = chapterVerse.split(":");
        const chapter = book.chapters.find(
          (c: any) => c.chapter === parseInt(chapterNum, 10),
        );
        if (!chapter) return "";

        const verse = chapter.verses.find(
          (v: any) => v.verse === parseInt(verseNum, 10),
        );
        return verse ? (typeof verse === "string" ? verse : verse.text || "") : "";
      } else {
        // Just chapter reference, return first verse
        const chapter = book.chapters.find(
          (c: any) => c.chapter === parseInt(chapterVerse, 10),
        );
        if (!chapter || !chapter.verses.length) return "";

        const verse = chapter.verses[0];
        return typeof verse === "string" ? verse : verse.text || "";
      }
    } catch (error) {
      console.error("Error loading scripture text:", error);
      return "";
    }
  };

  const handleClearAllBookmarks = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all bookmarks? This action cannot be undone.",
      )
    ) {
      dispatch(setBookmarks([]));
    }
  };

  const handleRemoveBookmark = (reference: string) => {
    dispatch(removeBookmark(reference));
  };

  const handleBookmarkClick = (bookmark: string) => {
    // Parse the bookmark format "Book Chapter:Verse"
    const parts = bookmark.split(" ");
    const chapterVerse = parts[parts.length - 1];
    const bookName = parts.slice(0, parts.length - 1).join(" ");

    let chapNum: number;
    let verseNum: number;

    if (chapterVerse.includes(":")) {
      const [chapter, verse] = chapterVerse.split(":");
      chapNum = parseInt(chapter, 10);
      verseNum = parseInt(verse, 10);
    } else {
      chapNum = parseInt(chapterVerse, 10);
      verseNum = 1;
    }

    // Single atomic dispatch — prevents partial state from firing auto-sync
    dispatch(
      navigateToVerse({ book: bookName, chapter: chapNum, verse: verseNum }),
    );

    // Close panel
    dispatch(setActiveFeature(null));

    // Send presentation update to open the bookmarked verse immediately
    try {
      if (
        typeof window !== "undefined" &&
        (window as any).api &&
        bibleData &&
        currentTranslation
      ) {
        const translationData = bibleData[currentTranslation];
        const bookData = translationData?.books?.find(
          (b: any) => b.name.toLowerCase() === bookName.toLowerCase(),
        );

        const chap = chapterVerse.includes(":")
          ? parseInt(chapterVerse.split(":")[0], 10)
          : parseInt(chapterVerse, 10);
        const vNum = chapterVerse.includes(":")
          ? parseInt(chapterVerse.split(":")[1], 10)
          : 1;

        const chapterData = bookData?.chapters?.find(
          (c: any) => c.chapter === chap,
        );

        if (chapterData?.verses) {
          const presentationData = {
            book: bookName,
            chapter: chap,
            verses: chapterData.verses,
            translation: currentTranslation,
            selectedVerse: vNum || undefined,
          };

          (window as any).api.sendToBiblePresentation({
            type: "update-data",
            data: presentationData,
          });

          setTimeout(() => {
            try {
              (window as any).api.sendToBiblePresentation({
                type: "update-data",
                data: presentationData,
              });
            } catch (err) {
              // ignore
            }
          }, 160);
        }
      }
    } catch (e) {
      // don't block UI on presentation errors
    }
  };

  return (
    <>
      {/* Backdrop - Lighter white opacity in light mode, subtle blur */}
      <div
        className="fixed inset-0 z-40 transition-opacity"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(0, 0, 0, 0.3)"
            : "rgba(255, 255, 255, 0.35)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Sidebar Panel on Left - Matching HistoryPanel */}
      <div className="fixed inset-0 top-8 flex items-center justify-start z-50 pointer-events-none">
        <div
          className="shadow-2xl w-[30%] h-full overflow-hidden pointer-events-auto border-r border-select-border flex flex-col"
          style={{
            background: "var(--card-bg)",
            boxShadow: isDarkMode
              ? "0 8px 32px rgba(0,0,0,0.6)"
              : "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-select-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-text-primary fill-btn-active-from/20" />
              <h2 className="text-sm font-bold text-text-primary leading-none">
                Bookmarks
              </h2>
              <span className="text-[0.7rem] font-semibold text-text-secondary">
                ({orderedBookmarks.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Clear all button */}
              {orderedBookmarks.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllBookmarks}
                  className="w-7 h-7 rounded-lg bg-select-bg hover:bg-red-500/15 text-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer border border-select-border/60 shadow-2xs"
                  title="Clear all bookmarks"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dispatch(setActiveFeature(null))}
                className="w-7 h-7 rounded-lg bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer border border-select-border/60 shadow-2xs"
                title="Close (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content Listing - Matching the Recents list with no-scrollbar */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2">
            {orderedBookmarks.length > 0 ? (
              <div className="flex flex-col w-full">
                {orderedBookmarks.map((bookmark) => {
                  const text = getScriptureText(bookmark);
                  const truncatedText =
                    text && text.length > 80
                      ? text.substring(0, 80) + "…"
                      : text || "Scripture passage";

                  return (
                    <div
                      key={bookmark}
                      onClick={() => handleBookmarkClick(bookmark)}
                      className="group flex items-center justify-between px-2 py-2 hover:bg-select-hover/70 transition-colors duration-100 cursor-pointer border-b border-dashed border-select-border dark:border-select-border/60 last:border-b-0 rounded-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Bookmark Icon using Theme Styling */}
                        <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-select-bg text-text-secondary group-hover:text-text-primary transition-colors border border-select-border/50">
                          <Bookmark className="w-3.5 h-3.5 fill-current/15" />
                        </div>

                        {/* Text details */}
                        <div className="min-w-0 flex-1">
                          <div className="text-[0.74rem] font-bold text-text-primary leading-tight group-hover:text-btn-active-from transition-colors truncate">
                            {bookmark}
                          </div>
                          <div className="text-[0.65rem] text-text-secondary mt-0.5 truncate leading-tight">
                            {truncatedText}
                          </div>
                        </div>
                      </div>

                      {/* Individual delete action on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBookmark(bookmark);
                        }}
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer ml-1"
                        title="Remove bookmark"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <img
                  src="./svgs/no_files.svg"
                  alt="No Bookmarks"
                  className="w-14 h-14 mb-2.5 opacity-60"
                />
                <p className="text-xs font-semibold text-text-primary">
                  No bookmarks yet
                </p>
                <p className="text-[0.72rem] text-text-secondary mt-0.5">
                  Saved verses will appear here
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
