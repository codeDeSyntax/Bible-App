import { emitAppNotification, NotificationType } from "@/components/Notification";

export interface FriendlyErrorOptions {
  title?: string;
  context?: string;
  fallbackMessage?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Transforms raw HTTP / network / Electron IPC errors into friendly, user-centric messages.
 */
export function parseFriendlyErrorMessage(
  error: unknown,
  context?: string,
  fallbackMessage?: string,
): { title: string; message: string; type: NotificationType } {
  let errStr = error instanceof Error ? error.message : String(error || "");
  
  // Clean up Electron IPC error prefix if present
  errStr = errStr
    .replace(/^Error:\s*Error invoking remote method '[^']+':\s*/i, "")
    .replace(/^Error invoking remote method '[^']+':\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .trim();

  const lower = errStr.toLowerCase();

  // 1. Offline / Disconnected Internet
  if (
    lower.includes("err_internet_disconnected") ||
    lower.includes("err_name_not_resolved") ||
    lower.includes("net::err") ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("econnreset") ||
    lower.includes("timeout") ||
    lower.includes("offline")
  ) {
    return {
      title: "No Internet Connection",
      message: "Please check your network connection and try again.",
      type: "warning",
    };
  }

  // 2. Authentication / API Key Issues (401, 403)
  if (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("unauthorized") ||
    lower.includes("invalid api key") ||
    lower.includes("forbidden") ||
    lower.includes("key_missing")
  ) {
    return {
      title: "API Key Required",
      message: "Your API key is invalid or expired. Please check your key in Settings.",
      type: "error",
    };
  }

  // 3. Rate Limit / Quota Exceeded (429)
  if (
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("too many requests")
  ) {
    return {
      title: "Request Limit Reached",
      message: "Service limit reached. Please wait a moment before trying again.",
      type: "warning",
    };
  }

  // 4. Server Busy / 500 / 502 / 503
  if (
    lower.includes("500") ||
    lower.includes("502") ||
    lower.includes("503") ||
    lower.includes("overloaded") ||
    lower.includes("internal server error")
  ) {
    return {
      title: "Service Temporarily Busy",
      message: "The server is temporarily busy. Please try again shortly.",
      type: "warning",
    };
  }

  // 5. Microphone / Audio Input
  if (
    lower.includes("microphone") ||
    lower.includes("notallowederror") ||
    lower.includes("permission denied")
  ) {
    return {
      title: "Microphone Access Needed",
      message: "Microphone input was denied. Please check your microphone permissions in Windows settings.",
      type: "error",
    };
  }

  // 6. JSON Parse / Corrupted Payload
  if (lower.includes("json") || lower.includes("unexpected token")) {
    return {
      title: context ? `${context}` : "Notice",
      message: "Received an unexpected response format from the server.",
      type: "info",
    };
  }

  // Default fallback
  return {
    title: context ? `${context}` : "Notice",
    message: fallbackMessage || errStr || "An unexpected error occurred. Please try again.",
    type: "info",
  };
}

/**
 * Convenience helper to immediately show a friendly error toast notification.
 */
export function notifyServiceError(
  error: unknown,
  options?: FriendlyErrorOptions,
) {
  const { title, message, type } = parseFriendlyErrorMessage(
    error,
    options?.context,
    options?.fallbackMessage,
  );

  emitAppNotification({
    title: options?.title || title,
    message,
    type,
    duration: options?.duration ?? 4500,
    action:
      options?.actionLabel && options?.onAction
        ? {
            label: options.actionLabel,
            onClick: options.onAction,
          }
        : undefined,
  });
}
