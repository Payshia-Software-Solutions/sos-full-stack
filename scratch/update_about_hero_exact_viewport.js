const fs = require('fs');
const filePath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/app/about/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

const startIndex = content.indexOf('{/* 1. Full-Width Immersive Hero Header Banner */}');
const endIndex = content.indexOf('{/* 3. The 4 Educational Pillars (The CPC Advantage) */}');

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers: startIndex=' + startIndex + ', endIndex=' + endIndex);
  process.exit(1);
}

const replacement = `{/* 1. Full-Width Immersive Hero Header Banner (Strict Viewport Matching) */}
      <section className="relative overflow-hidden w-full min-h-[520px] lg:h-[calc(100dvh-104px)] lg:max-h-[calc(100dvh-104px)] flex items-center border-b border-white/10 text-white py-8 lg:py-0">
        
        {/* Full-Cover Convocation Background Image */}
        <Image
          src="https://content-provider.pharmacollege.lk/website/about-image-optimized.webp"
          alt="Ceylon Pharma College Convocation & Academic Excellence"
          fill
          priority
          quality={95}
          className="object-cover object-center z-0 scale-105 animate-in fade-in duration-1000"
        />

        {/* Cinematic Multi-Layer Dark Gradient Overlay for Supreme Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/85 to-zinc-950/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-black/40 z-10" />
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply z-10" />

        <div className="container mx-auto px-4 md:px-6 relative z-20 w-full py-4 lg:py-6">
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Breadcrumb Navigation & Illuminated Badge in one compact row */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-200/80">
                <Link href="/" className="hover:text-white transition-colors">{t('home')}</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-amber-300 font-semibold">{t('about')}</span>
              </div>
              <span className="text-white/30 hidden sm:inline">•</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'si' ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම ඖෂධවේදී විද්‍යාලය' : language === 'ta' ? 'இலங்கையின் முன்னணி மருந்தியல் கல்லூரி' : 'Sri Lanka’s Premier Pharmacy College'}</span>
              </div>
            </div>

            {/* Hero Main Headline (compact line-height to prevent tall wrap) */}
            <h1 className={\`text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] font-headline font-bold text-white tracking-tight drop-shadow-2xl \${
              isSinhala ? 'leading-[1.25] md:leading-[1.28]' : 'leading-tight'
            }\`}>
              {language === 'si' 
                ? 'ප්‍රායෝගික ඖෂධවේදී අධ්‍යාපනයේ විශිෂ්ටත්වයේ සලකුණ' 
                : language === 'ta'
                ? 'நடைமுறை மருந்தியல் கல்வியின் தனித்துவமான அடையாளம்'
                : 'Pioneering Practical Pharmaceutical Education Across Sri Lanka'}
            </h1>

            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 my-3 rounded-full shadow-lg" />

            {/* Core Mission Summary */}
            <p className={\`text-white/90 font-body text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl drop-shadow-md \${
              isSinhala ? 'leading-[1.7]' : 'leading-relaxed'
            }\`}>
              {t('aboutPara1')}
            </p>

            {/* Floating Glassmorphic Trust Badges Strip (Compact & Clean) */}
            <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-w-2xl">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-white/70 font-semibold uppercase leading-none">Accredited</p>
                  <p className="font-bold text-xs text-white truncate mt-0.5">ACTD USA/UK</p>
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-sm">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-white/70 font-semibold uppercase leading-none">Certified</p>
                  <p className="font-bold text-xs text-white truncate mt-0.5">ISO 9001:2015</p>
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-sm">
                <Users className="w-4 h-4 text-teal-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-white/70 font-semibold uppercase leading-none">Alumni</p>
                  <p className="font-bold text-xs text-white truncate mt-0.5">5,000+ Certified</p>
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-white/70 font-semibold uppercase leading-none">Rating</p>
                  <p className="font-bold text-xs text-white truncate mt-0.5">4.9 ★ (830+)</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
              <Button asChild className="font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 shadow-lg shadow-amber-950/30 rounded-xl px-6 h-11 hover:scale-105 transition-all">
                <Link href="/courses">
                  {language === 'si' ? 'අපගේ පිළිගත් පාඨමාලා ගවේෂණය' : 'Explore Accredited Courses'}
                </Link>
              </Button>
              <a
                href={\`https://wa.me/94715884884?text=\${encodeURIComponent(whatsappMessage)}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-white/10 hover:bg-emerald-600/30 text-white hover:text-emerald-300 font-semibold text-xs sm:text-sm border border-white/20 transition-all backdrop-blur-md hover:scale-105 shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{language === 'si' ? 'අධ්‍යයන උපදේශක හමුවන්න (WhatsApp)' : 'Consult Academic Advisor'}</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Key Statistical Milestones Strip & Practical Philosophy */}
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

          {/* Practical Educational Excellence Spotlight */}
          <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-primary/5 via-card to-primary/5 border border-primary/20 shadow-sm max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-headline font-bold text-base sm:text-lg text-foreground">
                  {language === 'si' ? 'අපගේ සුවිශේෂී ප්‍රායෝගික ඉගැන්වීම් දර්ශනය' : 'Our Practical Learning Philosophy'}
                </h3>
                <p className={\`text-xs sm:text-sm text-muted-foreground leading-relaxed \${isSinhala ? 'leading-[1.8]' : 'leading-relaxed'}\`}>
                  {t('aboutPara2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated About Hero to match viewport height!');
