import React from "react";
import { Palette } from "lucide-react";

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
  const swatchColors = [
    "#ffffff",
    "#f3f4f6",
    "#9ca3af",
    "#6b7280",
    "#1f2937",
    "#111827",
    "#000000",
    "#fcd8c0",
    "#fca5a5",
    "#fde68a",
    "#a7f3d0",
    "#bfdbfe",
    "#c4b5fd",
    "#fbcfe8",
  ];

  return (
    <div className="w-full space-y-4">
      {/* Section header */}
      <div className="px-1 pb-1">
        <h3 className="text-sm font-semibold text-text-primary">
          Text Appearance
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Adjust projection text color
        </p>
      </div>

      {/* Current color row */}
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
            <Palette className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Text Color</p>
            <p className="text-xs text-text-secondary font-mono mt-0.5">
              {projectionTextColor}
            </p>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: projectionTextColor,
            border: "1px solid var(--select-border)",
          }}
        />
      </div>

      {/* Color swatches */}
      <div
        className="p-3 rounded-xl"
        style={{
          background: "var(--select-hover)",
          border: "1px solid var(--select-border)",
        }}
      >
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 px-1">
          Color Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {swatchColors.map((color) => (
            <button
              key={color}
              onClick={() => handleTextColorChange(color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all duration-100 hover:scale-110 cursor-pointer ${
                projectionTextColor === color
                  ? "border-blue-400 ring-2 ring-blue-400/30"
                  : "border-select-border hover:border-text-secondary"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div
        className="p-3 rounded-xl"
        style={{
          background: "var(--select-hover)",
          border: "1px solid var(--select-border)",
        }}
      >
        <p
          style={{ color: projectionTextColor }}
          className="text-base font-semibold text-center leading-snug"
        >
          "For God so loved the world…"
        </p>
        <p className="text-xs text-text-secondary text-center mt-1 opacity-60">
          live preview
        </p>
      </div>
    </div>
  );
};
