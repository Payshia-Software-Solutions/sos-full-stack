"use client";

import Link from "next/link";
import { useTranslation } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { reviewsData } from "@/lib/reviews-data";
import ReviewCard from "@/components/review-card";

export default function ReviewsPage() {
  const { t } = useTranslation();

  return (
    <main className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('reviewsPageTitle')}</h1>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">
                {t('reviewsPageSubtitle')}
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4" />
        </div>

        <div className="text-center mb-12">
            <Button asChild size="lg">
                <Link href="/reviews/new">
                    <PenSquare className="mr-2 h-5 w-5" />
                    {t('writeReviewButton')}
                </Link>
            </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviewsData.map((review, index) => (
                <ReviewCard key={index} review={review} />
            ))}
        </div>
      </div>
    </main>
  );
}
