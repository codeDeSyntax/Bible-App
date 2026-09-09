import React from "react";
import { ChevronRight, Keyboard } from "lucide-react";

interface ShortcutsViewProps {
  isDarkMode: boolean;
}

export const ShortcutsView: React.FC<ShortcutsViewProps> = ({ isDarkMode }) => {
  return (
    <div className="space-y-3">
      {/* Bible Studio Shortcuts */}
      <div className="space-y-2">
        <h4 className="text-[0.9rem] font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          Bible Studio Navigation & Controls
        </h4>
        <div className="space-y-1.5 pl-6">
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Open projection:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Enter
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Bookmark active verse:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Ctrl+B
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Previous / Next verse:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              ← →
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Previous / Next chapter:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              ↑ ↓
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              First / Last verse:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Home / End
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Toggle bookmarks modal:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              B
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Toggle Control Room (Settings):
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              S
            </kbd>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-700" />

      {/* Chapter View Mode */}
      <div className="space-y-2">
        <h4 className="text-[0.9rem] font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          Chapter View (Reader Mode)
        </h4>
        <div className="space-y-1.5 pl-6">
          <div className="text-[0.9rem] text-stone-600 dark:text-stone-400">
            <p className="mb-1">
              • Navigation via Floating Action Bar (no keyboard shortcuts)
            </p>
            <p className="mb-1">• Click verse numbers to select verses</p>
            <p className="mb-1">
              • Use dropdown menus for book/chapter selection
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-700" />

      {/* Feature Toggles */}
      <div className="space-y-2">
        <h4 className="text-[0.9rem] font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          Features
        </h4>
        <div className="space-y-1.5 pl-6">
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">Library:</span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              L
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Bookmarks:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              B
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">History:</span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              H
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">Search:</span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              /
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Shortcuts help:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              ?
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Fullscreen:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Ctrl+F
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Close panel:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Esc
            </kbd>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-700" />

      {/* Books & Tabs Navigation */}
      <div className="space-y-2">
        <h4 className="text-[0.9rem] font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          Books & Tabs Navigation
        </h4>
        <div className="space-y-1.5 pl-6">
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Books tab:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Alt+1
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Chapters tab:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Alt+2
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Verses tab:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Alt+3
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Cycle tabs:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              [ / ]
            </kbd>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-700" />

      {/* Projection Window Shortcuts */}
      <div className="space-y-2">
        <h4 className="text-[0.9rem] font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          Projection Window
        </h4>
        <div className="space-y-1.5 pl-6">
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Next verse:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              → / Space
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Previous verse:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              ←
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              First verse:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Home
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Last verse:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              End
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Toggle control panel:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Ctrl+H
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Focus main window:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              Esc
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Switch translation:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              T
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Font size:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              + / -
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.9rem]">
            <span className="text-stone-600 dark:text-stone-400">
              Select gradient:
            </span>
            <kbd className="px-2 py-1 bg-stone-200 dark:bg-[#2c2c2c] rounded text-stone-900 dark:text-stone-100 font-mono">
              1-9, 0
            </kbd>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-700" />

      {/* Usage Tips */}
      <div className="space-y-2">
        <h4 className="text-[0.9rem] font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          Tips & Features
        </h4>
        <div className="space-y-1.5 pl-6">
          <div className="text-[0.9rem] text-stone-600 dark:text-stone-400">
            <p className="mb-2">
              • <strong>Text Highlighting:</strong> Select text in verse preview
              to highlight with custom colors
            </p>
            <p className="mb-2">
              • <strong>Presets:</strong> Save frequently used verses with
              custom backgrounds for quick projection
            </p>
            <p className="mb-2">
              • <strong>Bookmarks:</strong> Bookmark verses for later reference
              (Ctrl+B in verse preview)
            </p>
            <p className="mb-2">
              • <strong>Search:</strong> Use "/" to quickly open search, or
              Ctrl+3 in reader settings
            </p>
            <p className="mb-2">
              • <strong>Dropdown Navigation:</strong> Press Tab to focus search
              in book/chapter/verse dropdowns
            </p>
            <p className="mb-2">
              • <strong>Escape Key:</strong> Universal close - works for
              dropdowns, modals, and minimizes projection
            </p>
            <p className="mb-2">
              • <strong>Verse-by-Verse Mode:</strong> Toggle for focused verse
              study with larger text
            </p>
            <p className="mb-2">
              • <strong>Control Room:</strong> Access projection settings and
              presets from Bible Studio
            </p>
            <p className="mb-2">
              • <strong>Secret Logs:</strong> Press Ctrl+` or Ctrl+Shift+L for
              developer logs (password protected)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
