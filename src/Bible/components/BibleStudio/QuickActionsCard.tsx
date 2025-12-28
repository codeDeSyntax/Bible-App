import React from "react";
import { BentoCard } from "./BentoCard";
import {
  Bookmark,
  Save,
  Monitor,
  Search,
  Library,
  BookMarked,
  BookOpen,
  Users,
  Settings,
} from "lucide-react";
import { Tooltip } from "antd";

interface QuickActionsCardProps {
  isDarkMode: boolean;
  onBookmark: () => void;
  onSavePreset: () => void;
  onOpenProjection: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenLibrary: () => void;
  onToggleViewMode: () => void;
  onOpenControlRoom: () => void;
  onToggleBlankScreen: () => void;
  isBookmarked: boolean;
  bookmarksCount: number;
  isProjectionActive: boolean;
  isBlankScreenMode: boolean;
  verseByVerseMode: boolean;
}

/**
 * Card 3: Quick Actions
 * Fast access to common Bible study actions
 */
export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  isDarkMode,
  onBookmark,
  onSavePreset,
  onOpenProjection,
  onOpenSearch,
  onOpenBookmarks,
  onOpenLibrary,
  onToggleViewMode,
  onOpenControlRoom,
  onToggleBlankScreen,
  isBookmarked,
  bookmarksCount,
  isProjectionActive,
  isBlankScreenMode,
  verseByVerseMode,
}) => {
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
      className="col-span-1 row-span-3"
    >
      <div
        className="grid grid-cols-4 gap-2 "
        // style={{ gridAutoRows: "minmax(0, 1fr)" }}
      >
        {/* Bookmark Current Verse */}
        <Tooltip title="Bookmark current verse" placement="top">
          <div
            className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
            onClick={onBookmark}
          >
            <img
              src="./svgs/icons8-add-bookmark.svg"
              alt="Bookmark"
              className="w-10 h-10 cursor-pointer"
            />
            {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Bookmark
            </span> */}
          </div>
        </Tooltip>

        {/* Save as Preset */}
        <Tooltip title="Save current verse as preset" placement="top">
          <div
            className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
            onClick={onSavePreset}
          >
            <img
              src="./svgs/savepreset.png"
              alt="Save"
              className="w-10 h-10 cursor-pointer"
            />
            {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Save Preset
            </span> */}
          </div>
        </Tooltip>

        {/* Open Projection */}
        <Tooltip title="Open Bible presentation" placement="top">
          <div
            className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
            onClick={onOpenProjection}
          >
            <div className="relative">
              <img
                src="./svgs/monitor.png"
                alt="Monitor"
                className="w-10 h-10 cursor-pointer"
              />
              {isProjectionActive && (
                <div
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#ef4444" }}
                />
              )}
            </div>
            {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Project
            </span> */}
          </div>
        </Tooltip>

        {/* Search */}
        <Tooltip title="Search Bible" placement="top">
          <div
            className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
            onClick={onOpenSearch}
          >
            <img
              src="./svgs/icons8-search.svg"
              alt="Search"
              className="w-10 h-10 cursor-pointer"
            />
            {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Search
            </span> */}
          </div>
        </Tooltip>

        {/* Bookmarks List */}
        <Tooltip title="View all bookmarks" placement="top">
          <div
            className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
            onClick={onOpenBookmarks}
          >
            <div className="relative">
              <img
                src="./svgs/icons8-favorites.svg"
                alt="Bookmarks"
                className="w-10 h-10 cursor-pointer"
              />
              {bookmarksCount > 0 && (
                <div
                  className="absolute -top-2 -right-2 min-w-[16px] h-[16px] text-white text-[8px] rounded-full flex items-center justify-center font-medium"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  {bookmarksCount > 99 ? "99+" : bookmarksCount}
                </div>
              )}
            </div>
            {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Bookmarks
            </span> */}
          </div>
        </Tooltip>

        {/* Library */}
        <Tooltip title="Open library" placement="top">
          <div
            className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
            onClick={onOpenLibrary}
          >
            <img
              src="./svgs/library.png"
              alt="Library"
              className="w-10 h-10 cursor-pointer"
            />
            {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Library
            </span> */}
          </div>
        </Tooltip>

        {/* View Mode Toggle */}
        <Tooltip
          title={
            verseByVerseMode
              ? "Switch to Reader Mode"
              : "Switch to Audience Mode"
          }
          placement="top"
        >
          <div
            className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
            onClick={onToggleViewMode}
          >
            {verseByVerseMode ? (
              <img
                src="./svgs/user.png"
                alt="Reader Mode"
                className="w-10 h-10 cursor-pointer"
              />
            ) : (
              <img src="./svgs/users.png" alt="Users" className="w-5 h-5" />
            )}
            {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
              {verseByVerseMode ? "Reader" : "Audience"}
            </span> */}
          </div>
        </Tooltip>

        {/* Control Room (Ctrl+S) - Only in verse-by-verse mode */}
        {verseByVerseMode && (
          <Tooltip title="Projection Control Room (Ctrl+S)" placement="top">
            <div
              className="h-12 w-12 bg-card-bg-alt flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt"
              onClick={onOpenControlRoom}
            >
              <img
                src="./svgs/icons8-settings.svg"
                alt="Settings"
                className="w-10 h-10 cursor-pointer"
              />
              {/* <span className="text-[14px] text-gray-600 dark:text-gray-400">
                Control
              </span> */}
            </div>
          </Tooltip>
        )}

        {/* Blank Screen - Only show when projection is active */}
        {isProjectionActive && (
          <Tooltip
            title={
              isBlankScreenMode
                ? "Show presentation"
                : "Hide presentation (Blank Screen)"
            }
            placement="top"
          >
            <div
              className={`h-12 w-12 flex items-center justify-center rounded-lg shadow dark:shadow-black shadow-card-bg-alt transition-all ${
                isBlankScreenMode
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-card-bg-alt hover:bg-select-hover"
              }`}
              onClick={onToggleBlankScreen}
            >
              <img
                src="./svgs/blank.png"
                alt={isBlankScreenMode ? "Show" : "Blank"}
                className={`w-8 h-8 cursor-pointer ${
                  isBlankScreenMode ? "opacity-100" : "opacity-70"
                }`}
              />
            </div>
          </Tooltip>
        )}
      </div>
    </BentoCard>
  );
};
