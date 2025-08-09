import React from "react";
import { FolderUp, Image, Maximize, Link, Unlink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setShareSettingsWithVerseByVerse,
  setShareFontSize,
  setShareFontFamily,
  setShareTextColor,
  setVerseByVerseFontSize,
  setVerseByVerseFontFamily,
  setVerseByVerseTextColor,
} from "@/store/slices/bibleSlice";

interface DisplaySettingsProps {
  customImagesPath: string;
  handleSelectImagesDirectory: () => void;
  bibleBgs: string[];
  imageBackgroundMode: boolean;
  handleBackgroundImageModeChange: (enabled: boolean) => void;
  isFullScreen: boolean;
  handleFullscreenModeChange: (
    enabled: boolean,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  loadBackgroundImages?: (forceReload?: boolean) => void;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  customImagesPath,
  handleSelectImagesDirectory,
  bibleBgs,
  imageBackgroundMode,
  handleBackgroundImageModeChange,
  isFullScreen,
  handleFullscreenModeChange,
  loadBackgroundImages,
}) => {
  const dispatch = useAppDispatch();
  const {
    shareSettingsWithVerseByVerse,
    shareFontSize,
    shareFontFamily,
    shareTextColor,
    verseByVerseFontSize,
    verseByVerseFontFamily,
    verseByVerseTextColor,
  } = useAppSelector((state) => state.bible);

  const projectionFontSizeOptions = [
    { value: 24, text: "Extra Small" },
    { value: 28, text: "Small" },
    { value: 32, text: "Base" },
    { value: 36, text: "Small+" },
    { value: 40, text: "Medium" },
    { value: 48, text: "Large" },
    { value: 50, text: "Default" },
  ];

  const projectionFontFamilyOptions = [
    { value: "Arial Black", text: "Arial Black" },
    { value: "EB Garamond", text: "EB Garamond" },
    { value: "Anton SC", text: "Anton SC" },
    { value: "Big Shoulders Thin", text: "Big Shoulders" },
    { value: "Bitter Thin", text: "Bitter" },
    { value: "Oswald ExtraLight", text: "Oswald" },
    { value: "Archivo Black", text: "Archivo Black" },
    { value: "Roboto Thin", text: "Roboto" },
    { value: "Cooper Black", text: "Cooper Black" },
    { value: "Impact", text: "Impact" },
    { value: "Teko Light", text: "Teko" },
    { value: "serif", text: "Times New Roman" },
    { value: "sans-serif", text: "Arial" },
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Horizontal Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Display Synchronization Card */}
        <div className="bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
              {shareSettingsWithVerseByVerse ? (
                <Link className="w-4 h-4 text-white" />
              ) : (
                <Unlink className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Display Synchronization
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Manage projection display sharing
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Main Sharing Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Share Settings with Verse-by-Verse
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {shareSettingsWithVerseByVerse
                    ? "Displays share settings"
                    : "Independent settings"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareSettingsWithVerseByVerse}
                  onChange={(e) =>
                    dispatch(setShareSettingsWithVerseByVerse(e.target.checked))
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                    shareSettingsWithVerseByVerse
                      ? "bg-[#906140]"
                      : "bg-gray-200/50 dark:bg-gray-700/50"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                      shareSettingsWithVerseByVerse
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>

            {/* Sub-toggles for specific settings */}
            {shareSettingsWithVerseByVerse && (
              <div className="pl-8 space-y-3 border-l-2 border-[#906140]/20">
                <div className="text-xs font-medium text-[#906140] dark:text-[#b87a5a] uppercase tracking-wide">
                  Synchronized Settings
                </div>

                {/* Share Font Size */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      Share Font Size
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Same font size for both displays
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareFontSize}
                      onChange={(e) =>
                        dispatch(setShareFontSize(e.target.checked))
                      }
                      className="sr-only peer"
                    />
                    <div
                      className={`w-8 h-5 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                        shareFontSize
                          ? "bg-[#906140]"
                          : "bg-gray-200/50 dark:bg-gray-700/50"
                      }`}
                    >
                      <div
                        className={`absolute top-[1px] left-[1px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-4 w-4 transition-all duration-200 ${
                          shareFontSize ? "translate-x-3" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Share Font Family */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      Share Font Family
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Same font family for both displays
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareFontFamily}
                      onChange={(e) =>
                        dispatch(setShareFontFamily(e.target.checked))
                      }
                      className="sr-only peer"
                    />
                    <div
                      className={`w-8 h-5 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                        shareFontFamily
                          ? "bg-[#906140]"
                          : "bg-gray-200/50 dark:bg-gray-700/50"
                      }`}
                    >
                      <div
                        className={`absolute top-[1px] left-[1px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-4 w-4 transition-all duration-200 ${
                          shareFontFamily ? "translate-x-3" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Share Text Color */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      Share Text Color
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Same text color for both displays
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareTextColor}
                      onChange={(e) =>
                        dispatch(setShareTextColor(e.target.checked))
                      }
                      className="sr-only peer"
                    />
                    <div
                      className={`w-8 h-5 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                        shareTextColor
                          ? "bg-[#906140]"
                          : "bg-gray-200/50 dark:bg-gray-700/50"
                      }`}
                    >
                      <div
                        className={`absolute top-[1px] left-[1px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-4 w-4 transition-all duration-200 ${
                          shareTextColor ? "translate-x-3" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Independent Projection Settings */}
            {!shareSettingsWithVerseByVerse && (
              <div className="pl-8 space-y-3 border-l-2 border-[#906140]/20">
                <div className="text-xs font-medium text-[#906140] dark:text-[#b87a5a] uppercase tracking-wide">
                  Independent Projection Settings
                </div>

                {/* Projection Font Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      Projection Font Size
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {verseByVerseFontSize}px
                    </span>
                  </div>
                  <select
                    value={verseByVerseFontSize}
                    onChange={(e) =>
                      dispatch(
                        setVerseByVerseFontSize(parseInt(e.target.value))
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-white/80 dark:bg-black/40 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#906140]/30"
                  >
                    {projectionFontSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.text} ({option.value}px)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Projection Font Family */}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-2">
                    Projection Font Family
                  </div>
                  <select
                    value={verseByVerseFontFamily}
                    onChange={(e) =>
                      dispatch(setVerseByVerseFontFamily(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-white/80 dark:bg-black/40 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#906140]/30"
                  >
                    {projectionFontFamilyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Projection Text Color */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      Projection Text Color
                    </div>
                    <div
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: verseByVerseTextColor }}
                    />
                  </div>
                  <input
                    type="color"
                    value={verseByVerseTextColor}
                    onChange={(e) =>
                      dispatch(setVerseByVerseTextColor(e.target.value))
                    }
                    className="w-full h-8 rounded-lg border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Display Configuration Card */}
        <div className="bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
              <Image className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Display Configuration
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Backgrounds and display modes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Background Images Folder */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
                  <FolderUp className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                    Background Images Folder
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Choose folder with images
                  </p>
                </div>
              </div>
              <button
                onClick={handleSelectImagesDirectory}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#906140] to-[#7d5439] text-white rounded-lg hover:from-[#7d5439] hover:to-[#6b4931] transition-all duration-200 text-xs"
              >
                <FolderUp className="w-3 h-3" />
                {customImagesPath ? "Change" : "Select"}
              </button>
            </div>
            {customImagesPath && (
              <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-700 dark:text-green-300 truncate font-mono">
                      📁 {customImagesPath}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {bibleBgs.length} images loaded
                    </p>
                  </div>
                  {loadBackgroundImages && (
                    <button
                      onClick={() => loadBackgroundImages(true)}
                      className="px-2 py-1 bg-green-600 dark:bg-green-500 text-white rounded text-xs hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                    >
                      Refresh
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Background Image Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
                  <Image className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                    Background Images
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {imageBackgroundMode ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={imageBackgroundMode}
                  onChange={(e) =>
                    handleBackgroundImageModeChange(e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                    imageBackgroundMode
                      ? "bg-[#906140]"
                      : "bg-gray-200/50 dark:bg-gray-700/50"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                      imageBackgroundMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>

            {/* Fullscreen Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center">
                  <Maximize className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                    Fullscreen Mode
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isFullScreen ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFullScreen}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newValue = e.target.checked;
                    handleFullscreenModeChange(newValue, e);
                  }}
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 relative transition-all duration-200 ${
                    isFullScreen
                      ? "bg-[#906140]"
                      : "bg-gray-200/50 dark:bg-gray-700/50"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                      isFullScreen ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
