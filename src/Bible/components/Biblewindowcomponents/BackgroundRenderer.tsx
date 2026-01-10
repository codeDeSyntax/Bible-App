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
  const [overlayOpacity, setOverlayOpacity] = useState<number>(30); // default 30%
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false); // grayscale filter state
  // Debug log removed
  // Force re-render when background settings change
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey((prev) => prev + 1);
    console.log("🎨 BackgroundRenderer: Background settings changed", {
      image: projectionBackgroundImage,
      gradient: projectionGradientColors,
      color: projectionBackgroundColor,
      hasGradient:
        projectionGradientColors && projectionGradientColors.length >= 2,
      willShowGradient:
        !projectionBackgroundImage &&
        projectionGradientColors &&
        projectionGradientColors.length >= 2,
      imageIsEmpty:
        !projectionBackgroundImage || projectionBackgroundImage.trim() === "",
    });
  }, [
    projectionBackgroundImage,
    projectionGradientColors,
    projectionBackgroundColor,
  ]);

  // Load preset overlay opacity on mount and listen for updates
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (
          typeof window !== "undefined" &&
          window.api &&
          window.api.getPresetSettings
        ) {
          const settings = await window.api.getPresetSettings();
          if (
            mounted &&
            settings &&
            typeof settings.backgroundOpacity === "number"
          ) {
            setOverlayOpacity(settings.backgroundOpacity);
          }
        }
      } catch (err) {
        // ignore
      }
    };
    load();

    const handler = (_ev: any, payload: any) => {
      try {
        if (payload && payload.type === "updateStyle" && payload.data) {
          const d = payload.data;
          if (typeof d.backgroundOverlayOpacity === "number") {
            setOverlayOpacity(d.backgroundOverlayOpacity);
          } else if (typeof d.backgroundOpacity === "number") {
            setOverlayOpacity(d.backgroundOpacity);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    const grayscaleHandler = (_ev: any, data: any) => {
      if (typeof data.enabled === "boolean") {
        console.log(
          "🎨 BackgroundRenderer: Grayscale filter toggled:",
          data.enabled
        );
        setIsGrayscale(data.enabled);
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.on("bible-presentation-update", handler);
      window.ipcRenderer.on("projection-grayscale-toggle", grayscaleHandler);
    }

    return () => {
      mounted = false;
      if (typeof window !== "undefined" && window.ipcRenderer) {
        try {
          window.ipcRenderer.removeListener(
            "bible-presentation-update",
            handler
          );
          window.ipcRenderer.removeListener(
            "projection-grayscale-toggle",
            grayscaleHandler
          );
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);
  // Dynamic background based on projection settings
  const getBackgroundStyle = () => {
    // Priority: Image > Gradient > Solid Color
    const hasImage =
      projectionBackgroundImage && projectionBackgroundImage.trim() !== "";
    const hasGradient =
      projectionGradientColors && projectionGradientColors.length >= 2;

    // Debug log removed

    // TEMP: Gradient Background (highest priority for testing)
    if (hasGradient) {
      console.log(
        "🎨 BackgroundRenderer: Using GRADIENT background (TEMP priority):",
        projectionGradientColors
      );
      return {
        background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
        transition: "background 0.3s ease-in-out",
        filter: isGrayscale ? "grayscale(100%)" : "none",
      };
    }

    // 1. Background Image (only if no gradient)
    if (hasImage) {
      // Debug log removed
      return {
        backgroundImage: `url(${projectionBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#fff", // Fallback while image loads
        transition: "all 0.3s ease-in-out",
        filter: isGrayscale ? "grayscale(100%)" : "none",
      };
    }

    // 2. Gradient Background
    if (hasGradient) {
      console.log(
        "🎨 BackgroundRenderer: Using GRADIENT background:",
        projectionGradientColors
      );
      return {
        background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
        transition: "background 0.3s ease-in-out",
        filter: isGrayscale ? "grayscale(100%)" : "none",
      };
    }

    // 3. Solid Color (lowest priority)
    console.log(
      "🎨 BackgroundRenderer: Using SOLID COLOR background:",
      projectionBackgroundColor
    );
    return {
      backgroundColor: projectionBackgroundColor || "#1e293b",
      transition: "background-color 0.3s ease-in-out",
      filter: isGrayscale ? "grayscale(100%)" : "none",
    };
  };

  return (
    <div
      key={renderKey}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="w-full h-full" style={getBackgroundStyle()} />

      {/* Background Loading Overlay - Simple spinner */}
      {isBackgroundLoading && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-20">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-50"></div>
          </div>
        </div>
      )}

      {/* Overlay effects for depth - adaptive based on background type */}
      {projectionBackgroundImage && projectionBackgroundImage.trim() !== "" ? (
        <>
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5"
            style={{ opacity: Math.min(0.6, overlayOpacity / 100) }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/15"
            style={{ opacity: Math.min(0.7, overlayOpacity / 100 + 0.1) }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent"
            style={{ opacity: Math.min(0.25, (overlayOpacity / 100) * 0.2) }}
          />
          <div
            className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/15"
            style={{ opacity: Math.min(0.4, (overlayOpacity / 100) * 0.3) }}
          />
        </>
      )}
    </div>
  );
};
