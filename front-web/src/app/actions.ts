
"use server";

import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export async function submitInquiry(prevState: any, formData: FormData) {
  const validatedFields = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }
  
  console.log("New Inquiry:", validatedFields.data);

  return { message: "Thank you for your inquiry! We will get back to you shortly.", errors: null, data: null };
}

const reviewSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(3, { message: "Role must be at least 3 characters." }),
  rating: z.coerce.number().min(1, { message: "Please select a rating." }).max(5),
  review: z.string().min(15, { message: "Review must be at least 15 characters." }),
});

export async function submitReview(prevState: any, formData: FormData) {
  const validatedFields = reviewSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    rating: formData.get("rating"),
    review: formData.get("review"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }
  
  // In a real application, you would save this to a database for moderation.
  console.log("New Review Submitted:", validatedFields.data);

  return { message: "Thank you for your review! It has been submitted for approval.", errors: null, data: validatedFields.data };
}
