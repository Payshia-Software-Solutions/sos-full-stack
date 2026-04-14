"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TemplateEditor, TemplateEditorRef } from "@/components/admin/TemplateEditor";
import { toast } from "@/hooks/use-toast";
import { Save, Cake, Mail, MessageSquare, Info, Send } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

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
    const [serverTime, setServerTime] = useState<{server_time: string, server_timezone: string, local_time: string} | null>(null);
    const [testRecipient, setTestRecipient] = useState("");
    const [testType, setTestType] = useState<"sms" | "email" | null>(null);
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [lastFocused, setLastFocused] = useState<{ id: string, name: string } | null>(null);
    const smsEditorRef = useRef<TemplateEditorRef>(null);
    const emailSubjectEditorRef = useRef<TemplateEditorRef>(null);
    const emailTemplateEditorRef = useRef<TemplateEditorRef>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_LMS_SERVER_URL || "https://qa-api.pharmacollege.lk";

    useEffect(() => {
        fetchSettings();
        fetchServerTime();
    }, []);

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
                headers: {
                    "Content-Type": "application/json"
                },
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
        <div className="p-4 md:p-8 space-y-8 pb-20 w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-headline font-bold flex items-center gap-3 tracking-tight">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2 rounded-xl shadow-lg ring-4 ring-pink-500/10">
                            <Cake className="h-8 w-8 text-white" />
                        </div>
                        Birthday Wishes Setup
                    </h1>
                    <p className="text-muted-foreground text-lg ml-1">Manage automated birthday greetings for your students with personalized templates.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    className="h-12 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 text-lg font-medium rounded-xl"
                >
                    <Save className="mr-2 h-5 w-5" /> Save Changes
                </Button>
            </header>

            <div className="relative overflow-hidden bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 p-6 rounded-2xl flex gap-4 text-blue-900 dark:text-blue-200 shadow-sm">
                <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="bg-blue-500/10 p-2 rounded-lg h-fit">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm space-y-1 relative w-full">
                    <p className="font-bold text-base">Template Placeholders</p>
                    <p className="opacity-80 mb-4">Click a placeholder below to insert it into the selected template field.</p>
                    <div className="flex flex-wrap gap-2">
                        {placeholders.map((p) => (
                            <button
                                key={p}
                                onClick={() => insertPlaceholder(p)}
                                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors rounded-lg border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold active:scale-95"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SMS Setup */}
                <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-md border-border/50 shadow-2xl transition-all hover:shadow-green-500/5 rounded-3xl">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-green-600" />
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                    <MessageSquare className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">SMS Channel</CardTitle>
                                    <CardDescription>Direct mobile messaging</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 gap-2 bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                    onClick={() => {
                                        setTestType("sms");
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <Send className="h-3.5 w-3.5" /> Send Test
                                </Button>
                                <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                        {settings.is_sms_enabled ? "Active" : "Disabled"}
                                    </span>
                                    <Switch 
                                        className="data-[state=checked]:bg-emerald-500"
                                        checked={!!settings.is_sms_enabled} 
                                        onCheckedChange={(val) => setSettings({...settings, is_sms_enabled: val})} 
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="sms_template" className="text-sm font-semibold opacity-80">Message Template</Label>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${settings.sms_template.length > 160 ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"}`}>
                                    {settings.sms_template.length} / 160 chars
                                </span>
                            </div>
                            <TemplateEditor 
                                id="sms_template" 
                                ref={smsEditorRef}
                                content={settings.sms_template}
                                onFocus={() => setLastFocused({ id: 'sms_template', name: 'SMS Template' })}
                                onChange={(val) => setSettings({...settings, sms_template: val})}
                                className="min-h-[160px]"
                            />
                            <div className="flex items-start gap-2 text-[11px] text-muted-foreground italic px-1 pt-1">
                                <Info className="h-3 w-3 mt-0.5 opacity-50" />
                                <p>Standard SMS limit is 160 chars. Longer messages will be split.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Setup */}
                <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-md border-border/50 shadow-2xl transition-all hover:shadow-blue-500/5 rounded-3xl">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                    <Mail className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Email Channel</CardTitle>
                                    <CardDescription>Rich formatted emails</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 gap-2 bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                                    onClick={() => {
                                        setTestType("email");
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <Send className="h-3.5 w-3.5" /> Send Test
                                </Button>
                                <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                        {settings.is_email_enabled ? "Active" : "Disabled"}
                                    </span>
                                    <Switch 
                                        className="data-[state=checked]:bg-blue-500"
                                        checked={!!settings.is_email_enabled} 
                                        onCheckedChange={(val) => setSettings({...settings, is_email_enabled: val})} 
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="email_subject" className="text-sm font-semibold opacity-80">Email Subject</Label>
                            <TemplateEditor 
                                id="email_subject" 
                                ref={emailSubjectEditorRef}
                                content={settings.email_subject}
                                onFocus={() => setLastFocused({ id: 'email_subject', name: 'Email Subject' })}
                                onChange={(val) => setSettings({...settings, email_subject: val})}
                                className="min-h-[48px] px-4 py-2"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="email_template" className="text-sm font-semibold opacity-80 flex items-center justify-between">
                                <span>Email Content (HTML)</span>
                                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">HTML5 SUPPORTED</span>
                            </Label>
                            <TemplateEditor 
                                id="email_template" 
                                ref={emailTemplateEditorRef}
                                content={settings.email_template}
                                onFocus={() => setLastFocused({ id: 'email_template', name: 'Email Template' })}
                                onChange={(val) => setSettings({...settings, email_template: val})}
                                className="min-h-[220px]"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl overflow-hidden shadow-sm">
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-lg">
                            <Save className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold">Automation Setup</h3>
                    </div>
                    <p className="text-base text-muted-foreground mb-6 max-w-2xl leading-relaxed">
                        To activate these automated wishes, you must configure a CRON job on your server hosting the backend. This job should trigger precisely once every morning to check for student birthdays.
                    </p>

                    {serverTime && (() => {
                        const sTime = new Date(serverTime.server_time.replace(' ', 'T'));
                        const lTime = new Date(serverTime.local_time.replace(' ', 'T'));
                        const diffMs = lTime.getTime() - sTime.getTime();
                        const diffHours = diffMs / (1000 * 60 * 60);
                        
                        // Calculate target cron hour (7:00 AM SL time)
                        // If SL is 7:00 AM, server should be 7 - diffHours
                        let targetHour = 7 - diffHours;
                        if (targetHour < 0) targetHour += 24;
                        if (targetHour >= 24) targetHour -= 24;
                        
                        const wholeHour = Math.floor(targetHour);
                        const mins = Math.round((targetHour - wholeHour) * 60);
                        const cronExpr = `${mins} ${wholeHour} * * *`;

                        return (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                            <Info className="h-3 w-3" /> Literal Server Time
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {serverTime.server_time.split(' ')[1]}
                                            </span>
                                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-muted-foreground font-bold">
                                                {serverTime.server_timezone}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1 flex items-center gap-1">
                                            <Cake className="h-3 w-3" /> Target Local Time (Sri Lanka)
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {serverTime.local_time.split(' ')[1]}
                                            </span>
                                            <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded text-blue-500 font-bold">
                                                GMT +5:30
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl mb-8">
                                    <h4 className="text-amber-700 dark:text-amber-400 font-bold mb-2 flex items-center gap-2">
                                        <Info className="h-4 w-4" /> Personalized CRON Setup Guide
                                    </h4>
                                    <p className="text-sm text-amber-800/80 dark:text-amber-400/80 mb-4 leading-relaxed">
                                        Based on your current server offset ({diffHours > 0 ? `+${diffHours}` : diffHours} hours), to send messages exactly at <strong>7:00 AM Sri Lanka time</strong>, you should schedule your CRON job for <strong>{wholeHour.toString().padStart(2, '0')}:{mins.toString().padStart(2, '0')}</strong> on your server.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="bg-amber-500/20 px-4 py-2 rounded-xl text-amber-700 dark:text-amber-300 font-mono text-lg font-bold">
                                            {cronExpr}
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                                            onClick={() => {
                                                navigator.clipboard.writeText(cronExpr);
                                                toast({ title: "Copied Expression", description: "Standard cron expression copied." });
                                            }}
                                        >
                                            Copy Expression
                                        </Button>
                                    </div>
                                </div>
                            </>
                        );
                    })()}

                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 to-slate-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative bg-slate-900 text-slate-100 p-6 rounded-2xl font-mono text-sm shadow-xl flex items-center justify-between">
                            <span className="opacity-60 overflow-hidden text-ellipsis whitespace-nowrap mr-4">
                                php /path/to/your/server/cron/send_birthday_wishes.php
                            </span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 hover:bg-white/10 text-white shrink-0"
                                onClick={() => {
                                    navigator.clipboard.writeText("php /path/to/your/server/cron/send_birthday_wishes.php");
                                    toast({ title: "Copied to clipboard" });
                                }}
                            >
                                Copy Command
                            </Button>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground/60 flex items-center gap-2">
                        <Info className="h-3 w-3" />
                         Recommended schedule: <code>0 7 * * *</code> (Once daily at 07:00 AM)
                    </p>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Send Test {testType?.toUpperCase()}</DialogTitle>
                        <DialogDescription>
                            Enter a {testType === "sms" ? "phone number" : "email address"} to receive a test birthday wish message.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="recipient">{testType === "sms" ? "Mobile Number" : "Email Address"}</Label>
                            <Input
                                id="recipient"
                                placeholder={testType === "sms" ? "07xxxxxxxx" : "test@example.com"}
                                value={testRecipient}
                                onChange={(e) => setTestRecipient(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            onClick={handleSendTest} 
                            disabled={isTestLoading}
                            className={testType === "sms" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                            {isTestLoading ? "Sending..." : "Send Test Now"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
