import React, { useEffect, useState } from "react";
import { Preset } from "@/store/slices/appSlice";

interface TextPresentationProps {
  preset: Preset;
}

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

const TextPresentation: React.FC<TextPresentationProps> = ({ preset }) => {
  const {
    text,
    fontSize = 48,
    fontFamily = "Arial Black",
    textAlign = "center",
    textColor = "#ffffff",
    backgroundColor = "#000000",
    backgroundImage,
    enableConfetti = false,
  } = preset.data;

  // Check if this is the Shalom preset (should use styled image instead of text)
  const isShalomPreset = preset.id === "default-shalom";

  // Check if this is the You are welcome preset (should use styled image instead of text)
  const isWelcomePreset = preset.id === "default-you-are-welcome";

  // Check if font is cursive/script style
  const isCursiveFont =
    fontFamily.toLowerCase().includes("script") ||
    fontFamily.toLowerCase().includes("cursive") ||
    fontFamily.toLowerCase().includes("brush");

  // Check if confetti should be shown (only for Welcome preset and other default presets, not Shalom)
  const shouldShowConfetti =
    (preset.type === "default" || enableConfetti) && !isShalomPreset;

  // Check if sparkles should be shown (only for Shalom preset)
  const shouldShowSparkles = isShalomPreset;

  // Generate confetti particles
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const confettiColors = [
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
  ];

  // Generate sparkle particles for Shalom preset
  const [sparkles, setSparkles] = useState<Confetti[]>([]);
  const sparkleColors = [
    "#FFD700", // Gold
    "#FFA500", // Orange
    "#FFFF00", // Yellow
    "#FFE4B5", // Moccasin
    "#F0E68C", // Khaki
    "#FAFAD2", // Light goldenrod
  ];

  useEffect(() => {
    // Generate confetti if enabled
    if (shouldShowConfetti) {
      const pieces: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        color:
          confettiColors[Math.floor(Math.random() * confettiColors.length)],
      }));
      setConfetti(pieces);
    }
  }, [shouldShowConfetti]);

  useEffect(() => {
    // Generate sparkles for Shalom preset
    if (shouldShowSparkles) {
      const sparkleParticles: Confetti[] = Array.from(
        { length: 40 },
        (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 2 + Math.random() * 2,
          color:
            sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
        })
      );
      setSparkles(sparkleParticles);
    }
  }, [shouldShowSparkles]);

  // Generate pattern based on background color for visual interest
  const getBackgroundPattern = () => {
    // Convert hex to RGB to determine if it's dark or light
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    const isDark = brightness < 128;
    const overlayOpacity = isDark ? 0.05 : 0.08;
    const overlayColor = isDark ? "255, 255, 255" : "0, 0, 0";

    return {
      backgroundImage: `
        linear-gradient(45deg, rgba(${overlayColor}, ${overlayOpacity}) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(${overlayColor}, ${overlayOpacity}) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(${overlayColor}, ${overlayOpacity}) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(${overlayColor}, ${overlayOpacity}) 75%)
      `,
      backgroundSize: "60px 60px",
      backgroundPosition: "0 0, 0 30px, 30px -30px, -30px 0px",
    };
  };

  const patternStyle = getBackgroundPattern();

  return (
    <div
      className="w-full h-screen flex items-center justify-center px-16 relative overflow-hidden"
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      {/* Background Image if provided */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}

      {/* Subtle pattern overlay - only if no background image */}
      {!backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            ...patternStyle,
          }}
        />
      )}

      {/* Radial gradient overlay for depth - only if no background image */}
      {!backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, transparent 0%, ${backgroundColor}15 100%)`,
          }}
        />
      )}

      {/* Confetti Animation - only for Welcome and other default presets */}
      {shouldShowConfetti &&
        confetti.map((piece) => (
          <div
            key={piece.id}
            className="confetti"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              backgroundColor: piece.color,
            }}
          />
        ))}

      {/* Sparkle Animation - only for Shalom preset */}
      {shouldShowSparkles &&
        sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle"
            style={{
              left: `${sparkle.left}%`,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
              backgroundColor: sparkle.color,
            }}
          />
        ))}

      {/* Content */}
      <div className="w-full max-w-7xl relative z-10">
        {isShalomPreset ? (
          // Render styled image for Shalom preset
          <div className="flex items-center justify-center text-appear">
            <img
              src="./shalom.png"
              alt="Shalom and God bless you"
              className="max-w-[90%] max-h-[60vh] object-contain"
              style={{
                filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))",
                animation: "float3d 6s ease-in-out infinite",
              }}
            />
          </div>
        ) : isWelcomePreset ? (
          // Render styled image for Welcome preset
          <div className="flex items-center justify-center text-appear">
            <img
              src="./welcome.png"
              alt="You are welcome"
              className="max-w-[90%] max-h-[60vh] object-contain"
              style={{
                filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))",
                animation: "float3d 6s ease-in-out infinite",
              }}
            />
          </div>
        ) : (
          // Render text for other presets
          <p
            className="text-3d text-appear"
            style={{
              fontSize: `${fontSize * 2}px`, // Increased from 1.5x to 2x for bigger text
              fontFamily: fontFamily,
              textAlign: textAlign as any,
              color: textColor,
              lineHeight: 1.4,
              wordWrap: "break-word",
              fontWeight: isCursiveFont ? "normal" : "bold",
              fontStyle: isCursiveFont ? "italic" : "normal",
              textShadow: isCursiveFont
                ? `
                2px 2px 0px rgba(150, 150, 150, 0.8),
                4px 4px 0px rgba(120, 120, 120, 0.7),
                6px 6px 0px rgba(100, 100, 100, 0.6),
                8px 8px 0px rgba(80, 80, 80, 0.5),
                10px 10px 10px rgba(0, 0, 0, 0.4),
                12px 12px 15px rgba(0, 0, 0, 0.3),
                0 0 20px rgba(255, 255, 255, 0.2)
              `
                : `
                0 1px 0 #ccc,
                0 2px 0 #c9c9c9,
                0 3px 0 #bbb,
                0 4px 0 #b9b9b9,
                0 5px 0 #aaa,
                0 6px 1px rgba(0,0,0,.1),
                0 0 5px rgba(0,0,0,.1),
                0 1px 3px rgba(0,0,0,.3),
                0 3px 5px rgba(0,0,0,.2),
                0 5px 10px rgba(0,0,0,.25),
                0 10px 20px rgba(0,0,0,.2),
                0 20px 40px rgba(0,0,0,.15)
              `,
              transform: isCursiveFont
                ? "perspective(800px) rotateX(2deg)"
                : "perspective(1000px) rotateX(5deg)",
              letterSpacing: isCursiveFont ? "0.02em" : "0.05em",
            }}
          >
            {text}
          </p>
        )}
      </div>

      {/* 3D Animation Styles */}
      <style>{`
        .text-3d {
          animation: float3d 6s ease-in-out infinite;
        }

        .text-appear {
          animation: textAppear 1s ease-out forwards;
        }

        @keyframes float3d {
          0%, 100% {
            transform: perspective(1000px) rotateX(5deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateX(5deg) translateY(-10px);
          }
        }

        @keyframes textAppear {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(50px);
          }
          60% {
            transform: scale(1.05) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          z-index: 5;
          animation: confettiFall linear infinite;
          opacity: 0.8;
        }

        .confetti:nth-child(odd) {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .confetti:nth-child(even) {
          width: 6px;
          height: 12px;
          border-radius: 2px;
        }

        @keyframes confettiFall {
          0% {
            top: -10%;
            transform: translateX(0) rotateZ(0deg);
            opacity: 1;
          }
          50% {
            transform: translateX(50px) rotateZ(180deg);
            opacity: 0.8;
          }
          100% {
            top: 110%;
            transform: translateX(-30px) rotateZ(360deg);
            opacity: 0.3;
          }
        }

        /* Sparkle Animation Styles for Shalom preset */
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          top: -5%;
          z-index: 5;
          animation: sparkleFall linear infinite;
          border-radius: 50%;
          box-shadow: 0 0 6px 2px currentColor;
        }

        .sparkle:nth-child(3n) {
          width: 6px;
          height: 6px;
          animation: sparkleFloat linear infinite;
        }

        .sparkle:nth-child(5n) {
          width: 3px;
          height: 3px;
          animation: sparkleTwinkle ease-in-out infinite;
        }

        @keyframes sparkleFall {
          0% {
            top: -5%;
            opacity: 0;
            transform: translateY(0) scale(0);
          }
          10% {
            opacity: 1;
            transform: translateY(10vh) scale(1);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            top: 105%;
            opacity: 0;
            transform: translateY(100vh) scale(0.5);
          }
        }

        @keyframes sparkleFloat {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translate(30px, 50vh) rotate(180deg);
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-20px, 100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes sparkleTwinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default TextPresentation;
