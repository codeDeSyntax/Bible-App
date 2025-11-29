import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ColorPaletteProps {
  position: { x: number; y: number };
  onColorSelect: (color: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#9ca3af" },
  { name: "Reset", value: "" }, // Empty string to reset
];

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  position,
  onColorSelect,
  onClose,
  isDarkMode,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[100]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseLeave={onClose}
      >
        <div
          className="rounded-xl shadow-2xl border backdrop-blur-md p-2"
          style={{
            background: isDarkMode
              ? "linear-gradient(145deg, #2c2c2c, #1a1a1a)"
              : "linear-gradient(145deg, #f5f5f5, #ffffff)",
            border: `1px solid ${isDarkMode ? "#444" : "#ccc"}`,
            boxShadow: isDarkMode
              ? "0 20px 40px rgba(0,0,0,0.6)"
              : "0 20px 40px rgba(0,0,0,0.2)",
          }}
        >
          <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-2 px-1">
            Select Color
          </div>
          <div
            className="grid grid-cols-5 gap-1.5"
            style={{ maxWidth: "200px" }}
          >
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-all duration-200 relative group"
                style={{
                  backgroundColor:
                    color.value || (isDarkMode ? "#2c2c2c" : "#e5e7eb"),
                  borderColor: isDarkMode ? "#555" : "#d1d5db",
                }}
                title={color.name}
              >
                {color.name === "Reset" && (
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    ×
                  </span>
                )}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <div className="bg-black/80 text-white text-[9px] px-2 py-0.5 rounded">
                    {color.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
