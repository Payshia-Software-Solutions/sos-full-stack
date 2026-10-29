import { NextRequest, NextResponse } from "next/server";
import { LMS_API_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const loggedUser = searchParams.get("loggedUser") || "";
  const cleanUser = loggedUser.trim().replace(/[\/\\ \-_]/g, "").toUpperCase();

  if (!cleanUser) {
    return NextResponse.json(
      { error: "Missing or invalid loggedUser parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(cleanUser)}`,
      { next: { revalidate: 60 } }
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
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
