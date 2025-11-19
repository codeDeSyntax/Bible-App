import React, { useEffect, useState } from "react";
import { Preset } from "@/store/slices/appSlice";

interface DefaultPresentationProps {
  preset: Preset;
}

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

const DefaultPresentation: React.FC<DefaultPresentationProps> = ({
  preset,
}) => {
  const { backgroundColor = "#000000", backgroundImage } = preset.data;

  // Check if this is the Shalom preset (should use styled image instead of text)
  const isShalomPreset = preset.id === "default-shalom";

  // Check if this is the You are welcome preset (should use styled image instead of text)
  const isWelcomePreset = preset.id === "default-you-are-welcome";

  // Check if confetti should be shown (only for Welcome preset and other default presets, not Shalom)
  const shouldShowConfetti = !isShalomPreset;

  // Check if sparkles should be shown (only for Shalom preset)
  const shouldShowSparkles = isShalomPreset;

  // Generate confetti particles
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const confettiColors = [
    "#2b7ee2",
    "#ffffff",
    "#2b7ee2",
    "#ffffff",
    "#2b7ee2",
    "#ffffff",
    "#2b7ee2",
    "#2b7ee2",
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
        ) : null}
      </div>

      {/* Animation Styles */}
      <style>{`
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

export default DefaultPresentation;
