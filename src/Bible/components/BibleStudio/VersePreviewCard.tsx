import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addTextHighlight,
  updateTextHighlight,
  removeTextHighlight,
  setCurrentVerse,
  setCurrentChapter,
  addBookmark,
  removeBookmark,
} from "@/store/slices/bibleSlice";
import { useBibleProjectionState } from "@/features/bible/hooks/useBibleProjectionState";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useNotification } from "@/hooks/useNotification";
import { BentoCard } from "./BentoCard";
import { ColorPalette } from "./ColorPalette";
import { Notification } from "@/components/Notification";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

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
  const { notification, showNotification } = useNotification();

  // Get font family settings
  const verseByVerseFontFamily = useAppSelector(
    (state) => state.bible.verseByVerseFontFamily
  );

  // Get bible data for projection updates
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const verseByVerseMode = useAppSelector(
    (state) => state.bible.verseByVerseMode
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
    (h) => h.reference === currentReference
  );

  // Get effective font family
  const getEffectiveFontFamily = () => {
    return verseByVerseFontFamily;
  };

  // Send live updates to presentation window (same logic as ScriptureContent)
  const sendLiveUpdateToPresentation = useCallback(() => {
    // Only send navigation updates when in verse-by-verse mode
    if (!verseByVerseMode) {
      console.log(
        "🚫 [VersePreviewCard] Skipping projection update - not in verse-by-verse mode"
      );
      return;
    }

    if (currentBook && currentChapter && bibleData && currentTranslation) {
      const translationData = bibleData[currentTranslation];
      if (translationData && translationData.books) {
        const bookData = translationData.books.find(
          (book: any) => book.name === currentBook
        );

        if (bookData) {
          const chapterData = bookData.chapters?.find(
            (ch: any) => ch.chapter === currentChapter
          );

          if (chapterData?.verses) {
            const presentationData = {
              book: currentBook,
              chapter: currentChapter,
              verses: chapterData.verses,
              translation: currentTranslation,
              selectedVerse: currentVerse || undefined,
            };

            // Send update to presentation window
            if (typeof window !== "undefined" && window.api) {
              console.log("📡 [VersePreviewCard] Sending projection update", {
                book: presentationData.book,
                chapter: presentationData.chapter,
                selectedVerse: presentationData.selectedVerse,
                verseCount: presentationData.verses.length,
                translation: presentationData.translation,
              });
              window.api.sendToBiblePresentation({
                type: "update-data",
                data: presentationData,
              });
            }
          }
        }
      }
    }
  }, [
    currentBook,
    currentChapter,
    currentTranslation,
    currentVerse,
    bibleData,
    verseByVerseMode,
  ]);

  // Navigation handlers (same logic as VerseByVerseView)
  const handlePrevVerse = () => {
    if (currentVerse && currentVerse > 1) {
      dispatch(setCurrentVerse(currentVerse - 1));

      // Send immediate update to presentation
      setTimeout(() => {
        sendLiveUpdateToPresentation();
      }, 50);
    } else if (currentChapter > 1) {
      const prevChapter = currentChapter - 1;
      dispatch(setCurrentChapter(prevChapter));

      setTimeout(() => {
        dispatch(setCurrentVerse(1));
        showNotification(`Moving to ${currentBook} ${prevChapter}:1`, "info");

        // Send immediate update to presentation
        setTimeout(() => {
          sendLiveUpdateToPresentation();
        }, 50);
      }, 100);
    }
  };

  const handleNextVerse = () => {
    const currentVerses = getCurrentChapterVerses();
    const chapterCount = getBookChapterCount(currentBook);

    if (currentVerse && currentVerses && currentVerse < currentVerses.length) {
      dispatch(setCurrentVerse(currentVerse + 1));

      // Send immediate update to presentation
      setTimeout(() => {
        sendLiveUpdateToPresentation();
      }, 50);
    } else if (currentChapter < chapterCount) {
      // Move to next chapter
      const nextChapter = currentChapter + 1;
      dispatch(setCurrentChapter(nextChapter));
      dispatch(setCurrentVerse(1));

      showNotification(`Moving to ${currentBook} ${nextChapter}:1`, "info");

      // Send immediate update to presentation
      setTimeout(() => {
        sendLiveUpdateToPresentation();
      }, 50);
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
  }, [
    currentVerse,
    currentChapter,
    currentBook,
    bookmarks,
    onOpenBookmarks,
    sendLiveUpdateToPresentation,
  ]);

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
        h.startIndex < end && h.endIndex > start
    );
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    if (!selectedText || !selectionRange) return;

    // Check if this exact region is already highlighted (exact match)
    const existingHighlight = currentHighlights.find(
      (h) =>
        h.startIndex === selectionRange.start &&
        h.endIndex === selectionRange.end
    );

    // Get all overlapping highlights
    const overlappingHighlights = getOverlappingHighlights(
      selectionRange.start,
      selectionRange.end
    );

    if (color === "") {
      // Reset/remove highlight
      if (existingHighlight) {
        dispatch(
          removeTextHighlight({
            reference: currentReference,
            text: selectedText,
          })
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
        })
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
          overlappingHighlights.length
        );

        overlappingHighlights.forEach((overlap) => {
          dispatch(
            removeTextHighlight({
              reference: currentReference,
              text: overlap.text,
            })
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
        })
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
      })
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
      (a, b) => a.startIndex - b.startIndex
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
          <span key={`text-${index}`}>
            {verseText.substring(lastIndex, highlight.startIndex)}
          </span>
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
          }}
          title="Click to remove highlight"
        >
          {verseText.substring(highlight.startIndex, highlight.endIndex)}
        </span>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text
    if (lastIndex < verseText.length) {
      parts.push(<span key="text-end">{verseText.substring(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <>
      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
      />

      <BentoCard
        title="Current Verse"
        isDarkMode={isDarkMode}
        icon={<BookOpen className="w-4 h-4 text-white" />}
        className="col-span-2 row-span-3"
        transparent={false}
        blackBackground={true}
      >
        <div className="flex flex-col h-full gap-2">
          {/* Verse Reference with Navigation */}
          <div className="flex items-center justify-between gap-2 flex-shrink-0">
            <div className="text-sm font-semibold text-primary dark:text-[#b8835a]">
              {currentReference}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <div
                onClick={handlePrevVerse}
                className="p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Previous verse (←)"
                // disabled={currentVerse === 1 && currentChapter === 1}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div
                onClick={handleNextVerse}
                className="p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Next verse (→)"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          {/* Verse Text */}
          <div
            ref={verseTextRef}
            className="text-base leading-relaxed text-gray-700 dark:text-gray-300 overflow-y-auto no-scrollbar select-text cursor-text"
            style={{
              maxHeight: "calc(100% - 80px)",
              fontFamily: getEffectiveFontFamily(),
            }}
            onMouseUp={handleTextSelection}
          >
            {renderHighlightedText()}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-400 dark:text-gray-500 italic mt-auto">
            Select text to highlight • Click to remove • ← → navigate • Ctrl+B
            bookmark • B bookmarks • Enter project
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
      </BentoCard>
    </>
  );
};
