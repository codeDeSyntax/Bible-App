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
        const rawModelIds = (body.data || []).map((m) => m.id);

        // Filter out safety guard, moderation, speech, audio, embedding, and non-general models
        const chatModels = rawModelIds.filter((id) => {
          const lower = id.toLowerCase();
          return (
            !lower.includes("guard") &&
            !lower.includes("whisper") &&
            !lower.includes("orpheus") &&
            !lower.includes("canopy") &&
            !lower.includes("arabic") &&
            !lower.includes("allam") &&
            !lower.includes("embed") &&
            !lower.includes("classification") &&
            !lower.includes("distil") &&
            !lower.includes("tts") &&
            !lower.includes("moderation")
          );
        });

        console.log("🔍 Active Groq Chat Models for account:", chatModels);

        const best =
          chatModels.find((id) => id === "llama-3.3-70b-versatile") ||
          chatModels.find((id) => id === "qwen/qwen3.8-27b") ||
          chatModels.find((id) => id === "qwen/qwen3.6-27b") ||
          chatModels.find((id) => id === "openai/gpt-oss-120b") ||
          chatModels.find((id) => id === "groq/compound") ||
          chatModels.find((id) => id === "llama-3.1-8b-instant") ||
          chatModels.find((id) => id === "llama-3.1-70b-versatile") ||
          chatModels.find((id) => id === "llama3-8b-8192") ||
          chatModels.find((id) => id === "gemma2-9b-it") ||
          chatModels.find((id) => id.includes("qwen")) ||
          chatModels.find((id) => id.includes("120b")) ||
          chatModels.find((id) => id.includes("compound")) ||
          chatModels.find((id) => id === "openai/gpt-oss-20b") ||
          chatModels[0] ||
          "llama-3.1-8b-instant";

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
        error: `Groq rate limit reached. Pausing for ${waitSec}s...`,
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

    const systemPrompt = `You are an expert Bible reference finder and scripture identification AI for live church services and Bible study.
Analyze the input text snippet (which may be a direct citation, a quotation from ANY Bible translation, a preaching paraphrase, or a biblical concept description) and identify the matching Bible passage:

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

Respond ONLY with a valid JSON object adhering to this schema:

If scripture is detected (citation, quote, paraphrase, or navigation):
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

If no biblical scripture or navigation command is detected:
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
    const apiKey = keys.groqKey?.trim();
    if (!apiKey) {
      return { success: false, error: "Groq API Key is not configured." };
    }

    const modelToUse = await this.getBestAvailableModel(apiKey);
    const systemPrompt = `You are an elite live broadcast television graphics producer and church media director.
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

    const userPrompt = `Announcement message to design:\n"${rawText.trim()}"\n\nReturn ONLY the JSON object adhering to the schema:`;

    const makeRequest = async (useJsonFormat: boolean) => {
      const bodyPayload: any = {
        model: modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      };

      if (useJsonFormat) {
        bodyPayload.response_format = { type: "json_object" };
      }

      return await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(bodyPayload),
      });
    };

    try {
      let response = await makeRequest(true);

      // If json_validate_failed or 400 error, retry without strict response_format
      if (!response.ok && response.status === 400) {
        console.warn(`Groq styled alert (${modelToUse}) returned 400 with strict JSON format, retrying standard mode...`);
        response = await makeRequest(false);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Groq styled alert (${modelToUse}) returned status ${response.status}:`, errorText);
        this.cachedModel = null;
        let friendly = "Groq is currently unable to style this alert.";
        try {
          const parsedErr = JSON.parse(errorText);
          if (parsedErr?.error?.message) {
            const rawMsg = parsedErr.error.message;
            if (rawMsg.includes("rate limit") || response.status === 429) {
              friendly = "Groq rate limit reached. Please wait a moment or switch to Gemini.";
            } else if (rawMsg.includes("classification") || rawMsg.includes("template")) {
              friendly = "Selected model was incompatible. Re-trying with a standard model...";
            } else {
              friendly = rawMsg;
            }
          }
        } catch {}
        return { success: false, error: friendly };
      }

      const resData = (await response.json()) as any;
      const rawContent = resData?.choices?.[0]?.message?.content;
      if (!rawContent) {
        return { success: false, error: "Empty AI response" };
      }

      const parsed: any = this.extractJson(rawContent);
      if (!parsed) {
        return {
          success: true,
          data: {
            backgroundColor: "#064e3b",
            markupText: rawText,
            htmlText: `<span>${rawText}</span>`,
            suggestedSpeed: 24,
            themeName: "Announcement",
          },
        };
      }

      return {
        success: true,
        data: {
          backgroundColor: parsed.backgroundColor || "#0f172a",
          markupText: parsed.markupText || rawText,
          htmlText: parsed.htmlText || `<span>${rawText}</span>`,
          suggestedSpeed: parsed.suggestedSpeed || 24,
          themeName: parsed.themeName || "General Announcement",
        },
      };
    } catch (err: any) {
      console.error("Failed to generate styled alert with Groq:", err);
      return { success: false, error: err.message || "Failed to generate alert design." };
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
