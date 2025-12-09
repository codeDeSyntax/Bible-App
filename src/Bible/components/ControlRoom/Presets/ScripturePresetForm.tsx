import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  Search,
  Type,
  FolderOpen,
  X,
} from "lucide-react";
import { FontSelector } from "./FontSelector";

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
  onSave: (fontSettings: {
    fontSize: number;
    fontFamily: string;
    backgroundImage?: string;
    videoBackground?: string;
  }) => void;
  // Optional initial values for edit mode
  initialFontSize?: number;
  initialFontFamily?: string;
  initialBackgroundImage?: string;
  initialVideoBackground?: string;
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
  initialBackgroundImage,
  initialVideoBackground,
}) => {
  // Font settings state
  const [fontSize, setFontSize] = useState(initialFontSize || 48);
  const [fontFamily, setFontFamily] = useState(
    initialFontFamily || "Montserrat, sans-serif"
  );

  // Background image selection (reuse pattern from TextPresetForm)
  // Priority: video background takes precedence over image background
  const [useBackgroundImage, setUseBackgroundImage] = useState<boolean>(
    !!initialBackgroundImage && !initialVideoBackground
  );
  const [useVideoBackground, setUseVideoBackground] = useState<boolean>(
    !!initialVideoBackground
  );
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] =
    useState<string>(initialBackgroundImage || "");
  const [selectedVideoBackground, setSelectedVideoBackground] =
    useState<string>(initialVideoBackground || "");

  // Available videos in public folder
  const availableVideos = [
    { name: "Blue Particle", path: "../blue_particle.mp4" },
    { name: "Waterglass", path: "./waterglass.mp4" },
    { name: "Welcome Video", path: "./welcomevid.mp4" },
    { name: "Welcome Video 1", path: "./welcomvid1.mp4" },
  ];

  const SCRIPTURE_PRESET_STORAGE_KEY = "scripturePreset_selectedDirectory";

  useEffect(() => {
    const loadSavedDirectory = async () => {
      const savedDirectory = localStorage.getItem(SCRIPTURE_PRESET_STORAGE_KEY);
      if (savedDirectory && typeof window !== "undefined" && window.api) {
        try {
          const imageFiles = await window.api.getImages(savedDirectory);
          setSelectedDirectory(savedDirectory);
          setAvailableImages(imageFiles);
          if (imageFiles.length > 0) setUseBackgroundImage(true);
        } catch (error) {
          console.error("Failed to load saved directory:", error);
        }
      }
    };
    loadSavedDirectory();
  }, []);

  const handleSelectDirectory = async () => {
    if (typeof window !== "undefined" && window.api) {
      try {
        const directory = await window.api.selectDirectory();
        if (directory) {
          const imageFiles = await window.api.getImages(directory);
          setSelectedDirectory(directory);
          setAvailableImages(imageFiles);
          setSelectedBackgroundImage("");
          localStorage.setItem(SCRIPTURE_PRESET_STORAGE_KEY, directory);
          if (imageFiles.length > 0) setUseBackgroundImage(true);
        }
      } catch (error) {
        console.error("Failed to select directory:", error);
      }
    }
  };

  const handleImageSelect = (image: string) => {
    setSelectedBackgroundImage(image);
    setUseBackgroundImage(true);
  };

  const handleClearImage = () => {
    setSelectedBackgroundImage("");
    setUseBackgroundImage(false);
  };

  const handleVideoSelect = (videoPath: string) => {
    setSelectedVideoBackground(videoPath);
    setUseVideoBackground(true);
    setUseBackgroundImage(false);
    setSelectedBackgroundImage("");
  };

  const handleClearVideo = () => {
    setSelectedVideoBackground("");
    setUseVideoBackground(false);
  };

  // Update font settings when initial values change (for edit mode)
  useEffect(() => {
    if (initialFontSize !== undefined) {
      setFontSize(initialFontSize);
    }
    if (initialFontFamily !== undefined) {
      setFontFamily(initialFontFamily);
    }
  }, [initialFontSize, initialFontFamily]);

  return (
    <div className="bg-gray-100 max-w-xl dark:bg-[#1c1c1c] h-[25rem] overflow-y-auto no-scrollbar rounded-lg p-4 border border-solid border-gray-200 dark:border-none backdrop-blur-sm relative">
      {/* Floating Preview */}
      {fetchedScriptureText && (
        <div className="absolute top-4 right-4 w-48 h-32 z-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-xl overflow-hidden">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                useVideoBackground && selectedVideoBackground
                  ? "none"
                  : selectedBackgroundImage
                  ? `url(${selectedBackgroundImage})`
                  : "url(./paint-sweeps-gold.jpg)",
              backgroundColor: "#1a1a1a",
            }}
          />

          {/* Video Background */}
          {useVideoBackground && selectedVideoBackground && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={selectedVideoBackground} type="video/mp4" />
            </video>
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content */}
          <div className="relative z-10 h-full p-2 flex flex-col overflow-hidden">
            {/* Reference Badge */}
            <div className="flex-shrink-0 mb-1">
              <div className="bg-white px-1.5 py-0.5 rounded shadow-md inline-block">
                <span className="text-[8px] font-bold text-black tracking-wide uppercase leading-none">
                  {selectedBook} {selectedChapter}:{selectedVerse}
                </span>
              </div>
            </div>

            {/* Scripture Text */}
            <div className="flex-1 overflow-hidden">
              <p
                className="text-white font-semibold leading-tight line-clamp-4"
                style={{
                  fontSize: `${Math.max(6, fontSize / 10)}px`,
                  fontFamily: fontFamily,
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.8)",
                  lineHeight: "1.2",
                }}
              >
                {fetchedScriptureText}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] flex items-center justify-center ">
          <BookOpen className="w-3 h-3 text-white" />
        </div>
        <h4 className="text-sm font-bold text-[#313131] dark:text-[#f9fafb]">
          Scripture Preset
        </h4>
      </div>

      <div className="space-y-3">
        {/* Book Selector */}
        <div className="relative scripture-dropdown">
          <label className="text-[0.9rem] text-gray-600 dark:text-gray-400 mb-1 block">
            Book
          </label>
          <button
            onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
            className="w-full px-3 py-2 text-[0.9rem] rounded-lg bg-white/80 dark:bg-black/40 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#313131]/30 dark:focus:ring-white/20 transition-all flex items-center justify-between hover:bg-gray-50 dark:hover:bg-black/60"
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
            <div className="absolute top-full left-0 right-0 mb-1 bg-white/95 dark:bg-[#2c2c2c]/95 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto no-scrollbar">
              {/* New Testament */}
              <div className="p-3">
                <div className="text-[0.9rem] font-semibold text-gray-500 dark:text-gray-400 px-1 py-1 mb-2">
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
                        className={`px-2.5 py-1 text-[0.9rem] rounded-full transition-all cursor-pointer ${
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
                <div className="text-[0.9rem] font-semibold text-gray-500 dark:text-gray-400 px-1 py-1 mb-2">
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
                        className={`px-2.5 py-1 text-[0.9rem] rounded-full transition-all cursor-pointer ${
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
              <label className="text-[0.9rem] text-gray-600 dark:text-gray-400 mb-1 block">
                Chapter
              </label>
              <button
                onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
                className="w-full px-3 py-2 text-[0.9rem] rounded-lg bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#313131]/30 transition-all flex items-center justify-between"
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
                        className={`px-2 py-1.5 text-[0.9rem] rounded transition-all font-medium cursor-pointer text-center ${
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
                <label className="text-[0.9rem] text-gray-600 dark:text-gray-400 mb-1 block">
                  Verse
                </label>
                <div
                  onClick={() => setIsVerseDropdownOpen(!isVerseDropdownOpen)}
                  className="w-full px-3 py-2 text-[0.9rem] rounded-lg bg-white dark:bg-[#0f0c0a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#313131]/30 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>V. {selectedVerse}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isVerseDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isVerseDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1410] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar p-2">
                    <div className="grid grid-cols-5 gap-1">
                      {getVersesForChapter().map((verse) => (
                        <div
                          key={verse}
                          onClick={() => {
                            setSelectedVerse(verse);
                            setIsVerseDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 text-[0.9rem] rounded transition-all font-medium cursor-pointer text-center ${
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

        {/* Font Settings - Two Column Layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Font Size Setting */}
          <div>
            <label className="text-[0.9rem] text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
              <span>Font Size</span>
              <span className="font-semibold">{fontSize}px</span>
            </label>
            <input
              type="range"
              min="32"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-300 dark:bg-stone-600 rounded-lg appearance-none cursor-pointer accent-[#313131] dark:accent-[#b8835a]"
            />
          </div>

          {/* Font Family */}
          <FontSelector value={fontFamily} onChange={setFontFamily} />
        </div>

        {/* Background Type Toggle: Video vs Image */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10">
            <div>
              <label className="text-[0.9rem] font-medium text-stone-700 dark:text-stone-300">
                Video Background
              </label>
              <p className="text-[0.9rem] text-stone-500 dark:text-stone-400">
                Use video
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useVideoBackground}
                onChange={(e) => {
                  setUseVideoBackground(e.target.checked);
                  if (e.target.checked) {
                    setUseBackgroundImage(false);
                    setSelectedBackgroundImage("");
                  } else {
                    setSelectedVideoBackground("");
                  }
                }}
                className="sr-only peer"
              />
              <div
                className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                  useVideoBackground
                    ? "bg-[#313131] dark:bg-[#b8835a]"
                    : "bg-stone-200/50 dark:bg-stone-700/50"
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border border-stone-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                    useVideoBackground ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/50 dark:border-white/10">
            <div>
              <label className="text-[0.9rem] font-medium text-stone-700 dark:text-stone-300">
                Image Background
              </label>
              <p className="text-[0.9rem] text-stone-500 dark:text-stone-400">
                Use custom image
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useBackgroundImage}
                onChange={(e) => {
                  setUseBackgroundImage(e.target.checked);
                  if (e.target.checked) {
                    setUseVideoBackground(false);
                    setSelectedVideoBackground("");
                  } else {
                    setSelectedBackgroundImage("");
                  }
                }}
                className="sr-only peer"
              />
              <div
                className={`w-10 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#313131]/50 relative transition-all duration-200 ${
                  useBackgroundImage
                    ? "bg-[#313131] dark:bg-[#b8835a]"
                    : "bg-stone-200/50 dark:bg-stone-700/50"
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border border-stone-300 dark:border-[#312319] rounded-full h-5 w-5 transition-all duration-200 ${
                    useBackgroundImage ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Video Background Selector */}
        {useVideoBackground && (
          <div className="space-y-2 mt-2">
            <label className="text-[0.9rem] text-stone-600 dark:text-stone-400">
              Select Video
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableVideos.map((video) => (
                <div
                  key={video.path}
                  onClick={() => handleVideoSelect(video.path)}
                  className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all h-20 ${
                    selectedVideoBackground === video.path
                      ? "border-[#313131] dark:border-[#b8835a] ring-2 ring-[#313131]/30 dark:ring-[#b8835a]/30"
                      : "border-transparent hover:border-gray-300 dark:hover:border-stone-600"
                  }`}
                >
                  <video
                    src={video.path}
                    className="w-full h-full object-cover"
                    muted
                    loop
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-[0.9rem] font-semibold px-2 py-1 bg-black/60 rounded">
                      {video.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedVideoBackground && (
              <div className="relative rounded overflow-hidden group h-24">
                <video
                  src={selectedVideoBackground}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
                <button
                  onClick={handleClearVideo}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Background Image Selector UI */}
        {useBackgroundImage && (
          <div className="space-y-2 mt-2">
            <button
              onClick={handleSelectDirectory}
              className="w-full px-2 py-1.5 text-[0.9rem] rounded-lg bg-white/80 dark:bg-black/40 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/10 focus:outline-none transition-all flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-black/60"
            >
              <FolderOpen className="w-3 h-3" />
              <span className="truncate text-[0.9rem]">
                {selectedDirectory || "Choose folder..."}
              </span>
            </button>

            {availableImages.length > 0 && (
              <div className="max-h-24 overflow-y-auto no-scrollbar bg-white/50 dark:bg-black/20 rounded-lg p-1.5">
                <div className="grid grid-cols-5 gap-1.5">
                  {availableImages.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => handleImageSelect(image)}
                      className={`relative rounded overflow-hidden cursor-pointer border-2 transition-all h-12 ${
                        selectedBackgroundImage === image
                          ? "border-[#313131] dark:border-[#b8835a] ring-1 ring-[#313131]/30 dark:ring-[#b8835a]/30"
                          : "border-transparent hover:border-gray-300 dark:hover:border-stone-600"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Bg ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBackgroundImage && (
              <div className="relative rounded overflow-hidden group h-16">
                <img
                  src={selectedBackgroundImage}
                  alt="Selected background"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleClearImage}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() =>
            onSave({
              fontSize,
              fontFamily,
              backgroundImage:
                useBackgroundImage && selectedBackgroundImage
                  ? selectedBackgroundImage
                  : undefined,
              videoBackground:
                useVideoBackground && selectedVideoBackground
                  ? selectedVideoBackground
                  : undefined,
            })
          }
          disabled={!selectedBook || !fetchedScriptureText}
          className="w-full px-3 py-2 text-[0.9rem] font-semibold rounded-lg bg-gradient-to-r from-[#313131] to-[#303030] dark:from-[#313131] dark:to-[#313131] text-white hover:from-[#252525] hover:to-[#202020] dark:hover:from-[#c99466] dark:hover:to-[#9a6e48] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-1"
        >
          <Search className="w-3 h-3" />
          Save & Project
        </button>
      </div>
    </div>
  );
};
