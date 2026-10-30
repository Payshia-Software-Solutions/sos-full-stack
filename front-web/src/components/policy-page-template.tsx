"use client";

import React from 'react';
import { useTranslation } from '@/context/language-context';
import { ChevronRight, Mail, Phone, MapPin, Building2, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface PolicyPageProps {
  titleKey: string;
  contentKey: string;
}

// Helper to auto-link emails and URLs inside text fragments
function linkify(text: string): React.ReactNode {
  const tokenRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium"
        >
          {part}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium inline-flex items-center gap-1"
        >
          <span>{part}</span>
          <ExternalLink className="inline h-3 w-3" />
        </a>
      );
    }
    return part;
  });
}

// Helper to parse **bold** and inline links
function formatFormattedText(text: string): React.ReactNode {
  const parts = text.split('**');
  return parts.map((part, i) => {
    const isBold = i % 2 === 1;
    const content = linkify(part);
    if (isBold) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {content}
        </strong>
      );
    }
    return <React.Fragment key={i}>{content}</React.Fragment>;
  });
}

export default function PolicyPageTemplate({ titleKey, contentKey }: PolicyPageProps) {
  const { t } = useTranslation();

  // The content from translation might have multiple paragraphs separated by newlines
  const contentParagraphs = (t(contentKey as any) || '').split('\n\n');

  return (
    <main className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 text-sm font-body mb-8 text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            {t('home')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t(titleKey as any)}</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3 text-primary text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Ceylon Pharma College (PVT) LTD — Official Policies</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-8">
            {t(titleKey as any)}
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-body">
            {contentParagraphs.map((paragraph, index) => {
              const trimmed = paragraph.trim();

              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={index}
                    className="text-2xl font-bold mt-10 mb-4 text-foreground font-headline border-b border-border/40 pb-2"
                  >
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }

              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={index}
                    className="text-xl font-semibold mt-8 mb-3 text-foreground font-headline"
                  >
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              // Handle bullet list paragraphs (lines beginning with - or *)
              const lines = trimmed.split('\n');
              const isBulletList = lines.length > 0 && lines.every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));

              if (isBulletList) {
                return (
                  <ul key={index} className="list-disc pl-6 mb-6 space-y-2">
                    {lines.map((line, liIndex) => {
                      const itemText = line.trim().replace(/^[-*]\s+/, '');
                      return (
                        <li key={liIndex} className="leading-relaxed">
                          {formatFormattedText(itemText)}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              return (
                <p key={index} className="mb-6 leading-relaxed whitespace-pre-line">
                  {formatFormattedText(trimmed)}
                </p>
              );
            })}
          </div>

          {/* Official Contact & Privacy Inquiries Card */}
          <div className="mt-14 pt-8 border-t border-border">
            <div className="bg-card rounded-2xl border border-border/80 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/60">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline text-foreground">
                      {t('contactInfoTitle')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ceylon Pharma College (PVT) LTD — Official Communications & Privacy Desk
                    </p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-fit shadow-xs"
                >
                  <span>{t('contactTitle')}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1.5">
                      {t('contactHeadOffice')}
                    </h4>
                    <p className="text-muted-foreground flex items-start gap-2.5 leading-relaxed text-xs">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{t('contactHeadOfficeAddress')}</span>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1.5">
                      {t('contactOperationsBranch')}
                    </h4>
                    <p className="text-muted-foreground flex items-start gap-2.5 leading-relaxed text-xs">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{t('contactOperationsBranchAddress')}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1.5">
                      {t('footerEmail')}
                    </h4>
                    <p className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <a
                        href="mailto:info@pharmacollege.lk"
                        className="text-primary hover:underline font-medium text-xs"
                      >
                        info@pharmacollege.lk
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1.5">
                      {t('footerPhone')}
                    </h4>
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-2.5 text-xs">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        <a
                          href="tel:+94715884884"
                          className="hover:text-primary font-medium font-mono text-foreground"
                        >
                          +94 715 884 884 (0715 884 884)
                        </a>
                      </p>
                      <p className="flex items-center gap-2.5 text-xs pl-6.5 text-muted-foreground font-mono">
                        <a href="tel:+94117494335" className="hover:text-primary">
                          +94 11 74 94 335 (011 74 94 335)
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
