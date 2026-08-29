import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search as SearchIcon,
  X,
  Loader2,
  Wifi,
  WifiOff,
  Tv,
  Link2,
  ChevronLeft,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { navigateToVerse } from "@/store/slices/bibleSlice";
import { Tooltip } from "antd";

interface SearchResult {
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  isLocal?: boolean;
}

interface UnifiedSearchPanelProps {
  isDarkMode: boolean;
  onClose: () => void;
  onProjectVerse: (data: { text: string; reference: string }) => void;
  onSyncVerse: (data: { book: string; chapter: number; verse: number }) => void;
}

const DEBOUNCE_MS = 350;
const IPC_TIMEOUT_MS = 6000;
const BIBLE_REF_REGEX = /^(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+))?$/;

async function ipcFetch(apiPath: string): Promise<unknown> {
  if (typeof window === "undefined" || !(window as any).api?.bibleApiFetch) {
    throw new Error("Bible API not available");
  }
  const ipcPromise = (window as any).api.bibleApiFetch(apiPath);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), IPC_TIMEOUT_MS),
  );
  return Promise.race([ipcPromise, timeoutPromise]);
}

function stripHighlightTags(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<\/?span[^>]*>/gi, "");
}

function extractVerseArray(data: unknown): any[] | null {
  try {
    const flatten = (arr: unknown[]): any[] =>
      arr.length > 0 && Array.isArray(arr[0])
        ? ((arr as unknown[][]).flat() as any[])
        : (arr as any[]);

    if (Array.isArray(data)) return flatten(data);

    if (data !== null && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      for (const key of ["data", "results", "verses", "items"]) {
        if (Array.isArray(obj[key])) return flatten(obj[key] as unknown[]);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function toSearchResult(v: any): SearchResult {
  let bookName = "Unknown";
  if (v && typeof v === "object") {
    if (v.book) {
      if (typeof v.book === "object" && typeof v.book.name === "string") {
        bookName = v.book.name;
      } else if (typeof v.book === "string" && v.book.length > 0) {
        bookName = v.book;
      }
    } else if (typeof v.bookName === "string") {
      bookName = v.bookName;
    }
  }

  const chapter: number = v?.chapterId ?? v?.chapter ?? v?.chapterNumber ?? 0;
  const verseNum: number =
    v?.verseId ??
    v?.verseNumber ??
    (typeof v?.verse === "number" ? v.verse : undefined) ??
    0;
  const rawText: string =
    typeof v?.verse === "string"
      ? v.verse
      : typeof v?.text === "string"
        ? v.text
        : "";

  return {
    id: v?.id ?? Math.floor(Math.random() * 1000000),
    bookName: bookName || "Unknown",
    chapter: chapter || 1,
    verse: verseNum || 1,
    text: stripHighlightTags(rawText || ""),
    reference:
      bookName !== "Unknown" && chapter && verseNum
        ? `${bookName} ${chapter}:${verseNum}`
        : "Unknown reference",
    isLocal: false,
  };
}

// Helper to check if verse matches query based on exactMatch and wholeWords criteria
function checkVerseMatches(
  verseText: string,
  searchQuery: string,
  isExact: boolean,
  isWhole: boolean,
): boolean {
  if (!verseText || !searchQuery) return false;
  const clean = searchQuery.trim();
  if (!clean) return false;

  try {
    if (isExact) {
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (isWhole) {
        const regex = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i");
        return regex.test(verseText);
      } else {
        return verseText.toLowerCase().includes(clean.toLowerCase());
      }
    } else {
      const searchWords = clean.split(/\s+/).filter(Boolean);
      if (searchWords.length === 0) return false;

      if (isWhole) {
        return searchWords.every((sw) => {
          const escaped = sw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i");
          return regex.test(verseText);
        });
      } else {
        const lower = verseText.toLowerCase();
        return searchWords.every((sw) => lower.includes(sw.toLowerCase()));
      }
    }
  } catch {
    return verseText.toLowerCase().includes(clean.toLowerCase());
  }
}

export const UnifiedSearchPanel: React.FC<UnifiedSearchPanelProps> = ({
  isDarkMode,
  onClose,
  onProjectVerse,
  onSyncVerse,
}) => {
  const dispatch = useAppDispatch();
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );

  const [activeTab, setActiveTab] = useState<"search" | "crossrefs">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceType, setSourceType] = useState<"online" | "local" | "idle">(
    "idle",
  );
  const [exactMatch, setExactMatch] = useState(true);
  const [wholeWords, setWholeWords] = useState(true);
  const [crossRefTarget, setCrossRefTarget] = useState<SearchResult | null>(
    null,
  );
  const [projectedId, setProjectedId] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Safe local fallback search with accurate exact & word filters
  const searchLocalData = useCallback(
    (
      searchQuery: string,
      isExact: boolean = exactMatch,
      isWhole: boolean = wholeWords,
    ): SearchResult[] => {
      try {
        if (!searchQuery || !searchQuery.trim() || !bibleData || !currentTranslation) return [];
        const translationData = bibleData[currentTranslation];
        if (!translationData || !Array.isArray(translationData.books)) return [];

        const localResults: SearchResult[] = [];

        // 1. Direct Reference lookup e.g. "John 3:16" or "Gen 1"
        const refMatch = searchQuery.match(BIBLE_REF_REGEX);
        if (refMatch) {
          const bookPrefix = refMatch[1].trim().toLowerCase();
          const chNum = parseInt(refMatch[2], 10);
          const vsNum = refMatch[3] ? parseInt(refMatch[3], 10) : undefined;

          const matchedBook = translationData.books.find(
            (b: any) => b && typeof b.name === "string" && b.name.toLowerCase().startsWith(bookPrefix),
          );

          if (matchedBook && Array.isArray(matchedBook.chapters)) {
            const matchedChapter = matchedBook.chapters.find(
              (c: any) => c && c.chapter === chNum,
            );
            if (matchedChapter && Array.isArray(matchedChapter.verses)) {
              if (vsNum !== undefined) {
                const v = matchedChapter.verses.find(
                  (verse: any) =>
                    (typeof verse === "object" ? verse?.verse : 0) === vsNum,
                );
                if (v) {
                  const text = typeof v === "string" ? v : v?.text || "";
                  return [
                    {
                      id: Math.floor(Math.random() * 100000),
                      bookName: matchedBook.name,
                      chapter: chNum,
                      verse: vsNum,
                      text,
                      reference: `${matchedBook.name} ${chNum}:${vsNum}`,
                      isLocal: true,
                    },
                  ];
                }
              } else {
                return matchedChapter.verses
                  .slice(0, 35)
                  .map((v: any, idx: number) => {
                    const verseNum = typeof v === "object" ? v?.verse ?? (idx + 1) : idx + 1;
                    const text = typeof v === "string" ? v : v?.text || "";
                    return {
                      id: Math.floor(Math.random() * 100000) + idx,
                      bookName: matchedBook.name,
                      chapter: chNum,
                      verse: verseNum,
                      text,
                      reference: `${matchedBook.name} ${chNum}:${verseNum}`,
                      isLocal: true,
                    };
                  });
              }
            }
          }
        }

        // 2. Keyword Full-text Search with filtering
        for (const book of translationData.books) {
          if (!book || !Array.isArray(book.chapters)) continue;
          for (const chapter of book.chapters) {
            if (!chapter || !Array.isArray(chapter.verses)) continue;
            for (let i = 0; i < chapter.verses.length; i++) {
              const v = chapter.verses[i];
              const verseNum = typeof v === "object" ? v?.verse ?? (i + 1) : i + 1;
              const verseText = typeof v === "string" ? v : v?.text || "";
              if (!verseText) continue;

              if (checkVerseMatches(verseText, searchQuery, isExact, isWhole)) {
                localResults.push({
                  id: Math.floor(Math.random() * 1000000) + localResults.length,
                  bookName: book.name,
                  chapter: chapter.chapter,
                  verse: verseNum,
                  text: verseText,
                  reference: `${book.name} ${chapter.chapter}:${verseNum}`,
                  isLocal: true,
                });
                if (localResults.length >= 100) return localResults;
              }
            }
          }
        }

        return localResults;
      } catch (err) {
        console.error("Local search error:", err);
        return [];
      }
    },
    [bibleData, currentTranslation, exactMatch, wholeWords],
  );

  // Execute Unified Search (Online with safe Local Fallback)
  const executeSearch = useCallback(
    async (
      searchQuery: string,
      isExact: boolean = exactMatch,
      isWhole: boolean = wholeWords,
    ) => {
      const q = searchQuery ? searchQuery.trim() : "";
      if (!q) {
        setResults([]);
        setIsLoading(false);
        setSourceType("idle");
        return;
      }

      setIsLoading(true);

      const isOnline =
        typeof navigator !== "undefined" ? navigator.onLine : true;

      if (isOnline) {
        try {
          const encoded = encodeURIComponent(q);
          const data = await ipcFetch(`/search?query=${encoded}`);
          const verses = extractVerseArray(data);

          if (verses && Array.isArray(verses) && verses.length > 0) {
            const mapped = verses
              .map(toSearchResult)
              .filter((v) => checkVerseMatches(v.text, q, isExact, isWhole));

            if (mapped.length > 0) {
              setResults(mapped);
              setSourceType("online");
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Online search API unavailable, using local search fallback");
        }
      }

      // Safe local fallback
      const localResults = searchLocalData(q, isExact, isWhole);
      setResults(localResults);
      setSourceType("local");
      setIsLoading(false);
    },
    [exactMatch, wholeWords, searchLocalData],
  );

  // Cross reference explorer
  const executeCrossRefs = useCallback(
    async (target: SearchResult) => {
      if (!target) return;
      setCrossRefTarget(target);
      setActiveTab("crossrefs");
      setIsLoading(true);
      setResults([]);

      try {
        const data = await ipcFetch(`/verse/${target.id}/relations`);
        const verses = extractVerseArray(data);
        if (verses && Array.isArray(verses) && verses.length > 0) {
          setResults(verses.map(toSearchResult));
          setSourceType("online");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Cross-reference fetch error:", err);
      }

      // Fallback search
      const words = (target.text || "")
        .replace(/[^\w\s]/gi, "")
        .split(/\s+/)
        .filter((w) => w.length > 4)
        .slice(0, 3)
        .join(" ");

      const localResults = searchLocalData(words);
      setResults(localResults);
      setSourceType("local");
      setIsLoading(false);
    },
    [searchLocalData],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setCrossRefTarget(null);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!val.trim()) {
      setResults([]);
      setSourceType("idle");
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val);
    }, DEBOUNCE_MS);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      executeSearch(query);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Safe studio navigation
  const handleSync = (result: SearchResult) => {
    try {
      if (!result) return;
      // Navigate in Redux
      dispatch(
        navigateToVerse({
          book: result.bookName,
          chapter: result.chapter,
          verse: result.verse,
        }),
      );
      if (typeof onSyncVerse === "function") {
        onSyncVerse({
          book: result.bookName,
          chapter: result.chapter,
          verse: result.verse,
        });
      }
    } catch (e) {
      console.error("Failed to sync scripture:", e);
    }
  };

  // Safe live projection
  const handleProject = (result: SearchResult) => {
    try {
      if (!result) return;
      setProjectedId(result.id);
      if (typeof onProjectVerse === "function") {
        onProjectVerse({
          text: result.text || "",
          reference: result.reference || "",
        });
      }
      setTimeout(() => setProjectedId(null), 1800);
    } catch (e) {
      console.error("Failed to project scripture:", e);
    }
  };

  // Crash-proof highlight with lemon green theme matching cross-references using <mark>
  const highlightQuery = (text: string, searchTerm: string) => {
    if (!text || typeof text !== "string") return "";
    if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) return text;

    try {
      const clean = searchTerm.trim();
      let regex: RegExp;

      if (exactMatch) {
        const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regex = wholeWords
          ? new RegExp(`(?:^|\\b)(${escaped})(?:\\b|$)`, "gi")
          : new RegExp(`(${escaped})`, "gi");
      } else {
        const words = clean
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

        if (words.length === 0) return text;
        regex = wholeWords
          ? new RegExp(`(?:^|\\b)(${words.join("|")})(?:\\b|$)`, "gi")
          : new RegExp(`(${words.join("|")})`, "gi");
      }

      const parts = text.split(regex);
      return parts.map((part, i) => {
        const testRegex = new RegExp(regex.source, regex.flags);
        return testRegex.test(part) ? (
          <mark
            key={i}
            className="bg-lime-400/80 dark:bg-lime-400/55 text-inherit p-0 m-0"
          >
            {part}
          </mark>
        ) : (
          part
        );
      });
    } catch {
      return text;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-card-bg">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-btn-active-from text-white shadow-xs flex-shrink-0 ring-2 ring-[var(--btn-active-from)] ring-offset-1 ring-offset-[var(--card-bg)]">
            <SearchIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary block leading-tight">
              {activeTab === "crossrefs"
                ? "Cross References"
                : "Scripture Search"}
            </span>
            <span className="text-[0.62rem] text-text-secondary block leading-none mt-0.5">
              {sourceType === "online" ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5" />
                  Online
                </span>
              ) : sourceType === "local" ? (
                <span className="text-amber-500 font-semibold flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5" />
                  Offline
                </span>
              ) : (
                "Offline / Online"
              )}
            </span>
          </div>
        </div>

        <Tooltip title="Close Search (Esc)">
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center bg-transparent hover:bg-neutral-100 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* ── Segmented Mode Tabs ───────────────────────────────── */}
      <div className="px-3 pt-1 pb-1.5 flex-shrink-0">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("search");
              setCrossRefTarget(null);
            }}
            className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1.5 text-[0.68rem] font-semibold transition-all cursor-pointer ring-2 ring-offset-1 ring-offset-[var(--card-bg)] ${
              activeTab === "search"
                ? "bg-btn-active-from text-white font-bold ring-[var(--btn-active-from)] shadow-xs"
                : "bg-transparent text-text-secondary hover:text-text-primary ring-[var(--select-border)] hover:ring-[var(--btn-active-from)] hover:bg-select-hover/40"
            }`}
          >
            <SearchIcon className="w-3 h-3" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("crossrefs");
              if (results.length > 0 && !crossRefTarget) {
                executeCrossRefs(results[0]);
              }
            }}
            className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1.5 text-[0.68rem] font-semibold transition-all cursor-pointer ring-2 ring-offset-1 ring-offset-[var(--card-bg)] ${
              activeTab === "crossrefs"
                ? "bg-btn-active-from text-white font-bold ring-[var(--btn-active-from)] shadow-xs"
                : "bg-transparent text-text-secondary hover:text-text-primary ring-[var(--select-border)] hover:ring-[var(--btn-active-from)] hover:bg-select-hover/40"
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Cross Refs</span>
          </button>
        </div>
      </div>

      {/* ── Search Input Box ──────────────────────────────────── */}
      {activeTab === "search" && (
        <div className="px-3 pt-1 pb-2 flex-shrink-0 space-y-1.5">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              spellCheck={false}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search words or ref (e.g. John 3:16)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-select-bg text-text-primary placeholder:text-text-secondary outline-none border border-neutral-200/80 dark:border-transparent shadow-2xs focus:ring-1 focus:ring-btn-active-from transition-all"
            />
            <SearchIcon className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-btn-active-from animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setSourceType("idle");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center justify-between px-0.5 text-[0.65rem] text-text-secondary">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const nextVal = !exactMatch;
                  setExactMatch(nextVal);
                  if (query.trim()) {
                    executeSearch(query, nextVal, wholeWords);
                  }
                }}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ring-2 ring-offset-1 ring-offset-[var(--card-bg)] ${
                  exactMatch
                    ? "bg-btn-active-from text-white font-bold ring-[var(--btn-active-from)] shadow-xs"
                    : "bg-transparent text-text-secondary hover:text-text-primary ring-[var(--select-border)] hover:ring-[var(--btn-active-from)] hover:bg-select-hover/40"
                }`}
              >
                {exactMatch ? (
                  <ToggleRight className="w-3 h-3" />
                ) : (
                  <ToggleLeft className="w-3 h-3" />
                )}
                <span>Exact</span>
              </button>

              <button
                onClick={() => {
                  const nextVal = !wholeWords;
                  setWholeWords(nextVal);
                  if (query.trim()) {
                    executeSearch(query, exactMatch, nextVal);
                  }
                }}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ring-2 ring-offset-1 ring-offset-[var(--card-bg)] ${
                  wholeWords
                    ? "bg-btn-active-from text-white font-bold ring-[var(--btn-active-from)] shadow-xs"
                    : "bg-transparent text-text-secondary hover:text-text-primary ring-[var(--select-border)] hover:ring-[var(--btn-active-from)] hover:bg-select-hover/40"
                }`}
              >
                {wholeWords ? (
                  <ToggleRight className="w-3 h-3" />
                ) : (
                  <ToggleLeft className="w-3 h-3" />
                )}
                <span>Words</span>
              </button>
            </div>

            {results.length > 0 ? (
              <span className="font-semibold text-text-secondary">
                {results.length} verses
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Active Cross Ref Target Banner ────────────────────── */}
      {activeTab === "crossrefs" && (
        <div className="px-3 pb-1 flex-shrink-0">
          {crossRefTarget ? (
            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-card-bg-alt border border-neutral-200/60 dark:border-transparent text-text-primary text-[0.68rem] shadow-2xs flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <span
                  style={{ color: isDarkMode ? "#ffffff" : "#18181b" }}
                  className="font-bold block leading-tight"
                >
                  {crossRefTarget.reference}
                </span>
                <span className="line-clamp-1 opacity-80 text-[0.64rem]">
                  {crossRefTarget.text}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("search");
                  setCrossRefTarget(null);
                }}
                style={{ color: isDarkMode ? "#ffffff" : "#18181b" }}
                className="ml-2 text-[0.62rem] font-bold hover:underline flex items-center gap-0.5 flex-shrink-0"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </button>
            </div>
          ) : (
            <p className="text-[0.68rem] text-text-secondary text-center py-1">
              Search a verse then click its{" "}
              <span
                style={{ color: isDarkMode ? "#ffffff" : "#18181b" }}
                className="font-semibold"
              >
                Refs
              </span>{" "}
              button
            </p>
          )}
        </div>
      )}

      {/* ── Search Results (Dashed-Divider Inline Rows) ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-1.5 pb-8 flex flex-col w-full">
        {results.length > 0 ? (
          results.map((item) => {
            const isProjecting = projectedId === item.id;

            return (
              <div
                key={`${item.reference}-${item.id}`}
                onClick={() => handleSync(item)}
                className="group relative flex items-start justify-between px-2 py-2 hover:bg-select-hover/70 transition-colors duration-100 cursor-pointer border-b border-dashed border-select-border dark:border-select-border/60 last:border-b-0"
              >
                {/* Inline Scripture Reference + Full Verse Text */}
                <div className="min-w-0 flex-1 pr-1.5">
                  <p
                    style={{ color: isDarkMode ? "var(--text-primary, #e5e5e5)" : "#27272a" }}
                    className="text-[0.72rem] leading-snug line-clamp-4"
                  >
                    <span
                      style={{ color: isDarkMode ? "#ffffff" : "#18181b" }}
                      className="font-bold mr-1.5 inline-block"
                    >
                      {item.reference}
                    </span>
                    <span>{highlightQuery(item.text, query)}</span>
                  </p>
                </div>

                {/* Right Action Icons on Hover */}
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0 pt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Project to Live Screen */}
                  <Tooltip title="Project live">
                    <button
                      onClick={() => handleProject(item)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        isProjecting
                          ? "bg-red-500 text-white"
                          : "text-text-secondary hover:text-red-500 hover:bg-red-500/10"
                      }`}
                    >
                      <Tv className="w-3 h-3" />
                    </button>
                  </Tooltip>

                  {/* Cross References */}
                  {!item.isLocal && (
                    <Tooltip title="Cross references">
                      <button
                        onClick={() => executeCrossRefs(item)}
                        className="w-5 h-5 rounded flex items-center justify-center text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-select-hover transition-colors cursor-pointer"
                      >
                        <Link2 className="w-3 h-3" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })
        ) : query && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <img
              src="./svgs/no_files.svg"
              alt="No Results"
              className="w-10 h-10 mb-1.5 opacity-60"
            />
            <p className="text-xs font-semibold text-text-primary">
              No matching scriptures found
            </p>
            <p className="text-[0.64rem] text-text-secondary mt-0.5">
              Try adjusting your search terms or keywords.
            </p>
          </div>
        ) : !query && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <img
              src="./svgs/icons8-search.svg"
              alt="Search"
              className="w-10 h-10 mb-1.5 opacity-60"
            />
            <p className="text-xs font-semibold text-text-primary">
              Search Scriptures &amp; Cross Refs
            </p>
            <p className="text-[0.64rem] text-text-secondary mt-0.5 max-w-[200px] leading-tight">
              Type words or references (e.g. John 3:16) with instant offline fallback.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
