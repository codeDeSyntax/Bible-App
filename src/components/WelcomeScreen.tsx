import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-studio-bg text-text-primary flex items-center justify-center select-none">
      {/* Dynamic Ambient Background Mesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--focus-border) 12%, transparent) 0%, color-mix(in srgb, var(--card-bg-alt) 25%, transparent) 45%, var(--studio-bg) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 75% 30%, color-mix(in srgb, var(--btn-active-from) 10%, transparent) 0%, transparent 60%), radial-gradient(circle at 25% 70%, color-mix(in srgb, var(--select-border-hover) 15%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* Top Branding Pill (Borderless) */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute left-8 top-8 z-30 flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-card-bg/60 backdrop-blur-md shadow-lg"
      >
        <div className="flex h-8 w-8 items-center justify-center bg-transparent shadow-xs overflow-hidden">
          <img
            src="./bibleicon.png"
            alt="The Word Icon"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 pr-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-text-primary">
            The Word
          </p>
          <p className="text-[0.6rem] font-medium text-text-secondary tracking-wider">
            Presentation Studio
          </p>
        </div>
      </motion.div>

      {/* Center Corel-Style Stadium + Overlapping Disc Composition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="relative w-[700px] h-[370px] flex items-center justify-center z-20"
      >
        {/* Left Stadium Pill Card (Icon + Button) */}
        <div
          className="absolute left-0 w-[490px] h-[330px] rounded-[165px_40px_40px_165px] bg-card-bg ring-1 ring-select-border/70 shadow-2xl flex flex-col justify-center items-start pl-16 pr-44 box-border z-10 overflow-hidden"
          style={{
            boxShadow:
              "0 25px 60px -15px color-mix(in srgb, var(--studio-bg) 60%, black)",
          }}
        >
          {/* Subtle Ambient Background Flare inside Left Card */}
          <div
            className="absolute -left-10 -top-10 w-44 h-44 rounded-full opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--focus-border) 25%, transparent) 0%, transparent 70%)",
            }}
          />

          {/* App Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-4"
          >
            <motion.img
              src="./bibleicon.png"
              alt="The Book of Redemption Icon"
              className="w-28 h-28 object-contain"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
          >
            <button
              onClick={onEnterApp}
              className="group flex items-center gap-2 rounded-xl bg-btn-active-from hover:bg-btn-active-to text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-black/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Enter Bible Studio</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Right Overlapping Disc (Text Content) */}
        <div className="absolute right-0 w-[350px] h-[350px] rounded-full bg-card-bg-alt flex flex-col items-center justify-center text-center p-8 z-20 box-border overflow-hidden shadow-lg">
          {/* Subtle Ambient Flare */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--focus-border) 35%, transparent) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-[0.65rem] font-bold tracking-[0.28em] text-text-secondary uppercase mb-1"
            >
              Holy Bible
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="text-5xl font-black text-text-primary tracking-wider leading-none m-0"
            >
              BOR
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}
              className="text-[0.82rem] font-extrabold uppercase tracking-[0.16em] text-text-primary mt-1.5 leading-tight"
            >
              The Book of Redemption
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.55 }}
              className="garamond text-[1.6rem] italic text-text-secondary mt-3 max-w-[280px] leading-tight"
            >
              "Worthy is the Lamb that was slain to receive power, and wisdom..."
            </motion.p>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default WelcomeScreen;
