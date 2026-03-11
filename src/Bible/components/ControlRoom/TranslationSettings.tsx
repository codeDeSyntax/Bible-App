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
    <div className="w-full space-y-4">
      {/* Section header */}
      <div className="px-1 pb-1">
        <h3 className="text-sm font-semibold text-text-primary">
          Bible Translation
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Select the active Bible translation
        </p>
      </div>

      {/* Active translation indicator */}
      {selectedTranslation && (
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            background: "var(--select-hover)",
            border: "1px solid var(--select-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--select-bg)" }}
            >
              <Globe className="w-4 h-4 text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Active Translation
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {selectedTranslation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Translation grid */}
      <div
        className="p-3 rounded-xl"
        style={{
          background: "var(--select-hover)",
          border: "1px solid var(--select-border)",
        }}
      >
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
