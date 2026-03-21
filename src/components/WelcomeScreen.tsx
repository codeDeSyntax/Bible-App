import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Book } from "lucide-react";

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-studio-bg">
      {/* AR Grid Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0 34px, color-mix(in srgb, var(--select-border) 22%, transparent) 34px 35px), repeating-linear-gradient(90deg, transparent 0 34px, color-mix(in srgb, var(--select-border) 22%, transparent) 34px 35px)",
            opacity: 0.45,
          }}
        />

        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.18, 0.35, 0.18] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(60% 60% at 50% 58%, color-mix(in srgb, var(--focus-border) 35%, transparent) 0%, transparent 70%)",
          }}
        />

        <motion.div
          className="absolute left-0 right-0 h-[2px]"
          animate={{ y: [0, 640, 0], opacity: [0, 0.65, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            top: 40,
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--focus-border) 55%, transparent), transparent)",
          }}
        />
      </div>

      {/* AR Reticle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <div className="relative w-[34rem] h-[34rem]">
          {[1, 0.74, 0.5].map((factor, index) => (
            <motion.div
              key={factor}
              className="absolute inset-0 rounded-full"
              style={{
                transform: `scale(${factor})`,
                border:
                  "1px solid color-mix(in srgb, var(--focus-border) 55%, transparent)",
                opacity: 0.38 - index * 0.09,
              }}
              animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
              transition={{
                duration: 80 - index * 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          <div
            className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--select-border) 55%, transparent), transparent)",
            }}
          />
          <div
            className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2"
            style={{
              background:
                "linear-gradient(to right, transparent, color-mix(in srgb, var(--select-border) 55%, transparent), transparent)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ background: "var(--focus-border)", opacity: 0.6 }}
          />
        </div>
      </motion.div>

      {/* Content Container - positioned in upper portion away from geometry */}
      <div className="absolute z-20 top-0 left-0 right-0 w-full h-full flex flex-col items-center justify-center px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 "
        >
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-4xl font-bold text-text-primary tracking-wide font-ThePriest text-center l"
            style={{
              textShadow: "2px 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            The Book Of{" "}
            <mark className="text-white bg-select-bg-alt border-select-border-hover border-4 border-dashed border-x-0  border-t-0">
              Redemption
            </mark>
          </motion.h1>
        </motion.div>

        {/* Enter Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnterApp}
          className="group relative bg-select-border hover:bg-select-hover border border-select-border text-text-primary px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
        >
          <Book className="w-5 h-5" />
          Read the Word
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>

      {/* Floating AR blips */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.12, 0.25, 0.12],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full"
          style={{ background: "var(--focus-border)" }}
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--select-border-hover)" }}
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-[62%] left-[58%] w-2 h-2 rounded-full"
          style={{ background: "var(--focus-border)" }}
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;
