import React, { useState, useEffect, useMemo } from "react";
import { Type, Search } from "lucide-react";

interface TypographySettingsProps {
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  handleFontFamilyChange: (fontFamily: string) => void;
  handleFontSizeChange: (size: number) => void;
}

export const TypographySettings: React.FC<TypographySettingsProps> = ({
  projectionFontFamily,
  projectionFontSize,
  projectionTextColor,
  handleFontFamilyChange,
  handleFontSizeChange,
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

  // Memoized filtered list
  const filteredFonts = useMemo(
    () =>
      fontOptions.filter((f) =>
        f.toLowerCase().includes(fontSearchQuery.toLowerCase()),
      ),
    [fontOptions, fontSearchQuery],
  );

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
        } finally {
          setLoadingFonts(false);
        }
      }
    };
    loadSystemFonts();
  }, []);

  return (
    <div className="w-full space-y-3.5">
      {/* Section header */}
      <div className="px-1">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          Typography Settings
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Projection scripture font sizing, typography weights, and system font families
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Font Size & Preview Card */}
        <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-primary shadow-2xs">
              <Type className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Font Sizing
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Current projection size: <span className="font-bold text-text-primary">{projectionFontSize}px</span>
              </p>
            </div>
          </div>

          {/* Stepper + Slider */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleFontSizeChange(Math.max(50, projectionFontSize - 2))
                }
                className="w-8 h-8 rounded-lg bg-select-bg text-text-primary hover:bg-select-hover transition-all font-bold text-sm shadow-2xs cursor-pointer flex items-center justify-center"
              >
                −
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={projectionFontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-select-bg
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:bg-btn-active-from
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-0"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  handleFontSizeChange(Math.min(90, projectionFontSize + 2))
                }
                className="w-8 h-8 rounded-lg bg-select-bg text-text-primary hover:bg-select-hover transition-all font-bold text-sm shadow-2xs cursor-pointer flex items-center justify-center"
              >
                +
              </button>
            </div>

            <div className="flex justify-between text-[0.68rem] text-text-secondary font-medium px-1">
              <span>50px (Small)</span>
              <span>70px (Default)</span>
              <span>90px (Large)</span>
            </div>
          </div>

          {/* Real-time Typography Preview */}
          <div className="p-4 rounded-xl bg-select-bg text-center space-y-1.5 shadow-inner">
            <p
              style={{
                fontSize: `${Math.min(projectionFontSize * 0.36, 22)}px`,
                color: "var(--text-primary)",
                fontFamily: projectionFontFamily.includes(" ")
                  ? `"${projectionFontFamily}"`
                  : projectionFontFamily,
              }}
              className="font-bold leading-relaxed tracking-wide"
            >
              “In the beginning was the Word…”
            </p>
            <p className="text-[0.65rem] text-text-secondary font-semibold uppercase tracking-wider">
              {projectionFontFamily} · {projectionFontSize}px
            </p>
          </div>
        </div>

        {/* Font Family Selection Card */}
        <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Font Family
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {loadingFonts ? "Loading system fonts…" : `${filteredFonts.length} fonts available`}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fonts…"
              value={fontSearchQuery}
              onChange={(e) => setFontSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg text-text-primary placeholder:text-text-secondary outline-none bg-white dark:bg-select-bg border border-neutral-200/90 dark:border-transparent shadow-2xs focus:ring-1 focus:ring-btn-active-from transition-all"
            />
          </div>

          {/* Font List */}
          <div className="space-y-0.5 max-h-56 overflow-y-auto no-scrollbar rounded-lg p-0.5">
            {filteredFonts.length === 0 ? (
              <div className="p-3 text-center text-xs text-text-secondary">
                No fonts found
              </div>
            ) : (
              filteredFonts.map((font) => {
                const isSelected = projectionFontFamily === font;
                return (
                  <div
                    key={font}
                    onClick={() => handleFontFamilyChange(font)}
                    className={`w-full px-3 py-2 rounded-md transition-all duration-100 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-btn-active-from text-white font-bold shadow-xs"
                        : "text-text-primary hover:bg-select-hover"
                    }`}
                  >
                    <span
                      className="text-xs truncate"
                      style={{
                        fontFamily: font.includes(" ") ? `"${font}"` : font,
                      }}
                    >
                      {font}
                    </span>
                    {isSelected && (
                      <span className="text-[0.6rem] uppercase tracking-wider opacity-90">
                        Active
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
