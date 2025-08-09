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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { MoreHorizontal } from "lucide-react";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";
import Help from "@/shared/Help";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { setCurrentScreen } from "@/store/slices/appSlice";
import {
  setActiveFeature,
  setViewMode,
  setReaderSettingsOpen,
  setVerseByVerseMode,
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
  const { handleMinimize, handleMaximize, handleClose } = useBibleOperations();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showProjectionControlRoom, setShowProjectionControlRoom] =
    useState<boolean>(false);
  const [selectedBg, setSelectedBg] = useState<string>('url("./wood2.jpg")');
  const [nextBg, setNextBg] = useState<string>('url("./wood7.png")');
  const [bgOpacity, setBgOpacity] = useState<number>(1);
  const [selectedPath, setSelectedPath] = useState<string>(
    () => localStorage.getItem("evpresenterfilespath") || ""
  );

  const setAndSaveCurrentScreen = useCallback(
    (screen: string) => {
      dispatch(setCurrentScreen(screen as any));
    },
    [dispatch]
  );

  const selectEvpd = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSelectedPath(path);
      localStorage.setItem("evpresenterfilespath", path);
    } else {
      console.error("Invalid path selected");
    }
  };

  const ltImages = [
    'url("./wood2.jpg")',
    'url("./wood10.jpg")',
    'url("./wood11.jpg")',
    'url("./wood7.png")',
    'url("./wood6.jpg")',
  ];

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.contentEditable === "true";

      if (isInputFocused) return;

      // 'S' key - Toggle Control Room (only in audience/projection mode)
      if (event.key.toLowerCase() === "s" && !event.ctrlKey && !event.metaKey) {
        if (verseByVerseMode) {
          event.preventDefault();
          setShowProjectionControlRoom(!showProjectionControlRoom);
        }
      }

      // 'D' key - Toggle Reader Settings Dropdown (only in reader mode)
      if (event.key.toLowerCase() === "d" && !event.ctrlKey && !event.metaKey) {
        if (!verseByVerseMode) {
          event.preventDefault();
          dispatch(setReaderSettingsOpen(!readerSettingsOpen));
        }
      }

      // ESC key - Close any open dropdowns
      if (event.key === "Escape") {
        if (showProjectionControlRoom) {
          setShowProjectionControlRoom(false);
        }
        if (readerSettingsOpen) {
          dispatch(setReaderSettingsOpen(false));
        }
        if (showDropdown) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    verseByVerseMode,
    showProjectionControlRoom,
    readerSettingsOpen,
    showDropdown,
    dispatch,
  ]);

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
                // backgroundColor: "rgba(0, 102, 255, 0.2)", // semi-transparent blue
                zIndex: 10,
              }
            : {
                backgroundImage: isDarkMode
                  ? `linear-gradient(to bottom,
             rgba(28, 25, 23, 0%) 0%,
             rgba(25, 28, 23) 60%),
             url(./wood6.jpg)`
                  : undefined,
                backgroundRepeat: "repeat",
                backgroundSize: "20px", // Adjust size to control repeat pattern
              }),
        }}
      >
        <div
          className=" space-x-2 mr-4 flex items-center justify-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* theme toggler */}
          <ThemeToggle />
          <Help />
          {/* Projection Control Room button - only active in audience mode */}
          <div
            onClick={() =>
              verseByVerseMode && setShowProjectionControlRoom(true)
            }
            className={`w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer ${
              verseByVerseMode
                ? "hover:bg-gray-50 dark:hover:bg-bgray"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={
              verseByVerseMode
                ? "Projection Control Room (S)"
                : "Available only in Audience mode"
            }
          >
            <Monitor
              className={`w-4 h-4 ${
                verseByVerseMode
                  ? "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  : "text-gray-400 dark:text-gray-600"
              }`}
            />
          </div>
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
              <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            ) : (
              <Users className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
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
                title="Reader Settings (D)"
              >
                <SlidersHorizontal
                  className={`w-4 h-4 ${
                    readerSettingsOpen
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  } group-hover:text-blue-600 dark:group-hover:text-blue-400`}
                />
              </div>
              <ReaderSettingsDropdown />
            </div>
          )}
          {/* Close button */}
          <div
            onClick={handleClose}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
          </div>
          {/* Minimize button */}
          <div
            onClick={handleMinimize}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
          >
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
          </div>
          {/* Maximize button */}
          <div
            onClick={handleMaximize}
            className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
          >
            <Square className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
          </div>
        </div>
        {/* Rest of the component remains the same */}
        <div className="text-sm flex-1 text-center text-gray-900 dark:text-gray-300 font-cooper">
          Bible 300
        </div>
        <div
          onClick={toggleDropdown}
          className="w-4 h-4 rounded-full bg-gray-500 hover:bg-gray-600 hover:cursor-pointer flex items-center justify-center relative"
          title="More tools"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <MoreHorizontal className="text-white z-20 size-3" />

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute top-5 left-0 bg-white dark:bg-bgray shadow-md rounded-md p-1 z-20 w-32">
              {/* <div
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-ltgray rounded cursor-pointer"
              onClick={() => {
                setAndSaveCurrentScreen("hisvoice");
                setShowDropdown(false);
              }}
            >
              <img src="./icon.png" className="h-4 w-4  text-gray-600" />
              <span className="text-xs text-stone-500 dark:text-gray-200">
                His voice
              </span>
            </div> */}
              <div
                className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-ltgray rounded cursor-pointer"
                onClick={() => {
                  setAndSaveCurrentScreen("Songs");
                  setShowDropdown(false);
                }}
              >
                <img src="./music2.png" className="h-4 w-4  text-gray-600" />
                <span className="text-xs text-stone-500 dark:text-gray-200">
                  Song app
                </span>
              </div>
              <div
                className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-ltgray rounded cursor-pointer"
                onClick={() => {
                  setAndSaveCurrentScreen("bible");
                  setShowDropdown(false);
                }}
              >
                <img src="./music3.png" className="h-4 w-4  text-gray-600" />
                <span className="text-xs text-stone-500 dark:text-gray-200">
                  Bible
                </span>
              </div>
              <div className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-ltgray rounded cursor-pointer">
                <Monitor
                  className="h-4 w-4  text-gray-600"
                  onClick={() => {
                    setAndSaveCurrentScreen("mpresenter");
                    setShowDropdown(false);
                  }}
                />
                <span className="text-xs text-stone-500 dark:text-gray-200 ">
                  {selectedPath ? (
                    <p>PMaster {selectedPath.slice(0, 8)}</p>
                  ) : (
                    <p onClick={selectEvpd} className="underline">
                      Choose Path (PM)
                    </p>
                  )}
                </span>
              </div>
            </div>
          )}
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
