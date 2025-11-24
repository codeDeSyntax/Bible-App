import React, { useState, useEffect, useRef } from "react";
import { Link, Unlink, ChevronDown, Globe, Monitor, Tv } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setShareSettingsWithVerseByVerse,
  setShareFontSize,
  setShareFontFamily,
  setVerseByVerseFontSize,
  setVerseByVerseFontFamily,
  setVerseByVerseTextColor,
  setVerseByVerseAutoSize,
} from "@/store/slices/bibleSlice";

interface DisplaySettingsProps {
  highlightJesusWords: boolean;
  showScriptureReference: boolean;
  scriptureReferenceColor: string;
  handleJesusWordsToggle: () => void;
  handleScriptureReferenceToggle: () => void;
  handleScriptureReferenceColorChange: (color: string) => void;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  highlightJesusWords,
  showScriptureReference,
  scriptureReferenceColor,
  handleJesusWordsToggle,
  handleScriptureReferenceToggle,
  handleScriptureReferenceColorChange,
}) => {
  const dispatch = useAppDispatch();
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Display selection state
  const [displays, setDisplays] = useState<any[]>([]);
  const [selectedDisplayId, setSelectedDisplayId] = useState<number | null>(
    null
  );
  const [primaryDisplayId, setPrimaryDisplayId] = useState<number | null>(null);
  const [loadingDisplays, setLoadingDisplays] = useState(false);

  // Load available displays
  useEffect(() => {
    loadDisplays();
  }, []);

  const loadDisplays = async () => {
    setLoadingDisplays(true);
    try {
      const result = await window.api.getAllDisplays();
      if (result.success && result.displays) {
        setDisplays(result.displays);
        setPrimaryDisplayId(result.primaryDisplayId || null);
        setSelectedDisplayId(result.preferredDisplayId || null);
      }
    } catch (error) {
      console.error("Failed to load displays:", error);
    } finally {
      setLoadingDisplays(false);
    }
  };

  const handleDisplayChange = async (displayId: number) => {
    try {
      const result = await window.api.setProjectionDisplay(displayId);
      if (result.success) {
        setSelectedDisplayId(displayId);
        console.log("✅ Projection display set to:", displayId);
      }
    } catch (error) {
      console.error("Failed to set projection display:", error);
    }
  };

  // Get user-friendly display label
  const getDisplayLabel = (display: any, index: number) => {
    // First display in the list (index 0) = "My PC"
    if (index === 0) {
      return "My PC";
    }

    // All other displays numbered starting from Display 2
    return `Display ${index + 1}`;
  };

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
    verseByVerseAutoSize,
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center shadow-md">
              {shareSettingsWithVerseByVerse ? (
                <Link className="w-4 h-4 text-white" />
              ) : (
                <Unlink className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Display Synchronization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage projection display sharing
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Main Sharing Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-base">
                  Share Settings with Extended Screen
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                    shareSettingsWithVerseByVerse
                      ? "bg-[#313131]"
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
              <div className="pl-8 space-y-3 border-l-2 border-[#313131]/20">
                <div className="text-sm font-medium text-[#313131] dark:text-[#b87a5a] uppercase tracking-wide">
                  Synchronized Settings
                </div>

                {/* Share Font Size */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      Share Font Size
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                      className={`w-8 h-5 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                        shareFontSize
                          ? "bg-[#313131]"
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
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      Share Font Family
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                      className={`w-8 h-5 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                        shareFontFamily
                          ? "bg-[#313131]"
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
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      Share Text Color
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                className="pl-8 space-y-3 border-l-2 border-[#313131]/20"
              >
                <div className="text-sm font-medium text-[#313131] dark:text-[#b87a5a] uppercase tracking-wide">
                  Independent Projection Settings
                </div>

                {/* Auto-Size Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      Auto-Size Text
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {verseByVerseAutoSize
                        ? "Text automatically fits container"
                        : "Manual font size control"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verseByVerseAutoSize}
                      onChange={(e) =>
                        dispatch(setVerseByVerseAutoSize(e.target.checked))
                      }
                      className="sr-only peer"
                    />
                    <div
                      className={`w-8 h-5 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                        verseByVerseAutoSize
                          ? "bg-[#313131]"
                          : "bg-gray-200/50 dark:bg-gray-700/50"
                      }`}
                    >
                      <div
                        className={`absolute top-[1px] left-[1px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-4 w-4 transition-all duration-200 ${
                          verseByVerseAutoSize
                            ? "translate-x-3"
                            : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Projection Font Size - Only show when auto-size is OFF */}
                {!verseByVerseAutoSize && (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                      Font Size: {verseByVerseFontSize}px
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() =>
                          dispatch(
                            setVerseByVerseFontSize(
                              Math.max(50, verseByVerseFontSize - 2)
                            )
                          )
                        }
                        className="w-8 h-8 rounded-xl bg-white/60 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200 font-bold text-base shadow-md cursor-pointer flex items-center justify-center"
                      >
                        −
                      </div>

                      <div className="flex-1">
                        <input
                          type="range"
                          min="50"
                          max="90"
                          value={verseByVerseFontSize}
                          onChange={(e) =>
                            dispatch(
                              setVerseByVerseFontSize(Number(e.target.value))
                            )
                          }
                          className="w-full h-2 bg-gray-200 dark:bg-[#313131] rounded-lg appearance-none cursor-pointer 
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                 [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#313131] [&::-webkit-slider-thumb]:to-[#303030] 
                                 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                                 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-0"
                        />
                      </div>

                      <div
                        onClick={() =>
                          dispatch(
                            setVerseByVerseFontSize(
                              Math.min(90, verseByVerseFontSize + 2)
                            )
                          )
                        }
                        className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#313131] to-[#303030] text-white hover:from-[#303030] hover:to-[#6b4931] transition-all duration-200 font-bold text-base shadow-md cursor-pointer flex items-center justify-center"
                      >
                        +
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span>50px</span>
                      <span>65px</span>
                      <span>90px</span>
                    </div>
                  </div>
                )}

                {/* Projection Font Family */}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                    Projection Font Family
                  </div>

                  {/* Custom Font Family Dropdown */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setShowFontFamilyDropdown(!showFontFamilyDropdown);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white/80 dark:bg-black/40 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#313131]/30 text-gray-900 dark:text-gray-100 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-black/60 transition-colors"
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
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1f1c1a] border border-gray-200/50 dark:border-[#313131]/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto no-scrollbar">
                        {projectionFontFamilyOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              dispatch(setVerseByVerseFontFamily(option.value));
                              setShowFontFamilyDropdown(false);
                            }}
                            className={`w-full px-3  text-sm text-left hover:bg-[#313131]/10 dark:hover:bg-[#313131]/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-700/30 last:border-b-0 first:rounded-t-lg last:rounded-b-lg ${
                              verseByVerseFontFamily === option.value
                                ? "bg-[#313131]/20 dark:bg-[#313131]/30 text-[#313131] dark:text-[#b87a5a] font-medium"
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
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center shadow-md">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Display Configuration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scripture display preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Highlight Jesus Words */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Highlight Jesus Words
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {highlightJesusWords
                    ? "Jesus' words shown in red"
                    : "Standard text color"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightJesusWords}
                  onChange={handleJesusWordsToggle}
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                    highlightJesusWords
                      ? "bg-[#313131]"
                      : "bg-gray-200/50 dark:bg-gray-700/50"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                      highlightJesusWords ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>

            {/* Scripture Reference Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Show Scripture Reference
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {showScriptureReference
                    ? "Reference displayed at bottom"
                    : "Reference hidden"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showScriptureReference}
                  onChange={handleScriptureReferenceToggle}
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                    showScriptureReference
                      ? "bg-[#313131]"
                      : "bg-gray-200/50 dark:bg-gray-700/50"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                      showScriptureReference ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>

            {/* Scripture Reference Color Picker */}
            {showScriptureReference && (
              <div className="pl-8 space-y-2 border-l-2 border-[#313131]/20">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Reference Color
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { name: "Red", color: "#ef4444" },
                    { name: "Orange", color: "#f97316" },
                    { name: "Yellow", color: "#eab308" },
                    { name: "Green", color: "#22c55e" },
                    { name: "Blue", color: "#3b82f6" },
                    { name: "Purple", color: "#a855f7" },
                    { name: "Pink", color: "#ec4899" },
                    { name: "White", color: "#ffffff" },
                    { name: "Gray", color: "#9ca3af" },
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() =>
                        handleScriptureReferenceColorChange(preset.color)
                      }
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                        scriptureReferenceColor === preset.color
                          ? "border-[#313131] dark:border-white scale-110 shadow-lg"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="bg-gray-100 dark:bg-stone-800 rounded-lg p-3 text-center">
                  <span
                    className="text-base font-bold"
                    style={{ color: scriptureReferenceColor }}
                  >
                    John 3:16
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projection Display Selection Card */}
      <div className="bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#313131] to-[#303030] flex items-center justify-center shadow-md">
            <Tv className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              Projection Display Selection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose which display shows projections
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {loadingDisplays ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading displays...
              </p>
            </div>
          ) : displays.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No displays detected
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {displays.map((display, index) => (
                <div
                  key={display.id}
                  onClick={() => handleDisplayChange(display.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    selectedDisplayId === display.id
                      ? "border-[#313131] dark:border-[#b8835a] bg-[#313131]/5 dark:bg-[#b8835a]/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor
                        className={`w-4 h-4 ${
                          selectedDisplayId === display.id
                            ? "text-[#313131] dark:text-[#b8835a]"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {getDisplayLabel(display, index)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {display.resolution}
                          {display.isPrimary && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
                              Windows Primary
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {selectedDisplayId === display.id && (
                      <div className="w-5 h-5 rounded-full bg-[#313131] dark:bg-[#b8835a] flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Select the display where you want the
              <strong> audience</strong> to see Bible verses and presets
              (projection screen). This is usually an external monitor or
              projector, not your controller display.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;
