import React from "react";
import { Palette } from "lucide-react";

interface AppearanceSettingsProps {
  projectionTextColor: string;
  darkMode: boolean;
  colorPresets: string[];
  handleTextColorChange: (color: string) => void;
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="px-4 pt-4 pb-1">
    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
      {children}
    </span>
  </div>
);

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
    <div className="w-full h- overflow-y-auto no-scrollbar bg-card-bg rounded-2xl ">
      <SectionLabel>Projection Text Color</SectionLabel>

      {/* Current color row */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-select-hover transition-colors duration-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-select-bg text-text-secondary">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">
              Selected Color
            </div>
            <div className="text-xs text-text-secondary font-mono mt-0.5">
              {projectionTextColor}
            </div>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-lg border border-select-border flex-shrink-0"
          style={{ backgroundColor: projectionTextColor }}
        />
      </div>

      {/* Color swatches */}
      <div className="px-4 py-3">
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
      <div className="mx-4 my-1 px-4 py-3 rounded-lg border border-select-border bg-card-bg">
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
