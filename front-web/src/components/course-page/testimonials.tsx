"use client";

import { reviewsData } from "@/lib/reviews-data";
import ReviewCard from "@/components/review-card";
import { SectionShell } from "./section-shell";

// Reuses the site's existing student reviews (reviews carry no course field, so the first few are shown).
export default function TestimonialsSection({ title }: { title: string }) {
  const reviews = reviewsData.slice(0, 3);
  if (reviews.length === 0) return null;
  return (
    <SectionShell id="testimonials" title={title}>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.name} review={review} />
        ))}
      </div>
    </SectionShell>
  );
}
