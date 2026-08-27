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
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-card-bg-alt shadow-xs">
          <img
            src="./bibleicon.png"
            alt="The Word Icon"
            className="h-5 w-5 object-contain"
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
        {/* Left Stadium Pill Card (Using Dynamic Theme Card Background + Ring) */}
        <div
          className="absolute left-0 w-[490px] h-[330px] rounded-[165px_40px_40px_165px] bg-card-bg ring-1 ring-select-border/70 shadow-2xl flex flex-col justify-center items-start pl-14 pr-44 box-border z-10 overflow-hidden"
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

          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-[0.68rem] font-bold tracking-[0.28em] text-text-secondary uppercase mb-1"
          >
            Holy Bible
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.55 }}
            className="text-5xl font-black text-text-primary tracking-wider leading-none m-0"
          >
            BOR
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="text-[0.88rem] font-extrabold uppercase tracking-[0.16em] text-text-primary mt-2 leading-tight"
          >
            The Book of<br />Redemption
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55 }}
            className="garamond text-[0.95rem] italic text-text-secondary mt-3.5 border-l-2 border-focus-border pl-3 max-w-[280px] leading-snug"
          >
            "Worthy is the Lamb that was slain to receive power, and wisdom..."
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }}
            className="mt-4.5"
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

        {/* Right Overlapping Disc (Realistic 3D Spherical Surface + Multi-layered Depth) */}
        <div
          className="absolute right-0 w-[350px] h-[350px] rounded-full ring-2 ring-focus-border flex items-center justify-center z-20 box-border overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--card-bg-alt) 82%, white 18%) 0%, var(--card-bg-alt) 50%, color-mix(in srgb, var(--card-bg-alt) 60%, black 40%) 100%)",
            boxShadow:
              "-24px 12px 55px -8px color-mix(in srgb, var(--studio-bg) 90%, black), 0 35px 70px -15px rgba(0, 0, 0, 0.85), inset 0 3px 8px rgba(255, 255, 255, 0.25), inset 0 -14px 28px rgba(0, 0, 0, 0.65), 0 0 35px -2px color-mix(in srgb, var(--focus-border) 40%, transparent)",
          }}
        >
          {/* Top-Left Specular Surface Highlight for 3D Curve */}
          <div
            className="absolute top-2 left-6 w-48 h-28 rounded-[50%] opacity-20 pointer-events-none -rotate-25 blur-[1px]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 75%)",
            }}
          />

          {/* Center Dynamic Theme Ambient Flare */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--focus-border) 45%, transparent) 0%, transparent 65%)",
            }}
          />

          {/* 3D Floating App Icon with Layered Cast Shadow & Ground Contact Shadow */}
          <div className="relative flex flex-col items-center justify-center z-10">
            <motion.img
              src="./bibleicon.png"
              alt="The Book of Redemption Icon"
              className="w-48 h-48 object-contain z-10"
              style={{
                filter:
                  "drop-shadow(0 16px 24px rgba(0, 0, 0, 0.6)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))",
              }}
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-32 h-4 rounded-full bg-black/40 blur-md -mt-2"
              animate={{
                scale: [1, 0.82, 1],
                opacity: [0.45, 0.25, 0.45],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default WelcomeScreen;
