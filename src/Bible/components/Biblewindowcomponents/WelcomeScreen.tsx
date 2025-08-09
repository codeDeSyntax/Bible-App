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
    <div className="w-full h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className={`w-full h-full ${backgroundGradients[selectedGradient]}`}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Welcome Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-6xl"
        >
          <div className="relative">
            <h1
              style={{
                fontSize: `calc(${getBaseFontSize()} * 2.5)`,
                textShadow:
                  "0 6px 30px rgba(0,0,0,0.9), 0 3px 12px rgba(0,0,0,0.7)",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #dbeafe 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: "bold",
                fontFamily: getEffectiveFontFamily(),
              }}
              className={`text-3xl drop-shadow-2xl mb-6 truncate `}
            >
              The Word
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`text-white/80 font-light tracking-wide truncate text-2xl `}
              style={{
                fontFamily: getEffectiveFontFamily(),
                fontWeight: "normal",
              }}
            >
              Waiting for Scripture...
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </div>
  );
};
