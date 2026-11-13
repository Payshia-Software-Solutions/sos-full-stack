import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { getEvents, isUpcomingEvent, eventImageSrc, formatEventDate, formatEventTime, type PublicEvent } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events | Ceylon Pharma College",
  description: "Upcoming workshops, webinars and ceremonies from Ceylon Pharma College.",
  alternates: { canonical: "https://pharmacollege.lk/events" },
};

function EventRow({ event }: { event: PublicEvent }) {
  const image = eventImageSrc(event.image_url);
  const time = formatEventTime(event.start_time, event.end_time);
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col sm:flex-row gap-5 bg-white dark:bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {image && (
        <div className="relative w-full sm:w-56 h-40 sm:h-auto shrink-0">
          <Image src={image} alt={event.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-5 flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">{formatEventDate(event.event_date)}</p>
        <h2 className="font-headline text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">{event.title}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
          {time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {time}</span>}
          {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>}
        </div>
        {event.summary && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{event.summary}</p>}
      </div>
    </Link>
  );
}

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events
    .filter(isUpcomingEvent)
    .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)));
  const past = events
    .filter((e) => e.status === "published" && !isUpcomingEvent(e))
    .sort((a, b) => String(b.event_date).localeCompare(String(a.event_date)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-2">Workshops, webinars and ceremonies from Ceylon Pharma College.</p>
        </div>

        <section className="space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> Upcoming Events
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-white dark:bg-card rounded-2xl border border-border p-6">
              No upcoming events at the moment. Please check back soon.
            </p>
          ) : (
            upcoming.map((event) => <EventRow key={event.id} event={event} />)
          )}
        </section>

        {past.length > 0 && (
          <section className="space-y-5 mt-14">
            <h2 className="text-lg font-bold text-muted-foreground">Past Events</h2>
            {past.map((event) => <EventRow key={event.id} event={event} />)}
          </section>
        )}
      </div>
    </div>
  );
}
