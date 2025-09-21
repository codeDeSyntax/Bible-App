import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Minus,
  Square,
  Monitor,
  LayoutGrid,
  BookOpen,
  Type,
  Users,
  SlidersHorizontal,
  Home,
  Image,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { MoreHorizontal } from "lucide-react";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";
import Help from "@/shared/Help";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { setCurrentScreen, goToWelcomeScreen } from "@/store/slices/appSlice";
import {
  setActiveFeature,
  setViewMode,
  setReaderSettingsOpen,
  setVerseByVerseMode,
  setProjectionTextColor,
  setVerseByVerseTextColor,
} from "@/store/slices/bibleSlice";
import { BibleProjectionControlRoom } from "./components/BibleProjectionControlRoom";
import ReaderSettingsDropdown from "./components/ReaderSettingsDropdown";

const TitleBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.bible.theme);
  const viewMode = useAppSelector((state) => state.bible.viewMode);
  const readerSettingsOpen = useAppSelector(
    (state) => state.bible.readerSettingsOpen
  );
  const verseByVerseMode = useAppSelector(
    (state) => state.bible.verseByVerseMode
  );
  const imageBackgroundMode = useAppSelector(
    (state) => state.bible.imageBackgroundMode
  );
  const projectionTextColor = useAppSelector(
    (state) => state.bible.projectionTextColor
  );
  const verseByVerseTextColor = useAppSelector(
    (state) => state.bible.verseByVerseTextColor
  );
  const { handleMinimize, handleMaximize, handleClose } = useBibleOperations();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showProjectionControlRoom, setShowProjectionControlRoom] =
    useState<boolean>(false);
  const [selectedBg, setSelectedBg] = useState<string>('url("./wood6.jpg")');
  const [nextBg, setNextBg] = useState<string>('url("./wood7.png")');
  const [bgOpacity, setBgOpacity] = useState<number>(1);
  const [selectedPath, setSelectedPath] = useState<string>(
    () => localStorage.getItem("bibleFilespath") || ""
  );

  const setAndSaveCurrentScreen = useCallback(
    (screen: string) => {
      dispatch(setCurrentScreen(screen as any));
    },
    [dispatch]
  );

  // Keyboard shortcut handler for control room toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Ctrl+S in audience mode (verse-by-verse mode)
      if (
        event.key.toLowerCase() === "s" &&
        event.ctrlKey &&
        verseByVerseMode
      ) {
        event.preventDefault();
        setShowProjectionControlRoom((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [verseByVerseMode]);

  // Auto-switch text color based on theme in verse-by-verse mode
  useEffect(() => {
    console.log("🎨 Theme auto-switch triggered:", {
      verseByVerseMode,
      imageBackgroundMode,
      isDarkMode,
      currentProjectionTextColor: projectionTextColor,
      currentVerseByVerseTextColor: verseByVerseTextColor,
    });

    // Only apply auto-switching in verse-by-verse mode
    if (verseByVerseMode) {
      if (imageBackgroundMode) {
        // For verse-by-verse with background image: always white
        console.log("🎨 Setting white text for background mode");
        if (projectionTextColor !== "#ffffff") {
          dispatch(setProjectionTextColor("#ffffff"));
          localStorage.setItem("bibleProjectionTextColor", "#ffffff");
        }
        if (verseByVerseTextColor !== "#ffffff") {
          dispatch(setVerseByVerseTextColor("#ffffff"));
          localStorage.setItem("bibleVerseByVerseTextColor", "#ffffff");
        }

        // Send IPC update immediately
        if (typeof window !== "undefined" && window.ipcRenderer) {
          window.ipcRenderer.send("bible-presentation-update", {
            type: "updateStyle",
            data: { textColor: "#ffffff" },
          });
        }
      } else {
        // For verse-by-verse without background image: theme-based colors
        const targetColor = isDarkMode ? "#fcd8c0" : "#000000";
        console.log(
          "🎨 Setting theme-based text color:",
          targetColor,
          "for isDarkMode:",
          isDarkMode
        );

        // Update both projection and verse-by-verse text colors
        if (projectionTextColor !== targetColor) {
          console.log(
            "🎨 Updating projection text color from",
            projectionTextColor,
            "to",
            targetColor
          );
          dispatch(setProjectionTextColor(targetColor));
          localStorage.setItem("bibleProjectionTextColor", targetColor);
        }

        if (verseByVerseTextColor !== targetColor) {
          console.log(
            "🎨 Updating verse-by-verse text color from",
            verseByVerseTextColor,
            "to",
            targetColor
          );
          dispatch(setVerseByVerseTextColor(targetColor));
          localStorage.setItem("bibleVerseByVerseTextColor", targetColor);
        }

        // Send multiple IPC updates to ensure it reaches the display
        if (typeof window !== "undefined" && window.ipcRenderer) {
          // Update style
          window.ipcRenderer.send("bible-presentation-update", {
            type: "updateStyle",
            data: { textColor: targetColor },
          });

          // Also send a more general update
          window.ipcRenderer.send("bible-projection-style-update", {
            textColor: targetColor,
            timestamp: Date.now(),
          });
        }

        // Force a re-render by dispatching additional actions
        setTimeout(() => {
          dispatch(setVerseByVerseTextColor(targetColor));
          dispatch(setProjectionTextColor(targetColor));
        }, 100);
      }
    }
  }, [
    isDarkMode,
    verseByVerseMode,
    imageBackgroundMode,
    dispatch,
    projectionTextColor,
    verseByVerseTextColor,
  ]);

  const selectEvpd = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSelectedPath(path);
      localStorage.setItem("bibleFilespath", path);
    } else {
      console.error("Invalid path selected");
    }
  };

  const ltImages = ['url("./wood7.png")', 'url("./wood6.jpg")'];

  const randomImage = useCallback(() => {
    const currentIndex = ltImages.indexOf(selectedBg);
    let newIndex = currentIndex;

    // Ensure we select a different image
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * ltImages.length);
    }

    setNextBg(ltImages[newIndex]);
    // Start transition
    setBgOpacity(0);
  }, [selectedBg]);

  useEffect(() => {
    // Set up interval for image switching
    const intervalId = setInterval(randomImage, 20000); // 5 minutes (300000 ms)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [randomImage]);

  useEffect(() => {
    // When opacity reaches 0, switch background and reset opacity
    if (bgOpacity === 0) {
      const transitionTimer = setTimeout(() => {
        setSelectedBg(nextBg);
        setBgOpacity(1);
      }, 5000); // Matches transition duration

      return () => clearTimeout(transitionTimer);
    }
  }, [bgOpacity, nextBg]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="" style={{ WebkitAppRegion: "drag" } as any}>
      <div
        className="h-8 flex items-center flex-row-reverse px-4 border-b   border-gray-300 dark:border-gray-700 select-none relative"
        style={{
          ...(!isDarkMode
            ? {
                backgroundImage: !isDarkMode
                  ? `linear-gradient(to bottom,
             rgba(255, 255, 255, 0%) 0%,
             rgba(255, 255, 255, 5) 60%),
             ${selectedBg}`
                  : undefined,
                backgroundRepeat: "repeat",
                backgroundSize: "30px", // Adjust size to control repeat pattern
                backdropFilter: "blur(10px)",
                // backgroundColor: "rgba(0, 102, 255, 0.2)", // semi-transparent amber
                zIndex: 10,
              }
            : {
                backgroundImage: isDarkMode
                  ? `linear-gradient(to bottom,
             rgba(53, 41, 37, 0) 0%,
             rgba(53, 41, 33, 1) 56%),
              ${selectedBg}`
                  : undefined,
                backgroundRepeat: "repeat",
                backgroundSize: "20px", // Adjust size to control repeat pattern
              }),
        }}
      >
        {/* Left side - Home icon */}
        <div
          className="absolute left-4 flex items-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <div
            onClick={() => dispatch(goToWelcomeScreen())}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-bgray"
            title="Go to Welcome Screen"
          >
            <Home className="w-4 h-4 text-gray-600 dark:text-[#f8ccab] group-hover:text-amber-600 dark:group-hover:text-amber-400" />
          </div>
        </div>

        {/* Right side controls */}
        <div
          className=" space-x-2 mr-4 flex items-center justify-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* theme toggler */}
          <ThemeToggle />
          <Help />

          {/* Image Viewer Toggle */}
          <div
            onClick={() => dispatch(setCurrentScreen("imageViewer"))}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-bgray"
            title="Open Image Viewer"
          >
            <Image className="w-4 h-4 text-gray-600 dark:text-[#f8ccab] group-hover:text-amber-600 dark:group-hover:text-amber-400" />
          </div>

          {/* Projection Control Room button - only show in audience/projection mode */}
          {verseByVerseMode && (
            <div
              onClick={() => setShowProjectionControlRoom(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-bgray"
              title="Projection Control Room (Press 'Ctrl+S' to toggle)"
            >
              <Monitor className="w-4 h-4 text-gray-600 dark:text-[#f8ccab] group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </div>
          )}
          {/* View Mode Toggle button - toggles between Reader modes and Audience mode */}
          <div
            onClick={() => {
              // Toggle between reader mode (block/paragraph) and audience mode (verse-by-verse)
              dispatch(setVerseByVerseMode(!verseByVerseMode));
            }}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-bgray"
            title={
              verseByVerseMode
                ? "Switch to Reader Mode"
                : "Switch to Audience Mode"
            }
          >
            {verseByVerseMode ? (
              <BookOpen className="w-4 h-4 text-gray-600 dark:text-[#f8ccab] group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            ) : (
              <Users className="w-4 h-4 text-gray-600 dark:text-[#f8ccab] group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            )}
          </div>
       
          {/* Reader Settings Dropdown Toggle - only show in reader mode */}
          {!verseByVerseMode && (
            <div className="relative">
              <div
                onClick={() =>
                  dispatch(setReaderSettingsOpen(!readerSettingsOpen))
                }
                className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-bgray"
                title="Reader Settings"
              >
                <SlidersHorizontal
                  className={`w-4 h-4 ${
                    readerSettingsOpen
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-gray-600 dark:text-[#f8ccab]"
                  } group-hover:text-amber-600 dark:group-hover:text-amber-400`}
                />
              </div>
              <ReaderSettingsDropdown />
            </div>
          )}
          {/* Close button */}
          <div
            onClick={handleClose}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-red-500"
          >
            <X className="w-4 h-4 text-primary dark:text-dtext group-hover:text-black dark:group-hover:text-white" />
          </div>
          {/* Minimize button */}
          <div
            onClick={handleMinimize}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
          >
            <Minus className="w-4 h-4 text-gray-600 dark:text-[#f8ccab] group-hover:text-black dark:group-hover:text-white" />
          </div>
          {/* Maximize button */}
          <div
            onClick={handleMaximize}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
          >
            <Square className="w-4 h-4 text-gray-600 dark:text-[#f8ccab] group-hover:text-black dark:group-hover:text-white" />
          </div>
        </div>
        {/* Rest of the component remains the same */}
        <div className="text-sm flex-1 text-center text-gray-900 dark:text-gray-300 font-cooper">
          Bible 300
        </div>
      </div>

      {/* Bible Projection Control Room */}
      <BibleProjectionControlRoom
        isOpen={showProjectionControlRoom}
        onClose={() => setShowProjectionControlRoom(false)}
      />
    </div>
  );
};

export default TitleBar;
