import React from "react";
import { X } from "lucide-react";
import { DepthButton, DepthSurface } from "@/shared/DepthElement";

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
    <div className="relative group rounded-xl overflow-hidden h-[4.5rem]">
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--select-bg) 0%, var(--select-hover) 50%, var(--select-bg-alt) 100%)",
          }}
        />
      )}

      <div
        onClick={onNavigate}
        className="absolute inset-0 transition-all duration-200 hover:scale-[1.01] border-none bg-studio-bg"
        // surfaceClassName={
        //   hasImage
        //     ? "bg-transparent border border-select-border"
        //     : " border border-select-border"
        // }
      >
        {/* Content */}
        <div className="relative z-10 p-2.5 flex flex-col h-full justify-between">
          {/* Reference + remove */}
          <div className="flex items-start justify-between gap-1">
            <span
              className={`text-[0.73rem] font-bold leading-tight ${
                hasImage
                  ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                  : "text-black/90 dark:text-white/90"
              }`}
            >
              {reference}
            </span>
            <DepthButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              sizeClassName="w-5 h-5 rounded-md"
              inactiveClassName={
                backgroundImage
                  ? "text-white/80 border-white/40 hover:text-white"
                  : "text-text-secondary border-select-border hover:text-red-500"
              }
              activeClassName="text-text-primary border-btn-active-from"
              className={`flex-shrink-0 transition-opacity ${
                backgroundImage ? "opacity-0 group-hover:opacity-100" : "opacity-70"
              }`}
              title="Remove"
            >
              <X className="w-3 h-3" />
            </DepthButton>
          </div>

          {/* Text preview */}
          <span
            className={`text-[0.67rem] line-clamp-2 leading-snug ${
              backgroundImage
                ? "text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                : "text-black dark:text-white"
            }`}
          >
            {truncatedText}
          </span>
        </div>
      </div>
    </div>
  );
};
