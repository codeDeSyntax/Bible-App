import React from "react";
import { DepthSurface } from "@/shared/DepthElement";
import { ImageOff } from "lucide-react";

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
  const hasImage = type === "image" && Boolean(backgroundImage);

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
      className={`relative flex-1 h-16 rounded-xl overflow-hidden transition-all duration-200 ${
        isActive
          ? "ring-1 ring-select-border-hover shadow-sm"
          : "hover:shadow-sm"
      }`}
      style={getBackgroundStyle()}
    >
      <DepthSurface
        onClick={onClick}
        className="absolute inset-0 transition-all duration-200 hover:scale-[1.01]"
        surfaceClassName={
          hasImage
            ? "bg-transparent border border-select-border"
            : "bg-gradient-to-br from-select-bg via-select-hover to-select-bg-alt border border-select-border"
        }
      >
        {/* Subtle bottom gradient for label readability */}
        <div
          className={`absolute inset-0 ${
            hasImage
              ? "bg-gradient-to-t from-black/50 to-transparent"
              : "bg-gradient-to-t from-select-border/35 to-transparent"
          }`}
        />

        {/* Empty image placeholder */}
        {type === "image" && !hasImage && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-select-bg/80 border border-select-border">
              <ImageOff className="w-3 h-3 text-text-secondary" />
              <span className="text-[0.58rem] font-semibold text-text-secondary uppercase tracking-wide">
                No image
              </span>
            </div>
          </div>
        )}

        {/* Label */}
        <div className="absolute bottom-1.5 left-2 z-10">
          <span
            className={`text-[0.6rem] font-semibold tracking-wide uppercase ${
              hasImage
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                : "text-text-primary"
            }`}
          >
            {type === "solid" ? "Color" : "Image"}
          </span>
        </div>

        {/* Active indicator — small dot */}
        {isActive && (
          <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white/90 flex items-center justify-center shadow-sm z-10">
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
      </DepthSurface>
    </div>
  );
};
