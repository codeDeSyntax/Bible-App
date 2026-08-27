import React from "react";
import { Image, FolderUp, X, RefreshCw } from "lucide-react";

interface BackgroundSettingsProps {
  imageBackgroundMode: boolean;
  projectionBackgroundImage: string;
  bibleBgs: string[];
  projectionGradientColors: string[];
  imagePreloadCache: Set<string>;
  imageLoadingStates: { [key: string]: boolean };
  isLoadingImages: boolean;
  gradientPresets: Array<{ name: string; colors: string[] }>;
  customImagesPath: string;
  handleBackgroundImageSelect: (imagePath: string) => void;
  handleGradientChange: (colors: string[]) => void;
  loadBackgroundImages: (forceReload?: boolean) => void;
  handleSelectImagesDirectory: () => void;
  handleBackgroundImageModeChange: (enabled: boolean) => void;
}

export const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
  imageBackgroundMode,
  projectionBackgroundImage,
  bibleBgs,
  projectionGradientColors,
  imagePreloadCache,
  imageLoadingStates,
  isLoadingImages,
  gradientPresets,
  customImagesPath,
  handleBackgroundImageSelect,
  handleGradientChange,
  loadBackgroundImages,
  handleSelectImagesDirectory,
  handleBackgroundImageModeChange,
}) => {
  return (
    <div className="space-y-3.5 w-full">
      {/* Section header */}
      <div className="px-1">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          Background Configuration
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Images, custom folders, and projection gradient overlays
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Configuration Card */}
        <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-primary shadow-2xs">
              <Image className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Projection Mode
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Image backgrounds and folder source
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Folder picker */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-select-bg shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-card-bg text-text-secondary">
                  <FolderUp className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-primary">
                    Images Folder
                  </div>
                  <div className="text-[0.68rem] text-text-secondary truncate">
                    {customImagesPath
                      ? `${bibleBgs.length} images loaded`
                      : "No folder selected"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSelectImagesDirectory}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-btn-active-from hover:bg-btn-active-to text-white rounded-lg transition-colors text-xs font-semibold cursor-pointer shadow-xs"
              >
                <FolderUp className="w-3 h-3" />
                {customImagesPath ? "Change" : "Select"}
              </button>
            </div>

            {/* Image mode toggle */}
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="text-xs font-bold text-text-primary">
                  Enable Background Images
                </div>
                <div className="text-[0.68rem] text-text-secondary">
                  {imageBackgroundMode ? "Images overlaying projection" : "Solid color/gradients active"}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={imageBackgroundMode}
                  onChange={(e) =>
                    handleBackgroundImageModeChange(e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-6 rounded-full relative transition-all duration-200 ${
                    imageBackgroundMode ? "bg-btn-active-from" : "bg-select-bg"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all duration-200 shadow-sm ${
                      imageBackgroundMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Gradient Presets Card */}
        <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-primary shadow-2xs">
                <Image className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Gradient Presets
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Pre-configured color blends
                </p>
              </div>
            </div>
            {projectionGradientColors?.length > 0 && (
              <div
                className="w-14 h-5 rounded-md shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                style={{
                  background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
                }}
              />
            )}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {gradientPresets.map((preset) => (
              <div
                key={preset.name}
                onClick={() => handleGradientChange(preset.colors)}
                className={`h-9 rounded-lg transition-all hover:scale-105 relative overflow-hidden shadow-2xs cursor-pointer ${
                  projectionGradientColors[0] === preset.colors[0] &&
                  projectionGradientColors[1] === preset.colors[1]
                    ? "ring-2 ring-btn-active-from ring-offset-2 ring-offset-card-bg scale-105"
                    : "hover:shadow-sm"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)`,
                }}
                title={preset.name}
              >
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-end justify-center pb-0.5 opacity-0 hover:opacity-100">
                  <span className="text-white text-[9px] font-medium text-center px-0.5 leading-tight drop-shadow">
                    {preset.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Images Card */}
      <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-primary shadow-2xs">
              <Image className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Available Background Images
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {bibleBgs.length} images available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Object.values(imageLoadingStates).some(Boolean) && (
              <span className="text-xs text-blue-500 flex items-center gap-1 font-medium">
                <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                Setting…
              </span>
            )}
            <button
              type="button"
              onClick={() => loadBackgroundImages(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Refresh images"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingImages ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Clear option */}
        <div
          onClick={() => handleBackgroundImageSelect("")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all text-xs font-semibold shadow-2xs ${
            projectionBackgroundImage === ""
              ? "bg-btn-active-from text-white shadow-xs"
              : "bg-select-bg text-text-secondary hover:text-text-primary hover:bg-select-hover"
          }`}
        >
          <X className="w-3.5 h-3.5" />
          No background image
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5 max-h-56 overflow-y-auto no-scrollbar p-1">
          {bibleBgs.map((imagePath, index) => {
            const isLoading = imageLoadingStates[imagePath];
            const isPreloaded = imagePreloadCache.has(imagePath);
            const isSelected = projectionBackgroundImage === imagePath;
            return (
              <div
                key={index}
                onClick={() => handleBackgroundImageSelect(imagePath)}
                className={`aspect-video rounded-lg overflow-hidden transition-all hover:scale-105 shadow-2xs cursor-pointer relative ${
                  isSelected
                    ? "ring-2 ring-btn-active-from ring-offset-2 ring-offset-card-bg scale-105 shadow-sm"
                    : "hover:shadow-xs"
                } ${isLoading ? "opacity-60" : ""}`}
                title={`${isPreloaded ? "✓ " : ""}Background ${index + 1}`}
              >
                <img
                  src={imagePath}
                  alt={`Background ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {isSelected && !isLoading && (
                  <div className="absolute inset-0 bg-btn-active-from/20 flex items-center justify-center">
                    <div className="w-5 h-5 bg-btn-active-from rounded-full flex items-center justify-center shadow-xs">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}
                {isPreloaded && !isLoading && !isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
