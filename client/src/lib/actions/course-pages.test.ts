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

import { uploadCourseCover } from './course-pages';

describe('uploadCourseCover', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the image as multipart form data and returns the file name and public URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ success: true, filename: 'cover_1.png', url: 'https://cdn.test/courses/CS0001/cover_1.png' }));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File([new Uint8Array([1, 2, 3])], 'my cover.png', { type: 'image/png' });
    const result = await uploadCourseCover('CS0001', file);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/api/course-pages/CS0001/cover');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('image')).toBeInstanceOf(File);
    expect(init.headers?.['Content-Type']).toBeUndefined();
    expect(result).toEqual({ filename: 'cover_1.png', url: 'https://cdn.test/courses/CS0001/cover_1.png' });
  });

  it('rejects a non-image or oversized file before calling the server', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(uploadCourseCover('CS0001', new File(['x'], 'a.pdf', { type: 'application/pdf' }))).rejects.toThrow('JPG, PNG or WebP');
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    await expect(uploadCourseCover('CS0001', big)).rejects.toThrow('5 MB');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws the server message when the upload fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ success: false, message: 'Could not reach the content server' }) }));
    await expect(uploadCourseCover('CS0001', new File(['x'], 'a.png', { type: 'image/png' }))).rejects.toThrow('Could not reach the content server');
  });
});
