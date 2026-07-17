"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) { setStatus("error"); return; }
    setStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 5000);
  };

  const contacts = [
    { icon: <Mail size={18} />, label: "Direct Email", value: "info@dilipfonseka.com", href: "mailto:info@dilipfonseka.com" },
    { icon: <Phone size={18} />, label: "WhatsApp / Call", value: "+94 70 447 7555", href: "https://wa.me/94704477555" },
    { icon: <MapPin size={18} />, label: "Headquarters", value: "Ceylon Pharma College, Colombo, Sri Lanka", href: "#" },
  ];

  return (
    <section id="contact" className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px]"
        style={{ background: "linear-gradient(to right, transparent, var(--border), transparent)" }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--gold)" }}>Get in Touch</p>
              <h2 className="text-4xl md:text-5xl font-heading font-black" style={{ color: "var(--text)" }}>
                Contact &amp;<br /><span className="gradient-text">Collaboration</span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-muted)" }}>
              Whether you&apos;re looking for B2B educational partnerships, media commentary, or Ceylon Pharma College program inquiries — we&apos;d love to hear from you.
            </p>
            <div className="space-y-4 mt-2">
              {contacts.map((c, i) => (
                <a key={i} href={c.href} className="flex gap-4 items-center p-5 rounded-2xl border transition-all duration-300 group"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 30%, transparent)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div className="p-2.5 rounded-xl transition-colors shrink-0"
                    style={{ backgroundColor: "color-mix(in srgb, var(--gold) 10%, transparent)", color: "var(--gold)" }}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-dim)" }}>{c.label}</p>
                    <p className="text-sm font-medium transition-colors" style={{ color: "var(--text)" }}>{c.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl border shadow-xl" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <h3 className="text-xl font-heading font-bold mb-6" style={{ color: "var(--text)" }}>Send a Message</h3>
              {status === "success" && (
                <div className="mb-6 p-4 rounded-xl border text-xs flex gap-3 items-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--teal) 8%, transparent)", borderColor: "color-mix(in srgb, var(--teal) 20%, transparent)", color: "var(--teal-light)" }}>
                  <CheckCircle2 size={16} className="shrink-0" /><span>Message sent! We will get back to you soon.</span>
                </div>
              )}
              {status === "error" && (
                <div className="mb-6 p-4 rounded-xl border text-red-400 text-xs flex gap-3 items-center"
                  style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                  <AlertCircle size={16} className="shrink-0" /><span>Please fill in all required fields.</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{ id: "ct-name", label: "Your Name *", type: "text", val: "name", ph: "Jane Perera", req: true },
                    { id: "ct-email", label: "Email *", type: "email", val: "email", ph: "jane@domain.com", req: true }].map(f => (
                    <div key={f.id} className="flex flex-col gap-1.5">
                      <label htmlFor={f.id} className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                      <input id={f.id} type={f.type} required={f.req} placeholder={f.ph}
                        value={formData[f.val as keyof typeof formData]}
                        onChange={e => setFormData({ ...formData, [f.val]: e.target.value })}
                        className="w-full p-3.5 rounded-xl text-sm focus:outline-none transition-all"
                        style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 50%, transparent)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-subject" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Query Type</label>
                  <select id="ct-subject" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3.5 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    <option value="" disabled>Select inquiry type</option>
                    <option value="partnership">B2B Institutional Partnership</option>
                    <option value="media">Media / Press Interview</option>
                    <option value="college">Ceylon Pharma College Inquiry</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ct-message" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Message *</label>
                  <textarea id="ct-message" rows={5} required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide context regarding your request..."
                    className="w-full p-3.5 rounded-xl text-sm focus:outline-none resize-none transition-all"
                    style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 50%, transparent)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-black flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", boxShadow: "0 4px 20px color-mix(in srgb, var(--gold) 25%, transparent)" }}>
                  <Send size={15} />Send Message <ArrowRight size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
