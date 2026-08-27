/**
 * Scripture Follower & Spoken Navigation Engine
 * 
 * Provides:
 * 1. Fast local regex detection for explicit spoken navigation commands ("Next verse", "Read on", "Go back", "Verse 18")
 * 2. Continuous reading completion detection (word token stream matching against current verse text)
 */

export interface SpokenNavigationCommand {
  detected: boolean;
  action?: "NEXT_VERSE" | "PREV_VERSE" | "JUMP_VERSE";
  targetVerse?: number;
  confidence: number;
  phrase?: string;
}

export interface ReadingCompletionResult {
  isCompleted: boolean;
  confidence: number;
  matchedEnding?: string;
  matchedNextOpening?: string;
}

// Map spoken number words to integers
const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  "twenty one": 21,
  "twenty two": 22,
  "twenty three": 23,
  "twenty four": 24,
  "twenty five": 25,
  "twenty six": 26,
  "twenty seven": 27,
  "twenty eight": 28,
  "twenty nine": 29,
  thirty: 30,
  "thirty one": 31,
  "thirty two": 32,
  "thirty three": 33,
  "thirty four": 34,
  "thirty five": 35,
  "thirty six": 36,
  "thirty seven": 37,
  "thirty eight": 38,
  "thirty nine": 39,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/**
 * Normalizes text for audio comparison:
 * Lowercases, strips punctuation/special characters, collapses whitespace
 */
export function normalizeSpokenText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[{}\[\]()"'`.,;:!?—–\-\/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts words array from text
 */
export function extractWords(text: string): string[] {
  const norm = normalizeSpokenText(text);
  return norm ? norm.split(" ").filter(Boolean) : [];
}

/**
 * Parses spoken verse number like "17" or "seventeen"
 */
function parseVerseNumber(numStr: string): number | null {
  if (!numStr) return null;
  const directNum = parseInt(numStr, 10);
  if (!isNaN(directNum) && directNum > 0) return directNum;

  const clean = numStr.trim().toLowerCase();
  if (NUMBER_WORDS[clean]) return NUMBER_WORDS[clean];

  return null;
}

/**
 * 1. Fast Local Voice Navigation Detection (0ms response)
 * Detects phrases like: "next verse", "read on", "let's continue", "verse 17", "go back", "previous verse"
 */
export function detectVoiceNavigationCommand(
  transcript: string,
  context?: { currentVerse?: number; totalVerses?: number },
): SpokenNavigationCommand {
  if (!transcript || transcript.trim().length < 3) {
    return { detected: false, confidence: 0 };
  }

  const clean = normalizeSpokenText(transcript);
  const curVerse = context?.currentVerse || 1;
  const maxVerse = context?.totalVerses || 200;

  // ── Next Verse Patterns ───────────────────────────────────────────
  const nextPatterns = [
    /\b(?:the\s+)?next\s+verse\b/i,
    /\b(?:read\s+on|let'?s?\s+read\s+on|continue\s+reading|let'?s?\s+continue)\b/i,
    /\b(?:move|go)\s+to\s+the\s+next\s+verse\b/i,
    /\bdown\s+to\s+the\s+next\b/i,
  ];

  for (const pat of nextPatterns) {
    const match = clean.match(pat);
    if (match) {
      const target = Math.min(maxVerse, curVerse + 1);
      return {
        detected: true,
        action: "NEXT_VERSE",
        targetVerse: target,
        confidence: 0.95,
        phrase: match[0],
      };
    }
  }

  // ── Previous Verse Patterns ───────────────────────────────────────
  const prevPatterns = [
    /\b(?:the\s+)?previous\s+verse\b/i,
    /\b(?:go|turn|step)\s+back\b/i,
    /\bthe\s+verse\s+before\b/i,
    /\bback\s+up\s+one\s+verse\b/i,
  ];

  for (const pat of prevPatterns) {
    const match = clean.match(pat);
    if (match) {
      const target = Math.max(1, curVerse - 1);
      return {
        detected: true,
        action: "PREV_VERSE",
        targetVerse: target,
        confidence: 0.95,
        phrase: match[0],
      };
    }
  }

  // ── Direct Verse Jump in Same Chapter ("look at verse 18", "verse twenty") ──
  // Matches "verse 18", "verse eighteen", "v 18"
  const jumpMatch = clean.match(
    /\b(?:look\s+at\s+|read\s+|go\s+to\s+|turn\s+to\s+)?verse\s+(\d+|[a-z]+(?:\s+[a-z]+)?)\b/i,
  );

  if (jumpMatch && jumpMatch[1]) {
    const parsed = parseVerseNumber(jumpMatch[1]);
    if (parsed && parsed > 0 && parsed <= maxVerse && parsed !== curVerse) {
      return {
        detected: true,
        action: "JUMP_VERSE",
        targetVerse: parsed,
        confidence: 0.9,
        phrase: jumpMatch[0],
      };
    }
  }

  return { detected: false, confidence: 0 };
}

/**
 * 2. Continuous Reading Completion Detection
 * Compares live spoken transcript against the tail end of the current verse text
 * and optionally the opening words of the upcoming next verse.
 */
export function detectVerseReadingProgress(
  liveTranscript: string,
  currentVerseText: string,
  nextVerseText?: string,
): ReadingCompletionResult {
  if (!liveTranscript || !currentVerseText) {
    return { isCompleted: false, confidence: 0 };
  }

  const transcriptWords = extractWords(liveTranscript);
  const currentWords = extractWords(currentVerseText);

  if (transcriptWords.length < 3 || currentWords.length < 3) {
    return { isCompleted: false, confidence: 0 };
  }

  // Look at the last 4–7 words of current verse
  const tailWordCount = Math.min(6, Math.max(3, Math.floor(currentWords.length * 0.35)));
  const verseTail = currentWords.slice(-tailWordCount);
  const tailPhrase = verseTail.join(" ");

  // Check 1: Did the transcript contain the verse's tail phrase?
  const transcriptNorm = transcriptWords.join(" ");
  if (tailPhrase.length > 8 && transcriptNorm.includes(tailPhrase)) {
    return {
      isCompleted: true,
      confidence: 0.92,
      matchedEnding: tailPhrase,
    };
  }

  // Check 2: Fuzzy sequential match on tail words (allows 1 missing filler word like "and" or "the")
  let matchedTailCount = 0;
  let lastFoundIndex = -1;

  for (const word of verseTail) {
    if (word.length <= 2) continue; // skip small stop words
    const idx = transcriptWords.indexOf(word, lastFoundIndex + 1);
    if (idx !== -1) {
      matchedTailCount++;
      lastFoundIndex = idx;
    }
  }

  const significantTailWords = verseTail.filter((w) => w.length > 2);
  if (significantTailWords.length > 0 && matchedTailCount / significantTailWords.length >= 0.75) {
    return {
      isCompleted: true,
      confidence: 0.85,
      matchedEnding: verseTail.join(" "),
    };
  }

  // Check 3: If next verse is provided, check if the preacher has already started reading its opening words!
  if (nextVerseText) {
    const nextWords = extractWords(nextVerseText);
    const headWordCount = Math.min(5, Math.max(3, Math.floor(nextWords.length * 0.35)));
    const nextHead = nextWords.slice(0, headWordCount);
    const nextHeadPhrase = nextHead.join(" ");

    if (nextHeadPhrase.length > 8 && transcriptNorm.includes(nextHeadPhrase)) {
      return {
        isCompleted: true,
        confidence: 0.94,
        matchedNextOpening: nextHeadPhrase,
      };
    }
  }

  return { isCompleted: false, confidence: 0 };
}
