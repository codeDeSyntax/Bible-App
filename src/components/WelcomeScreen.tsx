import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Book, Heart } from "lucide-react";

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Wood Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bibwood.jpg')",
          backgroundSize: "cover",
        }}
      />

      {/* Pyramid Complexes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* TOP LEFT PYRAMID COMPLEX */}
        {/* Great Pyramid - Top Left (Largest) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -100 }}
          animate={{ opacity: 0.8, scale: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute top-20 left-16"
          style={{
            backgroundImage: "url('/pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "200px",
            height: "160px",
            filter: "grayscale(100%) contrast(1.2)",
          }}
        />

        {/* Second Pyramid - Top Left (Medium) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -80 }}
          animate={{ opacity: 0.7, scale: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
          className="absolute top-32 left-56"
          style={{
            backgroundImage: "url('/pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "150px",
            height: "120px",
            filter: "grayscale(100%) contrast(1.1)",
          }}
        />

        {/* Third Pyramid - Top Left (Smallest) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -60 }}
          animate={{ opacity: 0.6, scale: 1, y: 0 }}
          transition={{ duration: 2, delay: 1.1, ease: "easeOut" }}
          className="absolute top-40 left-80"
          style={{
            backgroundImage: "url('/pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "100px",
            height: "80px",
            filter: "grayscale(100%) contrast(1.0)",
          }}
        />

        {/* BOTTOM RIGHT PYRAMID COMPLEX */}
        {/* Great Pyramid - Bottom Right (Largest) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 0.8, scale: 1, y: 0 }}
          transition={{ duration: 2, delay: 1.4, ease: "easeOut" }}
          className="absolute bottom-16 right-16"
          style={{
            backgroundImage: "url('/pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "220px",
            height: "180px",
            filter: "grayscale(100%) contrast(1.2)",
          }}
        />

        {/* Second Pyramid - Bottom Right (Medium) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 80 }}
          animate={{ opacity: 0.7, scale: 1, y: 0 }}
          transition={{ duration: 2, delay: 1.7, ease: "easeOut" }}
          className="absolute bottom-24 right-64"
          style={{
            backgroundImage: "url('/pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "170px",
            height: "140px",
            filter: "grayscale(100%) contrast(1.1)",
          }}
        />

        {/* Third Pyramid - Bottom Right (Smallest) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 60 }}
          animate={{ opacity: 0.6, scale: 1, y: 0 }}
          transition={{ duration: 2, delay: 2.0, ease: "easeOut" }}
          className="absolute bottom-32 right-96"
          style={{
            backgroundImage: "url('/pyramid.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            width: "120px",
            height: "100px",
            filter: "grayscale(100%) contrast(1.0)",
          }}
        />
      </div>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Ancient atmosphere effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Desert haze effect */}
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-amber-200/20 via-orange-100/10 to-transparent"
        />

        {/* Mystical glow around pyramids */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-yellow-300/10 via-amber-200/5 to-transparent rounded-full blur-2xl"
        />
      </div>

      {/* Receipt Paper Container */}
      <div className="relative z-10 w-ull m-auto  flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className=" rounded-lg shadow-2xl max-w-md h-full w-full mx-auto relative overflow-hidden"
          style={{
            boxShadow:
              "0 25px 50px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2)",
          }}
        >
          {/* Receipt Header Perforations */}
          {/* <div className="w-full h-4 bg-[#f0ebe0] relative">
            <div className="flex justify-between items-center px-1 h-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white border border-[#1e1108]/20 backdrop-blur-md"
                />
              ))}
            </div>
          </div> */}

          {/* Receipt Content */}
          <div className="px-8 pt-12 text-center h-[100vh] bg-[#1e1108]/20  backdrop-blur-md">
            {/* Bible Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 flex justify-center"
            >
              <div className="relative">
                <img
                  src="/bibleicon.png"
                  alt="Bible Icon"
                  className="w-20 h-20 object-contain filter drop-shadow-lg"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#906140] rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Dotted Line */}
            <div className="w-full border-t-2 border-dotted border-[#f19045] mb-8" />

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl font-bold text-[#9d5b28] mb-4  tracking-wide font-ThePriest"
              style={{
                textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                // fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              The Word
            </motion.h1>

            {/* Decorative Line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-px bg-[#906140] mx-auto mb-8"
            />

            {/* Welcome Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-gray-600 text-lg mb-8 font-light leading-relaxed"
            >
              Unsearchable reaches of Christ
              <br />
              <span className="text-sm text-gray-500">
                Ready to dive into word
              </span>
            </motion.p>

            {/* Receipt Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-left mb-8 space-y-2 text-sm text-gray-100 font-mono"
            >
              <div className="flex justify-between border-b border-dotted border-[#84644c] backdrop-blur-md pb-1">
                <span>VERSION:</span>
                <span>v1.0.0</span>
              </div>
            </motion.div>

            {/* Enter Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnterApp}
              className="group relative bg-[#52331c] hover:bg-[#7d5439] text-white px-8 py-4 rounded-r-full rounded-bl-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <Book className="w-5 h-5" />
              Read the Word
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>

            {/* Receipt Total */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="mt-8 pt-4 border-t-2 border-dotted border-[#84644c]"
            >
              <div className="text-center font-mono text-sm text-gray-500">
                TOTAL BLESSINGS: IMMEASURABLE
              </div>
              <div className="text-center font-mono text-xs text-[#84644c] mt-1">
                Thank you for choosing The Word
              </div>
            </motion.div>
          </div>

          {/* Receipt Footer Perforations */}
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ancient golden light from pyramids */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-radial from-amber-300/20 via-yellow-200/10 to-transparent rounded-full blur-3xl"
        />

        {/* Mystical energy from the word */}
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-radial from-orange-300/15 via-amber-200/8 to-transparent rounded-full blur-2xl"
        />

        {/* Desert wind effect */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.1, 0.25, 0.1],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-gradient-radial from-yellow-400/10 via-amber-300/5 to-transparent rounded-full blur-3xl"
        />

        {/* Ancient wisdom glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-1/3 right-1/3 w-36 h-36 bg-[#906140]/15 rounded-full blur-2xl"
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;
