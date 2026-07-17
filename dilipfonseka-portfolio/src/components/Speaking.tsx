"use client";
import { useState } from "react";
import { Mic, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function Speaking() {
  const [formData, setFormData] = useState({ name: "", org: "", email: "", date: "", topic: "", details: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const topics = [
    { title: "Bridging the Academic-Practice Gap", desc: "Why theoretical models fail pharmacy graduates and how simulation portals drive readiness." },
    { title: "Resilient Leadership: 10 to 3,000", desc: "Lessons from launching Ceylon Pharma College during a global lockdown." },
    { title: "The Future of Pharmacy Practice", desc: "Evolving role scopes and preparing students for global pharmaceutical roles." },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.topic) { setStatus("error"); return; }
    setStatus("success");
    setFormData({ name: "", org: "", email: "", date: "", topic: "", details: "" });
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <section id="speaking" className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, var(--border), transparent)" }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>Keynote Speaker</p>
              <h2 className="text-4xl md:text-5xl font-heading font-black" style={{ color: "var(--text)" }}>
                Speaking <span className="gradient-text">Topics</span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              High-impact keynote presentations, panels, and masterclasses targeting academic faculties, clinical networks, and student assemblies.
            </p>
            <div className="space-y-3">
              {topics.map((t, i) => (
                <div key={i} className="p-5 rounded-2xl border transition-all duration-300 group"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 30%, transparent)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div className="flex gap-3.5 items-start">
                    <div className="p-2 rounded-xl shrink-0 transition-colors" style={{ backgroundColor: "color-mix(in srgb, var(--gold) 10%, transparent)", color: "var(--gold)" }}>
                      <Mic size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text)" }}>{t.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl border shadow-xl" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <h3 className="text-xl font-heading font-bold mb-6" style={{ color: "var(--text)" }}>Speaking Engagement Inquiry</h3>
              {status === "success" && (
                <div className="mb-6 p-4 rounded-xl border text-xs flex gap-3 items-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--teal) 8%, transparent)", borderColor: "color-mix(in srgb, var(--teal) 20%, transparent)", color: "var(--teal-light)" }}>
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Your inquiry was sent. Dilip&apos;s team will get back to you shortly.</span>
                </div>
              )}
              {status === "error" && (
                <div className="mb-6 p-4 rounded-xl border text-red-400 text-xs flex gap-3 items-center"
                  style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                  <AlertCircle size={16} className="shrink-0" />
                  <span>Please fill in all required fields.</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  [{ id: "sp-name", label: "Full Name *", type: "text", val: "name", ph: "Dr. John Doe", req: true },
                   { id: "sp-org", label: "Organization", type: "text", val: "org", ph: "Ministry of Health", req: false }],
                  [{ id: "sp-email", label: "Email *", type: "email", val: "email", ph: "you@example.com", req: true },
                   { id: "sp-date", label: "Event Date", type: "date", val: "date", ph: "", req: false }],
                ].map((row, ri) => (
                  <div key={ri} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {row.map(f => (
                      <div key={f.id} className="flex flex-col gap-1.5">
                        <label htmlFor={f.id} className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                        <input id={f.id} type={f.type} required={f.req} placeholder={f.ph}
                          value={formData[f.val as keyof typeof formData]}
                          onChange={e => setFormData({ ...formData, [f.val]: e.target.value })}
                          className="w-full p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 50%, transparent)")}
                          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                      </div>
                    ))}
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-topic" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Preferred Topic *</label>
                  <select id="sp-topic" required value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full p-3.5 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    <option value="" disabled>Select a Keynote Topic</option>
                    <option value="gap">Bridging the Academic-Practice Gap</option>
                    <option value="leadership">Resilient Leadership: 10 to 3,000</option>
                    <option value="future">The Future of Pharmacy Practice</option>
                    <option value="custom">Custom / Panel Request</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sp-details" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Event Details</label>
                  <textarea id="sp-details" rows={4} value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Describe your event format, audience, and timeline..."
                    className="w-full p-3.5 rounded-xl text-sm focus:outline-none resize-none transition-all"
                    style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 50%, transparent)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-black flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", boxShadow: "0 4px 20px color-mix(in srgb, var(--gold) 25%, transparent)" }}>
                  Send Invitation <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
