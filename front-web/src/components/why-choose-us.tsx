"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import { Gamepad2, Pill, MonitorPlay, BookOpen, Award, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function WhyChooseUs() {
  const { language } = useTranslation();
  const isSinhala = language === 'si';

  const content = {
    si: {
      badge: "අපගේ සුවිශේෂත්වය",
      titlePrefix: "හුදු දේශන පමණක් නොවේ. ",
      titleHighlight: "සැබෑ ඖෂධවේදී කුසලතා.",
      desc: "සිලෝන් ෆාමා විද්‍යාලයේදී අපි කටපාඩම් කරවීමෙන් ඔබ්බට යමු. ප්‍රායෝගික ඖෂධ නිකුත් කිරීමේ පුහුණුව, අධ්‍යාපනික පරිගණක ක්‍රීඩා සහ ක්ෂේත්‍රයේ ප්‍රවීණයන්ගේ මඟපෙන්වීම තුළින් ඖෂධ ක්ෂේත්‍රයේ විශිෂ්ටත්වය දැක්වීමට ඔබව සූදානම් කරන්නෙමු.",
      imgSubtitle: "අන්තර්ක්‍රියාකාරී මාර්ගගත අධ්‍යාපනය",
      imgDesc: "දිවයින පුරා සහ විදේශයන්හි සිසුන්ගේ සෞඛ්‍ය වෘත්තීය සිහින සැබෑ කරමින්",
      stat1: "පුහුණුව ලැබූ සිසුන්",
      stat2: "Google Reviews (4.9★)",
      stat3: "සම්පූර්ණ කළ කණ්ඩායම්",
      stat4: "ප්‍රතීතනය ලත් පාඨමාලා",
      items: [
        {
          icon: Gamepad2,
          title: "අධ්‍යාපනික පරිගණක ක්‍රීඩා",
          desc: "WinPharma සහ Pharma Hunter හරහා ඖෂධ වර්ග, මාත්‍රාවන් සහ ගණනය කිරීම් ක්‍රීඩාවක් ලෙසින් ප්‍රගුණ කරන්න.",
        },
        {
          icon: Pill,
          title: "ප්‍රායෝගික ඖෂධ නිකුත් කිරීම",
          desc: "සැබෑ බෙහෙත් වට්ටෝරු කියවීම, මාත්‍රා සලකුණු කිරීම සහ රෝගී උපදේශන කුසලතා පුහුණුව.",
        },
        {
          icon: MonitorPlay,
          title: "සජීවී Zoom + පටිගත කිරීම්",
          desc: "සති අන්ත සජීවී දේශන සමඟ පැය 24 පුරා LMS පද්ධතියෙන් ඕනෑම වේලාවක පාඩම් නැවත නැරඹීමේ පහසුකම.",
        },
        {
          icon: BookOpen,
          title: "මුද්‍රිත පොත් කට්ටලය",
          desc: "විස්තරාත්මක පාඨමාලා පොත් සහ ඖෂධ නාමාවලි ඔබගේ නිවසටම කුරියර් මඟින් බෙදාහැරීම.",
        },
        {
          icon: Award,
          title: "ACTD & ISO 9001:2015",
          desc: "අන්තර්ජාලය ඔස්සේ ක්ෂණිකව QR කේතයෙන් තහවුරු කළ හැකි ජාත්‍යන්තර ප්‍රතීතනය ලත් සහතික.",
        },
        {
          icon: Briefcase,
          title: "වෘත්තීය සහ රැකියා මඟපෙන්වීම",
          desc: "සුදුසුකම් ලබන සිසුන්ට ප්‍රමුඛ පෙළේ පෞද්ගලික රෝහල් සහ ඖෂධහල් ජාල සමඟ සම්බන්ධ වීමට මඟපෙන්වීම.",
        },
      ],
    },
    ta: {
      badge: "எங்கள் சிறப்பு",
      titlePrefix: "வெறும் விரிவுரைகள் மட்டுமல்ல. ",
      titleHighlight: "உண்மையான மருந்தக திறன்கள்.",
      desc: "சிலோன் பார்மா கல்லூரியில் நாம் வெறும் மனப்பாடம் செய்வதைத் தாண்டுகிறோம். நடைமுறை மருந்து விநியோக பயிற்சிகள், விளையாட்டு அடிப்படையிலான கற்றல் மற்றும் தொழில்முறை வழிகாட்டுதல் மூலம் உண்மையான மருந்தியல் வெற்றிக்கு உங்களை தயார்படுத்துகிறோம்.",
      imgSubtitle: "ஊடாடும் மெய்நிகர் கற்றல்",
      imgDesc: "இலங்கை முழுவதும் மாணவர்களின் சுகாதார வாழ்க்கையை மேம்படுத்துகிறது",
      stat1: "பயிற்சி பெற்ற மாணவர்கள்",
      stat2: "Google மதிப்பாய்வுகள் (4.9★)",
      stat3: "முடித்த தொகுதிகள்",
      stat4: "அங்கீகரிக்கப்பட்ட படிப்புகள்",
      items: [
        {
          icon: Gamepad2,
          title: "கல்வி விளையாட்டுகள்",
          desc: "WinPharma மற்றும் Pharma Hunter விளையாட்டுகள் மூலம் மருந்தியல் கணக்கீடுகள் மற்றும் மருந்துகளை எளிதில் கற்றுக்கொள்ளுங்கள்.",
        },
        {
          icon: Pill,
          title: "நடைமுறை மருந்து விநியோகம்",
          desc: "மருந்துச்சீட்டு விளக்கம், மருந்தளவு லேபிளிங் மற்றும் நோயாளி ஆலோசனை உருவகப்படுத்துதல்கள்.",
        },
        {
          icon: MonitorPlay,
          title: "நேரலை Zoom + பதிவுகள்",
          desc: "வார இறுதி விரிவுரைகள் மற்றும் LMS கணக்கில் 24/7 பாடங்களை மீண்டும் பார்க்கும் வசதி.",
        },
        {
          icon: BookOpen,
          title: "அச்சிடப்பட்ட புத்தகங்கள்",
          desc: "விரிவான படிப்பு பொருட்கள் மற்றும் மருந்து வழிகாட்டிகள் உங்கள் வீட்டு வாசலுக்கே விநியோகிக்கப்படும்.",
        },
        {
          icon: Award,
          title: "ACTD & ISO 9001:2015",
          desc: "ஆன்லைனில் QR குறியீடு மூலம் சரிபார்க்கக்கூடிய சர்வதேச அங்கீகாரம் பெற்ற சான்றிதழ்கள்.",
        },
        {
          icon: Briefcase,
          title: "வேலைவாய்ப்பு வழிகாட்டுதல்",
          desc: "முன்னணி தனியார் மருத்துவமனைகள் மற்றும் சமூக மருந்தகங்களுடன் தகுதியான மருந்தியல் பட்டதாரிகளை இணைக்கிறது.",
        },
      ],
    },
    en: {
      badge: "The CPC Difference",
      titlePrefix: "Not Just Lectures. ",
      titleHighlight: "Real Pharmacy Skills.",
      desc: "At Ceylon Pharma College, we move beyond boring memorization. Our blended learning model combines practical simulations, gamified revision, and expert mentorship to prepare you for actual pharmacy practice.",
      imgSubtitle: "Interactive Virtual Learning",
      imgDesc: "Empowering healthcare careers across Sri Lanka & worldwide",
      stat1: "Students Trained",
      stat2: "Google Reviews (4.9★)",
      stat3: "Batches Completed",
      stat4: "Accredited Courses",
      items: [
        {
          icon: Gamepad2,
          title: "Educational Games",
          desc: "WinPharma, D-Pad & Pharma Hunter games make pharmacology calculations and medicine identification intuitive.",
        },
        {
          icon: Pill,
          title: "Real Dispensing Practice",
          desc: "Hands-on prescription interpretation, dosage labeling, and patient counselling simulations.",
        },
        {
          icon: MonitorPlay,
          title: "Live Zoom + Recordings",
          desc: "Interactive weekend lectures with 24/7 access to recorded lessons on our dedicated LMS portal.",
        },
        {
          icon: BookOpen,
          title: "Printed Study Pack",
          desc: "Comprehensive study materials and drug directories delivered directly to your doorstep.",
        },
        {
          icon: Award,
          title: "ACTD & ISO 9001:2015",
          desc: "Internationally accredited certificates verified through our online verification database.",
        },
        {
          icon: Briefcase,
          title: "Career & Job Support",
          desc: "Connecting qualified pharmacy graduates with leading private hospitals and community pharmacies.",
        },
      ],
    },
  }[language] || {
    badge: "The CPC Difference",
    titlePrefix: "Not Just Lectures. ",
    titleHighlight: "Real Pharmacy Skills.",
    desc: "At Ceylon Pharma College, we move beyond boring memorization. Our blended learning model combines practical simulations, gamified revision, and expert mentorship to prepare you for actual pharmacy practice.",
    imgSubtitle: "Interactive Virtual Learning",
    imgDesc: "Empowering healthcare careers across Sri Lanka & worldwide",
    stat1: "Students Trained",
    stat2: "Google Reviews (4.9★)",
    stat3: "Batches Completed",
    stat4: "Accredited Courses",
    items: [
      {
        icon: Gamepad2,
        title: "Educational Games",
        desc: "WinPharma, D-Pad & Pharma Hunter games make pharmacology calculations and medicine identification intuitive.",
      },
      {
        icon: Pill,
        title: "Real Dispensing Practice",
        desc: "Hands-on prescription interpretation, dosage labeling, and patient counselling simulations.",
      },
      {
        icon: MonitorPlay,
        title: "Live Zoom + Recordings",
        desc: "Interactive weekend lectures with 24/7 access to recorded lessons on our dedicated LMS portal.",
      },
      {
        icon: BookOpen,
        title: "Printed Study Pack",
        desc: "Comprehensive study materials and drug directories delivered directly to your doorstep.",
      },
      {
        icon: Award,
        title: "ACTD & ISO 9001:2015",
        desc: "Internationally accredited certificates verified through our online verification database.",
      },
      {
        icon: Briefcase,
        title: "Career & Job Support",
        desc: "Connecting qualified pharmacy graduates with leading private hospitals and community pharmacies.",
      },
    ],
  };

  return (
    <section id="why-choose-us" className="py-16 md:py-24 bg-card/40 border-y border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Badge variant="outline" className="w-fit mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
              {content.badge}
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {content.titlePrefix}<span className="text-primary block">{content.titleHighlight}</span>
            </h2>
            <div className="w-20 h-1 bg-primary mt-3 mb-6 rounded-full" />
            
            <p className={`text-muted-foreground font-body text-sm md:text-base ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {content.desc}
            </p>

            <div className="relative h-64 md:h-72 w-full rounded-2xl overflow-hidden shadow-xl mt-8 border border-border">
              <Image
                src="https://content-provider.pharmacollege.lk/website/why-chose.webp"
                alt="Students practical learning at Ceylon Pharma College"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                <span className="font-semibold block text-sm">{content.imgSubtitle}</span>
                {content.imgDesc}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {content.items.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="p-5 rounded-xl bg-background border border-border/70 hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className={`font-headline font-bold text-base text-foreground mb-1 ${
                      isSinhala ? 'leading-snug' : 'leading-tight'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-xs text-muted-foreground ${
                      isSinhala ? 'leading-[1.65]' : 'leading-relaxed'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Trust Stats Bar */}
            <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">4,700+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{content.stat1}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-amber-500">830+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{content.stat2}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">20+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{content.stat3}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">6+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{content.stat4}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
