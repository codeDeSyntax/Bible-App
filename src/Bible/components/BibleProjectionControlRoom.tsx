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
  setVerseByVerseTextColor,
  setHighlightJesusWords,
  setShowScriptureReference,
  setScriptureReferenceColor,
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
import {
  InfoAndPreset,
  DisplaySettings,
  AppearanceSettings,
  BackgroundSettings,
  TypographySettings,
  TranslationSettings,
} from "./ControlRoom";

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
    verseByVerseTextColor,
    highlightJesusWords,
    showScriptureReference,
    scriptureReferenceColor,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [projectionLineHeight, setProjectionLineHeight] = useState(1.5);

  // Available translations and data
  const translations = [
    { id: "KJV", name: "King James Version", language: "English" },
    { id: "TWI", name: "Twi Bible", language: "Twi" },
    { id: "EWE", name: "Ewe Bible", language: "Ewe" },
    { id: "FRENCH", name: "French Bible", language: "French" },
  ];

  const availableTranslations = ["KJV", "TWI", "EWE", "FRENCH"];

  const colorPresets = [
    "#ffffff",
    "#000000",
    "#fcd8c0",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#ff9f43",
    "#10ac84",
    "#ee5a24",
  ];

  const gradientBackgrounds = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #a8e6cf 0%, #dcedc8 100%)",
  ];

  // Predefined gradient combinations (legacy)
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
    console.log("🔍 Component re-rendered with isFullScreen:", isFullScreen);
  }, [isFullScreen]);

  // Auto-switch text color based on theme and background mode
  useEffect(() => {
    console.log("🎨 ControlRoom auto-switch triggered:", {
      verseByVerseMode,
      imageBackgroundMode,
      isDarkMode,
      projectionTextColor,
      verseByVerseTextColor,
    });

    // Only apply auto-switching in verse-by-verse mode
    if (verseByVerseMode) {
      if (imageBackgroundMode) {
        // For verse-by-verse with background image: always white
        if (projectionTextColor !== "#ffffff") {
          dispatch(setProjectionTextColor("#ffffff"));
          localStorage.setItem("bibleProjectionTextColor", "#ffffff");
          logBibleProjection(
            "Auto-switched projection text color to white for background mode",
            {
              mode: "verse-by-verse-with-background",
              textColor: "#ffffff",
            }
          );
        }
        if (verseByVerseTextColor !== "#ffffff") {
          dispatch(setVerseByVerseTextColor("#ffffff"));
          localStorage.setItem("bibleVerseByVerseTextColor", "#ffffff");
          logBibleProjection(
            "Auto-switched verse-by-verse text color to white for background mode",
            {
              mode: "verse-by-verse-with-background",
              textColor: "#ffffff",
            }
          );
        }
      } else {
        // For verse-by-verse without background image: theme-based colors
        const targetColor = isDarkMode ? "#fcd8c0" : "#000000";
        if (projectionTextColor !== targetColor) {
          dispatch(setProjectionTextColor(targetColor));
          localStorage.setItem("bibleProjectionTextColor", targetColor);
          logBibleProjection(
            "Auto-switched projection text color based on theme",
            {
              mode: "verse-by-verse-no-background",
              isDarkMode,
              textColor: targetColor,
            }
          );

          // Send IPC update
          if (typeof window !== "undefined" && window.ipcRenderer) {
            window.ipcRenderer.send("bible-presentation-update", {
              type: "updateStyle",
              data: { textColor: targetColor },
            });
          }
        }
        if (verseByVerseTextColor !== targetColor) {
          dispatch(setVerseByVerseTextColor(targetColor));
          localStorage.setItem("bibleVerseByVerseTextColor", targetColor);
          logBibleProjection(
            "Auto-switched verse-by-verse text color based on theme",
            {
              mode: "verse-by-verse-no-background",
              isDarkMode,
              textColor: targetColor,
            }
          );
        }
      }
    }
  }, [
    isDarkMode,
    verseByVerseMode,
    imageBackgroundMode,
    dispatch,
    projectionTextColor,
    verseByVerseTextColor,
  ]);

  // Additional effect to handle background mode changes in verse-by-verse
  useEffect(() => {
    if (verseByVerseMode && imageBackgroundMode) {
      // When background mode is enabled in verse-by-verse, force white text
      if (projectionTextColor !== "#ffffff") {
        dispatch(setProjectionTextColor("#ffffff"));
        localStorage.setItem("bibleProjectionTextColor", "#ffffff");
        logBibleProjection(
          "Auto-switched projection to white text for background mode",
          {
            mode: "verse-by-verse-background-enabled",
            textColor: "#ffffff",
          }
        );

        // Send IPC update
        if (typeof window !== "undefined" && window.ipcRenderer) {
          window.ipcRenderer.send("bible-presentation-update", {
            type: "updateStyle",
            data: { textColor: "#ffffff" },
          });
        }
      }
      if (verseByVerseTextColor !== "#ffffff") {
        dispatch(setVerseByVerseTextColor("#ffffff"));
        localStorage.setItem("bibleVerseByVerseTextColor", "#ffffff");
        logBibleProjection(
          "Auto-switched verse-by-verse to white text for background mode",
          {
            mode: "verse-by-verse-background-enabled",
            textColor: "#ffffff",
          }
        );
      }
    }
  }, [
    verseByVerseMode,
    imageBackgroundMode,
    dispatch,
    projectionTextColor,
    verseByVerseTextColor,
  ]);

  const loadBackgroundImages = async (forceReload = false) => {
    setIsLoadingImages(true);
    try {
      // Load if we don't have images yet OR if forcing a reload
      if (bibleBgs.length === 0 || forceReload) {
        const customImagesPath = localStorage.getItem("bibleCustomImagesPath");
        let images: string[] = [];

        try {
          if (customImagesPath && typeof window !== "undefined" && window.api) {
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
          } else {
            // Load default backgrounds if no custom path
            console.log(
              "BibleProjectionControlRoom: Loading default backgrounds"
            );
            images = [
              "./wood2.jpg",
              "./snow2.jpg",
              "./wood6.jpg",
              "./wood7.png",
              "./wood10.jpg",
              "./wood11.jpg",
              "./wood9.png",
            ];
          }

          dispatch(setBibleBgs(images));
          logBibleProjection("Background images loaded from control room", {
            imageCount: images.length,
            customImagesPath,
          });
        } catch (error) {
          console.error("Error loading background images:", error);
          // Fall back to default backgrounds
          const defaultBackgrounds = [
            "./wood2.jpg",
            "./snow2.jpg",
            "./wood6.jpg",
            "./wood7.png",
            "./wood10.jpg",
            "./wood11.jpg",
            "./wood9.png",
          ];
          dispatch(setBibleBgs(defaultBackgrounds));
        }
      }
    } catch (error) {
      console.error("Error in loadBackgroundImages:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Reset handler function for reset to defaults
  const resetToDefaults = () => {
    handleFontSizeChange(48);
    handleBackgroundColorChange("#000000");
    handleGradientChange(["#667eea", "#764ba2"]);
    handleBackgroundImageChange("");
    handleTextColorChange("#ffffff");
    handleFontMultiplierChange(1.0);
    handleBackgroundImageModeChange(false);
    dispatch(setFullScreen(false));
    logBibleProjection("Settings reset to defaults from control room");
  };

  // Handle font size change
  const handleFontSizeChange = (size: number) => {
    dispatch(setProjectionFontSize(size));
    localStorage.setItem("bibleProjectionFontSize", size.toString());
    logBibleProjection("Projection font size updated from control room", {
      fontSize: size,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { fontSize: size },
      });
    }
  };

  // Handle font family change
  const handleProjectionFontFamilyChange = (fontFamily: string) => {
    dispatch(setProjectionFontFamily(fontFamily));
    localStorage.setItem("bibleProjectionFontFamily", fontFamily);
    logBibleProjection("Projection font family updated from control room", {
      fontFamily,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { fontFamily },
      });
    }
  };

  // Handle background color change
  const handleBackgroundColorChange = (color: string) => {
    dispatch(setProjectionBackgroundColor(color));
    localStorage.setItem("bibleProjectionBackgroundColor", color);
    logBibleProjection(
      "Projection background color updated from control room",
      {
        backgroundColor: color,
      }
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
    localStorage.setItem(
      "bibleProjectionGradientColors",
      JSON.stringify(colors)
    );
    logBibleProjection("Projection gradient colors updated from control room", {
      gradientColors: colors,
    });

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { gradientColors: colors },
      });
    }
  };

  // Handle background image change
  const handleBackgroundImageChange = async (imagePath: string) => {
    dispatch(setProjectionBackgroundImage(imagePath));
    localStorage.setItem("bibleProjectionBackgroundImage", imagePath);
    logBibleProjection(
      "Projection background image updated from control room",
      {
        backgroundImage: imagePath,
      }
    );

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { backgroundImage: imagePath },
      });
    }
  };

  // Handle text color change
  const handleTextColorChange = (color: string) => {
    console.log("🎨 Control Room: Updating text color to:", color);

    // Update both projection and verse-by-verse text colors when manually changed
    dispatch(setProjectionTextColor(color));
    dispatch(setVerseByVerseTextColor(color));
    localStorage.setItem("bibleProjectionTextColor", color);
    localStorage.setItem("bibleVerseByVerseTextColor", color);

    logBibleProjection("Text colors updated from control room", {
      projectionTextColor: color,
      verseByVerseTextColor: color,
    });

    // Send multiple IPC updates to ensure synchronization
    if (typeof window !== "undefined" && window.ipcRenderer) {
      // Primary style update
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { textColor: color },
      });

      // Secondary projection style update
      window.ipcRenderer.send("bible-projection-style-update", {
        textColor: color,
        timestamp: Date.now(),
      });

      // Force refresh of projection display
      window.ipcRenderer.send("bible-presentation-update", {
        type: "forceRefresh",
        data: { textColor: color },
      });
    }

    // Force immediate re-render by dispatching again after a small delay
    setTimeout(() => {
      dispatch(setProjectionTextColor(color));
      dispatch(setVerseByVerseTextColor(color));
      console.log("🎨 Control Room: Secondary color dispatch completed");
    }, 50);
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

  // Additional handlers for extracted components
  const handleLineHeightChange = (lineHeight: number) => {
    setProjectionLineHeight(lineHeight);
  };

  const increaseFontSize = () => {
    const newSize = Math.min(120, projectionFontSize + 2);
    handleFontSizeChange(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(24, projectionFontSize - 2);
    handleFontSizeChange(newSize);
  };

  const increaseLineHeight = () => {
    const newLineHeight = Math.min(3, projectionLineHeight + 0.1);
    handleLineHeightChange(newLineHeight);
  };

  const decreaseLineHeight = () => {
    const newLineHeight = Math.max(1, projectionLineHeight - 0.1);
    handleLineHeightChange(newLineHeight);
  };

  const handleBackgroundImageSelect = (imagePath: string) => {
    handleBackgroundImageChange(imagePath);
  };

  const handleGradientSelect = (gradient: string) => {
    dispatch(setSelectedBackground(gradient));
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    handleProjectionFontFamilyChange(fontFamily);
  };

  const handleJesusWordsToggle = () => {
    const newValue = !highlightJesusWords;
    dispatch(setHighlightJesusWords(newValue));

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { highlightJesusWords: newValue },
      });
    }
  };

  const handleScriptureReferenceToggle = () => {
    const newValue = !showScriptureReference;
    dispatch(setShowScriptureReference(newValue));

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { showScriptureReference: newValue },
      });
    }
  };

  const handleScriptureReferenceColorChange = (color: string) => {
    dispatch(setScriptureReferenceColor(color));

    // Send IPC update
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { scriptureReferenceColor: color },
      });
    }
  };

  // Handle custom images directory selection
  const handleSelectImagesDirectory = async () => {
    try {
      if (typeof window !== "undefined" && window.ipcRenderer) {
        const result = await window.ipcRenderer.invoke("select-directory");
        if (result) {
          setCustomImagesPath(result);
          localStorage.setItem("bibleCustomImagesPath", result);
          logBibleProjection("Custom images directory selected", {
            path: result,
          });

          // Force reload images from the new directory
          await loadBackgroundImages(true);
        }
      }
    } catch (error) {
      console.error("Error selecting images directory:", error);
      setIsLoadingImages(false);
    }
  };

  if (!isOpen) return null;

  // Navigation sections
  const sections = [
    {
      id: "general",
      label: "General",
      icon: Settings,
      desc: "Overview & Settings",
    },
    {
      id: "display",
      label: "Display",
      icon: Monitor,
      desc: "Screen & Mode Settings",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      desc: "Colors & Themes",
    },
    {
      id: "background",
      label: "Background",
      icon: Image,
      desc: "Images & Gradients",
    },
    {
      id: "typography",
      label: "Typography",
      icon: Type,
      desc: "Fonts & Sizing",
    },
    {
      id: "translation",
      label: "Translation",
      icon: Globe,
      desc: "Bible Versions",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary/20 dark:to-primary/20"
      style={{ fontFamily: "garamond" }}
    >
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="w-full m-auto h-full flex bg-white/95 dark:bg-ltgray  shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          {/* Left Sidebar - Settings Navigation */}
          <div className="w-80 bg-gradient-to-b from-[#363635]/10 to-[#313131]/5 dark:from-[#313131]/20 dark:to-[#313131]/10 border-r border-[#313131]/20 dark:border-[#313131]/30 backdrop-blur-sm">
            <div className="p-8 border-b border-[#313131]/20 dark:border-[#313131]/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center shadow-lg">
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
              <div
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-white/60 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-black/30 hover:text-gray-900 dark:hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {sections.map(({ id, label, icon: Icon, desc }) => (
                  <div
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-[90%] m-auto group relative overflow-hidden rounded-2xl px-5 py-2 text-left transition-all duration-300 cursor-pointer ${
                      activeSection === id
                        ? "bg-gradient-to-r from-[#313131] to-[#303030] text-white shadow-lg shadow-[#313131]/30 transform scale-105"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <Icon
                        className={`w-5 h-5 ${
                          activeSection === id ? "text-white" : "text-[#313131]"
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
          <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50  to-gray-50 dark:from-[#313131]/20 dark:to-[#313131]/10 backdrop-blur-sm">
            {/* Header */}
            <div className="px-4  border-b border-[#313131]/20 dark:border-[#313131]/30 bg-[#f9fafb] dark:bg-black/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                    {activeSection} Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure your projection display preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 overflow-y-auto no-scrollbar bg-gradient-to-b from-gray-50 to-gray-50 dark:from-black/20 dark:to-black/10 flex">
              {/* General Settings */}
              {activeSection === "general" && (
                <InfoAndPreset
                  projectionFontFamily={projectionFontFamily}
                  projectionFontSize={projectionFontSize}
                  projectionTextColor={projectionTextColor}
                  projectionBackgroundImage={projectionBackgroundImage}
                  projectionGradientColors={projectionGradientColors}
                  projectionBackgroundColor={projectionBackgroundColor}
                  imageBackgroundMode={imageBackgroundMode}
                  selectedBackground={selectedBackground}
                  currentTranslation={currentTranslation}
                  currentBook={currentBook}
                  currentChapter={currentChapter}
                  isFullScreen={isFullScreen}
                  verseByVerseMode={verseByVerseMode}
                  bibleBgs={bibleBgs}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* Display Settings */}
              {activeSection === "display" && (
                <DisplaySettings
                  customImagesPath={customImagesPath}
                  handleSelectImagesDirectory={handleSelectImagesDirectory}
                  bibleBgs={bibleBgs}
                  imageBackgroundMode={imageBackgroundMode}
                  handleBackgroundImageModeChange={
                    handleBackgroundImageModeChange
                  }
                  loadBackgroundImages={loadBackgroundImages}
                  highlightJesusWords={highlightJesusWords}
                  showScriptureReference={showScriptureReference}
                  scriptureReferenceColor={scriptureReferenceColor}
                  handleJesusWordsToggle={handleJesusWordsToggle}
                  handleScriptureReferenceToggle={
                    handleScriptureReferenceToggle
                  }
                  handleScriptureReferenceColorChange={
                    handleScriptureReferenceColorChange
                  }
                  // currentBook={currentBook}
                  // currentChapter={currentChapter}
                  // currentTranslation={currentTranslation}
                  // verseByVerseMode={verseByVerseMode}
                />
              )}

              {/* Appearance Settings */}
              {activeSection === "appearance" && (
                <AppearanceSettings
                  projectionTextColor={projectionTextColor}
                  darkMode={isDarkMode}
                  colorPresets={colorPresets}
                  handleTextColorChange={handleTextColorChange}
                />
              )}

              {/* Background Settings */}
              {activeSection === "background" && (
                <BackgroundSettings
                  imageBackgroundMode={imageBackgroundMode}
                  projectionBackgroundImage={projectionBackgroundImage}
                  bibleBgs={bibleBgs}
                  projectionGradientColors={projectionGradientColors}
                  imagePreloadCache={imagePreloadCache}
                  imageLoadingStates={imageLoadingStates}
                  isLoadingImages={isLoadingImages}
                  gradientPresets={gradientPresets}
                  handleBackgroundImageSelect={handleBackgroundImageSelect}
                  handleGradientChange={handleGradientChange}
                  loadBackgroundImages={loadBackgroundImages}
                />
              )}

              {/* Typography Settings */}
              {activeSection === "typography" && (
                <TypographySettings
                  projectionFontFamily={projectionFontFamily}
                  projectionFontSize={projectionFontSize}
                  projectionTextColor={projectionTextColor}
                  handleFontFamilyChange={handleFontFamilyChange}
                  handleFontSizeChange={handleFontSizeChange}
                />
              )}

              {/* Translation Settings */}
              {activeSection === "translation" && (
                <TranslationSettings
                  availableTranslations={availableTranslations}
                  selectedTranslation={currentTranslation}
                  handleTranslationChange={handleTranslationChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleProjectionControlRoom;
