import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv } from "lucide-react";
import { Tooltip } from "antd";

interface LiveProjectionIndicatorProps {
  isProjectionActive: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

/**
 * Sleek Floating Live Projection Indicator
 * Premium glassmorphic draggable floating pill indicating live projection output
 */
export const LiveProjectionIndicator: React.FC<LiveProjectionIndicatorProps> = ({
  isProjectionActive,
  onClose,
  isDarkMode,
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
    : { right: 24, bottom: 24, position: "fixed", zIndex: 60 };

  return (
    <AnimatePresence>
      {isProjectionActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          ref={wrapperRef}
          style={wrapperStyle}
          onPointerDown={onPointerDown}
          className="cursor-grab active:cursor-grabbing select-none group"
        >
          {/* Ambient Vibrant Theme Glow */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-3 blur-md rounded-full pointer-events-none opacity-60"
            style={{ backgroundColor: "var(--btn-active-from)" }}
          />

          {/* Main Floating Pill */}
          <div className="relative flex items-center pl-3 pr-1.5 py-1.5 rounded-full bg-card-bg text-text-primary backdrop-blur-xl border border-select-border shadow-lg ring-2 ring-[var(--btn-active-from)] gap-2">
            {/* Live Indicator Beacon */}
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                style={{ backgroundColor: "var(--btn-active-from)" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2 shadow-sm"
                style={{
                  backgroundColor: "var(--btn-active-from)",
                  boxShadow: "0 0 10px var(--btn-active-from)",
                }}
              />
            </div>

            {/* Live Label & TV Icon */}
            <div className="flex items-center gap-1.5">
              <Tv
                className="w-3.5 h-3.5"
                style={{ color: "var(--btn-active-from)" }}
              />
              <span className="text-[0.68rem] font-extrabold tracking-wider text-text-primary uppercase leading-none">
                Presenting
              </span>
            </div>

            {/* Subtle Divider */}
            <span className="w-px h-3.5 bg-select-border ml-0.5" />

            {/* Close / Stop Button */}
            <Tooltip title="Stop Presentation" placement="top">
              <button
                type="button"
                data-no-drag
                onClick={onClose}
                className="w-5 h-5 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-select-hover transition-all cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Tooltip>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
