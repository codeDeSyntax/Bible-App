import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveFeature,
  addBookmark,
  removeBookmark,
  setCurrentTranslation,
  setVerseByVerseMode,
  setBlankScreenMode,
} from "@/store/slices/bibleSlice";
import {
  addPreset,
  deletePreset,
  setActivePreset,
  setProjectedPreset,
} from "@/store/slices/appSlice";
import { v4 as uuidv4 } from "uuid";
import { VersePreviewCard } from "./VersePreviewCard";
import { BooksListCard } from "./BooksListCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { ScripturePresetsCard } from "./AllPresets";
import { RandomFeature } from "./Randomfeature";
import { LiveProjectionIndicator } from "./LiveProjectionIndicator";
import { BibleProjectionControlRoom } from "../BibleProjectionControlRoom";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useBibleProjectionState } from "@/features/bible/hooks/useBibleProjectionState";
import { usePresets } from "@/hooks/usePresets";
import { useNotification } from "@/hooks/useNotification";
import { Toaster } from "@/components/Notification";

interface BibleStudioProps {
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  selectedVerse: number | null;
  bookList: any[];
  onBookSelect: (book: string) => void;
  onChapterSelect: (chapter: number) => void;
  onVerseSelect: (verse: number) => void;
  getChapters: () => number[];
  getVerses: () => number[];
  isDarkMode: boolean;
  onOpenPresentation?: () => void;
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  currentTranslation: string;
  verseByVerseMode: boolean;
  bibleBgs: string[];
}

/**
 * Bible Studio - Main Bento Grid Layout
 * Replaces VerseByVerseView with modular card-based interface
 */
export const BibleStudio: React.FC<BibleStudioProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  selectedVerse,
  bookList,
  onBookSelect,
  onChapterSelect,
  onVerseSelect,
  getChapters,
  getVerses,
  isDarkMode,
  onOpenPresentation,
  projectionFontFamily,
  projectionFontSize,
  projectionTextColor,
  projectionBackgroundImage,
  projectionGradientColors,
  currentTranslation,
  verseByVerseMode,
  bibleBgs,
}) => {
  const dispatch = useAppDispatch();
  const { getCurrentChapterVerses } = useBibleOperations();
  const { isProjectionActive, closeProjection } = useBibleProjectionState();
  const { savePreset: savePresetToFile, deletePresetById } = usePresets();
  const { toasts, showNotification, dismissToast } = useNotification();
  const [showProjectionControlRoom, setShowProjectionControlRoom] =
    useState(false);

  // Redux state
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const presets = useAppSelector((state) => state.app.presets);
  const isBlankScreenMode = useAppSelector(
    (state) => state.bible.isBlankScreenMode
  );
  const projectionBackgroundColor = useAppSelector(
    (state) => state.bible.projectionBackgroundColor
  );

  // Get current verse text
  const verses = getCurrentChapterVerses();
  const displayVerse = selectedVerse || currentVerse || 1;
  const currentVerseText =
    verses && verses[displayVerse - 1]
      ? typeof verses[displayVerse - 1] === "string"
        ? String(verses[displayVerse - 1])
        : String((verses[displayVerse - 1] as any).text || "")
      : "";

  // Check if current verse is bookmarked
  const isCurrentVerseBookmarked = () => {
    if (!currentVerse) return false;
    const reference = `${currentBook} ${currentChapter}:${currentVerse}`;
    return bookmarks.includes(reference);
  };

  // Handle bookmark toggle
  const handleBookmark = () => {
    if (!currentVerse) return;
    const reference = `${currentBook} ${currentChapter}:${currentVerse}`;
    const isBookmarked = bookmarks.includes(reference);

    if (isBookmarked) {
      dispatch(removeBookmark(reference));
      showNotification(`Bookmark removed: ${reference}`, "info");
    } else {
      dispatch(addBookmark(reference));
      showNotification(`Bookmark added: ${reference}`, "success");
    }
  };

  // Handle save as preset
  const handleSavePreset = async () => {
    // Check if we already have 10 presets (excluding default presets)
    const nonDefaultPresets = presets.filter(
      (preset) => !preset.id.startsWith("default-")
    );

    if (nonDefaultPresets.length >= 10) {
      showNotification(
        "Maximum presets limit reached! Only 10 presets can be displayed.",
        "error"
      );
      return;
    }

    const verse = selectedVerse || currentVerse || 1;
    const reference = `${currentBook} ${currentChapter}:${verse}`;

    try {
      const translation = bibleData[currentTranslation];
      if (!translation) return;

      const book = translation.books?.find((b: any) => b.name === currentBook);
      if (!book) return;

      const chapter = book.chapters?.find(
        (c: any) => c.chapter === currentChapter
      );
      if (!chapter) return;

      const verseObj = chapter.verses?.find((v: any) => v.verse === verse);
      if (!verseObj) return;

      const newPreset = {
        id: uuidv4(),
        type: "scripture" as const,
        name: reference,
        data: {
          reference,
          text: verseObj.text,
          book: currentBook,
          chapter: currentChapter,
          verse: verse,
          videoBackground: "./waterglass.mp4",
        },
        createdAt: Date.now(),
      };

      // Save to file system using usePresets hook (handles both file system and Redux)
      const success = await savePresetToFile(newPreset);

      if (success) {
        console.log(`✅ Preset "${reference}" saved successfully`);
        showNotification(
          `Preset "${reference}" saved successfully!`,
          "success"
        );
      } else {
        console.error("Failed to save preset to file system");
        showNotification("Failed to save preset. Please try again.", "error");
      }
    } catch (error) {
      console.error("Failed to save preset:", error);
      showNotification("Failed to save preset. Please try again.", "error");
    }
  };

  // Handle feature toggles
  const handleOpenSearch = () => {
    dispatch(setActiveFeature(activeFeature === "search" ? null : "search"));
  };

  const handleOpenBookmarks = () => {
    dispatch(
      setActiveFeature(activeFeature === "bookmarks" ? null : "bookmarks")
    );
  };

  const handleOpenLibrary = () => {
    dispatch(setActiveFeature(activeFeature === "library" ? null : "library"));
  };

  // Handle translation change
  const handleTranslationSelect = (translation: string) => {
    dispatch(setCurrentTranslation(translation));
  };

  // Handle preset selection - Project to presentation window
  const handlePresetSelect = async (preset: any) => {
    try {
      // Set active and projected preset in Redux
      dispatch(setActivePreset(preset.id));
      dispatch(setProjectedPreset(preset.id));

      // Wait for redux-persist to flush to localStorage
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Project the preset to external display
      if (typeof window !== "undefined" && window.api) {
        console.log(
          "🚀 [BibleStudio] Projecting preset:",
          preset.name,
          preset.type
        );

        window.api.createPresentationWindow({
          presetId: preset.id,
          presetType: preset.type,
          presetName: preset.name,
          presetData: preset.data,
        });
      } else {
        console.error("❌ Window API not available");
      }
    } catch (error) {
      console.error("Failed to project preset:", error);
    }
  };

  // Handle preset deletion
  const handlePresetDelete = async (presetId: string) => {
    try {
      const success = await deletePresetById(presetId);
      if (success) {
        showNotification("Preset deleted successfully", "success");
      } else {
        showNotification("Failed to delete preset", "error");
      }
    } catch (error) {
      console.error("Failed to delete preset:", error);
      showNotification("Failed to delete preset", "error");
    }
  };

  // Handle view mode toggle
  const handleToggleViewMode = () => {
    dispatch(setVerseByVerseMode(!verseByVerseMode));
  };

  // Handle opening projection control room
  const handleOpenControlRoom = () => {
    setShowProjectionControlRoom(true);
  };

  // Handle blank screen mode toggle
  const handleToggleBlankScreen = async () => {
    const newBlankMode = !isBlankScreenMode;
    dispatch(setBlankScreenMode(newBlankMode));

    // Send update to presentation window via IPC
    if (typeof window !== "undefined" && window.api) {
      try {
        await window.api.sendToBiblePresentation({
          type: "blank-screen-mode",
          data: { isBlank: newBlankMode },
        });
        console.log(
          `📺 Blank screen mode ${newBlankMode ? "enabled" : "disabled"}`
        );
        showNotification(
          `Presentation ${newBlankMode ? "hidden" : "shown"}`,
          "info"
        );
      } catch (error) {
        console.error("Failed to update presentation blank screen:", error);
        showNotification("Failed to update presentation", "error");
      }
    }
  };

  // Get available translations
  const availableTranslations = Object.keys(bibleData);

  // Keyboard shortcuts for projection (Enter) and bookmarks (B)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys if we're not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (onOpenPresentation) {
          onOpenPresentation();
        }
      } else if ((e.key === "b" || e.key === "B") && !e.ctrlKey) {
        // B key (without Ctrl): Toggle bookmark modal
        e.preventDefault();
        handleOpenBookmarks();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenPresentation]);

  return (
    <div className="h-screen w-full overflow-hidden bg-studio-bg px-4 py-1 flex flex-col">
      {/* Action Bar */}
      {/* <ActionBar
        isDarkMode={isDarkMode}
        currentTranslation={currentTranslation}
        availableTranslations={availableTranslations}
        onTranslationSelect={handleTranslationSelect}
      /> */}

      {/* Bento Grid Layout */}
      <div className="flex-1 min-h-0 mt-1">
        <div className="grid grid-cols-5 grid-rows-5 gap-2 h-[95%] relative z-10">
          {/* Card 1: Verse Preview - 2 columns, 3 rows */}
          <VersePreviewCard
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentVerse={currentVerse}
            verseText={currentVerseText}
            isDarkMode={isDarkMode}
            onOpenBookmarks={handleOpenBookmarks}
          />

          {/* Card 2: Books/Chapters/Verses - 2 columns, 3 rows */}
          <BooksListCard
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentVerse={currentVerse}
            bookList={bookList}
            onBookSelect={onBookSelect}
            onChapterSelect={onChapterSelect}
            onVerseSelect={onVerseSelect}
            getChapters={getChapters}
            getVerses={getVerses}
            getCurrentChapterVerses={getCurrentChapterVerses}
            isDarkMode={isDarkMode}
          />

          {/* Card 5: Scripture Presets - 2 columns, 3 rows */}
          <ScripturePresetsCard
            presets={presets}
            onPresetSelect={handlePresetSelect}
            onPresetDelete={handlePresetDelete}
            isDarkMode={isDarkMode}
          />

          {/* Card 3: Quick Actions - 1 column, 3 rows */}
          <QuickActionsCard
            isDarkMode={isDarkMode}
            onBookmark={handleBookmark}
            onSavePreset={handleSavePreset}
            onOpenProjection={onOpenPresentation || (() => {})}
            onOpenSearch={handleOpenSearch}
            onOpenBookmarks={handleOpenBookmarks}
            onOpenLibrary={handleOpenLibrary}
            onToggleViewMode={handleToggleViewMode}
            onOpenControlRoom={handleOpenControlRoom}
            onToggleBlankScreen={handleToggleBlankScreen}
            isBookmarked={isCurrentVerseBookmarked()}
            bookmarksCount={bookmarks.length}
            isProjectionActive={isProjectionActive}
            isBlankScreenMode={isBlankScreenMode}
            verseByVerseMode={verseByVerseMode}
          />

          {/* Card 6: Info & Settings - 1 column, 5 rows (full height) */}
          <RandomFeature
            isDarkMode={isDarkMode}
            projectionFontFamily={projectionFontFamily}
            projectionFontSize={projectionFontSize}
            projectionTextColor={projectionTextColor}
            projectionBackgroundImage={projectionBackgroundImage}
            projectionGradientColors={projectionGradientColors}
            projectionBackgroundColor={projectionBackgroundColor}
            currentTranslation={currentTranslation}
            currentBook={currentBook}
            currentChapter={currentChapter}
            verseByVerseMode={verseByVerseMode}
            bibleBgs={bibleBgs}
          />
        </div>
      </div>

      {/* Floating Live Projection Indicator */}
      <LiveProjectionIndicator
        isProjectionActive={isProjectionActive}
        onClose={closeProjection}
        isDarkMode={isDarkMode}
      />

      {/* Bible Projection Control Room */}
      <BibleProjectionControlRoom
        isOpen={showProjectionControlRoom}
        onClose={() => setShowProjectionControlRoom(false)}
      />

      {/* Toast Notifications */}
      <Toaster
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-right"
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
