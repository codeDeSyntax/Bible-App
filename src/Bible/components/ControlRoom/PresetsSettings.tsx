import React from "react";
import { PresetCard } from "./PresetCard";

interface PresetsSettingsProps {
  bibleBgs: string[];
}

export const PresetsSettings: React.FC<PresetsSettingsProps> = ({
  bibleBgs,
}) => {
  return (
    <div className="w-full h-full p-1">
      <PresetCard bibleBgs={bibleBgs} />
    </div>
  );
};
