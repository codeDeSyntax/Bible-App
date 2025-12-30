import React, { useState, useEffect } from "react";
import { Type } from "lucide-react";

interface TypographySettingsProps {
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  verseByVerseAutoSize: boolean;
  handleFontFamilyChange: (fontFamily: string) => void;
  handleFontSizeChange: (size: number) => void;
  handleAutoSizeChange: (enabled: boolean) => void;
}

export const TypographySettings: React.FC<TypographySettingsProps> = ({
  projectionFontFamily,
  projectionFontSize,
  projectionTextColor,
  verseByVerseAutoSize,
  handleFontFamilyChange,
  handleFontSizeChange,
  handleAutoSizeChange,
}) => {
  // State for system fonts
  const [fontOptions, setFontOptions] = useState<string[]>([
    "Arial Black",
    "EB Garamond",
    "Anton SC",
    "Big Shoulders Thin",
    "Bitter Thin",
    "Oswald ExtraLight",
    "Archivo Black",
    "Roboto Thin",
    "Cooper Black",
    "Impact",
    "Teko Light",
    "serif",
    "sans-serif",
  ]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState("");

  // Load system fonts on mount
  useEffect(() => {
    const loadSystemFonts = async () => {
      if (typeof window !== "undefined" && window.api?.getSystemFonts) {
        try {
          setLoadingFonts(true);
          const fonts = await window.api.getSystemFonts();
          setFontOptions(fonts);
        } catch (error) {
          console.error("Failed to load system fonts:", error);
          // Keep default fonts on error
        } finally {
          setLoadingFonts(false);
        }
      }
    };
    loadSystemFonts();
  }, []);
  return (
    <div className="space-y-4 w-full">
      <div className="bg-card-bg rounded-2xl p-4 border border-card-bg-alt shadow-lg backdrop-blur-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
            <Type className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Typography Settings
            </h3>
            <p className="text-sm text-text-secondary">
              Configure font size and text appearance
            </p>
          </div>
        </div>

        {/* Auto-Size Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary text-sm">
                Auto-Size Text
              </div>
              <p className="text-sm text-text-secondary">
                {verseByVerseAutoSize
                  ? "Text automatically fits container"
                  : "Uses manual font size control"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={verseByVerseAutoSize}
                onChange={(e) => handleAutoSizeChange(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-8 h-5 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-select-border/50 relative transition-all duration-200 ${
                  verseByVerseAutoSize ? "bg-card-bg-alt" : "bg-select-bg"
                }`}
              >
                <div
                  className={`absolute top-[1px] left-[1px] bg-card-bg border border-card-bg-alt dark:border-card-bg rounded-full h-4 w-4 transition-all duration-200 ${
                    verseByVerseAutoSize ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Font Size - Left Side */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Font Size: {projectionFontSize}px
            </label>
            <div className="flex items-center gap-3">
              <div
                onClick={() =>
                  handleFontSizeChange(Math.max(50, projectionFontSize - 2))
                }
                className="w-8 h-8 rounded-xl bg-select-bg text-text-primary hover:bg-select-hover transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
              >
                −
              </div>

              <div className="flex-1">
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={projectionFontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="w-full h-2 bg-card-bg-alt dark:bg-card-bg rounded-lg appearance-none cursor-pointer 
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-header-gradient-from [&::-webkit-slider-thumb]:to-header-gradient-to 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-0"
                />
              </div>

              <div
                onClick={() =>
                  handleFontSizeChange(Math.min(90, projectionFontSize + 2))
                }
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-header-gradient-from to-header-gradient-to text-white hover:opacity-95 transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
              >
                +
              </div>
            </div>

            <div className="flex justify-between text-sm text-text-secondary mt-2">
              <span>50px</span>
              <span>65px</span>
              <span>90px</span>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-xl bg-card-bg-alt text-text-secondary border border-card-bg-alt shadow-md mt-4">
              <div className="text-center">
                <p
                  style={{
                    fontSize: `${Math.min(projectionFontSize * 0.4, 24)}px`,
                    color: projectionTextColor || "var(--text-primary)",
                    fontFamily: projectionFontFamily.includes(" ")
                      ? `"${projectionFontFamily}"`
                      : projectionFontFamily,
                    fontWeight: "bold",
                  }}
                  className="font-bold"
                >
                  "In the beginning was the Word"
                </p>
                <p className="text-sm text-text-secondary mt-2">Font Preview</p>
              </div>
            </div>
          </div>

          {/* Font Family - Right Side */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Font Family
              {loadingFonts && (
                <span className="text-sm text-text-secondary ml-2">
                  Loading fonts...
                </span>
              )}
            </label>

            {/* Font Search */}
            <input
              type="text"
              placeholder="Search fonts..."
              value={fontSearchQuery}
              onChange={(e) => setFontSearchQuery(e.target.value)}
              className="w-full px-3 py-2 mb-2 text-sm rounded-lg border border-card-bg-alt dark:border-card-bg bg-card-bg dark:bg-card-bg/95 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-select-border/30 transition-colors"
            />

            <div className="space-y-0 max-h-80 overflow-y-auto no-scrollbar border border-card-bg-alt dark:border-card-bg rounded-xl bg-card-bg/60 dark:bg-card-bg">
              {fontOptions
                .filter((font) =>
                  font.toLowerCase().includes(fontSearchQuery.toLowerCase())
                )
                .map((font) => (
                  <div
                    key={font}
                    onClick={() => {
                      console.log(
                        "🖱️ Font clicked in TypographySettings:",
                        font
                      );
                      console.log(
                        "🔍 handleFontFamilyChange function exists?",
                        typeof handleFontFamilyChange
                      );
                      console.log(
                        "🔍 handleFontFamilyChange is:",
                        handleFontFamilyChange
                      );
                      handleFontFamilyChange(font);
                      console.log(
                        "✅ handleFontFamilyChange called successfully"
                      );
                    }}
                    className={`w-full p-3 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-card-bg-alt/50 dark:border-select-border last:border-b-0 cursor-pointer hover:bg-card-bg/40 dark:hover:bg-card-bg/30 ${
                      projectionFontFamily === font
                        ? "bg-card-bg-alt/10 text-text-primary"
                        : "text-text-primary"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm mb-1">{font}</div>
                      <div
                        className="text-sm text-text-secondary"
                        style={{
                          fontFamily: font.includes(" ") ? `"${font}"` : font,
                        }}
                      >
                        "For God so loved the world..."
                      </div>
                    </div>
                  </div>
                ))}
              {fontOptions.filter((font) =>
                font.toLowerCase().includes(fontSearchQuery.toLowerCase())
              ).length === 0 && (
                <div className="p-3 text-center text-sm text-text-secondary">
                  No fonts found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
