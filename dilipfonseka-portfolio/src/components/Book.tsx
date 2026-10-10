"use client";
import { Check, Star, BookOpen, ShoppingCart } from "lucide-react";

export default function Book() {
  const insights = [
    { title: "Setbacks to Strategy", desc: "Repurposing personal and professional difficulties as structural plans for institutional growth." },
    { title: "The Confidence Mandate", desc: "Why confidence under pressure is the deciding factor, outperforming pure academic markers." },
    { title: "Patient-First Dispensing", desc: "Moving pharmaceutical practice from product delivery to empathetic human service." },
  ];

  return (
    <section id="book" className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, var(--border), transparent)" }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Book Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"
                style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--gold) 20%, transparent), color-mix(in srgb, var(--teal) 10%, transparent))" }} />
              <div className="relative w-56 md:w-64 aspect-[2/3] rounded-r-2xl rounded-l-sm overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.3)]">
                <div className="absolute left-0 top-0 bottom-0 w-3 z-10"
                  style={{ background: "linear-gradient(to right, var(--gold-dim), var(--gold), var(--gold-dim))" }} />
                <div className="absolute inset-0 flex flex-col p-7" style={{ backgroundColor: "var(--surface)" }}>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} size={9} style={{ color: "var(--gold)" }} fill="currentColor" />)}
                  </div>
                  <div className="h-[2px] w-10 mb-5" style={{ background: "linear-gradient(to right, var(--gold), transparent)" }} />
                  <div className="flex-1">
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "color-mix(in srgb, var(--gold) 60%, transparent)" }}>Bestseller</p>
                    <h3 className="text-2xl font-heading font-black leading-tight" style={{ color: "var(--text)" }}>
                      RISING<br />ABOVE<br /><span style={{ color: "var(--gold)" }}>CHALLENGES</span><br />FOR<br />SUCCESS
                    </h3>
                  </div>
                  <div>
                    <div className="h-px w-full mb-4" style={{ backgroundColor: "var(--border)" }} />
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text)" }}>Dilip Kumara Fonseka</p>
                    <p className="text-[9px] font-semibold mt-1" style={{ color: "var(--teal)" }}>Ceylon Pharma College</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 px-4 py-2.5 rounded-xl text-black text-[10px] font-black uppercase tracking-wider glow-pulse"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))" }}>
                🇮🇳 New Delhi Launch
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7 flex flex-col gap-7">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>Published Author</p>
              <h2 className="text-4xl md:text-5xl font-heading font-black" style={{ color: "var(--text)" }}>
                &quot;Rising Above<br /><span className="gradient-text">Challenges for Success&quot;</span>
              </h2>
              <p className="text-sm font-semibold mt-2" style={{ color: "color-mix(in srgb, var(--gold) 70%, transparent)" }}>
                Official launch at Crowne Plaza, New Delhi — December 2024
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Written from two decades of experience navigating the healthcare sector, this book functions as both a personal memoir of building Ceylon Pharma College and a tactical manual for students facing career chokepoints.
            </p>
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "var(--text-dim)" }}>3 Key Insights</p>
              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-xl border transition-all duration-300 group"
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 30%, transparent)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                    <div className="mt-0.5 p-1.5 rounded-lg shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--teal) 10%, transparent)", color: "var(--teal)" }}>
                      <Check size={13} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>{ins.title}</h4>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{ins.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-black transition-all duration-300"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", boxShadow: "0 4px 20px color-mix(in srgb, var(--gold) 25%, transparent)" }}>
                <ShoppingCart size={16} />Order a Signed Copy
              </a>
              <a href="#speaking" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-300"
                style={{ color: "var(--text)", borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                <BookOpen size={16} />Inquire Book Readings
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
