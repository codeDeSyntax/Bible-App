import React from "react";

interface BackgroundPreviewProps {
  type: "solid" | "image";
  backgroundColor?: string;
  backgroundImage?: string;
  gradientColors?: string[];
  onClick?: () => void;
  isActive?: boolean;
}

/**
 * Background Preview Component
 * Shows a preview of solid color or image background
 */
export const BackgroundPreview: React.FC<BackgroundPreviewProps> = ({
  type,
  backgroundColor,
  backgroundImage,
  gradientColors,
  onClick,
  isActive = false,
}) => {
  const getBackgroundStyle = () => {
    if (type === "image" && backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    if (type === "solid" && gradientColors && gradientColors.length >= 2) {
      return {
        background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
      };
    }

    if (type === "solid" && backgroundColor) {
      return {
        backgroundColor: backgroundColor,
      };
    }

    return {
      backgroundColor: "var(--studio-bg)",
    };
  };

  return (
    <div
      className={`relative h-28 overflow-hidden cursor-pointer bg-studio-bg transition-all duration-300 border-none border-accent-primary ${
        isActive
          ? "border-accent-primary shadow-lg scale-[1.02]"
          : "border-border-primary hover:border-accent-primary/50"
      }`}
      style={getBackgroundStyle()}
      onClick={onClick}
    >
      {/* Overlay with label */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
        <div className="text-white text-sm font-medium">
          {type === "solid" ? "Solid Color" : "Image Background"}
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-accent-primary animate-pulse" />
      )}
    </div>
  );
};
