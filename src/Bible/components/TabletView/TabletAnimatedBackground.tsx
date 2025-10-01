import { useState, useEffect, useMemo, useCallback } from "react";

interface LineData {
  id: string;
  x: number;
  y: number;
  height?: number;
  width?: number;
  color: string;
  duration: number;
  delay: number;
  thickness?: number;
  useGradient: boolean;
  useFilter: boolean;
  animationClass: string;
}

interface ParticleData {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  useFilter: boolean;
  animationClass: string;
}

interface TabletAnimatedBackgroundProps {
  isDarkMode: boolean;
}

export function TabletAnimatedBackground({
  isDarkMode,
}: TabletAnimatedBackgroundProps) {
  const [verticalLines, setVerticalLines] = useState<LineData[]>([]);
  const [horizontalLines, setHorizontalLines] = useState<LineData[]>([]);
  const [particles, setParticles] = useState<ParticleData[]>([]);

  // Memoize tablet colors to avoid recalculation
  const tabletColors = useMemo(() => {
    if (isDarkMode) {
      return {
        primary: "255, 255, 255", // White for visibility on brown
        secondary: "229, 231, 235", // Light gray for contrast
        accent: "203, 213, 225", // Lighter gray accent
        gradientFrom: "bg-white/5",
        gradientTo: "bg-gray-100/5",
        circleColors: {
          primary: "rgba(255, 255, 255, 0.1)",
          secondary: "rgba(229, 231, 235, 0.08)",
        },
      };
    } else {
      return {
        primary: "75, 85, 99", // Dark gray for visibility on white
        secondary: "55, 65, 81", // Darker gray for contrast
        accent: "107, 114, 128", // Medium gray accent
        gradientFrom: "bg-gray-800/5",
        gradientTo: "bg-gray-900/5",
        circleColors: {
          primary: "rgba(75, 85, 99, 0.12)",
          secondary: "rgba(55, 65, 81, 0.1)",
        },
      };
    }
  }, [isDarkMode]);

  // Generate vertical lines (subtle tablet-style)
  const generateVerticalLines = useCallback(() => {
    const newLines: LineData[] = [];
    for (let i = 0; i < 40; i++) {
      const lineHeight = Math.random() * 40 + 15;
      const useGradient = Math.random() > 0.7;
      const useFilter = Math.random() > 0.8;
      const duration = Math.random() * 12 + 8;
      const delay = Math.random() * 6;
      const lineData: LineData = {
        id: `v-${i}`,
        x: Math.random() * 95 + 2.5,
        y: Math.random() * 35 + 15,
        height: lineHeight,
        color: `rgba(${
          Math.random() > 0.6 ? tabletColors.primary : tabletColors.secondary
        }, ${Math.random() * 0.4 + 0.3})`,
        duration,
        delay,
        width: Math.random() > 0.8 ? 1.5 : 0.8,
        useGradient,
        useFilter,
        animationClass: `tablet-move-up-${Math.floor(duration)}-${Math.floor(delay * 10)}`,
      };
      newLines.push(lineData);
    }
    setVerticalLines(newLines);
  }, [tabletColors]);

  // Generate horizontal lines (subtle flowing lines)
  const generateHorizontalLines = useCallback(() => {
    const newLines: LineData[] = [];
    for (let i = 0; i < 40; i++) {
      const lineWidth = Math.random() * 35 + 20;
      const useGradient = Math.random() > 0.8;
      const useFilter = Math.random() > 0.7;
      const duration = Math.random() * 18 + 10;
      const delay = Math.random() * 8;
      const lineData: LineData = {
        id: `h-${i}`,
        x: Math.random() * 25 + 10,
        y: Math.random() * 85 + 10,
        width: lineWidth,
        color: `rgba(${
          Math.random() > 0.5 ? tabletColors.primary : tabletColors.secondary
        }, ${Math.random() * 0.2 + 0.05})`,
        duration,
        delay,
        thickness: Math.random() > 0.7 ? 1.2 : 0.6,
        useGradient,
        useFilter,
        animationClass: `tablet-move-right-${Math.floor(duration)}-${Math.floor(delay * 10)}`,
      };
      newLines.push(lineData);
    }
    setHorizontalLines(newLines);
  }, [tabletColors]);

  // Generate floating particles (minimal)
  const generateParticles = useCallback(() => {
    const newParticles: ParticleData[] = [];
    for (let i = 0; i < 360; i++) {
      const useFilter = Math.random() > 0.6;
      const duration = Math.random() * 25 + 15;
      const delay = Math.random() * 8;
      const particleData: ParticleData = {
        id: `p-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.8,
        color: `rgba(${
          Math.random() > 0.5 ? tabletColors.primary : tabletColors.accent
        }, ${Math.random() * 0.4 + 0.2})`,
        duration,
        delay,
        useFilter,
        animationClass: `tablet-float-${Math.floor(duration)}-${Math.floor(delay * 10)}`,
      };
      newParticles.push(particleData);
    }
    setParticles(newParticles);
  }, [tabletColors]);

  useEffect(() => {



    generateVerticalLines();
    generateHorizontalLines();
    generateParticles();

    // Optimized intervals for better performance
    const horizontalInterval = setInterval(generateHorizontalLines, 5000); // Reduced frequency
    const verticalInterval = setInterval(generateVerticalLines, 15000); // Reduced frequency  
    const particleInterval = setInterval(generateParticles, 20000); // Reduced frequency

    return () => {
      clearInterval(horizontalInterval);
      clearInterval(verticalInterval);
      clearInterval(particleInterval);
    };
  }, [isDarkMode, generateVerticalLines, generateHorizontalLines, generateParticles]);

  const colors = isDarkMode
    ? {
        circleColors: {
          primary: "rgba(96, 165, 250, 0.15)",
          secondary: "rgba(168, 85, 247, 0.12)",
        },
      }
    : {
        circleColors: {
          primary: "rgba(59, 130, 246, 0.08)",
          secondary: "rgba(147, 51, 234, 0.06)",
        },
      };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle gradient overlay */}
      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? "bg-gradient-to-br from-white/3 via-transparent to-gray-100/3"
            : "bg-gradient-to-br from-gray-800/3 via-transparent to-gray-900/3"
        }`}
      />

      {/* Subtle gradient circles */}
      <div
        className="absolute top-1/3 -right-24 w-72 h-72 rounded-full opacity-60 blur-3xl animate-pulse"
        style={{
          background: `radial-gradient(circle, ${
            colors.circleColors.primary
          } 0%, ${colors.circleColors.primary.replace(
            isDarkMode ? "0.15" : "0.08",
            isDarkMode ? "0.08" : "0.04"
          )} 35%, transparent 70%)`,
          animationDuration: "12s",
        }}
      />

      <div
        className="absolute bottom-1/4 -left-20 w-56 h-56 rounded-full opacity-50 blur-2xl animate-pulse"
        style={{
          background: `radial-gradient(circle, ${
            colors.circleColors.secondary
          } 0%, ${colors.circleColors.secondary.replace(
            isDarkMode ? "0.12" : "0.06",
            isDarkMode ? "0.06" : "0.03"
          )} 40%, transparent 75%)`,
          animationDuration: "16s",
          animationDelay: "3s",
        }}
      />

      <svg className="w-full h-full">
        <defs>
          <linearGradient
            id="tabletLineGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={
                isDarkMode
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(75, 85, 99, 0.7)"
              }
            />
            <stop
              offset="50%"
              stopColor={
                isDarkMode
                  ? "rgba(229, 231, 235, 0.4)"
                  : "rgba(55, 65, 81, 0.5)"
              }
            />
            <stop
              offset="100%"
              stopColor={
                isDarkMode
                  ? "rgba(203, 213, 225, 0.2)"
                  : "rgba(107, 114, 128, 0.3)"
              }
            />
          </linearGradient>

          <linearGradient
            id="tabletHorizontalGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor={
                isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(75, 85, 99, 0.4)"
              }
            />
            <stop
              offset="50%"
              stopColor={
                isDarkMode
                  ? "rgba(229, 231, 235, 0.5)"
                  : "rgba(55, 65, 81, 0.6)"
              }
            />
            <stop
              offset="100%"
              stopColor={
                isDarkMode
                  ? "rgba(203, 213, 225, 0.2)"
                  : "rgba(107, 114, 128, 0.3)"
              }
            />
          </linearGradient>

          <filter id="tabletGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render vertical lines */}
        {verticalLines.map((line) => (
          <line
            key={line.id}
            x1={`${line.x}%`}
            y1={`${line.y}%`}
            x2={`${line.x}%`}
            y2={`${line.y + (line.height || 0)}%`}
            stroke={line.useGradient ? "url(#tabletLineGradient)" : line.color}
            strokeWidth={line.width}
            strokeLinecap="round"
            filter={line.useFilter ? "url(#tabletGlow)" : "none"}
            className="tablet-line-vertical"
            style={{
              animationDuration: `${line.duration}s`,
              animationDelay: `${line.delay}s`,
              willChange: "transform, opacity",
            } as React.CSSProperties}
          />
        ))}

        {/* Render horizontal lines */}
        {horizontalLines.map((line) => (
          <line
            key={line.id}
            x1={`${line.x}%`}
            y1={`${line.y}%`}
            x2={`${line.x + (line.width || 0)}%`}
            y2={`${line.y}%`}
            stroke={line.useGradient ? "url(#tabletHorizontalGradient)" : line.color}
            strokeWidth={line.thickness}
            strokeLinecap="round"
            filter={line.useFilter ? "url(#tabletGlow)" : "none"}
            className="tablet-line-horizontal"
            style={{
              animationDuration: `${line.duration}s`,
              animationDelay: `${line.delay}s`,
              willChange: "transform, opacity",
            } as React.CSSProperties}
          />
        ))}

        {/* Render floating particles */}
        {particles.map((particle) => (
          <circle
            key={particle.id}
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r={particle.size}
            fill={particle.color}
            filter={particle.useFilter ? "url(#tabletGlow)" : "none"}
            className="tablet-particle"
            style={{
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              willChange: "transform, opacity",
            } as React.CSSProperties}
          />
        ))}
      </svg>

      <style>{`
        .tablet-line-vertical {
          animation: tabletMoveUp linear infinite;
          transform: translateZ(0); /* Hardware acceleration */
        }
        
        .tablet-line-horizontal {
          animation: tabletMoveRight linear infinite;
          transform: translateZ(0); /* Hardware acceleration */
        }
        
        .tablet-particle {
          animation: tabletFloat ease-in-out infinite;
          transform: translateZ(0); /* Hardware acceleration */
        }
        
        @keyframes tabletMoveUp {
          0% {
            transform: translate3d(0, 100%, 0);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(0, -100%, 0);
            opacity: 0;
          }
        }

        @keyframes tabletMoveRight {
          0% {
            transform: translate3d(-100%, 0, 0);
            opacity: 0;
          }
          20% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(100%, 0, 0);
            opacity: 0;
          }
        }

        @keyframes tabletFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translate3d(0, -8px, 0) scale(1.08);
            opacity: 0.7;
          }
          50% {
            transform: translate3d(0, -4px, 0) scale(0.95);
            opacity: 0.9;
          }
          75% {
            transform: translate3d(0, -12px, 0) scale(1.03);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
