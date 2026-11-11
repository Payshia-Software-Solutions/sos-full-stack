"use client";

import { useMemo } from "react";
import { useTranslation } from "@/context/language-context";
import type { Course } from "@/lib/courses-data";
import { buildCoverUrl, isBlockEmpty, resolveDoc, type CoursePageData, type CoursePageDoc, type RefundPolicyDoc } from "@/lib/course-page";
import { formatDuration } from "@/lib/format-duration";
import { LABELS } from "./labels";
import HeroFacts from "./hero-facts";
import EnrolCard from "./enrol-card";
import SectionTabs, { type SectionTab } from "./section-tabs";
import { AssessmentSection, AudienceSection, CertificationSection, LearnSection, OverviewSection, ScheduleSection } from "./text-sections";
import FeaturesSection from "./features";
import ModulesSection from "./modules";
import LecturersSection from "./lecturers";
import TestimonialsSection from "./testimonials";
import FaqSection from "./faq";
import CtaBand from "./cta-band";
import RefundPolicySection from "./refund-policy";

const WHATSAPP_NUMBER = "94715884884";

function formatFee(value: string | number | undefined): string | null {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return `LKR ${n.toLocaleString("en-LK")}`;
}

export default function CoursePageView({ data, course }: { data: CoursePageData; course: Course }) {
  const { language } = useTranslation();
  const lang = language === "si" || language === "ta" ? language : "en";
  const labels = LABELS[lang];

  const doc = useMemo(() => resolveDoc<CoursePageDoc>(data.content, lang), [data.content, lang]);
  const refund = useMemo<RefundPolicyDoc | null>(
    () => (data.refundPolicy ? resolveDoc<RefundPolicyDoc>(data.refundPolicy, lang) : null),
    [data.refundPolicy, lang]
  );

  const courseName = doc.hero?.title || course.course_name;
  const feeText = formatFee(course.course_fee);
  const durationText = formatDuration(course.course_duration, lang);
  const phone = data.content.en.cta?.phone; // shared field, stored in English only
  const applyHref = `/apply?course=${course.slug}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Ceylon Pharma College, I'd like details about ${courseName}.`
  )}`;

  const showCta = !isBlockEmpty(doc.cta) || Boolean(feeText) || Boolean(doc.facts?.next_intake);

  const tabs: SectionTab[] = [
    !isBlockEmpty(doc.overview) && { id: "overview", label: labels.tabOverview },
    !isBlockEmpty(doc.audience) && { id: "audience", label: labels.tabAudience },
    !isBlockEmpty(doc.modules) && { id: "modules", label: labels.tabModules },
    !isBlockEmpty(doc.certification) && { id: "certification", label: labels.tabCertification },
    !isBlockEmpty(doc.lecturers) && { id: "lecturers", label: labels.tabLecturers },
    !isBlockEmpty(doc.faq) && { id: "faq", label: labels.tabFaq },
    showCta && { id: "fees", label: labels.tabFees },
  ].filter((t): t is SectionTab => Boolean(t));

  return (
    <main className="bg-background">
      <HeroFacts
        doc={doc}
        labels={labels}
        courseName={course.course_name}
        slug={course.slug}
        coverUrl={buildCoverUrl(course.course_code, course.course_img)}
        feeText={feeText}
        durationText={durationText}
        applyHref={applyHref}
        whatsappHref={whatsappHref}
      />
      <SectionTabs tabs={tabs} ariaLabel={labels.tabsLabel} />

      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <div className="min-w-0">
            <OverviewSection block={doc.overview} entry={doc.facts?.entry_requirements} entryLabel={labels.entry} />
            <AudienceSection block={doc.audience} />
            <FeaturesSection block={doc.features} />
            <LearnSection block={doc.learn} />
            <ModulesSection block={doc.modules} />
            <AssessmentSection block={doc.assessment} />
            <CertificationSection block={doc.certification} />
            <ScheduleSection block={doc.schedule} facts={doc.facts} labels={labels} durationText={durationText} />
            <LecturersSection block={doc.lecturers} />
            <TestimonialsSection title={labels.testimonials} />
            <FaqSection block={doc.faq} />
          </div>

          <div className="py-10 md:py-14 lg:py-16">
            <EnrolCard
              labels={labels}
              nextIntake={doc.facts?.next_intake}
              feeText={feeText}
              durationText={durationText}
              medium={doc.facts?.medium}
              mode={doc.facts?.mode}
              applyHref={applyHref}
              whatsappHref={whatsappHref}
              phone={phone}
            />
          </div>
        </div>
      </div>

      {showCta && <CtaBand doc={doc} phone={phone} labels={labels} applyHref={applyHref} whatsappHref={whatsappHref} />}
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <RefundPolicySection policy={refund} fallbackTitle={labels.refundPolicy} />
      </div>
    </main>
  );
}
