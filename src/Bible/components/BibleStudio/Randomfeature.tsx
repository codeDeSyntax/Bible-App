import React, { useState } from "react";
import { Info, Settings } from "lucide-react";
import { BackgroundCard } from "./BackgroundCard";
import { QuickScriptureList, SavedScripture } from "./QuickScriptureList";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  navigateToVerse,
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
    (state) => state.bible.savedScriptures,
  );
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );

  const [currentBackgroundType, setCurrentBackgroundType] = useState<
    "solid" | "image"
  >(projectionBackgroundImage ? "image" : "solid");

  const handleSelectSolidColor = () => {
    setCurrentBackgroundType("solid");
  };

  const handleSelectImageBackground = () => {
    setCurrentBackgroundType("image");
  };

  const handleNavigateToScripture = (scripture: SavedScripture) => {
    // Single atomic dispatch — prevents partial state from firing auto-sync
    dispatch(
      navigateToVerse({
        book: scripture.book,
        chapter: scripture.chapter,
        verse: scripture.verse,
      }),
    );
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
          (b: any) => b.name === scripture.book,
        );
        const chapterData = bookData?.chapters?.find(
          (ch: any) => ch.chapter === scripture.chapter,
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
    <div className="col-start-1 col-span-1 row-start-1 row-span-6 h-full rounded-2xl p-3 flex flex-col gap-3 overflow-hidden border-solid border-3 dark:border-none bg-card-bg  border-select-border">
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-header-gradient-from to-header-gradient-to">
          <Info className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-[0.82rem] font-semibold text-text-primary tracking-tight">
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
        <p className="text-[0.65rem] font-semibold text-text-secondary uppercase tracking-widest mb-2">
          Quick Access
        </p>
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
