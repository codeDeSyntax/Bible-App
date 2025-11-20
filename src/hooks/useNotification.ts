import { useState, useEffect, useCallback } from "react";
import { NotificationType } from "@/components/Notification";

interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

export const useNotification = (duration: number = 4000) => {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification.show, duration]);

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      setNotification({ show: true, message, type });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
