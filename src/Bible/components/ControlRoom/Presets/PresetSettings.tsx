import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface PresetSettingsProps {}

export const PresetSettings: React.FC<PresetSettingsProps> = () => {
  const [videoAutoPlay, setVideoAutoPlay] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(40);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.api.getPresetSettings();
        if (settings) {
          setVideoAutoPlay(settings.videoAutoPlay ?? true);
          setBackgroundOpacity(settings.backgroundOpacity ?? 40);
        }
      } catch (error) {
        console.error("Failed to load preset settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Handle video autoplay toggle
  const handleVideoAutoPlayChange = async (enabled: boolean) => {
    setVideoAutoPlay(enabled);
    try {
      await window.api.updatePresetSettings({
        videoAutoPlay: enabled,
      });
    } catch (error) {
      console.error("Failed to update video autoplay setting:", error);
    }
  };

  // Handle background opacity change
  const handleBackgroundOpacityChange = async (opacity: number) => {
    setBackgroundOpacity(opacity);
    try {
      await window.api.updatePresetSettings({
        backgroundOpacity: opacity,
      });
    } catch (error) {
      console.error("Failed to update background opacity setting:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Video Autoplay Setting */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              {videoAutoPlay ? (
                <Play className="w-5 h-5 text-green-600" />
              ) : (
                <Pause className="w-5 h-5 text-gray-600" />
              )}
              Video Background Autoplay
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {videoAutoPlay
                ? "Videos in presets will start playing automatically when displayed"
                : "Videos in presets will be paused by default and require manual play"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={videoAutoPlay}
              onChange={(e) => handleVideoAutoPlayChange(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                videoAutoPlay ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all duration-200 ${
                  videoAutoPlay ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> This setting applies to all presets with
            video backgrounds, including default presets and custom created
            ones.
          </p>
        </div>
      </div>

      {/* Background Overlay Opacity Setting */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Background Overlay Opacity
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adjust the darkness of the overlay on background images and videos
            for better text readability
          </p>
        </div>

        <div className="space-y-4">
          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Opacity: {backgroundOpacity}%
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {backgroundOpacity < 30
                  ? "Light"
                  : backgroundOpacity < 50
                  ? "Medium"
                  : backgroundOpacity < 70
                  ? "Dark"
                  : "Very Dark"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  handleBackgroundOpacityChange(
                    Math.max(0, backgroundOpacity - 5)
                  )
                }
                className="w-8 h-8 rounded-lg bg-white/60 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200 font-bold text-sm shadow-md flex items-center justify-center"
              >
                −
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={backgroundOpacity}
                  onChange={(e) =>
                    handleBackgroundOpacityChange(Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer 
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#313131] [&::-webkit-slider-thumb]:to-[#303030] 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-0"
                />
              </div>

              <button
                onClick={() =>
                  handleBackgroundOpacityChange(
                    Math.min(100, backgroundOpacity + 5)
                  )
                }
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] text-white hover:from-[#303030] hover:to-[#303030] transition-all duration-200 font-bold text-sm shadow-md flex items-center justify-center"
              >
                +
              </button>
            </div>

            <div className="flex justify-between text-[0.9rem] text-gray-500 dark:text-gray-400 mt-2">
              <span>0% (Transparent)</span>
              <span>50% (Default)</span>
              <span>100% (Black)</span>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </p>
            <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Sample background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800)",
                }}
              />
              {/* Overlay with current opacity */}
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: backgroundOpacity / 100 }}
              />
              {/* Sample text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-2xl font-bold text-center px-4">
                  Sample Text
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Tip:</strong> Higher opacity values create a darker overlay,
            making text more readable on bright backgrounds.
          </p>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Quick Preset Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              handleVideoAutoPlayChange(true);
              handleBackgroundOpacityChange(40);
            }}
            className="px-4 py-3 rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] text-white hover:from-[#303030] hover:to-[#303030] transition-all duration-200 font-medium text-sm shadow-md"
          >
            Reset to Default
          </button>
          <button
            onClick={() => {
              handleVideoAutoPlayChange(false);
              handleBackgroundOpacityChange(60);
            }}
            className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-sm shadow-md"
          >
            Performance Mode
          </button>
        </div>
        <p className="text-[0.9rem] text-gray-500 dark:text-gray-400 mt-3">
          Performance Mode: Disables autoplay and increases overlay for better
          performance and readability
        </p>
      </div>
    </div>
  );
};
