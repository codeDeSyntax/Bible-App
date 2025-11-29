import React from "react";
import { BentoCard } from "./BentoCard";
import { Info, Settings, Image } from "lucide-react";

interface InfoCardProps {
  isDarkMode: boolean;
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  currentTranslation: string;
  currentBook: string;
  currentChapter: number;
  verseByVerseMode: boolean;
  bibleBgs: string[];
}

export const InfoCard: React.FC<InfoCardProps> = ({
  isDarkMode,
  projectionFontFamily,
  projectionFontSize,
  projectionTextColor,
  projectionBackgroundImage,
  projectionGradientColors,
  currentTranslation,
  currentBook,
  currentChapter,
  verseByVerseMode,
  bibleBgs,
}) => {
  return (
    <div
    //   title="Settings & Info"
    //   isDarkMode={isDarkMode}
    //   icon={<Info className="w-4 h-4 text-white" />}
      className="col-span-1 row-span-5 row-start-1 h-full bg-white shadow"
    >
      <div className="space-y-4">
        {/* Current Settings Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h4
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
              style={{
                fontFamily: "garamond",
              }}
            >
              Current Settings
            </h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">
                Font Size:
              </span>
              <span className="font-semibold text-[#313131] dark:text-[#b8835a]">
                {projectionFontSize}px
              </span>
            </div>

            <div className="flex justify-between items-center px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">
                Font Family:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white truncate ml-2 text-sm">
                {projectionFontFamily}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">
                Text Color:
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: projectionTextColor }}
                />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {projectionTextColor}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">
                Translation:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentTranslation}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">
                Current Book:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentBook} {currentChapter}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">
                View Mode:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {verseByVerseMode ? "Verse by Verse" : "Chapter View"}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">Images:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {bibleBgs.length} available
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Background Settings Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Background
            </h4>
          </div>

          {projectionBackgroundImage ? (
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Current Image:
              </span>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={projectionBackgroundImage}
                  alt="Background"
                  className="w-full h-20 object-cover"
                />
              </div>
            </div>
          ) : projectionGradientColors?.length > 0 ? (
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Gradient:
              </span>
              <div
                className="h-12 rounded-lg border border-gray-200 dark:border-gray-700"
                style={{
                  background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
                }}
              />
            </div>
          ) : (
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                Solid Color
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
