import React, { useState, useCallback, useRef } from "react";
import {
  Link2,
  ChevronDown,
  ChevronUp,
  Loader2,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// ─── API helpers (mirrors BibleSearchBot approach) ────────────────────────────

const IPC_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

async function ipcFetch(apiPath: string): Promise<unknown> {
  const api = (window as Window & typeof globalThis).api;
  return Promise.race([
    api.bibleApiFetch(apiPath),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), IPC_TIMEOUT_MS),
    ),
  ]);
}

async function fetchWithRetry(path: string): Promise<unknown> {
  let lastErr: unknown;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await ipcFetch(path);
    } catch (err) {
      lastErr = err;
      if (i < MAX_RETRIES - 1)
        await new Promise((r) => setTimeout(r, RETRY_BASE_MS * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CrossRef {
  id: number;
  reference: string;
  text: string;
  bookName: string;
  chapter: number;
  verse: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRef(v: Record<string, any>): CrossRef {
  let bookName = "Unknown";
  if (v.book) {
    if (typeof v.book === "object" && typeof v.book.name === "string")
      bookName = v.book.name;
    else if (typeof v.book === "string") bookName = v.book;
  } else if (typeof v.bookName === "string") {
    bookName = v.bookName;
  }

  const chapter: number = v.chapterId ?? v.chapter ?? v.chapterNumber ?? 0;
  const verse: number =
    v.verseId ??
    v.verseNumber ??
    (typeof v.verse === "number" ? v.verse : 0) ??
    0;
  const raw: string =
    typeof v.verse === "string"
      ? v.verse
      : typeof v.text === "string"
        ? v.text
        : "";
  const text = raw.replace(/<\/?span[^>]*>/gi, "");

  return {
    id: v.id ?? 0,
    bookName,
    chapter,
    verse,
    text,
    reference:
      bookName !== "Unknown" && chapter && verse
        ? `${bookName} ${chapter}:${verse}`
        : "Unknown reference",
  };
}

function extractVerseArray(data: unknown): Record<string, unknown>[] | null {
  const flatten = (arr: unknown[]) =>
    Array.isArray(arr[0]) ? (arr as unknown[][]).flat() : arr;

  if (Array.isArray(data)) return flatten(data) as Record<string, unknown>[];

  if (data !== null && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "results", "verses", "items"]) {
      if (Array.isArray(obj[key]))
        return flatten(obj[key] as unknown[]) as Record<string, unknown>[];
    }
  }
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CrossReferencesProps {
  /** e.g. "John 3:16" */
  currentReference: string;
  onNavigate: (ref: {
    bookName: string;
    chapter: number;
    verse: number;
  }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CrossReferences: React.FC<CrossReferencesProps> = ({
  currentReference,
  onNavigate,
}) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [refs, setRefs] = useState<CrossRef[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  /** The reference string for which we last successfully fetched */
  const fetchedForRef = useRef<string>("");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCrossRefs = useCallback(async (forRef: string) => {
    setStatus("loading");
    setRefs([]);
    setErrorMsg("");

    try {
      // Step 1: resolve numeric verse ID by searching for the reference
      const encoded = encodeURIComponent(forRef);
      const searchData = await fetchWithRetry(`/search?query=${encoded}`);
      const searchVerse = extractVerseArray(searchData);
      if (!searchVerse || searchVerse.length === 0)
        throw new Error("Verse not found in online database");

      const verseId = searchVerse[0].id as number;
      if (!verseId) throw new Error("Could not resolve verse ID");

      // Step 2: fetch cross-references
      const relData = await fetchWithRetry(`/verse/${verseId}/relations`);
      const relVerses = extractVerseArray(relData);
      if (!relVerses) throw new Error("No cross-references returned");

      const mapped = relVerses
        .map(toRef)
        .filter((r) => r.reference !== "Unknown reference");
      setRefs(mapped);
      fetchedForRef.current = forRef;
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setStatus("error");
    }
  }, []);

  // ── Toggle ─────────────────────────────────────────────────────────────────

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    // Fetch only if opening and haven't fetched for this reference yet
    if (next && fetchedForRef.current !== currentReference) {
      fetchCrossRefs(currentReference);
    }
  };

  // Re-fetch when reference changes while open
  const prevRef = useRef(currentReference);
  if (prevRef.current !== currentReference) {
    prevRef.current = currentReference;
    if (open) {
      fetchCrossRefs(currentReference);
    } else {
      // Reset so next open triggers a fresh fetch
      fetchedForRef.current = "";
      if (status !== "idle") {
        setStatus("idle");
        setRefs([]);
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-shrink-0 mt-2">
      {/* Toggle row */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-opacity hover:opacity-90 bg-header-gradient-from"
      >
        <div className="flex items-center gap-1.5">
          <Link2
            className="w-3.5 h-3.5"
            style={{ color: "rgba(255,255,255,0.85)" }}
          />
          <span
            className="text-[0.72rem] font-semibold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Cross References
          </span>
          {status === "success" && refs.length > 0 && (
            <span
              className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              {refs.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {status === "loading" && (
            <Loader2
              className="w-3.5 h-3.5 animate-spin"
              style={{ color: "rgba(255,255,255,0.8)" }}
            />
          )}
          {open ? (
            <ChevronUp
              className="w-3.5 h-3.5"
              style={{ color: "rgba(255,255,255,0.8)" }}
            />
          ) : (
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{ color: "rgba(255,255,255,0.8)" }}
            />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="mt-1.5 flex flex-col gap-1 max-h-40 overflow-y-auto no-scrollbar">
          {/* Loading skeleton */}
          {status === "loading" && (
            <div className="flex flex-col gap-1 px-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-lg animate-pulse"
                  style={{
                    background: "var(--select-bg)",
                    opacity: 0.6 - i * 0.15,
                  }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div
              className="flex items-center justify-between px-2.5 py-2 rounded-lg"
              style={{ background: "var(--select-bg)" }}
            >
              <div className="flex items-center gap-2">
                <WifiOff className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                <span className="text-[0.7rem] text-text-secondary">
                  {errorMsg}
                </span>
              </div>
              <button
                onClick={() => fetchCrossRefs(currentReference)}
                className="flex items-center gap-1 text-[0.7rem] text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex-shrink-0 ml-2"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* Results */}
          {status === "success" &&
            refs.map((ref) => (
              <button
                key={ref.id}
                onClick={() =>
                  onNavigate({
                    bookName: ref.bookName,
                    chapter: ref.chapter,
                    verse: ref.verse,
                  })
                }
                className="w-full text-left flex items-start gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer group"
                style={{ background: "var(--select-bg)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "var(--select-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "var(--select-bg)")
                }
              >
                <span
                  className="text-[0.68rem] font-bold flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--select-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  {ref.reference}
                </span>
                <span className="text-[0.7rem] text-text-secondary leading-snug line-clamp-2">
                  {ref.text}
                </span>
              </button>
            ))}

          {/* Empty state */}
          {status === "success" && refs.length === 0 && (
            <div
              className="px-3 py-2 rounded-lg text-[0.7rem] text-text-secondary"
              style={{ background: "var(--select-bg)" }}
            >
              No cross-references found for this verse.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
