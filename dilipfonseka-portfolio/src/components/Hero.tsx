"use client";
import Image from "next/image";
import { Award, BookOpen, Calendar, ArrowUpRight, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const awards = [
    { title: "Revolutionary Thinker", org: "Asia's Icon Awards 2024" },
    { title: "Asia's Innovative Thinker", org: "Asia Awards 2024" },
    { title: "Motivational Think Tank", org: "International Achievers 2024" },
  ];

  const isLight = mounted && resolvedTheme === "light";
  const imageSrc = isLight ? "/dilip-light-mode.webp" : "/dilip-hero.webp";

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col lg:block transition-colors duration-300"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* ── CONTENT CONTAINER (Aligned with Header container) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex items-center pt-28 pb-20 min-h-screen">
        <div className="w-full lg:w-[50%] flex flex-col gap-6 pr-0 lg:pr-8">

          {/* Eyebrow badge */}
          <div
            className="inline-flex self-start items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold tracking-[0.12em] uppercase"
            style={{
              borderColor: "color-mix(in srgb, var(--gold) 35%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--gold) 10%, transparent)",
              color: "var(--gold)",
            }}
          >
            <Sparkles size={11} />
            Founder & MD — Ceylon Pharma College
          </div>

          {/* Heading */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.1] transition-colors duration-300"
            style={{ color: "var(--text)" }}
          >
            Shaping<br />
            <span className="gradient-text">Sri Lanka&apos;s</span><br />
            Healthcare<br />
            <span style={{ color: "var(--gold)" }}>Leaders.</span>
          </h1>

          <p 
            className="text-sm md:text-base leading-relaxed transition-colors duration-300" 
            style={{ color: "var(--text-muted)" }}
          >
            20+ years as a Government Pharmacist turned into a national movement.
            Ceylon Pharma College grew from <strong style={{ color: "var(--text)" }}>10 students</strong> in
            2020 to <strong style={{ color: "var(--text)" }}>3,000+ graduates</strong> — built on
            practical, simulation-first education.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-2">
            <a
              href="#speaking"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                boxShadow: "0 4px 24px color-mix(in srgb, var(--gold) 40%, transparent)",
              }}
            >
              <Calendar size={16} />
              Book Me to Speak
            </a>
            <a
              href="#book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-semibold border transition-all duration-300 hover:-translate-y-0.5"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            >
              <BookOpen size={16} />
              Read My Book
            </a>
            <a
              href="#college"
              className="inline-flex items-center gap-1.5 px-4 py-3 text-xs md:text-sm font-medium transition-colors group"
              style={{ color: "var(--teal)" }}
            >
              Ceylon Pharma College
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Award strip */}
          <div className="mt-4 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p
              className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 transition-colors duration-300"
              style={{ color: "var(--text-dim)" }}
            >
              Triple Award Winner — 2024 International Recognition
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {awards.map((a, i) => (
                <div
                  key={i}
                  className="flex-1 flex items-start gap-2.5 p-3.5 rounded-xl transition-all duration-300 group cursor-default"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 40%, transparent)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg" style={{ backgroundColor: "color-mix(in srgb, var(--gold) 12%, transparent)" }}>
                    <Award size={13} style={{ color: "var(--gold)" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight transition-colors duration-300" style={{ color: "var(--text)" }}>{a.title}</p>
                    <p className="text-[10px] mt-0.5 transition-colors duration-300" style={{ color: "color-mix(in srgb, var(--gold) 70%, transparent)" }}>{a.org}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Name tag bottom */}
          <div className="mt-2 flex items-center gap-3">
            <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: "color-mix(in srgb, var(--gold) 40%, transparent)" }} />
            <div>
              <p className="text-xs font-black tracking-wide transition-colors duration-300" style={{ color: "var(--text)" }}>H M Dilip Kumara Fonseka</p>
              <p className="text-[10px] transition-colors duration-300" style={{ color: "var(--teal)" }}>Government Pharmacist · Author · Educator</p>
            </div>
          </div>

        </div>

        {/* Scroll hint on left side */}
        <div className="absolute bottom-6 left-6 md:left-12 lg:left-6 hidden lg:flex items-center gap-3">
          <div className="w-8 h-px" style={{ backgroundColor: "var(--gold)" }} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--text-dim)" }}>
            Scroll to Explore
          </span>
        </div>
      </div>

      {/* ── RIGHT SIDE: PORTRAIT (Absolute on desktop, extends to screen edge) ── */}
      <div 
        className="relative lg:absolute lg:top-0 lg:right-0 w-full lg:w-1/2 h-[60vh] lg:h-full shrink-0 border-t lg:border-t-0 lg:border-l transition-colors duration-300 z-0" 
        style={{ borderColor: "var(--border)" }}
      >
        {mounted && (
          <Image
            src={imageSrc}
            alt="Dilip Fonseka"
            fill
            className="object-cover object-center"
            priority
            quality={95}
          />
        )}
        {!mounted && (
          <Image
            src="/dilip-hero.webp"
            alt="Dilip Fonseka"
            fill
            className="object-cover object-center"
            priority
            quality={95}
          />
        )}
        {/* Subtle shadow overlay only on mobile view */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent lg:hidden" />
      </div>
    </section>
  );
}
