"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Search, FileText, Link as LinkIcon, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCourseContentTitles } from "@/lib/actions/courses";
import type { CourseContent } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

export default function CourseContentPage() {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedCourseCode = localStorage.getItem('selected_course');
    if (storedCourseCode) {
        setSelectedCourseCode(storedCourseCode);
    }
  }, []);

  const { data: contents, isLoading } = useQuery<CourseContent[]>({
    queryKey: ['courseContent', selectedCourseCode],
    queryFn: () => getCourseContentTitles(selectedCourseCode!),
    enabled: !!selectedCourseCode,
  });

  const groupedContent = useMemo(() => {
    if (!contents) return {};
    const filtered = contents.filter(c => 
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.reduce((acc, curr) => {
      const titleName = curr.title_name || 'Other';
      if (!acc[titleName]) {
        acc[titleName] = [];
      }
      acc[titleName].push(curr);
      return acc;
    }, {} as Record<string, CourseContent[]>);
  }, [contents, searchTerm]);

  if (!selectedCourseCode) {
    return <div className="p-8">Please select a course from the dashboard first.</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 pb-40">
      <header>
        <h1 className="text-3xl font-headline font-semibold">Course Content & Recordings</h1>
        <p className="text-muted-foreground">Access your learning materials, videos, and resources.</p>
      </header>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search content..." 
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
      ) : Object.keys(groupedContent).length > 0 ? (
        <Accordion type="multiple" defaultValue={Object.keys(groupedContent)}>
          {Object.entries(groupedContent).map(([titleName, items], index) => (
            <AccordionItem value={titleName} key={index} className="border bg-card rounded-lg mb-4 shadow-sm overflow-hidden px-4">
              <AccordionTrigger className="hover:no-underline font-semibold text-lg py-4">
                {titleName} ({items.length})
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="flex flex-col shadow-sm border-border hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base line-clamp-2">{item.description}</CardTitle>
                        <CardDescription className="text-xs">{item.resource_type}</CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto pt-4 flex gap-2">
                         {item.resource_type.toLowerCase().includes('video') || item.resource_type.toLowerCase() === 'youtube' ? (
                           <Button asChild className="w-full" variant="default">
                              <Link href={`/dashboard/recordings/${item.id}?courseCode=${selectedCourseCode}`}>
                                <PlayCircle className="w-4 h-4 mr-2" /> Watch Video
                              </Link>
                           </Button>
                         ) : item.resource_type.toLowerCase() === 'link' ? (
                            <Button asChild className="w-full" variant="secondary">
                                <a href={item.web_link || '#'} target="_blank" rel="noopener noreferrer">
                                  <LinkIcon className="w-4 h-4 mr-2" /> Open Link
                                </a>
                            </Button>
                         ) : (
                            <Button asChild className="w-full" variant="secondary">
                                <a href={`${CONTENT_PROVIDER_URL}/${item.file_path}`} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-2" /> Download File
                                </a>
                            </Button>
                         )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
         <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            No course content found for this course.
         </div>
      )}
    </div>
  );
}
