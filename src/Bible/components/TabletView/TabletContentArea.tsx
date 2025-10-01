import React, { useState } from "react";
import { Star, StarOff, Copy, Palette } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface Verse {
  verse: number;
  text: string;
}

interface TabletContentAreaProps {
  verses: Verse[];
  verseRefs: React.MutableRefObject<{ [key: number]: HTMLElement | null }>;
  selectedVerse: number | null;
  getFontSize: () => string;
  fontFamily: string;
  fontWeight: string;
  getVerseHighlight: (verse: number) => string | null;
  isBookmarked: (verse: number) => boolean;
  toggleBookmark: (verse: number) => void;
  currentBook: string;
  currentChapter: number;
  onVerseClick?: (verse: number) => void;
  setHighlightPickerOpen: (verse: number | null) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  handleShare: (text: string, title: string) => Promise<void>;
}

const TabletContentArea: React.FC<TabletContentAreaProps> = ({
  verses,
  verseRefs,
  selectedVerse,
  getFontSize,
  fontFamily,
  fontWeight,
  getVerseHighlight,
  isBookmarked,
  toggleBookmark,
  currentBook,
  currentChapter,
  onVerseClick,
  setHighlightPickerOpen,
  scrollContainerRef,
  handleShare,
}) => {
  const { isDarkMode } = useTheme();
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);
  const [bookmarkFeedback, setBookmarkFeedback] = useState<{
    [key: number]: boolean;
  }>({});
  const [copyFeedback, setCopyFeedback] = useState<{ [key: number]: boolean }>(
    {}
  );

  const handleVerseClick = (verseNumber: number, event: React.MouseEvent) => {
    // Toggle action bar visibility on verse click
    if (hoveredVerse === verseNumber) {
      setHoveredVerse(null);
    } else {
      setHoveredVerse(verseNumber);
    }
    // Still call the original verse click handler if provided
    // onVerseClick?.(verseNumber);
  };

  const handleDocumentClick = (event: React.MouseEvent) => {
    // Close action bar when clicking elsewhere
    const target = event.target as HTMLElement;
    if (
      !target.closest(".verse-action-popup") &&
      !target.closest(".verse-text")
    ) {
      setHoveredVerse(null);
    }
  };

  const formatVerseText = (text: string, highlightColor: string | null) => {
    const parts = text.trim().split(/[\u2039\u203a]/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span
            key={index}
            className="text-red-600 dark:text-red-400 font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const copyVerseToClipboard = async (verse: Verse) => {
    const verseText = `${currentBook} ${currentChapter}:${verse.verse} - ${verse.text}`;
    try {
      await navigator.clipboard.writeText(verseText);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleVerseShare = async (verse: Verse) => {
    const verseText = verse.text;
    const title = `${currentBook} ${currentChapter}:${verse.verse}`;
    await handleShare(verseText, title);
  };

  const getTabletTextColor = () => {
    return "#f8f9fa"; // Consistent text color for tablet view
  };

  const renderVerseContent = () => {
    return (
      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <p
            style={{
              fontSize: getFontSize(),
              fontFamily: fontFamily,
              fontWeight: fontWeight,
              color: getTabletTextColor(),
              lineHeight: "1.2",
            }}
          >
            {verses.map((verse, index) => {
              const highlight = getVerseHighlight(verse.verse);
              return (
                <span
                  key={verse.verse}
                  ref={(el) => {
                    if (verseRefs.current) {
                      verseRefs.current[verse.verse] = el;
                    }
                  }}
                  className={`verse-text relative inline-block transition-all duration-200 cursor-pointer text-black dark:text-white py-2 ${
                    selectedVerse === verse.verse
                      ? "italic - rounded px-1 pl-4"
                      : ""
                  }`}
                  style={{
                    backgroundColor: highlight ? `${highlight}30` : undefined,
                  }}
                  onClick={(e) => handleVerseClick(verse.verse, e)}
                >
                  <sup className="text-xs font-bold text-amber-300 mr-1">
                    {verse.verse}
                  </sup>
                  {formatVerseText(verse.text, highlight)}
                  {index < verses.length - 1 && " "}

                  {/* Verse Action Popup */}
                  {hoveredVerse === verse.verse && (
                    <span
                      className="verse-action-popup absolute -top-10 left-0 flex items-center gap-1 rounded-lg px-2 py-1 z-20"
                      style={{
                        background: isDarkMode
                          ? "linear-gradient(145deg, #3a3a3a, #2a2a2a)"
                          : "linear-gradient(145deg, #f5f5f5, #e5e5e5)",
                        boxShadow: isDarkMode
                          ? "inset 1px 1px 3px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.3)"
                          : "inset 1px 1px 3px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.1)",
                        border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(verse.verse);
                          // Show feedback
                          setBookmarkFeedback((prev) => ({
                            ...prev,
                            [verse.verse]: true,
                          }));
                          setTimeout(() => {
                            setBookmarkFeedback((prev) => ({
                              ...prev,
                              [verse.verse]: false,
                            }));
                          }, 1000);
                        }}
                        className={`relative w-6 h-6 rounded transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-inner ${
                          bookmarkFeedback[verse.verse] ? "animate-pulse" : ""
                        }`}
                        style={{
                          background: bookmarkFeedback[verse.verse]
                            ? isBookmarked(verse.verse)
                              ? "linear-gradient(145deg, #ef4444, #dc2626)" // Red for remove
                              : "linear-gradient(145deg, #22c55e, #16a34a)" // Green for add
                            : isDarkMode
                            ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                            : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                          boxShadow: bookmarkFeedback[verse.verse]
                            ? "0 0 10px rgba(34, 197, 94, 0.5), inset 1px 1px 2px rgba(0,0,0,0.2)"
                            : isDarkMode
                            ? "inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1)"
                            : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                          border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
                        }}
                        title={
                          isBookmarked(verse.verse)
                            ? "Remove bookmark"
                            : "Add bookmark"
                        }
                      >
                        {isBookmarked(verse.verse) ? (
                          <Star
                            className={`w-3 h-3 fill-current mx-auto ${
                              bookmarkFeedback[verse.verse]
                                ? "text-white"
                                : "text-yellow-400"
                            }`}
                          />
                        ) : (
                          <StarOff
                            className={`w-3 h-3 mx-auto ${
                              bookmarkFeedback[verse.verse]
                                ? "text-white"
                                : isDarkMode
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyVerseToClipboard(verse);
                          // Show feedback
                          setCopyFeedback((prev) => ({
                            ...prev,
                            [verse.verse]: true,
                          }));
                          setTimeout(() => {
                            setCopyFeedback((prev) => ({
                              ...prev,
                              [verse.verse]: false,
                            }));
                          }, 1500);
                        }}
                        className={`relative w-6 h-6 rounded transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-inner ${
                          copyFeedback[verse.verse] ? "animate-pulse" : ""
                        }`}
                        style={{
                          background: copyFeedback[verse.verse]
                            ? "linear-gradient(145deg, #3b82f6, #2563eb)" // Blue for copy success
                            : isDarkMode
                            ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                            : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                          boxShadow: copyFeedback[verse.verse]
                            ? "0 0 10px rgba(59, 130, 246, 0.5), inset 1px 1px 2px rgba(0,0,0,0.2)"
                            : isDarkMode
                            ? "inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1)"
                            : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                          border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
                        }}
                        title="Copy verse"
                      >
                        <Copy
                          className={`w-3 h-3 mx-auto ${
                            copyFeedback[verse.verse]
                              ? "text-white"
                              : isDarkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHighlightPickerOpen(verse.verse);
                        }}
                        className="relative w-6 h-6 rounded transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-inner"
                        style={{
                          background: isDarkMode
                            ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                            : "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
                          boxShadow: isDarkMode
                            ? "inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1)"
                            : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                          border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
                        }}
                        title="Highlight verse"
                      >
                        <Palette
                          className={`w-3 h-3 mx-auto ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        />
                      </button>
                    </span>
                  )}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full pt-12 pb-12">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto no-scrollbar px-6 py-4"
        onClick={handleDocumentClick}
      >
        {renderVerseContent()}
      </div>
    </div>
  );
};

export default TabletContentArea;
