import React from "react";

export const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  blue: "#38bdf8",
  green: "#22c55e",
  yellow: "#facc15",
  purple: "#c084fc",
  orange: "#fb923c",
  pink: "#f472b6",
  cyan: "#22d3ee",
  white: "#ffffff",
  black: "#000000",
};

/** Strips {color}...{/color} markup tags */
export const stripMarkup = (text: string): string =>
  text.replace(/\{[^\}]+\}/g, "").replace(/\s+/g, " ").trim();

/**
 * Intelligent contrast guard:
 * Detects if a text highlight color clashes or bleeds into the background color.
 * If so, promotes it to a complementary high-contrast jewel/glow color (Gold, White, or Cyan).
 */
export const ensureHighContrast = (textColorHex: string, bgHex?: string): string => {
  if (!bgHex || !/^#[0-9a-f]{6}$/i.test(bgHex) || !/^#[0-9a-f]{6}$/i.test(textColorHex)) {
    return textColorHex;
  }

  const tr = parseInt(textColorHex.slice(1, 3), 16);
  const tg = parseInt(textColorHex.slice(3, 5), 16);
  const tb = parseInt(textColorHex.slice(5, 7), 16);

  const br = parseInt(bgHex.slice(1, 3), 16);
  const bg = parseInt(bgHex.slice(3, 5), 16);
  const bb = parseInt(bgHex.slice(5, 7), 16);

  // Euclidean color distance in RGB space
  const dist = Math.sqrt(
    Math.pow(tr - br, 2) + Math.pow(tg - bg, 2) + Math.pow(tb - bb, 2),
  );

  // Check hue/family clash even if lightness differs:
  // 1. Purple/Blue text on Purple/Indigo/Blue background
  const isBgPurpleOrBlue = bb > 100 && bb > bg;
  const isTextPurpleOrBlue = tb > 150 && tb > tg;
  if (isBgPurpleOrBlue && isTextPurpleOrBlue && dist < 160) {
    return "#facc15"; // Promote to Gold
  }

  // 2. Green text on Emerald/Jade background
  const isBgGreen = bg > 50 && bg > br && bg > bb;
  const isTextGreen = tg > 150 && tg > tr;
  if (isBgGreen && isTextGreen && dist < 160) {
    return "#facc15"; // Promote to Gold
  }

  // 3. Red/Orange/Yellow text on Amber/Bronze background
  const isBgAmber = br > 100 && bg > 40 && bb < 40;
  const isTextWarm = tr > 200 && tb < 100;
  if (isBgAmber && isTextWarm && dist < 170) {
    return "#ffffff"; // Pure Crisp White on Amber/Bronze
  }

  // 4. Red/Pink/Purple text on Wine Burgundy/Crimson background
  const isBgBurgundy = br > 70 && bg < 40;
  const isTextReddish = tr > 180 && tg < 140;
  if (isBgBurgundy && isTextReddish && dist < 160) {
    return "#facc15"; // Promote to Gold on Burgundy
  }

  // 5. Generic low contrast distance threshold
  if (dist < 125) {
    return isBgPurpleOrBlue || isBgGreen || isBgBurgundy ? "#facc15" : "#ffffff";
  }

  return textColorHex;
};

/**
 * Parses inline color markup e.g. {yellow}highlighted text{/yellow} into styled React elements.
 * Supports inline hex codes e.g. {38bdf8}text{/38bdf8} as well.
 * Automatically checks and enforces high contrast against the background color!
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

  const fontStyle = fontFamily ? { fontFamily } : { fontFamily: "inherit" };

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index).replace(/\{[^\}]+\}/g, "");
      if (plain) {
        parts.push(
          <span key={key++} style={{ color: defaultColor, ...fontStyle }}>
            {plain}
          </span>,
        );
      }
    }
    const color = match[1].toLowerCase();
    const rawColorValue =
      COLOR_MAP[color] ||
      (/^[a-f0-9]{6}$/i.test(color) ? `#${color}` : defaultColor);

    const colorValue = backgroundColor
      ? ensureHighContrast(rawColorValue, backgroundColor)
      : rawColorValue;

    parts.push(
      <span
        key={key++}
        style={{
          color: colorValue,
          textShadow: `0 0 16px ${colorValue}66`,
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
        <span key={key++} style={{ color: defaultColor, ...fontStyle }}>
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
