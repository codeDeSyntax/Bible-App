import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Book,
  Search,
  BookOpen,
  Hash,
  List,
  BookTemplate,
  HandshakeIcon,
  LucideAlignVerticalDistributeCenter,
  LucideAlignHorizontalDistributeCenter,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BooksListCardProps {
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  bookList: any[];
  onBookSelect: (book: string) => void;
  onChapterSelect: (chapter: number) => void;
  onVerseSelect: (verse: number) => void;
  getChapters: () => number[];
  getVerses: () => number[];
  getCurrentChapterVerses: () => any[];
  isDarkMode: boolean;
}

/**
 * Card 2: Books, Chapters & Verses List
 * Organized navigation through Bible structure
 */
export const BooksListCard: React.FC<BooksListCardProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  bookList,
  onBookSelect,
  onChapterSelect,
  onVerseSelect,
  getChapters,
  getVerses,
  getCurrentChapterVerses,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<"books" | "chapters" | "verses">(
    "books",
  );
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const [isAlphabetical, setIsAlphabetical] = useState(false);
  const [showVerseText, setShowVerseText] = useState(
    localStorage.getItem("bibleStudio_showVerseText") === "true",
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter books based on search
  const filteredBooks = useMemo(() => {
    const list = bookList || [];
    const filtered = list.filter((book) =>
      book.name.toLowerCase().includes(bookSearchQuery.toLowerCase()),
    );
    if (isAlphabetical) {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    const ot = filtered.filter((b) => b.testament === "old");
    const nt = filtered.filter((b) => b.testament === "new");
    return [...ot, ...nt];
  }, [bookList, bookSearchQuery, isAlphabetical]);

  // Memoize chapters based on current book
  const chapters = useMemo(() => getChapters(), [currentBook, getChapters]);
  const filteredChapters = useMemo(() => {
    if (!chapterSearchQuery.trim()) return chapters;
    const q = chapterSearchQuery.trim();
    return chapters.filter((chapter) => chapter.toString().includes(q));
  }, [chapters, chapterSearchQuery]);

  // Memoize verses based on current book and chapter
  const verses = useMemo(() => getVerses(), [currentBook, currentChapter, getVerses]);
  const filteredVerses = useMemo(() => {
    if (!verseSearchQuery.trim()) return verses;
    const q = verseSearchQuery.trim();
    return verses.filter((verse) => verse.toString().includes(q));
  }, [verses, verseSearchQuery]);

  // Memoize chapter verses to avoid recalculating on every render
  const chapterVerses = useMemo(() => {
    return getCurrentChapterVerses();
  }, [currentBook, currentChapter, getCurrentChapterVerses]);

  // Helper to highlight matching text in search results
  const highlightMatch = (
    text: string,
    query: string,
    isSelected: boolean = false,
  ) => {
    if (!query.trim()) return text;
    const q = query.trim();
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span
          className={
            isSelected
              ? "font-black text-white underline decoration-white underline-offset-2 bg-white/20 px-0.5 rounded-xs"
              : "font-extrabold underline decoration-focus-border text-focus-border bg-focus-border/10 px-0.5 rounded-xs"
          }
        >
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  // Keyboard navigation for search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input when '/' is pressed
      if (
        e.key === "/" &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear search and blur on Escape
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        if (activeTab === "books") setBookSearchQuery("");
        else if (activeTab === "chapters") setChapterSearchQuery("");
        else setVerseSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const handleBookSelect = (bookName: string) => {
    onBookSelect(bookName);
    setActiveTab("chapters");
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterSelect(chapter);
    setActiveTab("verses");
  };

  const handleVerseSelect = (verse: number) => {
    onVerseSelect(verse);
  };

  const handleToggleVerseText = () => {
    const newValue = !showVerseText;
    setShowVerseText(newValue);
    localStorage.setItem("bibleStudio_showVerseText", String(newValue));
  };

  return (
    <div className="w-full h-full p-2 bg-card-bg overflow-hidden flex flex-col">
      <div className="flex flex-col h-full gap-1.5 overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-shrink-0 w-full">
          {/* Segmented tab control */}
          <div className="flex p-0.5 rounded-lg bg-card-bg-alt gap-0.5 shadow-2xs">
            {(
              [
                { id: "books", label: "Books", icon: <BookTemplate className="w-3.5 h-3.5" /> },
                { id: "chapters", label: `Ch ${currentChapter || 1}`, icon: <LucideAlignHorizontalDistributeCenter className="w-3.5 h-3.5" /> },
                { id: "verses", label: `Vs ${currentVerse || 1}`, icon: <LucideAlignVerticalDistributeCenter className="w-3.5 h-3.5" /> },
              ] as const
            ).map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  title={tab.label}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all duration-150 cursor-pointer text-xs font-semibold ${
                    isSelected
                      ? "bg-btn-active-from text-white shadow-xs font-bold"
                      : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
                  }`}
                >
                  {tab.icon}
                  <span className="text-[11px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* A-Z toggle */}
          {activeTab === "books" && (
            <button
              type="button"
              onClick={() => setIsAlphabetical(!isAlphabetical)}
              className={`p-1.5 px-2 rounded-md text-[10px] font-bold tracking-tight transition-all duration-150 cursor-pointer shadow-2xs ${
                isAlphabetical
                  ? "bg-btn-active-from text-white shadow-xs"
                  : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
              }`}
            >
              <span>A–Z</span>
            </button>
          )}

          {/* Verse text toggle */}
          {activeTab === "verses" && (
            <button
              type="button"
              onClick={handleToggleVerseText}
              className={`p-1.5 px-2 rounded-md text-[10px] font-bold transition-all duration-150 cursor-pointer shadow-2xs ${
                showVerseText
                  ? "bg-btn-active-from text-white shadow-xs"
                  : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
              }`}
            >
              <span>{showVerseText ? "123" : "Abc"}</span>
            </button>
          )}

          {/* Search */}
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card-bg-alt min-w-0 shadow-2xs">
            <Search size={12} className="text-text-secondary flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={
                activeTab === "books"
                  ? bookSearchQuery
                  : activeTab === "chapters"
                    ? chapterSearchQuery
                    : verseSearchQuery
              }
              onChange={(e) => {
                if (activeTab === "books") setBookSearchQuery(e.target.value);
                else if (activeTab === "chapters")
                  setChapterSearchQuery(e.target.value);
                else setVerseSearchQuery(e.target.value);
              }}
              placeholder={`Search ${activeTab}…`}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none text-[0.78rem] border-none w-full min-w-0"
            />
            {(activeTab === "books"
              ? bookSearchQuery
              : activeTab === "chapters"
              ? chapterSearchQuery
              : verseSearchQuery) && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "books") setBookSearchQuery("");
                  else if (activeTab === "chapters") setChapterSearchQuery("");
                  else setVerseSearchQuery("");
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center bg-transparent hover:bg-select-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer border-none p-0 flex-shrink-0"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
          {/* Books */}
          {activeTab === "books" && (
            <div>
              {bookSearchQuery.trim() ? (
                /* Search Mode */
                filteredBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-text-secondary">
                    <Search size={22} className="opacity-40 mb-1" />
                    <p className="text-xs font-semibold">
                      No books match &ldquo;{bookSearchQuery}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => setBookSearchQuery("")}
                      className="mt-2 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-transparent hover:bg-select-hover text-text-primary transition-colors cursor-pointer border border-select-border/60 hover:border-select-border-hover shadow-2xs"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 pb-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[0.62rem] font-bold text-text-secondary uppercase tracking-wider">
                        Results for &ldquo;{bookSearchQuery}&rdquo; ({filteredBooks.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setBookSearchQuery("")}
                        className="text-[0.62rem] font-semibold text-text-secondary hover:text-text-primary hover:bg-select-hover px-1.5 py-0.5 rounded transition-colors cursor-pointer bg-transparent border-none"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-1.5 p-0.5">
                      {filteredBooks.map((book) => (
                        <div key={book.name}>
                          <button
                            type="button"
                            onClick={() => handleBookSelect(book.name)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer shadow-2xs hover:scale-102 active:scale-95 ring-2 ${
                              currentBook === book.name
                                ? "bg-btn-active-from text-white shadow-xs font-bold scale-102 ring-btn-active-from ring-offset-1 ring-offset-card-bg"
                                : "bg-btn-normal-from hover:bg-select-hover text-text-primary ring-[color-mix(in_srgb,var(--select-border)_60%,transparent)] hover:ring-select-border-hover"
                            }`}
                          >
                            <span>
                              {highlightMatch(
                                book.name,
                                bookSearchQuery,
                                currentBook === book.name,
                              )}
                            </span>
                            <span
                              className={`text-[8.5px] font-bold px-1 py-0.2 rounded uppercase ${
                                currentBook === book.name
                                  ? "bg-white/20 text-white"
                                  : book.testament === "old"
                                  ? "bg-card-bg-alt text-text-secondary opacity-80"
                                  : "bg-select-hover text-text-primary border border-select-border/60"
                              }`}
                            >
                              {book.testament === "old" ? "OT" : "NT"}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                /* Standard Continuous Flow Mode */
                <div className="flex flex-wrap gap-x-2 gap-y-1.5 p-0.5">
                  {filteredBooks.map((book, i) => {
                    const isFirstOT =
                      !isAlphabetical &&
                      book.testament === "old" &&
                      i === 0;

                    const isFirstNT =
                      !isAlphabetical &&
                      book.testament === "new" &&
                      (i === 0 || filteredBooks[i - 1]?.testament === "old");

                    return (
                      <React.Fragment key={book.name}>
                        {isFirstOT && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-card-bg-alt text-text-secondary border border-select-border/60 self-center select-none shadow-2xs mr-0.5">
                            Old Testament
                          </span>
                        )}
                        {isFirstNT && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-card-bg-alt text-text-secondary border border-select-border/60 self-center select-none shadow-2xs mx-0.5">
                            New Testament
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleBookSelect(book.name)}
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-all duration-150 cursor-pointer shadow-2xs hover:scale-102 active:scale-95 ring-2 ${
                            currentBook === book.name
                              ? "bg-btn-active-from text-white shadow-xs font-bold scale-102 ring-btn-active-from ring-offset-1 ring-offset-card-bg"
                              : "bg-btn-normal-from hover:bg-select-hover text-text-primary ring-[color-mix(in_srgb,var(--select-border)_60%,transparent)] hover:ring-select-border-hover"
                          }`}
                        >
                          {book.name}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Chapters */}
          {activeTab === "chapters" && (
            <div className="space-y-2 pb-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[0.68rem] font-bold text-text-secondary uppercase tracking-wider">
                  {currentBook} — Chapters
                </span>
                <span className="text-[0.62rem] font-semibold text-text-secondary opacity-70">
                  {filteredChapters.length} total
                </span>
              </div>
              {filteredChapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-text-secondary">
                  <Search size={22} className="opacity-40 mb-1" />
                  <p className="text-xs font-semibold">
                    No chapters match &ldquo;{chapterSearchQuery}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => setChapterSearchQuery("")}
                    className="mt-2 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-transparent hover:bg-select-hover text-text-primary transition-colors cursor-pointer border border-select-border/60 hover:border-select-border-hover shadow-2xs"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-[6px] p-0.5">
                  {filteredChapters.map((chapter) => (
                    <button
                      key={chapter}
                      type="button"
                      onClick={() => handleChapterSelect(chapter)}
                      className={`h-8 rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 ${
                        currentChapter === chapter
                          ? "bg-btn-active-from text-white shadow-xs scale-105"
                          : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
                      }`}
                    >
                      {chapterSearchQuery.trim()
                        ? highlightMatch(
                            chapter.toString(),
                            chapterSearchQuery,
                            currentChapter === chapter,
                          )
                        : chapter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verses */}
          {activeTab === "verses" && (
            <div className="space-y-2 pb-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[0.68rem] font-bold text-text-secondary uppercase tracking-wider">
                  {currentBook} {currentChapter} — Verses
                </span>
                <span className="text-[0.62rem] font-semibold text-text-secondary opacity-70">
                  {filteredVerses.length} verses
                </span>
              </div>

              {filteredVerses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-text-secondary">
                  <Search size={22} className="opacity-40 mb-1" />
                  <p className="text-xs font-semibold">
                    No verses match &ldquo;{verseSearchQuery}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => setVerseSearchQuery("")}
                    className="mt-2 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-transparent hover:bg-select-hover text-text-primary transition-colors cursor-pointer border border-select-border/60 hover:border-select-border-hover shadow-2xs"
                  >
                    Clear search
                  </button>
                </div>
              ) : showVerseText ? (
                <div className="flex flex-col gap-[6px] p-0.5">
                  {filteredVerses.map((verse) => {
                    const verseText =
                      chapterVerses && chapterVerses[verse - 1]
                        ? typeof chapterVerses[verse - 1] === "string"
                          ? chapterVerses[verse - 1]
                          : (chapterVerses[verse - 1] as any)?.text || ""
                        : "";

                    const isSelected = currentVerse === verse;

                    return (
                      <div
                        key={verse}
                        onClick={() => handleVerseSelect(verse)}
                        className={`flex items-start gap-2 px-2 py-1 rounded-md cursor-pointer transition-all duration-150 shadow-2xs ${
                          isSelected
                            ? "bg-btn-active-from text-white shadow-xs font-semibold"
                            : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
                        }`}
                      >
                        <span
                          className={`text-[0.68rem] font-bold flex-shrink-0 w-4 text-right pt-0.5 ${
                            isSelected ? "text-white" : "text-text-secondary opacity-80"
                          }`}
                        >
                          {verse}
                        </span>
                        <span
                          className={`text-[0.68rem] leading-snug ${
                            isSelected ? "text-white" : "text-text-primary"
                          }`}
                        >
                          {verseSearchQuery.trim()
                            ? highlightMatch(
                                verseText,
                                verseSearchQuery,
                                isSelected,
                              )
                            : verseText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-[6px] p-0.5">
                  {filteredVerses.map((verse: number) => (
                    <button
                      key={verse}
                      type="button"
                      onClick={() => handleVerseSelect(verse)}
                      className={`h-8 rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center hover:scale-105 active:scale-95 ${
                        currentVerse === verse
                          ? "bg-btn-active-from text-white shadow-xs scale-105"
                          : "bg-btn-normal-from hover:bg-select-hover text-text-primary"
                      }`}
                    >
                      {verseSearchQuery.trim()
                        ? highlightMatch(
                            verse.toString(),
                            verseSearchQuery,
                            currentVerse === verse,
                          )
                        : verse}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
