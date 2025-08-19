import React, { useState, useEffect, useRef } from "react";
import {
  FolderUp,
  Image,
  Maximize,
  Link,
  Unlink,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setShareSettingsWithVerseByVerse,
  setShareFontSize,
  setShareFontFamily,
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
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Local state to ensure UI updates properly
  const [localFullScreenState, setLocalFullScreenState] =
    useState(isFullScreen);

  // Debug: Track isFullScreen prop changes
  useEffect(() => {
    console.log(
      "🎯 [DisplaySettings] isFullScreen prop changed to:",
      isFullScreen
    );
    setLocalFullScreenState(isFullScreen);
  }, [isFullScreen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFontFamilyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    shareSettingsWithVerseByVerse,
    shareFontSize,
    shareFontFamily,
    verseByVerseFontSize,
    verseByVerseFontFamily,
    verseByVerseTextColor,
  } = useAppSelector((state) => state.bible);

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
    <div className="space-y-4 w-full z-50">
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
                  Share Settings with Extended Screen
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {shareSettingsWithVerseByVerse
                    ? "Both displays use typography settings"
                    : "Verse-by-verse uses display settings, Bible uses typography"}
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
                <div className="flex items-center justify-between opacity-50">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      Share Text Color
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Feature disabled - colors managed independently
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled={true}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 relative transition-all duration-200">
                      <div className="absolute top-[1px] left-[1px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-4 w-4 transition-all duration-200" />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Independent Projection Settings */}
            {!shareSettingsWithVerseByVerse && (
              <div
                ref={dropdownRef}
                className="pl-8 space-y-3 border-l-2 border-[#906140]/20"
              >
                <div className="text-xs font-medium text-[#906140] dark:text-[#b87a5a] uppercase tracking-wide">
                  Independent Projection Settings
                </div>

                {/* Projection Font Size */}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-2">
                    Font Size: {verseByVerseFontSize}px
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() =>
                        dispatch(
                          setVerseByVerseFontSize(
                            Math.max(24, verseByVerseFontSize - 2)
                          )
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-white/60 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
                    >
                      −
                    </div>

                    <div className="flex-1">
                      <input
                        type="range"
                        min="24"
                        max="120"
                        value={verseByVerseFontSize}
                        onChange={(e) =>
                          dispatch(
                            setVerseByVerseFontSize(Number(e.target.value))
                          )
                        }
                        className="w-full h-2 bg-gray-200 dark:bg-[#906140] rounded-lg appearance-none cursor-pointer 
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                 [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#906140] [&::-webkit-slider-thumb]:to-[#7d5439] 
                                 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                                 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-0"
                      />
                    </div>

                    <div
                      onClick={() =>
                        dispatch(
                          setVerseByVerseFontSize(
                            Math.min(120, verseByVerseFontSize + 2)
                          )
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#906140] to-[#7d5439] text-white hover:from-[#7d5439] hover:to-[#6b4931] transition-all duration-200 font-bold text-sm shadow-md cursor-pointer flex items-center justify-center"
                    >
                      +
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>24px</span>
                    <span>72px</span>
                    <span>120px</span>
                  </div>
                </div>

                {/* Projection Font Family */}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-2">
                    Projection Font Family
                  </div>

                  {/* Custom Font Family Dropdown */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setShowFontFamilyDropdown(!showFontFamilyDropdown);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white/80 dark:bg-black/40 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#906140]/30 text-gray-900 dark:text-gray-100 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-black/60 transition-colors"
                    >
                      <span style={{ fontFamily: verseByVerseFontFamily }}>
                        {projectionFontFamilyOptions.find(
                          (opt) => opt.value === verseByVerseFontFamily
                        )?.text || "Arial Black"}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 text-gray-500 transition-transform ${
                          showFontFamilyDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {showFontFamilyDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1f1c1a] border border-gray-200/50 dark:border-[#906140]/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto no-scrollbar">
                        {projectionFontFamilyOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              dispatch(setVerseByVerseFontFamily(option.value));
                              setShowFontFamilyDropdown(false);
                            }}
                            className={`w-full px-3  text-xs text-left hover:bg-[#906140]/10 dark:hover:bg-[#906140]/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-700/30 last:border-b-0 first:rounded-t-lg last:rounded-b-lg ${
                              verseByVerseFontFamily === option.value
                                ? "bg-[#906140]/20 dark:bg-[#906140]/30 text-[#906140] dark:text-[#b87a5a] font-medium"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                            style={{ fontFamily: option.value }}
                          >
                            <div className="font-medium mb-1">
                              {option.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Projection Text Color */}
                <div className="opacity-50">
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
                    disabled={true}
                    className="w-full h-8 rounded-lg border border-gray-200/50 dark:border-gray-700/50 cursor-not-allowed opacity-50"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Text colors are managed independently
                  </p>
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
                    {localFullScreenState ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="fullscreen-checkbox"
                  type="checkbox"
                  checked={localFullScreenState}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newValue = e.target.checked;
                    console.log("🎯 [DisplaySettings] Toggle clicked:", {
                      checked: e.target.checked,
                      newValue,
                      currentIsFullScreen: isFullScreen,
                      localFullScreenState,
                    });
                    // Update local state immediately for instant visual feedback
                    setLocalFullScreenState(newValue);
                    // Then update Redux state
                    handleFullscreenModeChange(newValue, e);
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-6 rounded-full relative transition-all duration-300 ${
                    localFullScreenState
                      ? "bg-[#906140]"
                      : "bg-gray-200/50 dark:bg-gray-700/50"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-transform duration-300 ease-in-out ${
                      localFullScreenState
                        ? "transform translate-x-4"
                        : "transform translate-x-0"
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

export default DisplaySettings;
