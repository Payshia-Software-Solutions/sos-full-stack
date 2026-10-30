"use client";

import Link from 'next/link';
import InquiryForm from '@/components/inquiry-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useTranslation } from '@/context/language-context';

const contactInfo = {
  phone: ['0715 884 884', '011 74 94 335'],
  email: ['info@pharmacollege.lk'],
};

const locations = [
  {
    name: 'contactHeadOffice',
    address: 'contactHeadOfficeAddress',
    mapLink: 'https://share.google/Ro5raji5UUp5oK4nc',
    tag: 'Main Campus / Admin',
    desc: 'Student counseling, admissions, convocation inquiries'
  },
  {
    name: 'contactOperationsBranch',
    address: 'contactOperationsBranchAddress',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Pelmadulla',
    tag: 'Operations & Dispatch',
    desc: 'LMS support, study pack dispatch, regional exams'
  },
];

const ContactDetails = () => {
  const { t } = useTranslation();
  return (
    <Card className="h-full rounded-2xl border border-border/80 shadow-md bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-2xl text-foreground">{t('contactInfoTitle')}</CardTitle>
        <p className="text-xs text-muted-foreground font-body">Official communications & administrative centers</p>
      </CardHeader>
      <CardContent className="space-y-6 font-body">
        {/* Hotlines */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
            <Phone className="w-4 h-4" /> 
            <span>Hotlines & Admissions</span>
          </h3>
          <div className="space-y-1.5 pl-6 text-sm text-foreground">
            {contactInfo.phone.map((phone) => (
              <p key={phone}>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary font-medium font-mono">
                  {phone}
                </a>
              </p>
            ))}
            {contactInfo.email.map((email) => (
              <p key={email}>
                <a href={`mailto:${email}`} className="hover:text-primary text-xs text-muted-foreground">
                  {email}
                </a>
              </p>
            ))}
          </div>
          <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Mon - Sun: 8:30 AM - 6:30 PM</span>
          </div>
        </div>

        {/* Locations */}
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 text-primary">
            <MapPin className="w-4 h-4" /> 
            <span>{t('contactInfoOurLocations')}</span>
          </h3>
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.name} className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-foreground">{t(location.name as any)}</h4>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                    {location.tag}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1 leading-relaxed">{t(location.address as any)}</p>
                <p className="text-[11px] text-muted-foreground/80 mb-2">{location.desc}</p>
                <a
                  href={location.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                >
                  <span>{t('contactInfoViewMap')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Payment Link */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <p className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Looking to upload a payment slip?</span>
          </p>
          <p className="text-muted-foreground mt-1">
            Submit your deposit slip directly via our secure student portal.
          </p>
          <Link href="/payment" className="inline-block mt-2 font-bold text-primary hover:underline">
            Go to Payment Portal →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ContactClient() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const whatsappMessage = language === 'si'
    ? 'ආයුබෝවන් Ceylon Pharma College, මට පාඨමාලා පිළිබඳ විස්තර දැනගැනීමට අවශ්‍යයි.'
    : 'Hi Ceylon Pharma College, I would like to get more information about your pharmacy courses.';

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Header Banner */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{t('contact')}</span>
          </div>

          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 gap-1.5 inline-flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'si' ? 'ශිෂ්‍ය සහාය සහ විමසීම්' : 'Student Support & Inquiries'}</span>
            </Badge>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {t('contactTitle')}
            </h1>

            <div className="w-20 h-1 bg-primary mt-3 mb-4 rounded-full" />

            <p className={`text-muted-foreground font-body text-base md:text-lg max-w-2xl ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {t('contactSubtitle')}
            </p>
          </div>

          {/* 3 Quick Contact Cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
            {/* Phone Hotline Card */}
            <a 
              href="tel:0715884884"
              className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/60 hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Direct Admissions</p>
              <p className="font-bold font-mono text-base text-foreground mt-0.5">0715 884 884</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Call Us Directly</p>
            </a>

            {/* WhatsApp Card */}
            <a 
              href={`https://wa.me/94715884884?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">WhatsApp Support</p>
              <p className="font-bold text-base text-foreground mt-0.5">Chat Online</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Instant Response</p>
            </a>

            {/* Email Card */}
            <a 
              href="mailto:info@pharmacollege.lk"
              className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/60 hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Email Inquiries</p>
              <p className="font-bold text-sm text-foreground mt-0.5 truncate">info@pharmacollege.lk</p>
              <p className="text-[11px] text-muted-foreground mt-1">Official Support</p>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Main Form & Location Split */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <InquiryForm />
            </div>
            <div className="lg:col-span-2">
              <ContactDetails />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
