"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getParentCourseList, updateBatch, getBatches, getBatchSchedules, getEducationalQualifications } from '@/lib/actions/courses';
import { getCriteriaLists } from '@/lib/actions/criteria';
import type { ParentCourse, Batch } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Save, Calendar, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const batchFormSchema = z.object({
    name: z.string().min(3, "Batch name must be at least 3 characters."),
    parent_course_id: z.string().min(1, "Parent course is required."),
    courseCode: z.string().min(1, "Batch code is required."),
    fee: z.coerce.number().min(0, "Fee must be a positive number."),
    registration_fee: z.coerce.number().min(0, "Registration fee must be a positive number."),
    duration: z.string().min(1, "Duration is required."),
    enroll_key: z.string().optional(),
    description: z.string().optional(),
    mini_description: z.string().optional(),
    certification: z.string().optional(),
    course_img: z.string().optional(),
    criteria_list: z.string().optional(),
    whatsapp_link: z.string().optional(),
    allowed_schedules: z.string().optional(),
    allowed_qualifications: z.string().optional(),
});

type BatchFormValues = z.infer<typeof batchFormSchema>;

export default function EditBatchPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const batchId = params.id as string;

    const { data: batches, isLoading: isLoadingBatches } = useQuery<Batch[]>({
        queryKey: ['allBatches'],
        queryFn: getBatches,
    });

    const batch = batches?.find(b => String(b.id) === String(batchId));

    const { data: parentCourses, isLoading: isLoadingParentCourses } = useQuery<ParentCourse[]>({
        queryKey: ['parentCourseList'],
        queryFn: getParentCourseList,
    });

    const { data: criteriaLists, isLoading: isLoadingCriteria } = useQuery({
        queryKey: ['criteriaLists'],
        queryFn: getCriteriaLists,
    });

    const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
        queryKey: ['batchSchedules'],
        queryFn: getBatchSchedules,
    });

    const { data: qualifications, isLoading: isLoadingQualifications } = useQuery({
        queryKey: ['educationalQualifications'],
        queryFn: getEducationalQualifications,
    });

    const form = useForm<BatchFormValues>({
        resolver: zodResolver(batchFormSchema),
        defaultValues: {
            name: '',
            parent_course_id: '',
            courseCode: '',
            fee: 0,
            registration_fee: 0,
            duration: '',
            enroll_key: '',
            description: '',
            mini_description: '',
            certification: '',
            course_img: '',
            criteria_list: '',
            whatsapp_link: '',
            allowed_schedules: '',
            allowed_qualifications: '',
        }
    });

    useEffect(() => {
        if (batch) {
            form.reset({
                ...batch,
                parent_course_id: batch.parent_course_id ? String(batch.parent_course_id) : '',
                fee: batch.fee ? parseFloat(batch.fee) : 0,
                registration_fee: batch.registration_fee ? parseFloat(batch.registration_fee) : 0,
                description: batch.description || '',
                mini_description: batch.mini_description || '',
                certification: batch.certification || '',
                course_img: batch.course_img || '',
                criteria_list: batch.criteria_list ? String(batch.criteria_list) : '',
                enroll_key: batch.enroll_key || '',
                whatsapp_link: batch.whatsapp_link || '',
                allowed_schedules: batch.allowed_schedules ? String(batch.allowed_schedules) : '',
                allowed_qualifications: batch.allowed_qualifications ? String(batch.allowed_qualifications) : '',
            });
        }
    }, [batch, form]);

    const updateMutation = useMutation({
        mutationFn: (data: BatchFormValues) => updateBatch(batchId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['allBatches'] });
            toast({ title: 'Success', description: 'Batch updated successfully.' });
            router.push(`/admin/manage/batches?courseId=${variables.parent_course_id}`);
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    });

    const onSubmit = (data: BatchFormValues) => {
        updateMutation.mutate(data);
    };

    if (isLoadingBatches) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Batch Not Found</h2>
                <Button onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div>
                    <h1 className="text-3xl font-headline font-semibold">Edit Batch</h1>
                    <p className="text-muted-foreground">Update configuration for {batch.name}</p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Batch Details</CardTitle>
                        <CardDescription>Edit batch specifications, fees, schedules, and criteria.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="parent_course_id">Parent Course*</Label>
                                <Select
                                    onValueChange={(val) => form.setValue('parent_course_id', val, { shouldValidate: true })}
                                    value={form.watch('parent_course_id')}
                                    disabled={isLoadingParentCourses}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a parent course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parentCourses?.map(course => (
                                            <SelectItem key={course.id} value={String(course.id)}>
                                                {course.course_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.parent_course_id && (
                                    <p className="text-destructive text-sm">{form.formState.errors.parent_course_id.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Batch Name*</Label>
                                <Input id="name" {...form.register('name')} />
                                {form.formState.errors.name && (
                                    <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="courseCode">Batch Code*</Label>
                                <Input id="courseCode" {...form.register('courseCode')} />
                                {form.formState.errors.courseCode && (
                                    <p className="text-destructive text-sm">{form.formState.errors.courseCode.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Course Duration*</Label>
                                <Input id="duration" {...form.register('duration')} />
                                {form.formState.errors.duration && (
                                    <p className="text-destructive text-sm">{form.formState.errors.duration.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fee">Course Fee (LKR)*</Label>
                                <Input id="fee" type="number" step="any" {...form.register('fee')} />
                                {form.formState.errors.fee && (
                                    <p className="text-destructive text-sm">{form.formState.errors.fee.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="registration_fee">Registration Fee (LKR)*</Label>
                                <Input id="registration_fee" type="number" step="any" {...form.register('registration_fee')} />
                                {form.formState.errors.registration_fee && (
                                    <p className="text-destructive text-sm">{form.formState.errors.registration_fee.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="enroll_key">Enrollment Key</Label>
                                <Input id="enroll_key" {...form.register('enroll_key')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="course_img">Course Image Filename</Label>
                                <Input id="course_img" {...form.register('course_img')} placeholder="e.g., image.jpg" />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="whatsapp_link">WhatsApp Group Link</Label>
                                <Input id="whatsapp_link" {...form.register('whatsapp_link')} placeholder="https://chat.whatsapp.com/..." />
                            </div>
                        </div>

                        {/* Preferred Class Schedules Setup */}
                        <div className="space-y-3 p-4 border rounded-md bg-blue-50/20 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <Label className="text-base font-semibold">Allowed Class Schedules</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Select which class schedules applicants can choose for this batch. (If none checked, all will be available by default).
                                    </p>
                                </div>
                            </div>
                            {isLoadingSchedules ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : schedules && schedules.length > 0 ? (
                                <Controller
                                    name="allowed_schedules"
                                    control={form.control}
                                    render={({ field }) => {
                                        const selectedIds = field.value ? String(field.value).split(',').filter(Boolean) : [];
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                {schedules.map((schedule) => {
                                                    const isChecked = selectedIds.includes(String(schedule.id));
                                                    return (
                                                        <div
                                                            key={schedule.id}
                                                            onClick={() => {
                                                                let newIds = [...selectedIds];
                                                                if (isChecked) {
                                                                    newIds = newIds.filter(id => id !== String(schedule.id));
                                                                } else {
                                                                    newIds.push(String(schedule.id));
                                                                }
                                                                field.onChange(newIds.join(','));
                                                            }}
                                                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                                                isChecked ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted/50'
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={() => {}}
                                                            />
                                                            <div className="space-y-1 leading-none flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <Label className="font-semibold cursor-pointer">
                                                                        {schedule.name_en}
                                                                    </Label>
                                                                    {schedule.badge && (
                                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                            {schedule.badge}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {schedule.days} • {schedule.time_slot}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }}
                                />
                            ) : (
                                <p className="text-sm italic text-muted-foreground">No class schedules found.</p>
                            )}
                        </div>

                        {/* Eligible Educational Qualifications Setup */}
                        <div className="space-y-3 p-4 border rounded-md bg-purple-50/20 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <div>
                                    <Label className="text-base font-semibold">Eligible Educational Qualifications</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Select which qualifications are accepted for this batch. (If none checked, all will be available by default).
                                    </p>
                                </div>
                            </div>
                            {isLoadingQualifications ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : qualifications && qualifications.length > 0 ? (
                                <Controller
                                    name="allowed_qualifications"
                                    control={form.control}
                                    render={({ field }) => {
                                        const selectedIds = field.value ? String(field.value).split(',').filter(Boolean) : [];
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                {qualifications.map((q) => {
                                                    const isChecked = selectedIds.includes(String(q.id));
                                                    return (
                                                        <div
                                                            key={q.id}
                                                            onClick={() => {
                                                                let newIds = [...selectedIds];
                                                                if (isChecked) {
                                                                    newIds = newIds.filter(id => id !== String(q.id));
                                                                } else {
                                                                    newIds.push(String(q.id));
                                                                }
                                                                field.onChange(newIds.join(','));
                                                            }}
                                                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                                                isChecked ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted/50'
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={() => {}}
                                                            />
                                                            <div className="space-y-1 leading-none flex-1">
                                                                <Label className="font-semibold cursor-pointer">
                                                                    {q.title_en}
                                                                </Label>
                                                                {q.title_si && (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        {q.title_si}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }}
                                />
                            ) : (
                                <p className="text-sm italic text-muted-foreground">No qualifications found.</p>
                            )}
                        </div>

                        <div className="space-y-2 mt-6 p-4 border rounded-md bg-muted/20">
                            <Label className="text-lg">Certificate Eligibility Criteria</Label>
                            <p className="text-sm text-muted-foreground mb-4">Select the criteria students must meet to be eligible for a certificate.</p>
                            {isLoadingCriteria ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : criteriaLists && criteriaLists.length > 0 ? (
                                <Controller
                                    name="criteria_list"
                                    control={form.control}
                                    render={({ field }) => {
                                        const selectedIds = field.value ? String(field.value).split(',').filter(Boolean) : [];
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {criteriaLists.map((criteria) => {
                                                    const isChecked = selectedIds.includes(String(criteria.id));
                                                    return (
                                                        <div key={criteria.id} className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md border">
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => {
                                                                    let newIds = [...selectedIds];
                                                                    if (checked) {
                                                                        newIds.push(String(criteria.id));
                                                                    } else {
                                                                        newIds = newIds.filter(id => id !== String(criteria.id));
                                                                    }
                                                                    field.onChange(newIds.join(','));
                                                                }}
                                                            />
                                                            <div className="space-y-1 leading-none">
                                                                <Label className="font-semibold cursor-pointer">
                                                                    {criteria.list_name}
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Required MOQ: {criteria.moq}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }}
                                />
                            ) : (
                                <p className="text-sm italic">No criteria lists found.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description</Label>
                            <Textarea id="description" rows={5} {...form.register('description')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mini_description">Mini Description</Label>
                            <Textarea id="mini_description" rows={3} {...form.register('mini_description')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certification">Certification Details</Label>
                            <Textarea id="certification" rows={2} {...form.register('certification')} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={updateMutation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
