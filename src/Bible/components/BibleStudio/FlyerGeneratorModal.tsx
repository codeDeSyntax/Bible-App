import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  ImagePlus,
  Sparkles,
  Loader2,
  Save,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Tooltip } from "antd";
import { useAppDispatch } from "../../../store";
import {
  startBackgroundGeneration,
  backgroundGenerationCompleted,
  backgroundGenerationFailed,
} from "../../../store/slices/generationSlice";

const FLYER_SAVE_DIR_KEY = "flyerImagesSavePath";

interface FlyerGeneratorModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (payload: {
    name: string;
    imageUrl: string;
    reference?: string;
  }) => void;
}

// ── Background theme options ──────────────────────────────────────────────────
type BgTheme =
  | "nature"
  | "abstract"
  | "pattern"
  | "architecture"
  | "space"
  | "minimalist";

interface BgThemeOption {
  id: BgTheme;
  label: string;
  description: string;
}

const BG_THEMES: BgThemeOption[] = [
  { id: "nature", label: "Nature", description: "Mountains, sunsets, forests" },
  {
    id: "abstract",
    label: "Abstract",
    description: "Light rays, bokeh, gradients",
  },
  { id: "pattern", label: "Pattern", description: "Geometric, mosaic, tiles" },
  {
    id: "architecture",
    label: "Sacred",
    description: "Stained glass, crosses",
  },
  { id: "space", label: "Cosmic", description: "Stars, galaxies, nebulae" },
  {
    id: "minimalist",
    label: "Minimal",
    description: "Clean gradients, shapes",
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
  const d = new Date();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Per-theme background descriptions ────────────────────────────────────────
const THEME_BG_PROMPTS: Record<BgTheme, string> = {
  nature:
    "The background is a breathtaking cinematic nature scene — sweeping mountain ranges, dramatic sunset skies with vivid oranges and purples, rolling ocean waves, lush green forests, golden wheat fields, serene lakes with mirror reflections, or misty valleys. Rich natural lighting and depth of field.",
  abstract:
    "The background is a vivid abstract composition — flowing light rays, soft bokeh orbs of warm and cool tones, fluid acrylic paint swirls, luminous color gradients transitioning from deep blues to fiery golds, gently glowing particle trails, and ethereal translucent layers. No recognizable objects, just pure color and light.",
  pattern:
    "The background is a sophisticated geometric pattern — tessellated hexagons, interlocking diamonds, Islamic-inspired arabesque motifs, art-deco chevrons, subtle concentric circles, or mosaic tile designs in rich jewel tones (sapphire, emerald, gold, amethyst) with a slight depth shadow between elements.",
  architecture:
    "The background is a majestic sacred architecture scene — towering cathedral interiors with vaulted ceilings, ornate stained-glass windows casting colorful light beams, rows of glowing candles on an altar, a solitary illuminated wooden cross, stone arches with dramatic chiaroscuro lighting, or a chapel bathed in golden hour light.",
  space:
    "The background is a stunning deep-space cosmic scene — swirling nebulae in vibrant magentas and teals, a dense star field, a glowing spiral galaxy, luminous interstellar clouds, the aurora borealis seen from above the atmosphere, or a radiant supernova remnant. Rich, infinite depth and celestial wonder.",
  minimalist:
    "The background is a clean minimalist design — a smooth gradient transitioning between two or three harmonious tones (e.g., deep navy to soft gold, charcoal to blush, forest green to cream), with a single subtle accent element like a thin horizontal rule, a soft radial glow at center, or a faint geometric shape. Lots of open negative space.",
};

// ── Layout variations ────────────────────────────────────────────────────────
const LAYOUT_VARIATIONS: string[] = [
  "title extra-large and centered in the upper half of the image with supporting text centered below, separated by a thin decorative horizontal line",
  "title extra-large anchored to the left side spanning roughly 70% of the width, with supporting text left-aligned beneath it, leaving breathing room on the right",
  "title extra-large positioned in the lower third of the image with supporting text stacked below, the upper two-thirds showcasing the background",
  "bold split layout with the title extra-large on the right half and a subtle vertical accent bar dividing left background art from the right text zone",
  "title extra-large at the top of the image with a semi-transparent dark band behind it, supporting details in a matching band near the bottom",
  "diagonal composition with the title extra-large running at a slight upward angle across the center, supporting text horizontal beneath it",
];

// ── Prompt builder ───────────────────────────────────────────────────────────
// Short, declarative prompt — avoids verbose instructions that the model
// mistakes for text to render on the image.
function buildFlyerPrompt(f: FlyerFields, theme: BgTheme): string {
  const title = f.sermonTitle || "Sermon Title";

  // Collect the lines of text that should appear on the slide
  const overlayLines: string[] = [`"${title}"`];
  if (f.preacherName) overlayLines.push(`"${f.preacherName}"`);
  if (f.scriptures.length > 0)
    overlayLines.push(`"${f.scriptures.join(" · ")}"`);
  if (f.dateTime) overlayLines.push(`"${f.dateTime}"`);

  // Pick a random layout so results are varied
  const layout =
    LAYOUT_VARIATIONS[Math.floor(Math.random() * LAYOUT_VARIATIONS.length)];

  return `A widescreen 16:9 church sermon title slide. ${THEME_BG_PROMPTS[theme]} \
Overlaid on the background in large bold white typography: ${overlayLines.join(", ")}. \
The title "${title}" is extra-large billboard-sized headline text. ${layout}. \
Drop shadows and a subtle dark gradient behind the text for legibility. \
No people, no faces, no human figures. No watermarks. Cinematic broadcast quality.`;
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
  const dispatch = useAppDispatch();
  const [fields, setFields] = useState<FlyerFields>(EMPTY_FIELDS());
  const [scriptureInput, setScriptureInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [bgTheme, setBgTheme] = useState<BgTheme>("nature");
  const [saveDir, setSaveDir] = useState<string | null>(() =>
    localStorage.getItem(FLYER_SAVE_DIR_KEY),
  );

  /**
   * Track whether the modal is still open when an in-flight API call resolves.
   * When the user closes the modal mid-generation we flip this to `false` so
   * the handleGenerate callback knows to push the result into global Redux
   * state instead of local component state.
   */
  const modalOpenRef = useRef(false);
  const generatingRef = useRef(false);
  const fieldsRef = useRef(fields);

  // Keep refs in sync
  useEffect(() => {
    modalOpenRef.current = visible;
  }, [visible]);
  useEffect(() => {
    generatingRef.current = generating;
  }, [generating]);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  const setField =
    (key: "sermonTitle" | "preacherName") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      setImageUrl(null);
      setError(null);
    };

  const addScripture = () => {
    const ref = scriptureInput.trim();
    if (!ref) return;
    setFields((prev) => ({ ...prev, scriptures: [...prev.scriptures, ref] }));
    setScriptureInput("");
    setImageUrl(null);
  };

  const removeScripture = (i: number) => {
    setFields((prev) => ({
      ...prev,
      scriptures: prev.scriptures.filter((_, idx) => idx !== i),
    }));
    setImageUrl(null);
  };

  /**
   * Intercept close: if a generation is in flight, hand it off to global
   * Redux state so the GenerationTracker can pick it up.
   */
  const handleClose = useCallback(() => {
    if (generatingRef.current) {
      const f = fieldsRef.current;
      dispatch(
        startBackgroundGeneration({
          name: f.sermonTitle || "AI Slide Preset",
          reference: f.scriptures[0] || undefined,
        }),
      );
    }
    // Reset local state
    setGenerating(false);
    setImageUrl(null);
    setError(null);
    setElapsed(0);
    onCancel();
  }, [dispatch, onCancel]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (visible) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [visible, handleClose]);

  useEffect(() => {
    if (!generating) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [generating]);

  const handleGenerate = useCallback(async () => {
    if (!fields.sermonTitle.trim() || generating || !saveDir) return;
    setGenerating(true);
    setError(null);
    setImageUrl(null);

    const aiPrompt = buildFlyerPrompt(fields, bgTheme);
    // Snapshot the payload so it survives modal close
    const payload = {
      name: fields.sermonTitle || "AI Slide Preset",
      reference: fields.scriptures[0] || undefined,
    };

    try {
      const result = await window.api.generateAiImage({
        prompt: aiPrompt,
        saveDir,
      });

      // ── If user closed modal while we were waiting ──
      if (!modalOpenRef.current) {
        if (result.success && result.imageUrl) {
          dispatch(backgroundGenerationCompleted(result.imageUrl));
        } else {
          dispatch(
            backgroundGenerationFailed(result.error || "Generation failed."),
          );
        }
        return; // don't touch local state — component may be unmounted
      }

      // ── Modal still open — normal path ──
      if (!result.success || !result.imageUrl) {
        setError(result.error || "Generation failed. Please try again.");
        return;
      }
      setImageUrl(result.imageUrl);
    } catch (err: any) {
      if (!modalOpenRef.current) {
        dispatch(
          backgroundGenerationFailed(
            err?.message || "An unexpected error occurred.",
          ),
        );
        return;
      }
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setGenerating(false);
    }
  }, [fields, generating, dispatch, saveDir, bgTheme]);

  const handleSave = () => {
    if (!imageUrl) return;
    onSave({
      name: fields.sermonTitle || "AI Slide Preset",
      imageUrl,
      reference: fields.scriptures[0] || undefined,
    });
    setFields(EMPTY_FIELDS());
    setScriptureInput("");
    setImageUrl(null);
    setError(null);
  };

  /** Let user pick the folder where AI flyer images are saved. */
  const handleChooseSaveDir = useCallback(async () => {
    try {
      const dir = await window.api.selectDirectory();
      if (dir) {
        localStorage.setItem(FLYER_SAVE_DIR_KEY, dir);
        setSaveDir(dir);
      }
    } catch (err) {
      console.error("Error selecting directory:", err);
    }
  }, []);

  if (!visible) return null;

  const canGenerate =
    fields.sermonTitle.trim().length > 0 && !generating && !!saveDir;
  const canSave = !!imageUrl && !generating;
  const loadingMsg = `${elapsed}s`;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-white/30 dark:bg-black/60 backdrop-blur-[20px]"
        onClick={handleClose}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal card */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-[800px] max-w-[96vw] rounded-2xl overflow-hidden flex flex-col bg-studio-bg border border-select-border shadow-[0_32px_80px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.2)] h-[60vh]"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
      >
        {/* ── Main body: left form + right preview ───────────────── */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT: Form fields */}
          <div className="flex flex-col gap-2.5 p-4 flex-1 overflow-y-auto  border-select-border-hover border-dashed m-3  rounded-2xl">
            {/* Sermon title */}
            <input
              type="text"
              value={fields.sermonTitle}
              onChange={setField("sermonTitle")}
              placeholder="Sermon title *"
              className="w-full px-3 py-4 rounded-full text-[0.72rem] outline-none text-text-primary placeholder:text-text-secondary/40 transition-all bg-card-bg-alt border-solid border border-select-border focus:border-select-border-hover focus:bg-card-bg-alt"
            />

            {/* Preacher */}
            <input
              type="text"
              value={fields.preacherName}
              onChange={setField("preacherName")}
              placeholder="Preacher name"
              className="w-full px-3 py-4 rounded-full text-[0.72rem] outline-none text-text-primary placeholder:text-text-secondary/40 transition-all bg-card-bg-alt border-solid border border-select-border focus:border-select-border-hover focus:bg-card-bg-alt"
            />

            {/* Scripture input */}
            <div className="flex gap-2 items-center">
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
                placeholder="Add scripture (e.g. John 3:16)"
                className="flex-1 px-3 py-4 rounded-full text-[0.72rem] outline-none text-text-primary placeholder:text-text-secondary/40 transition-all bg-card-bg-alt border-solid border border-select-border focus:border-select-border-hover focus:bg-card-bg-alt"
              />
              <button
                onClick={addScripture}
                disabled={!scriptureInput.trim()}
                className="h-[34px] px-3 rounded-lg text-[0.68rem] font-medium transition-all cursor-pointer disabled:opacity-20 text-text-secondary hover:text-text-primary bg-card-bg border border-select-border hover:bg-select-hover"
              >
                Add
              </button>
            </div>

            {/* Scripture tags */}
            {fields.scriptures.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {fields.scriptures.map((ref, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.62rem] text-text-primary/80 bg-card-bg border border-select-border"
                  >
                    {ref}
                    <button
                      onClick={() => removeScripture(i)}
                      className="text-text-secondary/50 hover:text-text-primary cursor-pointer leading-none text-[0.68rem]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Theme pills */}
            <div className="flex flex-wrap gap-1.5">
              {BG_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setBgTheme(t.id);
                    setImageUrl(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[0.64rem] font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    bgTheme === t.id
                      ? "bg-gradient-to-br from-header-gradient-from to-header-gradient-to border-select-border-hover text-white"
                      : "bg-card-bg border-select-border text-text-secondary hover:bg-select-hover hover:text-text-primary"
                  }`}
                  title={t.description}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* No-folder warning */}
            {!saveDir && (
              <div className="flex items-center gap-2 px-3 py-4 rounded-full bg-[rgba(234,179,8,0.06)] border border-[rgba(234,179,8,0.12)]">
                <FolderOpen
                  size={11}
                  className="text-amber-400/70 flex-shrink-0"
                />
                <p className="text-[0.60rem] text-amber-400/70 leading-snug">
                  Choose a save folder to enable generation
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Preview */}
          <div className="w-[350px] flex-shrink-0 p-4 flex flex-col gap-2 ">
            <div className="relative w-full rounded-xl overflow-hidden aspect-video bg-card-bg border border-select-border">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated slide"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : generating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-text-secondary/40 animate-spin" />
                  <p className="text-[0.62rem] text-text-secondary/50">
                    Generating… {loadingMsg}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <ImagePlus className="w-5 h-5 text-text-secondary/25" />
                  <p className="text-[0.62rem] text-text-secondary/35">
                    Preview
                  </p>
                </div>
              )}

              {/* Close button overlaid */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors bg-card-bg hover:bg-select-hover"
                aria-label="Close"
              >
                <X size={11} className="text-text-secondary" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-4 rounded-full bg-red-500/10 border border-red-500/15">
                <p className="text-[0.62rem] text-red-400/90 leading-snug">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom toolbar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-select-border">
          {/* Save directory picker */}
          <button
            onClick={handleChooseSaveDir}
            className={`flex items-center gap-1.5 px-2.5 py-3 rounded-lg text-[0.60rem] font-medium transition-all cursor-pointer border ${
              !saveDir
                ? "bg-[rgba(234,179,8,0.08)] border-[rgba(234,179,8,0.15)] text-[rgba(234,179,8,0.8)] hover:bg-[rgba(234,179,8,0.12)]"
                : "bg-card-bg border-select-border text-text-secondary hover:bg-select-hover"
            }`}
            title={saveDir || "Choose folder"}
          >
            <FolderOpen size={10} />
            <span className="max-w-[140px] truncate">
              {saveDir
                ? saveDir.length > 22
                  ? "…" + saveDir.slice(-20)
                  : saveDir
                : "Save Folder"}
            </span>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <Tooltip
              title={
                !saveDir
                  ? "Choose a save folder first"
                  : !fields.sermonTitle.trim()
                    ? "Add sermon title"
                    : undefined
              }
            >
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`flex items-center gap-1.5 px-4 py-4 rounded-gl text-[0.66rem] font-semibold transition-all border-none ${
                  canGenerate
                    ? "bg-gradient-to-br from-header-gradient-from to-header-gradient-to text-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] cursor-pointer hover:brightness-110"
                    : "bg-studio-bg border border-select-border text-text-secondary opacity-25 cursor-not-allowed"
                }`}
              >
                {generating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : imageUrl ? (
                  <RefreshCw size={11} />
                ) : (
                  <Sparkles size={11} />
                )}
                {imageUrl ? "Regenerate" : "Generate"}
              </button>
            </Tooltip>

            {canSave && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[0.66rem] font-semibold text-white transition-all cursor-pointer hover:brightness-110 bg-green-500/85 shadow-[0_2px_12px_rgba(34,197,94,0.25)]"
              >
                <Save size={11} />
                Save
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
