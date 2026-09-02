import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, KeyRound, X, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { SecretLogsWindow } from "@/components/SecretLogsWindow";

// SECRET CONFIGURATION
const SECRET_PASSWORD = "evapp56";

interface SecretLogsManagerProps {
  children: React.ReactNode;
}

export const SecretLogsManager: React.FC<SecretLogsManagerProps> = ({
  children,
}) => {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showLogsWindow, setShowLogsWindow] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Use Ctrl+` (backtick) or Ctrl+Shift+L as secret shortcut
      const isSecretKey =
        (event.key === "`" &&
          event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey) ||
        (event.key === "L" &&
          event.ctrlKey &&
          event.shiftKey &&
          !event.altKey) ||
        (event.key === "l" && event.ctrlKey && event.shiftKey && !event.altKey);

      if (isSecretKey) {
        event.preventDefault();
        event.stopPropagation();
        setShowPasswordPrompt(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === SECRET_PASSWORD) {
      setShowPasswordPrompt(false);
      setShowLogsWindow(true);
      setPassword("");
      setError("");
    } else {
      setError("Invalid password. Access denied.");
      setPassword("");
      setTimeout(() => {
        setError("");
      }, 2500);
    }
  };

  const handleCloseLogs = () => {
    setShowLogsWindow(false);
  };

  const handleClosePasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setPassword("");
    setError("");
  };

  return (
    <>
      {children}

      {/* Modern Sleek Password Prompt Modal */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePasswordPrompt}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative z-10 w-full max-w-md bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 shadow-2xl shadow-black/90 backdrop-blur-xl text-neutral-100 overflow-hidden"
            >
              {/* Subtle top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClosePasswordPrompt}
                className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center text-center mt-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center mb-3 shadow-inner">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  Restricted Diagnostics
                </div>
                <h2 className="text-xl font-bold text-neutral-100 mt-1 tracking-tight">
                  Admin System Telemetry
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Enter master security key to unlock real-time application logs and metrics.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key..."
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950/80 border border-neutral-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-mono text-neutral-100 placeholder-neutral-500 outline-none transition-all"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClosePasswordPrompt}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Authenticate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Footer text */}
              <div className="mt-5 text-center text-[0.7rem] text-neutral-500">
                Authorized Personnel Only • Confidential System Logs
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secret Logs Window */}
      <SecretLogsWindow isOpen={showLogsWindow} onClose={handleCloseLogs} />
    </>
  );
};

// Export the secret credentials for reference
export const SECRET_CREDENTIALS = {
  password: SECRET_PASSWORD,
  keySequence: "Ctrl+` or Ctrl+Shift+L",
  description: "Press Ctrl+` (backtick) or Ctrl+Shift+L to open secret logs",
};
