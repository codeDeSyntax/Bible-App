import React, { useState, useEffect } from "react";
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FolderOpen,
  X,
} from "lucide-react";

interface TextPresetFormProps {
  randomText: string;
  setRandomText: (text: string) => void;
  projectionBackgroundImage: string;
  onSave: (data: {
    text: string;
    fontSize: number;
    fontFamily: string;
    textAlign: "left" | "center" | "right";
    textColor: string;
    backgroundColor: string;
    backgroundImage?: string;
  }) => void;
}

const TEXT_PRESET_STORAGE_KEY = "textPreset_selectedDirectory";

export const TextPresetForm: React.FC<TextPresetFormProps> = ({
  randomText,
  setRandomText,
  projectionBackgroundImage,
  onSave,
}) => {
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [useBackgroundImage, setUseBackgroundImage] = useState<boolean>(false);
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] =
    useState<string>("");

  const fontOptions = [
    "Arial",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
    "Trebuchet MS",
    "Tahoma",
  ];

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
    <div className="bg-gray-50 dark:bg-[#1c1c1c] rounded-lg p-4 border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center shadow-md">
          <Type className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#313131] dark:text-[#f9fafb]">
          Text Preset
        </h4>
      </div>

      <div className="space-y-2">
        {/* Text Input */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Custom Text
          </label>
          <textarea
            value={randomText}
            onChange={(e) => setRandomText(e.target.value)}
            placeholder="Enter any text to display..."
            rows={3}
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#1a1410] resize-none transition-colors"
          />
        </div>

        {/* Font Family */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white focus:outline-none focus:bg-gray-200 dark:focus:bg-[#1a1410] transition-colors"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
            <span>Font Size</span>
            <span className="font-semibold">{fontSize}px</span>
          </label>
          <input
            type="range"
            min="16"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#313131] dark:accent-[#b8835a]"
          />
        </div>

        {/* Text Alignment */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Text Alignment
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => setTextAlign("left")}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                textAlign === "left"
                  ? "bg-[#313131] dark:bg-[#b8835a] text-white"
                  : "bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1a1410]"
              }`}
            >
              <AlignLeft className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={() => setTextAlign("center")}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                textAlign === "center"
                  ? "bg-[#313131] dark:bg-[#b8835a] text-white"
                  : "bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1a1410]"
              }`}
            >
              <AlignCenter className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={() => setTextAlign("right")}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                textAlign === "right"
                  ? "bg-[#313131] dark:bg-[#b8835a] text-white"
                  : "bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1a1410]"
              }`}
            >
              <AlignRight className="w-3 h-3 mx-auto" />
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs rounded bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  backgroundColor === "transparent"
                    ? "#000000"
                    : backgroundColor
                }
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={useBackgroundImage}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={() =>
                  setBackgroundColor(
                    backgroundColor === "transparent"
                      ? "#000000"
                      : "transparent"
                  )
                }
                disabled={useBackgroundImage}
                className="flex-1 px-2 py-1 text-xs rounded bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {backgroundColor === "transparent" ? "None" : backgroundColor}
              </button>
            </div>
          </div>
        </div>

        {/* Background Image Section */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-between">
            <span>Background Image (Optional)</span>
            <input
              type="checkbox"
              checked={useBackgroundImage}
              onChange={(e) => {
                setUseBackgroundImage(e.target.checked);
                if (!e.target.checked) {
                  setSelectedBackgroundImage("");
                }
              }}
              className="w-4 h-4 rounded accent-[#313131] dark:accent-[#b8835a]"
            />
          </label>

          {useBackgroundImage && (
            <div className="space-y-2 mt-2">
              {/* Select Folder Button */}
              <button
                onClick={handleSelectDirectory}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/80 dark:bg-black/40 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/10 focus:outline-none transition-all flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-black/60"
              >
                <FolderOpen className="w-3 h-3" />
                <span className="truncate">
                  {selectedDirectory || "Choose folder..."}
                </span>
              </button>

              {/* Available Images */}
              {availableImages.length > 0 && (
                <div className="max-h-32 overflow-y-auto no-scrollbar bg-white/50 dark:bg-black/20 rounded-lg p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {availableImages.map((image, index) => (
                      <div
                        key={index}
                        onClick={() => handleImageSelect(image)}
                        className={`relative rounded overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedBackgroundImage === image
                            ? "border-[#313131] dark:border-[#b8835a] ring-2 ring-[#313131]/30 dark:ring-[#b8835a]/30"
                            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Background ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Image Preview */}
              {selectedBackgroundImage && (
                <div className="relative rounded overflow-hidden group">
                  <img
                    src={selectedBackgroundImage}
                    alt="Selected background"
                    className="w-full h-24 object-cover"
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
        </div>

        {/* Preview */}
        {randomText && (
          <div className="mt-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10 overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Preview:
            </p>
            <div
              style={{
                fontFamily,
                fontSize: `${fontSize * 0.4}px`,
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
          onClick={() =>
            onSave({
              text: randomText,
              fontSize,
              fontFamily,
              textAlign,
              textColor,
              backgroundColor,
              backgroundImage:
                useBackgroundImage && selectedBackgroundImage
                  ? selectedBackgroundImage
                  : undefined,
            })
          }
          disabled={!randomText}
          className="w-full mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] text-white hover:from-[#252525] hover:to-[#202020] dark:hover:from-[#c99466] dark:hover:to-[#9a6e48] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
        >
          Save & Project
        </button>
      </div>
    </div>
  );
};
