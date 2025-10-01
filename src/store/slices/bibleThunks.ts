import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { setSearchResults } from "./bibleSlice";
import { SearchResult } from "./bibleSlice";

export const performSearch = createAsyncThunk(
  "bible/performSearch",
  async (term: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { bibleData, currentTranslation, exactMatch, wholeWords } =
      state.bible;

    if (!term.trim()) {
      dispatch(setSearchResults([]));
      return;
    }

    const results: SearchResult[] = [];

    // Check if we have data for the current translation
    if (!bibleData[currentTranslation]) {
      console.log("No Bible data found for translation:", currentTranslation);
      dispatch(setSearchResults([]));
      return;
    }

    const translation = bibleData[currentTranslation];

    // Validate books data
    if (!translation.books || !Array.isArray(translation.books)) {
      console.log("No books found in translation:", currentTranslation);
      dispatch(setSearchResults([]));
      return;
    }

    // Enhanced preprocessing: clean search term and prepare for flexible matching
    const cleanSearchTerm = term.replace(/\[|\]/g, "").trim();

    // Create enhanced flexible search function
    const matchSearch = (verseText: string, searchTerm: string) => {
      // Remove square brackets and normalize whitespace
      const cleanText = verseText
        .replace(/\[|\]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const cleanSearchTerm = searchTerm
        .replace(/\[|\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Convert both to lowercase for case-insensitive matching
      const lowerText = cleanText.toLowerCase();
      const lowerSearchTerm = cleanSearchTerm.toLowerCase();

      // Handle empty search term
      if (!lowerSearchTerm) return false;

      // Different matching strategies based on search options
      if (exactMatch && wholeWords) {
        // Exact whole word match - match complete words only
        const escapedTerm = lowerSearchTerm.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        return new RegExp(`\\b${escapedTerm}\\b`).test(lowerText);
      } else if (exactMatch) {
        // Exact substring match
        return lowerText.includes(lowerSearchTerm);
      } else if (wholeWords) {
        // Flexible whole word matching - each word in search term should match whole words in text
        const searchWords = lowerSearchTerm
          .split(/\s+/)
          .filter((word) => word.length > 0);
        const textWords = lowerText.split(/\s+/);

        // Check if all search words exist as whole words in the text
        return searchWords.every((searchWord) =>
          textWords.some((textWord) => textWord === searchWord)
        );
      } else {
        // Flexible phrase matching - handle brackets and spacing intelligently
        const searchWords = lowerSearchTerm
          .split(/\s+/)
          .filter((word) => word.length > 0);

        if (searchWords.length === 1) {
          // Single word search - simple contains
          return lowerText.includes(searchWords[0]);
        } else {
          // Multi-word search - check if words appear in sequence with flexible spacing
          return isFlexiblePhraseMatch(lowerText, searchWords);
        }
      }
    };

    // Helper function for flexible phrase matching
    const isFlexiblePhraseMatch = (
      text: string,
      searchWords: string[]
    ): boolean => {
      if (searchWords.length === 0) return false;

      let textIndex = 0;
      let searchIndex = 0;

      while (textIndex < text.length && searchIndex < searchWords.length) {
        const currentSearchWord = searchWords[searchIndex];
        const foundIndex = text.indexOf(currentSearchWord, textIndex);

        if (foundIndex === -1) {
          return false; // Word not found
        }

        // Ensure word boundaries for better matching
        const charBefore = foundIndex > 0 ? text[foundIndex - 1] : " ";
        const charAfter =
          foundIndex + currentSearchWord.length < text.length
            ? text[foundIndex + currentSearchWord.length]
            : " ";

        const isWordBoundary = /\s/.test(charBefore) && /\s/.test(charAfter);

        if (
          isWordBoundary ||
          searchIndex === 0 ||
          searchIndex === searchWords.length - 1
        ) {
          textIndex = foundIndex + currentSearchWord.length;
          searchIndex++;
        } else {
          textIndex = foundIndex + 1; // Try next position
        }
      }

      return searchIndex === searchWords.length;
    };

    // Comprehensive search across all books and chapters
    translation.books.forEach((book) => {
      book.chapters?.forEach((chapter) => {
        chapter.verses?.forEach((verse) => {
          if (matchSearch(verse.text, cleanSearchTerm)) {
            results.push({
              book: book.name,
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            });
          }
        });
      });
    });

    // Limit results for performance and usability
    const limitedResults = results.slice(0, 200);
    dispatch(setSearchResults(limitedResults));
  }
);
