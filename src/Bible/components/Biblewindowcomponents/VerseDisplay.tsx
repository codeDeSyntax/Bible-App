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
  const highlightJesusWords = useAppSelector(
    (state) => state.bible.highlightJesusWords
  );

  // Get scripture reference settings from Redux
  const showScriptureReference = useAppSelector(
    (state) => state.bible.showScriptureReference
  );
  const scriptureReferenceColor = useAppSelector(
    (state) => state.bible.scriptureReferenceColor
  );

  // Process Jesus words highlighting
  const processJesusWords = useCallback(
    (text: string): string => {
      if (!highlightJesusWords) {
        return text;
      }

      // Replace text wrapped in ‹› with red and italic styling (Jesus words)
      const processedText = text.replace(
        /‹([^›]+)›/g,
        '<span style="color: #ef4444; font-family: garamond;">$1</span>'
      );

      return processedText;
    },
    [highlightJesusWords]
  );
  return (
    <div
      ref={verseContainerRef}
      className="w-full no-scrollbar"
      style={{
        // Match VerseByVerseView dimensions exactly
        height: useImageBackground ? "100vh" : "100vh", // Same as VerseByVerseView
        width: "100%",
        overflow: "hidden", // No scroll for auto-sizing
        // Center content for auto-sizing
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center", // Always center horizontally
        paddingLeft: "5px",
        paddingRight: "5px",
        paddingTop: "4px",
        paddingBottom: "5px", // Match VerseByVerseView bottom padding
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentVerseIndex}-${currentBook}-${currentChapter}`}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{
            duration: 0.0,
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
            width: "100%",
            // Keep text inline while providing smart centering (match VerseByVerseView)
            display: "block", // Use block instead of flex to maintain inline text flow
            padding: "0", // No internal padding
            marginTop: "0",
            marginBottom: "0",
            minHeight: "auto", // Ensure content is always visible
            maxHeight: "none", // Prevent overflow
            // Enhanced text shadow with outline for better readability (matching VerseByVerseView)
            textShadow:
              "2px 2px 3px rgba(0, 0, 0, 0.4), -2px -2px 3px rgba(0, 0, 0, 0.5), 2px -2px 2px rgba(0, 0, 0, 0.5), -2px 2px 4px rgba(0, 0, 0, 0.5)",
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
                  fontWeight: "bold",
                  textDecoration: "underline",
                  fontStyle: "italic",
                  marginRight: "12px",
                  fontFamily: "impact",
                }}
              >
                {verse.verse}
                {"  "}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: processJesusWords(verse.text),
                }}
                style={{
                  WebkitTextStroke: useImageBackground ? "0px #ffffff" : "0px",
                }}
              />
            </motion.div>
          ))}

          {/* Scripture Reference at bottom (like VerseByVerseView) */}
          {showScriptureReference && (
            <div>
              <span
                className="fontanton"
                style={{
                  fontWeight: "bolder",
                  fontSize: getFinalFontSize
                    ? `calc(${getFinalFontSize()} * 0.70)`
                    : `calc(${getBaseFontSize()} * 0.70)`,
                  fontFamily: "Arial",
                  color: scriptureReferenceColor,
                  textShadow: "none",
                  WebkitTextStroke: "0px",
                }}
              >
                {currentBook} {currentChapter}:
                {currentVerses.length === 1
                  ? currentVerses[0]?.verse
                  : `${currentVerses[0]?.verse}-${
                      currentVerses[currentVerses.length - 1]?.verse
                    }`}
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
