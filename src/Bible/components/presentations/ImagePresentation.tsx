import React, { useEffect, useState } from "react";
import { Preset } from "@/store/slices/appSlice";

interface ImagePresentationProps {
  preset: Preset;
}

const ImagePresentation: React.FC<ImagePresentationProps> = ({ preset }) => {
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

export default ImagePresentation;
