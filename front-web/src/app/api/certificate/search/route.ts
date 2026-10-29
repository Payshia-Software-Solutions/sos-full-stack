import { NextRequest, NextResponse } from "next/server";
import { LMS_API_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

interface SearchResultItem {
  id: string;
  username: string;
  name_on_certificate: string;
  student_id?: string;
  certificate_id?: string;
  course_code?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const trimmed = q.trim();

  if (trimmed.length < 2) {
    return NextResponse.json([]);
  }

  // Clean term without slashes, spaces, or hyphens for index / cert matching
  const cleanTerm = trimmed.replace(/[\/\\ \-_]/g, "").toUpperCase();

  const results: SearchResultItem[] = [];
  const seenUsernames = new Set<string>();

  const addItem = (item: SearchResultItem) => {
    const key = (item.username || item.id || "").toUpperCase();
    if (!key || seenUsernames.has(key)) return;
    seenUsernames.add(key);
    results.push(item);
  };

  try {
    // Strategy 1: Check if Certificate Reference (e.g. CREF4307)
    if (/^CREF/i.test(cleanTerm)) {
      try {
        const certRes = await fetch(
          `${LMS_API_URL}/certificate-print-status/by-certificate_id/${encodeURIComponent(cleanTerm)}/`,
          { next: { revalidate: 60 } }
        );
        if (certRes.ok) {
          const certRecord = await certRes.json();
          if (certRecord && certRecord.student_number) {
            const studentRes = await fetch(
              `${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(certRecord.student_number)}`,
              { next: { revalidate: 60 } }
            );
            if (studentRes.ok) {
              const studentData = await studentRes.json();
              const s = studentData?.studentInfo;
              if (s) {
                addItem({
                  id: String(s.id || certRecord.id),
                  username: s.username || certRecord.student_number,
                  name_on_certificate:
                    s.name_on_certificate ||
                    s.full_name ||
                    `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
                    certRecord.student_number,
                  student_id: s.student_id,
                  certificate_id: certRecord.certificate_id,
                  course_code: certRecord.course_code,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Certificate ID lookup error:", err);
      }
    }

    // Strategy 2: Check if Student Index Number format (e.g. PA24600, PA/24/600, or digits)
    if (/^[A-Z]{1,4}\d+/i.test(cleanTerm) || /^\d{3,}$/.test(cleanTerm)) {
      try {
        const studentRes = await fetch(
          `${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(cleanTerm)}`,
          { next: { revalidate: 60 } }
        );
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          const s = studentData?.studentInfo;
          if (s && s.username) {
            addItem({
              id: String(s.id),
              username: s.username,
              name_on_certificate:
                s.name_on_certificate ||
                s.full_name ||
                `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
                s.username,
              student_id: s.student_id,
            });
          }
        }
      } catch (err) {
        console.error("Student Index direct lookup error:", err);
      }
    }

    // Strategy 3: Name or Keyword search via /users/search/{token}
    const searchToken = trimmed.replace(/[\/\\]/g, "").split(/\s+/)[0];
    if (searchToken.length >= 2) {
      try {
        const usersRes = await fetch(
          `${LMS_API_URL}/users/search/${encodeURIComponent(searchToken)}`,
          { next: { revalidate: 60 } }
        );
        if (usersRes.ok) {
          const users = await usersRes.json();
          if (Array.isArray(users)) {
            for (const u of users) {
              addItem({
                id: String(u.id),
                username: u.username,
                name_on_certificate:
                  `${u.fname || ""} ${u.lname || ""}`.trim() || u.username,
                student_id: u.userid || u.username,
              });
            }
          }
        }
      } catch (err) {
        console.error("Users search route error:", err);
      }
    }

    // Strategy 4: Fallback to /userFullDetails/search/?q= if nothing found yet
    if (results.length === 0) {
      try {
        const fallbackRes = await fetch(
          `${LMS_API_URL}/userFullDetails/search/?q=${encodeURIComponent(trimmed)}`,
          { next: { revalidate: 60 } }
        );
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (Array.isArray(data)) {
            for (const item of data) {
              addItem({
                id: String(item.id),
                username: item.username,
                name_on_certificate: item.name_on_certificate || item.username,
                student_id: item.student_id,
              });
            }
          }
        }
      } catch {
        // silent fallback
      }
    }

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Certificate search route error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
