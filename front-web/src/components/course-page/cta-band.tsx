import Link from "next/link";
import { GraduationCap, MessageCircle, Phone } from "lucide-react";
import type { CoursePageDoc } from "@/lib/course-page";
import type { CoursePageLabels } from "./labels";

interface CtaBandProps {
  doc: CoursePageDoc;
  phone?: string;
  labels: CoursePageLabels;
  feeText: string | null;
  durationText: string | null;
  applyHref: string;
  whatsappHref: string;
}

// Closing block (also the target of the "Fees" tab): repeats the decision facts and both actions.
export default function CtaBand({ doc, phone, labels, feeText, durationText, applyHref, whatsappHref }: CtaBandProps) {
  const cta = doc.cta ?? {};
  const facts = [
    doc.facts?.next_intake ? { label: labels.nextIntake, value: doc.facts.next_intake } : null,
    feeText ? { label: labels.fee, value: feeText } : null,
    durationText ? { label: labels.duration, value: durationText } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <section id="fees" className="scroll-mt-32 bg-emerald-800 text-white">
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center md:px-6 md:py-16">
        {cta.title && <h2 className="text-3xl md:text-4xl font-headline font-bold leading-tight">{cta.title}</h2>}
        {cta.subtitle && <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-white/90 leading-relaxed">{cta.subtitle}</p>}
        {cta.tagline && <p className="mt-3 text-lg font-semibold text-amber-300">{cta.tagline}</p>}

        {facts.length > 0 && (
          <dl className="mt-7 grid gap-3 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-white/25 bg-white/10 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/80">{f.label}</dt>
                <dd className="mt-1 text-lg font-bold">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={applyHref}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 text-base font-bold text-emerald-950 transition-colors hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
            {labels.applyNow}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/50 px-6 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            {labels.whatsapp}
          </a>
        </div>

        {phone && telHref && (
          <p className="mt-5 text-base">
            <a href={telHref} className="inline-flex min-h-11 items-center gap-2 px-3 font-semibold underline underline-offset-4 hover:text-amber-300">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {labels.callUs} {phone}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
