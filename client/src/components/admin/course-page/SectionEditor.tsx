"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPath } from '@/lib/course-page/paths';
import type { BlockSpec } from '@/lib/course-page/schema';
import type { CoursePageContent, PageLanguage } from '@/lib/course-page/types';
import { FieldControl } from './FieldControl';
import { ListEditor, type EditorHandlers } from './ListEditor';

interface SectionEditorProps extends EditorHandlers {
  block: BlockSpec;
  lang: PageLanguage;
  content: CoursePageContent;
}

// One section of the page: its fields first, then its lists.
export function SectionEditor({ block, lang, content, onChange, onListOp, onLines }: SectionEditorProps) {
  const doc = content[lang];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{block.title}</CardTitle>
        <CardDescription>{block.hint}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {block.fields.map((field) => {
          const path = `${block.id}.${field.key}`;
          return (
            <FieldControl
              key={field.key}
              spec={field}
              id={`${path}-${lang}`}
              lang={lang}
              value={getPath(doc, path) ?? ''}
              enValue={getPath(content.en, path) ?? ''}
              onChange={(v) => onChange(path, v)}
            />
          );
        })}
        {block.lists.map((list) => (
          <ListEditor key={list.key} block={block} list={list} lang={lang} content={content} onChange={onChange} onListOp={onListOp} onLines={onLines} />
        ))}
      </CardContent>
    </Card>
  );
}
