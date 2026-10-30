"use client";

import { LMS_API_URL } from "@/lib/config";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentFullInfo } from '@/lib/actions/users';
import { getConvocationCeremonies, getPackagesByCeremony, createConvocationRegistration, getConvocationSessionCounts, getCertificateOrdersByStudent, getConvocationRegistrationsByStudent } from '@/lib/actions/certificates';
import type { FullStudentData, StudentEnrollment, ConvocationCeremony, ConvocationPackage, SessionCount, CertificateOrder, ConvocationRegistration } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, CheckCircle, Award, Loader2, Home, Truck, Copy, AlertCircle, AlertTriangle, XCircle, ChevronDown, ListOrdered, PlusCircle, FileText, Sparkles, ScrollText, Check, Paperclip, User, Users, Star, Video, Coffee, GraduationCap, Calendar } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PARENT_SEAT_RATE = 750; 

type OrderStep = 'loading' | 'ceremony_selection' | 'course_selection' | 'form' | 'confirmation' | 'success' | 'error';

interface City {
    id: string;
    district_id: string;
    name_en: string;
}
interface District {
    id: string;
    name_en: string;
}

const getCityName = async (cityId: string): Promise<City> => {
    if (!cityId) return { id: '', district_id: '', name_en: 'N/A' };
    const baseUrl = LMS_API_URL;
    const response = await fetch(`${baseUrl}/cities/${cityId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch city data');
    }
    return response.json();
}

const getDistrictName = async (districtId: string): Promise<District> => {
    if (!districtId) return { id: '', name_en: 'N/A' };
    const baseUrl = LMS_API_URL;
    const response = await fetch(`${baseUrl}/districts/${districtId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch district data');
    }
    return response.json();
}

export default function CreateConvocationBookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<OrderStep>('loading');
  const [selectedCeremonyId, setSelectedCeremonyId] = useState<string>('');
  const [selectedEnrollments, setSelectedEnrollments] = useState<StudentEnrollment[]>([]);
  const [deselectedEligible, setDeselectedEligible] = useState<StudentEnrollment[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  const [errorDetails, setErrorDetails] = useState<{ message: string; enrollments?: StudentEnrollment[] } | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  // Form State
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<'1' | '2'>('1');
  const [additionalSeats, setAdditionalSeats] = useState('0');
  const [refreshmentTokens, setRefreshmentTokens] = useState('0');
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [nameOnCertificate, setNameOnCertificate] = useState('');
  const [phone, setPhone] = useState('');

  // --- Data Fetching ---
  const { data: studentData, isLoading: isLoadingStudent, isError: isStudentError, error: studentError } = useQuery<FullStudentData>({
    queryKey: ['studentFullInfoForConvocation', user?.username],
    queryFn: () => getStudentFullInfo(user!.username!),
    enabled: !!user?.username,
    retry: 1,
  });

  const { data: allCeremonies, isLoading: isLoadingCeremonies, isError: isCeremonyError, error: ceremonyError } = useQuery<ConvocationCeremony[]>({
      queryKey: ['allConvocationCeremonies'],
      queryFn: getConvocationCeremonies,
  });

  const activeCeremonies = useMemo(() => {
    return allCeremonies?.filter(c => String(c.accept_booking) === '1') || [];
  }, [allCeremonies]);
  
  const { data: packages, isLoading: isLoadingPackages } = useQuery<ConvocationPackage[]>({
      queryKey: ['convocationPackages', selectedCeremonyId],
      queryFn: () => getPackagesByCeremony(selectedCeremonyId),
      enabled: !!selectedCeremonyId,
  });

  const { data: sessionCounts, isLoading: isLoadingCounts } = useQuery<SessionCount[]>({
      queryKey: ['convocationSessionCounts', selectedCeremonyId],
      queryFn: () => getConvocationSessionCounts(selectedCeremonyId),
      enabled: !!selectedCeremonyId,
  });

  const { data: certificateOrders, isLoading: isLoadingOrders } = useQuery<CertificateOrder[]>({
      queryKey: ['studentCertificateOrders', user?.username],
      queryFn: () => getCertificateOrdersByStudent(user!.username!),
      staleTime: 5 * 60 * 1000,
  });
  
  const { data: convocationBookings, isLoading: isLoadingBookings } = useQuery<ConvocationRegistration[]>({
    queryKey: ['studentConvocationBookingsForCertOrder', user?.username],
    queryFn: () => getConvocationRegistrationsByStudent(user!.username!),
    enabled: !!user?.username,
  });

  const allEnrollments = useMemo(() => {
    if (!studentData) return [];
    return Object.values(studentData.studentEnrollments);
  }, [studentData]);
  
  const activeBookedCourseIds = useMemo(() => {
    if (!convocationBookings) return new Set<string>();
    const ids = new Set<string>();
    convocationBookings
      .filter(booking => booking.registration_status !== 'Rejected' && booking.registration_status !== 'Canceled')
      .forEach(booking => {
        booking.course_id.split(',').forEach(id => {
          if (id.trim()) ids.add(id.trim());
        });
      });
    return ids;
  }, [convocationBookings]);
  
  const activeOrderedCourseIds = useMemo(() => {
    if (!certificateOrders) return new Set<string>();
    const ids = new Set<string>();
    certificateOrders
      .filter(order => order.certificate_status === 'Pending' || order.certificate_status === 'Printed')
      .forEach(order => {
        order.course_code.split(',').forEach(id => {
          if (id.trim()) ids.add(id.trim());
        });
      });
    return ids;
  }, [certificateOrders]);

  const resetAllState = () => {
    setStep('loading');
    setSelectedCeremonyId('');
    setSelectedEnrollments([]);
    setDeselectedEligible([]);
    setErrorDetails(null);
    setReferenceNumber(null);
  };

  useEffect(() => {
    resetAllState();
    const isLoading = isLoadingStudent || isLoadingCeremonies || isLoadingOrders || isLoadingBookings;
    if (isLoading) {
      setStep('loading');
      return;
    }
    const anyError = isStudentError || isCeremonyError;
    if (anyError) {
      setErrorDetails({ message: (studentError?.message || ceremonyError?.message) ?? 'Failed to load initial data.' });
      setStep('error');
      return;
    }

    if (studentData) {
      if (allEnrollments.length === 0) {
        setErrorDetails({ message: "You have no course enrollments." });
        setStep('error');
        return;
      }
      
      const eligibleEnrollments = allEnrollments.filter(e => e.certificate_eligibility);
      
      if (eligibleEnrollments.length === 0) {
        setErrorDetails({ 
            message: "You do not have any courses eligible for a convocation booking at this time.",
            enrollments: allEnrollments
        });
        setStep('error');
        return;
      }
      
      const availableForBooking = eligibleEnrollments.filter(e => 
        !activeBookedCourseIds.has(String(e.parent_course_id)) &&
        !activeBookedCourseIds.has(String(e.course_code)) &&
        !activeOrderedCourseIds.has(String(e.parent_course_id)) &&
        !activeOrderedCourseIds.has(String(e.course_code))
      );

      if (availableForBooking.length === 0) {
        setErrorDetails({
            message: "All your eligible courses have already been booked for convocation or have a pending certificate order. There are no new courses available to book at this time.",
            enrollments: allEnrollments
        });
        setStep('error');
        return;
      }

      if (!allCeremonies || activeCeremonies.length === 0) {
        setErrorDetails({ message: 'There are no active convocation ceremonies at the moment. Please check back later.' });
        setStep('error');
        return;
      }

      setNameOnCertificate(studentData.studentInfo.name_on_certificate || studentData.studentInfo.full_name);
      setPhone(studentData.studentInfo.telephone_1);
      
      setStep('ceremony_selection');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingStudent, isLoadingCeremonies, isLoadingOrders, isLoadingBookings, isStudentError, isCeremonyError, studentData, allEnrollments, activeBookedCourseIds, activeOrderedCourseIds]);

  const createBookingMutation = useMutation({
      mutationFn: (payload: FormData) => createConvocationRegistration(payload),
      onSuccess: (data) => {
          setReferenceNumber(data.reference_number || data.id);
          setStep('success');
          toast({ title: 'Booking Submitted!', description: 'Your convocation registration has been received.' });
      },
      onError: (err: Error) => {
          setErrorDetails({ message: err.message || 'An unknown error occurred.' });
          setStep('error');
      }
  });
  
  const selectedCeremony = useMemo(() => {
    return allCeremonies?.find(c => c.id === selectedCeremonyId);
  }, [allCeremonies, selectedCeremonyId]);

  const maxSessions = useMemo(() => {
    if (!selectedCeremony?.session_count) return 1;
    const count = parseInt(selectedCeremony.session_count, 10);
    return isNaN(count) || count < 1 ? 1 : count;
  }, [selectedCeremony]);

  const ceremonyParentSeatRate = useMemo(() => {
    if (!selectedCeremony?.parent_seat_price) return 750;
    const rate = parseFloat(selectedCeremony.parent_seat_price);
    return isNaN(rate) ? 750 : rate;
  }, [selectedCeremony]);

  const ceremonyRefreshTokenRate = useMemo(() => {
    if (!selectedCeremony?.refreshment_token_price) return 0;
    const rate = parseFloat(selectedCeremony.refreshment_token_price);
    return isNaN(rate) ? 0 : rate;
  }, [selectedCeremony]);

  const seatsAvailable = useMemo(() => {
    if (!selectedCeremony || !sessionCounts) {
      return { session1: undefined, session2: undefined };
    }
    const totalSeatsS1 = parseInt(selectedCeremony.student_seats, 10);
    const totalSeatsS2 = parseInt(selectedCeremony.session_2, 10);

    const registeredS1 = parseInt(sessionCounts.find(s => s.session === '1')?.sessionCounts || '0', 10);
    const registeredS2 = parseInt(sessionCounts.find(s => s.session === '2')?.sessionCounts || '0', 10);
    
    return {
      session1: totalSeatsS1 - registeredS1,
      session2: totalSeatsS2 - registeredS2,
    };
  }, [selectedCeremony, sessionCounts]);

  // Prevent selection of full session or unavailable session
  useEffect(() => {
    if (maxSessions === 1) {
      if (selectedSession !== '1') {
        setSelectedSession('1');
      }
      return;
    }

    if (seatsAvailable.session1 !== undefined && seatsAvailable.session2 !== undefined) {
        if (selectedSession === '1' && seatsAvailable.session1 <= 0) {
            if (seatsAvailable.session2 > 0) {
                setSelectedSession('2');
            }
        } else if (selectedSession === '2' && seatsAvailable.session2 <= 0) {
            if (seatsAvailable.session1 > 0) {
                setSelectedSession('1');
            }
        }
    }
  }, [maxSessions, seatsAvailable, selectedSession]);

  const handleCeremonySelection = () => {
    if (!selectedCeremonyId) {
        toast({ variant: 'destructive', title: 'No Ceremony Selected', description: 'Please select a ceremony to continue.' });
        return;
    }
    const availableForBooking = allEnrollments.filter(e => 
        e.certificate_eligibility && 
        !activeBookedCourseIds.has(String(e.parent_course_id)) &&
        !activeBookedCourseIds.has(String(e.course_code)) &&
        !activeOrderedCourseIds.has(String(e.parent_course_id)) &&
        !activeOrderedCourseIds.has(String(e.course_code))
    );
    setSelectedEnrollments(availableForBooking);
    setDeselectedEligible([]);
    setStep('course_selection');
  }

  const handleCourseSelectionSubmit = () => {
    if (selectedEnrollments.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Courses Selected',
        description: 'Please select at least one eligible course to proceed.',
      });
      return;
    }

    if (deselectedEligible.length > 0) {
        setIsConfirmDialogOpen(true);
    } else {
        setStep('form');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedEnrollments.length === 0) {
          toast({ variant: 'destructive', title: 'No Courses Selected' }); return;
      }
      if (!selectedPackageId) {
          toast({ variant: 'destructive', title: 'No Package Selected' }); return;
      }
      if (!paymentSlip) {
           toast({ variant: 'destructive', title: 'Payment Slip Required' }); return;
      }
      if (!nameOnCertificate || !phone) {
           toast({ variant: 'destructive', title: 'Missing Details' }); return;
      }
      setStep('confirmation');
  };

  const handleConfirmAndSubmit = () => {
    if (createBookingMutation.isPending) return;
    if (!studentData?.studentInfo?.username || !selectedCeremonyId || !selectedPackageId || !paymentSlip || selectedEnrollments.length === 0) {
      setErrorDetails({ message: "Missing required information to submit the order." });
      setStep('error');
      return;
    }
    
    const formData = new FormData();
    formData.append('student_number', studentData.studentInfo.username);
    formData.append('course_id', selectedEnrollments.map(e => e.parent_course_id).join(','));
    formData.append('package_id', selectedPackageId);
    formData.append('convocation_id', selectedCeremonyId);
    formData.append('payment_amount', String(totalPrice));
    formData.append('additional_seats', additionalSeats);
    formData.append('refreshment_tokens', refreshmentTokens);
    formData.append('session', maxSessions === 1 ? '1' : selectedSession);
    formData.append('image', paymentSlip);
    formData.append('name_on_certificate', nameOnCertificate);
    formData.append('telephone_1', phone);
      
    createBookingMutation.mutate(formData);
  };
  
  const copyToClipboard = async () => {
    if (!referenceNumber) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referenceNumber);
        toast({ title: 'Copied!', description: 'Reference number copied to clipboard.' });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = referenceNumber;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) {
          toast({ title: 'Copied!', description: 'Reference number copied to clipboard.' });
        } else {
          toast({ variant: 'destructive', title: 'Copy failed', description: 'Please copy the reference number manually.' });
        }
      }
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Please copy the reference number manually.' });
    }
  };

  const handleCheckboxChange = (checked: boolean, enrollment: StudentEnrollment) => {
      setSelectedEnrollments(prev => 
          checked ? [...prev, enrollment] : prev.filter(e => e.id !== enrollment.id)
      );

      if(enrollment.certificate_eligibility) {
          setDeselectedEligible(prev => 
              !checked ? [...prev, enrollment] : prev.filter(e => e.id !== enrollment.id)
          );
      }
  };
  
  const filteredPackages = useMemo(() => {
    if (!packages || selectedEnrollments.length === 0) {
        return [];
    }

    const selectedCourseIds = new Set(
        selectedEnrollments.flatMap(e => [
            String(e.parent_course_id ?? '').trim(),
            String(e.id ?? '').trim(),
            String(e.course_code ?? '').trim(),
        ]).filter(Boolean)
    );

    return packages.filter(pkg => {
        const courseListStr = pkg.course_list || pkg.courses || '';
        if (!courseListStr || courseListStr.trim() === '') {
            return true;
        }
        const packageCourseIds = courseListStr.split(',').map((id: string) => id.trim()).filter(Boolean);
        if (packageCourseIds.length === 0) {
            return true;
        }
        return packageCourseIds.some((id: string) => selectedCourseIds.has(String(id)));
    });
  }, [packages, selectedEnrollments]);

  const selectedPackage = useMemo(() => {
      return packages?.find(p => String(p.package_id) === String(selectedPackageId));
  }, [packages, selectedPackageId]);

  const totalPrice = useMemo(() => {
    const packagePrice = selectedPackage ? parseFloat(selectedPackage.price) : 0;
    const numAdditionalSeats = parseInt(additionalSeats, 10);
    const numTokens = parseInt(refreshmentTokens, 10);
    const safePackagePrice = isNaN(packagePrice) ? 0 : packagePrice;
    const safeSeatPrice = isNaN(numAdditionalSeats) ? 0 : numAdditionalSeats * ceremonyParentSeatRate;
    const safeTokenPrice = isNaN(numTokens) ? 0 : numTokens * ceremonyRefreshTokenRate;
    return safePackagePrice + safeSeatPrice + safeTokenPrice;
  }, [selectedPackage, additionalSeats, refreshmentTokens, ceremonyParentSeatRate, ceremonyRefreshTokenRate]);

  const stepsList = [
    { id: 'ceremony_selection', label: 'Ceremony', num: 1 },
    { id: 'course_selection', label: 'Courses', num: 2 },
    { id: 'form', label: 'Details', num: 3 },
    { id: 'confirmation', label: 'Confirm', num: 4 },
  ];

  const getStepIndex = (curStep: OrderStep) => {
    switch (curStep) {
      case 'ceremony_selection': return 0;
      case 'course_selection': return 1;
      case 'form': return 2;
      case 'confirmation': return 3;
      case 'success': return 4;
      default: return 0;
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'loading':
        return (
          <CardContent className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading your data...</p>
          </CardContent>
        );
      
      case 'ceremony_selection':
        return (
          <>
            <CardHeader className="pb-4 border-b">
               <Button variant="ghost" onClick={() => router.push('/dashboard/convocation-booking')} className="w-fit h-auto p-0 mb-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
              </Button>
              <CardTitle className="text-2xl">Step 1: Choose a Ceremony</CardTitle>
              <CardDescription>Select the convocation event you wish to register for.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup value={selectedCeremonyId} onValueChange={setSelectedCeremonyId} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCeremonies.map(ceremony => {
                      const isSelected = selectedCeremonyId === ceremony.id;
                      const sessionNum = parseInt(ceremony.session_count || '1', 10);
                      const parentRate = ceremony.parent_seat_price ? parseFloat(ceremony.parent_seat_price) : 750;
                      return (
                          <Label 
                              key={ceremony.id} 
                              htmlFor={ceremony.id} 
                              className={cn(
                                  "relative flex flex-col justify-between border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md bg-card",
                                  isSelected 
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md" 
                                      : "border-border hover:border-primary/40"
                              )}
                          >
                              <RadioGroupItem value={ceremony.id} id={ceremony.id} className="sr-only" />
                              <div className="space-y-4">
                                  <div className="flex items-start justify-between gap-2">
                                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                          <GraduationCap className="w-7 h-7" />
                                      </div>
                                      <Badge variant={isSelected ? "default" : "outline"} className={cn("text-xs font-semibold", isSelected && "bg-primary")}>
                                          {isSelected ? "Selected" : "Open for Booking"}
                                      </Badge>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-lg leading-snug text-foreground">{ceremony.convocation_name}</h4>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-2">
                                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                                          {format(new Date(ceremony.held_on), 'PPPP')}
                                      </p>
                                  </div>
                              </div>

                              <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                                      {sessionNum} {sessionNum === 1 ? 'Session' : 'Sessions'}
                                  </span>
                                  <span>
                                      Guest Seat: <strong className="text-foreground font-semibold">LKR {parentRate.toLocaleString()}</strong>
                                  </span>
                              </div>
                          </Label>
                      );
                  })}
              </RadioGroup>
            </CardContent>
            <CardFooter className="pt-4 border-t flex justify-end">
                <Button size="lg" onClick={handleCeremonySelection} disabled={!selectedCeremonyId} className="w-full sm:w-auto font-semibold">
                    Next: Select Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
          </>
        );

      case 'course_selection':
        return (
          <>
            <CardHeader className="pb-4 border-b">
              <Button variant="ghost" onClick={() => setStep('ceremony_selection')} className="w-fit h-auto p-0 mb-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Ceremony Selection
              </Button>
              <CardTitle className="text-2xl">Step 2: Select Your Course(s)</CardTitle>
              <CardDescription>Review course eligibility and select the certificates to include in your booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {deselectedEligible.length > 0 && (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            You have deselected {deselectedEligible.length} course(s) for which you are eligible. Please ensure this is intentional before proceeding.
                        </AlertDescription>
                    </Alert>
                )}
                {allEnrollments.map(enrollment => {
                    const isEligible = enrollment.certificate_eligibility;
                    const hasActiveOrder = activeOrderedCourseIds.has(enrollment.parent_course_id) || activeOrderedCourseIds.has(enrollment.course_code);
                    const isBookedForConvocation = activeBookedCourseIds.has(enrollment.parent_course_id);
                    const isDisabled = !isEligible || hasActiveOrder || isBookedForConvocation;

                    return (
                        <Collapsible key={enrollment.id} className="p-4 border rounded-xl has-[:disabled]:bg-muted/50 has-[:disabled]:opacity-60 transition-all bg-card">
                            <div className="flex items-center space-x-3">
                                <Checkbox 
                                    id={enrollment.id} 
                                    checked={selectedEnrollments.some(e => e.id === enrollment.id)}
                                    disabled={isDisabled}
                                    onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked), enrollment)}
                                />
                                 <div className="flex-1">
                                    <Label htmlFor={enrollment.id} className={cn("font-medium leading-none", isDisabled ? "cursor-not-allowed" : "peer-disabled:cursor-not-allowed")}>
                                        {enrollment.parent_course_name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">{enrollment.course_code}</p>
                                </div>
                                {isBookedForConvocation ? (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">Booked</Badge>
                                ) : hasActiveOrder ? (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Ordered</Badge>
                                ) : (
                                    <Badge variant={isEligible ? 'default' : 'destructive'} className={cn("shrink-0", isEligible ? 'bg-green-600' : '')}>
                                        {isEligible ? "Eligible" : "Not Eligible"}
                                    </Badge>
                                )}
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                        <ChevronDown className="h-4 w-4" />
                                        <span className="sr-only">Toggle details</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="space-y-2 mt-4 pt-4 border-t">
                               <h4 className="text-sm font-semibold mb-2">Eligibility Criteria</h4>
                               <ul className="space-y-2 text-sm">
                                    {enrollment.criteria_details.map(criterion => (
                                        <li key={criterion.id} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                {criterion.evaluation.completed ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                                )}
                                                <span className="text-muted-foreground">{criterion.list_name}</span>
                                            </div>
                                            <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                                                {criterion.evaluation.currentValue} / {criterion.evaluation.requiredValue}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CollapsibleContent>
                        </Collapsible>
                    )
                })}
            </CardContent>
            <CardFooter className="pt-4 border-t flex justify-end">
              <Button size="lg" onClick={handleCourseSelectionSubmit} disabled={selectedEnrollments.length === 0} className="w-full sm:w-auto font-semibold">
                Next: Choose Package <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
      
      case 'form':
        return (
          <form onSubmit={handleFormSubmit}>
              <CardHeader className="pb-4 border-b">
                <Button variant="ghost" onClick={() => setStep('course_selection')} className="w-fit h-auto p-0 mb-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Selection
                </Button>
                <CardTitle className="text-2xl">Step 3: Complete Your Booking</CardTitle>
                <CardDescription>Choose a package, configure your session and add-ons, and provide your payment details.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Packages & Session / Guest Options */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                       {/* Package Selection */}
                       <div className="space-y-4">
                          <div>
                              <Label className="text-lg font-bold">1. Choose Your Package</Label>
                              <p className="text-xs text-muted-foreground">Select the package that best fits your graduation celebration.</p>
                          </div>
                          {isLoadingPackages ? <Skeleton className="h-40 w-full" /> : (
                               <>
                                    {filteredPackages.length > 0 ? (
                                      <RadioGroup value={selectedPackageId} onValueChange={setSelectedPackageId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {filteredPackages.map(pkg => (
                                              <Label 
                                                  key={String(pkg.package_id)} 
                                                  htmlFor={String(pkg.package_id)} 
                                                  className={cn(
                                                      "relative block border-2 rounded-xl p-5 cursor-pointer transition-all overflow-hidden bg-card hover:shadow-md",
                                                      selectedPackageId === String(pkg.package_id) 
                                                          ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md" 
                                                          : "border-border hover:border-primary/40"
                                                  )}
                                              >
                                                  <RadioGroupItem value={String(pkg.package_id)} id={String(pkg.package_id)} className="sr-only" />
                                                  {pkg.cover_image && (
                                                      <div className="relative aspect-video -mt-5 -mx-5 mb-4 border-b">
                                                          <Image
                                                              src={`https://content-provider.pharmacollege.lk//content-provider/uploads/package-images/${pkg.cover_image}`}
                                                              alt={pkg.package_name}
                                                              layout="fill"
                                                              objectFit="contain"
                                                              className="bg-muted/40"
                                                          />
                                                      </div>
                                                  )}
                                                  <div className="flex justify-between items-start gap-2">
                                                      <h4 className="font-bold text-base">{pkg.package_name}</h4>
                                                      <span className="font-bold text-primary shrink-0 text-base">LKR {parseFloat(pkg.price).toLocaleString()}</span>
                                                  </div>
                                                  {pkg.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pkg.description}</p>}
                                                  
                                                  <div className="mt-4 pt-3 border-t space-y-2 text-xs">
                                                      <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">What's Included:</h5>
                                                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1.5 text-muted-foreground">
                                                          {String(pkg.student_seat) === '1' && <li className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary shrink-0"/> Student Seat</li>}
                                                          {parseInt(String(pkg.parent_seat_count || '0'), 10) > 0 && <li className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary shrink-0"/> {pkg.parent_seat_count} Parent Seat(s)</li>}
                                                          {parseInt(String(pkg.vip_seat || '0'), 10) > 0 && <li className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-primary shrink-0"/> {pkg.vip_seat} VIP Seat(s)</li>}
                                                          {String(pkg.graduation_cloth) === '1' && <li className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-primary shrink-0"/> Cloak</li>}
                                                          {String(pkg.garland) === '1' && <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary shrink-0"/> Garland</li>}
                                                          {String(pkg.scroll) === '1' && <li className="flex items-center gap-1.5"><ScrollText className="w-3.5 h-3.5 text-primary shrink-0"/> Scroll</li>}
                                                          {String(pkg.certificate_file) === '1' && <li className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary shrink-0"/> Certificate File</li>}
                                                          {String(pkg.photo_package) === '1' && <li className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-primary shrink-0"/> Hat</li>}
                                                          {String(pkg.video_360) === '1' && <li className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-primary shrink-0"/> 360 Video</li>}
                                                          {String(pkg.refreshments) === '1' && <li className="flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 text-primary shrink-0"/> Refreshments</li>}
                                                      </ul>
                                                  </div>
                                              </Label>
                                          ))}
                                      </RadioGroup>
                                    ) : (
                                      <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>No Packages Available</AlertTitle>
                                        <AlertDescription>
                                          There are no convocation packages available for the course(s) you selected. Please contact support for assistance.
                                        </AlertDescription>
                                      </Alert>
                                    )}
                               </>
                          )}
                       </div>
                       
                       {selectedPackageId && (
                          <div className="space-y-6 pt-6 border-t animate-in fade-in-50">
                             <div>
                                 <Label className="text-lg font-bold">2. Session & Guest Add-ons</Label>
                                 <p className="text-xs text-muted-foreground">Configure your attendance session and additional seats or tokens.</p>
                             </div>

                             <div className="space-y-6 bg-muted/20 p-5 sm:p-6 rounded-xl border border-border/60">
                                {/* Session Selector */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Select Your Session</Label>
                                    {isLoadingCounts ? (
                                        <div className="flex gap-4"><Skeleton className="h-12 flex-1" /></div>
                                    ) : maxSessions === 1 ? (
                                        <div className="flex">
                                            <div className="flex flex-col gap-1 border-2 border-primary rounded-lg p-3.5 bg-primary/5 flex-1 justify-center text-center">
                                                <span className="font-bold text-sm">Session 1</span>
                                                {seatsAvailable.session1 !== undefined && (
                                                    <span className={cn("text-xs font-bold", seatsAvailable.session1 > 0 ? "text-green-600" : "text-destructive")}>
                                                        {seatsAvailable.session1 > 0 ? `${seatsAvailable.session1} seats left` : "Full"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <RadioGroup value={selectedSession} onValueChange={(v) => setSelectedSession(v as '1' | '2')} className="grid grid-cols-2 gap-4">
                                            <Label 
                                                htmlFor="session1" 
                                                className={cn(
                                                    "flex flex-col gap-1 border rounded-lg p-3.5 transition-all justify-center text-center bg-card",
                                                    seatsAvailable.session1 !== undefined && seatsAvailable.session1 <= 0 ? "opacity-50 cursor-not-allowed bg-muted" : "cursor-pointer hover:bg-accent has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:checked]:border-primary"
                                                )}
                                            >
                                                <RadioGroupItem value="1" id="session1" className="sr-only" disabled={seatsAvailable.session1 !== undefined && seatsAvailable.session1 <= 0} />
                                                <span className="font-semibold text-sm">Session 1</span>
                                                {seatsAvailable.session1 !== undefined && (
                                                    <span className={cn("text-xs font-bold", seatsAvailable.session1 > 0 ? "text-green-600" : "text-destructive")}>
                                                        {seatsAvailable.session1 > 0 ? `${seatsAvailable.session1} seats left` : "Full"}
                                                    </span>
                                                )}
                                            </Label>
                                            <Label 
                                                htmlFor="session2" 
                                                className={cn(
                                                    "flex flex-col gap-1 border rounded-lg p-3.5 transition-all justify-center text-center bg-card",
                                                    seatsAvailable.session2 !== undefined && seatsAvailable.session2 <= 0 ? "opacity-50 cursor-not-allowed bg-muted" : "cursor-pointer hover:bg-accent has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:checked]:border-primary"
                                                )}
                                            >
                                                <RadioGroupItem value="2" id="session2" className="sr-only" disabled={seatsAvailable.session2 !== undefined && seatsAvailable.session2 <= 0} />
                                                <span className="font-semibold text-sm">Session 2</span>
                                                {seatsAvailable.session2 !== undefined && (
                                                    <span className={cn("text-xs font-bold", seatsAvailable.session2 > 0 ? "text-green-600" : "text-destructive")}>
                                                        {seatsAvailable.session2 > 0 ? `${seatsAvailable.session2} seats left` : "Full"}
                                                    </span>
                                                )}
                                            </Label>
                                        </RadioGroup>
                                    )}
                                </div>

                                {/* Guest Add-ons: Parent Seats and Refreshments */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary"/>
                                            Additional Parent Seats
                                        </Label>
                                        <RadioGroup
                                            value={additionalSeats}
                                            onValueChange={setAdditionalSeats}
                                            className="flex gap-2"
                                        >
                                            {['0', '1', '2'].map((seatVal) => (
                                                <div key={seatVal} className="flex-1">
                                                    <RadioGroupItem value={seatVal} id={`seats-${seatVal}`} className="sr-only" />
                                                    <Label
                                                        htmlFor={`seats-${seatVal}`}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-3 hover:bg-accent cursor-pointer transition-all h-16",
                                                            additionalSeats === seatVal && "border-primary bg-primary/5 text-primary font-bold"
                                                        )}
                                                    >
                                                        <span className="text-xl font-bold">{seatVal}</span>
                                                        <span className="text-[10px] uppercase font-semibold">{seatVal === '1' ? 'Seat' : 'Seats'}</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        <p className="text-xs text-muted-foreground">LKR {ceremonyParentSeatRate.toLocaleString()} per additional seat.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold flex items-center gap-2">
                                            <Coffee className="w-4 h-4 text-orange-500"/>
                                            Refreshments Tokens
                                        </Label>
                                        <RadioGroup
                                            value={refreshmentTokens}
                                            onValueChange={setRefreshmentTokens}
                                            className="flex gap-2 flex-wrap"
                                        >
                                            {['0', '1', '2', '3'].map((tokenVal) => (
                                                <div key={tokenVal} className="flex-1">
                                                    <RadioGroupItem value={tokenVal} id={`tokens-${tokenVal}`} className="sr-only" />
                                                    <Label
                                                        htmlFor={`tokens-${tokenVal}`}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-3 hover:bg-accent cursor-pointer transition-all h-16",
                                                            refreshmentTokens === tokenVal && "border-primary bg-primary/5 text-primary font-bold"
                                                        )}
                                                    >
                                                        <span className="text-xl font-bold">{tokenVal}</span>
                                                        <span className="text-[10px] uppercase font-semibold">{tokenVal === '1' ? 'Token' : 'Tokens'}</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        <p className="text-xs text-muted-foreground">
                                            {ceremonyRefreshTokenRate > 0 
                                                ? `LKR ${ceremonyRefreshTokenRate.toLocaleString()} per token.` 
                                                : 'Extra refreshment tokens for guests.'}
                                        </p>
                                    </div>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>

                    {/* Right Column: Checkout Summary & Submission Form */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6">
                        <Card className="border-2 shadow-md overflow-hidden bg-card">
                            <CardHeader className="bg-muted/30 pb-3 border-b">
                                <CardTitle className="text-base font-bold">Booking Summary</CardTitle>
                                <CardDescription className="text-xs">Review cost breakdown and payment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Package:</span>
                                        <span className="font-semibold text-foreground truncate max-w-[160px]">{selectedPackage ? selectedPackage.package_name : 'None selected'}</span>
                                    </div>
                                    {selectedPackage && (
                                        <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                            <span>Package Fee:</span>
                                            <span className="font-mono">LKR {parseFloat(selectedPackage.price).toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Session:</span>
                                        <span className="font-semibold text-foreground">Session {maxSessions === 1 ? '1' : selectedSession}</span>
                                    </div>

                                    {parseInt(additionalSeats, 10) > 0 && (
                                        <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                            <span>Guest Seats ({additionalSeats}):</span>
                                            <span className="font-mono">LKR {(parseInt(additionalSeats, 10) * ceremonyParentSeatRate).toLocaleString()}</span>
                                        </div>
                                    )}

                                    {parseInt(refreshmentTokens, 10) > 0 && (
                                        <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                            <span>Refreshments ({refreshmentTokens} tokens):</span>
                                            <span className="font-mono">
                                                {ceremonyRefreshTokenRate > 0 
                                                    ? `LKR ${(parseInt(refreshmentTokens, 10) * ceremonyRefreshTokenRate).toLocaleString()}` 
                                                    : 'Included'}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t flex justify-between items-baseline">
                                        <span className="text-base font-bold">Total Amount:</span>
                                        <span className="text-2xl font-black text-primary">LKR {totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Payment Slip Upload */}
                                <div className="space-y-2 pt-3 border-t">
                                    <Label htmlFor="payment-slip" className="text-sm font-semibold flex items-center gap-1.5">
                                        <Paperclip className="w-4 h-4 text-primary" />
                                        Upload Payment Slip *
                                    </Label>
                                    <Input 
                                        id="payment-slip" 
                                        type="file" 
                                        accept="image/*,application/pdf"
                                        required 
                                        onChange={e => setPaymentSlip(e.target.files ? e.target.files[0] : null)} 
                                        className="cursor-pointer file:cursor-pointer text-xs"
                                    />
                                    {paymentSlip && (
                                        <p className="text-[11px] text-green-600 font-medium truncate">
                                            ✓ {paymentSlip.name}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Details */}
                                <div className="space-y-3 pt-3 border-t">
                                    <Label className="text-sm font-semibold">Confirm Certificate Details</Label>
                                    <div className="space-y-2">
                                        <div>
                                            <Label htmlFor="name-on-cert" className="text-xs text-muted-foreground">Name on Certificate *</Label>
                                            <Input 
                                                id="name-on-cert" 
                                                value={nameOnCertificate} 
                                                onChange={e => setNameOnCertificate(e.target.value)} 
                                                required 
                                                className="h-9 text-xs mt-1"
                                                placeholder="Full name for certificate"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone" className="text-xs text-muted-foreground">Contact Phone *</Label>
                                            <Input 
                                                id="phone" 
                                                value={phone} 
                                                onChange={e => setPhone(e.target.value)} 
                                                required 
                                                className="h-9 text-xs mt-1"
                                                placeholder="Phone number"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="w-full mt-2 font-bold shadow-md"
                                    disabled={!selectedPackageId || !paymentSlip}
                                >
                                    Review Booking <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
              </CardContent>
          </form>
        );

      case 'confirmation':
        return (
          <>
            <CardHeader className="pb-4 border-b">
              <Button variant="ghost" onClick={() => setStep('form')} className="w-fit h-auto p-0 mb-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit Form
              </Button>
              <CardTitle className="text-2xl">Step 4: Confirm Your Booking</CardTitle>
              <CardDescription>Please review all details before confirming your submission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card: Inclusions & Selection */}
                <div className="space-y-4 p-5 rounded-xl border bg-muted/20">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Selected Courses & Ceremony
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold">Ceremony:</span>
                      <p className="font-semibold text-foreground">{selectedCeremony?.convocation_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold">Courses:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pt-1">
                        {selectedEnrollments.map(e => (
                          <li key={e.id} className="text-xs font-medium text-foreground">{e.parent_course_name} ({e.course_code})</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground uppercase font-bold">Package:</span>
                      <p className="font-semibold text-foreground">{selectedPackage?.package_name}</p>
                    </div>
                  </div>
                </div>

                {/* Right Card: Session, Guests & Payment */}
                <div className="space-y-4 p-5 rounded-xl border bg-card shadow-sm">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Booking & Payment Details
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Session:</span>
                      <Badge variant="outline" className="font-semibold">Session {maxSessions === 1 ? '1' : selectedSession}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Additional Seats:</span>
                      <span className="font-semibold">{additionalSeats} Seats (LKR {(parseInt(additionalSeats, 10) * ceremonyParentSeatRate).toLocaleString()})</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Refreshments Tokens:</span>
                      <span className="font-semibold">
                        {refreshmentTokens} Tokens {ceremonyRefreshTokenRate > 0 && `(LKR ${(parseInt(refreshmentTokens, 10) * ceremonyRefreshTokenRate).toLocaleString()})`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Name on Certificate:</span>
                      <span className="font-semibold">{nameOnCertificate}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Contact Phone:</span>
                      <span className="font-semibold">{phone}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Slip File:</span>
                      <span className="font-medium truncate max-w-[180px]">{paymentSlip?.name}</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between items-baseline">
                      <span className="text-base font-bold">Total Amount:</span>
                      <span className="text-2xl font-black text-primary">LKR {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Button size="lg" className="w-full font-bold shadow-md" onClick={handleConfirmAndSubmit} disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Confirm & Submit Booking
              </Button>
            </CardFooter>
          </>
        );

      case 'success':
        return (
          <>
            <CardHeader className="items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <CardTitle className="text-2xl">Booking Submitted!</CardTitle>
              <CardDescription>The convocation booking has been successfully placed. You will be notified of its status.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Your Reference Number is:</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <p className="text-2xl font-bold font-mono tracking-widest text-primary p-2 border-2 border-dashed rounded-lg">{referenceNumber}</p>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}><Copy className="h-5 w-5"/></Button>
                </div>
            </CardContent>
             <CardFooter className="justify-center">
              <Button onClick={() => router.push('/dashboard/convocation-booking')}>
                  <Home className="mr-2 h-4 w-4" /> View Booking History
              </Button>
            </CardFooter>
          </>
        );

      case 'error':
        return (
            <>
                <CardHeader className="items-center text-center">
                   <AlertCircle className="w-16 h-16 text-destructive" />
                   <CardTitle>Booking Not Available</CardTitle>
                   <CardDescription>{errorDetails?.message}</CardDescription>
                </CardHeader>
                {errorDetails?.enrollments && errorDetails.enrollments.length > 0 && (
                    <CardContent>
                        <div className="w-full max-w-lg mx-auto text-left space-y-4">
                            <h3 className="font-semibold text-center">Your Course Status Overview</h3>
                            {errorDetails.enrollments.map(enrollment => {
                                const isEligible = enrollment.certificate_eligibility;
                                const isBooked = activeBookedCourseIds.has(String(enrollment.parent_course_id)) || activeBookedCourseIds.has(String(enrollment.course_code));
                                const isOrdered = activeOrderedCourseIds.has(String(enrollment.parent_course_id)) || activeOrderedCourseIds.has(String(enrollment.course_code));

                                let statusBadge: React.ReactNode;
                                if (isBooked) {
                                    statusBadge = <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">Booked</Badge>;
                                } else if (isOrdered) {
                                    statusBadge = <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Ordered</Badge>;
                                } else if (isEligible) {
                                    statusBadge = <Badge variant="default" className="bg-green-600">Eligible</Badge>;
                                } else {
                                    statusBadge = <Badge variant="destructive">Not Eligible</Badge>;
                                }

                                return (
                                    <Collapsible key={enrollment.id} className="p-4 border rounded-md" defaultOpen={!isEligible}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{enrollment.parent_course_name}</p>
                                                <p className="text-xs text-muted-foreground">{enrollment.course_code}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {statusBadge}
                                                {!isEligible && <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="w-9 p-0"><ChevronDown className="h-4 w-4" /></Button></CollapsibleTrigger>}
                                            </div>
                                        </div>
                                        {!isEligible && (
                                            <CollapsibleContent className="mt-4 pt-4 border-t">
                                                <h4 className="text-sm font-semibold mb-2">Reasons for Ineligibility:</h4>
                                                <ul className="space-y-2 text-sm">
                                                    {enrollment.criteria_details.map(criterion => !criterion.evaluation.completed && (
                                                        <li key={criterion.id} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                                                <span className="text-muted-foreground">{criterion.list_name}</span>
                                                            </div>
                                                            <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                                                                {criterion.evaluation.currentValue} / {criterion.evaluation.requiredValue}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CollapsibleContent>
                                        )}
                                    </Collapsible>
                                );
                            })}
                        </div>
                    </CardContent>
                )}
                <CardFooter className="justify-center">
                    <Button asChild variant="outline"><Link href="/dashboard/convocation-booking">Back to Bookings</Link></Button>
                </CardFooter>
            </>
        );
    }
  };
  
  return (
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
           <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    You have not selected all eligible courses. Are you sure you want to proceed without including all eligible certificates in this booking?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction onClick={() => setStep('form')}>
                    Continue Anyway
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {studentData && (
              <Card className="w-full shadow-sm border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/20 shadow-sm shrink-0">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">{user?.name?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg sm:text-xl font-bold truncate text-foreground">{studentData.studentInfo.full_name}</h2>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 shrink-0">
                            Eligible
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground font-mono">{studentData.studentInfo.student_id}</p>
                      </div>
                    </div>

                    {/* Visual Stepper on Desktop */}
                    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
                      {stepsList.map((s, idx) => {
                        const isCurrent = step === s.id;
                        const isCompleted = getStepIndex(step) > idx;
                        return (
                          <div key={s.id} className="flex items-center gap-2 shrink-0">
                            <div className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                              isCurrent ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20" :
                              isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground opacity-60"
                            )}>
                              <span className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                isCurrent ? "bg-primary-foreground text-primary" :
                                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-foreground"
                              )}>
                                {isCompleted ? '✓' : s.num}
                              </span>
                              <span className="hidden sm:inline">{s.label}</span>
                            </div>
                            {idx < stepsList.length - 1 && (
                              <div className={cn(
                                "w-4 sm:w-6 h-0.5 rounded",
                                isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                              )} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          <Card className="w-full shadow-lg border border-border/80">
              {renderContent()}
          </Card>
      </div>
  );
}
