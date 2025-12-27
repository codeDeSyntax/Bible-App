import React, { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import { setTheme, selectCurrentTheme, ThemeName } from "../store/themeSlice";
import { Palette } from "lucide-react";

interface ThemeOption {
  id: ThemeName;
  name: string;
  description: string;
  colors: {
    light: string[];
    dark: string[];
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: "grayscale",
    name: "Grayscale",
    description: "Clean & Professional",
    colors: {
      light: ["#cecece", "#e8e7e7", "#989898"],
      dark: ["#1c1c1c", "#000000", "#424242"],
    },
  },
  {
    id: "warm",
    name: "Warm Earth",
    description: "Wooden Church Pews",
    colors: {
      light: ["#e8ddd0", "#f5ede3", "#d4a574"],
      dark: ["#2d2416", "#1a1410", "#8b6f47"],
    },
  },
  {
    id: "royal",
    name: "Royal Purple",
    description: "Traditional Elegance",
    colors: {
      light: ["#e6d9f0", "#f3ebf7", "#9b7bb5"],
      dark: ["#1e1028", "#120a1a", "#6b4d7a"],
    },
  },
  {
    id: "lavender",
    name: "Lavender Purple",
    description: "Peace & Serenity",
    colors: {
      light: ["#e8daf0", "#f1e8f7", "#a872d4"],
      dark: ["#281a38", "#180f20", "#6b4a85"],
    },
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Baptismal Waters",
    colors: {
      light: ["#d4e8f0", "#e3f1f7", "#6ba8c4"],
      dark: ["#162838", "#0d1a24", "#3d6b85"],
    },
  },
  {
    id: "sky",
    name: "Sky Blue",
    description: "Heavenly & Uplifting",
    colors: {
      light: ["#dae8f5", "#e8f1fa", "#72a8d4"],
      dark: ["#1a2838", "#0f1820", "#4a6b85"],
    },
  },
  {
    id: "forest",
    name: "Forest Green",
    description: "Creation & Growth",
    colors: {
      light: ["#dae8d4", "#e8f3e4", "#7da872"],
      dark: ["#1a2d1a", "#0f1c0f", "#4a6b4a"],
    },
  },
];

interface ThemeSelectorProps {
  isInSettingsMenu?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isInSettingsMenu = false,
}) => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectCurrentTheme);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleThemeSelect = (themeId: ThemeName) => {
    dispatch(setTheme(themeId));
    setIsOpen(false);
  };

  const currentThemeOption =
    themeOptions.find((t) => t.id === currentTheme) || themeOptions[0];

  // If in settings menu, render as compact list
  if (isInSettingsMenu) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            onClick={() => dispatch(setTheme(theme.id))}
            className={`
              w-full text-left p-3 rounded-lg transition-all border
              hover:bg-card-bg-alt
              ${
                theme.id === currentTheme
                  ? "border-blue-500 bg-card-bg-alt"
                  : "border-select-border bg-card-bg"
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Color Preview */}
              <div className="flex gap-1">
                {theme.colors.light.slice(0, 2).map((color, idx) => (
                  <div
                    key={`light-${idx}`}
                    className="w-5 h-5 rounded border border-select-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {theme.colors.dark.slice(0, 1).map((color, idx) => (
                  <div
                    key={`dark-${idx}`}
                    className="w-5 h-5 rounded border border-select-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Theme Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {theme.name}
                  </span>
                  {theme.id === currentTheme && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {theme.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Change Theme"
        aria-label="Theme Selector"
      >
        <Palette
          className="w-4 h-4 text-gray-800 dark:text-gray-200"
          strokeWidth={2}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Select Theme
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose a color scheme for your Bible studio
            </p>
          </div>

          {/* Theme Options */}
          <div className="p-2 max-h-[400px] overflow-y-auto">
            {themeOptions.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`
                  w-full text-left px-3 py-3 rounded-md transition-colors
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${
                    theme.id === currentTheme
                      ? "bg-gray-100 dark:bg-gray-700 ring-2 ring-blue-500"
                      : ""
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Color Preview */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex gap-1">
                      {theme.colors.light.map((color, idx) => (
                        <div
                          key={`light-${idx}`}
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {theme.colors.dark.map((color, idx) => (
                        <div
                          key={`dark-${idx}`}
                          className="w-4 h-4 rounded border border-gray-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {theme.name}
                      </span>
                      {theme.id === currentTheme && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer Tip */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Tip: Toggle dark mode with the moon/sun icon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
