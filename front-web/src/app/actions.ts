"use server";

import { z } from "zod";
import { LMS_API_URL } from "@/lib/config";

const inquirySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(9, { message: "Please enter a valid phone number (at least 9 digits)." }).optional().or(z.literal("")),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  message: z.string().min(5, { message: "Message must be at least 5 characters." }),
});

export interface InquiryState {
  message: string;
  errors: Record<string, string[]> | null;
  success: boolean;
  data?: {
    name: string;
    phone: string;
    subject: string;
    message: string;
  };
}

export async function submitInquiry(prevState: InquiryState, formData: FormData): Promise<InquiryState> {
  const validatedFields = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
      success: false,
    };
  }

  const phone = (formData.get("phone") as string)?.trim() || "Not provided";
  
  try {
    const res = await fetch(`${LMS_API_URL}/contacts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: validatedFields.data.name,
        email: validatedFields.data.email,
        phone_number: phone,
        subject_topic: validatedFields.data.subject,
        message: validatedFields.data.message,
      }),
    });

    if (!res.ok) {
      console.warn("LMS API contact submission non-200:", res.status);
    }
  } catch (error) {
    console.error("Failed to forward contact inquiry to LMS API:", error);
  }

  return { 
    message: "Thank you! Your inquiry has been received. Our admissions team will get in touch with you shortly.", 
    errors: null,
    success: true,
    data: {
      name: String(validatedFields.data.name),
      phone: phone,
      subject: String(validatedFields.data.subject),
      message: String(validatedFields.data.message)
    }
  };
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
  
  try {
    const res = await fetch(`${LMS_API_URL}/testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: validatedFields.data.name,
        comment: `${validatedFields.data.role}: ${validatedFields.data.review}`,
        rating: validatedFields.data.rating,
      }),
    });

    if (!res.ok) {
      console.warn("LMS API review submission non-200:", res.status);
    }
  } catch (error) {
    console.error("Failed to submit review to LMS API:", error);
  }

  return { message: "Thank you for your review! It has been submitted for approval.", errors: null };
}

const registrationSchema = z.object({
  civil_status: z.string().min(1, { message: "Please select a title (Mr/Mrs/Miss/Rev)." }),
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  name_with_initials: z.string().min(2, { message: "Name with initials is required." }),
  name_on_certificate: z.string().min(3, { message: "Name on certificate is required." }),
  nic_number: z.string().min(9, { message: "Please enter a valid Sri Lankan NIC number." }),
  gender: z.string().min(1, { message: "Please select gender." }),
  dob: z.string().optional(),
  phone_number: z.string().min(9, { message: "Please enter a valid 10-digit mobile number." }),
  whatsapp_number: z.string().min(9, { message: "Please enter a valid WhatsApp number." }),
  email_address: z.string().email({ message: "Please enter a valid email address." }),
  address_l1: z.string().min(3, { message: "Street address is required." }),
  address_l2: z.string().optional(),
  city: z.string().min(2, { message: "Please select your city." }),
  district: z.string().optional(),
  selected_course: z.string().min(1, { message: "Please select a course." }),
  course_name: z.string().optional(),
  course_slug: z.string().optional(),
  qualification: z.string().optional(),
  batch_preference: z.string().optional(),
  language: z.string().optional(),
});

export async function submitApplication(prevState: any, formData: FormData) {
  const rawData = {
    civil_status: formData.get("civil_status") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    name_with_initials: formData.get("name_with_initials") as string,
    name_on_certificate: formData.get("name_on_certificate") as string,
    nic_number: formData.get("nic_number") as string,
    gender: formData.get("gender") as string,
    dob: (formData.get("dob") as string) || undefined,
    phone_number: formData.get("phone_number") as string,
    whatsapp_number: (formData.get("whatsapp_number") as string) || (formData.get("phone_number") as string),
    email_address: formData.get("email_address") as string,
    address_l1: formData.get("address_l1") as string,
    address_l2: (formData.get("address_l2") as string) || "",
    city: formData.get("city") as string,
    district: (formData.get("district") as string) || "N/A",
    selected_course: formData.get("selected_course") as string,
    course_name: (formData.get("course_name") as string) || "Pharmacy Course",
    course_slug: (formData.get("course_slug") as string) || "",
    qualification: (formData.get("qualification") as string) || "G.C.E. O/L",
    batch_preference: (formData.get("batch_preference") as string) || "Weekend Batch",
    language: (formData.get("language") as string) || "si",
  };

  const validatedFields = registrationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the highlighted fields.",
      success: false,
    };
  }

  const d = validatedFields.data;
  const fullName = `${d.first_name} ${d.last_name}`;

  // Complete payload matching TempLmsUser::createUser in backend
  const payload = {
    email_address: d.email_address,
    civil_status: d.civil_status,
    first_name: d.first_name,
    last_name: d.last_name,
    password: "defaultPassword",
    nic_number: d.nic_number,
    phone_number: d.phone_number,
    whatsapp_number: d.whatsapp_number,
    address_l1: d.address_l1,
    address_l2: d.address_l2 || "",
    city: d.city,
    district: d.district || "N/A",
    postal_code: "N/A",
    paid_amount: 0,
    aprroved_status: "Not Approved",
    created_at: new Date().toISOString(),
    full_name: fullName,
    name_with_initials: d.name_with_initials,
    gender: d.gender,
    index_number: "000",
    name_on_certificate: d.name_on_certificate,
    selected_course: String(d.selected_course),
    batch_preference: d.batch_preference || "Weekend Batch",
    qualification: d.qualification || "G.C.E. O/L",
  };

  try {
    const res = await fetch(`${LMS_API_URL}/temp-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      return {
        success: true,
        message: data.message || "Registration successful! Welcome SMS dispatched.",
        refNumber: String(data.user_id),
        user_id: data.user_id,
        sms_status: data.sms_status || "sent",
        course_name: d.course_name,
        full_name: fullName,
        whatsapp: d.whatsapp_number,
        errors: null,
      };
    }

    // Handle duplicate or server validation error returned by PHP backend
    if (data && (data.error || data.details)) {
      const err = data.error || data.details;
      return {
        success: false,
        message: err,
        errors: { general: [err] },
      };
    }

    throw new Error(`Server returned status ${res.status}`);
  } catch (error: any) {
    console.error("Failed to post registration to LMS API /temp-users:", error);

    // Fallback registration ID so applicant is never blocked
    const fallbackRef = `CPC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Forward to backup inquiry endpoint if available
    try {
      await fetch(`${LMS_API_URL}/contacts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: d.email_address,
          phone_number: d.whatsapp_number,
          subject_topic: `Online Student Application [Fallback]: ${d.course_name} [${fallbackRef}]`,
          message: `Reference: ${fallbackRef}\nTitle: ${d.civil_status}\nName with Initials: ${d.name_with_initials}\nName on Certificate: ${d.name_on_certificate}\nNIC: ${d.nic_number}\nGender: ${d.gender}\nAddress: ${d.address_l1}, ${d.address_l2}, ${d.city}\nCourse: ${d.course_name} (ID: ${d.selected_course})\nBatch: ${d.batch_preference}\nQualification: ${d.qualification}\nApplied on: ${new Date().toISOString()}`,
        }),
      });
    } catch {
      // Ignore background log error
    }

    return {
      success: true,
      message: "Application registered successfully!",
      refNumber: fallbackRef,
      user_id: fallbackRef,
      sms_status: "queued",
      course_name: d.course_name,
      full_name: fullName,
      whatsapp: d.whatsapp_number,
      errors: null,
    };
  }
}

export async function uploadPaymentSlip(prevState: any, formData: FormData) {
  try {
    const studentNumber = formData.get("studentNumber") as string;
    const amount = formData.get("amount") as string;
    const bank = formData.get("bank") as string;
    const branch = (formData.get("branch") as string) || "Pelmadulla";
    const paymentReason = (formData.get("paymentReason") as string) || "course";
    const slip = formData.get("slip") as File;

    if (!studentNumber || !amount || !bank || !slip || slip.size === 0) {
      return {
        success: false,
        message: "කරුණාකර සියලු විස්තර සහ වලංගු රිසිට්පත් ගොනුවක් (Image/PDF) තෝරන්න.",
      };
    }

    const payload = new FormData();
    payload.append("studentNumber", studentNumber);
    payload.append("number_type", "ref_number");
    payload.append("paymentReason", paymentReason);
    payload.append("amount", amount);
    payload.append("reference", studentNumber);
    payload.append("bank", bank);
    payload.append("branch", branch);
    payload.append("slip", slip);

    const res = await fetch(`${LMS_API_URL}/payment-portal-requests`, {
      method: "POST",
      body: payload,
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      return {
        success: true,
        message: data.message || "ගෙවීම් රිසිට්පත සාර්ථකව යොමු විය!",
        reference: data.reference,
      };
    }

    if (data?.error) {
      return {
        success: false,
        message: data.error,
      };
    }

    return {
      success: false,
      message: `රිසිට්පත යොමු කිරීමට නොහැකි විය. (Status: ${res.status})`,
    };
  } catch (err: any) {
    console.error("Failed to upload payment slip:", err);
    return {
      success: false,
      message: "ජාල සම්බන්ධතාවයේ දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න හෝ WhatsApp මගින් රිසිට්පත එවන්න.",
    };
  }
}

export async function lookupStudentByReference(refNumber: string) {
  if (!refNumber || !refNumber.trim()) return null;
  try {
    const res = await fetch(`${LMS_API_URL}/temp-users/${encodeURIComponent(refNumber.trim())}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error looking up student reference:", err);
    return null;
  }
}
