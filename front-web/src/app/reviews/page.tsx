"use client";

import Link from "next/link";
import { useTranslation } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { PenSquare, Star, ExternalLink } from "lucide-react";
import { reviewsData } from "@/lib/reviews-data";
import ReviewCard, { GoogleLogoIcon } from "@/components/review-card";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
  const { t } = useTranslation();
  // Official Google Business Profile for Ceylon Pharma College
  const googleReviewsUrl = "https://share.google/Ro5raji5UUp5oK4nc";

  return (
    <main className="py-16 md:py-24 bg-secondary/15">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 gap-1.5 inline-flex items-center">
            <GoogleLogoIcon className="w-3.5 h-3.5" />
            <span>Verified Student Reviews</span>
          </Badge>
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            {t('reviewsPageTitle')}
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base md:text-lg text-muted-foreground font-body leading-relaxed">
            {t('reviewsPageSubtitle')}
          </p>
        </div>

        {/* Google Trust Banner */}
        <div className="max-w-3xl mx-auto mb-14 p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-border flex items-center justify-center shadow-sm shrink-0">
              <GoogleLogoIcon className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-headline font-bold text-xl text-foreground ml-2">4.9 / 5.0</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ranked among top-rated pharmacy education institutes with <span className="font-semibold text-foreground">830+ Google reviews (4.9★)</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button asChild className="w-full sm:w-auto font-semibold gap-1.5 shadow-md">
              <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer">
                <GoogleLogoIcon className="w-4 h-4" />
                Review on Google
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto font-semibold gap-1.5">
              <Link href="/reviews/new">
                <PenSquare className="w-4 h-4" />
                Write Review
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviewsData.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <GoogleLogoIcon className="w-4 h-4" />
            <span>Read all reviews directly on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </main>
  );
}
