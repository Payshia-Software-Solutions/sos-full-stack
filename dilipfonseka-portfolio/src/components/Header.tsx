"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "About", href: "#about" },
    { name: "CPC", href: "#college" },
    { name: "Book", href: "#book" },
    { name: "Press", href: "#press" },
    { name: "Speaking", href: "#speaking" },
    { name: "Insights", href: "#blog" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "backdrop-blur-xl border-b py-3 shadow-lg"
          : "bg-transparent py-6"
      }`}
      style={isScrolled ? { backgroundColor: "color-mix(in srgb, var(--bg) 85%, transparent)", borderColor: "var(--border)" } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="group flex items-center gap-2 text-lg font-heading font-black tracking-tight" style={{ color: "var(--text)" }}>
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] flex items-center justify-center shadow-[0_0_12px_rgba(201,168,76,0.4)] group-hover:shadow-[0_0_22px_rgba(201,168,76,0.6)] transition-all duration-300">
            <span className="text-xs font-black text-black">DF</span>
          </div>
          <span>
            DILIP <span style={{ color: "var(--gold)" }}>FONSEKA</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {item.name}
            </a>
          ))}
          <a
            href="#contact"
            className="ml-3 px-5 py-2 text-xs font-black uppercase tracking-widest text-black rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(201,168,76,0.25)] hover:shadow-[0_0_25px_rgba(201,168,76,0.5)]"
            style={{ background: `linear-gradient(135deg, var(--gold), var(--gold-light))` }}
          >
            Contact
          </a>
          <div className="ml-3">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-6 mt-4 mb-6 p-4 rounded-2xl border flex flex-col gap-1"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium rounded-xl transition-all"
              style={{ color: "var(--text-muted)" }}
            >
              {item.name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 px-4 py-3 text-sm font-black text-center uppercase tracking-widest text-black rounded-xl"
            style={{ background: `linear-gradient(135deg, var(--gold), var(--gold-light))` }}
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
