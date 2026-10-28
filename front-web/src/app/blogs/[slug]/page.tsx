import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Search } from "lucide-react";
import { LMS_API_URL } from "@/lib/config";
import InteractiveArticleBody from "@/components/interactive-article-body";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${LMS_API_URL}/api/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success && data.blog ? data.blog : null;
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return null;
  }
}

async function getAllPublishedBlogs() {
  try {
    const res = await fetch(`${LMS_API_URL}/api/blogs`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.blogs)) {
      return data.blogs.filter((b: any) => b.status === "published");
    }
  } catch (error) {
    console.error("Failed to fetch all blogs:", error);
  }
  return [];
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Article Not Found | Ceylon Pharma College",
    };
  }

  const cleanDescription = (blog.summary || blog.content || "")
    .replace(/<[^>]*>?/gm, "")
    .slice(0, 160);

  const imageUrl = blog.image_url
    ? blog.image_url.startsWith("http")
      ? blog.image_url
      : `https://content-provider.pharmacollege.lk/content-provider/uploads/blogs/${blog.image_url}`
    : "https://content-provider.pharmacollege.lk/website/meta-seo-image.webp";

  return {
    title: `${blog.title} | Ceylon Pharma College Blog`,
    description: cleanDescription,
    openGraph: {
      title: blog.title,
      description: cleanDescription,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: cleanDescription,
      images: [imageUrl],
    },
  };
}

export default async function SingleBlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const [blog, allBlogs] = await Promise.all([
    getBlog(slug),
    getAllPublishedBlogs(),
  ]);

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50 dark:bg-zinc-950">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The article you are looking for does not exist or has been removed.</p>
        <Link href="/blogs" className="inline-flex items-center text-primary font-medium hover:underline">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Blogs
        </Link>
      </div>
    );
  }

  const recentBlogs = allBlogs.filter((b: any) => b.slug !== slug).slice(0, 4);

  const allTags = Array.from(
    new Set(
      allBlogs.flatMap((b: any) =>
        b.category ? b.category.split(",").map((t: string) => t.trim()).filter(Boolean) : []
      )
    )
  );

  const mainImageUrl = blog.image_url
    ? blog.image_url.startsWith("http")
      ? blog.image_url
      : `https://content-provider.pharmacollege.lk/content-provider/uploads/blogs/${blog.image_url}`
    : null;

  // Basic HTML script tag sanitization
  const sanitizedContent = (blog.content || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blogs" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to all articles
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Article Content */}
          <article className="lg:col-span-8 bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            {mainImageUrl && (
              <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden shadow-sm">
                <Image 
                  src={mainImageUrl} 
                  alt={blog.title} 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
            )}
            
            <div className="p-6 md:p-10">
              <div className="mb-6">
                <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-3 gap-4">
                  {blog.author && (
                    <span className="flex items-center gap-1 font-medium bg-secondary/50 px-3 py-1 rounded-full text-secondary-foreground text-xs">
                      <User className="w-3.5 h-3.5" /> {blog.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(blog.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
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
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground leading-tight">
                  {blog.title}
                </h1>
              </div>

              <InteractiveArticleBody initialHtml={sanitizedContent} />
            </div>
          </article>

          {/* Right Column: Sidebar Panels */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Search Panel */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-base text-foreground mb-4">Search Articles</h3>
              <form action="/blogs" method="GET" className="relative">
                <input 
                  type="text" 
                  name="search"
                  placeholder="Search topic or keyword..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:bg-zinc-900"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              </form>
            </div>

            {/* Recent Blogs Panel */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-base text-foreground mb-4">Recent Articles</h3>
              {recentBlogs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No other recent articles.</p>
              ) : (
                <div className="space-y-4">
                  {recentBlogs.map((item: any) => {
                    const recentImg = item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `https://content-provider.pharmacollege.lk/content-provider/uploads/blogs/${item.image_url}`) : null;
                    return (
                      <div key={item.id} className="flex gap-3 items-start group">
                        {recentImg && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image 
                              src={recentImg} 
                              alt={item.title} 
                              fill 
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            <Link href={`/blogs/${item.slug}`}>{item.title}</Link>
                          </h4>
                          <span className="text-[10px] text-muted-foreground block mt-1">
                            {new Date(item.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags Panel */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-base text-foreground mb-4">Popular Tags</h3>
              {allTags.length === 0 ? (
                <p className="text-xs text-muted-foreground">No tags available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag: any) => (
                    <Link 
                      key={tag}
                      href={`/blogs?tag=${encodeURIComponent(tag)}`}
                      className="bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-zinc-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-muted-foreground text-xs font-medium px-3 py-1 rounded-xl transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </aside>
        </div>

      </div>
    </div>
  );
}