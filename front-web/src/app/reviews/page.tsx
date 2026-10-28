"use client";

import Link from "next/link";
import { useTranslation } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { PenSquare, Star, ExternalLink, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";
import { reviewsData } from "@/lib/reviews-data";
import ReviewCard, { GoogleLogoIcon } from "@/components/review-card";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';
  
  // Official Google Business Profile for Ceylon Pharma College
  const googleReviewsUrl = "https://share.google/Ro5raji5UUp5oK4nc";

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Modern Header Banner */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{t('reviews')}</span>
          </div>

          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 gap-1.5 inline-flex items-center">
              <GoogleLogoIcon className="w-3.5 h-3.5" />
              <span>{isSinhala ? 'සත්‍යාපිත ශිෂ්‍ය ප්‍රතිචාර' : 'Verified Student Reviews'}</span>
            </Badge>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {t('reviewsPageTitle')}
            </h1>

            <div className="w-20 h-1 bg-primary mt-3 mb-4 rounded-full" />

            <p className={`text-muted-foreground font-body text-base md:text-lg max-w-2xl ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {t('reviewsPageSubtitle')}
            </p>
          </div>

          {/* Google Trust Banner Card */}
          <div className="mt-10 max-w-3xl p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
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
                <p className="text-xs sm:text-sm text-muted-foreground font-body">
                  Top-rated pharmacy college in Sri Lanka with <span className="font-semibold text-foreground">830+ Google reviews (4.9★)</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto font-semibold gap-1.5 shadow-md bg-primary text-primary-foreground">
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
        </div>
      </section>

      {/* 2. Reviews Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviewsData.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center p-8 rounded-2xl bg-card border border-border/80 max-w-2xl mx-auto shadow-sm">
            <h3 className="font-headline font-bold text-lg text-foreground mb-2">Want to explore all Google reviews?</h3>
            <p className="text-xs text-muted-foreground mb-4">Read direct authentic feedback from practicing pharmacy assistants across Sri Lanka.</p>
            <Button asChild variant="outline" className="gap-2 font-semibold text-xs">
              <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer">
                <GoogleLogoIcon className="w-4 h-4" />
                <span>Read All Reviews on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
