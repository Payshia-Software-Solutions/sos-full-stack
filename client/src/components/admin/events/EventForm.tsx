"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Image as ImageIcon, Loader2, Settings, Globe, CalendarDays } from "lucide-react";
import { LMS_API_URL } from "@/lib/config";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export interface EventFormData {
    title: string;
    slug: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    summary: string;
    description: string;
    image_url: string;
    registration_url: string;
    status: string;
}

export const emptyEventForm: EventFormData = {
    title: "",
    slug: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    summary: "",
    description: "",
    image_url: "",
    registration_url: "",
    status: "published",
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export const eventImageUrl = (value: string) =>
    value.startsWith("http") ? value : `https://content-provider.pharmacollege.lk/content-provider/uploads/events/${value}`;

// Shared input look: theme background, theme text, primary focus ring
const inputClass = "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary";
const labelClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";
const panelClass = "bg-card text-card-foreground rounded-xl border border-border shadow-sm";

interface EventFormProps {
    mode: "create" | "edit";
    eventId?: string;
    initialData?: EventFormData;
}

export default function EventForm({ mode, eventId, initialData }: EventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<EventFormData>(initialData ?? emptyEventForm);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        // Only auto-fill the slug while it is still the slug of the title (or empty)
        const autoSlug = slugify(formData.title);
        const slug = !formData.slug || formData.slug === autoSlug ? slugify(title) : formData.slug;
        setFormData({ ...formData, title, slug });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        const payload = new FormData();
        payload.append("image", file);

        try {
            const res = await fetch(`${LMS_API_URL}/api/events/upload-image`, { method: "POST", body: payload });
            const data = await res.json();
            if (data.success && data.url) {
                setFormData(prev => ({ ...prev, image_url: data.url }));
            } else {
                alert(data.message || "Failed to upload image");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = mode === "create" ? `${LMS_API_URL}/api/events` : `${LMS_API_URL}/api/events/${eventId}`;
        try {
            const res = await fetch(url, {
                method: mode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/admin/events");
                router.refresh();
            } else {
                alert(data.message || "Failed to save event");
            }
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Error saving event");
        } finally {
            setLoading(false);
        }
    };

    const imageUrl = formData.image_url ? eventImageUrl(formData.image_url) : null;

    return (
        <div className="flex-1 flex flex-col bg-background text-foreground pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/events">
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">{mode === "create" ? "Create Event" : "Edit Event"}</h1>
                        <p className="text-xs text-muted-foreground">Upcoming events shown on the website</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => router.push("/admin/events")} className="rounded-full px-6">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || uploading} className="rounded-full px-6 shadow-md">
                        {loading ? "Saving..." : mode === "create" ? "Publish Event" : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto px-6 mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main canvas */}
                    <div className="flex-1 space-y-6">
                        <div className={`${panelClass} p-1 overflow-hidden`}>
                            <div className="px-6 md:px-10 pt-8 pb-4">
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="Event Title..."
                                    className="w-full text-4xl md:text-5xl font-extrabold text-foreground placeholder:text-muted-foreground/60 border-none outline-none focus:ring-0 bg-transparent"
                                />
                            </div>

                            <div className="px-6 md:px-10 pb-6">
                                <Label className={`${labelClass} block mb-2`}>Short Summary</Label>
                                <Textarea
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleChange}
                                    placeholder="One or two lines shown on the events list..."
                                    className={inputClass}
                                />
                            </div>

                            <div className="px-6 md:px-10 pb-10">
                                <Label className={`${labelClass} block mb-2`}>Event Details</Label>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description}
                                    onChange={(description: string) => setFormData({ ...formData, description })}
                                    placeholder="Describe the event: agenda, speakers, what to bring..."
                                    className="text-base text-foreground [&_.ql-toolbar]:rounded-t-md [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-muted/50 [&_.ql-container]:rounded-b-md [&_.ql-container]:border-border [&_.ql-container]:bg-card [&_.ql-editor]:min-h-[350px] [&_.ql-editor]:text-foreground [&_.ql-editor.ql-blank::before]:text-muted-foreground/70 [&_.ql-stroke]:stroke-foreground [&_.ql-fill]:fill-foreground [&_.ql-picker]:text-foreground [&_.ql-picker-options]:bg-card [&_.ql-picker-options]:border-border"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 space-y-6">
                        {/* Cover image */}
                        <div className={`${panelClass} p-4`}>
                            <Label className={`${labelClass} block mb-3`}>Cover Image</Label>
                            <div className="relative w-full h-[180px] bg-muted/50 rounded-lg overflow-hidden group border border-dashed border-border">
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Label htmlFor="event_image_upload" className="cursor-pointer bg-background text-foreground px-4 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-1.5">
                                                <ImageIcon className="w-3.5 h-3.5" /> Change Image
                                            </Label>
                                        </div>
                                    </>
                                ) : (
                                    <Label htmlFor="event_image_upload" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                                        <ImageIcon className="w-5 h-5 mb-2" />
                                        <span className="font-semibold text-xs">Upload Cover Image</span>
                                    </Label>
                                )}
                                <Input id="event_image_upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                                {uploading && (
                                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary mb-1" />
                                        <span className="text-xs font-medium text-primary">Uploading...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date, time and place */}
                        <div className={`${panelClass} p-6 space-y-5`}>
                            <div className="flex items-center gap-2 border-b border-border pb-4">
                                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                                <h3 className="font-semibold text-foreground">Date &amp; Venue</h3>
                            </div>

                            <div className="space-y-2">
                                <Label className={labelClass}>Event Date</Label>
                                <Input type="date" name="event_date" value={formData.event_date} onChange={handleChange} className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className={labelClass}>Start Time</Label>
                                    <Input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>End Time</Label>
                                    <Input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className={labelClass}>Location</Label>
                                <Input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Zoom, or venue address" className={inputClass} />
                            </div>

                            <div className="space-y-2">
                                <Label className={labelClass}>Registration / Info Link</Label>
                                <Input name="registration_url" value={formData.registration_url} onChange={handleChange} placeholder="https://..." className={inputClass} />
                            </div>
                        </div>

                        {/* Settings */}
                        <div className={`${panelClass} p-6 space-y-5`}>
                            <div className="flex items-center gap-2 border-b border-border pb-4">
                                <Settings className="w-5 h-5 text-muted-foreground" />
                                <h3 className="font-semibold text-foreground">Settings</h3>
                            </div>

                            <div className="space-y-2">
                                <Label className={labelClass}>URL Slug</Label>
                                <div className="relative">
                                    <Globe className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    <Input name="slug" value={formData.slug} onChange={handleChange} className={`pl-9 ${inputClass}`} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className={labelClass}>Visibility</Label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
