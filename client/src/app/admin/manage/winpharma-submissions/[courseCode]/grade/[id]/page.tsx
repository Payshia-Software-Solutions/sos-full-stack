"use client";

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getWinPharmaSubmission,
    updateWinPharmaSubmission, 
    getWinpharmaCommonReasons,
    QA_API_BASE_URL 
} from '@/lib/actions/games';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
    Save,
    RotateCw,
    Download,
    PlusCircle,
    ClipboardList,
    Check,
    X,
    Eye,
    Search,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";

const SUBMISSION_BASE_URL = 'https://content-provider.pharmacollege.lk/content-provider/uploads/winpharma-submissions/';

export default function WinPharmaNestedGradingPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    
    const courseCode = params.courseCode as string;
    const submissionId = params.id as string;

    // States
    const [rotation, setRotation] = useState(0);
    const [editStatus, setEditStatus] = useState<string>('');
    const [editGrade, setEditGrade] = useState<string>('0.00');
    const [customNote, setCustomNote] = useState<string>('');
    const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>([]);
    const [isSuggestionsDialogOpen, setIsSuggestionsDialogOpen] = useState(false);
    const [suggestionSearch, setSuggestionSearch] = useState('');

    // Fetch submission
    const { data: submission, isLoading, isError } = useQuery({
        queryKey: ['adminWinPharmaSubmission', submissionId],
        queryFn: () => getWinPharmaSubmission(submissionId),
        enabled: !!submissionId,
    });

    // Fetch common reasons
    const { data: commonReasonsRaw } = useQuery({
        queryKey: ['winpharmaCommonReasons'],
        queryFn: getWinpharmaCommonReasons,
    });

    const commonReasons = useMemo(() => commonReasonsRaw || [], [commonReasonsRaw]);

    // Initialize states when data loads
    useEffect(() => {
        if (submission) {
            setEditStatus(submission.grade_status);
            setEditGrade(submission.grade || '0.00');
            
            // Handle existing reasons (could be IDs or text)
            const rawReason = submission.reason || '';
            if (rawReason) {
                // Check if it's formatted as IDs (comma separated numeric strings)
                const ids = rawReason.split(',').map(s => s.trim()).filter(s => /^\d+$/.test(s));
                if (ids.length > 0) {
                    setSelectedReasonIds(ids);
                } else {
                    setCustomNote(rawReason);
                }
            }
        }
    }, [submission]);

    const filteredReasons = useMemo(() => {
        if (!suggestionSearch) return commonReasons;
        return commonReasons.filter((r: any) => 
            r.reason.toLowerCase().includes(suggestionSearch.toLowerCase())
        );
    }, [commonReasons, suggestionSearch]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, formData }: { id: string | number, formData: FormData }) => updateWinPharmaSubmission(id, formData),
        onSuccess: async () => {
            toast({ title: "Grade Saved", description: "Submission has been updated successfully." });
            await queryClient.invalidateQueries({ queryKey: ['adminWinPharmaSubmissions', courseCode] });
            await queryClient.invalidateQueries({ queryKey: ['adminWinPharmaSubmission', submissionId] });
            
            // Navigate back to the course-specific dashboard and force a refresh
            router.push(`/admin/manage/winpharma-submissions/${courseCode}`);
            router.refresh();
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
        }
    });

    const handleSave = () => {
        if (!submission) return;

        const formData = new FormData();
        const reasonPayload = selectedReasonIds.join(',');
        
        formData.append('grade', editGrade);
        formData.append('grade_status', editStatus);
        formData.append('reason', reasonPayload);
        formData.append('update_by', user?.username || 'Admin');
        formData.append('update_at', new Date().toISOString().slice(0, 19).replace('T', ' '));

        updateMutation.mutate({ id: submissionId, formData });
    };

    const toggleReason = (id: string) => {
        setSelectedReasonIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (isLoading) return <div className="p-8"><Skeleton className="h-[80vh] w-full rounded-[2.5rem]" /></div>;
    if (isError || !submission) return <div className="p-8 text-center text-white">Submission not found.</div>;

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header / Navigation */}
            <header className="p-4 md:p-6 bg-zinc-950 border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push(`/admin/manage/winpharma-submissions/${courseCode}`)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 hover:bg-white/10 text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-white tracking-tight">Reviewing Submission</h1>
                        <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">{submission.index_number} • Level {submission.level_id} • {courseCode}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <Badge className={cn(
                        "rounded-lg px-3 py-1 font-black text-[10px] md:text-xs uppercase",
                        submission.grade_status === 'Pending' ? "bg-[#FFB700] text-white" :
                        submission.grade_status === 'Completed' ? "bg-[#198754] text-white" :
                        "bg-[#6D757D] text-white"
                    )}>
                        {submission.grade_status}
                    </Badge>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* LEFT: IMAGE PREVIEW */}
                <div className="flex-1 bg-zinc-900/50 p-4 md:p-8 flex flex-col overflow-hidden relative">
                    <div className="flex-1 relative bg-zinc-950 rounded-[2.5rem] shadow-2xl border border-white/5 flex items-center justify-center overflow-auto p-4 md:p-8 m-auto w-full group">
                        <div 
                            className="transition-transform duration-500 ease-out origin-center"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            <img 
                                src={`${SUBMISSION_BASE_URL}${submission.submission}`} 
                                alt="Student Submission" 
                                className="max-w-full h-auto shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] rounded-lg md:rounded-2xl"
                            />
                        </div>
                    </div>

                    <div className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-5 shrink-0 justify-center">
                        <Button onClick={() => setRotation(r => r + 90)} className="h-12 md:h-14 px-6 md:px-10 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm uppercase tracking-widest transition-all">
                            <RotateCw className="h-5 w-5 mr-3" /> Rotate View
                        </Button>
                        <Button asChild className="h-12 md:h-14 px-6 md:px-10 rounded-2xl bg-[#FFC107] text-[#333] hover:bg-[#e0a800] font-black text-sm uppercase tracking-widest transition-all">
                            <a href={`${SUBMISSION_BASE_URL}${submission.submission}`} download={`${submission.index_number}_L${submission.level_id}.jpg`}>
                                <Download className="h-5 w-5 mr-3" /> Save Local Copy
                            </a>
                        </Button>
                    </div>
                </div>

                {/* RIGHT: GRADING CONSOLE */}
                <aside className="w-full lg:w-[420px] p-6 md:p-10 space-y-8 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto">
                    <div className="space-y-6">
                        <header className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Grading Console</h4>
                                <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-md font-black text-[10px] py-0.5 px-2">ADMIN PANEL</Badge>
                            </div>
                            <div className="h-1.5 w-12 bg-primary rounded-full" />
                        </header>

                        <div className="space-y-8">
                            {/* Status Section */}
                            <div className="space-y-4">
                                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Execution Status</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'Completed', label: 'Pass / 100%', color: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
                                        { id: 'Try Again', label: 'Try Again', color: 'bg-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-500' },
                                        { id: 'Pending', label: 'In Review', color: 'bg-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
                                        { id: 'Sp-Pending', label: 'Special Cases', color: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500' }
                                    ].map((status) => (
                                        <button
                                            key={status.id}
                                            onClick={() => {
                                                setEditStatus(status.id);
                                                if (status.id === 'Completed') setEditGrade('100');
                                            }}
                                            className={cn(
                                                "p-4 rounded-[1.5rem] border-2 transition-all duration-300 text-left flex flex-col gap-2 group",
                                                editStatus === status.id 
                                                    ? `${status.color} border-transparent shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] ${status.color.replace('bg-', 'shadow-')}/40 scale-[0.98]` 
                                                    : `bg-zinc-900 border-white/5 hover:border-white/10`
                                            )}
                                        >
                                            <div className={cn(
                                                "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                                                editStatus === status.id ? "bg-white/20" : status.bg
                                            )}>
                                                {editStatus === status.id ? <Check className="h-4 w-4 text-white" /> : <div className={cn("h-2 w-2 rounded-full", status.color)} />}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-black uppercase tracking-tight",
                                                editStatus === status.id ? "text-white" : "text-zinc-300"
                                            )}>{status.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Grade Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Grading Score</Label>
                                    <span className="text-lg font-black text-primary drop-shadow-[0_0_10px_rgba(0,173,200,0.4)]">{editGrade}%</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input 
                                            value={editGrade} 
                                            onChange={(e) => setEditGrade(e.target.value)}
                                            className="h-16 md:h-20 bg-zinc-900 border-none rounded-[1.5rem] font-black text-2xl md:text-3xl text-primary text-center focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                        />
                                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-black text-primary/20">%</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {['100', '80', '50', '0'].map((val) => (
                                            <Button
                                                key={val}
                                                variant="ghost"
                                                onClick={() => setEditGrade(val)}
                                                className={cn(
                                                    "flex-1 h-12 rounded-xl font-black text-xs transition-all",
                                                    editGrade === val ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-zinc-900 text-zinc-400 hover:text-white"
                                                )}
                                            >
                                                {val}%
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Structured Feedback</Label>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setIsSuggestionsDialogOpen(true)}
                                        className="h-8 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all border border-primary/20"
                                    >
                                        <ClipboardList className="h-3 w-3" /> Select Reasons
                                    </Button>
                                </div>
                                
                                {selectedReasonIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {selectedReasonIds.map(id => {
                                            const reasonText = commonReasons.find((r: any) => String(r.id) === id)?.reason;
                                            return (
                                                <Badge 
                                                    key={id} 
                                                    className="bg-zinc-900 text-zinc-300 border-white/5 py-1.5 pl-3 pr-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold"
                                                >
                                                    <span className="truncate max-w-[200px]">{reasonText || `ID: ${id}`}</span>
                                                    <button onClick={() => toggleReason(id)} className="hover:text-rose-500 transition-colors">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500 opacity-50">Additional Comments</Label>
                                    <textarea
                                        value={customNote}
                                        onChange={(e) => setCustomNote(e.target.value)}
                                        placeholder="Add any specific remarks here..."
                                        className="w-full h-32 md:h-40 p-5 rounded-[1.5rem] bg-zinc-900 border-none text-white text-sm font-bold resize-none focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-zinc-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4 pt-4">
                                <Button 
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="w-full h-16 md:h-20 bg-primary text-white hover:bg-[#0092A8] rounded-3xl font-black text-lg gap-4 shadow-2xl shadow-primary/20 transition-all active:scale-95"
                                >
                                    {updateMutation.isPending ? <RefreshCw className="h-6 w-6 animate-spin" /> : <><Save className="h-6 w-6" /> SAVE GRADING</>}
                                </Button>
                                <Button variant="ghost" asChild className="w-full h-14 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                                    <a href={`${QA_API_BASE_URL}/levels/resource/${submission.resource_id}`} target="_blank">
                                        <Eye className="h-4 w-4 mr-3" /> Open Resource Details
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* SUGGESTIONS LIBRARY DIALOG */}
            <Dialog open={isSuggestionsDialogOpen} onOpenChange={setIsSuggestionsDialogOpen}>
                <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-zinc-950 md:rounded-[2.5rem]">
                    <DialogHeader className="p-8 border-b border-white/5 bg-zinc-900 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                                    <ClipboardList className="h-6 w-6 text-primary" /> Reasons Library
                                </DialogTitle>
                                <DialogDescription className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    Select common feedback notes to attach
                                </DialogDescription>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <Input 
                                placeholder="Filter suggestions..." 
                                value={suggestionSearch}
                                onChange={(e) => setSuggestionSearch(e.target.value)}
                                className="h-16 pl-14 bg-zinc-950 border-none rounded-2xl font-black text-white transition-all focus:ring-4 focus:ring-primary/10 shadow-inner"
                            />
                        </div>
                    </DialogHeader>

                    <div className="p-8 bg-zinc-950">
                        <ScrollArea className="h-[400px] w-full pr-4">
                            <div className="grid grid-cols-1 gap-3">
                                {filteredReasons.map((r: any) => {
                                    const isSelected = selectedReasonIds.includes(String(r.id));
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => toggleReason(String(r.id))}
                                            className={cn(
                                                "group p-5 text-left rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
                                                isSelected 
                                                    ? "bg-primary border-transparent text-white shadow-lg shadow-primary/20 scale-[0.99]" 
                                                    : "bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                                            )}
                                        >
                                            <div className="relative z-10 flex items-center justify-between gap-4">
                                                <span className="font-bold text-sm leading-relaxed">{r.reason}</span>
                                                <div className={cn(
                                                    "h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                    isSelected ? "bg-white/20" : "bg-zinc-800"
                                                )}>
                                                    {isSelected ? <Check className="h-3 w-3 text-white" /> : <PlusCircle className="h-3 w-3 opacity-30 group-hover:opacity-100" />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
