"use client";

import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { 
    Ticket, Message, TicketStatus, TicketPriority, StaffMember, 
    Attachment, UserFullDetails, StudentEnrollmentInfo, StudentBalanceData 
} from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
    Card, CardHeader, CardTitle, CardContent 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { StudentInline360Dossier } from "@/components/admin/StudentInline360Dossier";
import { 
    getTicketMessages, createTicketMessage, markTicketMessagesAsRead,
    sendTicketResolvedSms
} from "@/lib/actions/tickets";
import { 
    getStudentDetailsByUsername, getStudentEnrollments, getStudentBalance 
} from "@/lib/actions/users";
import { getActiveTicketCategories } from "@/lib/actions/ticketCategories";
import {
    ArrowLeft, CheckCircle2, Clock, User, Phone, Mail, MessageSquare,
    Lock, Unlock, Send, Paperclip, Smile, ZoomIn, RotateCw, ZoomOut,
    X, Check, RotateCcw, Copy, ExternalLink, Sparkles,
    Calendar, ShieldCheck, UserCheck, Star, Loader2, Info, Download, Maximize2,
    FileText, PlusCircle
} from "lucide-react";

interface ModernAdminTicketDetailProps {
    ticket: Ticket;
    currentUser: {
        username: string;
        avatar?: string;
        name?: string;
        role?: string;
    };
    staffMembers: StaffMember[];
    onUpdateTicket: (updatedTicket: Partial<Ticket> & { id: string }) => void;
    onAssignTicket: (payload: { ticketId: string; assignedTo: string; assigneeAvatar: string; lockedByStaffId: string }) => void;
    onUnlockTicket: (ticketId: string) => void;
    onRefreshTicket?: () => void;
}

interface StagedAttachment extends Attachment {
    id: string;
}

// Quick internal staff action & note templates
const CANNED_RESPONSES = [
    { label: "📞 Contacted via Call/WhatsApp", text: "Contacted student via call/WhatsApp to discuss the ticket. Informed current status and next steps." },
    { label: "💳 Slip Verified & Approved", text: "Bank deposit slip checked and verified with accounts department. Student payment confirmed." },
    { label: "🔑 LMS Password Reset", text: "Reset LMS portal credentials and updated student record. Credentials communicated to student." },
    { label: "📦 Study Pack Dispatched", text: "Study pack prepared and dispatched via courier. Logistics tracking details recorded." },
    { label: "⏳ Awaiting Student Info", text: "Requested additional clarification/slip photo from the student. Awaiting response." },
    { label: "⚠️ Issue Escalated", text: "Escalated case to department head / academic coordinator for technical/academic review." },
];

function cleanPhoneForWhatsApp(phone?: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
        cleaned = "94" + cleaned.slice(1);
    }
    return cleaned;
}

// Enhanced Lightbox Image Viewer Modal
function ImageViewerModal({
    imageUrl,
    onClose
}: {
    imageUrl: string | null;
    onClose: () => void;
}) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }, [imageUrl]);

    if (!imageUrl) return null;

    const handleZoomIn = () => setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)));
    const handleZoomOut = () => {
        setScale((s) => {
            const next = Math.max(0.5, +(s - 0.25).toFixed(2));
            if (next <= 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    };
    const handleRotate = () => setRotation((r) => (r + 90) % 360);
    const handleReset = () => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    // Pan / Drag handlers when zoomed in
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Touch handlers for mobile pan
    const handleTouchStart = (e: React.TouchEvent) => {
        if (scale <= 1 || e.touches.length !== 1) return;
        setIsDragging(true);
        setDragStart({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
        setPosition({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y
        });
    };

    const handleTouchEnd = () => setIsDragging(false);

    return (
        <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                hideCloseButton 
                className="max-w-4xl w-[96vw] sm:w-[90vw] h-[92vh] sm:h-[88vh] p-0 flex flex-col bg-slate-950/98 border border-border/80 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl"
            >
                {/* Clean Top Bar Header */}
                <div className="px-4 py-3 bg-slate-900/90 border-b border-border/60 flex items-center justify-between gap-2 z-10 select-none">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Maximize2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-slate-100 truncate">Attachment Viewer</h3>
                            <p className="text-[11px] text-slate-400 font-mono">
                                Zoom: {Math.round(scale * 100)}% {rotation > 0 && `• Rotated ${rotation}°`}
                            </p>
                        </div>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg"
                            title="Zoom In"
                            onClick={handleZoomIn}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg"
                            title="Zoom Out"
                            onClick={handleZoomOut}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg"
                            title="Rotate 90°"
                            onClick={handleRotate}
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg"
                            title="Reset View"
                            onClick={handleReset}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center justify-center h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                            title="Open in new tab / Download"
                        >
                            <Download className="h-4 w-4" />
                        </a>
                        <div className="w-[1px] h-5 bg-border/60 mx-1 hidden sm:block" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg ml-0.5"
                            title="Close Viewer"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Viewport Area */}
                <div 
                    className={cn(
                        "flex-1 w-full h-full overflow-hidden flex items-center justify-center relative select-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]",
                        scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                            transition: isDragging ? "none" : "transform 0.15s ease-out",
                            transformOrigin: "center center",
                        }}
                        className="relative w-full h-full flex items-center justify-center p-3"
                    >
                        <Image
                            src={imageUrl}
                            alt="Attachment preview"
                            fill
                            style={{ objectFit: "contain" }}
                            className="rounded-lg drop-shadow-md select-none pointer-events-none"
                            priority
                            unoptimized
                        />
                    </div>

                    {/* Hint pill when zoomed */}
                    {scale > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] text-slate-300 pointer-events-none shadow-lg animate-in fade-in">
                            Drag or swipe to pan image
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ModernAdminTicketDetail({
    ticket,
    currentUser,
    staffMembers = [],
    onUpdateTicket,
    onAssignTicket,
    onUnlockTicket,
    onRefreshTicket,
}: ModernAdminTicketDetailProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Local UI states
    const [newMessage, setNewMessage] = useState("");
    const [stagedAttachments, setStagedAttachments] = useState<StagedAttachment[]>([]);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [copiedPA, setCopiedPA] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState<"discussion" | "info" | "student">("discussion");
    const [isSending, setIsSending] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const studentNumber = ticket.studentNumber || ticket.studentName || "";

    // Live Discussion Messages (Polling every 3 seconds)
    const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
        queryKey: ["ticketMessages", ticket.id],
        queryFn: () => getTicketMessages(ticket.id),
        enabled: !!ticket.id,
        refetchInterval: 3000,
    });

    // Mark unread messages from student as read
    useEffect(() => {
        if (messages.length > 0) {
            const unreadIds = messages
                .filter((m) => m.readStatus === "Unread" && m.from === "student")
                .map((m) => String(m.id));

            if (unreadIds.length > 0) {
                markTicketMessagesAsRead(unreadIds)
                    .then(() => {
                        queryClient.invalidateQueries({ queryKey: ["unreadCount", ticket.id] });
                    })
                    .catch(() => {});
            }
        }
    }, [messages, ticket.id, queryClient]);

    // Auto-scroll chat to bottom on new messages
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages.length, stagedAttachments.length, isSending]);

    // Student 360 Full Profile Query
    const { data: studentProfile, isLoading: isLoadingProfile } = useQuery<UserFullDetails>({
        queryKey: ["studentProfile", studentNumber],
        queryFn: () => getStudentDetailsByUsername(studentNumber),
        enabled: !!studentNumber,
        staleTime: 1000 * 60 * 5,
    });

    // Student Enrollments Query
    const { data: enrollments = [] } = useQuery<StudentEnrollmentInfo[]>({
        queryKey: ["studentEnrollments", studentNumber],
        queryFn: () => getStudentEnrollments(studentNumber),
        enabled: !!studentNumber,
        staleTime: 1000 * 60 * 5,
    });

    // Student Balance Query
    const { data: balanceData = null, isLoading: isLoadingBalance, refetch: refetchBalance } = useQuery<StudentBalanceData>({
        queryKey: ["studentBalance", studentNumber],
        queryFn: () => getStudentBalance(studentNumber),
        enabled: !!studentNumber,
        staleTime: 1000 * 60 * 3,
    });

    // Dynamic Categories for Category Selector
    const { data: dynamicCategories = [] } = useQuery({
        queryKey: ["active-ticket-categories"],
        queryFn: getActiveTicketCategories,
        staleTime: 1000 * 60 * 5,
    });

    // Local optimistic states for immediate responsiveness
    const [localCategory, setLocalCategory] = useState<string | null>(null);
    const [localStatus, setLocalStatus] = useState<TicketStatus | null>(null);
    const [localPriority, setLocalPriority] = useState<TicketPriority | null>(null);

    useEffect(() => {
        setLocalCategory(null);
    }, [ticket.category]);

    useEffect(() => {
        setLocalStatus(null);
    }, [ticket.status]);

    useEffect(() => {
        setLocalPriority(null);
    }, [ticket.priority]);

    const effectiveCategory = localCategory ?? ticket.category;
    const effectiveStatus = localStatus ?? ticket.status;
    const effectivePriority = localPriority ?? ticket.priority;

    // Find matching category object (by category_key or name)
    const matchedCategory = useMemo(() => {
        if (!effectiveCategory) return null;
        return dynamicCategories.find(
            (c) => c.category_key === effectiveCategory ||
                   c.name === effectiveCategory ||
                   c.category_key?.toLowerCase() === effectiveCategory.toLowerCase() ||
                   c.name?.toLowerCase() === effectiveCategory.toLowerCase()
        );
    }, [effectiveCategory, dynamicCategories]);

    // Canonical key for Select value
    const activeCategoryKey = useMemo(() => {
        if (!effectiveCategory) return "Other";
        return matchedCategory ? (matchedCategory.category_key || matchedCategory.name) : effectiveCategory;
    }, [effectiveCategory, matchedCategory]);

    const activeCategoryDisplayName = useMemo(() => {
        if (!effectiveCategory) return "Other";
        return matchedCategory ? matchedCategory.name : effectiveCategory;
    }, [effectiveCategory, matchedCategory]);

    // Lock calculations
    const isTicketLockedByOther = !!ticket.lockedByStaffId && ticket.lockedByStaffId !== currentUser.username;
    const isTicketLockedByMe = ticket.lockedByStaffId === currentUser.username;
    const assignedStaff = staffMembers.find((s) => s.username === ticket.assignedTo);
    const assignedStaffName = assignedStaff?.name || ticket.assignedTo || "Unassigned";

    // Copy Student PA
    const handleCopyPA = () => {
        if (!studentNumber) return;
        navigator.clipboard.writeText(studentNumber);
        setCopiedPA(true);
        toast({ title: "Copied!", description: `Student PA ${studentNumber} copied to clipboard.` });
        setTimeout(() => setCopiedPA(false), 2000);
    };

    // Quick Status Update
    const handleStatusChange = (newStatus: TicketStatus) => {
        if (newStatus === effectiveStatus) return;
        setLocalStatus(newStatus);
        onUpdateTicket({ id: ticket.id, status: newStatus });
        toast({
            title: `Ticket ${newStatus}`,
            description: `Ticket status has been updated to ${newStatus}.`,
        });

        // Trigger SMS notification when ticket is marked as Closed / Resolved
        if (newStatus === "Closed") {
            const targetPhone = (studentProfile?.telephone_1 || studentProfile?.telephone_2 || "").trim();
            if (targetPhone) {
                sendTicketResolvedSms({
                    mobile: targetPhone,
                    studentName: studentProfile?.full_name || studentProfile?.name_with_initials || ticket.studentName,
                    studentNumber: studentNumber || ticket.studentNumber,
                    ticketId: ticket.id,
                    subject: ticket.subject,
                }).then(() => {
                    toast({
                        title: "Resolved SMS Sent",
                        description: `Notification delivered to student (${targetPhone}).`,
                    });
                }).catch((smsErr: any) => {
                    console.warn("Resolution SMS warning:", smsErr);
                });
            }
        }
    };

    // Quick Priority Update
    const handlePriorityChange = (newPriority: TicketPriority) => {
        if (newPriority === effectivePriority) return;
        setLocalPriority(newPriority);
        onUpdateTicket({ id: ticket.id, priority: newPriority });
        toast({
            title: `Priority Updated`,
            description: `Priority set to ${newPriority}.`,
        });
    };

    // Quick Category Update
    const handleCategoryChange = (newCategory: string) => {
        if (newCategory === activeCategoryKey || newCategory === effectiveCategory) return;
        setLocalCategory(newCategory);
        onUpdateTicket({ id: ticket.id, category: newCategory });
        toast({
            title: `Category Updated`,
            description: `Category set to ${newCategory}.`,
        });
    };

    // Quick Assign to Me
    const handleAssignToMe = () => {
        if (ticket.assignedTo === currentUser.username) return;
        onAssignTicket({
            ticketId: ticket.id,
            assignedTo: currentUser.username,
            assigneeAvatar: currentUser.avatar || "",
            lockedByStaffId: currentUser.username,
        });
    };

    // Staff Reassignment from Dropdown
    const handleStaffSelect = (staffUsername: string) => {
        if (staffUsername === "unassigned") {
            onUpdateTicket({
                id: ticket.id,
                assignedTo: undefined,
                assigneeAvatar: undefined,
                isLocked: false,
                lockedByStaffId: undefined,
            });
            toast({ title: "Unassigned", description: "Ticket marked as unassigned." });
            return;
        }

        const selected = staffMembers.find((s) => s.username === staffUsername);
        if (!selected) return;

        onAssignTicket({
            ticketId: ticket.id,
            assignedTo: selected.username,
            assigneeAvatar: selected.avatar || "",
            lockedByStaffId: selected.username,
        });
    };

    // Add Internal Note Mutation
    const sendMessageMutation = useMutation({
        mutationFn: (data: { from: "staff"; text: string; attachments?: Attachment[]; createdBy: string }) =>
            createTicketMessage(data, ticket.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticketMessages", ticket.id] });
            queryClient.invalidateQueries({ queryKey: ["ticket", ticket.id] });
            setNewMessage("");
            setStagedAttachments([]);
            setIsSending(false);

            toast({
                title: "Note Recorded",
                description: "Internal staff note saved to case activity log.",
            });

            // If ticket was Open, automatically move to In Progress on note
            if (ticket.status === "Open") {
                handleStatusChange("In Progress");
            }
        },
        onError: (err: Error) => {
            setIsSending(false);
            toast({
                variant: "destructive",
                title: "Failed to save internal note",
                description: err.message,
            });
        },
    });

    const handleSendMessage = (andResolve: boolean = false) => {
        if ((!newMessage.trim() && stagedAttachments.length === 0) || isSending) return;

        setIsSending(true);
        const staffAuthor = currentUser.name || currentUser.username || "Staff Support";
        sendMessageMutation.mutate({
            from: "staff",
            text: newMessage.trim(),
            attachments: stagedAttachments,
            createdBy: staffAuthor,
        });

        if (andResolve) {
            handleStatusChange("Closed");
        }
    };

    // File attachments handling
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach((file, index) => {
            if (file.size > 8 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: `"${file.name}" exceeds the 8MB limit.`,
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const newAttachment: StagedAttachment = {
                    id: `${Date.now()}-${index}-${Math.random()}`,
                    type: "image",
                    url: reader.result as string,
                    name: file.name,
                    file: file,
                };
                setStagedAttachments((prev) => [...prev, newAttachment]);
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeStagedAttachment = (idToRemove: string) => {
        setStagedAttachments((prev) => prev.filter((att) => att.id !== idToRemove));
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage((prev) => prev + emojiData.emoji);
        textareaRef.current?.focus();
    };

    const primaryPhone = studentProfile?.telephone_1 || "";
    const cleanWaNumber = cleanPhoneForWhatsApp(primaryPhone);

    // SUB-COMPONENT: Original Inquiry Card
    const renderInquiryCard = () => (
        <Card className="bg-card/80 border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-5 bg-slate-950/60 border-b border-border/50">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-border/70 shrink-0">
                            <AvatarFallback className="text-sm bg-primary/20 text-primary font-bold">
                                {(ticket.studentName?.charAt(0) || "S").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                                    {ticket.studentName || "Student"}
                                </h3>
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-border/60 text-slate-300 font-semibold">
                                    {studentNumber}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Logged on {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "Recently"}</span>
                            </p>
                        </div>
                    </div>

                    <Badge variant="outline" className="text-xs font-semibold bg-slate-900 text-slate-300 border-border/60 py-1 px-2.5">
                        Original Ticket #{ticket.id}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Description text */}
                <div className="text-sm sm:text-base text-slate-100 whitespace-pre-line leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-border/50">
                    {ticket.description || "No description provided."}
                </div>

                {/* Attachments Grid */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                    <div className="space-y-2 pt-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                            <Paperclip className="h-4 w-4 text-primary" />
                            <span>Attachments ({ticket.attachments.length})</span>
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {ticket.attachments.map((att, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setViewingImage(att.url)}
                                    className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-border/70 bg-slate-950 cursor-pointer shadow-sm hover:border-primary transition-all"
                                >
                                    <Image
                                        src={att.url}
                                        alt={att.name || "Attachment"}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        className="group-hover:scale-105 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ZoomIn className="h-6 w-6 text-white drop-shadow" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // SUB-COMPONENT: Internal Staff Notes & Activity Log
    const renderDiscussionSection = () => (
        <div className="flex flex-col rounded-2xl border border-border/80 bg-card/80 overflow-hidden shadow-md">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950/90 border-b border-border/70 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                Internal Staff Notes & Activity Log
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-mono font-bold border border-amber-500/30">
                                {messages.length}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                            Official internal case remarks and staff action history
                        </p>
                    </div>
                </div>

                <Badge variant="outline" className="text-xs font-semibold text-amber-300 bg-amber-500/10 border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    Staff Confidential • Not visible to student
                </Badge>
            </div>

            {/* Notes Stream */}
            <div
                ref={scrollAreaRef}
                className="flex-1 p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto max-h-[300px] sm:max-h-[420px] lg:max-h-[560px] bg-slate-950/30"
            >
                {isLoadingMessages && (
                    <div className="space-y-4 py-4">
                        <Skeleton className="h-24 w-full rounded-2xl bg-slate-900/60" />
                        <Skeleton className="h-24 w-full rounded-2xl bg-slate-900/60" />
                    </div>
                )}

                {!isLoadingMessages && messages.length === 0 && (
                    <div className="py-14 px-4 text-center space-y-3.5 bg-slate-950/20 rounded-2xl border border-dashed border-border/50 my-2">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto text-amber-400 shadow-sm">
                            <FileText className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white">No internal notes logged yet</h3>
                            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                                Record private staff comments, phone call records, payment verification updates, or resolution remarks below. These notes are confidential and never shown to students.
                            </p>
                        </div>
                    </div>
                )}

                {!isLoadingMessages && messages.map((message) => {
                    const isStaff = message.from === "staff" || !!message.createdBy;
                    const authorName = message.createdBy || (isStaff ? "Staff Member" : (ticket.studentName || "Student"));
                    const formattedDate = message.time 
                        ? new Date(message.time).toLocaleString([], { 
                            month: "short", 
                            day: "numeric", 
                            year: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          }) 
                        : "";

                    return (
                        <div
                            key={message.id}
                            className="flex flex-col gap-3 rounded-2xl p-4 sm:p-5 bg-slate-900/80 border border-border/75 hover:border-border transition-colors shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3 flex-wrap">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-8 w-8 shrink-0 border border-border/80">
                                        <AvatarImage src={isStaff ? (currentUser.avatar || message.avatar) : message.avatar} />
                                        <AvatarFallback className={cn(
                                            "text-xs font-bold",
                                            isStaff 
                                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                                                : "bg-slate-800 text-slate-300"
                                        )}>
                                            {authorName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                                        <span className="text-sm font-bold text-white truncate">
                                            {authorName}
                                        </span>
                                        <span className={cn(
                                            "text-xs px-2.5 py-0.5 rounded-lg font-semibold border",
                                            isStaff
                                                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                                : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                        )}>
                                            {isStaff ? "Internal Note" : "Student Query"}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0 font-mono">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{formattedDate}</span>
                                </div>
                            </div>

                            <p className="text-sm sm:text-base text-slate-100 whitespace-pre-line break-words leading-relaxed pt-0.5">
                                {message.text}
                            </p>

                            {message.attachments && message.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2.5 mt-2 pt-2.5 border-t border-border/40">
                                    {message.attachments.map((att, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setViewingImage(att.url)}
                                            className="relative w-22 h-22 rounded-xl overflow-hidden border border-border/80 cursor-pointer hover:border-amber-400/70 transition-all group"
                                        >
                                            <Image
                                                src={att.url}
                                                alt={att.name || "Attachment"}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Maximize2 className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {isSending && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-sm font-semibold text-amber-300">
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-amber-400" />
                        <span>Saving internal note to activity log...</span>
                    </div>
                )}
            </div>

            {/* Note Composer */}
            <div className="p-3.5 sm:p-5 bg-slate-950/95 border-t border-border/70 space-y-3 sm:space-y-4">
                {/* Action Templates Pills */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            Quick Action Note Templates
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">Click to pre-fill remark</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap sm:overflow-visible">
                        {CANNED_RESPONSES.map((tpl, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setNewMessage((prev) => (prev ? prev + "\n" + tpl.text : tpl.text))}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 border border-border/70 text-slate-300 hover:text-white hover:border-amber-400/60 hover:bg-amber-500/10 active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 sm:shrink"
                            >
                                {tpl.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Staged attachments preview */}
                {stagedAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 p-3 bg-slate-900/80 rounded-2xl border border-border/60">
                        {stagedAttachments.map((att) => (
                            <div key={att.id} className="relative group w-18 h-18 rounded-xl overflow-hidden border border-border">
                                <Image src={att.url} alt={att.name} fill style={{ objectFit: "cover" }} />
                                <button
                                    type="button"
                                    onClick={() => removeStagedAttachment(att.id)}
                                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 cursor-pointer shadow-sm"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Textarea */}
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                e.preventDefault();
                                handleSendMessage(false);
                            }
                        }}
                        placeholder="Add an internal staff note, action taken, or resolution remark... (Press Ctrl+Enter to save)"
                        className="min-h-[120px] sm:min-h-[140px] bg-slate-900/90 border-border/80 rounded-2xl text-sm sm:text-base text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 pr-20 sm:pr-24 resize-y p-3.5 sm:p-4 leading-relaxed"
                    />

                    <div className="absolute right-2.5 bottom-2.5 sm:right-3.5 sm:bottom-3.5 flex items-center gap-1 sm:gap-1.5">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-white hover:bg-slate-800 cursor-pointer"
                                    title="Insert Emoji"
                                >
                                    <Smile className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="end" className="p-0 border-none bg-transparent shadow-none">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </PopoverContent>
                        </Popover>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-white hover:bg-slate-800 cursor-pointer"
                            title="Attach screenshot or document"
                        >
                            <Paperclip className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 sm:pt-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-border/70 shadow-xs">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                        <span>Logging as <strong className="text-white font-semibold">{currentUser.name || currentUser.username}</strong></span>
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <span className="text-slate-400 hidden sm:inline">Internal Only</span>
                    </div>

                    <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        {ticket.status !== "Closed" && (
                            <Button
                                type="button"
                                disabled={isSending || (!newMessage.trim() && stagedAttachments.length === 0)}
                                onClick={() => handleSendMessage(true)}
                                className="h-10 sm:h-11 px-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-300 border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 shadow-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed justify-center"
                            >
                                <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 mr-1.5 sm:mr-2 text-emerald-400 shrink-0" />
                                Save Note & Resolve
                            </Button>
                        )}

                        <Button
                            type="button"
                            disabled={isSending || (!newMessage.trim() && stagedAttachments.length === 0)}
                            onClick={() => handleSendMessage(false)}
                            className="h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed justify-center"
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 animate-spin mr-1.5 sm:mr-2 text-slate-950 shrink-0" />
                            ) : (
                                <PlusCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 mr-1.5 sm:mr-2 text-slate-950 shrink-0" />
                            )}
                            Add Internal Note
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    // SUB-COMPONENT: Student Quick Contact Card
    const renderStudentContactCard = () => (
        <Card className="bg-card/80 border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-5 bg-slate-950/60 border-b border-border/50">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar className="h-12 w-12 border-2 border-primary/30 shrink-0">
                            <AvatarFallback className="text-base bg-primary/20 text-primary font-bold">
                                {(ticket.studentName?.charAt(0) || "S").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-white truncate">
                                {ticket.studentName || studentProfile?.full_name || "Student"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-sm font-bold text-primary">{studentNumber}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyPA}
                                    className="text-muted-foreground hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer transition-colors"
                                    title="Copy PA Number"
                                >
                                    {copiedPA ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Badge variant="outline" className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/30 py-1 px-2.5 shrink-0">
                        Verified PA
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Touch Actions */}
                <div className="grid grid-cols-2 gap-2.5">
                    {cleanWaNumber ? (
                        <a
                            href={`https://wa.me/${cleanWaNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25 transition-all shadow-xs"
                        >
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.204-1.64a11.816 11.816 0 005.79 1.548h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span>WhatsApp</span>
                        </a>
                    ) : (
                        <div className="flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900/60 text-muted-foreground border border-border/50">
                            No WhatsApp
                        </div>
                    )}

                    {primaryPhone ? (
                        <a
                            href={`tel:${primaryPhone}`}
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-500/15 text-blue-400 border border-blue-500/40 hover:bg-blue-500/25 transition-all shadow-xs"
                        >
                            <Phone className="h-4 w-4" />
                            <span>Call Student</span>
                        </a>
                    ) : (
                        <div className="flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900/60 text-muted-foreground border border-border/50">
                            No Phone
                        </div>
                    )}
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 pt-1 divide-y divide-border/40">
                    {studentProfile?.e_mail && (
                        <div className="flex items-center justify-between py-1.5 gap-2">
                            <span className="text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
                                <Mail className="h-3.5 w-3.5 text-primary" /> Email:
                            </span>
                            <a href={`mailto:${studentProfile.e_mail}`} className="text-primary hover:underline font-mono font-medium truncate">
                                {studentProfile.e_mail}
                            </a>
                        </div>
                    )}

                    {studentProfile?.telephone_1 && (
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
                                <Phone className="h-3.5 w-3.5 text-emerald-400" /> Phone 1:
                            </span>
                            <span className="font-mono font-semibold text-slate-100">{studentProfile.telephone_1}</span>
                        </div>
                    )}

                    {studentProfile?.telephone_2 && (
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
                                <Phone className="h-3.5 w-3.5 text-blue-400" /> Phone 2:
                            </span>
                            <span className="font-mono font-semibold text-slate-100">{studentProfile.telephone_2}</span>
                        </div>
                    )}

                    {studentProfile?.nic && (
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-400 font-medium shrink-0">NIC:</span>
                            <span className="font-mono font-semibold text-slate-100">{studentProfile.nic}</span>
                        </div>
                    )}

                    {studentProfile?.city && (
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-400 font-medium shrink-0">Location:</span>
                            <span className="font-semibold text-slate-100 text-right">{studentProfile.city}{studentProfile.district ? `, ${studentProfile.district}` : ""}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    // SUB-COMPONENT: Ticket Audit & Properties Card
    const renderTicketAuditCard = () => (
        <Card className="bg-card/80 border-border/80 shadow-sm">
            <CardHeader className="p-4 bg-slate-950/50 border-b border-border/50">
                <CardTitle className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Ticket Properties & Audit</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs sm:text-sm divide-y divide-border/40">
                <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400 font-medium">Ticket ID:</span>
                    <span className="font-mono font-bold text-slate-100">#{ticket.id}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400 font-medium">Current Status:</span>
                    <Badge variant="outline" className={cn(
                        "font-semibold text-xs py-0.5 px-2.5",
                        ticket.status === "Open" && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                        ticket.status === "In Progress" && "bg-blue-500/10 text-blue-400 border-blue-500/30",
                        ticket.status === "Closed" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                        ticket.status === "Snooze" && "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    )}>
                        {ticket.status}
                    </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400 font-medium">Priority Level:</span>
                    <Badge variant="outline" className={cn(
                        "font-semibold text-xs py-0.5 px-2.5",
                        ticket.priority === "High" && "bg-rose-500/10 text-rose-400 border-rose-500/30",
                        ticket.priority === "Medium" && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                        ticket.priority === "Low" && "bg-slate-800 text-slate-300 border-slate-700"
                    )}>
                        {ticket.priority} Priority
                    </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400 font-medium">Assigned Staff:</span>
                    <span className="font-semibold text-slate-100">{assignedStaffName}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400 font-medium">Category:</span>
                    <span className="font-semibold text-slate-100">{activeCategoryDisplayName}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400 font-medium">Created:</span>
                    <span className="text-slate-200 font-medium">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}
                    </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400 font-medium">Last Updated:</span>
                    <span className="text-slate-200 font-medium">
                        {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : "N/A"}
                    </span>
                </div>
                {ticket.rating && (
                    <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-400 font-medium">Student Rating:</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{ticket.rating} / 5</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col min-h-screen w-full bg-background text-foreground pb-36 sm:pb-16">
            {/* Attachment Lightbox Modal */}
            <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
            />

            {/* 1. SLIM STICKY COMMAND BAR (Only this tiny row stays fixed at the top) */}
            <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border/80 px-3 sm:px-6 lg:px-8 py-2.5 shadow-sm">
                <div className="w-full flex items-center justify-between gap-2">
                    {/* Left: Back button, Ticket ID, and Lock status */}
                    <div className="flex items-center gap-2 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/admin/tickets")}
                            className="h-8 sm:h-9 px-2 sm:px-2.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-1.5" />
                            <span>Ticket Desk</span>
                        </Button>

                        <span className="text-muted-foreground/50 text-xs sm:text-sm">/</span>

                        <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold text-white bg-slate-950/80 border border-border/70 px-2 py-0.5 rounded-lg">
                            <span>#{ticket.id}</span>
                        </div>

                        {/* Lock alert if handled by another staff */}
                        {isTicketLockedByOther && (
                            <Badge variant="outline" className="text-xs font-semibold bg-rose-500/15 text-rose-400 border-rose-500/40 gap-1.5 hidden sm:inline-flex py-0.5 px-2">
                                <Lock className="h-3 w-3" />
                                <span>Locked by {ticket.lockedByStaffId}</span>
                            </Badge>
                        )}

                        {isTicketLockedByMe && (
                            <button
                                type="button"
                                onClick={() => onUnlockTicket(ticket.id)}
                                title="Click to unlock ticket"
                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg cursor-pointer"
                            >
                                <Unlock className="h-3 w-3" />
                                <span className="hidden sm:inline">Unlocked by you</span>
                            </button>
                        )}
                    </div>

                    {/* Right: Quick Resolution & Assign to Me Button */}
                    <div className="flex items-center gap-2">
                        {ticket.status === "Closed" ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange("In Progress")}
                                className="h-8 sm:h-9 px-3 sm:px-3.5 text-xs sm:text-sm font-bold text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Reopen
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => handleStatusChange("Closed")}
                                className="h-8 sm:h-9 px-3 sm:px-3.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                <span>Mark Resolved</span>
                            </Button>
                        )}

                        {ticket.assignedTo !== currentUser.username && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleAssignToMe}
                                className="h-8 sm:h-9 px-2.5 text-xs sm:text-sm font-semibold text-indigo-300 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer hidden sm:flex items-center gap-1.5"
                            >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Assign to Me</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. SCROLLABLE SUBJECT & PROPERTY SELECTORS BAR (Scrolls away naturally) */}
            <div className="bg-card/50 border-b border-border/70 px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="w-full flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
                            {ticket.subject}
                        </h1>
                    </div>

                    {/* Properties Selectors Bar with comfortable touch targets */}
                    <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
                        {/* Status */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Status:</span>
                            <Select value={effectiveStatus} onValueChange={(val) => handleStatusChange(val as TicketStatus)}>
                                <SelectTrigger className={cn(
                                    "h-9 text-xs sm:text-sm font-bold rounded-lg px-3 border",
                                    effectiveStatus === "Open" && "bg-amber-500/15 text-amber-400 border-amber-500/40",
                                    effectiveStatus === "In Progress" && "bg-blue-500/15 text-blue-400 border-blue-500/40",
                                    effectiveStatus === "Closed" && "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
                                    effectiveStatus === "Snooze" && "bg-purple-500/15 text-purple-400 border-purple-500/40"
                                )}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-border text-sm">
                                    <SelectItem value="Open" className="text-amber-400 focus:bg-amber-500/20">Open</SelectItem>
                                    <SelectItem value="In Progress" className="text-blue-400 focus:bg-blue-500/20">In Progress</SelectItem>
                                    <SelectItem value="Snooze" className="text-purple-400 focus:bg-purple-500/20">Snooze</SelectItem>
                                    <SelectItem value="Closed" className="text-emerald-400 focus:bg-emerald-500/20">Closed / Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Priority:</span>
                            <Select value={effectivePriority} onValueChange={(val) => handlePriorityChange(val as TicketPriority)}>
                                <SelectTrigger className={cn(
                                    "h-9 text-xs sm:text-sm font-bold rounded-lg px-3 border",
                                    effectivePriority === "High" && "bg-rose-500/15 text-rose-400 border-rose-500/40",
                                    effectivePriority === "Medium" && "bg-amber-500/15 text-amber-400 border-amber-500/40",
                                    effectivePriority === "Low" && "bg-slate-800 text-slate-200 border-slate-700"
                                )}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-border text-sm">
                                    <SelectItem value="High" className="text-rose-400 focus:bg-rose-500/20">High Priority</SelectItem>
                                    <SelectItem value="Medium" className="text-amber-400 focus:bg-amber-500/20">Medium Priority</SelectItem>
                                    <SelectItem value="Low" className="text-slate-300 focus:bg-slate-800">Low Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Category:</span>
                            <Select value={activeCategoryKey} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="h-9 text-xs sm:text-sm font-medium bg-slate-950/70 border-border/70 text-slate-200 rounded-lg px-3 min-w-[130px] sm:min-w-[150px]">
                                    <SelectValue placeholder={activeCategoryDisplayName || "Select Category"} />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-border text-sm">
                                    {dynamicCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.category_key || cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                    {/* Fallback item if ticket has a category that isn't in dynamicCategories */}
                                    {activeCategoryKey && !dynamicCategories.some((c) => (c.category_key || c.name) === activeCategoryKey) && (
                                        <SelectItem value={activeCategoryKey}>
                                            {activeCategoryDisplayName}
                                        </SelectItem>
                                    )}
                                    {dynamicCategories.length === 0 && (
                                        <>
                                            <SelectItem value="Academic">Academic Support</SelectItem>
                                            <SelectItem value="LMS Access">LMS & App Access</SelectItem>
                                            <SelectItem value="Payment">Payment & Slips</SelectItem>
                                            <SelectItem value="Study Pack">Study Pack Courier</SelectItem>
                                            <SelectItem value="Examination">Exams & Quizzes</SelectItem>
                                            <SelectItem value="Certificate">Certificate & Conv.</SelectItem>
                                            <SelectItem value="Other">General Support</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assignee */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Assignee:</span>
                            <Select
                                value={ticket.assignedTo || "unassigned"}
                                onValueChange={handleStaffSelect}
                            >
                                <SelectTrigger className="h-9 text-xs sm:text-sm font-medium bg-slate-950/70 border-border/70 text-slate-200 rounded-lg px-3 max-w-[140px] sm:max-w-none">
                                    <div className="flex items-center gap-2 truncate">
                                        <Avatar className="h-4.5 w-4.5">
                                            <AvatarImage src={ticket.assigneeAvatar} />
                                            <AvatarFallback className="text-[9px] bg-primary/20 text-primary">
                                                {(assignedStaffName.substring(0, 2) || "UN").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{assignedStaffName}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-border text-sm">
                                    <SelectItem value="unassigned" className="text-muted-foreground">Unassigned</SelectItem>
                                    {staffMembers.map((staff) => (
                                        <SelectItem key={staff.id} value={staff.username}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-4.5 w-4.5">
                                                    <AvatarImage src={staff.avatar} />
                                                    <AvatarFallback className="text-[9px]">{staff.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{staff.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE QUICK STUDENT CONNECT BAR (Shown only in "Chat" tab to avoid repetition) */}
            {activeMobileTab === "discussion" && (
                <div className="lg:hidden bg-slate-950/95 border-b border-border/80 px-3.5 py-2.5 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                                {(ticket.studentName?.charAt(0) || "S").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{ticket.studentName || "Student"}</p>
                            <p className="text-xs font-mono font-medium text-slate-400 truncate">{studentNumber}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {cleanWaNumber && (
                            <a
                                href={`https://wa.me/${cleanWaNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.204-1.64a11.816 11.816 0 005.79 1.548h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                <span>WhatsApp</span>
                            </a>
                        )}
                        {primaryPhone && (
                            <a
                                href={`tel:${primaryPhone}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/40 hover:bg-blue-500/25"
                            >
                                <Phone className="h-4 w-4" />
                                <span>Call</span>
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={handleCopyPA}
                            className="p-1.5 rounded-lg bg-slate-900 border border-border/70 text-slate-300 hover:text-white"
                            title="Copy PA Number"
                        >
                            {copiedPA ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* MOBILE TAB SWITCHER: Staff Notes, Ticket Info, Student 360 */}
            <div className="lg:hidden px-3.5 pt-3">
                <Tabs value={activeMobileTab} onValueChange={(val) => setActiveMobileTab(val as any)} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full bg-slate-950 border border-border/70 h-auto p-1">
                        <TabsTrigger value="discussion" className="text-xs sm:text-sm font-bold py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                            Staff Notes ({messages.length})
                        </TabsTrigger>
                        <TabsTrigger value="info" className="text-xs sm:text-sm font-bold py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                            Ticket Info
                        </TabsTrigger>
                        <TabsTrigger value="student" className="text-xs sm:text-sm font-bold py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                            Student 360°
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="w-full px-3 sm:px-6 lg:px-8 py-4 flex-1">
                {/* DESKTOP VIEW (Large screens): 2-Column Split */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (65%): Inquiry Card + Discussion Stream */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5 min-w-0">
                        {renderInquiryCard()}
                        {renderDiscussionSection()}
                    </div>

                    {/* Right Column (35%): Student Contact + Student 360 Dossier + Ticket Audit */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 min-w-0">
                        {renderStudentContactCard()}
                        {studentNumber && (
                            <div className="w-full">
                                <StudentInline360Dossier
                                    studentNumber={studentNumber}
                                    studentProfile={studentProfile || {
                                        id: "0",
                                        username: studentNumber,
                                        full_name: ticket.studentName || studentNumber,
                                        telephone_1: primaryPhone,
                                    } as any}
                                    enrollments={enrollments}
                                    balanceData={balanceData}
                                    isLoadingBalance={isLoadingBalance}
                                    onRefreshBalance={() => refetchBalance()}
                                />
                            </div>
                        )}
                        {renderTicketAuditCard()}
                    </div>
                </div>

                {/* MOBILE VIEW (Small screens): Distinct Content per Tab */}
                <div className="lg:hidden flex flex-col gap-4">
                    {/* TAB 1: Internal Staff Notes */}
                    {activeMobileTab === "discussion" && (
                        <div className="flex flex-col gap-4">
                            {renderDiscussionSection()}
                        </div>
                    )}

                    {/* TAB 2: Ticket Info & Original Issue */}
                    {activeMobileTab === "info" && (
                        <div className="flex flex-col gap-4">
                            {renderInquiryCard()}
                            {renderTicketAuditCard()}
                        </div>
                    )}

                    {/* TAB 3: Student 360° Profile & Dossier */}
                    {activeMobileTab === "student" && (
                        <div className="flex flex-col gap-4">
                            {renderStudentContactCard()}
                            {studentNumber && (
                                <div className="w-full">
                                    <StudentInline360Dossier
                                        studentNumber={studentNumber}
                                        studentProfile={studentProfile || {
                                            id: "0",
                                            username: studentNumber,
                                            full_name: ticket.studentName || studentNumber,
                                            telephone_1: primaryPhone,
                                        } as any}
                                        enrollments={enrollments}
                                        balanceData={balanceData}
                                        isLoadingBalance={isLoadingBalance}
                                        onRefreshBalance={() => refetchBalance()}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom spacer to prevent touching window edge */}
            <div className="h-8 sm:h-12 w-full shrink-0" aria-hidden="true" />
        </div>
    );
}
