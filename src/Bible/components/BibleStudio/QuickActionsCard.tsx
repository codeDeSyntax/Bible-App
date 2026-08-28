import React, { useState, useEffect } from "react";
import { BentoCard } from "./BentoCard";
import { Tooltip } from "antd";
import {
  Zap,
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
  onPublishMarquee?: () => void;
  onToggleProjectionGrayscale?: () => void;
  hasActiveAlert?: boolean;
  isBookmarked: boolean;
  bookmarksCount: number;
  isProjectionActive: boolean;
  isBlankScreenMode: boolean;
}

interface ActionRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  active?: boolean;
  rightBadge?: React.ReactNode;
}

const ActionRow: React.FC<ActionRowProps> = ({
  icon,
  title,
  description,
  onClick,
  active = false,
  rightBadge,
}) => (
  <div
    onClick={onClick}
    className={`group flex items-center justify-between px-2 py-1.5 hover:bg-select-hover/70 transition-colors duration-100 cursor-pointer border-b border-dashed border-select-border dark:border-select-border/60 last:border-b-0 ${
      active ? "bg-btn-active-from/10" : ""
    }`}
  >
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-select-bg text-text-secondary group-hover:text-text-primary transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[0.73rem] font-bold text-text-primary leading-tight group-hover:text-btn-active-from transition-colors truncate">
          {title}
        </div>
        <div className="text-[0.64rem] text-text-secondary mt-0.5 truncate leading-tight">
          {description}
        </div>
      </div>
    </div>
    {rightBadge && (
      <div className="ml-2 flex-shrink-0">
        {rightBadge}
      </div>
    )}
  </div>
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
        className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-all duration-150 cursor-pointer ${
          useIcons
            ? "bg-btn-active-from text-white border-btn-active-from"
            : "bg-select-bg hover:bg-select-hover border-select-border text-text-secondary hover:text-text-primary"
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
      icon={<Zap className="w-4 h-4 text-btn-active-from" />}
      iconWithoutBg={true}
      headerRight={toggleBtn}
      className="col-span-1 row-span-3"
    >
      <div className="flex flex-col w-full overflow-y-auto no-scrollbar pb-8">
        {/* Bookmark */}
        <ActionRow
          icon={
            useIcons ? (
              <LucideBookmark className="w-3.5 h-3.5" />
            ) : (
              <img
                src="./svgs/icons8-add-bookmark.svg"
                alt="Bookmark"
                className="w-4 h-4"
              />
            )
          }
          title="Bookmark Verse"
          description={isBookmarked ? "Remove bookmark" : "Save current scripture"}
          onClick={onBookmark}
          rightBadge={
            isBookmarked ? (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            ) : null
          }
        />

        {/* Marquee Alert */}
        <ActionRow
          icon={
            useIcons ? (
              <Megaphone className="w-3.5 h-3.5" />
            ) : (
              <img
                src="./svgs/megaphone.png"
                alt="Marquee"
                className="w-4 h-4"
              />
            )
          }
          title="Marquee Alert"
          description={hasActiveAlert ? "Hide live alert marquee" : "Publish marquee alert ticker"}
          onClick={() => onPublishMarquee?.()}
          rightBadge={
            hasActiveAlert ? (
              <span className="text-[0.58rem] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                LIVE
              </span>
            ) : null
          }
        />

        {/* Save Preset */}
        <ActionRow
          icon={
            useIcons ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <img
                src="./svgs/savepreset.png"
                alt="Save preset"
                className="w-4 h-4"
              />
            )
          }
          title="Save Preset"
          description="Save verse and styling as preset"
          onClick={onSavePreset}
        />

        {/* Presentation Window */}
        <ActionRow
          icon={
            useIcons ? (
              <Monitor className="w-3.5 h-3.5" />
            ) : (
              <img
                src="./svgs/monitor.png"
                alt="Presentation"
                className="w-4 h-4"
              />
            )
          }
          title="Bible Presentation"
          description={isProjectionActive ? "Live on external display" : "Open presentation projector"}
          onClick={onOpenProjection}
          rightBadge={
            isProjectionActive ? (
              <span className="text-[0.58rem] font-extrabold px-1.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                LIVE
              </span>
            ) : null
          }
        />

        {/* Search */}
        <ActionRow
          icon={
            useIcons ? (
              <Search className="w-3.5 h-3.5" />
            ) : (
              <img
                src="./svgs/icons8-search.svg"
                alt="Search"
                className="w-4 h-4"
              />
            )
          }
          title="Search Scripture"
          description="Search keywords, phrases or books"
          onClick={onOpenSearch}
        />

        {/* Bookmarks list */}
        <ActionRow
          icon={
            useIcons ? (
              <Star className="w-3.5 h-3.5" />
            ) : (
              <img
                src="./svgs/icons8-favorites.svg"
                alt="Bookmarks"
                className="w-4 h-4"
              />
            )
          }
          title="Bookmarks Library"
          description="View all saved bookmarks"
          onClick={onOpenBookmarks}
          rightBadge={
            bookmarksCount > 0 ? (
              <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full bg-select-bg text-text-secondary border border-select-border/60">
                {bookmarksCount}
              </span>
            ) : null
          }
        />

        {/* Library */}
        <ActionRow
          icon={
            useIcons ? (
              <Library className="w-3.5 h-3.5" />
            ) : (
              <img
                src="./svgs/library.png"
                alt="Library"
                className="w-4 h-4"
              />
            )
          }
          title="Media Library"
          description="Browse backgrounds and assets"
          onClick={onOpenLibrary}
        />

        {/* Google AI Mode */}
        <ActionRow
          icon={<GoogleGIcon className="w-3.5 h-3.5" />}
          title="Google AI Mode"
          description="Theology and scripture insights"
          onClick={() => dispatchGoogleView("googleAI")}
          active={activeGoogleView === "googleAI"}
          rightBadge={
            activeGoogleView === "googleAI" ? (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            ) : null
          }
        />

        {/* Google Images */}
        <ActionRow
          icon={
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#4285F4" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#EA4335" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#34A853" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#FBBC05" />
            </svg>
          }
          title="Google Images"
          description="Search inspirational background art"
          onClick={() => dispatchGoogleView("googleImages")}
          active={activeGoogleView === "googleImages"}
          rightBadge={
            activeGoogleView === "googleImages" ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : null
          }
        />

        {/* Blank Screen (when projection active) */}
        {isProjectionActive && (
          <ActionRow
            icon={
              useIcons ? (
                isBlankScreenMode ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )
              ) : (
                <img
                  src="./svgs/blank.png"
                  alt="Blank"
                  className="w-4 h-4"
                />
              )
            }
            title={isBlankScreenMode ? "Restore Projection" : "Blank Projection"}
            description={isBlankScreenMode ? "Display active verse" : "Black out projector screen"}
            onClick={onToggleBlankScreen}
            active={isBlankScreenMode}
          />
        )}

        {/* Grayscale filter (when projection active) */}
        {isProjectionActive && (
          <ActionRow
            icon={
              useIcons ? (
                <Contrast className="w-3.5 h-3.5" />
              ) : (
                <img
                  src="./svgs/grayscale.png"
                  alt="Grayscale"
                  className="w-4 h-4"
                />
              )
            }
            title="Grayscale Filter"
            description="Toggle monochrome presentation"
            onClick={onToggleProjectionGrayscale}
          />
        )}
      </div>
    </BentoCard>
  );
};
