
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, PlusCircle, Search, Package, ThumbsUp, Truck, Download, FileSpreadsheet, Eye, Trash2, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getStudentsByCourseCode, createDeliveryOrderForStudent, getDeliveryOrdersForStudent, updateDeliveryOrderStatus, getDeliveryOrdersByCourse, updateDeliveryOrder } from '@/lib/actions/delivery';
import { getStudentBalance } from '@/lib/actions/users';
import { getCourses, getDeliverySettingsForCourse } from '@/lib/actions/courses';
import type { StudentInBatch, DeliveryOrder, Course, DeliverySetting } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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

const ITEMS_PER_PAGE = 25;
const LOCAL_STORAGE_KEY = 'deliveryOrderDefaults';

// --- Sub-components for actions ---

const CreateOrderDialog = ({ student, selectedBatch }: { student: StudentInBatch, selectedBatch: Course }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDeliverySettingId, setSelectedDeliverySettingId] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [currentStatus, setCurrentStatus] = useState('1'); // Default to '1' (Processing)
    const [rememberSettings, setRememberSettings] = useState(false);
    const queryClient = useQueryClient();

    // Load saved settings from localStorage when the dialog is opened
    useEffect(() => {
        if (isDialogOpen) {
            try {
                const savedDefaults = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedDefaults) {
                    const { deliverySettingId, status, remember, tracking } = JSON.parse(savedDefaults);
                    if (remember) {
                        setSelectedDeliverySettingId(deliverySettingId || '');
                        setCurrentStatus(status || '1');
                        setTrackingNumber(tracking || '');
                        setRememberSettings(true);
                    }
                }
            } catch (error) {
                console.error("Failed to load saved settings:", error);
            }
        }
    }, [isDialogOpen]);

    const { data: deliverySettings, isLoading: isLoadingSettings } = useQuery<DeliverySetting[]>({
        queryKey: ['deliverySettings', selectedBatch.courseCode],
        queryFn: () => getDeliverySettingsForCourse(selectedBatch.courseCode),
        enabled: isDialogOpen, // Only fetch when the dialog is open
    });
    
    // Effect to default to the first delivery setting if available and none is selected
    useEffect(() => {
        if (!isLoadingSettings && deliverySettings && deliverySettings.length > 0 && !selectedDeliverySettingId) {
            const savedDefaults = localStorage.getItem(LOCAL_STORAGE_KEY);
            if(savedDefaults) {
                const { deliverySettingId, remember } = JSON.parse(savedDefaults);
                if(remember && deliverySettingId) {
                     setSelectedDeliverySettingId(deliverySettingId);
                     return;
                }
            }
            setSelectedDeliverySettingId(deliverySettings[0].id);
        }
    }, [isLoadingSettings, deliverySettings, selectedDeliverySettingId]);


    const createOrderMutation = useMutation({
        mutationFn: createDeliveryOrderForStudent,
        onSuccess: () => {
            toast({
                title: 'Order Created!',
                description: `A new delivery order for ${student.full_name} has been created.`,
            });
            queryClient.invalidateQueries({ queryKey: ['studentDeliveryOrders', student.username] });

            // Save settings if checked
            if (rememberSettings) {
                try {
                    const defaults = {
                        deliverySettingId: selectedDeliverySettingId,
                        status: currentStatus,
                        tracking: trackingNumber,
                        remember: true,
                    };
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaults));
                } catch (error) {
                    console.error("Failed to save settings:", error);
                }
            } else {
                // Clear saved settings if unchecked
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }

            // Reset for next entry only if not remembering settings
            if (!rememberSettings) {
                setSelectedDeliverySettingId(deliverySettings?.[0]?.id || '');
                setCurrentStatus('1');
                setTrackingNumber('');
            }
            setDeliveryNotes(''); // Always clear notes
            setIsDialogOpen(false);
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Failed to create order',
                description: error.message,
            });
        },
    });

    const handleCreateOrder = () => {
        const selectedSetting = deliverySettings?.find(s => s.id === selectedDeliverySettingId);
        if (!selectedSetting) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a delivery pack.' });
            return;
        }

        createOrderMutation.mutate({
            studentNumber: student.username,
            courseCode: selectedBatch.courseCode,
            deliverySetting: selectedSetting,
            notes: deliveryNotes,
            address: `${student.address_line_1 || ''}, ${student.city || ''}`,
            fullName: student.full_name,
            phone: student.telephone_1,
            currentStatus: currentStatus,
            trackingNumber: trackingNumber || 'PENDING',
        });
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Order
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New Delivery for {student.full_name}</DialogTitle>
                    <DialogDescription>
                        Select a delivery pack and confirm the details for this order.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="delivery-pack">Delivery Pack</Label>
                        {isLoadingSettings ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select value={selectedDeliverySettingId} onValueChange={setSelectedDeliverySettingId}>
                                <SelectTrigger id="delivery-pack">
                                    <SelectValue placeholder="Select a delivery pack..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {deliverySettings?.map(setting => (
                                        <SelectItem key={setting.id} value={setting.id}>
                                            {setting.delivery_title} (LKR {setting.value})
                                        </SelectItem>
                                    ))}
                                    {deliverySettings?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No settings found.</p>}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="tracking-number">Tracking Number (Optional)</Label>
                        <Input id="tracking-number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number..."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="order-status">Status</Label>
                        <Select value={currentStatus} onValueChange={setCurrentStatus}>
                            <SelectTrigger id="order-status">
                                <SelectValue placeholder="Set initial status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Processing</SelectItem>
                                <SelectItem value="2">Packed</SelectItem>
                                <SelectItem value="3">Dispatched</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Student Address</Label>
                        <p className="text-sm p-3 rounded-md bg-muted text-muted-foreground">
                            {`${student.address_line_1 || 'N/A'}, ${student.address_line_2 || ''}, ${student.city || ''}`}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="delivery-notes">Notes (Optional)</Label>
                        <Textarea id="delivery-notes" value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="Special instructions..."/>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox 
                            id="remember-settings" 
                            checked={rememberSettings}
                            onCheckedChange={(checked) => setRememberSettings(Boolean(checked))}
                        />
                        <Label htmlFor="remember-settings" className="text-sm font-normal text-muted-foreground">
                            Remember my selections for next entry.
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleCreateOrder} disabled={createOrderMutation.isPending || isLoadingSettings}>
                        {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Maps numeric status codes to text and color
const getStatusInfo = (status: string | number | null | undefined): { text: string; variant: "default" | "secondary" | "destructive" } => {
    switch (String(status)) {
        case '1': return { text: 'Processing', variant: 'secondary' };
        case '2': return { text: 'Packed', variant: 'default' };
        case '3': return { text: 'Dispatched', variant: 'default' };
        case '4': return { text: 'Removed', variant: 'destructive' };
        default: return { text: 'Unknown', variant: 'secondary' };
    }
};

const OrderStatusCell = ({ order, selectedBatch }: { order: DeliveryOrder, selectedBatch: Course }) => {
    if (order) {
        const currentStatusInfo = getStatusInfo(order.current_status);
        return (
            <div className="flex flex-col items-start gap-1">
                <Badge variant={currentStatusInfo.variant} className={cn(currentStatusInfo.variant === 'default' && 'bg-blue-500 text-white')}>
                    {currentStatusInfo.text}
                </Badge>
                <span className="text-xs text-muted-foreground">{order.tracking_number}</span>
            </div>
        );
    }
    
    return null;
};


const ReceivedStatusCell = ({ order, selectedBatch }: { order: DeliveryOrder, selectedBatch: Course }) => {
    const queryClient = useQueryClient();
    
    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string, status: "Received" | "Not Received" }) => updateDeliveryOrderStatus(orderId, status),
        onSuccess: (data, variables) => {
            toast({ title: 'Status Updated', description: `Order for ${order.full_name} marked as ${variables.status}.` });
            queryClient.invalidateQueries({ queryKey: ['deliveryOrdersByCourse', selectedBatch.courseCode] });
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        }
    });

    if (!order) {
        return <span className="text-xs text-muted-foreground">--</span>;
    }

    if (String(order.current_status) !== '3') {
        return <span className="text-xs text-muted-foreground">--</span>;
    }
    
    if (order.order_recived_status !== "Not Received") {
        return (
            <div className="flex flex-col items-start gap-2">
                <Badge variant="default" className="bg-green-500 text-white">
                    {order.order_recived_status}
                </Badge>
                {order.received_date && (
                    <span className="text-xs text-muted-foreground">{format(new Date(order.received_date), 'yyyy-MM-dd')}</span>
                )}
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="xs" variant="ghost" className="h-auto p-1 text-xs text-muted-foreground" disabled={updateStatusMutation.isPending}>
                            Revert
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Revert Status?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to change the status for {order.full_name} back to "Not Received"?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'Not Received' })}>
                                Confirm Revert
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return (
         <div className="flex flex-col items-start gap-2">
            <Badge variant="secondary">{order.order_recived_status || "Not yet received"}</Badge>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" disabled={updateStatusMutation.isPending}>
                        Mark as Received
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Reception</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark this order for {order.full_name} as "Received"? This action can be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'Received' })}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};


const OrderActionCell = ({ order, selectedBatch }: { order: DeliveryOrder, selectedBatch: Course }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Eye className="mr-2 h-4 w-4" /> Open
                </Button>
            </DialogTrigger>
            <OrderDetailsDialogContent order={order} selectedBatch={selectedBatch} onClose={() => setIsDialogOpen(false)} />
        </Dialog>
    );
};

const OrderDetailsDialogContent = ({ order, selectedBatch, onClose }: { order: DeliveryOrder, selectedBatch: Course, onClose: () => void }) => {
    const queryClient = useQueryClient();
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [codAmount, setCodAmount] = useState(order.cod_amount || order.value || '0.00');
    const [packageWeight, setPackageWeight] = useState(order.package_weight || '1.000');
    
    const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
        queryKey: ['studentBalance', order.index_number],
        queryFn: () => getStudentBalance(order.index_number!),
        enabled: !!order.index_number,
    });
    
    const updateOrderMutation = useMutation({
        mutationFn: (updatedData: any) => updateDeliveryOrder(order.id, { ...order, ...updatedData }),
        onSuccess: () => {
            toast({ title: 'Order Updated', description: 'Order details successfully updated.' });
            queryClient.invalidateQueries({ queryKey: ['deliveryOrdersByCourse', selectedBatch.courseCode] });
            onClose();
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        }
    });

    const handleUpdate = () => {
        updateOrderMutation.mutate({
            tracking_number: trackingNumber,
            cod_amount: codAmount,
            package_weight: packageWeight,
        });
    };

    const handleStatusUpdate = (newStatus: "1" | "2" | "3" | "4") => {
        updateOrderMutation.mutate({
            current_status: newStatus,
        });
    };

    const isReadOnly = String(order.current_status) === '3' || String(order.current_status) === '4';

    return (
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <div className="flex items-center gap-4">
                    <DialogTitle>Order Details</DialogTitle>
                    <Badge variant={getStatusInfo(order.current_status).variant}>
                        {getStatusInfo(order.current_status).text}
                    </Badge>
                </div>
                <DialogDescription>
                    Ref ID: {order.id}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Student ID</p>
                        <p className="font-semibold">{order.index_number}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Due Balance</p>
                        {isLoadingBalance ? <Skeleton className="h-5 w-20 mt-1" /> : (
                            <p className={cn("font-semibold", balanceData && balanceData.studentBalance > 0 ? "text-destructive" : "text-green-600")}>
                                LKR {balanceData?.studentBalance?.toLocaleString() || '0'}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <p className="font-semibold">{order.order_date ? format(new Date(order.order_date), 'yyyy-MM-dd HH:mm') : 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Packed Date</p>
                        <p className="font-semibold">{order.packed_date ? format(new Date(order.packed_date), 'yyyy-MM-dd HH:mm') : 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Delivered Date</p>
                        <p className="font-semibold">{order.send_date ? format(new Date(order.send_date), 'yyyy-MM-dd HH:mm') : 'Not Set'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                        <h4 className="font-semibold text-sm">Delivery Address</h4>
                        <p className="text-sm m-0">{order.full_name}</p>
                        <p className="text-sm m-0">{order.street_address}</p>
                        <p className="text-sm m-0">{order.city}, {order.district}</p>
                        <p className="text-sm m-0">{order.phone_1} {order.phone_2 ? `, ${order.phone_2}` : ''}</p>
                    </div>
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                        <h4 className="font-semibold text-sm">Order Item</h4>
                        <p className="text-sm">{order.delivery_title || 'N/A'}</p>
                        {String(order.current_status) !== '3' && String(order.current_status) !== '4' && (
                            <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('4')} disabled={updateOrderMutation.isPending}>
                                <Trash2 className="w-4 h-4 mr-2" /> Remove Order
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input 
                            id="trackingNumber" 
                            value={trackingNumber} 
                            onChange={e => setTrackingNumber(e.target.value)} 
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="codAmount">COD Amount</Label>
                        <Input 
                            id="codAmount" 
                            value={codAmount} 
                            onChange={e => setCodAmount(e.target.value)} 
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="packageWeight">Package Weight (KG)</Label>
                        <Input 
                            id="packageWeight" 
                            value={packageWeight} 
                            onChange={e => setPackageWeight(e.target.value)} 
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleUpdate} disabled={updateOrderMutation.isPending}>
                            {updateOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Details
                        </Button>
                    </div>
                )}
            </div>

            <DialogFooter className="sm:justify-between items-center border-t pt-4">
                <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                <div className="flex gap-2">
                    {String(order.current_status) !== '1' && (
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                if (!order.tracking_number) {
                                    toast({ title: 'Tracking Number Required', description: 'Please save a tracking number before printing the label.', variant: 'destructive' });
                                    return;
                                }
                                window.open(`/print/shipping-label/${order.id}`, '_blank');
                            }}
                        >
                            <Printer className="mr-2 h-4 w-4" /> Print Label
                        </Button>
                    )}
                    {String(order.current_status) === '1' && (
                        <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate('2')} disabled={updateOrderMutation.isPending}>
                            <Package className="mr-2 h-4 w-4" /> Mark as Packed
                        </Button>
                    )}
                    {String(order.current_status) === '2' && (
                        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusUpdate('3')} disabled={updateOrderMutation.isPending}>
                            <Truck className="mr-2 h-4 w-4" /> Mark as Dispatched
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </DialogContent>
    );
};


// --- Main Page Component ---
export default function OrdersTab() {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dispatchStatusFilter, setDispatchStatusFilter] = useState('all');
    const [receivedStatusFilter, setReceivedStatusFilter] = useState('all');
    const [ordersData, setOrdersData] = useState<Record<string, DeliveryOrder | null>>({});

    const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
        queryKey: ['allCourses'],
        queryFn: getCourses,
        staleTime: Infinity,
    });

    const selectedCourse = useMemo(() => {
        return courses?.find(c => c.id === selectedCourseId);
    }, [courses, selectedCourseId]);

    const { data: courseOrders, isLoading: isLoadingOrders, isError, error } = useQuery<DeliveryOrder[]>({
        queryKey: ['deliveryOrdersByCourse', selectedCourse?.courseCode],
        queryFn: () => getDeliveryOrdersByCourse(selectedCourse!.courseCode),
        enabled: !!selectedCourse?.courseCode,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCourseId, searchTerm, dispatchStatusFilter, receivedStatusFilter]);
    
    const { filteredOrders, counts } = useMemo(() => {
        if (!courseOrders) return { filteredOrders: [], counts: { processing: 0, packed: 0, dispatched: 0, received: 0, notReceived: 0, noOrder: 0 }};

        let processing = 0, packed = 0, dispatched = 0, received = 0, notReceived = 0;

        courseOrders.forEach(order => {
            if (String(order.current_status) === '1') processing++;
            if (String(order.current_status) === '2') packed++;
            if (String(order.current_status) === '3') dispatched++;
            if (order.order_recived_status === 'Received') received++;
            else notReceived++;
        });

        const filterLogic = (order: DeliveryOrder) => {
            const lowercasedFilter = searchTerm.toLowerCase();
            
            const matchesSearch = 
                (order.index_number?.toLowerCase().includes(lowercasedFilter)) ||
                (order.full_name?.toLowerCase().includes(lowercasedFilter)) ||
                (order.tracking_number?.toLowerCase().includes(lowercasedFilter)) ||
                (order.phone_1?.includes(lowercasedFilter));

            const matchesDispatchStatus = 
                dispatchStatusFilter === 'all' || 
                (dispatchStatusFilter === 'processing' && String(order.current_status) === '1') ||
                (dispatchStatusFilter === 'packed' && String(order.current_status) === '2') ||
                (dispatchStatusFilter === 'dispatched' && String(order.current_status) === '3');

            const matchesReceivedStatus =
                receivedStatusFilter === 'all' ||
                (receivedStatusFilter === 'received' && order.order_recived_status === 'Received') ||
                (receivedStatusFilter === 'not_received' && order.order_recived_status !== 'Received');

            return matchesSearch && matchesDispatchStatus && matchesReceivedStatus;
        };

        const filtered = courseOrders.filter(filterLogic);

        return {
            filteredOrders: filtered,
            counts: { processing, packed, dispatched, received, notReceived, noOrder: 0 }
        };
    }, [courseOrders, searchTerm, dispatchStatusFilter, receivedStatusFilter]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const currentOrders = useMemo(() => {
        return filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    const handleExportCSV = () => {
        if (!filteredOrders || filteredOrders.length === 0) {
            toast({ variant: 'destructive', title: 'No Data', description: 'No orders found to export.' });
            return;
        }

        const headers = [
            "Order ID", "Delivery Title", "Student ID", "Full Name", "Phone 1", "Phone 2", "Email", 
            "Street Address", "City", "District", "Order Date", "Packed Date", "Dispatched Date", 
            "Received Date", "Dispatch Status", "Received Status", "Payment Method", "Order Value", 
            "COD Amount", "Package Weight", "Tracking Number", "Delivery Partner"
        ];

        const csvRows = [headers.join(",")];

        const getDispatchStatusText = (status: string | number) => {
            if (String(status) === '1') return 'Processing';
            if (String(status) === '2') return 'Packed';
            if (String(status) === '3') return 'Dispatched';
            return 'Unknown';
        };

        filteredOrders.forEach(order => {
            const row = [
                `"${order.id || ''}"`,
                `"${order.delivery_title || ''}"`,
                `"${order.index_number || ''}"`,
                `"${order.full_name || ''}"`,
                `"${order.phone_1 || ''}"`,
                `"${order.phone_2 || ''}"`,
                `"${order.email || ''}"`,
                `"${order.street_address || ''}"`,
                `"${order.city || ''}"`,
                `"${order.district || ''}"`,
                `"${order.order_date ? format(new Date(order.order_date), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
                `"${order.packed_date ? format(new Date(order.packed_date), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
                `"${order.send_date ? format(new Date(order.send_date), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
                `"${order.received_date ? format(new Date(order.received_date), 'yyyy-MM-dd HH:mm:ss') : ''}"`,
                `"${getDispatchStatusText(order.current_status)}"`,
                `"${order.order_recived_status || 'Not Received'}"`,
                `"${order.payment_method || ''}"`,
                `"${order.value || '0.00'}"`,
                `"${order.cod_amount || '0.00'}"`,
                `"${order.package_weight || '0.000'}"`,
                `"${order.tracking_number || ''}"`,
                `"${order.delivery_partner || ''}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `delivery_orders_${selectedCourse?.courseCode}_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Select Batch</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={isLoadingCourses}>
                        <SelectTrigger className="w-full md:w-1/2">
                            <SelectValue placeholder={isLoadingCourses ? "Loading batches..." : "Choose a batch to load students..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {courses?.map(course => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.name} ({course.courseCode})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedCourse && (
                <>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle>Batch Overview</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleExportCSV} className="hidden sm:flex">
                            <Download className="mr-2 h-4 w-4" /> Export to CSV
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                        <Card><CardHeader className="pb-2"><CardDescription>Total Orders</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold flex items-center gap-2"><FileSpreadsheet className="h-6 w-6 text-muted-foreground"/> {courseOrders ? courseOrders.length : 0}</p></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardDescription>Processing</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-muted-foreground"/> {counts.processing}</p></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardDescription>Packed</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-muted-foreground"/> {counts.packed}</p></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardDescription>Dispatched</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-muted-foreground"/> {counts.dispatched}</p></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardDescription>Received</CardDescription></CardHeader><CardContent><p className="text-2xl font-bold flex items-center gap-2"><ThumbsUp className="h-6 w-6 text-muted-foreground"/> {counts.received}</p></CardContent></Card>
                    </CardContent>
                 </Card>

                 <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <CardTitle>Delivery Orders for {selectedCourse.name}</CardTitle>
                                <CardDescription>
                                     {isLoadingOrders ? "Loading..." : `Showing ${currentOrders.length} of ${filteredOrders.length} orders.`}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-auto flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search order or student ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                     <Select value={dispatchStatusFilter} onValueChange={setDispatchStatusFilter}>
                                        <SelectTrigger className="w-[140px] md:w-[180px]">
                                            <SelectValue placeholder="Dispatch Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Dispatch...</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="packed">Packed</SelectItem>
                                            <SelectItem value="dispatched">Dispatched</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={receivedStatusFilter} onValueChange={setReceivedStatusFilter}>
                                        <SelectTrigger><SelectValue placeholder="Received Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Received...</SelectItem>
                                            <SelectItem value="received">Received</SelectItem>
                                            <SelectItem value="not_received">Not Received</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingOrders && !courseOrders ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : (
                        <>
                        {isError && (
                             <Card className="border-destructive">
                                <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Error Loading Orders</CardTitle></CardHeader>
                                <CardContent><p>{error?.message}</p></CardContent>
                            </Card>
                        )}
                        {!isLoadingOrders && !isError && (
                            <>
                                {/* Desktop Table */}
                                <div className="relative w-full overflow-auto border rounded-lg hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student ID</TableHead>
                                                <TableHead>Full Name</TableHead>
                                                <TableHead>Dispatch Status</TableHead>
                                                <TableHead>Received Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentOrders.length > 0 ? currentOrders.map(order => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">{order.index_number}</TableCell>
                                                    <TableCell>{order.full_name}</TableCell>
                                                    <TableCell>
                                                        <OrderStatusCell 
                                                            order={order} 
                                                            selectedBatch={selectedCourse!} 
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <ReceivedStatusCell
                                                            order={order}
                                                            selectedBatch={selectedCourse!}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <OrderActionCell order={order} selectedBatch={selectedCourse!} />
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center h-24">
                                                        No orders found matching your search.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {/* Mobile List */}
                                <div className="md:hidden space-y-4">
                                    {currentOrders.length > 0 ? currentOrders.map(order => (
                                        <div key={order.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold">{order.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{order.index_number}</p>
                                                </div>
                                                <OrderActionCell order={order} selectedBatch={selectedCourse!} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Dispatch Status</p>
                                                    <OrderStatusCell 
                                                        order={order} 
                                                        selectedBatch={selectedCourse!} 
                                                    />
                                                </div>
                                                <div>
                                                     <p className="text-xs font-semibold text-muted-foreground mb-1">Received Status</p>
                                                    <ReceivedStatusCell
                                                        order={order}
                                                        selectedBatch={selectedCourse!}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center h-24 flex items-center justify-center">
                                            <p>No orders found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        </>
                        )}
                    </CardContent>
                    {totalPages > 1 && (
                        <CardFooter className="flex items-center justify-center space-x-2 pt-6">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
                        </CardFooter>
                    )}
                 </Card>
                </>
            )}
        </div>
    );
}
