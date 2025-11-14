import React from "react";
import { useTheme } from "@/Provider/Theme";

interface TabletFrameProps {
  children: React.ReactNode;
}

const TabletFrame: React.FC<TabletFrameProps> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative -z-0">
      {/* Tablet Shadow */}
      <div
        className="absolute inset-0 rounded-2xl transform translate-x-2 translate-y-2 blur-lg transition-opacity duration-300"
        style={{
          backgroundColor: isDarkMode ? "#000000" : "#666666",
          opacity: isDarkMode ? 0.6 : 0.3,
        }}
      />

      {/* Tablet Body */}
      <div
        className="relative rounded-2xl shadow-2xl transition-all duration-300"
        style={{
          boxShadow: isDarkMode
            ? "inset 0 1px 3px rgba(27, 26, 26, 0.3), 0 20px 40px -12px rgba(0, 0, 0, 0.4)"
            : "inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 20px 40px -12px rgba(0, 0, 0, 0.15)",
          width: "900px",
          height: "600px",
          backgroundColor: isDarkMode ? "#313131" : "#fcfcfc",
          border: `1px solid ${isDarkMode ? "#2c2c2c" : "#c0c0c0"}`,
          padding: "6px 8px 6px 8px",
        }}
      >
        {/* Screen Bezel */}
        <div
          className="rounded-xl h-full w-full transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? "#2c2c2c" : "#f4f3f3",
            // border: `1px solid ${isDarkMode ? "#333333" : "#1a1a1a"}`,
          }}
        >
          {/* Actual Screen */}
          <div className="rounded-lg h-full w-full overflow-hidden relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabletFrame;
