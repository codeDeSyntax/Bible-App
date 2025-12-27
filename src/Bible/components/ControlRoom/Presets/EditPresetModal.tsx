import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Preset } from "@/store/slices/appSlice";
import { ScripturePresetForm } from "./ScripturePresetForm";
import { ImagePresetForm } from "./ImagePresetForm";

interface Book {
  name: string;
  testament: string;
}

interface EditPresetModalProps {
  preset: Preset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  // Scripture-related props
  bookList?: Book[];
  projectionBackgroundImage?: string;
  getChaptersForBook?: () => number[];
  getVersesForChapter?: () => number[];
  // Image-related props
  bibleBgs?: string[];
}

export const EditPresetModal: React.FC<EditPresetModalProps> = ({
  preset,
  isOpen,
  onClose,
  onSave,
  bookList = [],
  projectionBackgroundImage = "",
  getChaptersForBook,
  getVersesForChapter,
  bibleBgs = [],
}) => {
  // Scripture preset states
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number>(1);
  const [fetchedScriptureText, setFetchedScriptureText] = useState("");
  const [initialFontSize, setInitialFontSize] = useState<number>(48);
  const [initialFontFamily, setInitialFontFamily] = useState<string>(
    "Montserrat, sans-serif"
  );

  // Image preset state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Dropdown states for scripture
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);

  // Load preset data when modal opens
  useEffect(() => {
    if (preset && isOpen) {
      if (preset.type === "scripture") {
        setSelectedBook(preset.data.book || "");
        setSelectedChapter(preset.data.chapter || 1);
        setSelectedVerse(preset.data.verse || 1);
        setFetchedScriptureText(preset.data.text || "");
        setInitialFontSize(preset.data.fontSize || 48);
        setInitialFontFamily(
          preset.data.fontFamily || "Montserrat, sans-serif"
        );
      } else if (preset.type === "image") {
        setSelectedImages(preset.data.images || []);
      }
    }
  }, [preset, isOpen]);

  if (!isOpen || !preset) return null;

  const handleSave = (data: any) => {
    onSave(data);
    onClose();
  };

  // Default functions for scripture if not provided
  const defaultGetChaptersForBook = () => {
    return Array.from({ length: 50 }, (_, i) => i + 1);
  };

  const defaultGetVersesForChapter = () => {
    return Array.from({ length: 50 }, (_, i) => i + 1);
  };

  return (
    <div>
      {/* Backdrop */}
      <div
        className="absolute inset-0 rounded-xl bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-20 -bottom-10 inset-0 flex items-center justify-center z-[9999] pointer-events-none p-2">
        <div className="bg-card-bg rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto shadow-2xl border border-card-bg-alt">
          {/* Header */}
          <div className="flex items-center justify-between px-6  border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Edit{" "}
                {preset.type.charAt(0).toUpperCase() + preset.type.slice(1)}{" "}
                Preset
              </h2>
              <p className="text-sm text-text-secondary mt-1">{preset.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-select-hover rounded-full transition-colors"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-4 overflow-y-auto max-h-[calc(90vh)]">
            {preset.type === "scripture" ? (
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
                getChaptersForBook={
                  getChaptersForBook || defaultGetChaptersForBook
                }
                getVersesForChapter={
                  getVersesForChapter || defaultGetVersesForChapter
                }
                initialFontSize={initialFontSize}
                initialFontFamily={initialFontFamily}
                initialBackgroundImage={preset.data.backgroundImage}
                initialVideoBackground={preset.data.videoBackground}
                onSave={(formData) => {
                  const reference = `${selectedBook} ${selectedChapter}:${selectedVerse}`;
                  handleSave({
                    reference,
                    text: fetchedScriptureText,
                    book: selectedBook,
                    chapter: selectedChapter,
                    verse: selectedVerse,
                    backgroundImage: formData.backgroundImage,
                    videoBackground: formData.videoBackground,
                    fontSize: formData.fontSize,
                    fontFamily: formData.fontFamily,
                  });
                }}
              />
            ) : preset.type === "image" ? (
              <ImagePresetForm
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                onSave={() => {
                  handleSave({
                    images: selectedImages,
                    count: selectedImages.length,
                  });
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
