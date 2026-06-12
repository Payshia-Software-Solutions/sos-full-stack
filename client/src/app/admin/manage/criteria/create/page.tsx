"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCriteriaList } from '@/lib/actions/criteria';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const criteriaFormSchema = z.object({
    list_name: z.string().min(1, 'Criteria name is required'),
    moq: z.coerce.number().min(0, 'MOQ must be 0 or greater'),
    is_active: z.coerce.number().min(0).max(1),
});

export default function CreateCriteriaPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof criteriaFormSchema>>({
        resolver: zodResolver(criteriaFormSchema),
        defaultValues: {
            list_name: '',
            moq: 0,
            is_active: 1,
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: z.infer<typeof criteriaFormSchema>) => createCriteriaList(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['criteriaLists'] });
            toast({
                title: "Success",
                description: "Criteria created successfully",
            });
            router.push('/admin/manage/criteria');
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create criteria",
                variant: "destructive",
            });
        }
    });

    const onSubmit = (values: z.infer<typeof criteriaFormSchema>) => {
        createMutation.mutate(values);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/manage/criteria">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Create New Criteria</h1>
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
                                        <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
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
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Criteria
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
