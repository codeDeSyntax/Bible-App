import React from "react";
import { QuickScriptureCard } from "./QuickScriptureCard";
import { Bookmark } from "lucide-react";

export interface SavedScripture {
  id: string;
  reference: string; // e.g., "John 3:16"
  book: string;
  chapter: number;
  verse: number;
  text: string;
  backgroundImage?: string;
  timestamp: number;
}

interface QuickScriptureListProps {
  scriptures: SavedScripture[];
  isDarkMode: boolean;
  onNavigate: (scripture: SavedScripture) => void;
  onRemove: (id: string) => void;
}

/**
 * Quick Scripture Access List
 * Displays all saved scriptures for quick access
 */
export const QuickScriptureList: React.FC<QuickScriptureListProps> = ({
  scriptures,
  isDarkMode,
  onNavigate,
  onRemove,
}) => {
  if (scriptures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {/* <Bookmark className="w-8 h-8 text-text-secondary mb-2" /> */}
        <img
          src="./svgs/no_files.svg"
          alt="No Scriptures"
          className="w-12 h-12 mb-2 animate-bounce"
        />
        <p className="text-xs text-text-secondary mt-1">
          Save scriptures for quick access
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {scriptures.map((scripture) => (
        <QuickScriptureCard
          key={scripture.id}
          id={scripture.id}
          reference={scripture.reference}
          text={scripture.text}
          backgroundImage={scripture.backgroundImage}
          onNavigate={() => onNavigate(scripture)}
          onRemove={() => onRemove(scripture.id)}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
};
