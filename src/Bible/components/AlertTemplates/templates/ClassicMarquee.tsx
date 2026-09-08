import React from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { parseColoredText } from "../alertParser";

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const TextRun = ({ text, bg }: { text: string; bg?: string }) => (
  <span className="marquee-classic-text-run" aria-hidden="true">
    {parseColoredText(normalizeText(text), "#ffffff", "'Outfit', sans-serif", bg)}
  </span>
);

interface ClassicMarqueeProps {
  alert: AlertPayload;
}

export const ClassicMarquee: React.FC<ClassicMarqueeProps> = ({ alert }) => {
  const accentColor = alert.backgroundColor || "#4c1d95";
  const isTop = (alert.position || "bottom") === "top";

  return (
    <div style={{ display: "contents" }}>
      <style>{`
        @keyframes classicMarqueeScroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .marquee-classic-viewport {
          width: 86vw;
          max-width: 86vw;
          margin: 0 auto;
          overflow: hidden;
          contain: layout paint;
          mask-image: linear-gradient(90deg, transparent 0%, black 2.5%, black 97.5%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 2.5%, black 97.5%, transparent 100%);
          transform: scaleX(1.18);
          transform-origin: center center;
        }
        .marquee-classic-track {
          display: inline-flex;
          align-items: center;
          width: max-content;
          min-width: max-content;
          white-space: nowrap;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          animation-name: classicMarqueeScroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .marquee-classic-text-run {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          padding-right: max(16rem, 18vw);
          font-family: 'Outfit', sans-serif !important;
          font-size: 3.3rem;
          font-weight: 600;
          line-height: 1;
          letter-spacing: 0.05em;
          text-shadow: 0 2px 12px rgba(0,0,0,0.75);
          white-space: pre;
        }
        .marquee-classic-text-run * {
          font-family: inherit !important;
          letter-spacing: inherit !important;
        }
      `}</style>
      <motion.div
        className="fixed left-0 w-screen flex pointer-events-none z-50"
        style={{
          top: isTop ? 0 : "auto",
          bottom: isTop ? "auto" : 0,
        }}
        initial={{ opacity: 0, y: isTop ? -30 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isTop ? -30 : 30 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div
          className="w-full pointer-events-auto flex items-center overflow-hidden shadow-2xl relative"
          style={{
            minHeight: "7rem",
            background: `linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 48%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.45) 100%), linear-gradient(90deg, ${accentColor} 0%, ${accentColor}ee 50%, ${accentColor} 100%)`,
            borderTop: "3.5px solid rgba(255,255,255,0.85)",
            borderBottom: "2.5px solid rgba(0,0,0,0.7)",
            boxShadow: `0 -4px 25px ${accentColor}44, 0 16px 50px rgba(0,0,0,0.9)`,
            padding: "8px 0",
          }}
        >
          {/* Top chrome highlight rail */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none z-10"
            style={{
              height: "2px",
              background: "linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)",
            }}
          />

          <div className="marquee-classic-viewport">
            <div
              className="marquee-classic-track"
              style={{ animationDuration: `${alert.speed || 24}s` }}
            >
              <TextRun text={alert.text} bg={accentColor} />
              <TextRun text={alert.text} bg={accentColor} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
