import React, { useMemo } from "react";
import { Menu, X, Search, Star, RotateCcw, Book, Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSidebarExpanded, setActiveFeature, setSearchOpen } from "@/store/slices/bibleSlice";

const BibleSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarExpanded, activeFeature, searchOpen, theme } = useAppSelector((state) => state.bible);

  // Generate random colors only once on component mount using useMemo
  const iconColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},1)`;
    };

    return {
      menu: generateRandomColor(),
      search: generateRandomColor(),
      bookmark: generateRandomColor(),
      history: generateRandomColor(),
      library: generateRandomColor(),
      settings: generateRandomColor(),
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  const toggleSidebar = () => {
    dispatch(setSidebarExpanded(!sidebarExpanded));
  };

  const toggleFeature = (feature: string) => {
    dispatch(setActiveFeature(activeFeature === feature ? null : feature));
  };

  const toggleSearch = () => {
    dispatch(setSearchOpen(!searchOpen));
  };

  return (
    <div
      className={`fixed top-8 left-0 h-full bg-white dark:bg-ltgray border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-10 ${
        sidebarExpanded ? "w-48" : "w-12"
      }`}
    >
      {/* Sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="w-full h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
        style={{ color: iconColors.menu }}
      >
        {sidebarExpanded ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Search button */}
      <button
        onClick={toggleSearch}
        className={`w-full h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 ${
          searchOpen ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
        style={{ color: iconColors.search }}
      >
        <Search size={24} />
      </button>

      {/* Bookmarks button */}
      <button
        onClick={() => toggleFeature("bookmarks")}
        className={`w-full h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 ${
          activeFeature === "bookmarks" ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
        style={{ color: iconColors.bookmark }}
      >
        <Star size={24} />
      </button>

      {/* History button */}
      <button
        onClick={() => toggleFeature("history")}
        className={`w-full h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 ${
          activeFeature === "history" ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
        style={{ color: iconColors.history }}
      >
        <RotateCcw size={24} />
      </button>

      {/* Library button */}
      <button
        onClick={() => toggleFeature("library")}
        className={`w-full h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 ${
          activeFeature === "library" ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
        style={{ color: iconColors.library }}
      >
        <Book size={24} />
      </button>

      {/* Settings button */}
      <button
        onClick={() => toggleFeature("settings")}
        className={`w-full h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 ${
          activeFeature === "settings" ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
        style={{ color: iconColors.settings }}
      >
        <Settings size={24} />
      </button>
    </div>
  );
};

export default BibleSidebar;
