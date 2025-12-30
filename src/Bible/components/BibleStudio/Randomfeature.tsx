import React, { useState } from "react";
import { Info, Settings } from "lucide-react";
import { BackgroundCard } from "./BackgroundCard";
import { QuickScriptureList, SavedScripture } from "./QuickScriptureList";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  removeSavedScripture,
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
  verseByVerseMode: boolean;
  bibleBgs: string[];
}

export const RandomFeature: React.FC<RandomFeatureProps> = ({
  isDarkMode,
  projectionBackgroundColor,
  projectionBackgroundImage,
  projectionGradientColors,
}) => {
  const dispatch = useAppDispatch();
  const savedScriptures = useAppSelector(
    (state) => state.bible.savedScriptures
  );
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );

  const [currentBackgroundType, setCurrentBackgroundType] = useState<
    "solid" | "image"
  >(projectionBackgroundImage ? "image" : "solid");

  const handleSelectSolidColor = () => {
    setCurrentBackgroundType("solid");
    // TODO: Dispatch action to update background type in Redux
    console.log("Solid color background selected");
  };

  const handleSelectImageBackground = () => {
    setCurrentBackgroundType("image");
    // TODO: Dispatch action to update background type in Redux
    console.log("Image background selected");
  };

  const handleNavigateToScripture = (scripture: SavedScripture) => {
    dispatch(setCurrentBook(scripture.book));
    dispatch(setCurrentChapter(scripture.chapter));
    dispatch(setCurrentVerse(scripture.verse));
  };

  // Also send an explicit presentation update so clicking a quick-access card
  // immediately opens the scripture on the projection (without waiting for
  // auto-sync effects). This mirrors the payload used elsewhere (`update-data`).
  const handleNavigateAndProject = (scripture: SavedScripture) => {
    // First update app state synchronously
    handleNavigateToScripture(scripture);

    // Then prepare and send presentation payload using selectors (more reliable)
    if (
      typeof window !== "undefined" &&
      (window as any).api &&
      bibleData &&
      currentTranslation
    ) {
      try {
        const translationData = bibleData[currentTranslation];
        const bookData = translationData?.books?.find(
          (b: any) => b.name === scripture.book
        );
        const chapterData = bookData?.chapters?.find(
          (ch: any) => ch.chapter === scripture.chapter
        );

        if (chapterData?.verses) {
          const presentationData = {
            book: scripture.book,
            chapter: scripture.chapter,
            verses: chapterData.verses,
            translation: currentTranslation,
            selectedVerse: scripture.verse || undefined,
          };

          // Apply saved background (if any) via updateStyle so presentation uses it
          try {
            (window as any).api.sendToBiblePresentation({
              type: "updateStyle",
              data: {
                backgroundImage: scripture.backgroundImage || "",
                gradientColors: scripture.backgroundImage ? [] : undefined,
              },
            });
          } catch (e) {
            // ignore style send errors
          }

          // Send immediate update-data
          (window as any).api.sendToBiblePresentation({
            type: "update-data",
            data: presentationData,
          });

          // Re-send after a short delay to override any other IPC messages that
          // may arrive due to app-wide state updates (prevents reset to first verse)
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
        // don't block navigation on presentation errors
      }
    }
  };

  const handleRemoveScripture = (id: string) => {
    dispatch(removeSavedScripture(id));
  };

  return (
    <div className="col-span-1 row-span-6 row-start-1 h-full rounded-xl p-3 flex flex-col gap-4 overflow-hidden  bg-studio-bg dark:bg-card-bg ">
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md"
          style={{
            background: `linear-gradient(to bottom right, var(--header-gradient-from), var(--header-gradient-to))`,
          }}
        >
          <Info className="w-4 h-4" style={{ color: "white" }} />
        </div>
        <h3 className="text-[0.9rem] font-semibold text-text-primary">
          Presentation Settings
        </h3>
      </div>

      {/* Background Control Card */}
      <div className="flex-shrink-0">
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

      {/* Quick Scripture Access List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <h4 className="text-sm font-semibold text-text-primary mb-3">
          Quick Access Scriptures
        </h4>
        <QuickScriptureList
          scriptures={savedScriptures}
          isDarkMode={isDarkMode}
          onNavigate={handleNavigateAndProject}
          onRemove={handleRemoveScripture}
        />
      </div>
    </div>
  );
};
