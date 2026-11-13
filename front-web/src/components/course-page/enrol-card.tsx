import Link from "next/link";
import { GraduationCap, MessageCircle, Phone } from "lucide-react";
import type { CoursePageLabels } from "./labels";

interface EnrolCardProps {
  labels: CoursePageLabels;
  nextIntake?: string;
  feeText: string | null;
  durationText: string | null;
  medium?: string;
  mode?: string;
  applyHref: string;
  whatsappHref: string;
  phone?: string;
}

// Sticky decision card beside the course sections on desktop; stacks below them on mobile.
export default function EnrolCard({ labels, nextIntake, feeText, durationText, medium, mode, applyHref, whatsappHref, phone }: EnrolCardProps) {
  const rows = [
    durationText ? { label: labels.duration, value: durationText } : null,
    medium ? { label: labels.medium, value: medium } : null,
    mode ? { label: labels.mode, value: mode } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <aside className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-emerald-950/5 lg:sticky lg:top-[13.5rem]">
      {nextIntake && (
        <div className="rounded-xl bg-amber-100 p-4 text-amber-950">
          <p className="text-[11px] font-bold uppercase tracking-wider">{labels.nextIntake}</p>
          <p className="mt-1 text-lg font-bold leading-snug">{nextIntake}</p>
        </div>
      )}
      {feeText && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{labels.fee}</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{feeText}</p>
        </div>
      )}
      {rows.length > 0 && (
        <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-3">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-semibold text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={applyHref}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 text-base font-bold text-emerald-950 transition-colors hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
          {labels.applyNow}
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-6 text-base font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {labels.whatsapp}
        </a>
      </div>
      {phone && telHref && (
        <a href={telHref} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-semibold text-primary underline underline-offset-4">
          <Phone className="h-4 w-4" aria-hidden="true" />
          {labels.callUs} {phone}
        </a>
      )}
    </aside>
  );
}
