import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Minus,
  Square,
  Monitor,
  LayoutGrid,
  Type,
  Users,
  Keyboard,
  Languages,
  FolderOpen,
} from "lucide-react";
import UpdateManager from "./components/UpdateManager";
import { useAppDispatch, useAppSelector } from "@/store";
import { MoreHorizontal } from "lucide-react";
import ShortcutsModal from "./components/ShortcutsModal";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";
import { useWindowControls } from "@/features/bible/hooks/useBibleOperations";
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
  const { handleMinimize, handleMaximize, handleClose } = useWindowControls();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isControlRoomOpen, setIsControlRoomOpen] = useState<boolean>(false);

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
    const toggleHandler = () => {
      setIsControlRoomOpen((prev) => {
        const next = !prev;
        window.dispatchEvent(
          new CustomEvent("bible-control-room-toggle", {
            detail: { show: next },
          }),
        );
        return next;
      });
    };
    window.addEventListener("bible-control-room-toggle", handler);
    window.addEventListener("bible-control-room-toggle-request", toggleHandler);
    return () => {
      window.removeEventListener("bible-control-room-toggle", handler);
      window.removeEventListener("bible-control-room-toggle-request", toggleHandler);
    };
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
    <div style={{ WebkitAppRegion: "drag" } as any}>
      <div className="h-8 flex items-center justify-between px-2 select-none relative z-[10000] border-b border-select-border bg-card-bg">
        {/* Left side - Home & Translation */}
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* App Logo / Home button */}
          <button
            onClick={() => dispatch(goToWelcomeScreen())}
            className="w-6 h-6 p-0 rounded-md flex items-center justify-center !bg-transparent hover:!bg-black/5 dark:hover:!bg-white/10 transition-colors cursor-pointer select-none"
            title="Go to Welcome Screen"
          >
            <img
              src="./bibleicon.png"
              alt="Bible App"
              className="w-5 h-5 object-contain pointer-events-none"
            />
          </button>

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
              width={84}
              showSearch={false}
              icon={<Languages className="w-3.5 h-3.5 opacity-80" strokeWidth={2.4} />}
              className="!h-6 !min-h-0 !py-0 !px-1.5 !border-0 !bg-transparent  dark: hover:!bg-black/5 !rounded-md !text-[11px] !text-text-secondary hover:!text-text-primary font-medium"
            />
          </div>
        </div>

        {/* Center - Sleek Title & Version */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-text-secondary font-normal pointer-events-none select-none">
          <span className="font-medium text-text-primary/90">Bible Book-Of-Redemption</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-none font-mono font-medium bg-btn-normal-from text-text-primary border border-select-border dark:bg-btn-active-from dark:text-white dark:border-btn-active-to shadow-xs">
            v{__APP_VERSION__}
          </span>
        </div>

        {/* Right side - Action buttons & Window controls */}
        <div
          className="flex items-center gap-0.5"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Update check button */}
          <UpdateManager />

          {/* Subtle divider */}
          <div className="w-[1px] h-3.5 bg-select-border mx-0.5" />

          {/* Control Room toggle — opens inline inside the bento grid */}
          <button
            onClick={() => {
              const next = !isControlRoomOpen;
              setIsControlRoomOpen(next);
              window.dispatchEvent(
                new CustomEvent("bible-control-room-toggle", {
                  detail: { show: next },
                }),
              );
            }}
            className={`w-6 h-6 p-0 rounded-md flex items-center justify-center transition-colors cursor-pointer !bg-transparent ${
              isControlRoomOpen
                ? "!bg-white/15 dark:!bg-white/15 text-text-primary"
                : "text-text-secondary hover:text-text-primary  dark: hover:!bg-black/5"
            }`}
            title="Control Room (toggle projection settings in grid)"
          >
            <LayoutGrid
              className="w-5 h-5"
              strokeWidth={2.4}
            />
          </button>

          {/* Settings / Shortcuts Icon */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className={`w-6 h-6 p-0 rounded-md flex items-center justify-center transition-colors cursor-pointer !bg-transparent ${
              showShortcuts
                ? "!bg-white/15 dark:!bg-white/15 text-text-primary"
                : "text-text-secondary hover:text-text-primary  dark: hover:!bg-black/5"
            }`}
            title="Shortcuts"
          >
            <Keyboard
              className="w-5 h-5"
              strokeWidth={2.4}
            />
          </button>

          {/* theme toggler (dark/light mode) */}
          <ThemeToggle />

          {/* Google Drive folder button */}
          <button
            onClick={selectEvpd}
            className={`w-6 h-6 p-0 rounded-md flex items-center justify-center transition-colors cursor-pointer !bg-transparent ${
              selectedPath
                ? "!bg-white/15 dark:!bg-white/15 text-text-primary"
                : "text-text-secondary hover:text-text-primary  dark: hover:!bg-black/5"
            }`}
            title={`Google Drive folder${selectedPath ? `: ${selectedPath}` : " — click to select"}`}
          >
            <FolderOpen
              className="w-5 h-5"
              strokeWidth={2.4}
            />
          </button>

          {/* Subtle divider */}
          <div className="w-[1px] h-3.5 bg-select-border mx-0.5" />

          {/* Window controls group - matching same design feel */}
          <button
            onClick={handleMinimize}
            className="w-6 h-6 p-0 rounded-md flex items-center justify-center !bg-transparent text-text-secondary hover:text-text-primary  dark: hover:!bg-black/5 transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus
              className="w-5 h-5"
              strokeWidth={2.4}
            />
          </button>

          <button
            onClick={handleMaximize}
            className="w-6 h-6 p-0 rounded-md flex items-center justify-center !bg-transparent text-text-secondary hover:text-text-primary  dark: hover:!bg-black/5 transition-colors cursor-pointer"
            title="Maximize"
          >
            <Square
              className="w-4 h-4"
              strokeWidth={2.4}
            />
          </button>

          <button
            onClick={handleClose}
            className="w-6 h-6 p-0 rounded-md flex items-center justify-center !bg-transparent text-text-secondary hover:text-white hover:!bg-[#e81123] dark:hover:!bg-[#c42b1c] transition-colors cursor-pointer"
            title="Close"
          >
            <X
              className="w-5 h-5"
              strokeWidth={2.4}
            />
          </button>
        </div>
      </div>

      {/* Shortcuts Menu */}
      <ShortcutsMenu
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default TitleBar;
