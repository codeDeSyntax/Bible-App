import { BrowserWindow } from "electron";
import WebSocket from "ws";
import { loadSmartProjectionKeys } from "./smartProjectionKeys";

export interface TranscriptEvent {
  text: string;
  isFinal: boolean;
  confidence?: number;
  audioStart?: number;
  audioEnd?: number;
}

class AssemblyAiTranscriber {
  private ws: any = null;
  private isConnecting: boolean = false;
  private isStreaming: boolean = false;
  private targetWindow: BrowserWindow | null = null;
  private sampleRate: number = 16000;

  /**
   * Set or update the target BrowserWindow that receives transcription events
   */
  public setTargetWindow(win: BrowserWindow | null) {
    this.targetWindow = win;
  }

  /**
   * Start AssemblyAI Real-time Streaming WebSocket connection using v3 API
   */
  public async start(targetWin?: BrowserWindow): Promise<{ success: boolean; error?: string }> {
    if (targetWin) {
      this.targetWindow = targetWin;
    }

    if (this.isStreaming || this.isConnecting) {
      return { success: true };
    }

    const keys = await loadSmartProjectionKeys();
    const apiKey = keys.assemblyAiKey?.trim();

    if (!apiKey) {
      return {
        success: false,
        error: "AssemblyAI API Key is missing. Please set it in Settings.",
      };
    }

    this.isConnecting = true;

    try {
      // Connect directly to AssemblyAI v3 WebSocket using Authorization headers
      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=${this.sampleRate}`;
      this.ws = new WebSocket(wsUrl, {
        headers: {
          Authorization: apiKey,
        },
      });

      return new Promise((resolve) => {
        let isDone = false;
        const finish = (result: { success: boolean; error?: string }) => {
          if (isDone) return;
          isDone = true;
          clearTimeout(connectionTimeout);
          resolve(result);
        };

        const connectionTimeout = setTimeout(() => {
          if (this.isConnecting) {
            this.cleanup();
            finish({ success: false, error: "Connection to AssemblyAI timed out." });
          }
        }, 10000);

        this.ws.on("open", () => {
          this.isConnecting = false;
          this.isStreaming = true;
          console.log("🎙️ AssemblyAI v3 Realtime WebSocket connected successfully");
          this.sendEventToRenderer("smart-projection:status", {
            connected: true,
            isStreaming: true,
          });
          finish({ success: true });
        });

        this.ws.on("message", (data: any) => {
          try {
            const dataStr = typeof data === "string" ? data : data.toString();
            const parsed = JSON.parse(dataStr);

            // AssemblyAI v3 & v2 message handlers
            if (parsed.type === "Begin") {
              console.log("🎙️ AssemblyAI v3 Session Began:", parsed.session_id);
            } else if (parsed.type === "Turn" || parsed.message_type === "FinalTranscript" || parsed.message_type === "PartialTranscript") {
              const transcriptText = (parsed.transcript || parsed.text || "").trim();
              const isFinal = !!(parsed.end_of_turn || parsed.message_type === "FinalTranscript");
              if (transcriptText.length > 0) {
                console.log(`🎙️ [AssemblyAI Speech] "${transcriptText}" (isFinal: ${isFinal})`);
                this.sendEventToRenderer("smart-projection:transcript", {
                  text: transcriptText,
                  isFinal,
                });
              }
            } else if (parsed.type === "Error") {
              console.error("AssemblyAI streaming error:", parsed.error || parsed);
              this.sendEventToRenderer("smart-projection:error", {
                message: parsed.error || "AssemblyAI speech recognition error",
              });
            }
          } catch (err) {
            console.error("Failed to parse AssemblyAI message:", err);
          }
        });

        this.ws.on("error", (err: any) => {
          console.error("AssemblyAI WebSocket error:", err);
          this.sendEventToRenderer("smart-projection:error", {
            message: "Unable to connect to speech recognition. Please check your internet connection.",
          });
          if (this.isConnecting) {
            this.cleanup();
            finish({
              success: false,
              error: "Unable to connect to AssemblyAI. Please check your API key and network connection.",
            });
          }
        });

        this.ws.on("close", (code: any, reason: any) => {
          console.log("AssemblyAI WebSocket closed:", code, reason?.toString?.() || reason);
          this.cleanup();
          this.sendEventToRenderer("smart-projection:status", {
            connected: false,
            isStreaming: false,
          });

          // Translate specific close codes into clear, friendly user status
          if (code === 4001 || code === 4003) {
            this.sendEventToRenderer("smart-projection:error", {
              message: "AssemblyAI API key is invalid or unauthorized. Please verify your key in Settings.",
            });
          } else if (code === 4002) {
            this.sendEventToRenderer("smart-projection:error", {
              message: "AssemblyAI account credits exhausted or inactive. Please check your account.",
            });
          } else if (code === 4008) {
            this.sendEventToRenderer("smart-projection:error", {
              message: "Speech streaming rate limit reached. Please wait a moment and try again.",
            });
          } else if (code === 1006) {
            this.sendEventToRenderer("smart-projection:error", {
              message: "Speech recognition connection was interrupted.",
            });
          }
        });
      });
    } catch (err: any) {
      this.cleanup();
      return {
        success: false,
        error: "Unable to start speech listening. Please check your API keys and microphone settings.",
      };
    }
  }

  /**
   * Send 16kHz PCM audio chunk directly as binary frame to AssemblyAI v3
   */
  public sendAudioChunk(chunk: ArrayBuffer | Uint8Array | Buffer) {
    if (!this.ws || !this.isStreaming || this.ws.readyState !== 1 /* OPEN */) {
      return;
    }

    try {
      const buffer = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(new Uint8Array(chunk as any));
      // In AssemblyAI v3, raw binary PCM frames are transmitted directly
      this.ws.send(buffer);
    } catch (err) {
      console.error("Failed to send audio chunk to AssemblyAI:", err);
    }
  }

  /**
   * Stop and close the WebSocket stream gracefully
   */
  public stop(): { success: boolean } {
    if (this.ws) {
      try {
        if (this.ws.readyState === 1 /* OPEN */) {
          // Send terminate message per AssemblyAI v3 spec
          this.ws.send(JSON.stringify({ type: "Terminate" }));
        }
        this.ws.close();
      } catch (err) {
        console.error("Error closing AssemblyAI WebSocket:", err);
      }
    }
    this.cleanup();
    return { success: true };
  }

  private cleanup() {
    this.ws = null;
    this.isConnecting = false;
    this.isStreaming = false;
  }

  private sendEventToRenderer(channel: string, payload: any) {
    if (this.targetWindow && !this.targetWindow.isDestroyed()) {
      this.targetWindow.webContents.send(channel, payload);
    }
  }

  public getStatus() {
    return {
      isStreaming: this.isStreaming,
      isConnecting: this.isConnecting,
    };
  }
}

export const assemblyAiTranscriber = new AssemblyAiTranscriber();
