import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { Preset } from "../../src/store/slices/appSlice";

/**
 * Preset Storage Service
 * Manages preset data persistence using Electron's file system
 * Each preset is stored as a separate JSON file for better performance and scalability
 */

// Get the presets directory path
export function getPresetsDirectoryPath(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "presets");
}

// Get the preset metadata file path
export function getPresetMetadataPath(): string {
  return path.join(getPresetsDirectoryPath(), "metadata.json");
}

// Get individual preset file path
export function getPresetFilePath(presetId: string): string {
  return path.join(getPresetsDirectoryPath(), `${presetId}.json`);
}

// Ensure presets directory exists
export async function ensurePresetsDirectory(): Promise<void> {
  const presetsDir = getPresetsDirectoryPath();
  try {
    await fs.access(presetsDir);
  } catch {
    // Directory doesn't exist, create it
    await fs.mkdir(presetsDir, { recursive: true });
    console.log("✅ Presets directory created:", presetsDir);
  }
}

// Preset metadata interface (lightweight for quick loading)
export interface PresetMetadata {
  id: string;
  type: Preset["type"];
  name: string;
  createdAt: number;
  updatedAt?: number;
  thumbnail?: string; // Optional: base64 thumbnail for preview
}

/**
 * Save a preset to file system
 */
export async function savePreset(preset: Preset): Promise<void> {
  await ensurePresetsDirectory();

  const presetPath = getPresetFilePath(preset.id);
  const presetData = JSON.stringify(preset, null, 2);

  await fs.writeFile(presetPath, presetData, "utf-8");

  // Update metadata
  await updateMetadata(preset);

  console.log(`✅ Preset saved: ${preset.id} (${preset.name})`);
}

/**
 * Load a preset from file system
 */
export async function loadPreset(presetId: string): Promise<Preset | null> {
  try {
    const presetPath = getPresetFilePath(presetId);
    const presetData = await fs.readFile(presetPath, "utf-8");
    const preset: Preset = JSON.parse(presetData);

    console.log(`✅ Preset loaded: ${presetId}`);
    return preset;
  } catch (error) {
    console.error(`❌ Error loading preset ${presetId}:`, error);
    return null;
  }
}

/**
 * Delete a preset from file system
 */
export async function deletePreset(presetId: string): Promise<boolean> {
  try {
    const presetPath = getPresetFilePath(presetId);
    await fs.unlink(presetPath);

    // Remove from metadata
    await removeFromMetadata(presetId);

    console.log(`✅ Preset deleted: ${presetId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting preset ${presetId}:`, error);
    return false;
  }
}

/**
 * Load all preset metadata (lightweight)
 */
export async function loadAllPresetMetadata(): Promise<PresetMetadata[]> {
  try {
    await ensurePresetsDirectory();
    const metadataPath = getPresetMetadataPath();

    try {
      const metadataData = await fs.readFile(metadataPath, "utf-8");
      return JSON.parse(metadataData);
    } catch {
      // Metadata file doesn't exist, return empty array
      return [];
    }
  } catch (error) {
    console.error("❌ Error loading preset metadata:", error);
    return [];
  }
}

/**
 * Load all presets (full data)
 * Note: Use sparingly, prefer loading metadata first
 */
export async function loadAllPresets(): Promise<Preset[]> {
  try {
    await ensurePresetsDirectory();
    const presetsDir = getPresetsDirectoryPath();
    const files = await fs.readdir(presetsDir);

    const presetFiles = files.filter(
      (file) => file.endsWith(".json") && file !== "metadata.json"
    );

    const presets: Preset[] = [];

    for (const file of presetFiles) {
      const presetPath = path.join(presetsDir, file);
      try {
        const presetData = await fs.readFile(presetPath, "utf-8");
        const preset: Preset = JSON.parse(presetData);
        presets.push(preset);
      } catch (error) {
        console.error(`❌ Error loading preset file ${file}:`, error);
      }
    }

    console.log(`✅ Loaded ${presets.length} presets from file system`);
    return presets;
  } catch (error) {
    console.error("❌ Error loading all presets:", error);
    return [];
  }
}

/**
 * Update metadata file with preset info
 */
async function updateMetadata(preset: Preset): Promise<void> {
  const metadata = await loadAllPresetMetadata();
  const metadataPath = getPresetMetadataPath();

  // Remove existing metadata for this preset
  const filteredMetadata = metadata.filter((m) => m.id !== preset.id);

  // Add new metadata
  const newMetadata: PresetMetadata = {
    id: preset.id,
    type: preset.type,
    name: preset.name,
    createdAt: preset.createdAt,
    updatedAt: Date.now(),
  };

  filteredMetadata.push(newMetadata);

  // Sort by createdAt (newest first)
  filteredMetadata.sort((a, b) => b.createdAt - a.createdAt);

  await fs.writeFile(metadataPath, JSON.stringify(filteredMetadata, null, 2));
}

/**
 * Remove preset from metadata
 */
async function removeFromMetadata(presetId: string): Promise<void> {
  const metadata = await loadAllPresetMetadata();
  const metadataPath = getPresetMetadataPath();

  const filteredMetadata = metadata.filter((m) => m.id !== presetId);

  await fs.writeFile(metadataPath, JSON.stringify(filteredMetadata, null, 2));
}

/**
 * Export all presets to a single JSON file
 */
export async function exportAllPresets(
  exportPath: string
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

/**
 * Import presets from a JSON file
 */
export async function importPresets(
  importPath: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const fileData = await fs.readFile(importPath, "utf-8");
    const importData = JSON.parse(fileData);

    if (!importData.presets || !Array.isArray(importData.presets)) {
      return {
        success: false,
        count: 0,
        error: "Invalid import file format",
      };
    }

    const presets: Preset[] = importData.presets;

    for (const preset of presets) {
      await savePreset(preset);
    }

    console.log(`✅ Imported ${presets.length} presets from ${importPath}`);
    return { success: true, count: presets.length };
  } catch (error) {
    console.error("❌ Error importing presets:", error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search presets by name or type
 */
export async function searchPresets(
  query: string,
  type?: Preset["type"]
): Promise<PresetMetadata[]> {
  const metadata = await loadAllPresetMetadata();

  return metadata.filter((m) => {
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());
    const matchesType = type ? m.type === type : true;
    return matchesQuery && matchesType;
  });
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalPresets: number;
  totalSize: number;
  presetsByType: Record<string, number>;
}> {
  try {
    const metadata = await loadAllPresetMetadata();
    const presetsDir = getPresetsDirectoryPath();
    const files = await fs.readdir(presetsDir);

    let totalSize = 0;
    const presetsByType: Record<string, number> = {};

    // Calculate total size
    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(presetsDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    }

    // Count by type
    for (const meta of metadata) {
      presetsByType[meta.type] = (presetsByType[meta.type] || 0) + 1;
    }

    return {
      totalPresets: metadata.length,
      totalSize,
      presetsByType,
    };
  } catch (error) {
    console.error("❌ Error getting storage stats:", error);
    return {
      totalPresets: 0,
      totalSize: 0,
      presetsByType: {},
    };
  }
}
