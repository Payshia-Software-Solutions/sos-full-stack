
"use client";

import InquiryForm from '@/components/inquiry-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

const contactInfo = {
  phone: ['011 74 94 335', '0715 884 884'],
  email: ['info@pharmacollege.lk'],
};

const locations = [
  {
    name: 'contactHeadOffice',
    address: 'contactHeadOfficeAddress',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=World+Trade+Center+Colombo',
  },
  {
    name: 'contactOperationsBranch',
    address: 'contactOperationsBranchAddress',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Pelmadulla',
  },
];

const ContactDetails = () => {
  const { t } = useTranslation();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('contactInfoTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 font-body">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-3 mb-3 text-primary">
            <Phone /> {t('contactInfoGetInTouch')}
          </h3>
          <div className="space-y-1 text-muted-foreground pl-9">
            {contactInfo.phone.map((phone) => (
              <p key={phone}><a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary">{phone}</a></p>
            ))}
            {contactInfo.email.map((email) => (
              <p key={email}><a href={`mailto:${email}`} className="hover:text-primary">{email}</a></p>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg flex items-center gap-3 mb-3 text-primary">
            <MapPin /> {t('contactInfoOurLocations')}
          </h3>
          <div className="space-y-6 pl-9">
            {locations.map((location) => (
              <div key={location.name}>
                <h4 className="font-semibold text-foreground">{t(location.name as any)}</h4>
                <p className="text-muted-foreground">{t(location.address as any)}</p>
                <a
                  href={location.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-semibold"
                >
                  {t('contactInfoViewMap')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <main className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('contactTitle')}</h1>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">
                {t('contactSubtitle')}
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                 <InquiryForm />
            </div>
            <div className="lg:col-span-2">
                <ContactDetails />
            </div>
        </div>
      </div>
    </main>
  );
}
