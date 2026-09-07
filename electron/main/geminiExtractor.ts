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
              !m.includes("deep-research"),
          );

        console.log("🔍 Active Text Gemini Models for account:", availableModels);

        // Priority order for speed, reliability, and official Gemini 2.x/1.5 models
        const best =
          availableModels.find((m) => m === "gemini-2.5-flash") ||
          availableModels.find((m) => m === "gemini-2.0-flash") ||
          availableModels.find((m) => m === "gemini-1.5-flash") ||
          availableModels.find((m) => m === "gemini-2.0-flash-lite") ||
          availableModels.find((m) => m === "gemini-2.5-pro") ||
          availableModels.find((m) => m === "gemini-1.5-pro") ||
          availableModels.find((m) => m.includes("2.5-flash")) ||
          availableModels.find((m) => m.includes("2.0-flash")) ||
          availableModels.find((m) => m.includes("1.5-flash")) ||
          availableModels.find((m) => m.includes("flash")) ||
          availableModels[0] ||
          "gemini-2.5-flash";

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

    return this.cachedModel || "gemini-2.5-flash";
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
        error: `Gemini quota limit reached. Pausing for ${waitSec}s... (Tip: Switch to Groq in Settings for higher limits)`,
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
    const systemInstruction = `You are an expert Bible reference finder and scripture identification AI for live church services and Bible study.
Analyze the live sermon or typed snippet (which may be a direct citation, a quotation from ANY Bible translation, a preaching paraphrase, or a biblical concept description) and identify the matching Bible passage:

RECOGNITION MODES:
1. DIRECT CITATIONS: "John 3:16", "Romans chapter 8 verse 28", "Psalm 23", "2 Corinthians 5:17".
2. VERBATIM QUOTATIONS (KJV, NIV, ESV, NLT, NASB, NKJV, AMP, MSG): "The Lord is my shepherd" -> Psalms 23:1, "In the beginning God created" -> Genesis 1:1, "I can do all things through Christ" -> Philippians 4:13.
3. SEMANTIC PARAPHRASES & THEMATIC TEACHINGS: When a speaker or user describes or paraphrases biblical scripture (e.g., "the sin I do not want to do is what I find myself doing" / "what I want to do I do not do" -> Romans 7:19; "nothing can separate us from God's love" -> Romans 8:38-39; "God will never leave you nor forsake you" -> Hebrews 13:5 / Deuteronomy 31:6; "we walk by faith not by sight" -> 2 Corinthians 5:7; "by his stripes we are healed" -> Isaiah 53:5; "faith without works is dead" -> James 2:26; "cast your anxiety on him" -> 1 Peter 5:7; "I know the plans I have for you" -> Jeremiah 29:11), YOU MUST ACCURATELY IDENTIFY THE BIBLICAL BOOK, CHAPTER, AND VERSE.
4. RELATIVE CUES: "next verse", "let's read on", "continue", "go back", "verse 20".${contextPrompt}

CRITICAL RULES:
- If a book and chapter is given without a verse (e.g., "Romans 8", "Psalm 23"), ASSUME verseStart: 1, verseEnd: 1, action: "NEW_CITATION".
- For semantic paraphrases or quotes, ALWAYS supply the precise "book", "chapter", "verseStart", "reference" (e.g. "Romans 7:19"), and a descriptive "contextSummary" (e.g. "Romans 7:19 - For what I do is not the good I want to do").
- Set high confidence (0.90 - 0.98) when a biblical verse or paraphrase is recognized.
- REJECT purely secular topics that have no biblical content (e.g., "buy groceries", "page 20", "job interview", "good morning everyone" without biblical reference) -> {"detected": false}.
- THEME & NATURAL MOOD: Generate a harmonious pair of hex colors ("gradientColors") and 2-3 pure natural landscape keywords ("themeKeywords", e.g., "green pastures", "still waters", "mountain peak", "golden sunrise", "cedar forest", "starry heavens", "desert dawn", "cascading waterfall", "canyon vista") reflecting the tone of the scripture. Pure natural scenery only without human figures or people.

Respond ONLY with a JSON object adhering to this schema:
If scripture citation, quotation, paraphrase, or verse navigation is detected:
{
  "detected": true,
  "action": "NEW_CITATION" | "NEXT_VERSE" | "PREV_VERSE" | "JUMP_VERSE",
  "reference": "Romans 7:19",
  "book": "Romans",
  "chapter": 7,
  "verseStart": 19,
  "verseEnd": 19,
  "confidence": 0.95,
  "contextSummary": "Romans 7:19 - Doing what I do not want to do",
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

  /**
   * Generates a beautifully styled marquee alert design from raw announcement text
   */
  public async generateStyledAlert(rawText: string): Promise<{
    success: boolean;
    data?: {
      backgroundColor: string;
      markupText: string;
      htmlText: string;
      suggestedSpeed?: number;
      themeName?: string;
    };
    error?: string;
  }> {
    const keys = await loadSmartProjectionKeys();
    const apiKey = keys.geminiKey?.trim();
    if (!apiKey) {
      return { success: false, error: "Google Gemini API Key is not configured." };
    }

    const modelToUse = await this.getBestAvailableModel(apiKey);
    const systemInstruction = `You are an elite live broadcast television graphics producer and church media director.
Your objective is to intelligently analyze any raw announcement, sermon topic, scripture reading, or event message and transform it into a formal, authoritative, and professionally designed on-screen marquee ticker.

INTELLIGENT DESIGN & EDITORIAL PRINCIPLES:
1. BACKGROUND COLOR:
   - Autonomously select a custom, rich, deep background hex color (#RRGGBB) tailored specifically to the mood and subject of the message.
   - Choose a deep, high-contrast tone so text is sharply legible on large projectors.
   - Do NOT default to dark blue, black, or any single repetitive hue. Freely explore rich purples, burgundies, emeralds, warm bronzes, teals, deep reds, etc.

2. STRICT FAITHFULNESS (NO ADDED NOTES OR COMMENTARY):
   - Use ONLY the exact information provided in the raw input message.
   - Absolutely NEVER add theological commentary, devotional notes, interpretations, or unmentioned scripture citations.
   - Do NOT invent or assume facts, names, or instructions not present in the original message.
   - Your sole responsibility is to clean grammar, organize layout (headers, bullet points, standardized phone/dates), and apply colors faithfully to the provided text.

3. EDITORIAL POLISH & STANDARDIZATION:
   - Refine casual, fragmented, or spoken phrasing into formal broadcast English with clean punctuation.
   - Auto-detect the context and begin with an appropriate bold uppercase header.
   - Standardize scripture citations (e.g. "Hebrews 11:1-6"), phone numbers, times, and dates.
   - Use bullet points (" • ") or dashes (" — ") to cleanly separate sections.

4. TEXT COLOR HIGHLIGHTING SYNTAX:
   - Highlight words using matching opening and closing color tags: "{color}Text to highlight{/color}"
   - Available colors: red, green, blue, yellow, purple, orange, pink, cyan, white.
   - Syntax Rule: Every opening tag "{color}" MUST have a matching closing tag "{/color}" with the exact same color name (e.g. "{purple}Text{/purple}").
   - Syntax Structure: "{colorA}HEADER:{/colorA} Plain text with {colorB}key details{/colorB} and {colorC}dates/references{/colorC}"
   - PALETTE DIVERSITY: Intelligently vary your color selections across generations! Freely choose headers with bold colors (such as {orange}, {green}, {purple}, {pink}, {white}, {cyan}, {yellow}, or {red}) and pair them with distinct, harmonious secondary colors for scriptures and details. Never reuse the exact same color pairs every time.
   - In htmlText, mirror this by wrapping highlighted text in <span className="..."> with Tailwind color classes matching your chosen colors.

5. REACT JSX HTML:
   - Return clean HTML strictly using 'className' with Tailwind utilities (NEVER use 'class'!).

Return ONLY a valid JSON object adhering to this schema:
{
  "backgroundColor": "<custom hex code>",
  "markupText": "<styled text with color tags>",
  "htmlText": "<clean React JSX string using className>",
  "suggestedSpeed": 22,
  "themeName": "<short theme title>"
}`;

    const promptText = `Announcement message:\n"${rawText.trim()}"`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        this.cachedModel = null;
        let friendly = "Google Gemini is currently unable to style this alert.";
        if (response.status === 404) {
          friendly = `Gemini model (${modelToUse}) not found on your account. Switching to a standard model...`;
        } else if (response.status === 429) {
          friendly = "Gemini rate limit exceeded. Please wait a few seconds.";
        }
        return { success: false, error: friendly };
      }

      const result = await response.json();
      const rawContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawContent) {
        return { success: false, error: "Empty Gemini response" };
      }

      const parsed: any = this.extractJson(rawContent);
      if (!parsed) {
        return {
          success: true,
          data: {
            backgroundColor: "#18181b",
            markupText: rawText,
            htmlText: `<span>${rawText}</span>`,
            suggestedSpeed: 22,
            themeName: "Announcement",
          },
        };
      }

      return {
        success: true,
        data: {
          backgroundColor: parsed.backgroundColor || "#18181b",
          markupText: parsed.markupText || rawText,
          htmlText: parsed.htmlText || `<span>${rawText}</span>`,
          suggestedSpeed: parsed.suggestedSpeed || 22,
          themeName: parsed.themeName || "General Announcement",
        },
      };
    } catch (err: any) {
      console.error("Gemini alert design generation failed:", err);
      return { success: false, error: err.message || "Failed to generate alert design." };
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

