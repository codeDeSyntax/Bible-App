import React from "react";
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
  return (
    <div className="space-y-4 w-full">
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center shadow-md">
            <Type className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Typography Settings
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure font size and text appearance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Font Size - Left Side */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Size: {projectionFontSize}px
            </label>
            <div className="flex items-center gap-3">
              <div
                onClick={() =>
                  handleFontSizeChange(Math.max(50, projectionFontSize - 2))
                }
                className="w-8 h-8 rounded-xl bg-white/60 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
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
                  className="w-full h-2 bg-gray-200 dark:bg-[#313131] rounded-lg appearance-none cursor-pointer 
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#313131] [&::-webkit-slider-thumb]:to-[#303030] 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-0"
                />
              </div>

              <div
                onClick={() =>
                  handleFontSizeChange(Math.min(90, projectionFontSize + 2))
                }
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#313131] to-[#303030] text-white hover:from-[#303030] hover:to-[#303030] transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
              >
                +
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>50px</span>
              <span>65px</span>
              <span>90px</span>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-xl bg-[#313131] border border-white/10 shadow-md mt-4">
              <div className="text-center">
                <p
                  style={{
                    fontSize: `${Math.min(projectionFontSize * 0.4, 24)}px`,
                    color: projectionTextColor,
                    fontFamily: projectionFontFamily,
                    fontWeight: "bold",
                  }}
                  className="font-bold"
                >
                  "In the beginning was the Word"
                </p>
                <p className="text-xs text-gray-400 mt-2">Font Preview</p>
              </div>
            </div>
          </div>

          {/* Font Family - Right Side */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Family
            </label>
            <div className="space-y-0 max-h-80 overflow-y-auto no-scrollbar border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-black/20">
              {[
                { value: "Arial Black", text: "Arial black" },
                { value: "EB Garamond", text: "EB Garamond" },
                { value: "Anton SC", text: "Anton SC" },
                {
                  value: "Big Shoulders Thin",
                  text: "Big Shoulders",
                },
                { value: "Bitter Thin", text: "Bitter" },
                { value: "Oswald ExtraLight", text: "Oswald" },
                { value: "Archivo Black", text: "Archivo Black" },
                { value: "Roboto Thin", text: "Roboto" },
                { value: "Cooper Black", text: "Cooper Black" },
                { value: "Impact", text: "Impact" },
                { value: "Teko Light", text: "Teko" },
                { value: "serif", text: "Times New Roman" },
                { value: "sans-serif", text: "Arial" },
              ].map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => {
                    handleFontFamilyChange(option.value);
                  }}
                  className={`w-full p-3 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-gray-200/50 dark:border-gray-700/50 last:border-b-0 cursor-pointer hover:bg-white/40 dark:hover:bg-black/30 ${
                    projectionFontFamily === option.value
                      ? "bg-[#313131]/10 text-[#313131] dark:text-[#303030]"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm mb-1">
                      {option.text}
                    </div>
                    <div
                      className="text-xs text-gray-500 dark:text-gray-400"
                      style={{ fontFamily: option.value }}
                    >
                      "For God so loved the world..."
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
