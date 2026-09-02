import React from "react";
import { useAppSelector } from "@/store";
import { BookmarkPanel } from "../BookmarkPanel";
import HistoryPanel from "../HistoryPanel";
import LibraryPanel from "../LibraryPanel";
import ShortcutsModal from "./ShortcutsModal";

const FeatureModal: React.FC = () => {
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);

  if (!activeFeature) return null;

  switch (activeFeature) {
    case "bookmarks":
      return <BookmarkPanel />;
    case "history":
      return <HistoryPanel />;
    case "library":
      return <LibraryPanel />;
    case "shortcuts":
      return <ShortcutsModal />;
    default:
      return null;
  }
};

export default FeatureModal;