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

const SearchPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchTerm, searchResults, exactMatch, wholeWords } = useAppSelector(
    (state) => state.bible
  );

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
        <div className="bg-white dark:bg-[#352921] shadow dark:shadow-primary rounded-3xl w-full max-w-3xl h-[62vh] overflow-hidden pointer-events-auto font-garamond">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
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
              className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                placeholder="Search scripture..."
                className="w-[80%] border-none rounded-full px-4 py-3 pl-10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 font-garamond"
              />
              <SearchIcon
                size={18}
                className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
              />
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={() => dispatch(setExactMatch(!exactMatch))}
                className="flex bg-gray-50 dark:bg-black/20 rounded-full  pl-10 items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
              >
                {exactMatch ? (
                  <ToggleRight size={16} className="text-primary" />
                ) : (
                  <ToggleLeft size={16} />
                )}
                <span>Exact match</span>
              </button>
              <button
                onClick={() => dispatch(setWholeWords(!wholeWords))}
                className="flex bg-gray-50 dark:bg-black/20 rounded-full  pl-10 items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
              >
                {wholeWords ? (
                  <ToggleRight size={16} className="text-primary" />
                ) : (
                  <ToggleLeft size={16} />
                )}
                <span>Whole words</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="p-4 overflow-y-auto no-scrollbar"
            style={{ height: "calc(60vh - 12rem)" }}
          >
            {searchResults.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700/50">
                    <th className="pb-2 pl-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reference
                    </th>
                    <th className="pb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Text
                    </th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr
                      key={index}
                      onClick={() =>
                        handleResultClick(
                          result.book,
                          result.chapter,
                          result.verse
                        )
                      }
                      className="group cursor-pointer font-[garamond] hover:bg-primary/5 dark:hover:bg-white/5 transition-all duration-200"
                    >
                      <td className="py-1 pl-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {result.book} {result.chapter}:{result.verse}
                        </span>
                      </td>
                      <td className="py pr-8">
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {result.text}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <ChevronRight
                          size={14}
                          className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : searchTerm ? (
              <div className="flex flex-col items-center justify-center h-full text-center font-garamond">
                <SearchIcon
                  size={48}
                  className="text-gray-300 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">
                  No results found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
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
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
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
