"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User, X, Search, Sparkles, ChevronRight, BookOpen, Clock } from "lucide-react";
import { LMS_API_URL } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/context/language-context";

function BlogsListContent({ initialBlogs = [] }: { initialBlogs?: any[] }) {
  const [blogs, setBlogs] = useState<any[]>(initialBlogs);
  const [loading, setLoading] = useState(initialBlogs.length === 0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const tagFilter = searchParams.get("tag") || "";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${LMS_API_URL}/api/blogs`);
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
      const matchesSearch = searchQuery
        ? blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          blog.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesTag = tagFilter
        ? blog.category && blog.category.split(',').map((t: string) => t.trim().toLowerCase()).includes(tagFilter.toLowerCase())
        : true;

      return matchesSearch && matchesTag;
    });
  }, [blogs, searchQuery, tagFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    router.push("/blogs");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Header Banner */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{t('blogs')}</span>
          </div>

          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 gap-1.5 inline-flex items-center">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>{isSinhala ? 'ඖෂධවේදී ලිපි සහ පුවත්' : 'Pharmacy Insights & Academic News'}</span>
            </Badge>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {isSinhala ? 'නවතම පුවත් සහ අධ්‍යාපනික ලිපි' : 'Our Latest News & Articles'}
            </h1>

            <div className="w-20 h-1 bg-primary mt-3 mb-4 rounded-full" />

            <p className={`text-muted-foreground font-body text-base md:text-lg max-w-2xl ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              Stay up to date with the latest pharmacy practice tips, drug regulations, career guidance, and college updates.
            </p>

            {/* Quick Search Bar */}
            <div className="mt-8 max-w-xl relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search articles by title, drug topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-5 rounded-xl bg-card border-border/80 shadow-sm focus-visible:ring-primary text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Blog Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Active Filter Pill */}
          {(searchQuery || tagFilter) && (
            <div className="max-w-md mx-auto mb-10 bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl flex items-center justify-between text-xs text-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <span>Showing results for</span>
                {searchQuery && <span className="font-bold">&ldquo;{searchQuery}&rdquo;</span>}
                {searchQuery && tagFilter && <span>and</span>}
                {tagFilter && <span className="font-bold">Tag: #{tagFilter}</span>}
              </div>
              <button 
                onClick={clearFilters}
                className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                title="Clear Filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-card border border-border/80 animate-pulse" />
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border max-w-md mx-auto p-8">
              <p className="text-base font-semibold text-foreground">No articles found</p>
              <p className="text-xs text-muted-foreground mt-1">Try another search keyword or clear active filters.</p>
              {(searchQuery || tagFilter) && (
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-xl"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => {
                const img = blog.image_url?.startsWith('http') 
                  ? blog.image_url 
                  : `https://content-provider.pharmacollege.lk/blogs/${blog.image_url}`;

                return (
                  <article 
                    key={blog.id} 
                    className="flex flex-col h-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1.5"
                  >
                    <Link href={`/blogs/${blog.slug}`} className="relative aspect-video w-full overflow-hidden block bg-muted shrink-0">
                      <Image
                        src={img}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Calendar className="w-3.5 h-3.5" />
                          {blog.published_date || "Recent"}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] bg-secondary px-2 py-0.5 rounded">
                          {blog.category?.split(',')[0] || "Pharmacy"}
                        </span>
                      </div>

                      <h2 className="font-headline font-bold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/blogs/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h2>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4 flex-grow font-body">
                        {blog.summary || blog.content?.replace(/<[^>]*>/g, '').slice(0, 140) + '...'}
                      </p>

                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary/90">
                        <Link href={`/blogs/${blog.slug}`} className="inline-flex items-center gap-1">
                          <span>Read Article</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function BlogsClient({ initialBlogs = [] }: { initialBlogs?: any[] }) {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading articles...</div>}>
      <BlogsListContent initialBlogs={initialBlogs} />
    </Suspense>
  );
}
