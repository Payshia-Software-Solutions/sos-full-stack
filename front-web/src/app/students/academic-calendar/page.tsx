
"use client";

import { useTranslation } from '@/context/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, Flag, FilePen, GraduationCap } from 'lucide-react';

const academicEvents = [
  {
    semester: 'semester1',
    months: [
      {
        month: 'August 2024',
        events: [
          { date: 'Aug 19', description: 'eventDesc_sem1_aug1', type: 'academic' },
          { date: 'Aug 26', description: 'eventDesc_sem1_aug2', type: 'academic' },
        ],
      },
      {
        month: 'September 2024',
        events: [
          { date: 'Sep 02', description: 'eventDesc_sem1_sep1', type: 'holiday' },
          { date: 'Sep 23-27', description: 'eventDesc_sem1_sep2', type: 'exam' },
        ],
      },
      {
        month: 'October 2024',
        events: [
          { date: 'Oct 17', description: 'eventDesc_sem1_oct1', type: 'holiday' },
          { date: 'Oct 28', description: 'eventDesc_sem1_oct2', type: 'academic' },
        ],
      },
      {
        month: 'November 2024',
        events: [
          { date: 'Nov 11-15', description: 'eventDesc_sem1_nov1', type: 'break' },
          { date: 'Nov 25-29', description: 'eventDesc_sem1_nov2', type: 'exam' },
        ],
      },
      {
        month: 'December 2024',
        events: [
          { date: 'Dec 13', description: 'eventDesc_sem1_dec1', type: 'academic' },
          { date: 'Dec 16 - Jan 3', description: 'eventDesc_sem1_dec2', type: 'break' },
        ],
      },
    ],
  },
  {
    semester: 'semester2',
    months: [
      {
        month: 'January 2025',
        events: [
          { date: 'Jan 06', description: 'eventDesc_sem2_jan1', type: 'academic' },
          { date: 'Jan 20', description: 'eventDesc_sem2_jan2', type: 'holiday' },
        ],
      },
      {
        month: 'February 2025',
        events: [
          { date: 'Feb 04', description: 'eventDesc_sem2_feb1', type: 'holiday' },
          { date: 'Feb 17-21', description: 'eventDesc_sem2_feb2', type: 'exam' },
        ],
      },
      {
        month: 'March 2025',
        events: [
          { date: 'Mar 10', description: 'eventDesc_sem2_mar1', type: 'deadline' },
          { date: 'Mar 24-28', description: 'eventDesc_sem2_mar2', type: 'break' },
        ],
      },
      {
        month: 'April 2025',
        events: [
          { date: 'Apr 14-18', description: 'eventDesc_sem2_apr1', type: 'holiday' },
          { date: 'Apr 28', description: 'eventDesc_sem2_apr2', type: 'academic' },
        ],
      },
      {
        month: 'May 2025',
        events: [
          { date: 'May 19-23', description: 'eventDesc_sem2_may1', type: 'exam' },
          { date: 'May 26', description: 'eventDesc_sem2_may2', type: 'academic' },
        ],
      },
    ],
  },
];

const eventTypeConfig = {
    academic: { icon: BookOpen, color: "bg-blue-500", label: "Academic" },
    exam: { icon: FilePen, color: "bg-red-500", label: "Exams" },
    holiday: { icon: Flag, color: "bg-green-500", label: "Holiday" },
    break: { icon: Calendar, color: "bg-yellow-500", label: "Break" },
    deadline: { icon: GraduationCap, color: "bg-purple-500", label: "Deadline" }
};

export default function AcademicCalendarPage() {
  const { t } = useTranslation();

  return (
    <main className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('academicCalendar')}</h1>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">
                {t('academicCalendarSubtitle')}
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4" />
        </div>

        <div className="space-y-12">
            {academicEvents.map((semester) => (
                <div key={semester.semester}>
                    <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-6">{t(semester.semester as any)}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {semester.months.map((monthData) => (
                            <Card key={monthData.month} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">{monthData.month}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    {monthData.events.map((event, index) => {
                                        const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                                        return (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full ${config.color} mt-1.5`}></div>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{event.date}</p>
                                                    <p className="text-sm text-muted-foreground">{t(event.description as any)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-16">
            <h3 className="text-xl font-headline font-bold text-center text-foreground mb-4">{t('calendarLegend')}</h3>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                 {Object.values(eventTypeConfig).map((config) => (
                    <div key={config.label} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                        <span className="text-sm text-muted-foreground">{t(config.label.toLowerCase() as any)}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}
