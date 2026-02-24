import React from "react";
import { Monitor, BookOpen } from "lucide-react";

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
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div
      className={`w-10 h-6 rounded-full relative transition-all duration-200 ${
        checked ? "bg-btn-active-from" : "bg-select-bg"
      }`}
    >
      <div
        className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all duration-200 border border-select-border ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  </label>
);

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  highlightJesusWords,
  showScriptureReference,
  scriptureReferenceColor,
  handleJesusWordsToggle,
  handleScriptureReferenceToggle,
  handleScriptureReferenceColorChange,
}) => {
  const referenceColors = [
    { name: "Red", color: "#ef4444" },
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
    <div className="space-y-4 w-full">
      <div className="bg-card-bg rounded-xl p-4 border border-card-bg-alt shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Display Options</h3>
        </div>

        <div className="space-y-4">
          {/* Highlight Jesus Words */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">Highlight Jesus' Words</div>
              <div className="text-sm text-text-secondary">
                {highlightJesusWords ? "Shown in red on projection" : "Standard text color"}
              </div>
            </div>
            <Toggle checked={highlightJesusWords} onChange={handleJesusWordsToggle} />
          </div>

          <div className="border-t border-card-bg-alt" />

          {/* Scripture Reference Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">Show Scripture Reference</div>
              <div className="text-sm text-text-secondary">
                {showScriptureReference
                  ? "Displayed at bottom of projection"
                  : "Reference hidden"}
              </div>
            </div>
            <Toggle checked={showScriptureReference} onChange={handleScriptureReferenceToggle} />
          </div>

          {/* Reference color - shown when toggle is on */}
          {showScriptureReference && (
            <div className="pl-4 border-l-2 border-select-border space-y-3">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Reference Color
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {referenceColors.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => handleScriptureReferenceColorChange(preset.color)}
                    className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: preset.color,
                      borderColor:
                        scriptureReferenceColor === preset.color
                          ? "var(--btn-active-from)"
                          : "var(--card-bg-alt)",
                      boxShadow:
                        scriptureReferenceColor === preset.color
                          ? "0 0 0 2px var(--btn-active-from)"
                          : undefined,
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
              <div className="px-4 py-3 rounded-xl bg-card-bg-alt border border-select-border flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-text-secondary flex-shrink-0" />
                <span className="text-sm font-bold" style={{ color: scriptureReferenceColor }}>
                  John 3:16
                </span>
                <span className="text-xs text-text-secondary">preview</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;
