import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Preset } from "@/store/slices/appSlice";
import { ScripturePresetForm } from "./ScripturePresetForm";
import { TextPresetForm } from "./TextPresetForm";
import { ImagePresetForm } from "./ImagePresetForm";
import { SermonPresetForm } from "./SermonPresetForm";

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

  // Text preset state
  const [randomText, setRandomText] = useState("");
  const [initialTextData, setInitialTextData] = useState<any>(null);

  // Image preset state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Sermon preset state
  const [sermonTitle, setSermonTitle] = useState("");
  const [sermonSubtitle, setSermonSubtitle] = useState("");
  const [sermonPreacher, setSermonPreacher] = useState("");
  const [sermonDate, setSermonDate] = useState("");
  const [sermonScriptures, setSermonScriptures] = useState<string[]>([""]);
  const [sermonQuotes, setSermonQuotes] = useState<string[]>([""]);

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
      } else if (preset.type === "text") {
        setRandomText(preset.data.text || "");
        // Store all the initial text preset data for prefilling
        setInitialTextData({
          presetType: preset.data.presetType || "simple",
          fontSize: preset.data.fontSize || 32,
          fontFamily: preset.data.fontFamily || "Arial",
          textAlign: preset.data.textAlign || "center",
          textColor: preset.data.textColor || "#ffffff",
          backgroundColor: preset.data.backgroundColor || "#000000",
          backgroundImage: preset.data.backgroundImage || "",
          enableConfetti: preset.data.enableConfetti || false,
          listItems: preset.data.listItems || [""],
          quoteText: preset.data.quoteText || "",
          author: preset.data.author || "",
          title: preset.data.title || "",
          subtitle: preset.data.subtitle || "",
          announcementTitle: preset.data.announcementTitle || "",
          announcementMessage: preset.data.announcementMessage || "",
        });
      } else if (preset.type === "image") {
        setSelectedImages(preset.data.images || []);
      } else if (preset.type === "sermon") {
        setSermonTitle(preset.data.title || "");
        setSermonSubtitle(preset.data.subtitle || "");
        setSermonPreacher(preset.data.preacher || "");
        setSermonDate(preset.data.date || "");
        setSermonScriptures(preset.data.scriptures || [""]);
        setSermonQuotes(preset.data.quotes || [""]);
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit{" "}
                {preset.type.charAt(0).toUpperCase() + preset.type.slice(1)}{" "}
                Preset
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {preset.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
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
                onSave={(fontSettings) => {
                  const reference = `${selectedBook} ${selectedChapter}:${selectedVerse}`;
                  handleSave({
                    reference,
                    text: fetchedScriptureText,
                    book: selectedBook,
                    chapter: selectedChapter,
                    verse: selectedVerse,
                    backgroundImage:
                      preset.data.backgroundImage || "./paint-sweeps-gold.jpg",
                    fontSize: fontSettings.fontSize,
                    fontFamily: fontSettings.fontFamily,
                  });
                }}
              />
            ) : preset.type === "text" ? (
              <TextPresetForm
                randomText={randomText}
                setRandomText={setRandomText}
                projectionBackgroundImage={projectionBackgroundImage}
                initialValues={initialTextData}
                onSave={(styleData: any) => handleSave(styleData)}
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
            ) : preset.type === "sermon" ? (
              <SermonPresetForm
                initialValues={{
                  title: sermonTitle,
                  subtitle: sermonSubtitle,
                  preacher: sermonPreacher,
                  date: sermonDate,
                  scriptures: sermonScriptures,
                  quotes: sermonQuotes,
                }}
                onSave={(sermonData) => handleSave(sermonData)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};
