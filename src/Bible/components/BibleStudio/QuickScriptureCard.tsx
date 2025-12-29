import React from "react";
import { X, ExternalLink } from "lucide-react";

interface QuickScriptureCardProps {
  id: string;
  reference: string; // e.g., "John 3:16"
  text: string; // Preview of scripture text
  backgroundImage?: string;
  onNavigate: () => void;
  onRemove: () => void;
  isDarkMode: boolean;
}

/**
 * Quick Scripture Access Card
 * Displays a saved scripture with background preview, reference, and text snippet
 */
export const QuickScriptureCard: React.FC<QuickScriptureCardProps> = ({
  reference,
  text,
  backgroundImage,
  onNavigate,
  onRemove,
  isDarkMode,
}) => {
  // Truncate text to approximately 80 characters
  const truncatedText = text.length > 80 ? text.substring(0, 80) + "..." : text;

  return (
    <div
      className="relative group rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg h-20 border border-select-border"
      onClick={onNavigate}
    >
      {/* Background Image or Gradient */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : "linear-gradient(135deg, var(--select-border) 0%, var(--card-bg-alt) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for readability */}
        {/* <div className="absolute inset-0 bg-black/50" /> */}
      </div>

      {/* Content */}
      <div className="relative z-10 p-2 flex flex-col h-full justify-between">
        {/* Reference and Remove Button */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-semibold text-white"
            style={{
              textShadow: `
                0 0 8px rgba(0, 0, 0, 0.9),
                0 0 12px rgba(0, 0, 0, 0.8),
                3px 3px 6px rgba(0, 0, 0, 0.8),
                -3px -3px 6px rgba(0, 0, 0, 0.8),
                3px -3px 6px rgba(0, 0, 0, 0.8),
                -3px 3px 6px rgba(0, 0, 0, 0.8)
              `,
            }}
          >
            {reference}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="opacity-70 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/80 rounded z-20 relative"
            title="Remove scripture"
          >
            <X
              className="w-3.5 h-3.5 text-white"
              style={{
                filter:
                  "drop-shadow(0 0 4px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.8))",
              }}
            />
          </button>
        </div>

        {/* Scripture Text Preview */}
        <span
          className="text-xs text-white/90 line-clamp-2"
          style={{
            textShadow: `
              0 0 8px rgba(0, 0, 0, 0.9),
              0 0 12px rgba(0, 0, 0, 0.8),
              3px 3px 6px rgba(0, 0, 0, 0.8),
              -3px -3px 6px rgba(0, 0, 0, 0.8),
              3px -3px 6px rgba(0, 0, 0, 0.8),
              -3px 3px 6px rgba(0, 0, 0, 0.8)
            `,
          }}
        >
          {truncatedText}
        </span>
      </div>
    </div>
  );
};
