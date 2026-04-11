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
    getWinPharmaSubmissions,
    getWinPharmaSubmissionResults,
    getWinPharmaCommonReason,
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

const CONTENT_PROVIDER_BASE_URL = 'https://content-provider.pharmacollege.lk';
const SUBMISSION_BASE_URL = 'https://content-provider.pharmacollege.lk/content-provider/uploads/winpharma-submissions/';

export default function WinPharmaTaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const levelId = params.levelId as string;
    const taskId = params.taskId as string;
    
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Preview States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isModalPreviewOpen, setIsModalPreviewOpen] = useState(false);
    const [modalPreviewSrc, setModalPreviewSrc] = useState<string | null>(null);
    const [modalPreviewType, setModalPreviewType] = useState<'image' | 'pdf' | 'video' | null>(null);

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

    // Fetch common reason if rejected
    const { data: commonReason } = useQuery({
        queryKey: ['winPharmaCommonReason', currentSubmission?.reason],
        queryFn: () => getWinPharmaCommonReason(currentSubmission!.reason),
        enabled: !!currentSubmission?.reason && currentSubmission.grade_status === 'Try Again' && !isNaN(Number(currentSubmission.reason))
    });

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
        <div className="p-4 md:p-8 space-y-8 pb-32 animate-in fade-in duration-700">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex flex-col gap-5">
                    <Button onClick={() => router.push(`/dashboard/winpharma/${levelId}`)} variant="ghost" className="h-12 hover:bg-primary/10 rounded-full group">
                        <ArrowLeft className="mr-2 h-6 w-6 group-hover:-translate-x-1" /> <span className="font-black uppercase tracking-widest text-[10px]">Back to Level</span>
                    </Button>
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black">{isVideo ? <Video className="h-8 w-8" /> : <FileText className="h-8 w-8" />}</div>
                        <div><h1 className="text-5xl font-black tracking-tighter mb-2">{task.resource_title}</h1>{getStatusBadge(currentSubmission?.grade_status)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {prevTask && <Button onClick={() => router.push(`/dashboard/winpharma/${levelId}/${prevTask.resource_id || prevTask.id}`)} variant="outline" className="h-14 w-14 rounded-2xl"><ChevronLeft className="h-6 w-6" /></Button>}
                    {nextTask && <Button onClick={() => router.push(`/dashboard/winpharma/${levelId}/${nextTask.resource_id || nextTask.id}`)} variant="outline" className="h-14 w-14 rounded-2xl"><ChevronRight className="h-6 w-6" /></Button>}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
                <div className="min-w-0 space-y-10">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 ring-1 ring-black/5">
                        {task.task_cover && (
                            <div className="relative aspect-video lg:aspect-[21/9] w-full group overflow-hidden border-b-2 border-primary/5">
                                <Image 
                                    src={`${CONTENT_PROVIDER_BASE_URL}/${task.task_cover}`} 
                                    alt="Task Cover" 
                                    layout="fill" 
                                    objectFit="cover" 
                                    className="transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
                                    <div className="space-y-2">
                                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 uppercase text-[10px] font-black">Visual Reference</Badge>
                                        <h2 className="text-3xl font-black text-white drop-shadow-lg">{task.resource_title}</h2>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="p-10 md:p-14">
                            {helpVideoUrl && (
                                <div className="mb-10 flex justify-center">
                                    <Button 
                                        onClick={() => openPreviewModal(helpVideoUrl, 'video')} 
                                        className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 group"
                                    >
                                        <Video className="h-6 w-6 mr-3 transition-transform group-hover:scale-125" /> 
                                        Watch Helping Video
                                    </Button>
                                </div>
                            )}

                            {task.resource_data && task.resource_data.trim() !== "" ? (
                                <div className="prose prose-xl dark:prose-invert max-w-none winpharma-content font-medium leading-relaxed">
                                    {parse(task.resource_data)}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4 opacity-40">
                                    <FileQuestion className="h-16 w-16 mx-auto" />
                                    <p className="text-sm font-black uppercase tracking-[0.3em]">Module Content Not Available</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                
                <aside className="space-y-10 sticky top-10 self-start">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                        <div className="p-10 space-y-8">
                            <h3 className="text-2xl font-black uppercase">Submission</h3>
                            {selectedFile ? (
                                <div className="space-y-6">
                                    <div className="bg-background/90 p-8 rounded-[2.5rem] border-4 border-primary/20 shadow-2xl relative cursor-pointer" onClick={() => openPreviewModal(previewUrl || '', selectedFile.type === 'application/pdf' ? 'pdf' : 'image')}>
                                        {selectedFile.type.startsWith('image/') ? <img src={previewUrl!} className="w-full h-48 object-cover rounded-xl" /> : <div className="h-32 flex flex-col items-center justify-center p-4 bg-muted/20 rounded-2xl"><FileText className="h-12 w-12 text-primary" /><p className="text-xs mt-2 font-bold">{selectedFile.name}</p></div>}
                                        <Badge className="bg-primary text-white font-black absolute -top-4 right-4">Click to Preview</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4"><Button variant="outline" onClick={cancelSelection} className="h-16 rounded-2xl"><Trash2 className="h-4 w-4 mr-2" /> Discard</Button><Button onClick={confirmSubmission} disabled={isUploading} className="h-16 rounded-2xl bg-primary text-white font-black shadow-xl">{isUploading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Confirm & Send'}</Button></div>
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
                                                {commonReason && (
                                                    <Alert className="rounded-2xl border-2 border-destructive bg-destructive/10 text-destructive-foreground animate-in slide-in-from-top-2 duration-500 shadow-xl overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-2 h-full bg-destructive" />
                                                        <ShieldAlert className="h-5 w-5 text-destructive" />
                                                        <div className="ml-2">
                                                            <AlertTitle className="font-black uppercase text-[10px] tracking-[0.2em] mb-3 text-destructive">Correction Required</AlertTitle>
                                                            <AlertDescription className="text-sm font-bold leading-relaxed text-zinc-900 dark:text-zinc-100 bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-destructive/10">
                                                                {commonReason.reason}
                                                            </AlertDescription>
                                                        </div>
                                                    </Alert>
                                                )}
                                                <div className="relative overflow-hidden group">
                                                    <Button className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black uppercase text-[10px] shadow-lg group-hover:bg-primary transition-colors">
                                                        <Upload className="h-4 w-4 mr-2" /> Re-submit New Work
                                                    </Button>
                                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileSelect} />
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
                                    {currentSubmission.grade_status === 'Completed' && nextTask && <Button onClick={() => router.push(`/dashboard/winpharma/${levelId}/${nextTask.resource_id || nextTask.id}`)} className="w-full h-20 rounded-[2.5rem] bg-zinc-900 text-white font-black text-lg shadow-2xl">Next Task <ChevronRight className="ml-2 h-6 w-6" /></Button>}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="py-12 border-4 border-dashed border-primary/20 rounded-[3rem] text-center bg-background/30"><div className="h-20 w-20 bg-primary/20 rounded-[2.5rem] mx-auto flex items-center justify-center text-primary mb-6"><Upload className="h-10 w-10" /></div><h4 className="text-lg font-black uppercase">Select File</h4><p className="text-[10px] font-bold opacity-60">JPG, PNG, PDF</p></div>
                                    <div className="relative overflow-hidden"><Button className="w-full h-20 rounded-[2.5rem] font-black text-lg shadow-2xl">Upload Work</Button><Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileSelect} /></div>
                                </div>
                            )}
                            {task.task_cover && (
                                <div className="mt-8 pt-8 border-t-2 border-dashed border-primary/20 opacity-30 hover:opacity-100 transition-opacity">
                                     <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-primary/10 shadow-lg grayscale hover:grayscale-0 transition-all duration-700">
                                        <Image 
                                            src={`${CONTENT_PROVIDER_BASE_URL}/${task.task_cover}`} 
                                            alt="Cover" 
                                            layout="fill" 
                                            objectFit="cover" 
                                        />
                                    </div>
                                    <p className="text-[8px] font-black text-center mt-3 uppercase tracking-[0.4em]">Resource Visual Reference</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </aside>
            </div>

            {/* PREVIEW DIALOG MODAL */}
            <Dialog open={isModalPreviewOpen} onOpenChange={setIsModalPreviewOpen}>
                <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 rounded-[3rem] overflow-hidden border-none shadow-2xl bg-background/80 backdrop-blur-xl">
                    <DialogHeader className="p-8 pb-4 absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-background/90 to-transparent flex flex-row items-center justify-between">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Eye className="h-6 w-6 text-primary" /> Submission Preview
                        </DialogTitle>
                        <Button variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-primary/10" onClick={() => setIsModalPreviewOpen(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </DialogHeader>
                    <ScrollArea className="h-full pt-20 px-8 pb-10">
                        <div className="flex items-center justify-center min-h-[70vh]">
                            {modalPreviewType === 'image' ? (
                                <img 
                                    src={modalPreviewSrc!} 
                                    alt="Preview" 
                                    className="max-w-full h-auto rounded-[2rem] shadow-2xl ring-4 ring-primary/5"
                                />
                            ) : modalPreviewType === 'video' ? (
                                <iframe
                                    src={getEmbedUrl(modalPreviewSrc!)}
                                    className="w-full h-[75vh] rounded-[2rem] shadow-2xl border-none"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : (
                                <iframe 
                                    src={modalPreviewSrc!} 
                                    className="w-full h-[75vh] rounded-[2rem] shadow-2xl border-none"
                                />
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .winpharma-content iframe { width: 100% !important; aspect-ratio: 16/9; height: auto !important; border-radius: 3rem; margin: 40px 0; }
                .winpharma-content h1, .winpharma-content h2 { font-size: 2.5rem !important; font-weight: 900 !important; color: hsl(var(--primary)); margin-bottom: 2rem; }
            `}</style>
        </div>
    );
}
