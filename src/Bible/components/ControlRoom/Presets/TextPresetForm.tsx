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
import { FontSelector } from "./FontSelector";

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
    videoBackground?: string;
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
  // Priority: video background takes precedence over image background
  const [useBackgroundImage, setUseBackgroundImage] = useState<boolean>(
    !!initialValues?.backgroundImage && !initialValues?.videoBackground
  );
  const [useVideoBackground, setUseVideoBackground] = useState<boolean>(
    !!initialValues?.videoBackground
  );
  const [enableConfetti, setEnableConfetti] = useState<boolean>(
    initialValues?.enableConfetti || false
  );
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] =
    useState<string>(initialValues?.backgroundImage || "");
  const [selectedVideoBackground, setSelectedVideoBackground] =
    useState<string>(initialValues?.videoBackground || "");

  // Available videos in public folder
  const availableVideos = [
    { name: "Blue Particle", path: "./blue_particle.mp4" },
    { name: "Waterglass", path: "./waterglass.mp4" },
    { name: "Welcome Video", path: "./welcomevid.mp4" },
    { name: "Welcome Video 1", path: "./welcomvid1.mp4" },
  ];

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

  const handleVideoSelect = (videoPath: string) => {
    setSelectedVideoBackground(videoPath);
    setUseVideoBackground(true);
    setUseBackgroundImage(false);
    setSelectedBackgroundImage("");
  };

  const handleClearVideo = () => {
    setSelectedVideoBackground("");
    setUseVideoBackground(false);
  };

  return (
    <div className="bg-gray-100 h-full overflow-y-auto no-scrollbar dark:bg-[#1c1c1c] rounded-lg p-6 border border-solid border-gray-200 dark:border-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center shadow-md">
          <Type className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-[#313131] dark:text-[#f9fafb]">
            Text Preset
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Create custom text displays with styling
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Preset Type Selector - Custom Design */}
        <div>
          <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
            Preset Type
          </label>
          <div className="grid grid-cols-5 gap-1">
            {[
              { value: "simple", label: "Simple", icon: "T" },
              { value: "list", label: "List", icon: "≡" },
              { value: "quote", label: "Quote", icon: '"' },
              { value: "title", label: "Title", icon: "H" },
              { value: "announcement", label: "News", icon: "📣" },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setPresetType(type.value as TextPresetType)}
                className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all ${
                  presetType === type.value
                    ? "bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#b8835a] dark:to-[#8b5e3c] text-white shadow-md scale-105"
                    : "bg-white/80 dark:bg-black/40 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-black/60 border border-stone-200/50 dark:border-white/10"
                }`}
              >
                <span className="text-lg leading-none mb-0.5">{type.icon}</span>
                <span className="text-[9px] font-medium">{type.label}</span>
              </button>
            ))}
          </div>
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

          {/* Font Family */}
          <FontSelector value={fontFamily} onChange={setFontFamily} />
        </div>

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

        {/* Toggles - Three Column Layout */}
        <div className="grid grid-cols-3 gap-2">
          {/* Video Background Toggle */}
          <div className="flex flex-col justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10">
            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Video
              </label>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Use video
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={useVideoBackground}
                onChange={(e) => {
                  setUseVideoBackground(e.target.checked);
                  if (e.target.checked) {
                    setUseBackgroundImage(false);
                    setSelectedBackgroundImage("");
                  } else {
                    setSelectedVideoBackground("");
                  }
                }}
                className="sr-only peer"
              />
              <div
                className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                  useVideoBackground
                    ? "bg-[#313131] dark:bg-[#b8835a]"
                    : "bg-stone-200/50 dark:bg-stone-700/50"
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border border-stone-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                    useVideoBackground ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Background Image Toggle */}
          <div className="flex flex-col justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10">
            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Image
              </label>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Custom image
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={useBackgroundImage}
                onChange={(e) => {
                  setUseBackgroundImage(e.target.checked);
                  if (e.target.checked) {
                    setUseVideoBackground(false);
                    setSelectedVideoBackground("");
                  } else {
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
          <div className="flex flex-col justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10">
            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Confetti 🎉
              </label>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Animation
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
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

        {/* Video Background Selector */}
        {useVideoBackground && (
          <div className="space-y-2">
            <label className="text-xs text-stone-600 dark:text-stone-400">
              Select Video
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableVideos.map((video) => (
                <div
                  key={video.path}
                  onClick={() => handleVideoSelect(video.path)}
                  className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all h-20 ${
                    selectedVideoBackground === video.path
                      ? "border-[#313131] dark:border-[#b8835a] ring-2 ring-[#313131]/30 dark:ring-[#b8835a]/30"
                      : "border-transparent hover:border-gray-300 dark:hover:border-stone-600"
                  }`}
                >
                  <video
                    src={video.path}
                    className="w-full h-full object-cover"
                    muted
                    loop
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold px-2 py-1 bg-black/60 rounded">
                      {video.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedVideoBackground && (
              <div className="relative rounded overflow-hidden group h-24">
                <video
                  src={selectedVideoBackground}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
                <button
                  onClick={handleClearVideo}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

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
              videoBackground:
                useVideoBackground && selectedVideoBackground
                  ? selectedVideoBackground
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
