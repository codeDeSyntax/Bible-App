import React, { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store";
import type { TextHighlight } from "@/store/slices/bibleSlice";

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

  // Get text highlights from Redux
  const textHighlights = useAppSelector((state) => state.bible.textHighlights);

  // Log highlights for debugging
  useEffect(() => {
    console.log("🎨 VerseDisplay - textHighlights updated:", {
      count: textHighlights.length,
      highlights: textHighlights,
      currentBook,
      currentChapter,
    });
  }, [textHighlights, currentBook, currentChapter]);

  // Render text with color highlights applied
  const renderHighlightedText = useCallback(
    (verseText: string, reference: string) => {
      const verseHighlights = textHighlights.filter(
        (h) => h.reference === reference
      );

      if (verseHighlights.length === 0) {
        return verseText;
      }

      const sortedHighlights = [...verseHighlights].sort(
        (a, b) => a.startIndex - b.startIndex
      );

      // Check for overlaps and log warnings
      for (let i = 0; i < sortedHighlights.length - 1; i++) {
        const current = sortedHighlights[i];
        const next = sortedHighlights[i + 1];
        if (current.endIndex > next.startIndex) {
          console.warn("⚠️ Overlapping highlights in projection:", {
            current: { start: current.startIndex, end: current.endIndex },
            next: { start: next.startIndex, end: next.endIndex },
          });
        }
      }

      const parts: Array<React.ReactNode> = [];
      let lastIndex = 0;

      sortedHighlights.forEach((highlight, idx) => {
        // Skip if this highlight starts before our current position (overlap case)
        if (highlight.startIndex < lastIndex) {
          console.warn(
            "⚠️ Skipping overlapping highlight in projection",
            highlight
          );
          return;
        }

        // Add text before highlight
        if (highlight.startIndex > lastIndex) {
          parts.push(
            <span key={`text-${idx}`}>
              {verseText.substring(lastIndex, highlight.startIndex)}
            </span>
          );
        }

        // Add highlighted text - use substring consistently
        parts.push(
          <span
            key={`highlight-${idx}`}
            style={{
              color: highlight.color,
              fontWeight: 600,
              transition: "color 0.2s ease",
            }}
          >
            {verseText.substring(highlight.startIndex, highlight.endIndex)}
          </span>
        );

        lastIndex = highlight.endIndex;
      });

      // Add remaining text after last highlight
      if (lastIndex < verseText.length) {
        parts.push(
          <span key="text-end">{verseText.substring(lastIndex)}</span>
        );
      }

      return <>{parts}</>;
    },
    [textHighlights]
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

  // Combine both Jesus words and text highlights
  const processVerseText = useCallback(
    (verseText: string, reference: string) => {
      // First apply Jesus words highlighting
      const jesusProcessed = processJesusWords(verseText);

      // Check if there are any text highlights for this verse
      const verseHighlights = textHighlights.filter(
        (h) => h.reference === reference
      );

      if (verseHighlights.length === 0) {
        // No text highlights, just return Jesus words processed
        return <span dangerouslySetInnerHTML={{ __html: jesusProcessed }} />;
      }

      // If there are text highlights, we need to apply them
      // Note: This is a simplified approach - for production you'd want to merge both highlight types
      return renderHighlightedText(verseText, reference);
    },
    [
      highlightJesusWords,
      textHighlights,
      processJesusWords,
      renderHighlightedText,
    ]
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
      {/* <AnimatePresence mode="wait"> */}
      <div
        // key={`${currentVerseIndex}-${currentBook}-${currentChapter}`}
        // initial={{ opacity: 0, y: 20, scale: 0.98 }}
        // animate={{ opacity: 1, y: 0, scale: 1 }}
        // exit={{ opacity: 0, y: -10, scale: 0.98 }}
        // transition={{
        //   duration: 0.0,
        //   ease: [0.25, 0.46, 0.45, 0.94],
        //   opacity: { duration: 0.3 },
        //   y: { duration: 0.4 },
        //   scale: { duration: 0.3 },
        // }}
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
        {currentVerses.map((verse, index) => {
          const reference = `${currentBook} ${currentChapter}:${verse.verse}`;
          return (
            <div
              key={verse.verse}
              // initial={{ opacity: 0, y: 15 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{

              //   duration: 0.0,
              //   ease: [0.25, 0.46, 0.45, 0.94],
              // }}
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
                style={{
                  WebkitTextStroke: useImageBackground ? "0px #ffffff" : "0px",
                }}
              >
                {processVerseText(verse.text, reference)}
              </span>
            </div>
          );
        })}

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
      </div>
      {/* </AnimatePresence> */}
    </div>
  );
};
