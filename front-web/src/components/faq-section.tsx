"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, PhoneCall, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/language-context";

const faqsByLang = {
  si: [
    {
      id: "item-1",
      question: "ඖෂධවේදී භාවිතය පිළිබඳ සහතික පත්‍ර පාඨමාලාවට සම්බන්ධ වීමට අවශ්‍ය සුදුසුකම් මොනවාද?",
      answer:
        "අ.පො.ස. සා/පෙළ හෝ උ/පෙළ පෙනී සිටි ඕනෑම අයෙකුට මෙම පාඨමාලාව සඳහා සම්බන්ධ විය හැකිය. පාසල් හැරගිය සිසුන්ට, ඖෂධවේදී සහායකයින් ලෙස සේවය කිරීමට කැමති අයට සහ දැනට ෆාමසි වල සේවය කරන අයට මෙම පිළිගත් සහතිකය ලබාගත හැක.",
    },
    {
      id: "item-2",
      question: "දේශන පැවැත්වෙන්නේ කෙසේද? දේශනයක් මඟහැරුණහොත් කුමක් කළ යුතුද?",
      answer:
        "සියලුම දේශන සති අන්තයේ සජීවීව Zoom තාක්ෂණය ඔස්සේ පැවැත්වේ. සෑම දේශනයක්ම පටිගත කර පැය 24ක් ඇතුළත ඔබගේ SOS LMS ශිෂ්‍ය ගිණුමට එක් කරන බැවින් ඕනෑම වේලාවක නැවත නැරඹිය හැකිය.",
    },
    {
      id: "item-3",
      question: "මුද්‍රිත පොත් කට්ටලය (Study Pack) නිවසටම ලැබෙන්නේ කෙසේද?",
      answer:
        "ලියාපදිංචිය තහවුරු කළ පසු, සියලුම මුද්‍රිත පාඨමාලා පොත්, බෙහෙත් වට්ටෝරු අභ්‍යාස පොත් සහ ඖෂධ නාමාවලි ලියාපදිංචි කුරියර් සේවාවක් මඟින් ශ්‍රී ලංකාවේ ඕනෑම ප්‍රදේශයක ඔබගේ නිවසටම ආරක්ෂිතව බෙදාහරිනු ලැබේ.",
    },
    {
      id: "item-4",
      question: "පාඨමාලා ගාස්තු වාරික වශයෙන් ගෙවිය හැකිද?",
      answer:
        "ඔව්! ආරම්භක ලියාපදිංචි ගාස්තුව ගෙවීමෙන් පසු, ඉතිරි පාඨමාලා ගාස්තුව මාසික පහසු වාරික ක්‍රමයට ගෙවීමේ අවස්ථාව සලසා දී ඇත.",
    },
    {
      id: "item-5",
      question: "මෙම සහතිකය රැකියා සඳහා පිළිගැනීමක් තිබේද?",
      answer:
        "ඔව්. සිලෝන් ෆාමා විද්‍යාලය ISO 9001:2015 සහතික ලත් ආයතනයක් වන අතර ACTD UK ජාත්‍යන්තර ප්‍රතීතනය සතුය. අපගේ වෙබ් අඩවියෙන් QR කේතය හරහා ක්ෂණිකව සහතික පරීක්ෂා කරගත හැක.",
    },
    {
      id: "item-6",
      question: "විභාග සහ ප්‍රායෝගික ඇගයීම් සිදු කරන්නේ කෙසේද?",
      answer:
        "මාර්ගගත ප්‍රශ්නාවලි, WinPharma පරිගණක පුහුණු සමාකරණ, බෙහෙත් වට්ටෝරු කියවීමේ පැවරුම් සහ අවසන් මාර්ගගත විභාගයක් මඟින් ඇගයීම සිදු වේ.",
    },
  ],
  ta: [
    {
      id: "item-1",
      question: "மருந்தியல் நடைமுறை சான்றிதழ் படிப்பில் சேர தேவையான தகுதிகள் யாவை?",
      answer:
        "G.C.E. O/L அல்லது A/L தேர்வெழுதிய எவரும் இதில் சேரலாம். பள்ளி முடித்தவர்கள், மருந்தக உதவியாளர்களாக பணியாற்ற விரும்புவோர் மற்றும் தற்போது மருந்தகங்களில் பணியாற்றுபவர்களுக்கு ஏற்றது.",
    },
    {
      id: "item-2",
      question: "விரிவுரைகள் எவ்வாறு நடத்தப்படுகின்றன? ஒரு விரிவுரையை தவறவிட்டால் என்ன செய்வது?",
      answer:
        "அனைத்து விரிவுரைகளும் வார இறுதி நாட்களில் Zoom மூலம் நேரலையாக நடைபெறும். ஒவ்வொரு விரிவுரையும் பதிவு செய்யப்பட்டு 24 மணி நேரத்திற்குள் உங்கள் LMS கணக்கில் சேர்க்கப்படும்.",
    },
    {
      id: "item-3",
      question: "அச்சிடப்பட்ட புத்தக தொகுப்பு எவ்வாறு கிடைக்கும்?",
      answer:
        "பதிவை உறுதிசெய்த பிறகு, அனைத்து அச்சிடப்பட்ட பாட புத்தகங்களும் கூரியர் சேவை மூலம் உங்கள் வீட்டு முகவரிக்கு பாதுகாப்பாக அனுப்பப்படும்.",
    },
    {
      id: "item-4",
      question: "பாடநெறி கட்டணங்களை தவணைகளில் செலுத்த முடியுமா?",
      answer:
        "ஆம்! ஆரம்ப பதிவு கட்டணத்தை செலுத்திய பின், மீதமுள்ள கட்டணத்தை மாதாந்திர சுலப தவணைகளில் செலுத்தலாம்.",
    },
    {
      id: "item-5",
      question: "இந்த சான்றிதழுக்கு வேலைவாய்ப்பு அங்கீகாரம் உள்ளதா?",
      answer:
        "ஆம். சிலோன் பார்மா கல்லூரி ISO 9001:2015 சான்றிதழ் பெற்றது மற்றும் ACTD UK சர்வதேச அங்கீகாரம் கொண்டது.",
    },
    {
      id: "item-6",
      question: "தேர்வுகள் மற்றும் மதிப்பீடுகள் எவ்வாறு நடத்தப்படுகின்றன?",
      answer:
        "ஆன்லைன் வினாடி வினாக்கள், WinPharma செய்முறை உருவகப்படுத்துதல்கள் மற்றும் இறுதி ஆன்லைன் தேர்வு மூலம் மதிப்பீடு செய்யப்படும்.",
    },
  ],
  en: [
    {
      id: "item-1",
      question: "What are the entry qualifications for the Certificate in Pharmacy Practice?",
      answer:
        "Anyone who has sat for G.C.E. O/L or A/L examinations can apply. It is ideal for school leavers, aspiring pharmacy assistants, and currently employed community dispensary staff looking to validate their skills.",
    },
    {
      id: "item-2",
      question: "How are classes conducted? What happens if I miss a live lecture?",
      answer:
        "All lectures are conducted live on weekends via Zoom. Every session is recorded in Full HD and uploaded to your SOS LMS portal within 24 hours, so you can review at your own pace anytime.",
    },
    {
      id: "item-3",
      question: "How do I receive the printed study materials?",
      answer:
        "Once enrollment is confirmed, official course handbooks, prescription exercise booklets, and medicine reference charts are dispatched via registered courier straight to your home address anywhere in Sri Lanka.",
    },
    {
      id: "item-4",
      question: "Can I pay the course fee in monthly installments?",
      answer:
        "Yes! After an initial registration fee, the remaining balance can be settled in easy, interest-free monthly installments throughout the duration of the program.",
    },
    {
      id: "item-5",
      question: "Are certificates recognized for employment in Sri Lanka & overseas?",
      answer:
        "Yes. Ceylon Pharma College operates under an ISO 9001:2015 certified Quality Management System and is accredited by ACTD (American Council on Training & Development) UK & USA. Certificates can be verified online anytime via our portal.",
    },
    {
      id: "item-6",
      question: "How are examinations and practical skill assessments conducted?",
      answer:
        "Assessments include interactive online quizzes, prescription interpretation assignments, WinPharma software dispensing simulations, and a final structured online theory & practical exam.",
    },
  ],
};

export default function FAQSection() {
  const { language } = useTranslation();
  const isSinhala = language === 'si';

  const currentFaqs = faqsByLang[language as keyof typeof faqsByLang] || faqsByLang.en;

  const labels = {
    si: {
      badge: "නිතර අසන ප්‍රශ්න",
      title: "ඔබට දැනගැනීමට අවශ්‍ය කරුණු",
      subtitle: "පාඨමාලා සුදුසුකම්, ගාස්තු, සජීවී දේශන සහ සහතික පිළිබඳ වැඩි විස්තර මෙතැනින් දැනගන්න.",
      stillQuestions: "තවමත් ගැටලු තිබේද? අපගේ උපදේශකවරුන් අමතන්න:",
      callBtn: "0715 884 884 අමතන්න",
      waBtn: "WhatsApp උපදෙස්",
    },
    ta: {
      badge: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      title: "நீங்கள் தெரிந்து கொள்ள வேண்டியவை",
      subtitle: "பாடநெறி தகுதிகள், கட்டணங்கள், நேரலை வகுப்புகள் மற்றும் சான்றிதழ் விவரங்களை இங்கே காணலாம்.",
      stillQuestions: "இன்னும் கேள்விகள் உள்ளதா? எங்களைத் தொடர்பு கொள்ளவும்:",
      callBtn: "0715 884 884 அழைக்கவும்",
      waBtn: "WhatsApp உதவி",
    },
    en: {
      badge: "Got Questions?",
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about admission requirements, course fees, online lecture schedules, and certificate accreditation.",
      stillQuestions: "Still have questions about our pharmacy courses?",
      callBtn: "Call 0715 884 884",
      waBtn: "WhatsApp Support",
    },
  }[language] || {
    badge: "Got Questions?",
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about admission requirements, course fees, online lecture schedules, and certificate accreditation.",
    stillQuestions: "Still have questions about our pharmacy courses?",
    callBtn: "Call 0715 884 884",
    waBtn: "WhatsApp Support",
  };

  const getWaText = () => {
    if (language === 'si') return "ආයුබෝවන්, මට Ceylon Pharma College පාඨමාලා පිළිබඳ විස්තර දැනගැනීමට අවශ්‍යයි.";
    if (language === 'ta') return "வணக்கம், Ceylon Pharma College பாடநெறிகள் பற்றிய கூடுதல் விவரங்கள் தேவை.";
    return "Hi, I have a question about Ceylon Pharma College courses.";
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-card/50 border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Full Container Width 2-Column Grid matching Navbar boundaries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          
          {/* Left Column (Col 4): Sticky Header & Support Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
              {labels.badge}
            </Badge>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-foreground tracking-tight ${
              isSinhala ? 'leading-[1.32]' : 'leading-tight'
            }`}>
              {labels.title}
            </h2>
            <div className="w-16 h-1 bg-primary mt-3 mb-4 rounded-full" />
            <p className="text-muted-foreground text-sm font-body mb-6 leading-relaxed">
              {labels.subtitle}
            </p>
            
            {/* Quick Support Card */}
            <div className="p-5 rounded-2xl bg-background border border-border/80 shadow-sm space-y-3">
              <p className="font-headline font-semibold text-sm text-foreground">
                {labels.stillQuestions}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <Button asChild size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 h-9">
                  <a href={`https://wa.me/94715884884?text=${encodeURIComponent(getWaText())}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                    <span>{labels.waBtn}</span>
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold gap-2 h-9">
                  <a href="tel:0715884884">
                    <PhoneCall className="w-4 h-4 text-primary" />
                    <span>{labels.callBtn}</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column (Col 8): FAQ Accordion */}
          <div className="lg:col-span-8 bg-background rounded-2xl border border-border p-6 md:p-8 shadow-sm">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
              {currentFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-b border-border/60 pb-2">
                  <AccordionTrigger className={`text-left font-headline font-semibold text-base md:text-lg text-foreground hover:text-primary transition-colors py-3 ${
                    isSinhala ? 'leading-normal' : 'leading-snug'
                  }`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className={`text-sm md:text-base text-muted-foreground font-body pt-1 pb-4 ${
                    isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
                  }`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>

      </div>
    </section>
  );
}
