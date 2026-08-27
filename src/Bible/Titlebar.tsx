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
  FolderOpen,
} from "lucide-react";
import UpdateManager from "./components/UpdateManager";
import { useAppDispatch, useAppSelector } from "@/store";
import { MoreHorizontal } from "lucide-react";
import ShortcutsModal from "./components/ShortcutsModal";
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
      <div
        className="h-8 flex items-center justify-between px-3 border-b select-none relative z-[10000] border-select-border bg-card-bg"
      >
        {/* Left side - Action buttons */}
        <div
          className="flex items-center space-x-1.5"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Home button */}
          <button
            onClick={() => dispatch(goToWelcomeScreen())}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-select-bg hover:bg-select-hover border border-select-border text-text-primary transition-colors cursor-pointer"
            title="Go to Welcome Screen"
          >
            <Home
              className="w-3.5 h-3.5 text-text-primary hover:text-blue-500 transition-colors"
              strokeWidth={2}
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
              width={96}
              showSearch={false}
              icon={<Languages className="w-3.5 h-3" />}
              className="!h-6 !min-h-0 !py-0 !text-[11px] text-text-primary"
            />
          </div>

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
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              isControlRoomOpen
                ? "bg-btn-active-from text-white border-btn-active-from shadow-xs"
                : "bg-select-bg hover:bg-select-hover border-select-border text-text-primary"
            }`}
            title="Control Room (toggle projection settings in grid)"
          >
            <LayoutGrid
              className={`w-3.5 h-3.5 transition-colors ${
                isControlRoomOpen ? "text-white" : "text-text-primary"
              }`}
              strokeWidth={2}
            />
          </button>

          {/* Settings Icon */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              showShortcuts
                ? "bg-btn-active-from text-white border-btn-active-from shadow-xs"
                : "bg-select-bg hover:bg-select-hover border-select-border text-text-primary"
            }`}
            title="Shortcuts"
          >
            <Keyboard
              className="w-3.5 h-3.5 text-text-primary transition-colors"
              strokeWidth={2}
            />
          </button>

          {/* theme toggler (dark/light mode) */}
          <ThemeToggle />
          <Help />

          {/* Google Drive folder button */}
          <button
            onClick={selectEvpd}
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              selectedPath
                ? "bg-btn-active-from text-white border-btn-active-from shadow-xs"
                : "bg-select-bg hover:bg-select-hover border-select-border text-text-primary"
            }`}
            title={`Google Drive folder${selectedPath ? `: ${selectedPath}` : " — click to select"}`}
          >
            <FolderOpen
              className="w-3.5 h-3.5 text-text-primary transition-colors"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Center - Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-sm text-text-primary font-cooper pointer-events-none">
          Bible Book-Of-Redemption{" "}
          <span className="opacity-50 text-xs">v{__APP_VERSION__}</span>
        </div>

        {/* Right side - Window controls */}
        <div
          className="flex items-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Update check button */}
          <UpdateManager />
          {/* Minimize button */}
          <div
            onClick={handleMinimize}
            className="w-12 h-8 flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title="Minimize"
          >
            <Minus
              className="w-4 h-4 text-text-primary"
              strokeWidth={2}
            />
          </div>
          {/* Maximize button */}
          <div
            onClick={handleMaximize}
            className="w-12 h-8 flex items-center justify-center group cursor-pointer hover:bg-select-hover transition-colors"
            title="Maximize"
          >
            <Square
              className="w-3.5 h-3.5 text-text-primary"
              strokeWidth={2}
            />
          </div>
          {/* Close button */}
          <div
            onClick={handleClose}
            className="w-12 h-8 flex items-center justify-center group cursor-pointer hover:bg-red-500 transition-colors"
            title="Close"
          >
            <X
              className="w-4 h-4 text-text-primary group-hover:text-white"
              strokeWidth={2}
            />
          </div>
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
