import { useMemo } from "react";

interface VerseData {
  verse: number;
  text: string;
}

interface ChapterData {
  chapter: number;
  verses: VerseData[];
}

interface BookData {
  name: string;
  chapters?: ChapterData[];
}

interface TranslationData {
  books: BookData[];
}

type BibleData = Record<string, TranslationData>;

interface ChapterLookupResult {
  chapterData: ChapterData | null;
  verses: VerseData[];
}

type BibleIndexType = Record<
  string,
  {
    bookIndex: Map<string, { chapters: Map<number, ChapterData> }>;
  }
>;

// Module-level singleton cache: shared across all component instances
let cachedBibleDataRef: BibleData | null = null;
let cachedBibleIndex: BibleIndexType | null = null;

export function buildBibleIndex(bibleData: BibleData | null): BibleIndexType | null {
  if (!bibleData) return null;
  if (bibleData === cachedBibleDataRef && cachedBibleIndex) {
    return cachedBibleIndex;
  }

  const index: BibleIndexType = {};

  // Index each translation
  for (const [translationKey, translationData] of Object.entries(bibleData)) {
    const bookIndex = new Map<
      string,
      { chapters: Map<number, ChapterData> }
    >();

    // Index each book within the translation
    if (translationData.books && Array.isArray(translationData.books)) {
      for (const book of translationData.books) {
        const chapterMap = new Map<number, ChapterData>();

        // Index each chapter within the book
        if (book.chapters && Array.isArray(book.chapters)) {
          for (const chapter of book.chapters) {
            chapterMap.set(chapter.chapter, chapter);
          }
        }

        bookIndex.set(book.name, { chapters: chapterMap });
      }
    }

    index[translationKey] = { bookIndex };
  }

  cachedBibleDataRef = bibleData;
  cachedBibleIndex = index;
  return index;
}

/**
 * High-performance memoized Bible data lookup hook.
 * Uses a shared singleton index structure to avoid expensive .find() operations
 * and eliminate duplicate indexing overhead across components.
 *
 * Usage:
 *   const { getChapterVerses } = useBibleDataCache(bibleData);
 *   const { verses, chapterData } = getChapterVerses(translation, book, chapter);
 */
export const useBibleDataCache = (bibleData: BibleData | null) => {
  // Use shared module-level cache for instant O(1) access across all components
  const bibleIndex = useMemo(() => buildBibleIndex(bibleData), [bibleData]);

  /**
   * Get all verses for a specific chapter using the indexed structure.
   * This is O(1) instead of O(n) compared to using .find() repeatedly.
   */
  const getChapterVerses = (
    translation: string,
    book: string,
    chapter: number
  ): ChapterLookupResult => {
    if (!bibleIndex || !bibleIndex[translation]) {
      return { chapterData: null, verses: [] };
    }

    const bookEntry = bibleIndex[translation].bookIndex.get(book);
    if (!bookEntry) {
      return { chapterData: null, verses: [] };
    }

    const chapterData = bookEntry.chapters.get(chapter);
    if (!chapterData || !chapterData.verses) {
      return { chapterData: null, verses: [] };
    }

    return {
      chapterData,
      verses: chapterData.verses,
    };
  };

  /**
   * Quick check if a book exists in a translation (useful for validation)
   */
  const bookExists = (translation: string, book: string): boolean => {
    return !!bibleIndex && !!bibleIndex[translation]?.bookIndex.has(book);
  };

  /**
   * Quick check if a chapter exists in a book
   */
  const chapterExists = (
    translation: string,
    book: string,
    chapter: number
  ): boolean => {
    return (
      !!bibleIndex &&
      !!bibleIndex[translation]?.bookIndex.get(book)?.chapters.has(chapter)
    );
  };

  /**
   * Get total verse count for a chapter (for boundary checks)
   */
  const getVerseCount = (
    translation: string,
    book: string,
    chapter: number
  ): number => {
    if (!bibleIndex || !bibleIndex[translation]) return 0;
    const bookEntry = bibleIndex[translation].bookIndex.get(book);
    if (!bookEntry) return 0;
    const chapterData = bookEntry.chapters.get(chapter);
    return chapterData?.verses?.length || 0;
  };

  return {
    getChapterVerses,
    bookExists,
    chapterExists,
    getVerseCount,
    isReady: !!bibleIndex,
  };
};
