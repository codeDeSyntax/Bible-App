import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveFeature,
  addBookmark,
  removeBookmark,
  setCurrentTranslation,
  setBlankScreenMode,
  addSavedAlert,
  removeSavedAlert,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setProjectionBackgroundImage,
} from "@/store/slices/bibleSlice";
import { addPreset, deletePreset } from "@/store/slices/appSlice";
import { v4 as uuidv4 } from "uuid";
import { VersePreviewCard } from "./VersePreviewCard";
import { BooksListCard } from "./BooksListCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { ScripturePresetsCard } from "./AllPresets";
import { RandomFeature } from "./Randomfeature";
import { LiveProjectionIndicator } from "./LiveProjectionIndicator";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useBibleProjectionState } from "@/features/bible/hooks/useBibleProjectionState";
import { usePresets } from "@/hooks/usePresets";
import { useNotification } from "@/hooks/useNotification";
import { useSystemServices } from "@/hooks/useSystemServices";
import { Toaster } from "@/components/Notification";
import { AlertModal } from "./AlertModal";
import { SettingsMenu } from "../SettingsMenu";
import { UnifiedSearchPanel } from "./UnifiedSearchPanel";
import { GoogleAIModePanel } from "../GoogleAIModePanel";
import { GoogleImagesPanel } from "../GoogleImagesPanel";

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
  bibleBgs,
}) => {
  const dispatch = useAppDispatch();
  const { getCurrentChapterVerses } = useBibleOperations();
  const { isProjectionActive, closeProjection } = useBibleProjectionState();
  const { savePreset: savePresetToFile, deletePresetById } = usePresets();
  const { toasts, showNotification, dismissToast } = useNotification();

  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [showControlRoom, setShowControlRoom] = useState(false);
  const [activeGoogleView, setActiveGoogleView] = useState<
    "googleAI" | "googleImages" | null
  >(null);

  // Redux state
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const savedAlerts = useAppSelector((state) => state.bible.savedAlerts);
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const history = useAppSelector((state) => state.bible.history);
  const presets = useAppSelector((state) => state.app.presets);
  const isBlankScreenMode = useAppSelector(
    (state) => state.bible.isBlankScreenMode,
  );
  const projectionBackgroundColor = useAppSelector(
    (state) => state.bible.projectionBackgroundColor,
  );

  // System services: native notifications, power save blocker, tray sync
  const { notify, powerSave, tray } = useSystemServices({
    onTrayAction: (action) => {
      if (action === "blank-screen") {
        dispatch(setBlankScreenMode(!isBlankScreenMode));
      }
    },
  });

  // Sync projection state + blank screen into tray whenever they change
  useEffect(() => {
    tray.syncState({
      projectionActive: isProjectionActive,
      blankScreen: isBlankScreenMode,
    });
    tray.setTooltip(
      isProjectionActive
        ? "God's Word — Projecting Live"
        : "God's Word — Bible App",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectionActive, isBlankScreenMode]);

  // Get current verse text
  const verses = getCurrentChapterVerses();
  const displayVerse = currentVerse || selectedVerse || 1;
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

  // Modal state and handlers for alerts
  const [alertModalVisibleState, setAlertModalVisible] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const allAlerts = useAppSelector((state) => state.bible.savedAlerts);
  const editingAlert = editingAlertId
    ? allAlerts.find((a) => a.id === editingAlertId)
    : null;

  const handleSaveAlert = (payload: {
    text: string;
    backgroundColor?: string;
    themeName?: string;
    isAiGenerated?: boolean;
    id?: string;
  }) => {
    const alertIdToUse = payload.id || editingAlertId;

    if (alertIdToUse) {
      const alertToUpdate = allAlerts.find((a) => a.id === alertIdToUse);
      if (alertToUpdate) {
        const updatedAlert = {
          ...alertToUpdate,
          text: payload.text,
          backgroundColor: payload.backgroundColor || "#111827",
          themeName: payload.themeName || alertToUpdate.themeName,
          isAiGenerated: payload.isAiGenerated ?? alertToUpdate.isAiGenerated,
        };
        dispatch(addSavedAlert(updatedAlert));
        showNotification("Alert updated", "success");
      } else {
        const alertObj = {
          id: alertIdToUse,
          text: payload.text,
          backgroundColor: payload.backgroundColor || "#111827",
          themeName: payload.themeName,
          isAiGenerated: payload.isAiGenerated,
          timestamp: Date.now(),
        };
        dispatch(addSavedAlert(alertObj));
      }
      setEditingAlertId(null);
    } else {
      const id = `alert-${Date.now()}`;
      const alertObj = {
        id,
        text: payload.text,
        backgroundColor: payload.backgroundColor || "#111827",
        themeName: payload.themeName,
        isAiGenerated: payload.isAiGenerated,
        timestamp: Date.now(),
      };
      dispatch(addSavedAlert(alertObj));
      showNotification("Marquee saved", "success");
    }

    setAlertModalVisible(false);
  };

  const handleToggleAlert = () => {
    if (activeAlertId) {
      handleHideAlert();
    } else {
      setAlertModalVisible(true);
    }
  };

  const handleEditAlert = (id: string) => {
    setEditingAlertId(id);
    setAlertModalVisible(true);
  };

  const handleRemoveAlert = (id: string) => {
    dispatch(removeSavedAlert(id));
    if (activeAlertId === id) {
      setActiveAlertId(null);
    }
  };

  const handleHideAlert = () => {
    console.log("handleHideAlert called, hiding alert:", activeAlertId);
    if (
      typeof window !== "undefined" &&
      window.api &&
      window.api.sendToBiblePresentation
    ) {
      window.api.sendToBiblePresentation({
        type: "hideAlert",
        data: {},
      });
    }
    setActiveAlertId(null);
    console.log("activeAlertId set to null");
    showNotification("Alert hidden", "info");
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
    const nonDefaultPresets = presets.filter(
      (preset) => !preset.id.startsWith("default-"),
    );

    if (nonDefaultPresets.length >= 12) {
      showNotification(
        "Maximum presets limit reached! Only 12 presets can be displayed.",
        "error",
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
        (c: any) => c.chapter === currentChapter,
      );
      if (!chapter) return;

      const verseObj = chapter.verses?.find((v: any) => v.verse === verse);
      if (!verseObj) return;

      const savedBackgroundImage =
        typeof projectionBackgroundImage === "string" &&
        projectionBackgroundImage.trim() &&
        projectionBackgroundImage !== "null" &&
        projectionBackgroundImage !== "undefined" &&
        projectionBackgroundImage !== "none"
          ? projectionBackgroundImage
          : "";

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
          ...(savedBackgroundImage
            ? { backgroundImage: savedBackgroundImage }
            : { backgroundImage: "./paint-sweeps-strong.jpg" }),
        },
        createdAt: Date.now(),
      };

      // Save to file system using usePresets hook (handles both file system and Redux)
      const success = await savePresetToFile(newPreset);

      if (success) {
        console.log(`✅ Preset "${reference}" saved successfully`);
        showNotification(
          `Preset "${reference}" saved successfully!`,
          "success",
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

  // Left sidebar search toggle state
  const [isLeftSearchOpen, setIsLeftSearchOpen] = useState(false);

  // Handle feature toggles
  const handleOpenSearch = () => {
    setIsLeftSearchOpen((prev) => !prev);
  };

  const handleOpenBookmarks = () => {
    dispatch(
      setActiveFeature(activeFeature === "bookmarks" ? null : "bookmarks"),
    );
  };

  const handleOpenLibrary = () => {
    dispatch(setActiveFeature(activeFeature === "library" ? null : "library"));
  };

  // Handle translation change
  const handleTranslationSelect = (translation: string) => {
    dispatch(setCurrentTranslation(translation));
  };

  // Handle preset selection — restores saved book, chapter, verse, and styling
  const handlePresetSelect = async (preset: any) => {
    if (!preset?.data) return;

    try {
      const { book, chapter, verse, backgroundImage } = preset.data;

      if (book) onBookSelect(book);
      if (chapter) onChapterSelect(chapter);
      if (verse) onVerseSelect(verse);

      if (backgroundImage) {
        dispatch(setProjectionBackgroundImage(backgroundImage));
      }

      showNotification(
        `Loaded preset: ${preset.data?.reference || preset.name}`,
        "success",
      );
    } catch (error) {
      console.error("Failed to load preset:", error);
      showNotification("Failed to load preset.", "error");
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

  // Handle blank screen mode toggle
  const handleToggleBlankScreen = () => {
    const newBlankMode = !isBlankScreenMode;
    dispatch(setBlankScreenMode(newBlankMode));

    if (typeof window !== "undefined") {
      const payload = {
        type: "blank-screen-mode",
        data: { isBlank: newBlankMode },
      };

      if ((window as any).api && (window as any).api.sendToBiblePresentation) {
        (window as any).api.sendToBiblePresentation(payload);
      } else if ((window as any).ipcRenderer) {
        (window as any).ipcRenderer.send("bible-presentation-update", payload);
      } else {
        console.warn("No IPC method available to send blank-screen-mode");
      }

      showNotification(
        `Presentation ${newBlankMode ? "hidden" : "shown"}`,
        "info",
      );
    }
  };

  // Handle projection background grayscale toggle
  const handleToggleProjectionGrayscale = async () => {
    if (typeof window !== "undefined" && (window as any).api) {
      try {
        await (window as any).api.toggleProjectionGrayscale();
        showNotification("Background filter toggled", "info");
      } catch (error) {
        console.error("Failed to toggle projection grayscale:", error);
        showNotification("Failed to toggle filter", "error");
      }
    }
  };

  // Publish current verse as a marquee alert to the presentation
  const handlePublishMarquee = () => {
    setAlertModalVisible(true);
  };

  // Project a verse from BibleSearchBot results into the Bible presentation window
  const handleProjectSearchVerse = async ({
    reference,
  }: {
    text: string;
    reference: string;
  }) => {
    if (typeof window === "undefined" || !(window as any).api) return;

    // Parse "Book Chapter:Verse" e.g. "Romans 8:1"
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return;

    const book = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verseNum = parseInt(match[3], 10);

    // Build presentation data — enrich with verse list from local bibleData when available
    const presentationData: {
      book: string;
      chapter: number;
      verses: Array<{ verse: number; text: string }>;
      translation: string;
      selectedVerse: number;
    } = {
      book,
      chapter,
      verses: [],
      translation: currentTranslation,
      selectedVerse: verseNum,
    };

    try {
      const translationData = bibleData[currentTranslation];
      const bookData = translationData?.books?.find(
        (b: any) => b.name === book,
      );
      const chapterData = bookData?.chapters?.find(
        (c: any) => c.chapter === chapter,
      );
      if (Array.isArray(chapterData?.verses) && chapterData.verses.length > 0) {
        presentationData.verses = chapterData.verses;
      }
    } catch (_) {
      // Presentation window will fall back to its own bibleData
    }

    const api = (window as any).api;

    // Open (or focus) the Bible presentation window with the verse pre-selected
    await api.createBiblePresentationWindow({
      presentationData,
      settings: {
        fontSize: 6,
        textColor: "#ffffff",
        backgroundColor: "#1e293b",
        versesPerSlide: 1,
      },
    });

    // Send a live navigation update — handles the case where the window was already open
    setTimeout(() => {
      api.sendToBiblePresentation({
        type: "update-data",
        data: presentationData,
      });
    }, 450);
  };

  // Sync a Search verse into the Bible Studio navigator
  const handleSyncSearchVerse = ({
    book,
    chapter,
    verse,
  }: {
    book: string;
    chapter: number;
    verse: number;
  }) => {
    const translationData = bibleData[currentTranslation];
    const canonicalBook =
      translationData?.books?.find(
        (b: any) => b.name?.toLowerCase() === book.toLowerCase(),
      )?.name || book;

    dispatch(setCurrentBook(canonicalBook));
    dispatch(setCurrentChapter(chapter));
    dispatch(setCurrentVerse(verse));
    showNotification(`Navigated to ${canonicalBook} ${chapter}:${verse}`, "success");
  };

  // Get available translations
  const availableTranslations = Object.keys(bibleData);

  // Listen for Control Room toggle events dispatched by Titlebar
  useEffect(() => {
    const handler = (e: Event) => {
      const show = (e as CustomEvent<{ show: boolean }>).detail.show;
      setShowControlRoom(show);
      if (show) setActiveGoogleView(null); // close google views when control room opens
    };
    window.addEventListener("bible-control-room-toggle", handler);
    return () =>
      window.removeEventListener("bible-control-room-toggle", handler);
  }, []);

  // Listen for Google view toggle events dispatched by QuickActionsCard
  useEffect(() => {
    const handler = (e: Event) => {
      const { view } = (
        e as CustomEvent<{ view: "googleAI" | "googleImages" | null }>
      ).detail;
      setActiveGoogleView(view);
      if (view) {
        // Close control room when a google view opens
        setShowControlRoom(false);
        window.dispatchEvent(
          new CustomEvent("bible-control-room-toggle", {
            detail: { show: false },
          }),
        );
      }
    };
    window.addEventListener("bible-google-view", handler);
    return () => window.removeEventListener("bible-google-view", handler);
  }, []);

  // Listen for unified search toggle events
  useEffect(() => {
    const handler = () => {
      setIsLeftSearchOpen((prev) => !prev);
    };
    window.addEventListener("bible-search-toggle", handler);
    return () => window.removeEventListener("bible-search-toggle", handler);
  }, []);

  // Close Control Room and notify Titlebar to sync its indicator
  const handleCloseControlRoom = () => {
    setShowControlRoom(false);
    window.dispatchEvent(
      new CustomEvent("bible-control-room-toggle", { detail: { show: false } }),
    );
  };

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
  }, [onOpenPresentation, handleOpenBookmarks]);

  return (
    <div className="h-full w-full overflow-hidden bg-card-bg flex flex-col">
      {/* Bento Grid Layout */}
      <div className="flex-1 min-h-0 overflow-hidden flex h-full">
        {/* Sidebar card — always at col 1, full height */}
        <div className="w-[280px] flex-shrink-0 h-full bg-card-bg overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            {isLeftSearchOpen ? (
              <motion.div
                key="left-search"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.14 }}
                className="w-full h-full"
              >
                <UnifiedSearchPanel
                  isDarkMode={isDarkMode}
                  onClose={() => setIsLeftSearchOpen(false)}
                  onProjectVerse={handleProjectSearchVerse}
                  onSyncVerse={handleSyncSearchVerse}
                />
              </motion.div>
            ) : (
              <motion.div
                key="left-settings"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.14 }}
                className="w-full h-full"
              >
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
                  bibleBgs={bibleBgs}
                  onOpenSearch={() => setIsLeftSearchOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Right Workspace: Top VersePreviewCard + Bottom (Presets, BooksList, QuickActions) */}
        <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden relative z-10 bg-card-bg">
          {/* Top row: VersePreviewCard with dimmed horizontal dividing border */}
          <div className="h-[55%] w-full flex-shrink-0 border-b border-select-border dark:border-neutral-800 overflow-hidden">
            <VersePreviewCard
              currentBook={currentBook}
              currentChapter={currentChapter}
              currentVerse={currentVerse}
              verseText={currentVerseText}
              isDarkMode={isDarkMode}
              onOpenBookmarks={handleOpenBookmarks}
            />
          </div>

          {/* Bottom row: 3 cards with zero gap, separated by vertical borders hitting the top */}
          <div className="flex-1 min-h-0 grid grid-cols-4 overflow-hidden">
            {/* Card 1: Scripture Presets - 1 column */}
            <div className="col-span-1 h-full overflow-hidden">
              <ScripturePresetsCard
                presets={presets}
                onPresetSelect={handlePresetSelect}
                onPresetDelete={handlePresetDelete}
                isDarkMode={isDarkMode}
                alerts={savedAlerts}
                onAlertDelete={handleRemoveAlert}
                onAlertActivated={setActiveAlertId}
                onHideAlert={handleHideAlert}
                activeAlertId={activeAlertId}
                showNotification={showNotification}
                onAlertEdit={handleEditAlert}
              />
            </div>

            {/* Card 2: Books/Chapters/Verses - 2 columns */}
            <div className="col-span-2 h-full overflow-hidden border-r border-select-border dark:border-neutral-800">
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
            </div>

            {/* Card 3: Quick Actions - 1 column */}
            <div className="col-span-1 h-full overflow-hidden">
              <QuickActionsCard
                isDarkMode={isDarkMode}
                onBookmark={handleBookmark}
                onSavePreset={handleSavePreset}
                onOpenProjection={onOpenPresentation || (() => {})}
                onOpenSearch={handleOpenSearch}
                onOpenBookmarks={handleOpenBookmarks}
                onOpenLibrary={handleOpenLibrary}
                onToggleBlankScreen={handleToggleBlankScreen}
                onToggleProjectionGrayscale={handleToggleProjectionGrayscale}
                onPublishMarquee={handlePublishMarquee}
                hasActiveAlert={!!activeAlertId}
                isBookmarked={isCurrentVerseBookmarked()}
                bookmarksCount={bookmarks.length}
                isProjectionActive={isProjectionActive}
                isBlankScreenMode={isBlankScreenMode}
              />
            </div>
          </div>

          {/* Dynamic overlay — Control Room, Google AI, or Google Images slides in from the right */}
          {(() => {
            const activeDynamicView = showControlRoom
              ? "controlRoom"
              : activeGoogleView;
            return (
              <AnimatePresence>
                {activeDynamicView && (
                  <motion.div
                    key={activeDynamicView}
                    className="absolute inset-0 min-h-0 z-20"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 32,
                      mass: 0.8,
                    }}
                  >
                    {activeDynamicView === "controlRoom" && (
                      <SettingsMenu
                        isOpen={true}
                        onClose={handleCloseControlRoom}
                        inline={true}
                      />
                    )}
                    {activeDynamicView === "googleAI" && (
                      <GoogleAIModePanel
                        isOpen={true}
                        onClose={() => setActiveGoogleView(null)}
                        inline={true}
                      />
                    )}
                    {activeDynamicView === "googleImages" && (
                      <GoogleImagesPanel
                        isOpen={true}
                        onClose={() => setActiveGoogleView(null)}
                        inline={true}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })()}
        </div>
      </div>

      {/* Floating Live Projection Indicator */}
      <LiveProjectionIndicator
        isProjectionActive={isProjectionActive}
        onClose={closeProjection}
        isDarkMode={isDarkMode}
      />

      {/* Alert creation modal */}
      <AlertModal
        visible={alertModalVisibleState}
        onCancel={() => {
          setAlertModalVisible(false);
          setEditingAlertId(null);
        }}
        onSave={handleSaveAlert}
        initialText={editingAlert?.text || ""}
        initialColor={editingAlert?.backgroundColor || "#000000"}
        initialThemeName={editingAlert?.themeName}
        editingAlertId={editingAlertId}
      />

      {/* Toast Notifications */}
      <Toaster
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-left"
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
