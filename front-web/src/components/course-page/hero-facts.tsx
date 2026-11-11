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

// First screen: name, promise, the key facts strip, and Apply / WhatsApp.
// All text comes from the course page content (CMS) and the course record; only the layout is fixed here.
export default function HeroFacts({ doc, labels, courseName, coverUrl, feeText, durationText, applyHref, whatsappHref }: HeroFactsProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const hero = doc.hero ?? {};
  const facts = doc.facts ?? {};
  const checklist = [facts.study_materials, facts.certificate, facts.learning_style, facts.support].filter(
    (v): v is string => Boolean(v)
  );
  const schedule = [facts.class_day, facts.class_time].filter(Boolean).join(" · ");
  const hasCover = Boolean(coverUrl) && !coverFailed;
  const tiles = [
    feeText ? { label: labels.fee, value: feeText } : null,
    durationText ? { label: labels.duration, value: durationText } : null,
    facts.medium ? { label: labels.medium, value: facts.medium } : null,
    facts.mode ? { label: labels.mode, value: facts.mode } : null,
  ].filter((t): t is { label: string; value: string } => t !== null);
  const applyLabel = feeText ? `${labels.applyNow} — ${feeText}` : labels.applyNow;

  return (
    <>
    <section className="relative bg-emerald-800 text-white">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 pt-12 pb-20 md:pt-16 md:pb-24 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className={hasCover ? "lg:col-span-7" : "lg:col-span-12"}>
            <div className="flex flex-wrap gap-2">
              {hero.eyebrow && (
                <span className="rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  {hero.eyebrow}
                </span>
              )}
              {facts.next_intake && (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-emerald-950">
                  {labels.nextIntake}: {facts.next_intake}
                </span>
              )}
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-headline font-bold leading-[1.08] tracking-tight">
              {hero.title || courseName}
            </h1>
            {hero.headline && (
              <p className="mt-4 text-xl md:text-2xl font-semibold text-amber-300 leading-snug">{hero.headline}</p>
            )}
            {hero.promise && (
              <p className="mt-4 max-w-xl text-base md:text-lg text-emerald-50/90 leading-relaxed">{hero.promise}</p>
            )}

            {checklist.length > 0 && (
              <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 text-sm md:text-base text-emerald-50/90">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={applyHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-7 text-base font-bold text-emerald-950 shadow-lg shadow-black/20 transition-colors hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
                {applyLabel}
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
          </div>

          {hasCover && (
            <div className="relative lg:col-span-5 pb-10 lg:pb-12">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/25 bg-emerald-900 shadow-2xl shadow-black/30">
                <Image
                  src={coverUrl as string}
                  alt={`${courseName} cover`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  onError={() => setCoverFailed(true)}
                />
              </div>
              {facts.next_intake && (
                <div className="absolute -bottom-2 left-4 right-4 flex items-center gap-4 rounded-2xl bg-white p-4 text-emerald-950 shadow-xl sm:left-[-24px] sm:right-auto sm:w-[280px]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                    <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70">{labels.nextIntake}</p>
                    <p className="text-lg font-bold leading-snug">{facts.next_intake}</p>
                    {schedule && <p className="text-sm font-medium text-emerald-900/80">{schedule}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </section>
      {tiles.length > 0 && (
        <div className="container relative z-10 mx-auto max-w-6xl px-4 md:px-6 -mt-14 md:-mt-16">
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl bg-white text-emerald-950 shadow-2xl shadow-black/15 md:flex md:flex-nowrap">
            {tiles.map((tile, i) => (
              <div
                key={tile.label}
                className={`p-5 md:p-6 md:flex-auto md:whitespace-nowrap ${i % 2 === 0 ? "border-r" : ""} md:border-r last:border-r-0 border-b md:border-b-0 border-emerald-900/10`}
              >
                <dt className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-emerald-800/70">{tile.label}</dt>
                <dd className="mt-1.5 text-lg md:text-xl font-extrabold leading-snug">{tile.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </>
  );
}
