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
      { key: "← / →", description: "Previous / Next verse" },
      { key: "↑ / ↓", description: "Previous / Next chapter" },
      { key: "Home", description: "Go to first verse" },
      { key: "End", description: "Go to last verse" },
      { key: "Alt + 1/2/3", description: "Books / Chapters / Verses tabs" },
      { key: "[ / ]", description: "Cycle book tabs" },
    ],
    features: [
      { key: "Enter", description: "Open presentation display" },
      { key: "Ctrl + B", description: "Bookmark active verse" },
      { key: "B", description: "Toggle bookmarks modal" },
      { key: "L", description: "Toggle library modal" },
      { key: "H", description: "Toggle history modal" },
      { key: "S", description: "Toggle Control Room (Settings)" },
      { key: "/", description: "Focus search" },
      { key: "Ctrl + F", description: "Toggle fullscreen mode" },
      { key: "Esc", description: "Close active modal / panel" },
      { key: "?", description: "Toggle shortcuts help" },
    ],
  };

  const renderShortcutSection = (
    shortcuts: { key: string; description: string }[],
    title: string,
    icon: React.ReactNode
  ) => (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-select-bg rounded-lg">{icon}</div>
        <h3 className="text-sm font-semibold text-text-primary font-[garamond]">
          {title}
        </h3>
      </div>
      <div className="space-y-0.5">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="font-[garamond] py-1.5 px-2 hover:bg-select-hover rounded transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-0.5 bg-kbd-bg text-text-secondary rounded text-[0.9rem] font-mono">
                  {shortcut.key}
                </kbd>
                <span className="text-[0.9rem] text-text-secondary">
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
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-card-bg border-select-border shadow-2xl rounded-2xl w-[90vw] max-w-md h-[80vh] max-h-[640px] overflow-hidden pointer-events-auto border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-select-border bg-card-bg-alt">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-text-primary">
                Keyboard Shortcuts
              </h2>
              <span className="text-xs text-text-secondary font-mono">Quick Reference</span>
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="w-7 h-7 flex items-center justify-center hover:bg-select-hover rounded-md text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={18} />
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
