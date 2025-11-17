import React, { useState, useEffect } from "react";
import { List, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addPreset,
  deletePreset,
  setActivePreset,
  setProjectedPreset,
  Preset,
} from "@/store/slices/appSlice";
import { v4 as uuidv4 } from "uuid";
import { ImagePresetForm } from "./Presets/ImagePresetForm";
import { ScripturePresetForm } from "./Presets/ScripturePresetForm";
import { TextPresetForm } from "./Presets/TextPresetForm";
import { PresetGrid } from "./Presets/PresetGrid";
import { ImageControlPanel } from "./Presets/ImageControlPanel";

interface PresetCardProps {
  bibleBgs: string[];
}

type TabType = "create" | "list";

export const PresetCard: React.FC<PresetCardProps> = ({ bibleBgs }) => {
  const dispatch = useAppDispatch();

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
    type: "image" | "scripture" | "text",
    name: string,
    data: any
  ) => {
    const newPreset: Preset = {
      id: uuidv4(),
      type,
      name,
      data,
      createdAt: Date.now(),
    };
    dispatch(addPreset(newPreset));
    dispatch(setActivePreset(newPreset.id));

    // Wait for redux-persist to write to localStorage
    await new Promise((resolve) => setTimeout(resolve, 150));

    setActiveTab("list");
    return newPreset;
  };

  const handleDeletePreset = (id: string) => {
    dispatch(deletePreset(id));
  };

  const handleLoadPreset = async (preset: Preset) => {
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
      }
      setFetchedScriptureText(preset.data.text || "");
    } else if (preset.type === "text") {
      setRandomText(preset.data.text || "");
    }

    // Project the preset to external display
    projectPreset(preset);

    // setActiveTab("create");
  };

  const projectPreset = (preset: Preset) => {
    if (typeof window !== "undefined" && window.api) {
      try {
        console.log("🚀 Projecting preset:", preset.name, preset.type);

        // For scripture presets, use the Bible presentation window
        if (preset.type === "scripture") {
          const scriptureData = preset.data as {
            book: string;
            chapter: number;
            verse: number;
            text: string;
            reference: string;
            backgroundImage?: string;
          };
          console.log(
            "📖 Opening Bible presentation for:",
            scriptureData.book,
            scriptureData.chapter,
            scriptureData.verse
          );

          // Get the full chapter data from bibleData
          const translation = bibleData[currentTranslation];
          if (!translation) {
            console.error("Translation not found");
            return;
          }

          const bookData = translation.books?.find(
            (b: any) => b.name === scriptureData.book
          );
          if (!bookData) {
            console.error("Book not found");
            return;
          }

          const chapterData = bookData.chapters?.find(
            (ch: any) => ch.chapter === scriptureData.chapter
          );
          if (!chapterData?.verses) {
            console.error("Chapter data not found");
            return;
          }

          // Prepare presentation data in the format expected by createBiblePresentationWindow
          const presentationData = {
            book: scriptureData.book,
            chapter: scriptureData.chapter,
            verses: chapterData.verses,
            translation: currentTranslation,
            selectedVerse: scriptureData.verse,
          };

          const settings = {
            fontSize: 6,
            textColor: "#ffffff",
            backgroundColor: "#1e293b",
            versesPerSlide: 1,
          };

          window.api.createBiblePresentationWindow({
            presentationData,
            settings,
          });
        } else {
          // For image, text, default, and promise presets, use the universal presentation window
          // Pass the full preset data to avoid sync issues
          window.api.createPresentationWindow({
            presetId: preset.id,
            presetType: preset.type,
            presetName: preset.name,
            presetData: preset.data, // Include full preset data
          });
        }
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
    <div className="bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
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

        {/* Tab Toggle */}
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
      </div>

      {/* Tab Content */}
      {activeTab === "create" ? (
        <>
          {/* Three Preset Type Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
              onSave={() => {
                const reference = `${selectedBook} ${selectedChapter}:${selectedVerse}`;
                handleSavePreset("scripture", reference, {
                  reference,
                  text: fetchedScriptureText,
                  book: selectedBook,
                  chapter: selectedChapter,
                  verse: selectedVerse,
                  backgroundImage: projectionBackgroundImage,
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
          </div>

          {/* Active Preset Indicator */}
          {activePreset && (
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
          )}

          {/* Image Control Panel - Only show when image is projected */}
          {shouldShowImageControls && <ImageControlPanel isActive={true} />}
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
          />

          {/* Image Control Panel in List View - Only show when image is projected */}
          {shouldShowImageControls && <ImageControlPanel isActive={true} />}
        </>
      )}
    </div>
  );
};
