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

  return (
    <div
      className="relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-200 h-[4.5rem] border border-select-border hover:border-white/20"
      onClick={onNavigate}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: backgroundImage ? undefined : "var(--select-bg)",
        }}
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-2.5 flex flex-col h-full justify-between">
        {/* Reference + remove */}
        <div className="flex items-start justify-between gap-1">
          <span
            className="text-[0.73rem] font-bold leading-tight"
            style={{
              color: backgroundImage ? "white" : "var(--text-primary)",
              textShadow: backgroundImage
                ? "0 1px 4px rgba(0,0,0,0.8)"
                : "none",
            }}
          >
            {reference}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/80"
            title="Remove"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Text preview */}
        <span
          className="text-[0.67rem] line-clamp-2 leading-snug"
          style={{
            color: backgroundImage
              ? "rgba(255,255,255,0.88)"
              : "var(--text-secondary)",
            textShadow: backgroundImage ? "0 1px 3px rgba(0,0,0,0.7)" : "none",
          }}
        >
          {truncatedText}
        </span>
      </div>
    </div>
  );
};
