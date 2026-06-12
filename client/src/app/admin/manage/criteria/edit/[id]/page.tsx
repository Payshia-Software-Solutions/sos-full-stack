"use client";

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCriteriaList, updateCriteriaList } from '@/lib/actions/criteria';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from 'react';

const criteriaFormSchema = z.object({
    list_name: z.string().min(1, 'Criteria name is required'),
    moq: z.coerce.number().min(0, 'MOQ must be 0 or greater'),
    is_active: z.coerce.number().min(0).max(1),
});

export default function EditCriteriaPage() {
    const router = useRouter();
    const params = useParams();
    const criteriaId = params.id as string;
    const queryClient = useQueryClient();

    const { data: criteria, isLoading, isError, error } = useQuery({
        queryKey: ['criteria', criteriaId],
        queryFn: () => getCriteriaList(criteriaId),
        enabled: !!criteriaId,
    });

    const form = useForm<z.infer<typeof criteriaFormSchema>>({
        resolver: zodResolver(criteriaFormSchema),
        defaultValues: {
            list_name: '',
            moq: 0,
            is_active: 1,
        },
    });

    useEffect(() => {
        if (criteria) {
            form.reset({
                list_name: criteria.list_name,
                moq: criteria.moq,
                is_active: criteria.is_active,
            });
        }
    }, [criteria, form]);

    const updateMutation = useMutation({
        mutationFn: (data: z.infer<typeof criteriaFormSchema>) => updateCriteriaList(criteriaId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['criteriaLists'] });
            queryClient.invalidateQueries({ queryKey: ['criteria', criteriaId] });
            toast({
                title: "Success",
                description: "Criteria updated successfully",
            });
            router.push('/admin/manage/criteria');
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update criteria",
                variant: "destructive",
            });
        }
    });

    const onSubmit = (values: z.infer<typeof criteriaFormSchema>) => {
        updateMutation.mutate(values);
    };

    if (isLoading) return <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (isError) return <div className="text-red-500 text-center p-4">Error loading criteria: {(error as Error).message}</div>;

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/manage/criteria">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Edit Criteria: {criteria?.list_name}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Criteria Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="list_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Criteria Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Medi Mind" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The name of the criteria as it appears in reports and setups.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="moq"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Required Value (MOQ)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Minimum required value to pass this criteria.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value !== undefined ? field.value.toString() : '1'}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Active</SelectItem>
                                                <SelectItem value="0">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Link href="/admin/manage/criteria">
                                    <Button variant="outline" type="button">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Criteria
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
