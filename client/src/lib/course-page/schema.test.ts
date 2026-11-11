import { describe, it, expect } from 'vitest';
import { BLOCKS, isBlockFilled } from './schema';

describe('isBlockFilled', () => {
  it('is false for missing or empty blocks', () => {
    expect(isBlockFilled({}, 'hero')).toBe(false);
    expect(isBlockFilled({ hero: { title: '  ' } }, 'hero')).toBe(false);
    expect(isBlockFilled({ modules: { items: [] } }, 'modules')).toBe(false);
    expect(isBlockFilled({ faq: { items: [{ question: '', answer: '' }] } }, 'faq')).toBe(false);
  });

  it('is true when any text or list item has content', () => {
    expect(isBlockFilled({ hero: { title: 'T' } }, 'hero')).toBe(true);
    expect(isBlockFilled({ audience: { items: ['a'] } }, 'audience')).toBe(true);
    expect(isBlockFilled({ modules: { items: [{ title: 'M' }] } }, 'modules')).toBe(true);
  });

  it('ignores an icon-only feature (it has no text)', () => {
    expect(isBlockFilled({ features: { items: [{ icon: 'award' }] } }, 'features')).toBe(false);
  });

  it('every block in the editor schema has a unique id', () => {
    const ids = BLOCKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
