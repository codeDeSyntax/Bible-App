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
    <div className="bg-card-bg h-[25rem] max-w-2xl border-solid overflow-y-auto no-scrollbar rounded-lg p-4 border border-select-border backdrop-blur-sm relative">
      {/* Floating Preview */}
      {selectedImages.length > 0 && (
        <div
          className="absolute top-4 right-4 w-32 h-32 z-20 bg-card-bg-alt rounded-xl shadow-2xl border-2 border-primary/70 ring-2 ring-primary/20 overflow-hidden transition-all"
          style={{
            boxShadow:
              "0 4px 24px 0 rgba(0,0,0,0.18), 0 0 0 2px var(--select-border)",
          }}
        >
          <div className={`grid ${getGridClass()} gap-0.5 w-full h-full`}>
            {selectedImages.map((image, index) => (
              <div key={index} className="relative w-full h-full">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white text-[10px] text-center py-0.5 rounded-b-xl">
            {selectedImages.length}/4
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <ImageIcon className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-text-primary">Image Preset</h4>
      </div>

      <div className="space-y-2">
        {/* Select Folder Button */}
        <div>
          <label className="text-[0.9rem] text-text-secondary mb-1 block">
            Select Image Folder
          </label>
          <button
            onClick={handleSelectDirectory}
            className="w-full px-3 py-2 text-[0.9rem] rounded-lg bg-card-bg-alt text-text-primary border border-select-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all flex items-center justify-center gap-2 hover:bg-card-bg"
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
            <label className="text-[0.9rem] text-text-secondary mb-1 block">
              Select Images (Max 4)
            </label>
            <div className="max-h-40 overflow-y-auto no-scrollbar bg-card-bg-alt rounded-lg p-2">
              <div className="grid grid-cols-8 gap-2">
                {availableImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageSelect(image)}
                    className={`relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImages.includes(image)
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-select-border"
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
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary text-white text-[0.9rem] font-bold flex items-center justify-center">
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

        <button
          onClick={onSave}
          disabled={selectedImages.length === 0}
          className="w-[30%] mt-2 px-3 py-1.5 text-[0.9rem] font-semibold rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:opacity-90"
        >
          Save & Project ({selectedImages.length})
          {/* {selectedImages.length !== 1 ? "s" : ""}) */}
        </button>
      </div>
    </div>
  );
};
