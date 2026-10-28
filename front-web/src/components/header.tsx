"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, Search, Phone, Mail, GraduationCap, Home, BookOpen, Award, Info, Star, Newspaper, MessageSquare, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/language-context';
import LanguageSwitcher from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

const TopBar = () => {
  const { t, language } = useTranslation();

  return (
    <div className="hidden bg-emerald-800 text-white print:hidden lg:block border-b border-emerald-900/30">
      <div className="container mx-auto flex h-9 items-center justify-between px-4 md:px-6 text-xs">
        {/* Left: Hotline & Credentials */}
        <div className="flex items-center gap-5 whitespace-nowrap">
          <a 
            href="tel:0715884884" 
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-100 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>0715 884 884</span>
          </a>
          <a 
            href="mailto:info@pharmacollege.lk" 
            className="hidden xl:inline-flex items-center gap-1.5 text-emerald-200 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>info@pharmacollege.lk</span>
          </a>
          <span className="hidden 2xl:inline-flex items-center gap-1.5 text-emerald-200/90 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
            ACTD Accredited • ISO 9001:2015 Certified
          </span>
        </div>

        {/* Right: Quick Links & LMS Login */}
        <div className="flex items-center gap-4 xl:gap-5 text-xs font-medium whitespace-nowrap">
          <Link href="/payment" className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 transition-colors">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'si' ? 'ගෙවීම් (Pay / Slip Upload)' : 'Pay / Slip Upload'}</span>
          </Link>
          <Link href="/alumni" className="text-emerald-100 hover:text-white transition-colors">
            {t('alumni')}
          </Link>
          <Link href="/csr" className="text-emerald-100 hover:text-white transition-colors">
            {t('csrProjects')}
          </Link>
          <div className="h-3.5 w-px bg-emerald-600/60" />
          <a 
            href="https://sos.pharmacollege.lk/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition-colors"
          >
            <span>{t('login')}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">LMS</span>
          </a>
          <Link 
            href="/contact" 
            className="bg-amber-400 text-zinc-950 font-bold px-3 py-1 rounded text-xs hover:bg-amber-300 transition-colors shadow-sm"
          >
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
};

// 7 Clean, high-converting, single-level navigation items (No dummy dropdowns!)
const mainNavLinks = [
  { key: 'home', href: '/', icon: Home },
  { key: 'courses', href: '/courses', icon: BookOpen },
  { key: 'certificate', href: '/certificates', icon: Award },
  { key: 'about', href: '/about', icon: Info },
  { key: 'reviews', href: '/reviews', icon: Star },
  { key: 'blogs', href: '/blogs', icon: Newspaper },
  { key: 'contact', href: '/contact', icon: MessageSquare },
];

const DesktopNav = () => {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <nav className="hidden h-full items-center gap-x-1 lg:gap-x-1.5 xl:gap-x-2 md:flex shrink-0">
      {mainNavLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.key}
            href={link.href}
            className={cn(
              "relative px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-[13px] xl:text-sm font-semibold transition-all duration-150 whitespace-nowrap inline-flex items-center",
              isActive 
                ? "text-primary bg-primary/10 font-bold shadow-sm" 
                : "text-foreground/80 hover:text-primary hover:bg-muted/70"
            )}
          >
            <span>{t(link.key as any)}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const MobileNav = ({ closeSheet }: { closeSheet: () => void }) => {
  const { t, language } = useTranslation();
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full text-base">
      <div className="p-4 space-y-1.5 border-b">
        <h3 className="px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-2">Main Menu</h3>
        {mainNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.key}
              href={link.href}
              onClick={closeSheet}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground font-bold shadow-sm" 
                  : "text-foreground hover:text-primary hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t(link.key as any)}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Quick Access</h3>
        <div className="grid grid-cols-2 gap-2 px-1 text-sm">
          <Link href="/alumni" onClick={closeSheet} className="p-2 rounded-md hover:bg-muted text-foreground hover:text-primary transition-colors">
            {t('alumni')}
          </Link>
          <Link href="/csr" onClick={closeSheet} className="p-2 rounded-md hover:bg-muted text-foreground hover:text-primary transition-colors">
            {t('csrProjects')}
          </Link>
        </div>

        <div className="pt-3 border-t space-y-2">
          <Button asChild className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md">
            <Link href="/apply" onClick={closeSheet}>
              <GraduationCap className="w-4 h-4 mr-2 shrink-0" />
              {t('heroApplyNow')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full font-semibold border-primary/30 text-primary hover:bg-primary/5">
            <Link href="/payment" onClick={closeSheet}>
              <CreditCard className="w-4 h-4 mr-2 shrink-0" />
              {language === 'si' ? 'ගෙවීම් රිසිට්පත් යොමු කරන්න' : 'Upload Payment Slip'}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full font-semibold">
            <a href="https://sos.pharmacollege.lk/" target="_blank" rel="noopener noreferrer">
              {t('login')} (LMS Portal)
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const closeSheet = () => setIsOpen(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/70 shadow-sm print:hidden">
      <TopBar />
      <div className="container mx-auto flex h-20 items-center justify-between px-3 md:px-6 gap-2">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center shrink-0 mr-2 lg:mr-4">
          <Image
            src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
            alt="Ceylon Pharma College Logo"
            width={180}
            height={56}
            className="h-10 sm:h-11 w-auto dark:hidden"
            priority
          />
          <Image
            src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
            alt="Ceylon Pharma College Logo"
            width={180}
            height={56}
            className="h-10 sm:h-11 w-auto hidden dark:block dark:brightness-0 dark:invert"
            priority
          />
        </Link>
        
        {/* Center: Clean Single-Level Navigation Links */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <DesktopNav />
        </div>
        
        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto md:ml-0">
          {/* Desktop Language Switcher */}
          <div className="hidden lg:block">
            <LanguageSwitcher variant="light" />
          </div>

          {/* Course Search Button */}
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:text-primary" title="Search Courses">
            <Link href="/courses">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Desktop 'Apply Now' CTA Button (on xl screens) */}
          <Button asChild className="hidden xl:inline-flex font-bold text-xs px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:scale-105 transition-all whitespace-nowrap">
            <Link href="/apply">
              <GraduationCap className="w-4 h-4 mr-1.5 shrink-0" />
              <span>{t('heroApplyNow')}</span>
            </Link>
          </Button>

          {/* Mobile Language Switcher */}
          <div className="lg:hidden">
            <LanguageSwitcher variant="light" className="text-[10px]" />
          </div>

          {/* Mobile Hamburger Drawer */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Toggle navigation menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
                <SheetTitle className="sr-only">Main Menu</SheetTitle>
                <div className="p-4 border-b flex justify-between items-center bg-muted/40">
                  <Link href="/" onClick={closeSheet}>
                    <Image
                      src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                      alt="Ceylon Pharma College Logo"
                      width={150}
                      height={46}
                      className="h-9 w-auto dark:hidden"
                      priority
                    />
                    <Image
                      src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                      alt="Ceylon Pharma College Logo"
                      width={150}
                      height={46}
                      className="h-9 w-auto hidden dark:block dark:brightness-0 dark:invert"
                      priority
                    />
                  </Link>
                  <ThemeToggle />
                </div>
                <div className="flex-grow overflow-y-auto">
                  <MobileNav closeSheet={closeSheet} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
