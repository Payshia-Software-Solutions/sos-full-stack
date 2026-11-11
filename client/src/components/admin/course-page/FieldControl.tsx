"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FieldSpec } from '@/lib/course-page/schema';
import type { PageLanguage } from '@/lib/course-page/types';
import { IconPreview, IconSelect } from './IconSelect';
import { PhotoUploadField } from './PhotoUploadField';

interface FieldControlProps {
  spec: FieldSpec;
  id: string;
  lang: PageLanguage;
  value: string;
  /** English text: the reference next to the translation box (and the shared value on SI/TA tabs). */
  enValue: string;
  onChange: (value: string) => void;
}

export function FieldControl({ spec, id, lang, value, enValue, onChange }: FieldControlProps) {
  const isEnglish = lang === 'en';

  // Icon, photo and phone are the same in every language: shown read-only outside the English tab.
  if (spec.shared && !isEnglish) {
    return (
      <div className="space-y-1">
        <Label>{spec.label}</Label>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {spec.kind === 'icon' && <IconPreview name={enValue} />}
          <span>{enValue || '—'}</span>
        </p>
        <p className="text-xs text-muted-foreground">Shared by all languages. Change it on the English tab.</p>
      </div>
    );
  }

  const control =
    spec.kind === 'icon' ? (
      <IconSelect id={id} value={value} onChange={onChange} />
    ) : spec.kind === 'photo' ? (
      <PhotoUploadField id={id} value={value} onChange={onChange} />
    ) : spec.kind === 'textarea' ? (
      <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
    ) : (
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    );

  if (isEnglish) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{spec.label}</Label>
        {control}
      </div>
    );
  }

  // Translation tabs: English on the left as a reference, the translation box on the right.
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label>{spec.label} (English)</Label>
        <div className="min-h-10 whitespace-pre-wrap rounded-md border bg-muted/40 px-3 py-2 text-sm">{enValue || '—'}</div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={id}>{spec.label} (translation)</Label>
        {control}
      </div>
    </div>
  );
}
