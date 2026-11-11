import { CheckCircle2, CalendarClock, ClipboardCheck, Info } from "lucide-react";
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
  return text ? <p className="mt-6 text-base md:text-lg font-semibold text-foreground leading-relaxed">{text}</p> : null;
}

export function OverviewSection({
  block,
  entry,
  entryLabel,
}: {
  block: CoursePageDoc["overview"];
  entry?: string;
  entryLabel: string;
}) {
  if (isBlockEmpty(block) && !entry) return null;
  return (
    <SectionShell id="overview" title={block?.title}>
      <Paragraphs items={block?.paragraphs} />
      {entry && (
        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Info className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-foreground">{entryLabel}</p>
            <p className="mt-1 text-base text-muted-foreground leading-relaxed">{entry}</p>
          </div>
        </div>
      )}
    </SectionShell>
  );
}

export function AudienceSection({ block }: { block: CoursePageDoc["audience"] }) {
  if (isBlockEmpty(block)) return null;
  const items = block?.items ?? [];
  return (
    <SectionShell id="audience" title={block?.title} tone="tinted">
      <Lead text={block?.intro} />
      {items.length > 0 && (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-base font-semibold text-foreground">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
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
  const items = block?.items ?? [];
  return (
    <SectionShell id="assessment" title={block?.title} tone="tinted">
      <Lead text={block?.intro} />
      {items.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li key={i} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}
      <Note text={block?.note} />
    </SectionShell>
  );
}

export function CertificationSection({ block }: { block: CoursePageDoc["certification"] }) {
  if (isBlockEmpty(block)) return null;
  return (
    <SectionShell id="certification" title={block?.title} tone="tinted">
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

// Dark card (as in the design): the course rhythm on the left, how students are assessed on the right.
export function ScheduleSection({ block, facts, labels, durationText }: ScheduleProps) {
  const rows: { label: string; value: string }[] = [
    facts?.class_day || facts?.class_time
      ? { label: labels.classSchedule, value: [facts?.class_day, facts?.class_time].filter(Boolean).join(" · ") }
      : null,
    durationText ? { label: labels.duration, value: durationText } : null,
    facts?.mode ? { label: labels.mode, value: facts.mode } : null,
    block?.recordings ? { label: labels.recordings, value: block.recordings } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);

  if (isBlockEmpty(block) && rows.length === 0) return null;
  return (
    <SectionShell id="schedule" title={block?.title}>
      <div className="rounded-3xl bg-emerald-800 p-6 text-white md:p-8">
        {block?.note && <p className="text-base md:text-lg text-white/90 leading-relaxed">{block.note}</p>}
        {rows.length > 0 && (
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-200">{row.label}</dt>
                  <dd className="mt-0.5 text-base font-semibold text-white">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </SectionShell>
  );
}
