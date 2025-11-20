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

      {/* Title and subtitle stacked boxes */}
      <div className="relative z-10 w-[85vw] mx-auto flex flex-col gap-1">
        {/* Main Title - White Box */}
        <div
          className="bg-white/95 px-20 py-3 shadow-2xl"
          style={{
            textAlign,
          }}
        >
          <span
            className="font-black uppercase tracking-wider"
            style={{
              fontSize: `${Math.min(fontSize * 0.8, 80)}px`,
              fontFamily,
              color: "#000000",
              lineHeight: "1.1",
            }}
          >
            {title}
          </span>
        </div>

        {/* Subtitle - Dark Box */}
        {subtitle && (
          <div
            className="bg-black/80 backdrop-blur-sm px-20  py-8 shadow-2xl"
            style={{
              textAlign,
            }}
          >
            <p
              className="font-semibold tracking-wide"
              style={{
                fontSize: `${Math.min(Math.round(fontSize * 0.4), 48)}px`,
                fontFamily,
                color: textColor,
                lineHeight: "1.3",
              }}
            >
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
