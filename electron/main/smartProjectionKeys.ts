import { safeStorage, app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

export interface SmartProjectionKeys {
  assemblyAiKey?: string;
  groqKey?: string;
  geminiKey?: string;
  selectedAiProvider?: "groq" | "gemini";
}

const KEY_FILE_NAME = "ai_smart_projection_keys.enc";

function getKeyFilePath(): string {
  return path.join(app.getPath("userData"), KEY_FILE_NAME);
}

/**
 * Load encrypted API keys from disk with fallback to process.env
 */
export async function loadSmartProjectionKeys(): Promise<SmartProjectionKeys> {
  const keys: SmartProjectionKeys = {
    assemblyAiKey: process.env.ASSEMBLYAI_API_KEY || "",
    groqKey: process.env.GROQ_API_KEY || "",
    geminiKey: process.env.GEMINI_API_KEY || "",
    selectedAiProvider: "groq",
  };

  try {
    const keyPath = getKeyFilePath();
    const buffer = await fs.readFile(keyPath);

    let decryptedJson = "";
    if (safeStorage.isEncryptionAvailable()) {
      decryptedJson = safeStorage.decryptString(buffer);
    } else {
      decryptedJson = Buffer.from(buffer.toString(), "base64").toString("utf8");
    }

    const savedKeys = JSON.parse(decryptedJson);
    if (savedKeys.assemblyAiKey) {
      keys.assemblyAiKey = savedKeys.assemblyAiKey;
    }
    if (savedKeys.groqKey) {
      keys.groqKey = savedKeys.groqKey;
    }
    if (savedKeys.geminiKey) {
      keys.geminiKey = savedKeys.geminiKey;
    }
    if (savedKeys.selectedAiProvider) {
      keys.selectedAiProvider = savedKeys.selectedAiProvider;
    }
  } catch {
    // File may not exist yet; process.env defaults will be used
  }

  return keys;
}

/**
 * Save API keys securely to disk using OS-level encryption (safeStorage)
 */
export async function saveSmartProjectionKeys(
  newKeys: SmartProjectionKeys,
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await loadSmartProjectionKeys();
    const merged: SmartProjectionKeys = {
      assemblyAiKey:
        newKeys.assemblyAiKey !== undefined
          ? newKeys.assemblyAiKey.trim()
          : existing.assemblyAiKey,
      groqKey:
        newKeys.groqKey !== undefined
          ? newKeys.groqKey.trim()
          : existing.groqKey,
      geminiKey:
        newKeys.geminiKey !== undefined
          ? newKeys.geminiKey.trim()
          : existing.geminiKey,
      selectedAiProvider:
        newKeys.selectedAiProvider !== undefined
          ? newKeys.selectedAiProvider
          : existing.selectedAiProvider || "groq",
    };

    const jsonStr = JSON.stringify(merged);
    const keyPath = getKeyFilePath();

    if (safeStorage.isEncryptionAvailable()) {
      const encryptedBuffer = safeStorage.encryptString(jsonStr);
      await fs.writeFile(keyPath, encryptedBuffer);
    } else {
      await fs.writeFile(
        keyPath,
        Buffer.from(jsonStr).toString("base64"),
        "utf8",
      );
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save smart projection keys:", err);
    return { success: false, error: err?.message || "Failed to encrypt and save keys" };
  }
}

/**
 * Check if keys are present (without leaking key values to renderer)
 */
export async function getSmartProjectionKeyStatus(): Promise<{
  hasAssemblyAiKey: boolean;
  hasGroqKey: boolean;
  hasGeminiKey: boolean;
  maskedAssemblyAiKey: string;
  maskedGroqKey: string;
  maskedGeminiKey: string;
  selectedAiProvider: "groq" | "gemini";
}> {
  const keys = await loadSmartProjectionKeys();
  const mask = (k?: string) => {
    if (!k || k.length < 8) return k ? "****" : "";
    return `${k.slice(0, 4)}...${k.slice(-4)}`;
  };

  return {
    hasAssemblyAiKey: !!keys.assemblyAiKey && keys.assemblyAiKey.trim().length > 0,
    hasGroqKey: !!keys.groqKey && keys.groqKey.trim().length > 0,
    hasGeminiKey: !!keys.geminiKey && keys.geminiKey.trim().length > 0,
    maskedAssemblyAiKey: mask(keys.assemblyAiKey),
    maskedGroqKey: mask(keys.groqKey),
    maskedGeminiKey: mask(keys.geminiKey),
    selectedAiProvider: keys.selectedAiProvider || "groq",
  };
}
