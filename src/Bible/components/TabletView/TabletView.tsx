import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/Provider/Theme";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store";

import BookWatermarkBackground from "../BookWatermarkBackground";
import WatermarkToggle from "../WatermarkToggle";
import { TabletAnimatedBackground } from "./TabletAnimatedBackground";
import TabletFrame from "./TabletFrame";
import TabletStatusBar from "./TabletStatusBar";
import TabletContentArea from "./TabletContentArea";
import TabletBottomNavigation from "./TabletBottomNavigation";
import TabletHighlightPicker from "./TabletHighlightPicker";

interface Verse {
  verse: number;
  text: string;
}

interface TabletViewProps {
  verses: Verse[];
  verseRefs: React.MutableRefObject<{ [key: number]: HTMLElement | null }>;
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
  chapterCount: number;
  handleNextChapter: () => void;
  handlePreviousChapter: () => void;
  // Additional navigation props
  isBookDropdownOpen: boolean;
  setIsBookDropdownOpen: (open: boolean) => void;
  isChapterDropdownOpen: boolean;
  setIsChapterDropdownOpen: (open: boolean) => void;
  isVerseDropdownOpen: boolean;
  setIsVerseDropdownOpen: (open: boolean) => void;
  handleBookSelect: (book: string) => void;
  handleChapterSelect: (chapter: number) => void;
  handleVerseSelect: (verse: number) => void;
  getChapters: () => number[];
  getVerses: () => number[];
  bookList: any[];
}

const TabletView: React.FC<TabletViewProps> = ({
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
  isBookDropdownOpen,
  setIsBookDropdownOpen,
  isChapterDropdownOpen,
  setIsChapterDropdownOpen,
  isVerseDropdownOpen,
  setIsVerseDropdownOpen,
  handleBookSelect,
  handleChapterSelect,
  handleVerseSelect,
  getChapters,
  getVerses,
  bookList,
}) => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();

  const showWatermarkBackground = useSelector(
    (state: RootState) => state.bible.showWatermarkBackground
  );

  const [highlightPickerOpen, setHighlightPickerOpen] = useState<number | null>(
    null
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const chapterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bookDropdownRef.current &&
        !bookDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBookDropdownOpen(false);
      }
      if (
        chapterDropdownRef.current &&
        !chapterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsChapterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsBookDropdownOpen, setIsChapterDropdownOpen]);

  return (
    <div
      className="tabletv flex items-center justify-center min-h-screen p-4 relative"
      style={{ backgroundColor: isDarkMode ? "#352921" : "#ffffff" }}
    >
      {/* Animated Background */}
      <TabletAnimatedBackground isDarkMode={isDarkMode} />

      {/* Tablet Frame */}
      <TabletFrame>
        {/* Status Bar */}
        <TabletStatusBar
          currentBook={currentBook}
          currentChapter={currentChapter}
          isBookDropdownOpen={isBookDropdownOpen}
          setIsBookDropdownOpen={setIsBookDropdownOpen}
          isChapterDropdownOpen={isChapterDropdownOpen}
          setIsChapterDropdownOpen={setIsChapterDropdownOpen}
          handleBookSelect={handleBookSelect}
          handleChapterSelect={handleChapterSelect}
          getChapters={getChapters}
          bookList={bookList}
          bookDropdownRef={bookDropdownRef}
          chapterDropdownRef={chapterDropdownRef}
        />

        {/* Main Content Area */}
        <TabletContentArea
          verses={verses}
          verseRefs={verseRefs}
          selectedVerse={selectedVerse}
          getFontSize={getFontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          getVerseHighlight={getVerseHighlight}
          isBookmarked={isBookmarked}
          toggleBookmark={toggleBookmark}
          currentBook={currentBook}
          currentChapter={currentChapter}
          onVerseClick={onVerseClick}
          setHighlightPickerOpen={setHighlightPickerOpen}
          scrollContainerRef={scrollContainerRef}
          handleShare={handleShare}
        />

        {/* Bottom Navigation */}
        <TabletBottomNavigation
          currentChapter={currentChapter}
          chapterCount={chapterCount}
          versesLength={verses.length}
          handlePreviousChapter={handlePreviousChapter}
          handleNextChapter={handleNextChapter}
        />
      </TabletFrame>

      {/* Watermark Background (if enabled) */}
      {showWatermarkBackground && !imageBackgroundMode && (
        <BookWatermarkBackground isDarkMode={isDarkMode} />
      )}

      {/* Watermark Toggle */}
      <WatermarkToggle show={true} />

      {/* Highlight Color Picker */}
      <TabletHighlightPicker
        highlightPickerOpen={highlightPickerOpen}
        setHighlightPickerOpen={setHighlightPickerOpen}
        highlightVerse={highlightVerse}
      />
    </div>
  );
};

export default TabletView;
