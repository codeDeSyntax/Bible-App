import React from "react";
import { ScrollText, Megaphone } from "lucide-react";
import { Tooltip } from "antd";
import {
  ALERT_TEMPLATES,
  AlertTemplateId,
} from "@/Bible/components/AlertTemplates/alertTemplateTypes";
import { TEMPLATE_ICON_MAP } from "./AlertModalConstants";

interface AlertTemplateSelectorProps {
  isDarkMode: boolean;
  selectedTemplateId: AlertTemplateId;
  onSelectTemplate: (id: AlertTemplateId) => void;
  isEmpty: boolean;
  editingAlertId: string | null | undefined;
  onSave: () => void;
  onCancel: () => void;
}

export const AlertTemplateSelector: React.FC<AlertTemplateSelectorProps> = ({
  isDarkMode,
  selectedTemplateId,
  onSelectTemplate,
  isEmpty,
  editingAlertId,
  onSave,
  onCancel,
}) => {
  return (
    <div className="flex items-stretch gap-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
      {/* Left Column: Template Styles */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
        <span
          className={`text-[0.62rem] font-bold uppercase tracking-wider ${
            isDarkMode ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Template Style
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {ALERT_TEMPLATES.map((tmpl) => {
            const isActive = selectedTemplateId === tmpl.id;
            const Icon =
              TEMPLATE_ICON_MAP[tmpl.id as AlertTemplateId] || ScrollText;
            const baseBg = isDarkMode ? "#27272a" : "#f4f4f5";

            const gradientStyle: React.CSSProperties = isActive
              ? {
                  background: isDarkMode
                    ? `linear-gradient(90deg, ${tmpl.accentColor} 0%, ${tmpl.accentColor} 20%, color-mix(in srgb, ${tmpl.accentColor} 35%, #27272a) 45%, #27272a 100%)`
                    : `linear-gradient(90deg, ${tmpl.accentColor} 0%, ${tmpl.accentColor} 20%, color-mix(in srgb, ${tmpl.accentColor} 25%, #f4f4f5) 45%, #f4f4f5 100%)`,
                  boxShadow: `0 0 0 1.5px ${tmpl.accentColor}`,
                }
              : {
                  background: `linear-gradient(90deg, color-mix(in srgb, ${tmpl.accentColor} 75%, transparent) 0%, color-mix(in srgb, ${tmpl.accentColor} 55%, transparent) 18%, color-mix(in srgb, ${tmpl.accentColor} 15%, ${baseBg}) 30%, ${baseBg} 45%, ${baseBg} 100%)`,
                };

            return (
              <Tooltip
                key={tmpl.id}
                title={`${tmpl.label} — ${tmpl.description}`}
                placement="top"
              >
                <button
                  type="button"
                  onClick={() =>
                    onSelectTemplate(tmpl.id as AlertTemplateId)
                  }
                  className={`h-7 px-2 rounded-lg text-[0.68rem] shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 border ${
                    isActive
                      ? "font-bold text-zinc-100 dark:text-zinc-100 border-transparent"
                      : isDarkMode
                      ? "font-medium text-zinc-300 hover:text-zinc-100 border-zinc-700/50 hover:border-zinc-600"
                      : "font-medium text-zinc-700 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300"
                  }`}
                  style={gradientStyle}
                >
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255, 255, 255, 0.22)"
                        : `color-mix(in srgb, ${tmpl.accentColor} 25%, ${
                            isDarkMode ? "#18181b" : "#ffffff"
                          })`,
                    }}
                  >
                    <Icon
                      className="w-2.5 h-2.5 shrink-0"
                      style={{
                        color: isActive ? "#ffffff" : tmpl.accentColor,
                      }}
                    />
                  </div>
                  <span className="pr-1">{tmpl.label}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Right Column: Action Buttons */}
      <div className="w-[25%] min-w-[130px] shrink-0 flex flex-col justify-center gap-2 pl-3 border-l border-zinc-200/60 dark:border-zinc-800/60">
        <Tooltip
          title={isEmpty ? "Type a message first" : "Save to alert list"}
          placement="top"
        >
          <button
            type="button"
            onClick={onSave}
            disabled={isEmpty}
            className={`w-full h-9 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
              isEmpty
                ? "opacity-40 cursor-not-allowed bg-select-bg text-text-secondary"
                : "cursor-pointer bg-gradient-to-r from-btn-active-from to-btn-active-to hover:opacity-90 text-white active:scale-98"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 shrink-0" />
            <span>{editingAlertId ? "Update Alert" : "Save Alert"}</span>
          </button>
        </Tooltip>

        <button
          type="button"
          onClick={onCancel}
          className="w-full h-8 px-3 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-studio-bg dark:hover:bg-select-hover text-text-primary transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
