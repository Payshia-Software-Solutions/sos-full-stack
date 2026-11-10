import { describe, it, expect } from 'vitest';
import { detectListChange, listToText, setListFromText, textToList } from './lists';
import type { CoursePageContent } from './types';

const content = (): CoursePageContent => ({
  en: { audience: { items: ['a', 'b', 'c'] }, overview: { paragraphs: ['p1', 'p2'] } },
  si: { audience: { items: ['සa', 'සb', 'සc'] } },
  ta: {},
  overrides: { si: ['audience.items.1', 'audience.items.2'], ta: [] },
});

describe('listToText / textToList', () => {
  it('joins one point per line, or paragraphs separated by a blank line', () => {
    expect(listToText(['a', 'b'], 'lines')).toBe('a\nb');
    expect(listToText(['a', 'b'], 'paragraphs')).toBe('a\n\nb');
    expect(listToText(['a', null, 3] as unknown[], 'lines')).toBe('a\n\n');
  });

  it('English: trims and drops blank lines', () => {
    expect(textToList('a\n\n  b \nc\n', 'lines', false)).toEqual(['a', 'b', 'c']);
  });

  it('SI/TA: keeps blank lines so positions line up, trims trailing blanks', () => {
    expect(textToList('සa\n\nසc\n\n', 'lines', true)).toEqual(['සa', '', 'සc']);
  });

  it('paragraphs are split on blank lines and keep inner line breaks', () => {
    expect(textToList('p1 line1\nline2\n\np2', 'paragraphs', false)).toEqual(['p1 line1\nline2', 'p2']);
  });
});

describe('detectListChange', () => {
  it('finds a removed line', () => {
    expect(detectListChange(['a', 'b', 'c'], ['a', 'c'])).toEqual({ type: 'remove', index: 1 });
    expect(detectListChange(['a', 'b', 'c'], ['a', 'b'])).toEqual({ type: 'remove', index: 2 });
    expect(detectListChange(['a', 'b', 'c'], ['b', 'c'])).toEqual({ type: 'remove', index: 0 });
  });

  it('finds an inserted line', () => {
    expect(detectListChange(['a', 'c'], ['a', 'b', 'c'])).toEqual({ type: 'insert', index: 1, item: 'b' });
    expect(detectListChange(['a', 'b'], ['a', 'b', 'c'])).toEqual({ type: 'insert', index: 2, item: 'c' });
  });

  it('treats in-place edits and other changes as no structural change', () => {
    expect(detectListChange(['a', 'b', 'c'], ['a', 'B', 'c'])).toBeNull();
    expect(detectListChange(['a', 'b'], ['a', 'b'])).toBeNull();
    expect(detectListChange(['a', 'b', 'c'], ['x'])).toBeNull();
  });
});

describe('setListFromText', () => {
  it('English: deleting a line also removes the matching SI line and remaps hand-edited paths', () => {
    const out = setListFromText(content(), 'audience.items', 'lines', 'en', 'a\nc');
    expect(out.en.audience!.items).toEqual(['a', 'c']);
    expect(out.si.audience!.items).toEqual(['සa', 'සc']);
    expect(out.overrides!.si).toEqual(['audience.items.1']);
  });

  it('English: inserting a line adds an empty slot in SI so later lines stay aligned', () => {
    const base = content();
    base.en.audience!.items = ['a', 'c'];
    base.si.audience!.items = ['සa', 'සc'];
    const out = setListFromText(base, 'audience.items', 'lines', 'en', 'a\nb\nc');
    expect(out.en.audience!.items).toEqual(['a', 'b', 'c']);
    expect(out.si.audience!.items).toEqual(['සa', '', 'සc']);
  });

  it('English: editing a line in place leaves SI untouched', () => {
    const out = setListFromText(content(), 'audience.items', 'lines', 'en', 'a\nB\nc');
    expect(out.en.audience!.items).toEqual(['a', 'B', 'c']);
    expect(out.si.audience!.items).toEqual(['සa', 'සb', 'සc']);
  });

  it('English paragraphs use blank-line separation', () => {
    const out = setListFromText(content(), 'overview.paragraphs', 'paragraphs', 'en', 'p1\n\nnew\n\np2');
    expect(out.en.overview!.paragraphs).toEqual(['p1', 'new', 'p2']);
  });

  it('SI: stores the lines, marks only changed lines as hand-edited, and clears the mark for emptied lines', () => {
    const out = setListFromText(content(), 'audience.items', 'lines', 'si', 'සa\nසX\n');
    expect(out.si.audience!.items).toEqual(['සa', 'සX']);
    expect(out.overrides!.si.sort()).toEqual(['audience.items.1']);
  });

  it('does not mutate its input', () => {
    const input = content();
    setListFromText(input, 'audience.items', 'lines', 'en', 'a\nc');
    expect(input).toEqual(content());
  });
});
