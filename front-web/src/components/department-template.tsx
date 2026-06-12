
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { useTranslation } from "@/context/language-context";

interface DepartmentData {
    nameKey: string;
    descriptionKey: string;
    image: string;
    contact: {
        phone: string;
        email: string;
    };
    faculty: {
        name: string;
        titleKey: string;
        image: string;
        hint: string;
    }[];
    programs: {
        nameKey: string;
        descriptionKey: string;
        slug: string;
    }[];
}

export default function DepartmentPage({ departmentData }: { departmentData: DepartmentData }) {
  const { t } = useTranslation();
  const department = departmentData;

  return (
    <div>
      <section className="relative py-24 md:py-32 bg-primary/10">
         <div className="absolute inset-0 overflow-hidden">
            <Image 
                src={department.image} 
                alt={t(department.nameKey as any)} 
                fill 
                className="object-cover" 
                data-ai-hint="department background"
            />
            <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative">
            <div className="flex items-center gap-2 text-sm font-body mb-4 text-white">
                <Link href="/" className="hover:underline">{t('home')}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="opacity-80">{t(department.nameKey as any)}</span>
            </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">
            {t(department.nameKey as any)}
          </h1>
        </div>
      </section>
      
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <main className="lg:col-span-2 space-y-16">
                    {/* About Section */}
                    <div>
                        <h2 className="text-3xl font-headline font-bold text-foreground">{t('deptPageAbout')}</h2>
                        <div className="w-20 h-1 bg-primary mt-2 mb-4" />
                        <p className="text-muted-foreground font-body leading-relaxed">{t(department.descriptionKey as any)}</p>
                    </div>

                    {/* Programs Section */}
                    <div>
                        <h2 className="text-3xl font-headline font-bold text-foreground">{t('deptPagePrograms')}</h2>
                        <div className="w-20 h-1 bg-primary mt-2 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {department.programs.map((program, index) => (
                                <Link href={program.slug.startsWith('#') ? '#' : `/courses/${program.slug}`} key={index} className={`block group h-full ${program.slug.startsWith('#') ? 'cursor-default' : ''}`}>
                                  <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                                      <CardHeader>
                                          <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{t(program.nameKey as any)}</CardTitle>
                                          {program.descriptionKey && (
                                            <CardDescription className="text-sm">{t(program.descriptionKey as any)}</CardDescription>
                                          )}
                                      </CardHeader>
                                      <CardContent className="mt-auto flex justify-end">
                                        {!program.slug.startsWith('#') && (
                                          <div className="text-sm text-primary font-semibold flex items-center gap-1">
                                              {t('deptPageViewProgram')}
                                              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                          </div>
                                        )}
                                      </CardContent>
                                  </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                </main>
                <aside className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">{t('deptPageContact')}</CardTitle>
                                <CardDescription>{t('deptPageContactDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Phone className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-foreground">{t('footerPhone')}</h4>
                                        <a href={`tel:${department.contact.phone.replace(/\s/g, '')}`} className="text-muted-foreground hover:text-primary">{department.contact.phone}</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-foreground">{t('footerEmail')}</h4>
                                        <a href={`mailto:${department.contact.email}`} className="text-muted-foreground hover:text-primary">{department.contact.email}</a>
                                    </div>
                                </div>
                                <Button asChild className="w-full mt-4">
                                    <Link href="/contact">{t('contactUs')}</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
            </div>
        </div>
      </section>
    </div>
  );
}
