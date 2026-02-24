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
  Home,
  Keyboard,
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
  setProjectionTextColor,
  setCurrentTranslation,
} from "@/store/slices/bibleSlice";
import { toggleDarkMode, selectIsDarkMode } from "@/store/themeSlice";
import { CustomSelect } from "./components/BibleStudio/CustomSelect";

import ShortcutsMenu from "./components/ShortcutsMenu";

const TitleBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.bible.theme);
  const viewMode = useAppSelector((state) => state.bible.viewMode);

  const imageBackgroundMode = useAppSelector(
    (state) => state.bible.imageBackgroundMode,
  );
  const projectionTextColor = useAppSelector(
    (state) => state.bible.projectionTextColor,
  );
  const verseByVerseTextColor = useAppSelector(
    (state) => state.bible.verseByVerseTextColor,
  );
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const { handleMinimize, handleMaximize, handleClose } = useBibleOperations();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isControlRoomOpen, setIsControlRoomOpen] = useState<boolean>(false);

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
    createPatternBackground(),
  );
  const [nextBg, setNextBg] = useState<string>(createPatternBackground());
  const [bgOpacity, setBgOpacity] = useState<number>(1);
  const [selectedPath, setSelectedPath] = useState<string>(
    () => localStorage.getItem("bibleFilespath") || "",
  );

  const setAndSaveCurrentScreen = useCallback(
    (screen: string) => {
      dispatch(setCurrentScreen(screen as any));
    },
    [dispatch],
  );

  // Keep isControlRoomOpen in sync with BibleStudio (e.g. when closed via X button inside)
  useEffect(() => {
    const handler = (e: Event) => {
      setIsControlRoomOpen((e as CustomEvent<{ show: boolean }>).detail.show);
    };
    window.addEventListener("bible-control-room-toggle", handler);
    return () =>
      window.removeEventListener("bible-control-room-toggle", handler);
  }, []);

  // Click outside handler for shortcuts menu
  useEffect(() => {
    const handleClickOutsideShortcuts = (event: MouseEvent) => {
      const shortcutsMenu = document.getElementById("shortcuts-menu");
      const shortcutsButton = (event.target as HTMLElement).closest(
        '[title="Shortcuts"]',
      );

      if (
        shortcutsMenu &&
        !shortcutsMenu.contains(event.target as Node) &&
        !shortcutsButton
      ) {
        setShowShortcuts(false);
      }
    };

    if (showShortcuts) {
      document.addEventListener("mousedown", handleClickOutsideShortcuts);
      return () =>
        document.removeEventListener("mousedown", handleClickOutsideShortcuts);
    }
  }, [showShortcuts]);

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
              className="!h-5  !min-h-0 !py-0 !text-xs  text-text-primary bg-studio-bg"
            />
          </div>

          {/* Control Room toggle — opens inline inside the bento grid */}
          <div
            onClick={() => {
              const next = !isControlRoomOpen;
              setIsControlRoomOpen(next);
              window.dispatchEvent(
                new CustomEvent("bible-control-room-toggle", {
                  detail: { show: next },
                }),
              );
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer transition-colors ${
              isControlRoomOpen ? "bg-select-hover" : "hover:bg-select-hover"
            }`}
            title="Control Room (toggle projection settings in grid)"
          >
            <LayoutGrid
              className={`w-4 h-4 transition-colors ${
                isControlRoomOpen
                  ? "text-blue-400"
                  : "text-text-primary group-hover:text-text-primary"
              }`}
              strokeWidth={2}
            />
          </div>

          {/* Settings Icon */}
          <div
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title="Shortcuts"
          >
            <Keyboard
              className={`w-4 h-4 ${
                showShortcuts
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

      {/* Shortcuts Menu - Rendered outside titlebar to avoid z-index issues */}
      <ShortcutsMenu
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default TitleBar;
