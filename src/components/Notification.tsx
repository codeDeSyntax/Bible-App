import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  message: string;
  type?: NotificationType;
  show: boolean;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type = "info",
  show,
}) => {
  const config = {
    success: {
      bg: "bg-gradient-to-r from-green-800 to-green-700",
      border: "border-green-600",
      icon: "text-green-300",
      glow: "0 4px 12px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.15)",
      Icon: CheckCircle,
    },
    error: {
      bg: "bg-gradient-to-r from-red-900 to-red-800",
      border: "border-red-700",
      icon: "text-red-300",
      glow: "0 4px 12px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.15)",
      Icon: AlertCircle,
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-900 to-amber-800",
      border: "border-amber-700",
      icon: "text-amber-300",
      glow: "0 4px 12px rgba(251, 191, 36, 0.3), 0 0 20px rgba(251, 191, 36, 0.15)",
      Icon: AlertCircle,
    },
    info: {
      bg: "bg-gradient-to-r from-blue-800 to-blue-700",
      border: "border-blue-600",
      icon: "text-blue-300",
      glow: "0 4px 12px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.15)",
      Icon: Info,
    },
  }[type];

  const IconComponent = config.Icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-8 left-1/2 z-[9999]"
        >
          <div
            className={`flex items-center gap-3 ${config.bg} ${config.border} border backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-lg`}
            style={{ boxShadow: config.glow }}
          >
            {type === "success" ? (
              <div className="relative">
                <IconComponent className={`w-5 h-5 ${config.icon}`} />
                <div
                  className="absolute inset-0 bg-green-400 rounded-full blur-sm"
                  style={{ opacity: 0.3 }}
                />
              </div>
            ) : (
              <IconComponent className={`w-5 h-5 ${config.icon}`} />
            )}
            <span className="font-medium text-base tracking-wide">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
