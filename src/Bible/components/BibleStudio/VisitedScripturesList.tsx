import React from "react";
import { VisitedScriptureCard } from "./VisitedScriptureCard";
import type { HistoryEntry } from "@/store/slices/bibleSlice";
import { Clock3, Trash2 } from "lucide-react";

interface VisitedScripturesListProps {
  history: HistoryEntry[];
  bibleData?: any;
  currentTranslation: string;
  isDarkMode: boolean;
  onNavigate: (reference: string) => void;
  onRemove: (reference: string) => void;
  onClear?: () => void;
}

/**
 * Helper to resolve verse text given a reference string e.g. "John 3:16" or "Genesis 1:1"
 */
export const getVerseTextFromReference = (
  reference: string,
  bibleData: any,
  currentTranslation: string,
): string => {
  if (!reference || !bibleData || !currentTranslation) return "";

  const translationData = bibleData[currentTranslation];
  if (!translationData?.books) return "";

  // Match "Book Chapter:Verse" or "1 Book Chapter:Verse"
  const match = reference.match(/^(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+))?$/);
  if (!match) return "";

  const bookName = match[1].trim();
  const chapterNum = parseInt(match[2], 10);
  const verseNum = match[3] ? parseInt(match[3], 10) : 1;

  const book = translationData.books.find(
    (b: any) => b.name.toLowerCase() === bookName.toLowerCase(),
  );
  if (!book?.chapters) return "";

  const chapter = book.chapters.find((ch: any) => ch.chapter === chapterNum);
  if (!chapter?.verses) return "";

  const verseObj = chapter.verses.find((v: any) => v.verse === verseNum);
  if (!verseObj) return "";

  return typeof verseObj === "string" ? verseObj : verseObj.text || "";
};

/**
 * Visited Scriptures List
 * Displays recently visited scriptures with text preview and instant 1-click projection
 */
export const VisitedScripturesList: React.FC<VisitedScripturesListProps> = ({
  history,
  bibleData,
  currentTranslation,
  isDarkMode,
  onNavigate,
  onRemove,
  onClear,
}) => {
  // Filter for valid scripture references (e.g. contains numbers)
  const validHistory = (history || []).filter((h) => /\d+/.test(h.reference));

  if (validHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <img
          src="./svgs/no_files.svg"
          alt="No History"
          className="w-12 h-12 mb-2 opacity-60"
        />
        <p className="text-xs text-text-secondary mt-1">
          No visited scriptures yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1 mb-0.5">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Clock3 className="w-3.5 h-3.5" />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider">
            Recent History ({validHistory.length})
          </span>
        </div>
        {onClear && validHistory.length > 0 && (
          <button
            onClick={onClear}
            className="text-[0.65rem] text-text-secondary hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
            title="Clear all visited scriptures"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col w-full">
        {validHistory.map((item) => {
          const text = getVerseTextFromReference(
            item.reference,
            bibleData,
            currentTranslation,
          );

          return (
            <VisitedScriptureCard
              key={`${item.reference}-${item.timestamp}`}
              reference={item.reference}
              text={text}
              onNavigate={() => onNavigate(item.reference)}
              onRemove={() => onRemove(item.reference)}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </div>
    </div>
  );
};
