
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { submitReview } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Review"}
    </Button>
  );
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hoverValue, setHoverValue] = useState(0);
  
  return (
    <div className="flex items-center gap-2">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <label key={i}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => onChange(ratingValue)}
              className="sr-only"
            />
            <Star
              className={cn(
                "h-8 w-8 cursor-pointer transition-colors",
                ratingValue <= (hoverValue || value)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground/50"
              )}
              onMouseEnter={() => setHoverValue(ratingValue)}
              onMouseLeave={() => setHoverValue(0)}
            />
          </label>
        );
      })}
    </div>
  );
}


export default function SubmitReviewPage() {
  const [state, formAction] = useActionState(submitReview, { message: "", errors: null });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Success!",
        description: state.message,
      });
      formRef.current?.reset();
      setRating(0);
    } else if (state.message && state.errors) {
       toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <main className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Write a Review</CardTitle>
            <CardDescription className="font-body">Share your experience with the Ceylon Pharma College community.</CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Input name="name" placeholder="Your Name" required aria-label="Your Name" />
                {state.errors?.name && <p className="text-sm font-medium text-destructive pt-1">{state.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Input name="role" placeholder="Your Role (e.g., Alumni, Class of 2022)" required aria-label="Your Role" />
                {state.errors?.role && <p className="text-sm font-medium text-destructive pt-1">{state.errors.role[0]}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">Your Rating</p>
                    <StarRatingInput value={rating} onChange={setRating} />
                </div>
                {state.errors?.rating && <p className="text-sm font-medium text-destructive text-center pt-1">{state.errors.rating[0]}</p>}
              </div>
              <div className="space-y-2">
                <Textarea name="review" placeholder="Write your review here..." required rows={6} aria-label="Your Review" />
                {state.errors?.review && <p className="text-sm font-medium text-destructive pt-1">{state.errors.review[0]}</p>}
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
