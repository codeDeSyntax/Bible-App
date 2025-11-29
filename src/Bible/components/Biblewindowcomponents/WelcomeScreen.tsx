import React from "react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  backgroundGradients: string[];
  selectedGradient: number;
  getBaseFontSize: () => string;
  getEffectiveFontFamily: () => string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  backgroundGradients,
  selectedGradient,
  getBaseFontSize,
  getEffectiveFontFamily,
}) => {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Welcome Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Sunken panel - blends with background but has inner depth */}
          <div
            className="relative px-20 py-16 rounded-2xl"
            style={{
              background: "#000000",
              boxShadow: `
                inset 8px 8px 20px rgba(0, 0, 0, 0.8),
                inset -8px -8px 20px rgba(255, 255, 255, 0.015),
                inset 0 0 0 1px rgba(255, 255, 255, 0.03)
              `,
            }}
          >
            {/* Inner highlight edge - top left */}
            <div
              className="absolute top-0 left-0 right-1/2 h-px rounded-tl-2xl"
              style={{
                background:
                  "linear-gradient(to right, rgba(2, 2, 2, 0.08), transparent)",
              }}
            />
            <div
              className="absolute top-0 left-0 bottom-1/2 w-px rounded-tl-2xl"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(9, 9, 9, 0.08), transparent)",
              }}
            />

            {/* Inner shadow edge - bottom right */}
            <div
              className="absolute bottom-0 right-0 left-1/2 h-px rounded-br-2xl"
              style={{
                background:
                  "linear-gradient(to left, rgba(0,0,0,0.9), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 top-1/2 w-px rounded-br-2xl"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Modern ash spinner - clean circular design */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-8 flex justify-center"
              >
                <div className="relative w-24 h-24">
                  {/* Main spinner ring - ash colored */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      border: "4px solid transparent",
                      borderTopColor: "#9ca3af", // ash gray
                      borderRightColor: "#6b7280", // darker ash
                      boxShadow: "0 0 30px rgba(156, 163, 175, 0.3)",
                    }}
                  />

                  {/* Inner circle background */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-800/20 to-gray-700/10 backdrop-blur-sm" />

                  {/* Center pulsing dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-3 h-3 bg-gray-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        boxShadow: "0 0 20px rgba(156, 163, 175, 0.5)",
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="space-y-4"
              >
                <p
                  className="text-gray-300 font-light tracking-widest uppercase text-base"
                  style={{
                    fontFamily: getEffectiveFontFamily(),
                    letterSpacing: "0.2em",
                    textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                  }}
                >
                  Preparing Scripture
                </p>

                {/* Pulsing dots - ash colored */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      style={{
                        boxShadow: "0 0 10px 2px rgba(156, 163, 175, 0.4)",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ambient light orbs - ash colored */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-600/8 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.15, 0.25],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>
    </div>
  );
};
