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

export function setPath(doc: object, path: string, value: string): object {
  const [head, ...rest] = path.split('.');
  const container: Json = Array.isArray(doc) ? [...doc] : { ...(doc as Record<string, unknown>) };
  const current = (container as Record<string, unknown>)[head];
  if (rest.length === 0) {
    (container as Record<string, unknown>)[head] = value;
    return container;
  }
  const nextIsIndex = /^\d+$/.test(rest[0]);
  const child = typeof current === 'object' && current !== null ? current : nextIsIndex ? [] : {};
  (container as Record<string, unknown>)[head] = setPath(child as object, rest.join('.'), value);
  return container;
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

