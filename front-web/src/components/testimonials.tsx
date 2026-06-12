
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/context/language-context";
import { Button } from "./ui/button";
import Link from "next/link";
import { PenSquare } from "lucide-react";
import { reviewsData } from "@/lib/reviews-data";
import ReviewCard from "./review-card";

export default function Testimonials() {
  const { t } = useTranslation();
  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">{t('testimonialsTitle')}</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">
            {t('testimonialsSubtitle')}
          </p>
        </div>
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full max-w-5xl mx-auto mt-12"
        >
          <CarouselContent>
            {reviewsData.map((review, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2 h-full">
                  <ReviewCard review={review} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        <div className="mt-12 text-center">
            <Button asChild>
                <Link href="/reviews/new">
                    <PenSquare className="mr-2 h-4 w-4" />
                    {t('writeReviewButton')}
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
