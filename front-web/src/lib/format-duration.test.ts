import { describe, it, expect } from 'vitest';
import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('adds the unit when the record only holds a number of months', () => {
    expect(formatDuration('6', 'en')).toBe('6 Months');
    expect(formatDuration('6', 'si')).toBe('මාස 6');
    expect(formatDuration('6', 'ta')).toBe('6 மாதங்கள்');
    expect(formatDuration(4, 'en')).toBe('4 Months');
  });

  it('keeps an existing unit and translates it', () => {
    expect(formatDuration('6 Months', 'en')).toBe('6 Months');
    expect(formatDuration('1 Day', 'en')).toBe('1 Day');
    expect(formatDuration('6 Months', 'si')).toBe('6 මාස');
    expect(formatDuration('1 Day', 'ta')).toBe('1 நாள்');
  });

  it('returns null when there is no duration, so the tile can be hidden', () => {
    expect(formatDuration(undefined, 'en')).toBeNull();
    expect(formatDuration('', 'si')).toBeNull();
    expect(formatDuration('  ', 'ta')).toBeNull();
  });
});
