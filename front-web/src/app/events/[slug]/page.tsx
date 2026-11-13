import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink } from "lucide-react";
import InteractiveArticleBody from "@/components/interactive-article-body";
import { getEventBySlug, eventImageSrc, formatEventDate, formatEventTime } from "@/lib/events";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | Ceylon Pharma College" };
  }

  const description = (event.summary || event.description || "").replace(/<[^>]*>?/gm, "").slice(0, 160);
  const canonicalUrl = `https://pharmacollege.lk/events/${encodeURIComponent(slug)}`;
  const image = eventImageSrc(event.image_url) ?? "https://content-provider.pharmacollege.lk/website/meta-seo-image.webp";

  return {
    title: `${event.title} | Ceylon Pharma College Events`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: event.title,
      description,
      type: "article",
      url: canonicalUrl,
      images: [{ url: image, width: 1200, height: 630, alt: event.title }],
    },
  };
}

export default async function SingleEventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const image = eventImageSrc(event.image_url);
  const time = formatEventTime(event.start_time, event.end_time);
  // Basic script stripping, same as the blog pages
  const sanitizedDescription = (event.description || "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/events" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to all events
          </Link>
        </div>

        <article className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {image && (
            <div className="relative w-full h-[260px] md:h-[380px]">
              <Image src={image} alt={event.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground leading-tight">{event.title}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">{formatEventDate(event.event_date)}</p>
                </div>
              </div>
              {time && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time</p>
                    <p className="font-semibold text-foreground">{time}</p>
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Venue</p>
                    <p className="font-semibold text-foreground">{event.location}</p>
                  </div>
                </div>
              )}
            </div>

            {event.summary && <p className="text-lg text-muted-foreground mt-6 leading-relaxed">{event.summary}</p>}

            {sanitizedDescription && (
              <div className="mt-8">
                <InteractiveArticleBody initialHtml={sanitizedDescription} />
              </div>
            )}

            {event.registration_url && (
              <div className="mt-10">
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 shadow-md transition-colors"
                >
                  Register / More Info <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
