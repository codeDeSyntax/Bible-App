import React, { useState, useEffect } from "react";
import { Preset } from "@/store/slices/appSlice";

interface PromiseWordCloudPresentationProps {
  preset: Preset;
}

const PromiseWordCloudPresentation: React.FC<
  PromiseWordCloudPresentationProps
> = ({ preset }) => {
  const { videoBackground } = preset.data;

  // Promise words to display
  const promiseWords = [
    "The Token",
    "The Kingdom of God",
    // "Baptism of the Holy Spirit",
    "Capstone",
    "Headstone",
    "The Promise",
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [videoAutoPlay, setVideoAutoPlay] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(40);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false);

  // Load preset settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.api.getPresetSettings();
        setVideoAutoPlay(settings.videoAutoPlay);
        setBackgroundOpacity(settings.backgroundOpacity);
      } catch (error) {
        console.error("Failed to load preset settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Listen for grayscale toggle events
  useEffect(() => {
    const grayscaleHandler = (_ev: any, data: any) => {
      if (typeof data.enabled === "boolean") {
        console.log(
          "🎨 PromiseWordCloudPresentation: Grayscale filter toggled:",
          data.enabled
        );
        setIsGrayscale(data.enabled);
      }
    };

    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.on("projection-grayscale-toggle", grayscaleHandler);
    }

    return () => {
      if (typeof window !== "undefined" && window.ipcRenderer) {
        try {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % promiseWords.length);
        setIsSliding(false);
      }, 500); // Half the transition time
    }, 3500); // Change word every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {videoBackground ? (
        <video
          autoPlay={videoAutoPlay}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: isGrayscale ? "grayscale(100%)" : "none" }}
        >
          <source src={videoBackground} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Dark overlay for better text visibility */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: backgroundOpacity / 100 }}
      />

      {/* Content Container with Top and Bottom Bars */}
      <div className=" inset-0 flex flex-col w-[80%] py items-center justify-center z-10">
        {/* Main Content Area - Centered between bars */}
        <div
          className="flex flex-col items-center justify-center py-4 border-x-0 border-y-[1rem] border-solid border-white"
          // style={{
          //   borderStyle:"double"
          // }}
        >
          {/* Large Static Title */}
          <span
            className="text-white font-bold text-center mb-4"
            style={{
              fontSize: "clamp(2rem, 8vw, 8rem)",
              textShadow:
                "0 0 40px rgba(255, 255, 255, 0.5), 0 8px 30px rgba(0, 0, 0, 0.9), 0 4px 15px rgba(0, 0, 0, 0.7)",
              fontFamily: "Impact, Arial Black, sans-serif",
              letterSpacing: "0.05em",
              lineHeight: "1.1",
            }}
          >
            -- OUR HEARTTHROB --
          </span>

          {/* Sliding Promise Text */}
          <div className="relative w-full  h-32 bg-white rounded-full overflow-hidden flex items-center justify-center mb-12">
            <h2
              key={currentWordIndex}
              className={`absolute text-black font-archivo  text-center transition-all duration-1000 px-3 ${
                isSliding
                  ? "translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
              style={{
                fontSize: "clamp(2rem, 6vw, 5rem)",
                textShadow:
                  "0 0 30px rgba(255, 255, 255, 0.4), 0 6px 25px rgba(242, 242, 242, 0.9)",
                // fontFamily: "Arial, Helvetica, sans-serif",
                letterSpacing: "0.03em",
                // color: "#ffffff",
              }}
            >
              {promiseWords[currentWordIndex]}
            </h2>
          </div>
        </div>

        {/* Bottom White Bar - Shorter and Thicker */}
      </div>
    </div>
  );
};

export default PromiseWordCloudPresentation;
