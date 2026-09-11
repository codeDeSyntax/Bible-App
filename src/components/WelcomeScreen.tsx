import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

/**
 * Ornate Sacred & Celestial Art Pattern Background
 * Generates an intricate geometric tapestry with corner flourishes and atmospheric glows.
 * 100% dynamic with the app's theme variables and light/dark modes.
 */
const DominantArtPattern: React.FC = () => {
  // Pre-generate constellation sparkle positions
  const stars = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      x: (i * 137.5) % 100,
      y: (i * 93.3 + 15) % 100,
      size: (i % 3) + 1.2,
      duration: 3 + (i % 5) * 1.5,
      delay: (i % 7) * 0.4,
      opacity: 0.25 + ((i % 5) * 0.15),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Dynamic Atmospheric Gradient Base */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--focus-border) 15%, var(--card-bg-alt)) 0%, color-mix(in srgb, var(--card-bg) 50%, var(--studio-bg)) 55%, var(--studio-bg) 100%)",
        }}
      />

      {/* 2. Prominent, Intricate Baroque Corner Frames (Four Corners) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cornerGradDynamic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--focus-border)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--btn-active-from)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--focus-border)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Left Corner */}
      <div className="absolute top-0 left-0 w-88 h-88 opacity-80 pointer-events-none transition-opacity duration-300">
        <svg viewBox="0 0 240 240" className="w-full h-full">
          {/* Main Corner Border Lines */}
          <path d="M 12 12 L 220 12 L 220 15 L 15 15 L 15 220 L 12 220 Z" fill="url(#cornerGradDynamic)" />
          <path d="M 24 24 L 180 24 M 24 24 L 24 180" stroke="url(#cornerGradDynamic)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 32 32 L 140 32 M 32 32 L 32 140" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          
          {/* Corner Rosette / Diamond */}
          <rect x="20" y="20" width="8" height="8" transform="rotate(45 24 24)" fill="var(--focus-border)" opacity="0.9" />
          <circle cx="24" cy="24" r="10" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1" />
          
          {/* Baroque Filigree Flourish Arcs */}
          <path d="M 24 24 Q 100 24 140 140 Q 24 100 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1.2" />
          <path d="M 24 24 Q 70 24 95 95 Q 24 70 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          <path d="M 15 15 L 65 65" stroke="url(#cornerGradDynamic)" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </div>

      {/* Top Right Corner */}
      <div className="absolute top-0 right-0 w-88 h-88 opacity-80 pointer-events-none rotate-90 transition-opacity duration-300">
        <svg viewBox="0 0 240 240" className="w-full h-full">
          <path d="M 12 12 L 220 12 L 220 15 L 15 15 L 15 220 L 12 220 Z" fill="url(#cornerGradDynamic)" />
          <path d="M 24 24 L 180 24 M 24 24 L 24 180" stroke="url(#cornerGradDynamic)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 32 32 L 140 32 M 32 32 L 32 140" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          <rect x="20" y="20" width="8" height="8" transform="rotate(45 24 24)" fill="var(--focus-border)" opacity="0.9" />
          <circle cx="24" cy="24" r="10" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1" />
          <path d="M 24 24 Q 100 24 140 140 Q 24 100 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1.2" />
          <path d="M 24 24 Q 70 24 95 95 Q 24 70 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          <path d="M 15 15 L 65 65" stroke="url(#cornerGradDynamic)" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </div>

      {/* Bottom Left Corner */}
      <div className="absolute bottom-0 left-0 w-88 h-88 opacity-80 pointer-events-none -rotate-90 transition-opacity duration-300">
        <svg viewBox="0 0 240 240" className="w-full h-full">
          <path d="M 12 12 L 220 12 L 220 15 L 15 15 L 15 220 L 12 220 Z" fill="url(#cornerGradDynamic)" />
          <path d="M 24 24 L 180 24 M 24 24 L 24 180" stroke="url(#cornerGradDynamic)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 32 32 L 140 32 M 32 32 L 32 140" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          <rect x="20" y="20" width="8" height="8" transform="rotate(45 24 24)" fill="var(--focus-border)" opacity="0.9" />
          <circle cx="24" cy="24" r="10" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1" />
          <path d="M 24 24 Q 100 24 140 140 Q 24 100 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1.2" />
          <path d="M 24 24 Q 70 24 95 95 Q 24 70 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          <path d="M 15 15 L 65 65" stroke="url(#cornerGradDynamic)" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-0 right-0 w-88 h-88 opacity-80 pointer-events-none rotate-180 transition-opacity duration-300">
        <svg viewBox="0 0 240 240" className="w-full h-full">
          <path d="M 12 12 L 220 12 L 220 15 L 15 15 L 15 220 L 12 220 Z" fill="url(#cornerGradDynamic)" />
          <path d="M 24 24 L 180 24 M 24 24 L 24 180" stroke="url(#cornerGradDynamic)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 32 32 L 140 32 M 32 32 L 32 140" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          <rect x="20" y="20" width="8" height="8" transform="rotate(45 24 24)" fill="var(--focus-border)" opacity="0.9" />
          <circle cx="24" cy="24" r="10" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1" />
          <path d="M 24 24 Q 100 24 140 140 Q 24 100 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="1.2" />
          <path d="M 24 24 Q 70 24 95 95 Q 24 70 24 24" fill="none" stroke="url(#cornerGradDynamic)" strokeWidth="0.8" />
          <path d="M 15 15 L 65 65" stroke="url(#cornerGradDynamic)" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </div>

      {/* 3. Dynamic Celestial Starbursts */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity * 0.8, star.opacity * 0.3],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: "var(--text-primary)",
            boxShadow: `0 0 ${star.size * 2}px var(--focus-border)`,
          }}
        />
      ))}

      {/* 4. Soft Atmospheric Glows in Corners */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--focus-border) 25%, transparent) 0%, transparent 45%), radial-gradient(circle at 90% 90%, color-mix(in srgb, var(--btn-active-from) 25%, transparent) 0%, transparent 45%), radial-gradient(circle at 90% 10%, color-mix(in srgb, var(--select-border-hover) 20%, transparent) 0%, transparent 40%), radial-gradient(circle at 10% 90%, color-mix(in srgb, var(--focus-border) 20%, transparent) 0%, transparent 40%)",
        }}
      />
    </div>
  );
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        onEnterApp();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEnterApp]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-studio-bg text-text-primary flex items-center justify-center select-none transition-colors duration-300">
      {/* Dominant Full-Screen Sacred Art Pattern & Geometry Canvas */}
      <DominantArtPattern />

      {/* Top Branding Pill */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute left-8 top-8 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card-bg/80 backdrop-blur-xl shadow-2xl border border-select-border/60 transition-colors duration-300"
      >
        <div className="flex h-8 w-8 items-center justify-center bg-transparent shadow-xs overflow-hidden">
          <img
            src="./bibleicon.png"
            alt="The Word Icon"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.25em] text-text-primary">
              The Word
            </p>
            <Sparkles className="w-3 h-3 text-focus-border animate-pulse" />
          </div>
          <p className="text-[0.6rem] font-medium text-text-secondary tracking-wider">
            Presentation Studio
          </p>
        </div>
      </motion.div>

      {/* Center Cardless, Sleek Presentation Gateway */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-xl px-6">
        {/* Top Minimalist Tag */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-2 mb-2"
        >
          <span className="h-px w-5 bg-gradient-to-r from-transparent to-select-border" />
          <span className="text-[0.6rem] font-bold tracking-[0.32em] text-text-secondary uppercase">
            Holy Bible
          </span>
          <span className="h-px w-5 bg-gradient-to-l from-transparent to-select-border" />
        </motion.div>

        {/* Main Title Typography */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55 }}
          className="flex flex-col items-center"
        >
          <h1
            className="text-2xl sm:text-3xl font-bold text-text-primary tracking-[0.2em] uppercase leading-tight drop-shadow-md"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            The Book of Redemption
          </h1>
          <p className="text-[0.65rem] font-medium text-text-secondary tracking-[0.25em] uppercase mt-1.5">
            Presentation Studio
          </p>
        </motion.div>

        {/* Scripture Quote */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.55 }}
          className="my-5 max-w-md"
        >
          <p className="garamond text-[1.12rem] sm:text-[1.2rem] italic text-text-secondary/90 leading-relaxed drop-shadow">
            "Worthy is the Lamb that was slain to receive power, and riches, and wisdom, and strength, and honour, and glory, and blessing."
          </p>
          <span className="text-[0.6rem] font-bold tracking-[0.2em] text-text-secondary/60 uppercase mt-1.5 block">
            — Revelation 5:12 —
          </span>
        </motion.div>

        {/* Sleek Floating Enter Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.55 }}
          className="mt-1"
        >
          <button
            onClick={onEnterApp}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-btn-active-from to-btn-active-to hover:brightness-110 text-white py-2.5 px-6 text-[0.72rem] font-bold tracking-widest uppercase shadow-xl shadow-black/40 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-select-border/50"
            style={{
              boxShadow: "0 8px 24px rgba(0,0,0,0.35), 0 0 18px color-mix(in srgb, var(--focus-border) 30%, transparent)",
            }}
          >
            <BookOpen className="h-3.5 w-3.5 text-white" />
            <span>Enter Bible Studio</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </main>
  );
};

export default WelcomeScreen;
