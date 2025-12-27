import React from "react";
import { Settings, Image } from "lucide-react";

interface GeneralSettingsProps {
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  projectionBackgroundColor: string;
  imageBackgroundMode: boolean;
  selectedBackground: string | null;
  currentTranslation: string;
  currentBook: string;
  currentChapter: number;
  isFullScreen: boolean;
  verseByVerseMode: boolean;
  bibleBgs: string[];
  isDarkMode: boolean;
}

export const InfoAndPreset: React.FC<GeneralSettingsProps> = ({
  projectionFontFamily,
  projectionFontSize,
  projectionTextColor,
  projectionBackgroundImage,
  projectionGradientColors,
  projectionBackgroundColor,
  imageBackgroundMode,
  selectedBackground,
  currentTranslation,
  currentBook,
  currentChapter,
  isFullScreen,
  verseByVerseMode,
  bibleBgs,
  isDarkMode,
}) => {
  return (
    <div className="w-full h-full p-1 space-y-3">
      {/* Settings and Background Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Current Settings Summary */}
        <div className="bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Settings</h3>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Font Size:</span>
              <span className="font-semibold text-text-primary">
                {projectionFontSize}px
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Font Family:</span>
              <span className="font-semibold text-text-primary truncate ml-2">
                {projectionFontFamily}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Text Color:</span>
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: projectionTextColor }}
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {projectionTextColor}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Translation:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentTranslation}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Current Book:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentBook} {currentChapter}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                View Mode:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {verseByVerseMode ? "Verse by Verse" : "Chapter View"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Images:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {bibleBgs.length} available
              </span>
            </div>
          </div>
        </div>

        {/* Background Settings Summary */}
        <div className="bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center">
              <Image className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Background
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Image Mode:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {imageBackgroundMode ? "Enabled" : "Disabled"}
              </span>
            </div>

            {projectionBackgroundImage ? (
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Background Image:
                </span>
                <div className="mt-1 rounded overflow-hidden border">
                  <img
                    src={projectionBackgroundImage}
                    alt="Background"
                    className="w-full h-12 object-cover"
                  />
                </div>
              </div>
            ) : projectionGradientColors?.length > 0 ? (
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Gradient:
                </span>
                <div
                  className="mt-1 h-6 rounded border"
                  style={{
                    background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Background:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Solid Color
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Fullscreen:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {isFullScreen ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
