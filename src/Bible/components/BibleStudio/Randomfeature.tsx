import React, { useState } from "react";
import { Info, Settings } from "lucide-react";
import { BackgroundCard } from "./BackgroundCard";

interface RandomFeatureProps {
  isDarkMode: boolean;
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  projectionBackgroundColor: string;
  currentTranslation: string;
  currentBook: string;
  currentChapter: number;
  verseByVerseMode: boolean;
  bibleBgs: string[];
}

export const RandomFeature: React.FC<RandomFeatureProps> = ({
  isDarkMode,
  projectionBackgroundColor,
  projectionBackgroundImage,
  projectionGradientColors,
}) => {
  const [currentBackgroundType, setCurrentBackgroundType] = useState<
    "solid" | "image"
  >(projectionBackgroundImage ? "image" : "solid");

  const handleSelectSolidColor = () => {
    setCurrentBackgroundType("solid");
    // TODO: Dispatch action to update background type in Redux
    console.log("Solid color background selected");
  };

  const handleSelectImageBackground = () => {
    setCurrentBackgroundType("image");
    // TODO: Dispatch action to update background type in Redux
    console.log("Image background selected");
  };

  return (
    <div className="col-span-1 row-span-6 row-start-1 h-full rounded-xl p-3 flex flex-col gap-4 overflow-hidden bg-card-bg">
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md"
          style={{
            background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
          }}
        >
          <Info className="w-4 h-4" style={{ color: "white" }} />
        </div>
        <h3 className="text-[0.9rem] font-semibold text-text-primary">
          Presentation Settings
        </h3>
      </div>

      {/* Background Control Card */}
      <div className="flex-shrink-0">
        <BackgroundCard
          isDarkMode={isDarkMode}
          projectionBackgroundColor={projectionBackgroundColor}
          projectionBackgroundImage={projectionBackgroundImage}
          projectionGradientColors={projectionGradientColors}
          onSelectSolidColor={handleSelectSolidColor}
          onSelectImageBackground={handleSelectImageBackground}
          currentBackgroundType={currentBackgroundType}
        />
      </div>

      {/* Additional controls will go here */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Settings className="w-8 h-8 mx-auto text-text-secondary" />
          <p className="text-xs text-text-secondary">
            More controls coming soon
          </p>
        </div>
      </div>
    </div>
  );
};
