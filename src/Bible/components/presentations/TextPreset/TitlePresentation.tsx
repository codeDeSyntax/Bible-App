import React from "react";

interface TitlePresentationProps {
  title: string;
  subtitle: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
}

export const TitlePresentation: React.FC<TitlePresentationProps> = ({
  title,
  subtitle,
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

      {/* Title and subtitle container */}
      <div className="relative z-10 max-w-7xl mx-auto px-16 flex flex-col items-center gap-8">
        {/* Main Title */}
        <h1
          className="font-black uppercase tracking-wider drop-shadow-2xl"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            textAlign,
            color: textColor,
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            lineHeight: "1.1",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className="font-medium tracking-wide drop-shadow-xl"
          style={{
            fontSize: `${Math.round(fontSize * 0.4)}px`,
            fontFamily,
            textAlign,
            color: textColor,
            textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};
