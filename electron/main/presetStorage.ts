import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { Preset } from "../../src/store/slices/appSlice";

/**
 * Preset Storage Service
 * ─────────────────────────────────────────────────────────────────────────────
 * All presets are stored in a **single** `presets.json` file inside the
 * Electron userData directory.  Images are stored on disk in user-chosen
 * directories and referenced via `local-image://` protocol URLs so the
 * renderer can use them directly in <img> tags — no base64 anywhere.
 *
 * Locations (Windows):
 *   Presets JSON : C:\Users\<user>\AppData\Roaming\the-word\presets.json
 *
 * On first run after the migration, any legacy per-file presets sitting in the
 * old `presets/` subdirectory are automatically merged into the new file and
 * the old directory is renamed to `presets_migrated/`.
 */

// ── Paths ─────────────────────────────────────────────────────────────────────

/** Full path to the single presets file. */
export function getPresetsFilePath(): string {
  return path.join(app.getPath("userData"), "presets.json");
}

/** Legacy directory used by the old per-file storage (for migration). */
function getLegacyPresetsDir(): string {
  return path.join(app.getPath("userData"), "presets");
}

// ── Read / Write helpers ──────────────────────────────────────────────────────

/** Read the presets array from disk (returns [] if file doesn't exist). */
async function readPresetsFile(): Promise<Preset[]> {
  try {
    const raw = await fs.readFile(getPresetsFilePath(), "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Overwrite the presets file with the given array. */
async function writePresetsFile(presets: Preset[]): Promise<void> {
  await fs.writeFile(
    getPresetsFilePath(),
    JSON.stringify(presets, null, 2),
    "utf-8",
  );
}

// ── Migration from legacy per-file storage ────────────────────────────────────

let migrationDone = false;

/**
 * One-time migration (runs once per app launch):
 *  1. If the old `presets/` directory exists, read every *.json file inside
 *     it, merge into presets.json, and rename the old dir.
 *  2. Scan presets.json for any remaining inline base64 data-URIs and extract
 *     them to the `preset-images/` directory.
 */
export async function migrateFromLegacyStorage(): Promise<void> {
  if (migrationDone) return;
  migrationDone = true;

  // ── Step 1: Per-file → single-file migration ────────────────────────────
  const legacyDir = getLegacyPresetsDir();

  try {
    await fs.access(legacyDir);

    try {
      const files = await fs.readdir(legacyDir);
      const jsonFiles = files.filter(
        (f) => f.endsWith(".json") && f !== "metadata.json",
      );

      if (jsonFiles.length === 0) {
        await fs.rename(legacyDir, legacyDir + "_migrated");
        console.log("✅ Legacy presets directory renamed (was empty).");
      } else {
        const legacyPresets: Preset[] = [];

        for (const file of jsonFiles) {
          try {
            const raw = await fs.readFile(path.join(legacyDir, file), "utf-8");
            const preset: Preset = JSON.parse(raw);
            if (preset && preset.id) legacyPresets.push(preset);
          } catch {
            // Skip corrupt files silently.
          }
        }

        if (legacyPresets.length > 0) {
          const existing = await readPresetsFile();
          const existingIds = new Set(existing.map((p) => p.id));
          const merged = [
            ...existing,
            ...legacyPresets.filter((p) => !existingIds.has(p.id)),
          ];
          await writePresetsFile(merged);
          console.log(
            `✅ Migrated ${legacyPresets.length} presets from legacy per-file storage.`,
          );
        }

        await fs.rename(legacyDir, legacyDir + "_migrated");
        console.log("✅ Legacy presets directory renamed to presets_migrated.");
      }
    } catch (err) {
      console.error("❌ Error during legacy preset migration:", err);
    }
  } catch {
    // No legacy directory — nothing to migrate from per-file format.
  }

  // ── Step 2: No longer needed ─────────────────────────────────────────────
  // Previously this scanned for inline base64 and legacy file: refs.
  // Images now arrive as local-image:// URLs from the generate-ai-image handler,
  // so there's nothing to extract or migrate.
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Save a preset (add or update).
 * Image URLs are already `local-image://` references — stored as-is.
 */
export async function savePreset(preset: Preset): Promise<void> {
  await migrateFromLegacyStorage();

  const presets = await readPresetsFile();
  const idx = presets.findIndex((p) => p.id === preset.id);
  if (idx >= 0) {
    presets[idx] = preset;
  } else {
    presets.push(preset);
  }

  await writePresetsFile(presets);
  console.log(`✅ Preset saved: ${preset.id} (${preset.name})`);
}

/**
 * Load a single preset by id.
 * Image fields already contain `local-image://` URLs — no rehydration needed.
 */
export async function loadPreset(presetId: string): Promise<Preset | null> {
  await migrateFromLegacyStorage();
  const presets = await readPresetsFile();
  return presets.find((p) => p.id === presetId) ?? null;
}

/**
 * Delete a preset by id.
 * Note: The image file on disk (in the user-chosen directory) is NOT deleted
 * here — the user manages their own image directory.
 */
export async function deletePreset(presetId: string): Promise<boolean> {
  await migrateFromLegacyStorage();
  const presets = await readPresetsFile();
  const filtered = presets.filter((p) => p.id !== presetId);

  if (filtered.length === presets.length) return false; // not found

  await writePresetsFile(filtered);
  console.log(`✅ Preset deleted: ${presetId}`);
  return true;
}

/**
 * Load all presets.
 * Image fields already contain `local-image://` URLs — ready for the renderer.
 */
export async function loadAllPresets(): Promise<Preset[]> {
  await migrateFromLegacyStorage();
  const presets = await readPresetsFile();
  console.log(`✅ Loaded ${presets.length} presets from presets.json`);
  return presets;
}

// ── Export / Import ───────────────────────────────────────────────────────────

export async function exportAllPresets(
  exportPath: string,
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const presets = await loadAllPresets();
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0.0",
      totalPresets: presets.length,
      presets,
    };
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Exported ${presets.length} presets to ${exportPath}`);
    return { success: true, count: presets.length };
  } catch (error) {
    console.error("❌ Error exporting presets:", error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function importPresets(
  importPath: string,
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const fileData = await fs.readFile(importPath, "utf-8");
    const importData = JSON.parse(fileData);

    if (!importData.presets || !Array.isArray(importData.presets)) {
      return { success: false, count: 0, error: "Invalid import file format" };
    }

    const incoming: Preset[] = importData.presets;
    for (const preset of incoming) {
      await savePreset(preset);
    }

    console.log(`✅ Imported ${incoming.length} presets from ${importPath}`);
    return { success: true, count: incoming.length };
  } catch (error) {
    console.error("❌ Error importing presets:", error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ── Search / Stats ────────────────────────────────────────────────────────────

export interface PresetMetadata {
  id: string;
  type: Preset["type"];
  name: string;
  createdAt: number;
  updatedAt?: number;
  thumbnail?: string;
}

export async function searchPresets(
  query: string,
  type?: Preset["type"],
): Promise<PresetMetadata[]> {
  const presets = await loadAllPresets();
  return presets
    .filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = type ? p.type === type : true;
      return matchesQuery && matchesType;
    })
    .map((p) => ({
      id: p.id,
      type: p.type,
      name: p.name,
      createdAt: p.createdAt,
    }));
}

export async function getStorageStats(): Promise<{
  totalPresets: number;
  totalSize: number;
  presetsByType: Record<string, number>;
}> {
  try {
    const presets = await loadAllPresets();
    let totalSize = 0;

    try {
      const stats = await fs.stat(getPresetsFilePath());
      totalSize = stats.size;
    } catch {}

    const presetsByType: Record<string, number> = {};
    for (const p of presets) {
      presetsByType[p.type] = (presetsByType[p.type] || 0) + 1;
    }

    return { totalPresets: presets.length, totalSize, presetsByType };
  } catch (error) {
    console.error("❌ Error getting storage stats:", error);
    return { totalPresets: 0, totalSize: 0, presetsByType: {} };
  }
}

// ── Legacy compat exports ─────────────────────────────────────────────────────
// These are kept so existing code that imports them doesn't break.

/** @deprecated Single file — no directory needed. */
export function getPresetsDirectoryPath(): string {
  return path.dirname(getPresetsFilePath());
}

/** @deprecated Metadata is inlined in presets.json. */
export function getPresetMetadataPath(): string {
  return getPresetsFilePath();
}

/** @deprecated No individual files — returns the single file path. */
export function getPresetFilePath(_presetId: string): string {
  return getPresetsFilePath();
}

/** @deprecated No directory to ensure. */
export async function ensurePresetsDirectory(): Promise<void> {}

/** @deprecated Returns lightweight metadata from the single file. */
export async function loadAllPresetMetadata(): Promise<PresetMetadata[]> {
  const presets = await loadAllPresets();
  return presets.map((p) => ({
    id: p.id,
    type: p.type,
    name: p.name,
    createdAt: p.createdAt,
  }));
}
