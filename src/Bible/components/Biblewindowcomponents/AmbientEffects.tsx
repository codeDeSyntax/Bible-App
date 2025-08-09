import React from "react";

interface AmbientEffectsProps {}

export const AmbientEffects: React.FC<AmbientEffectsProps> = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-3/4 left-3/4 w-64 h-64 bg-purple-500/6 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />
    </div>
  );
};
