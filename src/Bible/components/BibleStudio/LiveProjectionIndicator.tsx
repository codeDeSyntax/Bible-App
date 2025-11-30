import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, XCircle } from "lucide-react";
import { Tooltip } from "antd";

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
  return (
    <AnimatePresence>
      {isProjectionActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-black shadow backdrop-blur-md border"
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, #040404 0%, #060606 100%)"
                : "linear-gradient(135deg, #040404 0%, #040404 100%)",
              // boxShadow: isDarkMode
              //   ? "0 8px 24px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)"
              //   : "0 8px 24px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
              borderColor: isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Animated Radio Icon with Glow */}
            <div className="relative">
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <div
                className="absolute inset-0 bg-red-500 rounded-full blur-md animate-pulse"
                style={{ opacity: 0.5 }}
              />
            </div>

            {/* Live Text */}
            <span className="text-white text-base font-bold tracking-wider uppercase select-none">
              Live
            </span>

            {/* Pulsing Dot */}
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-white/30 mx-1" />

            {/* Close Button */}
            <Tooltip title="Close Bible projection" placement="top">
              <div
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/20 transition-all duration-200 group"
              >
                <XCircle className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
              </div>
            </Tooltip>
          </div>

          {/* Subtle Bottom Glow */}
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-4 blur-xl rounded-full opacity-60"
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
