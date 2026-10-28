'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Landmark, Copy, Check, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/context/language-context';

interface BankInfoDialogProps {
  variant?: 'default' | 'floating' | 'button-outline' | 'button-primary';
  className?: string;
}

export function BankInfoDialog({ variant = 'default', className = '' }: BankInfoDialogProps) {
  const { language } = useTranslation();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const CopyableRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center border-b border-border/60 py-2.5 last:border-0 last:pb-0">
      <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-xs sm:text-sm text-right text-foreground font-mono">{value}</span>
        <button
          onClick={() => handleCopy(value, label)}
          className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`Copy ${label}`}
          type="button"
          title={`Copy ${label}`}
        >
          {copiedItem === label ? (
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {variant === 'floating' ? (
          <Button
            type="button"
            className={`fixed bottom-6 right-6 h-12 sm:h-14 px-4 sm:px-5 rounded-full shadow-2xl z-40 gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white hover:scale-105 transition-all ${className}`}
            title="View Bank Info"
          >
            <Landmark className="h-5 w-5" />
            <span className="font-bold text-xs sm:text-sm">
              {language === 'si' ? 'බැංකු තොරතුරු' : language === 'ta' ? 'வங்கி தகவல்' : 'Bank Details'}
            </span>
          </Button>
        ) : (
          <Button
            variant={variant === 'button-primary' ? 'default' : 'outline'}
            type="button"
            className={`w-full gap-2 font-semibold ${className}`}
          >
            <Landmark className="h-4 w-4 text-primary" />
            <span>
              {language === 'si' ? 'බැංකු තැන්පතු තොරතුරු බලන්න' : language === 'ta' ? 'வங்கி கணக்கு விவரங்கள்' : 'View Bank Transfer Info'}
            </span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Landmark className="h-5 w-5" />
            <DialogTitle className="text-lg sm:text-xl font-headline">
              {language === 'si' ? 'නිල බැංකු තොරතුරු' : language === 'ta' ? 'அதிகாரப்பூர்வ வங்கி விவரங்கள்' : 'Official Bank Details'}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'si'
              ? 'පාඨමාලා ගාස්තු හෝ ලියාපදිංචි ගාස්තු පහත නිල බැංකු ගිණුමට තැන්පත් කළ හැක.'
              : 'Direct bank deposit or online fund transfers can be credited to this official account.'}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Bank Details Table */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-1">
            <CopyableRow label="Account Name" value="Ceylon Pharma College Pvt Ltd" />
            <CopyableRow label="Bank Name" value="Bank Of Ceylon (BOC)" />
            <CopyableRow label="Account Number" value="89090906" />
            <CopyableRow label="Branch" value="Pelmadulla Branch" />
          </div>

          {/* Verification Advice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {language === 'si'
                ? 'මුදල් තැන්පත් කිරීමෙන් පසු ලැබෙන රිසිට්පත (Bank Slip / Transfer Screenshot) ඔබගේ ලියාපදිංචි Reference අංකය සමඟ අපගේ WhatsApp අංකයට යොමු කරන්න.'
                : 'After depositing, forward your payment receipt screenshot with your application Reference ID to our official WhatsApp desk.'}
            </p>
          </div>

          {/* Official Bank Deposit Slip Visual Guide */}
          <div className="rounded-xl border border-border overflow-hidden bg-muted/40 shadow-sm">
            <div className="p-2 bg-muted text-[11px] font-semibold text-center text-muted-foreground">
              {language === 'si' ? 'නිල බැංකු පත්‍රිකා සාම්පලය (Sample Slip)' : 'Official Bank Deposit Reference Slip'}
            </div>
            <Image
              src="/assets/images/bank-info-cpc.jpeg"
              alt="Bank Information Ceylon Pharma College"
              width={700}
              height={700}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
