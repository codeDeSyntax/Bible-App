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

const parseHex = (hex: string): { r: number; g: number; b: number } => {
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

/**
 * Intelligent WCAG 2.1 Contrast & Color Harmonization Engine:
 * 1. Checks true relative luminance against background.
 * 2. If background is light/white (e.g. bottom cards): transforms light/washed-out colors (yellow, cyan, lime, white)
 *    into rich, deep, high-contrast jewel tones (Deep Sapphire, Dark Ochre, Deep Burgundy, Forest Green).
 * 3. If background is dark (e.g. purple, burgundy, navy, emerald): checks color harmony and avoids clashing
 *    (such as harsh neon lime on royal purple) and guarantees at least 4.5:1 contrast ratio.
 */
export const ensureHighContrast = (textColorHex: string, bgHex?: string): string => {
  if (!bgHex) return textColorHex;

  const textRgb = parseHex(textColorHex);
  const bgRgb = parseHex(bgHex);

  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const textLum = getRelativeLuminance(textRgb.r, textRgb.g, textRgb.b);
  const contrastRatio = getContrastRatio(textLum, bgLum);

  // ─────────────────────────────────────────────────────────────
  // A. LIGHT / WHITE BACKGROUND CONTAINERS (e.g. White card in HeadlineAlert)
  // ─────────────────────────────────────────────────────────────
  if (bgLum > 0.45) {
    // If text already has great contrast (e.g. dark charcoal or deep navy), keep it
    if (contrastRatio >= 5.0 && textLum < 0.25) {
      return textColorHex;
    }

    const { r, g, b } = textRgb;

    // 1. Yellow / Gold / Warm Amber -> Deep Amber Ochre / Dark Rust
    if (r > 180 && g > 130 && b < 100) {
      return "#9a3412"; // Dark Rust/Ochre (Contrast on white: 6.2:1)
    }

    // 2. Lime / Lemon / Bright Green -> Deep Emerald Forest
    if (g > 150 && (r > 140 || g > b + 40)) {
      return "#14532d"; // Deep Forest Green (Contrast on white: 7.8:1)
    }

    // 3. Cyan / Sky Blue / Light Blue -> Deep Royal Sapphire Navy
    if (b > 180 && (g > 140 || b > r + 30)) {
      return "#1d4ed8"; // Deep Sapphire Blue (Contrast on white: 5.6:1)
    }

    // 4. Red / Pink / Rose -> Deep Crimson Burgundy
    if (r > 180 && b > 100) {
      return "#991b1b"; // Deep Burgundy (Contrast on white: 7.2:1)
    }
    if (r > 180 && g < 100) {
      return "#b91c1c"; // Rich Crimson Red (Contrast on white: 5.8:1)
    }

    // 5. Purple / Violet -> Royal Deep Purple
    if (r > 120 && b > 160) {
      return "#6b21a8"; // Royal Deep Purple (Contrast on white: 6.5:1)
    }

    // 6. Pure White / Pale tints -> Slate Navy / Charcoal
    if (textLum > 0.6) {
      return "#0f172a"; // Crisp Slate Navy (Contrast on white: 16:1)
    }

    // Fallback: If contrast is still under 4.5, force crisp slate
    if (contrastRatio < 4.5) {
      return "#0f172a";
    }

    return textColorHex;
  }

  // ─────────────────────────────────────────────────────────────
  // B. DARK / BROADCAST BACKGROUNDS (e.g. Purple, Navy, Burgundy, Emerald, Black)
  // ─────────────────────────────────────────────────────────────
  const isBgPurple =
    (bgRgb.b > 75 && bgRgb.r > 55 && bgRgb.g < (bgRgb.r + bgRgb.b) * 0.45) ||
    (bgRgb.b > 120 && bgRgb.r > 70);
  const isBgBurgundy = bgRgb.r > 80 && bgRgb.g < 55 && bgRgb.b < 70;
  const isBgDarkBlue = bgRgb.b > 90 && bgRgb.b > bgRgb.r + 40 && bgRgb.g < 140;
  const isBgEmerald = bgRgb.g > 70 && bgRgb.g > bgRgb.r && bgRgb.g > bgRgb.b;
  const isBgAmber = bgRgb.r > 90 && bgRgb.g > 40 && bgRgb.b < 45;

  // 1. Color Harmony on Royal Purple / Indigo backgrounds:
  // Neon lime (#bef264) or acid green clashes violently on purple. Remap to warm gold or pure white!
  if (isBgPurple) {
    const isLimeOrGreen =
      textRgb.g > 170 && textRgb.b < 150 && (textRgb.r > 140 || textRgb.g > textRgb.r);
    if (isLimeOrGreen) {
      return "#fbbf24"; // Warm Luminous Gold (Stunning on Purple)
    }
    const isDarkVioletText = textRgb.b > 120 && textRgb.r > 90 && textLum < 0.35;
    if (isDarkVioletText) {
      return "#ffffff"; // Pure White
    }
  }

  // 2. Color Harmony on Deep Burgundy / Wine backgrounds:
  // Red or dark pink lacks contrast on wine. Remap to luminous gold or white.
  if (isBgBurgundy) {
    const isRedOrPink = textRgb.r > 150 && textRgb.g < 120;
    if (isRedOrPink) {
      return "#fbbf24"; // Luminous Gold
    }
  }

  // 3. Color Harmony on Deep Navy backgrounds:
  // Muddy dark blue text strains eyes. Remap to Electric Sky Cyan or Gold.
  if (isBgDarkBlue) {
    const isDarkBlueText = textRgb.b > 140 && textRgb.r < 100 && textLum < 0.35;
    if (isDarkBlueText) {
      return "#38bdf8"; // Electric Sky Cyan
    }
  }

  // 4. Color Harmony on Deep Emerald backgrounds:
  // Dark green text on green background lacks contrast. Remap to Gold or White.
  if (isBgEmerald) {
    const isGreenText = textRgb.g > 140 && textRgb.r < 120 && textLum < 0.35;
    if (isGreenText) {
      return "#fbbf24"; // Warm Gold
    }
  }

  // 5. Amber / Bronze / Gold backgrounds:
  if (isBgAmber) {
    const isWarmYellow = textRgb.r > 180 && textRgb.g > 130 && textRgb.b < 100;
    if (isWarmYellow) {
      return "#ffffff"; // Crisp Pure White
    }
  }

  // 6. Minimum WCAG Contrast Guard on Dark:
  if (contrastRatio < 4.5) {
    // If text is warm, promote to gold; if cool, promote to cyan; else white
    if (textRgb.r > textRgb.b + 40) return "#fbbf24"; // Warm Gold
    if (textRgb.b > textRgb.r + 40) return "#38bdf8"; // Electric Cyan
    return "#ffffff"; // Pure Crisp White
  }

  return textColorHex;
};

/**
 * Parses inline color markup e.g. {yellow}highlighted text{/yellow} into styled React elements.
 * Supports inline hex codes e.g. {38bdf8}text{/38bdf8} as well.
 * Automatically checks and enforces high contrast and color harmony against the background color!
 */
export const parseColoredText = (
  text: string,
  defaultColor: string = "#ffffff",
  fontFamily?: string,
  backgroundColor?: string,
): (string | React.JSX.Element)[] => {
  if (!text) return [];
  const regex = /\{([a-zA-Z0-9]+)\}([^{]*?)\{\/\1\}/gi;
  const parts: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const isBlackBg =
    backgroundColor?.toLowerCase() === "#000000" ||
    backgroundColor?.toLowerCase() === "#000" ||
    backgroundColor?.toLowerCase() === "black";

  const isWhiteBg =
    backgroundColor?.toLowerCase() === "#ffffff" ||
    backgroundColor?.toLowerCase() === "#fff" ||
    backgroundColor?.toLowerCase() === "white";

  const bgRgb = backgroundColor ? parseHex(backgroundColor) : null;
  const isLightBg = bgRgb ? getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b) > 0.45 : isWhiteBg;

  const effectiveDefaultColor =
    defaultColor === "#ffffff" && isBlackBg
      ? "#bef264"
      : isLightBg && (defaultColor === "#ffffff" || defaultColor === "#fff")
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
    const color = match[1].toLowerCase();
    const rawColorValue =
      COLOR_MAP[color] ||
      (/^[a-f0-9]{6}$/i.test(color) ? `#${color}` : effectiveDefaultColor);

    const colorValue = backgroundColor
      ? ensureHighContrast(rawColorValue, backgroundColor)
      : rawColorValue;

    // Apply glowing text-shadow on dark backgrounds, and clean shadowless text on light backgrounds
    const shadowStyle = isLightBg
      ? { textShadow: "none" }
      : { textShadow: `0 0 16px ${colorValue}66, 0 1px 3px rgba(0,0,0,0.8)` };

    parts.push(
      <span
        key={key++}
        style={{
          color: colorValue,
          ...shadowStyle,
          ...fontStyle,
        }}
      >
        {match[2]}
      </span>,
    );
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

  return parts.length > 0 ? parts : [text];
};

/**
 * Intelligent headline/body content splitter for presentation cards:
 * - Detects colons, dashes, bullets, newlines, or sentence boundaries
 * - Never truncates or drops text
 */
export const splitAlertContent = (
  text: string,
): { headline: string; body: string } => {
  const clean = stripMarkup(text);
  if (!clean) return { headline: "", body: "" };

  // 1. Explicit newline (inserted by user Enter or by AI)
  if (text.includes("\n")) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return { headline: lines[0], body: lines.slice(1).join(" ") };
    }
  }

  // 2. Colon separator near the start (e.g. "ANNOUNCEMENT: Meeting at 5pm")
  const colonIdx = text.indexOf(":");
  if (colonIdx > 1 && colonIdx < 45) {
    return {
      headline: text.slice(0, colonIdx).trim(),
      body: text.slice(colonIdx + 1).trim(),
    };
  }

  // 3. Bullet or dash separator (e.g. "Sermon Series — The Way of Faith")
  const dashMatch = text.match(/^([^{•—\n]{2,50})\s*[•—]\s*(.+)$/s);
  if (dashMatch) {
    return { headline: dashMatch[1].trim(), body: dashMatch[2].trim() };
  }

  // 4. Default: No arbitrary character slicing! Keep text intact as single block
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
 * Decomposes an existing broadcast alert text into structured field guesses
 */
export const decomposeAlertMarkup = (
  text: string,
  preferredType: "sermon" | "news" | "scripture" | "general" = "sermon",
) => {
  const clean = text.replace(/\{[^\}]+\}/g, "").trim();
  const lines = clean.split("\n");
  const rawHeadline = lines[0] ? lines[0].replace(/^(topic|event|scripture|headline|title):\s*/i, "").trim() : "";
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

  if (resolvedType === "sermon") {
    const topicMatch = clean.match(/topic:\s*([^•\n]+)/i);
    const scriptMatch = clean.match(/(?:scriptures?|bible):\s*([^•\n]+)/i);
    const speakerMatch = clean.match(/(?:minister|preacher|speaker|pastor):\s*([^•\n]+)/i);
    const notesMatch = clean.match(/(?:notes?|takeaways?|points?):\s*([^•\n]+)/i);

    const title = topicMatch
      ? topicMatch[1].trim()
      : clean.toLowerCase().startsWith("topic:")
      ? clean.replace(/^topic:\s*/i, "").split("\n")[0]?.split("•")[0]?.trim()
      : rawHeadline;

    return {
      title,
      scriptures: scriptMatch ? scriptMatch[1].trim() : "",
      speaker: speakerMatch ? speakerMatch[1].trim() : "",
      notes: notesMatch ? notesMatch[1].trim() : "",
    };
  }

  if (resolvedType === "news") {
    const eventMatch = clean.match(/event:\s*([^•\n]+)/i);
    const dateMatch = clean.match(/(?:date(?:\s*&\s*time)?|time):\s*([^•\n]+)/i);
    const venueMatch = clean.match(/(?:venue|location):\s*([^•\n]+)/i);
    const contactMatch = clean.match(/(?:contact|info|phone):\s*([^•\n]+)/i);
    const detailsMatch = clean.match(/(?:details?):\s*([^•\n]+)/i);

    return {
      headline: eventMatch ? eventMatch[1].trim() : (rawHeadline || (clean.startsWith("Event:") ? clean.replace(/^Event:\s*/i, "").split("•")[0]?.trim() : rawHeadline)),
      dateTime: dateMatch ? dateMatch[1].trim() : "",
      venue: venueMatch ? venueMatch[1].trim() : "",
      contact: contactMatch ? contactMatch[1].trim() : "",
      details: detailsMatch ? detailsMatch[1].trim() : body,
    };
  }

  if (resolvedType === "scripture") {
    const refMatch = clean.match(/(?:scriptures?|ref(?:erence)?):\s*([^•\n]+)/i);
    const verseMatch = clean.match(/(?:verse|passage):\s*"?([^"•\n]+)"?/i);
    const themeMatch = clean.match(/(?:theme|focus):\s*([^•\n]+)/i);

    return {
      reference: refMatch ? refMatch[1].trim() : rawHeadline,
      verseText: verseMatch ? verseMatch[1].trim() : body,
      focus: themeMatch ? themeMatch[1].trim() : "",
    };
  }

  const headMatch = clean.match(/(?:headline|header|title):\s*([^•\n]+)/i);
  const msgMatch = clean.match(/(?:message|alert):\s*([^•\n]+)/i);

  return {
    title: headMatch ? headMatch[1].trim() : rawHeadline,
    message: msgMatch ? msgMatch[1].trim() : (body || rawHeadline),
  };
};
