import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  X,
  Music,
  Book,
  Presentation,
  Home,
  Monitor,
  Keyboard,
  Image,
  Save,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface ShortcutItem {
  key: string;
  description: string;
}

interface HelpSection {
  title: string;
  icon: React.ReactNode;
  items: ShortcutItem[];
}

const Help: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const toggleHelp = () => {
    setIsOpen(!isOpen);
  };

  // Close help with ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when help is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const helpData: HelpSection[] = [
    {
      title: "Bible Navigation",
      icon: <Book className="h-4 w-4" />,
      items: [
        {
          key: "S",
          description: "Toggle Projection Control Room (Audience mode only)",
        },
        {
          key: "D",
          description: "Toggle Reader Settings Dropdown (Reader mode only)",
        },
        {
          key: "ESC",
          description: "Close any open dropdowns or control room",
        },
      ],
    },
    {
      title: "Reader Settings Shortcuts",
      icon: <Keyboard className="h-4 w-4" />,
      items: [
        {
          key: "Ctrl+1",
          description: "Go to Settings tab",
        },
        {
          key: "Ctrl+2",
          description: "Go to Bookmarks tab",
        },
        {
          key: "Ctrl+3",
          description: "Go to Search tab",
        },
        {
          key: "Ctrl+B",
          description: "Quick access to Bookmarks",
        },
        {
          key: "Ctrl+F",
          description: "Quick access to Font Size settings",
        },
        {
          key: "Ctrl+S",
          description:
            "Quick access to Search (in reader mode) / Toggle Control Room (in audience mode)",
        },
      ],
    },
    {
      title: "Presentation Controls",
      icon: <Monitor className="h-4 w-4" />,
      items: [{ key: "ESC", description: "Exit presentation" }],
    },
  ];

  return (
    <>
      <div
        onClick={toggleHelp}
        className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-select-hover"
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5 text-text-secondary group-hover:text-text-primary" />
      </div>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={toggleHelp}
          />

          {/* Modal Content */}
          <div className="relative z-[10001] w-[90vw] max-w-4xl h-[85vh] max-h-[700px] bg-select-bg rounded-2xl border border-select-border shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-select-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 dark:bg-primary/30">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-semibold text-text-primary">
                  Keyboard Shortcuts
                </span>
              </div>
              <button
                onClick={toggleHelp}
                className="p-2 rounded-lg hover:bg-select-hover transition-colors group"
                aria-label="Close help"
              >
                <X className="h-5 w-5 text-text-secondary hover:text-text-primary transition-colors" />
              </button>
            </div>

            {/* Content - List Format */}
            <div className="h-[calc(100%-70px)] overflow-y-auto no-scrollbar">
              <div className="space-y-0">
                {helpData.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {/* Section Header */}
                    <div className="px-6  bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-b border-primary/20 dark:border-primary/20 sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20 dark:bg-primary/30">
                          {React.cloneElement(
                            section.icon as React.ReactElement,
                            {
                              className: "h-4 w-4 text-primary",
                            }
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-text-primary">
                          {section.title}
                        </h3>
                      </div>
                    </div>

                    {/* Section Items */}
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="px-6  transition-all duration-200 border-b border-solid border-x-0 border-t-0 border-gray-200/50 dark:border-primary/20 last:border-b-0 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/5 group cursor-default"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="inline-flex items-center justify-center min-w-[70px] bg-primary/10 dark:bg-primary/20 text-primary px-3 py-2 rounded-lg text-sm font-mono font-medium border border-primary/20">
                              {item.key}
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed flex-1">
                              {item.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-primary/20 group-hover:text-primary/40 transition-colors flex-shrink-0 ml-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="p-6 border-t border-gray-200/50 dark:border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Press{" "}
                  <span className="font-mono bg-gray-100 dark:bg-primary/10 px-2 py-1 rounded text-primary">
                    ESC
                  </span>{" "}
                  to close this window
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Help;
