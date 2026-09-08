import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { splitAlertContent, parseColoredText, stripMarkup } from "../alertParser";

interface ChevronLowerThirdProps {
  alert: AlertPayload;
}

export const ChevronLowerThird: React.FC<ChevronLowerThirdProps> = ({ alert }) => {
  const { headline, body } = useMemo(() => splitAlertContent(alert.text), [alert.text]);
  const accentColor = alert.backgroundColor || "#1d4ed8";
  const isTop = alert.position === "top";

  return (
    <motion.div
      className="fixed left-0 w-screen pointer-events-none z-50 flex"
      style={{ top: isTop ? 0 : "auto", bottom: isTop ? "auto" : 0 }}
      initial={{ opacity: 0, y: isTop ? -60 : 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: isTop ? -60 : 60 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="w-full flex items-stretch shadow-2xl relative overflow-hidden"
        style={{
          minHeight: "9rem",
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.99) 0%, rgba(20,27,45,0.98) 35%, rgba(10,12,18,0.99) 100%)",
          backdropFilter: "blur(20px)",
          borderTop: `3.5px solid ${accentColor}`,
          borderBottom: `2.5px solid rgba(0,0,0,0.7)`,
          boxShadow: `0 -4px 30px ${accentColor}44, 0 16px 50px rgba(0,0,0,0.9)`,
        }}
      >
        {/* Top chrome/metallic highlight rail */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-20"
          style={{
            height: "2px",
            background: `linear-gradient(90deg, #ffffff 0%, ${accentColor} 30%, transparent 80%)`,
          }}
        />

        {/* 1. Left Multi-Layered Chevron Graphics Stack */}
        <div className="relative flex-shrink-0 flex items-stretch" style={{ width: "7.5rem" }}>
          {/* Base Chevron Wing 1 */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}bb 100%)`,
              clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
            }}
          />

          {/* Chrome Bevel Trim Layer */}
          <div
            className="absolute inset-0 z-11 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 60%)",
              clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
            }}
          />

          {/* Inner Glowing Chevron Wing 2 */}
          <div
            className="absolute top-0 bottom-0 left-3 z-12"
            style={{
              width: "4.5rem",
              background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(226,232,240,0.7) 100%)",
              clipPath: "polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%)",
              boxShadow: "inset 0 1px 3px rgba(255,255,255,0.8)",
            }}
          />

          {/* Sacred Cross / Dove Emblem on Left Chevron */}
          <div className="absolute inset-0 z-13 flex items-center justify-center pl-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
              <path d="M12 3v18M6 8h12" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 2. Main Content Plate */}
        <motion.div
          className="flex flex-col justify-center px-8 py-4 flex-1 relative z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: "easeOut" }}
        >
          {/* Headline Text in Cinzel */}
          <div
            className="font-black uppercase tracking-wider leading-tight"
            style={{
              fontSize: "3.5rem",
              color: "#ffffff",
              textShadow: "0 3px 14px rgba(0,0,0,0.9)",
              fontFamily: "'Cinzel', 'EB Garamond', 'Georgia', serif",
              letterSpacing: "0.05em",
              whiteSpace: "normal",
              wordBreak: "normal",
              overflowWrap: "normal",
              hyphens: "none",
            }}
          >
            {parseColoredText(headline, "#ffffff", "'Cinzel', 'EB Garamond', 'Georgia', serif", accentColor)}
          </div>

          {/* Body Text in Outfit semibold */}
          {body && (
            <motion.div
              className="mt-2 font-semibold tracking-wide"
              style={{
                fontSize: "2.4rem",
                color: "rgba(255,255,255,0.94)",
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.35,
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "normal",
                hyphens: "none",
                textShadow: "0 2px 10px rgba(0,0,0,0.7)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {parseColoredText(body, "rgba(255,255,255,0.94)", "'Outfit', sans-serif", accentColor)}
            </motion.div>
          )}
        </motion.div>

        {/* 3. Right Symmetrical Chevron End-Cap */}
        <div className="relative flex-shrink-0 flex items-stretch" style={{ width: "3.5rem" }}>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}88 100%)`,
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 50% 50%)",
            }}
          />
        </div>

        {/* Bottom edge highlight rail */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
          style={{
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, #ffffff 90%, transparent 100%)`,
          }}
        />
      </div>
    </motion.div>
  );
};
