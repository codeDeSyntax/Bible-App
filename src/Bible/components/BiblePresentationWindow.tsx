import React, { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@/store";
import { Monitor, X, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BiblePresentationWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BibleDisplayData {
  book: string;
  chapter: number;
  verses: Array<{
    verse: number;
    text: string;
  }>;
  translation: string;
  selectedVerse?: number;
}

const BiblePresentationWindow: React.FC<BiblePresentationWindowProps> = ({
  isOpen,
  onClose,
}) => {
  const [presentationData, setPresentationData] =
    useState<BibleDisplayData | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(6); // Default to text-6xl
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#1e293b");
  const [versesPerSlide, setVersesPerSlide] = useState(1);
  const windowRef = useRef<Window | null>(null);

  // Get current Bible state
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const selectedVerse = useAppSelector((state) => state.bible.currentVerse);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const bibleData = useAppSelector((state) => state.bible.bibleData);

  // Font size mapping
  const getFontSizeClass = () => {
    const sizeMap: { [key: number]: string } = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
      8: "text-8xl",
    };
    return sizeMap[fontSize] || "text-6xl";
  };

  // Load presentation data when Bible state changes
  useEffect(() => {
    if (currentBook && currentChapter && bibleData && currentTranslation) {
      const translationData = bibleData[currentTranslation];
      if (translationData && translationData.books) {
        const bookData = translationData.books.find(
          (book: any) => book.name === currentBook
        );

        if (bookData) {
          const chapterData = bookData.chapters?.find(
            (ch: any) => ch.chapter === currentChapter
          );

          if (chapterData?.verses) {
            setPresentationData({
              book: currentBook,
              chapter: currentChapter,
              verses: chapterData.verses,
              translation: currentTranslation,
              selectedVerse: selectedVerse || undefined,
            });

            // Set current verse index
            if (selectedVerse) {
              const verseIndex = chapterData.verses.findIndex(
                (v: any) => v.verse === selectedVerse
              );
              setCurrentVerseIndex(Math.max(0, verseIndex));
            }
          }
        }
      }
    }
  }, [
    currentBook,
    currentChapter,
    selectedVerse,
    currentTranslation,
    bibleData,
  ]);

  // Open presentation window
  const openPresentationWindow = () => {
    if (typeof window !== "undefined" && window.api) {
      // Request Electron to create a Bible presentation window
      window.api.createBiblePresentationWindow({
        presentationData,
        settings: {
          fontSize,
          textColor,
          backgroundColor,
          versesPerSlide,
        },
      });
    }
  };

  // Navigation functions
  const nextVerse = () => {
    if (
      presentationData &&
      currentVerseIndex < presentationData.verses.length - 1
    ) {
      setCurrentVerseIndex(currentVerseIndex + 1);
      sendToPresentationWindow("navigate", {
        direction: "next",
        index: currentVerseIndex + 1,
      });
    }
  };

  const prevVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
      sendToPresentationWindow("navigate", {
        direction: "prev",
        index: currentVerseIndex - 1,
      });
    }
  };

  const goToVerse = (index: number) => {
    setCurrentVerseIndex(index);
    sendToPresentationWindow("navigate", { direction: "goto", index });
  };

  // Send data to presentation window
  const sendToPresentationWindow = (type: string, data: any) => {
    if (typeof window !== "undefined" && window.api) {
      window.api.sendToBiblePresentation({ type, data });
    }
  };

  // Update presentation window when settings change
  useEffect(() => {
    if (isOpen) {
      sendToPresentationWindow("update-settings", {
        fontSize,
        textColor,
        backgroundColor,
        versesPerSlide,
      });
    }
  }, [fontSize, textColor, backgroundColor, versesPerSlide, isOpen]);

  // Update presentation data
  useEffect(() => {
    if (isOpen && presentationData) {
      sendToPresentationWindow("update-data", presentationData);
    }
  }, [presentationData, isOpen]);

  if (!isOpen) return null;

  const currentVerse = presentationData?.verses[currentVerseIndex];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-11/12 max-w-4xl h-5/6 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Monitor size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bible Presentation
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {presentationData?.book} {presentationData?.chapter} -{" "}
                {presentationData?.translation}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Presentation Settings
                </h3>

                {/* Font Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {getFontSizeClass()}
                  </div>
                </div>

                {/* Text Color */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Background Color */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Verses Per Slide */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verses Per Slide
                  </label>
                  <select
                    value={versesPerSlide}
                    onChange={(e) =>
                      setVersesPerSlide(parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={1}>1 verse</option>
                    <option value={2}>2 verses</option>
                    <option value={3}>3 verses</option>
                    <option value={5}>5 verses</option>
                  </select>
                </div>

                {/* Open Presentation Button */}
                <button
                  onClick={openPresentationWindow}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Monitor size={20} />
                  Open Presentation Window
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevVerse}
                    disabled={currentVerseIndex === 0}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300 px-3">
                    Verse {currentVerse?.verse || 1} of{" "}
                    {presentationData?.verses.length || 1}
                  </span>
                  <button
                    onClick={nextVerse}
                    disabled={
                      currentVerseIndex ===
                      (presentationData?.verses.length || 1) - 1
                    }
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div
                className="w-full h-full rounded-xl flex items-center justify-center p-8"
                style={{ backgroundColor }}
              >
                {currentVerse && (
                  <div className="text-center max-w-4xl">
                    <p
                      className={`${getFontSizeClass()} font-medium leading-relaxed`}
                      style={{ color: textColor }}
                    >
                      {currentVerse.text}
                    </p>
                    <p
                      className="text-2xl mt-6 opacity-75"
                      style={{ color: textColor }}
                    >
                      {presentationData?.book} {presentationData?.chapter}:
                      {currentVerse.verse}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Verse List */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {presentationData?.verses.map((verse, index) => (
                  <button
                    key={verse.verse}
                    onClick={() => goToVerse(index)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                      index === currentVerseIndex
                        ? "bg-blue-600 text-white"
                        : verse.verse === presentationData.selectedVerse
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {verse.verse}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BiblePresentationWindow;
