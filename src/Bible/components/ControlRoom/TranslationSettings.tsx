import React from "react";
import { Globe } from "lucide-react";

interface TranslationSettingsProps {
  availableTranslations: string[];
  selectedTranslation: string;
  handleTranslationChange: (translationId: string) => void;
}

export const TranslationSettings: React.FC<TranslationSettingsProps> = ({
  availableTranslations,
  selectedTranslation,
  handleTranslationChange,
}) => {
  return (
    <div className="w-full space-y-3">
      <div className="bg-card-bg rounded-xl p-4 border border-card-bg-alt shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">Bible Translation</h3>
          </div>
          {selectedTranslation && (
            <span className="text-xs font-semibold text-text-primary bg-card-bg-alt px-2 py-0.5 rounded-full truncate max-w-[120px]">
              {selectedTranslation}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
          {availableTranslations.map((translation) => (
            <div
              key={translation}
              onClick={() => handleTranslationChange(translation)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                selectedTranslation === translation
                  ? "border-btn-active-from bg-gradient-to-r from-btn-active-from to-btn-active-to text-white shadow-sm"
                  : "border-card-bg-alt bg-card-bg-alt text-text-primary hover:border-select-border hover:bg-select-hover"
              }`}
            >
              <div className="text-xs font-bold truncate">{translation}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
