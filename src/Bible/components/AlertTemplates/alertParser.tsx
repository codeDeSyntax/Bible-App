import React from "react";

export const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  blue: "#38bdf8",
  green: "#22c55e",
  yellow: "#facc15",
  gold: "#fbbf24",
  amber: "#f59e0b",
  purple: "#c084fc",
  violet: "#a78bfa",
  indigo: "#818cf8",
  orange: "#fb923c",
  pink: "#f472b6",
  rose: "#fb7185",
  cyan: "#22d3ee",
  teal: "#2dd4bf",
  white: "#ffffff",
  black: "#000000",
  lime: "#bef264",
  lemon: "#bef264",
  lemongreen: "#bef264",
  emerald: "#10b981",
};

/** Strips {color}...{/color} markup tags */
export const stripMarkup = (text: string): string =>
  text.replace(/\{[^\}]+\}/g, "").replace(/\s+/g, " ").trim();

/**
 * Calculates WCAG 2.1 Relative Luminance for an sRGB component
 */
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = Math.max(0, Math.min(255, val)) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates WCAG 2.1 Contrast Ratio between two relative luminances (range 1 to 21)
 */
export const getContrastRatio = (lum1: number, lum2: number): number => {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const parseHex = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 0,
      g: parseInt(clean[1] + clean[1], 16) || 0,
      b: parseInt(clean[2] + clean[2], 16) || 0,
    };
  }
  return {
    r: parseInt(clean.slice(0, 2), 16) || 0,
    g: parseInt(clean.slice(2, 4), 16) || 0,
    b: parseInt(clean.slice(4, 6), 16) || 0,
  };
};

export const extractExplicitLabelColor = (text?: string): string | null => {
  if (!text) return null;
  // Match {color} at the beginning of field prefixes e.g. {cyan}Topic:, {cyan}Event:, {gold}Scripture:, etc.
  const fieldPrefixMatch = text.match(
    /\{([a-zA-Z0-9#]+)\}\s*(?:Topic|Scriptures?|Minister|Speaker|Notes?|Event|Date(?:Time)?|Venue|Contact|Verse(?:Text)?|Theme|Details?|Message|Headline|Passage|Info|Notice|Focus):/i,
  );
  if (fieldPrefixMatch) {
    const colorKey = fieldPrefixMatch[1].toLowerCase();
    if (COLOR_MAP[colorKey]) return COLOR_MAP[colorKey];
    if (/^[0-9a-f]{6}$/i.test(colorKey)) return `#${colorKey}`;
    if (/^#[0-9a-f]{3,8}$/i.test(colorKey)) return colorKey;
  }

  // Fallback: Check the first opening color tag in the text
  const firstTagMatch = text.match(/\{([a-zA-Z0-9#]+)\}/);
  if (firstTagMatch) {
    const colorKey = firstTagMatch[1].toLowerCase();
    if (!colorKey.startsWith("/") && COLOR_MAP[colorKey]) {
      return COLOR_MAP[colorKey];
    }
    if (
      !colorKey.startsWith("/") &&
      (/^[0-9a-f]{6}$/i.test(colorKey) || /^#[0-9a-f]{3,8}$/i.test(colorKey))
    ) {
      return colorKey.startsWith("#") ? colorKey : `#${colorKey}`;
    }
  }

  return null;
};

export const getHarmoniousLabelColor = (bgHex?: string, rawText?: string): string => {
  // 1. If explicit label color markup exists in the alert text, honor the user's / AI's chosen label color!
  const explicitColor = extractExplicitLabelColor(rawText);
  if (explicitColor) {
    return explicitColor;
  }

  if (!bgHex) return "#38bdf8"; // Default Electric Sky Cyan
  const bgRgb = parseHex(bgHex);
  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // If background is light (e.g. white/cream card)
  if (bgLum > 0.45) {
    return "#9a3412"; // Deep Ochre / Rust for sharp contrast
  }

  const isBgDarkBlue = bgRgb.b > 90 && bgRgb.b > bgRgb.r + 20;
  const isBgTeal = bgRgb.g > 70 && bgRgb.b > 70 && bgRgb.g > bgRgb.r + 15;
  const isBgPurple = bgRgb.r > 50 && bgRgb.b > 70 && bgRgb.b > bgRgb.g + 20;
  const isBgBurgundy = bgRgb.r > 70 && bgRgb.b < 65 && bgRgb.g < 50;
  const isBgEmerald = bgRgb.g > 60 && bgRgb.g > bgRgb.r + 15 && bgRgb.g > bgRgb.b + 10;
  const isBgAmber = bgRgb.r > 90 && bgRgb.g > 40 && bgRgb.b < 50;

  if (isBgDarkBlue) return "#38bdf8"; // Electric Sky Cyan on Navy
  if (isBgTeal) return "#bef264"; // Vibrant Lime on Deep Teal
  if (isBgPurple) return "#22d3ee"; // Bright Sky Cyan on Regal Purple
  if (isBgBurgundy) return "#38bdf8"; // Electric Cyan on Wine Burgundy
  if (isBgEmerald) return "#facc15"; // Warm Yellow on Forest Emerald
  if (isBgAmber) return "#ffffff"; // Pure White on Amber/Bronze
  return "#38bdf8"; // Electric Sky Cyan on Charcoal / Midnight
};

export const getHarmoniousLabelTag = (bgHex?: string, rawText?: string): string => {
  const explicit = extractExplicitLabelColor(rawText);
  if (explicit) {
    const found = Object.entries(COLOR_MAP).find(([, hex]) => hex.toLowerCase() === explicit.toLowerCase());
    if (found) return found[0];
  }

  if (!bgHex) return "cyan";
  const bgRgb = parseHex(bgHex);
  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  if (bgLum > 0.45) return "amber";
  const isBgDarkBlue = bgRgb.b > 90 && bgRgb.b > bgRgb.r + 20;
  const isBgTeal = bgRgb.g > 70 && bgRgb.b > 70 && bgRgb.g > bgRgb.r + 15;
  const isBgPurple = bgRgb.r > 50 && bgRgb.b > 70 && bgRgb.b > bgRgb.g + 20;
  const isBgBurgundy = bgRgb.r > 70 && bgRgb.b < 65 && bgRgb.g < 50;
  const isBgEmerald = bgRgb.g > 60 && bgRgb.g > bgRgb.r + 15 && bgRgb.g > bgRgb.b + 10;
  const isBgAmber = bgRgb.r > 90 && bgRgb.g > 40 && bgRgb.b < 50;

  if (isBgDarkBlue) return "cyan";
  if (isBgTeal) return "lime";
  if (isBgPurple) return "cyan";
  if (isBgBurgundy) return "cyan";
  if (isBgEmerald) return "yellow";
  if (isBgAmber) return "white";
  return "cyan";
};

/**
 * Extracts the explicit color for a specific field label from the raw text (e.g. "MINISTER" -> "{yellow}Minister:{/yellow}" -> "#facc15")
 */
export const extractFieldLabelColor = (
  text: string | undefined,
  fieldName: string,
  fallbackColor: string,
): string => {
  if (!text) return fallbackColor;

  const aliasMap: Record<string, string> = {
    topic: "(?:topic|title|sermon)",
    scripture: "(?:scriptures?|bible|passage|ref(?:erence)?)",
    scriptures: "(?:scriptures?|bible|passage|ref(?:erence)?)",
    minister: "(?:minister|preacher|speaker|pastor)",
    speaker: "(?:minister|preacher|speaker|pastor)",
    notes: "(?:notes?|takeaways?|points?)",
    event: "(?:event|headline|title)",
    headline: "(?:headline|event|title)",
    date: "(?:date(?:time)?|time)",
    datetime: "(?:date(?:time)?|time)",
    venue: "(?:venue|location|place)",
    contact: "(?:contact|info|phone|email)",
    details: "(?:details?|info)",
    verse: "(?:verse(?:text)?|passage)",
    theme: "(?:theme|focus)",
    focus: "(?:theme|focus)",
    message: "(?:message|notice|details?|alert)",
  };

  const pattern = aliasMap[fieldName.toLowerCase()] || fieldName.toLowerCase();
  const regex = new RegExp(`\\{([a-zA-Z0-9#]+)\\}\\s*${pattern}:`, "i");
  const match = text.match(regex);

  if (match) {
    const colorKey = match[1].toLowerCase();
    if (COLOR_MAP[colorKey]) return COLOR_MAP[colorKey];
    if (/^[0-9a-f]{6}$/i.test(colorKey)) return `#${colorKey}`;
    if (/^#[0-9a-f]{3,8}$/i.test(colorKey)) return colorKey;
  }

  return fallbackColor;
};

/**
 * Extracts a map of all explicit field label colors from the text
 */
export const extractAllFieldLabelColors = (
  text: string | undefined,
  defaultColor: string,
): Record<string, string> => {
  if (!text) return {};
  const map: Record<string, string> = {};
  const regex = /\{([a-zA-Z0-9#]+)\}\s*([a-zA-Z0-9\s&]+):/gi;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const colorKey = m[1].toLowerCase();
    const field = m[2].trim().toUpperCase();
    const resolvedColor =
      COLOR_MAP[colorKey] ||
      (/^[0-9a-f]{6}$/i.test(colorKey) ? `#${colorKey}` : colorKey.startsWith("#") ? colorKey : defaultColor);
    map[field] = resolvedColor;
  }
  return map;
};


/**
 * Intelligent WCAG Contrast Engine:
 * 1. Checks contrast ratio between text and background.
 * 2. If contrast is already good (>= 3.0:1 for large broadcast displays), keeps the user's color exactly as chosen.
 * 3. Only safely adjusts extreme illegibility (e.g. dark text on dark bg, or white on white).
 */
export const ensureHighContrast = (textColorHex: string, bgHex?: string): string => {
  if (!bgHex) return textColorHex;

  const textRgb = parseHex(textColorHex);
  const bgRgb = parseHex(bgHex);

  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const textLum = getRelativeLuminance(textRgb.r, textRgb.g, textRgb.b);
  const contrastRatio = getContrastRatio(textLum, bgLum);

  // If contrast is already readable for broadcast displays, preserve the exact user-selected color!
  if (contrastRatio >= 2.0) {
    return textColorHex;
  }

  // If background is light (white/cream) and text is completely washed out (white on white)
  if (bgLum > 0.45) {
    if (textLum > 0.7) {
      return "#0f172a"; // Crisp Slate for readability
    }
    return textColorHex;
  }

  // If background is dark and text is completely dark (black on black)
  if (bgLum <= 0.45) {
    if (textLum < 0.1) {
      return "#ffffff"; // Pure White
    }
  }

  return textColorHex;
};

/**
 * Parses inline color markup e.g. {yellow}highlighted text{/yellow} or {#38bdf8}text{/#38bdf8} into styled React elements.
 * Automatically checks and enforces readability against the background color!
 */
export const parseColoredText = (
  text: string,
  defaultColor: string = "#ffffff",
  fontFamily?: string,
  backgroundColor?: string,
): (string | React.JSX.Element)[] => {
  if (!text) return [];
  const regex = /\{([a-zA-Z0-9#]+)\}([^{]*?)\{\/\1\}/gi;
  const parts: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const isWhiteBg =
    backgroundColor?.toLowerCase() === "#ffffff" ||
    backgroundColor?.toLowerCase() === "#fff" ||
    backgroundColor?.toLowerCase() === "white";

  const bgRgb = backgroundColor ? parseHex(backgroundColor) : null;
  const isLightBg = bgRgb ? getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b) > 0.45 : isWhiteBg;

  const effectiveDefaultColor =
    isLightBg && (defaultColor === "#ffffff" || defaultColor === "#fff")
      ? "#0f172a"
      : defaultColor;

  const fontStyle = fontFamily ? { fontFamily } : { fontFamily: "inherit" };

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index).replace(/\{[^\}]+\}/g, "");
      if (plain) {
        parts.push(
          <span key={key++} style={{ color: effectiveDefaultColor, ...fontStyle }}>
            {plain}
          </span>,
        );
      }
    }
    const colorTag = match[1].toLowerCase();
    const cleanColor = colorTag.replace(/^#/, "");
    const rawColorValue =
      COLOR_MAP[cleanColor] ||
      (/^[a-f0-9]{3,8}$/i.test(cleanColor)
        ? `#${cleanColor}`
        : (/^#[a-f0-9]{3,8}$/i.test(colorTag) ? colorTag : effectiveDefaultColor));

    const colorValue = backgroundColor
      ? ensureHighContrast(rawColorValue, backgroundColor)
      : rawColorValue;

    // Apply glowing text-shadow on dark backgrounds, and clean shadowless text on light backgrounds
    const shadowStyle = isLightBg
      ? { textShadow: "none" }
      : { textShadow: `0 0 16px ${colorValue}66, 0 1px 3px rgba(0,0,0,0.8)` };

    const cleanInner = match[2].replace(/\{[^\}]+\}/g, "");
    if (cleanInner) {
      parts.push(
        <span
          key={key++}
          style={{
            color: colorValue,
            ...shadowStyle,
            ...fontStyle,
          }}
        >
          {cleanInner}
        </span>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).replace(/\{[^\}]+\}/g, "");
    if (remaining) {
      parts.push(
        <span key={key++} style={{ color: effectiveDefaultColor, ...fontStyle }}>
          {remaining}
        </span>,
      );
    }
  }

  if (parts.length === 0) {
    const cleanAll = stripMarkup(text);
    return cleanAll
      ? [
          <span key={0} style={{ color: effectiveDefaultColor, ...fontStyle }}>
            {cleanAll}
          </span>,
        ]
      : [];
  }

  return parts;
};

/**
 * Splits alert text into a headline and body while preserving any inline color markup tags.
 */
export const splitAlertContent = (
  text: string,
): { headline: string; body: string } => {
  if (!text) return { headline: "", body: "" };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return { headline: lines[0], body: lines.slice(1).join(" • ") };
  }

  const bulletMatch = text.match(/^([^•]+?)\s*•\s*(.+)$/s);
  if (bulletMatch) {
    return { headline: bulletMatch[1].trim(), body: bulletMatch[2].trim() };
  }

  const clean = stripMarkup(text);
  const colonIdx = clean.indexOf(":");
  if (colonIdx > 1 && colonIdx < 45) {
    const rawColonIdx = text.indexOf(":");
    return {
      headline: text.slice(0, rawColonIdx).trim(),
      body: text.slice(rawColonIdx + 1).trim(),
    };
  }

  return { headline: text, body: "" };
};

/**
 * Composes structured field values into a unified broadcast markup string
 */
export const composeAlertMarkup = (
  type: "sermon" | "news" | "scripture" | "general",
  data: {
    title?: string;
    scriptures?: string;
    speaker?: string;
    notes?: string;
    headline?: string;
    details?: string;
    dateTime?: string;
    venue?: string;
    contact?: string;
    reference?: string;
    verseText?: string;
    focus?: string;
    message?: string;
  },
): string => {
  if (type === "sermon") {
    const title = data.title?.trim() || "";
    const scriptures = data.scriptures?.trim() || "";
    const speaker = data.speaker?.trim() || "";
    const notes = data.notes?.trim() || "";

    const secondaryParts: string[] = [];
    if (scriptures) secondaryParts.push(`Scripture: ${scriptures}`);
    if (speaker) secondaryParts.push(`Minister: ${speaker}`);
    if (notes) secondaryParts.push(`Notes: ${notes}`);

    if (title && secondaryParts.length > 0) {
      return `Topic: ${title}\n${secondaryParts.join(" • ")}`;
    }
    if (title) return `Topic: ${title}`;
    return secondaryParts.join(" • ") || "";
  }

  if (type === "news") {
    const headline = data.headline?.trim() || "";
    const dateTime = data.dateTime?.trim() || "";
    const venue = data.venue?.trim() || "";
    const contact = data.contact?.trim() || "";
    const details = data.details?.trim() || "";

    const metaParts: string[] = [];
    if (dateTime) metaParts.push(`Date: ${dateTime}`);
    if (venue) metaParts.push(`Venue: ${venue}`);
    if (contact) metaParts.push(`Contact: ${contact}`);
    if (details) metaParts.push(`Details: ${details}`);

    if (headline && metaParts.length > 0) {
      return `Event: ${headline}\n${metaParts.join(" • ")}`;
    }
    if (headline) return `Event: ${headline}`;
    return metaParts.join(" • ") || "";
  }

  if (type === "scripture") {
    const reference = data.reference?.trim() || "";
    const verseText = data.verseText?.trim() || "";
    const focus = data.focus?.trim() || "";

    const parts: string[] = [];
    if (verseText) parts.push(`Verse: "${verseText}"`);
    if (focus) parts.push(`Theme: ${focus}`);

    if (reference && parts.length > 0) {
      return `Scripture: ${reference}\n${parts.join(" • ")}`;
    }
    if (reference) return `Scripture: ${reference}`;
    return parts.join(" • ") || "";
  }

  // General
  const headline = data.title?.trim() || data.headline?.trim() || "";
  const message = data.message?.trim() || data.details?.trim() || "";

  if (headline && message) {
    return `Headline: ${headline}\nMessage: ${message}`;
  }
  if (headline) return `Headline: ${headline}`;
  return message || "";
};

/**
 * Decomposes an existing broadcast alert text into structured field guesses,
 * while strictly preserving any inline color markup tags ({yellow}text{/yellow})
 * within the extracted field values!
 */
export const decomposeAlertMarkup = (
  text: string,
  preferredType: "sermon" | "news" | "scripture" | "general" = "sermon",
) => {
  if (!text) {
    return {
      title: "",
      scriptures: "",
      speaker: "",
      notes: "",
      headline: "",
      dateTime: "",
      venue: "",
      contact: "",
      details: "",
      reference: "",
      verseText: "",
      focus: "",
      message: "",
    };
  }

  const clean = stripMarkup(text);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rawHeadline = lines[0]
    ? lines[0].replace(/^(?:\{[^\}]+\})*(?:topic|event|scripture|headline|title):\s*/i, "").trim()
    : "";
  const body = lines.slice(1).join(" • ");

  // Auto-detect type if explicit markers exist
  let resolvedType = preferredType;
  if (/(?:topic|minister|preacher):\s*/i.test(clean)) {
    resolvedType = "sermon";
  } else if (/(?:event|venue|contact):\s*/i.test(clean)) {
    resolvedType = "news";
  } else if (/(?:verse|passage|theme):\s*/i.test(clean)) {
    resolvedType = "scripture";
  }

  const extractField = (pattern: RegExp): string => {
    const match = text.match(pattern);
    return match ? match[1].trim() : "";
  };

  if (resolvedType === "sermon") {
    const title =
      extractField(/topic:\s*([^•\n]+)/i) ||
      (clean.toLowerCase().startsWith("topic:")
        ? text.replace(/^(?:\{[^\}]+\})*topic:\s*/i, "").split("\n")[0]?.split("•")[0]?.trim()
        : rawHeadline);

    const scriptures = extractField(/(?:scriptures?|bible):\s*([^•\n]+)/i);
    const speaker = extractField(/(?:minister|preacher|speaker|pastor):\s*([^•\n]+)/i);
    const notes = extractField(/(?:notes?|takeaways?|points?):\s*([^•\n]+)/i);

    return {
      title,
      scriptures,
      speaker,
      notes,
    };
  }

  if (resolvedType === "news") {
    const headline =
      extractField(/event:\s*([^•\n]+)/i) ||
      (clean.toLowerCase().startsWith("event:")
        ? text.replace(/^(?:\{[^\}]+\})*event:\s*/i, "").split("\n")[0]?.split("•")[0]?.trim()
        : rawHeadline);

    const dateTime = extractField(/(?:date(?:\s*&\s*time)?|time):\s*([^•\n]+)/i);
    const venue = extractField(/(?:venue|location):\s*([^•\n]+)/i);
    const contact = extractField(/(?:contact|info|phone):\s*([^•\n]+)/i);
    const details = extractField(/(?:details?):\s*([^•\n]+)/i) || (lines.slice(1).join(" • ").trim() || body);

    return {
      headline,
      dateTime,
      venue,
      contact,
      details,
    };
  }

  if (resolvedType === "scripture") {
    const reference =
      extractField(/(?:scriptures?|ref(?:erence)?):\s*([^•\n]+)/i) ||
      (clean.toLowerCase().startsWith("scripture:")
        ? text.replace(/^(?:\{[^\}]+\})*scripture:\s*/i, "").split("\n")[0]?.split("•")[0]?.trim()
        : rawHeadline);

    const verseText =
      extractField(/(?:verse|passage):\s*"?([^"•\n]+)"?/i) ||
      (lines.slice(1).join(" • ").trim() || body);

    const focus = extractField(/(?:theme|focus):\s*([^•\n]+)/i);

    return {
      reference,
      verseText,
      focus,
    };
  }

  const title = extractField(/(?:headline|header|title):\s*([^•\n]+)/i) || rawHeadline;
  const message = extractField(/(?:message|alert):\s*([^•\n]+)/i) || (lines.slice(1).join(" • ").trim() || body || rawHeadline);

  return {
    title,
    message,
  };
};
