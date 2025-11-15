import React, { useState } from "react";
import { Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface TextPresetFormProps {
  randomText: string;
  setRandomText: (text: string) => void;
  onSave: (data: {
    text: string;
    fontSize: number;
    fontFamily: string;
    textAlign: "left" | "center" | "right";
    textColor: string;
    backgroundColor: string;
  }) => void;
}

export const TextPresetForm: React.FC<TextPresetFormProps> = ({
  randomText,
  setRandomText,
  onSave,
}) => {
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");

  const fontOptions = [
    "Arial",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
    "Trebuchet MS",
    "Tahoma",
  ];

  return (
    <div className="bg-gray-50 dark:bg-[#1c1c1c] rounded-lg p-4 border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center shadow-md">
          <Type className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#313131] dark:text-[#f9fafb]">
          Text Preset
        </h4>
      </div>

      <div className="space-y-2">
        {/* Text Input */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Custom Text
          </label>
          <textarea
            value={randomText}
            onChange={(e) => setRandomText(e.target.value)}
            placeholder="Enter any text to display..."
            rows={3}
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#1a1410] resize-none transition-colors"
          />
        </div>

        {/* Font Family */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white focus:outline-none focus:bg-gray-200 dark:focus:bg-[#1a1410] transition-colors"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
            <span>Font Size</span>
            <span className="font-semibold">{fontSize}px</span>
          </label>
          <input
            type="range"
            min="16"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#313131] dark:accent-[#b8835a]"
          />
        </div>

        {/* Text Alignment */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Text Alignment
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => setTextAlign("left")}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                textAlign === "left"
                  ? "bg-[#313131] dark:bg-[#b8835a] text-white"
                  : "bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1a1410]"
              }`}
            >
              <AlignLeft className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={() => setTextAlign("center")}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                textAlign === "center"
                  ? "bg-[#313131] dark:bg-[#b8835a] text-white"
                  : "bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1a1410]"
              }`}
            >
              <AlignCenter className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={() => setTextAlign("right")}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                textAlign === "right"
                  ? "bg-[#313131] dark:bg-[#b8835a] text-white"
                  : "bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1a1410]"
              }`}
            >
              <AlignRight className="w-3 h-3 mx-auto" />
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs rounded bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  backgroundColor === "transparent"
                    ? "#000000"
                    : backgroundColor
                }
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <button
                onClick={() =>
                  setBackgroundColor(
                    backgroundColor === "transparent"
                      ? "#000000"
                      : "transparent"
                  )
                }
                className="flex-1 px-2 py-1 text-xs rounded bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              >
                {backgroundColor === "transparent" ? "None" : backgroundColor}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        {randomText && (
          <div className="mt-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10 overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Preview:
            </p>
            <div
              style={{
                fontFamily,
                fontSize: `${fontSize * 0.4}px`,
                textAlign,
                color: textColor,
                backgroundColor: backgroundColor,
                padding: "8px",
                borderRadius: "4px",
                wordWrap: "break-word",
              }}
            >
              {randomText}
            </div>
          </div>
        )}

        <button
          onClick={() =>
            onSave({
              text: randomText,
              fontSize,
              fontFamily,
              textAlign,
              textColor,
              backgroundColor,
            })
          }
          disabled={!randomText}
          className="w-full mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] text-white hover:from-[#252525] hover:to-[#202020] dark:hover:from-[#c99466] dark:hover:to-[#9a6e48] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
        >
          Save & Project
        </button>
      </div>
    </div>
  );
};
