"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Package, PlusCircle, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
} from "@/components/ui/alert-dialog"

import { getDeliverySettingsForCourse, createDeliverySetting, updateDeliverySetting, deleteDeliverySetting } from '@/lib/actions/delivery';
import { getCourses } from '@/lib/actions/courses';
import type { DeliverySetting, Course } from '@/lib/types';

export default function DeliverySettingsTab() {
    const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
    const queryClient = useQueryClient();

    const { data: allCourses, isLoading: isLoadingCourses } = useQuery<Course[]>({
        queryKey: ['allCourses'],
        queryFn: getCourses,
        staleTime: Infinity,
    });

    const { data: settings, isLoading: isLoadingSettings } = useQuery<DeliverySetting[]>({
        queryKey: ['deliverySettings', selectedCourseCode],
        queryFn: () => getDeliverySettingsForCourse(selectedCourseCode),
        enabled: !!selectedCourseCode,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState<DeliverySetting | null>(null);
    const [formData, setFormData] = useState({
        delivery_title: '',
        value: '',
        icon: 'Package',
        is_active: true,
    });

    const resetForm = () => {
        setFormData({
            delivery_title: '',
            value: '',
            icon: 'Package',
            is_active: true,
        });
        setEditingSetting(null);
    };

    const handleOpenEdit = (setting: DeliverySetting) => {
        setEditingSetting(setting);
        setFormData({
            delivery_title: setting.delivery_title,
            value: setting.value,
            icon: setting.icon || 'Package',
            is_active: setting.is_active === '1',
        });
        setIsDialogOpen(true);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const createMutation = useMutation({
        mutationFn: createDeliverySetting,
        onSuccess: () => {
            toast({ title: 'Success', description: 'Delivery package created successfully.' });
            queryClient.invalidateQueries({ queryKey: ['deliverySettings', selectedCourseCode] });
            setIsDialogOpen(false);
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<DeliverySetting> }) => updateDeliverySetting(id, data),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Delivery package updated successfully.' });
            queryClient.invalidateQueries({ queryKey: ['deliverySettings', selectedCourseCode] });
            setIsDialogOpen(false);
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDeliverySetting,
        onSuccess: () => {
            toast({ title: 'Success', description: 'Delivery package deleted.' });
            queryClient.invalidateQueries({ queryKey: ['deliverySettings', selectedCourseCode] });
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseCode) return;

        const payload = {
            course_id: selectedCourseCode, // Using course code for now as course_id
            delivery_title: formData.delivery_title,
            value: formData.value,
            icon: formData.icon,
            is_active: formData.is_active ? '1' : '0',
        };

        if (editingSetting) {
            updateMutation.mutate({ id: editingSetting.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="w-full md:w-72">
                    <Label htmlFor="course-select" className="mb-2 block">Select Course</Label>
                    <Select value={selectedCourseCode} onValueChange={setSelectedCourseCode}>
                        <SelectTrigger id="course-select">
                            <SelectValue placeholder="Choose a course to view packages..." />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingCourses ? (
                                <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                            ) : (
                                allCourses?.map(course => (
                                    <SelectItem key={course.id} value={course.courseCode}>
                                        {course.name} ({course.courseCode})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                
                {selectedCourseCode && (
                     <Dialog open={isDialogOpen} onOpenChange={(open) => {
                         setIsDialogOpen(open);
                         if(!open) resetForm();
                     }}>
                        <DialogTrigger asChild>
                            <Button onClick={handleOpenCreate}>
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Package
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingSetting ? 'Edit' : 'Create'} Delivery Package</DialogTitle>
                                    <DialogDescription>Setup a delivery option for this course.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title (e.g., Full Study Material)</Label>
                                        <Input id="title" required value={formData.delivery_title} onChange={(e) => setFormData({...formData, delivery_title: e.target.value})} placeholder="Enter title" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Price / Value (LKR)</Label>
                                        <Input id="value" type="number" required value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} placeholder="e.g. 3000" />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch id="active" checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} />
                                        <Label htmlFor="active">Active (Available for students)</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {selectedCourseCode ? (
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Delivery Packages</CardTitle>
                        <CardDescription>Manage the delivery options available for students to order.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingSettings ? (
                             <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : settings && settings.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Price (LKR)</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {settings.map(setting => (
                                            <TableRow key={setting.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-muted-foreground" />
                                                        {setting.delivery_title}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{parseFloat(setting.value).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {setting.is_active === '1' ? (
                                                        <Badge className="bg-green-500">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(setting)}>
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Package?</AlertDialogTitle>
                                                                    <AlertDialogDescription>This will permanently remove the delivery package option. Existing orders will not be affected.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteMutation.mutate(setting.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No delivery packages found for this course.</p>
                                <Button variant="link" onClick={handleOpenCreate}>Create one now</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-md border border-dashed">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium text-foreground">Select a course</p>
                    <p>Choose a course from the dropdown above to view and manage its delivery packages.</p>
                </div>
            )}
        </div>
    );
}
