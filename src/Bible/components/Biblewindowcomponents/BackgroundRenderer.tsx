import React, { useEffect, useState } from "react";

interface BackgroundRendererProps {
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  projectionBackgroundColor: string;
  isBackgroundLoading: boolean;
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  projectionBackgroundImage,
  projectionGradientColors,
  projectionBackgroundColor,
  isBackgroundLoading,
}) => {
  // Force re-render when background settings change
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey((prev) => prev + 1);
    console.log("🎨 BackgroundRenderer: Background settings changed", {
      image: projectionBackgroundImage,
      gradient: projectionGradientColors,
      color: projectionBackgroundColor,
    });
  }, [
    projectionBackgroundImage,
    projectionGradientColors,
    projectionBackgroundColor,
  ]);
  // Dynamic background based on projection settings
  const getBackgroundStyle = () => {
    // Priority: Image > Gradient > Solid Color

    // 1. Background Image (highest priority)
    if (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") {
      return {
        backgroundImage: `url(${projectionBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#fff", // Fallback while image loads
        transition: "all 0.3s ease-in-out",
      };
    }

    // 2. Gradient Background
    if (projectionGradientColors && projectionGradientColors.length >= 2) {
      return {
        background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
        transition: "background 0.3s ease-in-out",
      };
    }

    // 3. Solid Color (lowest priority)
    return {
      backgroundColor: projectionBackgroundColor || "#1e293b",
      transition: "background-color 0.3s ease-in-out",
    };
  };

  return (
    <div
      key={renderKey}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="w-full h-full" style={getBackgroundStyle()} />

      {/* Background Loading Overlay - Modern design */}
      {isBackgroundLoading && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-20">
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-2xl animate-pulse" />

            {/* Loading card */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4">
                {/* Spinner with glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-75 animate-pulse" />
                  <div
                    className="relative w-6 h-6 border-3 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin"
                    style={{
                      borderWidth: "3px",
                      boxShadow: "0 0 20px rgba(96, 165, 250, 0.5)",
                    }}
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1">
                  <span className="text-white font-semibold text-lg tracking-wide">
                    Loading Background
                  </span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          boxShadow: "0 0 8px rgba(96, 165, 250, 0.8)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay effects for depth - adaptive based on background type */}
      {projectionBackgroundImage && projectionBackgroundImage.trim() !== "" ? (
        <>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent" />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/15" />
        </>
      )}
    </div>
  );
};
