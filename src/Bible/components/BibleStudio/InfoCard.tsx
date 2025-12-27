import React from "react";
import { Info, Settings } from "lucide-react";

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

export const InfoCard: React.FC<InfoCardProps> = ({ isDarkMode }) => {
  return (
    <div className="col-span-1 row-span-6 row-start-1 h-full rounded-xl p-3 flex flex-col overflow-hidden bg-card-bg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md"
          style={{
            background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
          }}
        >
          <Info className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-[0.9rem] font-semibold text-text-primary">Info</h3>
      </div>

      {/* Empty placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Settings
            className={`w-8 h-8 mx-auto ${
              isDarkMode ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Content moved to titlebar menu
          </p>
        </div>
      </div>
    </div>
  );
};
