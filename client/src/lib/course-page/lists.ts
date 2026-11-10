// "One point per line" editing for plain text lists (who it's for, what you'll learn, paragraphs, ...).
// SI/TA lists line up with the English list by position, so structural English edits are mirrored to them.
import { applyListOp, getList, setValueAt, type ListOp } from './paths';
import type { CoursePageContent, PageLanguage } from './types';

export type ListTextKind = 'lines' | 'paragraphs';

const asText = (item: unknown) => (typeof item === 'string' ? item : '');

export function listToText(items: unknown[], kind: ListTextKind): string {
  return items.map(asText).join(kind === 'paragraphs' ? '\n\n' : '\n');
}

/**
 * English drops blank entries (the list is whatever is written). SI/TA keep blank entries as empty slots so each
 * translation stays on the same position as its English item; trailing blanks carry no information and are trimmed.
 */
export function textToList(text: string, kind: ListTextKind, keepBlanks: boolean): string[] {
  const parts = (kind === 'paragraphs' ? text.split(/\r?\n[ \t]*\r?\n/) : text.split(/\r?\n/)).map((p) => p.trim());
  if (!keepBlanks) return parts.filter(Boolean);
  while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts;
}

type Change = { type: 'remove'; index: number } | { type: 'insert'; index: number; item: string };

/** Recognises "one line was deleted" or "one line was added" between two versions of a list; anything else is null. */
export function detectListChange(oldItems: string[], newItems: string[]): Change | null {
  const without = (items: string[], k: number) => [...items.slice(0, k), ...items.slice(k + 1)];
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
  if (newItems.length === oldItems.length - 1) {
    for (let k = 0; k < oldItems.length; k++) if (same(without(oldItems, k), newItems)) return { type: 'remove', index: k };
  }
  if (newItems.length === oldItems.length + 1) {
    for (let k = 0; k < newItems.length; k++) if (same(without(newItems, k), oldItems)) return { type: 'insert', index: k, item: newItems[k] };
  }
  return null;
}

/** Applies the text typed into a list box. Returns a new content object; the input is never mutated. */
export function setListFromText(content: CoursePageContent, listPath: string, kind: ListTextKind, lang: PageLanguage, text: string): CoursePageContent {
  const items = textToList(text, kind, lang !== 'en');

  if (lang === 'en') {
    const old = getList(content.en, listPath).map(asText);
    const change = detectListChange(old, items);
    let next = content;
    if (change?.type === 'remove') next = applyListOp(content, listPath, { type: 'remove', index: change.index } satisfies ListOp);
    else if (change?.type === 'insert') next = applyListOp(content, listPath, { type: 'insert', index: change.index, item: change.item } satisfies ListOp);
    return { ...next, en: setValueAt(next.en, listPath, items) as CoursePageContent['en'] };
  }

  const old = getList(content[lang], listPath).map(asText);
  const overrides = content.overrides ?? { si: [], ta: [] };
  const marked = new Set(overrides[lang].filter((path) => {
    if (!path.startsWith(`${listPath}.`)) return true;
    return Number(path.slice(listPath.length + 1).split('.')[0]) < items.length;
  }));
  items.forEach((value, i) => {
    if (value === (old[i] ?? '')) return;
    if (value) marked.add(`${listPath}.${i}`);
    else marked.delete(`${listPath}.${i}`);
  });
  return {
    ...content,
    [lang]: setValueAt(content[lang], listPath, items),
    overrides: { ...overrides, [lang]: [...marked] },
  };
}
