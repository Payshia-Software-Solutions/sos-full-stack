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
