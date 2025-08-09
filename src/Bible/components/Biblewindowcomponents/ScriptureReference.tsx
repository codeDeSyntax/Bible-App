import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScriptureReferenceProps {
  showScriptureReference: boolean;
  currentBook: string;
  currentChapter: number;
  currentVerses: Array<{ verse: number; text: string }>;
  settings: {
    versesPerSlide: number;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
  };
  getFontFamilyClass: () => string;
  handleMouseEnterTopRegion: () => void;
  handleMouseLeaveTopRegion: () => void;
}

export const ScriptureReference: React.FC<ScriptureReferenceProps> = ({
  showScriptureReference,
  currentBook,
  currentChapter,
  currentVerses,
  settings,
  getFontFamilyClass,
  handleMouseEnterTopRegion,
  handleMouseLeaveTopRegion,
}) => {
  return (
    <>
      {/* Hover Detection Area for Scripture Reference - Extended Top Region */}
      <div
        className="fixed top-0 left-0 w-full h-40 z-30"
        onMouseEnter={handleMouseEnterTopRegion}
        onMouseLeave={handleMouseLeaveTopRegion}
      />

      {/* Additional Detection Area specifically around where the UI appears */}
      <div
        className="fixed top-0 left-0 w-96 h-32 z-30"
        onMouseEnter={handleMouseEnterTopRegion}
        onMouseLeave={handleMouseLeaveTopRegion}
      />

      {/* Floating Scripture Reference UI */}
      <AnimatePresence>
        {showScriptureReference && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1], // Smooth easing
            }}
            className="fixed top-4 left-8 z-50"
            onMouseEnter={handleMouseEnterTopRegion}
            onMouseLeave={handleMouseLeaveTopRegion}
          >
            {/* Simple White Container */}
            <div
              className="bg-white rounded-full px-6  shadow-2xl border border-gray-200"
              onMouseEnter={handleMouseEnterTopRegion}
              onMouseLeave={handleMouseLeaveTopRegion}
            >
              {/* Scripture Reference Content */}
              <h3
                className={`text-gray-800 font-bold tracking-wide ${getFontFamilyClass()} font-impact`}
                style={{
                  fontSize: "3rem",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {currentBook} {currentChapter}:
                <span className="font-normal ml-2">
                  {currentVerses.length > 0
                    ? settings.versesPerSlide === 1
                      ? currentVerses[0]?.verse
                      : `${currentVerses[0]?.verse}-${
                          currentVerses[currentVerses.length - 1]?.verse
                        }`
                    : "1"}
                </span>
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
