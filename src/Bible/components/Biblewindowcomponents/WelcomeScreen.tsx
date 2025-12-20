import React from "react";

interface WelcomeScreenProps {}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      {/* Simple Spinner */}
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-24 w-24 border-solid border-b-2 border-x  drop-shadow-md shadow-purple-600 shadow-lg border-white"></div>
      </div>
    </div>
  );
};
