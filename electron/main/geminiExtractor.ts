import { loadSmartProjectionKeys } from "./smartProjectionKeys";
import { ExtractedScripture, ActiveScriptureContext } from "./groqExtractor";

class GeminiScriptureExtractor {
  private consecutiveFailures: number = 0;
  private circuitBreakerOpenUntil: number = 0;
  private cachedModel: string | null = null;
  private lastModelFetchTime: number = 0;

  /**
   * Dynamically queries Google Gemini API for available models on user's API key
   */
  private async getBestAvailableModel(apiKey: string): Promise<string> {
    const now = Date.now();
    if (this.cachedModel && now - this.lastModelFetchTime < 1800000) {
      return this.cachedModel;
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );

      if (res.ok) {
        const body = (await res.json()) as {
          models?: Array<{
            name: string;
            supportedGenerationMethods?: string[];
          }>;
        };

        const availableModels = (body.models || [])
          .filter((m) =>
            m.supportedGenerationMethods?.includes("generateContent"),
          )
          .map((m) => m.name.replace(/^models\//, ""))
          .filter(
            (m) =>
              !m.includes("tts") &&
              !m.includes("image") &&
              !m.includes("clip") &&
              !m.includes("banana") &&
              !m.includes("robotics") &&
              !m.includes("transcribe") &&
              !m.includes("computer-use") &&
              !m.includes("deep-research") &&
              m !== "gemini-2.5-flash" &&
              m !== "gemini-1.5-flash",
          );

        console.log("🔍 Active Text Gemini Models for account:", availableModels);

        // Priority order for speed, reliability, and modern generation
        const best =
          availableModels.find((m) => m === "gemini-3.6-flash") ||
          availableModels.find((m) => m === "gemini-3.7-flash") ||
          availableModels.find((m) => m === "gemini-flash-latest") ||
          availableModels.find((m) => m === "gemini-3.5-flash") ||
          availableModels.find((m) => m === "gemini-flash-lite-latest") ||
          availableModels.find((m) => m === "gemini-3.1-flash-lite") ||
          availableModels.find((m) => m === "gemini-2.5-flash-lite") ||
          availableModels.find((m) => m.includes("3.6-flash")) ||
          availableModels.find((m) => m.includes("3.7-flash")) ||
          availableModels.find((m) => m.includes("flash")) ||
          availableModels[0];

        if (best) {
          this.cachedModel = best;
          this.lastModelFetchTime = now;
          console.log(`⚡ Gemini Scripture Extractor selected model: ${best}`);
          return best;
        }
      }
    } catch (err) {
      console.warn("Failed to dynamically query Gemini models list:", err);
    }

    return this.cachedModel || "gemini-3.6-flash";
  }

  /**
   * Helper to parse JSON from AI completion text
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
        console.error("Failed to parse Gemini JSON substring:", e);
      }
    }
    return null;
  }

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
    const systemInstruction = `You are an ultra-precise Bible reference extraction assistant for live church services.
Analyze the live sermon transcript snippet and determine if the speaker:
1. Explicitly announced or cited a Bible reference (e.g., "John 3:16", "Romans chapter 8 verse 28", "Psalm 23").
2. Quoted or recited distinct verbatim text from a Bible verse without stating the book/chapter name (e.g., "The Lord is my shepherd" -> Psalm 23:1, "In the beginning God created the heaven" -> Genesis 1:1, "I can do all things through Christ" -> Philippians 4:13, "For God so loved the world that he gave" -> John 3:16, "Trust in the Lord with all your heart" -> Proverbs 3:5).
3. Spoke a relative scripture navigation command (e.g., "next verse", "the next one", "let's read on", "continue", "go to verse 18", "verse twenty", "go back", "previous verse").${contextPrompt}

CRITICAL FILTERING RULES:
- If the speaker quotes recognizable scripture text (even without saying the book name), YOU MUST IDENTIFY IT AND RETURN THE ACCURATE BIBLE BOOK, CHAPTER, AND VERSE.
- REJECT English homonyms and casual idioms: "acts of kindness", "acts of love", "new job", "job interview", "good job", "numbers of people", "mark my words", "genesis of this idea" -> MUST RETURN {"detected": false}.
- REJECT secular names: "John Maxwell", "Pastor Mark", "Dr. Luke" without scripture reference -> MUST RETURN {"detected": false}.
- REJECT secular numbers: Page numbers ("page 20"), hymn numbers, dollar amounts, percentages, calendar years ("in 2024"), times ("10:30 am") -> MUST RETURN {"detected": false}.
- REJECT casual storytelling and everyday conversation that is neither a scripture quotation nor a citation.
- ONLY set "detected": true if you are confident it is genuine scripture or a sermon navigation cue.
- THEME & NATURAL MOOD: Generate a harmonious pair of hex colors ("gradientColors") and 2-3 natural landscape keywords ("themeKeywords", e.g., "green pastures", "still waters", "mountain peak", "golden sunrise", "cedar forest", "starry heavens", "desert dawn") that reflect the tone of the scripture.

Respond ONLY with a JSON object adhering to this schema:
If scripture citation, quotation, or verse navigation is detected:
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

If no specific Bible scripture or navigation command was spoken in the snippet:
{
  "detected": false
}`;

    const promptText = `Transcript snippet:\n"${transcript.trim()}"`;

    let modelToUse = await this.getBestAvailableModel(apiKey);

    const callGemini = async (model: string) => {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      return await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1,
            maxOutputTokens: 300,
          },
        }),
      });
    };

    try {
      let response = await callGemini(modelToUse);

      // If chosen model returned 404, fallback through latest active model aliases
      if (response.status === 404) {
        console.warn(`Model ${modelToUse} returned 404. Attempting fallback to gemini-3.6-flash...`);
        this.cachedModel = null;
        const fallbacks = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.7-flash", "gemini-3.5-flash"];
        for (const fb of fallbacks) {
          if (fb !== modelToUse) {
            modelToUse = fb;
            response = await callGemini(modelToUse);
            if (response.ok) {
              this.cachedModel = fb;
              break;
            }
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.cachedModel = null;
        this.handleFailure();
        console.error("Gemini API error response:", response.status, errorText);

        let friendlyError = `Gemini API error (${response.status})`;
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          friendlyError = "Gemini API key is invalid or unauthorized. Please verify your Google AI Studio key in Settings.";
        } else if (response.status === 429) {
          friendlyError = "Gemini rate limit or quota exceeded. Please wait a moment or switch to Groq.";
        } else if (response.status >= 500) {
          friendlyError = "Google Gemini service is temporarily busy. Please try again shortly.";
        }

        return {
          success: false,
          error: friendlyError,
        };
      }

      const result = await response.json();
      const rawContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawContent) {
        return { success: true, data: { detected: false } };
      }

      const parsed = this.extractJson(rawContent);
      if (!parsed) {
        return { success: true, data: { detected: false } };
      }

      parsed.rawTranscript = transcript;
      this.consecutiveFailures = 0;
      return { success: true, data: parsed };
    } catch (err: any) {
      this.cachedModel = null;
      this.handleFailure();
      console.error("Gemini reference extraction failed:", err);
      return {
        success: false,
        error: "Unable to reach Google Gemini servers. Please check your internet connection.",
      };
    }
  }

  private handleFailure() {
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= 5) {
      this.circuitBreakerOpenUntil = Date.now() + 15_000;
      console.warn(
        "⚡ Gemini circuit breaker OPENED for 15s due to repeated failures",
      );
    }
  }

  public resetCircuitBreaker() {
    this.consecutiveFailures = 0;
    this.circuitBreakerOpenUntil = 0;
    this.cachedModel = null;
  }
}

export const geminiScriptureExtractor = new GeminiScriptureExtractor();

