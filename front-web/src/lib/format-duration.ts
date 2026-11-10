// Course records store the duration either as a bare number of months ("6") or with a unit ("6 Months", "1 Day").
export function formatDuration(duration: string | number | undefined, lang: 'en' | 'si' | 'ta'): string | null {
  const text = String(duration ?? '').trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) {
    return lang === 'si' ? `මාස ${text}` : lang === 'ta' ? `${text} மாதங்கள்` : `${text} Months`;
  }
  if (lang === 'si') return text.replace(/Months?/i, 'මාස').replace(/Days?/i, 'දින');
  if (lang === 'ta') {
    return text
      .replace(/Months/i, 'மாதங்கள்').replace(/Month/i, 'மாதம்')
      .replace(/Days/i, 'நாட்கள்').replace(/Day/i, 'நாள்');
  }
  return text;
}
