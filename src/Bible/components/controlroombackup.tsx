import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setProjectionFontSize,
  setProjectionFontFamily,
  setProjectionBackgroundColor,
  setProjectionGradientColors,
  setProjectionBackgroundImage,
  setProjectionTextColor,
  setCurrentTranslation,
  setStandaloneFontMultiplier,
  setImageBackgroundMode,
  setFullScreen,
  setSelectedBackground,
  setVerseByVerseMode,
} from "@/store/slices/bibleSlice";
import { setBibleBgs } from "@/store/slices/appSlice";
import { useTheme } from "@/Provider/Theme";
import { logBibleProjection } from "@/utils/ClientSecretLogger";
import {
  Settings,
  Type,
  Palette,
  Image,
  Monitor,
  Globe,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Maximize,
  FolderUp,
} from "lucide-react";
import { PlusCircleTwoTone } from "@ant-design/icons";

interface BibleProjectionControlRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BibleProjectionControlRoom: React.FC<
  BibleProjectionControlRoomProps
> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const dispatch = useAppDispatch();

  const {
    projectionFontSize,
    projectionFontFamily,
    projectionBackgroundColor,
    projectionGradientColors,
    projectionBackgroundImage,
    projectionTextColor,
    currentTranslation,
    currentBook,
    currentChapter,
    standaloneFontMultiplier,
    imageBackgroundMode,
    isFullScreen,
    selectedBackground,
    verseByVerseMode,
  } = useAppSelector((state) => state.bible);
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);

  // State
  const [activeSection, setActiveSection] = useState<string>("general");
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [imagePreloadCache, setImagePreloadCache] = useState<Set<string>>(
    new Set()
  );
  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("bibleCustomImagesPath") || ""
  );

  // Available translations
  const availableTranslations = Object.keys({
    KJV: "King James Version",
    TWI: "Twi Bible",
    EWE: "Ewe Bible",
    FRENCH: "French Bible",
  });

  // Predefined gradient combinations
  const gradientPresets = [
    { name: "Ocean", colors: ["#667eea", "#764ba2"] },
    { name: "Sunset", colors: ["#f093fb", "#f5576c"] },
    { name: "Forest", colors: ["#43e97b", "#38f9d7"] },
    { name: "Purple", colors: ["#4facfe", "#00f2fe"] },
    { name: "Fire", colors: ["#fa709a", "#fee140"] },
    { name: "Sky", colors: ["#a8edea", "#fed6e3"] },
    { name: "Night", colors: ["#2c3e50", "#3498db"] },
    { name: "Rose", colors: ["#ff9a9e", "#fecfef"] },
    { name: "Mint", colors: ["#a8e6cf", "#dcedc8"] },
    { name: "Gold", colors: ["#ffecd2", "#fcb69f"] },
    { name: "Blue", colors: ["#667eea", "#764ba2"] },
    { name: "Green", colors: ["#56ab2f", "#a8e6cf"] },
  ];

  // Load background images on mount
  useEffect(() => {
    loadBackgroundImages();
  }, [bibleBgs.length]);

  // Debug fullscreen state changes
  useEffect(() => {
    console.log("🔍 isFullScreen state changed to:", isFullScreen);
  }, [isFullScreen]);

  // Auto-switch text color based on theme
  useEffect(() => {
    // Only auto-switch if using default theme colors
    if (
      projectionTextColor === "#fcd8c0" ||
      projectionTextColor === "#ffffff" ||
      projectionTextColor === "#000000"
    ) {
      if (isDarkMode) {
        dispatch(setProjectionTextColor("#fcd8c0"));
      } else {
        dispatch(setProjectionTextColor("#000000")); // Black for light mode
      }
    }
  }, [isDarkMode, dispatch, projectionTextColor]);

  const loadBackgroundImages = async (forceReload = false) => {
    setIsLoadingImages(true);
    try {
      // Load if we don't have images yet OR if forcing a reload
      if (bibleBgs.length === 0 || forceReload) {
        const customImagesPath = localStorage.getItem("bibleCustomImagesPath");
        let images: string[] = [];

        try {
          if (customImagesPath) {
            console.log(
              "BibleProjectionControlRoom: Loading custom images from:",
              customImagesPath
            );
            images = await window.api.getImages(customImagesPath);
            console.log(
              "BibleProjectionControlRoom: Loaded",
              images.length,
              "custom images"
            );
            dispatch(setBibleBgs(images));
          } else {
            // Load default backgrounds if no custom path
            const defaultBackgrounds = [
              "./wood2.jpg",
              "./snow2.jpg",
              "./wood6.jpg",
              "./wood7.png",
              "./wood10.jpg",
              "./wood11.jpg",
              "./wood9.png",
            ];
            console.log(
              "BibleProjectionControlRoom: Loading default backgrounds"
            );
            dispatch(setBibleBgs(defaultBackgrounds));
          }
        } catch (error) {
          console.error(
            "BibleProjectionControlRoom: Failed to load background images:",
            error
          );
          const defaultBackgrounds = [
            "./wood2.jpg",
            "./snow1.jpg",
            "./wood6.jpg",
          ];
          dispatch(setBibleBgs(defaultBackgrounds));
        }
      }
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (size: number) => {
    dispatch(setProjectionFontSize(size));
    logBibleProjection("Projection font size updated from control room", {
      size,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log("ControlRoom: Sending font size update", { fontSize: size });
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { fontSize: size },
      });
    }
  };

  // Handle font family change
  const handleProjectionFontFamilyChange = (fontFamily: string) => {
    dispatch(setProjectionFontFamily(fontFamily));
    logBibleProjection("Projection font family updated from control room", {
      fontFamily,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log("ControlRoom: Sending font family update", { fontFamily });
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { fontFamily },
      });
    }
  };

  // Handle background color change
  const handleBackgroundColorChange = (color: string) => {
    dispatch(setProjectionBackgroundColor(color));
    logBibleProjection(
      "Projection background color updated from control room",
      { color }
    );

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { backgroundColor: color },
      });
    }
  };

  // Handle gradient change
  const handleGradientChange = (colors: string[]) => {
    dispatch(setProjectionGradientColors(colors));
    dispatch(setProjectionBackgroundImage("")); // Clear background image when setting gradient
    logBibleProjection("Projection gradient colors updated from control room", {
      colors,
    });

    // Send IPC update - immediate switch to gradient
    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log("ControlRoom: Sending gradient update", {
        gradientColors: colors,
        backgroundImage: "", // Clear image immediately
      });
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: {
          gradientColors: colors,
          backgroundImage: "", // Clear background image immediately
        },
      });
    }
  };

  // Handle background image change with loading state
  const handleBackgroundImageChange = async (imagePath: string) => {
    // Set loading state for this specific image
    setImageLoadingStates((prev) => ({ ...prev, [imagePath]: true }));

    try {
      // Preload the image if it's not already cached and it's not empty
      if (imagePath && !imagePreloadCache.has(imagePath)) {
        await preloadImage(imagePath);
        setImagePreloadCache((prev) => new Set([...prev, imagePath]));
      }

      // Update Redux state
      dispatch(setProjectionBackgroundImage(imagePath));
      if (imagePath) {
        dispatch(setProjectionGradientColors([])); // Clear gradients when setting image
      }

      logBibleProjection(
        "Projection background image updated from control room",
        { imagePath }
      );

      // Send update to presentation window via IPC
      if (typeof window !== "undefined" && window.ipcRenderer) {
        console.log("ControlRoom: Sending background image update", {
          backgroundImage: imagePath,
        });
        window.ipcRenderer.send("bible-presentation-update", {
          type: "updateStyle",
          data: {
            backgroundImage: imagePath,
            gradientColors: imagePath ? [] : undefined, // Clear gradients immediately when setting image
          },
        });
      }

      // Small delay to show loading state (minimum feedback time)
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Failed to load background image:", error);

      // Show error feedback - you could add a toast notification here
      console.warn(`Background image failed to load: ${imagePath}`);

      // Still proceed with setting the background even if preload failed
      // The browser will handle the actual loading
      dispatch(setProjectionBackgroundImage(imagePath));
      if (imagePath) {
        dispatch(setProjectionGradientColors([]));
      }

      if (typeof window !== "undefined" && window.ipcRenderer) {
        window.ipcRenderer.send("bible-presentation-update", {
          type: "updateStyle",
          data: {
            backgroundImage: imagePath,
            gradientColors: imagePath ? [] : undefined,
          },
        });
      }
    } finally {
      // Clear loading state for this image
      setImageLoadingStates((prev) => ({ ...prev, [imagePath]: false }));
    }
  };

  // Preload image function
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img") as HTMLImageElement;

      img.onload = () => {
        console.log("Image preloaded successfully:", src);
        resolve();
      };

      img.onerror = () => {
        console.error("Failed to preload image:", src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Handle different image path formats
      if (src.startsWith("./")) {
        img.src = src;
      } else if (src.match(/^[A-Za-z]:\\/)) {
        // Windows absolute path
        img.src = `file:///${src.replace(/\\/g, "/")}`;
      } else if (src.startsWith("/")) {
        // Unix absolute path
        img.src = `file://${src}`;
      } else {
        img.src = src;
      }
    });
  };

  // Preload images when they become available
  useEffect(() => {
    const preloadBibleImages = async () => {
      if (bibleBgs.length > 0) {
        console.log("Starting to preload background images...");
        const preloadPromises = bibleBgs.slice(0, 5).map(async (imagePath) => {
          try {
            await preloadImage(imagePath);
            setImagePreloadCache((prev) => new Set([...prev, imagePath]));
          } catch (error) {
            console.warn("Failed to preload image:", imagePath, error);
          }
        });

        // Preload first 5 images immediately, rest in background
        await Promise.allSettled(preloadPromises);

        // Preload remaining images in background
        if (bibleBgs.length > 5) {
          const remainingPromises = bibleBgs.slice(5).map(async (imagePath) => {
            try {
              await preloadImage(imagePath);
              setImagePreloadCache((prev) => new Set([...prev, imagePath]));
            } catch (error) {
              console.warn("Failed to preload image:", imagePath, error);
            }
          });
          Promise.allSettled(remainingPromises);
        }

        console.log("Background image preloading completed");
      }
    };

    preloadBibleImages();
  }, [bibleBgs]);

  // Handle text color change
  const handleTextColorChange = (color: string) => {
    dispatch(setProjectionTextColor(color));
    logBibleProjection("Projection text color updated from control room", {
      color,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log("ControlRoom: Sending text color update", {
        textColor: color,
      });
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { textColor: color },
      });
    }
  };

  // Handle translation change
  const handleTranslationChange = (translation: string) => {
    dispatch(setCurrentTranslation(translation));
    logBibleProjection("Projection translation updated from control room", {
      translation,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "update-data",
        data: {
          translation: translation,
          book: currentBook,
          chapter: currentChapter,
        },
      });
    }
  };

  // Handle standalone font size multiplier change
  const handleFontMultiplierChange = (multiplier: number) => {
    dispatch(setStandaloneFontMultiplier(multiplier));
    logBibleProjection("Standalone font multiplier updated from control room", {
      multiplier,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "update-settings",
        data: { fontMultiplier: multiplier },
      });
    }
  };

  // Handle background image mode toggle
  const handleBackgroundImageModeChange = (enabled: boolean) => {
    dispatch(setImageBackgroundMode(enabled));
    if (!enabled) {
      dispatch(setSelectedBackground(null));
    }
    logBibleProjection("Background image mode toggled from control room", {
      enabled,
    });
  };

  // Handle fullscreen mode toggle
  const handleFullscreenModeChange = (
    enabled: boolean,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(
      "🔍 Fullscreen toggle clicked:",
      enabled,
      "Current state:",
      isFullScreen
    );

    // Prevent event propagation to avoid triggering other components
    event?.stopPropagation?.();

    // Only update the Redux state - no other side effects
    dispatch(setFullScreen(enabled));

    // Debug: Check localStorage values for any unexpected changes
    const savedVerseByVerseMode = localStorage.getItem("bibleVerseByVerseMode");

    logBibleProjection("Fullscreen mode toggled from control room", {
      enabled,
      verseByVerseModeBeforeChange: verseByVerseMode,
      localStorageVerseByVerseMode: savedVerseByVerseMode,
    });

    console.log(
      "🔍 Fullscreen state updated, should NOT open verse-by-verse mode"
    );

    // Additional safety: If for some reason verseByVerseMode got set to true, force it back to false
    // This is a temporary fix while we investigate the root cause
    setTimeout(() => {
      const currentVerseByVerseMode = localStorage.getItem(
        "bibleVerseByVerseMode"
      );
      if (currentVerseByVerseMode === "true" && !enabled) {
        console.log(
          "🔍 DETECTED UNWANTED verseByVerseMode=true, correcting..."
        );
        dispatch(setVerseByVerseMode(false));
        localStorage.setItem("bibleVerseByVerseMode", "false");
      }
    }, 100);
  };

  // Handle custom images directory selection
  const handleSelectImagesDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === "string" && result) {
        setCustomImagesPath(result);
        localStorage.setItem("bibleCustomImagesPath", result);

        // Force reload images from the new directory
        setIsLoadingImages(true);
        try {
          const customImages = await window.api.getImages(result);
          console.log(
            "BibleProjectionControlRoom: Loaded",
            customImages.length,
            "images from new directory:",
            result
          );
          dispatch(setBibleBgs(customImages));

          logBibleProjection(
            "Custom images directory selected from control room",
            {
              path: result,
              imageCount: customImages.length,
            }
          );
        } catch (error) {
          console.error(
            "Failed to load images from selected directory:",
            error
          );
          // Fall back to empty array if directory is invalid
          dispatch(setBibleBgs([]));
        } finally {
          setIsLoadingImages(false);
        }
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
      setIsLoadingImages(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    handleFontSizeChange(48);
    handleBackgroundColorChange("#000000");
    handleGradientChange(["#667eea", "#764ba2"]);
    handleBackgroundImageChange("");
    handleTextColorChange("#ffffff");
    handleFontMultiplierChange(1.0);
    handleBackgroundImageModeChange(false);
    handleFullscreenModeChange(false);
    logBibleProjection("Settings reset to defaults from control room");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-bgray dark:to-bgray"
      style={{ fontFamily: "garamond" }}
    >
      <div className="h-screen w-screen  flex justify-center items-center">
        <div className="w-[95%] max-w-7xl m-auto h-[90%] flex bg-white/95 dark:bg-ltgray rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          {/* Left Sidebar - Settings Navigation */}
          <div className="w-80 bg-gradient-to-b from-[#906140]/10 to-[#906140]/5 dark:from-[#906140]/20 dark:to-[#906140]/10 border-r border-[#906140]/20 dark:border-[#906140]/30 backdrop-blur-sm">
            <div className="p-8 border-b border-[#906140]/20 dark:border-[#906140]/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-lg">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Projection Control
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bible Display Settings
                  </p>
                </div>
              </div>

              {/* Current Status Card */}
              <div className="bg-white/80 dark:bg-black/30 rounded-2xl px-6 py-3 border border-[#906140]/20 backdrop-blur-sm shadow-lg  flex items-center justify-between ">
                {/* <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentBook} {currentChapter}
                </div> */}
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentBook} {currentChapter}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {currentTranslation}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="px-6">
              <nav className="space-y-2">
                {[
                  {
                    id: "general",
                    icon: Settings,
                    label: "General",
                    desc: "Basic settings",
                  },
                  {
                    id: "display",
                    icon: Monitor,
                    label: "Display",
                    desc: "Screen & modes",
                  },
                  {
                    id: "appearance",
                    icon: Palette,
                    label: "Appearance",
                    desc: "Colors & themes",
                  },
                  {
                    id: "typography",
                    icon: Type,
                    label: "Typography",
                    desc: "Font settings",
                  },
                  {
                    id: "background",
                    icon: Image,
                    label: "Background",
                    desc: "Images & gradients",
                  },
                  {
                    id: "translation",
                    icon: Globe,
                    label: "Translation",
                    desc: "Bible versions",
                  },
                ].map(({ id, icon: Icon, label, desc }) => (
                  <div
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-[90%] m-auto group relative overflow-hidden rounded-2xl px-5 py-2 text-left transition-all duration-300 cursor-pointer ${
                      activeSection === id
                        ? "bg-gradient-to-r from-[#906140] to-[#7d5439] text-white shadow-lg shadow-[#906140]/30 transform scale-105"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <Icon
                        className={`w-5 h-5 ${
                          activeSection === id ? "text-white" : "text-[#906140]"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{label}</div>
                        <div
                          className={`text-xs mt-1 ${
                            activeSection === id
                              ? "text-white/90"
                              : "text-gray-400"
                          }`}
                        >
                          {desc}
                        </div>
                      </div>
                    </div>
                    {activeSection === id && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-[#906140]/10 to-[#906140]/5 dark:from-[#906140]/20 dark:to-[#906140]/10 backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 border-b border-[#906140]/20 dark:border-[#906140]/30 bg-white/80 dark:bg-black/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                    {activeSection} Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure your projection display preferences
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      previewMode
                        ? "bg-gradient-to-r from-[#906140] to-[#7d5439] text-white"
                        : "bg-white/60 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-black/30"
                    }`}
                    title="Toggle preview mode"
                  >
                    {previewMode ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    onClick={resetToDefaults}
                    className="p-2 rounded-xl bg-white/60 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200 cursor-pointer"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div
                    onClick={onClose}
                    className="p-2 rounded-xl bg-red-100/60 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200/60 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
                    title="Close control room"
                  >
                    <X className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 overflow-y-auto no-scrollbar bg-gradient-to-b from-white/30 to-white/20 dark:from-black/20 dark:to-black/10 flex ">
              {/* General Settings */}
              {activeSection === "general" && (
                <div className="w-full h-full p-1">
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
                    {/* Current Settings Summary - Top Left */}
                    <div className="rounded-xl p-4 border-2 border-solid border-gray-300 dark:border-[#312319]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Settings
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Font Size:
                          </span>
                          <span className="font-semibold text-[#906140] dark:text-[#b8835a]">
                            {projectionFontSize}px
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Font Family:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white truncate ml-2">
                            {projectionFontFamily}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Text Color:
                          </span>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded border"
                              style={{ backgroundColor: projectionTextColor }}
                            />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {projectionTextColor}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Translation:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {currentTranslation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Background Settings Summary - Top Right */}
                    <div className="rounded-xl p-4 border-2 border-solid border-stone dark:border-[#312319]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Background
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Image Mode:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {imageBackgroundMode ? "Enabled" : "Disabled"}
                          </span>
                        </div>

                        {projectionBackgroundImage ? (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              Background Image:
                            </span>
                            <div className="mt-1 rounded overflow-hidden border">
                              <img
                                src={projectionBackgroundImage}
                                alt="Background"
                                className="w-full h-12 object-cover"
                              />
                            </div>
                          </div>
                        ) : projectionGradientColors?.length > 0 ? (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400 text-xs">
                              Gradient:
                            </span>
                            <div
                              className="mt-1 h-6 rounded border"
                              style={{
                                background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Background:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Solid Color
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Fullscreen:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {isFullScreen ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bible Content Info - Bottom Left */}
                    <div className="rounded-xl p-4 border-2 border-solid border-stone-300 dark:border-[#312319]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Bible Content
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="text-center p-2 rounded-lg border border-[#906140]/30">
                          <div className="text-lg font-bold text-[#906140] dark:text-[#b8835a]">
                            {currentBook} {currentChapter}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Current Chapter
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            View Mode:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {verseByVerseMode
                              ? "Verse by Verse"
                              : "Chapter View"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Images Available:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {bibleBgs.length} images
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bible Presentation Preview - Bottom Right */}
                    <div className="rounded-xl p-4 border-2 border-solid border-red-500">
                      {/* Mini Preview Screen */}
                      <div
                        className="w-full aspect-video h-[95%] rounded-lg border-2 border-orange-500 overflow-hidden relative"
                        style={{
                          background: projectionBackgroundImage
                            ? `url(${projectionBackgroundImage}) center/cover`
                            : projectionGradientColors?.length > 0
                            ? `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`
                            : projectionBackgroundColor,
                        }}
                      >
                        {/* Overlay for text visibility */}
                        <div className="absolute inset-0 bg-black/20" />

                        {/* Sample Bible Text */}
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                          <div className="text-center">
                            <div
                              className="font-bold leading-tight mb-1 "
                              style={{
                                color: projectionTextColor,
                                fontFamily: projectionFontFamily,
                                fontSize: "1rem", // Smaller size for compact preview
                              }}
                            >
                              "For God so loved the world..."
                            </div>
                            <div
                              className="text-xs opacity-80"
                              style={{
                                color: projectionTextColor,
                                fontSize: "8px",
                              }}
                            >
                              John 3:16 - {currentTranslation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeSection === "display" && (
                <div className="space-y-4 w-full">
                  {/* Custom Images Path Selection */}
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                          <FolderUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            Background Images Folder
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Choose folder containing background images
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={handleSelectImagesDirectory}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#906140] to-[#7d5439] text-white rounded-lg hover:from-[#7d5439] hover:to-[#6b4931] transition-all duration-200 text-xs shadow-lg cursor-pointer"
                      >
                        <FolderUp className="w-3 h-3" />
                        {customImagesPath ? "Change Folder" : "Select Folder"}
                      </div>
                    </div>
                    {customImagesPath && (
                      <div className="mt-3 px-3 py-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg backdrop-blur-sm">
                        <p className="text-xs text-green-700 dark:text-green-300 truncate font-mono">
                          📁 {customImagesPath}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {bibleBgs.length} images loaded from this folder
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Background Image Mode Toggle */}
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            Background Images
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {imageBackgroundMode
                              ? "Background images are enabled"
                              : "Enable custom backgrounds for projection"}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={imageBackgroundMode}
                          onChange={(e) =>
                            handleBackgroundImageModeChange(e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div
                          className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                            imageBackgroundMode
                              ? "bg-[#906140]"
                              : "bg-gray-200/50 dark:bg-gray-700/50"
                          }`}
                        >
                          <div
                            className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                              imageBackgroundMode
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Fullscreen Mode Toggle */}
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                          <Maximize className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            Fullscreen Mode
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {isFullScreen
                              ? "Fullscreen mode is enabled"
                              : "Enable immersive reading experience"}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFullScreen}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newValue = e.target.checked;
                            console.log(
                              "🔍 Checkbox onChange:",
                              newValue,
                              "stopping propagation"
                            );
                            handleFullscreenModeChange(newValue, e);
                          }}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                            isFullScreen
                              ? "bg-[#906140]"
                              : "bg-gray-200/50 dark:bg-gray-700/50"
                          }`}
                        >
                          <div
                            className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                              isFullScreen ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeSection === "appearance" && (
                <div className="space-y-4 w-full">
                  {/* Text Color */}
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm pr-4 w-1/2 ">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                        <Palette className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Text Color
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Choose the color for scripture text
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Color Picker
                          </label>
                          <input
                            type="color"
                            value={projectionTextColor}
                            onChange={(e) =>
                              handleTextColorChange(e.target.value)
                            }
                            className="w-full h-10 rounded-xl border border-white/30 dark:border-white/10 cursor-pointer shadow-md"
                          />
                        </div>
                        <div className="flex-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Hex Value
                          </label>
                          <input
                            type="text"
                            value={projectionTextColor}
                            onChange={(e) =>
                              handleTextColorChange(e.target.value)
                            }
                            className="w-[90%] p-2 rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/20 text-gray-900 dark:text-white font-mono text-sm shadow-md backdrop-blur-sm"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>

                      {/* Color Presets */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quick Colors
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                          {[
                            "#fcd8c0", // Default dark mode
                            "#000000", // Default light mode (black)
                            "#ffffff", // White
                            "#f3f4f6", // Light gray
                            "#9ca3af", // Gray
                            "#6b7280", // Dark gray
                            "#1f2937", // Very dark gray
                            "#111827", // Almost black
                          ].map((color) => (
                            <div
                              key={color}
                              onClick={() => handleTextColorChange(color)}
                              className={`w-8 h-8 rounded-xl border transition-all hover:scale-110 shadow-md cursor-pointer ${
                                projectionTextColor === color
                                  ? "border-[#906140] ring-1 ring-[#906140]/30"
                                  : "border-white/30 dark:border-white/10"
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="p-3 rounded-xl bg-gray-900 border border-white/10 shadow-md">
                        <div className="text-center">
                          <p
                            style={{ color: projectionTextColor }}
                            className="text-lg font-semibold"
                          >
                            "For God so loved the world..."
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Text Preview
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Background Settings */}
              {activeSection === "background" && (
                <div className="space-y-4">
                  {/* Background Images */}
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Background Images
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Choose a background image for your presentation
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {imagePreloadCache.size} preloaded
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              • {bibleBgs.length} total images
                            </div>
                            {imagePreloadCache.size < bibleBgs.length && (
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                • Optimizing...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => loadBackgroundImages(true)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#906140] to-[#7d5439] text-white hover:from-[#7d5439] hover:to-[#6b4931] disabled:opacity-50 transition-all duration-200 font-medium shadow-md cursor-pointer text-sm"
                        >
                          {isLoadingImages ? "Loading..." : "Refresh"}
                        </div>

                        {/* Background Change Status */}
                        {Object.values(imageLoadingStates).some(Boolean) && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
                            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Setting Background...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Clear Background Option */}
                    <div
                      onClick={() => handleBackgroundImageChange("")}
                      className={`w-40 p-3 rounded-xl border border-dashed transition-all mb-3 cursor-pointer relative ${
                        projectionBackgroundImage === ""
                          ? "border-[#906140] bg-[#906140]/10 text-[#906140]"
                          : "border-white/30 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                      } ${imageLoadingStates[""] ? "opacity-70" : ""}`}
                    >
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-black/20 mx-auto mb-2 flex items-center justify-center">
                          <X className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-sm">
                          No Background Image
                        </span>
                      </div>

                      {/* Loading Overlay for Clear Background */}
                      {imageLoadingStates[""] && (
                        <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-[#906140] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                      {bibleBgs.map((imagePath, index) => {
                        const isLoading = imageLoadingStates[imagePath];
                        const isPreloaded = imagePreloadCache.has(imagePath);

                        return (
                          <div
                            key={index}
                            onClick={() =>
                              handleBackgroundImageChange(imagePath)
                            }
                            className={`aspect-video rounded-2xl overflow-hidden border transition-all hover:scale-105 shadow-md cursor-pointer relative ${
                              projectionBackgroundImage === imagePath
                                ? "border-[#906140] ring-1 ring-[#906140]/30"
                                : "border-white/30 dark:border-white/10 hover:border-gray-300 dark:hover:border-gray-500"
                            } ${isLoading ? "opacity-70" : ""}`}
                            title={`${isPreloaded ? "✓ " : ""}Background ${
                              index + 1
                            }`}
                          >
                            <img
                              src={imagePath}
                              alt={`Background ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />

                            {/* Loading Overlay */}
                            {isLoading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}

                            {/* Preloaded Indicator */}
                            {isPreloaded && !isLoading && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                            )}

                            {/* Selected Indicator */}
                            {projectionBackgroundImage === imagePath && (
                              <div className="absolute inset-0 bg-[#906140]/20 flex items-center justify-center">
                                <div className="w-6 h-6 bg-[#906140] rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gradient Backgrounds */}
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                        <Palette className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Gradient Backgrounds
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Beautiful gradient backgrounds for your presentation
                        </p>
                      </div>
                    </div>

                    {/* Custom Gradient */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Custom Gradient
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={projectionGradientColors[0] || "#667eea"}
                          onChange={(e) =>
                            handleGradientChange([
                              e.target.value,
                              projectionGradientColors[1] || "#764ba2",
                            ])
                          }
                          className="w-10 h-10 rounded-xl border border-white/30 dark:border-white/10 cursor-pointer shadow-md"
                        />
                        <input
                          type="color"
                          value={projectionGradientColors[1] || "#764ba2"}
                          onChange={(e) =>
                            handleGradientChange([
                              projectionGradientColors[0] || "#667eea",
                              e.target.value,
                            ])
                          }
                          className="w-10 h-10 rounded-xl border border-white/30 dark:border-white/10 cursor-pointer shadow-md"
                        />
                        <div
                          className="w-40 h-10 rounded-xl border border-white/30 dark:border-white/10 shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${
                              projectionGradientColors[0] || "#667eea"
                            } 0%, ${
                              projectionGradientColors[1] || "#764ba2"
                            } 100%)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Gradient Presets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preset Gradients
                      </label>
                      <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto no-scrollbar">
                        {gradientPresets.map((preset, index) => (
                          <div
                            key={preset.name}
                            onClick={() => handleGradientChange(preset.colors)}
                            className={`aspect-video  rounded-xl border transition-all hover:scale-105 relative overflow-hidden shadow-md cursor-pointer ${
                              projectionGradientColors[0] ===
                                preset.colors[0] &&
                              projectionGradientColors[1] === preset.colors[1]
                                ? "border-[#906140] ring-1 ring-[#906140]/30"
                                : "border-white/30 dark:border-white/10 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)`,
                            }}
                            title={preset.name}
                          >
                            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-medium text-center px-1">
                                {preset.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Typography Settings */}
              {activeSection === "typography" && (
                <div className="space-y-4 w-full">
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                        <Type className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Typography Settings
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Configure font size and text appearance
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Font Size - Left Side */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Font Size: {projectionFontSize}px
                        </label>
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() =>
                              handleFontSizeChange(
                                Math.max(24, projectionFontSize - 2)
                              )
                            }
                            className="w-8 h-8 rounded-xl bg-white/60 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
                          >
                            −
                          </div>

                          <div className="flex-1">
                            <input
                              type="range"
                              min="24"
                              max="120"
                              value={projectionFontSize}
                              onChange={(e) =>
                                handleFontSizeChange(Number(e.target.value))
                              }
                              className="w-full h-2 bg-gray-200 dark:bg-[#906140] rounded-lg appearance-none cursor-pointer 
                                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                       [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#906140] [&::-webkit-slider-thumb]:to-[#7d5439] 
                                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                                       [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-0"
                            />
                          </div>

                          <div
                            onClick={() =>
                              handleFontSizeChange(
                                Math.min(120, projectionFontSize + 2)
                              )
                            }
                            className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#906140] to-[#7d5439] text-white hover:from-[#7d5439] hover:to-[#6b4931] transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
                          >
                            +
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span>24px</span>
                          <span>72px</span>
                          <span>120px</span>
                        </div>

                        {/* Preview */}
                        <div className="p-3 rounded-xl bg-primary/30 border border-white/10 shadow-md mt-4">
                          <div className="text-center">
                            <p
                              style={{
                                fontSize: `${Math.min(
                                  projectionFontSize * 0.4,
                                  24
                                )}px`,
                                color: projectionTextColor,
                                fontFamily: projectionFontFamily,
                                fontWeight: "bold",
                              }}
                              className="font-bold"
                            >
                              "In the beginning was the Word"
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Font Preview
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Font Family - Right Side */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Font Family
                        </label>
                        <div className="space-y-0 max-h-80 overflow-y-auto no-scrollbar border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-black/20">
                          {[
                            { value: "Arial Black", text: "Arial black" },
                            { value: "EB Garamond", text: "EB Garamond" },
                            { value: "Anton SC", text: "Anton SC" },
                            {
                              value: "Big Shoulders Thin",
                              text: "Big Shoulders",
                            },
                            { value: "Bitter Thin", text: "Bitter" },
                            { value: "Oswald ExtraLight", text: "Oswald" },
                            { value: "Archivo Black", text: "Archivo Black" },
                            { value: "Roboto Thin", text: "Roboto" },
                            { value: "Cooper Black", text: "Cooper Black" },
                            { value: "Impact", text: "Impact" },
                            { value: "Teko Light", text: "Teko" },
                            { value: "serif", text: "Times New Roman" },
                            { value: "sans-serif", text: "Arial" },
                          ].map((option, index) => (
                            <div
                              key={option.value}
                              onClick={() => {
                                handleProjectionFontFamilyChange(option.value);
                              }}
                              className={`w-full p-3 transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-gray-200/50 dark:border-gray-700/50 last:border-b-0 cursor-pointer hover:bg-white/40 dark:hover:bg-black/30 ${
                                projectionFontFamily === option.value
                                  ? "bg-[#906140]/10 text-[#906140] dark:text-[#b8835a]"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <div className="text-left">
                                <div className="font-medium text-sm mb-1">
                                  {option.text}
                                </div>
                                <div
                                  className="text-xs text-gray-500 dark:text-gray-400"
                                  style={{ fontFamily: option.value }}
                                >
                                  "For God so loved the world..."
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Translation Settings */}
              {activeSection === "translation" && (
                <div className="space-y-4">
                  <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Bible Translation
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Choose the Bible version for projection
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-[#906140]/10 border border-[#906140]/20 shadow-md">
                        <div className="text-sm font-medium text-[#906140] dark:text-[#b8835a]">
                          Currently Selected
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {currentTranslation}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                        {availableTranslations.map((translation) => (
                          <div
                            key={translation}
                            onClick={() => handleTranslationChange(translation)}
                            className={`p-3 rounded-xl border text-left transition-all hover:scale-105 shadow-md cursor-pointer ${
                              currentTranslation === translation
                                ? "border-[#906140] bg-gradient-to-r from-[#906140] to-[#7d5439] text-white"
                                : "border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/20 text-gray-900 dark:text-white hover:border-[#906140]/50"
                            }`}
                          >
                            <div className="text-sm font-bold">
                              {translation.toUpperCase()}
                            </div>
                            <div
                              className={`text-xs mt-1 ${
                                currentTranslation === translation
                                  ? "text-white/90"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              Bible Version
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleProjectionControlRoom;
