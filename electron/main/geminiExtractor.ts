import { loadSmartProjectionKeys } from "./smartProjectionKeys";
import { ExtractedScripture, ActiveScriptureContext } from "./groqExtractor";

class GeminiScriptureExtractor {
  private consecutiveFailures: number = 0;
  private circuitBreakerOpenUntil: number = 0;

  /**
   * Extract scripture reference or navigation intent from rolling transcript snippet using Google Gemini AI
   */
  public async extractReference(
    transcript: string,
    currentContext?: ActiveScriptureContext,
  ): Promise<{
    success: boolean;
    data?: ExtractedScripture;
    error?: string;
  }> {
    if (!transcript || transcript.trim().length < 4) {
      return { success: true, data: { detected: false } };
    }

    const now = Date.now();
    if (now < this.circuitBreakerOpenUntil) {
      const waitSec = Math.ceil((this.circuitBreakerOpenUntil - now) / 1000);
      return {
        success: false,
        error: `Circuit breaker active. Retrying in ${waitSec}s...`,
      };
    }

    const keys = await loadSmartProjectionKeys();
    const apiKey = keys.geminiKey?.trim();

    if (!apiKey) {
      return {
        success: false,
        error: "Google Gemini API Key is missing. Please set it in Settings.",
      };
    }

    const hasContext = Boolean(currentContext?.book && currentContext?.chapter);
    const contextPrompt = hasContext
      ? `\nActive Screen Scripture: ${currentContext?.book} chapter ${currentContext?.chapter}, verse ${currentContext?.verse || 1}`
      : "";

    const systemInstruction = `You are an expert Bible reference extraction assistant for live church services.
Analyze the live sermon transcript snippet and detect if the speaker:
1. Mentioned, announced, or quoted a Bible passage or citation (e.g., "John 3:16", "Romans chapter 8 verse 28", "first Corinthians 13", "Psalm 23 verse 1 to 4").
2. Spoke a relative navigation command (e.g., "next verse", "let's read on", "continue", "go to verse 18", "verse twenty", "go back", "previous verse").${contextPrompt}

Respond ONLY with a JSON object adhering to this schema:
If scripture or verse navigation is detected:
{
  "detected": true,
  "action": "NEW_CITATION" | "NEXT_VERSE" | "PREV_VERSE" | "JUMP_VERSE",
  "reference": "John 3:17",
  "book": "John",
  "chapter": 3,
  "verseStart": 17,
  "verseEnd": 17,
  "confidence": 0.95,
  "contextSummary": "God's love for the world"
}

If no specific Bible scripture or navigation command was spoken in the snippet:
{
  "detected": false
}`;

    const promptText = `Transcript snippet:\n"${transcript.trim()}"`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1,
            maxOutputTokens: 300,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.handleFailure();
        console.error("Gemini API error response:", response.status, errorText);
        return {
          success: false,
          error: `Gemini API error (${response.status}): ${response.statusText}`,
        };
      }

      const result = await response.json();
      const rawContent =
        result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawContent) {
        return { success: true, data: { detected: false } };
      }

      const parsed: ExtractedScripture = JSON.parse(rawContent);
      parsed.rawTranscript = transcript;

      this.consecutiveFailures = 0;
      return { success: true, data: parsed };
    } catch (err: any) {
      this.handleFailure();
      console.error("Gemini reference extraction failed:", err);
      return {
        success: false,
        error: err?.message || "Failed to contact Gemini API",
      };
    }
  }

  private handleFailure() {
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= 3) {
      this.circuitBreakerOpenUntil = Date.now() + 15_000;
      console.warn(
        "⚡ Gemini circuit breaker OPENED for 15s due to repeated failures",
      );
    }
  }
}

export const geminiScriptureExtractor = new GeminiScriptureExtractor();
