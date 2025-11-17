import React from "react";
import { useAppSelector } from "@/store";
import { Preset } from "@/store/slices/appSlice";

interface ScripturePresentationProps {
  preset: Preset;
}

const ScripturePresentation: React.FC<ScripturePresentationProps> = ({
  preset,
}) => {
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );

  // Extract scripture data from preset (with type safety)
  const data = preset.data as {
    book?: string;
    chapter?: number;
    verse?: number;
    text?: string;
    backgroundImage?: string;
  };
  const { book, chapter, verse, text, backgroundImage } = data;

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundColor: backgroundImage ? "transparent" : "#1a1a1a",
        }}
      />

      {/* Dark overlay for better text readability */}
      {backgroundImage && <div className="absolute inset-0 bg-black/40" />}

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-16">
        {/* Scripture Text */}
        <div className="text-center mb-8">
          <p
            className="text-white font-serif leading-relaxed"
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            {text}
          </p>
        </div>

        {/* Reference */}
        <div className="text-center">
          <p
            className="text-white/90 font-semibold"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
            }}
          >
            {book} {chapter}:{verse}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScripturePresentation;
