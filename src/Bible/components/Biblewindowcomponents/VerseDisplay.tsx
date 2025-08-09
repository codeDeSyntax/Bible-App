import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VerseDisplayProps {
  currentVerseIndex: number;
  currentBook: string;
  currentChapter: number;
  currentVerses: Array<{ verse: number; text: string }>;
  useImageBackground: boolean;
  settings: {
    versesPerSlide: number;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
  };
  getEffectiveTextColor: () => string;
  getFontFamilyClass: () => string;
  getEffectiveFontFamily: () => string;
  getBaseFontSize: () => string;
}

export const VerseDisplay: React.FC<VerseDisplayProps> = ({
  currentVerseIndex,
  currentBook,
  currentChapter,
  currentVerses,
  useImageBackground,
  settings,
  getEffectiveTextColor,
  getFontFamilyClass,
  getEffectiveFontFamily,
  getBaseFontSize,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center w-full h-full ">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentVerseIndex}-${currentBook}-${currentChapter}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{
            duration: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="verse-content text-center w-full flex flex-col items-center justify-start max-w-[95vw] max-h-[95vh] overflow-y-auto no-scrollbar"
        >
          {/* Content Background Effect - no blur for image backgrounds */}
          <div
            className={`absolute inset-0 -m-12 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/10 ${
              useImageBackground ? "" : "backdrop-blur-0"
            }`}
          />

          {/* Verses Container - start from top but horizontally centered */}
          <div className="relative z-10 w-full flex flex-col items-center justify-start max-w-[100vw] max-h-full overflow-y-auto  no-scrollbar mx-auto">
            {currentVerses.map((verse, index) => (
              <motion.div
                key={verse.verse}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: index * 0.1 + 0.2,
                  duration: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="w-full flex flex-col items-center justify-start mb-4"
              >
                {/* Verse Text - start from top, horizontally centered */}
                <div className="w-full text-center">
                  <span
                    className={`tracking-wide drop-shadow-xl text-center leading-relaxed ${getFontFamilyClass()} break-words`}
                    style={{
                      color: getEffectiveTextColor() || "#ffffff",
                      textShadow: "0 4px 8px rgba(0,0,0,0.5)",
                      lineHeight: "1.3",
                      fontWeight: "bold",
                      fontFamily: getEffectiveFontFamily(),
                      fontSize: getBaseFontSize(),
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    <span className="font-normal italic mr-5 font-bitter text-red-500">
                      {currentVerses.length > 0
                        ? settings.versesPerSlide === 1
                          ? currentVerses[0]?.verse
                          : `${currentVerses[0]?.verse}-${
                              currentVerses[currentVerses.length - 1]?.verse
                            }`
                        : "1"}
                    </span>
                    {verse.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
