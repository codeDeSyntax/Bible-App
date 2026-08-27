import { ipcMain, BrowserWindow } from "electron";
import { assemblyAiTranscriber } from "./assemblyAiTranscriber";
import { groqScriptureExtractor } from "./groqExtractor";
import { geminiScriptureExtractor } from "./geminiExtractor";
import {
  loadSmartProjectionKeys,
  saveSmartProjectionKeys,
  getSmartProjectionKeyStatus,
  SmartProjectionKeys,
} from "./smartProjectionKeys";

export function setupSmartProjectionHandlers(getMainWindow: () => BrowserWindow | null) {
  // Start speech-to-text streaming session
  ipcMain.handle("smart-projection:start-streaming", async (event) => {
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    const mainWin = senderWin || getMainWindow();
    return await assemblyAiTranscriber.start(mainWin || undefined);
  });

  // Stream raw PCM audio chunks from renderer
  ipcMain.on("smart-projection:audio-chunk", (_event, chunk: ArrayBuffer | Uint8Array) => {
    assemblyAiTranscriber.sendAudioChunk(chunk);
  });

  // Stop speech-to-text streaming session
  ipcMain.handle("smart-projection:stop-streaming", async () => {
    return assemblyAiTranscriber.stop();
  });

  // Extract scripture reference from transcript snippet using Groq or Gemini AI
  ipcMain.handle(
    "smart-projection:extract-reference",
    async (
      _event,
      transcript: string,
      context?: { book?: string; chapter?: number; verse?: number },
    ) => {
      const keys = await loadSmartProjectionKeys();
      const provider = keys.selectedAiProvider || "groq";

      if (provider === "gemini") {
        if (keys.geminiKey?.trim()) {
          return await geminiScriptureExtractor.extractReference(transcript, context);
        } else if (keys.groqKey?.trim()) {
          // Fallback to Groq if Gemini key is missing
          return await groqScriptureExtractor.extractReference(transcript, context);
        } else {
          return {
            success: false,
            error: "Google Gemini API Key missing. Please set it in Settings.",
          };
        }
      } else {
        if (keys.groqKey?.trim()) {
          return await groqScriptureExtractor.extractReference(transcript, context);
        } else if (keys.geminiKey?.trim()) {
          // Fallback to Gemini if Groq key is missing
          return await geminiScriptureExtractor.extractReference(transcript, context);
        } else {
          return {
            success: false,
            error: "Groq API Key missing. Please set it in Settings.",
          };
        }
      }
    },
  );

  // Key security management
  ipcMain.handle("smart-projection:get-keys-status", async () => {
    return await getSmartProjectionKeyStatus();
  });

  ipcMain.handle(
    "smart-projection:save-keys",
    async (_event, keys: SmartProjectionKeys) => {
      return await saveSmartProjectionKeys(keys);
    },
  );
}
