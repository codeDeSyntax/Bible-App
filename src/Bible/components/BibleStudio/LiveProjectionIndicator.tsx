import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, XCircle } from "lucide-react";
import { Tooltip } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface LiveProjectionIndicatorProps {
  isProjectionActive: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

/**
 * Floating Live Projection Indicator
 * Shows when Bible projection is active with option to close
 */
export const LiveProjectionIndicator: React.FC<
  LiveProjectionIndicatorProps
> = ({ isProjectionActive, onClose, isDarkMode }) => {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<{
    dragging: boolean;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, offsetX: 0, offsetY: 0 });
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(
    null
  );

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("liveProjectionIndicatorPos");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.left === "number" && typeof parsed.top === "number") {
          setPos(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const savePos = (p: { left: number; top: number }) => {
    try {
      localStorage.setItem("liveProjectionIndicatorPos", JSON.stringify(p));
    } catch (e) {
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
      left = Math.max(8, Math.min(left, vw - elw - 8));
      top = Math.max(8, Math.min(top, vh - elh - 8));
      setPos({ left, top });
    };

    const onPointerUp = (ev: PointerEvent) => {
      dragStateRef.current.dragging = false;
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch (err) {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (pos) savePos(pos);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const wrapperStyle: React.CSSProperties = pos
    ? { left: pos.left, top: pos.top, position: "fixed", zIndex: 50 }
    : { right: 24, bottom: 24, position: "fixed", zIndex: 50 };

  return (
    <AnimatePresence>
      {isProjectionActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          ref={wrapperRef}
          style={wrapperStyle}
          onPointerDown={onPointerDown}
        >
          <div
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-black shadow backdrop-blur-md border cursor-grab select-none bg-card-bg-alt"
            // style={{
            //   background: isDarkMode
            //     ? "linear-gradient(135deg, #040404 0%, #060606 100%)"
            //     : "linear-gradient(135deg, #040404 0%, #040404 100%)",
            //   borderColor: isDarkMode
            //     ? "rgba(255,255,255,0.1)"
            //     : "rgba(255,255,255,0.3)",
            // }}
          >
            <div
              className="relative bg-white h-6 w-6 flex items-center justify-center rounded-full"
              aria-hidden
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
             
            </div>

            <span className="text-black dark:text-white text-sm font-bold tracking-wider uppercase">
              Live
            </span>

            <div
              className="relative flex items-center justify-center"
              aria-hidden
            >
              <div className="w-2 h-2 bg-card-bg-alt rounded-full animate-pulse" />
              <div className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
            </div>

            <div className="h-5 w-px bg-white/30 mx-1" />

            <Tooltip title="Close Bible projection" placement="top">
              <div
                data-no-drag
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/20 transition-all duration-200 group"
              >
                <CloseOutlined className="w-4 h-4 text-black dark:text-white group-hover:text-white transition-colors" />
              </div>
            </Tooltip>
          </div>

          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-4 blur-xl rounded-full opacity-60 pointer-events-none"
            style={{
              background: isDarkMode
                ? "radial-gradient(ellipse, #dc2626, transparent)"
                : "radial-gradient(ellipse, #ef4444, transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
