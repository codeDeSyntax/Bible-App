import React from "react";
import {
  Type,
  Layers2,
  Smile,
  ChevronDown,
  Check,
  Radio,
  Loader2,
  Undo2,
} from "lucide-react";
import { Tooltip, Popover } from "antd";
import {
  ALERT_TYPES,
  AlertType,
} from "@/Bible/components/AlertTemplates/alertTemplateTypes";
import {
  PencilSparkles,
  SYMBOL_LIST,
  TYPE_ICON_MAP,
} from "./AlertModalConstants";

interface AlertToolbarProps {
  isDarkMode: boolean;
  themeDefaultTextColor: string;
  applyColorToSelection: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  alertType: AlertType;
  onTypeSelect: (type: AlertType) => void;
  typePopoverOpen: boolean;
  setTypePopoverOpen: (open: boolean) => void;
  handleAiStyle: () => void;
  isGeneratingAi: boolean;
  isEmpty: boolean;
  symbolsPopoverOpen: boolean;
  setSymbolsPopoverOpen: (open: boolean) => void;
  insertEmoji: (symbol: string) => void;
  historyIndex: number;
  handleUndo: () => void;
}

export const AlertToolbar: React.FC<AlertToolbarProps> = ({
  isDarkMode,
  themeDefaultTextColor,
  applyColorToSelection,
  bgColor,
  setBgColor,
  alertType,
  onTypeSelect,
  typePopoverOpen,
  setTypePopoverOpen,
  handleAiStyle,
  isGeneratingAi,
  isEmpty,
  symbolsPopoverOpen,
  setSymbolsPopoverOpen,
  insertEmoji,
  historyIndex,
  handleUndo,
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Text colour picker */}
      <Tooltip title="Text colour (highlight text to style)" placement="top">
        <label
          className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
            isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
        >
          <Type
            className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
          />
          <span>Text</span>
          <input
            key={themeDefaultTextColor}
            type="color"
            defaultValue={themeDefaultTextColor}
            onChange={(e) => applyColorToSelection(e.target.value)}
            className="sr-only"
          />
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-black/20 dark:ring-white/30"
            style={{ backgroundColor: themeDefaultTextColor }}
          />
        </label>
      </Tooltip>

      {/* Background colour picker */}
      <Tooltip title="Background colour for the alert" placement="top">
        <label
          className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
            isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
        >
          <Layers2
            className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
          />
          <span>Background</span>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="sr-only"
          />
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-black/20 dark:ring-white/30"
            style={{ backgroundColor: bgColor }}
          />
        </label>
      </Tooltip>

      {/* Alert Type / Category Selector Button */}
      <Popover
        open={typePopoverOpen}
        onOpenChange={setTypePopoverOpen}
        trigger="click"
        placement="bottom"
        arrow={false}
        styles={{
          container: {
            backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
            borderRadius: "12px",
            padding: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.12)"
              : "1px solid rgba(0,0,0,0.1)",
          },
        }}
        content={
          <div className="flex flex-col gap-1 w-[240px]">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800 px-1">
              <span className="text-[0.66rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Alert Type
              </span>
              <button
                type="button"
                onClick={() => setTypePopoverOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-1 py-1">
              {ALERT_TYPES.map((typeItem) => {
                const isSelected = alertType === typeItem.id;
                const Icon = TYPE_ICON_MAP[typeItem.id] || Radio;

                return (
                  <button
                    key={typeItem.id}
                    type="button"
                    onClick={() => {
                      onTypeSelect(typeItem.id);
                      setTypePopoverOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? isDarkMode
                          ? "bg-zinc-800 text-white font-semibold ring-1 ring-white/10"
                          : "bg-zinc-100 text-zinc-900 font-semibold ring-1 ring-black/5"
                        : isDarkMode
                        ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected
                            ? isDarkMode
                              ? "bg-zinc-700 text-lime-400"
                              : "bg-zinc-200 text-lime-600"
                            : isDarkMode
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="leading-tight font-medium text-[0.76rem]">
                          {typeItem.label}
                        </span>
                        <span className="text-[0.62rem] text-zinc-400 dark:text-zinc-500 font-normal leading-tight">
                          {typeItem.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-lime-400 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        <button
          type="button"
          className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
            typePopoverOpen
              ? isDarkMode
                ? "bg-zinc-700 text-white"
                : "bg-zinc-200 text-zinc-900"
              : isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
        >
          {(() => {
            const CurrentIcon = TYPE_ICON_MAP[alertType] || Radio;
            const currentLabel =
              ALERT_TYPES.find((t) => t.id === alertType)?.label || "Type";
            return (
              <>
                <CurrentIcon
                  className={`w-3 h-3 ${
                    isDarkMode ? "text-zinc-400" : "text-zinc-500"
                  }`}
                />
                <span>{currentLabel}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </>
            );
          })()}
        </button>
      </Popover>

      {/* AI Auto-Style chip */}
      <Tooltip
        title={isEmpty ? "Type content first" : `Auto-format ${alertType} with AI`}
        placement="top"
      >
        <button
          type="button"
          onClick={handleAiStyle}
          disabled={isEmpty || isGeneratingAi}
          className={`h-6 px-2.5 rounded-lg text-[0.7rem] font-bold flex items-center gap-1 transition-all shrink-0 ${
            isGeneratingAi
              ? "bg-lime-400 text-lime-950 animate-pulse cursor-wait"
              : isEmpty
              ? isDarkMode
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              : "bg-lime-400 hover:bg-lime-300 text-lime-950 cursor-pointer shadow-xs active:scale-95"
          }`}
        >
          {isGeneratingAi ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <PencilSparkles className="w-3 h-3" />
          )}
          <span>AI Style</span>
        </button>
      </Tooltip>

      {/* Symbols Popover Menu Chip */}
      <Popover
        open={symbolsPopoverOpen}
        onOpenChange={setSymbolsPopoverOpen}
        trigger="click"
        placement="bottom"
        arrow={false}
        styles={{
          container: {
            backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
            borderRadius: "12px",
            padding: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.12)"
              : "1px solid rgba(0,0,0,0.1)",
          },
        }}
        content={
          <div className="flex flex-col gap-1.5 w-[220px]">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800 px-1">
              <span className="text-[0.66rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Insert Symbol
              </span>
              <button
                type="button"
                onClick={() => setSymbolsPopoverOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1 max-h-[160px] overflow-y-auto no-scrollbar p-0.5">
              {SYMBOL_LIST.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => {
                    insertEmoji(symbol);
                    setSymbolsPopoverOpen(false);
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[0.85rem] font-mono active:scale-90 transition-all cursor-pointer ${
                    isDarkMode
                      ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                  }`}
                  title={symbol}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <button
          type="button"
          className={`h-6 px-2 rounded-lg text-[0.7rem] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs ${
            symbolsPopoverOpen
              ? isDarkMode
                ? "bg-zinc-700 text-white"
                : "bg-zinc-200 text-zinc-900"
              : isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
        >
          <Smile
            className={`w-3 h-3 ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
          />
          <span>Symbols</span>
        </button>
      </Popover>

      {/* Undo */}
      {historyIndex > 0 && (
        <Tooltip title="Undo (Ctrl+Z)" placement="top">
          <button
            type="button"
            onClick={handleUndo}
            className={`h-6 px-2 rounded-lg text-[0.7rem] flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs ${
              isDarkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Undo2 className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </Tooltip>
      )}
    </div>
  );
};
