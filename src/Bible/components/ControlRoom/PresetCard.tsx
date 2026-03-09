import React, { useState, useEffect } from "react";
import { List, Plus, Search, Filter, Sliders, Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addPreset,
  deletePreset,
  togglePinPreset,
  setActivePreset,
  setProjectedPreset,
  updatePreset,
  Preset,
} from "@/store/slices/appSlice";
import { navigateToVerse } from "@/store/slices/bibleSlice";
import { v4 as uuidv4 } from "uuid";
import { usePresets } from "@/hooks/usePresets";
import { useNotification } from "@/hooks/useNotification";
import { Toaster } from "@/components/Notification";
import { ImagePresetForm } from "./Presets/ImagePresetForm";
import { ScripturePresetForm } from "./Presets/ScripturePresetForm";
import { PresetGrid } from "./Presets/PresetGrid";
import { ImageControlPanel } from "./Presets/ImageControlPanel";
import { EditPresetModal } from "./Presets/EditPresetModal";
import {
  PresetTypeSelector,
  PresetTypeOption,
} from "./Presets/PresetTypeSelector";
import { PresetSettings } from "./Presets/PresetSettings";

interface PresetCardProps {
  bibleBgs: string[];
}

type TabType = "create" | "list" | "settings";

export const PresetCard: React.FC<PresetCardProps> = ({ bibleBgs }) => {
  const dispatch = useAppDispatch();

  // Use the preset hook for file system persistence
  const {
    savePreset: savePresetToFile,
    updatePreset: updatePresetInFile,
    deletePreset: deletePresetFromFile,
  } = usePresets();

  // Use notification hook
  const { toasts, showNotification, dismissToast } = useNotification();

  // Get presets and active preset from Redux
  const presets = useAppSelector((state) => state.app.presets);
  const activePresetId = useAppSelector((state) => state.app.activePreset);
  const projectedPresetId = useAppSelector(
    (state) => state.app.projectedPreset,
  );

  // Get Bible data from Redux for scripture lookup
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );
  const bookList = useAppSelector((state) => state.bible.bookList);
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage,
  );

  // Tab state - show list first if presets exist, otherwise create
  const [activeTab, setActiveTab] = useState<TabType>(
    presets.length > 0 ? "list" : "create",
  );

  // Selected preset type state - null means showing selector
  const [selectedPresetType, setSelectedPresetType] =
    useState<PresetTypeOption | null>(null);

  // State for preset inputs
  const [imagePresetUrl, setImagePresetUrl] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<Preset["type"] | "all">("all");

  // Image control modal state
  const [isImageControlOpen, setIsImageControlOpen] = useState(false);

  // Scripture preset states
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number>(1);
  const [fetchedScriptureText, setFetchedScriptureText] = useState("");

  // Dropdown open states
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<Preset | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".scripture-dropdown")) {
        setIsBookDropdownOpen(false);
        setIsChapterDropdownOpen(false);
        setIsVerseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for projection window closing
  useEffect(() => {
    if (window.api?.onPresetProjectionClosed) {
      const cleanup = window.api.onPresetProjectionClosed(() => {
        dispatch(setProjectedPreset(null));
      });
      return cleanup;
    }
  }, [dispatch]);

  // Fetch scripture text when book/chapter/verse changes
  useEffect(() => {
    if (selectedBook && selectedChapter && selectedVerse) {
      fetchScriptureText();
    }
  }, [selectedBook, selectedChapter, selectedVerse, currentTranslation]);

  const fetchScriptureText = () => {
    try {
      const translation = bibleData[currentTranslation];
      if (!translation) {
        setFetchedScriptureText("");
        return;
      }

      const book = translation.books?.find((b: any) => b.name === selectedBook);
      if (!book) {
        setFetchedScriptureText("");
        return;
      }

      const chapter = book.chapters?.find(
        (c: any) => c.chapter === selectedChapter,
      );
      if (!chapter) {
        setFetchedScriptureText("");
        return;
      }

      const verse = chapter.verses?.find((v: any) => v.verse === selectedVerse);
      if (verse) {
        setFetchedScriptureText(verse.text);
      } else {
        setFetchedScriptureText("");
      }
    } catch (error) {
      console.error("Error fetching scripture:", error);
      setFetchedScriptureText("");
    }
  };

  // Get chapters for selected book
  const getChaptersForBook = () => {
    if (!selectedBook) return [];
    const translation = bibleData[currentTranslation];
    if (!translation) return [];
    const book = translation.books?.find((b: any) => b.name === selectedBook);
    return book?.chapters?.map((c: any) => c.chapter) || [];
  };

  // Get verses for selected chapter
  const getVersesForChapter = () => {
    if (!selectedBook || !selectedChapter) return [];
    const translation = bibleData[currentTranslation];
    if (!translation) return [];
    const book = translation.books?.find((b: any) => b.name === selectedBook);
    const chapter = book?.chapters?.find(
      (c: any) => c.chapter === selectedChapter,
    );
    return chapter?.verses?.map((v: any) => v.verse) || [];
  };

  const handleSavePreset = async (
    type: "image" | "scripture" | "text",
    name: string,
    data: any,
  ) => {
    try {
      const newPreset: Preset = {
        id: uuidv4(),
        type,
        name,
        data,
        createdAt: Date.now(),
      };

      // Save to file system (usePresets hook will handle adding to Redux)
      const success = await savePresetToFile(newPreset);

      if (success) {
        dispatch(setActivePreset(newPreset.id));
        // Show success notification
        showNotification(`Preset "${name}" created successfully!`, "success");
        setActiveTab("list");
        return newPreset;
      } else {
        throw new Error("Failed to save preset to file system");
      }
    } catch (error) {
      console.error("Failed to save preset:", error);
      showNotification("Failed to create preset. Please try again.", "error");
      throw error;
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      const preset = presets.find((p) => p.id === id);
      const presetName = preset?.name || "Preset";

      // Delete from file system first
      await deletePresetFromFile(id);
      // Then delete from Redux
      dispatch(deletePreset(id));

      // Show success notification
      showNotification(`"${presetName}" deleted successfully!`, "success");
    } catch (error) {
      console.error("Failed to delete preset:", error);
      showNotification("Failed to delete preset. Please try again.", "error");
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return;

      const newPinnedState = !preset.pinned;

      // Toggle pin in Redux
      dispatch(togglePinPreset(id));

      // Update the preset in file system using updatePreset instead of savePreset
      await updatePresetInFile(id, { pinned: newPinnedState });

      // Show notification
      const action = newPinnedState ? "pinned" : "unpinned";
      showNotification(`"${preset.name}" ${action} successfully!`, "success");
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      showNotification(
        "Failed to pin/unpin preset. Please try again.",
        "error",
      );
    }
  };

  const handleEditPreset = (preset: Preset) => {
    setPresetToEdit(preset);
    setIsEditModalOpen(true);
  };

  const handleUpdatePreset = async (updatedData: any) => {
    if (!presetToEdit) return;

    try {
      const updates = {
        data: updatedData,
        name:
          presetToEdit.type === "scripture"
            ? updatedData.reference
            : updatedData.text?.substring(0, 20) + "..." || presetToEdit.name,
      };

      // Update in Redux
      dispatch(
        updatePreset({
          id: presetToEdit.id,
          updates,
        }),
      );

      // Update in file system
      await updatePresetInFile(presetToEdit.id, updates);

      // Show success notification
      showNotification(
        `Preset "${presetToEdit.name}" updated successfully!`,
        "success",
      );

      setIsEditModalOpen(false);
      setPresetToEdit(null);
    } catch (error) {
      console.error("Failed to update preset:", error);
      showNotification("Failed to update preset. Please try again.", "error");
    }
  };

  const handleLoadPreset = async (preset: Preset) => {
    try {
      dispatch(setActivePreset(preset.id));
      dispatch(setProjectedPreset(preset.id));

      // Wait for redux-persist to flush to localStorage
      // This ensures the preset is available in the projection window
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update local state based on preset type
      if (preset.type === "image") {
        setSelectedImages(preset.data.images || []);
      } else if (preset.type === "scripture") {
        // Parse the reference to set book, chapter, verse
        const reference = preset.data.reference || "";
        const parts = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (parts) {
          setSelectedBook(parts[1]);
          setSelectedChapter(parseInt(parts[2]));
          setSelectedVerse(parseInt(parts[3]));

          dispatch(
            navigateToVerse({
              book: parts[1],
              chapter: parseInt(parts[2]),
              verse: parseInt(parts[3]),
            }),
          );
        }
        setFetchedScriptureText(preset.data.text || "");
      }

      // Project the preset to external display
      projectPreset(preset);

      // Show success notification
      showNotification(`Projecting "${preset.name}"`, "success");

      // setActiveTab("create");
    } catch (error) {
      console.error("Failed to load preset:", error);
      showNotification("Failed to project preset. Please try again.", "error");
    }
  };

  const projectPreset = (preset: Preset) => {
    if (typeof window !== "undefined" && window.api) {
      try {
        window.api.createPresentationWindow({
          presetId: preset.id,
          presetType: preset.type,
          presetName: preset.name,
          presetData: preset.data, // Include full preset data
        });
      } catch (error) {
        console.error("Failed to project preset:", error);
      }
    }
  };

  const activePreset = presets.find((p) => p.id === activePresetId);
  const projectedPreset = presets.find((p) => p.id === projectedPresetId);

  // Only show controls if there's a projected preset and it's an image type
  const shouldShowImageControls =
    projectedPreset && projectedPreset.type === "image";

  return (
    <div className="rounded-xl p-4 border border-card-bg-alt shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Preset Manager</h3>
        </div>

        {/* Tab Toggle with Search & Filter */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-select-bg rounded-full p-1">
            <div
              onClick={() => setActiveTab("create")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-btn-active-from to-btn-active-to text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Create
            </div>
            <div
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                activeTab === "list"
                  ? "bg-gradient-to-r from-btn-active-from to-btn-active-to text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <List className="w-3 h-3 inline mr-1" />
              List{" "}
              <span className="p-1 bg-card-bg rounded-full">{presets.length}</span>
            </div>
            <div
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-gradient-to-r from-btn-active-from to-btn-active-to text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Preset Settings"
            >
              <Settings className="w-3 h-3" />
            </div>
          </div>

          {/* Search & Filter (only visible on List tab) */}
          {activeTab === "list" && (
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 pl-8 pr-8 py-1.5 text-sm rounded-full bg-card-bg text-text-primary placeholder-text-secondary focus:outline-none border-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <span className="text-sm">×</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as Preset["type"] | "all")
                  }
                  className="pl-8 pr-8 py-1.5 text-sm rounded-full bg-card-bg text-text-primary focus:outline-none appearance-none cursor-pointer border-none"
                >
                  <option value="all">All</option>
                  <option value="scripture">Scripture</option>
                  <option value="image">Image</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "create" ? (
        <>
          {/* Show type selector if no type selected, otherwise show the form */}
          {!selectedPresetType ? (
            <PresetTypeSelector
              onSelectType={(type) => setSelectedPresetType(type)}
            />
          ) : (
            <div className="h-full relative overflow-y-auto no-scrollbar">
              {/* Back button */}
              <div
                onClick={() => setSelectedPresetType(null)}
                className="mb-4 px-4 py-2 cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to preset types
              </div>

              {/* Show the selected form */}
              {selectedPresetType === "image" && (
                <ImagePresetForm
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  onSave={() =>
                    handleSavePreset(
                      "image",
                      `Image Preset (${selectedImages.length})`,
                      {
                        images: selectedImages,
                        count: selectedImages.length,
                      },
                    )
                  }
                />
              )}

              {selectedPresetType === "scripture" && (
                <ScripturePresetForm
                  selectedBook={selectedBook}
                  selectedChapter={selectedChapter}
                  selectedVerse={selectedVerse}
                  fetchedScriptureText={fetchedScriptureText}
                  bookList={bookList}
                  isBookDropdownOpen={isBookDropdownOpen}
                  isChapterDropdownOpen={isChapterDropdownOpen}
                  isVerseDropdownOpen={isVerseDropdownOpen}
                  setSelectedBook={setSelectedBook}
                  setSelectedChapter={setSelectedChapter}
                  setSelectedVerse={setSelectedVerse}
                  setIsBookDropdownOpen={setIsBookDropdownOpen}
                  setIsChapterDropdownOpen={setIsChapterDropdownOpen}
                  setIsVerseDropdownOpen={setIsVerseDropdownOpen}
                  getChaptersForBook={getChaptersForBook}
                  getVersesForChapter={getVersesForChapter}
                  onSave={(fontSettings) => {
                    const reference = `${selectedBook} ${selectedChapter}:${selectedVerse}`;
                    const presetData: any = {
                      reference,
                      text: fetchedScriptureText,
                      book: selectedBook,
                      chapter: selectedChapter,
                      verse: selectedVerse,
                      fontSize: fontSettings.fontSize,
                      fontFamily: fontSettings.fontFamily,
                    };

                    // Add video background if provided (takes priority)
                    if (fontSettings.videoBackground) {
                      presetData.videoBackground = fontSettings.videoBackground;
                    }
                    // Add image background if provided (and no video)
                    else if (fontSettings.backgroundImage) {
                      presetData.backgroundImage = fontSettings.backgroundImage;
                    }
                    // Default background if neither is provided
                    else {
                      presetData.backgroundImage = "./paint-sweeps-gold.jpg";
                    }

                    handleSavePreset("scripture", reference, presetData);
                  }}
                />
              )}
            </div>
          )}

          {/* Active Preset Indicator */}
          {/* {activePreset && (
            <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-[#313131]/20 to-[#313131]/20 dark:from-[#313131]/30 dark:to-[#313131]/30 border border-[#313131]/50 dark:border-[#313131]/60 backdrop-blur-sm">
              <p className="text-sm text-[#313131] dark:text-[#f9fafb] text-center font-medium">
                <span className="font-bold">
                  {activePreset.type === "image" && "Image"}
                  {activePreset.type === "scripture" && "Scripture"}
                </span>{" "}
                preset ready to project
              </p>
            </div>
          )} */}
        </>
      ) : activeTab === "list" ? (
        <>
          {/* Preset List View - Compact Card Grid */}
          <PresetGrid
            presets={presets}
            activePresetId={activePresetId}
            projectionBackgroundImage={projectionBackgroundImage}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onEditPreset={handleEditPreset}
            onTogglePin={handleTogglePin}
            searchQuery={searchQuery}
            filterType={filterType}
          />

          {/* Floating Image Control Icon with Tooltip - Only show when image is projected */}
          {shouldShowImageControls && (
            <div className="fixed bottom-6 right-6 z-40 group">
              {/* Tooltip Bubble - Always visible */}
              <div className="absolute bottom-full right-0 mb-2 animate-bounce">
                <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  Control projected image
                  {/* Arrow pointing down */}
                  <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>

              {/* Floating Button */}
              <button
                onClick={() => setIsImageControlOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-btn-active-from to-btn-active-to hover:opacity-90 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300"
              >
                <Sliders className="w-6 h-6 text-white" />
              </button>
            </div>
          )}

          {/* Image Control Modal */}
          <ImageControlPanel
            isActive={!!shouldShowImageControls}
            isOpen={isImageControlOpen}
            onClose={() => setIsImageControlOpen(false)}
          />
        </>
      ) : (
        <>
          {/* Preset Settings View */}
          <PresetSettings />
        </>
      )}

      {/* Edit Preset Modal */}
      <EditPresetModal
        preset={presetToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setPresetToEdit(null);
        }}
        onSave={handleUpdatePreset}
        bookList={bookList}
        projectionBackgroundImage={projectionBackgroundImage}
        getChaptersForBook={getChaptersForBook}
        getVersesForChapter={getVersesForChapter}
        bibleBgs={bibleBgs}
      />

      {/* Toast Notifications */}
      <Toaster toasts={toasts} onDismiss={dismissToast} position="top-center" />
    </div>
  );
};
