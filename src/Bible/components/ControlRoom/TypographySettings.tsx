import React, { useState, useEffect, useMemo } from "react";
import { Type } from "lucide-react";

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

  // Memoized filtered list — single O(n) pass per query/font-list change
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
          // Keep default fonts on error
        } finally {
          setLoadingFonts(false);
        }
      }
    };
    loadSystemFonts();
  }, []);
  return (
    <div className="w-full space-y-4">
      {/* Section header */}
      <div className="px-1 pb-1">
        <h3 className="text-sm font-semibold text-text-primary">Typography</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Font size and family for projection
        </p>
      </div>

      <div
        className="p-4 rounded-xl w-full"
        style={{
          background: "var(--select-hover)",
          border: "1px solid var(--select-border)",
        }}
      >
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
                  style={{ background: "var(--select-bg)" }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer 
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:bg-btn-active-from
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-0"
                />
              </div>

              <div
                onClick={() =>
                  handleFontSizeChange(Math.min(90, projectionFontSize + 2))
                }
                className="w-8 h-8 rounded-xl text-text-primary hover:opacity-80 transition-all duration-200 font-bold text-sm cursor-pointer flex items-center justify-center"
                style={{ background: "var(--select-bg)" }}
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
            <div
              className="p-3 rounded-xl mt-4"
              style={{
                background: "var(--select-bg)",
                border: "1px solid var(--select-border)",
              }}
            >
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
              className="w-full px-3 py-2 mb-2 text-sm rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-select-border/30 transition-colors"
              style={{
                background: "var(--select-bg)",
                border: "1px solid var(--select-border)",
              }}
            />

            <div
              className="space-y-0 max-h-80 overflow-y-auto no-scrollbar rounded-xl"
              style={{
                background: "var(--select-bg)",
                border: "1px solid var(--select-border)",
              }}
            >
              {filteredFonts.map((font) => (
                <div
                  key={font}
                  onClick={() => handleFontFamilyChange(font)}
                  className={`w-full p-3 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-select-border/40 last:border-b-0 cursor-pointer hover:bg-select-hover ${
                    projectionFontFamily === font
                      ? "text-text-primary font-semibold"
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
              {filteredFonts.length === 0 && (
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
