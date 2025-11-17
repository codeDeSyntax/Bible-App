import React, { useEffect, useRef } from "react";
import TitleBar from "./Titlebar";
import ScriptureContent from "./ScriptureContent";
import FeatureModal from "./components/FeatureModal";
import ShortcutsModal from "./components/ShortcutsModal";
import { useAppSelector, useAppDispatch } from "@/store";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import {
  TRANSLATIONS,
  setActiveFeature,
  setFullScreen,
} from "@/store/slices/bibleSlice";
import { setBibleBgs } from "@/store/slices/appSlice";

const Biblelayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, currentTranslation, activeFeature, verseByVerseMode } =
    useAppSelector((state) => state.bible);
  const isFullScreen = useAppSelector((state) => state.bible.isFullScreen);
  const { initializeBibleData } = useBibleOperations();

  const initializationRef = useRef(false);

  // Initialize Bible data
  useEffect(() => {
    // Only initialize if we have a valid translation
    if (
      !initializationRef.current &&
      currentTranslation &&
      Object.keys(TRANSLATIONS).includes(currentTranslation)
    ) {
      initializationRef.current = true;
      initializeBibleData();
    }
  }, [currentTranslation]); // Add currentTranslation as a dependency

  // Initialize Bible backgrounds from custom directory
  useEffect(() => {
    const loadCustomImages = async () => {
      const customImagesPath = localStorage.getItem("bibleCustomImagesPath");
      if (customImagesPath) {
        try {
          const images = await window.api.getImages(customImagesPath);
          dispatch(setBibleBgs(images));
        } catch (error) {
          console.error("Failed to load custom images:", error);
          // Load default backgrounds if custom images fail
          dispatch(
            setBibleBgs([
              "./wood2.jpg",
              "./wood6.jpg",
             
              "./wood10.jpg",
           
            ])
          );
        }
      } else {
        // Load default backgrounds if no custom path
        dispatch(
          setBibleBgs([
            "./wood2.jpg",
            "./wood6.jpg",
           
            "./wood10.jpg",
           
          ])
        );
      }
    };

    loadCustomImages();
  }, [dispatch]);

  useEffect(() => {
    const hisvoicediv = document.getElementById("hisvoicediv");
    if (theme === "dark") {
      hisvoicediv?.classList.add("dark");
      localStorage.setItem("vsermontheme", theme);
    } else {
      hisvoicediv?.classList.remove("dark");
      localStorage.setItem("vsermontheme", theme);
    }
  }, [theme]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "l":
          dispatch(
            setActiveFeature(activeFeature === "library" ? null : "library")
          );
          break;
        case "b":
          dispatch(
            setActiveFeature(activeFeature === "bookmarks" ? null : "bookmarks")
          );
          break;
        case "h":
          dispatch(
            setActiveFeature(activeFeature === "history" ? null : "history")
          );
          break;
        case "/":
          e.preventDefault();
          dispatch(
            setActiveFeature(activeFeature === "search" ? null : "search")
          );
          break;
        case "?":
          dispatch(
            setActiveFeature(activeFeature === "shortcuts" ? null : "shortcuts")
          );
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            dispatch(setFullScreen(!isFullScreen));
          }
          break;
        case "escape":
          if (isFullScreen) {
            dispatch(setFullScreen(false));
          } else {
            dispatch(setActiveFeature(null));
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, activeFeature, isFullScreen]);

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden bg-white dark:bg-primary/20 no-scrollbar text-gray-900 dark:text-gray-100`}
      id="biblediv"
    >
      {!isFullScreen && <TitleBar />}

      <div className={`flex-1 flex overflow-hidden ${isFullScreen ? "" : ""}`}>
        {/* Main content */}
        <main className="flex-1">
          <ScriptureContent />
        </main>

        {/* Feature Modal - Only show in audience view (verseByVerseMode) */}
        {verseByVerseMode && <FeatureModal />}

        {/* Shortcuts Modal */}
        <ShortcutsModal />
      </div>
    </div>
  );
};

export default Biblelayout;
