import React, { useState, useEffect } from "react";

interface FontSelectorProps {
  value: string;
  onChange: (fontFamily: string) => void;
  label?: string;
  className?: string;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  value,
  onChange,
  label = "Font Family",
  className = "",
}) => {
  const [fontOptions, setFontOptions] = useState<string[]>([
    "Arial",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
    "Trebuchet MS",
    "Tahoma",
  ]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState("");

  // Load system fonts on mount
  useEffect(() => {
    const loadSystemFonts = async () => {
      if (typeof window !== "undefined" && window.api?.getSystemFonts) {
        try {
          setLoadingFonts(true);
          const fonts = await window.api.getSystemFonts();
          setFontOptions(fonts);
        } catch (error) {
          console.error("Failed to load system fonts:", error);
          // Keep default fonts on error
        } finally {
          setLoadingFonts(false);
        }
      } else {
        setLoadingFonts(false);
      }
    };
    loadSystemFonts();
  }, []);

  return (
    <div className={className}>
      <label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">
        {label}
      </label>

      {/* Current Font Display */}
      {/* <div
        className="px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white mb-1 border border-stone-200 dark:border-stone-700"
        style={{ fontFamily: value }}
      >
        {value}
      </div> */}

      {/* Font Search (Expandable) */}
      {!loadingFonts && fontOptions.length > 0 && (
        <details className="group">
          <summary className="text-xs text-stone-500 dark:text-stone-400 cursor-pointer hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1">
            <span className="transform group-open:rotate-90 transition-transform">
              ▶
            </span>
            <span
              className="p-1 px-4 rounded-md bg-white dark:bg-[#2c2c2c]"
              style={{
                fontFamily: value,
              }}
            >
              {value}
            </span>
            {/* <span>{fontOptions.length} fonts</span> */}
          </summary>
          <div className="mt-2 space-y-1">
            <input
              type="text"
              placeholder="Search fonts..."
              value={fontSearchQuery}
              onChange={(e) => setFontSearchQuery(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:bg-stone-200 dark:focus:bg-[#3a3a3a] transition-colors"
            />
            <div className="max-h-32 overflow-y-auto no-scrollbar  bg-white dark:bg-[#2d2d2d] rounded-lg border border-stone-200 dark:border-stone-700">
              {fontOptions
                .filter((font) =>
                  font.toLowerCase().includes(fontSearchQuery.toLowerCase())
                )
                .map((font) => (
                  <div
                    key={font}
                    // type="div"
                    onClick={() => onChange(font)}
                    className={`w-full px-2  text-xs text-left hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${
                      value === font ? "bg-stone-200 dark:bg-stone-600" : ""
                    }`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </div>
                ))}
            </div>
          </div>
        </details>
      )}

      {loadingFonts && (
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Loading fonts...
        </p>
      )}
    </div>
  );
};
