"use client";
import { Activity, ShieldCheck, Users, GraduationCap, Layout, BookOpen } from "lucide-react";

export default function College() {
  const stats = [
    { icon: <Users size={22} />, value: "3,000+", label: "Graduates", desc: "Grew from 10 students in 2020" },
    { icon: <GraduationCap size={22} />, value: "23", label: "Batches", desc: "All successfully placed" },
    { icon: <Users size={22} />, value: "1,600+", label: "Mentored", desc: "Directly by Dilip Fonseka" },
    { icon: <ShieldCheck size={22} />, value: "#1", label: "Institute", desc: "Sri Lanka's Best Training Centre" },
  ];
  const programs = [
    { title: "Professional Pharmacy Practice", desc: "Foundation course covering local pharmaceutical law, dispensing, and patient communication." },
    { title: "Advanced Pharmacy Practice", desc: "Clinical skills, drug interactions, and pharmaceutical care methodologies." },
    { title: "Certificate Modules", desc: "Short-term specialized modules targeting current dispensary protocols." },
    { title: "International Role Preparation", desc: "Custom curriculum for UK, Middle East, and Australia pharmacy environments." },
  ];

  return (
    <section id="college" className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, var(--border), transparent)" }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--teal)" }}>Ceylon Pharma College</p>
            <h2 className="text-4xl md:text-5xl font-heading font-black" style={{ color: "var(--text)" }}>
              Transformative<br /><span className="gradient-text">Institutional Impact</span>
            </h2>
          </div>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>The institutional vehicle realizing Dilip Fonseka&apos;s educational vision.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl border text-center transition-all duration-300 group"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 30%, transparent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div className="p-3 rounded-xl border w-fit mx-auto mb-4 transition-colors" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)", color: "var(--teal)" }}>
                {s.icon}
              </div>
              <p className="text-4xl font-heading font-black mb-1" style={{ color: "var(--gold)" }}>{s.value}</p>
              <p className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>{s.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative p-8 md:p-10 rounded-3xl border mb-16 overflow-hidden"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase mb-5"
                style={{ borderColor: "color-mix(in srgb, var(--gold) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--gold) 8%, transparent)", color: "var(--gold)" }}>
                <Activity size={11} />Pioneering Innovation
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-black mb-4" style={{ color: "var(--text)" }}>Simulated Digital Pharmacy Portal</h3>
              <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--text-muted)" }}>
                Sri Lanka&apos;s first simulated digital pharmacy portal — emulating real-world inventory management, prescription decoding under pressure, and patient communication — ensuring students are Day-1 ready.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-2xl border text-center w-full max-w-[260px]"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
                <div className="p-4 rounded-xl border w-fit mx-auto mb-4" style={{ backgroundColor: "color-mix(in srgb, var(--gold) 10%, transparent)", borderColor: "color-mix(in srgb, var(--gold) 20%, transparent)", color: "var(--gold)" }}>
                  <Layout size={36} />
                </div>
                <h4 className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>Interactive Portal</h4>
                <p className="text-[10px] mb-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>Simulates live prescription flow and inventory.</p>
                <span className="px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wide"
                  style={{ backgroundColor: "color-mix(in srgb, var(--teal) 10%, transparent)", borderColor: "color-mix(in srgb, var(--teal) 30%, transparent)", color: "var(--teal-light)" }}>
                  Active in Curriculum
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--gold) 10%, transparent)", color: "var(--gold)" }}><BookOpen size={18} /></div>
            <h3 className="text-xl font-heading font-bold" style={{ color: "var(--text)" }}>Professional Training Programs</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl border transition-all duration-300 group"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 30%, transparent)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div className="flex items-start gap-3">
                  <span className="font-black text-xs mt-1" style={{ color: "color-mix(in srgb, var(--gold) 40%, transparent)" }}>0{i + 1}</span>
                  <div>
                    <h4 className="text-sm font-bold mb-2 transition-colors" style={{ color: "var(--text)" }}>{p.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
