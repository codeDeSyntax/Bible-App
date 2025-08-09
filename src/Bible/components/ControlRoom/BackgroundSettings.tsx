import React, { useState } from "react";
import { Image, Palette, X } from "lucide-react";

interface BackgroundSettingsProps {
  imageBackgroundMode: boolean;
  projectionBackgroundImage: string;
  bibleBgs: string[];
  projectionGradientColors: string[];
  imagePreloadCache: Set<string>;
  imageLoadingStates: { [key: string]: boolean };
  isLoadingImages: boolean;
  gradientPresets: Array<{ name: string; colors: string[] }>;
  handleBackgroundImageSelect: (imagePath: string) => void;
  handleGradientChange: (colors: string[]) => void;
  loadBackgroundImages: (forceReload?: boolean) => void;
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
  handleBackgroundImageSelect,
  handleGradientChange,
  loadBackgroundImages,
}) => {
  return (
    <div className="space-y-4">
      {/* Background Images */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm w-full" >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
              <Image className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Background Images
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a background image for your presentation
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {imagePreloadCache.size} preloaded
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  • {bibleBgs.length} total images
                </div>
                {imagePreloadCache.size < bibleBgs.length && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    • Optimizing...
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              onClick={() => loadBackgroundImages(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#906140] to-[#7d5439] text-white hover:from-[#7d5439] hover:to-[#6b4931] disabled:opacity-50 transition-all duration-200 font-medium shadow-md cursor-pointer text-sm"
            >
              {isLoadingImages ? "Loading..." : "Refresh"}
            </div>

            {/* Background Change Status */}
            {Object.values(imageLoadingStates).some(Boolean) && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
                <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Setting Background...</span>
              </div>
            )}
          </div>
        </div>

        {/* Clear Background Option */}
        <div
          onClick={() => handleBackgroundImageSelect("")}
          className={`w-40 p-3 rounded-xl border border-dashed transition-all mb-3 cursor-pointer relative ${
            projectionBackgroundImage === ""
              ? "border-[#906140] bg-[#906140]/10 text-[#906140]"
              : "border-white/30 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
          } ${imageLoadingStates[""] ? "opacity-70" : ""}`}
        >
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/20 mx-auto mb-2 flex items-center justify-center">
              <X className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">No Background Image</span>
          </div>

          {/* Loading Overlay for Clear Background */}
          {imageLoadingStates[""] && (
            <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#906140] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto no-scrollbar">
          {bibleBgs.map((imagePath, index) => {
            const isLoading = imageLoadingStates[imagePath];
            const isPreloaded = imagePreloadCache.has(imagePath);

            return (
              <div
                key={index}
                onClick={() => handleBackgroundImageSelect(imagePath)}
                className={`aspect-video rounded-2xl overflow-hidden border transition-all hover:scale-105 shadow-md cursor-pointer relative ${
                  projectionBackgroundImage === imagePath
                    ? "border-[#906140] ring-1 ring-[#906140]/30"
                    : "border-white/30 dark:border-white/10 hover:border-gray-300 dark:hover:border-gray-500"
                } ${isLoading ? "opacity-70" : ""}`}
                title={`${isPreloaded ? "✓ " : ""}Background ${index + 1}`}
              >
                <img
                  src={imagePath}
                  alt={`Background ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Preloaded Indicator */}
                {isPreloaded && !isLoading && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}

                {/* Selected Indicator */}
                {projectionBackgroundImage === imagePath && (
                  <div className="absolute inset-0 bg-[#906140]/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#906140] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient Backgrounds */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gradient Backgrounds
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Beautiful gradient backgrounds for your presentation
            </p>
          </div>
        </div>

        {/* Custom Gradient */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Gradient
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={projectionGradientColors[0] || "#667eea"}
              onChange={(e) =>
                handleGradientChange([
                  e.target.value,
                  projectionGradientColors[1] || "#764ba2",
                ])
              }
              className="w-10 h-10 rounded-xl border border-white/30 dark:border-white/10 cursor-pointer shadow-md"
            />
            <input
              type="color"
              value={projectionGradientColors[1] || "#764ba2"}
              onChange={(e) =>
                handleGradientChange([
                  projectionGradientColors[0] || "#667eea",
                  e.target.value,
                ])
              }
              className="w-10 h-10 rounded-xl border border-white/30 dark:border-white/10 cursor-pointer shadow-md"
            />
            <div
              className="w-40 h-10 rounded-xl border border-white/30 dark:border-white/10 shadow-md"
              style={{
                background: `linear-gradient(135deg, ${
                  projectionGradientColors[0] || "#667eea"
                } 0%, ${projectionGradientColors[1] || "#764ba2"} 100%)`,
              }}
            />
          </div>
        </div>

        {/* Gradient Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preset Gradients
          </label>
          <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto no-scrollbar">
            {gradientPresets.map((preset, index) => (
              <div
                key={preset.name}
                onClick={() => handleGradientChange(preset.colors)}
                className={`aspect-video  rounded-xl border transition-all hover:scale-105 relative overflow-hidden shadow-md cursor-pointer ${
                  projectionGradientColors[0] === preset.colors[0] &&
                  projectionGradientColors[1] === preset.colors[1]
                    ? "border-[#906140] ring-1 ring-[#906140]/30"
                    : "border-white/30 dark:border-white/10 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)`,
                }}
                title={preset.name}
              >
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium text-center px-1">
                    {preset.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
