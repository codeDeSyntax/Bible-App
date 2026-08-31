import { Book, BibleTranslation } from "@/store/slices/bibleSlice";

export interface ResolvedScripture {
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  reference: string;
  text: string;
  verses: Array<{ verse: number; text: string }>;
}

// Canonical 66 Books of the Bible with common variations and abbreviations
const CANONICAL_BOOKS: Record<string, string[]> = {
  Genesis: ["genesis", "gen", "ge", "gn"],
  Exodus: ["exodus", "exod", "exo", "ex"],
  Leviticus: ["leviticus", "lev", "le", "lv"],
  Numbers: ["numbers", "num", "nu", "nm", "nb"],
  Deuteronomy: ["deuteronomy", "deut", "deu", "dt"],
  Joshua: ["joshua", "josh", "jos", "jsh"],
  Judges: ["judges", "judg", "jdg", "jg", "jdgs"],
  Ruth: ["ruth", "rth", "ru"],
  "1 Samuel": ["1 samuel", "1st samuel", "first samuel", "1 sam", "1sam", "1sa", "1s", "i samuel", "i sam"],
  "2 Samuel": ["2 samuel", "2nd samuel", "second samuel", "2 sam", "2sam", "2sa", "2s", "ii samuel", "ii sam"],
  "1 Kings": ["1 kings", "1st kings", "first kings", "1 kgs", "1kgs", "1ki", "1k", "i kings", "i kgs"],
  "2 Kings": ["2 kings", "2nd kings", "second kings", "2 kgs", "2kgs", "2ki", "2k", "ii kings", "ii kgs"],
  "1 Chronicles": ["1 chronicles", "1st chronicles", "first chronicles", "1 chron", "1 chr", "1ch", "i chronicles"],
  "2 Chronicles": ["2 chronicles", "2nd chronicles", "second chronicles", "2 chron", "2 chr", "2ch", "ii chronicles"],
  Ezra: ["ezra", "ezr", "ez"],
  Nehemiah: ["nehemiah", "neh", "ne"],
  Esther: ["esther", "esth", "es"],
  Job: ["job", "jb"],
  Psalms: ["psalms", "psalm", "psa", "psm", "pss", "ps"],
  Proverbs: ["proverbs", "proverb", "prov", "pro", "prv", "pr"],
  Ecclesiastes: ["ecclesiastes", "eccles", "ecc", "ec", "qoh"],
  "Song of Solomon": ["song of solomon", "song of songs", "canticles", "song", "sos", "cant"],
  Isaiah: ["isaiah", "isa", "is"],
  Jeremiah: ["jeremiah", "jer", "je", "jr"],
  Lamentations: ["lamentations", "lam", "la"],
  Ezekiel: ["ezekiel", "ezek", "eze", "ezk"],
  Daniel: ["daniel", "dan", "da", "dn"],
  Hosea: ["hosea", "hos", "ho"],
  Joel: ["joel", "joe", "jl"],
  Amos: ["amos", "amo", "am"],
  Obadiah: ["obadiah", "obad", "oba", "ob"],
  Jonah: ["jonah", "jnh", "jon"],
  Micah: ["micah", "mic", "mc"],
  Nahum: ["nahum", "nah", "na"],
  Habakkuk: ["habakkuk", "hab", "hb"],
  Zephaniah: ["zephaniah", "zeph", "zep", "zp"],
  Haggai: ["haggai", "hag", "hg"],
  Zechariah: ["zechariah", "zech", "zec", "zc"],
  Malachi: ["malachi", "mal", "ml"],
  Matthew: ["matthew", "matt", "mat", "mt"],
  Mark: ["mark", "mrk", "mar", "mk"],
  Luke: ["luke", "luk", "lk"],
  John: ["john", "joh", "jhn", "jn"],
  Acts: ["acts", "act", "ac"],
  Romans: ["romans", "roman", "rom", "ro", "rm"],
  "1 Corinthians": ["1 corinthians", "1st corinthians", "first corinthians", "1 cor", "1cor", "1co", "i corinthians", "i cor"],
  "2 Corinthians": ["2 corinthians", "2nd corinthians", "second corinthians", "2 cor", "2cor", "2co", "ii corinthians", "ii cor"],
  Galatians: ["galatians", "galatian", "gal", "ga"],
  Ephesians: ["ephesians", "ephesian", "eph", "ep"],
  Philippians: ["philippians", "philippian", "phil", "php", "pp"],
  Colossians: ["colossians", "colossian", "col", "co"],
  "1 Thessalonians": ["1 thessalonians", "1st thessalonians", "first thessalonians", "1 thess", "1th", "i thessalonians"],
  "2 Thessalonians": ["2 thessalonians", "2nd thessalonians", "second thessalonians", "2 thess", "2th", "ii thessalonians"],
  "1 Timothy": ["1 timothy", "1st timothy", "first timothy", "1 tim", "1ti", "1t", "i timothy"],
  "2 Timothy": ["2 timothy", "2nd timothy", "second timothy", "2 tim", "2ti", "2t", "ii timothy"],
  Titus: ["titus", "tit", "ti"],
  Philemon: ["philemon", "philem", "phm", "pm"],
  Hebrews: ["hebrews", "hebrew", "heb", "he"],
  James: ["james", "jas", "jm"],
  "1 Peter": ["1 peter", "1st peter", "first peter", "1 pet", "1pe", "1pt", "i peter"],
  "2 Peter": ["2 peter", "2nd peter", "second peter", "2 pet", "2pe", "2pt", "ii peter"],
  "1 John": ["1 john", "1st john", "first john", "1 jhn", "1jn", "1j", "i john"],
  "2 John": ["2 john", "2nd john", "second john", "2 jhn", "2jn", "2j", "ii john"],
  "3 John": ["3 john", "3rd john", "third john", "3 jhn", "3jn", "3j", "iii john"],
  Jude: ["jude", "jud", "jd"],
  Revelation: ["revelation", "revelations", "rev", "re", "rv", "apocalypse"],
};

/**
 * Resolve any input book string to the standardized canonical book name
 */
export function normalizeCanonicalBookName(rawBook: string): string | null {
  if (!rawBook) return null;
  const clean = rawBook.trim().toLowerCase().replace(/[.,;:_]/g, "");

  for (const [canonical, aliases] of Object.entries(CANONICAL_BOOKS)) {
    if (canonical.toLowerCase() === clean) return canonical;
    if (aliases.includes(clean)) return canonical;
  }

  // Prefix match fallback (e.g. "rom" -> "Romans", "matt" -> "Matthew")
  for (const [canonical, aliases] of Object.entries(CANONICAL_BOOKS)) {
    if (canonical.toLowerCase().startsWith(clean) && clean.length >= 3) {
      return canonical;
    }
    for (const alias of aliases) {
      if (alias.startsWith(clean) && clean.length >= 3) {
        return canonical;
      }
    }
  }

  return null;
}

/**
 * Helper to safely extract BibleTranslation from single translation object or Redux dictionary
 */
function extractBibleTranslation(
  bibleDataInput: any,
  preferredTranslation?: string,
): BibleTranslation | null {
  if (!bibleDataInput) return null;
  if (typeof bibleDataInput === "object" && "books" in bibleDataInput && Array.isArray(bibleDataInput.books)) {
    return bibleDataInput as BibleTranslation;
  }
  if (typeof bibleDataInput === "object") {
    const translation = preferredTranslation || "KJV";
    if (bibleDataInput[translation] && Array.isArray(bibleDataInput[translation].books)) {
      return bibleDataInput[translation];
    }
    if (bibleDataInput["KJV"] && Array.isArray(bibleDataInput["KJV"].books)) {
      return bibleDataInput["KJV"];
    }
    for (const val of Object.values(bibleDataInput)) {
      if (val && typeof val === "object" && "books" in val && Array.isArray((val as any).books)) {
        return val as BibleTranslation;
      }
    }
  }
  return null;
}

/**
 * Match scripture reference against local loaded Bible data in Redux
 */
export function matchLocalScripture(
  bibleDataInput: BibleTranslation | { [key: string]: BibleTranslation } | null | undefined,
  rawBook: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number,
  preferredTranslation?: string,
): ResolvedScripture | null {
  if (!bibleDataInput || !rawBook || !chapter || !verseStart) {
    return null;
  }

  const bibleData = extractBibleTranslation(bibleDataInput, preferredTranslation);
  if (!bibleData || !bibleData.books) {
    return null;
  }

  const canonicalBook = normalizeCanonicalBookName(rawBook);
  if (!canonicalBook) return null;

  // Find book in bibleData
  const bookObj = bibleData.books.find(
    (b) =>
      b.name.toLowerCase() === canonicalBook.toLowerCase() ||
      normalizeCanonicalBookName(b.name) === canonicalBook,
  );

  if (!bookObj) return null;

  // Find chapter
  const chapterObj = bookObj.chapters.find((c) => c.chapter === chapter);
  if (!chapterObj) return null;

  const start = Math.max(1, verseStart);
  const end = verseEnd && verseEnd >= start ? verseEnd : start;

  const matchingVerses = chapterObj.verses.filter(
    (v) => v.verse >= start && v.verse <= end,
  );

  if (matchingVerses.length === 0) return null;

  const isRange = end > start;
  const reference = `${canonicalBook} ${chapter}:${start}${isRange ? `-${end}` : ""}`;
  
  const text = isRange
    ? matchingVerses.map((v) => `[${v.verse}] ${v.text}`).join(" ")
    : matchingVerses[0].text;

  return {
    bookName: canonicalBook,
    chapter,
    verseStart: start,
    verseEnd: isRange ? end : undefined,
    reference,
    text,
    verses: matchingVerses,
  };
}

/**
 * Calculates the next verse location, handling chapter roll-overs
 */
export function getNextVerseLocation(
  bibleDataInput: any,
  bookName: string,
  chapter: number,
  verse: number,
  preferredTranslation?: string,
): { book: string; chapter: number; verse: number; isChapterChange: boolean } | null {
  if (!bookName || !chapter) return null;
  const currentVerse = verse || 1;

  // 1. Try next verse in same chapter via local Bible data
  const nextInSameChapter = matchLocalScripture(
    bibleDataInput,
    bookName,
    chapter,
    currentVerse + 1,
    undefined,
    preferredTranslation,
  );
  if (nextInSameChapter) {
    return { book: bookName, chapter, verse: currentVerse + 1, isChapterChange: false };
  }

  // 2. Try verse 1 in next chapter
  const nextChapterVerse1 = matchLocalScripture(
    bibleDataInput,
    bookName,
    chapter + 1,
    1,
    undefined,
    preferredTranslation,
  );
  if (nextChapterVerse1) {
    return { book: bookName, chapter: chapter + 1, verse: 1, isChapterChange: true };
  }

  // 3. Fallback: advance verse in current chapter
  return { book: bookName, chapter, verse: currentVerse + 1, isChapterChange: false };
}

/**
 * Calculates the previous verse location, handling chapter roll-backs
 */
export function getPrevVerseLocation(
  bibleDataInput: any,
  bookName: string,
  chapter: number,
  verse: number,
  preferredTranslation?: string,
): { book: string; chapter: number; verse: number; isChapterChange: boolean } | null {
  if (!bookName || !chapter) return null;
  const currentVerse = verse || 1;

  if (currentVerse > 1) {
    const prevInSameChapter = matchLocalScripture(
      bibleDataInput,
      bookName,
      chapter,
      currentVerse - 1,
      undefined,
      preferredTranslation,
    );
    if (prevInSameChapter) {
      return { book: bookName, chapter, verse: currentVerse - 1, isChapterChange: false };
    }
    return { book: bookName, chapter, verse: currentVerse - 1, isChapterChange: false };
  }

  // If verse == 1 and chapter > 1, find last verse of previous chapter
  if (chapter > 1) {
    for (let v = 176; v >= 1; v--) {
      const match = matchLocalScripture(
        bibleDataInput,
        bookName,
        chapter - 1,
        v,
        undefined,
        preferredTranslation,
      );
      if (match) {
        return { book: bookName, chapter: chapter - 1, verse: v, isChapterChange: true };
      }
    }
    return { book: bookName, chapter: chapter - 1, verse: 1, isChapterChange: true };
  }

  return { book: bookName, chapter, verse: 1, isChapterChange: false };
}

/**
 * High-speed local concordance finder:
 * Matches spoken phrases (e.g. "The Lord is my shepherd") directly across local Bible verses
 */
export function findScriptureBySpokenPhrase(
  bibleDataInput: any,
  transcript: string,
  preferredTranslation?: string,
): ResolvedScripture | null {
  if (!transcript || transcript.trim().length < 8 || !bibleDataInput) return null;

  const translationData = extractBibleTranslation(bibleDataInput, preferredTranslation);
  if (!translationData || !Array.isArray(translationData.books)) return null;

  const clean = transcript
    .toLowerCase()
    .replace(/[{}\[\]()"'`.,;:!?—–\-\/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length < 8) return null;

  const spokenWords = clean.split(" ").filter((w: string) => w.length > 2);
  if (spokenWords.length < 3) return null;

  for (const book of translationData.books) {
    if (!book || !Array.isArray(book.chapters)) continue;
    for (const chapter of book.chapters) {
      if (!chapter || !Array.isArray(chapter.verses)) continue;
      for (let i = 0; i < chapter.verses.length; i++) {
        const v = chapter.verses[i];
        const verseNum = typeof v === "object" ? v?.verse ?? (i + 1) : i + 1;
        const verseText = typeof v === "string" ? v : v?.text || "";
        if (!verseText) continue;

        const normVerse = verseText
          .toLowerCase()
          .replace(/[{}\[\]()"'`.,;:!?—–\-\/\\]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // 1. Direct contiguous substring match
        if (normVerse.includes(clean)) {
          return {
            bookName: book.name,
            chapter: chapter.chapter,
            verseStart: verseNum,
            reference: `${book.name} ${chapter.chapter}:${verseNum}`,
            text: verseText,
            verses: [{ verse: verseNum, text: verseText }],
          };
        }

        // 2. Sequential multi-word match (e.g. "Lord is my shepherd" in Psalm 23:1)
        if (spokenWords.length >= 3) {
          let matched = 0;
          let lastIndex = -1;
          for (const word of spokenWords) {
            const idx = normVerse.indexOf(word, lastIndex + 1);
            if (idx !== -1) {
              matched++;
              lastIndex = idx;
            }
          }

          if (matched >= spokenWords.length && spokenWords.length >= 4) {
            return {
              bookName: book.name,
              chapter: chapter.chapter,
              verseStart: verseNum,
              reference: `${book.name} ${chapter.chapter}:${verseNum}`,
              text: verseText,
              verses: [{ verse: verseNum, text: verseText }],
            };
          }
        }
      }
    }
  }

  return null;
}

// Number word converter
const SPOKEN_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, "twenty one": 21, "twenty two": 22, "twenty three": 23,
  "twenty four": 24, "twenty five": 25, "twenty six": 26, "twenty seven": 27, "twenty eight": 28,
  "twenty nine": 29, thirty: 30, "thirty one": 31, "thirty two": 32, "thirty three": 33,
  "thirty four": 34, "thirty five": 35, "thirty six": 36, "thirty seven": 37, "thirty eight": 38,
  "thirty nine": 39, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  "one hundred": 100,
};

function parseNum(val: string): number | null {
  if (!val) return null;
  const direct = parseInt(val, 10);
  if (!isNaN(direct) && direct > 0) return direct;
  const clean = val.trim().toLowerCase();
  return SPOKEN_NUMBERS[clean] ?? null;
}

/**
 * Fast Spoken Scripture Reference Parser:
 * Parses references like:
 * - "Revelation chapter 10, verse 1"
 * - "Revelation 10:1"
 * - "Matthew chapter 3 verse 16"
 * - "John 3:16"
 * - "Psalm 23"
 */
export function parseSpokenBibleReference(
  transcript: string,
  bibleDataInput: any,
  preferredTranslation?: string,
): ResolvedScripture | null {
  if (!transcript || !bibleDataInput) return null;

  const clean = transcript
    .toLowerCase()
    .replace(/[{}\[\]()"'`.,;:!?—–\-\/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Check all canonical books to see if any book name is mentioned in the transcript
  let matchedBook: string | null = null;
  let bookIndex = -1;
  let aliasLen = 0;

  for (const [canonical, aliases] of Object.entries(CANONICAL_BOOKS)) {
    const list = [canonical.toLowerCase(), ...aliases];
    for (const alias of list) {
      const regex = new RegExp(`(?:^|\\b)${alias}(?:\\b|$)`, "i");
      const match = clean.match(regex);
      if (match && match.index !== undefined) {
        if (alias.length > aliasLen) {
          matchedBook = canonical;
          bookIndex = match.index;
          aliasLen = alias.length;
        }
      }
    }
  }

  if (!matchedBook || bookIndex === -1) return null;

  // Remainder of the transcript following the book name
  const afterBook = clean.slice(bookIndex + aliasLen).trim();
  if (!afterBook) return null;

  // Patterns after book name:
  // Pattern A: "chapter 10 verse 1" or "chapter 10" or "chapter ten verse one" or "chapter three"
  const patA = afterBook.match(/^chapter\s+(\d+|[a-z]+(?:\s+[a-z]+)?)(?:\s+(?:and\s+)?verse\s+(\d+|[a-z]+(?:\s+[a-z]+)?))?/i);
  if (patA) {
    const ch = parseNum(patA[1]);
    const vs = patA[2] ? parseNum(patA[2]) : 1;
    if (ch) {
      return matchLocalScripture(bibleDataInput, matchedBook, ch, vs || 1, undefined, preferredTranslation);
    }
  }

  // Pattern B: "10 verse 1", "10:1", "10 1", "10", "twenty three", "three verse sixteen"
  const patB = afterBook.match(/^(\d+|[a-z]+(?:\s+[a-z]+)?)(?:\s*(?::|\s+verse\s+|\s+)\s*(\d+|[a-z]+(?:\s+[a-z]+)?))?/i);
  if (patB) {
    const ch = parseNum(patB[1]);
    const vs = patB[2] ? parseNum(patB[2]) : 1;
    if (ch && ch > 0) {
      return matchLocalScripture(bibleDataInput, matchedBook, ch, vs || 1, undefined, preferredTranslation);
    }
  }

  // Pattern C: If only the book name was spoken and matchedBook is valid (e.g., "Psalm 23" already caught, but e.g. "Genesis"), default to chapter 1, verse 1
  return matchLocalScripture(bibleDataInput, matchedBook, 1, 1, undefined, preferredTranslation);
}


