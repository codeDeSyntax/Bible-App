import React from "react";
import { BentoCard } from "./BentoCard";
import {
  Bookmark,
  Save,
  Monitor,
  Search,
  Library,
  BookMarked,
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
  isBookmarked: boolean;
  bookmarksCount: number;
  isProjectionActive: boolean;
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
  isBookmarked,
  bookmarksCount,
  isProjectionActive,
}) => {
  const actionButtonClass = `cursor-pointer rounded-xl transition-all duration-200 flex flex-row items-center justify-center gap-2 ${
    isDarkMode
      ? "bg-gray-800/50 hover:bg-gray-700/50"
      : "bg-gray-100/50 hover:bg-gray-200/50"
  }`;

  return (
    <BentoCard
      title="Quick Actions"
      isDarkMode={isDarkMode}
      icon={<BookMarked className="w-4 h-4 text-white" />}
      className="col-span-1 row-span-3"
    >
      <div
        className="grid grid-cols-2 gap-2 h-full"
        style={{ gridAutoRows: "minmax(0, 1fr)" }}
      >
        {/* Bookmark Current Verse */}
        <Tooltip title="Bookmark current verse" placement="top">
          <div
            onClick={onBookmark}
            className={actionButtonClass}
            style={{
              background: isDarkMode
                ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
            }}
          >
            <Bookmark
              size={18}
              fill={isBookmarked ? "currentColor" : "none"}
              className="text-gray-600 dark:text-gray-400"
            />
            <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Bookmark
            </span>
          </div>
        </Tooltip>

        {/* Save as Preset */}
        <Tooltip title="Save current verse as preset" placement="top">
          <div
            onClick={onSavePreset}
            className={actionButtonClass}
            style={{
              background: isDarkMode
                ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
            }}
          >
            <Save size={18} className="text-gray-600 dark:text-gray-400" />
            <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Save Preset
            </span>
          </div>
        </Tooltip>

        {/* Open Projection */}
        <Tooltip title="Open Bible presentation" placement="top">
          <div
            onClick={onOpenProjection}
            className={actionButtonClass}
            style={{
              background: isDarkMode
                ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
            }}
          >
            <div className="relative">
              <Monitor size={18} className="text-gray-600 dark:text-gray-400" />
              {isProjectionActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Project
            </span>
          </div>
        </Tooltip>

        {/* Search */}
        <Tooltip title="Search Bible" placement="top">
          <div
            onClick={onOpenSearch}
            className={actionButtonClass}
            style={{
              background: isDarkMode
                ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
            }}
          >
            <Search size={18} className="text-gray-600 dark:text-gray-400" />
            <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Search
            </span>
          </div>
        </Tooltip>

        {/* Bookmarks List */}
        <Tooltip title="View all bookmarks" placement="top">
          <div
            onClick={onOpenBookmarks}
            className={actionButtonClass}
            style={{
              background: isDarkMode
                ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
            }}
          >
            <div className="relative">
              <Bookmark
                size={18}
                className="text-gray-600 dark:text-gray-400"
              />
              {bookmarksCount > 0 && (
                <div className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-medium">
                  {bookmarksCount > 99 ? "99+" : bookmarksCount}
                </div>
              )}
            </div>
            <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Bookmarks
            </span>
          </div>
        </Tooltip>

        {/* Library */}
        <Tooltip title="Open library" placement="top">
          <div
            onClick={onOpenLibrary}
            className={actionButtonClass}
            style={{
              background: isDarkMode
                ? "linear-gradient(145deg, #3a3a3a, #1f1f1f)"
                : "linear-gradient(145deg, #f0f0f0, #f5f5f5)",
              boxShadow: isDarkMode
                ? "inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.08)"
                : "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
            }}
          >
            <Library size={18} className="text-gray-600 dark:text-gray-400" />
            <span className="text-[14px] text-gray-600 dark:text-gray-400">
              Library
            </span>
          </div>
        </Tooltip>
      </div>
    </BentoCard>
  );
};
