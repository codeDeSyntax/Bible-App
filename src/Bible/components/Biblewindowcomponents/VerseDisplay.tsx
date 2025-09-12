import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store";

interface VerseDisplayProps {
  currentVerseIndex: number;
  currentBook: string;
  currentChapter: number;
  currentVerses: Array<{ verse: number; text: string }>;
  useImageBackground: boolean;
  settings: {
    versesPerSlide: number;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
  };
  getEffectiveTextColor: () => string;
  getFontFamilyClass: () => string;
  getEffectiveFontFamily: () => string;
  getBaseFontSize: () => string;
  verseContentRef?: React.RefObject<HTMLDivElement>;
  verseContainerRef?: React.RefObject<HTMLDivElement>;
  getFinalFontSize?: () => string;
}

export const VerseDisplay: React.FC<VerseDisplayProps> = ({
  currentVerseIndex,
  currentBook,
  currentChapter,
  currentVerses,
  useImageBackground,
  settings,
  getEffectiveTextColor,
  getFontFamilyClass,
  getEffectiveFontFamily,
  getBaseFontSize,
  verseContentRef,
  verseContainerRef,
  getFinalFontSize,
}) => {
  // Get Jesus words highlighting setting from Redux
  const highlightJesusWords = useAppSelector((state) => state.bible.highlightJesusWords);

  // Process Jesus words highlighting
  const processJesusWords = useCallback((text: string): string => {
    if (!highlightJesusWords) {
      return text;
    }
    
    // Replace text wrapped in ‹› with red and italic styling (Jesus words)
    const processedText = text.replace(
      /‹([^›]+)›/g,
      '<span style="color: #ef4444; font-family: garamond;">$1</span>'
    );
    
    return processedText;
  }, [highlightJesusWords]);
  return (
    <div
      ref={verseContainerRef}
      className="w-full no-scrollbar"
      style={{
        // Always use auto-sizing mode
        height: "99vh", // Fixed height for auto-sizing
        width: "100%",
        overflow: "hidden", // No scroll for auto-sizing
        // Center content for auto-sizing
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center",
        paddingLeft: "5px",
        paddingRight: "5px",
        paddingTop: "0", // No padding for auto-sizing
        paddingBottom: "0", // No padding for auto-sizing
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentVerseIndex}-${currentBook}-${currentChapter}`}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 0.3 },
            y: { duration: 0.4 },
            scale: { duration: 0.3 },
          }}
          ref={verseContentRef}
          style={{
            fontFamily: getEffectiveFontFamily(),
            fontWeight: "bold",
            fontSize: getFinalFontSize ? getFinalFontSize() : getBaseFontSize(),
            color: getEffectiveTextColor() || "#ffffff",
            textAlign: "center",
            lineHeight: "inherit", // Dynamic line height for auto-sizing
            wordBreak: "break-word", // Like HTML test
            wordWrap: "break-word", // Like HTML test
            width: "100%",
            // Use simple block layout for auto-sizing
            display: "block",
            padding: "0", // No padding for auto-sizing
            textShadow: "0 4px 8px rgba(0,0,0,0.5)",
          }}
        >
          {currentVerses.map((verse, index) => (
            <motion.div
              key={verse.verse}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1 + 0.2, // Stagger effect
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                marginBottom: index < currentVerses.length - 1 ? "0.2rem" : "0",
              }}
            >
              <span
                style={{
                  fontWeight: "normal",
                  fontStyle: "italic",
                  marginRight: "12px",
                  color: "#ef4444",
                  fontFamily: "'Bitter', serif",
                }}
              >
                {currentVerses.length > 0
                  ? settings.versesPerSlide === 1
                    ? currentVerses[0]?.verse
                    : `${currentVerses[0]?.verse}-${
                        currentVerses[currentVerses.length - 1]?.verse
                      }`
                  : "1"}
              </span>
              <span 
                dangerouslySetInnerHTML={{
                  __html: processJesusWords(verse.text)
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
