"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "@/context/language-context";
import Link from "next/link";

const events = [
  {
    title: "Special Intake Orientation Webinar",
    date: "2026-10-10",
    description: "Introductory live orientation for newly enrolled students covering the LMS portal, interactive games, course milestones, and study schedule.",
    link: "/contact"
  },
  {
    title: "Practical Pharmacy Skills Workshop",
    date: "2026-11-15",
    description: "Hands-on virtual simulation workshop on prescription validation, dosage calculation, and patient counselling techniques.",
    link: "/courses"
  },
  {
    title: "Annual Certificate Awarding Ceremony",
    date: "2026-12-20",
    description: "Grand graduation ceremony honouring certified pharmacy practice graduates with participation from healthcare industry leaders.",
    link: "/alumni"
  }
];

export default function EventCalendar() {
  const { t } = useTranslation();

  if (events.length === 0) {
    return null;
  }

  return (
    <section id="events" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">{t('eventsTitle')}</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">
            {t('eventsSubtitle')}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.title} className="flex flex-col bg-background hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-md shrink-0">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-headline text-lg">{event.title}</CardTitle>
                  <CardDescription className="font-body">
                    {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="font-body text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={event.link}>{t('eventsLearnMore')}</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}