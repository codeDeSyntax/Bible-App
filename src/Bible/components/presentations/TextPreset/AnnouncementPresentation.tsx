import React from "react";

interface AnnouncementPresentationProps {
  title: string;
  message: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  textColor: string;
  backgroundColor: string;
  backgroundImage?: string;
}

export const AnnouncementPresentation: React.FC<
  AnnouncementPresentationProps
> = ({
  title,
  message,
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

      {/* Split screen layout */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Title section - takes up more space */}
        <div
          className="flex-1 flex items-center justify-center bg-black/60 backdrop-blur-sm border-b-4"
          style={{
            borderColor: textColor,
          }}
        >
          <h1
            className="font-black uppercase tracking-wider px-16"
            style={{
              fontSize: `${Math.round(fontSize * 0.8)}px`,
              fontFamily,
              textAlign,
              color: textColor,
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
              lineHeight: "1.1",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Message section */}
        <div className="flex-1 flex items-center justify-center px-16">
          <p
            className="font-semibold tracking-wide drop-shadow-2xl max-w-5xl"
            style={{
              fontSize: `${Math.round(fontSize * 0.45)}px`,
              fontFamily,
              textAlign,
              color: textColor,
              textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)",
              lineHeight: "1.4",
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
