import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  addPreset,
  updatePreset,
  deletePreset,
  loadPresetsFromFile,
  replaceAllPresets,
  Preset,
} from "../store/slices/appSlice";

/**
 * Custom hook for managing presets with file system persistence
 */
export const usePresets = () => {
  const dispatch = useDispatch();
  const presets = useSelector((state: RootState) => state.app.presets);
  const activePreset = useSelector(
    (state: RootState) => state.app.activePreset
  );
  const projectedPreset = useSelector(
    (state: RootState) => state.app.projectedPreset
  );

  /**
   * Load all presets from file system on mount
   */
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const result = await window.api.loadAllPresets();
        if (result.success && result.presets) {
          dispatch(loadPresetsFromFile(result.presets));
          console.log(
            `✅ Loaded ${result.presets.length} presets from file system`
          );
        }
      } catch (error) {
        console.error("❌ Error loading presets:", error);
      }
    };

    loadPresets();
  }, [dispatch]);

  /**
   * Save a preset to file system
   */
  const savePreset = useCallback(
    async (preset: Preset) => {
      try {
        // Save to file system first
        const result = await window.api.savePreset(preset);
        if (result.success) {
          // Then add to Redux (single source of truth)
          dispatch(addPreset(preset));
          console.log(`✅ Preset saved: ${preset.name}`);
          return true;
        } else {
          console.error("❌ Failed to save preset:", result.error);
          return false;
        }
      } catch (error) {
        console.error("❌ Error saving preset:", error);
        return false;
      }
    },
    [dispatch]
  );

  /**
   * Update an existing preset
   */
  const updatePresetData = useCallback(
    async (id: string, updates: Partial<Preset>) => {
      try {
        // Update Redux first
        dispatch(updatePreset({ id, updates }));

        // Get the updated preset from state
        const updatedPreset = presets.find((p) => p.id === id);
        if (!updatedPreset) {
          console.error("❌ Preset not found");
          return false;
        }

        // Persist to file system
        const result = await window.api.savePreset({
          ...updatedPreset,
          ...updates,
        });
        if (result.success) {
          console.log(`✅ Preset updated: ${id}`);
          return true;
        } else {
          console.error("❌ Failed to update preset:", result.error);
          return false;
        }
      } catch (error) {
        console.error("❌ Error updating preset:", error);
        return false;
      }
    },
    [dispatch, presets]
  );

  /**
   * Delete a preset from file system
   */
  const deletePresetById = useCallback(
    async (id: string) => {
      try {
        // Delete from file system first
        const result = await window.api.deletePreset(id);
        if (result.success) {
          // Then remove from Redux
          dispatch(deletePreset(id));
          console.log(`✅ Preset deleted: ${id}`);
          return true;
        } else {
          console.error("❌ Failed to delete preset:", result.error);
          return false;
        }
      } catch (error) {
        console.error("❌ Error deleting preset:", error);
        return false;
      }
    },
    [dispatch]
  );

  /**
   * Export all presets to a file
   */
  const exportPresets = useCallback(async () => {
    try {
      const result = await window.api.exportPresets();
      if (result.success) {
        console.log(`✅ Exported ${result.count} presets`);
        return true;
      } else {
        console.error("❌ Failed to export presets:", result.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error exporting presets:", error);
      return false;
    }
  }, []);

  /**
   * Import presets from a file
   */
  const importPresets = useCallback(async () => {
    try {
      const result = await window.api.importPresets();
      if (result.success) {
        // Reload all presets from file system
        const loadResult = await window.api.loadAllPresets();
        if (loadResult.success && loadResult.presets) {
          dispatch(replaceAllPresets(loadResult.presets));
          console.log(`✅ Imported ${result.count} presets`);
          return true;
        }
      } else {
        console.error("❌ Failed to import presets:", result.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error importing presets:", error);
      return false;
    }
  }, [dispatch]);

  /**
   * Search presets
   */
  const searchPresets = useCallback(
    async (query: string, type?: Preset["type"]) => {
      try {
        const result = await window.api.searchPresets(query, type);
        if (result.success) {
          return result.results || [];
        }
        return [];
      } catch (error) {
        console.error("❌ Error searching presets:", error);
        return [];
      }
    },
    []
  );

  /**
   * Get storage statistics
   */
  const getStorageStats = useCallback(async () => {
    try {
      const result = await window.api.getStorageStats();
      if (result.success) {
        return result.stats;
      }
      return null;
    } catch (error) {
      console.error("❌ Error getting storage stats:", error);
      return null;
    }
  }, []);

  return {
    presets,
    activePreset,
    projectedPreset,
    savePreset,
    updatePreset: updatePresetData,
    deletePreset: deletePresetById,
    deletePresetById, // Add alias for backward compatibility
    exportPresets,
    importPresets,
    searchPresets,
    getStorageStats,
  };
};
