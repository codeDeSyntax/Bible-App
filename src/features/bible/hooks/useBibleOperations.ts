import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  logBibleAction,
  logSystemInfo,
  logSystemError,
} from "@/utils/ClientSecretLogger";
import {
  setTheme,
  setCurrentScreen,
  setSidebarExpanded,
  setActiveFeature,
  setSearchOpen,
  setBibleData,
  addTranslationData,
  setCurrentTranslation,
  setAvailableTranslations,
  setTranslationLoaded,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setBookList,
  setFontSize,
  setFontWeight,
  setFontFamily,
  setVerseTextColor,
  addBookmark,
  removeBookmark,
  setBookmarks,
  addToHistory,
  setHistory,
  clearHistory,
  setSearchResults,
  setSearchTerm,
  setExactMatch,
  setWholeWords,
  clearSearch,
  setLoading,
  setError,
  navigateToVerse,
  resetBibleState,
  TRANSLATIONS,
  Book,
  Verse,
  Chapter,
  BibleTranslation,
  SearchResult,
  HistoryEntry,
} from "@/store/slices/bibleSlice";

export const useBibleOperations = () => {
  const dispatch = useAppDispatch();

  // State selectors
  const theme = useAppSelector((state) => state.bible.theme);
  const currentScreen = useAppSelector((state) => state.bible.currentScreen);
  const sidebarExpanded = useAppSelector(
    (state) => state.bible.sidebarExpanded
  );
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const searchOpen = useAppSelector((state) => state.bible.searchOpen);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const availableTranslations = useAppSelector(
    (state) => state.bible.availableTranslations
  );
  const translationsLoaded = useAppSelector(
    (state) => state.bible.translationsLoaded
  );
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const bookList = useAppSelector((state) => state.bible.bookList);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const history = useAppSelector((state) => state.bible.history);
  const searchResults = useAppSelector((state) => state.bible.searchResults);
  const searchTerm = useAppSelector((state) => state.bible.searchTerm);
  const exactMatch = useAppSelector((state) => state.bible.exactMatch);
  const wholeWords = useAppSelector((state) => state.bible.wholeWords);
  const isLoading = useAppSelector((state) => state.bible.isLoading);
  const error = useAppSelector((state) => state.bible.error);

  // App operations
  const changeTheme = useCallback(
    (newTheme: string) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  const changeCurrentScreen = useCallback(
    (screen: string) => {
      dispatch(setCurrentScreen(screen));
    },
    [dispatch]
  );

  // Window operations (if using Electron)
  const handleMinimize = useCallback(() => {
    if (window.api?.minimizeApp) {
      window.api.minimizeApp();
    }
  }, []);

  const handleMaximize = useCallback(() => {
    if (window.api?.maximizeApp) {
      window.api.maximizeApp();
    }
  }, []);

  const handleClose = useCallback(() => {
    if (window.api?.closeApp) {
      window.api.closeApp();
    }
  }, []);

  // UI operations
  const toggleSidebar = useCallback(() => {
    dispatch(setSidebarExpanded(!sidebarExpanded));
  }, [dispatch, sidebarExpanded]);

  const expandSidebar = useCallback(() => {
    dispatch(setSidebarExpanded(true));
  }, [dispatch]);

  const collapseSidebar = useCallback(() => {
    dispatch(setSidebarExpanded(false));
  }, [dispatch]);

  const toggleActiveFeature = useCallback(
    (feature: string) => {
      dispatch(setActiveFeature(activeFeature === feature ? null : feature));
    },
    [dispatch, activeFeature]
  );

  const clearActiveFeature = useCallback(() => {
    dispatch(setActiveFeature(null));
  }, [dispatch]);

  const toggleSearch = useCallback(() => {
    dispatch(setSearchOpen(!searchOpen));
  }, [dispatch, searchOpen]);

  const openSearch = useCallback(() => {
    dispatch(setSearchOpen(true));
  }, [dispatch]);

  const closeSearch = useCallback(() => {
    dispatch(setSearchOpen(false));
  }, [dispatch]);

  // Bible data loading operations
  const loadTranslation = useCallback(
    async (translation: string) => {
      // Don't reload already loaded translations
      if (bibleData[translation] || translationsLoaded[translation]) {
        return;
      }

      try {
        // Mark this translation as being loaded
        dispatch(setTranslationLoaded({ translation, loaded: true }));
        dispatch(setLoading(true));

        const translationConfig =
          TRANSLATIONS[translation as keyof typeof TRANSLATIONS];
        if (!translationConfig) {
          throw new Error(
            `Translation configuration not found for: ${translation}`
          );
        }

        const response = await fetch(translationConfig.path);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${translation} translation: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Update Bible data with the new translation
        dispatch(addTranslationData({ translation, data }));

        // Update book list with the new translation's books
        if (translation === currentTranslation) {
          dispatch(setBookList(data.books));
        }

        dispatch(setLoading(false));

        console.log(`Loaded ${translation} translation successfully`);
      } catch (error) {
        console.error(`Error loading ${translation} translation:`, error);
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : `Failed to load ${translation} translation`
          )
        );
        // Reset loading state so it can be tried again
        dispatch(setTranslationLoaded({ translation, loaded: false }));
      }
    },
    [dispatch, bibleData, translationsLoaded, currentTranslation]
  );

  const initializeBibleData = useCallback(async () => {
    try {
      // Don't initialize if we already have translations loaded
      if (Object.keys(bibleData).length > 0) {
        logSystemInfo(
          `Bible data already initialized with ${
            Object.keys(bibleData).length
          } translations`
        );
        return;
      }

      logBibleAction("Starting Bible data initialization", {
        currentTranslation,
      });

      dispatch(setLoading(true));

      // Initialize available translations
      const validTranslations = Object.keys(TRANSLATIONS);
      dispatch(setAvailableTranslations(validTranslations));

      logSystemInfo(
        `Loaded ${validTranslations.length} available Bible translations`,
        {
          translations: validTranslations,
        }
      );

      // Validate current translation and set to default if invalid
      if (!validTranslations.includes(currentTranslation)) {
        console.warn(
          `Invalid current translation: ${currentTranslation}, defaulting to KJV`
        );
        logSystemError(
          `Invalid translation detected: ${currentTranslation}, switching to KJV`
        );
        dispatch(setCurrentTranslation("KJV"));
        return; // Return to let the effect run again with the valid translation
      }

      // Fetch default translation first
      if (
        !bibleData[currentTranslation] &&
        !translationsLoaded[currentTranslation]
      ) {
        await loadTranslation(currentTranslation);
      }

      // Then fetch other translations in the background
      validTranslations.forEach((translation) => {
        if (
          translation !== currentTranslation &&
          !bibleData[translation] &&
          !translationsLoaded[translation]
        ) {
          loadTranslation(translation);
        }
      });

      logBibleAction("Bible initialization completed successfully");
    } catch (error) {
      console.error("Error initializing Bible data:", error);
      logSystemError("Failed to initialize Bible data", {
        error: error instanceof Error ? error.message : String(error),
      });
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize Bible data"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [
    dispatch,
    bibleData,
    translationsLoaded,
    currentTranslation,
    loadTranslation,
  ]);

  // Bible navigation operations
  const changeTranslation = useCallback(
    (translation: string) => {
      logBibleAction(`Switching Bible translation to ${translation}`);
      dispatch(setCurrentTranslation(translation));
      if (bibleData[translation]) {
        // If we already have the data, update the book list
        dispatch(setBookList(bibleData[translation].books));
        logSystemInfo(`Bible translation ${translation} loaded from cache`, {
          booksCount: bibleData[translation].books.length,
        });
      } else {
        // If not, load the translation which will update the book list
        logSystemInfo(`Loading Bible translation ${translation} from file`);
        loadTranslation(translation);
      }
    },
    [dispatch, bibleData, loadTranslation]
  );

  const changeBook = useCallback(
    (book: string) => {
      logBibleAction(`Navigating to Bible book: ${book}`);
      dispatch(setCurrentBook(book));
      dispatch(setCurrentChapter(1)); // Reset to first chapter
      dispatch(setCurrentVerse(null)); // Clear verse selection
    },
    [dispatch]
  );

  const changeChapter = useCallback(
    (chapter: number) => {
      dispatch(setCurrentChapter(chapter));
      dispatch(setCurrentVerse(null)); // Clear verse selection
    },
    [dispatch]
  );

  const changeVerse = useCallback(
    (verse: number | null) => {
      dispatch(setCurrentVerse(verse));
    },
    [dispatch]
  );

  const navigateToReference = useCallback(
    (book: string, chapter: number, verse?: number) => {
      dispatch(navigateToVerse({ book, chapter, verse }));
    },
    [dispatch]
  );

  const goToNextChapter = useCallback(() => {
    const chapterCount = getBookChapterCount(currentBook);
    if (currentChapter < chapterCount) {
      dispatch(setCurrentChapter(currentChapter + 1));
      dispatch(setCurrentVerse(null));
    }
  }, [dispatch, currentBook, currentChapter]);

  const goToPreviousChapter = useCallback(() => {
    if (currentChapter > 1) {
      dispatch(setCurrentChapter(currentChapter - 1));
      dispatch(setCurrentVerse(null));
    }
  }, [dispatch, currentChapter]);

  // Utility functions
  const getCurrentChapterVerses = useCallback((): Verse[] => {
    try {
      const bookData = bibleData[currentTranslation]?.books.find(
        (b: Book) => b.name === currentBook
      );
      const chapterData = bookData?.chapters.find(
        (c: Chapter) => Number(c.chapter) === Number(currentChapter)
      );
      return chapterData?.verses || [];
    } catch (error) {
      console.error("Error getting verses:", error);
      return [];
    }
  }, [bibleData, currentTranslation, currentBook, currentChapter]);

  const getBookChapterCount = useCallback(
    (book: string): number => {
      try {
        const bookData = bibleData[currentTranslation]?.books.find(
          (b: Book) => b.name === book
        );
        return bookData?.chapters.length || 0;
      } catch (error) {
        console.error("Error getting chapter count:", error);
        return 0;
      }
    },
    [bibleData, currentTranslation]
  );

  const updateBookList = useCallback(() => {
    if (!bibleData[currentTranslation]) return;

    const books = bibleData[currentTranslation].books;
    const uniqueBooks = Array.from(
      new Set(books.map((book: Book) => book.name))
    ).map((name) => books.find((book: Book) => book.name === name));

    const filteredBooks = uniqueBooks.filter(
      (book): book is Book => book !== undefined
    );
    dispatch(setBookList(filteredBooks));
  }, [dispatch, bibleData, currentTranslation]);

  // User preferences operations
  const changeFontSize = useCallback(
    (size: string) => {
      dispatch(setFontSize(size));
    },
    [dispatch]
  );

  const changeFontWeight = useCallback(
    (weight: string) => {
      dispatch(setFontWeight(weight));
    },
    [dispatch]
  );

  const changeFontFamily = useCallback(
    (family: string) => {
      dispatch(setFontFamily(family));
    },
    [dispatch]
  );

  const changeVerseTextColor = useCallback(
    (color: string) => {
      dispatch(setVerseTextColor(color));
    },
    [dispatch]
  );

  // Bookmark operations
  const addNewBookmark = useCallback(
    (reference: string) => {
      dispatch(addBookmark(reference));
    },
    [dispatch]
  );

  const deleteBookmark = useCallback(
    (reference: string) => {
      dispatch(removeBookmark(reference));
    },
    [dispatch]
  );

  const bookmarkCurrentVerse = useCallback(() => {
    const reference = currentVerse
      ? `${currentBook} ${currentChapter}:${currentVerse}`
      : `${currentBook} ${currentChapter}`;
    dispatch(addBookmark(reference));
  }, [dispatch, currentBook, currentChapter, currentVerse]);

  const isBookmarked = useCallback(
    (reference: string): boolean => {
      return bookmarks.includes(reference);
    },
    [bookmarks]
  );

  const isCurrentVerseBookmarked = useCallback((): boolean => {
    const reference = currentVerse
      ? `${currentBook} ${currentChapter}:${currentVerse}`
      : `${currentBook} ${currentChapter}`;
    return bookmarks.includes(reference);
  }, [bookmarks, currentBook, currentChapter, currentVerse]);

  // History operations
  const addCurrentToHistory = useCallback(() => {
    const reference = currentVerse
      ? `${currentBook} ${currentChapter}:${currentVerse}`
      : `${currentBook} ${currentChapter}`;
    dispatch(addToHistory(reference));
  }, [dispatch, currentBook, currentChapter, currentVerse]);

  const clearBibleHistory = useCallback(() => {
    dispatch(clearHistory());
  }, [dispatch]);

  // Search operations
  const updateSearchTerm = useCallback(
    (term: string) => {
      dispatch(setSearchTerm(term));
    },
    [dispatch]
  );

  const toggleExactMatch = useCallback(() => {
    dispatch(setExactMatch(!exactMatch));
  }, [dispatch, exactMatch]);

  const toggleWholeWords = useCallback(() => {
    dispatch(setWholeWords(!wholeWords));
  }, [dispatch, wholeWords]);

  const performSearch = useCallback(
    (term: string) => {
      if (!term.trim()) {
        dispatch(setSearchResults([]));
        return;
      }

      logBibleAction(`Performing Bible search: "${term}"`, {
        translation: currentTranslation,
      });

      const results: SearchResult[] = [];

      // Check if we have data for the current translation
      if (!bibleData[currentTranslation]) {
        console.log("No Bible data found for translation:", currentTranslation);
        logSystemError(
          `No Bible data found for translation: ${currentTranslation}`
        );
        dispatch(setSearchResults([]));
        return;
      }

      const translation = bibleData[currentTranslation];

      // Validate books data
      if (!translation.books || !Array.isArray(translation.books)) {
        console.log("No books found in translation:", currentTranslation);
        logSystemError(`No books found in translation: ${currentTranslation}`);
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

      logBibleAction(
        `Bible search completed: ${results.length} results found`,
        {
          term,
          translation: currentTranslation,
          displayedResults: limitedResults.length,
          truncated: results.length > 200,
        }
      );
    },
    [dispatch, bibleData, currentTranslation, exactMatch, wholeWords]
  );

  const clearBibleSearch = useCallback(() => {
    logBibleAction("Bible search cleared");
    dispatch(clearSearch());
  }, [dispatch]);

  const navigateToSearchResult = useCallback(
    (result: SearchResult) => {
      logBibleAction(
        `Navigating to search result: ${result.book} ${result.chapter}:${result.verse}`
      );
      dispatch(
        navigateToVerse({
          book: result.book,
          chapter: result.chapter,
          verse: result.verse,
        })
      );
      dispatch(setSearchOpen(false));
    },
    [dispatch]
  );

  // Reset operations
  const resetAllBibleState = useCallback(() => {
    dispatch(resetBibleState());
  }, [dispatch]);

  return {
    // State
    theme,
    currentScreen,
    sidebarExpanded,
    activeFeature,
    searchOpen,
    bibleData,
    currentTranslation,
    availableTranslations,
    translationsLoaded,
    currentBook,
    currentChapter,
    currentVerse,
    bookList,
    fontSize,
    fontWeight,
    fontFamily,
    verseTextColor,
    bookmarks,
    history,
    searchResults,
    searchTerm,
    exactMatch,
    wholeWords,
    isLoading,
    error,

    // App operations
    changeTheme,
    changeCurrentScreen,
    handleMinimize,
    handleMaximize,
    handleClose,

    // UI operations
    toggleSidebar,
    expandSidebar,
    collapseSidebar,
    toggleActiveFeature,
    clearActiveFeature,
    toggleSearch,
    openSearch,
    closeSearch,

    // Bible data operations
    loadTranslation,
    initializeBibleData,

    // Navigation operations
    changeTranslation,
    changeBook,
    changeChapter,
    changeVerse,
    navigateToReference,
    goToNextChapter,
    goToPreviousChapter,

    // Utility functions
    getCurrentChapterVerses,
    getBookChapterCount,
    updateBookList,

    // User preferences operations
    changeFontSize,
    changeFontWeight,
    changeFontFamily,
    changeVerseTextColor,

    // Bookmark operations
    addNewBookmark,
    deleteBookmark,
    bookmarkCurrentVerse,
    isBookmarked,
    isCurrentVerseBookmarked,

    // History operations
    addCurrentToHistory,
    clearBibleHistory,

    // Search operations
    updateSearchTerm,
    toggleExactMatch,
    toggleWholeWords,
    performSearch,
    clearBibleSearch,
    navigateToSearchResult,

    // Reset operations
    resetAllBibleState,
  };
};
