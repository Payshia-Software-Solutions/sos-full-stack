import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/lib/config', () => ({ LMS_API_URL: 'http://api.test' }));
import { getCoursePageAdmin, saveCoursePageDraft, publishCoursePage } from './course-pages';

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

describe('course page admin actions', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('maps the admin response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({
      success: true, course_code: 'CS0001', status: 'published',
      draft: { en: { hero: { title: 'T' } }, si: {}, ta: {}, overrides: { si: [], ta: [] } },
      published: null, published_at: '2026-11-10 10:00:00', updated_at: '2026-11-10 10:00:00',
    }));
    vi.stubGlobal('fetch', fetchMock);
    const page = await getCoursePageAdmin('CS0001');
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/api/course-pages/admin/CS0001', expect.anything());
    expect(page.status).toBe('published');
    expect(page.draft?.en.hero?.title).toBe('T');
    expect(page.publishedAt).toBe('2026-11-10 10:00:00');
  });

  it('sends the draft as PUT with content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ success: true, status: 'draft' }));
    vi.stubGlobal('fetch', fetchMock);
    await saveCoursePageDraft('CS0001', { en: {}, si: {}, ta: {}, overrides: { si: [], ta: [] } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/api/course-pages/CS0001');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body).content.en).toEqual({});
  });

  it('throws the server message on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({ success: false, message: 'No draft to publish' }) }));
    await expect(publishCoursePage('CS0001')).rejects.toThrow('No draft to publish');
  });
});
