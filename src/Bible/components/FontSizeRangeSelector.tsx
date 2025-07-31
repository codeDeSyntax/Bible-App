import React, { useState, useEffect, useRef } from 'react';
import { Type } from 'lucide-react';

interface FontSizeRangeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const FontSizeRangeSelector: React.FC<FontSizeRangeSelectorProps> = ({
  value,
  onChange,
  min = 12,
  max = 48,
  step = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const calculatePercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const calculateValue = (percentage: number) => {
    const rawValue = (percentage / 100) * (max - min) + min;
    const steps = Math.round((rawValue - min) / step);
    return Math.min(max, Math.max(min, min + (steps * step)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (trackRef.current) {
      setIsDragging(true);
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      onChange(calculateValue(percentage));
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      onChange(calculateValue(percentage));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const percentage = calculatePercentage(value);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-primary" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Font Size: {value}px
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(min, value - step))}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-[#3d332a] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#4a3e34] transition-colors"
          >
            -
          </button>
          <button
            onClick={() => onChange(Math.min(max, value + step))}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-[#3d332a] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#4a3e34] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute w-4 h-4 bg-primary rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 hover:ring-4 ring-primary/20 transition-all"
          style={{ left: `${percentage}%`, top: '50%' }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{min}px</span>
        <span>{max}px</span>
      </div>

      {/* Preview Text */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-stone-100/50 dark:from-stone-800 dark:to-stone-900/50 border border-gray-200/50 dark:border-gray-700/50">
        <p className="text-gray-700 dark:text-gray-200" style={{ fontSize: `${value}px` }}>
          "For God so loved the world..." — Preview at {value}px
        </p>
      </div>
    </div>
  );
};

export default FontSizeRangeSelector; 