import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv, GripVertical, Radio } from "lucide-react";
import { Tooltip } from "antd";

interface LiveProjectionIndicatorProps {
  isProjectionActive: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  currentBook?: string;
  currentChapter?: number;
  currentVerse?: number | null;
  currentTranslation?: string;
}

/**
 * Sleek Aerospace Floating Live Projection Indicator
 * Ultra-premium glassmorphic draggable floating monitor showing live projection output & active scripture
 */
export const LiveProjectionIndicator: React.FC<LiveProjectionIndicatorProps> = ({
  isProjectionActive,
  onClose,
  isDarkMode,
  currentBook,
  currentChapter,
  currentVerse,
  currentTranslation = "KJV",
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    dragging: boolean;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, offsetX: 0, offsetY: 0 });
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("liveProjectionIndicatorPos");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.left === "number" && typeof parsed.top === "number") {
          setPos(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const savePos = (p: { left: number; top: number }) => {
    try {
      localStorage.setItem("liveProjectionIndicatorPos", JSON.stringify(p));
    } catch {
      // ignore
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest("[data-no-drag]")) return;
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStateRef.current.dragging = true;
    dragStateRef.current.offsetX = e.clientX - rect.left;
    dragStateRef.current.offsetY = e.clientY - rect.top;
    (e.target as Element).setPointerCapture?.(e.pointerId);

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragStateRef.current.dragging) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const elw = rect.width;
      const elh = rect.height;
      let left = ev.clientX - dragStateRef.current.offsetX;
      let top = ev.clientY - dragStateRef.current.offsetY;
      left = Math.max(12, Math.min(left, vw - elw - 12));
      top = Math.max(12, Math.min(top, vh - elh - 12));
      setPos({ left, top });
    };

    const onPointerUp = (ev: PointerEvent) => {
      dragStateRef.current.dragging = false;
      try {
        (e.target as Element).releasePointerCapture?.(ev.pointerId);
      } catch {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (pos) savePos(pos);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const wrapperStyle: React.CSSProperties = pos
    ? { left: pos.left, top: pos.top, position: "fixed", zIndex: 60 }
    : { right: 28, bottom: 28, position: "fixed", zIndex: 60 };

  const hasReference = currentBook && currentChapter;

  return (
    <AnimatePresence>
      {isProjectionActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          ref={wrapperRef}
          style={wrapperStyle}
          onPointerDown={onPointerDown}
          className="cursor-grab active:cursor-grabbing select-none group touch-none"
        >
          {/* Main 3D Sculpted Physical Floating Capsule */}
          <div
            className="relative flex items-center pl-3 pr-2 py-2 rounded-full text-text-primary border-0 gap-2.5 transition-transform"
            style={{
              background: isDarkMode
                ? "linear-gradient(180deg, #2d2d32 0%, #1c1c20 100%)"
                : "linear-gradient(180deg, #ffffff 0%, #f0f0f4 100%)",
              boxShadow: isDarkMode
                ? "0 4px 0 0 #0f0f12, 0 5px 2px 0 rgba(0,0,0,0.8), 0 14px 28px -2px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)"
                : "0 4px 0 0 #d1d1d6, 0 5px 2px 0 rgba(0,0,0,0.1), 0 12px 24px -3px rgba(0, 0, 0, 0.22), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)",
            }}
          >
            {/* Drag Handle Grip Dots */}
            <div className="flex items-center text-text-secondary/60 group-hover:text-text-primary transition-colors -mr-1">
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Live Indicator Icon (3D Raised Lemon Green Coin) */}
            <Tooltip title="Live Presentation Active" placement="top">
              <div
                className="relative w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                style={{
                  background:
                    "linear-gradient(180deg, #bef264 0%, #a3e635 100%)",
                  boxShadow:
                    "0 2px 0 0 #65a30d, 0 3px 6px rgba(163, 230, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                }}
              >
                <Tv className="w-3.5 h-3.5 text-lime-950 stroke-[2.4]" />
              </div>
            </Tooltip>

            {/* Active Projected Scripture Reference or Live Indicator Label */}
            <div className="flex items-center gap-1.5 min-w-0 pr-0.5">
              {hasReference ? (
                <>
                  <span className="text-[0.72rem] font-bold text-text-primary tracking-tight whitespace-nowrap">
                    {currentBook} {currentChapter}
                    {currentVerse ? `:${currentVerse}` : ""}
                  </span>
                  <span
                    className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border-0"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(180deg, rgba(190, 242, 100, 0.18) 0%, rgba(163, 230, 53, 0.1) 100%)"
                        : "linear-gradient(180deg, #f7fee7 0%, #ecfccb 100%)",
                      color: isDarkMode ? "#bef264" : "#3f6212",
                      boxShadow: isDarkMode
                        ? "0 1px 0 0 #0d0d0f, inset 0 1px 0 rgba(190, 242, 100, 0.3)"
                        : "0 1px 0 0 #d9f99d, inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {currentTranslation}
                  </span>
                </>
              ) : (
                <span className="text-[0.7rem] font-bold text-text-primary tracking-tight whitespace-nowrap">
                  Projecting Live
                </span>
              )}
            </div>

            {/* Subtle Divider */}
            <span className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-700" />

            {/* Close / Stop Presentation Button (3D Raised Micro Button) */}
            <Tooltip title="Stop Live Presentation" placement="top">
              <button
                type="button"
                data-no-drag
                onClick={onClose}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-text-secondary dark:text-text-primary transition-all duration-150 cursor-pointer border-0 active:translate-y-0.5 active:shadow-none"
                style={{
                  background: isDarkMode
                    ? "linear-gradient(180deg, #26262a 0%, #18181b 100%)"
                    : "linear-gradient(180deg, #f4f4f6 0%, #e6e6ea 100%)",
                  boxShadow: isDarkMode
                    ? "0 1.5px 0 0 #0d0d0f, 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "0 1.5px 0 0 #d1d1d6, 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                <X className="w-3 h-3 stroke-[2.4]" />
              </button>
            </Tooltip>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

