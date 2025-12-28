import React from "react";
import { BentoCard } from "./BentoCard";
import { BackgroundPreview } from "./BackgroundPreview";
import { Palette } from "lucide-react";

interface BackgroundCardProps {
  isDarkMode: boolean;
  projectionBackgroundColor: string;
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  onSelectSolidColor: () => void;
  onSelectImageBackground: () => void;
  currentBackgroundType: "solid" | "image";
}

/**
 * Background Control Card
 * Allows users to preview and switch between solid and image backgrounds
 */
export const BackgroundCard: React.FC<BackgroundCardProps> = ({
  isDarkMode,
  projectionBackgroundColor,
  projectionBackgroundImage,
  projectionGradientColors,
  onSelectSolidColor,
  onSelectImageBackground,
  currentBackgroundType,
}) => {
  return (
    <div className="col-span-2 row-span-2">
      <div className="grid grid-cols-2 gap-0 flex-1 rounded-xl overflow-hidden">
        {/* Solid Color Preview */}
        <BackgroundPreview
          type="solid"
          backgroundColor={projectionBackgroundColor}
          gradientColors={projectionGradientColors}
          onClick={onSelectSolidColor}
          isActive={currentBackgroundType === "solid"}
        />

        {/* Image Background Preview */}
        <BackgroundPreview
          type="image"
          backgroundImage={projectionBackgroundImage}
          onClick={onSelectImageBackground}
          isActive={currentBackgroundType === "image"}
        />
      </div>
    </div>
  );
};
