import { Quote, QuoteIcon } from "lucide-react";
import React from "react";

interface QuotePresentationProps {
  quoteText: string;
  author: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
  videoBackground?: string;
  videoAutoPlay?: boolean;
  backgroundOpacity?: number;
}

export const QuotePresentation: React.FC<QuotePresentationProps> = ({
  quoteText,
  author,
  fontSize,
  fontFamily,
  textAlign,
  textColor,
  backgroundColor,
  backgroundImage,
  videoBackground,
  videoAutoPlay = true,
  backgroundOpacity = 40,
}) => {
  return (
    <div
      className="w-screen h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor:
          videoBackground || backgroundImage ? "transparent" : backgroundColor,
      }}
    >
      {/* Video or Image Background */}
      {videoBackground ? (
        <>
          <video
            src={videoBackground}
            autoPlay={videoAutoPlay}
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: backgroundOpacity / 100 }}
          />
        </>
      ) : backgroundImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: backgroundOpacity / 100 }}
          />
        </>
      ) : null}
      {/* Bokeh overlay effect */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" /> */}

      {/* Quote container with fixed dimensions */}
      <div className="relative z-10 w-[85vw] h-[80vh] mx-auto overflow-y-scroll no-scrollbar">
        <div
          className="border-8 border-solid px-8 py-6 w-full h-full flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm shadow-2xl relative overflow-hidden"
          style={{
            borderColor: textColor,
          }}
        >
          {/* Opening quotation mark - top left */}
          <QuoteIcon
            className="absolute top-4 left-6 size-16 z-10 font-serif leading-none -rotate-180 opacity-60"
            style={{
              color: textColor,
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
            }}
          />

          {/* Quote text - scrollable if needed */}
          <div className="flex-1 flex flex-col items-start w-full overflow-y-auto no-scrollbar px-3 relative">
            <blockquote
              className="font-bold uppercase tracking-wide relative max-w-full"
              style={{
                fontSize: `${Math.min(fontSize, 72)}px`,
                fontFamily,
                textAlign,
                color: textColor,
                textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                lineHeight: "1.3",
              }}
            >
              {quoteText}
            </blockquote>
          </div>
          {/* Author/subtitle */}
          {author && (
            <p
              className="font-medium absolute tracking-wide text-center  -bottom-4 w-full"
              style={{
                fontSize: `${Math.min(Math.round(fontSize * 0.35), 32)}px`,
                fontFamily,
                color: textColor,
                textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)",
              }}
            >
              — {author}
            </p>
          )}
          {/* Closing quotation mark - bottom right */}
          <QuoteIcon
            className="absolute bottom-4 right-6 size-16 z-10 font-serif leading-none opacity-60"
            style={{
              color: textColor,
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
