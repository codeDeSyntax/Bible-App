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
} from "lucide-react";

const DEBOUNCE_MS = 480;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 600;
const IPC_TIMEOUT_MS = 10000;

// Detect "Book Chapter:Verse" patterns — e.g. "John 3:16", "1 Cor 13:4"
const BIBLE_REF_REGEX =
  /^(\d?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+):(\d+)$/;

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
    v.verseId ?? v.verseNumber ??
    (typeof v.verse === "number" ? v.verse : undefined) ?? 0;
  const rawText: string =
    typeof v.verse === "string" ? v.verse :
    typeof v.text  === "string" ? v.text  : "";

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
      ? (arr as unknown[][]).flat() as ApiVerse[]
      : arr as ApiVerse[];

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
    <div
      className="relative w-[3.25rem] h-12 rounded-[14px] bg-gradient-to-br from-btn-active-from to-btn-active-to flex flex-col items-center justify-center"
      style={{ boxShadow: "0 8px 28px rgba(99,102,241,0.50), inset 0 1px 0 rgba(255,255,255,0.18)" }}
    >
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
            transition={{ duration: 0.12, delay: 3.5, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
          />
          {/* Handle — solid white, rotated 45° from bottom-right */}
          <div
            className="absolute bg-white rounded-full"
            style={{ width: 7, height: 2.5, bottom: -2, right: -5, transform: "rotate(45deg)", transformOrigin: "left center" }}
          />
        </div>
        {/* Right eye: normal */}
        <motion.div
          className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center"
          animate={{ scaleY: [1, 0.08, 1] }}
          transition={{ duration: 0.12, delay: 3.58, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
        >
          <div className="w-2 h-2 rounded-full bg-indigo-800" />
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
        setErrorMsg(err instanceof Error ? err.message : "Network error — please retry");
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
      setErrorMsg(err instanceof Error ? err.message : "Network error — please retry");
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
      onSyncVerse({ book: result.bookName, chapter: result.chapter, verse: result.verse });
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
            className="fixed bottom-6 left-6 z-50 flex flex-col rounded-3xl overflow-hidden bg-studio-bg border border-select-border"
            style={{
              width: 348,
              height: 630,
              boxShadow: "0 24px 64px rgba(0,0,0,0.40), 0 4px 16px rgba(0,0,0,0.20)",
            }}
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-select-border flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Mini bot icon in header */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-btn-active-from to-btn-active-to"
                  style={{ boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                    {/* Antenna */}
                    <line x1="10" y1="1" x2="10" y2="4.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="10" cy="1" r="1.2" fill="white" fillOpacity="0.9"/>
                    {/* Head */}
                    <rect x="2" y="4.5" width="16" height="13" rx="3.5" fill="white" fillOpacity="0.25"/>
                    {/* Eyes */}
                    <circle cx="7.5" cy="10" r="2" fill="white" fillOpacity="0.95"/>
                    <circle cx="7.8" cy="10.2" r="1" fill="rgba(30,27,75,0.9)"/>
                    <circle cx="12.5" cy="10" r="2" fill="white" fillOpacity="0.95"/>
                    <circle cx="12.8" cy="10.2" r="1" fill="rgba(30,27,75,0.9)"/>
                    {/* Mouth */}
                    <rect x="6.5" y="14" width="7" height="1.2" rx="0.6" fill="white" fillOpacity="0.5"/>
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
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-text-secondary hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors duration-100 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Segmented tabs ────────────────────────────────────────────── */}
            <div className="px-4 pt-3 pb-2.5 flex-shrink-0">
              <div className="flex bg-card-bg rounded-xl p-0.5">
                {(["search", "crossrefs"] as Mode[]).map((m) => (
                  <div
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      mode === m
                        ? "bg-select-bg text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {m === "search" ? (
                      <><Search className="w-3 h-3" />Search</>
                    ) : (
                      <><Link2 className="w-3 h-3" />Cross Refs</>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Search input ──────────────────────────────────────────────── */}
            {mode === "search" && (
              <div className="px-4 pb-2.5 flex-shrink-0">
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
                <button
                  onClick={() => performCrossRefs(crossRefVerseId ?? undefined)}
                  disabled={status === "loading" || !crossRefVerseId}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-header-gradient-from to-header-gradient-to text-white hover:opacity-80 disabled:opacity-40 transition-all duration-150 cursor-pointer"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  {crossRefVerseId ? "Reload References" : "Load Cross References"}
                </button>
                {!crossRefVerseId && (
                  <p className="text-[10px] text-text-secondary text-center leading-relaxed">
                    In Search, hover a result and click{" "}
                    <span className="text-btn-active-from font-semibold">Cross refs</span>
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
                  <span className="text-xs text-text-secondary">Searching the scriptures…</span>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-xs text-text-secondary text-center leading-relaxed">{errorMsg}</p>
                  {!errorMsg.startsWith("Search for a verse") && (
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1.5 text-xs text-btn-active-from hover:opacity-75 transition-opacity cursor-pointer font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try again
                    </button>
                  )}
                </div>
              )}

              {/* Empty */}
              {status === "success" && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <BookOpen className="w-5 h-5 text-text-secondary" />
                  <span className="text-xs text-text-secondary">No verses found</span>
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
              {status === "idle" && mode === "crossrefs" && !crossRefVerseId && (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
                  <div className="w-11 h-11 rounded-2xl bg-card-bg flex items-center justify-center">
                    <Link2 className="w-4.5 h-4.5 text-btn-active-from" />
                  </div>
                  <p className="text-xs text-text-secondary text-center leading-relaxed">
                    Search a verse then click its{" "}
                    <span className="text-btn-active-from font-semibold">Cross refs</span>{" "}
                    link
                  </p>
                </div>
              )}

              {/* Results */}
              {status === "success" && results.length > 0 && (
                <div className="divide-y divide-select-border">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="group relative flex flex-col gap-1 px-4 py-3 hover:bg-select-hover transition-colors duration-100"
                    >
                      {/* Left accent */}
                      <span className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-btn-active-from opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

                      {/* Reference + action buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-btn-active-from tracking-tight flex-shrink-0">
                          {r.reference}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {/* Sync to Studio */}
                          <button
                            onClick={() => handleSync(r)}
                            title="Sync to Bible Studio"
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 ${
                              syncedId === r.id
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 opacity-100"
                                : "bg-card-bg text-text-secondary hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600"
                            }`}
                          >
                            {syncedId === r.id ? (
                              "✓ Synced"
                            ) : (
                              <>
                                <Navigation2 className="w-2.5 h-2.5" />
                                Sync
                              </>
                            )}
                          </button>

                          {/* Project */}
                          <button
                            onClick={() => handleProject(r)}
                            title="Project to presentation"
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 ${
                              projectedId === r.id
                                ? "bg-green-50 dark:bg-green-950/30 text-green-500 opacity-100"
                                : "bg-card-bg text-text-secondary hover:bg-gradient-to-r hover:from-btn-active-from hover:to-btn-active-to hover:text-white"
                            }`}
                          >
                            {projectedId === r.id ? (
                              "✓ Live"
                            ) : (
                              <>
                                <SendHorizonal className="w-2.5 h-2.5" />
                                Project
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Verse text */}
                      <p className="text-[12px] text-text-primary leading-snug line-clamp-2">
                        {r.text}
                      </p>

                      {/* Cross refs link */}
                      {mode === "search" && (
                        <button
                          onClick={() => handleOpenCrossRefs(r.id)}
                          className="self-start flex items-center gap-0.5 text-[10px] text-text-secondary hover:text-btn-active-from transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Link2 className="w-2.5 h-2.5" />
                          cross refs
                        </button>
                      )}
                    </div>
                  ))}
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
