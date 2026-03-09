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
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration Card */}
        <div className="bg-card-bg rounded-xl p-4 border border-card-bg-alt shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
              <Image className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Background Configuration</h3>
          </div>

          <div className="space-y-4">
            {/* Folder picker */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center flex-shrink-0">
                  <FolderUp className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-primary">Images Folder</div>
                  <div className="text-sm text-text-secondary truncate">
                    {customImagesPath ? `${bibleBgs.length} images loaded` : "No folder selected"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSelectImagesDirectory}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-btn-active-from hover:bg-btn-active-to text-white rounded-lg transition-colors text-sm font-medium"
              >
                <FolderUp className="w-3.5 h-3.5" />
                {customImagesPath ? "Change" : "Select"}
              </button>
            </div>

            {/* Image mode toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-text-primary">Background Images</div>
                <div className="text-sm text-text-secondary">
                  {imageBackgroundMode ? "Enabled" : "Disabled"}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={imageBackgroundMode}
                  onChange={(e) => handleBackgroundImageModeChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-6 rounded-full relative transition-all duration-200 ${
                    imageBackgroundMode ? "bg-btn-active-from" : "bg-select-bg"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all duration-200 border border-select-border ${
                      imageBackgroundMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Gradient Presets Card */}
        <div className="bg-card-bg rounded-xl p-4 border border-card-bg-alt shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
                <Image className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Gradient Presets</h3>
            </div>
            {projectionGradientColors?.length > 0 && (
              <div
                className="w-16 h-5 rounded border border-card-bg-alt"
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
                className={`h-10 rounded-lg border transition-all hover:scale-105 relative overflow-hidden shadow-sm cursor-pointer ${
                  projectionGradientColors[0] === preset.colors[0] &&
                  projectionGradientColors[1] === preset.colors[1]
                    ? "border-btn-active-from ring-2 ring-btn-active-from/40"
                    : "border-card-bg-alt hover:border-select-border"
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
      <div className="bg-card-bg rounded-xl p-4 border border-card-bg-alt shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
              <Image className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Background Images</h3>
              <p className="text-sm text-text-secondary">{bibleBgs.length} images available</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Object.values(imageLoadingStates).some(Boolean) && (
              <span className="text-xs text-blue-500 flex items-center gap-1">
                <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                Setting…
              </span>
            )}
            <button
              onClick={() => loadBackgroundImages(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors"
              title="Refresh images"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingImages ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Clear option */}
        <div
          onClick={() => handleBackgroundImageSelect("")}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer mb-3 transition-all text-sm ${
            projectionBackgroundImage === ""
              ? "border-btn-active-from bg-btn-active-from/10 text-btn-active-from"
              : "border-card-bg-alt text-text-secondary hover:border-select-border hover:bg-select-hover"
          }`}
        >
          <X className="w-3.5 h-3.5" />
          No image
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto no-scrollbar">
          {bibleBgs.map((imagePath, index) => {
            const isLoading = imageLoadingStates[imagePath];
            const isPreloaded = imagePreloadCache.has(imagePath);
            const isSelected = projectionBackgroundImage === imagePath;
            return (
              <div
                key={index}
                onClick={() => handleBackgroundImageSelect(imagePath)}
                className={`aspect-video rounded-md overflow-hidden border transition-all hover:scale-105 shadow-sm cursor-pointer relative ${
                  isSelected
                    ? "border-btn-active-from ring-2 ring-btn-active-from/30"
                    : "border-card-bg-alt hover:border-select-border"
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
                    <div className="w-5 h-5 bg-btn-active-from rounded-full flex items-center justify-center">
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
