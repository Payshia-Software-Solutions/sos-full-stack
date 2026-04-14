"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TemplateEditor, TemplateEditorRef } from "@/components/admin/TemplateEditor";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    Save, 
    Cake, 
    Mail, 
    MessageSquare, 
    Info, 
    Send, 
    History, 
    Users, 
    CheckCircle2, 
    AlertCircle,
    Calendar,
    ArrowRight,
    Eye
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function BirthdayWishesPage() {
    const [settings, setSettings] = useState({
        id: 1,
        sms_template: "",
        email_subject: "",
        email_template: "",
        is_sms_enabled: false,
        is_email_enabled: false
    });
    const [loading, setLoading] = useState(true);
    const [serverTime, setServerTime] = useState<{server_time: string, server_timezone: string, local_time: string, uk_time: string} | null>(null);
    const [testRecipient, setTestRecipient] = useState("");
    const [testType, setTestType] = useState<"sms" | "email" | null>(null);
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [lastFocused, setLastFocused] = useState<{ id: string, name: string } | null>(null);
    const smsEditorRef = useRef<TemplateEditorRef>(null);
    const emailSubjectEditorRef = useRef<TemplateEditorRef>(null);
    const emailTemplateEditorRef = useRef<TemplateEditorRef>(null);

    // Dashboard State
    const [birthdayLists, setBirthdayLists] = useState<Record<string, any[]>>({
        yesterday: [],
        today: [],
        tomorrow: [],
        custom: []
    });
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("today");
    const [customDate, setCustomDate] = useState<Date | undefined>(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedLogContent, setSelectedLogContent] = useState<{name: string, content: string, type: string} | null>(null);
    const [isViewMessageDialogOpen, setIsViewMessageDialogOpen] = useState(false);
    const [isListLoading, setIsListLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isManualSendLoading, setIsManualSendLoading] = useState(false);
    
    // Update local clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Manual Send Dialog State
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [manualType, setManualType] = useState<"sms" | "email">("sms");
    const [manualContent, setManualContent] = useState("");
    const [manualSubject, setManualSubject] = useState("");

    const API_BASE_URL = process.env.NEXT_PUBLIC_LMS_SERVER_URL || "https://qa-api.pharmacollege.lk";

    useEffect(() => {
        fetchSettings();
        fetchServerTime();
        fetchHistory();
    }, []);

    useEffect(() => {
        if (activeTab === "custom") {
            if (customDate) fetchBirthdayList("custom", customDate);
        } else {
            fetchBirthdayList(activeTab);
        }
    }, [activeTab, customDate]);

    const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/birthday-wishes/history/`);
            const result = await response.json();
            if (result.status === "success") {
                setHistory(result.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const fetchBirthdayList = async (tabName: string, specificDate?: Date) => {
        setIsListLoading(true);
        try {
            // Calculate the actual date string to send
            const date = specificDate ? new Date(specificDate) : new Date();
            
            if (!specificDate) {
                if (tabName === 'yesterday') {
                    date.setDate(date.getDate() - 1);
                } else if (tabName === 'tomorrow') {
                    date.setDate(date.getDate() + 1);
                }
            }
            
            // Format as YYYY-MM-DD in local time
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const response = await fetch(`${API_BASE_URL}/birthday-wishes/list/?day=${dateStr}`);
            const result = await response.json();
            if (result.status === "success") {
                setBirthdayLists(prev => ({ ...prev, [tabName]: result.data }));
            }
        } catch (error) {
            console.error(`Error fetching ${tabName} birthdays:`, error);
        } finally {
            setIsListLoading(false);
        }
    };

    const fetchServerTime = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/birthday-settings/system-time/`);
            const result = await response.json();
            if (result.status === "success") {
                setServerTime(result.data);
            }
        } catch (error) {
            console.error("Error fetching server time:", error);
        }
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/birthday-settings/`);
            const result = await response.json();
            if (result.status === "success") {
                setSettings(result.data);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load birthday settings."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/birthday-settings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            });
            const result = await response.json();
            if (result.status === "success") {
                toast({
                    title: "Settings Saved",
                    description: "Birthday wish settings have been updated."
                });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save settings."
            });
        }
    };

    const handleOpenManualSend = (student: any, type: "sms" | "email") => {
        setSelectedStudent(student);
        setManualType(type);
        
        // Prepare content with placeholders replaced
        const firstName = student.first_name || 'Student';
        const lastName = student.last_name || '';
        const fullName = `${firstName} ${lastName}`;
        const studentId = student.student_id || '';
        const nameWithInitials = student.name_with_initials || '';
        const nic = student.nic || '';
        const mobile = trimPhone(student.telephone_1 || student.telephone_2 || '');
        const email = student.e_mail || '';

        const placeholders: Record<string, string> = {
            '{{FIRST_NAME}}': firstName,
            '{{LAST_NAME}}': lastName,
            '{{FULL_NAME}}': fullName,
            '{{STUDENT_ID}}': studentId,
            '{{NAME_WITH_INITIALS}}': nameWithInitials,
            '{{NIC}}': nic,
            '{{EMAIL}}': email
        };

        let content = type === "sms" ? settings.sms_template : settings.email_template;
        let subject = type === "email" ? settings.email_subject : "";

        Object.entries(placeholders).forEach(([tag, val]) => {
            content = content.split(tag).join(val);
            if (subject) subject = subject.split(tag).join(val);
        });

        setManualContent(content);
        setManualSubject(subject);
        setIsManualDialogOpen(true);
    };

    const trimPhone = (phi: string) => {
        const p = phi?.trim() || '';
        if (p && !p.startsWith('0') && p.length === 9) return '0' + p;
        return p;
    };

    const handleExecuteManualSend = async () => {
        if (!selectedStudent) return;
        setIsManualSendLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/birthday-wishes/send-manual/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: manualType,
                    student_id: selectedStudent.student_id,
                    student_name: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
                    recipient: manualType === "sms" ? trimPhone(selectedStudent.telephone_1 || selectedStudent.telephone_2) : selectedStudent.e_mail,
                    template: manualContent,
                    subject: manualSubject
                })
            });

            const result = await response.json();
            if (result.status === "success") {
                toast({
                    title: "Message Sent",
                    description: `Manually sent ${manualType.toUpperCase()} to ${selectedStudent.first_name}.`
                });
                setIsManualDialogOpen(false);
                fetchHistory(); // Refresh history
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Send Failed",
                description: error.message || "An error occurred while sending."
            });
        } finally {
            setIsManualSendLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testRecipient) {
            toast({ variant: "destructive", title: "Missing Recipient", description: "Please enter a test recipient." });
            return;
        }

        setIsTestLoading(true);
        try {
            const template = testType === "sms" ? settings.sms_template : settings.email_template;
            const subject = testType === "email" ? settings.email_subject : "";

            const response = await fetch(`${API_BASE_URL}/birthday-settings/send-test/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: testType,
                    recipient: testRecipient,
                    template,
                    subject
                })
            });
            const result = await response.json();
            if (result.status === "success") {
                toast({ title: "Test Sent", description: `Test ${testType?.toUpperCase()} sent successfully to ${testRecipient}.` });
                setIsDialogOpen(false);
                setTestRecipient("");
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error("Error sending test:", error);
            toast({ variant: "destructive", title: "Test Failed", description: error.message || "Failed to send test message." });
        } finally {
            setIsTestLoading(false);
        }
    };

    const insertPlaceholder = (placeholder: string) => {
        if (!lastFocused) {
            toast({
                title: "Select a field first",
                description: "Click inside a message template field to insert the placeholder.",
            });
            return;
        }

        if (lastFocused.id === 'sms_template') {
            smsEditorRef.current?.insertPlaceholder(placeholder);
        } else if (lastFocused.id === 'email_subject') {
            emailSubjectEditorRef.current?.insertPlaceholder(placeholder);
        } else if (lastFocused.id === 'email_template') {
            emailTemplateEditorRef.current?.insertPlaceholder(placeholder);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
    }

    const placeholders = [
        "{{FIRST_NAME}}", "{{LAST_NAME}}", "{{FULL_NAME}}", 
        "{{STUDENT_ID}}", "{{NIC}}", "{{EMAIL}}", "{{NAME_WITH_INITIALS}}"
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 pb-20 w-full max-w-[1600px] mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-headline font-bold flex items-center gap-3 tracking-tight">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2 rounded-xl shadow-lg ring-4 ring-pink-500/10">
                            <Cake className="h-8 w-8 text-white" />
                        </div>
                        Birthday Management
                    </h1>
                    <p className="text-muted-foreground text-lg ml-1">Automate greetings and monitor delivery status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost"
                        onClick={fetchHistory}
                        disabled={isHistoryLoading}
                        className="h-12 px-5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                        <History className={`h-5 w-5 ${isHistoryLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        className="h-12 px-8 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:opacity-90 shadow-xl transition-all active:scale-95 text-lg font-medium rounded-xl"
                    >
                        <Save className="mr-2 h-5 w-5" /> Save Configuration
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Lists */}
                <div className="xl:col-span-2 space-y-8">
                    <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden bg-card/40 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Birthday Lists
                                </CardTitle>
                                <Badge variant="outline" className="font-mono text-[10px] px-2 py-0 border-primary/20 text-primary">
                                    REAL-TIME
                                </Badge>
                            </div>
                            <CardDescription>View upcoming birthdays and send manual wishes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                                    <TabsList className="grid grid-cols-3 sm:flex sm:grid-cols-none gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl h-12">
                                        <TabsTrigger value="yesterday" className="rounded-xl px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">Yesterday</TabsTrigger>
                                        <TabsTrigger value="today" className="rounded-xl px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">Today</TabsTrigger>
                                        <TabsTrigger value="tomorrow" className="rounded-xl px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">Tomorrow</TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal rounded-xl h-12 border-border/50 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all",
                                                    !customDate && "text-muted-foreground",
                                                    activeTab === "custom" && "ring-2 ring-primary border-primary/50"
                                                )}
                                                onClick={() => setActiveTab("custom")}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-border/50 shadow-2xl" align="end">
                                            <CalendarComponent
                                                mode="single"
                                                selected={customDate}
                                                onSelect={(date) => {
                                                    setCustomDate(date);
                                                    setActiveTab("custom");
                                                }}
                                                initialFocus
                                                className="p-3"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {activeTab === "custom" && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-12 w-12 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                            onClick={() => setActiveTab("today")}
                                        >
                                            <ArrowRight className="h-5 w-5 rotate-180" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                {["yesterday", "today", "tomorrow", "custom"].map((day) => (
                                    <TabsContent key={day} value={day} className="mt-0 focus-visible:ring-0">
                                        {isListLoading ? (
                                            <div className="space-y-4 py-8">
                                                <Skeleton className="h-12 w-full rounded-xl" />
                                                <Skeleton className="h-12 w-full rounded-xl" />
                                                <Skeleton className="h-12 w-full rounded-xl" />
                                            </div>
                                        ) : birthdayLists[day]?.length === 0 ? (
                                            <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-border/60">
                                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full w-fit mx-auto mb-4">
                                                    <Cake className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                                </div>
                                                <h3 className="text-xl font-semibold mb-1">No Birthdays Found</h3>
                                                <p className="text-muted-foreground">There are no students celebrating their birthday for this date.</p>
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-border/50 overflow-hidden bg-white dark:bg-slate-950/40">
                                                <Table>
                                                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                                        <TableRow>
                                                            <TableHead className="py-4 pl-6">Student</TableHead>
                                                            <TableHead>Contact Info</TableHead>
                                                            <TableHead className="text-right pr-6">Manual Send</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {birthdayLists[day]?.map((student) => (
                                                            <TableRow key={student.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors border-border/40">
                                                                <TableCell className="py-4 pl-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-slate-800 dark:text-slate-100">{student.first_name} {student.last_name}</span>
                                                                        <span className="text-[10px] font-mono opacity-60 uppercase">{student.student_id}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        {student.telephone_1 || student.telephone_2 ? (
                                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                                <MessageSquare className="h-3 w-3" />
                                                                                {trimPhone(student.telephone_1 || student.telephone_2)}
                                                                            </div>
                                                                        ) : null}
                                                                        {student.e_mail ? (
                                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                                <Mail className="h-3 w-3" />
                                                                                {student.e_mail}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right pr-6">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            className="h-9 w-9 p-0 hover:bg-emerald-500/10 hover:text-emerald-600 rounded-lg border border-transparent hover:border-emerald-500/20"
                                                                            onClick={() => handleOpenManualSend(student, "sms")}
                                                                            disabled={!settings.is_sms_enabled}
                                                                        >
                                                                            <MessageSquare className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm" 
                                                                            className="h-9 w-9 p-0 hover:bg-blue-500/10 hover:text-blue-600 rounded-lg border border-transparent hover:border-blue-500/20"
                                                                            onClick={() => handleOpenManualSend(student, "email")}
                                                                            disabled={!settings.is_email_enabled}
                                                                        >
                                                                            <Mail className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Configuration Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* SMS CARD */}
                        <Card className="group relative overflow-hidden bg-card/50 border-border/50 shadow-xl rounded-3xl">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                            <MessageSquare className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <CardTitle className="text-xl">SMS Channel</CardTitle>
                                    </div>
                                    <Switch 
                                        className="data-[state=checked]:bg-emerald-500"
                                        checked={!!settings.is_sms_enabled} 
                                        onCheckedChange={(val) => setSettings({...settings, is_sms_enabled: val})} 
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold uppercase opacity-60">Template</Label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={() => { setTestType("sms"); setIsDialogOpen(true); }}>
                                            <Send className="h-3 w-3" /> Test
                                        </Button>
                                    </div>
                                    <TemplateEditor 
                                        id="sms_template" 
                                        ref={smsEditorRef}
                                        content={settings.sms_template}
                                        onFocus={() => setLastFocused({ id: 'sms_template', name: 'SMS Template' })}
                                        onChange={(val) => setSettings({...settings, sms_template: val})}
                                        className="min-h-[120px] text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* EMAIL CARD */}
                        <Card className="group relative overflow-hidden bg-card/50 border-border/50 shadow-xl rounded-3xl">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                            <Mail className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <CardTitle className="text-xl">Email Channel</CardTitle>
                                    </div>
                                    <Switch 
                                        className="data-[state=checked]:bg-blue-500"
                                        checked={!!settings.is_email_enabled} 
                                        onCheckedChange={(val) => setSettings({...settings, is_email_enabled: val})} 
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase opacity-60">Subject</Label>
                                    <TemplateEditor 
                                        id="email_subject" 
                                        ref={emailSubjectEditorRef}
                                        content={settings.email_subject}
                                        onFocus={() => setLastFocused({ id: 'email_subject', name: 'Email Subject' })}
                                        onChange={(val) => setSettings({...settings, email_subject: val})}
                                        className="min-h-[40px] text-sm px-3"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold uppercase opacity-60">Body</Label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={() => { setTestType("email"); setIsDialogOpen(true); }}>
                                            <Send className="h-3 w-3" /> Test
                                        </Button>
                                    </div>
                                    <TemplateEditor 
                                        id="email_template" 
                                        ref={emailTemplateEditorRef}
                                        content={settings.email_template}
                                        onFocus={() => setLastFocused({ id: 'email_template', name: 'Email Template' })}
                                        onChange={(val) => setSettings({...settings, email_template: val})}
                                        className="min-h-[120px] text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* RIGHT COLUMN: History & Automation */}
                <div className="space-y-8">
                    {/* Placeholder Guide */}
                    <Card className="bg-blue-600 dark:bg-blue-700 text-blue-50 border-none rounded-3xl shadow-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 -mr-12 -mt-12 bg-white/10 rounded-full blur-3xl" />
                        <CardTitle className="text-xl mb-4 flex items-center gap-2 relative">
                            <Info className="h-5 w-5" />
                            Smart Placeholders
                        </CardTitle>
                        <div className="flex flex-wrap gap-1.5 relative">
                            {placeholders.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => insertPlaceholder(p)}
                                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 transition-all rounded-lg border border-white/20 text-[10px] font-mono font-bold"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Sent History */}
                    <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden flex flex-col h-fit">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" />
                                Sent History
                            </CardTitle>
                            <CardDescription>Latest 50 deliveries via automated CRON or manual send.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px]">
                                {isHistoryLoading ? (
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-20 px-4">
                                        <p className="text-muted-foreground text-sm">No history records yet.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/40">
                                        {history.map((log) => (
                                            <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold truncate max-w-[150px]">{log.student_name}</span>
                                                        <span className="text-[10px] opacity-60">{new Date(log.sent_at).toLocaleString()}</span>
                                                    </div>
                                                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className={`text-[9px] px-1.5 h-4 flex items-center gap-1 ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/10 border-rose-500/20'}`}>
                                                        {log.status === 'success' ? <CheckCircle2 className="h-2 w-2" /> : <AlertCircle className="h-2 w-2" />}
                                                        {log.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-2">
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        {log.type === 'sms' ? <MessageSquare className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                                                        {log.recipient}
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-6 gap-1 px-1.5 text-[9px] hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                                                        onClick={() => {
                                                            setSelectedLogContent({
                                                                name: log.student_name,
                                                                content: log.message_content,
                                                                type: log.type
                                                            });
                                                            setIsViewMessageDialogOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-3 w-3" /> View Msg
                                                    </Button>
                                                </div>
                                                {log.error_message && (
                                                    <p className="text-[9px] text-rose-500 mt-1 font-mono uppercase bg-rose-50 dark:bg-rose-950/20 px-1 py-0.5 rounded italic">
                                                        Err: {log.error_message}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Automation Helper */}
                    <Card className="bg-slate-900 text-slate-100 border-none rounded-3xl shadow-xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-widest opacity-80">
                                <Calendar className="h-4 w-4" />
                                Automation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="group cursor-default">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse"></div>
                                            <p className="text-[10px] uppercase opacity-50 font-bold tracking-wider">Server (UK)</p>
                                        </div>
                                        <p className="text-2xl font-mono font-bold leading-none">
                                            {currentTime.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false })}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 opacity-20 mb-1" />
                                    <div className="text-right group cursor-default">
                                        <div className="flex items-center justify-end gap-1.5 mb-1">
                                            <p className="text-[10px] uppercase opacity-50 font-bold tracking-wider text-rose-400">Lanka</p>
                                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                        </div>
                                        <p className="text-2xl font-mono font-bold leading-none text-rose-400">
                                            {currentTime.toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo', hour12: false })}
                                        </p>
                                    </div>
                                </div>
                                
                                {(() => {
                                    // Calculate hours difference between UK and Lanka
                                    const ukStr = currentTime.toLocaleString('en-US', { timeZone: 'Europe/London' });
                                    const lkStr = currentTime.toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
                                    const ukDate = new Date(ukStr);
                                    const lkDate = new Date(lkStr);
                                    const diffHours = (lkDate.getTime() - ukDate.getTime()) / (1000 * 60 * 60);
                                    
                                    // To trigger at 07:00 AM Lanka Time on a UK Server:
                                    let targetHour = 7 - diffHours;
                                    if (targetHour < 0) targetHour += 24;
                                    const wholeHour = Math.floor(targetHour);
                                    const mins = Math.round((targetHour - wholeHour) * 60);
                                    const cronExpr = `${mins} ${wholeHour} * * *`;

                                        return (
                                            <div className="space-y-2 pt-2 border-t border-white/10">
                                                <p className="text-[11px] opacity-70 italic leading-snug">
                                                    Use this CRON to trigger exactly at 07:00 AM SL time:
                                                </p>
                                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl text-xs font-mono group">
                                                    <span className="text-rose-300 font-bold">{cronExpr}</span>
                                                    <Button variant="ghost" size="sm" className="h-6 p-0 hover:text-white" onClick={() => navigator.clipboard.writeText(cronExpr)}>
                                                        Copy
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Manual Send Confirmation / Edit Dialog */}
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogContent className="sm:max-w-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                            {manualType === "sms" ? <MessageSquare className="h-6 w-6 text-emerald-500" /> : <Mail className="h-6 w-6 text-blue-500" />}
                            Manual Birthday Wish
                        </DialogTitle>
                        <DialogDescription>
                            Review and personalize the message for <strong>{selectedStudent?.first_name} {selectedStudent?.last_name}</strong> before sending.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Recipient</Label>
                                <p className="text-sm font-medium">{manualType === "sms" ? trimPhone(selectedStudent?.telephone_1 || selectedStudent?.telephone_2) : selectedStudent?.e_mail}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Student ID</Label>
                                <p className="text-sm font-medium">{selectedStudent?.student_id}</p>
                            </div>
                        </div>

                        {manualType === "email" && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Subject Line</Label>
                                <Input value={manualSubject} onChange={(e) => setManualSubject(e.target.value)} className="rounded-xl border-border/50" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">Message Content</Label>
                            <ScrollArea className="h-[200px] rounded-xl border border-border/50 p-4 bg-slate-50 dark:bg-slate-900/50">
                                <textarea 
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm h-full resize-none font-sans"
                                    value={manualContent}
                                    onChange={(e) => setManualContent(e.target.value)}
                                    rows={8}
                                />
                            </ScrollArea>
                        </div>
                    </div>

                    <DialogFooter className="gap-4 sm:justify-between">
                        <Button variant="ghost" onClick={() => setIsManualDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button 
                            onClick={handleExecuteManualSend} 
                            disabled={isManualSendLoading}
                            className={`min-w-[140px] rounded-xl shadow-lg ring-offset-2 focus:ring-2 ${manualType === "sms" ? "bg-emerald-600 hover:bg-emerald-700 ring-emerald-500/30" : "bg-blue-600 hover:bg-blue-700 ring-blue-500/30"}`}
                        >
                            {isManualSendLoading ? "Sending..." : `Send ${manualType.toUpperCase()} Now`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Test Send Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Send Test {testType?.toUpperCase()}</DialogTitle>
                        <DialogDescription>Use this to verify your template and gateway connection.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="recipient">{testType === "sms" ? "Mobile Number" : "Email Address"}</Label>
                            <Input
                                id="recipient"
                                placeholder={testType === "sms" ? "07xxxxxxxx" : "test@example.com"}
                                value={testRecipient}
                                onChange={(e) => setTestRecipient(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            onClick={handleSendTest} 
                            disabled={isTestLoading}
                            className={`w-full rounded-xl ${testType === "sms" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {isTestLoading ? "Sending..." : "Send Test Message"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View History Message Dialog */}
            <Dialog open={isViewMessageDialogOpen} onOpenChange={setIsViewMessageDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${selectedLogContent?.type === 'sms' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {selectedLogContent?.type === 'sms' ? <MessageSquare className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            </div>
                            <DialogTitle>Sent Message</DialogTitle>
                        </div>
                        <DialogDescription>
                            Historical {selectedLogContent?.type.toUpperCase()} sent to <strong>{selectedLogContent?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <ScrollArea className="h-[250px] rounded-xl border border-border/50 p-4 bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed italic">
                                "{selectedLogContent?.content}"
                            </p>
                        </ScrollArea>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsViewMessageDialogOpen(false)} className="w-full rounded-xl">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
