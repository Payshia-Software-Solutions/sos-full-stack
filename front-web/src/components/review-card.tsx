"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "./star-rating";

interface Review {
    name: string;
    role: string;
    avatar: string;
    image: string;
    hint: string;
    quote: string;
    rating: number;
}

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    return (
        <Card className="h-full bg-card flex flex-col">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                <Avatar className="h-20 w-20 mb-4 border-2 border-primary/20">
                    <AvatarImage src={review.image} alt={review.name} data-ai-hint={review.hint} />
                    <AvatarFallback>{review.avatar}</AvatarFallback>
                </Avatar>
                <div className="mb-4">
                  <StarRating rating={review.rating} />
                </div>
                <p className="font-body text-base text-muted-foreground italic flex-grow">"{review.quote}"</p>
                <div className="mt-6 flex flex-col items-center gap-1">
                    <p className="font-semibold font-headline text-lg">{review.name}</p>
                    <p className="text-sm text-primary font-medium">{review.role}</p>
                </div>
            </CardContent>
        </Card>
    );
}
