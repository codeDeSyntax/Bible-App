import React from "react";

interface LiveBorderProps {}

export const LiveBorder: React.FC<LiveBorderProps> = () => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Main red border */}
      <div className="absolute inset-0 border-1 border-opacity-45 border-dashed border-red-500 shadow-lg shadow-red-500/30"></div>
    </div>
  );
};
