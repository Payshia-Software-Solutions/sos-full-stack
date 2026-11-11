import Link from "next/link";
import { GraduationCap, MessageCircle, Phone } from "lucide-react";
import type { CoursePageDoc } from "@/lib/course-page";
import type { CoursePageLabels } from "./labels";

interface CtaBandProps {
  doc: CoursePageDoc;
  phone?: string;
  labels: CoursePageLabels;
  applyHref: string;
  whatsappHref: string;
}

// Closing block (also the target of the "Fees" tab): the call to action with both actions.
export default function CtaBand({ doc, phone, labels, applyHref, whatsappHref }: CtaBandProps) {
  const cta = doc.cta ?? {};
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <section id="fees" className="scroll-mt-40 bg-emerald-800 text-white">
      <div className="container mx-auto px-4 py-14 text-center md:px-6 md:py-20">
        {cta.title && <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight tracking-tight">{cta.title}</h2>}
        {cta.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-white/90 leading-relaxed">{cta.subtitle}</p>}
        {cta.tagline && <p className="mt-3 text-lg font-semibold text-amber-300">{cta.tagline}</p>}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={applyHref}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-7 text-base font-bold text-emerald-950 transition-colors hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
            {labels.applyNow}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/50 px-7 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
