"use client";

import { Calendar, Clock, Flame, ArrowRight, MessageCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useTranslation } from "@/context/language-context";

export default function NextIntakeBanner() {
  const { language } = useTranslation();
  const isSinhala = language === 'si';
  const currentMonthYear = new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const getWhatsAppMessage = () => {
    if (language === 'si') {
      return "ආයුබෝවන් Ceylon Pharma College, මට ඉදිරි කණ්ඩායමේ ලියාපදිංචිය සහ පාඨමාලා විස්තර දැනගැනීමට අවශ්‍යයි.";
    }
    if (language === 'ta') {
      return "வணக்கம் Ceylon Pharma College, புதிய சேர்க்கை மற்றும் பாடநெறி விவரங்கள் பற்றி அறிய விரும்புகிறேன்.";
    }
    return "Hello Ceylon Pharma College, I would like to know details about the upcoming batch intake.";
  };

  const content = {
    si: {
      badge: "නව බඳවා ගැනීම් විවෘතයි",
      intake: `නව කණ්ඩායම: ${currentMonthYear}`,
      title: "ඉදිරි ඖෂධවේදී පුහුණු කණ්ඩායම සඳහා ඔබගේ ආසනය වෙන්කරවා ගන්න",
      desc: "ඖෂධවේදී භාවිතය පිළිබඳ සහතික පත්‍ර පාඨමාලාව (CCPP) සඳහා දැන් ලියාපදිංචිය විවෘතයි. සති අන්ත සජීවී Zoom දේශන, නිවසටම ලැබෙන පොත් කට්ටලය සහ WinPharma පරිගණක පුහුණුව සහිතයි.",
      bullet1: "සති අන්ත සජීවී දේශන",
      bullet2: "නිවසටම පොත් කට්ටලය",
      bullet3: "පහසු මාසික වාරික",
      enrollBtn: "දැන්ම ලියාපදිංචි වන්න",
      whatsappBtn: "WhatsApp උපදෙස් ලබාගන්න",
    },
    ta: {
      badge: "சேர்க்கை திறக்கப்பட்டுள்ளது",
      intake: `புதிய சேர்க்கை: ${currentMonthYear}`,
      title: "வரவிருக்கும் மருந்தியல் பயிற்சி குழுவில் உங்கள் இடத்தை உறுதி செய்யுங்கள்",
      desc: "மருந்தியல் நடைமுறை சான்றிதழ் படிப்புக்கான (CCPP) சேர்க்கை இப்போது திறக்கப்பட்டுள்ளது. வார இறுதி நேரலை Zoom வகுப்புகள், வீட்டு விநியோக புத்தக தொகுப்பு மற்றும் WinPharma நடைமுறை பயிற்சிகள்.",
      bullet1: "வார இறுதி நேரலை வகுப்புகள்",
      bullet2: "வீட்டு விநியோக புத்தக தொகுப்பு",
      bullet3: "சுலப தவணை முறை",
      enrollBtn: "இப்போதே சேருங்கள்",
      whatsappBtn: "WhatsApp ஆலோசனை",
    },
    en: {
      badge: "Admissions Open",
      intake: `New Intake: ${currentMonthYear}`,
      title: "Secure Your Seat for the Upcoming Pharmacy Practice Batch",
      desc: "Registration is currently open for the Certificate Course in Pharmacy Practice. Classes are held on weekends with home-delivered printed materials and interactive simulations. Limited seats per intake.",
      bullet1: "Weekend Live Sessions",
      bullet2: "Doorstep Book Pack",
      bullet3: "Easy Installment Plans",
      enrollBtn: "Enroll in Next Intake",
      whatsappBtn: "WhatsApp Counseling",
    },
  }[language] || {
    badge: "Admissions Open",
    intake: `New Intake: ${currentMonthYear}`,
    title: "Secure Your Seat for the Upcoming Pharmacy Practice Batch",
    desc: "Registration is currently open for the Certificate Course in Pharmacy Practice. Classes are held on weekends with home-delivered printed materials and interactive simulations. Limited seats per intake.",
    bullet1: "Weekend Live Sessions",
    bullet2: "Doorstep Book Pack",
    bullet3: "Easy Installment Plans",
    enrollBtn: "Enroll in Next Intake",
    whatsappBtn: "WhatsApp Counseling",
  };

  const whatsappUrl = `https://wa.me/94715884884?text=${encodeURIComponent(getWhatsAppMessage())}`;

  return (
    <section id="next-intake" className="py-12 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-950 text-white p-8 md:p-12 shadow-2xl border border-teal-500/20">
          
          {/* Background Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-[11px] tracking-wider px-3 py-1 gap-1">
                  <Flame className="w-3.5 h-3.5 fill-black" /> {content.badge}
                </Badge>
                <span className="text-xs text-teal-200/90 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> {content.intake}
                </span>
              </div>

              <h2 className={`text-2xl md:text-4xl font-headline font-bold text-white tracking-tight ${
                isSinhala ? 'leading-[1.32]' : 'leading-tight'
              }`}>
                {content.title}
              </h2>

              <p className={`text-sm md:text-base text-teal-100/80 font-body max-w-2xl ${
                isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
              }`}>
                {content.desc}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-teal-100 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{content.bullet1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{content.bullet2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{content.bullet3}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base shadow-lg h-14">
                <Link href="/apply">
                  {content.enrollBtn} <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-teal-400/40 bg-teal-950/60 hover:bg-teal-900 text-white font-semibold text-base h-14">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2 text-emerald-400" /> {content.whatsappBtn}
                </a>
              </Button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
