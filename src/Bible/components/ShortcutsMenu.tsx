import React from "react";
import { useTheme } from "@/Provider/Theme";
import { ShortcutsView } from "./BibleStudio/ShortcutsView";

interface ShortcutsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsMenu: React.FC<ShortcutsMenuProps> = ({ isOpen }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      id="shortcuts-menu"
      className="fixed left-1/2 top-12 -translate-x-1/2 min-h-[calc(100vh-60px)] no-scrollbar
       bg-card-bg border border-select-border rounded-lg shadow-2xl flex overflow-hidden"
      style={{
        width: "95vw",
        maxHeight: "calc(100vh - 60px)",
        zIndex: 10000,
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      {/* Left sidebar to match SettingsMenu dimensions */}
      <div className="w-80 bg-card-bg-alt p-6 border-r border-card-bg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-header-gradient-from to-header-gradient-to flex items-center justify-center shadow-md">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M3 3h18v18H3z" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Shortcuts
            </h3>
            <p className="text-sm text-text-secondary">
              Keyboard shortcuts & tips
            </p>
          </div>
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 p-6 overflow-auto no-scrollbar">
        <ShortcutsView isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default ShortcutsMenu;
