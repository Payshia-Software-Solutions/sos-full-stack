"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCourseContentTitles } from '@/lib/actions/courses';
import type { CourseContent } from '@/lib/types';

const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
    }
  } catch (error) {
    console.error("Invalid URL for YouTube video", error);
  }
  return null;
};

export default function RecordingPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordingId = params.id as string;
  const courseCode = searchParams.get('courseCode');

  const { data: contents, isLoading } = useQuery<CourseContent[]>({
    queryKey: ['courseContent', courseCode],
    queryFn: () => getCourseContentTitles(courseCode!),
    enabled: !!courseCode,
  });

  const recording = contents?.find(c => String(c.id) === recordingId);
  const videoId = recording?.web_link ? getYouTubeVideoId(recording.web_link) : null;

  if (isLoading) {
    return (
       <div className="p-4 md:p-8 space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-[60vh] w-full" />
       </div>
    );
  }

  if (!recording) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold">Content Not Found</h1>
        <p className="text-muted-foreground mt-2">The video you are looking for does not exist.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const isMp4 = recording.file_path && recording.file_path.toLowerCase().endsWith('.mp4');

  return (
    <div className="p-4 md:p-8 space-y-6 pb-20">
      <header>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contents
        </Button>
      </header>

      <Card className="shadow-lg overflow-hidden border-0">
        <div className="aspect-video bg-black flex items-center justify-center relative">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={recording.description}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          ) : isMp4 ? (
             <video 
                controls 
                autoPlay 
                className="w-full h-full max-h-full"
                src={`${CONTENT_PROVIDER_URL}/${recording.file_path}`}
             >
                 Your browser does not support the video tag.
             </video>
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground p-8 text-center">
                <p>Could not load video. Invalid format or missing URL.</p>
            </div>
          )}
        </div>
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl font-headline text-primary">{recording.description}</CardTitle>
          <CardDescription className="text-sm font-medium">{recording.title_name}</CardDescription>
        </CardHeader>
        {(!videoId && !isMp4 && recording.file_path) && (
            <CardFooter className="bg-muted/30 pt-6">
                 <a href={`${CONTENT_PROVIDER_URL}/${recording.file_path}`} target="_blank" rel="noopener noreferrer">
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Download File
                    </Button>
                </a>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
