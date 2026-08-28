import React, { useState } from "react";

/**
 * Thematically categorized high-resolution CDN natural photography
 */
export const THEMATIC_NATURE_COLLECTIONS = {
  forest: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80", // Misty pine woodland
    "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=300&q=80", // Sunlit redwood forest
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=300&q=80", // Deep emerald forest trail
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80", // Sunbeams through forest canopy
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=300&q=80", // Autumn golden pine trees
  ],
  mountain: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80", // Majestic alpine mountain peak
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80", // Misty mountain ridge
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=300&q=80", // Alpine valley river
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80", // Yosemite valley reflection
  ],
  waters: [
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=300&q=80", // Waterfall and river stream
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80", // Peaceful blue ocean shore
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80", // Serene mountain lake
    "https://images.unsplash.com/photo-1498887960847-2a5e46312788?auto=format&fit=crop&w=300&q=80", // Crystal mountain brook
  ],
  sunrise: [
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=300&q=80", // Golden sunrise over misty field
    "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=300&q=80", // Sunset over rolling hills
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80", // Morning sun rays through trees
  ],
  pastures: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80", // Green open field and blue sky
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=300&q=80", // Rolling green meadow valley
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=300&q=80", // Lush green nature canopy
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80", // Vibrant nature landscape
  ],
  heavens: [
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80", // Starry celestial night sky
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=300&q=80", // Stars over horizon
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80", // Starlight over snowy peaks
    "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?auto=format&fit=crop&w=300&q=80", // Twilight purple mountain forest
  ],
};

export const ALL_VERIFIED_IMAGES = Object.values(THEMATIC_NATURE_COLLECTIONS).flat();

/**
 * Curated natural and aesthetic theme gradient color pairs
 */
export const NATURAL_THEME_GRADIENTS: Array<[string, string]> = [
  ["#059669", "#10b981"], // Emerald pine
  ["#047857", "#34d399"], // Lush forest canopy
  ["#0f766e", "#2dd4bf"], // Teal woodland stream
  ["#15803d", "#84cc16"], // Sunlit cedar moss
  ["#166534", "#4ade80"], // Deep spruce green
  ["#0284c7", "#38bdf8"], // Morning mist sky
  ["#0369a1", "#0ea5e9"], // Ocean blue
  ["#b45309", "#f59e0b"], // Golden hour forest
  ["#c2410c", "#fb923c"], // Warm sunset amber
  ["#6b21a8", "#a855f7"], // Twilight redwood
  ["#4338ca", "#818cf8"], // Evening mountain ridge
  ["#0d9488", "#5eead4"], // Fresh alpine stream
  ["#7c2d12", "#ea580c"], // Canyon sandstone
  ["#1e293b", "#64748b"], // Mountain slate
];

/**
 * Deterministic hash from string for consistent styling per scripture reference
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolves an appropriate thematic CDN image from 2-word keywords and scripture reference.
 */
export function validateForestImageUrl(
  url?: string,
  seedString?: string,
  themeKeywords?: string,
): string {
  // If direct valid URL is provided, verify and use it
  if (url && typeof url === "string") {
    const clean = url.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      try {
        const parsed = new URL(clean);
        if (parsed.hostname && parsed.hostname.length > 3) {
          return clean;
        }
      } catch {}
    }
  }

  const seed = seedString || "nature-scene";
  const seedHash = hashString(seed);

  // If theme keywords are provided by AI, match to thematic collection
  const kw = (themeKeywords || "").toLowerCase();
  let pool: string[] = ALL_VERIFIED_IMAGES;

  if (
    kw.includes("water") ||
    kw.includes("stream") ||
    kw.includes("river") ||
    kw.includes("lake") ||
    kw.includes("sea") ||
    kw.includes("ocean") ||
    kw.includes("rain") ||
    kw.includes("fall")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.waters;
  } else if (
    kw.includes("mountain") ||
    kw.includes("hill") ||
    kw.includes("rock") ||
    kw.includes("peak") ||
    kw.includes("cliff") ||
    kw.includes("canyon")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.mountain;
  } else if (
    kw.includes("sun") ||
    kw.includes("dawn") ||
    kw.includes("morning") ||
    kw.includes("light") ||
    kw.includes("gold")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.sunrise;
  } else if (
    kw.includes("pasture") ||
    kw.includes("meadow") ||
    kw.includes("field") ||
    kw.includes("grass") ||
    kw.includes("sheep")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.pastures;
  } else if (
    kw.includes("star") ||
    kw.includes("heaven") ||
    kw.includes("night") ||
    kw.includes("sky") ||
    kw.includes("cosmos")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.heavens;
  } else if (
    kw.includes("forest") ||
    kw.includes("wood") ||
    kw.includes("tree") ||
    kw.includes("pine") ||
    kw.includes("cedar")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.forest;
  }

  return pool[seedHash % pool.length];
}

/**
 * Returns the pair of theme hex colors.
 */
export function getThemeColorPair(
  gradientColors?: [string, string] | string,
  seedString?: string,
): [string, string] {
  let color1 = "#059669";
  let color2 = "#10b981";

  if (
    gradientColors &&
    Array.isArray(gradientColors) &&
    gradientColors.length >= 2 &&
    typeof gradientColors[0] === "string" &&
    typeof gradientColors[1] === "string"
  ) {
    color1 = gradientColors[0];
    color2 = gradientColors[1];
  } else if (seedString) {
    const idx = hashString(seedString) % NATURAL_THEME_GRADIENTS.length;
    const pair = NATURAL_THEME_GRADIENTS[idx];
    color1 = pair[0];
    color2 = pair[1];
  }

  return [color1, color2];
}

/**
 * Generates dynamic gradient background based on detected theme colors.
 */
export function getThemeGradient(
  gradientColors?: [string, string] | string,
  seedString?: string,
): string {
  const [color1, color2] = getThemeColorPair(gradientColors, seedString);
  return `linear-gradient(90deg, ${color1}66 0%, ${color2}38 12%, ${color2}10 18%, transparent 22%), var(--card-bg, #000000)`;
}

export interface ForestThumbnailProps {
  imageUrl?: string;
  seedString?: string;
  themeKeywords?: string;
  className?: string;
  alt?: string;
}

/**
 * Reusable natural landscape thumbnail component with automatic cross.png fallback.
 */
export const ForestThumbnail: React.FC<ForestThumbnailProps> = ({
  imageUrl,
  seedString,
  themeKeywords,
  className = "w-full h-full object-cover",
  alt = "Scripture Theme Nature",
}) => {
  const primaryUrl = validateForestImageUrl(imageUrl, seedString, themeKeywords);
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? "./cross.png" : primaryUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
};
