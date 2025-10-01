import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface TabletBottomNavigationProps {
  currentChapter: number;
  chapterCount: number;
  versesLength: number;
  handlePreviousChapter: () => void;
  handleNextChapter: () => void;
}

const TabletBottomNavigation: React.FC<TabletBottomNavigationProps> = ({
  currentChapter,
  chapterCount,
  versesLength,
  handlePreviousChapter,
  handleNextChapter,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-end px-6 border-t transition-colors duration-300"
      style={{
        borderTopColor: isDarkMode ? "#333333" : "#444444",
      }}
    >
      {/* Scripture Tracking Info */}
      <div className="text-right mr-4">
        <div className="text-xs text-gray-400 font-medium">
          Chapter {currentChapter} of {chapterCount}
        </div>
        <div className="text-[10px] text-gray-500">{versesLength} verses</div>
      </div>

      {/* Game-style Navigation Buttons */}
      <div className="flex items-center space-x-2">
        {/* Previous Chapter Button */}
        <button
          onClick={handlePreviousChapter}
          disabled={currentChapter <= 1}
          className={`
            relative h-7 w-12 rounded-md transition-all duration-150 active:scale-95
            ${
              currentChapter <= 1
                ? "cursor-not-allowed opacity-50"
                : "hover:shadow-md active:shadow-inner"
            }
          `}
          style={{
            background:
              currentChapter <= 1
                ? isDarkMode
                  ? "linear-gradient(145deg, #2a2a2a, #1a1a1a)"
                  : "linear-gradient(145deg, #e0e0e0, #d0d0d0)"
                : isDarkMode
                ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
            boxShadow:
              currentChapter <= 1
                ? "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.1)"
                : isDarkMode
                ? "inset 2px 2px 4px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2)"
                : "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)",
            border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
          }}
        >
          <ChevronLeft
            size={14}
            className={`mx-auto ${
              currentChapter <= 1
                ? "text-gray-600"
                : isDarkMode
                ? "text-gray-200"
                : "text-gray-700"
            }`}
          />
        </button>

        {/* Next Chapter Button */}
        <button
          onClick={handleNextChapter}
          disabled={currentChapter >= chapterCount}
          className={`
            relative h-7 w-12 rounded-md transition-all duration-150 active:scale-95
            ${
              currentChapter >= chapterCount
                ? "cursor-not-allowed opacity-50"
                : "hover:shadow-md active:shadow-inner"
            }
          `}
          style={{
            background:
              currentChapter >= chapterCount
                ? isDarkMode
                  ? "linear-gradient(145deg, #2a2a2a, #1a1a1a)"
                  : "linear-gradient(145deg, #e0e0e0, #d0d0d0)"
                : isDarkMode
                ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
            boxShadow:
              currentChapter >= chapterCount
                ? "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.1)"
                : isDarkMode
                ? "inset 2px 2px 4px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2)"
                : "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)",
            border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
          }}
        >
          <ChevronRight
            size={14}
            className={`mx-auto ${
              currentChapter >= chapterCount
                ? "text-gray-600"
                : isDarkMode
                ? "text-gray-200"
                : "text-gray-700"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default TabletBottomNavigation;
