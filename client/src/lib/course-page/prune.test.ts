import { describe, it, expect } from 'vitest';
import { pruneBlankItems } from './prune';
import type { CoursePageContent } from './types';

const base = (): CoursePageContent => ({
  en: { audience: { items: ['a', '', 'c'] }, features: { items: [{ icon: 'award' }, { icon: 'pill', title: 'T' }] } },
  si: { audience: { items: ['සa', 'සb', 'සc'] } },
  ta: {},
  overrides: { si: ['audience.items.2'], ta: [] },
});

describe('pruneBlankItems', () => {
  it('removes blank English string items and keeps SI/TA aligned', () => {
    const out = pruneBlankItems(base());
    expect(out.en.audience!.items).toEqual(['a', 'c']);
    expect(out.si.audience!.items).toEqual(['සa', 'සc']);
    expect(out.overrides!.si).toEqual(['audience.items.1']);
  });

  it('treats an object item with only a default icon as blank', () => {
    const out = pruneBlankItems(base());
    expect(out.en.features!.items).toEqual([{ icon: 'pill', title: 'T' }]);
  });

  it('keeps items that have text and does not mutate its input', () => {
    const input = base();
    const out = pruneBlankItems(input);
    expect(out.en.features!.items).toHaveLength(1);
    expect(input).toEqual(base());
  });

  it('returns content unchanged when nothing is blank', () => {
    const clean: CoursePageContent = { en: { audience: { items: ['a'] } }, si: {}, ta: {}, overrides: { si: [], ta: [] } };
    expect(pruneBlankItems(clean)).toEqual(clean);
  });
});
