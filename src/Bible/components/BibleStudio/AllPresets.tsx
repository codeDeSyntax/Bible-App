import React from "react";
import { StudioButton } from "./StudioButton";
import { BookmarkCheck, Trash2 } from "lucide-react";
import { Tooltip } from "antd";
import type { Preset } from "@/store/slices/appSlice";

interface ScripturePresetsCardProps {
  presets: Preset[];
  onPresetSelect: (preset: Preset) => void;
  onPresetDelete: (presetId: string) => void;
  isDarkMode: boolean;
}

/**
 * Card 5: All Presets
 * Shows all saved presets for quick access
 */
export const ScripturePresetsCard: React.FC<ScripturePresetsCardProps> = ({
  presets,
  onPresetSelect,
  onPresetDelete,
  isDarkMode,
}) => {
  // Filter out default presets (those with IDs starting with "default-")
  // Sort all presets by creation date (latest first) - create a copy to avoid mutating state
  const allPresets = [...presets]
    .filter((preset) => !preset.id.startsWith("default-"))
    .sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return timeB - timeA;
    });

  return (
    <div
      className={`col-span-2 row-span-3 rounded-xl p-3 flex flex-col overflow-hidden ${
        isDarkMode ? "bg-black" : "bg-gray-100"
      }`}
    >
      {/* Manual Header */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#252525] to-[#1a1a1a] flex items-center justify-center shadow-md">
          <BookmarkCheck className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          All Presets
        </h3>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto no-scrollbar flex flex-col gap-2">
        {allPresets.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              No presets saved yet.
              <br />
              Save a preset to get started!
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-3 gap-2 overflow-y-auto no-scrollbar flex-1"
            style={{ minHeight: 0 }}
          >
            {allPresets.map((preset) => (
              <div key={preset.id} className="relative group h-24">
                <Tooltip title={preset.data?.text || ""} placement="top">
                  <button
                    onClick={() => onPresetSelect(preset)}
                    className="w-full text-left h-full border-none"
                  >
                    <div
                      className="relative w-full h-full rounded-lg overflow-hidden "
                      style={{
                        background: isDarkMode
                          ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                          : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
                        boxShadow: isDarkMode
                          ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                          : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
                        minHeight: "80px",
                      }}
                    >
                      {/* Video Background - Priority */}
                      {preset.data?.videoBackground ? (
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        >
                          <source
                            src={preset.data.videoBackground}
                            type="video/mp4"
                          />
                        </video>
                      ) : preset.type === "image" &&
                        preset.data?.images &&
                        Array.isArray(preset.data.images) &&
                        preset.data.images.length > 0 ? (
                        /* Image Preset - Show first image or grid if multiple */
                        preset.data.images.length === 1 ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${preset.data.images[0]})`,
                            }}
                          />
                        ) : (
                          /* Multiple images - show in grid */
                          <div
                            className="absolute inset-0 grid gap-0.5 h-full w-full"
                            style={{
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gridTemplateRows:
                                preset.data.images.length <= 2
                                  ? "1fr"
                                  : "repeat(2, 1fr)",
                            }}
                          >
                            {preset.data.images
                              .slice(0, 4)
                              .map((img: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-cover bg-center w-full h-full"
                                  style={{
                                    backgroundImage: `url(${img})`,
                                  }}
                                />
                              ))}
                          </div>
                        )
                      ) : preset.data?.backgroundImage ? (
                        /* Background Image - Fallback for other preset types */
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${preset.data.backgroundImage})`,
                          }}
                        />
                      ) : null}

                      {/* Dark overlay for better text visibility */}
                      {/* {(preset.data?.videoBackground ||
                        preset.data?.backgroundImage) && (
                        <div className="absolute inset-0 bg-black/30" />
                      )} */}
                      {/* <div className="absolute inset-0 bg-black/30" /> */}
                      {/* Content overlay */}
                      <div className="relative z-10 p-2 flex flex-col gap-1 h-full">
                        <span className="text-sm font-semibold text-white drop-shadow-lg truncate w-full">
                          {preset.data?.reference || preset.name}
                        </span>
                        <span className="text-sm text-white drop-shadow-md line-clamp-2 leading-tight   w-full">
                          {preset.data?.text || ""}
                        </span>
                      </div>
                    </div>
                  </button>
                </Tooltip>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPresetDelete(preset.id);
                  }}
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: isDarkMode
                      ? "linear-gradient(145deg, #ef4444, #dc2626)"
                      : "linear-gradient(145deg, #f87171, #ef4444)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <Trash2 size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
