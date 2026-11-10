import { describe, it, expect } from 'vitest';
import { flattenDoc, setPath, changedPaths, applyTranslation, stalePaths } from './paths';

describe('flattenDoc', () => {
  it('flattens nested objects and arrays to dot paths', () => {
    expect(flattenDoc({ hero: { title: 'A' }, modules: { items: [{ title: 'M1' }] } })).toEqual({
      'hero.title': 'A',
      'modules.items.0.title': 'M1',
    });
  });

  it('flattens string lists and skips empty strings', () => {
    expect(flattenDoc({ audience: { items: ['x', ''] } })).toEqual({ 'audience.items.0': 'x' });
  });
});

describe('setPath', () => {
  it('creates missing objects and arrays without mutating input', () => {
    const input = { hero: { title: 'A' } };
    const out = setPath(input, 'modules.items.1.title', 'M2') as any;
    expect(out.modules.items[1].title).toBe('M2');
    expect(Array.isArray(out.modules.items)).toBe(true);
    expect(out.hero.title).toBe('A');
    expect(input).toEqual({ hero: { title: 'A' } });
  });

  it('sets a string list entry', () => {
    const out = setPath({}, 'audience.items.0', 'x') as any;
    expect(out.audience.items).toEqual(['x']);
  });
});

describe('changedPaths', () => {
  it('returns only paths whose string changed or was added', () => {
    const prev = { hero: { title: 'A', headline: 'H' } };
    const next = { hero: { title: 'B', headline: 'H', promise: 'P' } };
    expect(changedPaths(prev, next).sort()).toEqual(['hero.promise', 'hero.title']);
  });
});

describe('applyTranslation', () => {
  it('applyTranslation skips override paths', () => {
    const out = applyTranslation(
      { hero: { title: 'manual' } },
      { 'hero.title': 'auto', 'hero.headline': 'auto2' },
      ['hero.title']
    ) as any;
    expect(out.hero.title).toBe('manual');
    expect(out.hero.headline).toBe('auto2');
  });
});

describe('stalePaths', () => {
  it('lists EN paths whose SI value is empty', () => {
    const content = {
      en: { hero: { title: 'T', headline: 'H' }, features: { items: [{ icon: 'pill', title: 'F' }] } },
      si: { hero: { title: 'සි' } },
      ta: {},
    };
    expect(stalePaths(content, 'si').sort()).toEqual(['features.items.0.title', 'hero.headline']);
  });
});

import { getPath, applyListOp } from './paths';
import type { CoursePageContent } from './types';

const sample = (): CoursePageContent => ({
  en: { modules: { items: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] }, audience: { items: ['x', 'y'] } },
  si: { modules: { items: [{ title: 'සA' }, { title: 'සB' }, { title: 'සC' }] } },
  ta: { modules: { items: [{ title: 'தA' }] } },
  overrides: { si: ['modules.items.1.title', 'modules.items.2.title', 'hero.title'], ta: ['modules.items.0.title'] },
});

describe('getPath', () => {
  it('reads strings by dot path and returns undefined when missing', () => {
    expect(getPath(sample().en, 'modules.items.1.title')).toBe('B');
    expect(getPath(sample().en, 'audience.items.0')).toBe('x');
    expect(getPath(sample().en, 'modules.items.9.title')).toBeUndefined();
    expect(getPath({}, 'hero.title')).toBeUndefined();
  });
});

describe('applyListOp', () => {
  it('remove: drops the item in every language and remaps override paths', () => {
    const out = applyListOp(sample(), 'modules.items', { type: 'remove', index: 1 });
    expect((out.en.modules!.items as any[]).map((i) => i.title)).toEqual(['A', 'C']);
    expect((out.si.modules!.items as any[]).map((i) => i.title)).toEqual(['සA', 'සC']);
    expect((out.ta.modules!.items as any[]).map((i) => i.title)).toEqual(['தA']);
    expect(out.overrides!.si.sort()).toEqual(['hero.title', 'modules.items.1.title']);
    expect(out.overrides!.ta).toEqual(['modules.items.0.title']);
  });

  it('move: swaps positions in every language and remaps override paths', () => {
    const out = applyListOp(sample(), 'modules.items', { type: 'move', from: 0, to: 1 });
    expect((out.en.modules!.items as any[]).map((i) => i.title)).toEqual(['B', 'A', 'C']);
    expect((out.si.modules!.items as any[]).map((i) => i.title)).toEqual(['සB', 'සA', 'සC']);
    expect(out.overrides!.si.sort()).toEqual(['hero.title', 'modules.items.0.title', 'modules.items.2.title']);
    expect(out.overrides!.ta).toEqual(['modules.items.1.title']);
  });

  it('add: appends to English only', () => {
    const out = applyListOp(sample(), 'modules.items', { type: 'add', item: { title: 'D' } });
    expect((out.en.modules!.items as any[]).length).toBe(4);
    expect((out.si.modules!.items as any[]).length).toBe(3);
  });

  it('works on string lists and when SI/TA lists are shorter or missing', () => {
    const out = applyListOp(sample(), 'audience.items', { type: 'remove', index: 0 });
    expect(out.en.audience!.items).toEqual(['y']);
    expect(out.si.audience).toBeUndefined();
  });

  it('does not mutate its input', () => {
    const input = sample();
    applyListOp(input, 'modules.items', { type: 'remove', index: 0 });
    expect(input).toEqual(sample());
  });
});

import { editField } from './paths';

describe('editField', () => {
  const empty = (): CoursePageContent => ({ en: { hero: { title: 'T' } }, si: {}, ta: {}, overrides: { si: [], ta: [] } });

  it('editing English leaves overrides alone', () => {
    const out = editField(empty(), 'en', 'hero.title', 'New');
    expect(out.en.hero?.title).toBe('New');
    expect(out.overrides).toEqual({ si: [], ta: [] });
  });

  it('editing SI/TA text records the path once as hand-edited', () => {
    let out = editField(empty(), 'si', 'hero.title', 'සි');
    out = editField(out, 'si', 'hero.title', 'සිං');
    expect(out.si.hero?.title).toBe('සිං');
    expect(out.overrides!.si).toEqual(['hero.title']);
    expect(out.overrides!.ta).toEqual([]);
  });

  it('clearing an SI/TA field removes it from hand-edited paths', () => {
    let out = editField(empty(), 'ta', 'hero.title', 'த');
    out = editField(out, 'ta', 'hero.title', '   ');
    expect(out.overrides!.ta).toEqual([]);
  });
});

describe('documents that PHP serialised an empty object as []', () => {
  it('setPath turns an empty-array document into an object', () => {
    const out = setPath([] as unknown as object, 'hero.title', 'T') as any;
    expect(Array.isArray(out)).toBe(false);
    expect(JSON.parse(JSON.stringify(out))).toEqual({ hero: { title: 'T' } });
  });

  it('setPath turns an empty-array list item into an object', () => {
    const doc = { modules: { items: [[], []] } };
    const out = setPath(doc, 'modules.items.1.title', 'සි') as any;
    expect(JSON.parse(JSON.stringify(out))).toEqual({ modules: { items: [[], { title: 'සි' }] } });
  });

  it('editField keeps a typed SI value when the SI document came back as []', () => {
    const content = { en: { hero: { title: 'T' } }, si: [], ta: [], overrides: { si: [], ta: [] } } as unknown as CoursePageContent;
    const out = editField(content, 'si', 'hero.title', 'සි');
    expect(JSON.parse(JSON.stringify(out.si))).toEqual({ hero: { title: 'සි' } });
  });
});

describe('applyListOp insert', () => {
  it('inserts the item in English and an empty placeholder in SI/TA, remapping overrides', () => {
    const out = applyListOp(sample(), 'modules.items', { type: 'insert', index: 1, item: { title: 'N' } });
    expect((out.en.modules!.items as any[]).map((i) => i.title)).toEqual(['A', 'N', 'B', 'C']);
    expect((out.si.modules!.items as any[]).map((i) => i?.title)).toEqual(['සA', undefined, 'සB', 'සC']);
    expect(out.overrides!.si.sort()).toEqual(['hero.title', 'modules.items.2.title', 'modules.items.3.title']);
    expect(out.overrides!.ta).toEqual(['modules.items.0.title']);
  });
});
