"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getList, getPath, type ListOp } from '@/lib/course-page/paths';
import type { ListTextKind } from '@/lib/course-page/lists';
import type { BlockSpec, ListSpec } from '@/lib/course-page/schema';
import type { CoursePageContent, PageLanguage } from '@/lib/course-page/types';
import { FieldControl } from './FieldControl';
import { LinesField } from './LinesField';

export interface EditorHandlers {
  onChange: (path: string, value: string) => void;
  onListOp: (listPath: string, op: ListOp) => void;
  onLines: (listPath: string, kind: ListTextKind, text: string) => void;
}

interface ListEditorProps extends EditorHandlers {
  block: BlockSpec;
  list: ListSpec;
  lang: PageLanguage;
  content: CoursePageContent;
}

function ItemControls({ label, index, count, onOp }: { label: string; index: number; count: number; onOp: (op: ListOp) => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label={`Move ${label} ${index + 1} up`} onClick={() => onOp({ type: 'move', from: index, to: index - 1 })}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" disabled={index === count - 1} aria-label={`Move ${label} ${index + 1} down`} onClick={() => onOp({ type: 'move', from: index, to: index + 1 })}>
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="text-destructive" aria-label={`Remove ${label} ${index + 1}`} onClick={() => onOp({ type: 'remove', index })}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Lists are defined by the English document. SI/TA lines up with it by position, so structure
// (add / remove / reorder) is edited on the English tab only and applied to all languages.
export function ListEditor({ block, list, lang, content, onChange, onListOp, onLines }: ListEditorProps) {
  const isEnglish = lang === 'en';
  const listPath = `${block.id}.${list.key}`;
  const enItems = getList(content.en, listPath);
  const count = enItems.length;
  const doc = content[lang];

  // Plain text lists (points, paragraphs) are one text box, one entry per line: quick to type, paste and reorder.
  if (list.type === 'strings') {
    const kind: ListTextKind = list.textarea ? 'paragraphs' : 'lines';
    return (
      <LinesField
        id={`${listPath}-${lang}`}
        label={list.label}
        kind={kind}
        lang={lang}
        enItems={enItems}
        items={getList(doc, listPath)}
        onText={(text) => onLines(listPath, kind, text)}
      />
    );
  }

  const addItem = () => {
    const defaults = Object.fromEntries(list.fields.filter((f) => f.kind === 'icon').map((f) => [f.key, 'award']));
    onListOp(listPath, { type: 'add', item: defaults });
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">
        {list.label} <span className="font-normal text-muted-foreground">({count})</span>
      </legend>

      {count === 0 && <p className="text-sm text-muted-foreground">No items yet.{isEnglish ? '' : ' Add them on the English tab.'}</p>}

      {enItems.map((enItem, i) => {
        const enTitle = (enItem as Record<string, unknown> | null)?.[list.titleField];
        return (
          <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {list.itemLabel} {i + 1}
                {typeof enTitle === 'string' && enTitle ? <span className="font-normal text-muted-foreground"> — {enTitle.slice(0, 48)}</span> : null}
              </p>
              {isEnglish && <ItemControls label={list.itemLabel} index={i} count={count} onOp={(op) => onListOp(listPath, op)} />}
            </div>
            {list.fields.map((field) => {
              const path = `${listPath}.${i}.${field.key}`;
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
          </div>
        );
      })}

      {isEnglish ? (
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" /> Add {list.itemLabel.toLowerCase()}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Add, remove and reorder on the English tab; this tab only holds the translation of each item.</p>
      )}
    </fieldset>
  );
}
