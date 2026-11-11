"use client";

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { uploadCourseCover } from '@/lib/actions/course-pages';
import { CONTENT_PROVIDER_URL } from '@/lib/config';

interface CoverCardProps {
  courseCode: string;
  /** The course record's course_img: a file name, or a full URL. */
  courseImg?: string | null;
}

export const coverUrl = (courseCode: string, courseImg?: string | null): string | null => {
  if (!courseImg) return null;
  return /^https?:\/\//i.test(courseImg) ? courseImg : `${CONTENT_PROVIDER_URL}/courses/${courseCode}/${courseImg}`;
};

// The cover belongs to the course record, so uploading changes it straight away (it is not part of the draft).
export function CoverCard({ courseCode, courseImg }: CoverCardProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const current = uploadedUrl ?? coverUrl(courseCode, courseImg);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadCourseCover(courseCode, file);
      setUploadedUrl(url);
      setBroken(false);
      await queryClient.invalidateQueries({ queryKey: ['parentCourses'] });
      toast({ title: 'Cover updated', description: 'It now shows on the course card and the public course page.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Cover upload failed', description: e instanceof Error ? e.message : 'Please try again.' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Course cover</CardTitle>
        <CardDescription>The picture on the course card, the course list and when the page is shared. Saved to the course straight away.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex aspect-video w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {current && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt="Current course cover" className="h-full w-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted-foreground">
              <ImageIcon className="h-8 w-8" aria-hidden="true" />
              {broken ? 'The cover file could not be loaded.' : 'No cover yet.'}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Choose a cover image"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {current ? 'Replace cover' : 'Upload cover'}
          </Button>
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB. A wide picture (16:9) looks best.</p>
        </div>
      </CardContent>
    </Card>
  );
}
