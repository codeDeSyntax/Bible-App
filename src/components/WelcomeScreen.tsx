import React, { useState, useEffect } from "react";
import MeshGradient from "./MeshGradient";
import { motion } from "framer-motion";
import { ArrowRight, BirdIcon, Book, Heart, RefreshCw } from "lucide-react";

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  // Welcome screen uses the app theme background with a neural SVG overlay only

  return (
    <div className="w-full h-screen relative overflow-hidden bg-studio-bg">
      {/* Sacred Geometry Pattern Background - moved to bottom for better layout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 z-15 flex items-end justify-center gap-32 overflow-hidden pointer-events-none px-12 pb-8"
      >
        {/* Left smaller sacred geometry */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full max-w-xs max-h-xs opacity-60"
          style={{
            filter: "drop-shadow(0 0 80px var(--focus-border))",
            opacity: 0.3,
          }}
        >
          {/* Left pattern - simplified/mirrored version */}
          <circle
            cx="250"
            cy="250"
            r="200"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2"
            opacity="0.35"
          />
          <circle
            cx="250"
            cy="250"
            r="150"
            fill="none"
            stroke="var(--select-border)"
            strokeWidth="1.5"
            opacity="0.28"
          />
          <circle
            cx="250"
            cy="250"
            r="100"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2"
            opacity="0.4"
          />
          <circle
            cx="250"
            cy="250"
            r="50"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="1.5"
            opacity="0.35"
          />
          <circle
            cx="250"
            cy="250"
            r="15"
            fill="var(--focus-border)"
            opacity="0.4"
          />
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 250 + 170 * Math.cos(rad);
            const y = 250 + 170 * Math.sin(rad);
            return (
              <circle
                key={`left-cardinal-${angle}`}
                cx={x}
                cy={y}
                r="2"
                fill="var(--focus-border)"
                opacity="0.3"
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            const rad = (angle * Math.PI) / 180;
            const x = 250 + 130 * Math.cos(rad);
            const y = 250 + 130 * Math.sin(rad);
            return (
              <line
                key={`left-ray-${i}`}
                x1="250"
                y1="250"
                x2={x}
                y2={y}
                stroke="var(--focus-border)"
                strokeWidth="0.6"
                opacity="0.12"
              />
            );
          })}
        </svg>

        {/* Center large sacred geometry - MUCH BIGGER - increased radii */}
        <svg
          viewBox="0 0 500 500"
          className="w-screen h-screen max-w-4xl max-h-4xl"
          style={{
            filter: "drop-shadow(0 0 140px var(--focus-border))",
            opacity: 0.45,
          }}
        >
          {/* Outermost circle - wholeness */}
          <circle
            cx="250"
            cy="250"
            r="240"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2.5"
            opacity="0.4"
          />

          {/* Large sacred circles - unity and infinity */}
          <circle
            cx="250"
            cy="250"
            r="210"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2.5"
            opacity="0.45"
          />

          <circle
            cx="250"
            cy="250"
            r="175"
            fill="none"
            stroke="var(--select-border)"
            strokeWidth="2"
            opacity="0.35"
          />

          <circle
            cx="250"
            cy="250"
            r="140"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2.5"
            opacity="0.42"
          />

          <circle
            cx="250"
            cy="250"
            r="105"
            fill="none"
            stroke="var(--select-border)"
            strokeWidth="2"
            opacity="0.32"
          />

          {/* Inner sacred circle - divine center */}
          <circle
            cx="250"
            cy="250"
            r="65"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2.5"
            opacity="0.5"
          />

          {/* Sacred center - light radiating from divine source */}
          <circle
            cx="250"
            cy="250"
            r="35"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2"
            opacity="0.45"
          />

          {/* Divine light at center */}
          <circle
            cx="250"
            cy="250"
            r="12"
            fill="var(--focus-border)"
            opacity="0.6"
          />

          {/* Four cardinal directions - spiritual balance */}
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 250 + 225 * Math.cos(rad);
            const y = 250 + 225 * Math.sin(rad);
            return (
              <circle
                key={`cardinal-${angle}`}
                cx={x}
                cy={y}
                r="4"
                fill="var(--focus-border)"
                opacity="0.4"
              />
            );
          })}

          {/* Eight-fold path - spiritual journey */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            const rad = (angle * Math.PI) / 180;
            const x = 250 + 195 * Math.cos(rad);
            const y = 250 + 195 * Math.sin(rad);
            return (
              <circle
                key={`path-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="var(--select-border)"
                opacity="0.35"
              />
            );
          })}

          {/* Subtle light rays - divine illumination */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            const rad = (angle * Math.PI) / 180;
            const x2 = 250 + 245 * Math.cos(rad);
            const y2 = 250 + 245 * Math.sin(rad);
            return (
              <line
                key={`ray-${i}`}
                x1="250"
                y1="250"
                x2={x2}
                y2={y2}
                stroke="var(--focus-border)"
                strokeWidth="1"
                opacity="0.18"
              />
            );
          })}
        </svg>

        {/* Right smaller sacred geometry */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full max-w-xs max-h-xs opacity-60"
          style={{
            filter: "drop-shadow(0 0 80px var(--focus-border))",
            opacity: 0.3,
          }}
        >
          {/* Right pattern - simplified/mirrored version */}
          <circle
            cx="250"
            cy="250"
            r="200"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2"
            opacity="0.35"
          />
          <circle
            cx="250"
            cy="250"
            r="150"
            fill="none"
            stroke="var(--select-border)"
            strokeWidth="1.5"
            opacity="0.28"
          />
          <circle
            cx="250"
            cy="250"
            r="100"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="2"
            opacity="0.4"
          />
          <circle
            cx="250"
            cy="250"
            r="50"
            fill="none"
            stroke="var(--focus-border)"
            strokeWidth="1.5"
            opacity="0.35"
          />
          <circle
            cx="250"
            cy="250"
            r="15"
            fill="var(--focus-border)"
            opacity="0.4"
          />
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 250 + 170 * Math.cos(rad);
            const y = 250 + 170 * Math.sin(rad);
            return (
              <circle
                key={`right-cardinal-${angle}`}
                cx={x}
                cy={y}
                r="2"
                fill="var(--focus-border)"
                opacity="0.3"
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            const rad = (angle * Math.PI) / 180;
            const x = 250 + 130 * Math.cos(rad);
            const y = 250 + 130 * Math.sin(rad);
            return (
              <line
                key={`right-ray-${i}`}
                x1="250"
                y1="250"
                x2={x}
                y2={y}
                stroke="var(--focus-border)"
                strokeWidth="0.6"
                opacity="0.12"
              />
            );
          })}
        </svg>
      </motion.div>

      {/* Subtle ash-toned ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle glow - left side */}
        <motion.div
          animate={{
            opacity: [0.03, 0.06, 0.03],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-select-border/5 rounded-full blur-3xl"
        />

        {/* Subtle glow - right side */}
        <motion.div
          animate={{
            opacity: [0.03, 0.06, 0.03],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-select-border/5 rounded-full blur-3xl"
        />
      </div>

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
            The Book Of <mark className="text-white bg-select-bg-alt border-select-border-hover border-4 border-dashed border-x-0  border-t-0">Redemption</mark>
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

      {/* Floating Elements - Subtle Ash Glows */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle ash glow - top right */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-select-border/5 rounded-full blur-3xl"
        />

        {/* Subtle ash glow - top left */}
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.02, 0.04, 0.02],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-1/4 left-1/3 w-48 h-48 bg-select-border/5 rounded-full blur-2xl"
        />

        {/* Subtle ash glow - center */}
        <motion.div
          animate={{
            scale: [0.9, 1.2, 0.9],
            opacity: [0.01, 0.03, 0.01],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-select-border/5 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;
