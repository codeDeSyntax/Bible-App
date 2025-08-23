import React from "react";
import { X, Keyboard, Navigation2, Book, Settings, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature } from "@/store/slices/bibleSlice";

const ShortcutsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const projectionBackgroundImage = useAppSelector(
    (state) => state.bible.projectionBackgroundImage
  );
  const projectionGradientColors = useAppSelector(
    (state) => state.bible.projectionGradientColors
  );

  if (activeFeature !== "shortcuts") return null;

  // Check if there's a background image or gradient
  const hasBackgroundImage =
    (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") ||
    (projectionGradientColors && projectionGradientColors.length >= 2);

  const shortcuts = {
    navigation: [
      { key: "←", description: "Previous chapter" },
      { key: "→", description: "Next chapter" },
      { key: "↑", description: "Previous verse" },
      { key: "↓", description: "Next verse" },
      { key: "Home", description: "Go to first verse" },
      { key: "End", description: "Go to last verse" },
    ],
    features: [
      { key: "L", description: "Open library" },
      { key: "B", description: "Open bookmarks" },
      { key: "H", description: "Open history" },
      { key: "S", description: "Open settings" },
      { key: "/", description: "Focus search" },
      { key: "Ctrl + F", description: "Toggle fullscreen mode" },
      { key: "Esc", description: "Close active panel" },
    ],
  };

  const renderShortcutSection = (
    shortcuts: { key: string; description: string }[],
    title: string,
    icon: React.ReactNode
  ) => (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-gray-100 dark:bg-black/20 rounded-lg">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#faeed1] font-[garamond]">
          {title}
        </h3>
      </div>
      <div className="space-y-0.5">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="font-[garamond] py-1.5 px-2 hover:bg-primary/5 dark:hover:bg-white/5 rounded transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-black/40 text-gray-600 dark:text-gray-300 rounded text-xs font-mono">
                  {shortcut.key}
                </kbd>
                <span className="text-xs text-gray-700 dark:text-[#faeed1]">
                  {shortcut.description}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-[#fef6f1] dark:bg-[#352921] border-gray-200 dark:border-gray-700/50 shadow dark:shadow-primary rounded-3xl w-[30%] h-[90vh] overflow-hidden pointer-events-auto font-[garamond] border">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#faeed1]">
                Shortcuts
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                (keyboard)
              </span>
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div
            className="px-3 overflow-y-auto no-scrollbar"
            style={{ height: "calc(90vh - 6rem)" }}
          >
            <div className="py-3 flex flex-col gap-4">
              {renderShortcutSection(
                shortcuts.navigation,
                "Navigation",
                <Navigation2
                  size={16}
                  className="text-primary dark:text-primary"
                />
              )}
              {renderShortcutSection(
                shortcuts.features,
                "Features",
                <Settings
                  size={16}
                  className="text-primary dark:text-primary"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShortcutsModal;
