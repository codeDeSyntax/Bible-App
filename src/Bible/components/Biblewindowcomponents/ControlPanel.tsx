import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ControlPanelProps {
  isControlPanelVisible: boolean;
  currentBook: string;
  currentChapter: number;
  currentVerses: Array<{ verse: number; text: string }>;
  settings: {
    versesPerSlide: number;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
  };
  currentTranslation: string;
  isTranslationSwitching: boolean;
  currentVerseIndex: number;
  verses: Array<{ verse: number; text: string }>;
  switchTranslation: () => void;
  toggleControlPanel: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isControlPanelVisible,
  currentBook,
  currentChapter,
  currentVerses,
  settings,
  currentTranslation,
  isTranslationSwitching,
  currentVerseIndex,
  verses,
  switchTranslation,
  toggleControlPanel,
}) => {
  return (
    <>
      {/* Compact Control Panel - Conditionally Visible */}
      <AnimatePresence>
        {isControlPanelVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="absolute bottom-4 right-4 z-30"
          >
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 px-2 py-1 shadow-lg relative">
              <div className="flex items-center justify-center space-x-2 text-sm">
                {/* Keyboard shortcuts hint */}
                <div className="text-center">
                  <span className="text-white/50 text-[8px] font-mono">
                    T=Translation • Ctrl+H=Hide • ESC=Focus Main
                  </span>
                </div>

                {/* Scripture Reference */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center">
                  <span className="text-white font-mono text-[10px]">
                    {currentBook} {currentChapter}:
                    {settings.versesPerSlide === 1
                      ? currentVerses[0]?.verse
                      : currentVerses.length > 0
                      ? `${currentVerses[0].verse}-${
                          currentVerses[currentVerses.length - 1].verse
                        }`
                      : "1"}
                  </span>
                </div>

                {/* Translation - Clickable */}
                <button
                  onClick={switchTranslation}
                  disabled={isTranslationSwitching}
                  className={`bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center transition-colors duration-200 ${
                    isTranslationSwitching
                      ? "bg-black/70 cursor-not-allowed"
                      : "hover:bg-black/70"
                  }`}
                  title="Click to switch translation (or press T)"
                >
                  <span className="text-white/80 font-mono text-[10px] uppercase tracking-wide">
                    {isTranslationSwitching ? "..." : currentTranslation}
                  </span>
                </button>

                {/* Current Position */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center">
                  <span className="text-white font-mono text-[10px]">
                    {currentVerseIndex + 1}/{verses.length}
                  </span>
                </div>

                {/* Progress Dots - Mini Version */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10">
                  <div className="flex items-center justify-center space-x-0.5">
                    {Array.from({
                      length: Math.min(
                        8,
                        Math.ceil(verses.length / settings.versesPerSlide)
                      ),
                    }).map((_, index) => (
                      <div
                        key={index}
                        className={`rounded-full transition-all duration-300 ${
                          Math.floor(
                            currentVerseIndex / settings.versesPerSlide
                          ) === index
                            ? "w-1.5 h-1.5 bg-white/80"
                            : "w-1 h-1 bg-white/30"
                        }`}
                      />
                    ))}
                    {verses.length > 8 && (
                      <span className="text-white/50 text-[8px] ml-0.5">
                        ...
                      </span>
                    )}
                  </div>
                </div>

                {/* Note about using Control Room */}
                <div className="bg-blue-500/20 rounded-md px-2 py-1 border border-blue-500/30 text-center">
                  <span className="text-blue-200/80 font-mono text-[8px] uppercase tracking-wide">
                    Use Control Room for Settings
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel Hidden Indicator */}
      <AnimatePresence>
        {!isControlPanelVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4 z-30"
          >
            <button
              onClick={toggleControlPanel}
              className="bg-black/20 backdrop-blur-sm rounded-full p-2 border border-white/10 shadow-lg hover:bg-black/40 transition-all duration-200 group"
              title="Show control panel (Ctrl+H)"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <div className="w-1 h-1 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors duration-200"></div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
