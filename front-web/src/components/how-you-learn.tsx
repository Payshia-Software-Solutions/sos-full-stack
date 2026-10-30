"use client";

import { Gamepad2, PackageCheck, Video, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/context/language-context";

export default function HowYouLearn() {
  const { language } = useTranslation();
  const isSinhala = language === 'si';

  const content = {
    si: {
      badge: "අපගේ ඉගෙනුම් ක්‍රමවේදය",
      titlePrefix: "ඔබ ඉගෙන ගන්නා ආකාරය — ",
      titleHighlight: "Play • Learn • Grow",
      subtitle: "ප්‍රායෝගික ඖෂධවේදී පුහුණුව, අධ්‍යාපනික පරිගණක ක්‍රීඩා සහ ක්ෂේත්‍රයේ ප්‍රවීණයන්ගේ මඟපෙන්වීම මුසු කළ නවීන ඉගෙනුම් අත්දැකීමක්.",
      bannerTitle: "සැබවින්ම ප්‍රායෝගික ඖෂධවේදී අධ්‍යාපනයක් අත්විඳින්න",
      bannerDesc: "අපගේ නවීන පුහුණු ක්‍රමවේදය හරහා සෞඛ්‍ය ක්ෂේත්‍රයේ සාර්ථක රැකියාවන්හි නියුතු 2,500+ කට අධික ආදි ශිෂ්‍ය පිරිස හා අදම එක්වන්න.",
      bannerBtn: "පාඨමාලා බලන්න",
      pillars: [
        {
          step: "01",
          icon: Gamepad2,
          title: "Play: අධ්‍යාපනික පරිගණක ක්‍රීඩා",
          description: "WinPharma, MediMind සහ Pharma Hunter හරහා ඖෂධ වර්ග, මාත්‍රාවන් සහ ඖෂධ නිකුත් කිරීම පරිගණක ක්‍රීඩා මඟින් විනෝදයෙන් ප්‍රගුණ කරන්න.",
          highlight: "අන්තර්ක්‍රියාකාරී පරිගණක පුහුණුව",
        },
        {
          step: "02",
          icon: PackageCheck,
          title: "Learn: නිවසටම ලැබෙන පොත් කට්ටලය",
          description: "නිල මුද්‍රිත පාඨමාලා අත්පොත්, බෙහෙත් වට්ටෝරු අභ්‍යාස පොත් සහ ඖෂධ නාමාවලි ලියාපදිංචි කුරියර් මඟින් ඔබගේ නිවසටම ලබා ගන්න.",
          highlight: "දිවයින පුරා බෙදාහැරීම",
        },
        {
          step: "03",
          icon: Video,
          title: "Interact: සජීවී Zoom + 24/7 LMS",
          description: "පළපුරුදු ඖෂධවේදීන් මෙහෙයවන සති අන්ත සජීවී දේශන. දේශනයක් මඟහැරුණද ඕනෑම වේලාවක Full HD වීඩියෝ නැරඹීමේ පහසුකම.",
          highlight: "නම්‍යශීලී මාර්ගගත කාලසටහන",
        },
        {
          step: "04",
          icon: Award,
          title: "Grow: පිළිගත් සහතිකය සහ රැකියා",
          description: "ACTD UK සහ ISO 9001:2015 ජාත්‍යන්තර ප්‍රතීතනය ලත් සහතිකය. වාර්ෂික උපාධි ප්‍රදානෝත්සවය (Convocation).",
          highlight: "රැකියා සඳහා පිළිගත් සහතිකය",
        },
      ],
    },
    ta: {
      badge: "எங்கள் கற்றல் முறை",
      titlePrefix: "நீங்கள் எவ்வாறு கற்றுக்கொள்கிறீர்கள் — ",
      titleHighlight: "Play • Learn • Grow",
      subtitle: "மருந்தக நடைமுறை பயிற்சிகள், கேமிங் தொழில்நுட்பம் மற்றும் தொழில்முறை வழிகாட்டுதலுடன் கூடிய நவீன கல்வி அனுபவம்.",
      bannerTitle: "உண்மையான நடைமுறை மருந்தியல் கல்வியை அனுபவியுங்கள்",
      bannerDesc: "எங்கள் நவீன பயிற்சி முறை மூலம் சுகாதாரத் துறையில் வெற்றிகரமான தொழிலைத் தொடங்கிய 2,500+ பட்டதாரிகளுடன் இணையுங்கள்.",
      bannerBtn: "பாடநெறிகளைப் பார்க்கவும்",
      pillars: [
        {
          step: "01",
          icon: Gamepad2,
          title: "Play: கல்வி உருவகப்படுத்துதல் விளையாட்டுகள்",
          description: "WinPharma, MediMind மற்றும் Pharma Hunter விளையாட்டுகள் மூலம் மருந்துகள், அளவுகள் மற்றும் மருந்து விநியோகத்தை எளிதாகக் கற்றுக்கொள்ளுங்கள்.",
          highlight: "ஊடாடும் விளையாட்டு கற்றல்",
        },
        {
          step: "02",
          icon: PackageCheck,
          title: "Learn: வீட்டுக்கு விநியோகிக்கப்படும் புத்தகங்கள்",
          description: "அச்சிடப்பட்ட பாடநெறி கையேடுகள், மருந்துச்சீட்டு பயிற்சிகள் மற்றும் மருந்து வழிகாட்டிகள் உங்கள் வீட்டிற்கே அனுப்பி வைக்கப்படும்.",
          highlight: "நாடு தழுவிய விநியோகம்",
        },
        {
          step: "03",
          icon: Video,
          title: "Interact: நேரலை Zoom + 24/7 LMS",
          description: "வார இறுதி நேரலை விரிவுரைகள். ஒரு வகுப்பை தவறவிட்டாலும், எப்போது வேண்டுமானாலும் Full HD பதிவுகளை மீண்டும் பார்க்கலாம்.",
          highlight: "நெகிழ்வான ஆன்லைன் அட்டவணை",
        },
        {
          step: "04",
          icon: Award,
          title: "Grow: அங்கீகாரம் & வேலைவாய்ப்பு",
          description: "ACTD UK மற்றும் ISO 9001:2015 சான்றிதழ். பிரமாண்ட வருடாந்திர பட்டமளிப்பு விழா (Convocation).",
          highlight: "தொழில் அங்கீகாரம் பெற்ற சான்றிதழ்",
        },
      ],
    },
    en: {
      badge: "Our Learning Methodology",
      titlePrefix: "How You Learn — ",
      titleHighlight: "Play • Learn • Grow",
      subtitle: "We revolutionized healthcare education in Sri Lanka by blending clinical pharmacy drills, gaming tech, and personal mentorship.",
      bannerTitle: "Experience Pharmacy Education That Actually Works",
      bannerDesc: "Join over 2,500+ successful graduates who kickstarted their healthcare careers through our modern pharmacy training system.",
      bannerBtn: "Explore Courses",
      pillars: [
        {
          step: "01",
          icon: Gamepad2,
          title: "Play: Educational Simulation Games",
          description: "Master difficult drug generic names, dosages, and pharmacy dispensing scenarios with WinPharma, MediMind, and Pharma Hunter interactive games.",
          highlight: "Interactive Gamified Learning",
        },
        {
          step: "02",
          icon: PackageCheck,
          title: "Learn: Home-Delivered Study Pack",
          description: "Receive official printed course manuals, prescription booklets, and medicine reference guides delivered right to your home door via secure courier.",
          highlight: "Delivered Islandwide",
        },
        {
          step: "03",
          icon: Video,
          title: "Interact: Live Zoom + 24/7 LMS Portal",
          description: "Join interactive weekend lectures led by experienced pharmacy professionals. Missed a lesson? Re-watch in Full HD anytime on the SOS student portal.",
          highlight: "Flexible Online Schedule",
        },
        {
          step: "04",
          icon: Award,
          title: "Grow: Accredited Qualification & Jobs",
          description: "Earn ACTD UK accredited & ISO 9001:2015 certified certificates verified instantly online. Participate in our annual grand convocation ceremony.",
          highlight: "Industry-Recognized Credential",
        },
      ],
    },
  }[language] || {
    badge: "Our Learning Methodology",
    titlePrefix: "How You Learn — ",
    titleHighlight: "Play • Learn • Grow",
    subtitle: "We revolutionized healthcare education in Sri Lanka by blending clinical pharmacy drills, gaming tech, and personal mentorship.",
    bannerTitle: "Experience Pharmacy Education That Actually Works",
    bannerDesc: "Join over 2,500+ successful graduates who kickstarted their healthcare careers through our modern pharmacy training system.",
    bannerBtn: "Explore Courses",
    pillars: [
      {
        step: "01",
        icon: Gamepad2,
        title: "Play: Educational Simulation Games",
        description: "Master difficult drug generic names, dosages, and pharmacy dispensing scenarios with WinPharma, MediMind, and Pharma Hunter interactive games.",
        highlight: "Interactive Gamified Learning",
      },
      {
        step: "02",
        icon: PackageCheck,
        title: "Learn: Home-Delivered Study Pack",
        description: "Receive official printed course manuals, prescription booklets, and medicine reference guides delivered right to your home door via secure courier.",
        highlight: "Delivered Islandwide",
      },
      {
        step: "03",
        icon: Video,
        title: "Interact: Live Zoom + 24/7 LMS Portal",
        description: "Join interactive weekend lectures led by experienced pharmacy professionals. Missed a lesson? Re-watch in Full HD anytime on the SOS student portal.",
        highlight: "Flexible Online Schedule",
      },
      {
        step: "04",
        icon: Award,
        title: "Grow: Accredited Qualification & Jobs",
        description: "Earn ACTD UK accredited & ISO 9001:2015 certified certificates verified instantly online. Participate in our annual grand convocation ceremony.",
        highlight: "Industry-Recognized Credential",
      },
    ],
  };

  return (
    <section id="how-you-learn" className="py-16 md:py-24 bg-gradient-to-b from-secondary/15 via-background to-background">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
            {content.badge}
          </Badge>
          <h2 className={`text-3xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
            isSinhala ? 'leading-[1.32]' : 'leading-tight'
          }`}>
            {content.titlePrefix}<span className="text-primary">{content.titleHighlight}</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
          <p className={`mt-4 text-muted-foreground text-base md:text-lg font-body ${
            isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
          }`}>
            {content.subtitle}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.step}
                className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1.5"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-headline font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-muted-foreground/60">
                    STEP {pillar.step}
                  </span>
                </div>

                <h3 className={`font-headline font-bold text-lg text-foreground mb-3 ${
                  isSinhala ? 'leading-snug' : 'leading-snug'
                }`}>
                  {pillar.title}
                </h3>

                <p className={`text-muted-foreground text-sm font-body mb-6 flex-grow ${
                  isSinhala ? 'leading-[1.7]' : 'leading-relaxed'
                }`}>
                  {pillar.description}
                </p>

                <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pillar.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 rounded-2xl bg-primary text-primary-foreground p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-2xl font-headline font-bold">{content.bannerTitle}</h4>
            <p className="text-primary-foreground/80 text-sm max-w-xl font-body">
              {content.bannerDesc}
            </p>
          </div>
          <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-md shrink-0">
            <Link href="/courses">
              {content.bannerBtn} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
