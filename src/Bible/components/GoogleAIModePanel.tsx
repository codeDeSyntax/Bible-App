import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Loader2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListItem {
  title?: string;
  snippet?: string;
}

interface TextBlock {
  type: "heading" | "paragraph" | "list" | "expandable" | "comparison" | "code_block" | string;
  snippet?: string;
  list?: ListItem[];
  code?: string;
  language?: string;
}

interface QuickResult {
  title: string;
  link: string;
  snippet?: string;
  source?: string;
  displayed_link?: string;
  favicon?: string;
}

interface Reference {
  title: string;
  link: string;
  snippet?: string;
  source?: string;
  index: number;
}

interface RelatedQuestion {
  question: string;
}

interface AISearchResponse {
  text_blocks?: TextBlock[];
  quick_results?: QuickResult[];
  references?: Reference[];
  related_questions?: RelatedQuestion[];
  subsequent_request_token?: string;
  error?: string;
}

// ─── Google G icon ────────────────────────────────────────────────────────────

export const GoogleGIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// ─── Text block renderer ──────────────────────────────────────────────────────

const RenderBlock: React.FC<{ block: TextBlock; index: number }> = ({ block, index }) => {
  if (block.type === "heading")
    return <p key={index} className="text-sm font-bold text-text-primary mt-2 mb-0.5">{block.snippet}</p>;

  if (block.type === "paragraph" || block.type === "expandable")
    return <p key={index} className="text-sm text-text-primary leading-relaxed">{block.snippet}</p>;

  if (block.type === "list" && block.list)
    return (
      <ul key={index} className="space-y-2 pl-1">
        {block.list.map((item, j) => (
          <li key={j} className="flex gap-2.5 text-sm text-text-primary leading-relaxed">
            <span className="text-btn-active-from flex-shrink-0 font-bold mt-0.5">•</span>
            <span>
              {item.title && <strong className="font-semibold">{item.title}: </strong>}
              {item.snippet}
            </span>
          </li>
        ))}
      </ul>
    );

  if (block.type === "code_block" && block.code)
    return (
      <div key={index} className="rounded-xl bg-card-bg border border-select-border p-3.5">
        {block.language && <p className="text-[0.6rem] text-text-secondary uppercase tracking-widest mb-2">{block.language}</p>}
        <pre className="text-xs text-text-primary overflow-x-auto whitespace-pre-wrap leading-relaxed">{block.code}</pre>
      </div>
    );

  if (block.snippet)
    return <p key={index} className="text-sm text-text-primary leading-relaxed">{block.snippet}</p>;

  return null;
};

// ─── Google-colour spinner ────────────────────────────────────────────────────

const GoogleSpinner: React.FC = () => (
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 rounded-full border-2 border-select-border" />
    <div
      className="absolute inset-0 rounded-full border-2 animate-spin"
      style={{ borderColor: "transparent", borderTopColor: "#4285F4", borderRightColor: "#EA4335", borderBottomColor: "#FBBC05", borderLeftColor: "#34A853" }}
    />
    <div className="absolute inset-2 flex items-center justify-center">
      <GoogleGIcon className="w-5 h-5" />
    </div>
  </div>
);

interface AutocompleteSuggestion {
  value: string;
  value_highlight?: string;
  thumbnail?: string;
  subtitle?: string;
}

const QUICK_PROMPTS = ["Who wrote the book of Psalms?", "What is the Gospel?", "Explain the Trinity", "What does grace mean?"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface GoogleAIModePanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** When true, renders as an inline bento-grid panel (no modal wrapper/backdrop) */
  inline?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const GoogleAIModePanel: React.FC<GoogleAIModePanelProps> = ({ isOpen, onClose, inline = false }) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<AISearchResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [subsequentToken, setSubsequentToken] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(id);
    } else {
      setQuery(""); setResult(null); setStatus("idle"); setSubsequentToken(undefined); setErrorMsg("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const performSearch = useCallback(async (q: string, token?: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setStatus("loading"); setResult(null); setErrorMsg("");
    try {
      const data = (await (window as any).api.serpApiSearch(trimmed, token)) as AISearchResponse;
      if (data.error) throw new Error(data.error);
      setResult(data); setSubsequentToken(data.subsequent_request_token); setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Search failed — check connection");
      setStatus("error");
    }
  }, []);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setFocusedIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = (await (window as any).api.serpApiAutocomplete(val.trim())) as { suggestions?: AutocompleteSuggestion[] };
        const items = res.suggestions?.slice(0, 8) ?? [];
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch {}
    }, 300);
  }, []);

  const selectSuggestion = useCallback((s: AutocompleteSuggestion) => {
    setQuery(s.value);
    setSuggestions([]); setShowSuggestions(false); setFocusedIdx(-1);
    performSearch(s.value);
  }, [performSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, -1)); return; }
      if (e.key === "Escape") { setSuggestions([]); setShowSuggestions(false); setFocusedIdx(-1); return; }
      if (e.key === "Enter" && focusedIdx >= 0) { selectSuggestion(suggestions[focusedIdx]); return; }
    }
    if (e.key === "Enter") { setSuggestions([]); setShowSuggestions(false); performSearch(query); }
  }, [query, performSearch, showSuggestions, suggestions, focusedIdx, selectSuggestion]);

  const handleRelatedQuestion = useCallback((q: string) => {
    setQuery(q); performSearch(q, subsequentToken);
  }, [performSearch, subsequentToken]);

  const hasSources = (result?.quick_results && result.quick_results.length > 0) || (result?.references && result.references.length > 0);

  // ── Shared panel content ────────────────────────────────────────────────────
  const panel = (
    <div className="h-full w-full flex flex-col bg-studio-bg overflow-hidden rounded-xl border border-select-border">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-select-border bg-card-bg flex-shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <GoogleGIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-text-primary">AI Mode</span>
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
              placeholder="Ask Google AI anything…"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none border-none"
            />
            {status === "loading" && <Loader2 className="w-3.5 h-3.5 text-btn-active-from animate-spin flex-shrink-0" />}
            {query && status !== "loading" && (
              <div onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-select-hover transition-colors cursor-pointer flex-shrink-0">
                <X className="w-3 h-3 text-text-secondary" />
              </div>
            )}
          </div>
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card-bg border border-select-border rounded-xl shadow-2xl z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <div key={i} onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${i === focusedIdx ? "bg-select-hover" : "hover:bg-select-hover"}`}>
                  {s.thumbnail
                    ? <img src={s.thumbnail} alt="" className="w-5 h-5 rounded-sm object-cover flex-shrink-0" onError={(e) => (e.currentTarget.style.display = "none")} />
                    : <Search className="w-3.5 h-3.5 text-text-secondary flex-shrink-0 opacity-40" />}
                  <span className="flex-1 text-sm text-left">
                    {s.value_highlight ? (
                      <>
                        <span className="text-text-secondary">{s.value.slice(0, s.value.length - s.value_highlight.length)}</span>
                        <span className="font-semibold text-text-primary">{s.value_highlight}</span>
                      </>
                    ) : <span className="text-text-primary">{s.value}</span>}
                  </span>
                  {s.subtitle && <span className="text-xs text-text-secondary flex-shrink-0">{s.subtitle}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          onClick={() => performSearch(query)}
          // disabled={!query.trim() || status === "loading"}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-btn-active-from to-btn-active-to text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
        >
          Search
        </div>
        <div onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/15 text-text-secondary hover:text-red-400 transition-colors cursor-pointer flex-shrink-0" title="Close (Esc)">
          <X className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Idle */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-8">
            <div className="w-16 h-16 rounded-3xl bg-card-bg border border-select-border flex items-center justify-center shadow-sm">
              <GoogleGIcon className="w-9 h-9" />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-base font-semibold text-text-primary">Google AI Mode</p>
              <p className="text-sm text-text-secondary leading-relaxed mt-1.5">
                Ask any question and get AI-generated answers with sources, citations, and follow-up questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((prompt) => (
                <div key={prompt} onClick={() => { setQuery(prompt); performSearch(prompt); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card-bg border border-select-border text-xs text-text-secondary hover:text-text-primary hover:border-btn-active-from/60 hover:bg-select-hover transition-all cursor-pointer">
                  <Sparkles className="w-3 h-3 text-btn-active-from" />
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <GoogleSpinner />
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">Asking Google AI…</p>
              <p className="text-xs text-text-secondary mt-1">Generating answer with sources</p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
            <div className="flex items-start gap-4 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/25 max-w-md w-full">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Search failed</p>
                <p className="text-xs text-red-400/80 mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            <div onClick={() => performSearch(query)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card-bg border border-select-border text-sm text-text-secondary hover:text-text-primary hover:bg-select-hover transition-colors cursor-pointer">
              <RefreshCw className="w-4 h-4" />
              Try again
            </div>
          </div>
        )}

        {/* Results — two-column layout */}
        {status === "success" && result && (
          <div className="flex h-full">
            {/* Left: AI answer */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-btn-active-from" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">AI Overview</span>
                {subsequentToken && (
                  <div className="flex items-center gap-1.5 ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[0.6rem] font-medium text-emerald-400">Context active</span>
                  </div>
                )}
              </div>

              {result.text_blocks && result.text_blocks.length > 0 ? (
                <div className="space-y-3">
                  {result.text_blocks.map((block, i) => <RenderBlock key={i} block={block} index={i} />)}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-text-secondary">No AI overview available for this query.</p>
                </div>
              )}

              {result.related_questions && result.related_questions.length > 0 && (
                <section className="pt-4 border-t border-select-border">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">People also ask</p>
                  <div className="flex flex-wrap gap-2">
                    {result.related_questions.slice(0, 8).map((rq, i) => (
                      <div key={i} onClick={() => handleRelatedQuestion(rq.question)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-bg border border-select-border text-xs text-text-secondary hover:text-text-primary hover:border-btn-active-from/50 hover:bg-select-hover transition-all cursor-pointer text-left">
                        <Search className="w-3 h-3 flex-shrink-0 opacity-60" />
                        {rq.question}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!result.text_blocks?.length && !result.quick_results?.length && !result.references?.length && (
                <div className="py-20 text-center opacity-40">
                  <GoogleGIcon className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-sm text-text-secondary">No results returned.</p>
                </div>
              )}
            </div>

            {/* Right: Sources sidebar */}
            {hasSources && (
              <div className="w-[272px] flex-shrink-0 border-l border-select-border overflow-y-auto no-scrollbar px-4 py-5 space-y-4 bg-card-bg">
                {result.quick_results && result.quick_results.length > 0 && (
                  <section>
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Sources</p>
                    <div className="space-y-2">
                      {result.quick_results.slice(0, 5).map((qr, i) => (
                        <div key={i} onClick={() => (window as any).api.openInAppBrowser(qr.link)}
                          className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-studio-bg border border-select-border hover:bg-select-hover hover:border-text-secondary transition-all group cursor-pointer text-left">
                          {qr.favicon ? (
                            <img src={qr.favicon} alt="" className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                          ) : (
                            <div className="w-4 h-4 rounded-sm bg-btn-active-from/15 flex-shrink-0 mt-0.5 flex items-center justify-center">
                              <ExternalLink className="w-2.5 h-2.5 text-btn-active-from" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.76rem] font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-btn-active-from transition-colors">{qr.title}</p>
                            <p className="text-[0.63rem] text-text-secondary truncate mt-0.5">{qr.source || qr.displayed_link}</p>
                            {qr.snippet && <p className="text-[0.67rem] text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">{qr.snippet}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {result.references && result.references.length > 0 && (
                  <section className="pt-3 border-t border-select-border">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">References</p>
                    <div className="space-y-0.5">
                      {result.references.slice(0, 8).map((ref, i) => (
                        <div key={i} onClick={() => (window as any).api.openInAppBrowser(ref.link)}
                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-select-hover transition-colors group cursor-pointer text-left">
                          <span className="w-5 h-5 rounded-full bg-studio-bg border border-select-border flex items-center justify-center text-[0.55rem] font-bold text-text-secondary flex-shrink-0">
                            {ref.index ?? i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.73rem] text-text-primary truncate group-hover:text-btn-active-from transition-colors leading-snug">{ref.title}</p>
                            {ref.source && <p className="text-[0.6rem] text-text-secondary truncate">{ref.source}</p>}
                          </div>
                          <ChevronRight className="w-3 h-3 text-text-secondary opacity-0 group-hover:opacity-60 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── Inline mode: parent (BibleStudio) handles the slide animation ─────────
  if (inline) return panel;

  // ── Modal mode ────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="ai-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-[3px]" onClick={onClose} />
          <motion.div key="ai-modal" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9991] flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto" style={{ width: "min(90vw, 920px)", height: "min(87vh, 720px)" }}>
              {panel}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
