import React from "react";
import { BookOpen, Type, ImageIcon } from "lucide-react";
import { Preset } from "@/store/slices/appSlice";

interface PresetGridProps {
  presets: Preset[];
  activePresetId: string | null;
  projectionBackgroundImage: string;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
}

export const PresetGrid: React.FC<PresetGridProps> = ({
  presets,
  activePresetId,
  projectionBackgroundImage,
  onLoadPreset,
  onDeletePreset,
}) => {
  if (presets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No saved presets yet
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Create your first preset to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {presets.map((preset) => (
        <div
          key={preset.id}
          className={`relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
            activePresetId === preset.id
              ? "border-[#313131] dark:border-[#b8835a]"
              : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
          }`}
          onClick={() => onLoadPreset(preset)}
        >
          {/* Background Image(s) */}
          {preset.type === "image" &&
          preset.data.images &&
          preset.data.images.length > 0 ? (
            <div className="absolute inset-0 grid grid-cols-2 gap-0.5 ">
              {preset.data.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`bg-cover bg-center ${
                    preset.data.images!.length === 1
                      ? "col-span-2"
                      : preset.data.images!.length === 3 && idx === 0
                      ? "col-span-2"
                      : ""
                  }`}
                  style={{ backgroundImage: `url(${img})` }}
                />
              ))}
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  preset.type === "image"
                    ? `url(${preset.data.url})`
                    : preset.type === "scripture"
                    ? `url(${preset.data.backgroundImage || "/wood2.jpg"})`
                    : "none",
                backgroundColor:
                  preset.type === "text"
                    ? preset.data.backgroundColor || "#000000"
                    : undefined,
              }}
            />
          )}

          {/* Content Overlay */}
          <div className="relative h-32 p-3 flex flex-col justify-center">
            {/* Type Icon */}
            <div className="absolute flex justify-between items-start">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
                {preset.type === "image" && (
                  <ImageIcon className="w-3 h-3 text-white" />
                )}
                {preset.type === "scripture" && (
                  <BookOpen className="w-3 h-3 text-white" />
                )}
                {preset.type === "text" && (
                  <Type className="w-3 h-3 text-white" />
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePreset(preset.id);
                }}
                className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <span className="text-white text-xs font-bold">×</span>
              </button>
            </div>

            {/* Scripture Text or Title */}
            <div className="space-y-1">
              {preset.type === "scripture" && (
                <div className="text-white text-[16px] leading-tight line-clamp-2 font-medium">
                  {preset.data.text}
                </div>
              )}
              {preset.type === "text" && (
                <div
                  className="text-[10px] leading-tight line-clamp-2 font-medium"
                  style={{
                    color: preset.data.textColor || "#ffffff",
                    fontFamily: preset.data.fontFamily || "Arial",
                    textAlign: preset.data.textAlign || "center",
                  }}
                >
                  {preset.data.text}
                </div>
              )}
              {preset.type === "image" && (
                <div className="text-white text-xs font-semibold">
                  {preset.name}
                </div>
              )}

              {/* Scripture Reference */}
              <div className="text-white/90 text-[15px] font-semibold">
                {preset.type === "scripture"
                  ? preset.data.reference
                  : preset.type === "text"
                  ? "Custom Text"
                  : "Image"}
              </div>
            </div>
          </div>

          {/* Active Indicator */}
          {activePresetId === preset.id && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-lg animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};
