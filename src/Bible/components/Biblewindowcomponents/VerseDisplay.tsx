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
  // Add these to force re-render when they change
  projectionFontFamily?: string;
  projectionBackgroundImage?: string;
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
  projectionFontFamily,
  projectionBackgroundImage,
}) => {
  // Use prop value directly, fallback to function if not provided
  const effectiveFontFamily = projectionFontFamily
    ? projectionFontFamily.includes(" ")
      ? `"${projectionFontFamily}"`
      : projectionFontFamily
    : getEffectiveFontFamily();
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
            <span
              key={`text-${idx}`}
              style={{ fontFamily: effectiveFontFamily }}
            >
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
              fontFamily: effectiveFontFamily,
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
          <span key="text-end" style={{ fontFamily: effectiveFontFamily }}>
            {verseText.substring(lastIndex)}
          </span>
        );
      }

      return <>{parts}</>;
    },
    [textHighlights, effectiveFontFamily]
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
        return (
          <span
            style={{ fontFamily: effectiveFontFamily }}
            dangerouslySetInnerHTML={{ __html: jesusProcessed }}
          />
        );
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
      effectiveFontFamily,
    ]
  );
  return (
    <div
      ref={verseContainerRef}
      className="w-full no-scrollbar scale-x-100 text-[0.9rem]"
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
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentBook}-${currentChapter}-${currentVerseIndex}`}
          ref={verseContentRef}
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.995 }}
          transition={{
            opacity: { duration: 0.18 },
            y: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] },
            scale: { duration: 0.2 },
          }}
          style={{
            fontFamily: effectiveFontFamily,
            fontWeight: "bold",
            fontSize: getFinalFontSize ? getFinalFontSize() : getBaseFontSize(),
            color: getEffectiveTextColor() || "#ffffff",
            textAlign: "center",
            lineHeight: "inherit",
            width: "100%",
            display: "block",
            padding: "0",
            marginTop: "0",
            marginBottom: "0",
            minHeight: "auto",
            maxHeight: "none",
            textShadow: `
              0 0 8px rgba(0, 0, 0, 0.9),
              0 0 12px rgba(0, 0, 0, 0.8),
              0 0 16px rgba(0, 0, 0, 0.7),
              3px 3px 6px rgba(0, 0, 0, 0.8),
              -3px -3px 6px rgba(0, 0, 0, 0.8),
              3px -3px 6px rgba(0, 0, 0, 0.8),
              -3px 3px 6px rgba(0, 0, 0, 0.8),
              5px 5px 10px rgba(0, 0, 0, 0.6),
              -5px -5px 10px rgba(0, 0, 0, 0.6)
            `,
          }}
        >
          {currentVerses.map((verse, index) => {
            const reference = `${currentBook} ${currentChapter}:${verse.verse}`;
            return (
              <span
                key={verse.verse}
                style={{
                  display: "block",
                  marginBottom:
                    index < currentVerses.length - 1 ? "0.2rem" : "0",
                }}
              >
                <span
                  className=""
                  style={{
                    fontWeight: "bold",
                    fontStyle: "normal",
                    fontSize: "0.7em",
                    verticalAlign: "super",
                    position: "relative",
                    top: "-0.2em",
                    marginRight: "4px",
                    fontFamily: "Arial",
                    color: getEffectiveTextColor() || "#ffffff",
                  }}
                >
                  {verse.verse}
                </span>
                <span
                  className=""
                  style={{
                    fontFamily: getEffectiveFontFamily(),
                    WebkitTextStroke: useImageBackground
                      ? "0px #ffffff"
                      : "0px",
                  }}
                >
                  {processVerseText(verse.text, reference)}
                </span>
              </span>
            );
          })}

          {/* Scripture Reference at bottom (like VerseByVerseView) */}
          {showScriptureReference && (
            <div>
              <span
                className="fontanton "
                style={{
                  fontWeight: "bolder",
                  fontSize: getFinalFontSize
                    ? `calc(${getFinalFontSize()} * 0.60)`
                    : `calc(${getBaseFontSize()} * 0.60)`,
                  fontFamily: "Arial",
                  color: scriptureReferenceColor,
                  textShadow: `
              0 0 8px rgba(0, 0, 0, 0.9),
              0 0 12px rgba(0, 0, 0, 0.8),
              0 0 16px rgba(0, 0, 0, 0.7),
              3px 3px 6px rgba(0, 0, 0, 0.8),
              -3px -3px 6px rgba(0, 0, 0, 0.8),
              3px -3px 6px rgba(0, 0, 0, 0.8),
              -3px 3px 6px rgba(0, 0, 0, 0.8),
              5px 5px 10px rgba(0, 0, 0, 0.6),
              -5px -5px 10px rgba(0, 0, 0, 0.6)
            `,
                  WebkitTextStroke: "0px",
                }}
              >
                {currentBook} {currentChapter}:
                {currentVerses.length === 1
                  ? currentVerses[0]?.verse
                  : `${currentVerses[0]?.verse}-${
                      currentVerses[currentVerses.length - 1]?.verse
                    }`}
               {" "} (KJV)
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
