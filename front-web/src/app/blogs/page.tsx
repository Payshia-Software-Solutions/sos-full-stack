"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User, X } from "lucide-react";

function BlogsListContent() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();

    const searchFilter = searchParams.get("search") || "";
    const tagFilter = searchParams.get("tag") || "";

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch("http://localhost/sos-full-stack/server/api/blogs");
                const data = await res.json();
                if (data.success && data.blogs) {
                    setBlogs(data.blogs.filter((b: any) => b.status === 'published'));
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            const matchesSearch = searchFilter
                ? blog.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                  blog.content.toLowerCase().includes(searchFilter.toLowerCase())
                : true;
            
            const matchesTag = tagFilter
                ? blog.category && blog.category.split(',').map((t: string) => t.trim().toLowerCase()).includes(tagFilter.toLowerCase())
                : true;

            return matchesSearch && matchesTag;
        });
    }, [blogs, searchFilter, tagFilter]);

    const clearFilters = () => {
        router.push("/blogs");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-16">
            <div className="container mx-auto px-4 md:px-6">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
                        Our Latest News & Articles
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground font-body">
                        Stay up to date with the latest from Ceylon Pharma College and the healthcare industry.
                    </p>
                </div>

                {/* Filters Information bar */}
                {(searchFilter || tagFilter) && (
                    <div className="max-w-md mx-auto mb-8 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-4 py-3 rounded-xl flex items-center justify-between text-sm text-emerald-800 dark:text-emerald-400">
                        <div className="flex items-center gap-1.5 font-medium">
                            <span>Showing results for</span>
                            {searchFilter && <span className="font-bold">Search: &ldquo;{searchFilter}&rdquo;</span>}
                            {searchFilter && tagFilter && <span>and</span>}
                            {tagFilter && <span className="font-bold">Tag: #{tagFilter}</span>}
                        </div>
                        <button 
                            onClick={clearFilters}
                            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors"
                            title="Clear Filters"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-muted-foreground py-20">Loading articles...</div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-20 flex flex-col items-center justify-center gap-4">
                        <p className="text-lg">No articles found matching your criteria.</p>
                        {(searchFilter || tagFilter) && (
                            <button 
                                onClick={clearFilters}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => (
                            <div key={blog.id} className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                {blog.image_url && (
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image 
                                            src={blog.image_url.startsWith('http') ? blog.image_url : `https://content-provider.pharmacollege.lk/content-provider/uploads/blogs/${blog.image_url}`} 
                                            alt={blog.title} 
                                            fill 
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center text-xs text-muted-foreground mb-3 gap-4">
                                        {blog.author && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" /> {blog.author}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(blog.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {blog.category && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {blog.category.split(',').map((tag: string) => {
                                                const trimmed = tag.trim();
                                                if (!trimmed) return null;
                                                return (
                                                    <Link 
                                                        key={trimmed}
                                                        href={`/blogs?tag=${encodeURIComponent(trimmed)}`}
                                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors"
                                                    >
                                                        {trimmed}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold font-headline mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                                    </h2>
                                    <p className="text-muted-foreground font-body text-sm line-clamp-3 mb-6" dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 150) + '...' }} />
                                    
                                    <div className="mt-auto">
                                        <Link href={`/blogs/${blog.slug}`} className="inline-flex items-center text-primary font-medium hover:underline text-sm">
                                            Read More <ArrowRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BlogsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading Page...</div>}>
            <BlogsListContent />
        </Suspense>
    );
}
