"use client";
import { ArrowRight, Linkedin } from "lucide-react";

export default function Blog() {
  const posts = [
    { title: "What 3,000 Students Taught Me About What Pharmaceutical Education Gets Wrong", excerpt: "When I founded Ceylon Pharma College in 2020, I assumed that if I designed a good curriculum and hired qualified faculty, students would succeed. I was wrong.", date: "June 2026", readTime: "6 min", tag: "Education Policy" },
    { title: "The Pharmaceutical Education Crisis in Sri Lanka — and the Blueprint to Solve It", excerpt: "An analysis of the widening chasm between theoretical degrees and the daily realities of clinical pharmacy — and why simulation training must become a regulatory baseline.", date: "May 2026", readTime: "8 min", tag: "Healthcare Reform" },
    { title: "A Letter to Every A/L Biology Student Who Doesn't Know What to Do Next", excerpt: "Navigating career pathways post-Advanced Levels: a guide on finding high-growth professions inside pharmaceutical care and the international roles available.", date: "April 2026", readTime: "4 min", tag: "Student Mentorship" },
  ];

  return (
    <section id="blog" className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, var(--border), transparent)" }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>Thought Leadership</p>
            <h2 className="text-4xl md:text-5xl font-heading font-black" style={{ color: "var(--text)" }}>
              Insights &amp; <span className="gradient-text">Articles</span>
            </h2>
          </div>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            <Linkedin size={14} style={{ color: "var(--teal)" }} />Follow on LinkedIn
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <article key={i} className="group flex flex-col p-6 rounded-2xl border transition-all duration-300 shadow-xl"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 30%, transparent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div className="flex items-center justify-between mb-5">
                <span className="px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest"
                  style={{ backgroundColor: "color-mix(in srgb, var(--teal) 8%, transparent)", borderColor: "color-mix(in srgb, var(--teal) 20%, transparent)", color: "var(--teal)" }}>
                  {post.tag}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>{post.readTime} read</span>
              </div>
              <h3 className="text-sm font-heading font-bold leading-snug mb-3 flex-shrink-0 transition-colors duration-300"
                style={{ color: "var(--text)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text)")}>
                {post.title}
              </h3>
              <p className="text-xs leading-relaxed line-clamp-4 flex-1 mb-6" style={{ color: "var(--text-muted)" }}>{post.excerpt}</p>
              <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-[10px] font-medium" style={{ color: "var(--text-dim)" }}>{post.date}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer group/link transition-colors" style={{ color: "var(--gold)" }}>
                  Read<ArrowRight size={12} className="transition-transform group-hover/link:translate-x-1" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
