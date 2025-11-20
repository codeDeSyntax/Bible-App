import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import { Preset } from "@/store/slices/appSlice";
import BiblePresentationDisplay from "./BiblePresentationDisplay";
import ScripturePresentation from "./presentations/ScripturePresentation";
import ImagePresentation from "./presentations/ImagePresentation";
import TextPresentation from "./presentations/TextPresentation";
import DefaultPresentation from "./presentations/DefaultPresentation";
import PromiseWordCloudPresentation from "./presentations/PromiseWordCloudPresentation";
import { SermonPresentation } from "./presentations/SermonPresentation";

const UniversalPresentationDisplay: React.FC = () => {
  const [presetId, setPresetId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"preset" | "scripture">(
    "preset"
  );
  const [scriptureData, setScriptureData] = useState<any>(null);
  const [isRehydrated, setIsRehydrated] = useState(false);
  const [inlinePreset, setInlinePreset] = useState<any>(null); // Store preset data passed via IPC
  const presets = useAppSelector((state) => state.app.presets);

  // Wait for redux-persist to rehydrate
  useEffect(() => {
    // Check if _persist is defined and rehydrated
    const checkRehydration = () => {
      const persistState = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
      // Simple check: if we have some presets or after a short delay, assume rehydrated
      const timer = setTimeout(() => {
        setIsRehydrated(true);
        console.log("📺 Redux rehydrated, presets available:", presets.length);
      }, 500); // Give redux-persist time to rehydrate

      return () => clearTimeout(timer);
    };

    checkRehydration();
  }, [presets.length]);

  // Listen for localStorage changes from other windows
  useEffect(() => {
    let lastPresetCount = presets.length;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "persist:app" && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          const appState = JSON.parse(newState.app || "{}");
          const newPresets = appState.presets || [];

          // Only reload if the number of presets increased (new preset added)
          if (newPresets.length > lastPresetCount) {
            console.log("📦 New preset detected, reloading to sync...");
            lastPresetCount = newPresets.length;
            window.location.reload();
          }
        } catch (err) {
          console.error("Failed to parse localStorage change:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [presets.length]);

  useEffect(() => {
    // Get preset ID from URL hash (after the #)
    const hash = window.location.hash;
    console.log("📺 Full hash:", hash);

    // Parse: #/universal-display?presetId=xxx&data=xxx
    const match = hash.match(/presetId=([^&]+)/);
    const dataMatch = hash.match(/data=([^&]+)/);

    if (match && match[1]) {
      const id = match[1];
      setPresetId(id);
      setDisplayMode("preset");
      console.log("📺 Universal Display - Loading preset ID:", id);

      // Check if preset data was passed in URL
      if (dataMatch && dataMatch[1]) {
        try {
          const decodedData = decodeURIComponent(dataMatch[1]);
          const presetData = JSON.parse(decodedData);
          console.log("📦 Preset data found in URL:", presetData);
          setInlinePreset({ id, data: presetData });
        } catch (error) {
          console.error("Failed to parse preset data from URL:", error);
        }
      }
    } else {
      // No preset ID in URL - likely opening for scripture from floating action bar
      // Start in scripture mode and wait for IPC message
      console.log(
        "⏳ Universal Display - No preset ID, starting in scripture mode..."
      );
      setDisplayMode("scripture");
    }
  }, []);

  // Listen for IPC messages to switch between presets dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && window.ipcRenderer) {
      console.log(
        "📡 UniversalPresentation: Setting up IPC listener for dynamic switching"
      );

      const handleUpdate = (event: any, data: any) => {
        console.log("📡 UniversalPresentation: Received IPC update:", data);

        if (data.type === "preset-switch") {
          // Switch to a different preset without reloading
          console.log("🔄 Switching to preset:", data.presetId);

          // Update the URL hash to match the new preset ID
          window.location.hash = `/universal-display?presetId=${data.presetId}`;

          // Check if preset already exists in store
          const presetExists = presets.find((p) => p.id === data.presetId);

          if (presetExists) {
            // Preset exists - switch immediately
            console.log("✅ Preset found in store, switching immediately");
            setPresetId(data.presetId);
            setDisplayMode("preset");
            setInlinePreset(null); // Clear inline preset
          } else {
            // Preset not found - check if preset data was passed inline
            if (data.presetData) {
              console.log("✅ Using inline preset data from IPC");
              // Construct full preset object from the data
              const fullPreset = {
                id: data.presetId,
                type: data.presetType || "text",
                name: data.presetName || "Preset",
                data: data.presetData,
                createdAt: Date.now(),
              };
              setInlinePreset(fullPreset);
              setPresetId(data.presetId);
              setDisplayMode("preset");
            } else {
              // No inline data - wait for redux-persist sync
              console.log(
                "⏳ Preset not found, waiting for redux-persist sync..."
              );
              setIsRehydrated(false);

              // Small delay to allow redux-persist to sync
              setTimeout(() => {
                setPresetId(data.presetId);
                setDisplayMode("preset");
                setIsRehydrated(true);
                setInlinePreset(null);
                console.log(
                  "✅ Preset switch complete after sync, ID:",
                  data.presetId
                );
              }, 800); // Increased time for localStorage to sync
            }
          }
        } else if (data.type === "scripture-mode") {
          // Switch to scripture mode
          console.log("📖 Switching to scripture mode");
          setDisplayMode("scripture");
          setScriptureData({
            presentationData: data.presentationData,
            settings: data.settings,
          });
        }
      };

      window.ipcRenderer.on("bible-presentation-update", handleUpdate);

      return () => {
        window.ipcRenderer.off("bible-presentation-update", handleUpdate);
      };
    } else {
      console.warn("⚠️ UniversalPresentation: No IPC listener available");
    }
  }, [presets]); // Add presets as dependency so we can check if preset exists

  // If in scripture mode, show BiblePresentationDisplay
  if (displayMode === "scripture") {
    console.log(
      "📖 Rendering BiblePresentationDisplay with data:",
      scriptureData
    );
    return <BiblePresentationDisplay />;
  }

  // Find the preset - use inline preset if available, otherwise search in store
  const preset = inlinePreset || presets.find((p) => p.id === presetId);

  //   console.log("📺 Display mode:", displayMode);
  //   console.log("📺 Looking for preset:", presetId);
  //   console.log("📺 Available presets:", presets.length);
  //   console.log(
  //     "📺 Preset IDs in store:",
  //     presets.map((p) => p.id)
  //   );
  //   console.log("📺 Found preset:", preset?.name);
  //   console.log("📺 Using inline preset:", !!inlinePreset);
  //   console.log("📺 Inline preset data:", inlinePreset);
  //   console.log("📺 Is rehydrated:", isRehydrated);

  // Show loading state while waiting for IPC message or rehydration
  if (!isRehydrated || (displayMode === "preset" && !presetId)) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="mb-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold">
            {!isRehydrated ? "Loading presets..." : "Waiting for content..."}
          </h1>
        </div>
      </div>
    );
  }

  if (displayMode === "preset" && (!preset || !presetId)) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center max-w-4xl px-8">
          <h1 className="text-4xl font-bold mb-4">No Preset Selected</h1>
          <p className="text-xl opacity-70 mb-4">
            {!presetId
              ? "No preset ID provided"
              : `Preset not found: ${presetId}`}
          </p>
          <div className="text-sm opacity-50 space-y-2">
            <p>Hash: {window.location.hash}</p>
            <p>Preset ID: {presetId || "None"}</p>
            <p>Display Mode: {displayMode}</p>
            <p>Available Presets: {presets.length}</p>
            <p className="text-xs mt-4">
              Preset IDs: {presets.map((p) => p.id).join(", ") || "No presets"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render based on preset type (only when preset exists)
  if (displayMode === "preset" && preset) {
    switch (preset.type) {
      case "scripture":
        return <ScripturePresentation preset={preset} />;
      case "image":
        return <ImagePresentation preset={preset} />;
      case "text":
        return <TextPresentation preset={preset} />;
      case "default":
        return <DefaultPresentation preset={preset} />;
      case "promise":
        return <PromiseWordCloudPresentation preset={preset} />;
      case "sermon":
        return (
          <SermonPresentation
            title={preset.data.title || ""}
            subtitle={preset.data.subtitle}
            preacher={preset.data.preacher || ""}
            date={preset.data.date || ""}
            scriptures={preset.data.scriptures}
            quotes={preset.data.quotes}
          />
        );
      default:
        return (
          <div className="w-full h-screen flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Unknown Preset Type</h1>
              <p className="text-xl opacity-70">Type: {preset.type}</p>
            </div>
          </div>
        );
    }
  }

  // Shouldn't reach here but fallback
  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    </div>
  );
};

export default UniversalPresentationDisplay;
