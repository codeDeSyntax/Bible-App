import React from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveFeature,
  setFontSize,
  setFontWeight,
  setFontFamily,
  setVerseTextColor,
} from "@/store/slices/bibleSlice";
import { CustomSelect } from "@/shared/Selector";

const SettingsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);

  const fontOptions = [
    { value: "'Helvetica', sans-serif", text: "Helvetica" },
    { value: "'Courier New', Courier, monospace", text: "Courier New" },
    { value: "'Verdana', sans-serif", text: "Verdana" },
    { value: "'Impact', Charcoal, sans-serif", text: "Impact" },
    { value: "'Georgia', serif", text: "Georgia" },
    { value: "serif", text: "Serif" },
    { value: "sans-serif", text: "Sans-serif" },
    { value: "Palatino", text: "Palatino" },
    { value: "garamond", text: "Garamond" },
    { value: "Bookman", text: "Bookman" },
    { value: "Comic Sans MS", text: "Comic Sans MS" },
    { value: "Trebuchet MS", text: "Trebuchet MS" },
    { value: "cursive", text: "cursive" },
  ];

  const fontSizeOptions = [
    { value: "xs", text: "Extra Small" },
    { value: "sm", text: "Small" },
    { value: "base", text: "Base" },
    { value: "small", text: "Small+" },
    { value: "medium", text: "Medium" },
    { value: "large", text: "Large" },
    { value: "xl", text: "Extra Large" },
    { value: "2xl", text: "XX-Large" },
  ];

  const fontWeightOptions = [
    { value: "normal", text: "Normal" },
    { value: "bold", text: "Bold" },
    { value: "bolder", text: "Bolder" },
    { value: "lighter", text: "Lighter" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white dark:bg-[#1a1a1a]/80 rounded-3xl w-1/2 h-[60vh] overflow-hidden pointer-events-auto font-garamond">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Settings
            </h2>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div
            className="p-4 overflow-y-scroll no-scrollbar"
            style={{ height: "calc(60vh - 4rem)" }}
          >
            <div className="space-y-6">
              {/* Font Size */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Font Size
                </label>
                <CustomSelect
                  value={fontSize}
                  onChange={(value) => dispatch(setFontSize(value))}
                  options={[
                    { value: "small", text: "Small" },
                    { value: "medium", text: "Medium" },
                    { value: "large", text: "Large" },
                    { value: "xl", text: "Extra Large" },
                    { value: "2xl", text: "2X Large" },
                  ]}
                  className="w-full bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 rounded-lg"
                />
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Font Family
                </label>
                <CustomSelect
                  value={fontFamily}
                  onChange={(value) => dispatch(setFontFamily(value))}
                  options={fontOptions}
                  className="w-full bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 rounded-lg"
                />
              </div>

              {/* Font Weight */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Font Weight
                </label>
                <CustomSelect
                  value={fontWeight}
                  onChange={(value) => dispatch(setFontWeight(value))}
                  options={[
                    { value: "normal", text: "Normal" },
                    { value: "medium", text: "Medium" },
                    { value: "semibold", text: "Semibold" },
                    { value: "bold", text: "Bold" },
                  ]}
                  className="w-full bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 rounded-lg"
                />
              </div>

              {/* Verse Text Color */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Verse Text Color
                </label>
                <CustomSelect
                  value={verseTextColor}
                  onChange={(value) => dispatch(setVerseTextColor(value))}
                  options={[
                    { value: "#1d1c1c", text: "Black" },
                    { value: "#fcd8c0", text: "Light Orange" },
                    { value: "#4a5568", text: "Gray" },
                    { value: "#2d3748", text: "Dark Gray" },
                  ]}
                  className="w-full bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-100 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
