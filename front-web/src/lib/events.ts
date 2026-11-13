import { LMS_API_URL } from "@/lib/config";

export interface PublicEvent {
  id: number;
  title: string;
  slug: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  registration_url: string | null;
  status: string;
}

export const eventImageSrc = (value: string | null) => {
  if (!value) return null;
  return value.startsWith("http")
    ? value
    : `https://content-provider.pharmacollege.lk/content-provider/uploads/events/${value}`;
};

// Local date as YYYY-MM-DD (avoids the UTC shift of toISOString for Sri Lanka time)
const todayKey = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const isUpcomingEvent = (event: PublicEvent) =>
  event.status === "published" && String(event.event_date).slice(0, 10) >= todayKey();

export const formatEventDate = (value: string) => {
  const d = new Date(String(value).slice(0, 10) + "T00:00:00");
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

export const formatEventTime = (start: string | null, end: string | null) => {
  const s = start ? start.slice(0, 5) : "";
  const e = end ? end.slice(0, 5) : "";
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
};

export async function getEvents(): Promise<PublicEvent[]> {
  try {
    const res = await fetch(`${LMS_API_URL}/api/events`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success && Array.isArray(data.events) ? data.events : [];
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  try {
    const res = await fetch(`${LMS_API_URL}/api/events/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success && data.event ? data.event : null;
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }
}
