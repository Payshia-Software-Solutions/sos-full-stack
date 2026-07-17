"use client";
import { ExternalLink, Newspaper, Award } from "lucide-react";

export default function Press() {
  const articles = [
    { source: "The Island", title: "From Government Pharmacist to Pharmaceutical Education Pioneer", desc: "An in-depth profile detailing Dilip Fonseka's 20-year journey inside state pharmacy services.", type: "Profile Feature", accent: "var(--gold)" },
    { source: "LankaTalks", title: "Ceylon Pharma College: Sri Lanka's Best Pharmaceutical Training Institute", desc: "Press coverage on the institutional achievements and growth metrics shaping national standing.", type: "Award Recognition", accent: "var(--teal)" },
    { source: "Asia Awards", title: "Sri Lankan Educator wins Revolutionary Thinker Award", desc: "Official announcement of international honors conferred in New Delhi for innovative curriculum design.", type: "International Press", accent: "var(--gold)" },
    { source: "Lanka Business News", title: "Simulating Real-World Practice: How digital systems transform pharmacy training", desc: "Technical review of the digital pharmacy portal developed by Ceylon Pharma College.", type: "Tech & Innovation", accent: "var(--teal)" },
  ];

  return (
    <section id="press" className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, var(--border), transparent)" }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>Earned Media</p>
          <h2 className="text-4xl md:text-5xl font-heading font-black" style={{ color: "var(--text)" }}>
            Press & Media <span className="gradient-text">Coverage</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 mb-16 py-6 border-y"
          style={{ borderColor: "var(--border)" }}>
          {["THE ISLAND", "LankaTalks", "ASIA AWARDS", "Lanka Business News"].map((pub, i) => (
            <span key={i} className="font-heading font-extrabold tracking-tight text-lg md:text-xl cursor-default transition-colors duration-300"
              style={{ color: "var(--text-dim)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
              {pub}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art, i) => (
            <div key={i} className="p-6 rounded-2xl border transition-all duration-300 group flex flex-col justify-between"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest"
                    style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    {art.source}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: art.accent }}>
                    {art.type === "Award Recognition" ? <Award size={10} /> : <Newspaper size={10} />}
                    {art.type}
                  </span>
                </div>
                <h3 className="text-sm font-heading font-bold leading-snug mb-3 transition-colors duration-300"
                  style={{ color: "var(--text)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text)")}>
                  {art.title}
                </h3>
                <p className="text-xs leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>{art.desc}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer transition-colors w-fit" style={{ color: art.accent }}>
                Read article<ExternalLink size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
