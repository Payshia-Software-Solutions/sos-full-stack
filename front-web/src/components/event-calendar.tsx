"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "@/context/language-context";
import Link from "next/link";
import { formatEventDate, formatEventTime, type PublicEvent } from "@/lib/events";

interface EventCalendarProps {
  events: PublicEvent[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  if (events.length === 0) {
    return null;
  }

  return (
    <section id="events" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className={`text-3xl md:text-4xl font-headline font-bold text-primary ${isSinhala ? 'leading-[1.35]' : 'leading-tight'}`}>{t('eventsTitle')}</h2>
          <p className={`mt-2 max-w-2xl mx-auto text-muted-foreground font-body ${isSinhala ? 'leading-[1.75]' : 'leading-relaxed'}`}>

            {t('eventsSubtitle')}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => {
            const time = formatEventTime(event.start_time, event.end_time);
            return (
              <Card key={event.id} className="flex flex-col bg-background hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-md shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-headline text-lg">{event.title}</CardTitle>
                    <CardDescription className="font-body">
                      {formatEventDate(event.event_date)}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  {(time || event.location) && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {time && <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {time}</p>}
                      {event.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</p>}
                    </div>
                  )}
                  {event.summary && <p className="font-body text-sm text-muted-foreground">{event.summary}</p>}
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${event.slug}`}>{t('eventsLearnMore')}</Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link href="/events" className="text-sm font-semibold text-primary hover:underline">
            View all events →
          </Link>
        </div>
      </div>
    </section>
  );
}
