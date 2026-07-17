"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Search, FileText, Link as LinkIcon, Download, Play, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCourseContentTitles } from "@/lib/actions/courses";
import type { CourseContent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.startsWith('/embed/')) return urlObj.pathname.replace('/embed/', '');
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
  } catch (_) {}
  return null;
};

type ParsedContent = CourseContent & {
  description: string;
  resource_type: string;
  web_link: string;
  file_path: string;
};

export default function CourseContentPage() {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    const stored = localStorage.getItem('selected_course');
    if (stored) setSelectedCourseCode(stored);
  }, []);

  const { data: contents, isLoading } = useQuery<CourseContent[]>({
    queryKey: ['courseContent', selectedCourseCode],
    queryFn: () => getCourseContentTitles(selectedCourseCode!),
    enabled: !!selectedCourseCode,
  });

  const parsedContents = useMemo((): ParsedContent[] => {
    if (!contents) return [];
    return contents.map(item => {
      let desc = item.description || "";
      let resType = item.resource_type;
      let link = item.web_link || "";
      let filePath = item.file_path || "";

      if (desc.includes("<iframe") && desc.includes("youtube.com/embed")) {
        const srcMatch = desc.match(/src="([^"]+)"/);
        if (srcMatch?.[1]) {
          link = srcMatch[1];
          resType = "Video (YouTube)";
          desc = desc.replace(/<p><iframe[^>]+><\/iframe><\/p>/g, "").trim() || "Legacy YouTube Video";
        }
      } else if (resType === "Text" || !["Video (YouTube)", "Video (.mp4)", "PDF Document", "External Link"].includes(resType)) {
        resType = "External Link";
      }

      return { ...item, description: desc, resource_type: resType, web_link: link, file_path: filePath };
    });
  }, [contents]);

  const filters = useMemo(() => {
    const types = new Set(parsedContents.map(c => c.resource_type));
    return ["All", ...Array.from(types)];
  }, [parsedContents]);

  const filteredContents = useMemo(() => {
    return parsedContents.filter(c => {
      const matchFilter = activeFilter === "All" || c.resource_type === activeFilter;
      const matchSearch =
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title_name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [parsedContents, searchTerm, activeFilter]);

  if (!selectedCourseCode) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p>Please select a course from the dashboard first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 py-5 pb-24 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Course Content & Recordings</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse your lectures, documents, and resources.</p>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search topics, lectures, or materials..."
          className="pl-10 w-full h-11 bg-card border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      {!isLoading && filters.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredContents.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7">
          {filteredContents.map((item) => {
            const isVideo = item.resource_type.toLowerCase().includes('video');
            const isLink = item.resource_type.toLowerCase().includes('link');
            const isPdf = item.resource_type === "PDF Document";
            const videoId = item.web_link ? getYouTubeVideoId(item.web_link) : null;

            // ── Video Card (YouTube style) ──
            if (isVideo) {
              return (
                <Link
                  key={item.id}
                  href={`/dashboard/recordings/${item.id}?courseCode=${selectedCourseCode}`}
                  className="group block"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 shadow-sm mb-3">
                    {videoId ? (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={item.description}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 transition-colors duration-300" />
                        {/* Play button on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-white/90 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-200">
                            <Play className="w-6 h-6 text-black fill-black ml-1" />
                          </div>
                        </div>
                        {/* Duration pill bottom-right */}
                        <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide">
                          YouTube
                        </span>
                      </>
                    ) : (
                      /* MP4 placeholder */
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600/20 to-teal-600/20">
                        <Play className="w-10 h-10 text-emerald-400 fill-emerald-400 opacity-80 group-hover:scale-110 transition-transform duration-200" />
                        <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">MP4</span>
                      </div>
                    )}
                  </div>

                  {/* Info below thumbnail */}
                  <div className="space-y-1 px-0.5">
                    <p className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
                      {item.description}
                    </p>
                    {item.title_name && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.title_name}</p>
                    )}
                  </div>
                </Link>
              );
            }

            // ── PDF / Link Card ──
            return (
              <div key={item.id} className="group flex flex-col gap-2">
                {/* Icon thumbnail */}
                <div className={`relative aspect-video w-full rounded-xl overflow-hidden flex items-center justify-center shadow-sm border ${
                  isPdf
                    ? "bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20"
                    : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20"
                }`}>
                  {isPdf
                    ? <FileText className="w-10 h-10 text-rose-500 opacity-80" />
                    : <LinkIcon className="w-10 h-10 text-blue-500 opacity-80" />
                  }
                  <span className={`absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
                    isPdf ? "bg-rose-500/80 text-white" : "bg-blue-500/80 text-white"
                  }`}>
                    {isPdf ? "PDF" : "Link"}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1 px-0.5">
                  <p className="text-sm font-semibold line-clamp-2 leading-snug">{item.description}</p>
                  {item.title_name && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.title_name}</p>
                  )}
                </div>

                {/* Button */}
                <div className="mt-auto">
                  {isLink ? (
                    <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5">
                      <a href={item.web_link || '#'} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-3.5 h-3.5" /> Open Link
                      </a>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5">
                      <a href={`${CONTENT_PROVIDER_URL}/${item.file_path}`} target="_blank" rel="noopener noreferrer">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
          <BookOpen className="w-12 h-12 mx-auto opacity-30 mb-4" />
          <p className="font-semibold text-lg">No content found</p>
          <p className="text-sm mt-1">
            {searchTerm ? "Try a different search term." : "No learning materials available yet."}
          </p>
        </div>
      )}
    </div>
  );
}
