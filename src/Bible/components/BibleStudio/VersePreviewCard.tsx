import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addTextHighlight,
  updateTextHighlight,
  removeTextHighlight,
  setCurrentVerse,
  setCurrentChapter,
  setCurrentBook,
  addBookmark,
  removeBookmark,
} from "@/store/slices/bibleSlice";
import { useBibleProjectionState } from "@/features/bible/hooks/useBibleProjectionState";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useBibleDataCache } from "@/hooks/useBibleDataCache";
import { useNotification } from "@/hooks/useNotification";
import { ColorPalette } from "./ColorPalette";
import { CrossReferences } from "./CrossReferences";
import { Toaster } from "@/components/Notification";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Bookmark,
  MonitorPlay,
} from "lucide-react";

interface VersePreviewCardProps {
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  verseText: string;
  isDarkMode: boolean;
  onOpenBookmarks?: () => void;
}

/**
 * Card 1: Preview of Current Verse
 * Shows the currently selected verse with reference and text highlighting
 */
export const VersePreviewCard: React.FC<VersePreviewCardProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  verseText,
  isDarkMode,
  onOpenBookmarks,
}) => {
  const dispatch = useAppDispatch();
  const textHighlights = useAppSelector((state) => state.bible.textHighlights);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const { isProjectionActive } = useBibleProjectionState();
  const { getCurrentChapterVerses, getBookChapterCount } = useBibleOperations();
  const { toasts, showNotification, dismissToast } = useNotification();

  // Get font family from projection settings (this is what Typography tab controls)
  const projectionFontFamily = useAppSelector(
    (state) => state.bible.projectionFontFamily,
  );
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage,
  );
  const projectionGradientColors = useAppSelector(
    (state) => state.bible.projectionGradientColors,
  );
  const projectionBackgroundColor = useAppSelector(
    (state) => state.bible.projectionBackgroundColor,
  );

  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );

  const [showPalette, setShowPalette] = useState(false);
  const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const verseTextRef = useRef<HTMLDivElement>(null);

  const currentReference = `${currentBook} ${currentChapter}:${
    currentVerse || 1
  }`;
  const isBookmarked = Boolean(
    currentReference && bookmarks.includes(currentReference),
  );

  // Get highlights for current verse
  const currentHighlights = textHighlights.filter(
    (h) => h.reference === currentReference,
  );

  // Get effective font family with proper quoting for fonts with spaces
  const getEffectiveFontFamily = () => {
    const font = projectionFontFamily;
    return font.includes(" ") ? `"${font}"` : font;
  };

  // Get dynamic projection background styling for the verse preview area
  const getProjectionBackgroundStyle = (): React.CSSProperties => {
    const hasImage = Boolean(
      projectionBackgroundImage && projectionBackgroundImage.trim() !== "",
    );
    const hasGradient = Boolean(
      projectionGradientColors && projectionGradientColors.length >= 2,
    );

    if (hasImage) {
      return {
        backgroundImage: `url(${projectionBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    if (hasGradient) {
      return {
        background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
      };
    }

    if (projectionBackgroundColor && projectionBackgroundColor.trim() !== "") {
      return {
        backgroundColor: projectionBackgroundColor,
      };
    }

    return {};
  };

  const hasCustomProjectionBg = Boolean(
    (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") ||
      (projectionGradientColors && projectionGradientColors.length >= 2) ||
      (projectionBackgroundColor && projectionBackgroundColor.trim() !== ""),
  );

  // ── EasyWorship-Style Area-Filling AutoFit Font Size Engine ────────────────
  const [autoFitSize, setAutoFitSize] = useState<number>(18);
  const [autoFitLineHeight, setAutoFitLineHeight] = useState<number>(1.55);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateEasyWorshipFit = useCallback(() => {
    const container = containerRef.current;
    const text = (verseText || "").trim();
    const len = text.length;

    if (!container || len === 0) {
      setAutoFitSize(18);
      setAutoFitLineHeight(1.55);
      return;
    }

    const width = Math.max(container.clientWidth, 280);
    const height = Math.max(container.clientHeight, 100);

    // Available pixel area with safe margin
    const area = (width - 16) * (height - 24);

    // Calculate optimal font size to fill ~70-75% of the container area
    // Character aspect ratio ~0.56 (width-to-height factor)
    const rawSize = Math.sqrt((area * 0.72) / (len * 0.56));

    // Clamp between balanced readability bounds:
    // Min 14px (so longest scriptures like Esther 8:9 stay crisp and readable)
    // Max 34px (so short verses like John 11:35 expand and fill the slide)
    const clampedSize = Math.max(14, Math.min(34, rawSize));
    const finalSize = Math.round(clampedSize * 10) / 10;

    // Dynamic proportional line height
    const finalLh =
      finalSize >= 28
        ? 1.3
        : finalSize >= 22
          ? 1.4
          : finalSize >= 17
            ? 1.5
            : 1.58;

    setAutoFitSize(finalSize);
    setAutoFitLineHeight(finalLh);
  }, [verseText, currentReference, projectionFontFamily]);

  useLayoutEffect(() => {
    calculateEasyWorshipFit();
  }, [calculateEasyWorshipFit]);

  // Live container resize listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      calculateEasyWorshipFit();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [calculateEasyWorshipFit]);

  // Initialize the memoized Bible data cache for O(1) verse lookups
  const { getChapterVerses } = useBibleDataCache(bibleData);

  // Send live updates to presentation window (optimized with caching)
  const sendLiveUpdateToPresentation = useCallback(() => {
    if (currentBook && currentChapter && currentTranslation) {
      // Use the memoized cache for O(1) lookup instead of O(n) .find() operations
      const { verses } = getChapterVerses(
        currentTranslation,
        currentBook,
        currentChapter,
      );

      if (verses && verses.length > 0) {
        const presentationData = {
          book: currentBook,
          chapter: currentChapter,
          verses: verses,
          translation: currentTranslation,
          selectedVerse: currentVerse || undefined,
        };

        // Send update to presentation window
        if (typeof window !== "undefined" && window.api) {
          window.api.sendToBiblePresentation({
            type: "update-data",
            data: presentationData,
          });
        }
      }
    }
  }, [
    currentBook,
    currentChapter,
    currentTranslation,
    currentVerse,
    getChapterVerses,
  ]);

  // Helper to send a presentation update using explicit values (optimized with caching)
  const sendPresentationUpdate = (
    bookArg?: string,
    chapterArg?: number,
    verseArg?: number | null,
  ) => {
    const bookName = bookArg || currentBook;
    const chapterNum = chapterArg || currentChapter;
    const verseNum = verseArg ?? (currentVerse || undefined);

    if (!bookName || !chapterNum || !currentTranslation) return;

    // Use the memoized cache for O(1) lookup instead of O(n) .find() operations
    const { verses } = getChapterVerses(
      currentTranslation,
      bookName,
      chapterNum,
    );

    if (!verses || verses.length === 0) return;

    const presentationData = {
      book: bookName,
      chapter: chapterNum,
      verses: verses,
      translation: currentTranslation,
      selectedVerse: verseNum || undefined,
    };

    if (typeof window !== "undefined" && window.api?.sendToBiblePresentation) {
      window.api.sendToBiblePresentation({
        type: "update-data",
        data: presentationData,
      });
    }
  };

  // Navigation handlers
  const handlePrevVerse = () => {
    if (currentVerse && currentVerse > 1) {
      dispatch(setCurrentVerse(currentVerse - 1));
    } else if (currentChapter > 1) {
      const prevChapter = currentChapter - 1;
      dispatch(setCurrentChapter(prevChapter));
      dispatch(setCurrentVerse(1));
      showNotification(`Moving to ${currentBook} ${prevChapter}:1`, "info");
      sendPresentationUpdate(currentBook, prevChapter, 1);
    }
  };

  const handleNextVerse = () => {
    const currentVerses = getCurrentChapterVerses();
    const chapterCount = getBookChapterCount(currentBook);

    if (currentVerse && currentVerses && currentVerse < currentVerses.length) {
      dispatch(setCurrentVerse(currentVerse + 1));
    } else if (currentChapter < chapterCount) {
      const nextChapter = currentChapter + 1;
      dispatch(setCurrentChapter(nextChapter));
      dispatch(setCurrentVerse(1));
      showNotification(`Moving to ${currentBook} ${nextChapter}:1`, "info");
      sendPresentationUpdate(currentBook, nextChapter, 1);
    } else {
      showNotification(`End of ${currentBook}`, "warning");
    }
  };

  // Handle bookmark toggle
  const handleBookmark = () => {
    if (!currentVerse) return;
    const reference = currentReference;
    const isBookmarked = bookmarks.includes(reference);

    if (isBookmarked) {
      dispatch(removeBookmark(reference));
      showNotification(`Bookmark removed: ${reference}`, "info");
    } else {
      dispatch(addBookmark(reference));
      showNotification(`Bookmark added: ${reference}`, "success");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevVerse();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextVerse();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        if (e.ctrlKey) {
          handleBookmark();
        } else {
          if (onOpenBookmarks) {
            onOpenBookmarks();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVerse, currentChapter, currentBook, bookmarks, onOpenBookmarks]);

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !verseTextRef.current) {
      setShowPalette(false);
      return;
    }

    const selectedStr = selection.toString().trim();
    if (!selectedStr) {
      setShowPalette(false);
      return;
    }

    const fullText = verseText || "";

    let start = -1;
    try {
      const range = selection.getRangeAt(0);
      const preSelectionRange = document.createRange();
      preSelectionRange.selectNodeContents(verseTextRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const textBeforeSelection = preSelectionRange.toString();
      start = textBeforeSelection.length;
    } catch (e) {
      start = fullText.indexOf(selectedStr);
    }

    if (start === -1) {
      console.warn("⚠️ Selected text position not found:", selectedStr);
      setShowPalette(false);
      return;
    }

    const end = start + selectedStr.length;

    setSelectedText(selectedStr);
    setSelectionRange({ start, end });

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const pillWidth = 225;
    const pillHeight = 36;

    // Horizontally center above the selected phrase
    let x = rect.left + rect.width / 2 - pillWidth / 2 + window.scrollX;
    // Prefer floating directly above the selection, fallback to below
    let y = rect.top + window.scrollY - pillHeight - 8;

    const viewportWidth = window.innerWidth;
    if (x + pillWidth > viewportWidth - 12) {
      x = viewportWidth - pillWidth - 12;
    }
    if (x < 12) {
      x = 12;
    }

    if (y < window.scrollY + 10) {
      // If no room above, place below
      y = rect.bottom + window.scrollY + 8;
    }

    setPalettePosition({ x, y });
    setShowPalette(true);
  };

  // Get overlapping highlights for a selection range
  const getOverlappingHighlights = (start: number, end: number) => {
    return currentHighlights.filter(
      (h) => h.startIndex < end && h.endIndex > start,
    );
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    if (!selectedText || !selectionRange) return;

    const existingHighlight = currentHighlights.find(
      (h) =>
        h.startIndex === selectionRange.start &&
        h.endIndex === selectionRange.end,
    );

    const overlappingHighlights = getOverlappingHighlights(
      selectionRange.start,
      selectionRange.end,
    );

    if (color === "") {
      if (existingHighlight) {
        dispatch(
          removeTextHighlight({
            reference: currentReference,
            text: selectedText,
          }),
        );

        if (
          isProjectionActive &&
          typeof window !== "undefined" &&
          window.ipcRenderer
        ) {
          window.ipcRenderer.send("bible-presentation-update", {
            type: "removeTextHighlight",
            data: {
              reference: currentReference,
              text: selectedText,
            },
          });
        }
      }
    } else if (existingHighlight) {
      dispatch(
        updateTextHighlight({
          reference: currentReference,
          text: selectedText,
          color,
        }),
      );

      if (
        isProjectionActive &&
        typeof window !== "undefined" &&
        window.ipcRenderer
      ) {
        window.ipcRenderer.send("bible-presentation-update", {
          type: "updateTextHighlight",
          data: {
            reference: currentReference,
            text: selectedText,
            color,
          },
        });
      }
    } else {
      if (overlappingHighlights.length > 0) {
        overlappingHighlights.forEach((overlap) => {
          dispatch(
            removeTextHighlight({
              reference: currentReference,
              text: overlap.text,
            }),
          );

          if (
            isProjectionActive &&
            typeof window !== "undefined" &&
            window.ipcRenderer
          ) {
            window.ipcRenderer.send("bible-presentation-update", {
              type: "removeTextHighlight",
              data: {
                reference: currentReference,
                text: overlap.text,
              },
            });
          }
        });
      }

      dispatch(
        addTextHighlight({
          reference: currentReference,
          text: selectedText,
          color,
          startIndex: selectionRange.start,
          endIndex: selectionRange.end,
        }),
      );

      if (
        isProjectionActive &&
        typeof window !== "undefined" &&
        window.ipcRenderer
      ) {
        window.ipcRenderer.send("bible-presentation-update", {
          type: "addTextHighlight",
          data: {
            reference: currentReference,
            text: selectedText,
            color,
            startIndex: selectionRange.start,
            endIndex: selectionRange.end,
          },
        });
      }
    }

    window.getSelection()?.removeAllRanges();
    setShowPalette(false);
    setSelectedText("");
    setSelectionRange(null);
  };

  // Handle click on highlighted text to remove it
  const handleHighlightClick = (highlight: (typeof currentHighlights)[0]) => {
    dispatch(
      removeTextHighlight({
        reference: currentReference,
        text: highlight.text,
      }),
    );

    if (
      isProjectionActive &&
      typeof window !== "undefined" &&
      window.ipcRenderer
    ) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "removeTextHighlight",
        data: {
          reference: currentReference,
          text: highlight.text,
        },
      });
    }
  };

  // Render verse text with highlights
  const renderHighlightedText = () => {
    if (!verseText || currentHighlights.length === 0) {
      return verseText || "Select a verse to preview";
    }

    const sortedHighlights = [...currentHighlights].sort(
      (a, b) => a.startIndex - b.startIndex,
    );

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, index) => {
      if (highlight.startIndex < lastIndex) {
        return;
      }

      if (highlight.startIndex > lastIndex) {
        parts.push(
          <span
            key={`text-${index}`}
            style={{ fontFamily: getEffectiveFontFamily() }}
          >
            {verseText.substring(lastIndex, highlight.startIndex)}
          </span>,
        );
      }

      parts.push(
        <span
          key={`highlight-${index}`}
          onClick={(e) => {
            e.stopPropagation();
            handleHighlightClick(highlight);
          }}
          style={{
            color: highlight.color,
            fontWeight: "600",
            transition: "color 0.2s ease",
            cursor: "pointer",
            fontFamily: getEffectiveFontFamily(),
          }}
          title="Click to remove highlight"
        >
          {verseText.substring(highlight.startIndex, highlight.endIndex)}
        </span>,
      );

      lastIndex = highlight.endIndex;
    });

    if (lastIndex < verseText.length) {
      parts.push(
        <span key="text-end" style={{ fontFamily: getEffectiveFontFamily() }}>
          {verseText.substring(lastIndex)}
        </span>,
      );
    }

    return parts;
  };

  return (
    <div className="w-full h-full py-1.5 pr-1 flex overflow-hidden bg-card-bg">
      {/* Notification */}
      <Toaster toasts={toasts} onDismiss={dismissToast} position="top-center" />

      <div className="flex h-full w-full overflow-hidden gap-1.5">
        <motion.div className="flex-1 min-w-0 rounded-xl rounded-bl-none overflow-hidden bg-card-bg-alt p-3 flex flex-col shadow-2xs relative">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{
                  background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
                }}
              >
                <BookOpen
                  className="w-3.5 h-3.5"
                  style={{ color: "white" }}
                />
              </div>
              <span className="text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wider">
                Current Verse
              </span>
            </div>

            {/* Verse reference + nav */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevVerse}
                className="w-6 h-6 rounded-md flex items-center justify-center bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
                title="Previous verse (←)"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-text-secondary" />
              </button>
              <span className="text-[0.78rem] font-bold px-2.5 py-0.5 rounded-md text-text-primary bg-select-bg shadow-2xs">
                {currentReference}
              </span>
              <button
                onClick={handleNextVerse}
                className="w-6 h-6 rounded-md flex items-center justify-center bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
                title="Next verse (→)"
              >
                <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Verse Text Area with Projection Background & Auto-Fit */}
          <div
            ref={containerRef}
            className={`flex-1 w-full min-h-0 overflow-hidden flex flex-col justify-center relative select-text cursor-text p-3.5 rounded-xl transition-all duration-200 ${
              !hasCustomProjectionBg ? "bg-card-bg/60 border border-select-border/60" : "shadow-sm"
            }`}
            style={getProjectionBackgroundStyle()}
            onMouseUp={handleTextSelection}
          >
            {/* Live Rendered Verse (Auto-Sized to Fill Space with Text Shadow Depth) */}
            <div
              ref={verseTextRef}
              className={`w-full transition-all duration-75 overflow-y-auto no-scrollbar ${
                hasCustomProjectionBg ? "text-white" : "text-text-primary"
              }`}
              style={{
                fontFamily: getEffectiveFontFamily(),
                fontSize: `${autoFitSize}px`,
                lineHeight: autoFitLineHeight,
                fontWeight: autoFitSize > 26 ? 600 : autoFitSize > 19 ? 500 : 400,
                textShadow: hasCustomProjectionBg
                  ? "0 2px 5px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.95), 0 0 16px rgba(0,0,0,0.6)"
                  : undefined,
              }}
            >
              {renderHighlightedText()}
            </div>
          </div>

            {/* Hint chips */}
            <div className="flex items-center gap-2 mt-2 flex-shrink-0 flex-wrap">
              <button
                onClick={() =>
                  showNotification(
                    "Select text in the verse to highlight.",
                    "info",
                  )
                }
                className="flex items-center gap-1 text-[0.68rem] px-2 py-0.5 rounded-md bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
              >
                <Highlighter className="w-3 h-3" /> Select to highlight
              </button>

              {currentReference && (
                <button
                  onClick={() => {
                    if (isBookmarked) {
                      dispatch(removeBookmark(currentReference));
                      showNotification("Bookmark removed", "info");
                    } else {
                      dispatch(addBookmark(currentReference));
                      showNotification("Bookmark added", "success");
                    }
                  }}
                  className={`flex items-center gap-1 text-[0.68rem] px-2 py-0.5 rounded-md transition-colors cursor-pointer shadow-2xs ${
                    isBookmarked
                      ? "bg-amber-500 text-white"
                      : "bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  {isBookmarked ? "Bookmarked" : "Ctrl+B Bookmark"}
                </button>
              )}

              <button
                onClick={sendLiveUpdateToPresentation}
                className="flex items-center gap-1 text-[0.68rem] px-2 py-0.5 rounded-md bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
              >
                <MonitorPlay className="w-3 h-3" /> Enter to project
              </button>
            </div>

            {/* Text Highlight Color Palette Popup */}
            {showPalette && (
              <ColorPalette
                position={palettePosition}
                onColorSelect={handleColorSelect}
                onClose={() => setShowPalette(false)}
                isDarkMode={isDarkMode}
              />
            )}
        </motion.div>

        {/* Cross References & Smart Listen Panel */}
        <div className="flex-shrink-0 w-[385px] h-full flex flex-col overflow-hidden bg-card-bg-alt rounded-xl p-2.5 shadow-2xs">
          <CrossReferences
            currentReference={currentReference}
            onNavigate={({ bookName, chapter, verse }) => {
              dispatch(setCurrentBook(bookName));
              dispatch(setCurrentChapter(chapter));
              dispatch(setCurrentVerse(verse));
            }}
          />
        </div>
      </div>
    </div>
  );
};
