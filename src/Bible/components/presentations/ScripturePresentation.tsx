import React from "react";
import { useAppSelector } from "@/store";
import { Preset } from "@/store/slices/appSlice";

interface ScripturePresentationProps {
  preset: Preset;
}

const ScripturePresentation: React.FC<ScripturePresentationProps> = ({
  preset,
}) => {
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
          autoPlay
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
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Container - Adaptive layout */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center px-12 py-8 max-w-7xl mx-auto">
        {/* Reference Badge at Top - Fixed size, responsive */}
        <div className="mb-6 flex-shrink-0">
          <div className="bg-white px-6 py-3 rounded shadow-lg inline-block">
            <span
              className="text-black font-bold tracking-wider uppercase leading-none"
              style={{
                fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {book} {chapter}:{verse} (NIV)
            </span>
          </div>
        </div>

        {/* Scripture Text - Adaptive with scrolling */}
        <div className="text-left flex-1 flex items-center overflow-y-auto no-scrollbar py-4">
          <p
            className="text-white font-bold w-full"
            style={{
              fontSize: `${adaptiveFontSize}px`,
              fontFamily: fontFamily,
              textShadow:
                "0 4px 12px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6)",
              lineHeight: textLength > 200 ? "1.5" : "1.4",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
            }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScripturePresentation;
