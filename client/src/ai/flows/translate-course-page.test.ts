import { describe, it, expect, afterEach, vi } from 'vitest';
import { translateCoursePage, isTranslateEnabled } from './translate-course-page';

describe('translateCoursePage', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is disabled and does not call the model when no key is set', async () => {
    vi.stubEnv('GOOGLE_GENAI_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(await isTranslateEnabled()).toBe(false);
    expect(await translateCoursePage({ 'hero.title': 'Hello' }, 'si')).toEqual({ enabled: false });
  });

  it('returns an empty result for empty input when enabled', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    expect(await isTranslateEnabled()).toBe(true);
    expect(await translateCoursePage({}, 'ta')).toEqual({ enabled: true, result: {} });
  });
});
