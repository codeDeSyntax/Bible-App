import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Loader2, Sparkles, Clock } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store";
import { clearBackgroundGeneration } from "../store/slices/generationSlice";
import { usePresets } from "../hooks/usePresets";
import { v4 as uuidv4 } from "uuid";

/** Seconds before the result is auto-saved if the user does nothing. */
const AUTO_SAVE_SECONDS = 30;

/**
 * Global floating tracker that appears whenever a background AI generation
 * is in progress or has completed after the flyer modal was closed.
 *
 * - While generating: shows a compact spinner pill.
 * - On completion: expands to show a thumbnail + Save / Remove.
 * - If the user ignores it for AUTO_SAVE_SECONDS, it auto-saves.
 * - On failure: shows error briefly then disappears.
 */
export const GenerationTracker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status, payload, imageUrl, error } = useAppSelector(
    (s) => s.generation,
  );
  const { savePreset } = usePresets();

  const [countdown, setCountdown] = useState(AUTO_SAVE_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSavedRef = useRef(false);

  // ── Auto-save countdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "completed" || !imageUrl) {
      setCountdown(AUTO_SAVE_SECONDS);
      autoSavedRef.current = false;
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    setCountdown(AUTO_SAVE_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status, imageUrl]);

  // When countdown reaches 0, auto-save
  useEffect(() => {
    if (countdown === 0 && status === "completed" && !autoSavedRef.current) {
      autoSavedRef.current = true;
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, status]);

  // ── Auto-dismiss errors after 5s ─────────────────────────────────────────
  useEffect(() => {
    if (status !== "failed") return;
    const t = setTimeout(() => dispatch(clearBackgroundGeneration()), 5000);
    return () => clearTimeout(t);
  }, [status, dispatch]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!imageUrl || !payload) return;
    const newPreset = {
      id: uuidv4(),
      type: "flyer" as const,
      name: payload.name,
      data: {
        images: [imageUrl],
        text: payload.name,
        reference: payload.reference || "",
      },
      createdAt: Date.now(),
    };
    await savePreset(newPreset);
    dispatch(clearBackgroundGeneration());
  }, [imageUrl, payload, savePreset, dispatch]);

  const handleRemove = useCallback(() => {
    dispatch(clearBackgroundGeneration());
  }, [dispatch]);

  // ── Don't render when idle ───────────────────────────────────────────────
  if (status === "idle") return null;

  const tracker = (
    <AnimatePresence>
      <motion.div
        key="gen-tracker"
        className="fixed bottom-6 right-6 z-[9999]"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.9 }}
        transition={{ type: "spring", damping: 26, stiffness: 340 }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--select-hover)",
            border: "1px solid rgba(128,128,128,0.15)",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 280,
            maxWidth: 360,
          }}
        >
          {/* ── Generating state ── */}
          {status === "generating" && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--header-gradient-from), var(--header-gradient-to))",
                }}
              >
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.76rem] font-semibold text-text-primary leading-tight truncate">
                  {payload?.name || "AI Slide"}
                </p>
                <p className="text-[0.64rem] text-text-secondary/60 mt-0.5 leading-none">
                  Generating in background…
                </p>
              </div>
            </div>
          )}

          {/* ── Completed state ── */}
          {status === "completed" && imageUrl && (
            <>
              {/* Thumbnail */}
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "16 / 9" }}
              >
                <img
                  src={imageUrl}
                  alt="Generated slide"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Auto-save countdown badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                  <Clock size={10} className="text-white/70" />
                  <span className="text-[0.60rem] text-white/80 font-medium tabular-nums">
                    Auto-save in {countdown}s
                  </span>
                </div>
              </div>

              {/* Info + actions */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles
                    size={13}
                    className="text-text-secondary/50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.74rem] font-semibold text-text-primary leading-tight truncate">
                      {payload?.name || "AI Slide"}
                    </p>
                    <p className="text-[0.62rem] text-text-secondary/55 mt-0.5 leading-none">
                      Generation complete — save or discard?
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleRemove}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[0.72rem] font-medium rounded-xl transition-all cursor-pointer text-text-secondary hover:text-text-primary"
                    style={{
                      background: "rgba(128,128,128,0.08)",
                      border: "1px solid rgba(128,128,128,0.12)",
                    }}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[0.72rem] font-semibold rounded-xl transition-all cursor-pointer text-white hover:brightness-110"
                    style={{
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                    }}
                  >
                    <Save size={12} />
                    Save Preset
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Failed state ── */}
          {status === "failed" && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/15">
                <Sparkles className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.74rem] font-semibold text-text-primary leading-tight">
                  Generation failed
                </p>
                <p className="text-[0.62rem] text-red-400/80 mt-0.5 leading-none truncate">
                  {error || "Unknown error"}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(tracker, document.body);
};
