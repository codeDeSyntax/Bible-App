import React from "react";
import { Palette, Sun, Moon } from "lucide-react";

interface AppearanceSettingsProps {
  projectionTextColor: string;
  darkMode: boolean;
  colorPresets: string[];
  handleTextColorChange: (color: string) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  projectionTextColor,
  darkMode,
  colorPresets,
  handleTextColorChange,
}) => {
  return (
    <div className="space-y-4 w-full">
      {/* Text Color */}
      <div className="bg-card-bg rounded-2xl p-4 border border-card-bg-alt shadow-lg backdrop-blur-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-lg">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Text Color
            </h3>
            <p className="text-sm text-text-secondary">
              Choose the color for scripture text
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Color Presets */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Quick Colors
            </label>
            <div className="grid grid-cols-8 gap-2">
              {[
                "#fcd8c0", // Default dark mode
                "#000000", // Default light mode (black)
                "#ffffff", // White
                "#f3f4f6", // Light gray
                "#9ca3af", // Gray
                "#6b7280", // Dark gray
                "#1f2937", // Very dark gray
                "#111827", // Almost black
              ].map((color) => (
                <div
                  key={color}
                  onClick={() => handleTextColorChange(color)}
                  className={`w-8 h-8 rounded-xl border transition-all hover:scale-110 shadow-md cursor-pointer ${
                    projectionTextColor === color
                      ? "border-focus-border ring-1 ring-focus-border/30"
                      : "border-card-bg-alt"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-xl bg-select-bg border border-card-bg-alt shadow-md">
            <div className="text-center">
              <p
                style={{ color: projectionTextColor }}
                className="text-lg font-semibold"
              >
                "For God so loved the world..."
              </p>
              <p className="text-[0.9rem] text-text-secondary mt-1">
                Text Preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
