import React from "react";
import {
  BookOpen,
  Type,
  ImageIcon,
  Quote,
  List,
  Megaphone,
} from "lucide-react";
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
  // Debug logging for default presets
  //   React.useEffect(() => {
  //     const defaultPresets = presets.filter((p) => p.type === "default");
  //     console.log("=== DEFAULT PRESETS DEBUG ===");
  //     defaultPresets.forEach((preset) => {
  //       console.log(`ID: ${preset.id}`);
  //       console.log(`Type: ${preset.type}`);
  //       console.log(`Background Image: ${preset.data.backgroundImage}`);
  //       console.log(`Background Color: ${preset.data.backgroundColor}`);
  //       console.log("---");
  //     });
  //   }, [presets]);

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                ...(preset.data.presetType === "announcement"
                  ? {
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                    }
                  : preset.type === "image"
                  ? {
                      backgroundImage: `url(${preset.data.url})`,
                    }
                  : preset.type === "scripture"
                  ? {
                      backgroundImage: `url(${preset.data.backgroundImage})`,
                    }
                  : (preset.type === "default" ||
                      preset.type === "promise" ||
                      preset.type === "text") &&
                    preset.data.backgroundImage
                  ? {
                      backgroundImage: `url(${preset.data.backgroundImage})`,
                    }
                  : (preset.type === "text" ||
                      preset.type === "default" ||
                      preset.type === "promise") &&
                    !preset.data.backgroundImage
                  ? {
                      backgroundColor: preset.data.backgroundColor || "#000000",
                    }
                  : {}),
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
                {preset.data.presetType === "quote" && (
                  <Quote className="w-3 h-3 text-white" />
                )}
                {preset.data.presetType === "list" && (
                  <List className="w-3 h-3 text-white" />
                )}
                {preset.data.presetType === "announcement" && (
                  <Megaphone className="w-3 h-3 text-white" />
                )}
                {(preset.type === "text" ||
                  preset.type === "default" ||
                  preset.type === "promise") &&
                  !preset.data.presetType && (
                    <Type className="w-3 h-3 text-white" />
                  )}
              </div>

              {/* Delete Button - hidden for default presets */}
              {!preset.id.startsWith("default-") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePreset(preset.id);
                  }}
                  className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <span className="text-white text-xs font-bold">×</span>
                </button>
              )}
            </div>

            {/* Scripture Text or Title */}
            <div className="space-y-1">
              {preset.type === "scripture" && (
                <div className="text-white text-[16px] leading-tight line-clamp-2 font-medium">
                  {preset.data.text}
                </div>
              )}

              {/* Text Presets - Show different previews based on presetType */}
              {(preset.type === "text" ||
                preset.type === "default" ||
                preset.type === "promise") &&
                (() => {
                  // Shalom and Welcome special cases
                  if (preset.id === "default-shalom") {
                    return (
                      <div className="flex items-center justify-center h-10">
                        <img
                          src="./shalom.png"
                          alt="Shalom"
                          className="max-w-full max-h-full object-contain"
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
                          }}
                        />
                      </div>
                    );
                  }

                  if (preset.id === "default-you-are-welcome") {
                    return (
                      <div className="flex items-center justify-center h-10">
                        <img
                          src="./welcome.png"
                          alt="Welcome"
                          className="max-w-full max-h-full object-contain"
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
                          }}
                        />
                      </div>
                    );
                  }

                  // Quote Preview
                  if (preset.data.presetType === "quote") {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="border-2 border-white/40 px-2 py-1.5 bg-black/10 backdrop-blur-sm rounded relative">
                          <Quote className="w-2 h-2 text-white/40 absolute top-0.5 left-0.5" />
                          <p className="text-[9px] text-white/90 line-clamp-2 text-center px-2">
                            {preset.data.quoteText || preset.data.text}
                          </p>
                          {preset.data.author && (
                            <p className="text-[7px] text-white/70 text-right mt-0.5">
                              — {preset.data.author}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Title Preview
                  if (preset.data.presetType === "title") {
                    return (
                      <div className="space-y-0.5">
                        <div className="bg-white/90 px-2 py-1 rounded-sm">
                          <p className="text-[9px] font-black text-black uppercase line-clamp-1 text-center">
                            {preset.data.title}
                          </p>
                        </div>
                        {preset.data.subtitle && (
                          <div className="bg-black/70 px-2 py-0.5 rounded-sm">
                            <p className="text-[7px] text-white line-clamp-1 text-center">
                              {preset.data.subtitle}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // List Preview
                  if (preset.data.presetType === "list") {
                    const items = preset.data.listItems || [];
                    return (
                      <div className="space-y-0.5">
                        {items.slice(0, 2).map((item, idx) => (
                          <React.Fragment key={idx}>
                            <div className="bg-black/70 px-1.5 py-0.5">
                              <span className="text-[7px] text-white uppercase font-semibold line-clamp-1">
                                {item}
                              </span>
                            </div>
                            {idx < 2 && idx < items.length - 1 && (
                              <div className="h-px bg-purple-400/50" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  }

                  // Announcement Preview
                  if (preset.data.presetType === "announcement") {
                    return (
                      <div className="flex items-center justify-center h-full px-1">
                        <div className="bg-white/90 rounded-lg px-2 py-1.5 w-full shadow-sm">
                          <Megaphone className="w-2.5 h-2.5 text-purple-600 mx-auto mb-0.5" />
                          <p className="text-[8px] font-bold text-purple-600 uppercase line-clamp-1 text-center">
                            {preset.data.announcementTitle || preset.data.title}
                          </p>
                          <p className="text-[6px] text-gray-600 line-clamp-2 text-center mt-0.5">
                            {preset.data.announcementMessage ||
                              preset.data.text}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Simple Text/Default Preview
                  return (
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
                  );
                })()}

              {preset.type === "image" && (
                <div className="text-white text-xs font-semibold">
                  {preset.name}
                </div>
              )}

              {/* Scripture Reference */}
              <div className="text-white/90 text-[15px] font-semibold">
                {preset.type === "scripture"
                  ? preset.data.reference
                  : preset.type === "promise"
                  ? "Promise Word Cloud"
                  : preset.type === "default"
                  ? "Default Card"
                  : preset.data.presetType === "quote"
                  ? "Quote"
                  : preset.data.presetType === "title"
                  ? "Title"
                  : preset.data.presetType === "list"
                  ? "List"
                  : preset.data.presetType === "announcement"
                  ? "Announcement"
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
