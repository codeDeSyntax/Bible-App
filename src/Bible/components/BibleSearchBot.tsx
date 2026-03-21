import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  BookOpen,
  Link2,
  Loader2,
  AlertCircle,
  RefreshCw,
  SendHorizonal,
  Navigation2,
  MoreHorizontal,
} from "lucide-react";
import { DepthButton } from "@/shared/DepthElement";

const DEBOUNCE_MS = 480;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 600;
const IPC_TIMEOUT_MS = 10000;

// Detect "Book Chapter:Verse" patterns — e.g. "John 3:16", "1 Cor 13:4"
const BIBLE_REF_REGEX = /^(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+):(\d+)$/;

// ─── API helpers ─────────────────────────────────────────────────────────────
async function ipcFetch(apiPath: string): Promise<unknown> {
  const ipcPromise = (window as Window & typeof globalThis).api.bibleApiFetch(
    apiPath,
  );
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), IPC_TIMEOUT_MS),
  );
  return Promise.race([ipcPromise, timeoutPromise]);
}

async function fetchWithRetry(path: string): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await ipcFetch(path);
    } catch (err: unknown) {
      lastErr = err;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) =>
          setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)),
        );
      }
    }
  }
  throw lastErr;
}

// ─── Types ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiVerse = Record<string, any>;

interface SearchResult {
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

type Mode = "search" | "crossrefs";
type Status = "idle" | "loading" | "success" | "error";

function stripHighlightTags(html: string): string {
  return html.replace(/<\/?span[^>]*>/gi, "");
}

function toSearchResult(v: ApiVerse): SearchResult {
  let bookName = "Unknown";
  if (v.book) {
    if (typeof v.book === "object" && typeof v.book.name === "string") {
      bookName = v.book.name;
    } else if (typeof v.book === "string" && v.book.length > 0) {
      bookName = v.book;
    }
  } else if (typeof v.bookName === "string") {
    bookName = v.bookName;
  }

  const chapter: number = v.chapterId ?? v.chapter ?? v.chapterNumber ?? 0;
  const verseNum: number =
    v.verseId ??
    v.verseNumber ??
    (typeof v.verse === "number" ? v.verse : undefined) ??
    0;
  const rawText: string =
    typeof v.verse === "string"
      ? v.verse
      : typeof v.text === "string"
        ? v.text
        : "";

  return {
    id: v.id ?? 0,
    bookName,
    chapter,
    verse: verseNum,
    text: stripHighlightTags(rawText),
    reference:
      bookName !== "Unknown" && chapter && verseNum
        ? `${bookName} ${chapter}:${verseNum}`
        : "Unknown reference",
  };
}

function extractVerseArray(data: unknown): ApiVerse[] | null {
  const flatten = (arr: unknown[]): ApiVerse[] =>
    arr.length > 0 && Array.isArray(arr[0])
      ? ((arr as unknown[][]).flat() as ApiVerse[])
      : (arr as ApiVerse[]);

  if (Array.isArray(data)) return flatten(data);

  if (data !== null && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "results", "verses", "items"]) {
      if (Array.isArray(obj[key])) return flatten(obj[key] as unknown[]);
    }
  }
  return null;
}

// ─── Bot figure ──────────────────────────────────────────────────────────────

const BotFigure: React.FC = () => (
  <div className="flex flex-col items-center select-none">
    {/* Antenna */}
    <div className="flex flex-col items-center mb-0.5">
      <div className="w-2 h-2 rounded-full bg-white border-2 border-btn-active-from" />
      <div className="w-0.5 h-2.5 bg-white/70" />
    </div>

    {/* Head — filled gradient */}
    <div className="relative w-[3.25rem] h-12 rounded-[14px] bg-gradient-to-br from-btn-active-from to-btn-active-to flex flex-col items-center justify-center shadow-md">
      {/* Top highlight strip */}
      <div className="absolute top-1.5 left-3 right-3 h-0.5 rounded-full bg-white/30" />

      {/* Ear tabs */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-5 rounded-full bg-btn-active-to opacity-80" />
      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-5 rounded-full bg-btn-active-to opacity-80" />

      {/* Eyes */}
      <div className="flex items-center gap-3 mb-1.5">
        {/* Left eye: magnifying glass — solid white lens + handle */}
        <div className="relative" style={{ width: 18, height: 18 }}>
          {/* Lens circle — solid white ring with semi-transparent fill */}
          <motion.div
            className="absolute inset-0 rounded-full border-[2.5px] border-white bg-white/20"
            animate={{ scaleY: [1, 0.08, 1] }}
            transition={{
              duration: 0.12,
              delay: 3.5,
              repeat: Infinity,
              repeatDelay: 4.5,
              ease: "easeInOut",
            }}
          />
          {/* Handle — solid white, rotated 45° from bottom-right */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: 7,
              height: 2.5,
              bottom: -2,
              right: -5,
              transform: "rotate(45deg)",
              transformOrigin: "left center",
            }}
          />
        </div>
        {/* Right eye: normal */}
        <motion.div
          className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center"
          animate={{ scaleY: [1, 0.08, 1] }}
          transition={{
            duration: 0.12,
            delay: 3.58,
            repeat: Infinity,
            repeatDelay: 4.5,
            ease: "easeInOut",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-header-gradient-to opacity-80" />
        </motion.div>
      </div>

      {/* Mouth: mini search-bar — more opaque so it's clearly visible */}
      <div className="flex items-center gap-1 w-8 h-2 rounded-full border border-white/80 bg-white/10 px-1.5">
        <div className="flex-1 h-0.5 rounded-full bg-white/70" />
        <div className="w-1.5 h-1.5 rounded-full border border-white/90 flex-shrink-0" />
      </div>
    </div>

    {/* Label */}
    <div className="mt-1.5 text-[8px] font-black tracking-[0.18em] text-btn-active-from uppercase leading-none">
      BibleBot
    </div>
  </div>
);

// ─── Props ───────────────────────────────────────────────────────────────────

interface BibleSearchBotProps {
  onProjectVerse: (data: { text: string; reference: string }) => void;
  onSyncVerse: (data: { book: string; chapter: number; verse: number }) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const BibleSearchBot: React.FC<BibleSearchBotProps> = ({
  onProjectVerse,
  onSyncVerse,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [projectedId, setProjectedId] = useState<number | null>(null);
  const [syncedId, setSyncedId] = useState<number | null>(null);
  const [crossRefVerseId, setCrossRefVerseId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && mode === "search") {
      const id = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(id);
    }
  }, [isOpen, mode]);

  // Reset results when mode changes
  useEffect(() => {
    setResults([]);
    setStatus("idle");
    setErrorMsg("");
  }, [mode]);

  // ── Search ──────────────────────────────────────────────────────────────

  const performSearch = useCallback(
    async (searchQuery: string) => {
      const q = searchQuery.trim();
      if (!q) return;
      if (q === lastQueryRef.current && status === "success") return;
      lastQueryRef.current = q;

      setStatus("loading");
      setResults([]);
      setErrorMsg("");

      try {
        const encoded = encodeURIComponent(q);
        const data = await fetchWithRetry(`/search?query=${encoded}`);
        const verses = extractVerseArray(data);
        if (verses === null) throw new Error("Unexpected API response format");

        const mapped = verses.map(toSearchResult);
        if (BIBLE_REF_REGEX.test(q)) {
          const ql = q.toLowerCase();
          mapped.sort((a, b) => {
            const aScore = a.reference.toLowerCase().startsWith(ql) ? 0 : 1;
            const bScore = b.reference.toLowerCase().startsWith(ql) ? 0 : 1;
            return aScore - bScore;
          });
        }

        setResults(mapped);
        setStatus("success");
      } catch (err: unknown) {
        setErrorMsg(
          err instanceof Error ? err.message : "Network error — please retry",
        );
        setStatus("error");
      }
    },
    [status],
  );

  // ── Cross References ─────────────────────────────────────────────────────

  const performCrossRefs = useCallback(async (verseId?: number) => {
    if (!verseId) {
      setErrorMsg("Search for a verse first, then click its Cross Refs link.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setResults([]);
    setErrorMsg("");

    try {
      const data = await fetchWithRetry(`/verse/${verseId}/relations`);
      const verses = extractVerseArray(data);
      if (verses === null) throw new Error("Unexpected API response format");
      setResults(verses.map(toSearchResult));
      setStatus("success");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Network error — please retry",
      );
      setStatus("error");
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!val.trim()) {
        setResults([]);
        setStatus("idle");
        lastQueryRef.current = "";
        return;
      }
      debounceRef.current = setTimeout(() => performSearch(val), DEBOUNCE_MS);
    },
    [performSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && query.trim()) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        performSearch(query);
      }
      if (e.key === "Escape") setIsOpen(false);
    },
    [query, performSearch],
  );

  const handleProject = useCallback(
    (result: SearchResult) => {
      setProjectedId(result.id);
      onProjectVerse({ text: result.text, reference: result.reference });
      setTimeout(() => setProjectedId(null), 2200);
    },
    [onProjectVerse],
  );

  const handleSync = useCallback(
    (result: SearchResult) => {
      setSyncedId(result.id);
      onSyncVerse({
        book: result.bookName,
        chapter: result.chapter,
        verse: result.verse,
      });
      setTimeout(() => setSyncedId(null), 2200);
    },
    [onSyncVerse],
  );

  const handleOpenCrossRefs = useCallback(
    (verseId: number) => {
      setCrossRefVerseId(verseId);
      setMode("crossrefs");
      performCrossRefs(verseId);
    },
    [performCrossRefs],
  );

  const handleRetry = useCallback(() => {
    if (mode === "search") {
      lastQueryRef.current = "";
      performSearch(query);
    } else {
      performCrossRefs(crossRefVerseId ?? undefined);
    }
  }, [mode, query, crossRefVerseId, performSearch, performCrossRefs]);

  const isReference = BIBLE_REF_REGEX.test(query.trim());

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating bot trigger ──────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, y: 14, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 cursor-pointer bg-transparent"
            title="Open Bible SearchBot"
          >
            <BotFigure />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Expanded panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed bottom-6 left-6 z-50 flex flex-col rounded-3xl overflow-hidden bg-studio-bg border-4 border-select-border border-double"
            style={{
              width: 348,
              height: 630,
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.40), 0 4px 16px rgba(0,0,0,0.20)",
            }}
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-select-border flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Mini bot icon in header */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-btn-active-from to-btn-active-to shadow-sm">
                  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                    {/* Antenna */}
                    <line
                      x1="10"
                      y1="1"
                      x2="10"
                      y2="4.5"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="10"
                      cy="1"
                      r="1.2"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    {/* Head */}
                    <rect
                      x="2"
                      y="4.5"
                      width="16"
                      height="13"
                      rx="3.5"
                      fill="white"
                      fillOpacity="0.25"
                    />
                    {/* Eyes */}
                    <circle
                      cx="7.5"
                      cy="10"
                      r="2"
                      fill="white"
                      fillOpacity="0.95"
                    />
                    <circle
                      cx="7.8"
                      cy="10.2"
                      r="1"
                      fill="rgba(30,27,75,0.9)"
                    />
                    <circle
                      cx="12.5"
                      cy="10"
                      r="2"
                      fill="white"
                      fillOpacity="0.95"
                    />
                    <circle
                      cx="12.8"
                      cy="10.2"
                      r="1"
                      fill="rgba(30,27,75,0.9)"
                    />
                    {/* Mouth */}
                    <rect
                      x="6.5"
                      y="14"
                      width="7"
                      height="1.2"
                      rx="0.6"
                      fill="white"
                      fillOpacity="0.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-text-primary leading-tight">
                    Bible SearchBot
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    bible-go-api · live search
                  </p>
                </div>
              </div>
              <DepthButton
                onClick={() => setIsOpen(false)}
                sizeClassName="w-7 h-7 rounded-xl"
                inactiveClassName="text-text-secondary border-select-border hover:text-red-400"
                activeClassName="text-text-primary border-btn-active-from"
                title="Close"
              >
                <X className="w-4 h-4" />
              </DepthButton>
            </div>

            {/* ── Segmented tabs ────────────────────────────────────────────── */}
            <div className="px-4 pt-1 pb-2.5 flex-shrink-0">
              <div className="flex bg-card-bg rounded-xl p-0.5">
                {(["search", "crossrefs"] as Mode[]).map((m) => (
                  <DepthButton
                    key={m}
                    onClick={() => setMode(m)}
                    active={mode === m}
                    sizeClassName="flex-1 py-1.5 rounded-[10px]"
                    inactiveClassName="text-text-secondary border-select-border hover:text-text-primary"
                    activeClassName="text-text-primary border-btn-active-from"
                    className="gap-1.5 text-xs font-semibold"
                  >
                    {m === "search" ? (
                      <>
                        <Search className="w-3 h-3" />
                        Search
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3 h-3" />
                        Cross Refs
                      </>
                    )}
                  </DepthButton>
                ))}
              </div>
            </div>

            {/* ── Search input ──────────────────────────────────────────────── */}
            {mode === "search" && (
              <div className="px-4 pb-1 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder='Keyword or "John 3:16"…'
                    className="w-full pl-9 pr-11 py-2 text-sm rounded-xl bg-select-bg border border-solid border-select-border text-text-primary placeholder-text-secondary focus:outline-none focus:border-btn-active-from transition-colors duration-150"
                  />
                  {isReference && query.trim() && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded-md bg-btn-active-from/15 text-btn-active-from font-bold pointer-events-none tracking-widest">
                      REF
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Cross Refs trigger ────────────────────────────────────────── */}
            {mode === "crossrefs" && (
              <div className="px-4 pb-2.5 flex-shrink-0 space-y-1.5">
                <DepthButton
                  onClick={() => performCrossRefs(crossRefVerseId ?? undefined)}
                  disabled={status === "loading" || !crossRefVerseId}
                  sizeClassName="w-full py-2 rounded-xl"
                  inactiveClassName="text-text-primary border-select-border hover:text-text-primary"
                  activeClassName="text-text-primary border-btn-active-from"
                  className="gap-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  {crossRefVerseId
                    ? "Reload References"
                    : "Load Cross References"}
                </DepthButton>
                {!crossRefVerseId && (
                  <p className="text-[10px] text-text-secondary text-center leading-relaxed">
                    In Search, hover a result and click{" "}
                    <span className="text-btn-active-from font-semibold">
                      Cross refs
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* ── Results area ──────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {/* Loading */}
              {status === "loading" && (
                <div className="flex flex-col items-center justify-center h-full gap-2.5">
                  <Loader2 className="w-5 h-5 animate-spin text-btn-active-from" />
                  <span className="text-xs text-text-secondary">
                    Searching the scriptures…
                  </span>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-xs text-text-secondary text-center leading-relaxed">
                    {errorMsg}
                  </p>
                  {!errorMsg.startsWith("Search for a verse") && (
                    <DepthButton
                      onClick={handleRetry}
                      sizeClassName="px-2 py-1 rounded-md"
                      inactiveClassName="text-btn-active-from border-select-border hover:text-text-primary"
                      activeClassName="text-text-primary border-btn-active-from"
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try again
                    </DepthButton>
                  )}
                </div>
              )}

              {/* Empty */}
              {status === "success" && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <BookOpen className="w-5 h-5 text-text-secondary" />
                  <span className="text-xs text-text-secondary">
                    No verses found
                  </span>
                </div>
              )}

              {/* Idle — search */}
              {status === "idle" && mode === "search" && (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
                  <div className="w-11 h-11 rounded-2xl bg-card-bg flex items-center justify-center">
                    <Search className="w-4.5 h-4.5 text-btn-active-from" />
                  </div>
                  <p className="text-xs text-text-secondary text-center leading-relaxed">
                    Type a keyword or scripture reference to begin
                  </p>
                </div>
              )}

              {/* Idle — cross refs */}
              {status === "idle" &&
                mode === "crossrefs" &&
                !crossRefVerseId && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
                    <div className="w-11 h-11 rounded-2xl bg-card-bg flex items-center justify-center">
                      <Link2 className="w-4.5 h-4.5 text-btn-active-from" />
                    </div>
                    <p className="text-xs text-text-secondary text-center leading-relaxed">
                      Search a verse then click its{" "}
                      <span className="text-btn-active-from font-semibold">
                        Cross refs
                      </span>{" "}
                      link
                    </p>
                  </div>
                )}

              {/* Results */}
              {status === "success" && results.length > 0 && (
                <div className="divide-y divide-select-border">
                  {results.map((r) => {
                    const isExpanded = expandedId === r.id;
                    return (
                      <div
                        key={r.id}
                        className="group relative pl-4 pr-2 py-1 hover:bg-select-hover transition-colors duration-100"
                      >
                        {/* Left accent */}
                        <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-btn-active-from opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

                        {/* Inline reference + verse text */}
                        <span className="text-[11.5px] text-text-primary leading-snug line-clamp-2">
                          <span className="font-bold text-btn-active-from tracking-tight">
                            {r.reference}
                          </span>
                          <span className="text-text-secondary"> — </span>
                          {r.text}
                        </span>

                        {/* Row actions toggle */}
                        <DepthButton
                          onClick={() =>
                            setExpandedId(isExpanded ? null : r.id)
                          }
                          sizeClassName="w-4.5 h-4.5 rounded-md"
                          inactiveClassName="text-text-secondary border-select-border hover:text-text-primary"
                          activeClassName="text-text-primary border-btn-active-from"
                          active={isExpanded}
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity ${
                            isExpanded
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          title="Actions"
                        >
                          <MoreHorizontal
                            className="w-3 h-3"
                            strokeWidth={2.7}
                          />
                        </DepthButton>

                        {/* Overlay action menu */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.96 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-1.5 top-[calc(100%-0.1rem)] z-20"
                            >
                              <div className="flex items-center gap-1 p-1 rounded-lg border border-select-border bg-select-bg shadow-lg">
                                <DepthButton
                                  onClick={() => {
                                    handleSync(r);
                                    setExpandedId(null);
                                  }}
                                  title="Sync to Bible Studio"
                                  active={syncedId === r.id}
                                  sizeClassName="px-1.5 py-0.5 rounded-md"
                                  inactiveClassName="text-text-secondary border-select-border hover:text-emerald-600"
                                  activeClassName="text-emerald-500 border-emerald-500"
                                  className="gap-1 text-[10px] font-semibold"
                                >
                                  {syncedId === r.id ? (
                                    "✓ Synced"
                                  ) : (
                                    <>
                                      <Navigation2 className="w-2.5 h-2.5" />
                                      Sync
                                    </>
                                  )}
                                </DepthButton>
                                <DepthButton
                                  onClick={() => {
                                    handleProject(r);
                                    setExpandedId(null);
                                  }}
                                  title="Project to presentation"
                                  active={projectedId === r.id}
                                  sizeClassName="px-1.5 py-0.5 rounded-md"
                                  inactiveClassName="text-text-secondary border-select-border hover:text-text-primary"
                                  activeClassName="text-green-500 border-green-500"
                                  className="gap-1 text-[10px] font-semibold"
                                >
                                  {projectedId === r.id ? (
                                    "✓ Live"
                                  ) : (
                                    <>
                                      <SendHorizonal className="w-2.5 h-2.5" />
                                      Project
                                    </>
                                  )}
                                </DepthButton>
                                {mode === "search" && (
                                  <DepthButton
                                    onClick={() => {
                                      handleOpenCrossRefs(r.id);
                                      setExpandedId(null);
                                    }}
                                    sizeClassName="px-1.5 py-0.5 rounded-md"
                                    inactiveClassName="text-text-secondary border-select-border hover:text-btn-active-from"
                                    activeClassName="text-text-primary border-btn-active-from"
                                    className="gap-0.5 text-[10px] font-semibold"
                                  >
                                    <Link2 className="w-2.5 h-2.5" />
                                    Cross refs
                                  </DepthButton>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            {status === "success" && results.length > 0 && (
              <div className="px-5 py-2 border-t border-select-border flex-shrink-0">
                <p className="text-[10px] text-text-secondary text-center">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
