"use client";
import { Heart, CheckCircle2, Trophy } from "lucide-react";

export default function About() {
  const awards = [
    { title: "Revolutionary Thinker", meta: "Asia's Icon Awards 2024", desc: "Awarded at Crowne Plaza, New Delhi for innovative methodologies bridging the academic-practice chasm.", accent: "var(--gold)" },
    { title: "Asia's Innovative Thinker", meta: "Asia Awards 2024", desc: "For launching Sri Lanka's first simulated digital pharmacy portal providing real-life training scenarios.", accent: "var(--teal)" },
    { title: "Motivational Think Tank", meta: "International Achievers 2024", desc: "Recognized as the year's leading educational visionary inspiring thousands of pharmacists nationwide.", accent: "var(--gold)" },
  ];

  const storyBeats = [
    { num: "01", title: "The Problem Identified", body: "As a working government pharmacist, I saw firsthand the dangerous gap between what pharmacy graduates learned in theory and what the real pharmaceutical workplace demanded." },
    { num: "02", title: "The Bold Decision", body: "In 2020 — during a global shutdown — I started Ceylon Pharma College with just 10 students. No campus fame, no inherited reputation. Only a whiteboard, a rented room, and a clear vision." },
    { num: "03", title: "The Result", body: "Four years later, over 3,000 students graduated, 23 batches completed, three international awards earned, and a published book — a national movement established." },
  ];

  return (
    <section id="about" className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, var(--border), transparent)" }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>Origin Story & Awards</p>
          <h2 className="text-4xl md:text-5xl font-heading font-black" style={{ color: "var(--text)" }}>
            The Journey of a<br /><span className="gradient-text">Visionary Educator</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          <div className="lg:col-span-7 space-y-px">
            {storyBeats.map((beat, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 transition-all duration-300"
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--gold)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 50%, transparent)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                    {beat.num}
                  </div>
                  {i < storyBeats.length - 1 && <div className="w-px flex-1 mt-2 min-h-[40px]" style={{ background: "linear-gradient(to bottom, var(--border), transparent)" }} />}
                </div>
                <div className="pb-10">
                  <h3 className="text-base font-heading font-bold mb-2" style={{ color: "var(--text)" }}>{beat.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{beat.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "color-mix(in srgb, var(--teal) 12%, transparent)", color: "var(--teal)" }}><Heart size={16} /></div>
                <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>My Bigger Vision</h4>
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-muted)" }}>
                &quot;I am not just building a college. I am building a generation of competent, confident pharmaceutical professionals who will transform healthcare outcomes in Sri Lanka — and beyond.&quot;
              </p>
            </div>
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "color-mix(in srgb, var(--gold) 12%, transparent)", color: "var(--gold)" }}><CheckCircle2 size={16} /></div>
                <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Core Philosophy</h4>
              </div>
              <ul className="space-y-3">
                {[["Empathy Over Memorization", "Understanding the patient is more critical than memorizing chemical structures."],
                  ["Workforce Readiness", "Real-life simulation is core curriculum, not an afterthought."],
                  ["Leadership & Confidence", "Students need soft skills and drive to lead, not just knowledge."]].map(([title, desc], i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="font-black text-xs mt-0.5" style={{ color: "var(--gold)" }}>0{i + 1}</span>
                    <span style={{ color: "var(--text-muted)" }}><strong style={{ color: "var(--text)" }}>{title}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6" style={{ color: "var(--text-dim)" }}>Detailed Honors & Credentials</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {awards.map((a, i) => (
              <div key={i} className="p-6 rounded-2xl border transition-all duration-300 group"
                style={{ backgroundColor: `color-mix(in srgb, ${a.accent} 6%, var(--surface))`, borderColor: "var(--border)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `color-mix(in srgb, ${a.accent} 40%, transparent)`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div className="p-2.5 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `color-mix(in srgb, ${a.accent} 12%, transparent)`, color: a.accent }}>
                  <Trophy size={20} />
                </div>
                <h4 className="text-base font-heading font-bold mb-1" style={{ color: "var(--text)" }}>{a.title}</h4>
                <p className="text-xs font-semibold mb-3" style={{ color: a.accent }}>{a.meta}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
