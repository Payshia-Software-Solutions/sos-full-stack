"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getParentCourseList, getBatches, createBatch } from '@/lib/actions/courses';
import { getCriteriaLists } from '@/lib/actions/criteria';
import type { ParentCourse, Batch } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Sparkles, RefreshCw, Edit3 } from 'lucide-react';
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
});

type BatchFormValues = z.infer<typeof batchFormSchema>;

export default function CreateBatchPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isCodeManual, setIsCodeManual] = useState(false);

    const { data: parentCourses, isLoading: isLoadingParentCourses } = useQuery<ParentCourse[]>({
        queryKey: ['parentCourseList'],
        queryFn: getParentCourseList,
    });

    const { data: batches } = useQuery<Batch[]>({
        queryKey: ['allBatches'],
        queryFn: getBatches,
    });

    const { data: criteriaLists, isLoading: isLoadingCriteria } = useQuery({
        queryKey: ['criteriaLists'],
        queryFn: getCriteriaLists,
    });

    // Auto-calculate the next sequential CPCC batch code (e.g. CPCC35)
    const nextBatchCode = useMemo(() => {
        if (!batches || batches.length === 0) return 'CPCC1';
        let max = 0;
        batches.forEach(b => {
            const match = b.courseCode?.match(/^CPCC(\d+)$/i);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > max) {
                    max = num;
                }
            }
        });
        return `CPCC${max + 1}`;
    }, [batches]);

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
        }
    });

    // Automatically fill the generated batch code once calculated
    useEffect(() => {
        if (nextBatchCode && !isCodeManual) {
            form.setValue('courseCode', nextBatchCode, { shouldValidate: true });
        }
    }, [nextBatchCode, isCodeManual, form]);

    const handleParentCourseChange = (selectedParentId: string) => {
        form.setValue('parent_course_id', selectedParentId, { shouldValidate: true });

        const parent = parentCourses?.find(pc => String(pc.id) === selectedParentId);
        if (!parent) return;

        // Auto-calculate the next batch number for this parent course
        const batchesForParent = batches?.filter(b => String(b.parent_course_id) === selectedParentId) || [];
        let highestBatchNum = 0;
        batchesForParent.forEach(b => {
            const match = b.name?.match(/Batch\s*(\d+)/i);
            if (match) {
                const n = parseInt(match[1], 10);
                if (!isNaN(n) && n > highestBatchNum) {
                    highestBatchNum = n;
                }
            }
        });

        const nextBatchNum = highestBatchNum + 1;
        const formattedBatchNum = nextBatchNum < 10 ? `0${nextBatchNum}` : `${nextBatchNum}`;

        const currentName = form.getValues('name');
        if (!currentName || currentName.includes('Batch')) {
            form.setValue('name', `${parent.course_name} Batch ${formattedBatchNum}`, { shouldValidate: true });
        }

        if (parent.course_duration && !form.getValues('duration')) {
            form.setValue('duration', parent.course_duration, { shouldValidate: true });
        }
        if (parent.course_fee && Number(form.getValues('fee')) === 0) {
            form.setValue('fee', Number(parent.course_fee) || 0, { shouldValidate: true });
        }
        if (parent.registration_fee && Number(form.getValues('registration_fee')) === 0) {
            form.setValue('registration_fee', Number(parent.registration_fee) || 0, { shouldValidate: true });
        }
        if (parent.course_img && !form.getValues('course_img')) {
            form.setValue('course_img', parent.course_img);
        }
        if (parent.mini_description && !form.getValues('mini_description')) {
            form.setValue('mini_description', parent.mini_description);
        }
        if (parent.course_description && !form.getValues('description')) {
            form.setValue('description', parent.course_description);
        }

        // Inherit criteria from the latest batch of this parent if available
        const lastBatch = batchesForParent[batchesForParent.length - 1];
        if (lastBatch?.criteria_list && !form.getValues('criteria_list')) {
            form.setValue('criteria_list', lastBatch.criteria_list);
        }
    };

    const createMutation = useMutation({
        mutationFn: createBatch,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['allBatches'] });
            toast({ title: 'Success', description: 'Batch created successfully.' });
            router.push(`/admin/manage/batches?courseId=${variables.parent_course_id}`);
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    });

    const onSubmit = (data: BatchFormValues) => {
        const parent = parentCourses?.find(pc => String(pc.id) === data.parent_course_id);
        const payload = {
            ...data,
            instructor_id: parent?.instructor_id || 'Dr. H.M.D.K. FONSEKA',
        };
        createMutation.mutate(payload as any);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="-ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div>
                    <h1 className="text-3xl font-headline font-semibold">Create New Batch</h1>
                    <p className="text-muted-foreground">Add a new batch to a course.</p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Batch Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parent_course_id">Parent Course*</Label>
                                <Controller
                                    name="parent_course_id"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value}
                                            onValueChange={(val) => handleParentCourseChange(val)}
                                            defaultValue={field.value ? String(field.value) : undefined}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={isLoadingParentCourses}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingParentCourses ? "Loading..." : "Select Parent Course"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parentCourses?.map(pc => (
                                                    <SelectItem key={pc.id} value={String(pc.id)}>{pc.course_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {form.formState.errors.parent_course_id && <p className="text-sm text-red-500">{form.formState.errors.parent_course_id.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Batch Name*</Label>
                                <Input id="name" {...form.register('name')} placeholder="e.g. Certificate Course In Pharmacy Practice Batch 22" />
                                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="courseCode" className="flex items-center gap-2">
                                        Batch Code*
                                        {!isCodeManual && (
                                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                                                <Sparkles className="h-3 w-3" /> Auto-generated
                                            </span>
                                        )}
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            if (isCodeManual) {
                                                setIsCodeManual(false);
                                                form.setValue('courseCode', nextBatchCode, { shouldValidate: true });
                                            } else {
                                                setIsCodeManual(true);
                                            }
                                        }}
                                    >
                                        {isCodeManual ? (
                                            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Reset to Auto</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><Edit3 className="h-3 w-3" /> Edit</span>
                                        )}
                                    </Button>
                                </div>
                                <Input
                                    id="courseCode"
                                    {...form.register('courseCode')}
                                    readOnly={!isCodeManual}
                                    className={!isCodeManual ? "bg-muted font-mono font-semibold text-primary cursor-default" : "font-mono"}
                                    placeholder="e.g. CPCC35"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {!isCodeManual
                                        ? "Automatically generated based on the latest batch code sequence."
                                        : "Editing manually. Click 'Reset to Auto' to restore the generated code."}
                                </p>
                                {form.formState.errors.courseCode && <p className="text-sm text-red-500">{form.formState.errors.courseCode.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration*</Label>
                                <Input id="duration" {...form.register('duration')} placeholder="e.g. 6 Months" />
                                {form.formState.errors.duration && <p className="text-sm text-red-500">{form.formState.errors.duration.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fee">Batch Fee (LKR)*</Label>
                                <Input id="fee" type="number" {...form.register('fee')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="registration_fee">Registration Fee (LKR)*</Label>
                                <Input id="registration_fee" type="number" {...form.register('registration_fee')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="enroll_key">Enrollment Key</Label>
                                <Input id="enroll_key" {...form.register('enroll_key')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="course_img">Course Image Filename</Label>
                                <Input id="course_img" {...form.register('course_img')} placeholder="e.g., image.jpg" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_link">WhatsApp Group Link</Label>
                                <Input id="whatsapp_link" {...form.register('whatsapp_link')} placeholder="https://chat.whatsapp.com/..." />
                            </div>
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
                                                    )
                                                })}
                                            </div>
                                        )
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
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={createMutation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Batch
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
