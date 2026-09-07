import React, { useState } from "react";

/**
 * Thematically categorized high-resolution CDN natural photography
 */
export const THEMATIC_NATURE_COLLECTIONS = {
  forest: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80", // Misty pine woodland
    "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80", // Sunlit redwood forest
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80", // Deep emerald forest trail
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80", // Sunbeams through forest canopy
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80", // Autumn golden pine trees
    "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=600&q=80", // Foggy temperate rainforest
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80", // Sunlight across dense green trees
    "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=600&q=80", // Deep green pine ridge in fog
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80", // Looking up into lush green tree tops
    "https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=600&q=80", // Emerald moss and cedar woodland
  ],
  mountain: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", // Majestic alpine mountain peak
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80", // Misty mountain ridge
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80", // Alpine valley and rocky peak
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", // Yosemite valley river reflection
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=600&q=80", // Snowy mountain peaks at dusk
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80", // Pristine snow-covered mountain summit
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80", // Fog rolling across high mountain valleys
    "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=600&q=80", // Grand dramatic Dolomites mountain range
    "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80", // Rocky alpine ridge against clear sky
  ],
  waters: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80", // Peaceful blue ocean shore
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80", // Serene mountain lake with clear waters
    "https://images.unsplash.com/photo-1498887960847-2a5e46312788?auto=format&fit=crop&w=600&q=80", // Crystal clear mountain river brook
    "https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=600&q=80", // Deep turquoise clear ocean waters
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80", // Gentle calm coastal sea
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80", // Rolling blue ocean swell
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80", // Misty emerald alpine lake and trees
  ],
  waterfalls: [
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80", // Powerful waterfall cascading into river
    "https://images.unsplash.com/photo-1512756290469-ec961bc80406?auto=format&fit=crop&w=600&q=80", // Cascading mountain stream waterfall
    "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80", // Tropical forest waterfall plunge
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=600&q=80", // Lush green nature cascade
  ],
  sunrise: [
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80", // Golden sunrise over misty field
    "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=600&q=80", // Sunset over rolling hills
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80", // Morning sun rays through trees
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=600&q=80", // Golden dawn light across misty forest valley
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=600&q=80", // Sunrise breaking over ocean horizon
    "https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=600&q=80", // Warm sunrise glowing through morning mist
    "https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?auto=format&fit=crop&w=600&q=80", // Pastel sunset over peaceful mountains
  ],
  pastures: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80", // Green open field and blue sky
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80", // Rolling green meadow valley
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80", // Vibrant nature landscape
    "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=600&q=80", // Sunny green rolling hills
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80", // Wildflower meadow and golden grass
  ],
  heavens: [
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80", // Starry celestial night sky
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=600&q=80", // Stars over horizon
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80", // Starlight over snowy peaks
    "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?auto=format&fit=crop&w=600&q=80", // Twilight purple mountain forest
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=600&q=80", // Galactic cosmic nebula and star cluster
    "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=600&q=80", // Milky way galaxy over mountains
    "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=600&q=80", // Cosmic stars and blue nebula
  ],
  desert_canyon: [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80", // Red rock canyon landscape
    "https://images.unsplash.com/photo-1473580044384-7ba9967a16a0?auto=format&fit=crop&w=600&q=80", // Golden sand dunes in desert sunlight
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80", // Grand canyon sandstone cliffs
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
    kw.includes("waterfall") ||
    kw.includes("cascade") ||
    kw.includes("fall")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.waterfalls;
  } else if (
    kw.includes("water") ||
    kw.includes("stream") ||
    kw.includes("river") ||
    kw.includes("lake") ||
    kw.includes("sea") ||
    kw.includes("ocean") ||
    kw.includes("rain") ||
    kw.includes("wave")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.waters;
  } else if (
    kw.includes("desert") ||
    kw.includes("canyon") ||
    kw.includes("sand") ||
    kw.includes("dune") ||
    kw.includes("rock") ||
    kw.includes("stone") ||
    kw.includes("wilderness")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.desert_canyon;
  } else if (
    kw.includes("mountain") ||
    kw.includes("hill") ||
    kw.includes("peak") ||
    kw.includes("cliff") ||
    kw.includes("alpine") ||
    kw.includes("ridge")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.mountain;
  } else if (
    kw.includes("sun") ||
    kw.includes("dawn") ||
    kw.includes("morning") ||
    kw.includes("light") ||
    kw.includes("gold") ||
    kw.includes("sunset") ||
    kw.includes("dusk")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.sunrise;
  } else if (
    kw.includes("pasture") ||
    kw.includes("meadow") ||
    kw.includes("field") ||
    kw.includes("grass") ||
    kw.includes("valley") ||
    kw.includes("prairie")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.pastures;
  } else if (
    kw.includes("star") ||
    kw.includes("heaven") ||
    kw.includes("night") ||
    kw.includes("sky") ||
    kw.includes("cosmos") ||
    kw.includes("galaxy") ||
    kw.includes("celestial") ||
    kw.includes("glory")
  ) {
    pool = THEMATIC_NATURE_COLLECTIONS.heavens;
  } else if (
    kw.includes("forest") ||
    kw.includes("wood") ||
    kw.includes("tree") ||
    kw.includes("pine") ||
    kw.includes("cedar") ||
    kw.includes("grove") ||
    kw.includes("jungle") ||
    kw.includes("leaves") ||
    kw.includes("green")
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
