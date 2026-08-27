import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  Mic,
  Loader2,
  ExternalLink,
  Radio,
  MousePointerClick,
} from "lucide-react";
import { GoogleGIcon } from "../GoogleAIModePanel";

export const GroqIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"
      fill="none"
    />
    <path
      d="M12 2.75C6.89 2.75 2.75 6.89 2.75 12S6.89 21.25 12 21.25 21.25 17.11 21.25 12 17.11 2.75 12 2.75zm3.85 11.2c-.85 1.4-2.28 2.3-3.85 2.3-2.62 0-4.75-2.13-4.75-4.75S9.38 6.75 12 6.75c1.57 0 3 0.9 3.85 2.3l-1.95 1.15c-.45-.75-1.15-1.2-1.9-1.2-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c.75 0 1.45-.45 1.9-1.2h-2.15v-2.25h4.4v3.15z"
      fill="#F55036"
    />
  </svg>
);

type KeyTarget = "assembly" | "groq" | "gemini";

export const SmartAISettings: React.FC = () => {
  const [assemblyInputKey, setAssemblyInputKey] = useState("");
  const [groqInputKey, setGroqInputKey] = useState("");
  const [geminiInputKey, setGeminiInputKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<"groq" | "gemini">("groq");
  const [autoProject, setAutoProject] = useState<boolean>(() => {
    try {
      return localStorage.getItem("smartAiAutoProject") === "true";
    } catch {
      return false;
    }
  });

  const handleAutoProjectChange = (enabled: boolean) => {
    setAutoProject(enabled);
    try {
      localStorage.setItem("smartAiAutoProject", String(enabled));
      window.dispatchEvent(
        new CustomEvent("smart-ai-settings-changed", {
          detail: { autoProject: enabled },
        }),
      );
    } catch (err) {
      console.error("Failed to save auto-project setting:", err);
    }
  };

  const [savingTarget, setSavingTarget] = useState<KeyTarget | null>(null);

  const [cardFeedback, setCardFeedback] = useState<{
    [key in KeyTarget]?: { type: "success" | "error"; message: string };
  }>({});

  const [keyStatus, setKeyStatus] = useState<{
    hasAssemblyAiKey: boolean;
    hasGroqKey: boolean;
    hasGeminiKey: boolean;
    maskedAssemblyAiKey: string;
    maskedGroqKey: string;
    maskedGeminiKey: string;
    selectedAiProvider: "groq" | "gemini";
  }>({
    hasAssemblyAiKey: false,
    hasGroqKey: false,
    hasGeminiKey: false,
    maskedAssemblyAiKey: "",
    maskedGroqKey: "",
    maskedGeminiKey: "",
    selectedAiProvider: "groq",
  });

  const loadStatus = useCallback(async () => {
    const api = (window as any)?.api;
    if (api?.getSmartProjectionKeyStatus) {
      try {
        const res = await api.getSmartProjectionKeyStatus();
        setKeyStatus(res);
        if (res.selectedAiProvider) {
          setSelectedProvider(res.selectedAiProvider);
        }
      } catch (err) {
        console.error("Failed to load AI keys status:", err);
      }
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const showFeedback = (target: KeyTarget, type: "success" | "error", message: string) => {
    setCardFeedback((prev) => ({ ...prev, [target]: { type, message } }));
    setTimeout(() => {
      setCardFeedback((prev) => {
        const next = { ...prev };
        delete next[target];
        return next;
      });
    }, 3500);
  };

  const handleOpenExternal = (url: string) => {
    const api = (window as any)?.api;
    if (api?.openExternal) {
      api.openExternal(url);
    } else if (typeof window !== "undefined" && (window as any).ipcRenderer) {
      (window as any).ipcRenderer.send("open-external", url);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleProviderChange = async (provider: "groq" | "gemini") => {
    setSelectedProvider(provider);
    const api = (window as any)?.api;
    if (api?.saveSmartProjectionKeys) {
      try {
        await api.saveSmartProjectionKeys({
          selectedAiProvider: provider,
        });
        await loadStatus();
      } catch (err) {
        console.error("Failed to update AI model selection:", err);
      }
    }
  };

  // Save AssemblyAI key individually
  const handleSaveAssemblyKey = async () => {
    if (!assemblyInputKey.trim()) return;
    const api = (window as any)?.api;
    if (!api?.saveSmartProjectionKeys) return;
    setSavingTarget("assembly");

    try {
      const res = await api.saveSmartProjectionKeys({
        assemblyAiKey: assemblyInputKey.trim(),
      });
      if (res.success) {
        setAssemblyInputKey("");
        showFeedback("assembly", "success", "AssemblyAI key saved successfully!");
        await loadStatus();
      } else {
        showFeedback("assembly", "error", res.error || "Failed to save key");
      }
    } catch (err: any) {
      showFeedback("assembly", "error", err?.message || "Failed to save key");
    } finally {
      setSavingTarget(null);
    }
  };

  // Clear AssemblyAI key individually
  const handleClearAssemblyKey = async () => {
    const api = (window as any)?.api;
    if (!api?.saveSmartProjectionKeys) return;
    if (!confirm("Are you sure you want to remove your AssemblyAI key?")) return;
    setSavingTarget("assembly");

    try {
      const res = await api.saveSmartProjectionKeys({
        assemblyAiKey: "",
      });
      if (res.success) {
        setAssemblyInputKey("");
        showFeedback("assembly", "success", "AssemblyAI key removed.");
        await loadStatus();
      }
    } catch (err: any) {
      showFeedback("assembly", "error", err?.message || "Failed to remove key");
    } finally {
      setSavingTarget(null);
    }
  };

  // Save Groq key individually
  const handleSaveGroqKey = async () => {
    if (!groqInputKey.trim()) return;
    const api = (window as any)?.api;
    if (!api?.saveSmartProjectionKeys) return;
    setSavingTarget("groq");

    try {
      const res = await api.saveSmartProjectionKeys({
        groqKey: groqInputKey.trim(),
      });
      if (res.success) {
        setGroqInputKey("");
        showFeedback("groq", "success", "Groq API key saved successfully!");
        await loadStatus();
      } else {
        showFeedback("groq", "error", res.error || "Failed to save key");
      }
    } catch (err: any) {
      showFeedback("groq", "error", err?.message || "Failed to save key");
    } finally {
      setSavingTarget(null);
    }
  };

  // Clear Groq key individually
  const handleClearGroqKey = async () => {
    const api = (window as any)?.api;
    if (!api?.saveSmartProjectionKeys) return;
    if (!confirm("Are you sure you want to remove your Groq key?")) return;
    setSavingTarget("groq");

    try {
      const res = await api.saveSmartProjectionKeys({
        groqKey: "",
      });
      if (res.success) {
        setGroqInputKey("");
        showFeedback("groq", "success", "Groq key removed.");
        await loadStatus();
      }
    } catch (err: any) {
      showFeedback("groq", "error", err?.message || "Failed to remove key");
    } finally {
      setSavingTarget(null);
    }
  };

  // Save Gemini key individually
  const handleSaveGeminiKey = async () => {
    if (!geminiInputKey.trim()) return;
    const api = (window as any)?.api;
    if (!api?.saveSmartProjectionKeys) return;
    setSavingTarget("gemini");

    try {
      const res = await api.saveSmartProjectionKeys({
        geminiKey: geminiInputKey.trim(),
      });
      if (res.success) {
        setGeminiInputKey("");
        showFeedback("gemini", "success", "Google Gemini key saved successfully!");
        await loadStatus();
      } else {
        showFeedback("gemini", "error", res.error || "Failed to save key");
      }
    } catch (err: any) {
      showFeedback("gemini", "error", err?.message || "Failed to save key");
    } finally {
      setSavingTarget(null);
    }
  };

  // Clear Gemini key individually
  const handleClearGeminiKey = async () => {
    const api = (window as any)?.api;
    if (!api?.saveSmartProjectionKeys) return;
    if (!confirm("Are you sure you want to remove your Google Gemini key?")) return;
    setSavingTarget("gemini");

    try {
      const res = await api.saveSmartProjectionKeys({
        geminiKey: "",
      });
      if (res.success) {
        setGeminiInputKey("");
        showFeedback("gemini", "success", "Google Gemini key removed.");
        await loadStatus();
      }
    } catch (err: any) {
      showFeedback("gemini", "error", err?.message || "Failed to remove key");
    } finally {
      setSavingTarget(null);
    }
  };

  return (
    <div className="w-full space-y-3.5 max-w-2xl overflow-y-auto no-scrollbar pb-10">
      {/* Section Header */}
      <div className="px-1">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Live Sermon Assistant</span>
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Listen to the preacher live and automatically display spoken Bible verses on the projector.
        </p>
      </div>

      {/* Security Status Card */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card-bg shadow-sm">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-select-bg text-emerald-500 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-primary">
            Safe &amp; Private
          </p>
          <p className="text-[0.68rem] text-text-secondary mt-0.5">
            Your keys are stored securely on this computer only and are never shared or sent anywhere else.
          </p>
        </div>
      </div>

      {/* AI Model Selector */}
      <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3">
        <div>
          <span className="text-xs font-bold text-text-primary">
            Choose Your AI Scripture Finder
          </span>
          <span className="block text-[0.68rem] text-text-secondary">
            Select how the assistant finds Bible verses from live sermon speech.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Groq Cloud Option */}
          <button
            type="button"
            onClick={() => handleProviderChange("groq")}
            className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${
              selectedProvider === "groq"
                ? "bg-btn-active-from text-white ring-2 ring-btn-active-from/50"
                : "bg-select-bg hover:bg-select-hover text-text-primary"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <GroqIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold">Groq (Fastest)</span>
              </div>
              <span
                className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedProvider === "groq"
                    ? "bg-white/20 text-white"
                    : "bg-card-bg text-text-secondary"
                }`}
              >
                Instant
              </span>
            </div>
            <p
              className={`text-[0.65rem] leading-tight ${
                selectedProvider === "groq"
                  ? "text-white/80"
                  : "text-text-secondary"
              }`}
            >
              Finds scriptures in less than a second. Best for live church services.
            </p>
          </button>

          {/* Google Gemini Option */}
          <button
            type="button"
            onClick={() => handleProviderChange("gemini")}
            className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${
              selectedProvider === "gemini"
                ? "bg-btn-active-from text-white ring-2 ring-btn-active-from/50"
                : "bg-select-bg hover:bg-select-hover text-text-primary"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <GoogleGIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Google Gemini</span>
              </div>
              <span
                className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedProvider === "gemini"
                    ? "bg-white/20 text-white"
                    : "bg-card-bg text-text-secondary"
                }`}
              >
                Smart
              </span>
            </div>
            <p
              className={`text-[0.65rem] leading-tight ${
                selectedProvider === "gemini"
                  ? "text-white/80"
                  : "text-text-secondary"
              }`}
            >
              Understands paraphrased verses, stories, and broader sermon topics.
            </p>
          </button>
        </div>
      </div>

      {/* ── Projection Mode: Auto vs Manual Approval ────────────────── */}
      <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3">
        <div>
          <span className="text-xs font-bold text-text-primary">
            Projection Trigger Mode
          </span>
          <span className="block text-[0.68rem] text-text-secondary">
            Choose whether detected scriptures project automatically to the audience or wait for operator click.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Automatic Option */}
          <button
            type="button"
            onClick={() => handleAutoProjectChange(true)}
            className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${
              autoProject
                ? "bg-btn-active-from text-white ring-2 ring-btn-active-from/50"
                : "bg-select-bg hover:bg-select-hover text-text-primary"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold">Auto-Project (Instant)</span>
              </div>
              <span
                className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                  autoProject
                    ? "bg-white/20 text-white"
                    : "bg-card-bg text-text-secondary"
                }`}
              >
                Auto
              </span>
            </div>
            <p
              className={`text-[0.65rem] leading-tight ${
                autoProject ? "text-white/80" : "text-text-secondary"
              }`}
            >
              Automatically sends detected scriptures to the live projector without clicking.
            </p>
          </button>

          {/* Manual Option */}
          <button
            type="button"
            onClick={() => handleAutoProjectChange(false)}
            className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${
              !autoProject
                ? "bg-btn-active-from text-white ring-2 ring-btn-active-from/50"
                : "bg-select-bg hover:bg-select-hover text-text-primary"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold">Manual (Click to Project)</span>
              </div>
              <span
                className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                  !autoProject
                    ? "bg-white/20 text-white"
                    : "bg-card-bg text-text-secondary"
                }`}
              >
                Manual
              </span>
            </div>
            <p
              className={`text-[0.65rem] leading-tight ${
                !autoProject ? "text-white/80" : "text-text-secondary"
              }`}
            >
              Lists detected scriptures in the sidebar so you can review and click when ready.
            </p>
          </button>
        </div>
      </div>

      {/* ── Key 1: AssemblyAI STT Key Card ────────────────────────────── */}
      <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-select-bg text-emerald-500 shadow-2xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary">
                Microphone Voice Listener
              </span>
              <span className="block text-[0.68rem] text-text-secondary">
                AssemblyAI key for live speech-to-text
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenExternal("https://www.assemblyai.com/dashboard/signup")}
              className="text-[0.68rem] text-text-secondary hover:text-btn-active-from flex items-center gap-1 font-medium transition-colors cursor-pointer mr-1"
              title="Get AssemblyAI API key"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span
              className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                keyStatus.hasAssemblyAiKey
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {keyStatus.hasAssemblyAiKey ? (
                <>
                  <CheckCircle2 className="w-2.8 h-2.8" />
                  <span>Ready ({keyStatus.maskedAssemblyAiKey})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-2.8 h-2.8" />
                  <span>Not Connected</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Input & Action Row */}
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder={
              keyStatus.hasAssemblyAiKey
                ? "Paste new key to replace existing..."
                : "Paste your AssemblyAI API key here..."
            }
            value={assemblyInputKey}
            onChange={(e) => setAssemblyInputKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveAssemblyKey();
            }}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-select-bg text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 focus:ring-btn-active-from border border-neutral-200/90 dark:border-transparent transition-all shadow-2xs"
          />

          <button
            type="button"
            onClick={handleSaveAssemblyKey}
            disabled={!assemblyInputKey.trim() || savingTarget === "assembly"}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-btn-active-from hover:opacity-90 disabled:opacity-40 text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            {savingTarget === "assembly" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save</span>
          </button>

          {keyStatus.hasAssemblyAiKey && (
            <button
              type="button"
              onClick={handleClearAssemblyKey}
              disabled={savingTarget === "assembly"}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
              title="Remove AssemblyAI Key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Card Feedback */}
        {cardFeedback.assembly && (
          <div
            className={`p-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 ${
              cardFeedback.assembly.type === "success"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {cardFeedback.assembly.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{cardFeedback.assembly.message}</span>
          </div>
        )}
      </div>

      {/* ── Key 2: Groq AI Key Card ────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-select-bg shadow-2xs">
              <GroqIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary">
                Groq Key (Fast Scripture Finder)
              </span>
              <span className="block text-[0.68rem] text-text-secondary">
                Free API key from console.groq.com
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenExternal("https://console.groq.com/keys")}
              className="text-[0.68rem] text-text-secondary hover:text-btn-active-from flex items-center gap-1 font-medium transition-colors cursor-pointer mr-1"
              title="Get Groq API key"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span
              className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                keyStatus.hasGroqKey
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {keyStatus.hasGroqKey ? (
                <>
                  <CheckCircle2 className="w-2.8 h-2.8" />
                  <span>Ready ({keyStatus.maskedGroqKey})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-2.8 h-2.8" />
                  <span>Not Connected</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Input & Action Row */}
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder={
              keyStatus.hasGroqKey
                ? "Paste new key to replace existing..."
                : "Paste your Groq key here (starts with gsk_)..."
            }
            value={groqInputKey}
            onChange={(e) => setGroqInputKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveGroqKey();
            }}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-select-bg text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 focus:ring-btn-active-from border border-neutral-200/90 dark:border-transparent transition-all shadow-2xs"
          />

          <button
            type="button"
            onClick={handleSaveGroqKey}
            disabled={!groqInputKey.trim() || savingTarget === "groq"}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-btn-active-from hover:opacity-90 disabled:opacity-40 text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            {savingTarget === "groq" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save</span>
          </button>

          {keyStatus.hasGroqKey && (
            <button
              type="button"
              onClick={handleClearGroqKey}
              disabled={savingTarget === "groq"}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
              title="Remove Groq Key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Card Feedback */}
        {cardFeedback.groq && (
          <div
            className={`p-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 ${
              cardFeedback.groq.type === "success"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {cardFeedback.groq.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{cardFeedback.groq.message}</span>
          </div>
        )}
      </div>

      {/* ── Key 3: Google Gemini Key Card ──────────────────────────────── */}
      <div className="p-4 rounded-xl bg-card-bg shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-select-bg shadow-2xs">
              <GoogleGIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary">
                Google Gemini Key (Smart Finder)
              </span>
              <span className="block text-[0.68rem] text-text-secondary">
                Free API key from aistudio.google.com
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenExternal("https://aistudio.google.com/app/apikey")}
              className="text-[0.68rem] text-text-secondary hover:text-btn-active-from flex items-center gap-1 font-medium transition-colors cursor-pointer mr-1"
              title="Get Google Gemini API key"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span
              className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                keyStatus.hasGeminiKey
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {keyStatus.hasGeminiKey ? (
                <>
                  <CheckCircle2 className="w-2.8 h-2.8" />
                  <span>Ready ({keyStatus.maskedGeminiKey})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-2.8 h-2.8" />
                  <span>Not Connected</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Input & Action Row */}
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder={
              keyStatus.hasGeminiKey
                ? "Paste new key to replace existing..."
                : "Paste your Google AI key here (starts with AIzaSy)..."
            }
            value={geminiInputKey}
            onChange={(e) => setGeminiInputKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveGeminiKey();
            }}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-select-bg text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 focus:ring-btn-active-from border border-neutral-200/90 dark:border-transparent transition-all shadow-2xs"
          />

          <button
            type="button"
            onClick={handleSaveGeminiKey}
            disabled={!geminiInputKey.trim() || savingTarget === "gemini"}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-btn-active-from hover:opacity-90 disabled:opacity-40 text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            {savingTarget === "gemini" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save</span>
          </button>

          {keyStatus.hasGeminiKey && (
            <button
              type="button"
              onClick={handleClearGeminiKey}
              disabled={savingTarget === "gemini"}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
              title="Remove Gemini Key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Card Feedback */}
        {cardFeedback.gemini && (
          <div
            className={`p-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 ${
              cardFeedback.gemini.type === "success"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {cardFeedback.gemini.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{cardFeedback.gemini.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
