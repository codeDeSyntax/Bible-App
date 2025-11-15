import React, { useState, useEffect } from "react";
import { ImageIcon, FolderOpen, X } from "lucide-react";

interface ImagePresetFormProps {
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  onSave: () => void;
}

const IMAGE_PRESET_STORAGE_KEY = "imagePreset_selectedDirectory";

export const ImagePresetForm: React.FC<ImagePresetFormProps> = ({
  selectedImages,
  setSelectedImages,
  onSave,
}) => {
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  // Load saved directory on mount
  useEffect(() => {
    const loadSavedDirectory = async () => {
      const savedDirectory = localStorage.getItem(IMAGE_PRESET_STORAGE_KEY);
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
          setSelectedImages([]);
          localStorage.setItem(IMAGE_PRESET_STORAGE_KEY, directory);
        }
      } catch (error) {
        console.error("Failed to select directory:", error);
      }
    }
  };

  const handleImageSelect = (image: string) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter((img) => img !== image));
    } else if (selectedImages.length < 4) {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handleRemoveImage = (image: string) => {
    setSelectedImages(selectedImages.filter((img) => img !== image));
  };

  const getGridClass = () => {
    switch (selectedImages.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1c1c1c] rounded-lg p-4 border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center shadow-md">
          <ImageIcon className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#313131] dark:text-[#f9fafb]">
          Image Preset
        </h4>
      </div>

      <div className="space-y-2">
        {/* Select Folder Button */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Select Image Folder
          </label>
          <button
            onClick={handleSelectDirectory}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white/80 dark:bg-black/40 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#313131]/30 dark:focus:ring-white/20 transition-all flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-black/60"
          >
            <FolderOpen className="w-3 h-3" />
            <span className="truncate">
              {selectedDirectory || "Choose folder..."}
            </span>
          </button>
        </div>

        {/* Available Images Grid */}
        {availableImages.length > 0 && (
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Select Images (Max 4)
            </label>
            <div className="max-h-40 overflow-y-auto no-scrollbar bg-white/50 dark:bg-black/20 rounded-lg p-2">
              <div className="grid grid-cols-3 gap-2">
                {availableImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageSelect(image)}
                    className={`relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImages.includes(image)
                        ? "border-[#313131] dark:border-[#b8835a] ring-2 ring-[#313131]/30 dark:ring-[#b8835a]/30"
                        : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    } ${
                      selectedImages.length >= 4 &&
                      !selectedImages.includes(image)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImages.includes(image) && (
                      <div className="absolute inset-0 bg-[#313131]/30 dark:bg-[#b8835a]/30 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-[#313131] dark:bg-[#b8835a] text-white text-xs font-bold flex items-center justify-center">
                          {selectedImages.indexOf(image) + 1}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Preview ({selectedImages.length}/4)
            </label>
            <div
              className={`grid ${getGridClass()} gap-2 bg-white/50 dark:bg-black/20 rounded-lg p-2`}
            >
              {selectedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded overflow-hidden group"
                >
                  <img
                    src={image}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(image)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onSave}
          disabled={selectedImages.length === 0}
          className="w-full mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#7e7d7d] dark:to-[#7e7d7d] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
        >
          Save & Project ({selectedImages.length} image
          {selectedImages.length !== 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
};
