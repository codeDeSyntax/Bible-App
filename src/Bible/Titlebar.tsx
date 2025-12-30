import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Minus,
  Square,
  Monitor,
  LayoutGrid,
  BookOpen,
  Type,
  Users,
  SlidersHorizontal,
  Home,
  Languages,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { MoreHorizontal } from "lucide-react";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";
import Help from "@/shared/Help";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { setCurrentScreen, goToWelcomeScreen } from "@/store/slices/appSlice";
import {
  setActiveFeature,
  setViewMode,
  setReaderSettingsOpen,
  setVerseByVerseMode,
  setProjectionTextColor,
  setVerseByVerseTextColor,
  setCurrentTranslation,
} from "@/store/slices/bibleSlice";
import { toggleDarkMode, selectIsDarkMode } from "@/store/themeSlice";
import ReaderSettingsDropdown from "./components/ReaderSettingsDropdown";
import { CustomSelect } from "./components/BibleStudio/CustomSelect";
import { SettingsMenu } from "./components/SettingsMenu";
import { Settings } from "lucide-react";

const TitleBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.bible.theme);
  const viewMode = useAppSelector((state) => state.bible.viewMode);
  const readerSettingsOpen = useAppSelector(
    (state) => state.bible.readerSettingsOpen
  );
  const verseByVerseMode = useAppSelector(
    (state) => state.bible.verseByVerseMode
  );
  const imageBackgroundMode = useAppSelector(
    (state) => state.bible.imageBackgroundMode
  );
  const projectionTextColor = useAppSelector(
    (state) => state.bible.projectionTextColor
  );
  const verseByVerseTextColor = useAppSelector(
    (state) => state.bible.verseByVerseTextColor
  );
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const { handleMinimize, handleMaximize, handleClose } = useBibleOperations();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  // Create a peaceful, church-appropriate pattern background
  const createPatternBackground = () => {
    if (!isDarkMode) {
      // Light mode: gentle flowing waves with subtle cross accents
      return `
        radial-gradient(circle at 50% 50%, var(--select-border) 0%, transparent 50%),
        repeating-linear-gradient(90deg, transparent, transparent 60px, var(--select-border) 60px, var(--select-border) 61px),
        repeating-linear-gradient(0deg, transparent, transparent 60px, var(--select-border) 60px, var(--select-border) 61px),
        linear-gradient(135deg, var(--card-bg-alt) 0%, var(--card-bg) 100%)
      `;
    } else {
      // Dark mode: gentle waves with soft glow effect
      return `
        radial-gradient(ellipse at 30% 50%, var(--select-border) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 50%, var(--select-border) 0%, transparent 50%),
        repeating-linear-gradient(90deg, transparent, transparent 80px, var(--select-border) 80px, var(--select-border) 81px),
        repeating-linear-gradient(0deg, transparent, transparent 80px, var(--select-border) 80px, var(--select-border) 81px),
        linear-gradient(135deg, var(--card-bg) 0%, var(--card-bg-alt) 100%)
      `;
    }
  };

  const [selectedBg, setSelectedBg] = useState<string>(
    createPatternBackground()
  );
  const [nextBg, setNextBg] = useState<string>(createPatternBackground());
  const [bgOpacity, setBgOpacity] = useState<number>(1);
  const [selectedPath, setSelectedPath] = useState<string>(
    () => localStorage.getItem("bibleFilespath") || ""
  );

  const setAndSaveCurrentScreen = useCallback(
    (screen: string) => {
      dispatch(setCurrentScreen(screen as any));
    },
    [dispatch]
  );

  // Keyboard shortcut handler for control room toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Ctrl+S in audience mode (verse-by-verse mode)
      if (
        event.key.toLowerCase() === "s" &&
        event.ctrlKey &&
        verseByVerseMode
      ) {
        event.preventDefault();
        // Open settings menu instead
        setShowSettingsMenu((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [verseByVerseMode]);

  // Listen for external requests to open the settings menu (events dispatched from other components)
  useEffect(() => {
    const handler = () => setShowSettingsMenu(true);
    window.addEventListener("open-settings-menu", handler as EventListener);
    return () =>
      window.removeEventListener(
        "open-settings-menu",
        handler as EventListener
      );
  }, []);

  // Click outside handler for settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const settingsMenu = document.getElementById("settings-menu");
      const settingsButton = (event.target as HTMLElement).closest(
        '[title="Settings"]'
      );

      if (
        settingsMenu &&
        !settingsMenu.contains(event.target as Node) &&
        !settingsButton
      ) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSettingsMenu]);

  // Auto-switch text color based on theme in verse-by-verse mode
  useEffect(() => {
    console.log("🎨 Theme auto-switch triggered:", {
      verseByVerseMode,
      imageBackgroundMode,
      isDarkMode,
      currentProjectionTextColor: projectionTextColor,
      currentVerseByVerseTextColor: verseByVerseTextColor,
    });

    // Only apply auto-switching in verse-by-verse mode for background image mode
    if (verseByVerseMode && imageBackgroundMode) {
      // For verse-by-verse with background image: always white
      console.log("🎨 Setting white text for background mode");
      if (projectionTextColor !== "#ffffff") {
        dispatch(setProjectionTextColor("#ffffff"));
        localStorage.setItem("bibleProjectionTextColor", "#ffffff");
      }
      if (verseByVerseTextColor !== "#ffffff") {
        dispatch(setVerseByVerseTextColor("#ffffff"));
        localStorage.setItem("bibleVerseByVerseTextColor", "#ffffff");
      }

      // Send IPC update immediately
      if (typeof window !== "undefined" && window.ipcRenderer) {
        window.ipcRenderer.send("bible-presentation-update", {
          type: "updateStyle",
          data: { textColor: "#ffffff" },
        });
      }
    }
  }, [
    verseByVerseMode,
    imageBackgroundMode,
    dispatch,
    projectionTextColor,
    verseByVerseTextColor,
  ]);

  const selectEvpd = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSelectedPath(path);
      localStorage.setItem("bibleFilespath", path);
    } else {
      console.error("Invalid path selected");
    }
  };

  // Update pattern when theme or dark mode changes
  useEffect(() => {
    const newPattern = createPatternBackground();
    setSelectedBg(newPattern);
    setNextBg(newPattern);
  }, [isDarkMode]);

  const randomImage = useCallback(() => {
    // Regenerate pattern for subtle variation
    const newPattern = createPatternBackground();
    setNextBg(newPattern);
    // Start transition
    setBgOpacity(0);
  }, [isDarkMode]);

  useEffect(() => {
    // Set up interval for image switching
    const intervalId = setInterval(randomImage, 20000); // 5 minutes (300000 ms)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [randomImage]);

  useEffect(() => {
    // When opacity reaches 0, switch background and reset opacity
    if (bgOpacity === 0) {
      const transitionTimer = setTimeout(() => {
        setSelectedBg(nextBg);
        setBgOpacity(1);
      }, 5000); // Matches transition duration

      return () => clearTimeout(transitionTimer);
    }
  }, [bgOpacity, nextBg]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle translation change
  const handleTranslationSelect = (translation: string) => {
    dispatch(setCurrentTranslation(translation));
  };

  // Get available translations
  const availableTranslations = Object.keys(bibleData);

  return (
    <div className="" style={{ WebkitAppRegion: "drag" } as any}>
      <div
        className="h-8 flex items-center justify-between px-2 border-b select-none relative z-[10000] border-select-border backdrop-blur-sm border-solid border-x-0 border-t-0"
        style={{
          background: selectedBg,
          backgroundColor: "var(--studio-bg)",
          borderColor: "var(--select-border)",
        }}
      >
        {/* Left side - Action buttons */}
        <div
          className="flex items-center space-x-2"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Home button */}
          <div
            onClick={() => dispatch(goToWelcomeScreen())}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title="Go to Welcome Screen"
          >
            <Home
              className="w-4 h-4 text-text-primary group-hover:text-blue-500"
              strokeWidth={2}
            />
          </div>

          {/* Translation Selector */}
          <div className="relative z-[9999]">
            <CustomSelect
              value={currentTranslation}
              options={availableTranslations.map((translation) => ({
                label: translation,
                value: translation,
              }))}
              onChange={handleTranslationSelect}
              placeholder="Translation"
              isDarkMode={isDarkMode}
              width={110}
              showSearch={false}
              icon={<Languages className="w-4 h-3" />}
              className="!h-5  !min-h-0 !py-0 !text-xs bg-white/50 dark:bg-black/50 text-white"
            />
          </div>

          {/* Projection Control Room button - only show in audience/projection mode */}
          {verseByVerseMode && (
            <div
              onClick={() => setShowSettingsMenu(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
              title="Settings & Controls (Press 'Ctrl+S' to toggle)"
            >
              <Monitor
                className="w-4 h-4 text-text-primary group-hover:text-text-primary transition-colors"
                strokeWidth={2}
              />
            </div>
          )}

          {/* View Mode Toggle button - toggles between Reader modes and Audience mode */}
          <div
            onClick={() => {
              // Toggle between reader mode (block/paragraph) and audience mode (verse-by-verse)
              dispatch(setVerseByVerseMode(!verseByVerseMode));
            }}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title={
              verseByVerseMode
                ? "Switch to Reader Mode"
                : "Switch to Audience Mode"
            }
          >
            {verseByVerseMode ? (
              <BookOpen
                className="w-4 h-4 text-text-primary group-hover:text-text-primary transition-colors"
                strokeWidth={2}
              />
            ) : (
              <Users
                className="w-4 h-4 text-text-primary group-hover:text-text-primary transition-colors"
                strokeWidth={2}
              />
            )}
          </div>

          {/* Reader Settings Dropdown Toggle - only show in reader mode */}
          {!verseByVerseMode && (
            <div className="relative">
              <div
                onClick={() =>
                  dispatch(setReaderSettingsOpen(!readerSettingsOpen))
                }
                className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
                title="Reader Settings"
              >
                <SlidersHorizontal
                  className={`w-4 h-4 ${
                    readerSettingsOpen
                      ? "text-text-primary opacity-80"
                      : "text-text-primary"
                  } group-hover:text-text-primary transition-colors`}
                  strokeWidth={2}
                />
              </div>
              <ReaderSettingsDropdown />
            </div>
          )}

          {/* Settings Icon */}
          <div
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title="Settings"
          >
            <Settings
              className={`w-4 h-4 ${
                showSettingsMenu
                  ? "text-text-primary opacity-80"
                  : "text-text-primary"
              } group-hover:text-text-primary transition-colors`}
              strokeWidth={2}
            />
          </div>

          {/* theme toggler (dark/light mode) */}
          <ThemeToggle />
          <Help />
        </div>

        {/* Center - Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-sm text-text-primary font-cooper pointer-events-none">
          Bible 300
        </div>

        {/* Right side - Window controls */}
        <div
          className="flex items-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Minimize button */}
          <div
            onClick={handleMinimize}
            className="w-12 h-8 flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title="Minimize"
          >
            <div className="w-[10px] h-[1px] bg-text-secondary group-hover:bg-text-primary" />
          </div>
          {/* Maximize button */}
          <div
            onClick={handleMaximize}
            className="w-12 h-8 flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title="Maximize"
          >
            <div className="w-[10px] h-[10px] border-solid border-1 border-text-secondary group-hover:border-text-primary" />
          </div>
          {/* Close button */}
          <div
            onClick={handleClose}
            className="w-12 h-8 flex items-center justify-center group cursor-pointer hover:bg-red-500/80 transition-colors"
            title="Close"
          >
            <X
              className="w-4 h-4 text-text-secondary group-hover:text-white"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>

      {/* Settings Menu - Rendered outside titlebar to avoid z-index issues */}
      <SettingsMenu
        isOpen={showSettingsMenu}
        onClose={() => setShowSettingsMenu(false)}
      />
    </div>
  );
};

export default TitleBar;
