import React from "react";

interface SimpleTextPresentationProps {
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
  videoBackground?: string;
}

export const SimpleTextPresentation: React.FC<SimpleTextPresentationProps> = ({
  text,
  fontSize,
  fontFamily,
  textAlign,
  textColor,
  backgroundColor,
  backgroundImage,
  videoBackground,
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
        <video
          src={videoBackground}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
      ) : null}
      {/* Bokeh overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      {/* Main text container with centered styling */}
      <div className="relative z-10 max-w-7xl mx-auto px-16">
        <p
          className="leading-relaxed drop-shadow-2xl"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            textAlign,
            color: textColor,
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};
