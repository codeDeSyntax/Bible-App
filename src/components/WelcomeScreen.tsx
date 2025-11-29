import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BirdIcon, Book, Heart, RefreshCw } from "lucide-react";

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#313131]">
      {/* Dot Pattern Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #4a4a4a 1.5px, transparent 1.5px)`,
          backgroundSize: "25px 25px",
        }}
      />

      {/* Subtle Gradient Overlay - reduced opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3a3a3a]/20 via-transparent to-[#313131]/20" />

      {/* Pyramid Complexes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* LEFT PYRAMID COMPLEX */}
        {/* Great Pyramid - Left (Largest) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -100 }}
          animate={{ opacity: 0.12, scale: 1, x: 0 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute bottom-16 left-20"
          style={{
            backgroundImage: "url('./pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "280px",
            height: "200px",
            filter: "grayscale(100%) brightness(0.5) contrast(1.3)",
          }}
        />

        {/* Second Pyramid - Left (Medium) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -80 }}
          animate={{ opacity: 0.1, scale: 1, x: 0 }}
          transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
          className="absolute bottom-12 left-60"
          style={{
            backgroundImage: "url('./pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "180px",
            height: "130px",
            filter: "grayscale(100%) brightness(0.5) contrast(1.2)",
          }}
        />

        {/* Third Pyramid - Left (Small) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -60 }}
          animate={{ opacity: 0.08, scale: 1, x: 0 }}
          transition={{ duration: 2, delay: 1.1, ease: "easeOut" }}
          className="absolute bottom-10 left-80"
          style={{
            backgroundImage: "url('./pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "120px",
            height: "90px",
            filter: "grayscale(100%) brightness(0.5) contrast(1.1)",
          }}
        />

        {/* RIGHT PYRAMID COMPLEX */}
        {/* Great Pyramid - Right (Largest) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 0.12, scale: 1, x: 0 }}
          transition={{ duration: 2, delay: 1.4, ease: "easeOut" }}
          className="absolute bottom-16 right-20"
          style={{
            backgroundImage: "url('./pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "280px",
            height: "200px",
            filter: "grayscale(100%) brightness(0.5) contrast(1.3)",
          }}
        />

        {/* Second Pyramid - Right (Medium) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 80 }}
          animate={{ opacity: 0.1, scale: 1, x: 0 }}
          transition={{ duration: 2, delay: 1.7, ease: "easeOut" }}
          className="absolute bottom-12 right-60"
          style={{
            backgroundImage: "url('./pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "180px",
            height: "130px",
            filter: "grayscale(100%) brightness(0.5) contrast(1.2)",
          }}
        />

        {/* Third Pyramid - Right (Small) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 60 }}
          animate={{ opacity: 0.08, scale: 1, x: 0 }}
          transition={{ duration: 2, delay: 2.0, ease: "easeOut" }}
          className="absolute bottom-10 right-80"
          style={{
            backgroundImage: "url('./pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "120px",
            height: "90px",
            filter: "grayscale(100%) brightness(0.5) contrast(1.1)",
          }}
        />
      </div>

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
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gray-400/5 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-300/5 rounded-full blur-3xl"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full m-auto flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-lg max-w-md h-full w-full mx-auto relative overflow-hidden"
        >
          {/* Sunken Content Card - blends with background but has inner depth */}
          <div
            className="px-8 pt-12 text-center h-[100vh] rounded-lg relative"
            style={{
              background: "#2c2c2c", // Same as background for seamless blend
              boxShadow: `
                inset 6px 6px 16px rgba(0, 0, 0, 0.6),
                inset -6px -6px 16px rgba(255, 255, 255, 0.02),
                inset 0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
              border: "1px solid rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Inner highlight edge - top left */}
            <div
              className="absolute top-0 left-0 right-1/2 h-px rounded-tl-lg"
              style={{
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.1), transparent)",
              }}
            />
            <div
              className="absolute top-0 left-0 bottom-1/2 w-px rounded-tl-lg"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)",
              }}
            />

            {/* Inner shadow edge - bottom right */}
            <div
              className="absolute bottom-0 right-0 left-1/2 h-px rounded-br-lg"
              style={{
                background:
                  "linear-gradient(to left, rgba(0,0,0,0.8), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 top-1/2 w-px rounded-br-lg"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Bible Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <img
                    src="./bibleicon.png"
                    alt="Bible Icon"
                    className="w-20 h-20 object-contain filter drop-shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 rounded-full flex items-center justify-center">
                    <img
                      alt="eagle"
                      src="./eagle.png"
                      className="h-8 w-8 text-white"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Dotted Line */}
              <div className="w-full border-t-2 border-dotted border-gray-600/40 mb-8" />

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl font-bold text-gray-300 mb-4 tracking-wide font-ThePriest"
                style={{
                  textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                The Word
              </motion.h1>

              {/* Decorative Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="h-px bg-gray-600/50 mx-auto mb-8"
              />

              {/* Welcome Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-gray-400 text-lg mb-8 font-light leading-relaxed"
              >
                Unsearchable reaches of Christ
                <br />
                <span className="text-base text-gray-500">
                  Ready to dive into word
                </span>
              </motion.p>

              {/* Enter Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnterApp}
                className="group relative bg-[#313131] hover:bg-[#3a3a3a] border border-gray-600/30 text-gray-200 px-8 py-4 rounded-r-full rounded-bl-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              >
                <Book className="w-5 h-5" />
                Read the Word
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>

              {/* Bottom Line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="mt-8 pt-4 border-t-2 border-dotted border-gray-700/30"
              ></motion.div>
            </div>
          </div>
        </motion.div>
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
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gray-400/5 rounded-full blur-3xl"
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
          className="absolute top-1/4 left-1/3 w-48 h-48 bg-gray-300/5 rounded-full blur-2xl"
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;
