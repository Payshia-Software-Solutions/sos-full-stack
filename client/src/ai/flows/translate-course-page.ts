'use server';
/**
 * Translates course page text (dot-path → English string) into Sinhala or Tamil.
 * Disabled unless GOOGLE_GENAI_API_KEY or GEMINI_API_KEY is set; never throws.
 */

const LANGUAGE_NAMES = { si: 'Sinhala', ta: 'Tamil' } as const;

function hasKey(): boolean {
  return Boolean(process.env.GOOGLE_GENAI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim());
}

export async function isTranslateEnabled(): Promise<boolean> {
  return hasKey();
}

export async function translateCoursePage(
  texts: Record<string, string>,
  lang: 'si' | 'ta'
): Promise<{ enabled: boolean; result?: Record<string, string>; error?: string }> {
  if (!hasKey()) return { enabled: false };
  const keys = Object.keys(texts);
  if (keys.length === 0) return { enabled: true, result: {} };

  try {
    // Imported lazily so the Genkit plugin is never initialised without a key.
    const { ai } = await import('@/ai/genkit');
    const { text } = await ai.generate({
      prompt:
        `Translate the values of this JSON object from English to ${LANGUAGE_NAMES[lang]} for a pharmacy college course page. ` +
        `Keep every key exactly as given, keep medicine names and course codes unchanged, and return only the JSON object.\n\n` +
        JSON.stringify(texts),
    });
    const json = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '');
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const key of keys) {
      const value = parsed[key];
      if (typeof value === 'string' && value.trim() !== '') result[key] = value.trim();
    }
    return { enabled: true, result };
  } catch (e) {
    return { enabled: true, error: e instanceof Error ? e.message : 'Translation failed' };
  }
}
