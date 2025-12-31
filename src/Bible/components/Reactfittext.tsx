import React, { useEffect, useRef, useState, useCallback } from 'react';

interface FitTextProps {
  children: React.ReactNode;
  compressor?: number;
  minFontSize?: number;
  maxFontSize?: number;
  debounce?: number;
}

export const CustomFitText: React.FC<FitTextProps> = ({
  children,
  compressor = 1.0,
  minFontSize = 12,
  maxFontSize = 600,
  debounce = 100,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateFontSize = useCallback(() => {
    const parent = parentRef.current;
    const measure = measureRef.current;

    if (!parent || !measure) return;

    const parentHeight = parent.offsetHeight;
    const parentWidth = parent.offsetWidth;

    console.log('🔍 Starting CustomFitText resize - container dimensions:', {
      containerHeight: parentHeight,
      containerWidth: parentWidth,
    });

    // Recursive approach: start large (200px) and reduce until it fits HEIGHT
    // This matches your original BiblePresentationDisplay logic
    const recursiveResize = (currentSize: number): number => {
      // Apply the font size to measure element
      measure.style.fontSize = `${currentSize}px`;

      // Set line height based on font size (matching your original logic)
      let lineHeight;
      if (currentSize >= 100) {
        lineHeight = 1.0;
      } else if (currentSize >= 80) {
        lineHeight = 1.2;
      } else if (currentSize >= 60) {
        lineHeight = 1.2;
      } else if (currentSize >= 40) {
        lineHeight = 1.2;
      } else {
        lineHeight = 1.3;
      }
      measure.style.lineHeight = lineHeight.toString();

      // Force reflow to get accurate measurements
      measure.offsetHeight;

      const contentHeight = measure.scrollHeight;

      // Use 3% margin for safety (matching your original)
      const heightMargin = parentHeight * 0.02;

      // Check if content height exceeds container
      if (contentHeight > parentHeight - heightMargin) {
        // Too big, try smaller size
        if (currentSize > minFontSize) {
          return recursiveResize(currentSize - 2);
        } else {
          return minFontSize; // Minimum size
        }
      } else {
        // Fits! This is our size
        return currentSize;
      }
    };

    // Start with 200px to maximize space (matching your original approach)
    const finalSize = recursiveResize(250);

    console.log('✅ CustomFitText final size:', {
      fontSize: finalSize,
      containerHeight: parentHeight,
      contentHeight: measure.scrollHeight,
      utilization: `${((measure.scrollHeight / parentHeight) * 100).toFixed(1)}%`,
    });

    setFontSize(finalSize);
  }, [minFontSize, maxFontSize]);

  // Initial calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateFontSize();
    }, 50);

    return () => clearTimeout(timer);
  }, [calculateFontSize, children]);

  // Handle window resize with debounce
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        calculateFontSize();
      }, debounce);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [calculateFontSize, debounce]);

  // Dynamic line height based on calculated font size (matching your original logic)
  const getLineHeight = () => {
    if (!fontSize) return 1.3;
    if (fontSize >= 100) return 1.0;
    if (fontSize >= 80) return 1.2;
    if (fontSize >= 60) return 1.2;
    if (fontSize >= 40) return 1.2;
    return 1.3;
  };

  return (
    <div
      ref={parentRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Hidden measurement element */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: '100%',
          top: 0,
          left: 0,
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Visible content */}
      <div
        ref={childRef}
        style={{
          fontSize: fontSize ? `${fontSize}px` : '12px',
          lineHeight: getLineHeight(),
          width: '100%',
          opacity: fontSize ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};