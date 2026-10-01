"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useTranslation } from "@/context/language-context";
import { Button } from "./ui/button";
import Link from "next/link";
import { Star, ExternalLink } from "lucide-react";
import { reviewsData } from "@/lib/reviews-data";
import ReviewCard, { GoogleLogoIcon } from "./review-card";
import { Badge } from "@/components/ui/badge";

export default function Testimonials() {
  const { t } = useTranslation();
  
  // Official Google Business Profile for Ceylon Pharma College
  const googleReviewsUrl = "https://share.google/Ro5raji5UUp5oK4nc";

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-card/40 border-y border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 gap-1.5 inline-flex items-center">
            <GoogleLogoIcon className="w-3.5 h-3.5" />
            <span>Verified Student Feedback</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            What Our Students Say on Google
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-6 rounded-full" />
          <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed">
            Real feedback from graduates and healthcare professionals who studied with Ceylon Pharma College.
          </p>
        </div>

        {/* Google Trust Rating Header Card */}
        <div className="mt-10 max-w-2xl mx-auto p-6 rounded-2xl bg-background border border-border/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-border flex items-center justify-center shadow-sm shrink-0">
              <GoogleLogoIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-headline font-bold text-lg text-foreground ml-1.5">4.9</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Based on <span className="font-semibold text-foreground">830+ verified student reviews</span> on Google
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="font-semibold gap-1.5 text-xs shadow-md">
              <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer">
                <GoogleLogoIcon className="w-3.5 h-3.5" />
                Review Us on Google
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="font-semibold gap-1.5 text-xs">
              <Link href="/reviews">
                View All
              </Link>
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full max-w-6xl mx-auto mt-12"
        >
          <CarouselContent className="-ml-3">
            {reviewsData.map((review, index) => (
              <CarouselItem key={index} className="pl-3 md:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <ReviewCard review={review} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-background shadow-md border-border" />
          <CarouselNext className="hidden sm:flex -right-4 bg-background shadow-md border-border" />
        </Carousel>

        {/* Bottom CTA */}
        <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold">
              <GoogleLogoIcon className="w-3.5 h-3.5" />
              Open Google Reviews <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/reviews/new" className="text-xs text-muted-foreground hover:text-foreground">
              Submit Website Testimonial
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
