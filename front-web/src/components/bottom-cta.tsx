"use client";

import { MessageCircle, Phone, ArrowRight, ShieldCheck, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/context/language-context";

export default function BottomCTA() {
  const { language } = useTranslation();
  const isSinhala = language === 'si';

  const getWhatsAppMessage = () => {
    if (language === 'si') {
      return "ආයුබෝවන් Ceylon Pharma College, මට පාඨමාලා විස්තර සහ ගාස්තු දැනගැනීමට අවශ්‍යයි.";
    }
    if (language === 'ta') {
      return "வணக்கம் Ceylon Pharma College, பாடநெறி விவரங்கள் மற்றும் கட்டணங்களை அறிந்துகொள்ள விரும்புகிறேன்.";
    }
    return "Hello Ceylon Pharma College, I would like to inquire about course admissions.";
  };

  const content = {
    si: {
      graduates: "සුදුසුකම්ලත් සිසුන් 2,500+",
      accredited: "ACTD UK ප්‍රතීතනය ලත්",
      certified: "ISO 9001:2015 සහතික ලත්",
      title: "ඔබේ වෘත්තීය ඖෂධවේද ගමන අදම ආරම්භ කිරීමට සූදානම්ද?",
      desc: "අදම අපගේ අධ්‍යයන උපදේශකවරුන් අමතන්න. පාඨමාලා තෝරාගැනීම, විෂය නිර්දේශ සහ පහසු මාසික වාරික ගෙවීම් පිළිබඳ පූර්ණ මගපෙන්වීමක් අපි ලබා දෙන්නෙමු.",
      whatsappBtn: "WhatsApp මඟින් විමසන්න (0715 884 884)",
      inquireBtn: "මාර්ගගතව විමසන්න",
      general: "සාමාන්‍ය විමසීම්:",
      admissions: "බඳවා ගැනීමේ ක්ෂණික ඇමතුම්:",
    },
    ta: {
      graduates: "2,500+ தகுதிவாய்ந்த பட்டதாரிகள்",
      accredited: "ACTD UK அங்கீகாரம் பெற்றது",
      certified: "ISO 9001:2015 சான்றிதழ் பெற்றது",
      title: "உங்கள் தொழில்முறை மருந்தியல் பயணத்தை இன்றே தொடங்க தயாரா?",
      desc: "எங்கள் கல்வி ஆலோசகர்களை இன்றே தொடர்பு கொள்ளுங்கள். பாடநெறி தேர்வு, பாடத்திட்ட விவரங்கள் மற்றும் சுலப தவணை முறை பற்றி உங்களுக்கு வழிகாட்டுவோம்.",
      whatsappBtn: "WhatsApp இல் தொடர்பு கொள்ளுங்கள் (0715 884 884)",
      inquireBtn: "ஆன்லைனில் விசாரிக்கவும்",
      general: "பொது விசாரணைகள்:",
      admissions: "சேர்க்கைக்கான அவசர அழைப்பு:",
    },
    en: {
      graduates: "2,500+ Qualified Graduates",
      accredited: "ACTD UK Accredited",
      certified: "ISO 9001:2015 Certified",
      title: "Ready to Start Your Professional Pharmacy Journey?",
      desc: "Talk to our academic counselors today. We will guide you through course selection, syllabus details, and flexible installment payment options.",
      whatsappBtn: "Chat on WhatsApp (0715 884 884)",
      inquireBtn: "Send Online Inquiry",
      general: "General Inquiries:",
      admissions: "Admissions Hotline:",
    },
  }[language] || {
    graduates: "2,500+ Qualified Graduates",
    accredited: "ACTD UK Accredited",
    certified: "ISO 9001:2015 Certified",
    title: "Ready to Start Your Professional Pharmacy Journey?",
    desc: "Talk to our academic counselors today. We will guide you through course selection, syllabus details, and flexible installment payment options.",
    whatsappBtn: "Chat on WhatsApp (0715 884 884)",
    inquireBtn: "Send Online Inquiry",
    general: "General Inquiries:",
    admissions: "Admissions Hotline:",
  };

  const whatsappUrl = `https://wa.me/94715884884?text=${encodeURIComponent(getWhatsAppMessage())}`;

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-5xl">
        
        {/* Trust Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-primary-foreground/90 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" /> {content.graduates}
          </span>
          <span className="w-1 h-1 bg-primary-foreground/40 rounded-full" />
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> {content.accredited}
          </span>
          <span className="w-1 h-1 bg-primary-foreground/40 rounded-full" />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> {content.certified}
          </span>
        </div>

        <h2 className={`text-3xl md:text-5xl font-headline font-bold tracking-tight ${
          isSinhala ? 'leading-[1.32]' : 'leading-tight'
        }`}>
          {content.title}
        </h2>

        <p className={`mt-4 text-base md:text-xl text-primary-foreground/90 font-body max-w-2xl mx-auto ${
          isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
        }`}>
          {content.desc}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-black font-bold text-base px-8 py-6 shadow-xl h-14">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> {content.whatsappBtn}
            </a>
          </Button>

          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-6 h-14">
            <Link href="/apply">
              {content.inquireBtn} <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Hotlines */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-xs text-primary-foreground/80 flex flex-wrap justify-center items-center gap-6">
          <span className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> {content.general} <a href="tel:0117494335" className="font-bold underline hover:text-white">011 74 94 335</a>
          </span>
          <span className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> {content.admissions} <a href="tel:0715884884" className="font-bold underline hover:text-white">0715 884 884</a>
          </span>
        </div>

      </div>
    </section>
  );
}
