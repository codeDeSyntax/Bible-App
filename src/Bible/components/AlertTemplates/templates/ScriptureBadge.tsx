import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { stripMarkup, parseColoredText } from "../alertParser";

/**
 * Splits the alert text into a reference (e.g. "John 3:16") and body text.
 */
const parseScriptureText = (text: string) => {
  const clean = stripMarkup(text);

  // Match "Book Chapter:Verse" or "Book Chapter:Verse-Verse" at start
  const refMatch = clean.match(
    /^((?:[1-3]\s*)?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+(?::\d+(?:-\d+)?)?)\s*[-—•:]\s*(.*)/s,
  );
  if (refMatch) {
    const rawRef = refMatch[1].trim();
    // Locate where the body starts in original text (with potential markup)
    const afterRef = text.slice(text.indexOf(rawRef) + rawRef.length).replace(/^[\s\-—•:]+/, "");
    return { reference: rawRef, body: afterRef };
  }

  // Colon split
  const colonIdx = clean.indexOf(":");
  if (colonIdx > 2 && colonIdx < 40) {
    return {
      reference: clean.slice(0, colonIdx).trim(),
      body: text.slice(text.indexOf(":") + 1).trim(),
    };
  }

  return { reference: "", body: text };
};

interface ScriptureBadgeProps {
  alert: AlertPayload;
}

export const ScriptureBadge: React.FC<ScriptureBadgeProps> = ({ alert }) => {
  const { reference, body } = useMemo(() => parseScriptureText(alert.text), [alert.text]);
  const accentColor = alert.backgroundColor || "#b91c1c";
  const isTop = alert.position === "top";

  return (
    <motion.div
      className="fixed left-0 w-screen pointer-events-none z-50 flex items-center justify-center"
      style={{
        top: isTop ? "4vh" : "auto",
        bottom: isTop ? "auto" : "4vh",
        paddingLeft: "3vw",
        paddingRight: "3vw",
      }}
      initial={{ opacity: 0, y: isTop ? -50 : 50, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isTop ? -50 : 50, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex items-center" style={{ maxWidth: "92vw", minWidth: "50vw" }}>
        {/* 1. Circular 3D Medallion on Left (Inspired by Image 2 TV Channel Medallion) */}
        <motion.div
          className="relative flex-shrink-0 flex items-center justify-center z-20"
          style={{
            width: "9.5rem",
            height: "9.5rem",
            borderRadius: "50%",
            marginRight: "-2.8rem",
            background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 30%, #64748b 70%, #334155 100%)",
            padding: "5px",
            boxShadow: `0 14px 40px rgba(0,0,0,0.85), 0 0 35px ${accentColor}66, inset 0 2px 4px rgba(255,255,255,0.9)`,
          }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Inner Metallic Bezel Ring */}
          <div
            className="w-full h-full rounded-full flex flex-col items-center justify-center text-center relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${accentColor} 0%, #1e1b4b 65%, #09090b 100%)`,
              boxShadow: "inset 0 4px 12px rgba(255,255,255,0.45), inset 0 -6px 14px rgba(0,0,0,0.85)",
              border: "2px solid rgba(255,255,255,0.35)",
            }}
          >
            {/* Glossy radial shine */}
            <div
              className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)",
              }}
            />

            {/* Official App Icon */}
            <img
              src="./bibleicon.png"
              alt="Bible Icon"
              className="relative z-10 object-contain"
              style={{
                width: "5.6rem",
                height: "5.6rem",
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.7))",
              }}
            />
          </div>
        </motion.div>

        {/* 2. Main Angular Broadcast Bar */}
        <div
          className="relative flex-1 flex flex-col justify-center shadow-2xl"
          style={{
            paddingLeft: "4.5rem",
            paddingRight: "3.5rem",
            paddingTop: "1.6rem",
            paddingBottom: "1.6rem",
            background:
              "linear-gradient(90deg, rgba(15,23,42,0.98) 0%, rgba(20,25,35,0.97) 50%, rgba(10,12,18,0.99) 100%)",
            backdropFilter: "blur(20px)",
            clipPath: "polygon(0 0, calc(100% - 36px) 0, 100% 100%, 0 100%)",
            borderTop: `3.5px solid ${accentColor}`,
            borderBottom: `2px solid ${accentColor}88`,
            boxShadow: `0 16px 50px rgba(0,0,0,0.9), 0 0 40px ${accentColor}33`,
          }}
        >
          {/* Top chrome accent rail */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, #ffffff 20%, ${accentColor} 60%, transparent 100%)`,
            }}
          />

          {/* Angled Reference Ribbon Badge (Image 2 style) */}
          {reference && (
            <div className="flex items-center mb-2">
              <div
                className="flex items-center px-6 py-1.5 shadow-lg"
                style={{
                  clipPath: "polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
                  background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}ee 100%)`,
                  borderTop: "2px solid rgba(255,255,255,0.7)",
                  boxShadow: `0 4px 16px ${accentColor}66`,
                }}
              >
                <span
                  className="font-black uppercase tracking-wider"
                  style={{
                    fontSize: "2.2rem",
                    color: "#ffffff",
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.1em",
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {reference}
                </span>
              </div>
            </div>
          )}

          {/* Scripture Body Text */}
          {body && (
            <div
              className="font-semibold"
              style={{
                fontSize: "3.2rem",
                color: "#ffffff",
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.35,
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "normal",
                hyphens: "none",
                textShadow: "0 2px 14px rgba(0,0,0,0.85)",
              }}
            >
              {parseColoredText(body, "#ffffff", "'Outfit', sans-serif", accentColor)}
            </div>
          )}

          {/* Bottom chrome accent rail */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${accentColor} 40%, #ffffff 80%, transparent 100%)`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
