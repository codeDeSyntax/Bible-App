import React from "react";
import { BookOpen, ImageIcon } from "lucide-react";
import { Tooltip } from "antd";

export type PresetTypeOption = "scripture" | "image";

interface PresetTypeSelectorProps {
  onSelectType: (type: PresetTypeOption) => void;
  isDarkMode?: boolean;
}

export const PresetTypeSelector: React.FC<PresetTypeSelectorProps> = ({
  onSelectType,
  isDarkMode = false,
}) => {
  const presetTypes = [
    {
      type: "scripture" as PresetTypeOption,
      icon: BookOpen,
      title: "Scripture Preset",
      description: "Display Bible verses with custom backgrounds and styling",
      color: "from-purple-500 to-purple-600",
      darkColor: "from-purple-600 to-purple-700",
    },
    {
      type: "image" as PresetTypeOption,
      icon: ImageIcon,
      title: "Image Preset",
      description: "Create slideshows with multiple images",
      color: "from-green-500 to-green-600",
      darkColor: "from-green-600 to-green-700",
    },
  ];

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Choose Preset Type
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Select the type of preset you want to create
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-fit mx-auto">
        {presetTypes.map((preset) => {
          const Icon = preset.icon;
          return (
            <Tooltip
              key={preset.type}
              title={preset.description}
              placement="bottom"
            >
              <div
                onClick={() => onSelectType(preset.type)}
                className="group relative overflow-hidden bg-white shadow dark:bg-black/30 rounded-lg p-3 transition-all hover:shadow-md cursor-pointer border w-28 h-28 flex flex-col items-center justify-center"
                // style={{
                //   background: isDarkMode
                //     ? "linear-gradient(145deg, #2a2a2a, #1f1f1f)"
                //     : "linear-gradient(145deg, #f8f8f8, #ffffff)",
                //   borderColor: isDarkMode
                //     ? "rgba(255, 255, 255, 0.1)"
                //     : "rgba(0, 0, 0, 0.1)",
                // }}
              >
                {/* Icon */}
                <div
                  className="relative w-10 h-10 rounded-md flex items-center justify-center mb-2"
                  style={{
                    background: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Icon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                </div>

                {/* Title */}
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white text-center">
                  {preset.title}
                </h3>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
