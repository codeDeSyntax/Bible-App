import React, { useState, useEffect } from "react";
import { Type, FolderOpen, X } from "lucide-react";
import {
  SimpleTextInput,
  ListInput,
  QuoteInput,
  TitleInput,
  AnnouncementInput,
  TextPresetType,
  TextPresetData,
  isFormValid,
  prepareTextData,
} from "./TextPreset";

interface TextPresetFormProps {
  randomText: string;
  setRandomText: (text: string) => void;
  projectionBackgroundImage: string;
  onSave: (data: TextPresetData) => void;
  // Optional initial values for edit mode
  initialValues?: {
    presetType?: TextPresetType;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: "left" | "center" | "right";
    textColor?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    enableConfetti?: boolean;
    listItems?: string[];
    quoteText?: string;
    author?: string;
    title?: string;
    subtitle?: string;
    announcementTitle?: string;
    announcementMessage?: string;
  };
}

const TEXT_PRESET_STORAGE_KEY = "textPreset_selectedDirectory";

export const TextPresetForm: React.FC<TextPresetFormProps> = ({
  randomText,
  setRandomText,
  projectionBackgroundImage,
  onSave,
  initialValues,
}) => {
  const [presetType, setPresetType] = useState<TextPresetType>(
    initialValues?.presetType || "simple"
  );
  const [fontSize, setFontSize] = useState<number>(
    initialValues?.fontSize || 32
  );
  const [fontFamily, setFontFamily] = useState<string>(
    initialValues?.fontFamily || "Arial"
  );
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    initialValues?.textAlign || "center"
  );
  const [textColor, setTextColor] = useState<string>(
    initialValues?.textColor || "#ffffff"
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    initialValues?.backgroundColor || "#000000"
  );
  const [useBackgroundImage, setUseBackgroundImage] = useState<boolean>(
    !!initialValues?.backgroundImage
  );
  const [enableConfetti, setEnableConfetti] = useState<boolean>(
    initialValues?.enableConfetti || false
  );
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] =
    useState<string>(initialValues?.backgroundImage || "");

  // List type states
  const [listItems, setListItems] = useState<string[]>(
    initialValues?.listItems || [""]
  );

  // Quote type states
  const [quoteText, setQuoteText] = useState<string>(
    initialValues?.quoteText || ""
  );
  const [author, setAuthor] = useState<string>(initialValues?.author || "");

  // Title type states
  const [titleText, setTitleText] = useState<string>(
    initialValues?.title || ""
  );
  const [subtitle, setSubtitle] = useState<string>(
    initialValues?.subtitle || ""
  );

  // Announcement type states
  const [announcementTitle, setAnnouncementTitle] = useState<string>(
    initialValues?.announcementTitle || ""
  );
  const [announcementText, setAnnouncementText] = useState<string>(
    initialValues?.announcementMessage || ""
  );

  const [fontOptions, setFontOptions] = useState<string[]>([
    "Arial",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
  ]);
  const [fontSearchQuery, setFontSearchQuery] = useState<string>("");
  const [loadingFonts, setLoadingFonts] = useState<boolean>(true);

  // Load system fonts on mount
  useEffect(() => {
    const loadSystemFonts = async () => {
      if (typeof window !== "undefined" && window.api?.getSystemFonts) {
        try {
          setLoadingFonts(true);
          const fonts = await window.api.getSystemFonts();
          setFontOptions(fonts);
        } catch (error) {
          console.error("Failed to load system fonts:", error);
          // Keep default fonts on error
        } finally {
          setLoadingFonts(false);
        }
      } else {
        setLoadingFonts(false);
      }
    };
    loadSystemFonts();
  }, []);

  // Load saved directory on mount
  useEffect(() => {
    const loadSavedDirectory = async () => {
      const savedDirectory = localStorage.getItem(TEXT_PRESET_STORAGE_KEY);
      if (savedDirectory && typeof window !== "undefined" && window.api) {
        try {
          const imageFiles = await window.api.getImages(savedDirectory);
          setSelectedDirectory(savedDirectory);
          setAvailableImages(imageFiles);
        } catch (error) {
          console.error("Failed to load saved directory:", error);
        }
      }
    };
    loadSavedDirectory();
  }, []);

  const handleSelectDirectory = async () => {
    if (typeof window !== "undefined" && window.api) {
      try {
        const directory = await window.api.selectDirectory();
        if (directory) {
          const imageFiles = await window.api.getImages(directory);
          setSelectedDirectory(directory);
          setAvailableImages(imageFiles);
          setSelectedBackgroundImage("");
          localStorage.setItem(TEXT_PRESET_STORAGE_KEY, directory);
        }
      } catch (error) {
        console.error("Failed to select directory:", error);
      }
    }
  };

  const handleImageSelect = (image: string) => {
    setSelectedBackgroundImage(image);
    setUseBackgroundImage(true);
  };

  const handleClearImage = () => {
    setSelectedBackgroundImage("");
    setUseBackgroundImage(false);
  };

  return (
    <div className="bg-stone-50 h-[25rem] overflow-y-auto no-scrollbar dark:bg-[#1c1c1c] rounded-lg p-4 border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center shadow-md">
          <Type className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#313131] dark:text-[#f9fafb]">
          Text Preset
        </h4>
      </div>

      <div className="space-y-3">
        {/* Preset Type Selector */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
            Preset Type
          </label>
          <select
            value={presetType}
            onChange={(e) => setPresetType(e.target.value as TextPresetType)}
            className="w-full px-2 py-2 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
          >
            <option value="simple">Simple Text</option>
            <option value="list">List</option>
            <option value="quote">Quote</option>
            <option value="title">Title (with Subtitle)</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>

        {/* Conditional Inputs Based on Preset Type */}
        {presetType === "simple" && (
          <SimpleTextInput value={randomText} onChange={setRandomText} />
        )}

        {presetType === "list" && (
          <ListInput items={listItems} onChange={setListItems} />
        )}

        {presetType === "quote" && (
          <QuoteInput
            quoteText={quoteText}
            author={author}
            onQuoteChange={setQuoteText}
            onAuthorChange={setAuthor}
          />
        )}

        {presetType === "title" && (
          <TitleInput
            title={titleText}
            subtitle={subtitle}
            onTitleChange={setTitleText}
            onSubtitleChange={setSubtitle}
          />
        )}

        {presetType === "announcement" && (
          <AnnouncementInput
            title={announcementTitle}
            message={announcementText}
            onTitleChange={setAnnouncementTitle}
            onMessageChange={setAnnouncementText}
          />
        )}

        {/* Text Input */}
        <div style={{ display: "none" }}>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
            Custom Text
          </label>
          <textarea
            value={randomText}
            onChange={(e) => setRandomText(e.target.value)}
            placeholder="Enter any text to display..."
            rows={3}
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] resize-none transition-colors"
          />
        </div>

        {/* Font Settings - Two Column Layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Font Size */}
          <div>
            <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 flex justify-between">
              <span>Font Size</span>
              <span className="font-semibold">{fontSize}px</span>
            </label>
            <input
              type="range"
              min="16"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-1 bg-stone-300 dark:bg-stone-600 rounded-lg appearance-none cursor-pointer accent-[#313131] dark:accent-[#b8835a]"
            />
          </div>
        </div>

        {/* Font Search (Expandable) */}
        {!loadingFonts && fontOptions.length > 0 && (
          <details className="group">
            <summary className="text-xs text-stone-500 dark:text-stone-400 cursor-pointer hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1">
              <span className="transform group-open:rotate-90 transition-transform">
                ▶
              </span>
              <span>Search all {fontOptions.length} fonts</span>
            </summary>
            <div className="mt-2 space-y-1">
              <input
                type="text"
                placeholder="Search fonts..."
                value={fontSearchQuery}
                onChange={(e) => setFontSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
              />
              <div className="max-h-32 overflow-y-auto bg-white dark:bg-[#2d2d2d] rounded-lg border border-stone-200 dark:border-stone-700">
                {fontOptions
                  .filter((font) =>
                    font.toLowerCase().includes(fontSearchQuery.toLowerCase())
                  )
                  .map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setFontFamily(font)}
                      className={`w-full px-2 py-1.5 text-xs text-left hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${
                        fontFamily === font
                          ? "bg-stone-200 dark:bg-stone-600"
                          : ""
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
              </div>
            </div>
          </details>
        )}

        {/* Colors - Two Column Layout */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-stone-300 dark:border-stone-600"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs rounded bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white border border-stone-300 dark:border-stone-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={useBackgroundImage}
                className="w-8 h-8 rounded cursor-pointer border border-stone-300 dark:border-stone-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={useBackgroundImage}
                className="flex-1 px-2 py-1 text-xs rounded bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white border border-stone-300 dark:border-stone-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Toggles - Two Column Layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Background Image Toggle */}
          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10">
            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Background Image
              </label>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Use custom image
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useBackgroundImage}
                onChange={(e) => {
                  setUseBackgroundImage(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedBackgroundImage("");
                  }
                }}
                className="sr-only peer"
              />
              <div
                className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                  useBackgroundImage
                    ? "bg-[#313131] dark:bg-[#b8835a]"
                    : "bg-stone-200/50 dark:bg-stone-700/50"
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border border-stone-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                    useBackgroundImage ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Confetti Toggle */}
          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10">
            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Confetti Effect 🎉
              </label>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Show animation
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableConfetti}
                onChange={(e) => setEnableConfetti(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                  enableConfetti
                    ? "bg-[#313131] dark:bg-[#b8835a]"
                    : "bg-stone-200/50 dark:bg-stone-700/50"
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border border-stone-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                    enableConfetti ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Background Image Section */}
        {useBackgroundImage && (
          <div className="space-y-2">
            {/* Select Folder Button - Compact */}
            <button
              onClick={handleSelectDirectory}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-white/80 dark:bg-black/40 text-stone-900 dark:text-white border border-stone-200/50 dark:border-white/10 focus:outline-none transition-all flex items-center justify-center gap-1.5 hover:bg-stone-50 dark:hover:bg-black/60"
            >
              <FolderOpen className="w-3 h-3" />
              <span className="truncate text-xs">
                {selectedDirectory || "Choose folder..."}
              </span>
            </button>

            {/* Available Images - Grid */}
            {availableImages.length > 0 && (
              <div className="max-h-24 overflow-y-auto no-scrollbar bg-white/50 dark:bg-black/20 rounded-lg p-1.5">
                <div className="grid grid-cols-3 gap-1.5">
                  {availableImages.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => handleImageSelect(image)}
                      className={`relative rounded overflow-hidden cursor-pointer border-2 transition-all h-12 ${
                        selectedBackgroundImage === image
                          ? "border-[#313131] dark:border-[#b8835a] ring-1 ring-[#313131]/30 dark:ring-[#b8835a]/30"
                          : "border-transparent hover:border-stone-300 dark:hover:border-stone-600"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Bg ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Image Preview - Compact */}
            {selectedBackgroundImage && (
              <div className="relative rounded overflow-hidden group h-16">
                <img
                  src={selectedBackgroundImage}
                  alt="Selected background"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleClearImage}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {randomText && (
          <div className="mt-2 p-3 bg-white/50 h-40 overflow-auto  no-scrollbar dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10 ">
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
              Preview:
            </p>
            <div
              style={{
                fontFamily,
                fontSize: `20px`,
                textAlign,
                color: textColor,
                backgroundColor: backgroundColor,
                padding: "8px",
                borderRadius: "4px",
                wordWrap: "break-word",
              }}
            >
              {randomText}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            const { text, extraData } = prepareTextData(
              presetType,
              randomText,
              listItems,
              quoteText,
              author,
              titleText,
              subtitle,
              announcementTitle,
              announcementText
            );

            onSave({
              text,
              fontSize,
              fontFamily,
              textAlign,
              textColor,
              backgroundColor,
              backgroundImage:
                useBackgroundImage && selectedBackgroundImage
                  ? selectedBackgroundImage
                  : undefined,
              enableConfetti,
              ...extraData,
            });
          }}
          disabled={
            !isFormValid(
              presetType,
              randomText,
              listItems,
              quoteText,
              titleText,
              announcementTitle,
              announcementText
            )
          }
          className="w-full mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] text-white hover:from-[#252525] hover:to-[#202020] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
        >
          Save & Project
        </button>
      </div>
    </div>
  );
};
