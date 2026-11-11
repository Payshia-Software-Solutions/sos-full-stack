"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getSiteContent, saveSiteContent } from '@/lib/actions/course-pages';
import type { BlockSpec } from '@/lib/course-page/schema';
import { emptyContent, type CoursePageContent, type PageLanguage, type RefundPolicy } from '@/lib/course-page/types';
import { SectionEditor } from './SectionEditor';
import { useContentEditor } from './useContentEditor';

// The refund policy is one text shared by every course, so it is edited once, separately from any course page.
// It reuses the block editor by wrapping each language's policy in a one-block document.
const REFUND_BLOCK: BlockSpec = {
  id: 'refund' as BlockSpec['id'],
  title: 'Refund policy (all courses)',
  hint: 'Shown collapsed at the bottom of every course page. Saving applies to all courses immediately; there is no draft.',
  fields: [{ key: 'title', label: 'Title', kind: 'text' }],
  lists: [
    {
      key: 'items',
      label: 'Clauses',
      type: 'objects',
      itemLabel: 'Clause',
      titleField: 'title',
      fields: [
        { key: 'title', label: 'Clause title', kind: 'text' },
        { key: 'body', label: 'Clause text', kind: 'textarea' },
      ],
    },
  ],
};

const wrap = (policy: RefundPolicy | null): CoursePageContent => ({
  ...emptyContent(),
  en: { refund: policy?.en ?? {} } as CoursePageContent['en'],
  si: { refund: policy?.si ?? {} } as CoursePageContent['si'],
  ta: { refund: policy?.ta ?? {} } as CoursePageContent['ta'],
});

const unwrap = (content: CoursePageContent): RefundPolicy => ({
  en: (content.en as Record<string, any>).refund ?? {},
  si: (content.si as Record<string, any>).refund ?? {},
  ta: (content.ta as Record<string, any>).refund ?? {},
});

export function RefundPolicyEditor({ lang }: { lang: PageLanguage }) {
  const { data, isLoading } = useQuery({
    queryKey: ['siteContent', 'refund_policy'],
    queryFn: () => getSiteContent<RefundPolicy>('refund_policy'),
  });
  const editor = useContentEditor();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) editor.load(wrap(data ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading]);

  const save = async () => {
    setSaving(true);
    try {
      await saveSiteContent('refund_policy', unwrap(editor.content));
      editor.setDirty(false);
      toast({ title: 'Refund policy saved', description: 'It now applies to every course page.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not save', description: e instanceof Error ? e.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlers = editor.handlersFor(lang);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refund policy</CardTitle>
        <CardDescription>Shared by all courses. Edit the language selected above.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <SectionEditor block={REFUND_BLOCK} lang={lang} content={editor.content} {...handlers} />
        )}
        <Button type="button" onClick={save} disabled={saving || isLoading || !editor.dirty}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save refund policy
        </Button>
      </CardContent>
    </Card>
  );
}
