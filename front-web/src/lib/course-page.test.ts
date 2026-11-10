import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveDoc, isBlockEmpty, buildFaqJsonLd, getCoursePage } from './course-page';

describe('resolveDoc', () => {
  it('falls back per field', () => {
    const out = resolveDoc({ en: { hero: { title: 'T', headline: 'H' } }, si: { hero: { title: 'සි' } } }, 'si');
    expect(out).toEqual({ hero: { title: 'සි', headline: 'H' } });
  });

  it('keeps en list length and fills missing items', () => {
    const en = { modules: { items: [{ title: 'M1', description: 'D1' }, { title: 'M2' }, { title: 'M3' }] } };
    const si = { modules: { items: [{ title: 'සි1' }] } };
    const out = resolveDoc({ en, si }, 'si');
    expect(out.modules.items).toEqual([{ title: 'සි1', description: 'D1' }, { title: 'M2' }, { title: 'M3' }]);
  });

  it('returns en when lang doc missing', () => {
    const en = { hero: { title: 'T' }, audience: { items: ['a', 'b'] } };
    expect(resolveDoc({ en }, 'ta')).toEqual(en);
  });

  it('treats empty translated strings as missing', () => {
    const out = resolveDoc({ en: { faq: { items: [{ question: 'Q', answer: 'A' }] } }, ta: { faq: { items: [{ question: '', answer: 'த' }] } } }, 'ta');
    expect(out.faq.items[0]).toEqual({ question: 'Q', answer: 'த' });
  });
});

describe('isBlockEmpty', () => {
  it('detects empty blocks', () => {
    expect(isBlockEmpty(undefined)).toBe(true);
    expect(isBlockEmpty({})).toBe(true);
    expect(isBlockEmpty({ title: '' })).toBe(true);
    expect(isBlockEmpty({ items: [] })).toBe(true);
    expect(isBlockEmpty({ title: 'A' })).toBe(false);
    expect(isBlockEmpty({ items: ['x'] })).toBe(false);
  });
});

describe('buildFaqJsonLd', () => {
  it('builds FAQPage from items', () => {
    const ld = buildFaqJsonLd({ faq: { items: [{ question: 'Q1', answer: 'A1' }, { question: 'Q2', answer: 'A2' }] } }) as any;
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(2);
    expect(ld.mainEntity[1].acceptedAnswer.text).toBe('A2');
  });

  it('returns null without items', () => {
    expect(buildFaqJsonLd({ faq: { items: [] } })).toBeNull();
    expect(buildFaqJsonLd({})).toBeNull();
  });
});

describe('getCoursePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns null on timeout/404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    expect(await getCoursePage('x')).toBeNull();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }));
    expect(await getCoursePage('x')).toBeNull();
  });

  it('maps the API response', async () => {
    const body = {
      success: true,
      course_code: 'CS0001',
      slug: 'certificate-course-in-pharmacy-practice',
      published_at: '2026-11-10 10:00:00',
      content: { en: { hero: { title: 'T' } }, si: {}, ta: {}, overrides: { si: [], ta: [] } },
      refund_policy: null,
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body }));
    const data = await getCoursePage('certificate-course-in-pharmacy-practice');
    expect(data?.courseCode).toBe('CS0001');
    expect(data?.content.en.hero?.title).toBe('T');
    expect(data?.refundPolicy).toBeNull();
  });
});
