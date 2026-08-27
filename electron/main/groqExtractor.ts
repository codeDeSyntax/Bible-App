import { loadSmartProjectionKeys } from "./smartProjectionKeys";

export interface ExtractedScripture {
  detected: boolean;
  reference?: string;
  book?: string;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;
  confidence?: number;
  contextSummary?: string;
  rawTranscript?: string;
}

class GroqScriptureExtractor {
  private consecutiveFailures: number = 0;
  private circuitBreakerOpenUntil: number = 0;
  private cachedModel: string | null = null;
  private lastModelFetchTime: number = 0;

  /**
   * Dynamically queries Groq API for models active on the user's specific account
   */
  private async getBestAvailableModel(apiKey: string): Promise<string> {
    const now = Date.now();
    if (this.cachedModel && now - this.lastModelFetchTime < 1800000) {
      return this.cachedModel;
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (res.ok) {
        const body = (await res.json()) as { data: Array<{ id: string; active?: boolean }> };
        const modelList = (body.data || [])
          .map((m) => m.id)
          .filter(
            (id) =>
              !id.includes("whisper") &&
              !id.includes("embed") &&
              !id.includes("tts") &&
              !id.includes("guard"),
          );

        console.log("🔍 Live Groq Models for account:", modelList);

        // Priority order based on user's available model tier
        const best =
          modelList.find((m) => m.includes("gpt-oss-20b")) ||
          modelList.find((m) => m.includes("qwen3.8") || m.includes("qwen3.6")) ||
          modelList.find((m) => m.includes("compound-mini") || m.includes("compound")) ||
          modelList.find((m) => m.includes("gpt-oss-120b")) ||
          modelList.find((m) => m.includes("llama-3.1-8b") || m.includes("llama-3.3-70b")) ||
          modelList[0];

        if (best) {
          this.cachedModel = best;
          this.lastModelFetchTime = now;
          console.log(`⚡ Groq Scripture Extractor selected model: ${best}`);
          return best;
        }
      }
    } catch (err) {
      console.warn("Failed to dynamically query Groq models list:", err);
    }

    return this.cachedModel || "openai/gpt-oss-20b";
  }

  /**
   * Helper to parse JSON from AI completion text
   */
  private extractJson(text: string): ExtractedScripture | null {
    if (!text) return null;
    const clean = text.trim();
    try {
      // 1. Direct JSON parse
      return JSON.parse(clean);
    } catch {
      // 2. Extract JSON block inside markdown ```json ... ```
      try {
        const mdMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (mdMatch && mdMatch[1]) {
          return JSON.parse(mdMatch[1]);
        }
      } catch (e) {
        // continue to next fallback
      }

      // 3. Extract first complete JSON object { ... }
      try {
        const firstBrace = clean.indexOf("{");
        const lastBrace = clean.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          const sub = clean.substring(firstBrace, lastBrace + 1);
          return JSON.parse(sub);
        }
      } catch (e) {
        console.error("Failed to parse JSON substring:", e);
      }
    }
    return null;
  }

  /**
   * Extract scripture reference from rolling transcript snippet using Groq AI
   */
  public async extractReference(transcript: string): Promise<{
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
    const apiKey = keys.groqKey?.trim();

    if (!apiKey) {
      return {
        success: false,
        error: "Groq API Key is missing. Please set it in Settings.",
      };
    }

    const modelToUse = await this.getBestAvailableModel(apiKey);

    const systemPrompt = `You are an ultra-fast Bible citation detector for live church sermons.
Analyze the transcript snippet and identify if the speaker mentioned, announced, or quoted a Bible citation (e.g. "John 3:16", "Romans 8:28", "Psalm 23:1-4", "1 Corinthians 13:4-8", "Genesis 1:1").

You must respond ONLY with a valid JSON object adhering to this schema:
If scripture is detected:
{
  "detected": true,
  "reference": "John 3:16",
  "book": "John",
  "chapter": 3,
  "verseStart": 16,
  "verseEnd": 16,
  "confidence": 0.95,
  "contextSummary": "God so loved the world"
}

If no scripture is detected:
{
  "detected": false
}`;

    const userPrompt = `Transcript snippet:\n"${transcript.trim()}"\n\nReturn JSON:`;

    console.log(`🤖 [Groq AI] Requesting scripture extraction using model "${modelToUse}" for: "${transcript.trim()}"`);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Groq (${modelToUse}) returned status ${response.status}:`, errorText);
        this.cachedModel = null;
        this.handleFailure();
        return {
          success: false,
          error: `Groq API error (${response.status}): ${response.statusText}`,
        };
      }

      const result = await response.json();
      const rawContent = result.choices?.[0]?.message?.content;
      console.log("⚡ [Groq AI] Raw Completion:", rawContent);

      if (!rawContent) {
        console.log("⚡ [Groq AI] Empty response from model");
        return { success: true, data: { detected: false } };
      }

      const parsed = this.extractJson(rawContent);
      console.log("📖 [Groq AI] Parsed Scripture Data:", parsed);

      if (!parsed) {
        return { success: true, data: { detected: false } };
      }

      parsed.rawTranscript = transcript;

      // Reset failure count on success
      this.consecutiveFailures = 0;

      return {
        success: true,
        data: parsed,
      };
    } catch (err: any) {
      console.error(`Failed to extract with Groq model ${modelToUse}:`, err);
      this.cachedModel = null;
      this.handleFailure();
      return {
        success: false,
        error: err?.message || "Groq AI could not process transcript.",
      };
    }
  }

  private handleFailure() {
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= 5) {
      this.circuitBreakerOpenUntil = Date.now() + 15 * 1000;
      console.warn("⚠️ Circuit breaker triggered: pausing Groq requests for 15s.");
    }
  }

  public resetCircuitBreaker() {
    this.consecutiveFailures = 0;
    this.circuitBreakerOpenUntil = 0;
    this.cachedModel = null;
  }
}

export const groqScriptureExtractor = new GroqScriptureExtractor();
