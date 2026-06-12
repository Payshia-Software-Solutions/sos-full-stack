
import { en } from './locales/en/index';
import { si } from './locales/si/index';
import { ta } from './locales/ta/index';

export const translations = {
  en,
  si,
  ta,
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];
