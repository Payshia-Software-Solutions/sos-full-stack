"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "./star-rating";
import { Badge } from "@/components/ui/badge";

export interface Review {
    name: string;
    role: string;
    avatar: string;
    image: string;
    hint: string;
    quote: string;
    rating: number;
    date?: string;
    isGoogleReview?: boolean;
}

interface ReviewCardProps {
    review: Review;
}

export const GoogleLogoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

export default function ReviewCard({ review }: ReviewCardProps) {
    return (
        <Card className="h-full bg-card border border-border/80 hover:border-border hover:shadow-xl transition-all duration-300 flex flex-col rounded-2xl group">
            <CardContent className="flex flex-col p-6 h-full">
                {/* Header with Avatar, Name, and Google Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                <AvatarImage src={review.image} alt={review.name} data-ai-hint={review.hint} />
                                <AvatarFallback>{review.avatar}</AvatarFallback>
                            </Avatar>
                            {review.isGoogleReview && (
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm border border-border">
                                    <GoogleLogoIcon className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold font-headline text-base text-foreground leading-snug">
                                {review.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                                {review.role}
                            </p>
                        </div>
                    </div>

                    {review.isGoogleReview && (
                        <Badge variant="outline" className="text-[10px] font-medium gap-1 text-muted-foreground bg-muted/50 border-border shrink-0 py-0.5 px-2">
                            <GoogleLogoIcon className="w-3 h-3" />
                            <span>Google</span>
                        </Badge>
                    )}
                </div>

                {/* Star Rating and Date */}
                <div className="flex items-center justify-between mb-3 pt-1 border-t border-border/50">
                    <StarRating rating={review.rating} />
                    {review.date && (
                        <span className="text-[11px] text-muted-foreground font-body">
                            {review.date}
                        </span>
                    )}
                </div>

                {/* Review Text */}
                <p className="font-body text-sm text-foreground/80 leading-relaxed italic flex-grow">
                    &ldquo;{review.quote}&rdquo;
                </p>

                {/* Verified Footer */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Verified Student
                    </span>
                    <span>Ceylon Pharma College</span>
                </div>
            </CardContent>
        </Card>
    );
}
