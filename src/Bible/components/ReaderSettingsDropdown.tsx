import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setFontSize,
  setFontFamily,
  setReaderSettingsOpen,
  setViewMode,
} from "@/store/slices/bibleSlice";
import { Type, X, LayoutGrid, BookOpen } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

const ReaderSettingsDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const {
    fontSize,
    fontFamily,
    readerSettingsOpen,
    viewMode,
    verseByVerseMode,
  } = useAppSelector((state) => state.bible);

  const fontFamilyOptions = [
    { value: "garamond", text: "Garamond" },
    { value: "serif", text: "Serif" },
    { value: "sans-serif", text: "Sans-serif" },
    { value: "Palatino", text: "Palatino" },
    { value: "Bookman", text: "Bookman" },
    { value: "Trebuchet MS", text: "Trebuchet MS" },
  ];

  const fontSizeOptions = [
    { value: "xs", text: "Extra Small" },
    { value: "sm", text: "Small" },
    { value: "base", text: "Base" },
    { value: "small", text: "Small+" },
    { value: "medium", text: "Medium" },
    { value: "large", text: "Large" },
    { value: "xl", text: "Extra Large" },
    { value: "2xl", text: "XX-Large" },
  ];

  if (!readerSettingsOpen || verseByVerseMode) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => dispatch(setReaderSettingsOpen(false))}
      />

      {/* Dropdown */}
      <div
        className="absolute top-8 right-0 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-4"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-600 to-amber-700 dark:from-stone-600 dark:to-stone-500 flex items-center justify-center shadow-md">
              <Type className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Reader Settings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize your reading experience
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setReaderSettingsOpen(false))}
            className="p-2 rounded-xl bg-gray-100/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reader View Mode */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Reading View
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => dispatch(setViewMode("block"))}
              className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                viewMode === "block"
                  ? "bg-gradient-to-r from-stone-600 to-amber-700 dark:from-stone-600 dark:to-stone-500 text-white border-transparent shadow-md"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Block View
            </button>
            <button
              onClick={() => dispatch(setViewMode("paragraph"))}
              className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                viewMode === "paragraph"
                  ? "bg-gradient-to-r from-stone-600 to-amber-700 dark:from-stone-600 dark:to-stone-500 text-white border-transparent shadow-md"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Paragraph View
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Font Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => dispatch(setFontSize(option.value))}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  fontSize === option.value
                    ? "bg-gradient-to-r from-stone-600 to-amber-700 dark:from-stone-600 dark:to-stone-500 text-white border-transparent shadow-md"
                    : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Font Family
          </label>
          <div className="space-y-2">
            {fontFamilyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => dispatch(setFontFamily(option.value))}
                className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all duration-200 border ${
                  fontFamily === option.value
                    ? "bg-gradient-to-r from-stone-600 to-amber-700 dark:from-stone-600 dark:to-stone-500 text-white border-transparent shadow-md"
                    : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80"
                }`}
                style={{ fontFamily: option.value }}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <p
              className="text-gray-900 dark:text-white font-medium mb-2"
              style={{
                fontFamily: fontFamily,
                fontSize:
                  fontSize === "xs"
                    ? "0.75rem"
                    : fontSize === "sm"
                    ? "0.875rem"
                    : fontSize === "base"
                    ? "1rem"
                    : fontSize === "small"
                    ? "1.25rem"
                    : fontSize === "medium"
                    ? "1.5rem"
                    : fontSize === "large"
                    ? "1.875rem"
                    : fontSize === "xl"
                    ? "2.25rem"
                    : "2.5rem",
              }}
            >
              "For God so loved the world..."
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              John 3:16 Preview
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReaderSettingsDropdown;
