import React, { useState, useEffect } from "react";
import {
  X,
  Type,
  Weight,
  PaintBucket,
  TextQuote,
  BookOpen,
  Image,
  Maximize,
  FolderUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveFeature,
  setFontSize,
  setFontWeight,
  setFontFamily,
  setVerseTextColor,
  setVerseByVerseMode,
  setImageBackgroundMode,
  setFullScreen,
  setSelectedBackground,
} from "@/store/slices/bibleSlice";
import { setBibleBgs } from "@/store/slices/appSlice";
import { CustomSelect } from "@/shared/Selector";
import { useTheme } from "@/Provider/Theme";

const SettingsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const verseByVerseMode = useAppSelector(
    (state) => state.bible.verseByVerseMode
  );
  const imageBackgroundMode = useAppSelector(
    (state) => state.bible.imageBackgroundMode
  );
  const isFullScreen = useAppSelector((state) => state.bible.isFullScreen);
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
  const selectedBackground = useAppSelector(
    (state) => state.bible.selectedBackground
  );

  // New state for custom images path
  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("bibleCustomImagesPath") || ""
  );

  // Load custom images when path changes
  useEffect(() => {
    const loadCustomImages = async () => {
      if (customImagesPath) {
        try {
          const customImages = await window.api.getImages(customImagesPath);
          // Combine default backgrounds with custom images
          const allBackgrounds = [...bibleBgs];
          customImages.forEach((img: string) => {
            if (!allBackgrounds.includes(img)) {
              allBackgrounds.push(img);
            }
          });
          dispatch(setBibleBgs(allBackgrounds));
        } catch (error) {
          console.error("Failed to load custom images:", error);
        }
      }
    };

    loadCustomImages();
  }, [customImagesPath, dispatch]);

  const handleSelectImagesDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === "string" && result) {
        setCustomImagesPath(result);
        localStorage.setItem("bibleCustomImagesPath", result);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  if (activeFeature !== "settings") return null;

  const fontWeights = [
    { value: "normal", text: "Normal" },
    { value: "medium", text: "Medium" },
    { value: "semibold", text: "Semi Bold" },
    { value: "bold", text: "Bold" },
    { value: "bolder", text: "Extra Bold" },
    
  ];

  const fontFamilies = [
       { value: "'Helvetica', sans-serif", text: "Helvetica" },
       { value: "'Arial Black', sans-serif", text: "Arial" },
    { value: "'Courier New', Courier, monospace", text: "Courier New" },
    { value: "'Verdana', sans-serif", text: "Verdana" },
    { value: "'Impact', Charcoal, sans-serif", text: "Impact" },
    { value: "'Georgia', serif", text: "Georgia" },
    { value: "serif", text: "Serif" },
    { value: "sans-serif", text: "Sans-serif" },
    { value: "Palatino", text: "Palatino" },
    { value: "garamond", text: "Garamond" },
    { value: "Bookman", text: "Bookman" },
    { value: "Comic Sans MS", text: "Comic Sans MS" },
    { value: "Trebuchet MS", text: "Trebuchet MS" },
    { value: "cursive", text: "cursive" },
  ];

  const colors = [
    { value: "#1d1c1c", text: "Black" },
    { value: "#4a5568", text: "Gray" },
    { value: "#2d3748", text: "Dark Gray" },
    { value: "#fcd8c0", text: "Light Orange" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0, 0, 0, 0.4)" }}
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-center flex-shrink-0">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shadow-lg"
              style={{
                background: "linear-gradient(135deg, #906140 0%, #7a5236 100%)",
                boxShadow: "0 4px 12px rgba(144, 97, 64, 0.3)",
              }}
            >
              <Type size={16} className="text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Reading Settings
            </h2>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 hover:bg-white/10 group"
            >
              <X
                size={14}
                className="text-white/70 group-hover:text-white transition-colors"
              />
            </button>
          </div>
        </div>

        {/* Three Glass Cards Container */}
        <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 flex-1 min-h-0">
          {/* Typography Card */}
          <div className="bg-white/50 dark:bg-stone-900 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden glass-card min-h-[400px] max-h-[500px]">
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7a5236] flex items-center justify-center shadow-lg">
                  <Type size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Typography
                </h3>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto glass-scroll">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Font Size
                    </label>
                    <div
                      className="px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm"
                      style={{
                        backgroundColor: "rgba(144, 97, 64, 0.15)",
                        color: "#906140",
                        border: "1px solid rgba(144, 97, 64, 0.2)",
                      }}
                    >
                      {fontSize}px
                    </div>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={parseInt(fontSize)}
                    onChange={(e) => dispatch(setFontSize(e.target.value))}
                    className="w-full h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg appearance-none cursor-pointer slider-thumb backdrop-blur-sm"
                    style={{
                      background: isDarkMode
                        ? `linear-gradient(90deg, #906140 0%, #7a5236 ${
                            ((parseInt(fontSize) - 2) / (10 - 2)) * 100
                          }%, rgba(75, 85, 99, 0.5) ${
                            ((parseInt(fontSize) - 2) / (10 - 2)) * 100
                          }%, rgba(75, 85, 99, 0.5) 100%)`
                        : `linear-gradient(90deg, #906140 0%, #7a5236 ${
                            ((parseInt(fontSize) - 2) / (10 - 2)) * 100
                          }%, rgba(229, 231, 235, 0.5) ${
                            ((parseInt(fontSize) - 2) / (10 - 2)) * 100
                          }%, rgba(229, 231, 235, 0.5) 100%)`,
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Font Weight
                  </label>
                  <CustomSelect
                    value={fontWeight}
                    onChange={(value) => dispatch(setFontWeight(value))}
                    options={fontWeights}
                    className="bg-white/20 dark:bg-black/30 border-white/30 dark:border-white/20 text-gray-900 dark:text-white text-sm backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Font Family
                  </label>
                  <CustomSelect
                    value={fontFamily}
                    onChange={(value) => dispatch(setFontFamily(value))}
                    options={fontFamilies}
                    className="bg-white/20 dark:bg-black/30 border-white/30 dark:border-white/20 text-gray-900 dark:text-white text-sm backdrop-blur-sm"
                  />
                </div>

                {/* <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Text Color
                  </label>
                  <CustomSelect
                    value={verseTextColor}
                    onChange={(value) => dispatch(setVerseTextColor(value))}
                    options={colors}
                    className="bg-white/20 dark:bg-black/30 border-white/30 dark:border-white/20 text-gray-900 dark:text-white text-sm backdrop-blur-sm"
                  />
                </div> */}
              </div>
            </div>
          </div>

          {/* Display Mode Card */}
          <div className="bg-white/50 dark:bg-stone-900 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden glass-card min-h-[400px] max-h-[500px]">
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7a5236] flex items-center justify-center shadow-lg">
                  <BookOpen size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Display Mode
                </h3>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto glass-scroll">
                <div className="p-3 sm:p-4 bg-white/10 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        Verse by Verse
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        One verse at a time
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verseByVerseMode}
                        onChange={(e) => {
                          dispatch(setVerseByVerseMode(e.target.checked));
                          if (!e.target.checked) {
                            dispatch(setImageBackgroundMode(false));
                            dispatch(setSelectedBackground(null));
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 rounded-full peer dark:bg-gray-700/50 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#906140] backdrop-blur-sm"></div>
                    </label>
                  </div>
                </div>

                {verseByVerseMode && (
                  <div className="space-y-3 pl-4 border-l-2 border-[#906140]/30">
                    <div className="p-3 sm:p-4 bg-white/10 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            Background Images
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Custom backgrounds
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={imageBackgroundMode}
                            onChange={(e) => {
                              dispatch(
                                setImageBackgroundMode(e.target.checked)
                              );
                              if (!e.target.checked) {
                                dispatch(setSelectedBackground(null));
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-200/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 rounded-full peer dark:bg-gray-700/50 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#906140] backdrop-blur-sm"></div>
                        </label>
                      </div>
                    </div>

                    {imageBackgroundMode && (
                      <div className="p-3 sm:p-4 bg-white/10 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              Custom Images
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Add your own folder
                            </p>
                          </div>
                          <button
                            onClick={handleSelectImagesDirectory}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#906140] text-white rounded-lg hover:bg-[#7a5236] transition-all duration-200 text-xs shadow-lg backdrop-blur-sm"
                          >
                            <FolderUp className="w-3 h-3" />
                            Select
                          </button>
                        </div>
                        {customImagesPath && (
                          <div className="px-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg backdrop-blur-sm">
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {customImagesPath}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 sm:p-4 bg-white/10 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        Fullscreen Mode
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Immersive reading
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFullScreen}
                        onChange={(e) =>
                          dispatch(setFullScreen(e.target.checked))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#906140]/50 rounded-full peer dark:bg-gray-700/50 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#906140] backdrop-blur-sm"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Images Card */}
          <div
            className={`bg-white/50 dark:bg-stone-900 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden glass-card min-h-[400px] max-h-[500px] ${
              verseByVerseMode && imageBackgroundMode
                ? "block"
                : "hidden lg:block"
            }`}
          >
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#906140] to-[#7a5236] flex items-center justify-center shadow-lg">
                  <Image size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Backgrounds
                </h3>
              </div>

              {verseByVerseMode && imageBackgroundMode ? (
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto glass-scroll pr-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3   gap-2 sm:gap-3">
                      {bibleBgs.map((bg, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            dispatch(setSelectedBackground(bg));
                            dispatch(setImageBackgroundMode(false));
                            setTimeout(
                              () => dispatch(setImageBackgroundMode(true)),
                              0
                            );
                          }}
                          className={`relative cursor-pointer rounded-lg overflow-hidden aspect-video bg-image-item ${
                            selectedBackground === bg
                              ? "ring-2 ring-[#906140] scale-95"
                              : ""
                          }`}
                        >
                          <img
                            src={bg}
                            alt={`Background ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          {selectedBackground === bg && (
                            <div className="absolute inset-0 bg-[#906140]/20 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-[#906140] shadow-lg" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Image size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Enable Background Images to view options
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #906140 0%, #7a5236 100%);
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(144, 97, 64, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(144, 97, 64, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #906140 0%, #7a5236 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 3px 8px rgba(144, 97, 64, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(144, 97, 64, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        
        /* Custom scrollbar for glass cards */
        .glass-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .glass-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .glass-scroll::-webkit-scrollbar-thumb {
          background: rgba(144, 97, 64, 0.4);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        
        .glass-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(144, 97, 64, 0.6);
        }
        
        /* Glass card animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .glass-card {
          animation: slideIn 0.3s ease-out;
        }
        
        /* Background image hover effects */
        .bg-image-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .bg-image-item:hover {
          transform: scale(0.95) rotateY(5deg);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;
