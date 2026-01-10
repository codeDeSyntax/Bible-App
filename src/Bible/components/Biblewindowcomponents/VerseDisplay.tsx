import React, { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store";
import type { TextHighlight } from "@/store/slices/bibleSlice";
import { CustomFitText } from "../Reactfittext";

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
  const effectiveFontFamily = projectionFontFamily
    ? projectionFontFamily.includes(" ")
      ? `"${projectionFontFamily}"`
      : projectionFontFamily
    : getEffectiveFontFamily();

  const highlightJesusWords = useAppSelector(
    (state) => state.bible.highlightJesusWords
  );

  const showScriptureReference = useAppSelector(
    (state) => state.bible.showScriptureReference
  );
  const scriptureReferenceColor = useAppSelector(
    (state) => state.bible.scriptureReferenceColor
  );

  const textHighlights = useAppSelector((state) => state.bible.textHighlights);

  useEffect(() => {
    console.log("🎨 VerseDisplay - textHighlights updated:", {
      count: textHighlights.length,
      highlights: textHighlights,
      currentBook,
      currentChapter,
    });
  }, [textHighlights, currentBook, currentChapter]);

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
        if (highlight.startIndex < lastIndex) {
          console.warn(
            "⚠️ Skipping overlapping highlight in projection",
            highlight
          );
          return;
        }

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

  const processJesusWords = useCallback(
    (text: string): string => {
      if (!highlightJesusWords) {
        return text;
      }

      const processedText = text.replace(
        /‹([^›]+)›/g,
        `<span style="color: #efe944; text-decoration: underline;  text-decoration-thickness: 2px; font-family: ${effectiveFontFamily};  ">$1</span>`
      );

      return processedText;
    },
    [highlightJesusWords]
  );

  const processVerseText = useCallback(
    (verseText: string, reference: string) => {
      const jesusProcessed = processJesusWords(verseText);

      const verseHighlights = textHighlights.filter(
        (h) => h.reference === reference
      );

      if (verseHighlights.length === 0) {
        return (
          <span
            style={{ fontFamily: effectiveFontFamily }}
            dangerouslySetInnerHTML={{ __html: jesusProcessed }}
          />
        );
      }

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

  const innerRef = verseContentRef ?? useRef<HTMLDivElement>(null);

  return (
    <div
      ref={verseContainerRef}
      className="w-full no-scrollbar"
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 0px 10px 0px ",
        // textDecoration:""
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentBook}-${currentChapter}-${currentVerseIndex}`}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <CustomFitText compressor={1} minFontSize={20} maxFontSize={600}>
            <div
              ref={innerRef}
              style={{
                fontFamily: effectiveFontFamily,
                fontWeight: "bold",
                color: getEffectiveTextColor() || "#ffffff",
                textAlign: "center",
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
                        index < currentVerses.length - 1 ? "0.2em" : "0",
                    }}
                  >
                    <span
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
                      style={{
                        fontFamily: effectiveFontFamily,
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

              {showScriptureReference && (
                <div style={{ marginTop: "0.1em" }}>
                  <span
                    style={{
                      fontWeight: "bolder",
                      fontSize: "0.55em",
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
                        }`}{" "}
                    (KJV)
                  </span>
                </div>
              )}
            </div>
          </CustomFitText>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
