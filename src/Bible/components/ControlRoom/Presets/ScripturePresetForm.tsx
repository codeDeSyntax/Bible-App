import React, { useState, useEffect } from "react";
import { BookOpen, ChevronDown, Search, Type } from "lucide-react";

interface Book {
  name: string;
  testament: string;
}

interface ScripturePresetFormProps {
  selectedBook: string;
  selectedChapter: number;
  selectedVerse: number;
  fetchedScriptureText: string;
  bookList: Book[] | undefined;
  isBookDropdownOpen: boolean;
  isChapterDropdownOpen: boolean;
  isVerseDropdownOpen: boolean;
  setSelectedBook: (book: string) => void;
  setSelectedChapter: (chapter: number) => void;
  setSelectedVerse: (verse: number) => void;
  setIsBookDropdownOpen: (open: boolean) => void;
  setIsChapterDropdownOpen: (open: boolean) => void;
  setIsVerseDropdownOpen: (open: boolean) => void;
  getChaptersForBook: () => number[];
  getVersesForChapter: () => number[];
  onSave: (fontSettings: { fontSize: number; fontFamily: string }) => void;
  // Optional initial font values for edit mode
  initialFontSize?: number;
  initialFontFamily?: string;
}

export const ScripturePresetForm: React.FC<ScripturePresetFormProps> = ({
  selectedBook,
  selectedChapter,
  selectedVerse,
  fetchedScriptureText,
  bookList,
  isBookDropdownOpen,
  isChapterDropdownOpen,
  isVerseDropdownOpen,
  setSelectedBook,
  setSelectedChapter,
  setSelectedVerse,
  setIsBookDropdownOpen,
  setIsChapterDropdownOpen,
  setIsVerseDropdownOpen,
  getChaptersForBook,
  getVersesForChapter,
  onSave,
  initialFontSize,
  initialFontFamily,
}) => {
  // Font settings state
  const [fontSize, setFontSize] = useState(initialFontSize || 48);
  const [fontFamily, setFontFamily] = useState(
    initialFontFamily || "Montserrat, sans-serif"
  );
  const [systemFonts, setSystemFonts] = useState<string[]>([]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  const [fontSearchTerm, setFontSearchTerm] = useState("");
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  // Load system fonts
  useEffect(() => {
    const loadFonts = async () => {
      if (typeof window !== "undefined" && window.api) {
        setLoadingFonts(true);
        try {
          const fonts = await window.api.getSystemFonts();
          setSystemFonts(fonts);
        } catch (error) {
          console.error("Failed to load system fonts:", error);
        } finally {
          setLoadingFonts(false);
        }
      }
    };
    loadFonts();
  }, []);

  // Filter fonts based on search
  const filteredFonts = systemFonts.filter((font) =>
    font.toLowerCase().includes(fontSearchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 dark:bg-[#1c1c1c] h-[25rem] overflow-y-auto no-scrollbar rounded-lg p-4 border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center shadow-md">
          <BookOpen className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#313131] dark:text-[#f9fafb]">
          Scripture Preset
        </h4>
      </div>

      <div className="space-y-3">
        {/* Book Selector */}
        <div className="relative scripture-dropdown">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Book
          </label>
          <button
            onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white/80 dark:bg-black/40 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#313131]/30 dark:focus:ring-white/20 transition-all flex items-center justify-between hover:bg-gray-50 dark:hover:bg-black/60"
          >
            <span className="truncate">
              {selectedBook || "Select a book..."}
            </span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isBookDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isBookDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white/95 dark:bg-[#2c2c2c]/95 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto no-scrollbar">
              {/* New Testament */}
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1 py-1 mb-2">
                  New Testament
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bookList
                    ?.filter((book) => book.testament === "new")
                    .map((book) => (
                      <button
                        key={book.name}
                        onClick={() => {
                          setSelectedBook(book.name);
                          setSelectedChapter(1);
                          setSelectedVerse(1);
                          setIsBookDropdownOpen(false);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-full transition-all cursor-pointer ${
                          selectedBook === book.name
                            ? "bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#b8835a] dark:to-[#8b5e3c] text-white font-semibold shadow-md"
                            : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:shadow-sm"
                        }`}
                      >
                        {book.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Old Testament */}
              <div className="p-3 border-t border-gray-200 dark:border-white/10">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1 py-1 mb-2">
                  Old Testament
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bookList
                    ?.filter((book) => book.testament === "old")
                    .map((book) => (
                      <button
                        key={book.name}
                        onClick={() => {
                          setSelectedBook(book.name);
                          setSelectedChapter(1);
                          setSelectedVerse(1);
                          setIsBookDropdownOpen(false);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-full transition-all cursor-pointer ${
                          selectedBook === book.name
                            ? "bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#303030] dark:to-[#303030] text-white font-semibold shadow-md"
                            : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:shadow-sm"
                        }`}
                      >
                        {book.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chapter and Verse Selectors - Two Column Layout */}
        {selectedBook && (
          <div className="grid grid-cols-2 gap-3">
            {/* Chapter Selector */}
            <div className="relative scripture-dropdown">
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Chapter
              </label>
              <button
                onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#313131]/30 transition-all flex items-center justify-between"
              >
                <span>Ch. {selectedChapter}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    isChapterDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isChapterDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1410] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto p-2">
                  <div className="grid grid-cols-5 gap-1">
                    {getChaptersForBook().map((chapter) => (
                      <div
                        key={chapter}
                        onClick={() => {
                          setSelectedChapter(chapter);
                          setSelectedVerse(1);
                          setIsChapterDropdownOpen(false);
                        }}
                        className={`px-2 py-1.5 text-xs rounded transition-all font-medium cursor-pointer text-center ${
                          selectedChapter === chapter
                            ? "bg-gradient-to-r from-[#313131] to-[#303030] text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2420]"
                        }`}
                      >
                        {chapter}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verse Selector */}
            {selectedChapter && (
              <div className="relative scripture-dropdown">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Verse
                </label>
                <div
                  onClick={() => setIsVerseDropdownOpen(!isVerseDropdownOpen)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#313131]/30 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>V. {selectedVerse}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isVerseDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isVerseDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1410] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto p-2">
                    <div className="grid grid-cols-5 gap-1">
                      {getVersesForChapter().map((verse) => (
                        <div
                          key={verse}
                          onClick={() => {
                            setSelectedVerse(verse);
                            setIsVerseDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 text-xs rounded transition-all font-medium cursor-pointer text-center ${
                            selectedVerse === verse
                              ? "bg-gradient-to-r from-[#313131] to-[#303030] text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2420]"
                          }`}
                        >
                          {verse}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scripture Text Preview */}
        {fetchedScriptureText && (
          <div className="h-32 rounded-lg border border-white/20 relative overflow-hidden">
            {/* Paint Sweeps Gold Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url(./paint-sweeps-gold.jpg)",
                backgroundColor: "#1a1a1a",
              }}
            />

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10 h-full p-3 flex flex-col overflow-y-auto no-scrollbar">
              {/* Reference Badge - Top Left */}
              <div className="flex-shrink-0 mb-2">
                <div className="bg-white px-2 py-0.5 rounded shadow-md inline-block">
                  <span className="text-[10px] font-bold text-black tracking-wide uppercase leading-none">
                    {selectedBook} {selectedChapter}:{selectedVerse}
                  </span>
                </div>
              </div>

              {/* Scripture Text - Left Aligned */}
              <div className="flex-1">
                <p
                  className="text-white font-semibold leading-relaxed"
                  style={{
                    fontSize: `${Math.max(8, fontSize / 8)}px`,
                    fontFamily: fontFamily,
                    textShadow:
                      "0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)",
                    lineHeight: "1.3",
                  }}
                >
                  {fetchedScriptureText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Font Settings - Two Column Layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Font Size Setting */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
              <span>Font Size</span>
              <span className="font-semibold">{fontSize}px</span>
            </label>
            <input
              type="range"
              min="32"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#313131] dark:accent-[#b8835a]"
            />
          </div>

          {/* Font Family Dropdown (Compact) */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white focus:outline-none focus:bg-gray-200 dark:focus:bg-[#3a3a3a] transition-colors"
              disabled={loadingFonts}
            >
              {loadingFonts ? (
                <option>Loading fonts...</option>
              ) : (
                filteredFonts.map((font) => (
                  <option key={font} value={font}>
                    {font.length > 20 ? font.substring(0, 20) + "..." : font}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Font Search (Optional Expansion) */}
        {!loadingFonts && systemFonts.length > 0 && (
          <details className="group">
            <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
              <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
              <span>Search all {systemFonts.length} fonts</span>
            </summary>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Search fonts..."
                value={fontSearchTerm}
                onChange={(e) => setFontSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border-none bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-gray-200 dark:focus:bg-[#3a3a3a] transition-colors"
              />
              {fontSearchTerm && (
                <div className="mt-1 max-h-32 overflow-y-auto bg-white dark:bg-[#2d2d2d] rounded-lg border border-gray-200 dark:border-gray-700">
                  {filteredFonts.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => {
                        setFontFamily(font);
                        setFontSearchTerm("");
                      }}
                      className="w-full px-2 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </details>
        )}

        <button
          onClick={() => onSave({ fontSize, fontFamily })}
          disabled={!selectedBook || !fetchedScriptureText}
          className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] text-white hover:from-[#252525] hover:to-[#202020] dark:hover:from-[#c99466] dark:hover:to-[#9a6e48] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-1"
        >
          <Search className="w-3 h-3" />
          Save & Project
        </button>
      </div>
    </div>
  );
};
