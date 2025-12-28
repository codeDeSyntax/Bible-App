import React, { useState } from "react";
import { X, ChevronRight, Book } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { CustomSelect } from "@/shared/Selector";
import { useTheme } from "@/Provider/Theme";
import {
  setCurrentTranslation,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setActiveFeature,
} from "@/store/slices/bibleSlice";

const LibraryPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bookList, currentTranslation, currentBook } = useAppSelector(
    (state) => state.bible
  );
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage
  );
  const projectionGradientColors = useAppSelector(
    (state) => state.bible.projectionGradientColors
  );

  const [translation, setTranslation] = useState(currentTranslation);
  const { isDarkMode } = useTheme();

  // Check if there's a background image or gradient
  const hasBackgroundImage =
    (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") ||
    (projectionGradientColors && projectionGradientColors.length >= 2);

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

  const renderTestamentTable = (
    books: any[],
    title: string,
    side: "left" | "right"
  ) => (
    <div className="flex-1">
      <h3 className="text-[0.9rem] font-semibold text-center text-text-primary mb-2 px-1 font-[garamond]">
        {title}
      </h3>
      <div className="space-y-0.5 flex flex-col items-center justify-center">
        {books.map((book) => (
          <div
            key={book.name}
            onClick={() => handleBookClick(book.name)}
            className={`group cursor-pointer font-[garamond]  px-2 hover:bg-primary/5 dark:hover:bg-white/5 rounded transition-all duration-200 ${
              currentBook === book.name
                ? "bg-primary/10 dark:bg-[#2c2c2c]/90"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {/* <Book
                  size={12}
                  className={`${
                    currentBook === book.name
                      ? "text-primary dark:text-primary"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                /> */}
                <div className=" flex-1 bg-gradient-to-r py-1  from-transparent via-gray-100 dark:via-stone-600 to-transparent text-center">
                  <span
                    className={`text-sm font-medium block truncate ${
                      currentBook === book.name
                        ? "text-text-primary italic font-bold"
                        : "text-text-primary"
                    }`}
                  >
                    {book.name}{" "}
                    {
                      <span className="text-[0.9rem] text-text-secondary">
                        {book.chapters.length}
                      </span>
                    }
                  </span>
                </div>
              </div>
              <ChevronRight
                size={10}
                className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className="shadow rounded-3xl w-[30%] h-[90vh] overflow-hidden pointer-events-auto font-[garamond] border border-select-border"
          style={{
            background: "var(--card-bg)",
            boxShadow: isDarkMode
              ? "0 8px 32px rgba(0,0,0,0.6)"
              : "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#faeed1]">
                Library
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({bookList.length} books)
              </span>
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Translation Selector */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700/50">
            <CustomSelect
              value={translation}
              onChange={handleTranslationChange}
              options={translations}
              className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-full px-3 py-1.5 text-[0.9rem] font-[garamond]"
            />
          </div>

          {/* Content */}
          <div
            className="px-3 overflow-y-auto no-scrollbar"
            style={{ height: "calc(90vh - 9rem)" }}
          >
            <div className="py-3 flex gap-3">
              {renderTestamentTable(oldTestament, "Old Testament", "left")}
              {renderTestamentTable(newTestament, "New Testament", "right")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LibraryPanel;
