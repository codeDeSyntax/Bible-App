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
      className={`relative h-28 overflow-hidden cursor-pointer transition-all duration-200 ${
        isActive ? "ring-2 ring-inset ring-white/70" : "hover:brightness-110"
      }`}
      style={getBackgroundStyle()}
      onClick={onClick}
    >
      {/* Overlay with label */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex items-end p-2.5">
        <span className="text-white text-[0.72rem] font-semibold tracking-wide uppercase">
          {type === "solid" ? "Solid Color" : "Image"}
        </span>
      </div>

      {/* Active indicator — checkmark badge */}
      {isActive && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow">
          <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
