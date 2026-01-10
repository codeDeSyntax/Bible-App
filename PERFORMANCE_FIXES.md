# Bible Projection Performance Issues - 3s Delay Analysis & Fixes

## Problem

Projection takes ~3 seconds from button click to scripture display. Target: <500ms

## Root Causes Identified

### 1. **Display Detection (Expensive Repeated Calls)**

- `createBiblePresentationWindow()` calls `detectExternalDisplay()` which does `screen.getAllDisplays()` EVERY TIME
- `screen.getAllDisplays()` is synchronous and iterates all displays
- Can take 200-500ms on systems with multiple displays/projectors

**Fix:** Cache display detection with 3-5 second TTL

```typescript
let cachedExternalDisplay: Electron.Display | null | undefined;
let displayCacheTime = 0;
const DISPLAY_CACHE_TTL = 3000;

function detectExternalDisplayCached(): Electron.Display | null {
  const now = Date.now();
  if (
    cachedExternalDisplay !== undefined &&
    now - displayCacheTime < DISPLAY_CACHE_TTL
  ) {
    return cachedExternalDisplay;
  }
  // ... detect and cache ...
}
```

### 2. **Redundant Window Geometry Calls**

- Window creation with `x, y, width, height` in constructor
- Then `setBounds()` called again with same values
- Then `setFullScreen(true)` called again
- Multiple `getBounds()` calls for logging

**Fix:** Set all geometry in BrowserWindow constructor, call `setFullScreen()` once

```typescript
biblePresentationWin = new BrowserWindow({
  x: presentationDisplay.bounds.x,
  y: presentationDisplay.bounds.y,
  width: presentationDisplay.bounds.width,
  height: presentationDisplay.bounds.height,
  fullscreen: true, // Set here, not after creation
  // ... other options ...
});
biblePresentationWin.setFullScreen(true); // Only call once
// DELETE: setBounds(), multiple getBounds() calls
```

### 3. **Synchronous Display Logging**

- Loops through all displays logging details
- Not critical for functionality, adds 50-100ms

**Fix:** Remove verbose display logging or defer to console only in debug mode

### 4. **Data Lookup Is Linear (Renderer Side)**

- `ScriptureContent.tsx` does synchronous `.find()` on large Bible data structure
- Searches: `bibleData[translation].books.find()` → `book.chapters.find()` → `chapter.verses`
- On large translations (5000+ verses per chapter), this is slow

**Fix:** Create index/cache for quick verse lookup

```typescript
// Create once when Bible data loads
const verseIndexCache = new Map();
for (const translation in bibleData) {
  for (const book of bibleData[translation].books) {
    for (const chapter of book.chapters) {
      const key = `${translation}:${book.name}:${chapter.chapter}`;
      verseIndexCache.set(key, chapter.verses);
    }
  }
}
```

### 5. **Window Ready-to-Show Timing**

- Data sent AFTER window shows
- Renderer waits for DOM ready, then component renders, then shows verses
- Should pre-populate data before show

**Fix:** Send scripture data in `ready-to-show` callback or via preload

```typescript
// In projectionManager.ts
biblePresentationWin?.once("ready-to-show", () => {
  // Send data immediately BEFORE show
  biblePresentationWin?.webContents.send("bible-presentation-update", {
    type: "scripture-mode",
    presentationData: data.presentationData,
    settings: data.settings,
  });

  // Then show
  biblePresentationWin?.show();
});
```

## Implementation Priorities

### Priority 1 (Fastest Win): Display Caching

- **Saves:** 200-500ms
- **Effort:** 2 minutes
- **File:** `electron/main/projectionManager.ts`

### Priority 2 (Quick): Remove Logging Loops

- **Saves:** 50-100ms
- **Effort:** 1 minute
- **File:** `electron/main/projectionManager.ts`

### Priority 3 (Medium): Batch Geometry Calls

- **Saves:** 100-200ms
- **Effort:** 3 minutes
- **File:** `electron/main/projectionManager.ts`

### Priority 4 (Complex): Verse Lookup Index

- **Saves:** 200-400ms
- **Effort:** 10 minutes
- **File:** `src/Bible/ScriptureContent.tsx`

### Priority 5 (Polish): Early Data Send

- **Saves:** 100-200ms
- **Effort:** 5 minutes
- **File:** `electron/main/projectionManager.ts`

## Expected Total Improvement

- **Current:** ~3000ms (3 seconds)
- **After all fixes:** 300-600ms (0.3-0.6 seconds)
- **Target:** <500ms ✅

## Testing

After each fix:

```bash
# Open DevTools and time from button click to verses visible
# Use Performance tab to profile: projectionManager.ts and UniversalPresentationDisplay.tsx
```

## Code Files to Modify

1. `electron/main/projectionManager.ts` - Main bottleneck
2. `src/Bible/ScriptureContent.tsx` - handleOpenBiblePresentation() function
3. `src/Bible/components/UniversalPresentationDisplay.tsx` - Renderer side (if needed)
