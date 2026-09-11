import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setActiveAlertId,
  setActiveAlertPayload,
  SavedAlert,
} from "@/store/slices/bibleSlice";
import { AlertPayload, AlertTemplateId } from "../AlertTemplates/alertTemplateTypes";
import {
  stripMarkup,
  parseColoredText,
  decomposeAlertMarkup,
  getHarmoniousLabelColor,
  extractFieldLabelColor,
} from "../AlertTemplates/alertParser";

export interface FloatingAlertStatusProps {
  className?: string;
  isDarkMode?: boolean;
  onOpenAlertModal?: (alertId?: string) => void;
  onHideAlert?: () => void;
}

/**
 * 1:1 Scaled Miniature Visual Preview of the active alert design template.
 * Renders the exact visual design floating at the bottom right of VersePreviewCard.
 * When no alert is projected, renders nothing (null).
 */
export const FloatingAlertStatus: React.FC<FloatingAlertStatusProps> = ({
  className = "",
  isDarkMode = true,
  onOpenAlertModal,
  onHideAlert,
}) => {
  const dispatch = useAppDispatch();
  const reduxActiveAlertId = useAppSelector((state) => state.bible.activeAlertId);
  const reduxActiveAlertPayload = useAppSelector((state) => state.bible.activeAlertPayload);
  const savedAlerts = useAppSelector((state) => state.bible.savedAlerts);

  const [ipcAlert, setIpcAlert] = useState<AlertPayload | null>(null);

  // Listen for custom alert events if dispatched anywhere in the window
  useEffect(() => {
    const handleCustomAlert = (event: any) => {
      if (event?.detail) {
        if (event.detail.type === "publish" && event.detail.alert) {
          setIpcAlert(event.detail.alert);
          dispatch(setActiveAlertId(event.detail.alert.id || `alert-${Date.now()}`));
          dispatch(setActiveAlertPayload(event.detail.alert));
        } else if (event.detail.type === "hide") {
          setIpcAlert(null);
          dispatch(setActiveAlertId(null));
        }
      }
    };

    window.addEventListener("bible-alert-status-change", handleCustomAlert);
    return () => {
      window.removeEventListener("bible-alert-status-change", handleCustomAlert);
    };
  }, [dispatch]);

  // Active Alert Data Resolution
  const activeAlert: AlertPayload | null = useMemo(() => {
    if (ipcAlert) return ipcAlert;
    if (reduxActiveAlertPayload) return reduxActiveAlertPayload;
    if (reduxActiveAlertId) {
      return savedAlerts.find((a) => a.id === reduxActiveAlertId) || null;
    }
    return null;
  }, [ipcAlert, reduxActiveAlertPayload, reduxActiveAlertId, savedAlerts]);

  // If no alert is projected, render NOTHING
  if (!activeAlert) {
    return null;
  }

  const templateId: AlertTemplateId = (activeAlert.templateId as AlertTemplateId) || "topic-pill";
  const accentColor = activeAlert.backgroundColor || "#0d4f4a";
  const defaultLabelColor = getHarmoniousLabelColor(accentColor, activeAlert.text);

  // Parse structured data if present
  const struct =
    activeAlert.structuredData && Object.keys(activeAlert.structuredData).length > 0
      ? activeAlert.structuredData
      : decomposeAlertMarkup(activeAlert.text || "", activeAlert.alertType || "sermon");

  const alertType = activeAlert.alertType || (struct.headline ? "news" : struct.reference ? "scripture" : "sermon");

  // Headline resolution
  const headline =
    alertType === "sermon"
      ? (struct.title || "").replace(/^topic:\s*/i, "").trim() || stripMarkup(activeAlert.text || "SERMON TOPIC")
      : alertType === "news"
      ? (struct.headline || struct.title || "").replace(/^(?:event|news|announcement):\s*/i, "").trim() || stripMarkup(activeAlert.text || "EVENT")
      : alertType === "scripture"
      ? (struct.reference || "").replace(/^(?:scripture|ref):\s*/i, "").trim() || stripMarkup(activeAlert.text || "SCRIPTURE")
      : (struct.title || struct.headline || "").replace(/^(?:headline|title|alert):\s*/i, "").trim() || stripMarkup(activeAlert.text || "ALERT");

  const label =
    alertType === "sermon" ? "TOPIC" : alertType === "news" ? "EVENT" : alertType === "scripture" ? "SCRIPTURE" : "ALERT";

  const accentLight = extractFieldLabelColor(activeAlert.text || "", label.toLowerCase(), defaultLabelColor);

  // Chips resolution
  const chips: Array<{ label: string; value: string; labelColor?: string }> = [];
  if (alertType === "sermon") {
    if (struct.scriptures) chips.push({ label: "SCRIPTURES", value: struct.scriptures, labelColor: extractFieldLabelColor(activeAlert.text, "scriptures", defaultLabelColor) });
    if (struct.speaker) chips.push({ label: "MINISTER", value: struct.speaker, labelColor: extractFieldLabelColor(activeAlert.text, "minister", defaultLabelColor) });
    if (struct.notes) chips.push({ label: "NOTES", value: struct.notes, labelColor: extractFieldLabelColor(activeAlert.text, "notes", defaultLabelColor) });
  } else if (alertType === "news") {
    if (struct.dateTime) chips.push({ label: "DATE", value: struct.dateTime, labelColor: extractFieldLabelColor(activeAlert.text, "date", defaultLabelColor) });
    if (struct.venue) chips.push({ label: "VENUE", value: struct.venue, labelColor: extractFieldLabelColor(activeAlert.text, "venue", defaultLabelColor) });
  } else if (alertType === "scripture") {
    if (struct.verseText) chips.push({ label: "VERSE", value: `"${struct.verseText}"`, labelColor: extractFieldLabelColor(activeAlert.text, "verse", defaultLabelColor) });
    if (struct.focus) chips.push({ label: "THEME", value: struct.focus, labelColor: extractFieldLabelColor(activeAlert.text, "theme", defaultLabelColor) });
  }

  return (
    <AnimatePresence>
      <motion.div
        key={activeAlert.id || "active-live-alert"}
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute bottom-2 right-2 pointer-events-none z-30 select-none ${className}`}
        style={{
          maxWidth: "240px",
          width: "max-content",
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════
            EXACT TEMPLATE VISUAL REPLICA (COMPACT MINIATURE SCALE)
            ═══════════════════════════════════════════════════════════════ */}
        {templateId === "topic-pill" ? (
          /* 1. EXACT TOPIC PILL DESIGN - COMPACT */
          <div className="flex items-center drop-shadow-xl">
            {/* Medallion Circle */}
            <div
              className="relative flex-shrink-0 z-20 flex flex-col items-center justify-center rounded-full overflow-hidden shadow-lg border border-white/40"
              style={{
                width: "2.4rem",
                height: "2.4rem",
                marginRight: "-1.1rem",
                background: `radial-gradient(ellipse at 35% 25%, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 60%, #000) 100%)`,
                boxShadow: `0 4px 12px rgba(0,0,0,0.8), 0 0 8px ${accentColor}88`,
              }}
            >
              {/* Background radar circles */}
              <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#fff" strokeWidth="0.8" />
              </svg>
              {/* Gloss shine */}
              <div className="absolute top-0 left-0 right-0 h-[48%] rounded-t-full bg-gradient-to-b from-white/40 to-transparent border-b border-white/30 pointer-events-none" />
              {/* Top Sacred Cross */}
              <div className="flex items-center justify-center z-10 -mb-0.5">
                <svg width="6" height="6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20M5 8h14" stroke={accentLight} strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              {/* Main Label */}
              <span
                className="text-[0.44rem] font-black uppercase tracking-wider leading-none z-10"
                style={{
                  color: accentLight,
                  fontFamily: "'Outfit', sans-serif",
                  textShadow: `0 1px 4px rgba(0,0,0,0.9), 0 0 6px ${accentLight}88`,
                }}
              >
                {label}
              </span>
              {/* White divider with center diamond */}
              <div className="flex items-center justify-center w-[55%] my-0.5 z-10">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white to-white" />
                <div className="w-0.5 h-0.5 bg-white rotate-45 mx-0.5" />
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white via-white to-transparent" />
              </div>
              {/* Sub-tag */}
              <div className="px-1 py-[0.5px] rounded-full bg-black/50 border border-white/20 z-10">
                <span className="text-[0.24rem] font-bold text-white/90 uppercase tracking-widest leading-none">
                  THE WORD
                </span>
              </div>
            </div>

            {/* Pill Body */}
            <div
              className="flex flex-col justify-center rounded-r-full shadow-lg border border-white/25 border-l-0 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 70%, #000) 100%)`,
                paddingLeft: "1.45rem",
                paddingRight: "0.7rem",
                paddingTop: "0.22rem",
                paddingBottom: "0.22rem",
                minHeight: "1.8rem",
                minWidth: "7.5rem",
                maxWidth: "13.5rem",
              }}
            >
              {/* Headline */}
              <div
                className="text-[0.58rem] font-black uppercase tracking-wide text-white leading-tight truncate"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  textShadow: "0 1px 4px rgba(0,0,0,0.85)",
                }}
              >
                {parseColoredText(headline, "#ffffff", "'Outfit', sans-serif", accentColor)}
              </div>
              {/* Dot-dash separator */}
              <div className="flex items-center gap-0.5 my-0.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-[1.5px] rounded-full" style={{ backgroundColor: accentLight }} />
                ))}
                <div className="w-0.5 h-[1.5px] rounded-full" style={{ backgroundColor: `${accentLight}88` }} />
              </div>
              {/* Chips */}
              {chips.length > 0 && (
                <div className="flex items-center gap-1.5 truncate">
                  {chips.slice(0, 2).map((chip, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5 text-[0.44rem]">
                      <span className="font-black uppercase tracking-wider text-[0.36rem]" style={{ color: chip.labelColor || accentLight, fontFamily: "'Cinzel', serif" }}>
                        {chip.label}
                      </span>
                      <span className="font-semibold text-white truncate max-w-[70px]">
                        {stripMarkup(chip.value)}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : templateId === "scripture-badge" ? (
          /* 2. EXACT SCRIPTURE BADGE DESIGN - COMPACT */
          <div className="flex items-center drop-shadow-xl">
            {/* Medallion */}
            <div
              className="relative flex-shrink-0 z-20 flex items-center justify-center rounded-full shadow-lg border border-slate-300"
              style={{
                width: "2.1rem",
                height: "2.1rem",
                marginRight: "-0.9rem",
                background: `radial-gradient(circle at 35% 30%, ${accentColor} 0%, #0f172a 100%)`,
                boxShadow: `0 4px 12px rgba(0,0,0,0.8), 0 0 10px ${accentColor}66`,
              }}
            >
              <img src="./bibleicon.png" alt="Bible" className="w-3.5 h-3.5 object-contain drop-shadow" />
            </div>
            {/* Angular Bar */}
            <div
              className="flex flex-col justify-center rounded-r-md shadow-lg overflow-hidden"
              style={{
                background: "linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(10,12,18,0.98) 100%)",
                borderTop: `2px solid ${accentColor}`,
                borderBottom: `1.5px solid ${accentColor}88`,
                paddingLeft: "1.25rem",
                paddingRight: "0.6rem",
                paddingTop: "0.2rem",
                paddingBottom: "0.2rem",
                minHeight: "1.65rem",
                minWidth: "7.5rem",
                maxWidth: "13rem",
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)",
              }}
            >
              <div className="text-[0.42rem] font-bold text-amber-400 uppercase tracking-widest truncate">
                {struct.reference || "SCRIPTURE"}
              </div>
              <div className="text-[0.55rem] font-bold text-white truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {headline}
              </div>
            </div>
          </div>
        ) : templateId === "headline-card" ? (
          /* 3. EXACT HEADLINE CARD DESIGN - COMPACT */
          <div className="flex flex-col drop-shadow-xl">
            {/* Top Tab */}
            <div
              className="self-start px-1.5 py-[0.5px] text-[0.36rem] font-black uppercase text-white tracking-widest rounded-t shadow"
              style={{
                backgroundColor: accentColor,
                clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 100%, 0 100%)",
                borderTop: "1px solid rgba(255,255,255,0.7)",
              }}
            >
              ✦ THE WORD
            </div>
            {/* Main Beveled Bar */}
            <div
              className="flex items-center rounded-r shadow-lg overflow-hidden border-t"
              style={{
                borderTopColor: "rgba(255,255,255,0.7)",
                background: `linear-gradient(90deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 70%, #000) 100%)`,
                minWidth: "7.5rem",
                maxWidth: "13.5rem",
              }}
            >
              <div className="px-1.5 py-1 text-[0.44rem] font-black uppercase border-r border-black/40" style={{ color: accentLight, fontFamily: "'Cinzel', serif" }}>
                {label}
              </div>
              <div className="px-1.5 py-1 text-[0.56rem] font-black uppercase text-white truncate flex-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {headline}
              </div>
            </div>
          </div>
        ) : templateId === "chevron-lower-third" ? (
          /* 4. EXACT CHEVRON LOWER THIRD DESIGN - COMPACT */
          <div
            className="flex items-center rounded shadow-lg overflow-hidden border-t"
            style={{
              borderTopColor: accentColor,
              background: "linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(10,12,18,0.98) 100%)",
              minWidth: "7.5rem",
              maxWidth: "13.5rem",
            }}
          >
            <div
              className="w-5 h-full flex items-center justify-center text-[0.5rem] text-white font-bold px-1 py-1"
              style={{
                backgroundColor: accentColor,
                clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
              }}
            >
              ✝
            </div>
            <div className="px-1.5 py-1 min-w-0 flex-1 flex items-baseline gap-1 truncate">
              <span className="text-[0.4rem] font-black uppercase px-1 py-[0.5px] rounded" style={{ color: accentLight, backgroundColor: `${accentColor}44` }}>
                {label}
              </span>
              <span className="text-[0.56rem] font-black text-white uppercase truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {headline}
              </span>
            </div>
          </div>
        ) : (
          /* 5. EXACT BROADCAST TICKER & MARQUEE DESIGN - COMPACT */
          <div
            className="flex items-center px-2 py-1 rounded shadow-lg border-t overflow-hidden"
            style={{
              borderTopColor: accentColor,
              background: `linear-gradient(90deg, ${accentColor} 0%, rgba(15,23,42,0.96) 50%)`,
              minWidth: "7.5rem",
              maxWidth: "13.5rem",
            }}
          >
            <span className="text-[0.4rem] font-black uppercase px-1.5 py-[0.5px] rounded mr-1.5 flex-shrink-0" style={{ color: accentLight, backgroundColor: "rgba(0,0,0,0.4)" }}>
              {label}
            </span>
            <div className="text-[0.54rem] font-bold text-white truncate flex-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {headline}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
