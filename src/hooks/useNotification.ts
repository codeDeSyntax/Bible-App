import { useState, useCallback, useRef } from "react";
import { NotificationType, Toast } from "@/components/Notification";

export const useNotification = (defaultDuration: number = 4000) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info", duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const toast: Toast = {
        id,
        message,
        type,
        duration: duration ?? defaultDuration,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        dismissToast(id);
      }, toast.duration);

      timersRef.current.set(id, timer);
    },
    [defaultDuration, dismissToast]
  );

  const hideNotification = useCallback(() => {
    // Clear all toasts
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  // Legacy support - single notification state
  const notification = {
    show: toasts.length > 0,
    message: toasts[0]?.message || "",
    type: toasts[0]?.type || ("info" as NotificationType),
  };

  return {
    notification,
    toasts,
    showNotification,
    hideNotification,
    dismissToast,
  };
};
