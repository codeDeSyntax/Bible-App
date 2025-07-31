import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { setSearchResults } from './bibleSlice';
import { SearchResult } from './bibleSlice';

export const performSearch = createAsyncThunk(
  'bible/performSearch',
  async (term: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { bibleData, currentTranslation, exactMatch, wholeWords } = state.bible;

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

    // Preprocess search term: remove square brackets, trim, and handle case
    const cleanSearchTerm = term.replace(/\[|\]/g, "").trim();

    // Create flexible search function
    const matchSearch = (verseText: string, searchTerm: string) => {
      // Remove square brackets and cleanup text
      const cleanText = verseText.replace(/\[|\]/g, "");

      // Convert both to lowercase for case-insensitive matching
      const lowerText = cleanText.toLowerCase();
      const lowerSearchTerm = searchTerm.toLowerCase();

      // Different matching strategies based on search options
      if (exactMatch && wholeWords) {
        // Exact whole word match
        return new RegExp(
          `\\b${lowerSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
        ).test(lowerText);
      } else if (exactMatch) {
        // Exact substring match
        return lowerText.includes(lowerSearchTerm);
      } else if (wholeWords) {
        // Whole word match with partial flexibility
        return lowerText
          .split(/\s+/)
          .some((word) => word.includes(lowerSearchTerm));
      } else {
        // Flexible pattern matching
        return lowerText.includes(lowerSearchTerm);
      }
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