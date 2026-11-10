"use client";

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { listToText, type ListTextKind } from '@/lib/course-page/lists';
import type { PageLanguage } from '@/lib/course-page/types';

interface LinesFieldProps {
  id: string;
  label: string;
  kind: ListTextKind;
  lang: PageLanguage;
  /** The English list (the reference, and the text being written on the English tab). */
  enItems: unknown[];
  /** The list for the language being edited. */
  items: unknown[];
  onText: (text: string) => void;
}

// A whole list as one text box: one point per line (or paragraphs separated by a blank line).
// It keeps its own typing state so pressing Enter on a blank line works; the parent remounts it when the
// content is replaced from outside.
export function LinesField({ id, label, kind, lang, enItems, items, onText }: LinesFieldProps) {
  const [text, setText] = useState(() => listToText(items, kind));
  const isEnglish = lang === 'en';
  const rows = Math.min(18, Math.max(4, text.split('\n').length + 1));
  const hint =
    kind === 'paragraphs'
      ? 'Leave a blank line between paragraphs.'
      : isEnglish
        ? 'One point per line. Press Enter for the next point.'
        : 'Write each translation on the same line number as the English point. Leave a line blank to skip one.';

  const editor = (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{isEnglish ? label : `${label} (translation)`}</Label>
      <Textarea
        id={id}
        rows={rows}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onText(e.target.value);
        }}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );

  if (isEnglish) return editor;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label>{label} (English)</Label>
        <div
          className="whitespace-pre-wrap rounded-md border bg-muted/40 px-3 py-2 text-sm"
          style={{ minHeight: `${rows * 1.5 + 1}rem` }}
        >
          {listToText(enItems, kind) || '—'}
        </div>
      </div>
      {editor}
    </div>
  );
}
