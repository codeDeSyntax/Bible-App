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
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="p-1.5 bg-select-bg rounded-lg text-text-primary flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
          {title}
        </h3>
      </div>
      <div className="space-y-1">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="py-1.5 px-2.5 hover:bg-select-hover/70 rounded-lg transition-colors duration-150 flex items-center justify-between"
          >
            <span className="text-[0.84rem] font-medium text-text-primary/90">
              {shortcut.description}
            </span>
            <kbd className="px-2 py-0.5 bg-kbd-bg text-text-primary border border-select-border rounded-md text-[0.78rem] font-semibold font-mono shadow-2xs shrink-0 ml-3">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(setActiveFeature(null))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="bg-card-bg border border-select-border shadow-2xl rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-select-border bg-card-bg-alt shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-select-bg rounded-md text-text-primary">
                <Keyboard size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary leading-tight">
                  Keyboard Shortcuts
                </h2>
                <p className="text-[0.72rem] text-text-secondary">
                  Quick reference guide
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(setActiveFeature(null))}
              className="w-7 h-7 flex items-center justify-center hover:bg-select-hover rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-3 overflow-y-auto thin-scrollbar flex-1 flex flex-col gap-4">
            {renderShortcutSection(
              shortcuts.navigation,
              "Navigation & Reading",
              <Navigation2 size={14} className="text-text-primary" />
            )}
            <div className="border-t border-select-border/60" />
            {renderShortcutSection(
              shortcuts.features,
              "Studio Features & Controls",
              <Settings size={14} className="text-text-primary" />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShortcutsModal;
