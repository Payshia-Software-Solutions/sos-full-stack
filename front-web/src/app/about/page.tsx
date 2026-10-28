"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import Accreditations from '@/components/accreditations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Target, 
  Users, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  HeartHandshake,
  Laptop,
  PackageCheck,
  Check,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  Building2,
  Stethoscope,
  Compass,
  FileCheck2,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const lecturePanel = [
  { 
    name: "Mr. Dilip Fonseka", 
    role: "Course Director & Senior Pharmacist", 
    qualification: "B.Pharm (Hons), Registered Pharmacist",
    field: "Pharmacy Practice, Prescription Analysis & Dispensing Regulations", 
    tag: "Course Director",
    experience: "15+ Years Clinical Experience"
  },
  { 
    name: "Dr. Vajira Senevirathna", 
    role: "Medical Consultant & Senior Lecturer", 
    qualification: "MBBS, MD Clinical Pharmacology",
    field: "Clinical Pharmacology, Therapeutics & Drug Interactions", 
    tag: "Medical Consultant",
    experience: "Senior Healthcare Specialist"
  },
  { 
    name: "Prof. Vishan Rudrigoo", 
    role: "Visiting Professor", 
    qualification: "Ph.D., M.Sc. Pharmaceutical Sciences",
    field: "Pharmaceutical Quality Systems & Formulation Science", 
    tag: "Visiting Professor",
    experience: "International Academic Consultant"
  },
  { 
    name: "Ms. Dilshani Gunasekara", 
    role: "Senior Lecturer", 
    qualification: "B.Pharm, Senior Community Pharmacist",
    field: "Community Pharmacy Management & Patient Counselling", 
    tag: "Senior Lecturer",
    experience: "Retail Pharmacy Leader"
  },
  { 
    name: "Ms. Nilanka Senevirathna", 
    role: "Lecturer in Pharmacy Calculations", 
    qualification: "B.Sc. Pharmaceutical Chemistry",
    field: "Medical Terminology, Dosage Calculations & Posology", 
    tag: "Lecturer",
    experience: "Academic Mentor"
  },
  { 
    name: "Ms. Hansi Senevirathna", 
    role: "Lecturer in Ethics & Safety", 
    qualification: "B.Sc. Nursing & Healthcare Ethics",
    field: "Patient Safety Protocols & Healthcare Professional Ethics", 
    tag: "Lecturer",
    experience: "Clinical Safety Officer"
  },
  { 
    name: "Mr. Thilina Doloswala", 
    role: "Lead Educational Systems Specialist", 
    qualification: "B.Sc. IT, EdTech & LMS Architecture",
    field: "Interactive Educational Tech, Simulation Games & Digital Learning", 
    tag: "EdTech Lead",
    experience: "LMS Systems Architect"
  },
];

const milestones = [
  {
    year: "2018",
    title: "The Inception of Ceylon Pharma College",
    desc: "Established with a bold mission to address the critical gap between theoretical knowledge and real-world pharmacy counter practice in Sri Lanka.",
    badge: "Foundation"
  },
  {
    year: "2020",
    title: "Pioneering Island-Wide Distance Learning",
    desc: "Transitioned to a high-engagement digital hybrid model during global disruptions, coupling live Zoom interactive lectures with home-delivered printed study packs.",
    badge: "Innovation"
  },
  {
    year: "2022",
    title: "Gamified Pharmacy Simulations Launched",
    desc: "Introduced interactive proprietary educational software and simulation games, making prescription decoding, drug classification, and OTC dispensing fun and memorable.",
    badge: "Play • Learn • Grow"
  },
  {
    year: "2023",
    title: "International ACTD & ISO 9001:2015 Accreditation",
    desc: "Earned international accreditation from the American Council of Training and Development (ACTD) and ISO 9001:2015 Quality Management certification audited under IAF.",
    badge: "Global Standard"
  },
  {
    year: "2025 - 2026",
    title: "5,000+ Alumni Across Sri Lanka & Overseas",
    desc: "Surpassed 5,000+ certified graduates actively practicing in leading private hospitals, retail community pharmacies (Hemas, Nawaloka, Asiri, MediCare, Healthguard), and overseas healthcare facilities.",
    badge: "Excellence"
  }
];

const pillars = [
  {
    icon: Laptop,
    title: "Gamified Simulation Learning",
    subtitle: "Play to Learn",
    desc: "Interactive educational software where students verify authentic prescriptions, catch drug interactions, and master OTC dispensing in a safe, engaging environment."
  },
  {
    icon: Stethoscope,
    title: "Clinician & Pharmacist Mentorship",
    subtitle: "Real Industry Guidance",
    desc: "Lectures delivered directly by practicing registered pharmacists and medical doctors with daily hands-on hospital and community pharmacy leadership."
  },
  {
    icon: PackageCheck,
    title: "Printed Study Packs Delivered to Your Door",
    subtitle: "Island-wide Reach",
    desc: "Comprehensive official bound textbooks, prescription interpretation workbooks, and flashcards shipped safely across all 25 districts of Sri Lanka."
  },
  {
    icon: ShieldCheck,
    title: "Internationally Recognized Credentials",
    subtitle: "Verifiable Online 24/7",
    desc: "Tamper-proof digital certificates accredited by ACTD (USA) with an ISO 9001:2015 certified Quality Management System, verifiable globally by employers."
  }
];

const coreValues = [
  {
    title: "Patient Safety Above All",
    desc: "Instilling zero-tolerance for dispensing errors and emphasizing prescription verification, dosage accuracy, and allergy screening."
  },
  {
    title: "Practical Clinical Competence",
    desc: "Bridging textbook theory with daily counter operations, drug brand familiarity, and patient communication skills."
  },
  {
    title: "Accessible Quality Education",
    desc: "Making world-class pharmacy education affordable and accessible to aspiring youth across every province and rural community."
  },
  {
    title: "Uncompromising Integrity & Ethics",
    desc: "Adhering strictly to national pharmacy regulations, patient confidentiality, and professional code of conduct."
  }
];

export default function AboutPage() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const whatsappMessage = language === 'si'
    ? 'ආයුබෝවන් Ceylon Pharma College, මට විද්‍යාලයේ පාඨමාලා සහ ලියාපදිංචිය පිළිබඳ වැඩිදුර විස්තර දැනගැනීමට අවශ්‍යයි.'
    : 'Hi Ceylon Pharma College, I would like to learn more about your college programs and accreditation.';

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Header Banner */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{t('about')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <Badge variant="outline" className="mb-3 px-3.5 py-1 font-semibold text-primary border-primary/30 gap-1.5 inline-flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'si' ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම ඖෂධවේදී විද්‍යාලය' : 'Play • Learn • Grow | Sri Lanka’s Premier Pharmacy College'}</span>
              </Badge>
              
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
                isSinhala ? 'leading-[1.35]' : 'leading-tight'
              }`}>
                {language === 'si' 
                  ? 'ප්‍රායෝගික ඖෂධවේදී අධ්‍යාපනයේ විශිෂ්ටත්වයේ සලකුණ' 
                  : 'Pioneering Practical Pharmaceutical Education Across Sri Lanka'}
              </h1>
              
              <div className="w-20 h-1 bg-primary mt-3 mb-6 rounded-full" />
              
              <p className={`text-muted-foreground font-body text-base md:text-lg ${
                isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
              }`}>
                {t('aboutPara1')}
              </p>
              
              <p className={`mt-4 text-muted-foreground font-body text-sm md:text-base ${
                isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
              }`}>
                {t('aboutPara2')}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl rounded-xl px-7 py-6">
                  <Link href="/courses">
                    Explore Our Accredited Courses
                  </Link>
                </Button>
                <a
                  href={`https://wa.me/94715884884?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-semibold text-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consult Academic Advisor</span>
                </a>
              </div>
            </div>

            {/* Right Image Card with Glassmorphic Floating Badges */}
            <div className="lg:col-span-5">
              <div className="relative h-80 sm:h-96 lg:h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-border/80 group">
                <Image
                  src="https://content-provider.pharmacollege.lk/website/about-image-optimized.webp"
                  alt="Ceylon Pharma College Modern Educational Facility"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-amber-500 text-zinc-950 font-bold text-xs border-none shadow-md">
                    ISO 9001:2015 Certified
                  </Badge>
                </div>

                {/* Bottom Floating Trust Bar */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">ACTD USA Accredited</p>
                      <p className="text-[11px] text-white/80 mt-0.5">Global Quality Standards in Training</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-400 font-mono">EST. 2018</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Statistical Milestones Strip */}
      <section className="py-10 bg-card border-b border-border/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-headline font-bold text-primary">5,000+</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Certified Alumni</p>
            </div>
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-headline font-bold text-primary">ACTD</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Accreditation (USA)</p>
            </div>
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-headline font-bold text-primary">ISO 9001</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Certified Quality System</p>
            </div>
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-headline font-bold text-amber-500">4.9 ★</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">830+ Google Reviews</p>
            </div>
            <div className="col-span-2 md:col-span-1 p-3">
              <p className="text-3xl md:text-4xl font-headline font-bold text-teal-600 dark:text-teal-400">25</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Districts Island-Wide</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Educational Pillars (The CPC Advantage) */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              The CPC Advantage
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {language === 'si' 
                ? 'අපගේ සුවිශේෂී අධ්‍යාපනික ක්‍රමවේදය' 
                : 'The 4 Pillars of Our Educational Excellence'}
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-4 rounded-full" />
            <p className={`text-muted-foreground font-body text-sm md:text-base ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              We transform difficult pharmacology concepts into engaging, hands-on, and clinically relevant practical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pillars.map((pillar, index) => (
              <Card key={index} className="rounded-2xl border border-border/80 bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <pillar.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
                    {pillar.subtitle}
                  </span>
                  <h3 className="font-headline font-bold text-base text-foreground mb-2 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body flex-grow">
                    {pillar.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Vision, Mission & Core Values */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Guiding Principles
            </Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
              Vision, Mission & Core Values
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-14">
            {/* Vision */}
            <Card className="rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="font-headline text-2xl text-foreground">{t('visionTitle')}</CardTitle>
                  <span className="text-xs text-primary font-medium">Guiding Our Future Direction</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-muted-foreground font-body ${
                  isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
                }`}>
                  {t('visionText')}
                </p>
              </CardContent>
            </Card>

            {/* Mission */}
            <Card className="rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="font-headline text-2xl text-foreground">{t('missionTitle')}</CardTitle>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Our Everyday Commitment</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-muted-foreground font-body ${
                  isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
                }`}>
                  {t('missionText')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 4 Core Values Grid */}
          <div className="max-w-5xl mx-auto">
            <h3 className="text-lg font-headline font-bold text-center text-foreground mb-6">
              Our 4 Non-Negotiable Institutional Values
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreValues.map((val, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-border/60 bg-card text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center mb-3 text-sm">
                    0{idx + 1}
                  </div>
                  <h4 className="font-headline font-bold text-sm text-foreground mb-1.5">{val.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Milestones & Growth Timeline */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Our Track Record
            </Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
              Our Journey of Excellence
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-4 rounded-full" />
            <p className="text-muted-foreground font-body text-sm md:text-base">
              From an ambitious local academy to Sri Lanka’s foremost ACTD-accredited pharmacy education network.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {milestones.map((m, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/50 shadow-sm transition-all duration-300 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6"
              >
                <div className="flex sm:flex-col items-center sm:items-start justify-between shrink-0 sm:w-28">
                  <span className="font-headline font-bold text-2xl text-primary font-mono">{m.year}</span>
                  <Badge variant="secondary" className="text-[10px] font-semibold mt-1">
                    {m.badge}
                  </Badge>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-6 flex-1">
                  <h3 className="font-headline font-bold text-base sm:text-lg text-foreground mb-1">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lecturer Panel */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Experienced Faculty
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {t('lecturePanelTitle')}
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-4 rounded-full" />
            <p className={`text-muted-foreground font-body text-sm md:text-base ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {t('lecturePanelSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {lecturePanel.map((lecturer) => (
              <Card key={lecturer.name} className="rounded-2xl border border-border/80 bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col">
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 shadow-sm">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge variant="secondary" className="text-[10px] font-semibold text-primary bg-primary/10 mb-1">
                        {lecturer.tag}
                      </Badge>
                      <h3 className="font-headline font-bold text-base text-foreground truncate">
                        {lecturer.name}
                      </h3>
                      <p className="text-xs text-primary font-semibold line-clamp-1">
                        {lecturer.role}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground flex-grow">
                    <p className="font-medium text-foreground/90">{lecturer.qualification}</p>
                    <p className="leading-relaxed font-body">{lecturer.field}</p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-border/40 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ {lecturer.experience}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Accreditation & Global Standards Deep Dive */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              International Recognition
            </Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
              Why Our Accreditation Matters To You
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-4 rounded-full" />
            <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed">
              Employers trust Ceylon Pharma College certificates because they meet verified global educational and quality management standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <Card className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  ACTD
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-foreground">ACTD USA Accreditation</h3>
                  <p className="text-xs text-muted-foreground">American Council of Training and Development</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body mt-2">
                ACTD accreditation guarantees that our pharmacy curricula, assessment criteria, and teaching methodologies comply with rigorous international standards for continuing healthcare professional education.
              </p>
              <div className="mt-4 pt-3 border-t border-border/60">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Internationally Recognized Certification
                </span>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  ISO
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-foreground">ISO 9001:2015 QMS Certified</h3>
                  <p className="text-xs text-muted-foreground">Audited Quality Management System (IAF)</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body mt-2">
                Certified by an IAF-recognized international body, validating our administrative operations, examination integrity, student dispatch reliability, and continuous academic improvement.
              </p>
              <div className="mt-4 pt-3 border-t border-border/60">
                <a 
                  href="https://www.iafcertsearch.org/certification/pDsZb8ThfWbogEl0TKDgKAg7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <span>Verify on IAF CertSearch Directory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          </div>

          <Accreditations />
        </div>
      </section>

      {/* 8. Campuses & Administrative Centers */}
      <section className="py-16 md:py-20 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Physical Infrastructure
            </Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
              Our Campuses & Logistics Centers
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl border border-border/80 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-foreground">Main Campus & Operations Hub</h3>
                  <Badge variant="secondary" className="text-[10px]">Pelmadulla</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-body mb-3">
                Houses our central study pack dispatch facility, server infrastructure, student examination records, and regional counseling desk.
              </p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Pelmadulla" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Google Maps
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-foreground">Colombo Corporate Liaison</h3>
                  <Badge variant="secondary" className="text-[10px]">Colombo 03</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-body mb-3">
                Corporate partnership office coordinating healthcare internships, hospital placements, convocation ceremonies, and executive meetings.
              </p>
              <a 
                href="https://share.google/Ro5raji5UUp5oK4nc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" /> View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Bottom Conversion CTA Banner */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-950 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10 max-w-3xl">
          <Badge className="bg-amber-500 text-zinc-950 font-bold border-none text-xs px-3 py-1 mb-4">
            Enroll for Next Intake
          </Badge>
          <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
            Ready to Begin Your Pharmacy Journey?
          </h2>
          <div className="w-20 h-1 bg-amber-400 mx-auto my-4 rounded-full" />
          <p className="text-white/90 font-body text-base md:text-lg mb-8 leading-relaxed">
            Join thousands of successful graduates who transformed their healthcare careers through Ceylon Pharma College.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="font-bold text-sm bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-xl rounded-xl px-8 py-6">
              <Link href="/courses">
                Explore Available Courses
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-semibold text-sm rounded-xl px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md">
              <Link href="/apply">
                Apply for Next Intake
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
