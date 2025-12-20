import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store";
import { Preset } from "@/store/slices/appSlice";

interface ScripturePresentationProps {
  preset: Preset;
}

const ScripturePresentation: React.FC<ScripturePresentationProps> = ({
  preset,
}) => {
  const [videoAutoPlay, setVideoAutoPlay] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(40);

  // Load preset settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.api.getPresetSettings();
        setVideoAutoPlay(settings.videoAutoPlay);
        setBackgroundOpacity(settings.backgroundOpacity);
      } catch (error) {
        console.error("Failed to load preset settings:", error);
      }
    };
    loadSettings();
  }, []);
  // Extract scripture data from preset (with type safety)
  const data = preset.data as {
    book?: string;
    chapter?: number;
    verse?: number;
    text?: string;
    backgroundImage?: string;
    videoBackground?: string;
    fontSize?: number;
    fontFamily?: string;
  };
  const {
    book,
    chapter,
    verse,
    text,
    fontSize = 48,
    fontFamily = "Montserrat, sans-serif",
  } = data;

  // Use video background if provided, otherwise use image background
  const videoBackground = data.videoBackground;
  const backgroundImage = data.backgroundImage || "./paint-sweeps-gold.jpg";

  // Debug log
  console.log("ScripturePresentation - Video Background:", videoBackground);
  console.log("ScripturePresentation - Background Image:", backgroundImage);
  console.log("ScripturePresentation - Full data:", data);

  // Calculate adaptive font size based on text length
  const textLength = text?.length || 0;
  const getAdaptiveFontSize = () => {
    if (textLength < 100) return fontSize;
    if (textLength < 200) return Math.max(fontSize * 0.85, 32);
    if (textLength < 300) return Math.max(fontSize * 0.7, 28);
    return Math.max(fontSize * 0.6, 24);
  };

  const adaptiveFontSize = getAdaptiveFontSize();

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* Video or Image Background */}
      {videoBackground ? (
        <video
          src={videoBackground}
          autoPlay={videoAutoPlay}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundColor: "#1a1a1a",
          }}
        />
      )}

      {/* Dark overlay for better text readability */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: backgroundOpacity / 100 }}
      />

      {/* Content Container - Centered layout matching image */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-16 py-12 max-w-7xl mx-auto text-center">
        {/* Scripture Text - Main content at top/center */}
        <div className="mb-4">
          <span
            className="text-white font-bold uppercase tracking-wide"
            style={{
              fontSize: `${adaptiveFontSize}px`,
              fontFamily: fontFamily,
              textShadow:
                "0 4px 12px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6)",
              lineHeight: textLength > 200 ? "1.5" : "1.4",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              letterSpacing: "0.05em",
            }}
          >
            {text}
          </span>
        </div>

        {/* Scripture Reference - Below text, italic style */}
        <div className="mb-4">
          <h2
            className="text-white italic"
            style={{
              fontSize: `${Math.max(adaptiveFontSize * 0.5, 36)}px`,
              fontFamily: "Georgia, serif",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
              letterSpacing: "0.1em",
            }}
          >
            {book} {chapter}:{verse}
          </h2>
          {/* Decorative line under reference */}
          <div
            className="mx-auto mt-2 bg-white"
            style={{
              width: "200px",
              height: "2px",
            }}
          />
        </div>

        {/* Translation Name - Small text below reference */}
        <div>
          <p
            className="text-white uppercase tracking-widest"
            style={{
              fontSize: `${Math.max(adaptiveFontSize * 0.25, 14)}px`,
              fontFamily: "Arial, sans-serif",
              textShadow: "0 2px 6px rgba(0, 0, 0, 0.8)",
              letterSpacing: "0.2em",
              opacity: 0.9,
            }}
          >
            New King James Version
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScripturePresentation;
