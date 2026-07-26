"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getParentCourses } from '@/lib/actions/courses';
import { getTranscriptTemplate, saveTranscriptTemplate } from '@/lib/actions/transcripts';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function TranscriptDesignPage() {
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [templateHtml, setTemplateHtml] = useState<string>('');
    const queryClient = useQueryClient();

    // Fetch courses
    const { data: courses, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['parentCourses'],
        queryFn: getParentCourses,
    });

    // Fetch template for selected course
    const { data: templateResponse, isLoading: isLoadingTemplate, refetch: refetchTemplate } = useQuery({
        queryKey: ['transcriptTemplate', selectedCourse],
        queryFn: () => getTranscriptTemplate(selectedCourse),
        enabled: !!selectedCourse,
    });

    useEffect(() => {
        if (templateResponse?.success && templateResponse.template) {
            try {
                const data = JSON.parse(templateResponse.template.template_data);
                setTemplateHtml(data.html || '');
            } catch (e) {
                setTemplateHtml('');
            }
        } else {
            setTemplateHtml('');
        }
    }, [templateResponse]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: (data: { courseId: string, templateData: any }) => saveTranscriptTemplate(data.courseId, data.templateData),
        onSuccess: () => {
            toast({ title: 'Template Saved', description: 'Transcript template has been saved successfully.' });
            queryClient.invalidateQueries({ queryKey: ['transcriptTemplate', selectedCourse] });
        },
        onError: (err) => {
            toast({ variant: 'destructive', title: 'Save Failed', description: err.message });
        }
    });

    const handleSave = () => {
        if (!selectedCourse) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a course first.' });
            return;
        }
        saveMutation.mutate({
            courseId: selectedCourse,
            templateData: { html: templateHtml }
        });
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-semibold">Transcript Designer</h1>
                    <p className="text-muted-foreground">Design and manage transcript templates for courses.</p>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Select Course</CardTitle>
                    <CardDescription>Choose a course to edit its transcript template.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        {isLoadingCourses ? (
                            <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4"/> Loading courses...</div>
                        ) : (
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses?.map((course: any) => (
                                        <SelectItem key={course.id} value={course.id}>{course.course_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedCourse && (
                <Card>
                    <CardHeader>
                        <CardTitle>Template Editor</CardTitle>
                        <CardDescription>
                            Use variables like <strong>{`{{STUDENT_NAME}}`}</strong> and <strong>{`{{STUDENT_ID}}`}</strong> which will be replaced during generation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingTemplate ? (
                            <div className="flex items-center gap-2 py-8"><Loader2 className="animate-spin h-5 w-5"/> Loading template...</div>
                        ) : (
                            <>
                                <div className="border rounded-md bg-white">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={templateHtml} 
                                        onChange={setTemplateHtml} 
                                        modules={modules}
                                        style={{ height: '500px' }}
                                    />
                                </div>
                                <div className="flex justify-end pt-12">
                                    <Button onClick={handleSave} disabled={saveMutation.isPending}>
                                        {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                        Save Template
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
