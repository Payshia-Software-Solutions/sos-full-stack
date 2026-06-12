
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from '@/context/language-context';

const videos = [
  {
    id: "oRBmtQicXG4",
    title: "Ceylon Pharma College - A Journey of Excellence",
  },
  {
    id: "fCFonZdEZGg",
    title: "Student Testimonials & Campus Life",
  },
  {
    id: "d-aWudT5_3s",
    title: "Inside Our State-of-the-Art Labs",
  },
  {
    id: "XvazXU-saP4",
    title: "Annual Convocation Ceremony",
  },
  {
    id: "pqPiXXjDyAE",
    title: "A Message from Our Chairman",
  },
];

export default function Achievements() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const { t } = useTranslation();

  return (
    <section id="achievements" className="w-full py-16 md:py-24 bg-card/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            {t('achievementsTitle')}
          </h2>
           <div className="w-24 h-1 bg-primary mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-lg shadow-lg">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe
                    key={selectedVideo.id}
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>
            <h3 className="text-xl font-headline font-bold mt-4">{selectedVideo.title}</h3>
          </div>

          <div className="lg:col-span-1">
            <div className="flex flex-col gap-2">
              <p className="font-headline font-semibold">{t('achievementsWatchNext')}</p>
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={cn(
                    "w-full text-left p-2 rounded-lg transition-colors duration-200 flex gap-4 items-center bg-background",
                    selectedVideo.id === video.id
                      ? "ring-2 ring-primary shadow-md"
                      : "hover:bg-secondary/50"
                  )}
                  aria-current={selectedVideo.id === video.id}
                >
                  <div className="relative w-28 h-16 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                      alt={`Thumbnail for ${video.title}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="font-body font-medium text-sm leading-tight">{video.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
