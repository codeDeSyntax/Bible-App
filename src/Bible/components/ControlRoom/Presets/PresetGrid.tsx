import React, { useState, useMemo, useRef, useEffect } from "react";
import { BookOpen, Type, ImageIcon, Edit3, Pin } from "lucide-react";
import { Preset } from "@/store/slices/appSlice";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface PresetGridProps {
  presets: Preset[];
  activePresetId: string | null;
  projectionBackgroundImage: string;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  onEditPreset?: (preset: Preset) => void;
  onTogglePin?: (id: string) => void;
  searchQuery: string;
  filterType: Preset["type"] | "all";
}

// Glassy skeleton loader component
const GlassySkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`${className} relative overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)",
          animation: "shimmer 2s infinite",
        }}
      />
    </div>
  );
};

// Preset card skeleton loader
const PresetCardSkeleton: React.FC = () => {
  return (
    <div className="relative h-28 rounded-lg overflow-hidden group cursor-wait">
      <GlassySkeleton className="absolute inset-0 rounded-lg" />

      {/* Mock content structure */}
      <div className="relative h-full p-2 flex flex-col justify-between">
        {/* Top section */}
        <div className="flex items-center justify-between">
          <GlassySkeleton className="w-16 h-4 rounded" />
          <GlassySkeleton className="w-4 h-4 rounded-full" />
        </div>

        {/* Middle section */}
        <div className="space-y-1.5">
          <GlassySkeleton className="w-full h-3 rounded" />
          <GlassySkeleton className="w-3/4 h-3 rounded" />
        </div>

        {/* Bottom section */}
        <GlassySkeleton className="w-20 h-3 rounded" />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

// Lazy loading image component with glassy skeleton
const LazyImage: React.FC<{
  src: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, className = "", style = {} }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            setIsLoaded(true);
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true); // Still hide loader on error
    }
  }, [isLoaded, src]);

  return (
    <div
      ref={imgRef}
      className={className}
      style={{
        ...style,
        ...(!isLoaded || !imageLoaded
          ? {}
          : {
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }),
      }}
    >
      {(!isLoaded || !imageLoaded) && (
        <GlassySkeleton className="absolute inset-0" />
      )}
    </div>
  );
};

// Lazy loading video component with loading state
const LazyVideo: React.FC<{
  src: string;
  className?: string;
}> = ({ src, className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            setIsLoaded(true);
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [isLoaded]);

  const handleCanPlay = () => {
    setVideoReady(true);
  };

  return (
    <div ref={videoRef} className={`relative ${className}`}>
      {!videoReady && <GlassySkeleton className="absolute inset-0" />}
      {isLoaded && (
        <video
          ref={videoElementRef}
          loop
          muted
          playsInline
          autoPlay
          onCanPlay={handleCanPlay}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

interface PresetGridProps {
  presets: Preset[];
  activePresetId: string | null;
  projectionBackgroundImage: string;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  onEditPreset?: (preset: Preset) => void;
}

export const PresetGrid: React.FC<PresetGridProps> = ({
  presets,
  activePresetId,
  projectionBackgroundImage,
  onLoadPreset,
  onDeletePreset,
  onEditPreset,
  onTogglePin,
  searchQuery,
  filterType,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<Preset | null>(null);
  const itemsPerPage = 12;

  // Filter and search presets
  const filteredPresets = useMemo(() => {
    const filtered = presets.filter((preset) => {
      const matchesSearch =
        searchQuery === "" ||
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (preset.type === "scripture" &&
          preset.data.reference
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchesType = filterType === "all" || preset.type === filterType;

      return matchesSearch && matchesType;
    });

    // Sort by creation date (latest first) within each category
    return filtered.sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return timeB - timeA;
    });
  }, [presets, searchQuery, filterType]);

  // Helper: Group presets by category (default -> pinned -> regular)
  const defaultPresets = filteredPresets.filter((preset) =>
    preset.id?.startsWith("default-")
  );
  const pinnedPresets = filteredPresets.filter(
    (preset) => preset.pinned && !preset.id?.startsWith("default-")
  );
  const regularPresets = filteredPresets.filter(
    (preset) => !preset.pinned && !preset.id?.startsWith("default-")
  );
  const orderedPresets = [
    ...defaultPresets,
    ...pinnedPresets,
    ...regularPresets,
  ];

  // Pagination
  const totalPages = Math.ceil(orderedPresets.length / itemsPerPage);
  const paginatedPresets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return orderedPresets.slice(startIndex, startIndex + itemsPerPage);
  }, [orderedPresets, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  if (presets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base text-gray-500 dark:text-gray-400">
          No saved presets yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Create your first preset to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Count - only show when filtering */}
      {(searchQuery || filterType !== "all") && (
        <div className="flex items-center justify-between px-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPresets.length === presets.length ? (
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredPresets.length}
                </span>{" "}
                {filteredPresets.length === 1 ? "preset" : "presets"}
              </span>
            ) : (
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredPresets.length}
                </span>{" "}
                of{" "}
                <span className="text-gray-900 dark:text-white font-semibold">
                  {presets.length}
                </span>{" "}
                presets
              </span>
            )}
          </div>
        </div>
      )}

      {/* Preset Grid */}
      {filteredPresets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-base text-gray-500 dark:text-gray-400">
            No presets found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {paginatedPresets.map((preset) => (
              <div
                key={preset.id}
                className={`relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                  activePresetId === preset.id
                    ? "border-[#313131] dark:border-[#b8835a]"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => onLoadPreset(preset)}
              >
                {/* Background Video/Image(s) */}
                {/* Video Background - Priority for scripture and text presets */}
                {preset.data.videoBackground ? (
                  <LazyVideo
                    src={preset.data.videoBackground}
                    className="absolute inset-0"
                  />
                ) : preset.type === "image" &&
                  preset.data.images &&
                  preset.data.images.length > 0 ? (
                  <div className="absolute inset-0 grid grid-cols-2 gap-0.5 ">
                    {preset.data.images.map((img: string, idx: number) => (
                      <LazyImage
                        key={idx}
                        src={img}
                        className={`bg-cover bg-center ${
                          preset.data.images!.length === 1
                            ? "col-span-2"
                            : preset.data.images!.length === 3 && idx === 0
                            ? "col-span-2"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                ) : (preset.type === "default" || preset.type === "promise") &&
                  !preset.data.backgroundImage ? (
                  // Solid colors and gradients (no lazy loading needed)
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundColor: preset.data.backgroundColor || "#000000",
                    }}
                  />
                ) : preset.id === "default-random-scripture" ? (
                  // No background for video-based default presets - they render their own videos
                  <></>
                ) : (
                  // Images (use lazy loading)
                  <LazyImage
                    src={
                      preset.type === "image"
                        ? preset.data.url || ""
                        : preset.type === "scripture"
                        ? preset.data.backgroundImage || ""
                        : preset.data.backgroundImage || ""
                    }
                    className="absolute inset-0 bg-cover bg-center"
                  />
                )}

                {/* Content Overlay */}
                <div className="relative h-32 p-3 flex flex-col justify-center z-10">
                  {/* Type Icon and Action Buttons Container */}
                  <div className="absolute top-1 left-1 right-1 flex justify-between items-start z-50">
                    <div className="w-6 h-6 rounded-full backdrop-blur-md flex items-center justify-center shadow-md bg-white/20">
                      {preset.type === "image" && (
                        <ImageIcon className="w-3 h-3 text-white" />
                      )}
                      {preset.type === "scripture" && (
                        <BookOpen className="w-3 h-3 text-white" />
                      )}
                      {(preset.type === "default" ||
                        preset.type === "promise") && (
                        <Type className="w-3 h-3 text-white" />
                      )}
                    </div>

                    {/* Action Buttons - Pin, Edit and Delete */}
                    <div className="flex gap-1 relative z-[100]">
                      {/* Pin Button - available for all non-default presets */}
                      {!preset.id.startsWith("default-") && onTogglePin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(preset.id);
                          }}
                          className={`w-6 h-6 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg relative z-[101] ${
                            preset.pinned
                              ? "bg-yellow-500/90 hover:bg-yellow-600 opacity-100"
                              : "bg-gray-500/90 hover:bg-gray-600 opacity-0 group-hover:opacity-100"
                          }`}
                          title={preset.pinned ? "Unpin preset" : "Pin preset"}
                        >
                          <Pin
                            className={`w-3 h-3 text-white ${
                              preset.pinned ? "fill-white" : ""
                            }`}
                          />
                        </button>
                      )}

                      {/* Edit Button - only for scripture and image presets, hidden for default presets */}
                      {!preset.id.startsWith("default-") &&
                        (preset.type === "scripture" ||
                          preset.type === "image") &&
                        onEditPreset && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditPreset(preset);
                            }}
                            className="w-6 h-6 rounded-full bg-blue-500/90 hover:bg-blue-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg relative z-[101]"
                            title="Edit preset"
                          >
                            <Edit3 className="w-3 h-3 text-white" />
                          </button>
                        )}

                      {/* Delete Button - hidden for default presets */}
                      {!preset.id.startsWith("default-") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPresetToDelete(preset);
                            setDeleteModalOpen(true);
                          }}
                          className="w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg relative z-[101]"
                          title="Delete preset"
                        >
                          <span className="text-white text-sm font-bold">
                            ×
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scripture Text or Title */}
                  <div className="space-y-1">
                    {preset.type === "scripture" && (
                      <div className="text-white text-[16px] leading-tight line-clamp-2 font-medium">
                        {preset.data.text}
                      </div>
                    )}

                    {/* Default and Promise Presets - Show different previews based on presetType */}
                    {(preset.type === "default" || preset.type === "promise") &&
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
                                  filter:
                                    "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
                                }}
                              />
                            </div>
                          );
                        }

                        if (preset.id === "default-random-scripture") {
                          const [videoLoaded, setVideoLoaded] =
                            React.useState(false);
                          return (
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-2 py-2 overflow-hidden rounded-lg">
                              {/* Loading skeleton */}
                              {!videoLoaded && (
                                <GlassySkeleton className="absolute inset-0 rounded-lg" />
                              )}
                              {/* Video Background */}
                              <video
                                loop
                                muted
                                playsInline
                                autoPlay
                                onCanPlay={() => setVideoLoaded(true)}
                                className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                                  videoLoaded ? "opacity-100" : "opacity-0"
                                }`}
                                style={{ filter: "brightness(0.5)" }}
                              >
                                <source
                                  src="./waterglass.mp4"
                                  type="video/mp4"
                                />
                              </video>
                              {/* Dark overlay */}
                              {/* <div className="absolute inset-0 bg-black/40 rounded-lg" /> */}

                              {/* Content */}
                              <div className="relative z-10 text-center">
                                <p className="text-[7px] font-bold text-white leading-tight line-clamp-3 mb-1">
                                  THE LORD IS MY SHEPHERD; I SHALL NOT WANT.
                                </p>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <div className="h-px w-4 bg-gradient-to-r from-transparent via-white/60 to-white/60" />
                                  <p className="text-[5px] font-bold text-orange-200 uppercase">
                                    PSALM 23:1
                                  </p>
                                  <div className="h-px w-4 bg-gradient-to-l from-transparent via-white/60 to-white/60" />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Promise Preview
                        if (preset.id === "default-the-promise") {
                          const [videoLoaded, setVideoLoaded] =
                            React.useState(false);
                          return (
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-2 py-1 overflow-hidden rounded-lg">
                              {/* Loading skeleton */}
                              {!videoLoaded && (
                                <GlassySkeleton className="absolute inset-0 rounded-lg" />
                              )}
                              {/* Video Background */}
                              <video
                                loop
                                muted
                                playsInline
                                autoPlay
                                onCanPlay={() => setVideoLoaded(true)}
                                className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                                  videoLoaded ? "opacity-100" : "opacity-0"
                                }`}
                                style={{ filter: "brightness(0.5)" }}
                              >
                                <source
                                  src="../blue_particle.mp4"
                                  type="video/mp4"
                                />
                              </video>
                              {/* Dark overlay */}
                              {/* <div className="absolute inset-0 bg-black/40 rounded-lg" /> */}

                              {/* Content with bars */}
                              <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                {/* Top bar */}
                                <div className="w-[70%] h-[2px] bg-white/95 mb-1" />

                                {/* Main text */}
                                <p
                                  className="text-[7px] font-black text-white text-center leading-tight mb-0.5 uppercase"
                                  style={{
                                    fontFamily:
                                      "Impact, Arial Black, sans-serif",
                                  }}
                                >
                                  OUR HEARTTHROB
                                </p>

                                {/* Sliding text container */}
                                <div className="bg-white/95 rounded-full px-2 py-0.5 mb-1">
                                  <p className="text-[5px] font-bold text-black text-center uppercase">
                                    THE TOKEN
                                  </p>
                                </div>

                                {/* Bottom bar */}
                                <div className="w-[70%] h-[2px] bg-white/95" />
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
                      <div className="text-white text-sm font-semibold">
                        {preset.name}
                      </div>
                    )}

                    {/* Scripture Reference */}
                    <div className="text-white/90 text-[15px] font-semibold">
                      {preset.type === "scripture"
                        ? preset.data.reference
                        : preset.type === "promise"
                        ? "The Promise"
                        : preset.type === "default"
                        ? "Default Card"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-[#313131] dark:bg-[#b8835a] text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Global shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        presetName={presetToDelete?.name || ""}
        onConfirm={() => {
          if (presetToDelete) {
            onDeletePreset(presetToDelete.id);
            setDeleteModalOpen(false);
            setPresetToDelete(null);
          }
        }}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPresetToDelete(null);
        }}
      />
    </div>
  );
};

export { PresetCardSkeleton };
