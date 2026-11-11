"use client";

import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { CONTENT_PROVIDER_URL, LMS_API_URL } from '@/lib/config';

interface PhotoUploadFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

// Uses the existing blog image upload endpoint; the stored value is the full public URL.
export function PhotoUploadField({ id, value, onChange }: PhotoUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const response = await fetch(`${LMS_API_URL}/api/blogs/upload-image`, { method: 'POST', body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.success || !body?.url) throw new Error(body?.message || 'Upload failed');
      onChange(`${CONTENT_PROVIDER_URL}/content-provider/uploads/blogs/${body.url}`);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Photo upload failed', description: e instanceof Error ? e.message : 'Please try again.' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste a photo URL or upload one" />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Choose a photo file"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload
        </Button>
      </div>
      {/^https?:\/\//i.test(value) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Photo preview" className="h-16 w-16 rounded-full border object-cover" />
      )}
    </div>
  );
}
