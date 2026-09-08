import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAlertTemplateId } from "@/store/slices/bibleSlice";
import { useTheme } from "@/Provider/Theme";
import {
  ALERT_TEMPLATES,
  AlertTemplateId,
  AlertTemplateInfo,
} from "../AlertTemplates/alertTemplateTypes";

/* ── Tiny animated preview for each template card ────────────────────── */

const MarqueePreview: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    className="w-full h-full flex items-end"
    style={{ background: "#0a0c10" }}
  >
    <div
      className="w-full flex items-center overflow-hidden shadow relative"
      style={{
        height: "40%",
        background: `linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 60%), linear-gradient(90deg, ${accent} 0%, ${accent}dd 100%)`,
        borderTop: "1.5px solid rgba(255,255,255,0.8)",
      }}
    >
      <div
        className="text-white font-bold text-[0.48rem] tracking-wider uppercase px-2 whitespace-nowrap"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        SCROLLING ANNOUNCEMENT TEXT →
      </div>
    </div>
  </div>
);

const ChevronPreview: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    className="w-full h-full flex items-end justify-center pb-1.5 px-1.5"
    style={{ background: "#0a0c10" }}
  >
    <div
      className="w-full flex items-stretch shadow-md overflow-hidden relative"
      style={{
        height: "46%",
        borderTop: `1.5px solid ${accent}`,
        background: `linear-gradient(90deg, rgba(15,23,42,0.99) 0%, rgba(10,12,18,0.99) 100%)`,
      }}
    >
      <div
        className="w-4 flex-shrink-0 flex items-center justify-center relative"
        style={{
          background: accent,
          clipPath: "polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%)",
        }}
      >
        <span className="text-white text-[0.24rem] font-bold">†</span>
      </div>
      <div className="flex-1 flex flex-col justify-center px-1.5 min-w-0">
        <div className="text-white font-black text-[0.48rem] uppercase tracking-wider truncate" style={{ fontFamily: "'Cinzel', serif" }}>
          SERMON THEME
        </div>
        <div className="text-white/80 text-[0.36rem] font-semibold truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Key points & insights...
        </div>
      </div>
    </div>
  </div>
);

const BadgePreview: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    className="w-full h-full flex items-end justify-center pb-2 px-2"
    style={{ background: "#0a0c10" }}
  >
    <div className="relative flex items-center w-full">
      {/* Mini 3D circular medallion */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 z-10 flex flex-col items-center justify-center -mr-2 overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, #0f172a 100%)`,
          border: "1.5px solid #cbd5e1",
          boxShadow: `0 2px 6px rgba(0,0,0,0.8), 0 0 6px ${accent}66`,
        }}
      >
        <img src="./bibleicon.png" alt="Icon" className="w-3.5 h-3.5 object-contain" />
      </div>

      {/* Angular main bar */}
      <div
        className="flex-1 py-1 pl-3 pr-1.5 flex flex-col gap-0.5 shadow"
        style={{
          background: "linear-gradient(90deg, rgba(15,23,42,0.98) 0%, rgba(10,12,18,0.99) 100%)",
          borderTop: `1.5px solid ${accent}`,
          borderBottom: `1px solid ${accent}88`,
          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 0 100%)",
        }}
      >
        <div
          className="self-start px-1 text-[0.34rem] font-black uppercase text-white"
          style={{
            background: accent,
            clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
            fontFamily: "'Cinzel', serif",
          }}
        >
          JOHN 3:16
        </div>
        <div className="text-white text-[0.38rem] font-semibold truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
          For God so loved the world...
        </div>
      </div>
    </div>
  </div>
);

const HeadlinePreview: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    className="w-full h-full flex items-end justify-center pb-2 px-2"
    style={{ background: "#0a0c10" }}
  >
    <div className="flex flex-col w-full">
      {/* Mini top Tab */}
      <div
        className="self-start px-1 text-[0.28rem] font-black uppercase text-white mb-[-1px] z-10"
        style={{
          background: accent,
          clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 100%, 0 100%)",
          fontFamily: "'Cinzel', serif",
        }}
      >
        THE WORD
      </div>

      {/* Tier 1: Glossy sermon theme bar */}
      <div
        className="flex items-center shadow overflow-hidden"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, ${accent}dd 100%)`,
          borderTop: "1.5px solid rgba(255,255,255,0.85)",
          clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 100%, 0 100%)",
        }}
      >
        <div className="bg-black/30 px-1 py-0.5 text-[0.34rem] font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
          SERMON
        </div>
        <div className="px-1 text-white font-black text-[0.44rem] truncate" style={{ fontFamily: "'Cinzel', serif" }}>
          WALKING IN GRACE
        </div>
      </div>

      {/* Tier 2: Sub-strip */}
      <div
        className="self-start flex items-stretch mt-0.5 shadow"
        style={{
          background: "linear-gradient(90deg, #ffffff 0%, #e2e8f0 100%)",
          borderBottom: `1px solid ${accent}`,
          clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 100%, 0 100%)",
        }}
      >
        <div className="px-1 text-[0.28rem] font-black text-white" style={{ background: accent, fontFamily: "'Cinzel', serif" }}>
          KEY POINT
        </div>
        <div className="px-1 text-slate-900 text-[0.34rem] font-semibold truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Faith worketh by love...
        </div>
      </div>
    </div>
  </div>
);

const PillPreview: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    className="w-full h-full flex items-end justify-center pb-2.5 px-2"
    style={{ background: "#0a0c10" }}
  >
    <div
      className="flex items-center overflow-hidden shadow-md"
      style={{
        borderRadius: "9999px",
        border: `1.5px solid ${accent}`,
        borderTop: `1.5px solid rgba(255,255,255,0.7)`,
        background: `linear-gradient(135deg, rgba(20,27,45,0.98) 0%, rgba(10,12,18,0.99) 100%)`,
      }}
    >
      <div
        className="px-2 py-0.5 flex items-center gap-1"
        style={{ background: accent }}
      >
        <span className="w-1 h-1 rounded-full bg-white" />
        <span className="text-white text-[0.40rem] font-black uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>TOPIC</span>
      </div>
      <span className="px-2 text-white text-[0.44rem] font-semibold whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Message text here
      </span>
    </div>
  </div>
);

const TickerPreview: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    className="w-full h-full flex items-end"
    style={{ background: "#0a0c10" }}
  >
    <div
      className="w-full flex items-stretch overflow-hidden shadow"
      style={{
        height: "40%",
        borderTop: `1.5px solid ${accent}`,
        background: `linear-gradient(90deg, rgba(15,23,42,0.99) 0%, rgba(10,12,18,0.99) 100%)`,
      }}
    >
      <div
        className="flex items-center gap-1 px-2 flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)`,
          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 0 100%)",
          minWidth: "32%",
        }}
      >
        <img src="./bibleicon.png" alt="Icon" className="w-2.5 h-2.5 object-contain" />
        <span className="text-white text-[0.40rem] font-black uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>WORD</span>
      </div>
      <div
        className="flex-1 flex items-center px-2 overflow-hidden"
      >
        <span className="text-white text-[0.44rem] font-semibold whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Scrolling body text →
        </span>
      </div>
    </div>
  </div>
);

const PREVIEW_COMPONENTS: Record<AlertTemplateId, React.FC<{ accent: string }>> = {
  "marquee-classic": MarqueePreview,
  "chevron-lower-third": ChevronPreview,
  "scripture-badge": BadgePreview,
  "headline-card": HeadlinePreview,
  "topic-pill": PillPreview,
  "broadcast-ticker": TickerPreview,
};

/* ── Main Settings Panel ──────────────────────────────────────────────── */

export const AlertDesignSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const alertTemplateId = useAppSelector((s) => s.bible.alertTemplateId) as AlertTemplateId;
  const [hoveredId, setHoveredId] = useState<AlertTemplateId | null>(null);

  const handleSelect = (id: AlertTemplateId) => {
    dispatch(setAlertTemplateId(id));
  };

  return (
    <div className="w-full space-y-4 max-w-3xl">
      {/* Section header */}
      <div className="px-1 space-y-1">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          Alert Design Templates
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Choose the visual style for broadcast alerts on the presentation screen.
          This becomes your default — you can override it per-alert in the alert composer.
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ALERT_TEMPLATES.map((template: AlertTemplateInfo) => {
          const PreviewComp = PREVIEW_COMPONENTS[template.id as AlertTemplateId];
          const isSelected = alertTemplateId === template.id;
          const isHovered = hoveredId === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template.id as AlertTemplateId)}
              onMouseEnter={() => setHoveredId(template.id as AlertTemplateId)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative flex flex-col rounded-xl overflow-hidden cursor-pointer text-left transition-all duration-200 ${
                isSelected
                  ? "ring-2 shadow-lg scale-[1.01]"
                  : isHovered
                  ? "ring-1 shadow-md scale-[1.005]"
                  : "ring-1 opacity-80 hover:opacity-100"
              }`}
              style={{
                boxShadow: isSelected ? `0 0 0 2px ${template.accentColor}` : undefined,
                outline: isSelected ? `2px solid ${template.accentColor}` : undefined,
                background: isDarkMode ? "#18181b" : "#f4f4f5",
              }}
              aria-label={`Select ${template.label} template`}
              aria-pressed={isSelected}
            >
              {/* Preview area */}
              <div
                className="w-full overflow-hidden flex-shrink-0"
                style={{ height: "80px", borderRadius: "inherit" }}
              >
                <PreviewComp accent={template.accentColor} />
              </div>

              {/* Template info */}
              <div className="p-2.5 flex-1 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="text-[0.72rem] font-bold text-text-primary leading-tight truncate"
                  >
                    {template.label}
                  </span>
                  {isSelected && (
                    <span
                      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: template.accentColor }}
                    >
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-[0.62rem] text-text-secondary leading-snug line-clamp-2">
                  {template.description}
                </p>

                {/* Best-for chips */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.bestFor.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.52rem] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: isSelected
                          ? `${template.accentColor}22`
                          : isDarkMode
                          ? "rgba(255,255,255,0.07)"
                          : "rgba(0,0,0,0.06)",
                        color: isSelected ? template.accentColor : "var(--text-secondary)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current selection info box */}
      {alertTemplateId && (
        <div
          className="flex items-start gap-3 p-3.5 rounded-xl text-xs"
          style={{
            background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          }}
        >
          {(() => {
            const t = ALERT_TEMPLATES.find((t) => t.id === alertTemplateId);
            if (!t) return null;
            return (
              <>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${t.accentColor}22` }}
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: t.accentColor }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{t.label} — Selected</p>
                  <p className="text-text-secondary mt-0.5 leading-relaxed">{t.description}</p>
                  <p className="text-text-secondary mt-0.5">
                    Best for:{" "}
                    <span className="text-text-primary font-medium">
                      {t.bestFor.join(", ")}
                    </span>
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
