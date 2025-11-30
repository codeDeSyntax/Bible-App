import { useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/store";
import { logBibleProjection } from "@/utils/ClientSecretLogger";

/**
 * Hook to automatically synchronize Bible navigation with projection window
 * Ensures that when user navigates verses in main view, projection window updates instantly
 */
export const useBibleAutoSync = () => {
  const {
    currentBook,
    currentChapter,
    currentVerse,
    bibleData,
    currentTranslation,
    verseByVerseMode,
  } = useAppSelector((state) => state.bible);

  // Keep track of previous values to detect changes
  const prevRef = useRef({
    book: currentBook,
    chapter: currentChapter,
    verse: currentVerse,
  });

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced sync function to prevent too frequent updates
  const debouncedSyncToProjectionWindow = useCallback((data: any) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer with 150ms delay
    debounceTimerRef.current = setTimeout(() => {
      syncToProjectionWindow(data);
    }, 150);
  }, []);

  useEffect(() => {
    const prev = prevRef.current;

    // Check if navigation state changed
    const hasChanged =
      prev.book !== currentBook ||
      prev.chapter !== currentChapter ||
      prev.verse !== currentVerse;

    // Only sync when in verse-by-verse mode
    if (
      hasChanged &&
      verseByVerseMode &&
      currentBook &&
      currentChapter &&
      bibleData[currentTranslation]
    ) {
      // Get the verse data for projection
      const translation = bibleData[currentTranslation];
      const book = translation.books.find((b) => b.name === currentBook);

      if (book && book.chapters[currentChapter - 1]) {
        const chapter = book.chapters[currentChapter - 1];

        // Prepare projection data
        const projectionData = {
          book: currentBook,
          chapter: currentChapter,
          verse: currentVerse,
          translation: currentTranslation,
          verses: chapter.verses,
          // Include context verses for better projection display
          totalVerses: chapter.verses.length,
        };

        // Use debounced sync to prevent excessive updates
        debouncedSyncToProjectionWindow(projectionData);

        logBibleProjection("Bible auto-sync triggered in verse-by-verse mode", {
          book: currentBook,
          chapter: currentChapter,
          verse: currentVerse,
        });
      }
    } else if (hasChanged && !verseByVerseMode) {
      logBibleProjection(
        "Bible auto-sync skipped - not in verse-by-verse mode",
        {
          book: currentBook,
          chapter: currentChapter,
          verse: currentVerse,
          mode: "block/paragraph",
        }
      );
    }

    // Update previous values
    prevRef.current = {
      book: currentBook,
      chapter: currentChapter,
      verse: currentVerse,
    };
  }, [
    currentBook,
    currentChapter,
    currentVerse,
    bibleData,
    currentTranslation,
    verseByVerseMode,
    debouncedSyncToProjectionWindow,
  ]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const syncToProjectionWindow = async (data: any) => {
    try {
      // Check if projection window is active first
      const isProjectionActive = await window.api.isProjectionActive();

      if (isProjectionActive) {
        // Send navigation update to projection window
        const result = await window.api.sendToProjectionDisplay({
          type: "navigate",
          data,
        });

        if (result.success) {
          logBibleProjection("Bible projection synced with navigation", {
            book: data.book,
            chapter: data.chapter,
            verse: data.verse,
            translation: data.translation,
            totalVerses: data.totalVerses,
          });
        }
      }
    } catch (error) {
      console.error("Failed to sync Bible projection:", error);
      logBibleProjection("Failed to sync Bible projection", {
        error: error instanceof Error ? error.message : String(error),
        book: data.book,
        chapter: data.chapter,
      });
    }
  };

  return {
    syncToProjectionWindow,
  };
};
