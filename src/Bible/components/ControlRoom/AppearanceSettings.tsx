import React from "react";
import { Sparkles } from "lucide-react";
import { CustomSelect } from "../BibleStudio/CustomSelect";

interface AppearanceSettingsProps {
  projectionTextColor?: string;
  darkMode?: boolean;
  colorPresets?: string[];
  handleTextColorChange?: (color: string) => void;
  currentTheme?: string;
  themeOptions?: { label: string; value: string }[];
  handleThemeChange?: (theme: string) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  darkMode = true,
  currentTheme = "gray",
  themeOptions = [],
  handleThemeChange,
}) => {
  return (
    <div className="w-full space-y-4 max-w-2xl">
      {/* Section header */}
      <div className="px-1">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          Appearance & Themes
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Customize your Bible Studio workspace theme and visual palette
        </p>
      </div>

      {/* Studio Theme Selection Card */}
      {handleThemeChange && themeOptions.length > 0 && (
        <div className="rounded-xl bg-card-bg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-select-bg text-text-primary shadow-2xs flex-shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  Studio Color Theme
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  Select a curated color palette for your workspace
                </div>
              </div>
            </div>

            <CustomSelect
              value={currentTheme}
              options={themeOptions}
              onChange={handleThemeChange}
              placeholder="Select Theme"
              isDarkMode={darkMode}
              width={160}
              showSearch={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
