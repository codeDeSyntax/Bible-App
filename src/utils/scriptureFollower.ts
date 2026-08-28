/**
 * Scripture Follower & Spoken Navigation Engine
 * 
 * Provides:
 * 1. Non-scripture noise and secular collision filtering (detects everyday conversational phrases)
 * 2. Fast local regex detection for explicit spoken navigation commands ("Next", "Next verse", "Read on", "Go back", "Verse 18")
 * 3. Continuous reading completion detection (word token stream matching against current verse text)
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

// Common English stop words to ignore during semantic verse tail matching
const COMMON_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "he'd", "he'll",
  "he's", "her", "here", "hers", "herself", "him", "himself", "his", "how",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
  "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
  "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "said",
  "same", "shan't", "she", "should", "so", "some", "such", "than", "that",
  "the", "their", "theirs", "them", "themselves", "then", "there", "these",
  "they", "this", "those", "through", "to", "too", "under", "until", "unto",
  "up", "very", "was", "wasn't", "we", "were", "what", "when", "where",
  "which", "while", "who", "whom", "why", "will", "with", "would", "you",
  "your", "yours", "yourself", "yourselves"
]);

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
 * 0. Fast Local Noise & Collision Filter
 * Detects everyday conversation, secular announcements, and word collisions (e.g., "acts of kindness", "job search")
 * Returns true if the transcript is non-scripture noise and should NOT trigger AI extraction.
 */
export function isNonScriptureNoise(transcript: string): boolean {
  if (!transcript || transcript.trim().length < 4) return true;

  const clean = normalizeSpokenText(transcript);

  // If it's a strong navigation command ("next verse", "continue", "verse 18"), NEVER filter it as noise
  if (
    /\b(?:next\s+verse|next|read\s+on|continue|previous\s+verse|go\s+back|verse\s+\d+)\b/i.test(
      clean,
    )
  ) {
    return false;
  }

  // 1. Common English Word Collisions with Bible Book Names
  const collisionPatterns = [
    /\bacts\s+of\s+(?:kindness|love|charity|service|mercy|generosity|violence|worship|praise)\b/i,
    /\b(?:good|great|new|lost\s+my|applied\s+for\s+a|looking\s+for\s+a)\s+job\b/i,
    /\bjob\s+(?:interview|market|offer|description|hunting|search|center)\b/i,
    /\b(?:phone|large|small|great|increasing|growing)\s+numbers\s+of\b/i,
    /\bmark\s+(?:my\s+words|of\s+excellence|of\s+a\s+leader|of\s+success|the\s+occasion|this\s+day)\b/i,
    /\bgenesis\s+of\s+(?:this|the|an|our|their)\b/i,
    /\bjohn\s+(?:maxwell|piper|macarthur|calvin|wesley|bevere|hagee|wooden|smith|doe)\b/i,
    /\bbook\s+by\s+john\b/i,
  ];

  for (const pat of collisionPatterns) {
    if (pat.test(clean)) return true;
  }

  // 2. Secular/Logistical Church Speech (pages, money, announcements, dates)
  const secularPatterns = [
    /\b(?:turn\s+to\s+)?page\s+\d+\b/i,
    /\b(?:bulletin|announcement|tithes?\s+and\s+offering|welcome\s+everyone|good\s+morning\s+church)\b/i,
    /\b\$\d+|\b\d+\s+dollars\b/i,
    /\b\d+\s+(?:percent|percentage)\b/i,
    /\b\d+\s+years\s+(?:ago|old)\b/i,
    /\bin\s+(?:19\d\d|20\d\d)\b/i, // calendar years e.g. "in 2024"
    /\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i, // time of day e.g. "at 10:30 am"
    /\bhymn\s+(?:number\s+)?\d+\b/i,
    /\bsong\s+(?:number\s+)?\d+\b/i,
  ];

  for (const pat of secularPatterns) {
    if (pat.test(clean)) return true;
  }

  return false;
}

/**
 * 1. Fast Local Voice Navigation Detection (0ms response)
 * Detects phrases like: "next", "next verse", "read on", "let's continue", "verse 17", "go back", "previous verse"
 */
export function detectVoiceNavigationCommand(
  transcript: string,
  context?: { currentVerse?: number; totalVerses?: number },
): SpokenNavigationCommand {
  if (!transcript || transcript.trim().length < 2) {
    return { detected: false, confidence: 0 };
  }

  const clean = normalizeSpokenText(transcript);
  const curVerse = context?.currentVerse || 1;
  const maxVerse = context?.totalVerses || 200;

  // ── Next Verse Patterns ───────────────────────────────────────────
  const nextPatterns = [
    /\b(?:the\s+)?next\s+verse\b/i,
    /\b(?:the\s+)?next\s+one\b/i,
    /\b(?:read\s+on|let'?s?\s+read\s+on|continue\s+reading|let'?s?\s+continue|continue)\b/i,
    /\b(?:move|go|turn|step)\s+to\s+(?:the\s+)?next(?:\s+verse)?\b/i,
    /\bdown\s+to\s+the\s+next\b/i,
    /^(?:and\s+)?(?:now\s+)?next(?:\s+please)?$/i,
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
    /\b(?:the\s+)?previous\s+one\b/i,
    /\b(?:go|turn|step)\s+back\b/i,
    /\bthe\s+verse\s+before\b/i,
    /\bback\s+up\s+(?:one\s+verse|a\s+verse)?\b/i,
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
 * 2. Continuous Reading Completion Detection with Distinctive Semantic Word Filter
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

  // Check 1: Direct multi-word phrase match
  const transcriptNorm = transcriptWords.join(" ");
  if (tailPhrase.length > 8 && transcriptNorm.includes(tailPhrase)) {
    return {
      isCompleted: true,
      confidence: 0.94,
      matchedEnding: tailPhrase,
    };
  }

  // Check 2: Distinctive semantic words match (excluding stop words)
  const distinctiveTailWords = verseTail.filter(
    (w) => w.length > 2 && !COMMON_STOP_WORDS.has(w),
  );

  if (distinctiveTailWords.length >= 2) {
    let matchedCount = 0;
    let lastIndex = -1;

    for (const word of distinctiveTailWords) {
      const idx = transcriptWords.indexOf(word, lastIndex + 1);
      if (idx !== -1) {
        matchedCount++;
        lastIndex = idx;
      }
    }

    if (matchedCount >= Math.min(3, distinctiveTailWords.length)) {
      return {
        isCompleted: true,
        confidence: 0.88,
        matchedEnding: distinctiveTailWords.join(" "),
      };
    }
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
        confidence: 0.95,
        matchedNextOpening: nextHeadPhrase,
      };
    }
  }

  return { isCompleted: false, confidence: 0 };
}

