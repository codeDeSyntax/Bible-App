import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
  action?: ToastAction;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// ─── Global Shared Toast Store (Singleton) ───────────────────────────────────

type ToastListener = (toasts: Toast[]) => void;
let globalToasts: Toast[] = [];
const listeners = new Set<ToastListener>();
const toastTimers = new Map<string, NodeJS.Timeout>();
let lastEmittedKey = "";
let lastEmittedTime = 0;

function notifyListeners() {
  listeners.forEach((listener) => listener([...globalToasts]));
}

export const toast = {
  show: (options: {
    title?: string;
    message: string;
    type?: NotificationType;
    duration?: number;
    action?: ToastAction;
    icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }) => {
    const key = `${options.type || "info"}-${options.title || ""}-${options.message}`;
    const now = Date.now();

    // Prevent identical duplicate toast spam within 1.5s
    if (key === lastEmittedKey && now - lastEmittedTime < 1500) {
      return;
    }
    lastEmittedKey = key;
    lastEmittedTime = now;

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const duration = options.duration ?? (options.type === "error" ? 5000 : 4000);

    const newToast: Toast = {
      id,
      title: options.title,
      message: options.message,
      type: options.type || "info",
      duration,
      action: options.action,
      icon: options.icon,
    };

    // Keep at most 3 active toasts at once
    globalToasts = [newToast, ...globalToasts.filter((t) => t.id !== id)].slice(0, 3);
    notifyListeners();

    if (duration > 0) {
      const timer = setTimeout(() => {
        toast.dismiss(id);
      }, duration);
      toastTimers.set(id, timer);
    }
  },

  success: (message: string, title?: string, duration?: number) => {
    toast.show({ message, title, type: "success", duration });
  },

  error: (message: string, title?: string, duration?: number) => {
    toast.show({ message, title, type: "error", duration });
  },

  warning: (message: string, title?: string, duration?: number) => {
    toast.show({ message, title, type: "warning", duration });
  },

  info: (message: string, title?: string, duration?: number) => {
    toast.show({ message, title, type: "info", duration });
  },

  loading: (message: string, title?: string) => {
    toast.show({ message, title, type: "loading", duration: 0 });
  },

  dismiss: (id: string) => {
    const timer = toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }
    globalToasts = globalToasts.filter((t) => t.id !== id);
    notifyListeners();
  },

  clearAll: () => {
    toastTimers.forEach((t) => clearTimeout(t));
    toastTimers.clear();
    globalToasts = [];
    notifyListeners();
  },
};

// Global event bridge
export function emitAppNotification(options: {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number;
  action?: ToastAction;
}) {
  toast.show(options);
}

// ─── React Hook for Global Toasts ───────────────────────────────────────────

export function useGlobalToasts() {
  const [toasts, setToasts] = useState<Toast[]>(() => globalToasts);

  useEffect(() => {
    const update = (updated: Toast[]) => setToasts(updated);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    toasts,
    dismissToast: toast.dismiss,
    showNotification: (msg: string | Parameters<typeof toast.show>[0], type?: NotificationType, dur?: number) => {
      if (typeof msg === "string") {
        toast.show({ message: msg, type: type || "info", duration: dur });
      } else {
        toast.show(msg);
      }
    },
  };
}

// ─── Theme-Responsive Type Icons ────────────────────────────────────────────

const TYPE_ICONS = {
  success: (
    <div className="w-5 h-5 rounded-full bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 dark:border-emerald-400/30 flex items-center justify-center flex-shrink-0 shadow-2xs">
      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
    </div>
  ),
  error: (
    <div className="w-5 h-5 rounded-full bg-red-500/15 dark:bg-red-400/20 text-red-600 dark:text-red-400 border border-red-500/25 dark:border-red-400/30 flex items-center justify-center flex-shrink-0 shadow-2xs">
      <X className="w-3.5 h-3.5 stroke-[2.5]" />
    </div>
  ),
  warning: (
    <div className="w-5 h-5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 dark:border-amber-400/30 flex items-center justify-center flex-shrink-0 shadow-2xs">
      <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
    </div>
  ),
  info: (
    <div className="w-5 h-5 rounded-full bg-sky-500/15 dark:bg-sky-400/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 dark:border-sky-400/30 flex items-center justify-center flex-shrink-0 shadow-2xs">
      <Info className="w-3.5 h-3.5 stroke-[2.5]" />
    </div>
  ),
  loading: (
    <div
      style={{
        backgroundColor: "var(--select-hover, rgba(0,0,0,0.05))",
        borderColor: "var(--select-border, rgba(0,0,0,0.1))",
        color: "var(--text-primary, #18181b)",
      }}
      className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 shadow-2xs"
    >
      <Loader2 className="w-3.5 h-3.5 stroke-[2.5] animate-spin" />
    </div>
  ),
};

interface ToasterProps {
  toasts?: Toast[];
  onDismiss?: (id: string) => void;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
  isDarkMode?: boolean;
}

export const Toaster: React.FC<ToasterProps> = ({
  toasts: propsToasts,
  onDismiss: propsOnDismiss,
  position = "top-right",
}) => {
  const { toasts: hookToasts, dismissToast: hookDismiss } = useGlobalToasts();
  const activeToasts = propsToasts ?? hookToasts;
  const dismiss = propsOnDismiss ?? hookDismiss;

  const positionClasses = {
    "top-center": "top-5 left-1/2 -translate-x-1/2 items-center",
    "top-right": "top-5 right-5 items-end",
    "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-5 right-5 items-end",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[999999] pointer-events-none flex flex-col gap-2`}
      style={{ width: "auto", maxWidth: "min(92vw, 420px)" }}
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{
              type: "spring",
              stiffness: 460,
              damping: 30,
              mass: 0.6,
            }}
            className="pointer-events-auto"
          >
            <div
              onClick={() => dismiss(t.id)}
              style={{
                backgroundColor: "var(--card-bg, #ffffff)",
                borderColor: "var(--select-border, #e5e5e5)",
                color: "var(--text-primary, #18181b)",
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border backdrop-blur-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform select-none"
            >
              {/* Status Icon */}
              {t.icon ? <t.icon className="w-5 h-5 flex-shrink-0" /> : TYPE_ICONS[t.type]}

              {/* Message Content */}
              <div className="flex flex-col min-w-0 pr-1">
                {t.title && (
                  <span
                    style={{ color: "var(--text-primary, #18181b)" }}
                    className="text-[13px] font-semibold tracking-tight leading-snug"
                  >
                    {t.title}
                  </span>
                )}
                <span
                  style={{
                    color: t.title
                      ? "var(--text-secondary, #71717a)"
                      : "var(--text-primary, #18181b)",
                  }}
                  className={`text-[12px] leading-snug ${
                    t.title ? "font-normal mt-0.5" : "font-medium"
                  }`}
                >
                  {t.message}
                </span>
              </div>

              {/* Action Button */}
              {t.action && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                  style={{
                    background:
                      "linear-gradient(to right, var(--btn-active-from, #4f4f56), var(--btn-active-to, #38383e))",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  className="ml-1.5 px-2.5 py-1 text-[11px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer flex-shrink-0 shadow-2xs"
                >
                  <span>{t.action.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              {/* Close Button — Reset button styles to ensure crisp X icon */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(t.id);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  borderRadius: "9999px",
                  color: "var(--text-secondary, #71717a)",
                }}
                className="w-6 h-6 flex items-center justify-center hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-0.5 flex-shrink-0 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
