import React, { useEffect, useState, useRef } from "react";
import { X, ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";

interface PresentationOverlayProps {
  backgroundSrc: string;
  text: string;
  isPresenting: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentVerse?: number;
  totalVerses?: number;
}

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  backgroundSrc,
  text,
  isPresenting,
  onClose,
  onNext,
  onPrev,
  currentVerse,
  totalVerses,
}) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [textOverflows, setTextOverflows] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textElementRef = useRef<HTMLParagraphElement>(null);

  // Handle text overflow detection
  useEffect(() => {
    if (isPresenting && textContainerRef.current && textElementRef.current) {
      const checkOverflow = () => {
        const container = textContainerRef.current;
        const textElement = textElementRef.current;

        if (container && textElement) {
          const isOverflowing =
            textElement.scrollHeight > container.clientHeight;
          setTextOverflows(isOverflowing);
        }
      };

      checkOverflow();

      // Recheck on resize
      const handleResize = () => {
        checkOverflow();
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isPresenting, text]);

  // Auto-scroll functionality
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;

    if (autoScroll && textOverflows && textContainerRef.current) {
      const container = textContainerRef.current;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      let currentScroll = 0;

      // Reset scroll position when starting
      container.scrollTop = 0;

      // Create smooth scrolling effect
      scrollInterval = setInterval(() => {
        if (currentScroll < scrollHeight) {
          currentScroll += 1;
          container.scrollTop = currentScroll;
        } else {
          // Pause at the bottom before restarting
          clearInterval(scrollInterval!);
          setTimeout(() => {
            container.scrollTop = 0;
            currentScroll = 0;
            // Restart auto-scroll after pause
            if (autoScroll) {
              scrollInterval = setInterval(() => {
                if (currentScroll < scrollHeight) {
                  currentScroll += 1;
                  container.scrollTop = currentScroll;
                } else {
                  clearInterval(scrollInterval!);
                }
              }, 50);
            }
          }, 3000);
        }
      }, 50);
    }

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [autoScroll, textOverflows]);

  // Handle Escape key and navigation keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPresenting) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
      // Add navigation with left and right arrow keys
      if (isPresenting) {
        if (event.key === "ArrowRight" && onNext) {
          onNext();
        }
        if (event.key === "ArrowLeft" && onPrev) {
          onPrev();
        }
        if (event.key === "f" || event.key === "F") {
          toggleFullscreen();
        }
        // Toggle auto-scroll with "s" key
        if (event.key === "s" || event.key === "S") {
          setAutoScroll((prev) => !prev);
        }
      }
    };

    // Add animation on mount
    if (isPresenting) {
      // Small delay to trigger animation
      setTimeout(() => setFadeIn(true), 10);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPresenting, onClose, onNext, onPrev]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Calculate dynamic text size based on text length
  const getTextSizeClass = () => {
    const textLength = text.length;

    if (textLength > 400) return "text-2xl sm:text-3xl md:text-5xl lg:text-5xl";
    if (textLength > 200) return "text-3xl sm:text-4xl md:text-5xl lg:text-6xl";
    return "text-3xl sm:text-4xl md:text-6xl lg:text-7xl";
  };

  if (!isPresenting) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
      id="presentation-overlay"
    >
      {/* Background overlay with image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundSrc})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>
      </div>

      {/* Control bar - top */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
        {/* Verse reference indicator */}
        {currentVerse && totalVerses && (
          <div className="text-white font-semibold px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg text-sm md:text-base">
            Verse {currentVerse} <span className="opacity-70">of</span>{" "}
            {totalVerses}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {textOverflows && (
            <button
              onClick={() => setAutoScroll((prev) => !prev)}
              className={`p-2 rounded-full backdrop-blur-sm text-white transition-colors duration-200 ${
                autoScroll
                  ? "bg-green-600/70 hover:bg-green-700/70"
                  : "bg-black/50 hover:bg-black/70"
              }`}
              aria-label={autoScroll ? "Stop auto-scroll" : "Start auto-scroll"}
            >
              <span className="text-xs font-medium">Auto</span>
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors duration-200"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors duration-200"
            aria-label="Close presentation"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation buttons - sides */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        {onPrev && (
          <button
            onClick={onPrev}
            disabled={currentVerse === 1}
            className="ml-4 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 transform hover:scale-110 z-10 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
            aria-label="Previous verse"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        {onNext && (
          <button
            onClick={onNext}
            disabled={currentVerse === totalVerses}
            className="mr-4 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 transform hover:scale-110 z-10 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
            aria-label="Next verse"
          >
            <ArrowRight size={24} />
          </button>
        )}
      </div>

      {/* Text content with scroll handling */}
      <div className="relative z-10 max-w-6xl w-full px-6 md:px-12 h-3/4 flex items-center justify-center">
        <div
          ref={textContainerRef}
          className={`w-full h-full flex items-center justify-center overflow-y-auto no-scrollbar ${
            textOverflows && !autoScroll
              ? "scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
              : ""
          } ${autoScroll ? "overflow-hidden" : ""}`}
        >
          <p
            ref={textElementRef}
            className={`text-white font-bitter ${getTextSizeClass()} font-bold tracking-wide drop-shadow-xl text-center px-4 py-8 ${
              textOverflows && !autoScroll ? "my-auto" : ""
            }`}
            style={{
              textShadow: "0 4px 8px rgba(0,0,0,0.5)",
              maxWidth: "90%",
              lineHeight: "1.4",
            }}
          >
            {text}
          </p>
        </div>
      </div>

      {/* Scroll indicator for mobile - only show if text overflows and not auto-scrolling */}
      {textOverflows && !autoScroll && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center animate-bounce">
          <div className="h-10 w-6 rounded-full border-2 border-white/40 flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-1 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts info - bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="text-white/70 text-xs bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex gap-4 flex-wrap justify-center">
          <span>← → Navigate</span>
          <span>F: Fullscreen</span>
          {textOverflows && <span>S: Auto-scroll</span>}
          <span>ESC: Exit</span>
        </div>
      </div>
    </div>
  );
};

export default PresentationOverlay;
