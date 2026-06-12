"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Loader2, Settings, Globe, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const AI_TEMPLATES = [
    {
        topic: "Evolution of Community Pharmacy",
        title: "The Evolution of Community Pharmacy",
        category: "pharmacy, career, patient-care",
        content: `<h2>Changing Landscape of Pharmacy</h2><p>Today, community pharmacies are evolving into active community healthcare hubs, moving beyond simple dispensing to clinical advisory roles.</p><h2>Key Areas</h2><ul><li><strong>Counselling:</strong> Pharmacists provide advice on chronic disease management and drug interactions.</li><li><strong>Screenings:</strong> Many offer testing for blood pressure, blood glucose, and cholesterol.</li><li><strong>Vaccines:</strong> Pharmacists act as primary providers of routine immunizations.</li></ul>`
    },
    {
        topic: "Patient Guide to Medication Safety",
        title: "A Guide to Medication Safety: Avoiding Errors",
        category: "medicine, safety, health-tips",
        content: `<h2>Understanding Medication Safety</h2><p>Patient safety is a collaborative effort. Managing your medicines safely is the first step to optimal health outcomes.</p><h2>Essential Safety Rules</h2><ol><li><strong>Read Labels:</strong> Always verify dosage and instructions.</li><li><strong>Keep a List:</strong> Track all prescription drugs and supplements.</li><li><strong>Do Not Share:</strong> Never take medicines prescribed for others.</li><li><strong>Store Correctly:</strong> Keep medicines in cool, dry places away from children.</li></ol><h2>Consult Your Pharmacist</h2><p>Ask key questions regarding dosage and side-effects. Your pharmacist is your most accessible safety net.</p>`
    },
    {
        topic: "Essential Caregiving Strategies",
        title: "Key Caregiving Strategies for Elderly Patients",
        category: "caregiver, nursing, health",
        content: `<h2>Caring for Elderly Patients</h2><p>Caregiving requires patient-centered approaches that address physical health alongside mental well-being.</p><h2>Effective Strategies</h2><ul><li><strong>Medication Adherence:</strong> Use organizers and alarms to prevent skipped doses.</li><li><strong>Fall Prevention:</strong> Remove hazard risks like loose rugs and install bathroom grab bars.</li><li><strong>Nutritional Coordination:</strong> Plan balanced meals adapted to dietary restrictions.</li><li><strong>Active Listening:</strong> Communication reduces isolation and cognitive decline.</li></ul>`
    },
    {
        topic: "Understanding Antibiotic Resistance",
        title: "Why Antibiotic Resistance is a Global Threat",
        category: "pharmacology, medical, research",
        content: `<h2>The Crisis of Superbugs</h2><p>Antibiotic resistance is a major global health threat. As bacteria evolve, standard treatments lose efficacy.</p><h2>Key Drivers</h2><p>The primary driver is the misuse and overuse of antimicrobial agents, including taking them for viral infections.</p><h2>How to Help</h2><ul><li><strong>Responsible Use:</strong> Only take antibiotics when prescribed by a professional.</li><li><strong>Complete the Course:</strong> Always finish the full course, even if feeling better.</li><li><strong>Prevention:</strong> Prevent infections through hygiene and vaccinations.</li></ul>`
    }
];

export default function CreateBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [useRichText, setUseRichText] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        author: "",
        image_url: "",
        content: "",
        category: "",
        status: "published",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContentChange = (content: string) => {
        setFormData({ ...formData, content });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setFormData({ ...formData, title, slug });
    };

    const handleGenerateBlog = (topicName: string) => {
        const template = AI_TEMPLATES.find(t => t.topic === topicName);
        if (template) {
            setFormData(prev => ({
                ...prev,
                title: template.title,
                slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                category: template.category,
                content: template.content
            }));
        }
    };

    const handleCustomGeneratePrompt = () => {
        const customTopic = prompt("Enter the topic you want to generate a blog post for:", "Patient Counseling in Pharmacy");
        if (customTopic) {
            const generatedTitle = `A Guide to ${customTopic}`;
            const generatedSlug = generatedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const cleanTag = customTopic.toLowerCase().split(' ')[0] || "healthcare";
            const generatedContent = `<h2>Understanding the Importance of ${customTopic}</h2>
<p>${customTopic} plays an essential role in contemporary medical practices. By focusing on patient-centered outcomes, healthcare professionals can enhance safety, compliance, and therapeutic success.</p>

<h2>Key Components of Effective ${customTopic}</h2>
<ul>
    <li><strong>Clinical Communication:</strong> Establishing trust with clear, jargon-free explanations.</li>
    <li><strong>Safety Protocols:</strong> Ensuring cross-checks and verification steps are strictly followed.</li>
    <li><strong>Continuous Training:</strong> Regular updates to match international standards of care.</li>
</ul>

<h2>Practical Applications in Healthcare</h2>
<p>Implementing structured processes for ${customTopic} leads to decreased medical errors and higher satisfaction levels. At Ceylon Pharma College, we prioritize these topics within our core curriculums to prepare students for real-world demands.</p>`;

            setFormData(prev => ({
                ...prev,
                title: generatedTitle,
                slug: generatedSlug,
                category: `${cleanTag}, education, health`,
                content: generatedContent
            }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        const formPayload = new FormData();
        formPayload.append("image", file);

        try {
            const res = await fetch("http://localhost/sos-full-stack/server/api/blogs/upload-image", {
                method: "POST",
                body: formPayload,
            });
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

        try {
            const res = await fetch("http://localhost/sos-full-stack/server/api/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/admin/blogs");
            } else {
                alert(data.message || "Failed to create blog");
            }
        } catch (error) {
            console.error("Error creating blog:", error);
            alert("Error creating blog");
        } finally {
            setLoading(false);
        }
    };

    const imageUrl = formData.image_url ? (formData.image_url.startsWith('http') ? formData.image_url : `https://content-provider.pharmacollege.lk/content-provider/uploads/blogs/${formData.image_url}`) : null;

    return (
        <div className="flex-1 flex flex-col bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blogs">
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Create Blog Post</h1>
                        <p className="text-xs text-gray-500">Drafting a new article</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => router.push("/admin/blogs")} className="rounded-full px-6">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || uploading} className="rounded-full px-6 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
                        {loading ? "Publishing..." : "Publish Post"}
                    </Button>
                </div>
            </div>

            <div className="max-w-[1600px] w-full mx-auto px-6 mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Canvas */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-1 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                            {/* AI Blog Generator Assistant Banner */}
                            <div className="px-6 md:px-10 py-4 flex flex-wrap gap-2 items-center justify-between border-b pb-4 bg-emerald-50/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xs text-gray-800">AI Writing Assistant</h3>
                                        <p className="text-[10px] text-gray-500">Instantly generate high-quality pharmacy or healthcare blog posts.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0">
                                    <select 
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleGenerateBlog(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                        className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="">Choose a topic template...</option>
                                        {AI_TEMPLATES.map((t, idx) => (
                                            <option key={idx} value={t.topic}>{t.topic}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleCustomGeneratePrompt}
                                        className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                                    >
                                        <Sparkles className="w-3 h-3" /> Custom Prompt
                                    </button>
                                </div>
                            </div>

                            {/* Title Input */}
                            <div className="px-6 md:px-10 pt-8 pb-4">
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="Story Title..."
                                    className="w-full text-4xl md:text-5xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none outline-none focus:ring-0 bg-transparent"
                                />
                            </div>

                            {/* Editor Area */}
                            <div className="px-6 md:px-10 pb-10">
                                {useRichText ? (
                                    <ReactQuill 
                                        theme="snow" 
                                        value={formData.content} 
                                        onChange={handleContentChange} 
                                        placeholder="Tell your story..."
                                        className="text-lg text-gray-800 font-serif [&_.ql-toolbar]:!border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:!border-b-gray-100 [&_.ql-toolbar]:pb-4 [&_.ql-toolbar]:mb-4 [&_.ql-container]:!border-none [&_.ql-editor]:!px-0 [&_.ql-editor]:min-h-[500px]"
                                    />
                                ) : (
                                    <Textarea 
                                        id="content" 
                                        name="content" 
                                        value={formData.content} 
                                        onChange={handleChange} 
                                        placeholder="Write your HTML content here..." 
                                        className="min-h-[500px] w-full text-base font-mono border-none focus-visible:ring-0 p-0 resize-y"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="w-full lg:w-80 space-y-6">
                        {/* Cover Image Area */}
                        <div className="bg-white rounded-2xl shadow-sm border p-4">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Cover Image</Label>
                            <div className="relative w-full h-[180px] bg-gray-100/80 rounded-xl overflow-hidden group">
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <Label htmlFor="image_upload" className="cursor-pointer bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-1.5 hover:bg-white transition-transform transform hover:scale-105">
                                                <ImageIcon className="w-3.5 h-3.5" /> Change Image
                                            </Label>
                                        </div>
                                    </>
                                ) : (
                                    <Label htmlFor="image_upload" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors">
                                        <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-xs">Upload Cover Image</span>
                                    </Label>
                                )}
                                <Input id="image_upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                                
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-1" />
                                        <span className="text-xs font-medium text-emerald-700">Uploading...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <Settings className="w-5 h-5 text-gray-500" />
                                <h3 className="font-semibold text-gray-800">Post Settings</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL Slug</Label>
                                    <div className="relative">
                                        <Globe className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                        <Input 
                                            id="slug" name="slug" value={formData.slug} onChange={handleChange} 
                                            className="pl-9 bg-gray-50 border-transparent focus:border-emerald-500 focus:bg-white" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Author</Label>
                                    <Input 
                                        id="author" name="author" value={formData.author} onChange={handleChange} 
                                        className="bg-gray-50 border-transparent focus:border-emerald-500 focus:bg-white" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tags / Topics</Label>
                                    <Input 
                                        id="category" name="category" value={formData.category} onChange={handleChange} 
                                        placeholder="e.g. pharmacy, education, medical"
                                        className="bg-gray-50 border-transparent focus:border-emerald-500 focus:bg-white" 
                                    />
                                    <p className="text-[10px] text-gray-400">Separate tags with commas.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility Status</Label>
                                    <select 
                                        id="status" name="status" value={formData.status} onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm focus:border-emerald-500 focus:bg-white outline-none transition-colors"
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>

                                <div className="pt-4 border-t">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Rich Text Editor</span>
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only" checked={useRichText} onChange={(e) => setUseRichText(e.target.checked)} />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${useRichText ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useRichText ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">Toggle to edit raw HTML code.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
