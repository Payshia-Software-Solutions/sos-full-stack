
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, ChevronDown, Search, Minus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/language-context';
import LanguageSwitcher from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

const TopBar = () => {
    const { t } = useTranslation();
    const topNavLinks = [
      { key: 'alumni', href: '/alumni' },
      { key: 'qualityAssurance', href: '#' },
      { key: 'innovation', href: '#' },
      { key: 'international', href: '#' },
      { key: 'resources', href: '#' },
      { key: 'csrProjects', href: '/csr' },
      { key: 'library', href: '#' },
    ];

    return (
      <div className="hidden bg-primary text-primary-foreground print:hidden lg:block">
        <div className="container mx-auto flex h-10 items-center justify-between px-4 md:px-6">
          <nav className="flex items-center gap-x-6 text-xs font-medium">
            {topNavLinks.map((link) => (
              <Link key={link.key} href={link.href} className="transition-colors hover:text-primary-foreground/80">
                {t(link.key as any)}
              </Link>
            ))}
          </nav>
          <div className="flex h-full items-center">
            <LanguageSwitcher />
            <a href="https://lms.pharmacollege.lk" target="_blank" rel="noopener noreferrer" className="flex h-full items-center px-4 text-xs font-medium transition-colors hover:bg-primary-foreground/10">
              {t('login')}
            </a>
             <Button asChild className="h-full rounded-none bg-[#FFC72C] px-6 text-xs font-bold text-black hover:bg-[#FFC72C]/90">
                <Link href="/contact">{t('contactUs')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
};

const mainNavConfig = {
  links: [
    { key: 'home', href: '/' },
    { key: 'certificate', href: '/#verify' },
    { key: 'courses', href: '/courses' },
    { key: 'reviews', href: '/reviews'},
    { key: 'blogs', href: '/blogs'},
  ],
  dropdowns: [
    {
      titleKey: 'departments',
      items: [
        { key: 'deptNamePharmaceutical', href: '/departments/department-of-pharmaceutical' },
        { key: 'deptNameEnglish', href: '/departments/department-of-english' },
        { key: 'deptNameIct', href: '/departments/department-of-information-communication-technology' },
      ],
    },
    {
      titleKey: 'students',
      items: [
        { key: 'academicCalendar', href: '/students/academic-calendar' },
        { key: 'examinations', href: '/students/examinations' },
      ],
    },
  ],
  otherLinks: [
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
  ],
};

const DesktopNav = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleMouseEnter = (title: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setOpenDropdown(title);
  };

  const handleMouseLeave = () => {
    timerRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };
  
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
      const isActive = pathname === href;

      return (
          <Link href={href} className={cn(
              "relative flex h-full items-center text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-foreground"
          )}>
              {children}
              {isActive && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary" />}
          </Link>
      );
  };

  return (
    <nav className="hidden h-full items-center gap-x-6 md:flex">
      {mainNavConfig.links.map((link) => (
        <NavLink key={link.key} href={link.href}>{t(link.key as any)}</NavLink>
      ))}
      {mainNavConfig.dropdowns.map((dropdown) => (
        <DropdownMenu 
            key={dropdown.titleKey} 
            open={openDropdown === dropdown.titleKey} 
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? dropdown.titleKey : null)}
        >
          <div onMouseEnter={() => handleMouseEnter(dropdown.titleKey)} onMouseLeave={handleMouseLeave} className="h-full flex items-center">
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-sm font-medium text-foreground outline-none transition-colors hover:text-primary data-[state=open]:text-primary"
            >
              {t(dropdown.titleKey as any)}
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent 
            align="start"
            onMouseEnter={() => handleMouseEnter(dropdown.titleKey)}
            onMouseLeave={handleMouseLeave}
          >
            {dropdown.items.map((item) => (
              <DropdownMenuItem key={item.key} asChild>
                <Link href={item.href}>
                  <Minus className="mr-2" />
                  {t(item.key as any)}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      {mainNavConfig.otherLinks.map((link) => (
        <NavLink key={link.key} href={link.href}>{t(link.key as any)}</NavLink>
      ))}
    </nav>
  );
};

const MobileNav = ({ closeSheet }: { closeSheet: () => void }) => {
    const { t } = useTranslation();

    const topNavLinks = [
      { key: 'alumni', href: '/alumni' },
      { key: 'qualityAssurance', href: '#' },
      { key: 'innovation', href: '#' },
      { key: 'international', href: '#' },
      { key: 'resources', href: '#' },
      { key: 'csrProjects', href: '/csr' },
      { key: 'library', href: '#' },
    ];

    return (
        <div className="flex flex-col h-full text-base">
          <div className="p-4 space-y-2 border-b">
            <h3 className="px-2 font-semibold text-muted-foreground text-sm">Main Menu</h3>
            {mainNavConfig.links.map((link) => (
                <Link key={link.key} href={link.href} onClick={closeSheet} className="block px-2 py-2 text-foreground transition-colors hover:text-primary rounded-md hover:bg-secondary">
                    {t(link.key as any)}
                </Link>
            ))}
            <Accordion type="multiple" className="w-full">
                {mainNavConfig.dropdowns.map((dropdown) => (
                    <AccordionItem value={t(dropdown.titleKey as any)} key={dropdown.titleKey} className="border-b-0">
                        <AccordionTrigger className="px-2 py-2 text-foreground no-underline hover:text-primary rounded-md hover:bg-secondary hover:no-underline">
                            {t(dropdown.titleKey as any)}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col pl-6">
                                {dropdown.items.map((item) => (
                                    <Link key={item.key} href={item.href} onClick={closeSheet} className="flex items-center gap-3 py-2.5 text-muted-foreground transition-colors hover:text-primary rounded-md hover:bg-secondary">
                                        <Minus className="h-4 w-4" />
                                        <span>{t(item.key as any)}</span>
                                    </Link>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            {mainNavConfig.otherLinks.map((link) => (
                 <Link key={link.key} href={link.href} onClick={closeSheet} className="block px-2 py-2 text-foreground transition-colors hover:text-primary rounded-md hover:bg-secondary">
                    {t(link.key as any)}
                </Link>
            ))}
          </div>
          <div className="p-4">
             <h3 className="px-2 font-semibold text-muted-foreground text-sm mb-3">Quick Links</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2 text-base">
                {topNavLinks.map((link) => (
                  <Link key={link.key} href={link.href} onClick={closeSheet} className="block py-1 text-foreground transition-colors hover:text-primary hover:underline">
                      {t(link.key as any)}
                  </Link>
                ))}
                 <a href="https://lms.pharmacollege.lk" target="_blank" rel="noopener noreferrer" onClick={closeSheet} className="block py-1 text-foreground transition-colors hover:text-primary hover:underline">{t('login')}</a>
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
    <header className="sticky top-0 z-50 w-full bg-background shadow-md print:hidden">
      <TopBar />
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
            alt="Ceylon Pharma College Logo"
            width={200}
            height={62}
            className="h-12 w-auto dark:hidden"
            priority
          />
          <Image
            src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
            alt="Ceylon Pharma College Logo"
            width={200}
            height={62}
            className="h-12 w-auto hidden dark:block dark:brightness-0 dark:invert"
            priority
          />
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="ml-auto hidden md:flex items-center gap-2">
            <DesktopNav />
          </div>
          
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
              </Button>
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <Button asChild variant="secondary" className="md:hidden text-xs h-9 px-3">
                <a href="https://lms.pharmacollege.lk" target="_blank" rel="noopener noreferrer">{t('studentLogin')}</a>
              </Button>
              <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
                      <SheetTitle className="sr-only">Main Menu</SheetTitle>
                      <div className="p-4 border-b flex justify-between items-center">
                          <Link href="/" onClick={closeSheet}>
                            <Image
                              src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                              alt="Ceylon Pharma College Logo"
                              width={160}
                              height={50}
                              className="h-10 w-auto dark:hidden"
                              priority
                            />
                            <Image
                              src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                              alt="Ceylon Pharma College Logo"
                              width={160}
                              height={50}
                              className="h-10 w-auto hidden dark:block dark:brightness-0 dark:invert"
                              priority
                            />
                          </Link>
                          <div className="flex items-center">
                              <LanguageSwitcher />
                              <ThemeToggle />
                          </div>
                      </div>
                      <div className="flex-grow overflow-y-auto">
                          <MobileNav closeSheet={closeSheet} />
                      </div>
                  </SheetContent>
                </Sheet>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
}
