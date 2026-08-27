import React from "react";
import { Monitor, BookOpen, Check } from "lucide-react";

interface DisplaySettingsProps {
  highlightJesusWords: boolean;
  showScriptureReference: boolean;
  scriptureReferenceColor: string;
  handleJesusWordsToggle: () => void;
  handleScriptureReferenceToggle: () => void;
  handleScriptureReferenceColorChange: (color: string) => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div
      className={`w-10 h-6 rounded-full relative transition-all duration-200 ${
        checked ? "bg-btn-active-from" : "bg-select-bg"
      }`}
    >
      <div
        className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all duration-200 shadow-sm ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  </label>
);

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  highlightJesusWords,
  showScriptureReference,
  scriptureReferenceColor = "#ff1e1e",
  handleJesusWordsToggle,
  handleScriptureReferenceToggle,
  handleScriptureReferenceColorChange,
}) => {
  const referenceColors = [
    { name: "Vivid Red", color: "#ff1e1e" },
    { name: "Crimson", color: "#dc2626" },
    { name: "Orange", color: "#f97316" },
    { name: "Yellow", color: "#eab308" },
    { name: "Green", color: "#22c55e" },
    { name: "Blue", color: "#3b82f6" },
    { name: "Purple", color: "#a855f7" },
    { name: "Pink", color: "#ec4899" },
    { name: "White", color: "#ffffff" },
    { name: "Gray", color: "#9ca3af" },
  ];

  return (
    <div className="w-full space-y-3.5 max-w-2xl">
      {/* Section header */}
      <div className="px-1">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          Display Options
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure projection display overlays and text highlights
        </p>
      </div>

      {/* Highlight Jesus' Words */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card-bg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-primary shadow-2xs">
            <Monitor className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Highlight Jesus' Words
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {highlightJesusWords
                ? "Red letter text formatting active on projection"
                : "Standard text color throughout"}
            </p>
          </div>
        </div>
        <Toggle
          checked={highlightJesusWords}
          onChange={handleJesusWordsToggle}
        />
      </div>

      {/* Scripture Reference Toggle Card */}
      <div className="rounded-xl bg-card-bg p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-primary shadow-2xs">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Show Scripture Reference
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {showScriptureReference
                  ? "Book, chapter & verse displayed on projection footer"
                  : "Scripture reference hidden"}
              </p>
            </div>
          </div>
          <Toggle
            checked={showScriptureReference}
            onChange={handleScriptureReferenceToggle}
          />
        </div>

        {/* Reference color presets — shown when toggle is on */}
        {showScriptureReference && (
          <div className="pt-3 border-t border-dashed border-select-border/60 space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[0.7rem] font-bold text-text-secondary uppercase tracking-wider">
                Reference Color
              </span>
              <span className="text-[0.65rem] text-text-secondary font-mono">
                {scriptureReferenceColor}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {referenceColors.map((preset) => {
                const isSelected =
                  scriptureReferenceColor?.toLowerCase() ===
                  preset.color.toLowerCase();
                return (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() =>
                      handleScriptureReferenceColorChange(preset.color)
                    }
                    className={`w-7 h-7 rounded-lg transition-all duration-150 hover:scale-110 cursor-pointer flex items-center justify-center shadow-2xs ${
                      isSelected
                        ? "ring-2 ring-btn-active-from ring-offset-2 ring-offset-card-bg scale-110 shadow-sm"
                        : "hover:shadow-xs"
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          preset.color === "#ffffff" || preset.color === "#eab308"
                            ? "text-black"
                            : "text-white"
                        }`}
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Preview Chip */}
            <div className="px-3.5 py-2 rounded-lg bg-select-bg flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-text-secondary" />
                <span
                  className="text-xs font-bold tracking-wide"
                  style={{ color: scriptureReferenceColor }}
                >
                  John 3:16
                </span>
              </div>
              <span className="text-[0.62rem] text-text-secondary font-semibold uppercase tracking-wider">
                Preview
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplaySettings;
