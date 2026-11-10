"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, CalendarDays, MessageCircle, GraduationCap } from "lucide-react";
import type { CoursePageDoc } from "@/lib/course-page";
import type { CoursePageLabels } from "./labels";

interface HeroFactsProps {
  doc: CoursePageDoc;
  labels: CoursePageLabels;
  courseName: string;
  slug: string;
  coverUrl: string | null;
  feeText: string | null;
  durationText: string | null;
  applyHref: string;
  whatsappHref: string;
}

function Tile({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-background p-3.5 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold text-foreground leading-snug">{value}</p>
    </div>
  );
}

// First screen: name, promise, the decision facts, and Apply / WhatsApp.
export default function HeroFacts({ doc, labels, courseName, coverUrl, feeText, durationText, applyHref, whatsappHref }: HeroFactsProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const hero = doc.hero ?? {};
  const facts = doc.facts ?? {};
  const checklist = [facts.study_materials, facts.certificate, facts.learning_style, facts.support].filter(
    (v): v is string => Boolean(v)
  );
  const schedule = [facts.class_day, facts.class_time].filter(Boolean).join(" · ");

  return (
    <section className="bg-emerald-800 text-white">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl py-8 md:py-12">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
          {hero.eyebrow && (
            <p className="inline-block rounded-full border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              {hero.eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-3xl md:text-5xl font-headline font-bold leading-tight">{hero.title || courseName}</h1>
          {hero.headline && <p className="mt-3 text-xl md:text-2xl font-semibold text-amber-300 leading-snug">{hero.headline}</p>}
          {hero.promise && <p className="mt-3 text-base md:text-lg text-white/90 leading-relaxed max-w-2xl">{hero.promise}</p>}
          </div>
          {coverUrl && !coverFailed && (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-2xl lg:max-w-none border border-white/25 bg-emerald-900 shadow-xl">
              <Image
                src={coverUrl}
                alt={`${courseName} cover`}
                fill
                priority
                sizes="(min-width: 1024px) 300px, 100vw"
                className="object-cover"
                onError={() => setCoverFailed(true)}
              />
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {facts.next_intake && (
            <div className="col-span-2 md:col-span-3 rounded-xl border border-amber-300 bg-amber-100 p-4 text-amber-950">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {labels.nextIntake}
              </p>
              <p className="mt-1 text-xl md:text-2xl font-bold leading-snug">{facts.next_intake}</p>
              {schedule && <p className="mt-0.5 text-sm font-medium">{schedule}</p>}
            </div>
          )}
          {feeText && <Tile label={labels.fee} value={feeText} />}
          {durationText && <Tile label={labels.duration} value={durationText} />}
          {facts.medium && <Tile label={labels.medium} value={facts.medium} />}
          {facts.mode && <Tile label={labels.mode} value={facts.mode} className="col-span-2 md:col-span-1" />}
          {facts.entry_requirements && (
            <Tile label={labels.entry} value={facts.entry_requirements} className="col-span-2" />
          )}
        </div>

        {checklist.length > 0 && (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 text-sm md:text-base text-white/90">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
      </div>
    </section>
  );
}
