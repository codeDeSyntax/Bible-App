import React, { useState, useEffect } from "react";
import { ArrowLeftCircle } from "lucide-react";
import Biblelayout from "./Bible/Bible";
import BiblePresentationDisplay from "./Bible/components/BiblePresentationDisplay";
import UniversalPresentationDisplay from "./Bible/components/UniversalPresentationDisplay";
import WelcomeScreen from "./components/WelcomeScreen";
import { useAppSelector, useAppDispatch } from "./store";
import { setCurrentScreen, setFirstTimeVisited } from "./store/slices/appSlice";
import { SecretLogsManager } from "./components/SecretLogsManager";

const App = () => {
  const currentScreen = useAppSelector((state) => state.app.currentScreen);
  const isFirstTime = useAppSelector((state) => state.app.isFirstTime);
  const dispatch = useAppDispatch();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  const handleEnterApp = () => {
    dispatch(setFirstTimeVisited());
    dispatch(setCurrentScreen("bible"));
  };

  // Handle hash-based routing for special pages like Bible presentation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    // Set initial route on mount (important for production)
    setCurrentRoute(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Handle special routes - support both hash formats
  if (
    currentRoute === "#/bible-presentation-display" ||
    currentRoute === "#bible-presentation-display"
  ) {
    return <BiblePresentationDisplay />;
  }

  // Universal presentation display for presets
  if (
    currentRoute.startsWith("#/presentation") ||
    currentRoute.startsWith("#presentation")
  ) {
    return <UniversalPresentationDisplay />;
  }

  // set up key combinations to navigate between screens
  // ctrl + B ---- Bible

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case "b":
            dispatch(setCurrentScreen("bible"));
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  // Additional safety check - parse URL parameters if hash routing fails
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const routeParam = urlParams.get("route");

    if (routeParam === "bible-presentation") {
      console.log("Detected route via URL parameter: bible-presentation");
      setCurrentRoute("#bible-presentation-display");
    }
  }, []);

  return (
    <SecretLogsManager>
      {/* Show welcome screen for first-time users or when welcome screen is selected */}
      {isFirstTime || currentScreen === "welcome" ? (
        <WelcomeScreen onEnterApp={handleEnterApp} />
      ) : (
        <div
          className={`flex flex-col h-screen w-screen thin-scrollbar no-scrollbar bg-white dark:bg-ltgray `}
          style={{ fontFamily: "Palatino" }}
        >
          {currentScreen === "bible" ? <Biblelayout /> : <Biblelayout />}
        </div>
      )}
    </SecretLogsManager>
  );
};

export default App;
