import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { splitAlertContent, parseColoredText, decomposeAlertMarkup } from "../alertParser";

interface ChevronLowerThirdProps {
  alert: AlertPayload;
}

interface MetadataChip {
  label: string;
  value: string;
}

interface ChevronContent {
  headline: string;
  chips: MetadataChip[];
  fallbackBody?: string;
}

const extractChevronData = (alert: AlertPayload): ChevronContent => {
  const struct = alert.structuredData || decomposeAlertMarkup(alert.text, alert.alertType || "sermon");
  const alertType = alert.alertType || (struct.title ? "sermon" : struct.headline ? "news" : struct.reference ? "scripture" : "sermon");

  let headline = "";
  const chips: MetadataChip[] = [];

  if (alertType === "sermon") {
    const rawTitle = struct.title || "";
    headline = rawTitle ? (rawTitle.toLowerCase().startsWith("topic:") ? rawTitle : `Topic: ${rawTitle}`) : "SERMON";

    if (struct.scriptures) chips.push({ label: "SCRIPTURES", value: struct.scriptures });
    if (struct.speaker) chips.push({ label: "MINISTER", value: struct.speaker });
    if (struct.notes) chips.push({ label: "NOTES", value: struct.notes });
  } else if (alertType === "news") {
    const rawHeadline = struct.headline || struct.title || "";
    headline = rawHeadline ? (rawHeadline.toLowerCase().startsWith("event:") ? rawHeadline : `Event: ${rawHeadline}`) : "EVENT";

    if (struct.dateTime) chips.push({ label: "DATE", value: struct.dateTime });
    if (struct.venue) chips.push({ label: "VENUE", value: struct.venue });
    if (struct.contact) chips.push({ label: "CONTACT", value: struct.contact });
    if (struct.details) chips.push({ label: "DETAILS", value: struct.details });
  } else if (alertType === "scripture") {
    const rawRef = struct.reference || "";
    headline = rawRef ? (rawRef.toLowerCase().startsWith("scripture:") ? rawRef : `Scripture: ${rawRef}`) : "SCRIPTURE";

    if (struct.verseText) chips.push({ label: "VERSE", value: `"${struct.verseText}"` });
    if (struct.focus) chips.push({ label: "THEME", value: struct.focus });
  } else {
    const rawTitle = struct.title || struct.headline || "";
    headline = rawTitle ? (rawTitle.toLowerCase().startsWith("headline:") ? rawTitle : `Headline: ${rawTitle}`) : "ANNOUNCEMENT";

    if (struct.message) chips.push({ label: "MESSAGE", value: struct.message });
    else if (struct.details) chips.push({ label: "DETAILS", value: struct.details });
  }

  let fallbackBody: string | undefined;
  if (!headline || chips.length === 0) {
    const fallback = splitAlertContent(alert.text);
    if (!headline) headline = fallback.headline;
    if (chips.length === 0 && fallback.body) {
      fallbackBody = fallback.body;
    }
  }

  return { headline, chips, fallbackBody };
};

export const ChevronLowerThird: React.FC<ChevronLowerThirdProps> = ({ alert }) => {
  const { headline, chips, fallbackBody } = useMemo(() => extractChevronData(alert), [alert]);
  const accentColor = alert.backgroundColor || "#1d4ed8";
  const isTop = alert.position === "top";
  const hasMetadata = chips.length > 0 || !!fallbackBody;

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

        {/* 2. Main Content Plate — Continuous Inline Flow */}
        <motion.div
          className="flex items-center px-8 py-4 flex-1 relative z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4 flex-wrap w-full">
            {/* Headline / Title */}
            <div
              className="font-black uppercase tracking-wider leading-tight max-w-full"
              style={{
                fontSize: "3.2rem",
                color: "#ffffff",
                textShadow: "0 3px 14px rgba(0,0,0,0.9)",
                fontFamily: "'Cinzel', 'EB Garamond', 'Georgia', serif",
                letterSpacing: "0.05em",
                whiteSpace: "normal",
                wordBreak: "normal",
              }}
            >
              {parseColoredText(headline, "#ffffff", "'Cinzel', 'EB Garamond', 'Georgia', serif", accentColor)}
            </div>

            {/* In-line continuation of Metadata Chips */}
            {hasMetadata && (
              chips.length > 0 ? (
                chips.map((chip, idx) => {
                  const isPrimaryScripture =
                    chip.label === "SCRIPTURES" ||
                    chip.label === "SCRIPTURE" ||
                    chip.label === "VERSE";
                  return (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-2.5 ${
                        isPrimaryScripture ? "px-4 py-1.5" : "px-3 py-1"
                      } rounded-lg border shadow-md backdrop-blur-md shrink-0`}
                      style={{
                        background: isPrimaryScripture
                          ? "rgba(15, 23, 42, 0.92)"
                          : "rgba(15, 23, 42, 0.8)",
                        borderColor: isPrimaryScripture
                          ? `${accentColor}bb`
                          : `${accentColor}55`,
                      }}
                    >
                      <span
                        className={`font-black uppercase tracking-wider ${
                          isPrimaryScripture ? "text-[1.35rem] px-3 py-0.5" : "text-[1.15rem] px-2 py-0.5"
                        } rounded text-white shadow-xs`}
                        style={{
                          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                          fontFamily: "'Cinzel', serif",
                          letterSpacing: "0.1em",
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      >
                        {chip.label}
                      </span>
                      <span
                        className={`text-white ${
                          isPrimaryScripture
                            ? "font-bold text-[2.85rem]"
                            : "font-semibold text-[1.85rem]"
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
                  className="font-semibold tracking-wide text-[2.4rem] text-slate-100"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    lineHeight: 1.35,
                    textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                  }}
                >
                  {parseColoredText(fallbackBody || "", "rgba(255,255,255,0.94)", "'Outfit', sans-serif", accentColor)}
                </div>
              )
            )}
          </div>
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
