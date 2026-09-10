import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { stripMarkup, parseColoredText, decomposeAlertMarkup, getHarmoniousLabelColor } from "../alertParser";

interface TopicPillProps {
  alert: AlertPayload;
}

const extractTopicPillData = (alert: AlertPayload) => {
  const struct = (alert.text && /\{[a-zA-Z0-9#]+\}/.test(alert.text))
    ? { ...alert.structuredData, ...decomposeAlertMarkup(alert.text, alert.alertType || "sermon") }
    : (alert.structuredData || decomposeAlertMarkup(alert.text, alert.alertType || "sermon"));
  const alertType = alert.alertType || (struct.headline ? "news" : struct.reference ? "scripture" : "sermon");

  let label = "TOPIC";
  let body = "";

  if (alertType === "sermon") {
    label = "TOPIC";
    const rawTitle = struct.title || "";
    const titlePart = rawTitle ? (rawTitle.toLowerCase().startsWith("topic:") ? rawTitle : `Topic: ${rawTitle}`) : "";
    const secParts: string[] = [];
    if (struct.scriptures) secParts.push(`Scriptures: ${struct.scriptures}`);
    if (struct.speaker) secParts.push(`Minister: ${struct.speaker}`);
    body = [titlePart, ...secParts].filter(Boolean).join("   •   ");
  } else if (alertType === "news") {
    label = "EVENT";
    const rawHeadline = struct.headline || struct.title || "";
    const headPart = rawHeadline ? (rawHeadline.toLowerCase().startsWith("event:") ? rawHeadline : `Event: ${rawHeadline}`) : "";
    const metaParts: string[] = [];
    if (struct.dateTime) metaParts.push(`Date: ${struct.dateTime}`);
    if (struct.venue) metaParts.push(`Venue: ${struct.venue}`);
    body = [headPart, ...metaParts].filter(Boolean).join("   •   ");
  } else if (alertType === "scripture") {
    label = "SCRIPTURE";
    const rawRef = struct.reference || "";
    const refPart = rawRef ? (rawRef.toLowerCase().startsWith("scripture:") ? rawRef : `Scripture: ${rawRef}`) : "";
    const focusPart = struct.focus ? `Theme: ${struct.focus}` : struct.verseText ? `Verse: "${struct.verseText}"` : "";
    body = [refPart, focusPart].filter(Boolean).join("   •   ");
  } else {
    label = "ALERT";
    const rawTitle = struct.title || struct.headline || "";
    const headPart = rawTitle ? `Headline: ${rawTitle}` : "";
    const msgPart = struct.message ? `Message: ${struct.message}` : "";
    body = [headPart, msgPart].filter(Boolean).join("   •   ") || struct.details || "";
  }

  if (!body) {
    const clean = stripMarkup(alert.text);
    const colonIdx = clean.indexOf(":");
    if (colonIdx > 0 && colonIdx < 32) {
      label = clean.slice(0, colonIdx).trim().toUpperCase();
      body = alert.text.slice(alert.text.indexOf(":") + 1).trim();
    } else {
      body = alert.text;
    }
  }

  return { label, body };
};

export const TopicPill: React.FC<TopicPillProps> = ({ alert }) => {
  const accentColor = alert.backgroundColor || "#b45309";
  const labelColor = getHarmoniousLabelColor(accentColor, alert.text);
  const isTop = alert.position === "top";

  const { label, body } = useMemo(() => extractTopicPillData(alert), [alert]);

  return (
    <motion.div
      className="fixed left-0 w-screen pointer-events-none z-50 flex justify-center"
      style={{
        top: isTop ? "4vh" : "auto",
        bottom: isTop ? "auto" : "5vh",
        paddingLeft: "3vw",
        paddingRight: "3vw",
      }}
      initial={{ opacity: 0, scale: 0.9, y: isTop ? -35 : 35 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: isTop ? -35 : 35 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="flex items-stretch overflow-hidden shadow-2xl relative"
        style={{
          borderRadius: "9999px",
          background:
            "linear-gradient(135deg, rgba(20,27,45,0.98) 0%, rgba(10,12,18,0.99) 100%)",
          backdropFilter: "blur(20px)",
          border: `2px solid ${accentColor}`,
          borderTop: `2.5px solid rgba(255,255,255,0.8)`,
          boxShadow: `0 16px 50px rgba(0,0,0,0.9), 0 0 35px ${accentColor}44`,
          maxWidth: "90vw",
        }}
      >
        {/* Glossy highlight reflection on top half */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
          }}
        />

        {/* Left Category Jewel Pill */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-8 py-4 relative z-10"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
            borderRight: "2px solid rgba(255,255,255,0.4)",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.5), 4px 0 15px rgba(0,0,0,0.4)`,
          }}
        >
          {/* Subtle Glowing Indicator Dot */}
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
            style={{ backgroundColor: labelColor }}
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
            {label}
          </span>
        </div>

        {/* Body Text — NO truncation, fully visible wrapping */}
        <div className="flex items-center px-9 py-4 relative z-10">
          <div
            style={{
              color: "#ffffff",
              fontSize: "2.9rem",
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.3,
              whiteSpace: "normal",
              wordBreak: "normal",
              overflowWrap: "normal",
              hyphens: "none",
              textShadow: "0 2px 10px rgba(0,0,0,0.7)",
            }}
          >
            {parseColoredText(body, "#ffffff", "'Outfit', sans-serif", accentColor)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
