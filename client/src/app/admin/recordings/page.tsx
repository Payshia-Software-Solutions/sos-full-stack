"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBatches, getCourseContentTitles, deleteCourseContent } from "@/lib/actions/courses";
import type { CourseContent, Batch } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRecordingsPage() {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("CPCC2"); // Default test course or let user pick
  const queryClient = useQueryClient();

  const { data: batches, isLoading: isLoadingBatches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: getBatches,
  });

  const { data: contents, isLoading: isLoadingContents } = useQuery<CourseContent[]>({
    queryKey: ['adminCourseContent', selectedCourseCode],
    queryFn: () => getCourseContentTitles(selectedCourseCode),
    enabled: !!selectedCourseCode,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourseContent', selectedCourseCode] });
      toast({
        title: "Content Deleted",
        description: "The course content has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete course content.",
      });
    }
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Manage Course Content</h1>
          <p className="text-muted-foreground">Add, edit, or delete video recordings, links, and files.</p>
        </div>
        <Button asChild>
          <Link href={`/admin/recordings/create?course=${selectedCourseCode}`}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New
          </Link>
        </Button>
      </header>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle>Course Content List</CardTitle>
          <div className="w-full md:w-72">
            <Select value={selectedCourseCode} onValueChange={setSelectedCourseCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select a batch" />
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
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Link / File</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingContents ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24"><Skeleton className="h-10 w-full" /></TableCell>
                  </TableRow>
                ) : contents && contents.length > 0 ? contents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                       <Badge variant="outline">{content.title_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{content.resource_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={content.description}>
                      {content.description}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {content.web_link ? (
                        <a href={content.web_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {content.web_link}
                        </a>
                      ) : content.file_path ? (
                        <span className="text-muted-foreground">{content.file_path}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                           <Link href={`/admin/recordings/edit/${content.id}?course=${content.course_code}`}>
                             <Edit className="h-4 w-4" />
                           </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the content entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(content.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No content found for this batch.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
