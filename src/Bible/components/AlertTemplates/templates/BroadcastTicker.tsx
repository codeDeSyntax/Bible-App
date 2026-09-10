import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { parseColoredText, stripMarkup, decomposeAlertMarkup, getHarmoniousLabelColor } from "../alertParser";

const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim();

const TextRun = ({ text, bg }: { text: string; bg?: string }) => (
  <span className="broadcast-ticker-text-run" aria-hidden="true">
    {parseColoredText(
      normalizeText(text),
      "#ffffff",
      "'Outfit', sans-serif",
      bg,
    )}
  </span>
);

/** Extract a category from the alert text (e.g. "ANNOUNCEMENT: rest of text") */
const extractCategory = (text: string): { category: string; body: string } => {
  const clean = stripMarkup(text);
  const colonIdx = clean.indexOf(":");
  if (colonIdx > 0 && colonIdx < 32) {
    return {
      category: clean.slice(0, colonIdx).trim().toUpperCase(),
      body: text.slice(text.indexOf(":") + 1).trim(),
    };
  }
  return { category: "WORD", body: text };
};

const extractBroadcastTickerData = (alert: AlertPayload): { category: string; body: string } => {
  const struct = (alert.text && /\{[a-zA-Z0-9#]+\}/.test(alert.text))
    ? { ...alert.structuredData, ...decomposeAlertMarkup(alert.text, alert.alertType || "news") }
    : (alert.structuredData || decomposeAlertMarkup(alert.text, alert.alertType || "news"));
  const alertType = alert.alertType || (struct.headline ? "news" : struct.reference ? "scripture" : "sermon");

  let category = "WORD";
  let body = "";

  if (alertType === "sermon") {
    category = "SERMON";
    const parts: string[] = [];
    if (struct.title) parts.push(`Topic: ${struct.title}`);
    if (struct.scriptures) parts.push(`Scriptures: ${struct.scriptures}`);
    if (struct.speaker) parts.push(`Minister: ${struct.speaker}`);
    if (struct.notes) parts.push(`Key Points: ${struct.notes}`);
    body = parts.join("   •   ");
  } else if (alertType === "news") {
    category = "EVENT";
    const parts: string[] = [];
    if (struct.headline) parts.push(`Event: ${struct.headline}`);
    if (struct.dateTime) parts.push(`Date: ${struct.dateTime}`);
    if (struct.venue) parts.push(`Venue: ${struct.venue}`);
    if (struct.contact) parts.push(`Contact: ${struct.contact}`);
    if (struct.details) parts.push(`${struct.details}`);
    body = parts.join("   •   ");
  } else if (alertType === "scripture") {
    category = "SCRIPTURE";
    const parts: string[] = [];
    if (struct.reference) parts.push(`Scripture: ${struct.reference}`);
    if (struct.verseText) parts.push(`"${struct.verseText}"`);
    if (struct.focus) parts.push(`Theme: ${struct.focus}`);
    body = parts.join("   •   ");
  } else {
    category = "NOTICE";
    body = struct.title ? `${struct.title}   •   ${struct.message || ""}` : struct.message || alert.text;
  }

  if (!body) {
    const fallback = extractCategory(alert.text);
    category = fallback.category;
    body = fallback.body;
  }

  return { category, body };
};

interface BroadcastTickerProps {
  alert: AlertPayload;
}

export const BroadcastTicker: React.FC<BroadcastTickerProps> = ({ alert }) => {
  const { category, body } = useMemo(() => extractBroadcastTickerData(alert), [alert]);
  const accentColor = alert.backgroundColor || "#4c1d95";
  const labelColor = getHarmoniousLabelColor(accentColor, alert.text);
  const isTop = alert.position === "top";

  return (
    <div style={{ display: "contents" }}>
      <style>{`
        @keyframes broadcastTickerScroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .broadcast-ticker-track {
          display: inline-flex;
          align-items: center;
          width: max-content;
          min-width: max-content;
          white-space: nowrap;
          will-change: transform;
          backface-visibility: hidden;
          animation-name: broadcastTickerScroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .broadcast-ticker-text-run {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          padding-right: max(16rem, 18vw);
          font-family: "Outfit", sans-serif !important;
          font-size: 3.2rem;
          font-weight: 600;
          line-height: 1;
          letter-spacing: 0.04em;
          text-shadow: 0 2px 10px rgba(0,0,0,0.6);
          white-space: pre;
        }
        .broadcast-ticker-text-run * {
          font-family: inherit !important;
          letter-spacing: inherit !important;
        }
      `}</style>
      <motion.div
        className="fixed left-0 w-screen pointer-events-none z-50"
        style={{
          top: isTop ? 0 : "auto",
          bottom: isTop ? "auto" : 0,
        }}
        initial={{ opacity: 0, y: isTop ? -40 : 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isTop ? -40 : 40 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="w-full flex items-stretch shadow-2xl relative overflow-hidden"
          style={{
            minHeight: "7.2rem",
            background:
              "linear-gradient(90deg, rgba(15,23,42,0.99) 0%, rgba(10,12,18,0.99) 100%)",
            borderTop: `3.5px solid ${accentColor}`,
            borderBottom: `2.5px solid rgba(0,0,0,0.8)`,
            boxShadow: `0 -4px 25px ${accentColor}33, 0 16px 50px rgba(0,0,0,0.9)`,
          }}
        >
          {/* Top chrome highlight edge */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none z-20"
            style={{
              height: "2px",
              background: `linear-gradient(90deg, #ffffff 0%, ${accentColor} 40%, transparent 80%)`,
            }}
          />

          {/* Left Angled Station Badge */}
          <motion.div
            className="flex-shrink-0 flex items-center gap-3 px-8 relative z-10"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
              minWidth: "16rem",
              clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%)",
              borderTop: "2px solid rgba(255,255,255,0.7)",
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 6px 0 20px rgba(0,0,0,0.5)`,
            }}
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.35, ease: "easeOut" }}
          >
            {/* App Icon */}
            <img
              src="./bibleicon.png"
              alt="Bible Icon"
              className="w-8 h-8 object-contain drop-shadow"
            />

            <span
              style={{
                color: labelColor,
                fontSize: "2.1rem",
                fontWeight: 900,
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                textShadow: `0 2px 10px ${labelColor}55, 0 2px 8px rgba(0,0,0,0.8)`,
              }}
            >
              {category}
            </span>
          </motion.div>

          {/* Scrolling body text — right side */}
          <div
            className="flex-1 overflow-hidden flex items-center relative"
            style={{
              background: `linear-gradient(90deg, rgba(15,23,42,0.98) 0%, rgba(10,12,18,0.99) 100%)`,
              backdropFilter: "blur(12px)",
              paddingLeft: "1.5rem",
            }}
          >
            <div
              className="broadcast-ticker-track"
              style={{
                animationDuration: `${alert.speed || 24}s`,
                transform: "scaleX(1.15)",
                transformOrigin: "left center",
              }}
            >
              <TextRun text={body} bg={accentColor} />
              <TextRun text={body} bg={accentColor} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
