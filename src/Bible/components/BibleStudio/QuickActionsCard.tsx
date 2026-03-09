import React, { useState, useEffect } from "react";
import { BentoCard } from "./BentoCard";
import { Tooltip } from "antd";
import {
  Bookmark,
  Megaphone,
  Save,
  BookmarkPlus,
  Monitor,
  Search,
  Star,
  Library,
  EyeOff,
  Eye,
  Contrast,
  Image,
  Shapes,
  LucideBookmark,
} from "lucide-react";
import { GoogleGIcon } from "../GoogleAIModePanel";

interface QuickActionsCardProps {
  isDarkMode: boolean;
  onBookmark: () => void;
  onSavePreset: () => void;
  onOpenProjection: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenLibrary: () => void;
  onToggleBlankScreen: () => void;
  onSaveQuickScripture: () => void;
  onPublishMarquee?: () => void;
  onToggleProjectionGrayscale?: () => void;
  hasActiveAlert?: boolean;
  isBookmarked: boolean;
  bookmarksCount: number;
  isProjectionActive: boolean;
  isBlankScreenMode: boolean;
}

const ActionBtn = ({
  tooltip,
  onClick,
  className = "",
  children,
  placement = "top",
}: {
  tooltip: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  placement?: "top" | "left" | "right" | "bottom";
}) => (
  <Tooltip title={tooltip} placement={placement}>
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-xl border border-select-border bg-studio-bg hover:bg-select-hover transition-colors duration-150 cursor-pointer aspect-square shadow shadow-card-bg-alt ${className}`}
    >
      {children}
    </div>
  </Tooltip>
);

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  isDarkMode,
  onBookmark,
  onSavePreset,
  onOpenProjection,
  onOpenSearch,
  onOpenBookmarks,
  onOpenLibrary,
  onToggleBlankScreen,
  onSaveQuickScripture,
  onPublishMarquee,
  onToggleProjectionGrayscale,
  hasActiveAlert,
  isBookmarked,
  bookmarksCount,
  isProjectionActive,
  isBlankScreenMode,
}) => {
  const [useIcons, setUseIcons] = useState<boolean>(
    () => localStorage.getItem("bibleStudio_useIcons") === "true",
  );
  const [activeGoogleView, setActiveGoogleView] = useState<
    "googleAI" | "googleImages" | null
  >(null);

  // Track which google view is active (synced from BibleStudio via events)
  useEffect(() => {
    const handler = (e: Event) => {
      const { view } = (
        e as CustomEvent<{ view: "googleAI" | "googleImages" | null }>
      ).detail;
      setActiveGoogleView(view);
    };
    window.addEventListener("bible-google-view", handler);
    return () => window.removeEventListener("bible-google-view", handler);
  }, []);

  const dispatchGoogleView = (view: "googleAI" | "googleImages") => {
    const next = activeGoogleView === view ? null : view;
    window.dispatchEvent(
      new CustomEvent("bible-google-view", { detail: { view: next } }),
    );
  };

  const toggleIconMode = () => {
    setUseIcons((prev) => {
      const next = !prev;
      localStorage.setItem("bibleStudio_useIcons", String(next));
      return next;
    });
  };

  const toggleBtn = (
    <Tooltip
      title={useIcons ? "Switch to images" : "Switch to icons"}
      placement="left"
    >
      <button
        onClick={toggleIconMode}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-colors duration-150 cursor-pointer ${
          useIcons
            ? "bg-gradient-to-br from-btn-active-from to-btn-active-to text-white border-transparent"
            : "bg-studio-bg border-select-border text-text-secondary hover:bg-select-hover"
        }`}
      >
        {useIcons ? (
          <>
            <Shapes className="w-3 h-3" />
            <span>Icons</span>
          </>
        ) : (
          <>
            <Image className="w-3 h-3" />
            <span>Images</span>
          </>
        )}
      </button>
    </Tooltip>
  );

  return (
    <BentoCard
      title="Quick Actions"
      isDarkMode={isDarkMode}
      icon={
        <img
          src="./svgs/quickactionsmenu.png"
          alt="Quick Actions"
          className="w-4 h-4"
        />
      }
      headerRight={toggleBtn}
      className="col-span-1 row-span-3"
    >
      <div className="grid grid-cols-5 gap-1.5">
        {/* Bookmark */}
        <ActionBtn
          tooltip="Bookmark current verse"
          onClick={onBookmark}
          placement="left"
        >
          {useIcons ? (
            <LucideBookmark className="w-5 h-5 text-text-primary shadow shadow-black" />
          ) : (
            <img
              src="./svgs/icons8-add-bookmark.svg"
              alt="Bookmark"
              className="w-8 h-8"
            />
          )}
        </ActionBtn>

        {/* Marquee alert */}
        <ActionBtn
          tooltip={
            hasActiveAlert ? "Hide marquee alert" : "Create marquee alert"
          }
          onClick={() => onPublishMarquee?.()}
          placement="left"
        >
          {useIcons ? (
            <Megaphone className="w-5 h-5 text-text-primary" />
          ) : (
            <img src="./svgs/megaphone.png" alt="Publish" className="w-7 h-7" />
          )}
          {hasActiveAlert && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white/60" />
          )}
        </ActionBtn>

        {/* Save preset */}
        <ActionBtn
          tooltip="Save current verse as preset"
          onClick={onSavePreset}
          placement="left"
        >
          {useIcons ? (
            <Save className="w-5 h-5 text-text-primary" />
          ) : (
            <img
              src="./svgs/savepreset.png"
              alt="Save preset"
              className="w-8 h-8"
            />
          )}
        </ActionBtn>

        {/* Save for quick access */}
        <ActionBtn
          tooltip="Save for quick access"
          onClick={onSaveQuickScripture}
          placement="left"
        >
          {useIcons ? (
            <BookmarkPlus className="w-5 h-5 text-text-primary" />
          ) : (
            <img
              src="./svgs/quickscripturesave.png"
              alt="Quick save"
              className="w-8 h-8"
            />
          )}
        </ActionBtn>

        {/* Open projection */}
        <ActionBtn
          tooltip="Open Bible presentation"
          onClick={onOpenProjection}
          placement="left"
        >
          {useIcons ? (
            <Monitor className="w-5 h-5 text-text-primary" />
          ) : (
            <img src="./svgs/monitor.png" alt="Monitor" className="w-8 h-8" />
          )}
          {isProjectionActive && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-1 ring-white/60" />
          )}
        </ActionBtn>

        {/* Search */}
        <ActionBtn tooltip="Search Bible" onClick={onOpenSearch}>
          {useIcons ? (
            <Search className="w-5 h-5 text-text-primary" />
          ) : (
            <img
              src="./svgs/icons8-search.svg"
              alt="Search"
              className="w-8 h-8"
            />
          )}
        </ActionBtn>

        {/* Bookmarks list */}
        <ActionBtn
          tooltip="View all bookmarks"
          onClick={onOpenBookmarks}
          placement="left"
        >
          {useIcons ? (
            <Star className="w-5 h-5 text-text-primary" />
          ) : (
            <img
              src="./svgs/icons8-favorites.svg"
              alt="Bookmarks"
              className="w-8 h-8"
            />
          )}
          {bookmarksCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-semibold leading-none">
              {bookmarksCount > 99 ? "99+" : bookmarksCount}
            </span>
          )}
        </ActionBtn>

        {/* Library */}
        <ActionBtn
          tooltip="Open library"
          onClick={onOpenLibrary}
          placement="left"
        >
          {useIcons ? (
            <Library className="w-5 h-5 text-text-primary" />
          ) : (
            <img src="./svgs/library.png" alt="Library" className="w-8 h-8" />
          )}
        </ActionBtn>

        {/* Google AI Mode Search */}
        <ActionBtn
          tooltip="Google AI Mode Search"
          onClick={() => dispatchGoogleView("googleAI")}
          placement="left"
          className={activeGoogleView === "googleAI" ? "!bg-select-hover" : ""}
        >
          <GoogleGIcon className="w-5 h-5" />
        </ActionBtn>

        {/* Google Images Search */}
        <ActionBtn
          tooltip="Google Images Search"
          onClick={() => dispatchGoogleView("googleImages")}
          placement="left"
          className={
            activeGoogleView === "googleImages" ? "!bg-select-hover" : ""
          }
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#4285F4" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#EA4335" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#34A853" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#FBBC05" />
          </svg>
        </ActionBtn>

        {/* Blank screen — only when projection active */}
        {isProjectionActive && (
          <ActionBtn
            tooltip={isBlankScreenMode ? "Show presentation" : "Blank screen"}
            onClick={onToggleBlankScreen}
            className={
              isBlankScreenMode
                ? "!bg-red-500 hover:!bg-red-600 border-transparent"
                : ""
            }
            placement="left"
          >
            {useIcons ? (
              isBlankScreenMode ? (
                <Eye className="w-5 h-5 text-white" />
              ) : (
                <EyeOff
                  className={`w-5 h-5 ${isBlankScreenMode ? "text-white" : "text-text-primary"}`}
                />
              )
            ) : (
              <img
                src="./svgs/blank.png"
                alt={isBlankScreenMode ? "Show" : "Blank"}
                className={`w-7 h-7 ${isBlankScreenMode ? "opacity-100" : "opacity-60"}`}
              />
            )}
          </ActionBtn>
        )}

        {/* Grayscale — only when projection active */}
        {isProjectionActive && (
          <ActionBtn
            tooltip="Toggle grayscale filter"
            placement="left"
            onClick={onToggleProjectionGrayscale}
          >
            {useIcons ? (
              <Contrast className="w-5 h-5 text-text-primary" />
            ) : (
              <img
                src="./svgs/grayscale.png"
                alt="Grayscale"
                className="w-7 h-7"
              />
            )}
          </ActionBtn>
        )}
      </div>
    </BentoCard>
  );
};
