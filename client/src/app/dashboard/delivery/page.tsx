"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentEnrollments, getStudentDetailsByUsername } from '@/lib/actions/users';
import { getCourses, getDeliverySettingsForCourse } from '@/lib/actions/courses';
import { getDeliveryOrdersForStudent, createDeliveryOrderForStudent } from '@/lib/actions/delivery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/hooks/use-toast';
import { Truck, Package, PackageCheck, Loader2, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DeliveryPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    
    const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
    const [selectedSettingId, setSelectedSettingId] = useState<string>('');
    
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [phone1, setPhone1] = useState('');
    const [phone2, setPhone2] = useState('');
    const [notes, setNotes] = useState('');

    const { data: studentDetails } = useQuery({
        queryKey: ['studentDetails', user?.username],
        queryFn: () => getStudentDetailsByUsername(user!.username!),
        enabled: !!user?.username,
    });

    useEffect(() => {
        if (studentDetails) {
            setFullName(studentDetails.full_name || '');
            setAddress(`${studentDetails.address_line_1 || ''}, ${studentDetails.city || ''}`);
            setPhone1(studentDetails.telephone_1 || '');
            setPhone2(studentDetails.telephone_2 || '');
        }
    }, [studentDetails]);



    const { data: courses } = useQuery({
        queryKey: ['allCourses'],
        queryFn: getCourses,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!selectedCourseCode) {
            const stored = localStorage.getItem('selected_course');
            if (stored) {
                setSelectedCourseCode(stored);
            }
        }
    }, [selectedCourseCode]);

    const { data: deliverySettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['deliverySettings', selectedCourseCode],
        queryFn: () => getDeliverySettingsForCourse(selectedCourseCode),
        enabled: !!selectedCourseCode,
    });

    const { data: myOrders, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['studentDeliveryOrders', user?.username],
        queryFn: () => getDeliveryOrdersForStudent(user!.username!),
        enabled: !!user?.username,
    });

    const createOrderMutation = useMutation({
        mutationFn: createDeliveryOrderForStudent,
        onSuccess: () => {
            toast({ title: 'Order Placed Successfully!', description: 'Your delivery request has been submitted.' });
            queryClient.invalidateQueries({ queryKey: ['studentDeliveryOrders', user?.username] });
            setSelectedSettingId('');
            setNotes('');
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Failed to place order', description: error.message });
        },
    });

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCourseCode || !selectedSettingId) {
            toast({ variant: 'destructive', title: 'Missing Info', description: 'Please select a course and a delivery package.' });
            return;
        }

        const selectedSetting = deliverySettings?.find(s => s.id === selectedSettingId);
        if (!selectedSetting) return;

        const hasExistingOrder = myOrders?.some(order => 
            order.course_code === selectedCourseCode && 
            String(order.delivery_id) === String(selectedSettingId)
        );

        if (hasExistingOrder) {
            toast({ variant: 'destructive', title: 'Already Ordered', description: 'You have already placed an order for this package in this course.' });
            return;
        }

        createOrderMutation.mutate({
            studentNumber: user?.username,
            courseCode: selectedCourseCode,
            deliverySetting: selectedSetting,
            notes,
            address,
            fullName,
            phone: phone1,
            currentStatus: '1',
            trackingNumber: 'PENDING'
        });
    };

    const getStatusBadge = (status: string | null | undefined, receivedStatus: string | null | undefined) => {
        if (receivedStatus === 'Received') {
            return <Badge className="bg-green-500">Delivered</Badge>;
        }
        switch (status) {
            case '1': return <Badge variant="secondary">Processing</Badge>;
            case '2': return <Badge variant="default">Packed</Badge>;
            case '3': return <Badge variant="default" className="bg-blue-500">Dispatched</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-headline font-semibold flex items-center gap-3">
                    <Truck className="h-8 w-8 text-primary" /> Delivery Orders
                </h1>
                <p className="text-muted-foreground mt-2">Manage your package delivery requests and track their status.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-2xl border-primary/20 relative overflow-hidden h-fit group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/20 border-b relative z-10">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Package className="h-6 w-6 text-primary" /> Request a Delivery
                        </CardTitle>
                        <CardDescription>Select your options below to get your materials delivered straight to your door.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 relative z-10">
                        <form onSubmit={handleCreateOrder} className="space-y-6">
                            <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">1</span> 
                                    Course
                                </Label>
                                <div className="h-12 flex items-center px-3 border border-border/50 bg-muted/50 rounded-md text-base font-medium">
                                    {courses?.find((c: any) => c.courseCode === selectedCourseCode)?.name || selectedCourseCode || "Loading..."}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold flex items-center gap-2 mb-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">2</span> 
                                    Select Delivery Package
                                </Label>
                                {isLoadingSettings ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Skeleton className="h-28 w-full rounded-xl" />
                                        <Skeleton className="h-28 w-full rounded-xl" />
                                    </div>
                                ) : deliverySettings && deliverySettings.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {deliverySettings.map((setting) => {
                                            const isAlreadyOrdered = myOrders?.some(order => 
                                                order.course_code === selectedCourseCode && 
                                                String(order.delivery_id) === String(setting.id)
                                            );

                                            return (
                                            <div 
                                                key={setting.id}
                                                onClick={() => !isAlreadyOrdered && setSelectedSettingId(setting.id)}
                                                className={cn(
                                                    "relative p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden",
                                                    isAlreadyOrdered ? "opacity-60 cursor-not-allowed border-border bg-muted/30" : "cursor-pointer",
                                                    !isAlreadyOrdered && selectedSettingId === setting.id 
                                                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                                                        : (!isAlreadyOrdered ? "border-border/50 bg-card hover:border-primary/50 hover:bg-muted/30 hover:scale-[1.01]" : "")
                                                )}
                                            >
                                                {isAlreadyOrdered && (
                                                    <div className="absolute top-2 right-2">
                                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider opacity-80">Ordered</Badge>
                                                    </div>
                                                )}
                                                {selectedSettingId === setting.id && !isAlreadyOrdered && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col h-full gap-2">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <Package className="w-5 h-5" />
                                                        <span className="font-semibold leading-tight">{setting.delivery_title}</span>
                                                    </div>
                                                    <div className="mt-auto pt-2">
                                                        <span className="text-xl font-bold">LKR {parseFloat(setting.value).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/20 border border-dashed rounded-xl text-center">
                                        <Info className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                                        <p className="text-muted-foreground font-medium">No packages available</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 bg-muted/20 p-4 md:p-6 rounded-xl border border-border/50">
                                <Label className="text-base font-semibold flex items-center gap-2 mb-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">3</span> 
                                    Delivery Details
                                </Label>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></Label>
                                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11 bg-background" placeholder="Enter your full name" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Delivery Address <span className="text-destructive">*</span></Label>
                                    <Textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} className="bg-background resize-none" placeholder="Enter your complete delivery address" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Primary Phone <span className="text-destructive">*</span></Label>
                                        <Input value={phone1} onChange={(e) => setPhone1(e.target.value)} required className="h-11 bg-background" placeholder="07XXXXXXXX" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Secondary Phone (Optional)</Label>
                                        <Input value={phone2} onChange={(e) => setPhone2(e.target.value)} className="h-11 bg-background" placeholder="07XXXXXXXX" />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                size="lg"
                                className="w-full text-base font-semibold h-14 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" 
                                disabled={createOrderMutation.isPending || !selectedSettingId}
                            >
                                {createOrderMutation.isPending ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                ) : (
                                    <><Truck className="mr-2 h-5 w-5" /> Confirm & Place Order <ChevronRight className="ml-2 w-5 h-5 opacity-70" /></>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-primary" /> My Recent Orders
                    </h2>
                    
                    {isLoadingOrders ? (
                        <div className="space-y-4">
                            <Skeleton className="h-28 w-full rounded-xl" />
                            <Skeleton className="h-28 w-full rounded-xl" />
                        </div>
                    ) : myOrders && myOrders.length > 0 ? (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {myOrders.map(order => {
                                const courseInfo = courses?.find((c: any) => c.courseCode === order.course_code);
                                return (
                                    <Card key={order.id} className="shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{courseInfo?.name || order.course_code}</h3>
                                                    <p className="text-sm text-muted-foreground">{format(new Date(order.order_date), "MMM dd, yyyy 'at' hh:mm a")}</p>
                                                </div>
                                                {getStatusBadge(order.current_status, order.order_recived_status)}
                                            </div>
                                            <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground block text-xs">Tracking Number</span>
                                                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                                                        {order.tracking_number && order.tracking_number !== 'PENDING' ? order.tracking_number : 'Not assigned'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block text-xs">Cost</span>
                                                    <span className="font-semibold text-primary">LKR {order.cod_amount}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-muted/10 border-2 border-dashed rounded-2xl text-center mt-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Package className="w-8 h-8 text-primary/60" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">You haven't placed any delivery orders yet. Select a course and package on the left to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
