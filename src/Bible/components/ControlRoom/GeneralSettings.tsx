import React from "react";
import { Settings, Image, Globe } from "lucide-react";

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

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
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
    <div className="w-full h-full p-1">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
        {/* Current Settings Summary - Top Left */}
        <div className="rounded-xl p-4 border-2 border-solid border-gray-300 dark:border-[#312319]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Settings
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Font Size:
              </span>
              <span className="font-semibold text-[#906140] dark:text-[#b8835a]">
                {projectionFontSize}px
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Font Family:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white truncate ml-2">
                {projectionFontFamily}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Text Color:
              </span>
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
          </div>
        </div>

        {/* Background Settings Summary - Top Right */}
        <div className="rounded-xl p-4 border-2 border-solid border-stone dark:border-[#312319]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
              <Image className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Background
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs">
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
                <span className="text-gray-600 dark:text-gray-400 text-xs">
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
                <span className="text-gray-600 dark:text-gray-400 text-xs">
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

        {/* Bible Content Info - Bottom Left */}
        <div className="rounded-xl p-4 border-2 border-solid border-stone-300 dark:border-[#312319]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Bible Content
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-center p-2 rounded-lg border border-[#906140]/30">
              <div className="text-lg font-bold text-[#906140] dark:text-[#b8835a]">
                {currentBook} {currentChapter}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Current Chapter
              </div>
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
              <span className="text-gray-600 dark:text-gray-400">
                Images Available:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {bibleBgs.length} images
              </span>
            </div>
          </div>
        </div>

        {/* Bible Presentation Preview - Bottom Right */}
        <div className="rounded-xl p-4 border-2 border-solid border-red-500">
          {/* Mini Preview Screen */}
          <div
            className="w-full aspect-video h-[95%] rounded-lg border-2 border-orange-500 overflow-hidden relative"
            style={{
              background: projectionBackgroundImage
                ? `url(${projectionBackgroundImage}) center/cover`
                : projectionGradientColors?.length > 0
                ? `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`
                : projectionBackgroundColor,
            }}
          >
            {/* Overlay for text visibility */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Sample Bible Text */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <div className="text-center">
                <div
                  className="font-bold leading-tight mb-1 "
                  style={{
                    color: projectionTextColor,
                    fontFamily: projectionFontFamily,
                    fontSize: "1rem", // Smaller size for compact preview
                  }}
                >
                  "For God so loved the world..."
                </div>
                <div
                  className="text-xs opacity-80"
                  style={{
                    color: projectionTextColor,
                    fontSize: "8px",
                  }}
                >
                  John 3:16 - {currentTranslation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
