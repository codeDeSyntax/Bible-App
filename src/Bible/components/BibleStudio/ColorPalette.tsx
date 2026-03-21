import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { DepthButton, DepthSurface } from "@/shared/DepthElement";

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
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#9ca3af" },
] as const;

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  position,
  onColorSelect,
  onClose,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 4 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className="fixed z-[100]"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseLeave={onClose}
      >
        <DepthSurface
          className="rounded-xl p-2.5 w-44"
          surfaceClassName="bg-gradient-to-br from-card-bg via-select-hover to-card-bg-alt border border-select-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest">
              Highlight
            </span>
            <DepthButton
              onClick={onClose}
              sizeClassName="w-4 h-4 rounded"
              inactiveClassName="text-text-secondary border-select-border hover:text-text-primary"
              activeClassName="text-text-primary border-btn-active-from"
            >
              <X className="w-3 h-3 text-text-secondary" />
            </DepthButton>
          </div>

          {/* Swatches */}
          <div className="grid grid-cols-8 gap-1">
            {HIGHLIGHT_COLORS.map((color) => (
              <DepthButton
                key={color.name}
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                title={color.name}
                sizeClassName="w-4 h-4 rounded-full"
                inactiveClassName="border-selet-border"
                activeClassName="border-btn-ative-from"
                inactiveSurfaceClassName="bg-transparent"
                activeSurfaceClassName="bg-transparent"
                className="shadow-sm p- outline-none border-none hover:scale-125 transition-transform  duration-150 flex-shrink-0"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                <span className="sr-only">{color.name}</span>
              </DepthButton>
            ))}
          </div>

          {/* Reset */}
          <DepthButton
            onClick={() => {
              onColorSelect("");
              onClose();
            }}
            sizeClassName="mt-2 w-full py-1 rounded-md"
            inactiveClassName="text-text-secondary border-select-border hover:text-text-primary"
            activeClassName="text-text-primary border-btn-active-from"
            className="text-[0.65rem] font-medium"
          >
            Remove highlight
          </DepthButton>
        </DepthSurface>
      </motion.div>
    </AnimatePresence>
  );
};
