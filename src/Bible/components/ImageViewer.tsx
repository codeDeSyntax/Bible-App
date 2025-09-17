import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  ArrowLeft,
  X,
  Grid,
  Trash2,
} from "lucide-react";
import { useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";

interface ImageViewerProps {}

const ImageViewer: React.FC<ImageViewerProps> = () => {
  const dispatch = useAppDispatch();
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [sharpness, setSharpness] = useState(1); // 0.5 = low, 1 = normal, 1.5 = high
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [showControls, setShowControls] = useState(true);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Storage keys for image viewer persistence
  const STORAGE_KEY = "imageViewer_selectedDirectory";
  const CURRENT_IMAGE_KEY = "imageViewer_currentImageIndex";
  const LAST_VIEWED_IMAGE_KEY = "imageViewer_lastViewedImageIndex";
  const ZOOM_KEY = "imageViewer_zoom";
  const PAN_KEY = "imageViewer_pan";

  // Load saved directory on component mount
  useEffect(() => {
    const loadSavedDirectory = async () => {
      try {
        const savedDirectory = localStorage.getItem(STORAGE_KEY);
        if (savedDirectory && typeof window !== "undefined" && window.api) {
          // Verify the directory still exists and load images
          try {
            const imageFiles = await window.api.getImages(savedDirectory);
            console.log("ImageViewer: Loaded saved directory:", savedDirectory);
            console.log("ImageViewer: Found images:", imageFiles);
            setSelectedDirectory(savedDirectory);
            setImages(imageFiles);

            // Restore saved image viewing state
            const savedImageIndex = localStorage.getItem(CURRENT_IMAGE_KEY);
            const savedLastViewedImage = localStorage.getItem(
              LAST_VIEWED_IMAGE_KEY
            );
            const savedZoom = localStorage.getItem(ZOOM_KEY);
            const savedPan = localStorage.getItem(PAN_KEY);

            if (savedImageIndex && imageFiles.length > 0) {
              const imageIndex = parseInt(savedImageIndex, 10);
              if (imageIndex >= 0 && imageIndex < imageFiles.length) {
                setCurrentImageIndex(imageIndex);
              } else {
                setCurrentImageIndex(0);
              }
            } else {
              setCurrentImageIndex(0);
            }

            // If there was a last viewed image, automatically open it in full-screen
            if (savedLastViewedImage && imageFiles.length > 0) {
              const lastViewedIndex = parseInt(savedLastViewedImage, 10);
              if (lastViewedIndex >= 0 && lastViewedIndex < imageFiles.length) {
                setSelectedImageIndex(lastViewedIndex);
                setCurrentImageIndex(lastViewedIndex);
                setFullScreenMode(true);

                // Restore zoom and pan states
                if (savedZoom) {
                  setZoom(parseFloat(savedZoom));
                } else {
                  setZoom(0.4); // Default initial zoom
                }

                if (savedPan) {
                  setPan(JSON.parse(savedPan));
                } else {
                  setPan({ x: 0, y: 0 });
                }
              }
            }
          } catch (error) {
            // Directory no longer exists or accessible, clear from storage
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(CURRENT_IMAGE_KEY);
            localStorage.removeItem(LAST_VIEWED_IMAGE_KEY);
            localStorage.removeItem(ZOOM_KEY);
            localStorage.removeItem(PAN_KEY);
            console.log(
              "Saved directory no longer accessible, cleared from storage"
            );
          }
        }
      } catch (error) {
        console.error("Error loading saved directory:", error);
      }
    };

    loadSavedDirectory();
  }, []);

  // Save directory to localStorage when it changes
  useEffect(() => {
    if (selectedDirectory) {
      localStorage.setItem(STORAGE_KEY, selectedDirectory);
    }
  }, [selectedDirectory]);

  // Save current image index to localStorage when it changes
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem(CURRENT_IMAGE_KEY, currentImageIndex.toString());
    }
  }, [currentImageIndex, images.length]);

  // Save full-screen mode to localStorage only when entering full-screen with an image
  useEffect(() => {
    if (fullScreenMode && selectedImageIndex !== null) {
      localStorage.setItem(
        LAST_VIEWED_IMAGE_KEY,
        selectedImageIndex.toString()
      );
    }
  }, [fullScreenMode, selectedImageIndex]);

  // Save zoom level to localStorage when it changes (only in full-screen mode)
  useEffect(() => {
    if (fullScreenMode) {
      localStorage.setItem(ZOOM_KEY, zoom.toString());
    }
  }, [zoom, fullScreenMode]);

  // Save pan position to localStorage when it changes (only in full-screen mode)
  useEffect(() => {
    if (fullScreenMode) {
      localStorage.setItem(PAN_KEY, JSON.stringify(pan));
    }
  }, [pan, fullScreenMode]);

  // Cleanup: Clear last viewed image only when component unmounts (user leaves ImageViewer)
  useEffect(() => {
    return () => {
      // Clear last viewed image when leaving ImageViewer completely
      if (!fullScreenMode) {
        localStorage.removeItem(LAST_VIEWED_IMAGE_KEY);
      }
    };
  }, [fullScreenMode]);

  // Open image in full-screen mode
  const openFullScreen = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setCurrentImageIndex(index);
    setFullScreenMode(true);
    setZoom(0.4); // Start with smaller initial size (40% of container)
    setPan({ x: 0, y: 0 });
  }, []);

  // Close full-screen mode
  const closeFullScreen = useCallback(() => {
    setFullScreenMode(false);
    setSelectedImageIndex(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    // Don't clear fullscreen state from localStorage here - keep it for restoration
  }, []);

  // Load images from directory
  const loadImagesFromDirectory = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.api) {
        const directory = await window.api.selectDirectory();
        if (directory) {
          console.log("ImageViewer: Selected directory:", directory);
          setSelectedDirectory(directory);
          const imageFiles = await window.api.getImages(directory);
          console.log("ImageViewer: Loaded images:", imageFiles);
          setImages(imageFiles);
          setCurrentImageIndex(0);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }
      }
    } catch (error) {
      console.error("Error loading images:", error);
    }
  }, []);

  // Clear images and directory
  const clearImagesAndDirectory = useCallback(() => {
    setImages([]);
    setSelectedDirectory("");
    setCurrentImageIndex(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFullScreenMode(false);
    setSelectedImageIndex(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_IMAGE_KEY);
    localStorage.removeItem(LAST_VIEWED_IMAGE_KEY);
    localStorage.removeItem(ZOOM_KEY);
    localStorage.removeItem(PAN_KEY);
    console.log("ImageViewer: Cleared images and directory");
  }, []);

  // Reload images from current directory
  const reloadImagesFromCurrentDirectory = useCallback(async () => {
    try {
      if (selectedDirectory && typeof window !== "undefined" && window.api) {
        const imageFiles = await window.api.getImages(selectedDirectory);
        setImages(imageFiles);
        setCurrentImageIndex(0);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    } catch (error) {
      console.error("Error reloading images:", error);
      // If directory is no longer accessible, clear it
      localStorage.removeItem(STORAGE_KEY);
      setSelectedDirectory("");
      setImages([]);
    }
  }, [selectedDirectory]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 5)); // Max zoom 5x
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1)); // Min zoom 0.1x
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Navigation functions
  const nextImage = useCallback(() => {
    if (images.length > 0) {
      const newIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(newIndex);
      setSelectedImageIndex(newIndex);
      setZoom(0.4); // Use default initial zoom for new images
      setPan({ x: 0, y: 0 });
    }
  }, [images.length, currentImageIndex]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      const newIndex = (currentImageIndex - 1 + images.length) % images.length;
      setCurrentImageIndex(newIndex);
      setSelectedImageIndex(newIndex);
      setZoom(0.4); // Use default initial zoom for new images
      setPan({ x: 0, y: 0 });
    }
  }, [images.length, currentImageIndex]);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    },
    [zoomIn, zoomOut]
  );

  // Mouse drag for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (fullScreenMode) {
            closeFullScreen();
          } else {
            dispatch(setCurrentScreen("bible"));
          }
          break;
        case "ArrowLeft":
          if (fullScreenMode) {
            prevImage();
          }
          break;
        case "ArrowRight":
          if (fullScreenMode) {
            nextImage();
          }
          break;
        case "+":
        case "=":
          if (fullScreenMode) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case "-":
          if (fullScreenMode) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case "0":
          if (fullScreenMode) {
            e.preventDefault();
            resetZoom();
          }
          break;
        case " ":
          if (fullScreenMode) {
            e.preventDefault();
            setShowControls((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    dispatch,
    fullScreenMode,
    closeFullScreen,
    prevImage,
    nextImage,
    zoomIn,
    zoomOut,
    resetZoom,
  ]);

  // Sharpness levels
  const sharpnessLevels = [
    { value: 0.5, label: "Low" },
    { value: 1, label: "Normal" },
    { value: 1.5, label: "High" },
  ];

  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center p-4"
      style={{ backgroundColor: "#1e1e1e" }}
    >
      {/* Full-Screen Image Overlay */}
      {fullScreenMode && selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "#1e1e1e" }}
        >
          {/* Full-screen image */}
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center cursor-move"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
          >
            <img
              ref={imageRef}
              src={images[selectedImageIndex]}
              alt={`Image ${selectedImageIndex + 1}`}
              className="max-w-[80vw] max-h-[80vh] transition-transform duration-300 ease-in-out"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
                  pan.y / zoom
                }px)`,
                filter: `contrast(${sharpness})`,
                imageRendering: sharpness > 1 ? "crisp-edges" : "auto",
              }}
              draggable={false}
              onError={(e) => {
                console.error(
                  "Failed to load fullscreen image:",
                  images[selectedImageIndex]
                );
                console.error("Error event:", e);
              }}
              onLoad={() => {
                console.log(
                  "Successfully loaded fullscreen image:",
                  images[selectedImageIndex]
                );
              }}
            />
          </div>

          {/* Horizontal Control Strip - Bottom Right */}
          {showControls && (
            <div className="absolute bottom-6 right-6 z-60">
              <div className="flex items-center space-x-2 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20 bg-black/30">
                {/* Close */}
                <button
                  onClick={closeFullScreen}
                  className="w-8 h-8 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border border-red-400/50 bg-red-500/20 hover:bg-red-500/30"
                  title="Close (ESC)"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>

                {/* Navigation */}
                <button
                  onClick={prevImage}
                  disabled={images.length <= 1}
                  className="w-8 h-8 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border border-gray-400/50 bg-gray-500/20 hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Image"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-300" />
                </button>
                <button
                  onClick={nextImage}
                  disabled={images.length <= 1}
                  className="w-8 h-8 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border border-gray-400/50 bg-gray-500/20 hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Image"
                >
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                {/* Zoom Controls */}
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <button
                  onClick={zoomOut}
                  className="w-8 h-8 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border border-blue-400/50 bg-blue-500/20 hover:bg-blue-500/30"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={zoomIn}
                  className="w-8 h-8 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border border-blue-400/50 bg-blue-500/20 hover:bg-blue-500/30"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={resetZoom}
                  className="w-8 h-8 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border border-orange-400/50 bg-orange-500/20 hover:bg-orange-500/30"
                  title="Reset Zoom (0)"
                >
                  <RotateCcw className="w-4 h-4 text-orange-400" />
                </button>

                {/* Sharpness indicator */}
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <div className="text-xs text-white/70 px-2">
                  {Math.round(zoom * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Realistic Tablet Device Frame */}
      <div className="relative">
        {/* Tablet Shadow */}
        <div
          className="absolute inset-0 opacity-40 rounded-xl transform translate-x-1 translate-y-1 blur-md"
          style={{ backgroundColor: "#111111" }}
        ></div>

        {/* Tablet Body */}
        <div
          className="relative rounded-xl shadow2xl shadow-inner shadow-stone-500"
          style={{
            width: "900px",
            height: "600px",
            backgroundColor: "#2f2f2f",
            borderColor: "#4d4d4d",
            borderWidth: "1px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          {/* Screen Bezel */}
          <div
            className="rounded-lg h-full w-full"
            style={{
              backgroundColor: "#1e1e1e",
              borderColor: "#3c3c3c",
              borderWidth: "1px",
            }}
          >
            {/* Actual Screen */}
            <div
              className="rounded-lg h-full w-full overflow-hidden relative"
              style={{ backgroundColor: "#000000" }}
            >
              {/* Status Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-10"
                style={{ backgroundColor: "#000000" }}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="text-xs font-medium"
                    style={{ color: "#ffffff" }}
                  >
                    Image Viewer
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: "#ffffff" }}
                  ></div>
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: "#ffffff" }}
                  ></div>
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: "#ffffff" }}
                  ></div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="h-full pt-8">
                {images.length === 0 ? (
                  /* Empty State with Controls */
                  <div className="h-full flex flex-col">
                    {/* Top Control Bar */}
                    <div
                      className="p-4 flex items-center justify-between"
                      // style={{ backgroundColor: "#000000" }}
                    >
                      <button
                        onClick={() => dispatch(setCurrentScreen("bible"))}
                        className="w-10 h-10 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border-2 border-gray-400 hover:bg-gray-50"
                        style={{
                          color: "#ffffff",
                          background:
                            "linear-gradient(135deg, #8e44ad 0%, #7B68EE 50%, #667eea 100%)",
                        }}
                        title="Back"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={loadImagesFromDirectory}
                          className="w-10 h-10 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center border-2 border-blue-400 hover:bg-blue-50"
                          style={{
                            color: "#ffffff",
                            background:
                              "linear-gradient(135deg, #8e44ad 0%, #7B68EE 50%, #667eea 100%)",
                          }}
                          title="Choose Folder"
                        >
                          <FolderOpen className="w-5 h-5" />
                        </button>

                        <button
                          onClick={clearImagesAndDirectory}
                          className="w-10 h-10 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center border-2 border-red-400 hover:bg-red-50"
                          style={{
                            color: "#ffffff",
                            background:
                              "linear-gradient(135deg, #8e44ad 0%, #7B68EE 50%, #667eea 100%)",
                          }}
                          title="Clear Images"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Empty State Content */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center" style={{ color: "#4d4d4d" }}>
                        <FolderOpen
                          className="w-24 h-24 mx-auto mb-6"
                          style={{ color: "#3c3c3c" }}
                        />
                        <h3
                          className="text-2xl font-semibold mb-3"
                          style={{ color: "#4d4d4d" }}
                        >
                          No Images Loaded
                        </h3>
                        <p className="text-lg" style={{ color: "#3c3c3c" }}>
                          Select a directory to view your images
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Image Grid with Controls */
                  <div className="h-full flex flex-col">
                    {/* Top Control Bar */}
                    <div
                      className="p-4 flex items-center justify-between"
                      style={{
                        borderBottomColor: "#3c3c3c",
                        borderBottomWidth: "1px",
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => dispatch(setCurrentScreen("bible"))}
                          className="w-10 h-10 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center border-2 border-gray-400 hover:bg-gray-50"
                          style={{
                            color: "#ffffff",
                            background:
                              "linear-gradient(135deg, #8e44ad 0%, #7B68EE 50%, #667eea 100%)",
                          }}
                          title="Back to Bible"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>

                        <button
                          onClick={loadImagesFromDirectory}
                          className="w-10 h-10 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center border-2 border-green-400 hover:bg-green-50"
                          style={{
                            color: "#ffffff",
                            background:
                              "linear-gradient(135deg, #8e44ad 0%, #7B68EE 50%, #667eea 100%)",
                          }}
                          title="Choose Directory"
                        >
                          <FolderOpen className="w-5 h-5" />
                        </button>

                        <button
                          onClick={clearImagesAndDirectory}
                          className="w-10 h-10 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center border-2 border-red-400 hover:bg-red-50"
                          style={{
                            color: "#ffffff",
                            background:
                              "linear-gradient(135deg, #8e44ad 0%, #7B68EE 50%, #667eea 100%)",
                          }}
                          title="Clear Images"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        {selectedDirectory && (
                          <div
                            className="text-sm max-w-xs truncate"
                            style={{ color: "#4d4d4d" }}
                          >
                            <span className="font-medium">Directory:</span>{" "}
                            {selectedDirectory}
                          </div>
                        )}

                        <div
                          className="flex items-center space-x-2 px-3 py-1 rounded-lg"
                          style={{
                            color: "#4d4d4d",
                            backgroundColor: "#1e1e1e",
                            borderColor: "#3c3c3c",
                            borderWidth: "1px",
                          }}
                        >
                          <Grid className="w-4 h-4" />
                          <span className="text-sm">
                            {images.length} images
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image Grid */}
                    <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
                      <div className="grid grid-cols-3 gap-3">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            onClick={() => openFullScreen(index)}
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200 group relative border border-white/30 hover:border-gray-300"
                          >
                            <img
                              src={image}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                              onError={(e) => {
                                console.error("Failed to load image:", image);
                                console.error("Error event:", e);
                              }}
                              onLoad={() => {
                                console.log(
                                  "Successfully loaded image:",
                                  image
                                );
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 text-xs font-medium px-2 py-1 rounded bg-white/90 text-gray-800">
                                Click to view
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Indicator */}
              <div
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-opacity-60 rounded-full"
                style={{ backgroundColor: "#4d4d4d" }}
              ></div>
            </div>
          </div>

          {/* Physical Home Button */}
          <div
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full"
            style={{
              backgroundColor: "#3c3c3c",
              borderColor: "#4d4d4d",
              borderWidth: "1px",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
