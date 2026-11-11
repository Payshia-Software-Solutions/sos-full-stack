"use client";

import { CheckCircle2, Circle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface NavSection {
  id: string;
  label: string;
  /** Has real content in the language being edited. */
  filled: boolean;
}

interface SectionNavProps {
  sections: NavSection[];
  active: string;
  onSelect: (id: string) => void;
}

// Pick the section to edit: a list on wide screens, a dropdown on phones.
export function SectionNav({ sections, active, onSelect }: SectionNavProps) {
  return (
    <>
      <div className="lg:hidden">
        <Select value={active} onValueChange={onSelect}>
          <SelectTrigger aria-label="Section to edit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
                {s.filled ? '' : ' (empty)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav aria-label="Page sections" className="sticky top-24 hidden space-y-1 lg:block">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-current={active === s.id ? 'page' : undefined}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
              active === s.id && 'bg-primary/10 font-semibold text-primary'
            )}
          >
            {s.filled ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-label="Has content" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Empty" />
            )}
            <span>{s.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
