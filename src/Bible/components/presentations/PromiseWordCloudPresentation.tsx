import React, { useState, useEffect } from "react";
import { Preset } from "@/store/slices/appSlice";

interface PromiseWordCloudPresentationProps {
  preset: Preset;
}

const PromiseWordCloudPresentation: React.FC<
  PromiseWordCloudPresentationProps
> = ({ preset }) => {
  const { backgroundImage } = preset.data;

  // Promise images from public/promise folder
  const promiseImages = [
    "./promise/token.png",
    "./promise/kingdom.png",
    "./promise/outpouring.png",
    "./promise/capstone.png",
    "./promise/headstone.png",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % promiseImages.length);
        setIsSliding(false);
      }, 500); // Half the transition time
    }, 3500); // Change image every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#000000",
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
      )}

      {/* Dark overlay for better text/image visibility */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-16">
        {/* Static Title Text */}
        <h1
          className="text-white font-bold mb-12"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            textShadow:
              "0 0 30px rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.9)",
            fontFamily: "Arial Black, sans-serif",
          }}
        >
          Our heartthrob is
        </h1>

        {/* Sliding Promise Images */}
        <div className="relative w-full max-w-4xl h-96 overflow-hidden">
          <img
            key={currentImageIndex}
            src={promiseImages[currentImageIndex]}
            alt="Promise"
            className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ${
              isSliding
                ? "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
            style={{
              filter: "drop-shadow(0 10px 40px rgba(0, 0, 0, 0.8))",
            }}
          />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(-100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PromiseWordCloudPresentation;
