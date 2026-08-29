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

// ─── Theme-Responsive Type Icons (react-hot-toast / sonner style) ─────────────

const TYPE_ICONS = {
  success: (
    <div className="w-5 h-5 rounded-full bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-400/40 flex items-center justify-center flex-shrink-0 shadow-xs">
      <Check className="w-3 h-3 stroke-[3]" />
    </div>
  ),
  error: (
    <div className="w-5 h-5 rounded-full bg-rose-500/15 dark:bg-rose-400/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 dark:border-rose-400/40 flex items-center justify-center flex-shrink-0 shadow-xs">
      <X className="w-3 h-3 stroke-[3]" />
    </div>
  ),
  warning: (
    <div className="w-5 h-5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 dark:border-amber-400/40 flex items-center justify-center flex-shrink-0 shadow-xs">
      <AlertTriangle className="w-3 h-3 stroke-[2.8]" />
    </div>
  ),
  info: (
    <div className="w-5 h-5 rounded-full bg-sky-500/15 dark:bg-sky-400/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 dark:border-sky-400/40 flex items-center justify-center flex-shrink-0 shadow-xs">
      <Info className="w-3 h-3 stroke-[2.8]" />
    </div>
  ),
  loading: (
    <div className="w-5 h-5 rounded-full bg-neutral-500/15 dark:bg-neutral-400/20 text-neutral-600 dark:text-neutral-300 border border-neutral-500/30 dark:border-neutral-400/40 flex items-center justify-center flex-shrink-0 shadow-xs">
      <Loader2 className="w-3 h-3 stroke-[2.8] animate-spin" />
    </div>
  ),
};

interface ToasterProps {
  toasts?: Toast[];
  onDismiss?: (id: string) => void;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  isDarkMode?: boolean;
}

export const Toaster: React.FC<ToasterProps> = ({
  toasts: propsToasts,
  onDismiss: propsOnDismiss,
  position = "top-left",
}) => {
  const { toasts: hookToasts, dismissToast: hookDismiss } = useGlobalToasts();
  const activeToasts = propsToasts ?? hookToasts;
  const dismiss = propsOnDismiss ?? hookDismiss;

  const positionClasses = {
    "top-left": "top-5 left-5 items-start",
    "top-center": "top-5 left-1/2 -translate-x-1/2 items-center",
    "top-right": "top-5 right-5 items-end",
    "bottom-left": "bottom-5 left-5 items-start",
    "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-5 right-5 items-end",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[999999] pointer-events-none flex flex-col gap-2`}
      style={{ width: "auto", maxWidth: "calc(100vw - 40px)" }}
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -20, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.94, transition: { duration: 0.15 } }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 32,
              mass: 0.5,
            }}
            className="pointer-events-auto"
          >
            <div
              onClick={() => dismiss(t.id)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/95 dark:bg-[#1c1c1f]/95 text-neutral-900 dark:text-neutral-100 border border-neutral-200/90 dark:border-neutral-800 shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all select-none whitespace-nowrap"
            >
              {/* Status Icon */}
              {t.icon ? <t.icon className="w-4.5 h-4.5 flex-shrink-0" /> : TYPE_ICONS[t.type]}

              {/* Message Content — Strictly 1 Row, Never Wraps */}
              <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0 pr-0.5">
                {t.title && (
                  <span className="text-[12.5px] font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap flex-shrink-0">
                    {t.title}
                    <span className="opacity-40 mx-1">•</span>
                  </span>
                )}
                <span className="text-[12px] text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap">
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
                  className="ml-1 px-2.5 py-0.5 text-[11px] font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-full transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0 shadow-2xs whitespace-nowrap"
                >
                  <span>{t.action.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              {/* Close Icon Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(t.id);
                }}
                className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer ml-0.5"
                aria-label="Close notification"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
