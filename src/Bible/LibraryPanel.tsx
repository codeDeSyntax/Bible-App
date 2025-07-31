import React, { useState } from "react";
import { X, ChevronRight, Book } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { CustomSelect } from "@/shared/Selector";
import { useTheme } from "@/Provider/Theme";
import { setCurrentTranslation, setCurrentBook, setCurrentChapter, setCurrentVerse, setActiveFeature } from "@/store/slices/bibleSlice";

const LibraryPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    bookList,
    currentTranslation,
    currentBook,
  } = useAppSelector((state) => state.bible);

  const [translation, setTranslation] = useState(currentTranslation);
  const { isDarkMode } = useTheme();

  // Group books by testament
  const oldTestament = bookList.slice(0, 39);
  const newTestament = bookList.slice(39);

  const translations = [
    { value: "KJV", text: "King James Version" },
    { value: "TWI", text: "TWI version" },
    { value: "EWE", text: "Ewe version" },
    { value: "FRENCH", text: "French" },
  ];

  const handleTranslationChange = (value: string) => {
    setTranslation(value);
    dispatch(setCurrentTranslation(value));
  };

  const handleBookClick = (book: string) => {
    dispatch(setCurrentBook(book));
    dispatch(setCurrentChapter(1));
    dispatch(setCurrentVerse(null));
    dispatch(setActiveFeature(null));
  };

  const renderTestamentTable = (books: any[], title: string) => (
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl bg-white dark:bg-black/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-black/40">
              <th className="text-left py-3 pl-4 pr-2 text-sm font-medium text-gray-500 dark:text-gray-400">Book</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Chapters</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr
                key={book.name}
                onClick={() => handleBookClick(book.name)}
                className={`cursor-pointer transition-all duration-200 ${
                  currentBook === book.name
                    ? "bg-primary/5 dark:bg-primary/10"
                    : index % 2 === 0
                    ? "bg-white dark:bg-transparent"
                    : "bg-gray-50 dark:bg-black/10"
                } hover:bg-primary/5 dark:hover:bg-white/5`}
              >
                <td className="py-3 pl-4 pr-2">
                  <div className="flex items-center space-x-3">
                    <Book size={16} className={`${
                      currentBook === book.name
                        ? "text-primary dark:text-primary"
                        : "text-gray-400 dark:text-gray-500"
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentBook === book.name
                        ? "text-primary dark:text-primary"
                        : "text-gray-900 dark:text-gray-100"
                    }`}>
                      {book.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {book.chapters.length} chapters
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <ChevronRight size={16} className={`ml-auto ${
                    currentBook === book.name
                      ? "text-primary dark:text-primary"
                      : "text-gray-400 dark:text-gray-500"
                  } opacity-0 group-hover:opacity-100 transition-opacity`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))} 
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl w-[60%] h-[80vh] overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bible Library</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Browse through books of the Bible</p>
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto no-scrollbar" style={{ height: 'calc(80vh - 5rem)' }}>
            {/* Translation selector */}
            <div className="mb-6 bg-gray-50 dark:bg-black/20 p-4 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Translation
              </label>
              <CustomSelect
                value={translation}
                onChange={handleTranslationChange}
                options={translations}
                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>

            {/* Books tables */}
            <div className="flex gap-6">
              {renderTestamentTable(oldTestament, "Old Testament")}
              {renderTestamentTable(newTestament, "New Testament")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LibraryPanel;