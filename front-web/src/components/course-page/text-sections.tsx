import { CheckCircle2, CalendarClock } from "lucide-react";
import type { CoursePageDoc } from "@/lib/course-page";
import { isBlockEmpty } from "@/lib/course-page";
import type { CoursePageLabels } from "./labels";
import { Paragraphs, SectionShell } from "./section-shell";

function TickList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-4 grid gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-base md:text-lg text-foreground">
          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Lead({ text }: { text?: string }) {
  return text ? <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{text}</p> : null;
}

function Note({ text }: { text?: string }) {
  return text ? <p className="mt-5 text-base md:text-lg font-semibold text-foreground leading-relaxed">{text}</p> : null;
}

export function OverviewSection({ block }: { block: CoursePageDoc["overview"] }) {
  if (isBlockEmpty(block)) return null;
  return (
    <SectionShell id="overview" title={block?.title}>
      <Paragraphs items={block?.paragraphs} />
    </SectionShell>
  );
}

export function AudienceSection({ block }: { block: CoursePageDoc["audience"] }) {
  if (isBlockEmpty(block)) return null;
  return (
    <SectionShell id="audience" title={block?.title} tone="tinted">
      <Lead text={block?.intro} />
      <TickList items={block?.items} />
      <Note text={block?.note} />
    </SectionShell>
  );
}

export function LearnSection({ block }: { block: CoursePageDoc["learn"] }) {
  if (isBlockEmpty(block)) return null;
  return (
    <SectionShell id="learn" title={block?.title}>
      <Lead text={block?.intro} />
      <TickList items={block?.items} />
      <Note text={block?.closing} />
    </SectionShell>
  );
}

export function AssessmentSection({ block }: { block: CoursePageDoc["assessment"] }) {
  if (isBlockEmpty(block)) return null;
  return (
    <SectionShell id="assessment" title={block?.title} tone="tinted">
      <Lead text={block?.intro} />
      <TickList items={block?.items} />
      <Note text={block?.note} />
    </SectionShell>
  );
}

interface ScheduleProps {
  block: CoursePageDoc["schedule"];
  facts: CoursePageDoc["facts"];
  labels: CoursePageLabels;
  durationText: string | null;
}

export function ScheduleSection({ block, facts, labels, durationText }: ScheduleProps) {
  const rows: { label: string; value: string }[] = [
    durationText ? { label: labels.duration, value: durationText } : null,
    facts?.class_day ? { label: labels.classSchedule, value: [facts.class_day, facts.class_time].filter(Boolean).join(" · ") } : null,
    facts?.mode ? { label: labels.mode, value: facts.mode } : null,
    block?.recordings ? { label: labels.recordings, value: block.recordings } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);

  if (isBlockEmpty(block) && rows.length === 0) return null;
  return (
    <SectionShell id="schedule" title={block?.title}>
      <Lead text={block?.note} />
      {rows.length > 0 && (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                <dd className="mt-0.5 text-base font-semibold text-foreground">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </SectionShell>
  );
}
