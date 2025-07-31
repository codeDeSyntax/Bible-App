import React from "react";
import { X, Clock, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature, setCurrentBook, setCurrentChapter, setCurrentVerse, clearHistory } from "@/store/slices/bibleSlice";
import { useTheme } from "@/Provider/Theme";

const HistoryPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useAppSelector((state) => state.bible.history);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const { isDarkMode } = useTheme();

  const handleHistoryClick = (historyItem: string) => {
    // Parse the history format "Book Chapter:Verse"
    const parts = historyItem.split(" ");
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

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
        <div className="bg-white dark:bg-[#1a1a1a]/80 rounded-3xl w-2/3 h-[60vh] overflow-hidden pointer-events-auto font-garamond">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">History</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">({history.length} items)</span>
            </div>
            <div className="flex items-center space-x-2">
              {history.length > 0 && (
                <button
                  onClick={() => dispatch(clearHistory())}
                  className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => dispatch(setActiveFeature(null))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto no-scrollbar" style={{ height: 'calc(60vh - 4rem)' }}>
            {history.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700/50">
                    <th className="pb-2 pl-4 text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
                    <th className="pb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Book</th>
                    <th className="pb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Reference</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((item, index) => {
                    const parts = item.reference.split(" ");
                    const reference = parts[parts.length - 1];
                    const book = parts.slice(0, parts.length - 1).join(" ");
                    
                    return (
                      <tr
                        key={index}
                        onClick={() => handleHistoryClick(item.reference)}
                        className="group cursor-pointer hover:bg-primary/5 dark:hover:bg-white/5 transition-all duration-200"
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center space-x-2">
                            <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {index === 0 ? "Just now" : `${index + 1} reads ago`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{book}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{reference}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Clock size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reading history yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Your reading history will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryPanel;