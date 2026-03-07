/**
 * useSystemServices.ts
 *
 * React hook that bridges the renderer to the three system services:
 *   1. Native Notifications (OS-level toasts)
 *   2. PowerSaveBlocker status + manual control
 *   3. Tray state sync + tray-action listener
 *
 * Usage:
 *   const { notify, powerSave, tray } = useSystemServices();
 *   notify("Preset saved", "Your flyer is ready.");
 *   powerSave.forceStart();
 */

import { useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface NotifyOpts {
  title: string;
  body: string;
  silent?: boolean;
  urgency?: "normal" | "critical" | "low";
}

interface TrayState {
  projectionActive?: boolean;
  blankScreen?: boolean;
  presetName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useSystemServices(opts?: {
  /** Called when the tray emits an action (e.g. "blank-screen" from tray menu) */
  onTrayAction?: (action: string) => void;
}) {
  const notificationSupportedRef = useRef<boolean | null>(null);
  const onTrayActionRef = useRef(opts?.onTrayAction);
  onTrayActionRef.current = opts?.onTrayAction;

  // ── Check notification support once ────────────────────────────────────
  useEffect(() => {
    window.api.isNotificationSupported?.().then((r) => {
      notificationSupportedRef.current = r.supported;
    });
  }, []);

  // ── Tray action listener ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = window.api.onTrayAction?.((payload) => {
      onTrayActionRef.current?.(payload.action);
    });
    return () => unsub?.();
  }, []);

  // ── Notify ──────────────────────────────────────────────────────────────
  const notify = useCallback(
    (title: string, body: string, options?: Partial<NotifyOpts>) => {
      if (!window.api.showNativeNotification) return;
      window.api.showNativeNotification({
        title,
        body,
        silent: options?.silent ?? false,
        urgency: options?.urgency ?? "normal",
      });
    },
    [],
  );

  // ── PowerSave ───────────────────────────────────────────────────────────
  const powerSave = {
    forceStart: () => window.api.powerSaveStart?.(),
    forceStop: () => window.api.powerSaveStop?.(),
    getStatus: () => window.api.powerSaveStatus?.(),
    setAutoMode: (enabled: boolean) => window.api.powerSaveSetAuto?.(enabled),
  };

  // ── Tray ───────────────────────────────────────────────────────────────
  const tray = {
    syncState: useCallback((state: TrayState) => {
      window.api.traySyncState?.(state);
    }, []),
    setTooltip: useCallback((tooltip: string) => {
      window.api.trayUpdateTooltip?.(tooltip);
    }, []),
  };

  return { notify, powerSave, tray };
}
