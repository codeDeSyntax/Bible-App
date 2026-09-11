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

class OpenRouterScriptureExtractor {
  private consecutiveFailures: number = 0;
  private circuitBreakerOpenUntil: number = 0;
  private cachedModel: string | null = null;
  private lastModelFetchTime: number = 0;

  /**
   * Returns the best model for OpenRouter
   */
  private async getBestAvailableModel(apiKey: string): Promise<string> {
    const now = Date.now();
    if (this.cachedModel && now - this.lastModelFetchTime < 1800000) {
      return this.cachedModel;
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://bible-bor.app",
          "X-Title": "Bible Book of Redemption",
        },
      });

      if (res.ok) {
        const body = (await res.json()) as { data?: Array<{ id: string }> };
        const rawModelIds = (body.data || []).map((m) => m.id);

        const preferredModels = [
          "deepseek/deepseek-chat",
          "deepseek/deepseek-chat:free",
          "deepseek/deepseek-r1",
          "deepseek/deepseek-r1:free",
          "meta-llama/llama-3.3-70b-instruct",
          "meta-llama/llama-3.3-70b-instruct:free",
          "qwen/qwen-2.5-72b-instruct",
          "qwen/qwen-2.5-72b-instruct:free",
          "mistralai/mistral-small-24b-instruct-2501:free",
          "google/gemini-2.0-flash-001",
        ];

        for (const pref of preferredModels) {
          if (rawModelIds.includes(pref)) {
            this.cachedModel = pref;
            this.lastModelFetchTime = now;
            console.log(`⚡ OpenRouter selected model: ${pref}`);
            return pref;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to query OpenRouter models list:", err);
    }

    return "deepseek/deepseek-chat";
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
        console.error("Failed to parse OpenRouter JSON substring:", e);
      }
    }
    return null;
  }

  /**
   * Extract scripture reference or navigation intent from rolling transcript snippet using OpenRouter AI
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
        error: `OpenRouter rate limit reached. Pausing for ${waitSec}s...`,
      };
    }

    const keys = await loadSmartProjectionKeys();
    const apiKey = keys.openRouterKey?.trim();

    if (!apiKey) {
      return {
        success: false,
        error: "OpenRouter API Key is missing. Please set it in Settings.",
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
3. SEMANTIC PARAPHRASES & THEMATIC TEACHINGS: When a speaker or user describes or paraphrases biblical scripture, YOU MUST ACCURATELY IDENTIFY THE BIBLICAL BOOK, CHAPTER, AND VERSE.
4. RELATIVE CUES: "next verse", "let's read on", "continue", "go back", "verse 20".${contextPrompt}

CRITICAL RULES:
- If a book and chapter is given without a verse (e.g., "Romans 8", "Psalm 23"), ASSUME verseStart: 1, verseEnd: 1, action: "NEW_CITATION".
- For semantic paraphrases or quotes, ALWAYS supply the precise "book", "chapter", "verseStart", "reference" (e.g. "Romans 7:19"), and a descriptive "contextSummary".
- Set high confidence (0.90 - 0.98) when a biblical verse or paraphrase is recognized.
- REJECT purely secular topics that have no biblical content -> {"detected": false}.
- THEME & NATURAL MOOD: Generate a harmonious pair of hex colors ("gradientColors") and 2-3 pure natural landscape keywords ("themeKeywords", e.g., "green pastures", "mountain peak", "golden sunrise", "starry heavens", "cascading waterfall"). Pure scenery only.

Respond ONLY with a valid JSON object adhering to this schema:

If scripture is detected:
{
  "detected": true,
  "action": "NEW_CITATION" | "NEXT_VERSE" | "PREV_VERSE" | "JUMP_VERSE",
  "reference": "Romans 7:19",
  "book": "Romans",
  "chapter": 7,
  "verseStart": 19,
  "verseEnd": 19,
  "confidence": 0.95,
  "contextSummary": "Brief explanation",
  "gradientColors": ["#hex1", "#hex2"],
  "themeKeywords": "natural landscape keywords"
}

If no biblical scripture is detected:
{
  "detected": false
}`;

    const userPrompt = `Transcript Snippet: "${transcript.trim()}"`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://bible-bor.app",
          "X-Title": "Bible Book of Redemption",
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`OpenRouter returned status ${response.status}:`, errorText);
        if (response.status === 429) {
          this.consecutiveFailures++;
          this.circuitBreakerOpenUntil = Date.now() + 15000;
        }
        return {
          success: false,
          error: `OpenRouter error (${response.status})`,
        };
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      const parsed = this.extractJson(content);

      if (parsed) {
        this.consecutiveFailures = 0;
        return {
          success: true,
          data: {
            ...parsed,
            rawTranscript: transcript,
          },
        };
      }

      return {
        success: false,
        error: "Failed to parse OpenRouter response.",
      };
    } catch (err: any) {
      console.error("OpenRouter scripture extraction network error:", err);
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 3) {
        this.circuitBreakerOpenUntil = Date.now() + 20000;
      }
      return {
        success: false,
        error: "Unable to reach OpenRouter servers.",
      };
    }
  }

  /**
   * Generates a beautifully styled marquee alert design from raw announcement text using OpenRouter
   */
  public async generateStyledAlert(
    rawText: string,
    alertType?: string,
    structuredData?: any,
  ): Promise<{
    success: boolean;
    data?: {
      backgroundColor: string;
      markupText: string;
      htmlText: string;
      suggestedSpeed?: number;
      themeName?: string;
      templateId?: string;
      structuredData?: any;
    };
    error?: string;
  }> {
    const keys = await loadSmartProjectionKeys();
    const apiKey = keys.openRouterKey?.trim();
    if (!apiKey) {
      return { success: false, error: "OpenRouter API Key is not configured." };
    }

    const primaryModel = await this.getBestAvailableModel(apiKey);
    const candidateModels = [
      primaryModel,
      "google/gemini-2.0-flash-001",
      "meta-llama/llama-3.3-70b-instruct",
      "qwen/qwen-2.5-72b-instruct",
      "deepseek/deepseek-chat",
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    const systemPrompt = `You are an elite live broadcast television graphics producer and church media director.
Your objective is to intelligently analyze any announcement, sermon topic, scripture reading, or event message and transform it into a formal, authoritative, and professionally designed on-screen presentation.

INTELLIGENT DESIGN & EDITORIAL PRINCIPLES:
1. DYNAMIC BACKGROUND COLOR (CRITICAL):
   - Autonomously select a custom, rich, vibrant background hex color (#RRGGBB) tailored specifically to the mood, theme, and subject of the message.
   - Choose a deep, saturated, high-contrast tone so text is sharply legible on large projectors.
   - STRICT CONSTRAINT: DO NOT DEFAULT TO BLUE, SLATE, OR NAVY.
   - Intelligently vary colors across generations:
     * Scripture / Devotional / Faith: Regal Purple (#4c1d95, #581c87), Royal Violet (#6d28d9), Deep Indigo (#312e81)
     * Majesty / Kingdom / Royalty: Imperial Plum (#3b0764), Royal Mulberry (#581c87), Deep Amethyst (#6b21a8)
     * Praise / Celebration / Joy: Royal Amber/Gold (#78350f, #92400e), Warm Bronze (#854d0e), Crimson Amber (#9a3412)
     * Life / Growth / Healing / Peace: Deep Emerald (#064e3b, #065f46), Forest Jade (#047857), Deep Spruce Pine (#14532d)
     * Communion / Cross / Grace / Love: Deep Wine Burgundy (#4c0519, #701a75), Crimson Rose (#9f1239, #831843)
     * Harvest / Thanksgiving / Abundance: Warm Chestnut (#713f12), Golden Ochre (#b45309)
     * Holy Spirit / Truth / Living Water: Deep Oceanic Teal (#0f766e), Deep Marine Spruce (#134e4a, #115e59)

2. HARMONIOUS LABEL COLOR & CONTENT HIERARCHY (CRITICAL):
   - Wrap ALL field prefix labels (e.g. Topic:, Scriptures:, Minister:, Date:, Venue:, Contact:, Verse:, Theme:, Headline:, Details:) in a FRESH, VIBRANT harmonious accent color.
   - STRICT CONSTRAINT: DO NOT ALWAYS USE GOLD. Pick from a diverse palette of vibrant broadcast colors that pop on the chosen background:
     * Purple / Violet / Indigo backgrounds -> use {cyan}, {lime}, {rose}, {amber}, or {white} (e.g. "{cyan}Topic:{/cyan} {white}Walking in Dominion{/white}")
     * Burgundy / Wine / Crimson backgrounds -> use {cyan}, {lime}, {yellow}, or {white} (e.g. "{lime}Event:{/lime} {white}Night of Worship{/white}")
     * Emerald / Forest Green backgrounds -> use {amber}, {cyan}, {yellow}, or {white} (e.g. "{amber}Scripture:{/amber} {white}Psalm 23:1-3{/white}")
     * Amber / Bronze backgrounds -> use {cyan}, {teal}, or {white} (e.g. "{cyan}Headline:{/cyan} {white}Youth Camp 2026{/white}")
     * Teal / Marine backgrounds -> use {lime}, {amber}, or {white} (e.g. "{lime}Theme:{/lime} {white}Living Waters{/white}")
     * Deep Navy / Midnight backgrounds -> use {cyan}, {lime}, {coral}, or {violet} (e.g. "{cyan}Notice:{/cyan} {white}Bible Study Online{/white}")
   - CRITICAL: Keep all value contents, sermon titles, dates, verses, and descriptions in crisp, legible {white} so the colored label stands out with rich visual hierarchy!

3. ALERT TYPES & DEDICATED STRUCTURE:
   - When Alert Type is "SERMON":
     * e.g. "{cyan}Topic:{/cyan} {white}Walking in Divine Dominion{/white}\n{amber}Scriptures:{/amber} {white}Romans 8:28{/white} • {lime}Minister:{/lime} {white}Pastor David{/white} • {rose}Notes:{/rose} {white}Faith over fear{/white}"
     * Suggested templates: "headline-card", "chevron-lower-third", or "topic-pill".
   - When Alert Type is "NEWS":
     * e.g. "{lime}Event:{/lime} {white}Night of Supernatural Worship{/white}\n{cyan}Date:{/cyan} {white}Friday @ 6:00 PM{/white} • {amber}Venue:{/amber} {white}Main Auditorium{/white} • {rose}Contact:{/rose} {white}055-123-4567{/white}"
     * Suggested templates: "broadcast-ticker" or "marquee-classic".
   - When Alert Type is "SCRIPTURE":
     * e.g. "{amber}Scripture:{/amber} {white}Psalm 23:1-3{/white}\n{cyan}Verse:{/cyan} \"{white}The Lord is my shepherd, I shall not want...{/white}\" • {lime}Theme:{/lime} {white}Divine Providence{/white}"
     * Suggested templates: "scripture-badge" or "chevron-lower-third".
   - When Alert Type is "GENERAL":
     * e.g. "{cyan}Headline:{/cyan} {white}Welcome to Sunday Celebration{/white}\n{lime}Message:{/lime} {white}Kindly silence all mobile devices during the service.{/white}"
     * Suggested template: "marquee-classic" or "broadcast-ticker".

4. TEMPLATE SELECTION:
   - "marquee-classic" → scrolling ticker, best for: general announcements, notices
   - "broadcast-ticker" → two-tone bar (category chip + scrolling text), best for: church notices, news
   - "chevron-lower-third" → TV lower third, best for: sermon topics, speaker intros
   - "scripture-badge" → glass card with reference + verse, best for: Bible readings, devotionals
   - "headline-card" → bold title with subtitle chips, best for: sermon series, major topics
   - "topic-pill" → compact pill badge, best for: short labels, quick topics

Return ONLY a valid JSON object adhering to this schema:
{
  "backgroundColor": "<custom hex code, e.g. #4c1d95 or #064e3b or #78350f or #831843 or #0f766e>",
  "markupText": "<styled text with harmonious label color tags, white content, and newlines>",
  "htmlText": "<clean React JSX string using className>",
  "suggestedSpeed": 22,
  "themeName": "<short theme title>",
  "templateId": "<one of: marquee-classic | broadcast-ticker | chevron-lower-third | scripture-badge | headline-card | topic-pill>",
  "structuredData": {
    "title": "<extracted or polished title>",
    "scriptures": "<extracted or standardized scripture references>",
    "speaker": "<extracted speaker or minister name>",
    "notes": "<extracted key takeaway or body details>",
    "headline": "<headline for news/events>",
    "details": "<event details>",
    "dateTime": "<date and time>",
    "venue": "<venue or location>",
    "contact": "<contact info or phone>",
    "reference": "<scripture reference>",
    "verseText": "<verse text>",
    "focus": "<devotional focus or theme>"
  }
}`;

    const cleanText = rawText.replace(/\{[^\}]+\}/g, "").trim();
    let userPrompt = `Message content to design:\n"${cleanText}"`;
    if (alertType) {
      userPrompt += `\n\nTarget Alert Type: ${alertType.toUpperCase()}`;
      if (structuredData) {
        userPrompt += `\nStructured Input Data: ${JSON.stringify(structuredData)}`;
      }
    }
    userPrompt += `\n\nInstruction: Produce a FRESH, distinct, highly aesthetic broadcast theme and background color palette for this alert with vibrant contrasting label colors. Return ONLY the JSON object adhering to the schema:`;

    // Multi-model retry loop if upstream rate-limited (429)
    for (const modelToTry of candidateModels) {
      try {
        console.log(`🎨 OpenRouter styling alert using model: ${modelToTry}`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://bible-bor.app",
            "X-Title": "Bible Book of Redemption",
          },
          body: JSON.stringify({
            model: modelToTry,
            models: candidateModels, // Native OpenRouter multi-model failover
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.95,
            max_tokens: 700,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`OpenRouter styled alert with ${modelToTry} returned status ${response.status}:`, errorText);
          if (response.status === 429) {
            // Try next candidate model on rate limit / engine overload
            continue;
          }
          return { success: false, error: `OpenRouter generation error (${response.status})` };
        }

        const json = await response.json();
        const content = json.choices?.[0]?.message?.content;
        let parsed: any;
        try {
          parsed = JSON.parse(content);
        } catch {
          const mdMatch = content?.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (mdMatch && mdMatch[1]) {
            parsed = JSON.parse(mdMatch[1]);
          }
        }

        if (parsed && (parsed.backgroundColor || parsed.markupText)) {
          return {
            success: true,
            data: {
              backgroundColor: parsed.backgroundColor || "#4c1d95",
              markupText: parsed.markupText || rawText,
              htmlText: parsed.htmlText || "",
              suggestedSpeed: parsed.suggestedSpeed || 22,
              themeName: parsed.themeName || "Divine Theme",
              templateId: parsed.templateId || "headline-card",
              structuredData: parsed.structuredData || structuredData,
            },
          };
        }
      } catch (err: any) {
        console.warn(`Attempt with ${modelToTry} failed:`, err?.message);
      }
    }

    return { success: false, error: "OpenRouter generation temporarily unavailable. Please retry shortly." };
  }
}

export const openRouterScriptureExtractor = new OpenRouterScriptureExtractor();
