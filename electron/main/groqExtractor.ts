import { loadSmartProjectionKeys } from "./smartProjectionKeys";

export interface ActiveScriptureContext {
  book?: string;
  chapter?: number;
  verse?: number;
}

export interface ExtractedScripture {
  detected: boolean;
  action?: "NEW_CITATION" | "NEXT_VERSE" | "PREV_VERSE" | "JUMP_VERSE";
  reference?: string;
  book?: string;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;
  confidence?: number;
  contextSummary?: string;
  gradientColors?: [string, string];
  imageUrl?: string;
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
        const body = (await res.json()) as { data?: Array<{ id: string }> };
        const availableModelIds = (body.data || []).map((m) => m.id);

        console.log("🔍 Live Groq Models for account:", availableModelIds);

        const best =
          availableModelIds.find((id) => id === "llama-3.3-70b-versatile") ||
          availableModelIds.find((id) => id === "llama-3.1-8b-instant") ||
          availableModelIds.find((id) => id === "llama3-8b-8192") ||
          availableModelIds.find((id) => id === "qwen-2.5-32b") ||
          availableModelIds.find((id) => id.includes("llama-3")) ||
          availableModelIds[0];

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

    return this.cachedModel || "llama-3.1-8b-instant";
  }

  /**
   * Helper to parse JSON from AI completion text safely
   */
  private extractJson(text: string): ExtractedScripture | null {
    if (!text) return null;
    const clean = text.trim();
    try {
      return JSON.parse(clean);
    } catch {
      try {
        const mdMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (mdMatch && mdMatch[1]) {
          return JSON.parse(mdMatch[1]);
        }
      } catch {}

      try {
        const firstBrace = clean.indexOf("{");
        const lastBrace = clean.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          const sub = clean.substring(firstBrace, lastBrace + 1);
          return JSON.parse(sub);
        }
      } catch (e) {
        console.error("Failed to parse Groq JSON substring:", e);
      }
    }
    return null;
  }

  /**
   * Extract scripture reference or navigation intent from rolling transcript snippet using Groq AI
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
      return {
        success: true,
        data: { detected: false },
      };
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

    const hasContext = Boolean(currentContext?.book && currentContext?.chapter);
    const contextPrompt = hasContext
      ? `\nActive Screen Scripture: ${currentContext?.book} chapter ${currentContext?.chapter}, verse ${currentContext?.verse || 1}`
      : "";

    const systemPrompt = `You are an ultra-fast, high-precision Bible citation and sermon navigation detector for live church services.
Analyze the transcript snippet and determine if the speaker:
1. Explicitly announced or cited a Bible reference (e.g. "John 3:16", "Romans chapter 8 verse 28", "Psalm 23").
2. Quoted or recited distinct verbatim text from a Bible verse without stating the book/chapter name (e.g., "The Lord is my shepherd" -> Psalm 23:1, "In the beginning God created the heaven" -> Genesis 1:1, "I can do all things through Christ" -> Philippians 4:13, "For God so loved the world that he gave" -> John 3:16, "Trust in the Lord with all your heart" -> Proverbs 3:5).
3. Gave a relative scripture navigation command (e.g. "next verse", "the next one", "let's read on", "continue", "go to verse 18", "verse twenty", "go back", "previous verse").${contextPrompt}

CRITICAL FILTERING RULES:
- If the speaker quotes recognizable scripture text (even without saying the book name), YOU MUST IDENTIFY IT AND RETURN THE ACCURATE BIBLE BOOK, CHAPTER, AND VERSE.
- REJECT English homonyms and casual idioms: "acts of kindness", "acts of love", "new job", "job interview", "good job", "numbers of people", "mark my words", "genesis of this idea" -> MUST RETURN {"detected": false}.
- REJECT secular names: "John Maxwell", "Pastor Mark", "Dr. Luke" without scripture reference -> MUST RETURN {"detected": false}.
- REJECT secular numbers: Page numbers ("page 20"), hymn numbers, hymn titles, dollar amounts, percentages, calendar years ("in 2024"), times ("10:30 am") -> MUST RETURN {"detected": false}.
- REJECT casual storytelling and everyday conversation that is neither a scripture quotation nor a citation.
- ONLY set "detected": true if you are confident it is genuine scripture or a sermon navigation cue.
- THEME & NATURAL MOOD: Generate a harmonious pair of hex colors ("gradientColors") and 2-3 natural landscape keywords ("themeKeywords", e.g., "green pastures", "still waters", "mountain peak", "golden sunrise", "cedar forest", "starry heavens", "desert dawn") that reflect the tone of the scripture.

Respond ONLY with a valid JSON object adhering to this schema:

If a full citation, quotation, or relative verse navigation is detected:
{
  "detected": true,
  "action": "NEW_CITATION" | "NEXT_VERSE" | "PREV_VERSE" | "JUMP_VERSE",
  "reference": "Psalm 23:1",
  "book": "Psalms",
  "chapter": 23,
  "verseStart": 1,
  "verseEnd": 1,
  "confidence": 0.95,
  "contextSummary": "The Lord is my shepherd",
  "gradientColors": ["#047857", "#34d399"],
  "themeKeywords": "green pastures still waters"
}

If no scripture or navigation command is detected:
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

        let friendlyError = `Groq API error (${response.status})`;
        if (response.status === 401 || response.status === 403) {
          friendlyError = "Groq API key is invalid or unauthorized. Please check your key in Settings.";
        } else if (response.status === 429) {
          friendlyError = "Groq rate limit reached. Please wait a moment or switch to Gemini.";
        } else if (response.status >= 500) {
          friendlyError = "Groq service is temporarily unavailable. Please try again shortly.";
        }

        return {
          success: false,
          error: friendlyError,
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
        error: "Unable to reach Groq AI servers. Please check your internet connection.",
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
