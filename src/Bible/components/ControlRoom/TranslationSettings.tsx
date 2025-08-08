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
    <div className="space-y-4">
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bible Translation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose the Bible version for projection
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#906140]/10 border border-[#906140]/20 shadow-md">
            <div className="text-sm font-medium text-[#906140] dark:text-[#b8835a]">
              Currently Selected
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {selectedTranslation}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
            {availableTranslations.map((translation) => (
              <div
                key={translation}
                onClick={() => handleTranslationChange(translation)}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-105 shadow-md cursor-pointer ${
                  selectedTranslation === translation
                    ? "border-[#906140] bg-gradient-to-r from-[#906140] to-[#7d5439] text-white"
                    : "border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/20 text-gray-900 dark:text-white hover:border-[#906140]/50"
                }`}
              >
                <div className="text-sm font-bold">
                  {translation.toUpperCase()}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    selectedTranslation === translation
                      ? "text-white/90"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Bible Version
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
