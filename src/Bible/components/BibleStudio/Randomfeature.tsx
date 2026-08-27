import React, { useState } from "react";
import { Info, Search } from "lucide-react";
import { Tooltip } from "antd";
import { BackgroundCard } from "./BackgroundCard";
import { VisitedScripturesList } from "./VisitedScripturesList";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  navigateToVerse,
  removeFromHistory,
  clearHistory,
  setProjectionBackgroundImage,
  setProjectionGradientColors,
  setProjectionBackgroundColor,
  setSelectedBackground,
} from "@/store/slices/bibleSlice";

interface RandomFeatureProps {
  isDarkMode: boolean;
  projectionFontFamily: string;
  projectionFontSize: number;
  projectionTextColor: string;
  projectionBackgroundImage: string;
  projectionGradientColors: string[];
  projectionBackgroundColor: string;
  currentTranslation: string;
  currentBook: string;
  currentChapter: number;
  bibleBgs: string[];
  onOpenSearch?: () => void;
}

export const RandomFeature: React.FC<RandomFeatureProps> = ({
  isDarkMode,
  projectionBackgroundColor,
  projectionBackgroundImage,
  projectionGradientColors,
  onOpenSearch,
}) => {
  const dispatch = useAppDispatch();
  const history = useAppSelector((state) => state.bible.history);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );

  const currentBackgroundType: "solid" | "image" =
    projectionBackgroundImage && projectionBackgroundImage.trim() !== ""
      ? "image"
      : "solid";

  const handleSelectSolidColor = () => {
    // If an image was active, remember it in localStorage so it can be restored
    if (projectionBackgroundImage && projectionBackgroundImage.trim() !== "") {
      try {
        localStorage.setItem(
          "lastSavedProjectionBackgroundImage",
          projectionBackgroundImage,
        );
      } catch (e) {
        // ignore
      }
    }

    // Clear background image in Redux
    dispatch(setProjectionBackgroundImage(""));
    try {
      localStorage.setItem("bibleProjectionBackgroundImage", "");
    } catch (e) {
      // ignore
    }

    // Ensure gradient or solid color is active
    const activeGradient =
      projectionGradientColors && projectionGradientColors.length >= 2
        ? projectionGradientColors
        : ["#0f172a", "#1e293b"];

    dispatch(setProjectionGradientColors(activeGradient));

    // Send live update to presentation window
    if (typeof window !== "undefined" && (window as any).ipcRenderer) {
      (window as any).ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: {
          backgroundImage: "",
          gradientColors: activeGradient,
          backgroundColor: projectionBackgroundColor || "#0f172a",
        },
      });
    }
  };

  const handleSelectImageBackground = () => {
    // Retrieve last saved image or default preset image
    let imageToRestore = "";
    try {
      imageToRestore =
        localStorage.getItem("lastSavedProjectionBackgroundImage") || "";
    } catch (e) {
      // ignore
    }

    if (!imageToRestore || imageToRestore.trim() === "") {
      imageToRestore = "./paint-sweeps-strong.jpg";
    }

    // Dispatch to Redux
    dispatch(setProjectionBackgroundImage(imageToRestore));
    dispatch(setSelectedBackground(imageToRestore));
    dispatch(setProjectionGradientColors([]));

    try {
      localStorage.setItem("bibleProjectionBackgroundImage", imageToRestore);
    } catch (e) {
      // ignore
    }

    // Send live update to presentation window
    if (typeof window !== "undefined" && (window as any).ipcRenderer) {
      (window as any).ipcRenderer.send("bible-presentation-update", {
        type: "updateStyle",
        data: {
          backgroundImage: imageToRestore,
          gradientColors: [],
        },
      });
    }
  };

  const handleNavigateAndProject = (reference: string) => {
    const match = reference.match(
      /^(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+))?$/,
    );
    if (!match) return;

    const book = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : undefined;

    // Synchronously update Redux state
    dispatch(
      navigateToVerse({
        book,
        chapter,
        verse,
      }),
    );

    // Send presentation update immediately
    if (
      typeof window !== "undefined" &&
      (window as any).api &&
      bibleData &&
      currentTranslation
    ) {
      try {
        const translationData = bibleData[currentTranslation];
        const bookData = translationData?.books?.find(
          (b: any) => b.name.toLowerCase() === book.toLowerCase(),
        );
        const chapterData = bookData?.chapters?.find(
          (ch: any) => ch.chapter === chapter,
        );

        if (chapterData?.verses) {
          const presentationData = {
            book: bookData?.name || book,
            chapter,
            verses: chapterData.verses,
            translation: currentTranslation,
            selectedVerse: verse || undefined,
          };

          (window as any).api.sendToBiblePresentation({
            type: "update-data",
            data: presentationData,
          });

          setTimeout(() => {
            try {
              (window as any).api.sendToBiblePresentation({
                type: "update-data",
                data: presentationData,
              });
            } catch (e) {
              // ignore
            }
          }, 160);
        }
      } catch (e) {
        // ignore errors
      }
    }
  };

  const handleRemoveHistory = (reference: string) => {
    dispatch(removeFromHistory(reference));
  };

  const handleClearHistory = () => {
    dispatch(clearHistory());
  };

  return (
    <div className="w-full h-full p-3 flex flex-col gap-2.5 overflow-hidden bg-card-bg">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-header-gradient-from to-header-gradient-to shadow-xs">
            <Info className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-[0.82rem] font-semibold text-text-primary tracking-tight">
            Presentation Settings
          </h3>
        </div>

        {onOpenSearch && (
          <Tooltip title="Search Scripture">
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-lg bg-select-bg hover:bg-btn-active-from hover:text-white text-text-secondary hover:ring-2 hover:ring-[var(--btn-active-from)] hover:ring-offset-1 hover:ring-offset-[var(--card-bg)] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[0.65rem] font-semibold">Search</span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* Background Control Card */}
      <div className="flex-shrink-0 rounded-xl bg-card-bg-alt p-2 shadow-2xs">
        <BackgroundCard
          isDarkMode={isDarkMode}
          projectionBackgroundColor={projectionBackgroundColor}
          projectionBackgroundImage={projectionBackgroundImage}
          projectionGradientColors={projectionGradientColors}
          onSelectSolidColor={handleSelectSolidColor}
          onSelectImageBackground={handleSelectImageBackground}
          currentBackgroundType={currentBackgroundType}
        />
      </div>

      {/* Visited Scriptures List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <VisitedScripturesList
          history={history}
          bibleData={bibleData}
          currentTranslation={currentTranslation}
          isDarkMode={isDarkMode}
          onNavigate={handleNavigateAndProject}
          onRemove={handleRemoveHistory}
          onClear={handleClearHistory}
        />
      </div>
    </div>
  );
};
