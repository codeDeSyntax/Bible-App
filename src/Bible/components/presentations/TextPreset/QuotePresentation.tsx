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
}) => {
  return (
    <div
      className="w-screen h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: backgroundImage ? "transparent" : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Bokeh overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      {/* Quote container with border */}
      <div className="relative z-10 max-w-7xl mx-auto px-16">
        <div
          className="border-8 border-solid border-white px-20 py-16 bg-white/5 backdrop-blur-sm shadow-2xl"
        
        >
          {/* Quote text */}
          <blockquote
            className="font-black uppercase tracking-wider mb-8"
            style={{
              fontSize: `${Math.round(fontSize * 0.7)}px`,
              fontFamily,
              textAlign,
              color: "white",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              lineHeight: "1.2",
            }}
          >
            {quoteText}
          </blockquote>

          {/* Author/subtitle */}
          {author && (
            <p
              className="font-medium tracking-wide"
              style={{
                fontSize: `${Math.round(fontSize * 0.35)}px`,
                fontFamily,
                textAlign,
                color: textColor,
                textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)",
              }}
            >
              {author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
