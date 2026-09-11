import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseColoredText } from "@/Bible/components/AlertTemplates/alertParser";
import { isDarkColor } from "./AlertModalUtils";

interface AlertPreviewStripProps {
  isEmpty: boolean;
  bgColor: string;
  internalText: string;
  isDarkMode: boolean;
}

export const AlertPreviewStrip: React.FC<AlertPreviewStripProps> = ({
  isEmpty,
  bgColor,
  internalText,
  isDarkMode,
}) => {
  return (
    <AnimatePresence>
      {!isEmpty && (
        <motion.div
          key="preview-section"
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="max-w-[480px] pb-0.5">
            <div
              className={`p-1 rounded-2xl ${
                isDarkMode ? "bg-zinc-800/70" : "bg-zinc-100"
              }`}
            >
              <div
                style={{ backgroundColor: bgColor }}
                className="rounded-xl px-3 py-1.5 min-h-[1.85rem] flex items-center justify-between gap-2 transition-colors duration-200 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div className="text-[0.74rem] truncate font-medium tracking-wide">
                    {parseColoredText(
                      internalText,
                      isDarkColor(bgColor) ? "#ffffff" : "#0f172a",
                      "'Outfit', sans-serif",
                      bgColor,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
