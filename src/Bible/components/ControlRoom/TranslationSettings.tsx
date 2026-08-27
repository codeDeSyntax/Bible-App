import React from "react";
import { Globe, Check } from "lucide-react";

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
    <div className="w-full space-y-3.5 max-w-xl">
      {/* Section header */}
      <div className="px-1">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          Bible Translation
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Select the active scripture translation for studio browsing and projection
        </p>
      </div>

      {/* Active translation indicator */}
      {selectedTranslation && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-card-bg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-primary shadow-2xs">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Active Translation
              </p>
              <p className="text-xs text-text-secondary mt-0.5 font-medium">
                {selectedTranslation}
              </p>
            </div>
          </div>
          <span className="text-[0.62rem] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 tracking-wide uppercase">
            Active
          </span>
        </div>
      )}

      {/* Translation Selection Grid Card */}
      <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[0.7rem] font-bold text-text-secondary uppercase tracking-wider">
            Available Translations ({availableTranslations.length})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto no-scrollbar p-0.5">
          {availableTranslations.map((translation) => {
            const isSelected = selectedTranslation === translation;
            return (
              <button
                key={translation}
                type="button"
                onClick={() => handleTranslationChange(translation)}
                className={`p-3 rounded-lg text-left transition-all duration-150 cursor-pointer flex items-center justify-between shadow-2xs ${
                  isSelected
                    ? "bg-btn-active-from text-white font-bold shadow-xs scale-102"
                    : "bg-select-bg text-text-primary hover:bg-select-hover hover:text-text-primary"
                }`}
              >
                <div className="text-xs truncate font-medium">{translation}</div>
                {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
