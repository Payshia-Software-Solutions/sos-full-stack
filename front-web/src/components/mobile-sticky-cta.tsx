"use client";

import { MessageCircle, Phone, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';

export default function MobileStickyCTA() {
  const { language } = useTranslation();

  const getWhatsAppMessage = () => {
    if (language === 'si') {
      return "ආයුබෝවන් Ceylon Pharma College, මට පාඨමාලා විස්තර සහ ගාස්තු දැනගැනීමට අවශ්‍යයි.";
    }
    if (language === 'ta') {
      return "வணக்கம் Ceylon Pharma College, பாடநெறி விவரங்கள் மற்றும் கட்டணங்களை அறிந்துகொள்ள விரும்புகிறேன்.";
    }
    return "Hi Ceylon Pharma College, I would like to get more information about your courses.";
  };

  const whatsappUrl = "https://wa.me/94715884884?text=" + encodeURIComponent(getWhatsAppMessage());
  const callUrl = "tel:+94715884884";
  const applyUrl = "/apply";

  return (
    <>
      {/* Desktop Floating WhatsApp Button */}
      <aside aria-label="Support and Quick Contact" className="hidden md:block fixed bottom-6 right-6 z-50">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group"
          aria-label="Chat on WhatsApp"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Chat on WhatsApp</span>
        </a>
      </aside>

      {/* Mobile Persistent Bottom Conversion Bar */}
      <nav aria-label="Mobile quick actions" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/80 px-3 py-2 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold transition-transform active:scale-95"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 mb-0.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={callUrl}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border transition-transform active:scale-95"
            aria-label="Call Now"
          >
            <Phone className="w-4 h-4 mb-0.5 text-primary" />
            <span>Call Now</span>
          </a>

          <Link
            href={applyUrl}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold shadow-md transition-transform active:scale-95"
            aria-label="Apply Now"
          >
            <GraduationCap className="w-4 h-4 mb-0.5 text-amber-300" />
            <span>Apply Now</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
