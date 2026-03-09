import React from "react";
import { X } from "lucide-react";

interface QuickScriptureCardProps {
  id: string;
  reference: string;
  text: string;
  backgroundImage?: string;
  onNavigate: () => void;
  onRemove: () => void;
  isDarkMode: boolean;
}

export const QuickScriptureCard: React.FC<QuickScriptureCardProps> = ({
  reference,
  text,
  backgroundImage,
  onNavigate,
  onRemove,
}) => {
  const truncatedText = text.length > 90 ? text.substring(0, 90) + "…" : text;
  const hasImage = !!backgroundImage;

  return (
    <div
      className="relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-200 h-[4.5rem] border border-select-border hover:border-select-border-hover hover:shadow-md"
      onClick={onNavigate}
    >
      {/* Background: image or theme surface */}
      {hasImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {/* Dark scrim for text legibility over images */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </>
      ) : (
        <div className="absolute inset-0 bg-select-bg" />
      )}

      {/* Content */}
      <div className="relative z-10 p-2.5 flex flex-col h-full justify-between">
        {/* Reference + remove */}
        <div className="flex items-start justify-between gap-1">
          <span
            className={`text-[0.73rem] font-bold leading-tight ${
              hasImage
                ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                : "text-text-primary"
            }`}
          >
            {reference}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer ${
              hasImage
                ? "hover:bg-red-500/80 text-white/80 hover:text-white"
                : "hover:bg-red-500/10 text-text-secondary hover:text-red-500"
            }`}
            title="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Text preview */}
        <span
          className={`text-[0.67rem] line-clamp-2 leading-snug ${
            hasImage
              ? "text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
              : "text-text-secondary"
          }`}
        >
          {truncatedText}
        </span>
      </div>
    </div>
  );
};
