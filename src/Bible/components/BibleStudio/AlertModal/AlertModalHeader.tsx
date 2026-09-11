import React from "react";
import { X, FlaskConical } from "lucide-react";
import { Tooltip } from "antd";

interface AlertModalHeaderProps {
  alertTitle: string;
  onTitleChange: (title: string) => void;
  onAutofillTestData: () => void;
  onCancel: () => void;
  aiError: string | null;
  onClearAiError: () => void;
  isDarkMode: boolean;
}

export const AlertModalHeader: React.FC<AlertModalHeaderProps> = ({
  alertTitle,
  onTitleChange,
  onAutofillTestData,
  onCancel,
  aiError,
  onClearAiError,
  isDarkMode,
}) => {
  return (
    <>
      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={alertTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Alert headline or title..."
          className={`flex-1 min-w-0 bg-transparent outline-none font-sans text-[0.85rem] font-bold p-0 leading-tight tracking-tight ${
            isDarkMode
              ? "text-zinc-100 placeholder:text-zinc-500"
              : "text-zinc-900 placeholder:text-zinc-400"
          }`}
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {Boolean(import.meta.env.DEV) && (
            <Tooltip title="Autofill sample test data (Dev Mode)" placement="top">
              <button
                type="button"
                onClick={onAutofillTestData}
                className={`h-5.5 px-1.5 rounded-md flex items-center gap-1 text-[0.66rem] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                  isDarkMode
                    ? "text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20"
                    : "text-amber-800 bg-amber-100/80 hover:bg-amber-200 border border-amber-300/40"
                }`}
                aria-label="Autofill sample test data"
              >
                <FlaskConical size={11} className="shrink-0" />
                <span>Dev Fill</span>
              </button>
            </Tooltip>
          )}

          <Tooltip title="Close (Esc)" placement="top">
            <button
              type="button"
              onClick={onCancel}
              className={`w-5.5 h-5.5 rounded-md flex items-center justify-center bg-transparent transition-colors cursor-pointer flex-shrink-0 ${
                isDarkMode
                  ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              }`}
              aria-label="Close"
            >
              <X size={13} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── AI Error (if any) ── */}
      {aiError && (
        <div className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[0.68rem] flex items-center justify-between">
          <span>{aiError}</span>
          <button
            type="button"
            onClick={onClearAiError}
            className="font-bold ml-2 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};
