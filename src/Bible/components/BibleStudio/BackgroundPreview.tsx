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
      className={`relative flex-1 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border ${
        isActive
          ? "border-select-border-hover ring-1 ring-select-border-hover shadow-sm"
          : "border-select-border hover:border-select-border-hover hover:shadow-sm"
      }`}
      style={getBackgroundStyle()}
      onClick={onClick}
    >
      {/* Subtle bottom gradient for label readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Label */}
      <div className="absolute bottom-1.5 left-2">
        <span className="text-white text-[0.6rem] font-semibold tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          {type === "solid" ? "Color" : "Image"}
        </span>
      </div>

      {/* Active indicator — small dot */}
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
          <svg className="w-2 h-2 text-black" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
