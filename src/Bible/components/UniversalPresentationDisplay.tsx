import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import BiblePresentationDisplay from "./BiblePresentationDisplay";

const UniversalPresentationDisplay: React.FC = () => {
  const [presetId, setPresetId] = useState<string | null>(null);
  const presets = useAppSelector((state) => state.app.presets);

  useEffect(() => {
    // Get preset ID from URL hash (after the #)
    const hash = window.location.hash;
    console.log("📺 Full hash:", hash);

    // Parse: #/presentation?presetId=xxx or #presentation?presetId=xxx
    const match = hash.match(/presetId=([^&]+)/);

    if (match && match[1]) {
      const id = match[1];
      setPresetId(id);
      console.log("📺 Universal Presentation - Loading preset ID:", id);
    } else {
      console.warn("⚠️ No preset ID provided in URL hash:", hash);
      console.warn("⚠️ window.location:", {
        hash: window.location.hash,
        search: window.location.search,
        href: window.location.href,
      });
    }
  }, []);

  // Find the preset
  const preset = presets.find((p) => p.id === presetId);

  console.log("📺 Looking for preset:", presetId);
  console.log("📺 Available presets:", presets.length);
  console.log("📺 Found preset:", preset?.name);

  if (!presetId || !preset) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">No Preset Selected</h1>
          <p className="text-xl opacity-70">
            {!presetId
              ? "No preset ID provided"
              : `Preset not found: ${presetId}`}
          </p>
          <p className="text-sm opacity-50 mt-4">
            Hash: {window.location.hash}
          </p>
        </div>
      </div>
    );
  }

  // Render based on preset type
  switch (preset.type) {
    case "scripture":
      return <ScripturePresentation preset={preset} />;
    case "image":
      return <ImagePresentation preset={preset} />;
    case "text":
      return <TextPresentation preset={preset} />;
    default:
      return (
        <div className="w-full h-screen flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Unknown Preset Type</h1>
            <p className="text-xl opacity-70">Type: {preset.type}</p>
          </div>
        </div>
      );
  }
};

// Scripture Presentation Component
const ScripturePresentation: React.FC<{ preset: any }> = ({ preset }) => {
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );

  // Extract scripture data from preset
  const { book, chapter, verse, text, backgroundImage } = preset.data;

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

// Image Presentation Component
const ImagePresentation: React.FC<{ preset: any }> = ({ preset }) => {
  const images = preset.data.images || [];
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Listen for control updates from main window via IPC
  useEffect(() => {
    if (window.api?.onPresentationControlUpdate) {
      console.log("📡 ImagePresentation: Setting up control listener");

      const cleanup = window.api.onPresentationControlUpdate((data: any) => {
        console.log("📡 ImagePresentation: Received control update:", data);

        if (data.type === "controls") {
          const controls = data.data;
          console.log("🎮 Applying controls:", controls);

          if (controls.zoom !== undefined) setZoom(controls.zoom);
          if (controls.panX !== undefined) setPanX(controls.panX);
          if (controls.panY !== undefined) setPanY(controls.panY);
          if (controls.rotation !== undefined) setRotation(controls.rotation);
        }
      });

      return cleanup;
    } else {
      console.warn(
        "⚠️ ImagePresentation: No onPresentationControlUpdate API available"
      );
    }
  }, []);

  if (images.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <p className="text-white text-2xl">No images in preset</p>
      </div>
    );
  }

  // Determine grid layout based on number of images
  const getGridClass = () => {
    switch (images.length) {
      case 1:
        return "grid-cols-1 grid-rows-1";
      case 2:
        return "grid-cols-2 grid-rows-1";
      case 3:
        return "grid-cols-3 grid-rows-1";
      case 4:
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-2 grid-rows-2";
    }
  };

  // Windows 11 style - centered image with pan and zoom
  if (images.length === 1) {
    return (
      <div className="w-full h-screen bg-[#202020] flex items-center justify-center overflow-hidden">
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          <img
            src={images[0]}
            alt="Presentation"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            style={{
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
            }}
          />
        </div>
      </div>
    );
  }

  // Multi-image grid layout - centered and controllable as one unit
  return (
    <div className="w-full h-screen bg-[#202020] flex items-center justify-center overflow-hidden">
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        <div
          className={`grid ${getGridClass()} gap-3`}
          style={{
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
          }}
        >
          {images.map((img: string, idx: number) => (
            <div
              key={idx}
              className="relative rounded-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center"
              style={{
                width:
                  images.length === 2
                    ? "38vw"
                    : images.length === 3
                    ? "24vw"
                    : "36vw",
                height:
                  images.length === 2
                    ? "70vh"
                    : images.length === 3
                    ? "60vh"
                    : "36vh",
              }}
            >
              <img
                src={img}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Text Presentation Component
const TextPresentation: React.FC<{ preset: any }> = ({ preset }) => {
  const {
    text,
    fontSize = 48,
    fontFamily = "Arial",
    textAlign = "center",
    textColor = "#ffffff",
    backgroundColor = "#000000",
  } = preset.data;

  return (
    <div
      className="w-full h-screen flex items-center justify-center px-16"
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      <div className="w-full max-w-7xl">
        <p
          style={{
            fontSize: `${fontSize * 1.5}px`, // Scale up for projection
            fontFamily: fontFamily,
            textAlign: textAlign as any,
            color: textColor,
            lineHeight: 1.4,
            wordWrap: "break-word",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default UniversalPresentationDisplay;
