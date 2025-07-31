import React, { useMemo } from "react";
import { X, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature, setCurrentBook, setCurrentChapter, setCurrentVerse, removeBookmark } from "@/store/slices/bibleSlice";

export const BookmarkPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);

  // Create a memoized reversed copy of bookmarks
  const reversedBookmarks = useMemo(() => [...bookmarks].reverse(), [bookmarks]);

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
        className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white dark:bg-[#1a1a1a]/80 rounded-3xl w-1/2 h-[60vh] overflow-hidden pointer-events-auto font-garamond">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bookmarks</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">({reversedBookmarks.length} items)</span>
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-scroll no-scrollbar" style={{ height: 'calc(60vh - 4rem)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {reversedBookmarks.length > 0 ? (
                reversedBookmarks.map((bookmark, index) => (
                  <div key={index} className="relative group flex items-center justify-center">
                    <button
                      onClick={() => handleBookmarkClick(bookmark)}
                      className="w-full flex flex-col p-3 bg-gray-50 dark:bg-black/20 hover:bg-primary/5 dark:hover:bg-white/5 rounded-full transition-all duration-200 text-left group-hover:ring-2 group-hover:ring-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" style={{ fontFamily: 'garamond' }}>
                          {bookmark}
                        </span>
                        <Star size={14} className="text-yellow-500 opacity-70 flex-shrink-0" />
                      </div>
                    </button>
                    <button
                      onClick={() => dispatch(removeBookmark(bookmark))}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X size={12} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-full text-center">
                  <Star size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No bookmarks yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Your bookmarks will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookmarkPanel;