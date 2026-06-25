"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Edit, Trash2, AlertTriangle, Loader2, Sparkles, Image as ImageIcon, Check, Flame, Smile, ShieldAlert } from "lucide-react";
import { getPrescriptions, savePrescription, deletePrescription, uploadPrescriptionImage, type Prescription } from '@/lib/actions/pharma-reader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { LMS_API_URL } from '@/lib/config';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function ManagePharmaReaderPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [prescriptionToEdit, setPrescriptionToEdit] = useState<Prescription | null>(null);
    const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [presName, setPresName] = useState('');
    const [difficulty, setDifficulty] = useState('Easy');
    const [imagePath, setImagePath] = useState('');
    const [activeStatus, setActiveStatus] = useState('Active');
    const [presHelp, setPresHelp] = useState('');
    const [question, setQuestion] = useState('');
    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [answer3, setAnswer3] = useState('');
    const [answer4, setAnswer4] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('answer_1');

    const { data: prescriptions, isLoading, isError, error } = useQuery<Prescription[]>({
        queryKey: ['pharmaReaderPrescriptions'],
        queryFn: getPrescriptions
    });

    const openForm = (pres: Prescription | null = null) => {
        if (pres) {
            setPrescriptionToEdit(pres);
            setPresName(pres.pres_name);
            setDifficulty(pres.difficulty);
            setImagePath(pres.image_path);
            setActiveStatus(pres.active_status);
            setPresHelp(pres.PresHelp);
            setQuestion(pres.prescription_question);
            setAnswer1(pres.answer_1);
            setAnswer2(pres.answer_2);
            setAnswer3(pres.answer_3);
            setAnswer4(pres.answer_4);
            setCorrectAnswer(pres.correct_answer);
        } else {
            setPrescriptionToEdit(null);
            setPresName('');
            setDifficulty('Easy');
            setImagePath('');
            setActiveStatus('Active');
            setPresHelp('');
            setQuestion('');
            setAnswer1('');
            setAnswer2('');
            setAnswer3('');
            setAnswer4('');
            setCorrectAnswer('answer_1');
        }
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setPrescriptionToEdit(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setIsUploading(true);
        try {
            const res = await uploadPrescriptionImage(formData);
            if (res.success) {
                setImagePath(res.filePath);
                toast({ title: 'Image uploaded successfully!' });
            } else {
                toast({ variant: 'destructive', title: 'Upload failed' });
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const saveMutation = useMutation({
        mutationFn: (data: Partial<Prescription>) => savePrescription(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmaReaderPrescriptions'] });
            toast({ title: prescriptionToEdit ? 'Prescription Updated!' : 'Prescription Added!' });
            closeForm();
        },
        onError: (err: Error) => toast({ variant: "destructive", title: 'Save Failed', description: err.message }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePrescription(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmaReaderPrescriptions'] });
            toast({ title: 'Prescription Deleted' });
            setPrescriptionToDelete(null);
        },
        onError: (err: Error) => toast({ variant: "destructive", title: 'Delete Failed', description: err.message }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!presName || !imagePath || !question || !answer1 || !answer2 || !answer3 || !answer4) {
            toast({ variant: 'destructive', title: 'All fields are required.' });
            return;
        }
        const payload: Partial<Prescription> = {
            pres_name: presName,
            difficulty,
            image_path: imagePath,
            active_status: activeStatus,
            PresHelp: presHelp,
            prescription_question: question,
            answer_1: answer1,
            answer_2: answer2,
            answer_3: answer3,
            answer_4: answer4,
            correct_answer: correctAnswer
        };
        if (prescriptionToEdit) {
            payload.id = prescriptionToEdit.id;
        }
        saveMutation.mutate(payload);
    };

    const formatImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads')) return `${LMS_API_URL}${path}`;
        return `https://content-provider.pharmacollege.lk/content-provider/uploads/pharma-reader/${path}`;
    };

    const difficultyOptions = [
        { val: 'Easy', label: 'Easy', icon: Smile, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
        { val: 'Medium', label: 'Medium', icon: Flame, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' },
        { val: 'Hard', label: 'Hard', icon: ShieldAlert, color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30' },
    ];

    const answerFields = [
        { id: 'answer_1', label: 'Option 1', value: answer1, setter: setAnswer1 },
        { id: 'answer_2', label: 'Option 2', value: answer2, setter: setAnswer2 },
        { id: 'answer_3', label: 'Option 3', value: answer3, setter: setAnswer3 },
        { id: 'answer_4', label: 'Option 4', value: answer4, setter: setAnswer4 },
    ] as const;

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 w-full">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="-ml-4 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Management
                    </Button>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-purple-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Pharma Reader Setup</h1>
                            <p className="text-muted-foreground">Manage prescription slides, questions, and MCQ option mappings.</p>
                        </div>
                    </div>
                </div>
                <Button onClick={() => openForm()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/20">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Prescription
                </Button>
            </header>

            {/* Prescriptions Grid */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />)}
                </div>
            ) : isError ? (
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <div>
                            <CardTitle>Error Loading Prescriptions</CardTitle>
                            <CardDescription className="text-destructive/80">{(error as Error).message}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            ) : prescriptions?.length === 0 ? (
                <Card className="text-center p-8 border-dashed">
                    <CardHeader>
                        <div className="mx-auto bg-muted p-4 rounded-full w-fit">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-4">No Prescriptions Yet</CardTitle>
                        <CardDescription>Get started by creating your first prescription quiz slide.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => openForm()} variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create First Slide
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {prescriptions?.map((pres) => (
                        <Card key={pres.id} className="overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div className="relative h-48 bg-muted border-b flex items-center justify-center overflow-hidden">
                                    {pres.image_path ? (
                                        <img src={formatImageUrl(pres.image_path)} alt={pres.pres_name} className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                    )}
                                    <div className="absolute top-2 left-2 flex gap-1.5">
                                        <Badge className={
                                            pres.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/10 border-0' :
                                            pres.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-0' :
                                            'bg-rose-500/10 text-rose-500 hover:bg-rose-500/10 border-0'
                                        }>
                                            {pres.difficulty}
                                        </Badge>
                                        <Badge variant={pres.active_status === 'Active' ? 'default' : 'secondary'}>
                                            {pres.active_status}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-lg font-bold">{pres.pres_name}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs">{pres.prescription_question?.replace(/<[^>]*>/g, '')}</CardDescription>
                                </CardHeader>
                            </div>
                            <CardContent className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-muted/50 bg-muted/5">
                                <span className="text-xs text-muted-foreground">
                                    Correct: <span className="font-semibold text-foreground">{pres.correct_answer.replace('_', ' ')}</span>
                                </span>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" onClick={() => openForm(pres)} className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" onClick={() => setPrescriptionToDelete(pres)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ─── Add / Edit Dialog ─── */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
                    <DialogHeader className="pb-2 border-b">
                        <DialogTitle className="text-lg font-bold">
                            {prescriptionToEdit ? 'Edit Prescription Quiz' : 'Add New Prescription Quiz'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Setup the slide image, the question, and mapping choices.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-1">

                        {/* ── Row 1: Name + Difficulty + Status ── */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pres_name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Prescription Name
                                </Label>
                                <Input
                                    id="pres_name"
                                    value={presName}
                                    onChange={(e) => setPresName(e.target.value)}
                                    placeholder="e.g., Prescription 1"
                                />
                            </div>

                            {/* Difficulty toggle buttons */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</Label>
                                <div className="flex gap-1.5">
                                    {difficultyOptions.map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = difficulty === opt.val;
                                        return (
                                            <Button
                                                key={opt.val}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className={cn(
                                                    "flex items-center gap-1 h-9 px-3 text-xs font-bold border transition-all",
                                                    isSelected ? opt.color : "hover:bg-muted text-muted-foreground"
                                                )}
                                                onClick={() => setDifficulty(opt.val)}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {opt.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status Switch */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</Label>
                                <div className="flex items-center gap-3 h-9 px-1">
                                    <Switch
                                        id="active-status"
                                        checked={activeStatus === 'Active'}
                                        onCheckedChange={(checked) => setActiveStatus(checked ? 'Active' : 'Inactive')}
                                        className="data-[state=checked]:bg-indigo-600"
                                    />
                                    <Label
                                        htmlFor="active-status"
                                        className={cn(
                                            "text-sm font-semibold cursor-pointer transition-colors",
                                            activeStatus === 'Active' ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
                                        )}
                                    >
                                        {activeStatus}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* ── Row 2: Image (left) + Question (right) ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image Upload Zone */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Prescription Image
                                </Label>
                                <div
                                    className={cn(
                                        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer group min-h-[180px]",
                                        imagePath
                                            ? "border-indigo-500/40 bg-indigo-500/5"
                                            : "border-muted-foreground/20 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                            <span className="text-xs font-medium">Uploading...</span>
                                        </div>
                                    ) : imagePath ? (
                                        <>
                                            <img
                                                src={formatImageUrl(imagePath)}
                                                alt="Preview"
                                                className="max-h-[155px] w-full object-contain rounded-lg px-3 py-2"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="bg-background/90 text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5">
                                                    <ImageIcon className="w-3.5 h-3.5" /> Change Image
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
                                            <div className="p-3 rounded-full bg-muted group-hover:bg-muted/80 transition-colors">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-semibold">Click to upload</span>
                                            <span className="text-xs opacity-50">PNG, JPG, WEBP</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Question / Prompt */}
                            <div className="space-y-1.5 flex flex-col">
                                <Label htmlFor="question" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Question / Prompt
                                </Label>
                                <Textarea
                                    id="question"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="e.g., What is the possible diagnosis?"
                                    className="flex-1 min-h-[148px] resize-none text-sm"
                                />
                            </div>
                        </div>

                        {/* ── Row 3: Hint / Help ── */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Hint / Help Context{' '}
                                <span className="text-muted-foreground/60 normal-case font-normal">(optional)</span>
                            </Label>
                            <div className="[&_.ql-container]:min-h-[90px] [&_.ql-editor]:min-h-[90px] [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md">
                                <ReactQuill
                                    theme="snow"
                                    value={presHelp}
                                    onChange={setPresHelp}
                                    placeholder="Provide optional clues to help the student read the prescription."
                                    className="bg-background rounded-md"
                                />
                            </div>
                        </div>

                        {/* ── Row 4: Answer Choices ── */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Answer Choices
                                </span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {answerFields.map((opt) => (
                                    <div key={opt.id} className="space-y-1.5">
                                        <Label htmlFor={opt.id} className="text-xs font-medium text-muted-foreground">
                                            {opt.label}
                                        </Label>
                                        <Input
                                            id={opt.id}
                                            value={opt.value}
                                            onChange={(e) => opt.setter(e.target.value)}
                                            placeholder={`Type ${opt.label}…`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Row 5: Correct Answer Picker ── */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                    Mark Correct Answer
                                </span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    { val: 'answer_1', label: 'Option 1', text: answer1 },
                                    { val: 'answer_2', label: 'Option 2', text: answer2 },
                                    { val: 'answer_3', label: 'Option 3', text: answer3 },
                                    { val: 'answer_4', label: 'Option 4', text: answer4 },
                                ].map((opt) => {
                                    const isSelected = correctAnswer === opt.val;
                                    return (
                                        <Button
                                            key={opt.val}
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-3 h-auto min-h-[68px] border-2 transition-all text-center rounded-xl",
                                                isSelected
                                                    ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                                                    : "border-muted hover:border-muted-foreground/40 text-muted-foreground"
                                            )}
                                            onClick={() => setCorrectAnswer(opt.val)}
                                        >
                                            <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-0.5">{opt.label}</span>
                                            <span className="text-sm font-medium truncate w-full px-1">{opt.text || '—'}</span>
                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 bg-green-500 text-white rounded-full p-0.5">
                                                    <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                                                </div>
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <DialogFooter className="pt-4 border-t gap-2">
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                            >
                                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {prescriptionToEdit ? 'Update Prescription' : 'Save Prescription'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Confirmation ─── */}
            <AlertDialog open={!!prescriptionToDelete} onOpenChange={(open) => !open && setPrescriptionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Prescription</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{prescriptionToDelete?.pres_name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => prescriptionToDelete && deleteMutation.mutate(prescriptionToDelete.id)}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
