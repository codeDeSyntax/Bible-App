import React from "react";
import { ChevronRight } from "lucide-react";

interface ShortcutsViewProps {
  isDarkMode: boolean;
}

export const ShortcutsView: React.FC<ShortcutsViewProps> = () => {
  return (
    <div className="space-y-4 font-sans">
      {/* Bible Studio Shortcuts */}
      <div className="space-y-2.5">
        <h4 className="text-[0.9rem] font-bold text-text-primary flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-text-secondary" />
          Bible Studio Navigation & Controls
        </h4>
        <div className="space-y-2 pl-6">
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Open projection:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Enter
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Bookmark active verse:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Ctrl+B
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Previous / Next verse:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              ← →
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Previous / Next chapter:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              ↑ ↓
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">First / Last verse:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Home / End
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Toggle bookmarks modal:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              B
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Toggle Control Room (Settings):</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              S
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Toggle Smart AI Voice Listener:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Alt+M
            </kbd>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-select-border/60" />

      {/* Chapter View Mode */}
      <div className="space-y-2.5">
        <h4 className="text-[0.9rem] font-bold text-text-primary flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-text-secondary" />
          Chapter View (Reader Mode)
        </h4>
        <div className="space-y-1.5 pl-6">
          <div className="text-[0.88rem] text-text-secondary space-y-1">
            <p>• Navigation via Floating Action Bar</p>
            <p>• Click verse numbers to select verses</p>
            <p>• Use dropdown menus for book/chapter selection</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-select-border/60" />

      {/* Feature Toggles */}
      <div className="space-y-2.5">
        <h4 className="text-[0.9rem] font-bold text-text-primary flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-text-secondary" />
          Features & Panels
        </h4>
        <div className="space-y-2 pl-6">
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Library:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              L
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Bookmarks:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              B
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">History:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              H
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Search:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              /
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Shortcuts help:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              ?
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Fullscreen:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Ctrl+F
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Close panel / modal:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Esc
            </kbd>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-select-border/60" />

      {/* Books & Tabs Navigation */}
      <div className="space-y-2.5">
        <h4 className="text-[0.9rem] font-bold text-text-primary flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-text-secondary" />
          Books & Tabs Navigation
        </h4>
        <div className="space-y-2 pl-6">
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Books tab:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Alt+1
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Chapters tab:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Alt+2
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Verses tab:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Alt+3
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Cycle tabs:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              [ / ]
            </kbd>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-select-border/60" />

      {/* Projection Window Shortcuts */}
      <div className="space-y-2.5">
        <h4 className="text-[0.9rem] font-bold text-text-primary flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-text-secondary" />
          Projection Window
        </h4>
        <div className="space-y-2 pl-6">
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Next verse:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              → / Space
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Previous verse:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              ←
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">First verse:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Home
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Last verse:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              End
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Toggle control panel:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Ctrl+H
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Focus main window:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              Esc
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Switch translation:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              T
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Font size:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              + / -
            </kbd>
          </div>
          <div className="flex justify-between items-center text-[0.88rem]">
            <span className="text-text-secondary">Select gradient:</span>
            <kbd className="px-2 py-0.5 bg-kbd-bg border border-select-border rounded text-text-primary font-mono text-[0.82rem] font-semibold shadow-2xs">
              1-9, 0
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
