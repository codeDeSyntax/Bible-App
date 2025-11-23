import React, { useState, useEffect } from "react";
import { List, Plus, Search, Filter, Sliders } from "lucide-react";
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
import {
  navigateToVerse,
  setVerseByVerseMode,
} from "@/store/slices/bibleSlice";
import { v4 as uuidv4 } from "uuid";
import { usePresets } from "@/hooks/usePresets";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { ImagePresetForm } from "./Presets/ImagePresetForm";
import { ScripturePresetForm } from "./Presets/ScripturePresetForm";
import { TextPresetForm } from "./Presets/TextPresetForm";
import { SermonPresetForm } from "./Presets/SermonPresetForm";
import { PresetGrid } from "./Presets/PresetGrid";
import { ImageControlPanel } from "./Presets/ImageControlPanel";
import { EditPresetModal } from "./Presets/EditPresetModal";

interface PresetCardProps {
  bibleBgs: string[];
}

type TabType = "create" | "list";

export const PresetCard: React.FC<PresetCardProps> = ({ bibleBgs }) => {
  const dispatch = useAppDispatch();

  // Use the preset hook for file system persistence
  const {
    savePreset: savePresetToFile,
    updatePreset: updatePresetInFile,
    deletePreset: deletePresetFromFile,
  } = usePresets();

  // Use notification hook
  const { notification, showNotification } = useNotification();

  // Get presets and active preset from Redux
  const presets = useAppSelector((state) => state.app.presets);
  const activePresetId = useAppSelector((state) => state.app.activePreset);
  const projectedPresetId = useAppSelector(
    (state) => state.app.projectedPreset
  );

  // Get Bible data from Redux for scripture lookup
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const bookList = useAppSelector((state) => state.bible.bookList);
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage
  );

  // Tab state - show list first if presets exist, otherwise create
  const [activeTab, setActiveTab] = useState<TabType>(
    presets.length > 0 ? "list" : "create"
  );

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

  const [randomText, setRandomText] = useState("");

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
        console.log("🔴 Projection window closed, clearing projected preset");
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
        (c: any) => c.chapter === selectedChapter
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
      (c: any) => c.chapter === selectedChapter
    );
    return chapter?.verses?.map((v: any) => v.verse) || [];
  };

  const handleSavePreset = async (
    type: "image" | "scripture" | "text" | "sermon",
    name: string,
    data: any
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

      // Toggle pin in Redux
      dispatch(togglePinPreset(id));

      // Update the preset in file system
      const updatedPreset = { ...preset, pinned: !preset.pinned };
      await savePresetToFile(updatedPreset);

      // Show notification
      const action = updatedPreset.pinned ? "pinned" : "unpinned";
      showNotification(`"${preset.name}" ${action} successfully!`, "success");
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      showNotification(
        "Failed to pin/unpin preset. Please try again.",
        "error"
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
        })
      );

      // Update in file system
      await updatePresetInFile(presetToEdit.id, updates);

      // Show success notification
      showNotification(
        `Preset "${presetToEdit.name}" updated successfully!`,
        "success"
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

          // Navigate to the verse in verse-by-verse view
          console.log(
            "📖 Navigating to scripture:",
            parts[1],
            parseInt(parts[2]),
            parseInt(parts[3])
          );
          dispatch(
            navigateToVerse({
              book: parts[1],
              chapter: parseInt(parts[2]),
              verse: parseInt(parts[3]),
            })
          );

          // Enable verse-by-verse mode to show the scripture
          dispatch(setVerseByVerseMode(true));
        }
        setFetchedScriptureText(preset.data.text || "");
      } else if (preset.type === "text") {
        setRandomText(preset.data.text || "");
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
        console.log("🚀 Projecting preset:", preset.name, preset.type);

        // All presets now use the universal presentation window
        window.api.createPresentationWindow({
          presetId: preset.id,
          presetType: preset.type,
          presetName: preset.name,
          presetData: preset.data, // Include full preset data
        });
      } catch (error) {
        console.error("❌ Failed to project preset:", error);
      }
    } else {
      console.error("❌ Window API not available");
    }
  };

  const activePreset = presets.find((p) => p.id === activePresetId);
  const projectedPreset = presets.find((p) => p.id === projectedPresetId);

  // Only show controls if there's a projected preset and it's an image type
  const shouldShowImageControls =
    projectedPreset && projectedPreset.type === "image";

  return (
    <div className="rounded-2xl p-4 h-[80vh] border-none border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Preset Manager
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Create presets to project images, scripture, or custom text
            </p>
          </div>
        </div>

        {/* Tab Toggle with Search & Filter */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-gray-200 dark:bg-[#0f0c0a] rounded-full p-1">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Create
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === "list"
                  ? "bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <List className="w-3 h-3 inline mr-1" />
              List ({presets.length})
            </button>
          </div>

          {/* Search & Filter (only visible on List tab) */}
          {activeTab === "list" && (
            <div className="flex gap-2 items-center">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 pl-8 pr-8 py-1.5 text-xs rounded-full bg-gray-200 dark:bg-[#0f0c0a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none border-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <span className="text-sm">×</span>
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as Preset["type"] | "all")
                  }
                  className="pl-8 pr-8 py-1.5 text-xs rounded-full bg-gray-200 dark:bg-[#0f0c0a] text-gray-900 dark:text-white focus:outline-none appearance-none cursor-pointer border-none"
                >
                  <option value="all">All</option>
                  <option value="text">Text</option>
                  <option value="scripture">Scripture</option>
                  <option value="image">Image</option>
                  <option value="sermon">Sermon</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
          {/* Four Preset Type Cards in 2x2 Grid */}
          <div className="grid h-[25rem] overflow-auto no-scrollbar grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Image Preset */}
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
                  }
                )
              }
            />

            {/* Scripture Preset */}
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
                handleSavePreset("scripture", reference, {
                  reference,
                  text: fetchedScriptureText,
                  book: selectedBook,
                  chapter: selectedChapter,
                  verse: selectedVerse,
                  backgroundImage:
                    (fontSettings as any)?.backgroundImage ||
                    "./paint-sweeps-gold.jpg",
                  fontSize: fontSettings.fontSize,
                  fontFamily: fontSettings.fontFamily,
                });
              }}
            />

            {/* Random Text Preset */}
            <TextPresetForm
              randomText={randomText}
              setRandomText={setRandomText}
              projectionBackgroundImage={projectionBackgroundImage}
              onSave={(styleData: any) =>
                handleSavePreset("text", randomText.substring(0, 20) + "...", {
                  ...styleData,
                })
              }
            />

            {/* Sermon Details Preset */}
            <SermonPresetForm
              onSave={(sermonData) =>
                handleSavePreset("sermon", sermonData.title, {
                  title: sermonData.title,
                  subtitle: sermonData.subtitle,
                  preacher: sermonData.preacher,
                  date: sermonData.date,
                  scriptures: sermonData.scriptures,
                  quotes: sermonData.quotes,
                })
              }
            />
          </div>

          {/* Active Preset Indicator */}
          {/* {activePreset && (
            <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-[#313131]/20 to-[#313131]/20 dark:from-[#313131]/30 dark:to-[#313131]/30 border border-[#313131]/50 dark:border-[#313131]/60 backdrop-blur-sm">
              <p className="text-xs text-[#313131] dark:text-[#f9fafb] text-center font-medium">
                <span className="font-bold">
                  {activePreset.type === "image" && "Image"}
                  {activePreset.type === "scripture" && "Scripture"}
                  {activePreset.type === "text" && "Custom Text"}
                </span>{" "}
                preset ready to project
              </p>
            </div>
          )} */}
        </>
      ) : (
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
                <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  Control projected image
                  {/* Arrow pointing down */}
                  <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>

              {/* Floating Button */}
              <button
                onClick={() => setIsImageControlOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#313131] to-[#303030] hover:from-[#303030] hover:to-[#6b4931] shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300"
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

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
      />
    </div>
  );
};
