import React from "react";
import { Library, X } from "lucide-react";
import { Tooltip } from "antd";

interface VisitedScriptureCardProps {
  reference: string;
  text: string;
  onNavigate: () => void;
  onRemove: () => void;
  isDarkMode: boolean;
}

/**
 * Visited Scripture Item (Receipt / Row Style)
 * Sleek, dashed-divider row matching the General settings tab view
 */
export const VisitedScriptureCard: React.FC<VisitedScriptureCardProps> = ({
  reference,
  text,
  onNavigate,
  onRemove,
}) => {
  const truncatedText =
    text && text.length > 70 ? text.substring(0, 70) + "…" : text || "Scripture passage";

  return (
    <Tooltip
      placement="left"
      mouseEnterDelay={0.3}
      title={
        <div className="max-w-[280px] p-1 flex flex-col gap-1 text-left select-none">
          <div className="font-bold text-xs text-lime-400 flex items-center gap-1 border-b border-white/15 pb-1">
            <Library className="w-3 h-3 text-lime-400" />
            {reference}
          </div>
          <p className="text-[11px] text-white/95 leading-relaxed max-h-36 overflow-y-auto pr-1">
            {text || "Scripture passage"}
          </p>
          <div className="text-[9.5px] text-white/60 pt-1 border-t border-white/10">
            Click to navigate to this reference
          </div>
        </div>
      }
    >
      <div
        onClick={onNavigate}
        className="group flex items-center justify-between px-1.5 py-1.5 hover:bg-select-hover/70 transition-colors duration-100 cursor-pointer border-b border-dashed border-select-border dark:border-select-border/60 last:border-b-0"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-select-bg text-text-secondary group-hover:text-text-primary transition-colors">
            <Library className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[0.73rem] font-bold text-text-primary leading-tight group-hover:text-btn-active-from transition-colors truncate">
              {reference}
            </div>
            <div className="text-[0.64rem] text-text-secondary mt-0.5 truncate leading-tight">
              {truncatedText}
            </div>
          </div>
        </div>

        <Tooltip title="Remove from history" placement="top">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </Tooltip>
      </div>
    </Tooltip>
  );
};
