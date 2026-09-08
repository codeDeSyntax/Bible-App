import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertPayload } from "../alertTemplateTypes";
import { splitAlertContent, parseColoredText, stripMarkup } from "../alertParser";

interface HeadlineCardProps {
  alert: AlertPayload;
}

interface HeadlineContent {
  category: string;
  headline: string;
  body: string;
}

const COLOR_NAMES = new Set([
  "RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "CYAN", "WHITE", "BLACK",
  "GRAY", "GREY", "AMBER", "VIOLET", "INDIGO", "EMERALD", "ROSE", "TEAL", "GOLD", "BRONZE", "SILVER"
]);

const isColorToken = (str: string) => {
  const clean = str.replace(/[{}/#]/g, "").trim().toUpperCase();
  return COLOR_NAMES.has(clean) || /^[0-9A-F]{3,8}$/i.test(clean);
};

const parseSermonHeadline = (text: string): HeadlineContent => {
  const { headline: rawHeadline, body } = splitAlertContent(text);
  const cleanHeadline = stripMarkup(rawHeadline);

  // Check if headline has an explicit prefix like "THEME: ...", "SERMON: ...", "PROMISE: ..."
  const colonIdx = cleanHeadline.indexOf(":");
  if (colonIdx > 1 && colonIdx < 24) {
    const candidate = cleanHeadline.slice(0, colonIdx).trim().toUpperCase();
    if (!isColorToken(candidate)) {
      const rawColonIdx = rawHeadline.indexOf(":");
      return {
        category: candidate,
        headline: rawHeadline.slice(rawColonIdx + 1).trim(),
        body,
      };
    } else {
      // It was a color name (e.g. "YELLOW:" or "{red}:"), discard it completely from headline!
      const rawColonIdx = rawHeadline.indexOf(":");
      return {
        category: "SERMON",
        headline: rawHeadline.slice(rawColonIdx + 1).trim(),
        body,
      };
    }
  }

  return {
    category: "SERMON",
    headline: rawHeadline,
    body,
  };
};

export const HeadlineCard: React.FC<HeadlineCardProps> = ({ alert }) => {
  const { category, headline, body } = useMemo(() => parseSermonHeadline(alert.text), [alert.text]);
  const accentColor = alert.backgroundColor || "#b91c1c";
  const isTop = alert.position === "top";

  return (
    <motion.div
      className="fixed left-0 w-screen pointer-events-none z-50 flex items-center justify-center"
      style={{
        top: isTop ? "4vh" : "auto",
        bottom: isTop ? "auto" : "4.5vh",
        paddingLeft: "3vw",
        paddingRight: "3vw",
      }}
      initial={{ opacity: 0, y: isTop ? -50 : 50, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isTop ? -50 : 50, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col" style={{ maxWidth: "92vw", minWidth: "52vw" }}>
        {/* Top Slanted Tab: "THE WORD" */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="self-start flex items-center gap-2 px-5 py-1.5 mb-[-2px] z-10 shadow-md"
          style={{
            background: accentColor,
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)",
            borderTop: "2px solid rgba(255,255,255,0.75)",
            borderLeft: "2px solid rgba(255,255,255,0.4)",
            boxShadow: `0 4px 12px ${accentColor}66`,
          }}
        >
          {/* Subtle Golden Dove / Cross / Light indicator */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M2 10h20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span
            className="font-black uppercase tracking-widest text-white"
            style={{
              fontSize: "1.15rem",
              fontFamily: "'Cinzel', serif",
              letterSpacing: "0.16em",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}
          >
            THE WORD
          </span>
        </motion.div>

        {/* Tier 1: Main Glossy 3D Beveled Sermon Theme Bar (Image 1 style) */}
        <div
          className="relative flex items-center overflow-hidden shadow-2xl"
          style={{
            clipPath: "polygon(0 0, calc(100% - 36px) 0, 100% 100%, 0 100%)",
            background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}ee 100%)`,
            borderTop: "3.5px solid rgba(255,255,255,0.85)",
            borderBottom: "2px solid rgba(0,0,0,0.6)",
            boxShadow: `0 16px 45px rgba(0,0,0,0.85), 0 0 35px ${accentColor}44`,
          }}
        >
          {/* Glossy 3D glass reflection overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 48%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.45) 100%)",
            }}
          />

          {/* Left Category Block / Badge ("SERMON" or "THEME" or custom prefix) */}
          <div
            className="relative z-10 flex items-center justify-center px-8 py-5 border-r border-black/30 flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 100%)",
            }}
          >
            <span
              className="font-black uppercase tracking-widest text-white"
              style={{
                fontSize: "2.2rem",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.12em",
                textShadow: "0 2px 8px rgba(0,0,0,0.9)",
              }}
            >
              {stripMarkup(category)}
            </span>
          </div>

          {/* Main Sermon Headline / Theme Text */}
          <div
            className="relative z-10 flex-1 px-8 py-5 font-black tracking-wide"
            style={{
              fontSize: "3.8rem",
              color: "#ffffff",
              fontFamily: "'Cinzel', 'EB Garamond', 'Georgia', serif",
              letterSpacing: "0.04em",
              lineHeight: 1.15,
              textShadow: "0 3px 12px rgba(0,0,0,0.9)",
              whiteSpace: "normal",
              wordBreak: "normal",
              overflowWrap: "normal",
              hyphens: "none",
            }}
          >
            {parseColoredText(headline, "#ffffff", "'Cinzel', 'EB Garamond', 'Georgia', serif", accentColor)}
          </div>
        </div>

        {/* Tier 2: Slanted Subtitle / Details Strip (Image 1 style) */}
        {body && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className="self-start flex items-stretch mt-1.5 shadow-xl"
            style={{
              maxWidth: "88vw",
              clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%)",
              background: "linear-gradient(90deg, #ffffff 0%, #f8fafc 60%, #e2e8f0 100%)",
              borderBottom: `2.5px solid ${accentColor}`,
            }}
          >
            {/* Left Accent Tag */}
            <div
              className="flex items-center px-5 py-2 flex-shrink-0"
              style={{
                background: accentColor,
              }}
            >
              <span
                className="font-black uppercase tracking-widest text-white text-[1.3rem]"
                style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.1em" }}
              >
                KEY POINT
              </span>
            </div>

            {/* Subtitle / Details Body */}
            <div
              className="px-6 py-2.5 font-semibold text-slate-900"
              style={{
                fontSize: "2.3rem",
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.3,
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "normal",
                hyphens: "none",
              }}
            >
              {parseColoredText(body, "#0f172a", "'Outfit', sans-serif", "#ffffff")}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

