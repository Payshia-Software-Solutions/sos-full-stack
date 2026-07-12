"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCourseContentModules, createCourseContent, getBatches, uploadCourseContentFile } from "@/lib/actions/courses";
import type { CourseContentModule, Batch } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Video, FileText, Link as LinkIcon, AlertCircle, UploadCloud } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ManageModulesDialog } from "../ManageModulesDialog";

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
    // Ignore invalid URLs while typing
  }
  return null;
};

function CreateContentForm() {
  const searchParams = useSearchParams();
  const defaultCourse = searchParams.get('course') || "";
  const router = useRouter();
  const { user } = useAuth();

  const [courseCode, setCourseCode] = useState(defaultCourse);
  const [titleId, setTitleId] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [description, setDescription] = useState("");
  const [webLink, setWebLink] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          const uploadedPath = await uploadCourseContentFile(file);
          setFilePath(uploadedPath);
          toast({ title: "Upload Success", description: "File uploaded successfully." });
      } catch (error: any) {
          toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      } finally {
          setIsUploading(false);
      }
  };

  const { data: batches, isLoading: isLoadingBatches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: getBatches,
  });

  const { data: modules, isLoading: isLoadingModules } = useQuery<CourseContentModule[]>({
    queryKey: ['courseModules', courseCode],
    queryFn: () => getCourseContentModules(courseCode),
    enabled: !!courseCode,
  });

  // Ensure titleId resets if course changes
  useEffect(() => {
    setTitleId("");
  }, [courseCode]);

  const createMutation = useMutation({
    mutationFn: createCourseContent,
    onSuccess: () => {
      toast({ title: "Success", description: "Course content created." });
      router.push("/admin/recordings");
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create course content." });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !titleId || !resourceType || !description) {
        toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields." });
        return;
    }
    createMutation.mutate({
      course_code: courseCode,
      title_id: titleId,
      resource_type: resourceType,
      description,
      web_link: webLink || null,
      file_path: filePath || null,
      created_by: user?.username || "Admin"
    });
  };

  const renderPreview = () => {
      if (!resourceType) {
          return (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-muted/20 rounded-lg border-2 border-dashed">
                  <Video className="w-12 h-12 mb-4 opacity-50" />
                  <p>Select a resource type and enter a link/path to see a preview.</p>
              </div>
          );
      }

      if (resourceType === "Video (YouTube)") {
          const videoId = getYouTubeVideoId(webLink);
          if (videoId) {
              return (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-md">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                        title="YouTube preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      ></iframe>
                  </div>
              );
          }
          return (
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Invalid YouTube URL. Please enter a valid link.</AlertDescription>
              </Alert>
          );
      }

      if (resourceType === "Video (.mp4)") {
          if (filePath) {
              return (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-md">
                      <video 
                        controls 
                        className="w-full h-full max-h-full"
                        src={`${CONTENT_PROVIDER_URL}/${filePath}`}
                      >
                         Your browser does not support the video tag.
                      </video>
                  </div>
              );
          }
          return (
             <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Enter a valid file path to preview the MP4 video.</AlertDescription>
              </Alert>
          );
      }

      if (resourceType === "PDF Document" || resourceType === "External Link") {
          const isFile = !!filePath;
          const isLink = !!webLink;
          if (isFile || isLink) {
              return (
                  <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                          {resourceType === "PDF Document" ? <FileText className="w-16 h-16 text-primary" /> : <LinkIcon className="w-16 h-16 text-primary" />}
                          <div>
                              <h4 className="font-semibold">{description || "No Title Provided"}</h4>
                              <p className="text-sm text-muted-foreground mt-2 break-all">
                                  {isFile ? `${CONTENT_PROVIDER_URL}/${filePath}` : webLink}
                              </p>
                          </div>
                          <Button variant="outline" asChild>
                              <a href={isFile ? `${CONTENT_PROVIDER_URL}/${filePath}` : webLink} target="_blank" rel="noopener noreferrer">
                                  Test Link
                              </a>
                          </Button>
                      </CardContent>
                  </Card>
              );
          }
          return (
              <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Enter a link or file path to see the preview details.</AlertDescription>
              </Alert>
          );
      }

      return null;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-20 w-full">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recordings
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form Side */}
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Create Course Content</CardTitle>
              <CardDescription>Add new learning materials for students.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select value={courseCode} onValueChange={setCourseCode} disabled={isLoadingBatches}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingBatches ? "Loading batches..." : "Select a batch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {batches?.map(batch => (
                        <SelectItem key={batch.courseCode} value={batch.courseCode}>
                          {batch.name} ({batch.courseCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Module (Title)</Label>
                    <ManageModulesDialog courseCode={courseCode} />
                  </div>
                  <Select value={titleId} onValueChange={setTitleId} disabled={!courseCode || isLoadingModules}>
                    <SelectTrigger>
                      <SelectValue placeholder={!courseCode ? "Select a batch first" : isLoadingModules ? "Loading modules..." : "Select a module"} />
                    </SelectTrigger>
                    <SelectContent>
                      {modules && modules.length > 0 ? modules.map(mod => (
                        <SelectItem key={mod.id} value={String(mod.id)}>{mod.title_name}</SelectItem>
                      )) : (
                         <SelectItem value="none" disabled>No modules found for this course</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resource Type</Label>
                  <Select value={resourceType} onValueChange={setResourceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video (YouTube)">Video (YouTube)</SelectItem>
                      <SelectItem value="Video (.mp4)">Video (.mp4)</SelectItem>
                      <SelectItem value="PDF Document">PDF Document</SelectItem>
                      <SelectItem value="External Link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Title / Description</Label>
                  <Textarea 
                     id="description" 
                     value={description} 
                     onChange={(e) => setDescription(e.target.value)} 
                     required 
                     placeholder="e.g. Week 1 - Introduction to Pharmacology"
                     className="resize-none h-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="webLink">Web Link (e.g., YouTube URL)</Label>
                    <Input id="webLink" type="url" value={webLink} onChange={(e) => setWebLink(e.target.value)} placeholder="https://..." disabled={resourceType === 'Video (.mp4)'} />
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="filePath">File Path</Label>
                    <div className="flex gap-2">
                      <Input id="filePath" value={filePath} onChange={(e) => setFilePath(e.target.value)} placeholder="uploads/course_content/..." disabled={resourceType === 'Video (YouTube)' || resourceType === 'External Link'} />
                      {(resourceType === 'Video (.mp4)' || resourceType === 'PDF Document') && (
                          <div className="relative">
                            <input 
                              type="file" 
                              onChange={handleFileUpload} 
                              disabled={isUploading}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              accept={resourceType === 'Video (.mp4)' ? "video/mp4" : "application/pdf"}
                            />
                            <Button type="button" variant="outline" disabled={isUploading}>
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            </Button>
                          </div>
                      )}
                    </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Provide a Web Link (for YouTube/External) OR upload a file / provide a File Path (for MP4/PDFs hosted on Content Provider).</p>

                <Button type="submit" className="w-full h-12 text-lg font-semibold mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Save Content"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview Side */}
          <div className="sticky top-8 space-y-4">
              <h3 className="text-lg font-semibold font-headline flex items-center gap-2">
                  Content Preview
              </h3>
              <div className="w-full bg-card rounded-xl border shadow-sm p-4 min-h-[300px]">
                 {renderPreview()}
              </div>
          </div>
      </div>
    </div>
  );
}

export default function CreateRecordingPage() {
    return (
        <Suspense fallback={<div className="p-8"><Loader2 className="animate-spin w-8 h-8 text-primary mx-auto"/></div>}>
            <CreateContentForm />
        </Suspense>
    );
}
