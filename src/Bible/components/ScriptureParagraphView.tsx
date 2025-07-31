import React, { useState } from "react";
import { Star, StarOff, Copy, Monitor } from "lucide-react";

interface Verse {
  verse: number;
  text: string;
}

interface ScriptureParagraphViewProps {
  verses: Verse[];
  verseRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
  selectedVerse: number | null;
  getFontSize: () => string;
  fontSize: string; // Changed to string to match getFontSize return type
  fontFamily: string;
  fontWeight: string;
  theme: string;
  verseTextColor: string;
  getVerseHighlight: (verse: number) => string | null;
  isBookmarked: (verse: number) => boolean;
  toggleBookmark: (verse: number) => void;
  handleShare: (text: string, title: string) => Promise<void>;
  currentBook: string;
  currentChapter: number;
  toggleShowPresentationBgs: (verseNumber: number) => void;
  activeDropdownVerse: number | null;
  bibleBgs: string[];
  handlePresentVerse: (text: string, bgSrc: string, verse: number) => void;
  selectedBg: string | null;
  highlightVerse: (verse: number, color: string) => void;
  imageBackgroundMode: boolean;
  isFullScreen: boolean;
  onVerseClick?: (verse: number) => void;
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
  verseTextColor,
  getVerseHighlight,
  isBookmarked,
  toggleBookmark,
  handleShare,
  currentBook,
  currentChapter,
  toggleShowPresentationBgs,
  activeDropdownVerse,
  bibleBgs,
  handlePresentVerse,
  selectedBg,
  highlightVerse,
  imageBackgroundMode,
  isFullScreen,
  onVerseClick,
}) => {
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

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
              style={{ color: "red" }}
              className="underline text-center"
            >
              {parts[i]}
            </span>
          );
        } else {
          result.push(
            <span
              key={`normal-${i}`}
              className="hover:underline text-center "
              style={
                highlightColor
                  ? {
                      backgroundColor: `${highlightColor}80`,
                      color: `${verseTextColor}`,
                      lineHeight: 1.2,
                      // textDecoration: "underline",
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
      <div
        className="w-[95%] mx-auto"
        style={{
          fontFamily,
          fontWeight,
          fontSize: getFontSize(),
          color:
            theme === "dark"
              ? verseTextColor || "#f9fafb"
              : verseTextColor || "#78716c",
        }}
      >
        <p className="text-left leading-normal scripturetext">
          {verses.map((verse, index) => (
            <span key={verse.verse} className="relative inline text-center">
              {/* Hidden ref element for scrolling */}
              <div
                ref={(el) => (verseRefs.current[verse.verse] = el)}
                className="absolute"
                style={{ top: "-60px" }}
                data-verse={verse.verse}
              />

              {/* Verse number */}
              <sup
                className={`text-black dark:text-orange-300 font-anton font-bold cursor-pointer hover:bg-gray-200 bg-gray-100 dark:bg-bgray px-1 py-0.5 rounded mr-1 relative`}
                style={{
                  fontSize: Number(fontSize) - 1 + "rem", // Match verse number size with content
                }}
                onMouseEnter={() => setHoveredVerse(verse.verse)}
                onMouseLeave={() => setHoveredVerse(null)}
                onClick={() => onVerseClick?.(verse.verse)}
              >
                {verse.verse}

                {/* Action buttons - show on hover */}
                {hoveredVerse === verse.verse && (
                  <div className="absolute -top-2 left-full pl-3 flex items-center gap-1 z-10">
                    <div className="flex flex-row items-start gap-1 bg-white dark:bg-stone-800 p-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => toggleBookmark(verse.verse)}
                        className="flex outline-none border-none items-center justify-center h-5 w-5 shadow bg-white dark:bg-ltgray p-1 rounded-full dark:hover:bg-gray-700 hover:bg-gray-100"
                        title={
                          isBookmarked(verse.verse)
                            ? "Remove bookmark"
                            : "Add bookmark"
                        }
                      >
                        {isBookmarked(verse.verse) ? (
                          <Star size={10} className="text-primary" />
                        ) : (
                          <StarOff size={10} className="text-primary" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          handleShare(
                            `${currentBook} ${currentChapter}:${verse.verse}`,
                            verse.text
                          )
                        }
                        className="flex items-center justify-center h-5 w-5 bg-white dark:bg-ltgray shadow-sm p-1 rounded-full dark:hover:bg-gray-700 hover:bg-gray-100"
                        title="Share or copy verse"
                      >
                        <Copy size={10} className="text-primary" />
                      </button>

                      <div
                        onClick={() => toggleShowPresentationBgs(verse.verse)}
                        className="flex outline-none border-none items-center justify-center h-5 w-5 shadow bg-white dark:bg-ltgray p-1 rounded-full cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-100 relative"
                        title="Show presentation backgrounds"
                      >
                        <Monitor className="text-primary z-20 size-2" />

                        {/* Dropdown menu - only show for the active verse */}
                        {activeDropdownVerse === verse.verse && (
                          <div
                            className="fixed top-auto right-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl rounded-lg p-2 w-auto border border-gray-200 dark:border-gray-600"
                            style={{
                              zIndex: 9999,
                              transform: "translate(-50%, 8px)",
                              left: "50%",
                              top: "100%",
                            }}
                          >
                            <div className="flex flex-row gap-1 overflow-x-auto py-1 px-1 max-w-48">
                              {bibleBgs.length === 0 && (
                                <div className="text-sm text-gray-500 p-2">
                                  No backgrounds available
                                </div>
                              )}
                              {bibleBgs.map((bg, index) => (
                                <div
                                  key={index}
                                  className="relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-md ring-1 ring-gray-200 dark:ring-gray-600"
                                  onClick={() =>
                                    handlePresentVerse(
                                      verse.text,
                                      bg,
                                      verse.verse
                                    )
                                  }
                                >
                                  <img
                                    src={bg}
                                    alt={`Background ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Highlight color options */}
                      <div className="flex flex-row items-center gap-1 bg-white dark:bg-ltgray p-1 rounded-full shadow">
                        {/* Yellow highlight */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(verse.verse, "#FFD700");
                          }}
                          className="h-3 w-3 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm cursor-pointer"
                          title="Highlight yellow"
                        ></div>
                        {/* Green highlight */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(verse.verse, "#4CAF50");
                          }}
                          className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600 shadow-sm cursor-pointer"
                          title="Highlight green"
                        ></div>
                        {/* Blue highlight */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(verse.verse, "#2196F3");
                          }}
                          className="h-3 w-3 rounded-full bg-blue-500 hover:bg-blue-600 shadow-sm cursor-pointer"
                          title="Highlight blue"
                        ></div>
                        {/* Reset highlight */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            highlightVerse(verse.verse, "reset");
                          }}
                          className="h-3 w-3 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-sm cursor-pointer"
                          title="Remove highlight"
                        >
                          <span className="text-xs">×</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </sup>

              {/* Verse text with formatting */}
              <span
                className="hover:underline text-center leading-relaxed"
                style={{
                  backgroundColor: getVerseHighlight(verse.verse)
                    ? `${getVerseHighlight(verse.verse)}80`
                    : "transparent",
                  textDecoration: getVerseHighlight(verse.verse) ? "" : "none",
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
      </div>
    </div>
  );
};

export default ScriptureParagraphView;
