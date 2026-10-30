"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import CertificateVerifier from '@/components/certificate-verifier';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShieldCheck, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  ChevronRight,
  Globe2,
  Lock
} from 'lucide-react';

export default function CertificatesClient() {
  const { language } = useTranslation();
  const isSinhala = language === 'si';
  const isTamil = language === 'ta';

  return (
    <div className="min-h-screen bg-background">
      
      {/* 1. Hero Header Banner */}
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              {isSinhala ? 'මුල් පිටුව' : isTamil ? 'முகப்பு' : 'Home'}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">
              {isSinhala ? 'සහතිකපත් සත්‍යාපනය' : isTamil ? 'சான்றிதழ் சரிபார்ப்பு' : 'Certificate Verification'}
            </span>
          </div>

          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 bg-primary/5 gap-1.5 inline-flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>
                {isSinhala ? 'නිල සත්‍යාපන ද්වාරය • ISO 9001:2015 & ACTD Accredited' : 'Official Verification Portal • ISO 9001:2015 & ACTD Accredited'}
              </span>
            </Badge>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
              isSinhala ? 'leading-[1.32]' : 'leading-tight'
            }`}>
              {isSinhala 
                ? 'මාර්ගගත සහතිකපත් සත්‍යාපන පද්ධතිය' 
                : isTamil 
                ? 'ஆன்லைன் சான்றிதழ் சரிபார்ப்பு முறைமை' 
                : 'Online Certificate & Credential Verification'}
            </h1>

            <div className="w-20 h-1 bg-primary mt-3 mb-4 rounded-full" />

            <p className={`text-muted-foreground font-body text-sm sm:text-base md:text-lg max-w-2xl ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {isSinhala 
                ? 'සිලෝන් ෆාමා විද්‍යාලය මඟින් නිකුත් කරන ලද ඖෂධවේදී සහතිකපත් වල සත්‍යතාව සහ ශිෂ්‍ය තොරතුරු සෘජුවම අපගේ නිල දත්ත ගබඩාව හරහා මෙතැනින් ක්ෂණිකව තහවුරු කරගන්න.' 
                : isTamil
                ? 'சிலோன் பார்மா கல்லூரியினால் வழங்கப்பட்ட மருந்தியல் சான்றிதழ்களின் நம்பகத்தன்மையை எங்கள் உத்தியோகபூர்வ தரவுத்தளத்தின் மூலம் ஆன்லைனில் உடனடியாக சரிபார்க்கவும்.'
                : 'Instantly verify the authenticity of credentials and pharmaceutical qualifications issued to Ceylon Pharma College graduates through our secure accreditation database.'}
            </p>
          </div>

          {/* 4 Trust Highlights Strip */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-foreground">
                  {isSinhala ? 'ක්ෂණික සෙවුම' : 'Instant Search'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSinhala ? 'ශිෂ්‍ය අංකයෙන් හෝ නමෙන්' : 'By Student ID or Name'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-foreground">
                  {isSinhala ? 'ජාත්‍යන්තර පිළිගැනීම' : 'Global Recognition'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSinhala ? 'ACTD UK & ISO 9001:2015' : 'ACTD UK & ISO 9001:2015'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-foreground">
                  {isSinhala ? 'රෝහල් & ෆාමසි පිළිගැනීම' : 'Hospital Trusted'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSinhala ? 'දිවයින පුරා සෞඛ්‍ය ජාල' : 'Island-wide healthcare'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-foreground">
                  {isSinhala ? 'ව්‍යාජ සහතිකවලින් තොරයි' : 'Tamper-Proof'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSinhala ? 'QR කේත ආරක්ෂාව' : 'Encrypted QR validation'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. The Interactive Verification Search Console */}
      <section className="py-6">
        <CertificateVerifier />
      </section>

      {/* 3. Guide for Employers & Healthcare Institutions */}
      <section className="py-12 md:py-16 bg-muted/30 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          
          <div className="max-w-3xl mb-10">
            <Badge variant="outline" className="mb-2 px-3 py-0.5 text-xs font-semibold text-primary border-primary/30">
              {isSinhala ? 'සේවායෝජක මාර්ගෝපදේශය' : 'Institutional Guide'}
            </Badge>
            <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight ${
              isSinhala ? 'leading-[1.32]' : 'leading-tight'
            }`}>
              {isSinhala 
                ? 'රෝහල් සහ ඖෂධහල් ජාල සඳහා සහතික සත්‍යාපන උපදෙස්' 
                : 'How Hospitals & Healthcare Employers Verify Certificates'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isSinhala 
                ? 'අපගේ උපාධිධාරීන් බඳවා ගැනීමේදී ඔවුන්ගේ සුදුසුකම් සත්‍යාපනය කර ගැනීමට මෙම පියවර අනුගමනය කරන්න.' 
                : 'Follow these 3 straightforward steps to confirm the qualifications of candidate pharmacy graduates.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border border-border/80 bg-background shadow-sm">
              <CardContent className="p-6">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mb-4">
                  01
                </span>
                <h3 className="font-headline font-bold text-base text-foreground mb-2">
                  {isSinhala ? 'ශිෂ්‍ය විස්තර ඇතුළත් කරන්න' : 'Search by ID or Name'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSinhala 
                    ? 'අපේක්ෂකයාගේ මුද්‍රිත සහතිකයේ සඳහන් ශිෂ්‍ය හැඳුනුම්පත් අංකය (Student ID) හෝ සම්පූර්ණ නම ඉහත සෙවුම් කොටුවට ඇතුළත් කරන්න.' 
                    : 'Enter the candidate\'s unique Registration / Student ID or official full name into the search tool above.'}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/80 bg-background shadow-sm">
              <CardContent className="p-6">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mb-4">
                  02
                </span>
                <h3 className="font-headline font-bold text-base text-foreground mb-2">
                  {isSinhala ? 'සුදුසුකම සහ ශ්‍රේණිය පරීක්ෂා කරන්න' : 'Review Results & Grades'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSinhala 
                    ? 'පාඨමාලා කේතය (Course Code), කණ්ඩායම, සහතික ප්‍රදාන දිනය සහ සමස්ත ශ්‍රේණිගත කිරීම (Rating) තහවුරු කරගන්න.' 
                    : 'Cross-check the course code (e.g. CCPP), batch intake, completion status, and overall academic grade.'}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/80 bg-background shadow-sm">
              <CardContent className="p-6">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mb-4">
                  03
                </span>
                <h3 className="font-headline font-bold text-base text-foreground mb-2">
                  {isSinhala ? 'නිල අධ්‍යයන පිටපතක් ලබාගන්න' : 'Request Sealed Transcript'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSinhala 
                    ? 'විදේශීය රැකියා (WES/UK ENIC) හෝ රෝහල් බඳවා ගැනීම් සඳහා මුද්‍රා තැබූ නිල විභාග පිටපතක් අවශ්‍ය නම් අපගේ විභාග අංශය අමතන්න.' 
                    : 'For overseas migration or clinical appointments requiring sealed academic transcripts, contact our Examinations Division.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Need Attestation or Verification Assistance */}
          <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-headline font-bold text-base text-foreground">
                {isSinhala ? 'නිල ලිපිගොනු හෝ සහතික සත්‍යාපන සහාය අවශ්‍යද?' : 'Need Official Verification Assistance or Transcripts?'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {isSinhala 
                  ? 'අපගේ විභාග සහ ලේඛකාධිකාරී අංශය පැය 24ක් තුළ නිල සත්‍යාපන වාර්තා සපයයි.' 
                  : 'Our Examination & Registry department provides official credential validation within 24 business hours.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button asChild size="sm" className="font-semibold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <a href="tel:0715884884">
                  <Phone className="w-3.5 h-3.5" />
                  <span>0715 884 884</span>
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="font-semibold text-xs gap-1.5">
                <a href="mailto:info@pharmacollege.lk">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>info@pharmacollege.lk</span>
                </a>
              </Button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
