"use client";

import { useTranslation } from '@/context/language-context';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PolicyPageProps {
  titleKey: string;
  contentKey: string;
}

export default function PolicyPageTemplate({ titleKey, contentKey }: PolicyPageProps) {
  const { t } = useTranslation();

  // The content from translation might have multiple paragraphs separated by newlines
  const contentParagraphs = t(contentKey as any).split('\n\n');

  return (
    <main className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 text-sm font-body mb-8 text-muted-foreground">
            <Link href="/" className="hover:text-primary">{t('home')}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{t(titleKey as any)}</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-8">
            {t(titleKey as any)}
          </h1>
          <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-body">
            {contentParagraphs.map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-10 mb-4 text-foreground font-headline">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-8 mb-3 text-foreground font-headline">{paragraph.replace('### ', '')}</h3>;
              }
              const formattedParagraph = paragraph.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part);
              return <p key={index} className="mb-6 leading-relaxed">{formattedParagraph}</p>;
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
