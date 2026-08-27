import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Loader2,
  WifiOff,
  RefreshCw,
  Mic,
  MicOff,
  Sparkles,
  Radio,
  Tv,
  AlertCircle,
  History,
  Trash2,
  Send,
  Speech,
  AudioLines,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
} from "@/store/slices/bibleSlice";
import { micAudioStreamer } from "@/utils/micCapture";
import {
  matchLocalScripture,
  ResolvedScripture,
} from "@/utils/canonicalScriptureMatcher";

// ─── API helpers for Classic Cross References ───────────────────────────────

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
      if (i < MAX_RETRIES - 1) {
        await new Promise((r) =>
          setTimeout(r, RETRY_BASE_MS * Math.pow(2, i)),
        );
      }
    }
  }
  throw lastErr;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface CrossRef {
  id: string;
  reference: string;
  text: string;
  bookName: string;
  chapter: number;
  verse: number;
}

interface DetectedCardItem {
  id: string;
  reference: string;
  confidence: number;
  contextSummary?: string;
  resolved: ResolvedScripture;
  timestamp: number;
  autoProjected: boolean;
}

interface CrossReferencesProps {
  currentReference: string;
  onNavigate: (ref: {
    bookName: string;
    chapter: number;
    verse: number;
  }) => void;
}

// ─── Helpers for Cross-References ──────────────────────────────────────────

function toRef(v: Record<string, any>): CrossRef {
  let bookName = "Unknown";
  if (v.book) {
    if (typeof v.book === "object" && typeof v.book.name === "string")
      bookName = v.book.name;
    else if (typeof v.book === "string") bookName = v.book;
  } else if (typeof v.bookName === "string") {
    bookName = v.bookName;
  } else if (typeof v.book_name === "string") {
    bookName = v.book_name;
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
    id: String(v.id ?? `${bookName}-${chapter}-${verse}`),
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
    for (const key of ["data", "results", "verses", "items", "cross_references", "references"]) {
      if (Array.isArray(obj[key]))
        return flatten(obj[key] as unknown[]) as Record<string, unknown>[];
    }
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CrossReferences: React.FC<CrossReferencesProps> = ({
  currentReference,
  onNavigate,
}) => {
  const dispatch = useAppDispatch();
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation,
  );

  // Tab mode: Smart AI Listening vs Classic Cross-References
  const [activeTab, setActiveTab] = useState<"smart" | "crossref">("smart");

  // Smart Listening State
  const [isListening, setIsListening] = useState(false);
  const [isStartingMic, setIsStartingMic] = useState(false);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [, setRecentTranscripts] = useState<string[]>([]);
  const [autoProject, setAutoProject] = useState<boolean>(() => {
    try {
      return localStorage.getItem("smartAiAutoProject") === "true";
    } catch {
      return false;
    }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleToggleAutoProject = (val: boolean) => {
    setAutoProject(val);
    try {
      localStorage.setItem("smartAiAutoProject", String(val));
      window.dispatchEvent(
        new CustomEvent("smart-ai-settings-changed", {
          detail: { autoProject: val },
        }),
      );
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ autoProject?: boolean }>;
      if (typeof customEvent.detail?.autoProject === "boolean") {
        setAutoProject(customEvent.detail.autoProject);
      }
    };
    window.addEventListener("smart-ai-settings-changed", handleSettingsChange);
    return () => {
      window.removeEventListener("smart-ai-settings-changed", handleSettingsChange);
    };
  }, []);

  // Persistent storage key
  const SCRIPTURE_HISTORY_KEY = "smart_projection_detected_scriptures_v1";

  const [detectedItems, setDetectedItems] = useState<DetectedCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(SCRIPTURE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load saved scriptures history:", e);
    }
    return [];
  });

  const [latestDetected, setLatestDetected] = useState<DetectedCardItem | null>(() => {
    try {
      const saved = localStorage.getItem(SCRIPTURE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {}
    return null;
  });

  // Sync to localStorage on detection changes
  useEffect(() => {
    try {
      localStorage.setItem(SCRIPTURE_HISTORY_KEY, JSON.stringify(detectedItems));
    } catch (e) {
      console.warn("Failed to save detected scriptures history:", e);
    }
  }, [detectedItems]);

  const clearDetectedHistory = useCallback(() => {
    setDetectedItems([]);
    setLatestDetected(null);
    try {
      localStorage.removeItem(SCRIPTURE_HISTORY_KEY);
    } catch {}
  }, []);

  const [keyMissingWarning, setKeyMissingWarning] = useState(false);

  // Key status
  const [keyStatus, setKeyStatus] = useState<{
    hasAssemblyAiKey: boolean;
    hasGroqKey: boolean;
    hasGeminiKey?: boolean;
    maskedAssemblyAiKey: string;
    maskedGroqKey: string;
    maskedGeminiKey?: string;
  }>({
    hasAssemblyAiKey: false,
    hasGroqKey: false,
    hasGeminiKey: false,
    maskedAssemblyAiKey: "",
    maskedGroqKey: "",
    maskedGeminiKey: "",
  });

  // Classic Cross References state
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [refs, setRefs] = useState<CrossRef[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const fetchedForRef = useRef<string>("");

  // Debounce & buffer for transcript extraction
  const transcriptBufferRef = useRef<string>("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastExtractedRef = useRef<string>("");

  // Refresh API key status
  const refreshKeyStatus = useCallback(async () => {
    if (window.api?.getSmartProjectionKeyStatus) {
      try {
        const res = await window.api.getSmartProjectionKeyStatus();
        setKeyStatus(res);
        if (res.hasAssemblyAiKey && (res.hasGroqKey || res.hasGeminiKey)) {
          setKeyMissingWarning(false);
        }
      } catch (err) {
        console.error("Failed to load key status:", err);
      }
    }
  }, []);

  useEffect(() => {
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  // Project detected scripture onto external presentation display
  const projectScripture = useCallback(
    (item: DetectedCardItem, isAuto = false) => {
      dispatch(setCurrentBook(item.resolved.bookName));
      dispatch(setCurrentChapter(item.resolved.chapter));
      dispatch(setCurrentVerse(item.resolved.verseStart));

      if (window.api?.sendToBiblePresentation) {
        window.api.sendToBiblePresentation({
          type: "update-data",
          data: {
            book: item.resolved.bookName,
            chapter: item.resolved.chapter,
            verses: item.resolved.verses,
            translation: currentTranslation || "KJV",
            selectedVerse: item.resolved.verseStart,
          },
        });
      }

      setDetectedItems((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, autoProjected: isAuto } : d)),
      );
      if (latestDetected?.id === item.id) {
        setLatestDetected((prev) => (prev ? { ...prev, autoProjected: isAuto } : null));
      }
    },
    [dispatch, currentTranslation, latestDetected],
  );

  // Trigger Groq or Gemini AI extraction from transcript snippet
  const triggerGroqExtraction = useCallback(
    async (transcript: string) => {
      const clean = transcript.trim();
      if (!clean || clean.length < 4) return;
      if (!window.api?.extractScriptureReference) return;

      console.log(`🎙️ [Smart AI] Analyzing speech transcript: "${clean}"`);
      setIsAnalyzing(true);
      try {
        const result = await window.api.extractScriptureReference(clean);
        console.log("🤖 [Smart AI] Extraction result from AI:", result);

        if (
          result.success &&
          result.data &&
          result.data.detected &&
          result.data.book &&
          result.data.chapter &&
          result.data.verseStart
        ) {
          const data = result.data;
          const bookName: string = data.book!;
          const chapterNum: number = data.chapter!;
          const startNum: number = data.verseStart!;
          const endNum: number | undefined = data.verseEnd;

          console.log(`🔍 [Smart AI] Scripture detected: ${bookName} ${chapterNum}:${startNum}`);

          const resolved = matchLocalScripture(
            bibleData,
            bookName,
            chapterNum,
            startNum,
            endNum,
            currentTranslation,
          );

          console.log("📖 [Smart AI] Matched local Bible verses:", resolved);

          if (resolved) {
            const detectedCard: DetectedCardItem = {
              id: `${resolved.reference}-${Date.now()}`,
              reference: resolved.reference,
              confidence: data.confidence ?? 0.9,
              contextSummary: data.contextSummary,
              resolved,
              timestamp: Date.now(),
              autoProjected: false,
            };

            setLatestDetected(detectedCard);
            setDetectedItems((prev) => {
              const filtered = prev.filter(
                (p) => p.reference !== resolved.reference,
              );
              return [detectedCard, ...filtered].slice(0, 10);
            });

            // 1. Manipulate workspace to the detected Book, Chapter, and Verse
            dispatch(setCurrentBook(resolved.bookName));
            dispatch(setCurrentChapter(resolved.chapter));
            dispatch(setCurrentVerse(resolved.verseStart));

            // Notify parent navigation handler if available
            onNavigate({
              bookName: resolved.bookName,
              chapter: resolved.chapter,
              verse: resolved.verseStart,
            });

            // 2. Notify VersePreviewCard with a bouncy "Project" button event
            window.dispatchEvent(
              new CustomEvent("smart-scripture-detected", {
                detail: {
                  reference: resolved.reference,
                  book: resolved.bookName,
                  chapter: resolved.chapter,
                  verse: resolved.verseStart,
                  verses: resolved.verses,
                  text: resolved.text,
                },
              }),
            );

            if (autoProject) {
              projectScripture(detectedCard, true);
            }
          }
        }
      } catch (err) {
        console.error("Smart AI reference extraction error:", err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [bibleData, currentTranslation, autoProject, projectScripture, dispatch, onNavigate],
  );

  // Buffer live transcripts & schedule extraction
  const onTranscriptChunk = useCallback(
    (transcript: string, isFinal?: boolean) => {
      const clean = transcript.trim();
      if (!clean) return;

      setLiveTranscript(clean);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      if (isFinal) {
        // Immediately extract when a speech phrase finishes
        if (clean.length >= 4) {
          triggerGroqExtraction(clean);
          setRecentTranscripts((prev) => [clean, ...prev].slice(0, 5));
        }
      } else {
        // Fast 400ms debounce while streaming live speech
        debounceTimerRef.current = setTimeout(() => {
          if (clean.length >= 4) {
            triggerGroqExtraction(clean);
            setRecentTranscripts((prev) => [clean, ...prev].slice(0, 5));
          }
        }, 400);
      }
    },
    [triggerGroqExtraction],
  );

  // Start / Stop Microphone Listening
  const toggleListening = useCallback(async () => {
    if (isListening) {
      micAudioStreamer.stop();
      await window.api?.stopSmartListening();
      setIsListening(false);
      setIsStartingMic(false);
      setAudioLevel(0);
      setLiveTranscript("");
      setMicErrorMsg(null);
    } else {
      setIsStartingMic(true);
      setMicErrorMsg(null);

      // Verify keys directly from storage
      let status = keyStatus;
      if (window.api?.getSmartProjectionKeyStatus) {
        try {
          status = await window.api.getSmartProjectionKeyStatus();
          setKeyStatus(status);
        } catch (e) {
          console.error(e);
        }
      }

      const hasAiKey = status.hasGroqKey || !!status.hasGeminiKey;
      if (!status.hasAssemblyAiKey || !hasAiKey) {
        setKeyMissingWarning(true);
        setIsStartingMic(false);
        setMicErrorMsg("AssemblyAI or AI Finder key missing. Please configure them in Settings.");
        return;
      }

      setKeyMissingWarning(false);

      try {
        const listenRes = await window.api?.startSmartListening();
        if (listenRes && !listenRes.success) {
          console.error("Smart listening error:", listenRes.error);
          setMicErrorMsg(listenRes.error || "Failed to connect to AssemblyAI.");
          setIsListening(false);
          setIsStartingMic(false);
          return;
        }

        const micRes = await micAudioStreamer.start((level: number) => {
          setAudioLevel(level);
        });

        if (micRes && !micRes.success) {
          console.error("Failed to start mic capture:", micRes.error);
          setMicErrorMsg(micRes.error || "Microphone access denied.");
          setIsListening(false);
          setIsStartingMic(false);
          return;
        }

        setIsListening(true);
        setIsStartingMic(false);
        setKeyMissingWarning(false);
        setMicErrorMsg(null);
      } catch (err: any) {
        console.error("Failed to start mic:", err);
        setMicErrorMsg(err?.message || "Failed to start microphone.");
        setIsListening(false);
        setIsStartingMic(false);
      } finally {
        setIsStartingMic(false);
      }
    }
  }, [isListening, keyStatus]);

  // Listen for AssemblyAI real-time transcripts from main process
  useEffect(() => {
    if (!window.api?.onSmartTranscript) return;

    const unsubscribe = window.api.onSmartTranscript((data: { text: string; isFinal: boolean }) => {
      if (data.text) {
        onTranscriptChunk(data.text, data.isFinal);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [onTranscriptChunk]);

  // Listen for streaming status updates from main process
  useEffect(() => {
    if (!window.api?.onSmartProjectionStatus) return;

    const unsubscribe = window.api.onSmartProjectionStatus(
      (status: { connected: boolean; isStreaming: boolean }) => {
        if (status.isStreaming) {
          setIsListening(true);
          setIsStartingMic(false);
        } else {
          setIsListening(false);
          setIsStartingMic(false);
          setAudioLevel(0);
        }
      },
    );

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Listen for streaming errors from main process
  useEffect(() => {
    if (!window.api?.onSmartProjectionError) return;

    const unsubscribe = window.api.onSmartProjectionError((err: { message: string }) => {
      if (err.message) {
        setMicErrorMsg(err.message);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      micAudioStreamer.stop();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // ── Classic Cross References Fetch Logic ────────────────────────────────────

  const fetchCrossRefs = useCallback(
    async (forRef: string) => {
      if (!forRef) return;
      if (fetchedForRef.current === forRef && status === "success") return;

      setStatus("loading");
      setRefs([]);
      setErrorMsg("");

      try {
        // Step 1: resolve numeric verse ID by searching for the reference
        const encoded = encodeURIComponent(forRef);
        const searchData = await fetchWithRetry(`/search?query=${encoded}`);
        const searchVerses = extractVerseArray(searchData);

        if (!searchVerses || searchVerses.length === 0) {
          setErrorMsg("Could not locate verse");
          setStatus("error");
          return;
        }

        const exactVerse =
          searchVerses.find((v: any) => {
            const vRef = `${v.book_name} ${v.chapter}:${v.verse}`;
            return vRef.toLowerCase() === forRef.toLowerCase();
          }) || searchVerses[0];

        const numericId = exactVerse?.id;
        if (!numericId) {
          setErrorMsg("Verse ID not found");
          setStatus("error");
          return;
        }

        // Step 2: fetch cross-references relations using the numeric ID
        const crossData = await fetchWithRetry(
          `/verse/${numericId}/relations`,
        );
        const rawVerses = extractVerseArray(crossData) || [];
        const resolvedRefs = rawVerses.map(toRef);

        fetchedForRef.current = forRef;
        setRefs(resolvedRefs);
        setStatus(resolvedRefs.length > 0 ? "success" : "idle");
      } catch (err: any) {
        console.error("Failed to load cross-references:", err);
        setErrorMsg(err?.message || "Failed to load cross-references");
        setStatus("error");
      }
    },
    [status],
  );

  // Re-fetch classic cross references when reference changes
  useEffect(() => {
    if (activeTab === "crossref" && currentReference) {
      if (currentReference !== fetchedForRef.current) {
        fetchCrossRefs(currentReference);
      }
    }
  }, [activeTab, currentReference, fetchCrossRefs]);

  const handleNavigate = (ref: CrossRef) => {
    dispatch(setCurrentBook(ref.bookName));
    dispatch(setCurrentChapter(ref.chapter));
    dispatch(setCurrentVerse(ref.verse));
    onNavigate?.({
      bookName: ref.bookName,
      chapter: ref.chapter,
      verse: ref.verse,
    });
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 select-none">
      {/* ── Sleek Header with Tabs & Mic Control Button ── */}
      <div className="flex items-center justify-between gap-2 flex-shrink-0">
        {/* Left: Tab Selectors in cohesive segmented pill */}
        <div className="flex p-0.5 rounded-xl bg-card-bg gap-1 shadow-2xs">
          {/* Smart Listen Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("smart")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs ${
              activeTab === "smart"
                ? "bg-gradient-to-r from-btn-active-from to-btn-active-to text-white shadow-xs font-bold"
                : "bg-gradient-to-r from-btn-normal-from to-btn-normal-to text-text-primary hover:opacity-90"
            }`}
          >
            <Sparkles
              className={`w-4 h-4 ${
                activeTab === "smart"
                  ? "text-lime-400 drop-shadow-[0_0_6px_rgba(163,230,53,0.6)]"
                  : "text-text-secondary"
              }`}
            />
            <span>Smart Listen</span>
            {isListening && (
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            )}
          </button>

          {/* Cross-Refs Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("crossref")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs ${
              activeTab === "crossref"
                ? "bg-gradient-to-r from-btn-active-from to-btn-active-to text-white shadow-xs font-bold"
                : "bg-gradient-to-r from-btn-normal-from to-btn-normal-to text-text-primary hover:opacity-90"
            }`}
          >
            <Link2 className={`w-4 h-4 ${activeTab === "crossref" ? "text-white" : "text-text-secondary"}`} />
            <span>Cross-Refs</span>
            {refs.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === "crossref"
                    ? "bg-white/20 text-white"
                    : "bg-select-bg text-text-secondary"
                }`}
              >
                {refs.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Action Icons (Mic & Refresh) */}
        {activeTab === "smart" ? (
          <div className="flex items-center gap-2">
            {/* Aggressive Lime Green Monochrome Speech-To-Text Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleListening}
              disabled={isStartingMic}
              className={`relative w-9.5 h-9.5 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60 ${
                isListening
                  ? "bg-lime-400 text-black shadow-lg shadow-lime-400/60 ring-2 ring-lime-200 animate-pulse"
                  : "bg-lime-400 hover:bg-lime-300 text-lime-950 shadow-md shadow-lime-500/40 ring-2 ring-lime-400/90 hover:shadow-lime-400/70"
              }`}
              title={
                isStartingMic
                  ? "Connecting..."
                  : isListening
                    ? "Disconnect Speech Recognition"
                    : "Start Speech to Text (AI Scripture Listener)"
              }
            >
              {/* Outer halo ripple when listening */}
              {isListening && (
                <span className="absolute -inset-1 rounded-2xl bg-lime-400/60 animate-ping pointer-events-none" />
              )}

              {isStartingMic ? (
                <Loader2 className="w-5 h-5 animate-spin text-lime-950" />
              ) : (
                <Speech
                  className={`w-5.5 h-5.5 text-lime-950 stroke-[2.4] ${
                    isListening ? "animate-pulse" : ""
                  }`}
                />
              )}

              {/* Corner Live Status Beacon Dot */}
              {!isStartingMic && (
                <span
                  className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-1 ring-lime-950/20 ${
                    isListening ? "bg-black animate-ping" : "bg-lime-950 shadow-xs"
                  }`}
                />
              )}
            </motion.button>
          </div>
        ) : (
          <button
            onClick={() => fetchCrossRefs(currentReference)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-select-bg hover:bg-select-hover border border-select-border text-text-primary transition-colors cursor-pointer shadow-2xs"
            title="Refresh cross-references"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${status === "loading" ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {/* ── Main Tab Content (Vertically Scrollable) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-2 flex flex-col gap-2">
        {/* ── TAB 1: SMART AI LISTENING & PROJECTION ── */}
        {activeTab === "smart" && (
          <div className="flex flex-col gap-2 pb-2">
            {/* Error Message Banner */}
            {micErrorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-[0.7rem]">Listening Error</p>
                  <p className="text-[0.64rem] mt-0.5 leading-relaxed">
                    {micErrorMsg}
                  </p>
                </div>
              </div>
            )}

            {/* Missing Keys Warning Banner */}
            {keyMissingWarning && (!keyStatus.hasAssemblyAiKey || (!keyStatus.hasGroqKey && !keyStatus.hasGeminiKey)) && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-[0.7rem]">API Keys Required</p>
                  <p className="text-[0.64rem] text-text-secondary mt-0.5 leading-relaxed">
                    Please set your <b>AssemblyAI</b> and AI Finder (<b>Groq</b> or <b>Gemini</b>) keys in <b>Settings</b>.
                  </p>
                </div>
              </div>
            )}

            {/* ── Detected Scriptures List (Compact Cross-Reference style) ── */}
            {detectedItems.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-0.5">
                <div className="px-1 flex items-center justify-between">
                  <div className="text-[0.62rem] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3" />
                    <span>Detected Scriptures ({detectedItems.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Auto-Project Quick Toggle Pill */}
                    <button
                      type="button"
                      onClick={() => handleToggleAutoProject(!autoProject)}
                      className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                        autoProject
                          ? "bg-lime-400 text-lime-950 ring-1 ring-lime-400 hover:bg-lime-300"
                          : "bg-select-bg text-text-secondary hover:text-text-primary"
                      }`}
                      title={
                        autoProject
                          ? "Auto-Project is ON: Detected verses are immediately displayed on the projector"
                          : "Auto-Project is OFF (Manual): Click any verse card to project"
                      }
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          autoProject ? "bg-lime-950 animate-pulse" : "bg-text-secondary/60"
                        }`}
                      />
                      <span>Auto: {autoProject ? "ON" : "OFF"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearDetectedHistory}
                      className="text-[0.62rem] font-semibold text-text-secondary hover:text-red-500 transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-red-500/10"
                      title="Clear all detected scriptures"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {detectedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onNavigate({
                          bookName: item.resolved.bookName,
                          chapter: item.resolved.chapter,
                          verse: item.resolved.verseStart,
                        });
                        dispatch(setCurrentBook(item.resolved.bookName));
                        dispatch(setCurrentChapter(item.resolved.chapter));
                        dispatch(setCurrentVerse(item.resolved.verseStart));
                        projectScripture(item, false);
                      }}
                      className="group flex items-center justify-between px-2 py-1.5 rounded-xl bg-card-bg hover:bg-select-hover transition-all duration-150 cursor-pointer shadow-2xs gap-2 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Larger image thumbnail */}
                        <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center bg-select-bg overflow-hidden relative shadow-2xs">
                          <img
                            src="./cross.png"
                            alt="Cross"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>

                        {/* Inline Scripture Reference + Verse Text */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-[0.72rem] text-text-primary dark:text-neutral-200 leading-snug line-clamp-2">
                            <span className="font-bold text-btn-active-from mr-1.5 inline-block">
                              {item.reference}
                            </span>
                            <span>{item.resolved.text}</span>
                          </p>
                        </div>
                      </div>

                      {/* Send / Project Live Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          projectScripture(item, false);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                          item.autoProjected
                            ? "bg-gradient-to-r from-btn-active-from to-btn-active-to text-white shadow-xs"
                            : "bg-btn-active-from hover:bg-btn-active-to text-white hover:scale-105 active:scale-95 shadow-xs"
                        }`}
                        title="Project scripture live"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State when no detections yet */}
            {!latestDetected && !isListening && (
              <div className="py-6 px-4 text-center rounded-2xl bg-card-bg-alt flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-lime-400/10 text-lime-400 mb-2 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                </div>
                <p className="text-[0.74rem] font-bold text-text-primary tracking-tight">
                  Smart Live Scripture Listener
                </p>
                <p className="text-[0.64rem] text-text-secondary mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Click <span className="font-semibold text-text-primary">Start Mic</span> to detect spoken verses in sermons and project them automatically.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ── TAB 2: CLASSIC CROSS REFERENCES ── */}
        {activeTab === "crossref" && (
          <div className="flex flex-col gap-0.5 pb-2">
            {status === "loading" && (
              <div className="flex flex-col gap-1 px-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 rounded animate-pulse bg-select-bg"
                    style={{ opacity: 0.7 - i * 0.15 }}
                  />
                ))}
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-card-bg-alt shadow-2xs">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                  <span className="text-[0.68rem] text-text-secondary">{errorMsg}</span>
                </div>
                <button
                  onClick={() => fetchCrossRefs(currentReference)}
                  className="flex items-center gap-1 text-[0.68rem] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            {status === "success" &&
              refs.map((ref) => (
                <div
                  key={ref.id}
                  onClick={() => handleNavigate(ref)}
                  className="group relative flex items-start justify-between px-2 py-1.5 hover:bg-select-hover/70 transition-colors duration-100 cursor-pointer border-b border-dashed border-select-border/60 last:border-b-0"
                >
                  {/* Inline Scripture Reference + Full Verse Text */}
                  <div className="min-w-0 flex-1 pr-1.5">
                    <p className="text-[0.72rem] text-text-primary leading-snug line-clamp-3">
                      <span className="font-bold text-btn-active-from mr-1.5 inline-block">
                        {ref.reference}
                      </span>
                      <span>{ref.text}</span>
                    </p>
                  </div>
                </div>
              ))}

            {status === "success" && refs.length === 0 && (
              <div className="px-3 py-4 rounded-xl text-[0.68rem] text-text-secondary text-center bg-card-bg shadow-2xs">
                No cross-references found for this verse.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Smart Speech Status / Input Bar ── */}
      {isListening && (
        <div className="flex-shrink-0 pt-1.5 pb-1 px-1 mt-auto">
          <AnimatePresence mode="wait">
            {!liveTranscript.trim() ? (
              /* State A: Connected & Listening - Animated "Speak Now" indicator */
              <motion.div
                key="listening-beacon"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-btn-active-from/10 text-btn-active-from shadow-2xs"
              >
                {/* Pulsing Speech-to-Text with Ripple Ring */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-btn-active-from to-btn-active-to flex items-center justify-center text-white shadow-xs"
                  >
                    <Speech className="w-3.5 h-3.5" />
                  </motion.div>
                  <span className="absolute -inset-0.5 rounded-full bg-btn-active-from/30 animate-ping" />
                </div>

                {/* Animated Audio Equalizer Bars */}
                <div className="flex items-center gap-0.8 h-3.5 px-0.5">
                  {[40, 90, 60, 100, 50].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: ["20%", `${h}%`, "20%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.7 + i * 0.1,
                        ease: "easeInOut",
                        delay: i * 0.1,
                      }}
                      className="w-0.8 bg-btn-active-from rounded-full"
                    />
                  ))}
                </div>

                <span className="text-[0.72rem] font-bold tracking-tight">
                  Listening... You can speak now
                </span>
              </motion.div>
            ) : (
              /* State B: Words Detected - Sleek White Input Display */
              <motion.div
                key="transcript-input"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-card-bg-alt shadow-2xs"
              >
                {/* Left Speech to Text Beacon */}
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-btn-active-from to-btn-active-to text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
                  <Speech className="w-3.5 h-3.5" />
                </div>

                {/* Real-time Spoken Words */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <p className="text-[0.72rem] text-text-primary dark:text-neutral-100 font-medium truncate italic leading-tight">
                    &quot;{liveTranscript}&quot;
                  </p>
                </div>

                {/* Right Status Badge */}
                {isAnalyzing ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[0.62rem] font-bold flex-shrink-0">
                    <Loader2 className="w-2.8 h-2.8 animate-spin" />
                    <span>Detecting</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-btn-active-from/10 text-btn-active-from text-[0.6rem] font-semibold flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-btn-active-from animate-pulse" />
                    <span>Live</span>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
