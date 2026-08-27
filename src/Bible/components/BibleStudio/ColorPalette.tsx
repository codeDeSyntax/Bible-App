import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, X } from "lucide-react";

interface ColorPaletteProps {
  position: { x: number; y: number };
  onColorSelect: (color: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: "Gold", value: "#eab308" },
  { name: "Emerald", value: "#10b981" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Purple", value: "#a855f7" },
] as const;

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  position,
  onColorSelect,
  onClose,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 4 }}
        transition={{ type: "spring", stiffness: 520, damping: 30 }}
        className="fixed z-[100]"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-card-bg/95 backdrop-blur-xl shadow-2xl">
          {/* Color Swatches */}
          <div className="flex items-center gap-2 px-0.5">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                title={`Highlight in ${color.name}`}
                className="w-6 h-6 rounded-full transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer shadow-xs hover:shadow-md ring-1 ring-black/10 dark:ring-white/20 focus:outline-none flex-shrink-0"
                style={{
                  width: "24px",
                  height: "24px",
                  minWidth: "24px",
                  minHeight: "24px",
                  borderRadius: "50%",
                  backgroundColor: color.value,
                }}
              >
                <span className="sr-only">{color.name}</span>
              </button>
            ))}
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-4 bg-select-border/70 mx-0.5" />

          {/* Remove Highlight / Eraser */}
          <button
            type="button"
            onClick={() => {
              onColorSelect("");
              onClose();
            }}
            title="Remove Highlight"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onClose}
            title="Dismiss"
            className="w-6 h-6 rounded-lg flex items-center justify-center text-text-secondary/70 hover:text-text-primary hover:bg-select-hover transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
