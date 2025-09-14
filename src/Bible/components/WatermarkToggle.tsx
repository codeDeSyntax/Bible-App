import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setShowWatermarkBackground } from "@/store/slices/bibleSlice";
import { useTheme } from "@/Provider/Theme";

interface WatermarkToggleProps {
  show: boolean; // Controls when the toggle is visible
}

const WatermarkToggle: React.FC<WatermarkToggleProps> = ({ show }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const showWatermarkBackground = useSelector(
    (state: RootState) => state.bible.showWatermarkBackground
  );

  const handleToggle = () => {
    dispatch(setShowWatermarkBackground(!showWatermarkBackground));
  };

  if (!show) return null;

  return (
    <div
      className="fixed top-10 right-0 z-50 cursor-pointer"
      onClick={handleToggle}
      style={{ zIndex: 1000 }}
    >
      {/* Simple standalone leaf - small and minimal */}
      <div className="group transition-all duration-300 hover:scale-110">
        <svg
          width="28"
          height="28"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-all duration-300 drop-shadow-md ${
            showWatermarkBackground
              ? isDarkMode
                ? "text-orange-400"
                : "text-orange-600"
              : isDarkMode
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          {/* Simple leaf shape */}
          <path
            d="M50 10 Q25 20 20 45 Q25 70 50 80 Q75 70 80 45 Q75 20 50 10 Z"
            fill="currentColor"
            opacity={showWatermarkBackground ? "0.9" : "0.5"}
          />
          {/* Leaf vein */}
          <path
            d="M50 15 Q50 35 50 75"
            stroke={isDarkMode ? "#1f2937" : "#ffffff"}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Branch veins */}
          <path
            d="M50 30 Q40 35 35 40 M50 30 Q60 35 65 40"
            stroke={isDarkMode ? "#1f2937" : "#ffffff"}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M50 50 Q40 55 35 60 M50 50 Q60 55 65 60"
            stroke={isDarkMode ? "#1f2937" : "#ffffff"}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>

        {/* Subtle glow effect when active */}
        {showWatermarkBackground && (
          <div
            className={`
              absolute inset-0 rounded-full animate-pulse
              ${isDarkMode ? "bg-orange-400/20" : "bg-orange-600/20"}
              -z-10
            `}
            style={{ filter: "blur(8px)" }}
          />
        )}
      </div>
    </div>
  );
};

export default WatermarkToggle;
