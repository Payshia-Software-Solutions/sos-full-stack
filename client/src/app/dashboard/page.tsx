
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/lib/actions/tickets";
import type { Ticket, StudentEnrollmentInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Ticket as TicketIcon, Clock, CheckCircle, PlusCircle, Award, Library, BookOpen, FileText, Gamepad2, AlertCircle, BookText, GraduationCap, Video, User } from "lucide-react";
import { UnreadBadge } from "@/components/dashboard/UnreadBadge";
import { CeylonPharmacyIcon, DPadIcon, HunterProIcon, LuckyWheelIcon, MediMindIcon, PharmaHunterIcon, PharmaReaderIcon, WinPharmaIcon, WordPalletIcon } from "@/components/icons/module-icons";
import { getStudentEnrollments } from "@/lib/actions/users";
import Image from "next/image";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

// --- Sub Components ---
const TicketStats = ({ tickets, isLoading }: { tickets: Ticket[], isLoading: boolean }) => {
    const stats = useMemo(() => {
        if (!tickets) return { open: 0, inProgress: 0, closed: 0, all: 0 };
        return {
            open: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
            inProgress: tickets.filter(t => t.status === 'In Progress').length,
            closed: tickets.filter(t => t.status === 'Closed').length,
            all: tickets.length
        };
    }, [tickets]);

    const statCards = [
        { title: "Open Tickets", value: stats.open, icon: <TicketIcon className="w-6 h-6 text-primary" /> },
        { title: "In Progress", value: stats.inProgress, icon: <Clock className="w-6 h-6 text-purple-500" /> },
        { title: "Closed Tickets", value: stats.closed, icon: <CheckCircle className="w-6 h-6 text-green-500" /> },
        { title: "All Tickets", value: stats.all, icon: <Library className="w-6 h-6 text-gray-500" /> },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {statCards.map((stat, index) => (
                <Card 
                    key={stat.title} 
                    className="shadow-lg hover:shadow-xl transition-shadow animate-in fade-in-50 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        {stat.icon}
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const QuickActionCard = ({ title, description, href, icon, colorClass, requiredCourses, selectedCourseCode, setDialogContent }: { 
    title: string; 
    description: string; 
    href: string; 
    icon: React.ReactElement; 
    colorClass: string; 
    requiredCourses?: string[];
    selectedCourseCode: string | null; 
    setDialogContent: (content: { title: string; description: string } | null) => void;
}) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        if (requiredCourses && (!selectedCourseCode || !requiredCourses.includes(selectedCourseCode))) {
            e.preventDefault();
            setDialogContent({
                title: "Course Requirement Not Met",
                description: `This game is only available for students enrolled in: ${requiredCourses.join(' or ')}.`,
            });
        } else {
            router.push(href);
        }
    };
    
    return (
        <a href={href} onClick={handleClick} className="group block cursor-pointer">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-200 h-full border-0">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClass}`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                </CardContent>
            </Card>
        </a>
    );
};


import { useToast } from "@/hooks/use-toast";
import { getDeliveryOrdersForStudent, updateDeliveryOrderStatus } from "@/lib/actions/delivery";
import type { DeliveryOrder } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { Package } from "lucide-react";

// --- Delivery Confirmation Component ---
const DeliveryConfirmationPrompt = ({ user, enrollments }: { user: any, enrollments: StudentEnrollmentInfo[] | undefined }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<DeliveryOrder | null>(null);

    const { data: deliveryOrders } = useQuery<DeliveryOrder[]>({
        queryKey: ['studentDeliveryOrders', user?.username],
        queryFn: () => getDeliveryOrdersForStudent(user!.username!),
        enabled: !!user?.username,
    });

    const dispatchedOrders = useMemo(() => {
        if (!deliveryOrders) return [];
        return deliveryOrders.filter(order => 
            String(order.current_status) === '3' && 
            order.order_recived_status !== 'Received'
        );
    }, [deliveryOrders]);

    useEffect(() => {
        if (dispatchedOrders.length > 0) {
            // Find the first order that hasn't been reminded today
            const orderToShow = dispatchedOrders.find(order => {
                const remindKey = `remindMeTomorrow_${order.id}`;
                const remindValue = localStorage.getItem(remindKey);
                
                // If order is dispatched, check if it's > 3 days old
                const isOlderThan3Days = () => {
                    if (!order.send_date) return false;
                    const sendDate = new Date(order.send_date);
                    const threeDaysAgo = new Date();
                    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                    return sendDate < threeDaysAgo;
                };

                if (isOlderThan3Days()) {
                    if (!remindValue) return true;
                    // Check if 24 hours have passed
                    const remindTime = new Date(remindValue).getTime();
                    const now = new Date().getTime();
                    if (now - remindTime > 24 * 60 * 60 * 1000) {
                        return true;
                    }
                }
                return false;
            });

            if (orderToShow) {
                setPendingOrder(orderToShow);
                setDialogOpen(true);
            }
        }
    }, [dispatchedOrders]);

    const handleRemindTomorrow = (e: React.MouseEvent) => {
        e.preventDefault();
        if (pendingOrder) {
            localStorage.setItem(`remindMeTomorrow_${pendingOrder.id}`, new Date().toISOString());
            setDialogOpen(false);
        }
    };

    const handleMarkAsReceived = async (orderId: string, e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        try {
            await updateDeliveryOrderStatus(orderId, 'Received');
            toast({
                title: "Success",
                description: "Package marked as received. Thank you!",
            });
            queryClient.invalidateQueries({ queryKey: ['studentDeliveryOrders', user?.username] });
            setDialogOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to update package status. Please try again.",
            });
        }
    };

    const getCourseImage = (courseCode?: string) => {
        if (!courseCode || !enrollments) return null;
        const enrollment = enrollments.find(e => e.course_code === courseCode);
        return enrollment?.course_img ? `${process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk'}/${enrollment.course_img}` : null;
    };

    if (dispatchedOrders.length === 0) return null;

    return (
        <>
            {/* Top Card for Dashboard */}
            <div className="space-y-4 mb-8">
                {dispatchedOrders.map(order => {
                    const courseImg = getCourseImage(order.course_code);
                    return (
                        <Card key={`card-${order.id}`} className="shadow-lg border-primary/50 bg-primary/5 animate-in fade-in slide-in-from-top-4">
                            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    {courseImg ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border shadow-sm">
                                            <Image src={courseImg} alt="Course" fill style={{ objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-primary/20 rounded-xl shrink-0">
                                            <Package className="h-8 w-8 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg text-primary leading-tight">Your package is on the way!</h3>
                                        <p className="font-medium text-foreground mt-1 truncate">
                                            {order.delivery_title || "Study Materials"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge variant="secondary" className="text-xs">{order.course_code}</Badge>
                                            <span className="text-xs text-muted-foreground font-mono">Trk: {order.tracking_number}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={(e) => handleMarkAsReceived(order.id, e)} size="lg" className="shrink-0 w-full sm:w-auto font-semibold">
                                    <CheckCircle className="mr-2 h-5 w-5" /> Mark as Received
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Popup Dialog */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl flex items-center gap-2">
                            <Package className="h-6 w-6 text-primary" />
                            Package Received?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base pt-2">
                            Your <strong className="text-foreground">{pendingOrder?.delivery_title || "Study Materials"}</strong> for <strong className="text-foreground">{pendingOrder?.course_code}</strong> was dispatched a few days ago. 
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="py-4 flex gap-4 items-center bg-muted/30 rounded-lg p-4 my-2 border">
                        {getCourseImage(pendingOrder?.course_code) ? (
                            <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0 shadow-sm">
                                <Image src={getCourseImage(pendingOrder?.course_code)!} alt="Course" fill style={{ objectFit: 'cover' }} />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <Package className="h-8 w-8 text-primary" />
                            </div>
                        )}
                        <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="font-semibold truncate">{pendingOrder?.delivery_title || "Course Materials"}</span>
                            <span className="text-xs text-muted-foreground">Tracking Number:</span>
                            <span className="text-sm font-mono bg-background p-1 rounded border inline-block w-fit">{pendingOrder?.tracking_number}</span>
                        </div>
                    </div>

                    <AlertDialogDescription>
                        Please confirm if you have received it safely.
                    </AlertDialogDescription>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                        <Button variant="outline" onClick={handleRemindTomorrow} className="w-full sm:w-auto">Remind me tomorrow</Button>
                        <Button onClick={(e) => pendingOrder && handleMarkAsReceived(pendingOrder.id, e)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="mr-2 h-4 w-4" /> Yes, I received it
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

// --- Main Page Component ---
export default function StudentDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [dialogContent, setDialogContent] = useState<{ title: string; description: string } | null>(null);
    
    useEffect(() => {
        const storedCourseCode = sessionStorage.getItem('selected_course');
        if (storedCourseCode) {
            setSelectedCourseCode(storedCourseCode);
        } else {
            router.replace('/dashboard/select-course');
        }
    }, [router]);

    const { data: tickets, isLoading: isLoadingTickets } = useQuery<Ticket[]>({
        queryKey: ['tickets', user?.username],
        queryFn: () => getTickets(user!.username!),
        enabled: !!user?.username,
    });

    const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<StudentEnrollmentInfo[]>({
        queryKey: ['studentEnrollments', user?.username],
        queryFn: () => getStudentEnrollments(user!.username!),
        enabled: !!user?.username,
    });

    const selectedCourse = useMemo(() => {
        if (!selectedCourseCode || !enrollments) return null;
        return enrollments.find(e => e.course_code === selectedCourseCode);
    }, [selectedCourseCode, enrollments]);
    
    const recentTickets = useMemo(() => {
       if (!tickets) return [];
       return [...tickets]
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    }, [tickets]);

    const quickActions = [
        { title: "Recordings", description: "View your study materials & videos.", href: "/dashboard/recordings", icon: <Video className="w-8 h-8 text-white" />, colorClass: "from-pink-400 to-rose-500" },
        { title: "Create a Ticket", description: "Get help from our support staff.", href: "/dashboard/create-ticket", icon: <PlusCircle className="w-8 h-8 text-white" />, colorClass: "from-blue-400 to-indigo-500" },
        { title: "Study Pack", description: "Request course materials delivery.", href: "/dashboard/delivery", icon: <FileText className="w-8 h-8 text-white" />, colorClass: "from-orange-400 to-red-500" },
        { title: "Order Certificate", description: "Request a hard copy of your certificate.", href: "/dashboard/certificate-order", icon: <Award className="w-8 h-8 text-white" />, colorClass: "from-green-400 to-teal-500" },
        { title: "BNF", description: "Access the British National Formulary.", href: "/dashboard/bnf", icon: <BookOpen className="w-8 h-8 text-white" />, colorClass: "from-red-400 to-rose-500" },
        { title: "Games & Challenges", description: "Test your knowledge and have fun.", href: "/dashboard/games", icon: <Gamepad2 className="w-8 h-8 text-white" />, colorClass: "from-yellow-400 to-amber-500" },
        { title: "My Profile", description: "Manage your personal profile information.", href: "/dashboard/profile", icon: <User className="w-8 h-8 text-white" />, colorClass: "from-indigo-400 to-purple-500" },
        { title: "Convocation Booking", description: "Register for the upcoming convocation.", href: "/dashboard/convocation-booking", icon: <GraduationCap className="w-8 h-8 text-white" />, colorClass: "from-purple-400 to-pink-500" },
    ];

    if (!selectedCourseCode && isLoadingEnrollments) {
        return (
             <div className="flex h-screen items-center justify-center">
                <p>Loading your preferences...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-8 bg-background pb-40">
             <AlertDialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogContent?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{dialogContent?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setDialogContent(null)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DeliveryConfirmationPrompt user={user} enrollments={enrollments} />

            {/* --- Profile Header --- */}
            <Card className="shadow-lg overflow-hidden animate-in fade-in-50">
                <div className="bg-card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <Avatar className="w-20 h-20 text-3xl border-4 border-primary/50 shrink-0" data-ai-hint="student avatar">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold font-headline">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p className="text-muted-foreground">Here's a summary of your support tickets and available modules.</p>
                    </div>
                </div>
            </Card>

              <section className="animate-in fade-in-50 slide-in-from-bottom-4 delay-100">
                <h2 className="text-2xl font-semibold font-headline mb-4">My Course</h2>
                {isLoadingEnrollments ? (
                    <Skeleton className="h-32 w-full" />
                ) : selectedCourse ? (
                    <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-background">
                         <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                            {selectedCourse.course_img && (
                                <div className="relative w-full sm:w-48 h-28 rounded-lg overflow-hidden shrink-0 bg-muted">
                                    <Image 
                                      src={`${CONTENT_PROVIDER_URL}/${selectedCourse.course_img}`} 
                                      alt={selectedCourse.course_name || selectedCourse.course_code} 
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      priority
                                      data-ai-hint="online course" 
                                    />
                                </div>
                            )}
                            <div className="flex-grow text-center sm:text-left">
                                <p className="text-xs font-semibold text-primary">YOUR CURRENT COURSE</p>
                                <h3 className="text-xl font-bold text-card-foreground">{selectedCourse.course_name || selectedCourse.course_code}</h3>
                                <p className="text-sm text-muted-foreground">{selectedCourse.course_code}</p>
                            </div>
                            <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                {selectedCourse.whatsapp_link && (
                                    <Button asChild className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white">
                                        <a href={selectedCourse.whatsapp_link} target="_blank" rel="noopener noreferrer">
                                            WhatsApp Group
                                        </a>
                                    </Button>
                                )}
                                <Button asChild className="w-full sm:w-auto"><Link href="/dashboard/recordings">View Course</Link></Button>
                                <Button asChild variant="outline" className="w-full sm:w-auto"><Link href="/dashboard/select-course">Change Course</Link></Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Course Selected</AlertTitle>
                        <CardDescription>You are not enrolled in any courses or have not selected one.
                            <Link href="/dashboard/select-course" className="text-primary font-semibold hover:underline ml-1">Select a course</Link>
                        </CardDescription>
                    </Alert>
                )}
            </section>
            
             <section className="animate-in fade-in-50 slide-in-from-bottom-4 delay-400">
                 <h2 className="text-2xl font-semibold font-headline mb-4">Games & Challenges</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <QuickActionCard title="Ceylon Pharmacy" description="Patient simulation game." href="/dashboard/ceylon-pharmacy" icon={<CeylonPharmacyIcon className="w-8 h-8 text-white"/>} colorClass="from-cyan-400 to-sky-500" selectedCourseCode={selectedCourseCode} setDialogContent={setDialogContent} />
                     <QuickActionCard title="D-Pad Challenge" description="Dispensing accuracy test." href="/dashboard/d-pad" icon={<DPadIcon className="w-8 h-8 text-white"/>} colorClass="from-rose-400 to-red-500" selectedCourseCode={selectedCourseCode} setDialogContent={setDialogContent} />
                     <QuickActionCard title="Sentence Builder" description="English language practice." href="/dashboard/games/sentence-builder" icon={<BookText className="w-8 h-8 text-white"/>} colorClass="from-amber-400 to-orange-500" requiredCourses={['CPCC28', 'CPCC27']} selectedCourseCode={selectedCourseCode} setDialogContent={setDialogContent} />
                     <QuickActionCard title="Pharma Hunter" description="Test your pharmacology knowledge." href="/dashboard/medimind" icon={<PharmaHunterIcon className="w-8 h-8 text-white"/>} colorClass="from-purple-400 to-violet-500" selectedCourseCode={selectedCourseCode} setDialogContent={setDialogContent} />
                     <QuickActionCard title="WinPharma" description="Topic-wise learning challenges." href="/dashboard/winpharma" icon={<WinPharmaIcon className="w-8 h-8 text-white"/>} colorClass="from-blue-400 to-indigo-500" selectedCourseCode={selectedCourseCode} setDialogContent={setDialogContent} />
                     <QuickActionCard title="Pharma Reader" description="Practice reading prescription details." href="/dashboard/pharma-reader" icon={<PharmaReaderIcon className="w-8 h-8 text-white"/>} colorClass="from-emerald-400 to-teal-500" selectedCourseCode={selectedCourseCode} setDialogContent={setDialogContent} />
                 </div>
            </section>

            <section className="animate-in fade-in-50 slide-in-from-bottom-4 delay-150">
                <h2 className="text-2xl font-semibold font-headline mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {quickActions.map((action) => (
                      <QuickActionCard 
                        key={action.href}
                        {...action}
                        selectedCourseCode={selectedCourseCode} 
                        setDialogContent={setDialogContent} 
                      />
                   ))}
                </div>
            </section>
            
            <section className="animate-in fade-in-50 slide-in-from-bottom-4 delay-300">
                <h2 className="text-2xl font-semibold font-headline mb-4">Ticket Summary</h2>
                <div className="w-full">
                    <TicketStats tickets={tickets || []} isLoading={isLoadingTickets} />
                </div>
            </section>

            <section className="animate-in fade-in-50 slide-in-from-bottom-4 delay-500">
                 <h2 className="text-2xl font-semibold font-headline mb-4">Recent Tickets</h2>
                 <Card className="shadow-lg">
                    <CardContent className="p-4 md:p-6">
                       <div className="space-y-4">
                        {isLoadingTickets && [...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        ))}
                        {!isLoadingTickets && recentTickets.length > 0 ? recentTickets.map((ticket) => (
                            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block group">
                                <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <TicketIcon className="w-5 h-5 text-primary"/>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold truncate pr-2">{ticket.subject}</p>
                                            <Badge variant={ticket.status === 'Closed' ? 'secondary' : 'default'}>{ticket.status}</Badge>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <p className="text-sm text-muted-foreground truncate pr-2">
                                                {ticket.lastMessagePreview || "No messages yet."}
                                            </p>
                                            <UnreadBadge ticketId={ticket.id} userRole="student" />
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            !isLoadingTickets && (
                                <div className="text-center py-10 text-muted-foreground">
                                    You haven't created any tickets yet.
                                </div>
                            )
                        )}
                        </div>
                    </CardContent>
                 </Card>
            </section>
        </div>
    );
}

    