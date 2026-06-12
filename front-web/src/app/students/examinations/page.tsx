
"use client";

import { useTranslation } from '@/context/language-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, AlertCircle, Info, CheckCircle } from 'lucide-react';

const examTimetables: any[] = [
];

const pastPapers: any[] = [
];

const examRules = [
    'examRule1', 'examRule2', 'examRule3', 'examRule4', 'examRule5',
];

export default function ExaminationsPage() {
  const { t } = useTranslation();

  return (
    <main className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('examinations')}</h1>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">
                {t('examinationsSubtitle')}
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary"/>
                  <CardTitle className="font-headline text-2xl">{t('examTimetables')}</CardTitle>
                </div>
                <CardDescription>{t('examTimetablesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {examTimetables.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('examCourse')}</TableHead>
                        <TableHead>{t('examDate')}</TableHead>
                        <TableHead>{t('examTime')}</TableHead>
                        <TableHead className="text-right">{t('examDownload')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examTimetables.map((exam, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{t(exam.courseKey as any)}</TableCell>
                          <TableCell>{exam.date}</TableCell>
                          <TableCell>{exam.time}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={exam.file}><Download className="h-4 w-4"/></a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No exam timetables are available at the moment. Please check back later.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                 <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary"/>
                  <CardTitle className="font-headline text-2xl">{t('pastPapers')}</CardTitle>
                </div>
                <CardDescription>{t('pastPapersDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {pastPapers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastPapers.map((paper, index) => (
                    <a href={paper.file} key={index} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-semibold">{t(paper.courseKey as any)}</p>
                        <p className="text-sm text-muted-foreground">{t('examYear', { year: paper.year })}</p>
                      </div>
                      <Download className="h-5 w-5 text-muted-foreground"/>
                    </a>
                  ))}
                  </div>
                ) : (
                   <div className="text-center py-10 text-muted-foreground">
                    <p>No past papers are available at the moment. Please check back later.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-primary"/>
                  <CardTitle className="font-headline text-2xl">{t('examRules')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>{t('examRulesTrigger')}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3 pl-2">
                        {examRules.map((rule, index) => (
                           <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground text-sm">{t(rule as any)}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
               <CardHeader>
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-primary"/>
                  <CardTitle className="font-headline text-2xl">{t('resultsGrading')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{t('resultsInfo1')}</p>
                <p>{t('resultsInfo2')}</p>
                <Button className="w-full mt-2" asChild>
                  <a href="#!">{t('resultsButton')}</a>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

    