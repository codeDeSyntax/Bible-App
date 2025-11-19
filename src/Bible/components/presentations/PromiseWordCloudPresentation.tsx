import React, { useState, useEffect } from "react";
import { Preset } from "@/store/slices/appSlice";

interface PromiseWordCloudPresentationProps {
  preset: Preset;
}

const PromiseWordCloudPresentation: React.FC<
  PromiseWordCloudPresentationProps
> = ({ preset }) => {
  const { backgroundImage } = preset.data;

  // Use the words from the preset text
  const words =
    preset.data.text
      ?.split(/[,]+/)
      .map((w) => w.trim())
      .filter((w: string) => w.length > 0) || [];

  // Text phrases with animation types
  const phrases = [
    { text: "Our heartthrob is", type: "typing" },
    { text: words[0] || "The Token", type: "typing" },
    { text: words[1] || "the kingdom of God", type: "slide" },
    { text: words[2] || "Baptism of the holy spirit", type: "typing" },
    { text: words[3] || "Capstone", type: "static" },
    { text: words[4] || "Headstone", type: "slide" },
    { text: words[5] || "The promise", type: "typing" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentIndex];

    if (currentPhrase.type === "typing") {
      // Typing animation
      setIsTyping(true);
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex <= currentPhrase.text.length) {
          setDisplayText(currentPhrase.text.substring(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
            setDisplayText("");
            setIsTyping(false);
          }, 2000); // Pause before next
        }
      }, 100); // Typing speed

      return () => clearInterval(typingInterval);
    } else {
      // Slide or static animation
      setIsTyping(false);
      setDisplayText(currentPhrase.text);
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
        setDisplayText("");
      }, 3000); // Display duration

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const currentPhrase = phrases[currentIndex];

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

      {/* Black Splash in Center */}
      {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="./blacksplash.png"
          alt="splash"
          className="splash-image"
          style={{
            width: "90%",
            height: "65%",
            objectFit: "contain",
            filter: "drop-shadow(0 0 60px rgba(0, 0, 0, 0.8))",
            opacity: 0.95,
          }}
        />
      </div> */}

      {/* Animated Text Container - Centered within splash */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className="text-center"
          style={{
            maxWidth: "60%",
            padding: "0 2rem",
          }}
        >
          {currentPhrase.type === "slide" && (
            <div
              style={{
                fontSize: "clamp(3rem, 6vw, 5rem)",
                fontWeight: "bold",
                fontFamily: "Arial Black, sans-serif",
                color: "#eeb21a",
                textShadow:
                  "0 0 20px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.9)",
                animation: "slideIn 0.8s ease-out",
                
              }}
            >
              {displayText}
            </div>
          )}

          {currentPhrase.type === "typing" && (
            <div
              style={{
                fontSize: "clamp(3rem, 6vw, 5rem)",
                fontWeight: "bold",
                fontFamily: "Arial Black, sans-serif",
                color: "#FFFFFF",
                textShadow:
                  "0 0 20px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.9)",
                
              }}
            >
              {displayText}
              {isTyping && <span className="cursor">|</span>}
            </div>
          )}

          {currentPhrase.type === "static" && (
            <div
              style={{
                fontSize: "clamp(3rem, 6vw, 5rem)",
                fontWeight: "bold",
                fontFamily: "Arial Black, sans-serif",
                color: "#FFFFFF",
                textShadow:
                  "0 0 20px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.9)",
                animation: "fadeIn 0.5s ease-in",
                
              }}
            >
              {displayText}
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .splash-image {
          animation: splashBlend 4s ease-in-out infinite;
        }

        @keyframes splashBlend {
          0%, 100% {
            opacity: 0.9;
            filter: drop-shadow(0 0 60px rgba(0, 0, 0, 0.8)) brightness(1);
          }
          50% {
            opacity: 0.95;
            filter: drop-shadow(0 0 80px rgba(0, 0, 0, 0.9)) brightness(1.1);
          }
        }

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

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .cursor {
          animation: blink 0.7s infinite;
          margin-left: 4px;
        }

        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PromiseWordCloudPresentation;
