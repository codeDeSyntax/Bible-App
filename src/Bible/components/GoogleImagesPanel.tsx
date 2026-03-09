import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Download,
  ZoomIn,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AutocompleteSuggestion {
  value: string;
  value_highlight?: string;
  thumbnail?: string;
  subtitle?: string;
}

interface ImageResult {
  position: number;
  thumbnail: string;
  original?: string;
  original_width?: number;
  original_height?: number;
  title?: string;
  link?: string;
  source?: string;
  source_logo?: string;
  tag?: string;
}

interface SuggestedSearch {
  name: string;
  q?: string;
  thumbnail?: string;
}
interface RelatedSearch {
  query: string;
  thumbnail?: string;
}

interface ImagesResponse {
  images_results?: ImageResult[];
  suggested_searches?: SuggestedSearch[];
  related_searches?: RelatedSearch[];
  error?: string;
}

// ─── Google Images icon ───────────────────────────────────────────────────────

const GoogleImagesIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#4285F4" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#EA4335" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#34A853" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#FBBC05" />
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────

const GoogleSpinner: React.FC = () => (
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 rounded-full border-2 border-select-border" />
    <div
      className="absolute inset-0 rounded-full border-2 animate-spin"
      style={{
        borderColor: "transparent",
        borderTopColor: "#4285F4",
        borderRightColor: "#EA4335",
        borderBottomColor: "#FBBC05",
        borderLeftColor: "#34A853",
      }}
    />
    <div className="absolute inset-2 flex items-center justify-center">
      <GoogleImagesIcon className="w-5 h-5" />
    </div>
  </div>
);

// ─── Image card ───────────────────────────────────────────────────────────────

const ImageCard: React.FC<{
  img: ImageResult;
  onExpand: (img: ImageResult) => void;
}> = ({ img, onExpand }) => (
  <div className="group relative rounded-xl overflow-hidden bg-studio-bg border border-select-border hover:border-text-secondary hover:shadow-lg transition-all duration-200">
    <div
      className="relative w-full overflow-hidden bg-studio-bg cursor-pointer"
      onClick={() => onExpand(img)}
    >
      <img
        src={img.thumbnail}
        alt={img.title ?? ""}
        loading="lazy"
        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <ZoomIn className="w-4 h-4 text-white" />
        </div>
      </div>
      {img.original_width && img.original_height && (
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[0.55rem] text-white/80 font-medium">
            {img.original_width}×{img.original_height}
          </span>
        </div>
      )}
    </div>
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
      <button
        onClick={(e) => {
          e.stopPropagation();
          (window as any).api.openInAppBrowser(img.original ?? img.thumbnail);
        }}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-[0.65rem] text-white font-medium cursor-pointer transition-colors"
        title="View full image"
      >
        <div className="w-3.5 h-3.5 flex items-center justify-center">⛶</div>
        <span>View</span>
      </button>
    </div>
    <div className="px-2.5 py-2">
      {img.title && (
        <p className="text-[0.72rem] font-medium text-text-primary leading-snug line-clamp-2">
          {img.title}
        </p>
      )}
      {img.source && (
        <div className="flex items-center gap-1 mt-1">
          {img.source_logo && (
            <img
              src={img.source_logo}
              alt=""
              className="w-3 h-3 rounded-sm object-contain flex-shrink-0"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <p className="text-[0.62rem] text-text-secondary truncate">
            {img.source}
          </p>
        </div>
      )}
    </div>
  </div>
);

const Lightbox: React.FC<{ img: ImageResult; onClose: () => void }> = ({
  img,
  onClose,
}) => (
  <motion.div
    key="lightbox"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="relative max-w-[80vw] max-h-[82vh] flex flex-col items-center gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={img.original ?? img.thumbnail}
        alt={img.title ?? ""}
        className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          if (el.src !== img.thumbnail) el.src = img.thumbnail;
        }}
      />
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 max-w-full">
        <div className="min-w-0 flex-1">
          {img.title && (
            <p className="text-sm font-semibold text-white leading-snug truncate">
              {img.title}
            </p>
          )}
          {img.source && (
            <p className="text-xs text-white/60 truncate mt-0.5">
              {img.source}
            </p>
          )}
          {img.original_width && img.original_height && (
            <p className="text-xs text-white/40 mt-0.5">
              {img.original_width} × {img.original_height}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {img.link && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs text-white/80 font-medium cursor-pointer border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                (window as any).api.openInAppBrowser(img.link!);
              }}
            >
              <ExternalLink className="w-3 h-3" /> Source
            </button>
          )}
          {img.original && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs text-white/80 font-medium cursor-pointer border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                const url = img.original!;
                const ext = url.split("?")[0].split(".").pop() || "jpg";
                const filename =
                  (img.title ?? "image")
                    .replace(/[^a-z0-9]/gi, "_")
                    .slice(0, 60) +
                  "." +
                  ext;
                (window as any).api.downloadImage(url, filename);
              }}
            >
              <Download className="w-3 h-3" /> Download
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer border border-white/10"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface GoogleImagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** When true, renders as an inline bento-grid panel (no modal wrapper/backdrop) */
  inline?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const GoogleImagesPanel: React.FC<GoogleImagesPanelProps> = ({
  isOpen,
  onClose,
  inline = false,
}) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [data, setData] = useState<ImagesResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState<ImageResult | null>(null);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(id);
    } else {
      setQuery("");
      setData(null);
      setStatus("idle");
      setErrorMsg("");
      setExpanded(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (expanded) setExpanded(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose, expanded]);

  const performSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setStatus("loading");
    setData(null);
    setErrorMsg("");
    try {
      const result = (await (window as any).api.serpApiImages(
        trimmed,
      )) as ImagesResponse;
      if (result.error) throw new Error(result.error);
      setData(result);
      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Search failed — check connection",
      );
      setStatus("error");
    }
  }, []);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      setFocusedIdx(-1);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (val.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      debounceRef.current = window.setTimeout(async () => {
        try {
          const res = (await (window as any).api.serpApiAutocomplete(
            val.trim(),
          )) as { suggestions?: AutocompleteSuggestion[] };
          const items = res.suggestions?.slice(0, 8) ?? [];
          setSuggestions(items);
          setShowSuggestions(items.length > 0);
        } catch {}
      }, 300);
    },
    [],
  );

  const selectSuggestion = useCallback(
    (s: AutocompleteSuggestion) => {
      setQuery(s.value);
      setSuggestions([]);
      setShowSuggestions(false);
      setFocusedIdx(-1);
      performSearch(s.value);
    },
    [performSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedIdx((i) => Math.min(i + 1, suggestions.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedIdx((i) => Math.max(i - 1, -1));
          return;
        }
        if (e.key === "Escape") {
          setSuggestions([]);
          setShowSuggestions(false);
          setFocusedIdx(-1);
          return;
        }
        if (e.key === "Enter" && focusedIdx >= 0) {
          selectSuggestion(suggestions[focusedIdx]);
          return;
        }
      }
      if (e.key === "Enter") {
        setSuggestions([]);
        setShowSuggestions(false);
        performSearch(query);
      }
    },
    [
      query,
      performSearch,
      showSuggestions,
      suggestions,
      focusedIdx,
      selectSuggestion,
    ],
  );

  const images = data?.images_results ?? [];
  const suggested = data?.suggested_searches ?? [];
  const related = data?.related_searches ?? [];

  // ── Shared panel content ──────────────────────────────────────────────────
  const panel = (
    <div className="h-full w-full flex flex-col bg-studio-bg overflow-hidden rounded-xl border border-select-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-select-border bg-card-bg flex-shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <GoogleImagesIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Images
          </span>
        </div>
        <div className="w-px h-5 bg-select-border flex-shrink-0" />
        {/* Search pill with autocomplete */}
        <div className="flex-1 relative">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-studio-bg border border-select-border focus-within:border-btn-active-from/70 hover:border-text-secondary transition-colors duration-200">
            <Search className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search Google Images…"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none border-none"
            />
            {status === "loading" && (
              <Loader2 className="w-3.5 h-3.5 text-btn-active-from animate-spin flex-shrink-0" />
            )}
            {query && status !== "loading" && (
              <button
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-select-hover transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-3 h-3 text-text-secondary" />
              </button>
            )}
          </div>
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card-bg border border-select-border rounded-xl shadow-2xl z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${i === focusedIdx ? "bg-select-hover" : "hover:bg-select-hover"}`}
                >
                  {s.thumbnail ? (
                    <img
                      src={s.thumbnail}
                      alt=""
                      className="w-5 h-5 rounded-sm object-cover flex-shrink-0"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-text-secondary flex-shrink-0 opacity-40" />
                  )}
                  <span className="flex-1 text-sm text-left">
                    {s.value_highlight ? (
                      <>
                        <span className="text-text-secondary">
                          {s.value.slice(
                            0,
                            s.value.length - s.value_highlight.length,
                          )}
                        </span>
                        <span className="font-semibold text-text-primary">
                          {s.value_highlight}
                        </span>
                      </>
                    ) : (
                      <span className="text-text-primary">{s.value}</span>
                    )}
                  </span>
                  {s.subtitle && (
                    <span className="text-xs text-text-secondary flex-shrink-0">
                      {s.subtitle}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => performSearch(query)}
          disabled={!query.trim() || status === "loading"}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-btn-active-from to-btn-active-to text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
        >
          Search
        </button>
        {status === "success" && images.length > 0 && (
          <span className="text-xs text-text-secondary font-medium flex-shrink-0">
            {images.length} results
          </span>
        )}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/15 text-text-secondary hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter chips */}
      {suggested.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-select-border bg-card-bg flex-shrink-0 overflow-x-auto no-scrollbar">
          <span className="text-xs text-text-secondary font-medium flex-shrink-0">
            Suggested:
          </span>
          {suggested.slice(0, 14).map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(s.name);
                performSearch(s.name);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-studio-bg border border-select-border text-xs text-text-secondary hover:text-text-primary hover:border-btn-active-from/60 hover:bg-select-hover transition-all cursor-pointer flex-shrink-0 whitespace-nowrap"
            >
              {s.thumbnail && (
                <img
                  src={s.thumbnail}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {/* Idle */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-8">
            <div className="w-16 h-16 rounded-3xl bg-card-bg border border-select-border flex items-center justify-center shadow-sm">
              <GoogleImagesIcon className="w-9 h-9" />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-base font-semibold text-text-primary">
                Google Images
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mt-1.5">
                Search for images. Click any result to view it full size or
                visit the source.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <GoogleSpinner />
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">
                Searching Google Images…
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Loading results
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
            <div className="flex items-start gap-4 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/25 max-w-md w-full">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">
                  Search failed
                </p>
                <p className="text-xs text-red-400/80 mt-1 leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            </div>
            <button
              onClick={() => performSearch(query)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card-bg border border-select-border text-sm text-text-secondary hover:text-text-primary hover:bg-select-hover transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </div>
        )}

        {/* Results grid */}
        {status === "success" && images.length > 0 && (
          <div className="p-4">
            <div className="columns-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="break-inside-avoid mb-3">
                  <ImageCard img={img} onExpand={setExpanded} />
                </div>
              ))}
            </div>
            {related.length > 0 && (
              <div className="mt-6 pt-5 border-t border-select-border">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Related searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {related.slice(0, 14).map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(r.query);
                        performSearch(r.query);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card-bg border border-select-border text-xs text-text-secondary hover:text-text-primary hover:border-btn-active-from/60 hover:bg-select-hover transition-all cursor-pointer"
                    >
                      {r.thumbnail && (
                        <img
                          src={r.thumbnail}
                          alt=""
                          className="w-4 h-4 rounded object-cover flex-shrink-0"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      )}
                      <Search className="w-3 h-3 opacity-50" />
                      {r.query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {status === "success" && images.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <GoogleImagesIcon className="w-8 h-8 opacity-30" />
            <p className="text-sm text-text-secondary">
              No images found for "{query}"
            </p>
            <p className="text-xs text-text-secondary opacity-70">
              Try a different search term
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── Inline mode: parent handles the slide animation ───────────────────────
  if (inline)
    return (
      <>
        {panel}
        <AnimatePresence>
          {expanded && (
            <Lightbox img={expanded} onClose={() => setExpanded(null)} />
          )}
        </AnimatePresence>
      </>
    );

  // ── Modal mode ────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="img-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-[3px]"
              onClick={onClose}
            />
            <motion.div
              key="img-modal"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[9991] flex items-center justify-center pointer-events-none"
            >
              <div
                className="pointer-events-auto"
                style={{
                  width: "min(90vw, 920px)",
                  height: "min(87vh, 720px)",
                }}
              >
                {panel}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {expanded && (
          <Lightbox img={expanded} onClose={() => setExpanded(null)} />
        )}
      </AnimatePresence>
    </>
  );
};
