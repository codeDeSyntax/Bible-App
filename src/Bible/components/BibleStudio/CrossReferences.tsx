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
  FastForward,
  Keyboard,
  X,
  CircleX,
  ChevronDown,
  Brush,
  Cast,
  Search,
  StepForward,
} from "lucide-react";
import { Tooltip } from "antd";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  addToHistory,
} from "@/store/slices/bibleSlice";
import { micAudioStreamer } from "@/utils/micCapture";
import {
  matchLocalScripture,
  getNextVerseLocation,
  getPrevVerseLocation,
  findScriptureBySpokenPhrase,
  parseSpokenBibleReference,
  ResolvedScripture,
} from "@/utils/canonicalScriptureMatcher";
import {
  detectVoiceNavigationCommand,
  detectVerseReadingProgress,
  isNonScriptureNoise,
} from "@/utils/scriptureFollower";
import {
  ForestThumbnail,
  validateForestImageUrl,
  getThemeGradient,
  getThemeColorPair,
} from "@/utils/forestImageValidator";
import {
  notifyServiceError,
  parseFriendlyErrorMessage,
} from "@/utils/serviceErrorHelper";

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
  gradientColors?: [string, string];
  imageUrl?: string;
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
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const isDarkMode = useAppSelector((state) => state.theme?.isDarkMode ?? false);

  // Tab mode: Smart AI Listening vs Classic Cross-References
  const [activeTab, setActiveTab] = useState<"smart" | "crossref">("smart");

  // Smart Listening State
  const [isListening, setIsListening] = useState(false);
  const [isStartingMic, setIsStartingMic] = useState(false);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);
  const audioLevelRef = useRef(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [, setRecentTranscripts] = useState<string[]>([]);
  const [advanceFeedback, setAdvanceFeedback] = useState<string | null>(null);
  const lastAutoAdvanceRef = useRef<number>(0);

  const [autoProject, setAutoProject] = useState<boolean>(() => {
    try {
      return localStorage.getItem("smartAiAutoProject") === "true";
    } catch {
      return false;
    }
  });

  const [autoAdvance, setAutoAdvance] = useState<boolean>(() => {
    try {
      return localStorage.getItem("smartAiAutoAdvance") !== "false";
    } catch {
      return true;
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInputText, setManualInputText] = useState("");
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showManualInput) {
      setTimeout(() => {
        manualInputRef.current?.focus();
      }, 50);
    }
  }, [showManualInput]);

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

  const handleToggleAutoAdvance = (val: boolean) => {
    setAutoAdvance(val);
    try {
      localStorage.setItem("smartAiAutoAdvance", String(val));
      window.dispatchEvent(
        new CustomEvent("smart-ai-settings-changed", {
          detail: { autoAdvance: val },
        }),
      );
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ autoProject?: boolean; autoAdvance?: boolean }>;
      if (typeof customEvent.detail?.autoProject === "boolean") {
        setAutoProject(customEvent.detail.autoProject);
      }
      if (typeof customEvent.detail?.autoAdvance === "boolean") {
        setAutoAdvance(customEvent.detail.autoAdvance);
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
      const translationData = bibleData?.[currentTranslation || "KJV"];
      const bookData = translationData?.books?.find(
        (book: any) =>
          book.name === item.resolved.bookName ||
          book.name?.toLowerCase() === item.resolved.bookName.toLowerCase(),
      );
      const chapterData = bookData?.chapters?.find(
        (chapter: any) => Number(chapter.chapter) === item.resolved.chapter,
      );
      const chapterVerses = Array.isArray(chapterData?.verses)
        ? chapterData.verses
        : item.resolved.verses;

      dispatch(setCurrentBook(item.resolved.bookName));
      dispatch(setCurrentChapter(item.resolved.chapter));
      dispatch(setCurrentVerse(item.resolved.verseStart));
      dispatch(addToHistory(item.resolved.reference));

      if (typeof window !== "undefined" && window.api?.sendToBiblePresentation) {
        window.api.sendToBiblePresentation({
          type: "update-data",
          data: {
            book: item.resolved.bookName,
            chapter: item.resolved.chapter,
            verses: chapterVerses,
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
    [bibleData, currentTranslation, dispatch, latestDetected],
  );

  // Helper to execute instant verse navigation and project
  const applyVerseNavigation = useCallback(
    (target: { book: string; chapter: number; verse: number }, reason: string) => {
      const resolved = matchLocalScripture(
        bibleData,
        target.book,
        target.chapter,
        target.verse,
        undefined,
        currentTranslation,
      );

      if (!resolved) return false;

      const themeColors = getThemeColorPair(undefined, resolved.reference);
      const themeGradients = getThemeGradient(undefined, resolved.reference);
      const forestImage = validateForestImageUrl(undefined, resolved.reference);

      const detectedCard: DetectedCardItem = {
        id: `${resolved.reference}-${Date.now()}`,
        reference: resolved.reference,
        confidence: 0.95,
        contextSummary: reason,
        resolved,
        timestamp: Date.now(),
        autoProjected: autoProject,
        gradientColors: themeColors,
        imageUrl: forestImage,
      };

      setLatestDetected(detectedCard);
      setDetectedItems((prev) => {
        const filtered = prev.filter((p) => p.reference !== resolved.reference);
        return [detectedCard, ...filtered].slice(0, 10);
      });

      // 1. ALWAYS update Verse Preview Card so the operator sees the detected suggestion immediately
      dispatch(setCurrentBook(resolved.bookName));
      dispatch(setCurrentChapter(resolved.chapter));
      dispatch(setCurrentVerse(resolved.verseStart));

      onNavigate({
        bookName: resolved.bookName,
        chapter: resolved.chapter,
        verse: resolved.verseStart,
      });

      // 2. Only push directly to live presentation screen if autoProject is ON
      if (autoProject) {
        window.dispatchEvent(
          new CustomEvent("smart-scripture-detected", {
            detail: {
              reference: resolved.reference,
              book: resolved.bookName,
              chapter: resolved.chapter,
              verse: resolved.verseStart,
              verses: resolved.verses,
              text: resolved.text,
              gradientColors: themeGradients,
              imageUrl: forestImage,
            },
          }),
        );

        projectScripture(detectedCard, true);
      }

      setAdvanceFeedback(reason);
      setTimeout(() => setAdvanceFeedback(null), 3500);

      lastAutoAdvanceRef.current = Date.now();
      return true;
    },
    [bibleData, currentTranslation, autoProject, projectScripture, dispatch, onNavigate],
  );

  // Trigger Groq or Gemini AI extraction from transcript snippet with active context
  const triggerGroqExtraction = useCallback(
    async (transcript: string): Promise<boolean> => {
      const clean = transcript.trim();
      if (!clean || clean.length < 3) return false;
      if (!window.api?.extractScriptureReference) return false;

      console.log(`🎙️ [Smart AI] Analyzing scripture query: "${clean}"`);
      setIsAnalyzing(true);
      try {
        const contextPayload = {
          book: currentBook,
          chapter: currentChapter,
          verse: currentVerse || 1,
        };

        const result = await window.api.extractScriptureReference(clean, contextPayload);
        console.log("🤖 [Smart AI Raw JSON Result]:\n", JSON.stringify(result, null, 2));

        if (
          result.success &&
          result.data &&
          result.data.detected
        ) {
          const data = result.data;
          console.log("📜 [Smart AI Extracted Data JSON]:\n", JSON.stringify(data, null, 2));
          if (data.confidence && data.confidence < 0.65) {
            console.log(`⚠️ [Smart AI] Low confidence (${data.confidence}) - ignoring extraction`);
            return false;
          }

          let bookName: string = data.book || currentBook;
          let chapterNum: number = data.chapter || currentChapter;
          let startNum: number = data.verseStart || 1;
          const endNum: number | undefined = data.verseEnd;

          // Handle relative actions if returned by AI
          if (data.action === "NEXT_VERSE") {
            const nextLoc = getNextVerseLocation(
              bibleData,
              currentBook,
              currentChapter,
              currentVerse || 1,
              currentTranslation,
            );
            if (nextLoc) {
              bookName = nextLoc.book;
              chapterNum = nextLoc.chapter;
              startNum = nextLoc.verse;
            }
          } else if (data.action === "PREV_VERSE") {
            const prevLoc = getPrevVerseLocation(
              bibleData,
              currentBook,
              currentChapter,
              currentVerse || 1,
              currentTranslation,
            );
            if (prevLoc) {
              bookName = prevLoc.book;
              chapterNum = prevLoc.chapter;
              startNum = prevLoc.verse;
            }
          }

          console.log(`🔍 [Smart AI] Scripture citation target: ${bookName} ${chapterNum}:${startNum}`);

          const resolved = matchLocalScripture(
            bibleData,
            bookName,
            chapterNum,
            startNum,
            endNum,
            currentTranslation,
          );

          console.log("📖 [Smart AI Matched Local Bible Verse JSON]:\n", JSON.stringify(resolved, null, 2));

          if (resolved) {
            const themeColors = getThemeColorPair(data.gradientColors, resolved.reference);
            const themeGradients = getThemeGradient(data.gradientColors, resolved.reference);
            const forestImage = validateForestImageUrl(
              data.imageUrl,
              resolved.reference,
              (data as any).themeKeywords,
            );

            const detectedCard: DetectedCardItem = {
              id: `${resolved.reference}-${Date.now()}`,
              reference: resolved.reference,
              confidence: data.confidence ?? 0.95,
              contextSummary: data.contextSummary || `Match: "${clean}"`,
              resolved,
              timestamp: Date.now(),
              autoProjected: autoProject,
              gradientColors: themeColors,
              imageUrl: forestImage,
            };

            setLatestDetected(detectedCard);
            setDetectedItems((prev) => {
              const filtered = prev.filter(
                (p) => p.reference !== resolved.reference,
              );
              return [detectedCard, ...filtered].slice(0, 10);
            });

            // 1. ALWAYS update Verse Preview Card so the operator sees the detected suggestion immediately
            dispatch(setCurrentBook(resolved.bookName));
            dispatch(setCurrentChapter(resolved.chapter));
            dispatch(setCurrentVerse(resolved.verseStart));

            onNavigate({
              bookName: resolved.bookName,
              chapter: resolved.chapter,
              verse: resolved.verseStart,
            });

            // 2. Only push directly to live presentation screen if autoProject is ON
            if (autoProject) {
              window.dispatchEvent(
                new CustomEvent("smart-scripture-detected", {
                  detail: {
                    reference: resolved.reference,
                    book: resolved.bookName,
                    chapter: resolved.chapter,
                    verse: resolved.verseStart,
                    verses: resolved.verses,
                    text: resolved.text,
                    gradientColors: themeGradients,
                    imageUrl: forestImage,
                  },
                }),
              );

              projectScripture(detectedCard, true);
            }

            setAdvanceFeedback(`Matched ${resolved.reference}`);
            setTimeout(() => setAdvanceFeedback(null), 3500);

            lastAutoAdvanceRef.current = Date.now();
            return true;
          }
        } else if (!result.success && result.error) {
          console.warn("⚠️ [Smart AI] Extraction error:", result.error);
          setMicErrorMsg(result.error);
          notifyServiceError(result.error, {
            title: "Smart AI Listener",
            context: "Scripture Detection",
          });
          return false;
        }
        return false;
      } catch (err) {
        console.error("Smart AI reference extraction error:", err);
        notifyServiceError(err, {
          title: "Smart AI Listener",
          context: "Scripture Detection",
        });
        return false;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      currentBook,
      currentChapter,
      currentVerse,
      bibleData,
      currentTranslation,
      autoProject,
      projectScripture,
      dispatch,
      onNavigate,
    ],
  );

  // Buffer live transcripts & schedule extraction with real-time continuous reading follower
  const onTranscriptChunk = useCallback(
    (transcript: string, isFinal?: boolean) => {
      const clean = transcript.trim();
      if (!clean) return;

      setLiveTranscript(clean);

      const now = Date.now();
      const isCooldownActive = now - lastAutoAdvanceRef.current < 900;

      // ── 1. Fast Local Spoken Scripture Reference Check (0ms response) ──────
      if (clean.length >= 4 && bibleData) {
        const spokenRef = parseSpokenBibleReference(clean, bibleData, currentTranslation);
        if (spokenRef) {
          console.log(
            "⚡ [Smart AI Instant Spoken Reference Match JSON]:\n",
            JSON.stringify(spokenRef, null, 2),
          );
          applyVerseNavigation(
            {
              book: spokenRef.bookName,
              chapter: spokenRef.chapter,
              verse: spokenRef.verseStart,
            },
            `Spoken Citation: "${spokenRef.reference}"`,
          );
          return;
        }
      }

      // ── 2. Fast Local Voice Command Detection (0ms response) ────────
      if (!isCooldownActive && currentBook && currentChapter) {
        const curVerseNum = currentVerse || 1;

        // Check A: Spoken Voice Navigation Command ("next", "next verse", "read on", "go back", "verse 17")
        const command = detectVoiceNavigationCommand(clean, {
          currentVerse: curVerseNum,
          totalVerses: 200,
        });

        if (command.detected && command.action) {
          console.log("⚡ [Voice Command Triggered]:", command.action, `"${command.phrase}"`);

          if (command.action === "NEXT_VERSE") {
            const nextLoc = getNextVerseLocation(
              bibleData,
              currentBook,
              currentChapter,
              curVerseNum,
              currentTranslation,
            );
            if (nextLoc) {
              console.log("⚡ [Navigating to Next Verse]:", nextLoc);
              applyVerseNavigation(nextLoc, `Voice: "${command.phrase || "Next verse"}"`);
              return;
            }
          } else if (command.action === "PREV_VERSE") {
            const prevLoc = getPrevVerseLocation(
              bibleData,
              currentBook,
              currentChapter,
              curVerseNum,
              currentTranslation,
            );
            if (prevLoc) {
              console.log("⚡ [Navigating to Previous Verse]:", prevLoc);
              applyVerseNavigation(prevLoc, `Voice: "${command.phrase || "Previous verse"}"`);
              return;
            }
          } else if (command.action === "JUMP_VERSE" && command.targetVerse) {
            console.log("⚡ [Jumping to Verse]:", command.targetVerse);
            applyVerseNavigation(
              { book: currentBook, chapter: currentChapter, verse: command.targetVerse },
              `Voice: "Verse ${command.targetVerse}"`,
            );
            return;
          }
        }
      }

      // ── 3. Continuous Reading Follower (End-of-verse speech detection) ──
      if (autoAdvance && !isCooldownActive && currentBook && currentChapter) {
        const curVerseNum = currentVerse || 1;
        const currentVerseObj = matchLocalScripture(
          bibleData,
          currentBook,
          currentChapter,
          curVerseNum,
          undefined,
          currentTranslation,
        );
        const nextVerseObj = matchLocalScripture(
          bibleData,
          currentBook,
          currentChapter,
          curVerseNum + 1,
          undefined,
          currentTranslation,
        );

        if (currentVerseObj?.text) {
          const readingProgress = detectVerseReadingProgress(
            clean,
            currentVerseObj.text,
            nextVerseObj?.text,
          );

          if (readingProgress.isCompleted) {
            const nextLoc = getNextVerseLocation(
              bibleData,
              currentBook,
              currentChapter,
              curVerseNum,
              currentTranslation,
            );
            if (nextLoc) {
              applyVerseNavigation(
                nextLoc,
                `Reading completed: "${currentBook} ${currentChapter}:${curVerseNum}"`,
              );
              return;
            }
          }
        }
      }

      // ── 2. Instant Local Concordance Search (0ms response) ───────
      if (clean.length >= 8 && bibleData) {
        const localMatch = findScriptureBySpokenPhrase(
          bibleData,
          clean,
          currentTranslation,
        );
        if (localMatch) {
          console.log("⚡ [Smart AI] Local concordance match found:", localMatch.reference);
          const themeColors = getThemeColorPair(undefined, localMatch.reference);
          const themeGradients = getThemeGradient(undefined, localMatch.reference);
          const forestImage = validateForestImageUrl(undefined, localMatch.reference);

          const detectedCard: DetectedCardItem = {
            id: `${localMatch.reference}-${Date.now()}`,
            reference: localMatch.reference,
            confidence: 0.96,
            contextSummary: `Quoted: "${clean}"`,
            resolved: localMatch,
            timestamp: Date.now(),
            autoProjected: autoProject,
            gradientColors: themeColors,
            imageUrl: forestImage,
          };

          setLatestDetected(detectedCard);
          setDetectedItems((prev) => {
            const filtered = prev.filter((p) => p.reference !== localMatch.reference);
            return [detectedCard, ...filtered].slice(0, 10);
          });

          // 1. ALWAYS update Verse Preview Card so the operator sees the detected suggestion immediately
          dispatch(setCurrentBook(localMatch.bookName));
          dispatch(setCurrentChapter(localMatch.chapter));
          dispatch(setCurrentVerse(localMatch.verseStart));

          onNavigate({
            bookName: localMatch.bookName,
            chapter: localMatch.chapter,
            verse: localMatch.verseStart,
          });

          // 2. Only push directly to live presentation screen if autoProject is ON
          if (autoProject) {
            window.dispatchEvent(
              new CustomEvent("smart-scripture-detected", {
                detail: {
                  reference: localMatch.reference,
                  book: localMatch.bookName,
                  chapter: localMatch.chapter,
                  verse: localMatch.verseStart,
                  verses: localMatch.verses,
                  text: localMatch.text,
                  gradientColors: themeGradients,
                  imageUrl: forestImage,
                },
              }),
            );

            projectScripture(detectedCard, true);
          }

          setRecentTranscripts((prev) => [clean, ...prev].slice(0, 5));
          lastAutoAdvanceRef.current = Date.now();
          return;
        }
      }

      // ── 3. AI Model Extraction (with Noise Guard) ────────────────
      if (isNonScriptureNoise(clean)) {
        return;
      }

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
    [
      autoAdvance,
      currentBook,
      currentChapter,
      currentVerse,
      bibleData,
      currentTranslation,
      autoProject,
      projectScripture,
      dispatch,
      onNavigate,
      applyVerseNavigation,
      triggerGroqExtraction,
    ],
  );

  // Handle manual scripture search / typed text input
  const handleManualSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const clean = manualInputText.trim();
      if (!clean) return;

      setIsAnalyzing(true);
      setMicErrorMsg(null);

      try {
        // 1. Instant local spoken citation match (0ms)
        if (clean.length >= 2 && bibleData) {
          const spokenRef = parseSpokenBibleReference(clean, bibleData, currentTranslation);
          if (spokenRef) {
            console.log("⚡ [Manual AI Input Instant Reference Match]:", spokenRef.reference);
            applyVerseNavigation(
              {
                book: spokenRef.bookName,
                chapter: spokenRef.chapter,
                verse: spokenRef.verseStart,
              },
              `Manual: "${spokenRef.reference}"`,
            );
            setManualInputText("");
            return;
          }

          // 2. Instant local phrase concordance match (0ms)
          const localMatch = findScriptureBySpokenPhrase(
            bibleData,
            clean,
            currentTranslation,
          );
          if (localMatch) {
            console.log("⚡ [Manual AI Input Concordance Match]:", localMatch.reference);
            const themeColors = getThemeColorPair(undefined, localMatch.reference);
            const themeGradients = getThemeGradient(undefined, localMatch.reference);
            const forestImage = validateForestImageUrl(undefined, localMatch.reference);

            const detectedCard: DetectedCardItem = {
              id: `${localMatch.reference}-${Date.now()}`,
              reference: localMatch.reference,
              confidence: 0.98,
              contextSummary: `Manual: "${clean}"`,
              resolved: localMatch,
              timestamp: Date.now(),
              autoProjected: autoProject,
              gradientColors: themeColors,
              imageUrl: forestImage,
            };

            setLatestDetected(detectedCard);
            setDetectedItems((prev) => {
              const filtered = prev.filter((p) => p.reference !== localMatch.reference);
              return [detectedCard, ...filtered].slice(0, 10);
            });

            // 1. ALWAYS update Verse Preview Card so the operator sees the detected suggestion immediately
            dispatch(setCurrentBook(localMatch.bookName));
            dispatch(setCurrentChapter(localMatch.chapter));
            dispatch(setCurrentVerse(localMatch.verseStart));

            onNavigate({
              bookName: localMatch.bookName,
              chapter: localMatch.chapter,
              verse: localMatch.verseStart,
            });

            // 2. Only push directly to live presentation screen if autoProject is ON
            if (autoProject) {
              window.dispatchEvent(
                new CustomEvent("smart-scripture-detected", {
                  detail: {
                    reference: localMatch.reference,
                    book: localMatch.bookName,
                    chapter: localMatch.chapter,
                    verse: localMatch.verseStart,
                    verses: localMatch.verses,
                    text: localMatch.text,
                    gradientColors: themeGradients,
                    imageUrl: forestImage,
                  },
                }),
              );

              projectScripture(detectedCard, true);
            }

            setAdvanceFeedback(`Matched ${localMatch.reference}`);
            setTimeout(() => setAdvanceFeedback(null), 3500);

            setRecentTranscripts((prev) => [clean, ...prev].slice(0, 5));
            setManualInputText("");
            return;
          }
        }

        // 3. Fallback to AI Model Extraction (Groq / Gemini)
        const matched = await triggerGroqExtraction(clean);
        if (matched) {
          setRecentTranscripts((prev) => [clean, ...prev].slice(0, 5));
          setManualInputText("");
        } else {
          setAdvanceFeedback(`No scripture match found for "${clean.slice(0, 28)}..."`);
          setTimeout(() => setAdvanceFeedback(null), 4000);
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      manualInputText,
      bibleData,
      currentTranslation,
      autoProject,
      applyVerseNavigation,
      triggerGroqExtraction,
      dispatch,
      onNavigate,
      projectScripture,
    ],
  );

  // Start / Stop Microphone Listening
  const toggleListening = useCallback(async () => {
    if (isListening) {
      micAudioStreamer.stop();
      await window.api?.stopSmartListening();
      setIsListening(false);
      setIsStartingMic(false);
      audioLevelRef.current = 0;
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
          audioLevelRef.current = level;
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
          audioLevelRef.current = 0;
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

  // Global Keyboard Shortcut to Toggle Smart AI Listener (Alt+M / Alt+m / Ctrl+Shift+M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isM =
        e.key === "m" ||
        e.key === "M" ||
        e.code === "KeyM" ||
        (typeof e.key === "string" && e.key.toLowerCase() === "m");
      const isAltM = e.altKey && !e.ctrlKey && !e.metaKey && isM;
      const isCtrlShiftM = (e.ctrlKey || e.metaKey) && e.shiftKey && isM;

      if (isAltM || isCtrlShiftM) {
        e.preventDefault();
        e.stopPropagation();

        if (isStartingMic) return;

        if (activeTab !== "smart") {
          setActiveTab("smart");
        }

        toggleListening();
      }
    };

    const handleToggleCustomEvent = () => {
      if (isStartingMic) return;
      if (activeTab !== "smart") {
        setActiveTab("smart");
      }
      toggleListening();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("bible-smart-listener-toggle", handleToggleCustomEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("bible-smart-listener-toggle", handleToggleCustomEvent);
    };
  }, [toggleListening, isStartingMic, activeTab]);

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
        const { message } = parseFriendlyErrorMessage(
          err,
          "Cross References",
          "Unable to load online cross-references at this time.",
        );
        setErrorMsg(message);
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
    dispatch(addToHistory(ref.reference));
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
            <Tooltip
              title={
                isStartingMic
                  ? "Connecting to Smart AI..."
                  : isListening
                    ? "Disconnect Smart AI Speech Recognition [Alt + M]"
                    : "Start Speech to Text (AI Scripture Listener) [Alt + M]"
              }
              placement="left"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleListening}
                disabled={isStartingMic}
                className={`relative w-9.5 h-9.5 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60 ${
                  isListening
                    ? "!bg-lime-400 text-black shadow-lg shadow-lime-400/60 ring-2 ring-lime-200 animate-pulse"
                    : "!bg-lime-400 hover:!bg-lime-300 text-lime-950 shadow-md shadow-lime-500/40 ring-2 ring-lime-400/90 hover:shadow-lime-400/70"
                }`}
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
            </Tooltip>
          </div>
        ) : (
          <Tooltip title="Refresh cross-references" placement="left">
            <button
              onClick={() => fetchCrossRefs(currentReference)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-select-bg hover:bg-select-hover border border-select-border text-text-primary transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${status === "loading" ? "animate-spin" : ""}`} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* ── Main Tab Content (Vertically Scrollable) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-2 pb-12 flex flex-col gap-2">
        {/* ── TAB 1: SMART AI LISTENING & PROJECTION ── */}
        {activeTab === "smart" && (
          <div className="flex flex-col gap-2 pb-2">

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

            {/* Auto-Advance Feedback Alert */}
            {advanceFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-2 rounded-xl bg-lime-400/15 border border-lime-400/40 text-lime-600 dark:text-lime-300 text-xs flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-lime-500 flex-shrink-0 animate-spin" />
                  <span className="text-[0.68rem] font-bold truncate">
                    {advanceFeedback}
                  </span>
                </div>
                <span className="text-[0.6rem] font-semibold opacity-75">Auto-navigated</span>
              </motion.div>
            )}

            {/* ── Mode Toggles Bar & Controls ── */}
            <div className="px-1 flex items-center justify-between">
              <div className="text-[0.62rem] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                <History className="w-3 h-3" />
                <span>Detected Scriptures {detectedItems.length > 0 ? `(${detectedItems.length})` : ""}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Auto-Advance Icon-Only Toggle */}
                <Tooltip
                  title={
                    autoAdvance
                      ? "Auto-Advance is ON (Continuous reading & voice navigation)"
                      : "Auto-Advance is OFF"
                  }
                  placement="top"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleAutoAdvance(!autoAdvance)}
                    className={`w-[19px] h-[19px] min-w-[19px] min-h-[19px] aspect-square rounded-[4px] p-0 flex-shrink-0 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 ${
                      autoAdvance
                        ? "bg-lime-400 text-lime-950 ring-1 ring-lime-400/80 hover:bg-lime-300 shadow-xs"
                        : "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary border border-black/10 dark:border-white/15"
                    }`}
                  >
                    <StepForward className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                </Tooltip>

                {/* Auto-Project Icon-Only Toggle */}
                <Tooltip
                  title={
                    autoProject
                      ? "Auto-Project is ON (Instantly displays detected scripture on live screen)"
                      : "Auto-Project is OFF (Manual)"
                  }
                  placement="top"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleAutoProject(!autoProject)}
                    className={`w-[19px] h-[19px] min-w-[19px] min-h-[19px] aspect-square rounded-[4px] p-0 flex-shrink-0 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 ${
                      autoProject
                        ? "bg-lime-400 text-lime-950 ring-1 ring-lime-400/80 hover:bg-lime-300 shadow-xs"
                        : "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary border border-black/10 dark:border-white/15"
                    }`}
                  >
                    <Cast className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                </Tooltip>

                {/* Manual AI Scripture Input Trigger Button */}
                <Tooltip
                  title={
                    showManualInput
                      ? "Hide manual text input"
                      : "Type scripture or sermon phrase manually (AI Finder)"
                  }
                  placement="top"
                >
                  <button
                    type="button"
                    onClick={() => setShowManualInput((prev) => !prev)}
                    className={`w-[19px] h-[19px] min-w-[19px] min-h-[19px] aspect-square rounded-[4px] p-0 flex-shrink-0 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 ${
                      showManualInput
                        ? "bg-lime-400 text-lime-950 ring-1 ring-lime-400/80 hover:bg-lime-300 shadow-xs"
                        : "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary border border-black/10 dark:border-white/15"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                </Tooltip>

                {detectedItems.length > 0 && (
                  <Tooltip title="Clear all detected scriptures" placement="top">
                    <button
                      type="button"
                      onClick={clearDetectedHistory}
                      className="w-[19px] h-[19px] min-w-[19px] min-h-[19px] aspect-square rounded-[4px] p-0 flex-shrink-0 flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 bg-transparent hover:bg-red-500/15 text-text-secondary hover:text-red-500 border border-black/10 dark:border-white/15"
                    >
                      <Brush className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* ── Detected Scriptures List ── */}
            {detectedItems.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {detectedItems.map((item) => {
                  const [color1] = getThemeColorPair(item.gradientColors, item.reference);
                  const cardGradient = getThemeGradient(item.gradientColors, item.reference);
                  return (
                    <Tooltip
                      key={item.id}
                      placement="left"
                      mouseEnterDelay={0.25}
                      title={
                        <div className="max-w-[280px] p-1 flex flex-col gap-1.5 text-left select-none">
                          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-1">
                            <span className="font-bold text-xs text-lime-400 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                              {item.reference}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-lime-400/20 text-lime-300 font-semibold flex items-center gap-0.5">
                              {Math.round((item.confidence || 0.95) * 100)}% Match
                            </span>
                          </div>
                          {item.contextSummary && (
                            <p className="text-[11px] text-white/70 italic line-clamp-2">
                              &ldquo;{item.contextSummary}&rdquo;
                            </p>
                          )}
                          <p className="text-[11px] text-white/95 leading-relaxed max-h-36 overflow-y-auto pr-1">
                            {item.resolved.text}
                          </p>
                          <div className="flex items-center justify-between text-[9.5px] text-white/60 pt-1 border-t border-white/10">
                            <span>Click card to navigate</span>
                            <span>Send icon to project</span>
                          </div>
                        </div>
                      }
                    >
                      <div
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
                        style={{
                          background: cardGradient,
                        }}
                        className="group relative flex items-center justify-between px-2.5 py-2 rounded-xl bg-card-bg hover:bg-select-hover transition-all duration-200 cursor-pointer shadow-2xs gap-2.5 overflow-hidden border-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Validated Natural Forest Image Thumbnail */}
                          <div className="flex-shrink-0">
                            <ForestThumbnail
                              imageUrl={item.imageUrl}
                              seedString={item.reference}
                              className="w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-2xs"
                            />
                          </div>

                          {/* Inline Scripture Reference + Verse Text */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <p className="text-[0.72rem] text-text-primary leading-snug line-clamp-2">
                              <span
                                className="font-bold mr-1.5 inline-block"
                                style={{ color: color1 }}
                              >
                                {item.reference}
                              </span>
                              <span>{item.resolved.text}</span>
                            </p>
                          </div>
                        </div>

                        {/* Send / Project Live Button */}
                        <Tooltip
                          title={
                            item.autoProjected
                              ? "Live on projection screen"
                              : `Project ${item.reference} live to screen`
                          }
                          placement="left"
                        >
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
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* Empty State when no detections yet */}
            {detectedItems.length === 0 && !isListening && (
              <div className="py-6 px-4 text-center rounded-2xl bg-card-bg-alt flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-lime-400/10 text-lime-400 mb-2 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                </div>
                <p className="text-[0.74rem] font-bold text-text-primary tracking-tight">
                  Smart Live Scripture Listener
                </p>
                <p className="text-[0.64rem] text-text-secondary mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Click <span className="font-semibold text-text-primary">Start Mic</span> or click <Keyboard className="w-3 h-3 inline-block -mt-0.5 mx-0.5" /> to type a verse or preaching quote manually.
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
                <Tooltip title="Retry fetching cross-references" placement="top">
                  <button
                    onClick={() => fetchCrossRefs(currentReference)}
                    className="flex items-center gap-1 text-[0.68rem] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </Tooltip>
              </div>
            )}

            {status === "success" &&
              refs.map((ref) => (
                <Tooltip
                  key={ref.id}
                  placement="left"
                  mouseEnterDelay={0.25}
                  title={
                    <div className="max-w-[280px] p-1 flex flex-col gap-1 text-left select-none">
                      <div className="font-bold text-xs text-lime-400 flex items-center gap-1 border-b border-white/15 pb-1">
                        <Link2 className="w-3 h-3 text-lime-400" />
                        {ref.reference}
                      </div>
                      <p className="text-[11px] text-white/95 leading-relaxed max-h-36 overflow-y-auto pr-1">
                        {ref.text}
                      </p>
                      <div className="text-[9.5px] text-white/60 pt-1 border-t border-white/10">
                        Click to navigate to this reference
                      </div>
                    </div>
                  }
                >
                  <div
                    onClick={() => handleNavigate(ref)}
                    className="group relative flex items-start justify-between px-2 py-1.5 hover:bg-select-hover/70 transition-colors duration-100 cursor-pointer border-b border-dashed border-select-border dark:border-select-border/60 last:border-b-0"
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
                </Tooltip>
              ))}

            {status === "success" && refs.length === 0 && (
              <div className="px-3 py-4 rounded-xl text-[0.68rem] text-text-secondary text-center bg-card-bg shadow-2xs">
                No cross-references found for this verse.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Smart Speech Status / Manual Input Bar ── */}
      {(isListening || showManualInput) && (
        <div className="flex-shrink-0 pt-1.5 pb-1 px-1 mt-auto">
          <AnimatePresence mode="wait">
            {showManualInput ? (
              /* State 1: Manual Text Input Form */
              <motion.form
                key="manual-input-form"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleManualSubmit}
                style={{
                  backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#18181b",
                }}
                className="h-10 p-1 pl-2.5 rounded-xl shadow-xs border border-lime-400/50 flex items-center gap-1.5"
              >
                <div className="h-8 w-8 rounded-lg bg-lime-400 text-lime-950 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div className="relative flex-1 min-w-0 flex items-center h-full">
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualInputText}
                    onChange={(e) => setManualInputText(e.target.value)}
                    placeholder={
                      isAnalyzing
                        ? "AI is searching scripture..."
                        : "Type Bible verse, phrase, or sermon quote..."
                    }
                    disabled={isAnalyzing}
                    className="w-full h-full bg-transparent border-0 outline-none text-xs text-text-primary placeholder:text-text-secondary/60 py-0 pr-6 disabled:opacity-60"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowManualInput(false);
                      }
                    }}
                  />
                  {manualInputText && !isAnalyzing && (
                    <Tooltip title="Clear text" placement="top">
                      <button
                        type="button"
                        onClick={() => setManualInputText("")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors border-0 outline-none"
                      >
                        <CircleX className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
                      </button>
                    </Tooltip>
                  )}
                </div>

                {isAnalyzing ? (
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.4]" />
                  </div>
                ) : (
                  <Tooltip title="Find & Generate Scripture Card (Enter)" placement="top">
                    <button
                      type="submit"
                      disabled={!manualInputText.trim()}
                      className="h-8 px-2.5 rounded-lg bg-lime-400 hover:bg-lime-300 active:scale-95 disabled:opacity-40 disabled:hover:bg-lime-400 disabled:active:scale-100 text-lime-950 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed flex-shrink-0 font-bold text-[0.7rem] border-0 outline-none"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </Tooltip>
                )}

                <Tooltip title="Close input (Esc)" placement="top">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="h-8 w-8 rounded-lg bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer active:scale-95 flex-shrink-0 border-0 outline-none"
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </Tooltip>
              </motion.form>
            ) : !liveTranscript.trim() ? (
              /* State 2: Connected & Listening - White in Light Mode, Pure Black in Dark Mode */
              <motion.div
                key="listening-beacon"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#18181b",
                }}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3.5 rounded-xl shadow-2xs border-0"
              >
                {/* Pulsing Speech-to-Text with Ripple Ring */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                    className="w-6.5 h-6.5 rounded-full bg-lime-400 text-lime-950 flex items-center justify-center shadow-xs"
                  >
                    <Speech className="w-3.5 h-3.5 stroke-[2.5]" />
                  </motion.div>
                  <span className="absolute -inset-0.5 rounded-full bg-lime-400/40 animate-ping" />
                </div>

                {/* Animated Audio Equalizer Bars */}
                <div className="flex items-center gap-1 h-3.5 px-0.5">
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
                      className="w-1 bg-lime-500 dark:bg-lime-400 rounded-full"
                    />
                  ))}
                </div>

                <span
                  style={{ color: isDarkMode ? "#ffffff" : "#18181b" }}
                  className="text-[0.74rem] font-bold tracking-tight"
                >
                  Listening to you... speak now
                </span>
              </motion.div>
            ) : (
              /* State 3: Words Detected - White in Light Mode, Pure Black in Dark Mode */
              <motion.div
                key="transcript-input"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#18181b",
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl shadow-2xs border-0"
              >
                {/* Left Speech to Text Beacon */}
                <div className="w-6.5 h-6.5 rounded-lg bg-lime-400 text-lime-950 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Speech className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>

                {/* Real-time Spoken Words - Crisp and Highly Visible */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <p
                    style={{ color: isDarkMode ? "#ffffff" : "#18181b" }}
                    className="text-[0.75rem] font-bold truncate italic leading-tight"
                  >
                    &quot;{liveTranscript}&quot;
                  </p>
                </div>

                {/* Right Status Badge */}
                {isAnalyzing ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 text-[0.62rem] font-bold flex-shrink-0">
                    <Loader2 className="w-2.8 h-2.8 animate-spin stroke-[2.5]" />
                    <span>Detecting</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-400/25 text-lime-950 dark:text-lime-300 text-[0.62rem] font-bold flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 dark:bg-lime-400 animate-pulse" />
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
