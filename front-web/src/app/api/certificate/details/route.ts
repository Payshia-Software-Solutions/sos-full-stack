import { NextRequest, NextResponse } from "next/server";
import { LMS_API_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const loggedUser = searchParams.get("loggedUser") || "";
  let cleanUser = loggedUser.trim().replace(/[\/\\ \-_]/g, "").toUpperCase();

  if (!cleanUser) {
    return NextResponse.json(
      { error: "Missing or invalid loggedUser parameter" },
      { status: 400 }
    );
  }

  // If pure digits, prepend PA as standard Ceylon Pharma College index prefix
  if (/^\d{3,}$/.test(cleanUser)) {
    cleanUser = `PA${cleanUser}`;
  }

  try {
    const res = await fetch(
      `${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(cleanUser)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Certificate details route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch student details" },
      { status: 500 }
    );
  }
}
