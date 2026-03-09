import React from "react";
import { Type, Image, BookOpen, Monitor, Palette, Hash } from "lucide-react";

interface GeneralSettingsProps {
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  projectionBackgroundColor: string;
  imageBackgroundMode: boolean;
  selectedBackground: string | null;
  currentTranslation: string;
  currentBook: string;
  currentChapter: number;
  isFullScreen: boolean;
  bibleBgs: string[];
  isDarkMode: boolean;
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  description,
  value,
}) => (
  <div className="group flex items-center justify-between px-4 py-3  hover:bg-select-hover transition-colors duration-100 cursor-default border-select-border-hover border-b border-x-0 border-t-0 border-dashed">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-text-secondary group-hover:text-text-primary transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary leading-tight">
          {label}
        </div>
        {description && (
          <div className="text-xs text-text-secondary mt-0.5 truncate">
            {description}
          </div>
        )}
      </div>
    </div>
    <div className="text-sm text-text-secondary font-medium ml-4 flex-shrink-0 text-right">
      {value}
    </div>
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="px-4 pt-4 pb-1">
    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
      {children}
    </span>
  </div>
);

export const InfoAndPreset: React.FC<GeneralSettingsProps> = ({
  projectionFontFamily,
  projectionFontSize,
  projectionTextColor,
  projectionBackgroundImage,
  projectionGradientColors,
  projectionBackgroundColor,
  imageBackgroundMode,
  selectedBackground,
  currentTranslation,
  currentBook,
  currentChapter,
  isFullScreen,
  bibleBgs,
  isDarkMode,
}) => {
  const bgLabel = projectionBackgroundImage
    ? "Image"
    : projectionGradientColors?.length > 0
      ? "Gradient"
      : "Solid color";

  const bgPreview = projectionBackgroundImage ? (
    <img
      src={projectionBackgroundImage}
      alt="bg"
      className="w-12 h-7 rounded object-cover border border-select-border"
    />
  ) : projectionGradientColors?.length > 0 ? (
    <div
      className="w-12 h-7 rounded border border-select-border"
      style={{
        background: `linear-gradient(135deg, ${projectionGradientColors[0]} 0%, ${projectionGradientColors[1]} 100%)`,
      }}
    />
  ) : (
    <div
      className="w-12 h-7 rounded border-solid border border-select-border"
      style={{ backgroundColor: projectionBackgroundColor || "#000" }}
    />
  );

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar">
      {/* Typography */}
      <SectionLabel>Typography</SectionLabel>
      <div className="space-y-0.5">
        <SettingRow
          icon={<Type className="w-4 h-4" />}
          label="Font Family"
          description="Projection display font"
          value={
            <span className="truncate max-w-[120px] block">
              {projectionFontFamily}
            </span>
          }
        />
        <SettingRow
          icon={<Hash className="w-4 h-4" />}
          label="Font Size"
          description="Text size on projection"
          value={`${projectionFontSize}px`}
        />
        <SettingRow
          icon={<Palette className="w-4 h-4" />}
          label="Text Color"
          description="Projection verse text color"
          value={
            <span className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded border border-select-border flex-shrink-0"
                style={{ backgroundColor: projectionTextColor }}
              />
              <span className="text-xs font-mono">{projectionTextColor}</span>
            </span>
          }
        />
      </div>

      {/* Content */}
      <SectionLabel>Content</SectionLabel>
      <div className="space-y-0.5">
        <SettingRow
          icon={<BookOpen className="w-4 h-4" />}
          label="Translation"
          description="Active Bible translation"
          value={
            <span className="truncate max-w-[120px] block">
              {currentTranslation}
            </span>
          }
        />
        <SettingRow
          icon={<BookOpen className="w-4 h-4" />}
          label="Current Position"
          description="Book and chapter"
          value={`${currentBook} ${currentChapter}`}
        />
      </div>

      {/* Display */}
      <SectionLabel>Display</SectionLabel>
      <div className="space-y-0.5">
        <SettingRow
          icon={<Image className="w-4 h-4" />}
          label="Background"
          description={bgLabel}
          value={bgPreview}
        />
        <SettingRow
          icon={<Image className="w-4 h-4" />}
          label="Image Library"
          description="Loaded background images"
          value={`${bibleBgs.length} image${bibleBgs.length !== 1 ? "s" : ""}`}
        />
        <SettingRow
          icon={<Image className="w-4 h-4" />}
          label="Image Mode"
          description="Use image as background"
          value={
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                imageBackgroundMode
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-select-bg text-text-secondary"
              }`}
            >
              {imageBackgroundMode ? "On" : "Off"}
            </span>
          }
        />
        <SettingRow
          icon={<Monitor className="w-4 h-4" />}
          label="Fullscreen"
          description="Projection window state"
          value={
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isFullScreen
                  ? "bg-green-500/15 text-green-400"
                  : "bg-select-bg text-text-secondary"
              }`}
            >
              {isFullScreen ? "Active" : "Inactive"}
            </span>
          }
        />
      </div>
    </div>
  );
};
