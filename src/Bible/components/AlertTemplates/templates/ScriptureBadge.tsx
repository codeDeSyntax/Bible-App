import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { stripMarkup, parseColoredText, decomposeAlertMarkup, getHarmoniousLabelColor } from "../alertParser";

/**
 * Splits the alert text into a reference (e.g. "John 3:16") and body text without breaking markup tags.
 */
const parseScriptureText = (text: string) => {
  if (!text) return { reference: "", body: "" };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return { reference: lines[0], body: lines.slice(1).join(" • ") };
  }

  const clean = stripMarkup(text);
  const colonIdx = clean.indexOf(":");
  if (colonIdx > 2 && colonIdx < 40) {
    const rawColonIdx = text.indexOf(":");
    return {
      reference: text.slice(0, rawColonIdx).trim(),
      body: text.slice(rawColonIdx + 1).trim(),
    };
  }

  const dashMatch = text.match(/^([^{•—\n]{2,50})\s*[•—]\s*(.+)$/s);
  if (dashMatch) {
    return { reference: dashMatch[1].trim(), body: dashMatch[2].trim() };
  }

  return { reference: "", body: text };
};

interface MetadataChip {
  label: string;
  value: string;
}

interface ScriptureBadgeContent {
  reference: string;
  chips: MetadataChip[];
  fallbackBody?: string;
}

const extractScriptureData = (alert: AlertPayload): ScriptureBadgeContent => {
  const struct = (alert.text && /\{[a-zA-Z0-9#]+\}/.test(alert.text))
    ? { ...alert.structuredData, ...decomposeAlertMarkup(alert.text, alert.alertType || "sermon") }
    : (alert.structuredData || decomposeAlertMarkup(alert.text, alert.alertType || "sermon"));
  const alertType = alert.alertType || (struct.title ? "sermon" : struct.headline ? "news" : struct.reference ? "scripture" : "sermon");

  let reference = "";
  const chips: MetadataChip[] = [];

  if (alertType === "sermon") {
    // Top Ribbon shows Sermon Topic
    const rawTitle = struct.title || "";
    reference = rawTitle
      ? (rawTitle.toLowerCase().startsWith("topic:") ? rawTitle.replace(/^topic:\s*/i, "Topic: ") : `Topic: ${rawTitle}`)
      : "SERMON";

    if (struct.scriptures) chips.push({ label: "SCRIPTURES", value: struct.scriptures });
    if (struct.speaker) chips.push({ label: "MINISTER", value: struct.speaker });
    if (struct.notes) chips.push({ label: "NOTES", value: struct.notes });
  } else if (alertType === "news") {
    const rawHeadline = struct.headline || struct.title || "";
    reference = rawHeadline
      ? (rawHeadline.toLowerCase().startsWith("event:") ? rawHeadline.replace(/^event:\s*/i, "Event: ") : `Event: ${rawHeadline}`)
      : "EVENT";

    if (struct.dateTime) chips.push({ label: "DATE", value: struct.dateTime });
    if (struct.venue) chips.push({ label: "VENUE", value: struct.venue });
    if (struct.contact) chips.push({ label: "CONTACT", value: struct.contact });
    if (struct.details) chips.push({ label: "DETAILS", value: struct.details });
  } else if (alertType === "scripture") {
    const rawRef = struct.reference || "";
    reference = rawRef
      ? (rawRef.toLowerCase().startsWith("scripture:") ? rawRef.replace(/^scripture:\s*/i, "Scripture: ") : `Scripture: ${rawRef}`)
      : "SCRIPTURE";

    if (struct.verseText) chips.push({ label: "VERSE", value: `"${struct.verseText}"` });
    if (struct.focus) chips.push({ label: "THEME", value: struct.focus });
  } else {
    const rawTitle = struct.title || struct.headline || "";
    reference = rawTitle
      ? (rawTitle.toLowerCase().startsWith("headline:") ? rawTitle.replace(/^headline:\s*/i, "Headline: ") : `Headline: ${rawTitle}`)
      : "ALERT";

    if (struct.message) chips.push({ label: "MESSAGE", value: struct.message });
    else if (struct.details) chips.push({ label: "DETAILS", value: struct.details });
  }

  let fallbackBody: string | undefined;
  if (!reference || chips.length === 0) {
    const fallback = parseScriptureText(alert.text);
    if (!reference) reference = fallback.reference;
    if (chips.length === 0 && fallback.body) {
      fallbackBody = fallback.body;
    }
  }

  return { reference, chips, fallbackBody };
};

interface ScriptureBadgeProps {
  alert: AlertPayload;
}

export const ScriptureBadge: React.FC<ScriptureBadgeProps> = ({ alert }) => {
  const { reference, chips, fallbackBody } = useMemo(() => extractScriptureData(alert), [alert]);
  const accentColor = alert.backgroundColor || "#b91c1c";
  const labelColor = getHarmoniousLabelColor(accentColor, alert.text);
  const isTop = alert.position === "top";
  const hasMetadata = chips.length > 0 || !!fallbackBody;

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
        {/* 1. Circular 3D Medallion on Left */}
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

          {/* Angled Reference Ribbon Badge */}
          {reference && (
            <div className="flex items-center mb-2.5">
              <div
                className="flex items-center px-7 py-2 shadow-lg"
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
                    fontSize: "3.4rem",
                    color: "#ffffff",
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: "0.06em",
                    textShadow: "0 2px 10px rgba(0,0,0,0.85)",
                    lineHeight: 1.15,
                  }}
                >
                  {parseColoredText(reference, "#ffffff", "'Outfit', sans-serif", accentColor)}
                </span>
              </div>
            </div>
          )}

          {/* Metadata Chips / Body Content */}
          {hasMetadata && (
            <div className="flex items-center gap-3 flex-wrap">
              {chips.length > 0 ? (
                chips.map((chip, idx) => {
                  const isPrimaryScripture =
                    chip.label === "SCRIPTURES" ||
                    chip.label === "SCRIPTURE" ||
                    chip.label === "VERSE";
                  return (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-2 ${
                        isPrimaryScripture ? "px-3.5 py-1.5" : "px-2.5 py-1"
                      } rounded-md border shadow-md backdrop-blur-md`}
                      style={{
                        background: isPrimaryScripture
                          ? "rgba(15, 23, 42, 0.88)"
                          : "rgba(15, 23, 42, 0.72)",
                        borderColor: isPrimaryScripture
                          ? `${accentColor}99`
                          : `${accentColor}55`,
                      }}
                    >
                      <span
                        className={`font-black uppercase tracking-wider ${
                          isPrimaryScripture ? "text-[1.25rem] px-2.5 py-0.5" : "text-[1.05rem] px-2 py-0.5"
                        } rounded`}
                        style={{
                          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                          color: labelColor,
                          fontFamily: "'Cinzel', serif",
                          letterSpacing: "0.08em",
                          border: `1px solid ${labelColor}44`,
                        }}
                      >
                        {chip.label}
                      </span>
                      <span
                        className={`text-white ${
                          isPrimaryScripture
                            ? "font-bold text-[2.2rem]"
                            : "font-semibold text-[1.8rem]"
                        }`}
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          lineHeight: 1.25,
                        }}
                      >
                        {parseColoredText(chip.value, "#ffffff", "'Outfit', sans-serif", accentColor)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div
                  className="font-semibold"
                  style={{
                    fontSize: "2.4rem",
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
                  {parseColoredText(fallbackBody || "", "#ffffff", "'Outfit', sans-serif", accentColor)}
                </div>
              )}
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
