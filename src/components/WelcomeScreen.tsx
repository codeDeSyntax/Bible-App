import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-studio-bg text-text-primary">
      <img
        src="./open-book.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--studio-bg) 92%, transparent) 0%, color-mix(in srgb, var(--studio-bg) 70%, transparent) 34%, color-mix(in srgb, var(--card-bg-alt) 34%, transparent) 68%, color-mix(in srgb, var(--studio-bg) 72%, transparent) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, transparent 0%, color-mix(in srgb, var(--studio-bg) 18%, transparent) 38%, color-mix(in srgb, var(--studio-bg) 78%, transparent) 100%), radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--focus-border) 18%, transparent) 0%, transparent 36%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--focus-border) 18%, transparent) 44%, transparent 58%), linear-gradient(45deg, transparent 0%, color-mix(in srgb, var(--select-border-hover) 14%, transparent) 48%, transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 opacity-60"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--card-bg-alt) 75%, transparent), transparent)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--studio-bg) 94%, transparent), color-mix(in srgb, var(--studio-bg) 62%, transparent) 54%, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="absolute left-6 top-5 z-20 flex items-center gap-3 sm:left-8 sm:top-7"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-select-border shadow-2xl backdrop-blur-md">
          <img
            src="./bibleicon.png"
            alt=""
            className="h-full w-full object-contain drop-shadow-lg"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-text-secondary">
            God&apos;s Word
          </p>
          <p className="text-[0.72rem] text-text-secondary opacity-70">
            The Book of Redemption
          </p>
        </div>
      </motion.div>

      <section className="relative z-10 flex h-full w-full flex-col items-start justify-end px-6 pb-12 text-left sm:px-10 sm:pb-14 lg:px-20 lg:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex max-w-2xl flex-col items-start"
        >
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl text-4xl font-black leading-[0.92] text-text-primary sm:text-5xl lg:text-6xl"
            style={{
              letterSpacing: "0",
              textShadow:
                "0 22px 55px color-mix(in srgb, var(--studio-bg) 62%, transparent)",
            }}
          >
            The Book of
            <span className="block font-ThePriest text-[1.08em] font-normal text-focus-border">
              Redemption
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.7, ease: "easeOut" }}
            className="mt-5 max-w-xl border-t border-focus-border pt-4"
          >
            <p className="garamond text-lg italic leading-snug text-text-primary sm:text-xl">
              "Worthy is the Lamb that was slain to receive power, and riches,
              and wisdom, and strength, and honour, and glory, and blessing."
            </p>
            <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-focus-border">
              Revelation 5:12
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="mt-6 flex flex-wrap items-center justify-start gap-3"
          >
            <button
              onClick={onEnterApp}
              className="group flex h-11 items-center gap-2 rounded-xl bg-text-primary px-4 text-[0.82rem] font-bold text-card-bg shadow-2xl shadow-black/20 transition hover:bg-focus-border"
            >
              <BookOpen className="h-4 w-4" />
              Enter Bible Studio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between gap-6 sm:left-10 sm:right-10 lg:left-20 lg:right-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="h-px flex-1 bg-gradient-to-r from-select-border-hover via-select-border-hover/50 to-transparent sm:max-w-sm"
        />
      </div>
    </main>
  );
};

export default WelcomeScreen;
