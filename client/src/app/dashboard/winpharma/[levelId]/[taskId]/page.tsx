"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WinPharmaIcon } from "@/components/icons/module-icons";
import { 
    ArrowLeft, 
    CheckCircle, 
    Video, 
    FileQuestion, 
    Lock, 
    Trophy, 
    Upload, 
    Clock, 
    AlertCircle, 
    RefreshCw,
    ShieldAlert,
    FileText,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Search,
    Trash2,
    Check,
    Eye,
    TrendingUp,
    FileCheck,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getWinPharmaTasks, 
    getWinPharmaLevelsOfficial, 
    createWinPharmaSubmission, 
    updateWinPharmaSubmission,
    getWinPharmaSubmissions,
    getWinPharmaSubmissionResults,
    getWinpharmaCommonReasons,
    QA_API_BASE_URL
} from "@/lib/actions/games";
import type { WinPharmaTask, WinPharmaLevel, WinPharmaSubmission, WinPharmaSubmissionResults } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import parse from 'html-react-parser';
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

const CONTENT_PROVIDER_BASE_URL = 'https://content-provider.pharmacollege.lk';
const SUBMISSION_BASE_URL = 'https://content-provider.pharmacollege.lk/content-provider/uploads/winpharma-submissions/';

export default function WinPharmaTaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const levelId = params.levelId as string;
    const taskId = params.taskId as string;
    
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // UI & Navigation States
    const [activeTab, setActiveTab] = useState<'task' | 'submission'>('task');
    const [imageError, setImageError] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isModalPreviewOpen, setIsModalPreviewOpen] = useState(false);
    const [modalPreviewSrc, setModalPreviewSrc] = useState<string | null>(null);
    const [modalPreviewType, setModalPreviewType] = useState<'image' | 'pdf' | 'video' | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    useEffect(() => {
        const storedCourseCode = localStorage.getItem('selected_course');
        setSelectedCourseCode(storedCourseCode);
    }, []);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Fetch official levels
    const { data: levels = [] } = useQuery<WinPharmaLevel[]>({
        queryKey: ['winPharmaLevels', selectedCourseCode],
        queryFn: () => getWinPharmaLevelsOfficial(selectedCourseCode!),
        enabled: !!selectedCourseCode,
    });

    // Fetch tasks for the current level
    const { data: tasks = [], isLoading, isError } = useQuery<WinPharmaTask[]>({
        queryKey: ['winPharmaTasks', levelId],
        queryFn: () => getWinPharmaTasks(levelId),
        enabled: !!levelId,
    });

    // Fetch student's submissions for this USER and BATCH
    const { data: allStudentSubmissions = [] } = useQuery<WinPharmaSubmission[]>({
        queryKey: ['winPharmaSubmissions', user?.username, selectedCourseCode],
        queryFn: () => getWinPharmaSubmissions(user!.username!, selectedCourseCode!),
        enabled: !!user?.username && !!selectedCourseCode,
    });

    // Fetch detailed results (Summary statistics)
    const { data: submissionResults } = useQuery<WinPharmaSubmissionResults>({
        queryKey: ['winPharmaResults', user?.username, selectedCourseCode],
        queryFn: () => getWinPharmaSubmissionResults(user!.username!, selectedCourseCode!),
        enabled: !!user?.username && !!selectedCourseCode,
    });

    // Extract the ABSOLUTE latest submission using the primary key (submission_id)
    // This solves cases where re-submissions might have earlier logical timestamps
    const currentSubmission = useMemo(() => {
        if (!allStudentSubmissions.length) return null;
        
        const unitSubmissions = [...allStudentSubmissions]
            .filter(s => String(s.resource_id) === taskId)
            .sort((a, b) => {
                const idA = Number(a.submission_id || a.id || 0);
                const idB = Number(b.submission_id || b.id || 0);
                return idB - idA;
            });
            
        return unitSubmissions[0] || null;
    }, [allStudentSubmissions, taskId]);

    // Fetch all common reasons to map the IDs properly
    const { data: commonReasonsList = [] } = useQuery({
        queryKey: ['winpharmaCommonReasons'],
        queryFn: () => getWinpharmaCommonReasons().then(res => res || []),
    });

    const parsedFeedback = useMemo(() => {
        if (!currentSubmission?.reason || currentSubmission.grade_status !== 'Try Again') return [];
        
        const rawReason = currentSubmission.reason;
        const mappedReasons: string[] = [];
        
        const potentialIds = rawReason.split(',').map(s => s.trim()).filter(s => /^\d+$/.test(s));
        
        if (potentialIds.length > 0 && commonReasonsList.length > 0) {
            potentialIds.forEach(id => {
                const found = commonReasonsList.find((r: any) => String(r.id) === id);
                if (found) mappedReasons.push(found.reason);
            });
        } else if (rawReason.length > 0 && potentialIds.length === 0) {
            mappedReasons.push(rawReason);
        }
        
        return mappedReasons;
    }, [currentSubmission, commonReasonsList]);

    const activeTasks = useMemo(() => tasks.filter(t => Number(t.is_active) === 1), [tasks]);
    const task = useMemo(() => activeTasks.find(t => String(t.resource_id || t.id) === taskId), [activeTasks, taskId]);

    const taskIndex = useMemo(() => activeTasks.findIndex(t => String(t.resource_id || t.id) === taskId), [activeTasks, taskId]);
    const nextTask = taskIndex < activeTasks.length - 1 ? activeTasks[taskIndex + 1] : null;
    const prevTask = taskIndex > 0 ? activeTasks[taskIndex - 1] : null;

    // --- SUBMISSION MUTATION ---
    const submissionMutation = useMutation({
        mutationFn: createWinPharmaSubmission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['winPharmaSubmissions', user?.username, selectedCourseCode] });
            queryClient.invalidateQueries({ queryKey: ['winPharmaResults', user?.username, selectedCourseCode] });
            setIsUploading(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            toast({ title: "Submission Updated", description: "Your latest work has been sent for review." });
        },
        onError: (error: any) => {
            setIsUploading(false);
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast({ variant: "destructive", title: "Wrong Format", description: "Only JPG, PNG, and PDF accepted." });
            return;
        }

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }

        // Auto-switch to submission tab on mobile so they see the feedback/buttons
        if (isMobile) {
            setActiveTab('submission');
        }
    };

    const confirmSubmission = () => {
        if (!selectedFile || !user?.username || !selectedCourseCode) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('submission', selectedFile);
        formData.append('index_number', user.username);
        formData.append('level_id', levelId);
        formData.append('resource_id', taskId);
        formData.append('course_code', selectedCourseCode);
        formData.append('date_time', new Date().toISOString().slice(0, 19).replace('T', ' '));
        // Ensure attempt count increments correctly from current latest
        formData.append('attempt', String(Number(currentSubmission?.attempt || 0) + 1)); 
        formData.append('grade_status', 'Pending');
        formData.append('payment_status', 'Paid');
        submissionMutation.mutate(formData);
    };

    const submissionUpdateMutation = useMutation({
        mutationFn: ({ id, formData }: { id: string | number, formData: FormData }) => updateWinPharmaSubmission(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['winPharmaSubmissions', user?.username, selectedCourseCode] });
            queryClient.invalidateQueries({ queryKey: ['winPharmaResults', user?.username, selectedCourseCode] });
            setIsUploading(false);
            toast({ title: "Status Updated", description: "Your submission has been flagged for re-correction." });
        },
        onError: (error: any) => {
            setIsUploading(false);
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    });

    const requestRecorrection = () => {
        if (!currentSubmission || !user?.username || !selectedCourseCode) return;
        setIsUploading(true);
        const formData = new FormData();
        
        // We only need to overwrite the state for the server on the existing row.
        formData.append('grade_status', 'Re-Correction');
        formData.append('update_by', user.username);
        formData.append('update_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
        
        submissionUpdateMutation.mutate({ 
            id: currentSubmission.submission_id || currentSubmission.id!, 
            formData 
        });
    };

    const cancelSelection = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const openPreviewModal = (src: string, type: 'image' | 'pdf' | 'video') => {
        setModalPreviewSrc(src);
        setModalPreviewType(type);
        setIsModalPreviewOpen(true);
    };

    const getEmbedUrl = (url: string) => {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes('youtube.com')) {
                const videoId = parsed.searchParams.get('v');
                return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
            }
            if (parsed.hostname === 'youtu.be') {
                const videoId = parsed.pathname.replace('/', '');
                return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
            }
            return url;
        } catch {
            return url;
        }
    };

    const getStatusBadge = (status: string | undefined) => {
        if (!status) return <Badge variant="outline" className="px-4 py-1.5 rounded-full text-xs font-black uppercase">Draft State</Badge>;
        switch (status) {
            case 'Pending': return <Badge className="bg-amber-500 rounded-full px-4 text-xs font-black"><Clock className="h-4 w-4 mr-2"/> Reviewing</Badge>;
            case 'Completed': return <Badge className="bg-green-500 rounded-full px-4 text-xs font-black"><CheckCircle className="h-4 w-4 mr-2"/> Verified</Badge>;
            case 'Try Again': return <Badge variant="destructive" className="rounded-full px-4 text-xs font-black"><RefreshCw className="h-4 w-4 mr-2"/> Try Again</Badge>;
            default: return <Badge variant="outline" className="rounded-full px-4 text-xs font-black">{status}</Badge>;
        }
    };

    if (isLoading) return <div className="p-8 animate-pulse"><Skeleton className="h-10 w-48 mb-8" /><Skeleton className="h-[500px] w-full rounded-[3rem]" /></div>;
    if (!task) return <div className="p-8 text-center py-40"><FileQuestion className="h-20 w-20 mx-auto" /><h2>Missed</h2><Button onClick={() => router.back()}>Back</Button></div>;

    const helpVideoUrl = task.video_url || (task as any).resource_video;
    const isVideo = task.resource_data.toLowerCase().includes('youtube') || task.resource_data.toLowerCase().includes('iframe') || !!helpVideoUrl;

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-8 pb-32 animate-in fade-in duration-700">
            <header className="flex items-center justify-between gap-4 md:gap-8 overflow-hidden">
                <Button 
                    onClick={() => router.push(`/dashboard/winpharma/${levelId}`)} 
                    variant="ghost" 
                    className="h-10 md:h-12 hover:bg-primary/10 rounded-full group px-3 shrink-0"
                >
                    <ArrowLeft className="mr-1 h-5 w-5 md:h-6 md:w-6 group-hover:-translate-x-1" /> 
                    <span className="font-black uppercase tracking-widest text-[10px]">Back</span>
                </Button>
                
                <div className="flex items-center gap-3 md:gap-6 ml-auto min-w-0">
                    <div className="flex flex-col items-end min-w-0">
                        <div className="flex flex-wrap items-center justify-end gap-2 md:gap-4">
                            <h1 className="text-lg md:text-5xl font-black tracking-tighter leading-none truncate">{task.resource_title}</h1>
                            {getStatusBadge(currentSubmission?.grade_status)}
                        </div>
                    </div>
                    <div className="h-10 w-10 md:h-16 md:w-16 bg-primary text-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-xl md:text-3xl font-black shrink-0 shadow-lg shadow-primary/20">
                        {isVideo ? <Video className="h-5 w-5 md:h-8 md:w-8" /> : <FileText className="h-5 w-5 md:h-8 md:w-8" />}
                    </div>
                </div>
            </header>
            
            {/* Mobile Tab Switcher */}
            {isMobile && (
                <div className="flex bg-zinc-900/50 p-1 rounded-xl md:rounded-[2rem] border border-white/5 backdrop-blur-md sticky top-4 z-40">
                    <button 
                        onClick={() => setActiveTab('task')}
                        className={cn(
                            "flex-1 h-10 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                            activeTab === 'task' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Task Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('submission')}
                        className={cn(
                            "flex-1 h-10 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all",
                            activeTab === 'submission' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        My Submission
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 md:gap-12 pb-20">
                <div className={cn(
                    "min-w-0 space-y-6 md:space-y-10",
                    isMobile && activeTab !== 'task' ? "hidden" : "block"
                )}>
                    <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 ring-1 ring-black/5">
                        <div className="p-4 md:p-10 space-y-6 md:space-y-8">
                            {!imageError && 
                             task.task_cover && 
                             task.task_cover !== 'null' && 
                             task.task_cover !== 'undefined' &&
                             task.task_cover.trim() !== '' && 
                             !task.task_cover.toLowerCase().includes('placeholder') && (
                                <div className="space-y-4">
                                    <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] font-black px-4 py-1">Main Task Reference</Badge>
                                    <div className="relative w-full group overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border-4 border-primary/5 shadow-2xl">
                                        <div className="relative aspect-auto min-h-[200px] md:min-h-[400px]">
                                            <Image 
                                                src={`${CONTENT_PROVIDER_BASE_URL}/${task.task_cover}`} 
                                                alt="Task Cover" 
                                                width={1920}
                                                height={1080}
                                                className="w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-[1.02]"
                                                onError={() => setImageError(true)}
                                            />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <h2 className="text-xl md:text-3xl font-black text-white drop-shadow-lg">{task.resource_title}</h2>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {helpVideoUrl && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">Helping Video</h3>
                                    </div>
                                    <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
                                        <iframe
                                            src={getEmbedUrl(helpVideoUrl)}
                                            className="absolute inset-0 w-full h-full border-none"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}

                            {task.resource_data && task.resource_data.trim() !== "" ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">Additional Instructions</h3>
                                    </div>
                                    <div className="prose md:prose-xl dark:prose-invert max-w-none winpharma-content font-medium leading-relaxed bg-primary/5 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-primary/10">
                                        {parse(task.resource_data)}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </Card>
                </div>
                
                <aside className={cn(
                    "space-y-6 md:space-y-10 lg:sticky lg:top-10 self-start",
                    isMobile && activeTab !== 'submission' ? "hidden" : "block"
                )}>
                    <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                            <h3 className="text-xl md:text-2xl font-black uppercase">Submission</h3>
                            {selectedFile ? (
                                <div className="space-y-4 md:space-y-6">
                                    <div className="bg-background/90 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-primary/20 shadow-2xl relative cursor-pointer" onClick={() => openPreviewModal(previewUrl || '', selectedFile.type === 'application/pdf' ? 'pdf' : 'image')}>
                                        {selectedFile.type.startsWith('image/') ? <img src={previewUrl!} className="w-full h-32 md:h-48 object-cover rounded-xl" /> : <div className="h-24 md:h-32 flex flex-col items-center justify-center p-4 bg-muted/20 rounded-2xl"><FileText className="h-8 w-8 md:h-12 md:w-12 text-primary" /><p className="text-[10px] md:text-xs mt-2 font-bold max-w-[90%] truncate">{selectedFile.name}</p></div>}
                                        <Badge className="bg-primary text-white font-black absolute -top-3 md:-top-4 right-2 md:right-4 text-[9px] md:text-xs">Preview</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 md:gap-4"><Button variant="outline" onClick={cancelSelection} className="h-12 md:h-16 rounded-xl md:rounded-2xl text-[10px] md:text-sm"><Trash2 className="h-4 w-4 mr-1 md:mr-2" /> Discard</Button><Button onClick={confirmSubmission} disabled={isUploading} className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-primary text-white font-black shadow-xl text-[10px] md:text-sm">{isUploading ? <RefreshCw className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : 'Confirm'}</Button></div>
                                </div>
                            ) : currentSubmission ? (
                                <div className="space-y-6">
                                    <div className="bg-background/80 p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-inner space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><FileCheck className="h-7 w-7" /></div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-black break-all whitespace-normal leading-tight mb-1">{currentSubmission.submission}</p>
                                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Attempt #{currentSubmission.attempt}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" onClick={() => openPreviewModal(`${SUBMISSION_BASE_URL}${currentSubmission.submission}`, currentSubmission.submission.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')} className="w-full h-14 rounded-2xl font-black uppercase text-[10px]"><Eye className="h-4 w-4 mr-2" /> View Uploaded Work</Button>
                                        
                                        {currentSubmission.grade_status === 'Try Again' ? (
                                            <div className="space-y-4 mt-4">
                                                {parsedFeedback.length > 0 && (
                                                    <Alert className="rounded-2xl border-2 border-destructive bg-destructive/10 text-destructive-foreground animate-in slide-in-from-top-2 duration-500 shadow-xl overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-2 h-full bg-destructive" />
                                                        <ShieldAlert className="h-5 w-5 text-destructive" />
                                                        <div className="ml-2">
                                                            <AlertTitle className="font-black uppercase text-[10px] tracking-[0.2em] mb-3 text-destructive">Correction Required</AlertTitle>
                                                            <AlertDescription className="text-sm font-bold leading-relaxed text-zinc-900 dark:text-zinc-100 bg-white/50 dark:bg-black/20 p-5 rounded-xl border border-destructive/10">
                                                                <p className="mb-4">Your submission requires corrections. Please review the specific feedback provided by your grader before re-submitting.</p>
                                                                <Button 
                                                                    onClick={() => setIsFeedbackModalOpen(true)}
                                                                    variant="outline" 
                                                                    className="w-full h-12 bg-white dark:bg-black text-destructive border-none shadow-md hover:bg-destructive hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" /> View Assessor Feedback
                                                                </Button>
                                                            </AlertDescription>
                                                        </div>
                                                    </Alert>
                                                )}
                                                <div className="flex flex-col gap-3 mt-6">
                                                    <div className="relative overflow-hidden group">
                                                        <Button className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black uppercase text-[10px] shadow-lg group-hover:bg-primary transition-colors">
                                                            <Upload className="h-4 w-4 mr-2" /> Re-submit New Work
                                                        </Button>
                                                        <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileSelect} />
                                                    </div>
                                                    <div className="relative flex items-center justify-center my-2">
                                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900/10 dark:border-white/10"></div></div>
                                                        <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#fcfcfc] dark:bg-zinc-950 px-3 text-zinc-400">OR</span></div>
                                                    </div>
                                                    <Button 
                                                        onClick={requestRecorrection} 
                                                        disabled={isUploading}
                                                        className="w-full h-14 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20 font-black uppercase text-[10px] shadow-sm hover:bg-purple-600 hover:text-white transition-all"
                                                    >
                                                        {isUploading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
                                                        Request Re-Correction
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-zinc-900/5 border border-zinc-900/10 rounded-2xl text-center">
                                                {currentSubmission.grade_status === 'Completed' ? (
                                                    <p className="text-[10px] font-black uppercase text-green-600">Verified & Finished</p>
                                                ) : (
                                                    <p className="text-[10px] font-black uppercase text-amber-600 group-hover:animate-pulse">Reviewing... Re-submit Locked</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {currentSubmission.grade_status === 'Completed' && nextTask && <Button onClick={() => router.push(`/dashboard/winpharma/${levelId}/${nextTask.resource_id || nextTask.id}`)} className="w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-900 text-white font-black text-sm md:text-lg shadow-2xl">Next Task <ChevronRight className="ml-2 h-5 w-5 md:h-6 md:w-6" /></Button>}
                                </div>
                            ) : (
                                <div className="space-y-6 md:space-y-8 relative group cursor-pointer">
                                    <div className="py-8 md:py-12 border-4 border-dashed border-primary/20 rounded-[1.5rem] md:rounded-[3rem] text-center bg-background/30 transition-all group-hover:bg-primary/5 group-hover:border-primary/40">
                                        <div className="h-16 w-16 md:h-20 md:w-20 bg-primary/20 rounded-2xl md:rounded-[2.5rem] mx-auto flex items-center justify-center text-primary mb-4 md:mb-6">
                                            <Upload className="h-8 w-8 md:h-10 md:w-10" />
                                        </div>
                                        <h4 className="text-base md:text-lg font-black uppercase">Select File</h4>
                                        <p className="text-[10px] font-bold opacity-60">JPG, PNG, PDF</p>
                                    </div>
                                    <div className="relative">
                                        <Button className="w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-sm md:text-lg shadow-2xl transition-all group-hover:bg-primary/90">
                                            Upload Work
                                        </Button>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" 
                                        accept=".jpg,.jpeg,.png,.pdf" 
                                        onChange={handleFileSelect} 
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </aside>
            </div>

            {/* PREVIEW DIALOG MODAL */}
            <Dialog open={isModalPreviewOpen} onOpenChange={setIsModalPreviewOpen}>
                <DialogContent hideCloseButton className="max-w-6xl w-[95vw] h-[90vh] p-0 rounded-2xl md:rounded-[2rem] overflow-hidden border-none shadow-2xl bg-background/80 backdrop-blur-xl">
                    <DialogHeader className="p-8 pb-4 absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-background/90 to-transparent flex flex-row items-center justify-between">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Eye className="h-6 w-6 text-primary" /> Submission Preview
                        </DialogTitle>
                        <Button 
                            variant="ghost" 
                            className="h-10 w-10 rounded-xl hover:bg-primary/10 flex items-center justify-center shrink-0 z-[60]" 
                            onClick={() => setIsModalPreviewOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </DialogHeader>
                    <ScrollArea className="h-full pt-20 px-8 pb-10">
                        <div className="flex items-center justify-center min-h-[70vh]">
                            {modalPreviewType === 'image' ? (
                                <img 
                                    src={modalPreviewSrc!} 
                                    alt="Preview" 
                                    className="max-w-full h-auto rounded-xl md:rounded-2xl shadow-2xl ring-4 ring-primary/5"
                                />
                            ) : modalPreviewType === 'video' ? (
                                <iframe
                                    src={getEmbedUrl(modalPreviewSrc!)}
                                    className="w-full h-[75vh] rounded-xl md:rounded-2xl shadow-2xl border-none"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : (
                                <iframe 
                                    src={modalPreviewSrc!} 
                                    className="w-full h-[75vh] rounded-xl md:rounded-2xl shadow-2xl border-none"
                                />
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* FEEDBACK SUGGESTIONS DIALOG MODAL */}
            <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
                <DialogContent hideCloseButton className="max-w-2xl w-[95vw] p-0 rounded-2xl md:rounded-[2rem] overflow-hidden border-none shadow-2xl bg-zinc-950">
                    <DialogHeader className="p-8 pb-4 bg-zinc-900 border-b border-white/5 flex flex-row items-center justify-between relative mt-4">
                        <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-white">
                            <ShieldAlert className="h-6 w-6 text-destructive" /> Assessor Feedback
                        </DialogTitle>
                        <Button 
                            variant="ghost" 
                            className="h-10 w-10 rounded-xl hover:bg-white/10 flex items-center justify-center shrink-0 text-white" 
                            onClick={() => setIsFeedbackModalOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] p-8 bg-zinc-950">
                        <div className="space-y-6">
                            {parsedFeedback.map((fb, idx) => (
                                <div key={idx} className="flex gap-4 items-start p-6 bg-zinc-900 rounded-2xl border border-white/5 shadow-inner">
                                    <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-black text-xs shrink-0 ring-4 ring-destructive/5">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm font-bold text-zinc-300 leading-relaxed mt-0.5">
                                        {fb}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .winpharma-content iframe { 
                    width: 100% !important; 
                    aspect-ratio: 16/9; 
                    height: auto !important; 
                    border-radius: 1rem; 
                    margin: 0; 
                }
                @media (min-width: 768px) {
                    .winpharma-content iframe { border-radius: 2rem; margin: 1rem 0; }
                }
                .winpharma-content > *:first-child { margin-top: 0 !important; }
                .winpharma-content > *:last-child { margin-bottom: 0 !important; }
                .winpharma-content h1, .winpharma-content h2 { font-size: 2.5rem !important; font-weight: 900 !important; color: hsl(var(--primary)); margin-bottom: 1.5rem; }
            `}</style>
        </div>
    );
}
