import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setFontSize,
  setFontFamily,
  setReaderSettingsOpen,
  setViewMode,
  setFontWeight,
  setVerseTextColor,
  setVerseByVerseMode,
} from "@/store/slices/bibleSlice";
import {
  Type,
  X,
  LayoutGrid,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";

type ViewState = "main" | "fontFamily" | "fontSize";

const ReaderSettingsDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<ViewState>("main");
  const {
    fontSize,
    fontFamily,
    readerSettingsOpen,
    viewMode,
    verseByVerseMode,
  } = useAppSelector((state) => state.bible);

  const fontFamilyOptions = [
    { value: "EB Garamond", text: "EB Garamond" },
    { value: "Anton SC", text: "Anton SC" },
    { value: "Big Shoulders Thin", text: "Big Shoulders" },
    { value: "Bitter Thin", text: "Bitter" },
    { value: "Oswald ExtraLight", text: "Oswald" },
    { value: "Archivo Black", text: "Archivo Black" },
    { value: "Roboto Thin", text: "Roboto" },
    { value: "Cooper Black", text: "Cooper Black" },
    { value: "Impact", text: "Impact" },
    { value: "Teko Light", text: "Teko" },
    { value: "serif", text: "Times New Roman" },
    { value: "sans-serif", text: "Arial" },
  ];

  const fontSizeOptions = [
    { value: "xs", text: "Extra Small", description: "0.75rem" },
    { value: "sm", text: "Small", description: "0.875rem" },
    { value: "base", text: "Base", description: "1rem" },
    { value: "small", text: "Small+", description: "1.125rem" },
    { value: "medium", text: "Medium", description: "1.25rem" },
    { value: "large", text: "Large", description: "1.5rem" },
  ];

  // Reset view when dropdown closes
  React.useEffect(() => {
    if (!readerSettingsOpen) {
      setCurrentView("main");
    }
  }, [readerSettingsOpen]);

  const renderHeader = () => {
    const getTitle = () => {
      switch (currentView) {
        case "fontFamily":
          return "Select Font Family";
        case "fontSize":
          return "Select Font Size";
        default:
          return "Reader Settings";
      }
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 border-b  border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <div className="flex items-center gap-2 ">
          {currentView !== "main" && (
            <div
              onClick={() => setCurrentView("main")}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-200 mr-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
            <Type className="w-3 h-3 text-primary" />
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {getTitle()}
          </span>
        </div>
        <div
          onClick={() => dispatch(setReaderSettingsOpen(false))}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </div>
      </div>
    );
  };

  const renderMainView = () => (
    <div className="p-4 z-50 space-y-5  h-full">
      {/* Reading View Toggle */}
      <div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Reading View
        </div>
        <div className="flex bg-gray-100/80 dark:bg-primary/20 rounded-xl p-1.5">
          <div
            onClick={() => dispatch(setViewMode("block"))}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              viewMode === "block"
                ? "bg-white dark:bg-primary/50 text-primary dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Block
          </div>
          <div
            onClick={() => dispatch(setViewMode("paragraph"))}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              viewMode === "paragraph"
                ? "bg-white dark:bg-primary/50 text-primary shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shadow"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Paragraph
          </div>
        </div>
      </div>

      {/* Font Size Button */}
      <div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Font Size
        </div>
        <div
          onClick={() => setCurrentView("fontSize")}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 cursor-pointer rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set Font Size
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-sm">
              {fontSizeOptions.find((opt) => opt.value === fontSize)?.text}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          </div>
        </div>
      </div>

      {/* Font Family Button */}
      <div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
          Font Family
        </div>
        <div
          onClick={() => setCurrentView("fontFamily")}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 cursor-pointer rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set Font Family
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-sm">
              {fontFamilyOptions.find((opt) => opt.value === fontFamily)?.text}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide ">
          Preview
        </div>
        <div className="text-center py-4 px-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
          <p
            className="text-gray-900 dark:text-white font-medium mb-2"
            style={{
              fontFamily: fontFamily,
              fontSize:
                fontSize === "xs"
                  ? "11px"
                  : fontSize === "sm"
                  ? "12px"
                  : fontSize === "base"
                  ? "14px"
                  : fontSize === "small"
                  ? "16px"
                  : fontSize === "medium"
                  ? "18px"
                  : fontSize === "large"
                  ? "20px"
                  : fontSize === "xl"
                  ? "22px"
                  : "24px",
            }}
          >
            "For God so loved the world..."
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            John 3:16
          </div>
        </div>
      </div>
    </div>
  );

  const renderFontSizeView = () => (
    <div className="p-4">
      <div className="space-y-2 max-h-[calc(80vh-80px)] overflow-y-auto no-scrollbar">
        {fontSizeOptions.map((option) => (
          <div
            key={option.value}
            onClick={() => {
              dispatch(setFontSize(option.value));
              setCurrentView("main");
            }}
            className={`w-full cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
              fontSize === option.value
                ? "bg-white/95 dark:bg-[#1a1a1a]/95 border-gray-300/60 dark:border-gray-600/60 shadow-sm"
                : "bg-white/95 dark:bg-primary/5 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/60 dark:hover:border-gray-600/60 text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-left">
                <div className="font-medium">{option.text}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </div>
            <div className="text-sm" style={{ fontSize: option.description }}>
              Aa
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFontFamilyView = () => (
    <div className="p-4">
      <div className="space-y-0 max-h-[calc(80vh-80px)] overflow-y-auto no-scrollbar ">
        {fontFamilyOptions.map((option, index) => (
          <div
            key={option.value}
            onClick={() => {
              dispatch(setFontFamily(option.value));
              setCurrentView("main");
            }}
            className={`w-full p-4 transition-all duration-200  border-b border-solid border-x-0 border-t-0  border-gray-200/50 dark:border-gray-700/50 last:border-b-0 cursor-pointer ${
              fontFamily === option.value
                ? "text-gray-900 dark:text-white"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div className="text-left">
              <div className="font-medium mb-1">{option.text}</div>
              <div
                className="text-sm text-gray-500 dark:text-gray-400"
                style={{ fontFamily: option.value }}
              >
                "For God so loved the world..."
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!readerSettingsOpen || verseByVerseMode) return null;

  return (
    <AnimatePresence>
      {readerSettingsOpen && !verseByVerseMode && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => dispatch(setReaderSettingsOpen(false))}
          />

          {/* Multi-View Floating Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.5,
            }}
            className="absolute top-8 right-0 z-50 w-[300px] h-[80vh] bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl overflow-hidden"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            {renderHeader()}

            {/* Animated Content Views */}
            <div className="relative h-full overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 ">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, x: currentView === "main" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: currentView === "main" ? 20 : -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.5,
                  }}
                  className="absolute inset-0"
                >
                  {currentView === "main" && renderMainView()}
                  {currentView === "fontSize" && renderFontSizeView()}
                  {currentView === "fontFamily" && renderFontFamilyView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReaderSettingsDropdown;
