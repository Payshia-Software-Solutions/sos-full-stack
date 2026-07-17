"use client";
import { Facebook, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-12" style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="flex flex-col items-center md:items-start gap-2">
          <a href="#home" className="flex items-center gap-2 text-lg font-heading font-black" style={{ color: "var(--text)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-black"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dim))" }}>DF</div>
            DILIP <span className="ml-1" style={{ color: "var(--gold)" }}>FONSEKA</span>
          </a>
          <p className="text-xs text-center md:text-left" style={{ color: "var(--text-dim)" }}>
            Founder & Managing Director — Ceylon Pharma College
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-4 text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
          {["About", "College", "Book", "Press", "Speaking", "Contact"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="transition-colors duration-200"
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
              {l}
            </a>
          ))}
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-3">
            {[{ icon: <Facebook size={16} />, href: "https://facebook.com/DilipFonsekaLK", label: "Facebook" },
              { icon: <Linkedin size={16} />, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: <Youtube size={16} />, href: "https://youtube.com", label: "YouTube" }].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="p-2.5 rounded-xl border transition-all duration-300"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 30%, transparent)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                {s.icon}
              </a>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>&copy; {currentYear} Dilip Fonseka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
