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

  // Always use paint-sweeps-gold.jpg for scripture presets
  const backgroundImage = "./paint-sweeps-gold.jpg";

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* Bokeh Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundColor: "#1a1a1a",
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center px-16  max-w-7xl mx-auto">
        {/* Reference Badge at Top Left - Slim and Close to Text */}
        <div className="">
          <div className="bg-white px-6 py-3 rounded shadow-lg inline-block">
            <span
              className="text-black font-bold tracking-wider uppercase leading-none"
              style={{
                fontSize: "1.25rem",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {book} {chapter}:{verse} (NIV)
            </span>
          </div>
        </div>

        {/* Scripture Text - Left Aligned */}
        <div className="text-left">
          <p
            className="text-white font-bold leading-relaxed"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              textShadow:
                "0 4px 12px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6)",
              // lineHeight: "1.5",
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
