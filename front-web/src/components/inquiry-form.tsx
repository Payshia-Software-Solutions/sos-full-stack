"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { submitInquiry, InquiryState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/language-context";
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  RotateCcw,
  Sparkles,
  HelpCircle
} from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 rounded-xl shadow-md transition-all gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('inquiryFormSubmitting')}</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          <span>{t('inquiryFormSubmitButton')}</span>
        </>
      )}
    </Button>
  );
}

export default function InquiryForm() {
  const initialState: InquiryState = { message: "", errors: null, success: false };
  const [state, formAction] = useActionState(submitInquiry, initialState);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  useEffect(() => {
    if (state.success) {
      setIsSuccess(true);
      toast({
        title: isSinhala ? "විමසීම සාර්ථකව යොමු විය!" : "Inquiry Sent Successfully!",
        description: state.message,
      });
      formRef.current?.reset();
    }
  }, [state, toast, isSinhala]);

  const handleReset = () => {
    setIsSuccess(false);
  };

  const whatsappInquiryUrl = `https://wa.me/94715884884?text=${encodeURIComponent(
    isSinhala
      ? `ආයුබෝවන් Ceylon Pharma College, මට විමසීමක් සිදුකිරීමට අවශ්‍යයි:
නම: ${state.data?.name || ''}
දුරකථන: ${state.data?.phone || ''}
මාතෘකාව: ${state.data?.subject || ''}
පණිවිඩය: ${state.data?.message || ''}`
      : `Hi Ceylon Pharma College, I submitted an inquiry on your website:
Name: ${state.data?.name || ''}
Phone: ${state.data?.phone || ''}
Subject: ${state.data?.subject || ''}
Message: ${state.data?.message || ''}`
  )}`;

  return (
    <div id="inquire" className="h-full">
      <Card className="h-full rounded-2xl border border-border/80 shadow-md bg-card overflow-hidden flex flex-col">
        <CardHeader className="pb-4 bg-muted/20 border-b border-border/60">
          <CardTitle className="font-headline text-2xl text-foreground flex items-center justify-between">
            <span>{t('inquiryFormTitle')}</span>
            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1 font-body">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isSinhala ? 'පැය 24ක් තුළ ප්‍රතිචාර' : 'Replies within 24h'}</span>
            </span>
          </CardTitle>
          <CardDescription className="font-body text-muted-foreground text-xs sm:text-sm">
            {t('inquiryFormSubtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 flex-grow flex flex-col justify-center">
          {isSuccess ? (
            /* Clear Visual Success State Screen */
            <div className="py-8 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-headline font-bold text-xl text-foreground">
                  {isSinhala ? 'ඔබගේ විමසීම සාර්ථකව ලැබුණි!' : 'Thank You! Your Inquiry Has Been Received'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed font-body">
                  {isSinhala
                    ? 'අපගේ අධ්‍යයන උපදේශන අංශය (Admissions Team) කඩිනමින් ඔබගේ දුරකථන අංකය හෝ විද්‍යුත් තැපෑල ඔස්සේ සම්බන්ධ වනු ඇත.'
                    : 'Our admissions counseling team will get in touch with you via your contact number or email shortly.'}
                </p>
              </div>

              {/* Direct WhatsApp Immediate Channel */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md mx-auto text-xs text-left space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>{isSinhala ? 'ක්ෂණිකව ප්‍රතිචාර අවශ්‍යද?' : 'Need an instant answer?'}</span>
                </p>
                <p className="text-muted-foreground">
                  {isSinhala 
                    ? 'අපගේ WhatsApp සේවාව හරහා මේ මොහොතේදීම සම්බන්ධ වී ඔබේ ප්‍රශ්නවලට පිළිතුරු ලබාගත හැක.'
                    : 'Connect directly with an admissions officer on WhatsApp right now.'}
                </p>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 hover:underline pt-1"
                >
                  <span>{isSinhala ? 'WhatsApp මඟින් කතාබස් කරන්න →' : 'Continue on WhatsApp →'}</span>
                </a>
              </div>

              <div className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  className="gap-2 rounded-xl text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isSinhala ? 'වෙනත් පණිවිඩයක් යොමු කරන්න' : 'Send Another Inquiry'}</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Contact Form */
            <form ref={formRef} action={formAction} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  {isSinhala ? 'ඔබගේ නම' : 'Your Full Name'} <span className="text-destructive">*</span>
                </label>
                <Input 
                  name="name" 
                  placeholder={t('inquiryFormNamePlaceholder')} 
                  required 
                  aria-label={t('inquiryFormNamePlaceholder')}
                  className="rounded-xl py-5 bg-background border-border/80 text-sm"
                />
                {state.errors?.name && <p className="text-xs font-medium text-destructive pt-1">{state.errors.name[0]}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    {isSinhala ? 'විද්‍යුත් තැපෑල (Email)' : 'Email Address'} <span className="text-destructive">*</span>
                  </label>
                  <Input 
                    name="email" 
                    type="email" 
                    placeholder={t('inquiryFormEmailPlaceholder')} 
                    required 
                    aria-label={t('inquiryFormEmailPlaceholder')} 
                    className="rounded-xl py-5 bg-background border-border/80 text-sm"
                  />
                  {state.errors?.email && <p className="text-xs font-medium text-destructive pt-1">{state.errors.email[0]}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    {isSinhala ? 'දුරකථන / WhatsApp අංකය' : 'Phone / WhatsApp'} <span className="text-destructive">*</span>
                  </label>
                  <Input 
                    name="phone" 
                    type="tel" 
                    placeholder="e.g. 071 588 4884" 
                    required
                    aria-label="Phone Number" 
                    className="rounded-xl py-5 bg-background border-border/80 text-sm"
                  />
                  {state.errors?.phone && <p className="text-xs font-medium text-destructive pt-1">{state.errors.phone[0]}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  {isSinhala ? 'විමසීමට අදාළ මාතෘකාව' : 'Subject / Course of Interest'} <span className="text-destructive">*</span>
                </label>
                <Input 
                  name="subject" 
                  placeholder={isSinhala ? 'උදා: CCPP පාඨමාලාව, ගාස්තු හෝ ලියාපදිංචිය' : 'e.g. CCPP Course Details, Tuition Fees, Batch Schedule'} 
                  required 
                  aria-label={t('inquiryFormSubjectPlaceholder')}
                  className="rounded-xl py-5 bg-background border-border/80 text-sm"
                />
                {state.errors?.subject && <p className="text-xs font-medium text-destructive pt-1">{state.errors.subject[0]}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  {isSinhala ? 'ඔබගේ පණිවිඩය' : 'Your Message'} <span className="text-destructive">*</span>
                </label>
                <Textarea 
                  name="message" 
                  placeholder={t('inquiryFormMessagePlaceholder')} 
                  required 
                  aria-label={t('inquiryFormMessagePlaceholder')}
                  className="rounded-xl min-h-[120px] bg-background border-border/80 resize-none text-sm"
                />
                {state.errors?.message && <p className="text-xs font-medium text-destructive pt-1">{state.errors.message[0]}</p>}
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>

              {/* Direct WhatsApp Pill Under Button */}
              <div className="pt-2 text-center">
                <a
                  href="https://wa.me/94715884884?text=Hi%20Ceylon%20Pharma%20College,%20I%20have%20an%20inquiry%20regarding%20your%20pharmacy%20courses."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSinhala ? 'හෝ WhatsApp මඟින් කෙලින්ම විමසන්න' : 'Prefer instant messaging? Chat with us on WhatsApp'}</span>
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
