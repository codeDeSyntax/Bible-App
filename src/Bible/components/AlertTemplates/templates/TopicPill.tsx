import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import {
  stripMarkup,
  parseColoredText,
  decomposeAlertMarkup,
  getHarmoniousLabelColor,
  extractFieldLabelColor,
} from "../alertParser";

interface TopicPillProps {
  alert: AlertPayload;
}

interface MetadataChip {
  label: string;
  value: string;
  labelColor?: string;
}

interface TopicPillContent {
  label: string;
  headline: string;
  chips: MetadataChip[];
  fallbackBody?: string;
}

const extractTopicPillData = (alert: AlertPayload, defaultLabelColor: string): TopicPillContent => {
  const struct = (alert.text && /\{[a-zA-Z0-9#]+\}/.test(alert.text))
    ? { ...alert.structuredData, ...decomposeAlertMarkup(alert.text, alert.alertType || "sermon") }
    : (alert.structuredData || decomposeAlertMarkup(alert.text, alert.alertType || "sermon"));
  const alertType = alert.alertType || (struct.headline ? "news" : struct.reference ? "scripture" : "sermon");

  let label = "TOPIC", headline = "";
  const chips: MetadataChip[] = [];

  if (alertType === "sermon") {
    label = "TOPIC";
    headline = (struct.title || "").replace(/^topic:\s*/i, "").trim();
    if (struct.scriptures) chips.push({
      label: "SCRIPTURES", value: struct.scriptures,
      labelColor: extractFieldLabelColor(alert.text, "scriptures", defaultLabelColor),
    });
    if (struct.speaker) chips.push({
      label: "MINISTER", value: struct.speaker,
      labelColor: extractFieldLabelColor(alert.text, "minister", defaultLabelColor),
    });
    if (struct.notes) chips.push({
      label: "NOTES", value: struct.notes,
      labelColor: extractFieldLabelColor(alert.text, "notes", defaultLabelColor),
    });
  } else if (alertType === "news") {
    label = "EVENT";
    headline = (struct.headline || struct.title || "").replace(/^(?:event|news|announcement):\s*/i, "").trim();
    if (struct.dateTime) chips.push({
      label: "DATE", value: struct.dateTime,
      labelColor: extractFieldLabelColor(alert.text, "date", defaultLabelColor),
    });
    if (struct.venue) chips.push({
      label: "VENUE", value: struct.venue,
      labelColor: extractFieldLabelColor(alert.text, "venue", defaultLabelColor),
    });
    if (struct.contact) chips.push({
      label: "CONTACT", value: struct.contact,
      labelColor: extractFieldLabelColor(alert.text, "contact", defaultLabelColor),
    });
    if (struct.details) chips.push({
      label: "DETAILS", value: struct.details,
      labelColor: extractFieldLabelColor(alert.text, "details", defaultLabelColor),
    });
  } else if (alertType === "scripture") {
    label = "SCRIPTURE";
    headline = (struct.reference || "").replace(/^(?:scripture|ref):\s*/i, "").trim();
    if (struct.verseText) chips.push({
      label: "VERSE", value: `"${struct.verseText}"`,
      labelColor: extractFieldLabelColor(alert.text, "verse", defaultLabelColor),
    });
    if (struct.focus) chips.push({
      label: "THEME", value: struct.focus,
      labelColor: extractFieldLabelColor(alert.text, "theme", defaultLabelColor),
    });
  } else {
    label = "ALERT";
    headline = (struct.title || struct.headline || "").replace(/^(?:headline|title|alert):\s*/i, "").trim();
    if (struct.message) chips.push({
      label: "MESSAGE", value: struct.message,
      labelColor: extractFieldLabelColor(alert.text, "message", defaultLabelColor),
    });
    else if (struct.details) chips.push({
      label: "DETAILS", value: struct.details,
      labelColor: extractFieldLabelColor(alert.text, "details", defaultLabelColor),
    });
  }

  let fallbackBody: string | undefined;
  if (!headline || chips.length === 0) {
    const clean = stripMarkup(alert.text);
    const colonIdx = clean.indexOf(":");
    if (!headline) {
      if (colonIdx > 0 && colonIdx < 32) {
        label = clean.slice(0, colonIdx).trim().toUpperCase();
        headline = clean.slice(colonIdx + 1).trim();
      } else {
        headline = clean;
      }
    }
    if (chips.length === 0 && colonIdx > 0) {
      fallbackBody = alert.text.slice(alert.text.indexOf(":") + 1).trim();
    }
  }

  return { label, headline, chips, fallbackBody };
};

// ── Circle sizing constants (module-level so HMR always picks up changes) ──
const MIN_CIRCLE_PX = 320; // 20rem — minimum circle size
const OVERFLOW_PX   = 160; // 80px each side above + below the pill

export const TopicPill: React.FC<TopicPillProps> = ({ alert }) => {
  const accentColor = alert.backgroundColor || "#0d4f4a";
  const defaultLabelColor = getHarmoniousLabelColor(accentColor, alert.text);
  const { label, headline, chips, fallbackBody } = useMemo(
    () => extractTopicPillData(alert, defaultLabelColor),
    [alert, defaultLabelColor],
  );
  const accentLight = extractFieldLabelColor(alert.text, label.toLowerCase(), defaultLabelColor);
  const isTop = alert.position === "top";

  // ── Responsive circle: grows automatically with pill body height ──
  const pillRef = useRef<HTMLDivElement>(null);
  const [circlePx, setCirclePx] = useState(MIN_CIRCLE_PX);

  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setCirclePx(Math.max(MIN_CIRCLE_PX, h + OVERFLOW_PX));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const circleRem   = circlePx / 16;            // px → rem
  const overlapRem  = circleRem * 0.50;          // pill starts at circle centre
  const pillPadLeft = circleRem * 0.54;          // content clears the circle overlap

  return (
    <motion.div
      className="fixed left-0 w-screen pointer-events-none z-50"
      style={{ top: isTop ? "3vh" : "auto", bottom: isTop ? "auto" : "4vh", paddingLeft: "2.5vw" }}
      initial={{ opacity: 0, y: isTop ? -50 : 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: isTop ? -50 : 60 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center" style={{ maxWidth: "94vw", minWidth: "62vw" }}>

        {/* ══════════════════════════════
            DECORATIVE ARCS + CIRCLE BADGE
            ══════════════════════════════ */}
        <motion.div
          className="relative flex-shrink-0 z-20"
          style={{
            width: `${circleRem}rem`,
            height: `${circleRem}rem`,
            marginRight: `-${overlapRem}rem`,
            alignSelf: "center",
            flexShrink: 0,
            transition: "width 0.25s ease, height 0.25s ease, margin 0.25s ease",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative arc lines outside the circle (SVG) */}
          <svg
            className="absolute"
            style={{ inset: "-22%", width: "144%", height: "144%", overflow: "visible" }}
            viewBox="0 0 144 144"
          >
            {/* Outer bracket arc top */}
            <path
              d="M 34 18 A 56 56 0 0 0 18 72"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Outer bracket arc bottom */}
            <path
              d="M 18 72 A 56 56 0 0 0 34 126"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Inner bracket arc top */}
            <path
              d="M 42 28 A 44 44 0 0 0 28 72"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Chrome outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 135deg, rgba(255,255,255,0.5) 0deg, ${accentColor} 60deg, rgba(0,0,0,0.3) 180deg, rgba(255,255,255,0.15) 300deg, rgba(255,255,255,0.5) 360deg)`,
              padding: "4px",
              borderRadius: "50%",
              boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 22px ${accentColor}66`,
            }}
          />
          {/* Inner face */}
          <div
            className="absolute rounded-full flex flex-col items-center justify-center overflow-hidden"
            style={{
              inset: "4px",
              background: `radial-gradient(ellipse at 35% 25%, ${accentColor}cc 0%, ${accentColor} 40%, color-mix(in srgb, ${accentColor} 60%, #030d0c) 75%, #030d0c 100%)`,
              boxShadow: "inset 0 3px 12px rgba(255,255,255,0.3), inset 0 -4px 12px rgba(0,0,0,0.8)",
              border: "1.5px solid rgba(255,255,255,0.25)",
            }}
          >
            {/* Background Geometric / Sacred Constellation Radar Mesh */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
              viewBox="0 0 200 200"
            >
              {/* Concentric subtle radar circles */}
              <circle cx="100" cy="100" r="82" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 4" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.6" />
              <circle cx="100" cy="100" r="42" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
              {/* Radial crosshair lines */}
              <line x1="100" y1="18" x2="100" y2="40" stroke="#ffffff" strokeWidth="1" />
              <line x1="100" y1="160" x2="100" y2="182" stroke="#ffffff" strokeWidth="1" />
              <line x1="18" y1="100" x2="40" y2="100" stroke="#ffffff" strokeWidth="1" />
              <line x1="160" y1="100" x2="182" y2="100" stroke="#ffffff" strokeWidth="1" />
              {/* Diagonal constellation nodes */}
              <circle cx="45" cy="45" r="1.5" fill="#ffffff" />
              <circle cx="155" cy="45" r="1.5" fill="#ffffff" />
              <circle cx="45" cy="155" r="1.5" fill="#ffffff" />
              <circle cx="155" cy="155" r="1.5" fill="#ffffff" />
              <line x1="45" y1="45" x2="65" y2="65" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
              <line x1="155" y1="45" x2="135" y2="65" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
            </svg>

            {/* Upper Glass dome shine with white division line at the bottom */}
            <div
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: "48%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.06) 88%, rgba(255,255,255,0) 100%)",
                borderBottom: "1.5px solid rgba(255,255,255,0.4)",
                boxShadow: "0 1px 8px rgba(255,255,255,0.3)",
              }}
            />

            {/* Subtle right-side white crescent division arc */}
            <div
              className="absolute right-0 top-0 bottom-0 pointer-events-none"
              style={{
                width: "35%",
                background: "radial-gradient(ellipse at right center, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 50%, transparent 80%)",
                borderRight: "2px solid rgba(255,255,255,0.5)",
                borderRadius: "0 100% 100% 0 / 0 50% 50% 0",
              }}
            />

            {/* Rich engaging medallion content: Top Emblem + Main Label + Divider + Sub-badge */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full" style={{ lineHeight: 1.05 }}>
              {/* Top Sacred / Broadcast Emblem Icon */}
              <div className="flex items-center justify-center gap-1.5 mb-1 opacity-90">
                <div style={{ width: "1.2rem", height: "1px", background: `linear-gradient(90deg, transparent, ${accentLight})` }} />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ filter: `drop-shadow(0 0 6px ${accentLight})` }}>
                  {/* Sacred Cross & Radiant Dove/Sunburst */}
                  <path d="M12 2v20M5 8h14" stroke={accentLight} strokeWidth="2.4" strokeLinecap="round" />
                  <circle cx="12" cy="8" r="4.5" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
                </svg>
                <div style={{ width: "1.2rem", height: "1px", background: `linear-gradient(90deg, ${accentLight}, transparent)` }} />
              </div>

              {(() => {
                const words = label.split(" ");
                const maxWordLen = Math.max(...words.map((w) => w.length), 1);
                const circleFontSize =
                  words.length === 1
                    ? (maxWordLen > 8 ? "3.4rem" : maxWordLen > 6 ? "3.8rem" : "4.3rem")
                    : (maxWordLen > 8 ? "2.5rem" : "3.0rem");

                const subBadgeText =
                  alert.alertType === "scripture"
                    ? "HOLY SCRIPTURE"
                    : alert.alertType === "news"
                    ? "COMMUNITY NEWS"
                    : alert.alertType === "sermon"
                    ? "THE LIVING WORD"
                    : "SPECIAL MESSAGE";

                if (words.length > 1) {
                  return (
                    <>
                      <span
                        style={{
                          color: accentLight,
                          fontSize: circleFontSize,
                          fontWeight: 950,
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          textShadow: `0 4px 14px rgba(0,0,0,0.95), 0 0 14px ${accentLight}44`,
                          display: "block",
                        }}
                      >
                        {words[0]}
                      </span>

                      {/* White Division Line between words with center diamond */}
                      <div className="relative flex items-center justify-center my-1" style={{ width: "62%" }}>
                        <div
                          style={{
                            flex: 1,
                            height: "2.5px",
                            background: "linear-gradient(90deg, transparent 0%, #ffffff 40%, #ffffff 100%)",
                            boxShadow: "0 0 8px rgba(255,255,255,0.95)",
                            borderRadius: "9999px",
                          }}
                        />
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            transform: "rotate(45deg)",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 0 8px #ffffff",
                            margin: "0 3px",
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            height: "2.5px",
                            background: "linear-gradient(90deg, #ffffff 0%, #ffffff 60%, transparent 100%)",
                            boxShadow: "0 0 8px rgba(255,255,255,0.95)",
                            borderRadius: "9999px",
                          }}
                        />
                      </div>

                      <span
                        style={{
                          color: accentLight,
                          fontSize: circleFontSize,
                          fontWeight: 950,
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          textShadow: `0 4px 14px rgba(0,0,0,0.95), 0 0 14px ${accentLight}44`,
                          display: "block",
                        }}
                      >
                        {words.slice(1).join(" ")}
                      </span>
                    </>
                  );
                }

                return (
                  <>
                    <span
                      style={{
                        color: accentLight,
                        fontSize: circleFontSize,
                        fontWeight: 950,
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textShadow: `0 4px 14px rgba(0,0,0,0.95), 0 0 16px ${accentLight}55`,
                        display: "block",
                      }}
                    >
                      {words[0]}
                    </span>

                    {/* White Division Line with center diamond */}
                    <div className="relative flex items-center justify-center mt-1.5 mb-1" style={{ width: "55%" }}>
                      <div
                        style={{
                          flex: 1,
                          height: "2.5px",
                          background: "linear-gradient(90deg, transparent 0%, #ffffff 40%, #ffffff 100%)",
                          boxShadow: "0 0 8px rgba(255,255,255,0.95)",
                          borderRadius: "9999px",
                        }}
                      />
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          transform: "rotate(45deg)",
                          backgroundColor: "#ffffff",
                          boxShadow: "0 0 8px #ffffff",
                          margin: "0 3px",
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          height: "2.5px",
                          background: "linear-gradient(90deg, #ffffff 0%, #ffffff 60%, transparent 100%)",
                          boxShadow: "0 0 8px rgba(255,255,255,0.95)",
                          borderRadius: "9999px",
                        }}
                      />
                    </div>

                    {/* Bottom Sub-tag Capsule Badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-0.5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.45)",
                        border: "1px solid rgba(255,255,255,0.22)",
                        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: accentLight, boxShadow: `0 0 6px ${accentLight}` }} />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "0.95rem",
                          fontWeight: 800,
                          fontFamily: "'Cinzel', serif",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        {subBadgeText}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════
            PILL BODY (headline + dots + subline)
            ══════════════════════════════ */}
        <motion.div
          ref={pillRef}
          className="relative flex-1 flex flex-col justify-center overflow-hidden"
          style={{
            minWidth: "46rem",
            borderRadius: "1rem 9999px 9999px 1rem",
            background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #000) 100%)`,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1.5px solid rgba(255,255,255,0.18)",
            borderLeft: "none",
            boxShadow: `0 14px 45px rgba(0,0,0,0.8), 0 0 35px ${accentColor}33`,
            paddingLeft: `${pillPadLeft}rem`,
            paddingRight: "6rem",
            paddingTop: "1.8rem",
            paddingBottom: "1.8rem",
            minHeight: "9.5rem",
          }}
          initial={{ scaleX: 0, opacity: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glass highlight top strip */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "40%", background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.01) 100%)", borderRadius: "inherit" }} />

          {/* Bottom subtle glow line */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "1.5px", background: `linear-gradient(90deg, transparent, ${accentLight}88, transparent)` }} />

          {/* Headline */}
          <motion.div
            className="relative z-10"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.38 }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: "3.4rem",
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.04em",
                lineHeight: 1.15,
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "break-word",
                textTransform: "uppercase",
              }}
            >
              {parseColoredText(headline, "#ffffff", "'Outfit', sans-serif", accentColor)}
            </div>
          </motion.div>

          {/* Decorative dot-dash separator — always visible as design element */}
          <motion.div
            className="relative z-10 flex items-center gap-1.5"
            style={{ marginTop: "0.6rem", marginBottom: "0.5rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.36, duration: 0.3 }}
          >
            {[0,1,2,3].map((i) => (
              <div
                key={i}
                style={{
                  width: "1.6rem",
                  height: "0.32rem",
                  borderRadius: "2px",
                  backgroundColor: accentLight,
                  opacity: 1 - i * 0.15,
                }}
              />
            ))}
            <div style={{ width: "0.8rem", height: "0.32rem", borderRadius: "2px", backgroundColor: `${accentLight}77` }} />
            <div style={{ width: "0.4rem", height: "0.32rem", borderRadius: "50%", backgroundColor: `${accentLight}44` }} />
          </motion.div>

          {/* Subline chips — each field with its own label color + scripture-aware sizing */}
          <motion.div
            className="relative z-10 flex items-center flex-wrap gap-x-4 gap-y-1"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.38 }}
          >
            {chips.length > 0 ? (
              chips.map((chip, idx) => {
                const isPrimaryScripture =
                  chip.label === "SCRIPTURES" ||
                  chip.label === "SCRIPTURE" ||
                  chip.label === "VERSE";
                const chipColor = chip.labelColor || accentLight;
                return (
                  <span key={idx} className="inline-flex items-center gap-2">
                    {/* Label badge */}
                    <span
                      style={{
                        color: chipColor,
                        fontSize: isPrimaryScripture ? "1.25rem" : "1.1rem",
                        fontWeight: 900,
                        fontFamily: "'Cinzel', serif",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textShadow: `0 1px 6px ${chipColor}55`,
                        opacity: 0.95,
                      }}
                    >
                      {chip.label}
                    </span>
                    {/* Value */}
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: isPrimaryScripture ? "2.35rem" : "1.85rem",
                        fontWeight: isPrimaryScripture ? 700 : 600,
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: "0.02em",
                        lineHeight: 1.25,
                        textShadow: "0 1px 8px rgba(0,0,0,0.7)",
                      }}
                    >
                      {parseColoredText(chip.value, "#ffffff", "'Outfit', sans-serif", accentColor)}
                    </span>
                    {/* Separator dot between chips */}
                    {idx < chips.length - 1 && (
                      <span style={{ color: `${accentLight}66`, fontSize: "1.2rem", margin: "0 0.2rem" }}>·</span>
                    )}
                  </span>
                );
              })
            ) : fallbackBody ? (
              <div
                style={{
                  color: "rgba(255,255,255,0.94)",
                  fontSize: "2.4rem",
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: "0.02em",
                  lineHeight: 1.35,
                  textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                  whiteSpace: "normal",
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                }}
              >
                {parseColoredText(fallbackBody, "rgba(255,255,255,0.94)", "'Outfit', sans-serif", accentColor)}
              </div>
            ) : (
              <div style={{ height: "2.2rem" }} />
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
