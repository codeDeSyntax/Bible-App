import React from "react";

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
  // Dynamic background based on projection settings
  const getBackgroundStyle = () => {
    console.log("BiblePresentationDisplay: getBackgroundStyle called with:", {
      projectionBackgroundImage,
      projectionGradientColors,
      projectionBackgroundColor,
    });

    // Priority order: Image -> Gradient -> Solid color
    if (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") {
      let imageUrl = projectionBackgroundImage;

      // Handle different image path formats
      if (projectionBackgroundImage.startsWith("./")) {
        imageUrl = projectionBackgroundImage;
      } else if (projectionBackgroundImage.match(/^[A-Za-z]:\\/)) {
        imageUrl = `file:///${projectionBackgroundImage.replace(/\\/g, "/")}`;
      } else if (projectionBackgroundImage.startsWith("/")) {
        imageUrl = `file://${projectionBackgroundImage}`;
      } else if (
        !projectionBackgroundImage.startsWith("http") &&
        !projectionBackgroundImage.startsWith("file://")
      ) {
        imageUrl = projectionBackgroundImage;
      }

      const style = {
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.3s ease-in-out",
      };
      console.log("BiblePresentationDisplay: Using background image:", {
        original: projectionBackgroundImage,
        processed: imageUrl,
        style,
      });
      return style;
    } else if (
      projectionGradientColors &&
      projectionGradientColors.length >= 2
    ) {
      const style = {
        background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
        transition: "background 0.3s ease-in-out",
      };
      console.log(
        "BiblePresentationDisplay: Using gradient background:",
        style
      );
      return style;
    } else {
      const style = {
        backgroundColor: projectionBackgroundColor || "#1e293b",
        transition: "background-color 0.3s ease-in-out",
      };
      console.log("BiblePresentationDisplay: Using solid background:", style);
      return style;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full" style={getBackgroundStyle()} />

      {/* Background Loading Overlay */}
      {isBackgroundLoading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-medium">
                Loading Background...
              </span>
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
