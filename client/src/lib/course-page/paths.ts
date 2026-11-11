// Dot-path helpers for course page documents, e.g. "modules.items.3.description".
import { SHARED_FIELDS, type CoursePageContent, type TranslatedLanguage } from './types';

type Json = Record<string, unknown> | unknown[];


const isShared = (path: string) =>
  (SHARED_FIELDS as readonly string[]).includes(path.split('.').pop() ?? '');

export function flattenDoc(doc: object, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  const entries = Array.isArray(doc) ? doc.map((v, i) => [String(i), v] as const) : Object.entries(doc);
  for (const [key, value] of entries) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      if (value.trim() !== '') out[path] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(out, flattenDoc(value as object, path));
    }
  }
  return out;
}

/** Immutable set of any value at a dot path. Arrays stay dense: skipped indexes are filled with null. */
export function setValueAt(doc: object, path: string, value: unknown): object {
  const [head, ...rest] = path.split('.');
  // PHP serialises an empty object as [], so a container of the wrong kind is replaced: a numeric key needs
  // an array, a name needs an object (properties set on an array would be lost when it is saved as JSON).
  const headIsIndex = /^\d+$/.test(head);
  const source = Array.isArray(doc) === headIsIndex ? doc : headIsIndex ? [] : {};
  const container: Json = Array.isArray(source) ? [...source] : { ...(source as Record<string, unknown>) };
  const current = (container as Record<string, unknown>)[head];
  if (rest.length === 0) {
    (container as Record<string, unknown>)[head] = value;
  } else {
    const nextIsIndex = /^\d+$/.test(rest[0]);
    const child = typeof current === 'object' && current !== null ? current : nextIsIndex ? [] : {};
    (container as Record<string, unknown>)[head] = setValueAt(child as object, rest.join('.'), value);
  }
  if (Array.isArray(container)) {
    for (let i = 0; i < container.length; i++) if (!(i in container)) container[i] = null;
  }
  return container;
}

export function setPath(doc: object, path: string, value: string): object {
  return setValueAt(doc, path, value);
}

function getValueAt(doc: unknown, path: string): unknown {
  let current: unknown = doc;
  for (const key of path.split('.')) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** The string at a dot path, or undefined when missing or not a string. */
export function getPath(doc: object, path: string): string | undefined {
  const value = getValueAt(doc, path);
  return typeof value === 'string' ? value : undefined;
}

export type ListOp =
  | { type: 'add'; item: unknown }
  | { type: 'insert'; index: number; item: unknown }
  | { type: 'remove'; index: number }
  | { type: 'move'; from: number; to: number };

function applyToList(list: unknown[], op: ListOp): unknown[] {
  if (op.type === 'remove') return list.filter((_, i) => i !== op.index);
  if (op.type === 'add') return [...list, op.item];
  if (op.type === 'insert') {
    const padded = [...list];
    while (padded.length < op.index) padded.push(null);
    padded.splice(op.index, 0, op.item);
    return padded;
  }
  const length = Math.max(list.length, op.from + 1, op.to + 1);
  const padded = Array.from({ length }, (_, i) => (i < list.length ? list[i] : null));
  const [moved] = padded.splice(op.from, 1);
  padded.splice(op.to, 0, moved);
  while (padded.length > 0 && padded[padded.length - 1] === null) padded.pop();
  return padded;
}

/** New index for an item after the operation, or null when the item was removed. */
function remapIndex(index: number, op: ListOp): number | null {
  if (op.type === 'add') return index;
  if (op.type === 'insert') return index >= op.index ? index + 1 : index;
  if (op.type === 'remove') return index === op.index ? null : index > op.index ? index - 1 : index;
  if (index === op.from) return op.to;
  if (op.from < op.to && index > op.from && index <= op.to) return index - 1;
  if (op.from > op.to && index >= op.to && index < op.from) return index + 1;
  return index;
}

/**
 * Applies add / remove / move to the list at `listPath` in every language so SI/TA stay aligned with the
 * English list (they are matched by position), and remaps the hand-edited-field paths in `overrides`.
 * `add` appends to English only. Returns a new content object; the input is never mutated.
 */
export function applyListOp(content: CoursePageContent, listPath: string, op: ListOp): CoursePageContent {
  const out: CoursePageContent = { ...content };
  for (const lang of ['en', 'si', 'ta'] as const) {
    if (op.type === 'add' && lang !== 'en') continue;
    const existing = getValueAt(content[lang], listPath);
    if (!Array.isArray(existing) && lang !== 'en') continue;
    const list = Array.isArray(existing) ? existing : [];
    // An insert puts the new item in English and an empty slot in SI/TA, so translated items stay lined up.
    const langOp: ListOp =
      op.type === 'insert' && lang !== 'en' ? { ...op, item: typeof op.item === 'string' ? '' : {} } : op;
    out[lang] = setValueAt(content[lang], listPath, applyToList(list, langOp)) as CoursePageContent['en'];
  }
  const overrides = content.overrides ?? { si: [], ta: [] };
  const remap = (paths: string[]) =>
    paths.flatMap((path) => {
      if (!path.startsWith(`${listPath}.`)) return [path];
      const rest = path.slice(listPath.length + 1);
      const [first, ...tail] = rest.split('.');
      if (!/^\d+$/.test(first)) return [path];
      const next = remapIndex(Number(first), op);
      return next === null ? [] : [[listPath, String(next), ...tail].join('.')];
    });
  out.overrides = { si: remap(overrides.si), ta: remap(overrides.ta) };
  return out;
}

export function changedPaths(prev: object, next: object): string[] {
  const a = flattenDoc(prev);
  const b = flattenDoc(next);
  return Object.keys(b).filter((k) => a[k] !== b[k]);
}

export function applyTranslation(target: object, translated: Record<string, string>, overrides: string[]): object {
  let out: object = target;
  for (const [path, value] of Object.entries(translated)) {
    if (overrides.includes(path) || isShared(path) || typeof value !== 'string' || value.trim() === '') continue;
    out = setPath(out, path, value);
  }
  return out;
}

/** English text paths (excluding shared fields) that have no text in the given language. */
export function stalePaths(content: Pick<CoursePageContent, 'en' | 'si' | 'ta'>, lang: TranslatedLanguage): string[] {
  const en = flattenDoc(content.en);
  const tr = flattenDoc(content[lang] ?? {});
  return Object.keys(en).filter((p) => !isShared(p) && !tr[p]);
}

/** English text to send for translation: all non-shared EN strings, or only the given paths. */
export function translatableTexts(en: object, onlyPaths?: string[]): Record<string, string> {
  const flat = flattenDoc(en);
  const out: Record<string, string> = {};
  for (const [p, v] of Object.entries(flat)) {
    if (isShared(p)) continue;
    if (onlyPaths && !onlyPaths.includes(p)) continue;
    out[p] = v;
  }
  return out;
}


/** The array at a dot path, or an empty array when missing. */
export function getList(doc: object, path: string): unknown[] {
  const value = getValueAt(doc, path);
  return Array.isArray(value) ? value : [];
}

/**
 * Sets one text field in the given language. For SI/TA the path is recorded in `overrides` so that later
 * auto-translation never overwrites text a person typed; clearing the field removes the record.
 */
export function editField(content: CoursePageContent, lang: 'en' | TranslatedLanguage, path: string, value: string): CoursePageContent {
  const next: CoursePageContent = { ...content, [lang]: setPath(content[lang], path, value) as CoursePageContent['en'] };
  if (lang === 'en') return next;
  const overrides = content.overrides ?? { si: [], ta: [] };
  const current = new Set(overrides[lang]);
  if (value.trim() === '') current.delete(path);
  else current.add(path);
  next.overrides = { ...overrides, [lang]: [...current] };
  return next;
}
