const fs = require('fs');
const filePath = 'front-web/src/app/about/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldHeroRegex = /\{\/\* 1\. Hero Header Banner \*\/\}[\s\S]*?\{\/\* 2\. Key Statistical Milestones Strip \*\/\}/;

const newHero = `{/* 1. Full-Width Immersive Hero Header Banner */}
      <section className="relative py-20 md:py-28 overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center border-b border-white/10 text-white">
        
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
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/85 to-zinc-950/55 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-black/50 z-10" />
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply z-10" />

        <div className="container mx-auto px-4 md:px-6 relative z-20">
          <div className="max-w-3xl xl:max-w-4xl">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-200/80 mb-5 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">{t('home')}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-amber-300 font-semibold">{t('about')}</span>
            </div>

            {/* Illuminated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 mb-5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'si' ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම ඖෂධවේදී විද්‍යාලය' : language === 'ta' ? 'இலங்கையின் முன்னணி மருந்தியல் கல்லூரி' : 'Play • Learn • Grow | Sri Lanka’s Premier Pharmacy College'}</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className={\`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white tracking-tight drop-shadow-2xl \${
              isSinhala ? 'leading-[1.32] md:leading-[1.35]' : 'leading-tight'
            }\`}>
              {language === 'si' 
                ? 'ප්‍රායෝගික ඖෂධවේදී අධ්‍යාපනයේ විශිෂ්ටත්වයේ සලකුණ' 
                : language === 'ta'
                ? 'நடைமுறை மருந்தியல் கல்வியின் தனித்துவமான அடையாளம்'
                : 'Pioneering Practical Pharmaceutical Education Across Sri Lanka'}
            </h1>

            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 my-5 rounded-full shadow-lg" />

            {/* Compelling Story Paragraphs */}
            <div className="space-y-4 text-white/95 font-body text-base sm:text-lg leading-relaxed max-w-3xl drop-shadow-md">
              <p className={isSinhala ? 'leading-[1.8]' : 'leading-relaxed'}>
                {t('aboutPara1')}
              </p>
              <p className={\`text-sm sm:text-base text-white/85 \${isSinhala ? 'leading-[1.8]' : 'leading-relaxed'}\`}>
                {t('aboutPara2')}
              </p>
            </div>

            {/* Floating Glassmorphic Trust Badges Strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2.5 shadow-md">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/70 font-semibold uppercase">Accredited</p>
                  <p className="font-bold text-xs sm:text-sm text-white">ACTD USA/UK</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2.5 shadow-md">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/70 font-semibold uppercase">Certified</p>
                  <p className="font-bold text-xs sm:text-sm text-white">ISO 9001:2015</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2.5 shadow-md">
                <Users className="w-5 h-5 text-teal-300 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/70 font-semibold uppercase">Alumni</p>
                  <p className="font-bold text-xs sm:text-sm text-white">5,000+ Graduated</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2.5 shadow-md">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/70 font-semibold uppercase">Reviews</p>
                  <p className="font-bold text-xs sm:text-sm text-white">4.9 ★ (830+)</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 shadow-xl shadow-amber-950/40 rounded-xl px-8 py-6 hover:scale-105 transition-all">
                <Link href="/courses">
                  {language === 'si' ? 'අපගේ පිළිගත් පාඨමාලා ගවේෂණය' : 'Explore Accredited Courses'}
                </Link>
              </Button>
              <a
                href={\`https://wa.me/94715884884?text=\${encodeURIComponent(whatsappMessage)}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-emerald-600/30 text-white hover:text-emerald-300 font-semibold text-sm border border-white/20 transition-all backdrop-blur-md hover:scale-105 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{language === 'si' ? 'අධ්‍යයන උපදේශක හමුවන්න (WhatsApp)' : 'Consult Academic Advisor'}</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Key Statistical Milestones Strip */}`;

if (!oldHeroRegex.test(content)) {
  console.error('Old hero banner not found in about/page.tsx');
  process.exit(1);
}

content = content.replace(oldHeroRegex, newHero);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated About Page Hero with full-cover background image!');
