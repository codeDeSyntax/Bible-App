import React, { useRef, useState } from "react";
// import { Studiodiv } from "./Studiodiv";
import {
  BookmarkCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Tooltip } from "antd";
import type { Preset } from "@/store/slices/appSlice";
import { BentoCard } from "./BentoCard";

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
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const [row1Arrows, setRow1Arrows] = useState({ left: false, right: false });
  const [row2Arrows, setRow2Arrows] = useState({ left: false, right: false });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filter out default presets and limit to 10, sort by creation date (latest first)
  const allPresets = [...presets]
    .filter((preset) => !preset.id.startsWith("default-"))
    .sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return timeB - timeA;
    })
    .slice(0, 10); // Limit to 10 presets

  // Split presets into two rows (5 each)
  const row1Presets = allPresets.slice(0, 5);
  const row2Presets = allPresets.slice(5, 10);

  // Check scroll position for a specific row
  const checkScroll = (
    ref: React.RefObject<HTMLDivElement>,
    setArrows: React.Dispatch<
      React.SetStateAction<{ left: boolean; right: boolean }>
    >
  ) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setArrows({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 10,
      });
    }
  };

  // Handle scroll for both rows
  React.useEffect(() => {
    const checkRow1 = () => checkScroll(row1Ref, setRow1Arrows);
    const checkRow2 = () => checkScroll(row2Ref, setRow2Arrows);

    checkRow1();
    checkRow2();

    const container1 = row1Ref.current;
    const container2 = row2Ref.current;

    if (container1) container1.addEventListener("scroll", checkRow1);
    if (container2) container2.addEventListener("scroll", checkRow2);

    return () => {
      if (container1) container1.removeEventListener("scroll", checkRow1);
      if (container2) container2.removeEventListener("scroll", checkRow2);
    };
  }, [presets.length]);

  // Scroll handlers for each row
  const scrollRow = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Handle delete div click - open modal
  const handleDeleteClick = (preset: Preset) => {
    setPresetToDelete({
      id: preset.id,
      name: preset.data?.reference || preset.name,
    });
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (presetToDelete) {
      onPresetDelete(presetToDelete.id);
    }
    setDeleteModalOpen(false);
    setPresetToDelete(null);
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPresetToDelete(null);
  };

  return (
    <div className="col-span-3 row-span-3 rounded-xl p-3 flex flex-col overflow-hidden relative cursor-pointer bg-card-bg">
      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm rounded-xl"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <BentoCard
            isDarkMode={isDarkMode}
            className="w-1/2"
            // className={`w-[280px] rounded-lg p-4 shadow-xl ${
            //   isDarkMode
            //     ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]"
            //     : "bg-gradient-to-br from-white to-gray-50"
            // }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(239, 68, 68, 0.1)",
                  }}
                >
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Delete Preset?
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                Delete{" "}
                <span
                  className={`font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  "{presetToDelete?.name}"
                </span>
                ?
              </p>
              <div className="flex gap-2 mt-2">
                <div
                  onClick={cancelDelete}
                  className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all bg-select-bg hover:bg-select-hover text-text-primary"
                >
                  Cancel
                </div>
                <div
                  onClick={confirmDelete}
                  className="flex-1 px-3 py-1.5 rounded text-xs font-medium text-white transition-all"
                  style={{
                    background: "linear-gradient(145deg, #ef4444, #dc2626)",
                  }}
                >
                  Delete
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      )}

      {/* Manual Header */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md"
          style={{
            background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
          }}
        >
          <BookmarkCheck className="w-4 h-4" style={{ color: "white" }} />
        </div>
        <h3 className="text-[0.9rem] font-semibold text-text-primary">
          All Presets
        </h3>
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {allPresets.length === 0 ? (
          <div className="flex-1 flex-col flex items-center justify-center">
            <img src="./svgs/no_files.svg" alt="empty" className="h-16 w-16" />
            <p className="text-[0.9rem] text-text-secondary text-center">
              No presets saved yet.
              <br />
              Save a preset to get started!
            </p>
          </div>
        ) : (
          <>
            {/* Row 1 */}
            <div className="relative cursor-pointer flex-1">
              {row1Arrows.left && (
                <div
                  onClick={() => scrollRow(row1Ref, "left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  style={{
                    background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                  }}
                >
                  <ChevronLeft size={20} className="text-text-primary" />
                </div>
              )}

              {row1Arrows.right && (
                <div
                  onClick={() => scrollRow(row1Ref, "right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  style={{
                    background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                  }}
                >
                  <ChevronRight size={20} className="text-text-primary" />
                </div>
              )}

              <div
                ref={row1Ref}
                className="h-full overflow-x-auto overflow-y-hidden no-scrollbar"
              >
                <div className="flex gap-1 h-full">
                  {row1Presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="relative cursor-pointer group h-[5.3rem] w-[14vw] flex-shrink-0 p-0 border-none outline-none ring-0"
                    >
                      <Tooltip title={preset.data?.text || ""} placement="top">
                        <div
                          onClick={() => onPresetSelect(preset)}
                          className="w-full text-left h-full border-none outline-none ring-0"
                        >
                          <div
                            className="relative w-full h-full rounded-lg overflow-hidden p-0 border-none outline-none ring-0"
                            style={{
                              background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
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
                                className="absolute inset-0 bg-cover bg-center p-0 "
                                style={{
                                  backgroundImage: `url(${preset.data.backgroundImage})`,
                                }}
                              />
                            ) : null}

                            {/* Content overlay */}
                            <div className="relative z-10 p-2 flex flex-col gap-1 h-full">
                              <span className="text-[0.9rem] font-semibold text-white drop-shadow-lg truncate w-full">
                                {preset.data?.reference || preset.name}
                              </span>
                              <span className="text-[0.9rem] font-ThePriest text-white drop-shadow-md line-clamp-2  w-full">
                                {preset.data?.text || ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Tooltip>

                      {/* Delete div */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(preset);
                        }}
                        className="absolute z-50 -top-1 -right-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(145deg, #ef4444, #dc2626)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        <Trash2 size={10} style={{ color: "white" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2 */}
            {row2Presets.length > 0 && (
              <div className="relative flex-1">
                {row2Arrows.left && (
                  <div
                    onClick={() => scrollRow(row2Ref, "left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    style={{
                      background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
                    }}
                  >
                    <ChevronLeft size={20} className="text-text-primary" />
                  </div>
                )}

                {row2Arrows.right && (
                  <div
                    onClick={() => scrollRow(row2Ref, "right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(145deg, #2a2a2a, #1f1f1f)"
                        : "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    }}
                  >
                    <ChevronRight size={20} className="text-text-primary" />
                  </div>
                )}

                <div
                  ref={row2Ref}
                  className="h-full overflow-x-auto overflow-y-hidden no-scrollbar"
                >
                  <div className="flex gap-1 h-full">
                    {row2Presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="relative cursor-pointer group h-[5.3rem] w-[14vw] flex-shrink-0 p-0 border-none outline-none ring-0"
                      >
                        <Tooltip
                          title={preset.data?.text || ""}
                          placement="top"
                        >
                          <div
                            onClick={() => onPresetSelect(preset)}
                            className="w-full text-left h-full border-none outline-none ring-0"
                          >
                            <div
                              className="relative cursor-pointer w-full h-full rounded-lg overflow-hidden p-0 border-none outline-none ring-0"
                              style={{
                                background: `linear-gradient(145deg, var(--btn-normal-from), var(--btn-normal-to))`,
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
                                preset.data.images.length === 1 ? (
                                  <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                      backgroundImage: `url(${preset.data.images[0]})`,
                                    }}
                                  />
                                ) : (
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
                                <div
                                  className="absolute inset-0 bg-cover bg-center p-0"
                                  style={{
                                    backgroundImage: `url(${preset.data.backgroundImage})`,
                                  }}
                                />
                              ) : null}

                              {/* Content overlay */}
                              <div className="relative cursor-pointer z-10 p-2 flex flex-col gap-1 h-full">
                                <span className="text-[0.9rem] font-semibold text-white drop-shadow-lg truncate w-full">
                                  {preset.data?.reference || preset.name}
                                </span>
                                <span className="text-[0.9rem] font-ThePriest text-white drop-shadow-md line-clamp-2  w-full">
                                  {preset.data?.text || ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Tooltip>

                        {/* Delete div */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(preset);
                          }}
                          className="absolute z-50 -top-1 -right-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(145deg, #ef4444, #dc2626)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        >
                          <Trash2 size={10} style={{ color: "white" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
