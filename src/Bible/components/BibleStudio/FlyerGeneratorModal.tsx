import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, ImagePlus, Sparkles, Loader2, Save, RefreshCw } from "lucide-react";
import { Tooltip } from "antd";
import { CustomSelect } from "@/shared/Selector";

interface FlyerGeneratorModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (payload: {
    name: string;
    imageDataUrl: string;
    reference?: string;
  }) => void;
}

// ── Themes ────────────────────────────────────────────────────────────────────
interface Theme {
  label: string;
  group: "Minimal & Textured" | "Cinematic & Natural" | "Abstract & Dramatic";
  prompt: string;
}

const THEMES: Theme[] = [
  // ── Minimal & Textured ────────────────────────────────────────────────────
  {
    group: "Minimal & Textured",
    label: "Rustic Wood Planks",
    prompt:
      "close-up of weathered and aged horizontal wood planks, soft gray and silver tones with natural grain detail, gently distressed surface, even diffused lighting, clean and rustic, suitable as a sermon presentation background, ultra high resolution texture",
  },
  {
    group: "Minimal & Textured",
    label: "Clean Minimal Light",
    prompt:
      "very clean modern light gray and off-white abstract background, extremely subtle dot grid pattern, soft barely visible geometric angular shapes in the corners, professional contemporary church presentation slide background, airy and spacious, flat lay style, near white tones",
  },
  {
    group: "Minimal & Textured",
    label: "Concrete & Light",
    prompt:
      "smooth polished concrete surface texture, light cool gray tones, soft even studio lighting, subtle imperfections and depth, modern and minimal, clean church presentation backdrop, professional texture photography",
  },
  {
    group: "Minimal & Textured",
    label: "Soft Linen",
    prompt:
      "close-up soft linen or canvas fabric texture, warm ivory and cream tones, fine woven thread detail, gentle natural lighting, clean minimalist background, elegant and understated sermon presentation backdrop",
  },
  {
    group: "Minimal & Textured",
    label: "Whitewashed Stone",
    prompt:
      "whitewashed textured plaster or stone wall, soft white and pale gray tones, subtle rough texture with character, gentle side lighting casting soft shadows, clean modern church presentation background",
  },
  {
    group: "Minimal & Textured",
    label: "Modern Geo Light",
    prompt:
      "clean white and light gray background with very subtle low-opacity geometric shapes, soft overlapping thin lines and minimal angular forms, modern church presentation design, ample negative space, flat contemporary graphic design style",
  },
  // ── Cinematic & Natural ───────────────────────────────────────────────────
  {
    group: "Cinematic & Natural",
    label: "Church Interior",
    prompt:
      "cinematic church interior, warm golden light streaming through ornate stained glass windows, soft bokeh pews, reverent atmosphere, rich amber and gold tones, no people",
  },
  {
    group: "Cinematic & Natural",
    label: "Mountain Sunrise",
    prompt:
      "breathtaking mountain range at golden hour sunrise, dramatic light shafts through clouds, vivid amber and rose sky, majestic and awe-inspiring landscape",
  },
  {
    group: "Cinematic & Natural",
    label: "Cross & Sky",
    prompt:
      "silhouette of a tall wooden cross against a dramatic sunset sky, vivid purple orange and pink clouds, rays of light around the cross, deeply spiritual",
  },
  {
    group: "Cinematic & Natural",
    label: "Misty Forest",
    prompt:
      "peaceful misty morning forest, soft green and white light filtering through tall trees, sacred stillness, rays of light cutting through the mist",
  },
  {
    group: "Cinematic & Natural",
    label: "Ocean at Dawn",
    prompt:
      "calm ocean horizon at golden sunrise, soft warm reflections on still water, horizon glowing with divine light, serene and hopeful",
  },
  {
    group: "Cinematic & Natural",
    label: "Garden of Prayer",
    prompt:
      "lush peaceful garden at dawn, soft morning mist, rays of golden light through ancient olive trees, tranquil and deeply spiritual atmosphere, no people",
  },
  {
    group: "Cinematic & Natural",
    label: "Dove & Light",
    prompt:
      "white dove in graceful flight silhouette against brilliant golden and white light rays from heaven, heavenly sky, peaceful and divine atmosphere",
  },
  // ── Abstract & Dramatic ───────────────────────────────────────────────────
  {
    group: "Abstract & Dramatic",
    label: "Abstract Light",
    prompt:
      "abstract divine radiant light, golden and white beams radiating from a bright center on deep midnight blue, ethereal luminous bokeh, no text",
  },
  {
    group: "Abstract & Dramatic",
    label: "Holy Fire",
    prompt:
      "abstract swirling golden and amber holy fire on a very dark background, spiritual warmth, pentecostal fire atmosphere, dramatic divine power",
  },
  {
    group: "Abstract & Dramatic",
    label: "Night Sky",
    prompt:
      "vast starry night sky with milky way, soft purple and deep blue tones, a solitary tree silhouette on a hill, contemplative and awe-inspiring",
  },
  {
    group: "Abstract & Dramatic",
    label: "Watercolor Wash",
    prompt:
      "soft gentle watercolor wash background, muted light gray and warm white tones with very faint blue and gold accents bleeding at the edges, artistic yet clean, modern worship presentation background, high quality paper texture",
  },
];

// ── Field types ───────────────────────────────────────────────────────────────
interface FlyerFields {
  sermonTitle: string;
  preacherName: string;
  scriptures: string[];
  dateTime: string;
}

function defaultDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Canvas helpers ────────────────────────────────────────────────────────────
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  ctx.textAlign = "center";
  const words = text.split(" ");
  let line = "",
    cy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, cy);
      line = word + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, cy);
    cy += lineHeight;
  }
  return cy;
}

function buildComposite(bgDataUrl: string, f: FlyerFields): Promise<string> {
  return new Promise((resolve, reject) => {
    const W = 1920,
      H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas unavailable"));
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, W, H);

      // Gradient overlay — heavier at bottom
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0.05)");
      grad.addColorStop(0.25, "rgba(0,0,0,0.20)");
      grad.addColorStop(0.55, "rgba(0,0,0,0.55)");
      grad.addColorStop(1, "rgba(0,0,0,0.88)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const GOLD = "#7cf029";
      const WHITE = "#ffffff";

      const sh = (b: number, c = "rgba(0,0,0,0.75)") => {
        ctx.shadowBlur = b;
        ctx.shadowColor = c;
      };
      const nsh = () => {
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      };

     

      // ── Content block — centered vertically ───────────────────────────
      let y = 380;

      // Sermon title
      const sz =
        f.sermonTitle.length > 45 ? 72 : f.sermonTitle.length > 28 ? 86 : 100;
      ctx.font = `bold ${sz}px Georgia, serif`;
      ctx.fillStyle = WHITE;
      sh(22);
      y = wrapText(
        ctx,
        f.sermonTitle || "Sermon Title",
        cx,
        y,
        1580,
        sz * 1.22,
      );
      nsh();
      y += 12;

      // Gold rule
      const ry = Math.min(y + 4, 920);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 260, ry);
      ctx.lineTo(cx + 260, ry);
      ctx.stroke();
      y = ry + 46;

      if (f.preacherName) {
        ctx.font = "600 46px Arial, sans-serif";
        ctx.fillStyle = WHITE;
        ctx.textAlign = "center";
        sh(10);
        ctx.fillText(f.preacherName, cx, y);
        nsh();
        y += 58;
      }

      if (f.scriptures.length > 0) {
        ctx.font = "italic 34px Georgia, serif";
        ctx.fillStyle = GOLD;
        ctx.textAlign = "center";
        sh(6, "rgba(0,0,0,0.5)");
        f.scriptures.forEach((ref) => {
          ctx.fillText(ref, cx, y);
          y += 44;
        });
        nsh();
      }

      resolve(canvas.toDataURL("image/png", 0.95));
    };
    img.onerror = () => reject(new Error("Failed to load AI background"));
    img.src = bgDataUrl;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
const EMPTY_FIELDS = (): FlyerFields => ({
  sermonTitle: "",
  preacherName: "",
  scriptures: [],
  dateTime: defaultDate(),
});

export const FlyerGeneratorModal: React.FC<FlyerGeneratorModalProps> = ({
  visible,
  onCancel,
  onSave,
}) => {
  const [fields, setFields] = useState<FlyerFields>(EMPTY_FIELDS());
  const [scriptureInput, setScriptureInput] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("Church Interior");
  const [provider, setProvider] = useState<"stability" | "picsart">(
    "stability",
  );
  const [generating, setGenerating] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const setField =
    (key: "sermonTitle" | "preacherName") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      setImageDataUrl(null);
      setError(null);
    };

  const addScripture = () => {
    const ref = scriptureInput.trim();
    if (!ref) return;
    setFields((prev) => ({ ...prev, scriptures: [...prev.scriptures, ref] }));
    setScriptureInput("");
    setImageDataUrl(null);
  };

  const removeScripture = (i: number) => {
    setFields((prev) => ({
      ...prev,
      scriptures: prev.scriptures.filter((_, idx) => idx !== i),
    }));
    setImageDataUrl(null);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (visible) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [visible, onCancel]);

  useEffect(() => {
    if (!generating) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [generating]);

  const handleGenerate = useCallback(async () => {
    if (!fields.sermonTitle.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setImageDataUrl(null);

    const theme = THEMES.find((t) => t.label === selectedTheme) ?? THEMES[0];
    const aiPrompt = `${theme.prompt}, no text, no words, no letters, highly detailed, professional photography, 16:9`;

    try {
      const result = await window.api.generateAiImage({
        provider,
        prompt: aiPrompt,
        aspectRatio: "16:9",
      });
      if (!result.success || !result.imageDataUrl) {
        setError(result.error || "Generation failed. Please try again.");
        return;
      }
      const composite = await buildComposite(result.imageDataUrl, fields);
      setImageDataUrl(composite);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setGenerating(false);
    }
  }, [fields, selectedTheme, provider, generating]);

  const handleSave = () => {
    if (!imageDataUrl) return;
    onSave({
      name: fields.sermonTitle || "AI Slide Preset",
      imageDataUrl,
      reference: fields.scriptures[0] || undefined,
    });
    setFields(EMPTY_FIELDS());
    setScriptureInput("");
    setImageDataUrl(null);
    setError(null);
  };

  if (!visible) return null;

  const canGenerate = fields.sermonTitle.trim().length > 0 && !generating;
  const canSave = !!imageDataUrl && !generating;
  const loadingMsg =
    provider === "picsart"
      ? `Polling Picsart… ${elapsed}s`
      : `Generating… ${elapsed}s`;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        onClick={onCancel}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Modal — uses --select-hover so it's never pure black in dark mode */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-[960px] max-w-[97vw] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--select-hover)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--header-gradient-from), var(--header-gradient-to))",
            }}
          >
            <ImagePlus className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.80rem] font-semibold text-text-primary leading-none">
              AI Slide Generator
            </p>
            <p className="text-[0.64rem] text-text-secondary mt-0.5 leading-none opacity-70">
              AI background · text composed automatically
            </p>
          </div>

          {/* Engine tags */}
          <div className="flex items-center gap-1 mr-2">
            {(["stability", "picsart"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className="px-2.5 py-1 rounded-lg text-[0.64rem] font-medium transition-all cursor-pointer"
                style={{
                  background:
                    provider === p
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.05)",
                  border: `1px solid ${provider === p ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.08)"}`,
                  color:
                    provider === p
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                {p === "stability" ? "Stability AI" : "Picsart"}
              </button>
            ))}
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={13} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0">
          {/* Left — form */}
          <div
            className="w-[300px] flex-shrink-0 p-4 flex flex-col gap-2.5 overflow-y-auto no-scrollbar"
            style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Sermon Title */}
            <div className="flex flex-col gap-0.5">
              <p className="text-[0.60rem] font-semibold uppercase tracking-widest opacity-60 text-text-secondary flex items-center gap-1">
                Sermon Title <span className="text-red-400 opacity-70">*</span>
              </p>
              <input
                type="text"
                value={fields.sermonTitle}
                onChange={setField("sermonTitle")}
                placeholder="The Power of Grace"
                className="w-full px-3 py-2 rounded-lg text-[0.77rem] outline-none text-text-primary placeholder:text-text-secondary"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.25)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.09)")
                }
              />
            </div>

            {/* Preacher */}
            <div className="flex flex-col gap-0.5">
              <p className="text-[0.60rem] font-semibold uppercase tracking-widest opacity-60 text-text-secondary">
                Preacher
              </p>
              <input
                type="text"
                value={fields.preacherName}
                onChange={setField("preacherName")}
                placeholder="Pastor John Doe"
                className="w-full px-3 py-2 rounded-lg text-[0.77rem] outline-none text-text-primary placeholder:text-text-secondary"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.25)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.09)")
                }
              />
            </div>

            {/* Scripture list */}
            <div className="flex flex-col gap-1">
              <p className="text-[0.60rem] font-semibold uppercase tracking-widest opacity-60 text-text-secondary">
                Scripture
              </p>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={scriptureInput}
                  onChange={(e) => setScriptureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addScripture();
                    }
                  }}
                  placeholder="John 3:16"
                  className="flex-1 px-3 py-2 rounded-lg text-[0.77rem] outline-none text-text-primary placeholder:text-text-secondary"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(255,255,255,0.25)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(255,255,255,0.09)")
                  }
                />
                <button
                  onClick={addScripture}
                  disabled={!scriptureInput.trim()}
                  className="px-2.5 rounded-lg text-[0.80rem] font-bold transition-all cursor-pointer disabled:opacity-30"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--text-primary)",
                  }}
                >
                  +
                </button>
              </div>
              {fields.scriptures.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {fields.scriptures.map((ref, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] text-text-primary"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {ref}
                      <button
                        onClick={() => removeScripture(i)}
                        className="opacity-50 hover:opacity-100 cursor-pointer leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className="border-t mt-0.5"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            />

            {/* Theme */}
            <div className="space-y-1">
              <p className="text-[0.60rem] font-semibold text-text-secondary uppercase tracking-widest opacity-70">
                Theme
              </p>
              <CustomSelect
                value={selectedTheme}
                onChange={(v) => {
                  setSelectedTheme(v);
                  setImageDataUrl(null);
                }}
                options={THEMES.map((t) => ({ value: t.label, text: t.label }))}
              />
            </div>
          </div>

          {/* Right — preview */}
          <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">
            <p className="text-[0.60rem] font-semibold text-text-secondary uppercase tracking-widest opacity-70 flex-shrink-0">
              Preview
            </p>

            {/* 16:9 preview — fills available width */}
            <div
              className="relative w-full rounded-xl overflow-hidden flex-1"
              style={{
                aspectRatio: "16 / 9",
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: 0,
              }}
            >
              {imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt="Generated slide"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : generating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                  <Loader2 className="w-6 h-6 text-text-secondary animate-spin" />
                  <p className="text-[0.70rem] text-text-secondary text-center px-4 opacity-70">
                    {loadingMsg}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-20">
                  <Sparkles className="w-7 h-7 text-text-secondary" />
                  <p className="text-[0.68rem] text-text-secondary italic">
                    Preview will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-3 py-2 rounded-xl flex-shrink-0"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <p className="text-[0.72rem] text-red-400 leading-relaxed">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-2 justify-end px-4 py-3 flex-shrink-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-[0.74rem] font-medium rounded-xl transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Cancel
          </button>

          <Tooltip
            title={
              !fields.sermonTitle.trim() ? "Add sermon title first" : undefined
            }
          >
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-[0.74rem] font-semibold rounded-xl text-white transition-all ${
                !canGenerate
                  ? "opacity-35 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-90"
              }`}
              style={{
                background: canGenerate
                  ? "linear-gradient(135deg, var(--header-gradient-from), #3a3a3a)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              {generating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : imageDataUrl ? (
                <RefreshCw size={12} />
              ) : (
                <Sparkles size={12} />
              )}
              {imageDataUrl ? "Regenerate" : "Generate"}
            </button>
          </Tooltip>

          <Tooltip
            title={!imageDataUrl ? "Generate first" : "Save as image preset"}
          >
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-[0.74rem] font-semibold rounded-xl text-white transition-all ${
                !canSave
                  ? "opacity-35 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-90"
              }`}
              style={
                canSave
                  ? { background: "linear-gradient(135deg, #16a34a, #15803d)" }
                  : { background: "rgba(255,255,255,0.08)" }
              }
            >
              <Save size={12} />
              Save Preset
            </button>
          </Tooltip>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
