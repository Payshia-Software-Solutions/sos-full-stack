
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";

import { submitInquiry } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/language-context";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? t('inquiryFormSubmitting') : t('inquiryFormSubmitButton')}
    </Button>
  );
}

export default function InquiryForm() {
  const [state, formAction] = useActionState(submitInquiry, { message: "", errors: null });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Success!",
        description: state.message,
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <div id="inquire">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t('inquiryFormTitle')}</CardTitle>
          <CardDescription className="font-body">{t('inquiryFormSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div>
              <Input name="name" placeholder={t('inquiryFormNamePlaceholder')} required aria-label={t('inquiryFormNamePlaceholder')}/>
              {state.errors?.name && <p className="text-sm font-medium text-destructive pt-1">{state.errors.name[0]}</p>}
            </div>
            <div>
              <Input name="email" type="email" placeholder={t('inquiryFormEmailPlaceholder')} required aria-label={t('inquiryFormEmailPlaceholder')} />
              {state.errors?.email && <p className="text-sm font-medium text-destructive pt-1">{state.errors.email[0]}</p>}
            </div>
            <div>
              <Input name="subject" placeholder={t('inquiryFormSubjectPlaceholder')} required aria-label={t('inquiryFormSubjectPlaceholder')}/>
              {state.errors?.subject && <p className="text-sm font-medium text-destructive pt-1">{state.errors.subject[0]}</p>}
            </div>
            <div>
              <Textarea name="message" placeholder={t('inquiryFormMessagePlaceholder')} required aria-label={t('inquiryFormMessagePlaceholder')}/>
              {state.errors?.message && <p className="text-sm font-medium text-destructive pt-1">{state.errors.message[0]}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
