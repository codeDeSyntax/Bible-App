import { useGlobalToasts, toast, NotificationType, ToastAction } from "@/components/Notification";

export interface ShowNotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number;
  action?: ToastAction;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const useNotification = (_defaultDuration: number = 4000) => {
  const { toasts, dismissToast, showNotification } = useGlobalToasts();

  return {
    toasts,
    showNotification: (
      messageOrOptions: string | ShowNotificationOptions,
      type?: NotificationType,
      duration?: number,
    ) => {
      if (typeof messageOrOptions === "string") {
        showNotification(messageOrOptions, type, duration);
      } else {
        toast.show(messageOrOptions);
      }
    },
    hideNotification: toast.clearAll,
    dismissToast,
  };
};
