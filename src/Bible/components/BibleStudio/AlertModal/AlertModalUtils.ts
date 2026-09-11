import { AlertStructuredData } from "@/Bible/components/AlertTemplates/alertTemplateTypes";
import { stripMarkup } from "@/Bible/components/AlertTemplates/alertParser";
import { ColorRange } from "./AlertModalTypes";
import { colorMap, colorTokenFromHex } from "./AlertModalConstants";

export const cleanStructuredData = (
  struct?: AlertStructuredData | null,
): AlertStructuredData => {
  if (!struct) return {};
  const res: AlertStructuredData = {};
  for (const [k, v] of Object.entries(struct)) {
    if (typeof v === "string") {
      res[k as keyof AlertStructuredData] = stripMarkup(v);
    } else {
      (res as any)[k] = v;
    }
  }
  return res;
};

export const parseAlertMarkup = (text: string) => {
  const regex = /\{([a-zA-Z0-9#]+)\}([^{]*?)\{\/\1\}/gi;
  const ranges: ColorRange[] = [];
  let plainText = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const rawBefore = text
      .slice(lastIndex, match.index)
      .replace(/\{[^\}]+\}/g, "");
    plainText += rawBefore;

    const color = match[1].toLowerCase();
    const coloredText = match[2].replace(/\{[^\}]+\}/g, "");
    const start = plainText.length;

    plainText += coloredText;
    const cleanColor = color.replace(/^#/, "");
    ranges.push({
      start,
      end: plainText.length,
      color:
        colorMap[cleanColor] ||
        (/^[a-f0-9]{3,8}$/i.test(cleanColor)
          ? `#${cleanColor}`
          : colorMap.white),
    });

    lastIndex = regex.lastIndex;
  }

  const rawRemaining = text.slice(lastIndex).replace(/\{[^\}]+\}/g, "");
  plainText += rawRemaining;
  return { plainText, ranges };
};

export const buildAlertMarkup = (text: string, ranges: ColorRange[]) => {
  const sortedRanges = [...ranges]
    .map((range) => ({
      ...range,
      start: Math.max(0, Math.min(text.length, range.start)),
      end: Math.max(0, Math.min(text.length, range.end)),
    }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start);

  const parts: string[] = [];
  let cursor = 0;

  sortedRanges.forEach((range) => {
    if (range.start < cursor) return;

    parts.push(text.slice(cursor, range.start));
    const token = colorTokenFromHex(range.color);
    parts.push(`{${token}}${text.slice(range.start, range.end)}{/${token}}`);
    cursor = range.end;
  });

  parts.push(text.slice(cursor));
  return parts.join("");
};

export const updateRangesForTextChange = (
  oldText: string,
  newText: string,
  ranges: ColorRange[],
) => {
  if (oldText === newText) return ranges;
  if (!ranges || ranges.length === 0) return [];

  let prefixLength = 0;
  const minLength = Math.min(oldText.length, newText.length);
  while (
    prefixLength < minLength &&
    oldText[prefixLength] === newText[prefixLength]
  ) {
    prefixLength++;
  }

  let suffixLength = 0;
  while (
    suffixLength < oldText.length - prefixLength &&
    suffixLength < newText.length - prefixLength &&
    oldText[oldText.length - 1 - suffixLength] ===
      newText[newText.length - 1 - suffixLength]
  ) {
    suffixLength++;
  }

  const changeStart = prefixLength;
  const oldChangeEnd = oldText.length - suffixLength;
  const newChangeEnd = newText.length - suffixLength;
  const delta = newText.length - oldText.length;

  return ranges
    .map((range) => {
      if (range.end <= changeStart) return range;
      if (range.start >= oldChangeEnd) {
        return {
          ...range,
          start: range.start + delta,
          end: range.end + delta,
        };
      }
      if (range.start <= changeStart && range.end >= oldChangeEnd) {
        const newEnd = range.end + delta;
        return newEnd > range.start ? { ...range, end: newEnd } : null;
      }
      if (
        range.start >= changeStart &&
        range.start < oldChangeEnd &&
        range.end >= oldChangeEnd
      ) {
        const newStart = Math.min(newChangeEnd, range.end + delta);
        const newEnd = range.end + delta;
        return newEnd > newStart
          ? { ...range, start: newStart, end: newEnd }
          : null;
      }
      if (
        range.start <= changeStart &&
        range.end > changeStart &&
        range.end <= oldChangeEnd
      ) {
        const newEnd = changeStart;
        return newEnd > range.start ? { ...range, end: newEnd } : null;
      }
      if (range.start >= changeStart && range.end <= oldChangeEnd) {
        return newChangeEnd > changeStart
          ? { ...range, start: changeStart, end: newChangeEnd }
          : null;
      }
      return null;
    })
    .filter((range): range is ColorRange => !!range)
    .filter(
      (range) =>
        range.start >= 0 &&
        range.end <= newText.length &&
        range.end > range.start,
    );
};

export const isDarkColor = (hex: string) => {
  if (!hex) return true;
  let cleanHex = hex;
  if (!cleanHex.startsWith("#")) {
    if (colorMap[cleanHex.toLowerCase()]) {
      cleanHex = colorMap[cleanHex.toLowerCase()];
    } else {
      return true;
    }
  }
  if (cleanHex.length < 7) return true;
  const r = parseInt(cleanHex.slice(1, 3), 16) || 0;
  const g = parseInt(cleanHex.slice(3, 5), 16) || 0;
  const b = parseInt(cleanHex.slice(5, 7), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
};
