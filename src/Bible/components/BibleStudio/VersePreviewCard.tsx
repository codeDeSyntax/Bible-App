import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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

  // Get highlights for current verse
  const currentHighlights = textHighlights.filter(
    (h) => h.reference === currentReference,
  );

  // Get effective font family with proper quoting for fonts with spaces
  const getEffectiveFontFamily = () => {
    const font = projectionFontFamily;
    return font.includes(" ") ? `"${font}"` : font;
  };

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

    if (typeof window !== "undefined" && window.api) {
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
      // ScriptureContent's useEffect on currentVerse fires with the correct
      // verse automatically — no setTimeout needed here.
    } else if (currentChapter > 1) {
      const prevChapter = currentChapter - 1;
      dispatch(setCurrentChapter(prevChapter));
      dispatch(setCurrentVerse(1));
      showNotification(`Moving to ${currentBook} ${prevChapter}:1`, "info");
      // Send update explicitly using the new chapter/verse to avoid stale state
      sendPresentationUpdate(currentBook, prevChapter, 1);
    }
  };

  const handleNextVerse = () => {
    const currentVerses = getCurrentChapterVerses();
    const chapterCount = getBookChapterCount(currentBook);

    if (currentVerse && currentVerses && currentVerse < currentVerses.length) {
      dispatch(setCurrentVerse(currentVerse + 1));
      // ScriptureContent's useEffect on currentVerse fires with the correct
      // verse automatically — no setTimeout needed here.
    } else if (currentChapter < chapterCount) {
      // Move to next chapter
      const nextChapter = currentChapter + 1;
      dispatch(setCurrentChapter(nextChapter));
      dispatch(setCurrentVerse(1));
      showNotification(`Moving to ${currentBook} ${nextChapter}:1`, "info");
      // Send update explicitly using the new chapter/verse to avoid stale state
      sendPresentationUpdate(currentBook, nextChapter, 1);
    } else {
      // At the last verse of the last chapter
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

  // Keyboard navigation (left/right arrow keys, Ctrl+B for bookmark, B for bookmark modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys if we're not in an input field
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
          // Ctrl+B: Add/remove bookmark
          handleBookmark();
        } else {
          // B: Toggle bookmark modal
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

    // Calculate position in the plain verse text by extracting plain text from DOM
    const fullText = verseText || "";

    // Get the actual start position from the selection's anchor node
    let start = -1;
    try {
      const range = selection.getRangeAt(0);
      const preSelectionRange = document.createRange();
      preSelectionRange.selectNodeContents(verseTextRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const textBeforeSelection = preSelectionRange.toString();
      start = textBeforeSelection.length;
    } catch (e) {
      // Fallback to indexOf
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

    // Position palette near selection with boundary detection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate initial position
    let x = rect.left + window.scrollX;
    let y = rect.bottom + window.scrollY + 5;

    // Palette dimensions (approximate)
    const paletteWidth = 220; // ~200px + padding
    const paletteHeight = 120; // approximate height

    // Adjust horizontal position if palette would overflow right edge
    const viewportWidth = window.innerWidth;
    if (x + paletteWidth > viewportWidth) {
      x = viewportWidth - paletteWidth - 10; // 10px padding from edge
    }

    // Adjust vertical position if palette would overflow bottom edge
    const viewportHeight = window.innerHeight;
    if (y + paletteHeight > viewportHeight) {
      // Position above the selection instead
      y = rect.top + window.scrollY - paletteHeight - 5;
    }

    // Ensure minimum distance from edges
    x = Math.max(10, x);
    y = Math.max(10, y);

    setPalettePosition({ x, y });

    setShowPalette(true);
  };

  // Get overlapping highlights for a selection range
  const getOverlappingHighlights = (start: number, end: number) => {
    return currentHighlights.filter(
      (h) =>
        // Check for any overlap
        h.startIndex < end && h.endIndex > start,
    );
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    if (!selectedText || !selectionRange) return;

    // Check if this exact region is already highlighted (exact match)
    const existingHighlight = currentHighlights.find(
      (h) =>
        h.startIndex === selectionRange.start &&
        h.endIndex === selectionRange.end,
    );

    // Get all overlapping highlights
    const overlappingHighlights = getOverlappingHighlights(
      selectionRange.start,
      selectionRange.end,
    );

    if (color === "") {
      // Reset/remove highlight
      if (existingHighlight) {
        dispatch(
          removeTextHighlight({
            reference: currentReference,
            text: selectedText,
          }),
        );

        // Send IPC update to projection window (only if projection is active)
        if (
          isProjectionActive &&
          typeof window !== "undefined" &&
          window.ipcRenderer
        ) {
          console.log("📤 Sending removeTextHighlight via IPC:", {
            reference: currentReference,
            text: selectedText,
          });
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
      // Update existing highlight color
      dispatch(
        updateTextHighlight({
          reference: currentReference,
          text: selectedText,
          color,
        }),
      );

      // Send IPC update to projection window (only if projection is active)
      if (
        isProjectionActive &&
        typeof window !== "undefined" &&
        window.ipcRenderer
      ) {
        console.log("📤 Sending updateTextHighlight via IPC:", {
          reference: currentReference,
          text: selectedText,
          color,
        });
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
      // Remove any overlapping highlights first, then add the new one
      if (overlappingHighlights.length > 0) {
        console.log(
          "🔄 Removing overlapping highlights before adding new one:",
          overlappingHighlights.length,
        );

        overlappingHighlights.forEach((overlap) => {
          dispatch(
            removeTextHighlight({
              reference: currentReference,
              text: overlap.text,
            }),
          );

          // Send IPC update to projection window
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

      // Add new highlight
      dispatch(
        addTextHighlight({
          reference: currentReference,
          text: selectedText,
          color,
          startIndex: selectionRange.start,
          endIndex: selectionRange.end,
        }),
      );

      // Send IPC update to projection window (only if projection is active)
      if (
        isProjectionActive &&
        typeof window !== "undefined" &&
        window.ipcRenderer
      ) {
        console.log("📤 Sending addTextHighlight via IPC:", {
          reference: currentReference,
          text: selectedText,
          color,
          startIndex: selectionRange.start,
          endIndex: selectionRange.end,
        });
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

    // Clear selection
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

    // Send IPC update to projection window
    if (
      isProjectionActive &&
      typeof window !== "undefined" &&
      window.ipcRenderer
    ) {
      console.log("📤 Sending removeTextHighlight via IPC (click):", {
        reference: currentReference,
        text: highlight.text,
      });
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

    // Sort highlights by start index to prevent rendering issues
    const sortedHighlights = [...currentHighlights].sort(
      (a, b) => a.startIndex - b.startIndex,
    );

    // Check for overlaps and log warnings
    for (let i = 0; i < sortedHighlights.length - 1; i++) {
      const current = sortedHighlights[i];
      const next = sortedHighlights[i + 1];
      if (current.endIndex > next.startIndex) {
        console.warn("⚠️ Overlapping highlights detected:", {
          current: { start: current.startIndex, end: current.endIndex },
          next: { start: next.startIndex, end: next.endIndex },
        });
      }
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, index) => {
      // Skip if this highlight starts before our current position (overlap case)
      if (highlight.startIndex < lastIndex) {
        console.warn("⚠️ Skipping overlapping highlight", highlight);
        return;
      }

      // Add text before highlight
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

      // Add highlighted text with click handler
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

    // Add remaining text
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
    <div className="col-span-3 row-span-3 border-4 border-select-border border-dashed rounded-xl p-3 flex  overflow-hidden">
      {/* Notification */}
      <Toaster toasts={toasts} onDismiss={dismissToast} position="top-center" />

      <motion.div
        className="flex-1 min-w-0 rounded-xl p-3 flex flex-col overflow-hidden"
        style={{
          background: "var(--card-bg)",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
              }}
            >
              <BookOpen className="w-3.5 h-3.5" style={{ color: "white" }} />
            </div>
            <span className="text-[0.8rem] font-semibold text-text-secondary uppercase tracking-widest">
              Current Verse
            </span>
          </div>

          {/* Verse reference + nav */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevVerse}
              className="w-6 h-6 rounded bg-white dark:bg-header-gradient-from  flex items-center justify-center hover:bg-select-hover transition-colors cursor-pointer"
              title="Previous verse (←)"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-text-secondary" />
            </button>
            <span
              className="text-[0.78rem] font-semibold px-2 py-0.5 rounded-md text-text-primary"
              style={{ background: "var(--select-bg)" }}
            >
              {currentReference}
            </span>
            <button
              onClick={handleNextVerse}
              className="w-6 h-6 rounded flex bg-white dark:bg-header-gradient-from  items-center justify-center hover:bg-select-hover transition-colors cursor-pointer"
              title="Next verse (→)"
            >
              <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Verse Text */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div
            ref={verseTextRef}
            className="flex-1 overflow-y-auto no-scrollbar select-text cursor-text text-text-primary leading-relaxed"
            style={{
              fontFamily: getEffectiveFontFamily(),
              fontSize: "0.95rem",
              lineHeight: "1.75",
            }}
            onMouseUp={handleTextSelection}
          >
            {renderHighlightedText()}
          </div>

          {/* Hint chips */}
          <div className="flex items-center gap-2 mt-2 flex-shrink-0 flex-wrap">
            <span
              className="flex items-center gap-1 text-[0.68rem] text-text-secondary px-1.5 py-0.5 rounded"
              style={{ background: "var(--select-bg)" }}
            >
              <Highlighter className="w-3 h-3" /> Select to highlight
            </span>
            <span
              className="flex items-center gap-1 text-[0.68rem] text-text-secondary px-1.5 py-0.5 rounded"
              style={{ background: "var(--select-bg)" }}
            >
              <Bookmark className="w-3 h-3" /> Ctrl+B bookmark
            </span>
            <span
              className="flex items-center gap-1 text-[0.68rem] text-text-secondary px-1.5 py-0.5 rounded"
              style={{ background: "var(--select-bg)" }}
            >
              <MonitorPlay className="w-3 h-3" /> Enter to project
            </span>
          </div>
        </div>

        {/* Color Palette */}
        {showPalette && (
          <ColorPalette
            position={palettePosition}
            onColorSelect={handleColorSelect}
            onClose={() => setShowPalette(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </motion.div>

      {/* Cross References */}
      <div className="flex-shrink-0">
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
  );
};
