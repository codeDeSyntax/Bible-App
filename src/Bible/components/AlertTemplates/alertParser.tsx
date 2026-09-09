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
  lime: "#bef264",
  lemon: "#bef264",
  lemongreen: "#bef264",
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
  if (!bgHex) return textColorHex;

  // Clean hexes
  const cleanText = textColorHex.startsWith("#") ? textColorHex.slice(1) : textColorHex;
  const cleanBg = bgHex.startsWith("#") ? bgHex.slice(1) : bgHex;
  if (cleanText.length < 6 || cleanBg.length < 6) return textColorHex;

  const tr = parseInt(cleanText.slice(0, 2), 16) || 0;
  const tg = parseInt(cleanText.slice(2, 4), 16) || 0;
  const tb = parseInt(cleanText.slice(4, 6), 16) || 0;

  const br = parseInt(cleanBg.slice(0, 2), 16) || 0;
  const bg = parseInt(cleanBg.slice(2, 4), 16) || 0;
  const bb = parseInt(cleanBg.slice(4, 6), 16) || 0;

  // Euclidean RGB distance
  const distance = Math.sqrt(
    Math.pow(tr - br, 2) + Math.pow(tg - bg, 2) + Math.pow(tb - bb, 2),
  );

  // Perceived background luminance (YIQ)
  const bgLuminance = (br * 299 + bg * 587 + bb * 114) / 1000;
  const isBgPurpleOrBlue = (bb > 90 && bb >= tg) || (br > 70 && bb > 70);
  const isBgGreen = (bg > br && bg > bb);
  const isBgBurgundy = (br > 100 && bg < 60 && bb < 70);
  const isBgAmberOrBronze = (br > 90 && bg > 40 && bb < 45);

  // 1. Muddy blue text on dark backgrounds:
  // Standard blue (#3b82f6) has only 11% luminance contribution, making it strain eyes on projectors.
  // Promote to luminous Electric Cyan (#38bdf8) or White.
  const isTextDarkBlue = tb > 150 && tb > tr + 50 && tg < 165;
  if (isTextDarkBlue && bgLuminance < 130) {
    return isBgAmberOrBronze ? "#ffffff" : "#38bdf8";
  }

  // 2. Yellow/Orange text on Amber/Bronze/Gold backgrounds:
  const isTextWarmYellow = tr > 180 && tg > 130 && tb < 90;
  if (isTextWarmYellow && isBgAmberOrBronze) {
    return "#ffffff"; // Pure Crisp White on Amber/Bronze
  }

  // 3. Euclidean RGB distance check (threshold 130)
  if (distance < 130) {
    if (isBgAmberOrBronze) {
      return "#ffffff"; // Pure Crisp White on Amber/Bronze
    }
    // High-visibility luminous Gold on deep jewel purples, emeralds, and burgundies
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

  const isBlackBg =
    backgroundColor?.toLowerCase() === "#000000" ||
    backgroundColor?.toLowerCase() === "#000" ||
    backgroundColor?.toLowerCase() === "black";

  const isWhiteBg =
    backgroundColor?.toLowerCase() === "#ffffff" ||
    backgroundColor?.toLowerCase() === "#fff" ||
    backgroundColor?.toLowerCase() === "white";

  const effectiveDefaultColor =
    defaultColor === "#ffffff" && isBlackBg
      ? "#bef264"
      : isWhiteBg
      ? "#000000"
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
