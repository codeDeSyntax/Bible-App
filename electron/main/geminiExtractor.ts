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

        // Priority order for speed, reliability, and official active models
        const best =
          availableModels.find((m) => m === "gemini-flash-latest") ||
          availableModels.find((m) => m === "gemini-2.0-flash") ||
          availableModels.find((m) => m === "gemini-1.5-flash") ||
          availableModels.find((m) => m === "gemini-pro-latest") ||
          availableModels.find((m) => m === "gemini-2.0-flash-lite") ||
          availableModels.find((m) => m === "gemini-1.5-pro") ||
          availableModels.find((m) => m === "gemini-3.6-flash") ||
          availableModels.find((m) => m === "gemini-3.7-flash") ||
          availableModels.find((m) => m.includes("flash-latest")) ||
          availableModels.find((m) => m.includes("flash")) ||
          availableModels[0] ||
          "gemini-flash-latest";

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

    return this.cachedModel || "gemini-flash-latest";
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

      // If chosen model returned 404, fallback through official stable models
      if (response.status === 404) {
        console.warn(`Model ${modelToUse} returned 404. Attempting fallback...`);
        this.cachedModel = null;
        const fallbacks = [
          "gemini-flash-latest",
          "gemini-pro-latest",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-3.6-flash",
          "gemini-3.7-flash",
        ];
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
      templateId?: string;
    };
    error?: string;
  }> {
    const keys = await loadSmartProjectionKeys();
    const apiKey = keys.geminiKey?.trim();
    if (!apiKey) {
      return { success: false, error: "Google Gemini API Key is not configured." };
    }

    let modelToUse = await this.getBestAvailableModel(apiKey);
    const systemInstruction = `You are an elite live broadcast television graphics producer and church media director.
Your objective is to intelligently analyze any raw announcement, sermon topic, scripture reading, or event message and transform it into a formal, authoritative, and professionally designed on-screen presentation.

INTELLIGENT DESIGN & EDITORIAL PRINCIPLES:
1. DYNAMIC BACKGROUND COLOR (CRITICAL):
   - Autonomously select a custom, rich, vibrant background hex color (#RRGGBB) tailored specifically to the mood, theme, and subject of the message.
   - Choose a deep, saturated, high-contrast tone so text is sharply legible on large projectors.
   - STRICT CONSTRAINT: DO NOT DEFAULT TO BLUE, SLATE, OR NAVY. Blue is overused in secular TV news; church presentation demands rich, celebratory, diverse jewel tones!
   - NEVER default to plain black (#000000), dark slate (#0f172a), or boring dark gray (#18181b).
   - Intelligently vary colors across generations based on context:
     * Scripture / Devotional / Faith: Regal Purple (#4c1d95, #581c87), Royal Violet (#6d28d9), Deep Indigo (#312e81)
     * Praise / Celebration / Joy / Sunday Service: Royal Amber/Gold (#78350f, #92400e), Warm Bronze (#854d0e), Crimson Amber (#9a3412)
     * Life / Growth / Healing / Peace / Family: Deep Emerald (#064e3b, #065f46), Forest Jade (#047857)
     * Communion / Cross / Grace / Love: Deep Wine Burgundy (#4c0519, #701a75), Crimson Rose (#9f1239, #831843)
     * Youth / Events / Activity / Fellowship: Electric Violet (#4338ca, #7c3aed), Vivid Terracotta (#c2410c)
     * Holy Spirit / Truth / Baptism: Deep Oceanic Teal (#0f766e, #115e59)

2. TEMPLATE SELECTION (CRITICAL):
   Select the most appropriate visual design template ID based on the content type:
   - "marquee-classic" → scrolling ticker, best for: general announcements, events, long continuous notices
   - "broadcast-ticker" → two-tone bar (category chip + scrolling text), best for: formal announcements, church notices, news-style
   - "chevron-lower-third" → TV-style lower third with angled accent, best for: sermon topics, speaker introductions, program titles
   - "scripture-badge" → centered glass card with reference + verse, best for: Bible scriptures, verse readings, devotionals
   - "headline-card" → large bold title with subtitle, best for: sermon series, event names, major topics
   - "topic-pill" → compact pill badge, best for: short labels, themes, quick topics

3. STRICT FAITHFULNESS (NO ADDED NOTES OR COMMENTARY):
   - Use ONLY the exact information provided in the raw input message.
   - Absolutely NEVER add theological commentary, devotional notes, interpretations, or unmentioned scripture citations.
   - Do NOT invent or assume facts, names, or instructions not present in the original message.
   - Your sole responsibility is to clean grammar, organize layout (headers, bullet points, standardized phone/dates), and apply colors faithfully to the provided text.

4. EDITORIAL POLISH, STRUCTURE & LINE BREAKS:
   - Refine casual, fragmented, or spoken phrasing into formal broadcast English with clean punctuation.
   - For structured messages with a title and body (especially for Chevron Lower Third, Headline Card, and Topic Pill):
     Cleanly separate the bold title from the body details using an intentional newline ('\n'):
     Example format: "{colorA}MAIN TITLE OR TOPIC{/colorA}\nDescriptive body details, speaker name, dates, or scripture citations."
   - Standardize scripture citations (e.g. "Hebrews 11:1-6"), phone numbers, times, and dates.
   - Use bullet points (" • ") or dashes (" — ") to cleanly separate sections within lines.

5. TEXT COLOR HIGHLIGHTING SYNTAX & HIGH-CONTRAST COMPATIBILITY (CRITICAL):
   - Highlight words using matching opening and closing color tags: "{color}Text to highlight{/color}"
   - Available colors: red, green, blue, yellow, purple, orange, pink, cyan, white.
   - Syntax Rule: Every opening tag "{color}" MUST have a matching closing tag "{/color}" with the exact same color name (e.g. "{yellow}Text{/yellow}").
   - Syntax Structure: "{colorA}HEADER:{/colorA} Plain text with {colorB}key details{/colorB} and {colorC}dates/references{/colorC}"
   - STRICT BACKGROUND-TO-TEXT CONTRAST COMPATIBILITY (MUST NEVER CLASH OR BECOME INVISIBLE ON PROJECTORS):
     * On Regal Purple / Violet background (#4c1d95, #6d28d9): Use {yellow} (radiant gold), {cyan}, {white}, or {orange}. FORBIDDEN: NEVER use {purple} or {blue}.
     * On Deep Emerald / Jade background (#064e3b, #047857): Use {yellow} (warm gold), {white}, {cyan}, or {pink}. FORBIDDEN: NEVER use {green}.
     * On Royal Amber / Gold background (#78350f, #854d0e): Use {white} (crisp white), {cyan} (electric cyan), or {blue}. FORBIDDEN: NEVER use {orange}, {yellow}, or {red}.
     * On Wine Burgundy / Crimson background (#831843, #4c0519): Use {yellow} (gold), {white}, {cyan}, or {green}. FORBIDDEN: NEVER use {red}, {pink}, or {purple}.
     * On Deep Oceanic Teal background (#0f766e): Use {yellow} (gold), {orange} (warm amber), or {white}. FORBIDDEN: NEVER use {cyan} or {blue}.
   - Never use text colors that bleed into or match the background color. All text must POP with sharp, crystal-clear projection contrast!
   - In htmlText, mirror this by wrapping highlighted text in <span className="..."> with Tailwind color classes matching your chosen colors.

6. REACT JSX HTML:
   - Return clean HTML strictly using 'className' with Tailwind utilities (NEVER use 'class'!).

Return ONLY a valid JSON object adhering to this schema:
{
  "backgroundColor": "<custom hex code, e.g. #4c1d95 or #064e3b or #78350f or #831843 or #0f766e>",
  "markupText": "<styled text with color tags>",
  "htmlText": "<clean React JSX string using className>",
  "suggestedSpeed": 22,
  "themeName": "<short theme title>",
  "templateId": "<one of: marquee-classic | broadcast-ticker | chevron-lower-third | scripture-badge | headline-card | topic-pill>"
}`;

    const promptText = `Announcement message:\n"${rawText.trim()}"`;

    try {
      const callGeminiAlert = async (model: string, jsonMode = true): Promise<Response | null> => {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const genConfig: any = {
            temperature: 0.85,
            maxOutputTokens: 800,
          };
          if (jsonMode) {
            genConfig.response_mime_type = "application/json";
          }
          return await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: "user", parts: [{ text: promptText }] }],
              generationConfig: genConfig,
            }),
          });
        } catch (netErr) {
          console.warn(`Network error calling Gemini model ${model}:`, netErr);
          return null;
        }
      };

      let response = await callGeminiAlert(modelToUse, true);

      // If model returned 400 (some models don't support response_mime_type), retry without strict JSON mode
      if (response && response.status === 400) {
        console.warn(`Gemini model ${modelToUse} returned 400 with strict JSON, retrying standard mode...`);
        response = await callGeminiAlert(modelToUse, false);
      }

      // If model returned 404, network failed, or was not ok, try available fallback models
      if (!response || response.status === 404 || !response.ok) {
        console.warn(`Gemini model ${modelToUse} failed (status: ${response?.status}). Trying fallbacks...`);
        this.cachedModel = null;
        const fallbacks = [
          "gemini-flash-latest",
          "gemini-pro-latest",
          "gemini-flash-lite-latest",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-3.6-flash",
          "gemini-3.7-flash",
        ];
        for (const fb of fallbacks) {
          if (fb !== modelToUse) {
            let fbRes = await callGeminiAlert(fb, true);
            if (fbRes && fbRes.status === 400) {
              fbRes = await callGeminiAlert(fb, false);
            }
            if (fbRes && fbRes.ok) {
              response = fbRes;
              modelToUse = fb;
              this.cachedModel = fb;
              console.log(`Fallback succeeded with Gemini model: ${fb}`);
              break;
            }
          }
        }
      }

      if (!response || !response.ok) {
        const errText = response ? await response.text() : "Network request failed";
        this.cachedModel = null;
        let friendly = "Google Gemini is currently unable to style this alert.";
        if (response?.status === 404) {
          friendly = `Gemini model (${modelToUse}) not found on your account. Switching to a standard model...`;
        } else if (response?.status === 429) {
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
            backgroundColor: "#4c1d95",
            markupText: rawText,
            htmlText: `<span>${rawText}</span>`,
            suggestedSpeed: 22,
            themeName: "Announcement",
          },
        };
      }

      let chosenBg = parsed.backgroundColor?.trim();
      const isBlueOrNavy = (hex?: string): boolean => {
        if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return false;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        // Dominantly blue or dark navy/slate
        return b > 110 && b > r + 25 && b > g + 15;
      };

      if (!chosenBg || isBlueOrNavy(chosenBg)) {
        const lower = rawText.toLowerCase();
        if (/praise|worship|thank|celebrat|joy|sunday|service|tithe|offer|giving|bless/i.test(lower)) {
          chosenBg = "#78350f"; // Royal Amber Gold
        } else if (/heal|life|health|peace|rest|grow|fasting|family|mission/i.test(lower)) {
          chosenBg = "#064e3b"; // Deep Emerald Green
        } else if (/blood|cross|communion|sacrific|love|mercy|grace/i.test(lower)) {
          chosenBg = "#831843"; // Deep Wine Burgundy
        } else if (/youth|teen|kid|camp|fellowship|meet|gather|connect/i.test(lower)) {
          chosenBg = "#9a3412"; // Vivid Terracotta
        } else if (/spirit|truth|baptis|water|river/i.test(lower)) {
          chosenBg = "#0f766e"; // Deep Teal
        } else {
          const jewelTones = ["#4c1d95", "#064e3b", "#78350f", "#831843", "#6d28d9", "#0f766e"];
          chosenBg = jewelTones[Math.floor(Math.random() * jewelTones.length)];
        }
      }

      return {
        success: true,
        data: {
          backgroundColor: chosenBg,
          markupText: parsed.markupText || rawText,
          htmlText: parsed.htmlText || `<span>${rawText}</span>`,
          suggestedSpeed: parsed.suggestedSpeed || 22,
          themeName: parsed.themeName || "General Announcement",
          templateId: parsed.templateId || undefined,
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

