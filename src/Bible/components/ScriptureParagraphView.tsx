import React, { useState } from "react";
import { Star, StarOff, Copy, ChevronRight, ArrowRight } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface Verse {
  verse: number;
  text: string;
}

interface ScriptureParagraphViewProps {
  verses: Verse[];
  verseRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
  selectedVerse: number | null;
  getFontSize: () => string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  theme: string;
  getVerseHighlight: (verse: number) => string | null;
  isBookmarked: (verse: number) => boolean;
  toggleBookmark: (verse: number) => void;
  handleShare: (text: string, title: string) => Promise<void>;
  currentBook: string;
  currentChapter: number;
  selectedBg: string | null;
  highlightVerse: (verse: number, color: string) => void;
  imageBackgroundMode: boolean;
  isFullScreen: boolean;
  onVerseClick?: (verse: number) => void;
  // Chapter navigation props
  chapterCount: number;
  handleNextChapter: () => void;
  handlePreviousChapter: () => void;
}

const ScriptureParagraphView: React.FC<ScriptureParagraphViewProps> = ({
  verses,
  verseRefs,
  selectedVerse,
  getFontSize,
  fontSize,
  fontFamily,
  fontWeight,
  theme,
  getVerseHighlight,
  isBookmarked,
  toggleBookmark,
  handleShare,
  currentBook,
  currentChapter,
  selectedBg,
  highlightVerse,
  imageBackgroundMode,
  isFullScreen,
  onVerseClick,
  chapterCount,
  handleNextChapter,
  handlePreviousChapter,
}) => {
  const { isDarkMode } = useTheme();
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [popupTimeout, setPopupTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnterVerse = (verseNumber: number) => {
    if (popupTimeout) {
      clearTimeout(popupTimeout);
      setPopupTimeout(null);
    }
    setHoveredVerse(verseNumber);
  };

  const handleMouseLeaveVerse = () => {
    // Add a small delay before hiding to allow moving to popup
    const timeout = setTimeout(() => {
      setHoveredVerse(null);
    }, 200);
    setPopupTimeout(timeout);
  };

  const handleMouseEnterPopup = () => {
    if (popupTimeout) {
      clearTimeout(popupTimeout);
      setPopupTimeout(null);
    }
  };

  const handleMouseLeavePopup = () => {
    setHoveredVerse(null);
  };

  const formatVerseText = (text: string, highlightColor: string | null) => {
    const parts = text.trim().split(/[\u2039\u203a]/);

    if (parts.length <= 1 && !highlightColor) return text;

    const result = [];
    let isInside = false;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        if (isInside) {
          result.push(
            <span
              key={`red-${i}`}
              style={{ color: isDarkMode ? "#f07f3d" : "#b1724e" }}
              className=" text-center italic"
            >
              {parts[i]}
            </span>
          );
        } else {
          result.push(
            <span
              key={`normal-${i}`}
              className="hover:underline text-center"
              style={
                highlightColor
                  ? {
                      backgroundColor: `${highlightColor}80`,
                      color: isDarkMode ? "#f7d4bc" : "#1f2937", // Light gray for dark mode, dark gray for light mode
                      lineHeight: 1.2,
                    }
                  : {}
              }
            >
              {parts[i]}
            </span>
          );
        }
      }
      isInside = !isInside;
    }

    return result;
  };

  // Dynamic line height calculation based on font size
  const getLineHeight = () => {
    const fontSizeNum = Number(fontSize);

    if (fontSizeNum <= 0.75) return "2.0"; // xs: Extra spacing for very small fonts
    if (fontSizeNum <= 0.875) return "1.9"; // sm: More spacing for small fonts
    if (fontSizeNum <= 1.0) return "1.8"; // base: Good spacing for base fonts
    if (fontSizeNum <= 1.25) return "1.7"; // small: Adequate spacing
    if (fontSizeNum <= 1.5) return "1.6"; // Medium-small fonts
    if (fontSizeNum <= 2.0) return "1.4"; // Medium fonts
    if (fontSizeNum <= 2.5) return "1.3"; // Medium-large fonts
    if (fontSizeNum <= 3.0) return "1.2"; // Large fonts: tighter line height
    return "1.1"; // Very large fonts: minimal gaps
  };

  return (
    <div
      className={`relative min-h-screen w-full ${
        imageBackgroundMode
          ? "bg-cover bg-center bg-no-repeat"
          : "bg-white dark:bg-ltgray"
      }`}
      style={
        imageBackgroundMode
          ? {
              backgroundImage: `url(${selectedBg})`,
              height: "100vh",
            }
          : {}
      }
    >
      {/* Centered content container with 80% width */}
      <div className="reading-container">
        <div
          className="px-5"
          style={{
            fontFamily,
            fontWeight,
            fontSize: getFontSize(),
            color: isDarkMode
              ? "#f7d4bc" // Light gray for dark mode
              : "#1f2937", // Always dark gray/black for light mode
          }}
        >
          <p
            className="text-left leading-loose scripturetext"
            style={{ lineHeight: "1.4" }}
          >
            {verses.map((verse, index) => (
              <span
                key={verse.verse}
                className="relative inline text-center"
                onMouseEnter={() => handleMouseEnterVerse(verse.verse)}
                onMouseLeave={handleMouseLeaveVerse}
              >
                {/* Hidden ref element for scrolling */}
                <div
                  ref={(el) => (verseRefs.current[verse.verse] = el)}
                  className="absolute"
                  style={{ top: "-60px" }}
                  data-verse={verse.verse}
                />

                {/* Inline verse number with contrasting colors that match your color scheme */}
                <span
                  className="font-bold cursor-pointer px-1.5 py-1 rounded mr-1 transition-all duration-200 relative hover:bg-black/10 dark:hover:bg-white/15"
                  style={{
                    fontSize: Number(fontSize) - 0.05 + "rem",
                    verticalAlign: "baseline",
                    lineHeight: "inherit",
                    color: isDarkMode
                      ? "#d1d5db" // Light gray for dark mode - good contrast
                      : "#4b5563", // Medium-dark gray for light mode - better visibility
                    backgroundColor: isDarkMode
                      ? "" // Light gray background in dark mode
                      : "", // Dark gray background in light mode
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerseClick?.(verse.verse);
                  }}
                >
                  {verse.verse}
                </span>

                {/* Modern highlight color popup - shows on verse text hover and stays visible */}
                {hoveredVerse === verse.verse && (
                  <div
                    className="highlight-popup show"
                    style={{
                      position: "absolute",
                      top: "70%",
                      left: "25%",
                      transform: "translateX(-50%) translateY(0%) ",
                      zIndex: 60,
                    }}
                    onMouseEnter={handleMouseEnterPopup}
                    onMouseLeave={handleMouseLeavePopup}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        Highlight:
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Warm Amber highlight - works in both modes */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(
                              verse.verse,
                              isDarkMode ? "#92400e" : "#FCD34D"
                            );
                            setHoveredVerse(null);
                          }}
                          className="w-4 h-4 rounded-full bg-amber-200 hover:bg-amber-300 border border-amber-300 cursor-pointer transition-colors"
                          title="Amber highlight"
                        />

                        {/* Green highlight - readable in both modes */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(
                              verse.verse,
                              isDarkMode ? "#166534" : "#86EFAC"
                            );
                            setHoveredVerse(null);
                          }}
                          className="w-4 h-4 rounded-full bg-green-200 hover:bg-green-300 border border-green-300 cursor-pointer transition-colors"
                          title="Green highlight"
                        />

                        {/* Blue highlight - proper contrast */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(
                              verse.verse,
                              isDarkMode ? "#1e40af" : "#93C5FD"
                            );
                            setHoveredVerse(null);
                          }}
                          className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 border border-blue-300 cursor-pointer transition-colors"
                          title="Blue highlight"
                        />

                        {/* Purple highlight - good visibility */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(
                              verse.verse,
                              isDarkMode ? "#7c2d12" : "#C4B5FD"
                            );
                            setHoveredVerse(null);
                          }}
                          className="w-4 h-4 rounded-full bg-purple-200 hover:bg-purple-300 border border-purple-300 cursor-pointer transition-colors"
                          title="Purple highlight"
                        />

                        {/* Rose highlight - warm and visible */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(
                              verse.verse,
                              isDarkMode ? "#be123c" : "#FDA4AF"
                            );
                            setHoveredVerse(null);
                          }}
                          className="w-4 h-4 rounded-full bg-rose-200 hover:bg-rose-300 border border-rose-300 cursor-pointer transition-colors"
                          title="Rose highlight"
                        />

                        {/* Remove highlight */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(verse.verse, "reset");
                            setHoveredVerse(null);
                          }}
                          className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center justify-center cursor-pointer transition-colors border border-gray-400 dark:border-gray-500"
                          title="Remove highlight"
                        >
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                            ×
                          </span>
                        </div>
                      </div>

                      {/* Additional action buttons with improved colors */}
                      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-gray-600">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(verse.verse);
                            setHoveredVerse(null);
                          }}
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={
                            isBookmarked(verse.verse)
                              ? "Remove bookmark"
                              : "Add bookmark"
                          }
                        >
                          {isBookmarked(verse.verse) ? (
                            <Star
                              size={12}
                              className="text-amber-600 dark:text-amber-400"
                            />
                          ) : (
                            <StarOff
                              size={12}
                              className="text-stone-500 dark:text-stone-400"
                            />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(
                              `${currentBook} ${currentChapter}:${verse.verse}`,
                              verse.text
                            );
                            setHoveredVerse(null);
                          }}
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Share or copy verse"
                        >
                          <Copy
                            size={12}
                            className="text-stone-600 dark:text-stone-400"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verse text with formatting */}
                <span
                  className=" text-center leading-relaxed"
                  style={{
                    backgroundColor: getVerseHighlight(verse.verse)
                      ? `${getVerseHighlight(verse.verse)}80`
                      : "transparent",
                    textDecoration: getVerseHighlight(verse.verse)
                      ? ""
                      : "none",
                  }}
                >
                  {formatVerseText(
                    verse.text.trim(),
                    getVerseHighlight(verse.verse)
                  )}
                </span>

                {/* Add space between verses */}
                {index < verses.length - 1 && " "}
              </span>
            ))}
          </p>

          {/* Ghost/blending UI for next chapter navigation */}
          {currentChapter < chapterCount && (
            <div className="mt-4 mb-8 flex justify-center">
              <div
                className="group relative cursor-pointer w-[80%]"
                onClick={handleNextChapter}
              >
                {/* Receipt-style card with better dark mode blending */}
                <div className="relative bg-stone-100/80 dark:bg-stone-900/60 backdrop-blur-sm rounded-lg border border-stone-300/40 dark:border-stone-700/40 px-5 py-4 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-stone-400/60 dark:group-hover:border-stone-600/60 group-hover:bg-stone-200/80 dark:group-hover:bg-stone-800/70 ">
                  {/* Receipt-style top perforation line */}
                  <div className="absolute top-0 left-4 right-4 h-px border-t border-dashed border-stone-400/30 dark:border-stone-600/30"></div>

                  <div className="flex items-center gap-3">
                    {/* Compact chapter indicator */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-amber-700 dark:from-stone-600 dark:to-stone-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        {currentChapter + 1}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Ch.
                      </div>
                    </div>

                    {/* Compact text content */}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors duration-300">
                        Continue Reading
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors duration-300">
                        {currentBook} {currentChapter + 1}
                      </div>
                    </div>

                    {/* Arrow with receipt-style styling */}
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-stone-200/60 dark:bg-stone-700/60 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-stone-600/80 transition-all duration-300">
                        <ArrowRight
                          size={14}
                          className="text-stone-600 dark:text-stone-400 group-hover:text-amber-700 dark:group-hover:text-stone-300 transform group-hover:translate-x-0.5 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Receipt-style bottom perforation line */}
                  <div className="absolute bottom-0 left-4 right-4 h-px border-b border-dashed border-stone-400/30 dark:border-stone-600/30"></div>

                  {/* Receipt corner fold effect */}
                  <div className="absolute top-1 right-1 w-3 h-3 bg-stone-300/40 dark:bg-stone-600/40 transform rotate-45 rounded-sm opacity-60"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptureParagraphView;
