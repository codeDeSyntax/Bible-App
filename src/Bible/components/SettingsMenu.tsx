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
  RefreshCcw,
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
  /** When true, renders as an inline block (no fixed overlay) */
  inline?: boolean;
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
  inline = false,
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
    highlightJesusWords,
    showScriptureReference,
    scriptureReferenceColor,
  } = useAppSelector((state) => state.bible);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);

  const [activeSection, setActiveSection] = useState<string>("general");
  const [previewMode, setPreviewMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [autoUpdateLoading, setAutoUpdateLoading] = useState(false);

  // Load auto-update preference
  useEffect(() => {
    window.ipcRenderer
      .invoke("get-update-preference")
      .then((prefs: { autoUpdate: boolean }) => {
        setAutoUpdate(prefs?.autoUpdate ?? false);
      })
      .catch(() => setAutoUpdate(false));
  }, []);

  const handleAutoUpdateToggle = async () => {
    const next = !autoUpdate;
    setAutoUpdateLoading(true);
    setAutoUpdate(next);
    try {
      await window.ipcRenderer.invoke("set-update-preference", {
        autoUpdate: next,
      });
    } catch {
      setAutoUpdate(!next);
    } finally {
      setAutoUpdateLoading(false);
    }
  };

  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [imagePreloadCache, setImagePreloadCache] = useState<Set<string>>(
    new Set(),
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
      JSON.stringify(colors),
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
    const newValue = !highlightJesusWords;
    dispatch(setHighlightJesusWords(newValue));

    // Send IPC update so presentation window updates immediately
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

    // Send IPC update so presentation window updates immediately
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { showScriptureReference: newValue },
      });
    }
  };

  const handleScriptureReferenceColorChange = (color: string) => {
    dispatch(setScriptureReferenceColor(color));

    // Send IPC update so presentation window updates immediately
    if (typeof window !== "undefined" && window.ipcRenderer) {
      window.ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: { scriptureReferenceColor: color },
      });
    }
  };

  const handleBackgroundImageModeChange = (enabled: boolean) => {
    dispatch(setImageBackgroundMode(enabled));
  };

  const loadBackgroundImages = (forceReload?: boolean) => {
    (async () => {
      try {
        setIsLoadingImages(true);

        // Only load if we don't have images yet or if forcing a reload
        if (forceReload || bibleBgs.length === 0) {
          const customPath = localStorage.getItem("bibleCustomImagesPath");
          let images: string[] = [];

          try {
            if (customPath && typeof window !== "undefined" && window.api) {
              console.log(
                "SettingsMenu: Loading custom images from:",
                customPath,
              );
              images = await window.api.getImages(customPath);
              console.log(
                "SettingsMenu: Loaded",
                images.length,
                "custom images",
              );
            } else {
              // Fallback default images
              console.log("SettingsMenu: Loading default background images");
              images = [
                "./wood2.jpg",
                "./wood6.jpg",
                "./wood7.png",
                "./wood10.jpg",
                "./wood11.jpg",
              ];
            }

            if (images && images.length > 0) {
              dispatch(setBibleBgs(images));
            }
          } catch (err) {
            console.error("Error loading images from path:", err);
            // On error fall back to defaults
            const defaultBackgrounds = [
              "./wood2.jpg",
              "./wood6.jpg",
              "./wood7.png",
              "./wood10.jpg",
              "./wood11.jpg",
            ];
            dispatch(setBibleBgs(defaultBackgrounds));
          }
        }
      } finally {
        setIsLoadingImages(false);
      }
    })();
  };

  const handleSelectImagesDirectory = async () => {
    try {
      if (typeof window !== "undefined" && window.ipcRenderer) {
        const result = await window.ipcRenderer.invoke("select-directory");
        if (result) {
          localStorage.setItem("bibleCustomImagesPath", result);
          let images: string[] = [];
          try {
            if (typeof window !== "undefined" && window.api) {
              images = await window.api.getImages(result);
            }
          } catch (err) {
            console.error("Error loading images from selected directory:", err);
          }

          if (images && images.length > 0) {
            dispatch(setBibleBgs(images));
          }

          logBibleProjection(
            "Custom images directory selected from settings menu",
            {
              path: result,
              imageCount: images.length,
            },
          );
        }
      }
    } catch (error) {
      console.error("Error selecting images directory:", error);
    }
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
    {
      id: "updates",
      label: "Updates",
      icon: RefreshCcw,
      desc: "Update Preferences",
    },
  ];

  return (
    <div
      id="settings-menu"
      className={
        inline
          ? "h-full w-full bg-card-bg border border-select-border rounded-xl flex overflow-hidden"
          : "fixed left-1/2 top-12 -translate-x-1/2 min-h-[calc(100vh-60px)] bg-card-bg border border-select-border rounded-lg shadow-2xl flex overflow-hidden"
      }
      style={
        inline
          ? { fontFamily: "Outfit, system-ui, sans-serif" }
          : {
              width: "95vw",
              maxHeight: "calc(100vh - 60px)",
              zIndex: 10000,
              fontFamily: "Outfit, system-ui, sans-serif",
            }
      }
    >
      {/* Left Sidebar - Settings Navigation */}
      <div className="w-44 flex flex-col bg-card-bg-alt border-r border-select-border flex-shrink-0">
        <div className="px-3 py-3 border-b border-select-border flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md flex-shrink-0">
            <img src="./bibleicon.png" className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-text-primary truncate">
            Controls
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
          <nav className="space-y-0.5 px-2">
            {sections.map(({ id, label, icon: Icon }) => (
              <div
                key={id}
                onClick={() => setActiveSection(id)}
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-left transition-all duration-150 cursor-pointer ${
                  activeSection === id
                    ? "bg-btn-active-from text-white shadow-sm"
                    : "text-text-secondary hover:bg-select-hover hover:text-text-primary"
                }`}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color:
                      activeSection === id ? "white" : "var(--text-secondary)",
                  }}
                />
                <span className="text-xs font-medium truncate">{label}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col bg-card-bg">
        {/* Header */}
        <div className="px-3 py-2 border-b border-card-bg-alt bg-studio-bg backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary capitalize">
              {activeSection}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={async () => {
                  if (!currentBook || !currentChapter || !currentTranslation)
                    return;
                  const translationData = bibleData[currentTranslation];
                  if (!translationData?.books) return;
                  const bookData = translationData.books.find(
                    (book: any) => book.name === currentBook,
                  );
                  if (!bookData) return;
                  const chapterData = bookData.chapters?.find(
                    (ch: any) => ch.chapter === currentChapter,
                  );
                  if (!chapterData?.verses) return;
                  const presentationData = {
                    book: currentBook,
                    chapter: currentChapter,
                    verses: chapterData.verses,
                    translation: currentTranslation,
                    selectedVerse: undefined,
                  };
                  const settings = {
                    versesPerSlide: 1,
                    fontSize: projectionFontSize,
                    textColor: projectionTextColor,
                    backgroundColor: projectionBackgroundColor,
                  };
                  if (typeof window !== "undefined" && window.api) {
                    try {
                      await window.api.createBiblePresentationWindow({
                        presentationData,
                        settings,
                      });
                    } catch (error) {
                      console.error("Failed to send to projection:", error);
                    }
                  }
                }}
                className="w-7 h-7 rounded-lg bg-select-bg hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer"
                title="Send to projection"
              >
                <Monitor className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-select-bg hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
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
            <div className="w-full h-full overflow-y-auto no-scrollbar">
              <AppearanceSettings
                projectionTextColor={projectionTextColor}
                darkMode={isDarkMode}
                colorPresets={colorPresets}
                handleTextColorChange={handleTextColorChange}
              />

              {/* Theme Selector — Win11-style row */}
              <div className="px-4 pt-4 pb-1">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  App Theme
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-select-hover transition-colors duration-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-select-bg text-text-secondary">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      Color Theme
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      Change the app's color palette
                    </div>
                  </div>
                </div>
                <CustomSelect
                  value={currentTheme}
                  options={themeOptions}
                  onChange={handleThemeChange}
                  placeholder="Select Theme"
                  isDarkMode={isDarkMode}
                  width={160}
                  showSearch={false}
                />
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

          {/* Presets Settings */}
          {activeSection === "presets" && (
            <PresetsSettings bibleBgs={bibleBgs} />
          )}

          {/* Updates Settings */}
          {activeSection === "updates" && (
            <div className="w-full space-y-4">
              {/* Section header */}
              <div className="px-1 pb-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  Update Preferences
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Control how Bible Book-Of-Redemption receives updates.
                </p>
              </div>

              {/* Auto-update row */}
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "var(--select-hover)",
                  border: "1px solid var(--select-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--select-bg)" }}
                  >
                    <RefreshCcw
                      className="w-4 h-4 text-text-secondary"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Automatic Updates
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {autoUpdate
                        ? "Checks & downloads updates on startup"
                        : "Must check for updates manually"}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={autoUpdate}
                    onChange={handleAutoUpdateToggle}
                    disabled={autoUpdateLoading}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-10 h-6 rounded-full relative transition-all duration-200 ${
                      autoUpdate ? "bg-btn-active-from" : "bg-select-bg"
                    } ${autoUpdateLoading ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all duration-200 border border-select-border ${
                        autoUpdate ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Info note */}
              <div
                className="flex gap-2 p-3 rounded-xl text-xs"
                style={{
                  background: autoUpdate
                    ? "color-mix(in srgb, var(--btn-active-from) 10%, transparent)"
                    : "var(--select-hover)",
                  border: "1px solid var(--select-border)",
                  color: "var(--text-secondary)",
                }}
              >
                <RefreshCcw
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span>
                  {autoUpdate
                    ? "The app will automatically check and download available updates when it starts."
                    : "The app will only update when you manually click \u201cCheck for Updates\u201d in the titlebar update button."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
