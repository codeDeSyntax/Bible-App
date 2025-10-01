import React from "react";

interface TabletHighlightPickerProps {
  highlightPickerOpen: number | null;
  setHighlightPickerOpen: (verse: number | null) => void;
  highlightVerse: (verse: number, color: string) => void;
}

const TabletHighlightPicker: React.FC<TabletHighlightPickerProps> = ({
  highlightPickerOpen,
  setHighlightPickerOpen,
  highlightVerse,
}) => {
  const highlightColors = [
    "#fef3c7",
    "#fde68a",
    "#fcd34d",
    "#f59e0b",
    "#e7e5e4",
    "#d6d3d1",
    "#a8a29e",
    "#78716c",
    "#ddd6fe",
    "#c4b5fd",
    "#a78bfa",
    "#8b5cf6",
    "#fecaca",
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#bbf7d0",
    "#86efac",
    "#4ade80",
    "#16a34a",
    "#bfdbfe",
    "#60a5fa",
    "#3b82f6",
    "#1d4ed8",
  ];

  if (!highlightPickerOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Choose Highlight Color
        </h3>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {highlightColors.map((color) => (
            <button
              key={color}
              onClick={() => {
                highlightVerse(highlightPickerOpen, color);
                setHighlightPickerOpen(null);
              }}
              className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setHighlightPickerOpen(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              highlightVerse(highlightPickerOpen, "");
              setHighlightPickerOpen(null);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Remove Highlight
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabletHighlightPicker;
