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
  setVerseByVerseAutoSize,
  setHighlightJesusWords,
  setShowScriptureReference,
  setScriptureReferenceColor,
} from "@/store/slices/bibleSlice";
import { setBibleBgs } from "@/store/slices/appSlice";
import { setTheme, selectCurrentTheme, ThemeName } from "@/store/themeSlice";
import { useTheme } from "@/Provider/Theme";
import { CustomSelect } from "./BibleStudio/CustomSelect";
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
  PresetsSettings,
} from "./ControlRoom";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const themeOptions = [
  { value: "grayscale", label: "Grayscale" },
  { value: "warm", label: "Warm Earth" },
  { value: "royal", label: "Royal Purple" },
  { value: "lavender", label: "Lavender Purple" },
  { value: "ocean", label: "Ocean Blue" },
  { value: "sky", label: "Sky Blue" },
  { value: "forest", label: "Forest Green" },
];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDarkMode } = useTheme();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectCurrentTheme);

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
    verseByVerseAutoSize,
    highlightJesusWords,
    showScriptureReference,
    scriptureReferenceColor,
  } = useAppSelector((state) => state.bible);
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);

  // State - Load last visited tab from localStorage
  const [activeSection, setActiveSection] = useState<string>(
    () => localStorage.getItem("settingsMenuActiveTab") || "general"
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [imagePreloadCache, setImagePreloadCache] = useState<Set<string>>(
    new Set()
  );

  // All the control room handlers and data
  const colorPresets = [
    "#FFFFFF",
    "#F3F4F6",
    "#E5E7EB",
    "#D1D5DB",
    "#9CA3AF",
    "#6B7280",
    "#374151",
    "#1F2937",
    "#111827",
    "#000000",
    "#FEF3C7",
    "#FDE68A",
    "#FBBF24",
    "#F59E0B",
    "#D97706",
    "#92400E",
    "#78350F",
    "#451A03",
  ];

  const gradientPresets = [
   { name: "Deep Plum", colors: ["#2e003e", "#6b0f9c"] },
    { name: "Burgundy", colors: ["#3b0b0b", "#8b1e3f"] },
    { name: "Royal Indigo", colors: ["#0b1020", "#1e3a8a"] },
    { name: "Midnight", colors: ["#071029", "#0b2545"] },
    { name: "Deep Teal", colors: ["#06374a", "#016d6f"] },
    { name: "Forest", colors: ["#0b3d2e", "#0fa06a"] },
    { name: "Amber Glow", colors: ["#4b2e05", "#b36b00"] },
    { name: "Burnt Sienna", colors: ["#7a2e0a", "#d35400"] },
    { name: "Slate Blue", colors: ["#1f2a44", "#344b7b"] },
    { name: "Wine", colors: ["#2e0b28", "#6b0a4a"] },
    { name: "Deep Ocean", colors: ["#01273e", "#025877"] },
    { name: "Charcoal Gold", colors: ["#0f1720", "#a77b2c"] },
  ];

  const customImagesPath = "./custom-bible-backgrounds";

  // Save active section to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("settingsMenuActiveTab", activeSection);
  }, [activeSection]);

  const handleThemeChange = (value: string) => {
    dispatch(setTheme(value as ThemeName));
  };

  const handleTextColorChange = (color: string) => {
    dispatch(setProjectionTextColor(color));
    logBibleProjection("Text color changed", { color });
  };

  const handleBackgroundColorChange = (color: string) => {
    dispatch(setProjectionBackgroundColor(color));
    logBibleProjection("Background color changed", { color });
  };

  const handleGradientChange = (colors: string[]) => {
    dispatch(setProjectionGradientColors(colors));
    // Clear any background image when applying a gradient
    dispatch(setProjectionBackgroundImage(""));
    localStorage.setItem(
      "bibleProjectionGradientColors",
      JSON.stringify(colors)
    );
    localStorage.setItem("bibleProjectionBackgroundImage", "");
    logBibleProjection("Gradient changed", { colors });

    // Send IPC update so projection window updates immediately
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { gradientColors: colors, backgroundImage: "" },
      });
    }
  };

  const handleBackgroundImageSelect = (imagePath: string) => {
    dispatch(setProjectionBackgroundImage(imagePath));
    dispatch(setSelectedBackground(imagePath));
    // Clear gradient colors when setting background image
    dispatch(setProjectionGradientColors([]));
    logBibleProjection("Background image selected", { imagePath });

    // Send IPC update to projection window
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { backgroundImage: imagePath },
      });
    }
  };

  const handleJesusWordsToggle = () => {
    dispatch(setHighlightJesusWords(!highlightJesusWords));
  };

  const handleScriptureReferenceToggle = () => {
    dispatch(setShowScriptureReference(!showScriptureReference));
  };

  const handleScriptureReferenceColorChange = (color: string) => {
    dispatch(setScriptureReferenceColor(color));
  };

  const handleBackgroundImageModeChange = (enabled: boolean) => {
    dispatch(setImageBackgroundMode(enabled));
  };

  const loadBackgroundImages = (forceReload?: boolean) => {
    // Implementation for loading background images
    console.log("Loading background images", { forceReload });
  };

  const handleSelectImagesDirectory = () => {
    // Implementation for selecting images directory
    console.log("Select images directory");
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    dispatch(setProjectionFontFamily(fontFamily));

    // Send IPC update to projection window
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { fontFamily: fontFamily },
      });
    }
  };

  const handleFontSizeChange = (size: number) => {
    dispatch(setProjectionFontSize(size));

    // Send IPC update to projection window
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { fontSize: size },
      });
    }
  };

  const handleAutoSizeChange = (enabled: boolean) => {
    dispatch(setVerseByVerseAutoSize(enabled));
  };

  const handleTranslationChange = (translationId: string) => {
    dispatch(setCurrentTranslation(translationId));
  };

  // Sample translations - these should come from your actual translation data
  const availableTranslations = [
    "King James Version (KJV)",
    "New International Version (NIV)",
    "English Standard Version (ESV)",
    "New Living Translation (NLT)",
    "Christian Standard Bible (CSB)",
  ];

  if (!isOpen) return null;

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
    {
      id: "presets",
      label: "Presets",
      icon: PlusCircleTwoTone,
      desc: "Manage Presets",
    },
  ];

  return (
    <div
      id="settings-menu"
      className="fixed left-1/2 top-12 -translate-x-1/2 min-h-[calc(100vh-60px)] bg-card-bg border border-select-border rounded-lg shadow-2xl flex overflow-hidden"
      style={{
        width: "95vw",
        maxHeight: "calc(100vh - 60px)",
        zIndex: 10000,
        fontFamily: "garamond",
      }}
    >
      {/* Left Sidebar - Settings Navigation */}
      <div className="w-80 bg-card-bg-alt">
        <div className="p-8 border-b border-card-bg">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-lg">
              <img src="./bibleicon.png" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Settings & Controls
              </h1>
              <p className="text-sm text-text-secondary">
                Bible Display & App Settings
              </p>
            </div>
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
                    ? "bg-btn-active-from shadow-lg transform scale-105"
                    : "text-text-secondary hover:bg-select-hover hover:text-text-primary hover:shadow-md"
                }`}
                style={activeSection === id ? { color: "white" } : {}}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color:
                        activeSection === id ? "white" : "var(--text-primary)",
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{label}</div>
                    <div
                      className="text-sm mt-1"
                      style={{
                        color:
                          activeSection === id
                            ? "rgba(255,255,255,0.9)"
                            : "var(--text-secondary)",
                      }}
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
      <div className="flex-1 flex flex-col bg-card-bg">
        {/* Header */}
        <div className="px-4 py-4 border-b border-card-bg-alt bg-studio-bg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary capitalize">
                {activeSection} Settings
                <span className="text-sm text-text-secondary mt-1 ml-2">
                  Configure your {activeSection} preferences
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 pb-4 overflow-y-auto no-scrollbar bg-studio-bg flex">
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
              highlightJesusWords={highlightJesusWords}
              showScriptureReference={showScriptureReference}
              scriptureReferenceColor={scriptureReferenceColor}
              handleJesusWordsToggle={handleJesusWordsToggle}
              handleScriptureReferenceToggle={handleScriptureReferenceToggle}
              handleScriptureReferenceColorChange={
                handleScriptureReferenceColorChange
              }
            />
          )}

          {/* Appearance Settings */}
          {activeSection === "appearance" && (
            <div className="w-full flex gap-4">
              <div className="flex-1">
                <AppearanceSettings
                  projectionTextColor={projectionTextColor}
                  darkMode={isDarkMode}
                  colorPresets={colorPresets}
                  handleTextColorChange={handleTextColorChange}
                />
              </div>
              {/* Theme Selector Section */}
              <div className="flex-1">
                <div className="bg-card-bg rounded-2xl p-4 border border-card-bg-alt shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-lg">
                      <Palette className="w-4 h-4" style={{ color: "white" }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">
                        Application Theme
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Choose your preferred application theme
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wide block mb-2">
                      Theme
                    </label>
                    <CustomSelect
                      value={currentTheme}
                      options={themeOptions}
                      onChange={handleThemeChange}
                      placeholder="Select Theme"
                      isDarkMode={isDarkMode}
                      width={280}
                      showSearch={false}
                    />
                  </div>
                </div>
              </div>
            </div>
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
              customImagesPath={customImagesPath}
              handleBackgroundImageSelect={handleBackgroundImageSelect}
              handleGradientChange={handleGradientChange}
              loadBackgroundImages={loadBackgroundImages}
              handleSelectImagesDirectory={handleSelectImagesDirectory}
              handleBackgroundImageModeChange={handleBackgroundImageModeChange}
            />
          )}

          {/* Typography Settings */}
          {activeSection === "typography" && (
            <TypographySettings
              projectionFontSize={projectionFontSize}
              projectionFontFamily={projectionFontFamily}
              projectionTextColor={projectionTextColor}
              verseByVerseAutoSize={verseByVerseAutoSize}
              handleFontFamilyChange={handleFontFamilyChange}
              handleFontSizeChange={handleFontSizeChange}
              handleAutoSizeChange={handleAutoSizeChange}
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

          {/* Presets Settings */}
          {activeSection === "presets" && (
            <PresetsSettings bibleBgs={bibleBgs} />
          )}
        </div>
      </div>
    </div>
  );
};
