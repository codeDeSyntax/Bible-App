import React from "react";
import { FolderUp, Image, Maximize } from "lucide-react";

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
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  customImagesPath,
  handleSelectImagesDirectory,
  bibleBgs,
  imageBackgroundMode,
  handleBackgroundImageModeChange,
  isFullScreen,
  handleFullscreenModeChange,
}) => {
  return (
    <div className="space-y-4 w-full">
      {/* Custom Images Path Selection */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
              <FolderUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Background Images Folder
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Choose folder containing background images
              </p>
            </div>
          </div>
          <div
            onClick={handleSelectImagesDirectory}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#906140] to-[#7d5439] text-white rounded-lg hover:from-[#7d5439] hover:to-[#6b4931] transition-all duration-200 text-xs shadow-lg cursor-pointer"
          >
            <FolderUp className="w-3 h-3" />
            {customImagesPath ? "Change Folder" : "Select Folder"}
          </div>
        </div>
        {customImagesPath && (
          <div className="mt-3 px-3 py-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg backdrop-blur-sm">
            <p className="text-xs text-green-700 dark:text-green-300 truncate font-mono">
              📁 {customImagesPath}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {bibleBgs.length} images loaded from this folder
            </p>
          </div>
        )}
      </div>

      {/* Background Image Mode Toggle */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
              <Image className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Background Images
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {imageBackgroundMode
                  ? "Background images are enabled"
                  : "Enable custom backgrounds for projection"}
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
      </div>

      {/* Fullscreen Mode Toggle */}
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#906140] to-[#7d5439] flex items-center justify-center shadow-md">
              <Maximize className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Fullscreen Mode
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {isFullScreen
                  ? "Fullscreen mode is enabled"
                  : "Enable immersive reading experience"}
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
                console.log(
                  "🔍 Checkbox onChange:",
                  newValue,
                  "stopping propagation"
                );
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
  );
};
