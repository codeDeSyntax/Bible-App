import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, X, Highlighter } from "lucide-react";

interface ColorPaletteProps {
  position: { x: number; y: number };
  onColorSelect: (color: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: "Lemon Green", value: "#a3e635" },
  { name: "Yellow", value: "#facc15" },
  { name: "Orange", value: "#fb923c" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#a855f7" },
  { name: "Sky Blue", value: "#38bdf8" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Emerald", value: "#10b981" },
] as const;

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  position,
  onColorSelect,
  onClose,
  isDarkMode,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-[100] select-none"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        {/* Compact 3D Sculpted Physical Floating Capsule */}
        <div
          className="relative flex items-center px-2 py-1 rounded-full border-0 gap-1.5 transition-transform"
          style={{
            background: isDarkMode
              ? "linear-gradient(180deg, #2d2d32 0%, #1c1c20 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f0f0f4 100%)",
            boxShadow: isDarkMode
              ? "0 3px 0 0 #0f0f12, 0 4px 2px 0 rgba(0,0,0,0.7), 0 10px 20px -2px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)"
              : "0 3px 0 0 #d1d1d6, 0 4px 2px 0 rgba(0,0,0,0.08), 0 10px 18px -3px rgba(0, 0, 0, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)",
          }}
        >
          {/* 3D Raised Lemon Green Coin (Highlighter Icon) */}
          <div
            className="w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px] aspect-square rounded-full flex items-center justify-center flex-shrink-0 cursor-default p-0"
            style={{
              background: "linear-gradient(180deg, #bef264 0%, #a3e635 100%)",
              boxShadow:
                "0 1.5px 0 0 #65a30d, 0 2px 4px rgba(163, 230, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            }}
            title="Text Highlighter"
          >
            <Highlighter className="w-2.5 h-2.5 text-lime-950 stroke-[2.4]" />
          </div>

          {/* Subtle Divider */}
          <span className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5 flex-shrink-0" />

          {/* 3D Tactile Color Swatches */}
          <div className="flex items-center gap-1">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                title={`Highlight in ${color.name}`}
                className="w-4 h-4 min-w-[16px] min-h-[16px] max-w-[16px] max-h-[16px] aspect-square rounded-full transition-all duration-150 hover:scale-125 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 cursor-pointer focus:outline-none flex-shrink-0 border-0 p-0"
                style={{
                  backgroundColor: color.value,
                  boxShadow: isDarkMode
                    ? "0 1.5px 0 0 rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.45)"
                    : "0 1.5px 0 0 rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255, 255, 255, 0.65)",
                }}
              >
                <span className="sr-only">{color.name}</span>
              </button>
            ))}
          </div>

          {/* Subtle Divider */}
          <span className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-700 mx-0.5 flex-shrink-0" />

          {/* Remove Highlight / Eraser (Perfect 1:1 Circle 3D Micro Button) */}
          <button
            type="button"
            onClick={() => {
              onColorSelect("");
              onClose();
            }}
            title="Remove Highlight"
            className="w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px] aspect-square rounded-full p-0 flex items-center justify-center text-text-secondary hover:text-rose-500 transition-all duration-150 cursor-pointer border-0 active:translate-y-0.5 active:shadow-none flex-shrink-0"
            style={{
              background: isDarkMode
                ? "linear-gradient(180deg, #26262a 0%, #18181b 100%)"
                : "linear-gradient(180deg, #f4f4f6 0%, #e6e6ea 100%)",
              boxShadow: isDarkMode
                ? "0 1.5px 0 0 #0d0d0f, 0 1.5px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 1.5px 0 0 #d1d1d6, 0 1.5px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
            }}
          >
            <Eraser className="w-2.5 h-2.5 stroke-[2.2]" />
          </button>

          {/* Dismiss / Close (Perfect 1:1 Circle 3D Micro Button) */}
          <button
            type="button"
            onClick={onClose}
            title="Dismiss"
            className="w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px] aspect-square rounded-full p-0 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer border-0 active:translate-y-0.5 active:shadow-none flex-shrink-0"
            style={{
              background: isDarkMode
                ? "linear-gradient(180deg, #26262a 0%, #18181b 100%)"
                : "linear-gradient(180deg, #f4f4f6 0%, #e6e6ea 100%)",
              boxShadow: isDarkMode
                ? "0 1.5px 0 0 #0d0d0f, 0 1.5px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 1.5px 0 0 #d1d1d6, 0 1.5px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
            }}
          >
            <X className="w-2.5 h-2.5 stroke-[2.4]" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
