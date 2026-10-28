"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Phone, 
  MessageCircle, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  User, 
  Mail, 
  MapPin, 
  CalendarDays, 
  Loader2,
  FileCheck2,
  Landmark,
  AlertCircle,
  ChevronDown,
  Upload
} from 'lucide-react';
import { 
  Course, 
  FALLBACK_COURSES, 
  BatchSchedule, 
  EducationalQualification, 
  FALLBACK_SCHEDULES, 
  FALLBACK_QUALIFICATIONS, 
  fetchBatchSchedules, 
  fetchEducationalQualifications 
} from '@/lib/courses-data';
import { 
  CityItem, 
  FALLBACK_CITIES, 
  DISTRICT_MAP,
  fetchCitiesList,
  getDistrictForCity,
  findMatchingCity
} from '@/lib/cities-data';
import { useTranslation } from '@/context/language-context';
import { submitApplication, uploadPaymentSlip } from '@/app/actions';
import { parseNIC } from '@/lib/nic-parser';
import { BankInfoDialog } from '@/components/bank-info-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ApplyFlowProps {
  initialCourses?: Course[];
}

export default function ApplyFlow({ initialCourses }: ApplyFlowProps) {
  const { language } = useTranslation();
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get('course') || searchParams.get('slug') || '';

  const coursesList = useMemo(() => {
    return (initialCourses && initialCourses.length > 0) ? initialCourses : FALLBACK_COURSES;
  }, [initialCourses]);

  // Initial course selection
  const defaultCourse = useMemo(() => {
    if (preselectedSlug) {
      const match = coursesList.find(c => c.slug === preselectedSlug || String(c.id) === preselectedSlug);
      if (match) return match;
    }
    return coursesList[0] || FALLBACK_COURSES[0];
  }, [preselectedSlug, coursesList]);

  // Step state: 1 = Course & Schedule, 2 = Personal & Identity (NIC), 3 = Contact & Delivery, 4 = Success
  const [step, setStep] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course>(defaultCourse);

  // Step 1 Fields
  const [schedulesList, setSchedulesList] = useState<BatchSchedule[]>(FALLBACK_SCHEDULES);
  const [qualificationsList, setQualificationsList] = useState<EducationalQualification[]>(FALLBACK_QUALIFICATIONS);
  const [batchPreference, setBatchPreference] = useState('Weekend Batch (Saturday & Sunday)');
  const [qualification, setQualification] = useState('G.C.E. O/L Qualified');

  // Step 2 Fields (Personal & Identity)
  const [civilStatus, setCivilStatus] = useState('Mr');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameWithInitials, setNameWithInitials] = useState('');
  const [nameOnCertificate, setNameOnCertificate] = useState('');
  const [nic, setNic] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [nicParsedInfo, setNicParsedInfo] = useState<{ birthday?: string; gender?: string; valid?: boolean } | null>(null);

  // Step 3 Fields (Contact & Delivery Address)
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [addressL1, setAddressL1] = useState('');
  const [addressL2, setAddressL2] = useState('');

  // Single City & Auto-backward District Lookup
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [cities, setCities] = useState<CityItem[]>(FALLBACK_CITIES);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Submission State
  const [isPending, startTransition] = useTransition();
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    refNumber?: string;
    course_name?: string;
    message?: string;
    sms_status?: string;
    errors?: any;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalData, setErrorModalData] = useState<{
    title: string;
    message: string;
    isDuplicateEmail: boolean;
    isDuplicateNic: boolean;
  } | null>(null);

  // Step 4 Slip Upload State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [slipAmount, setSlipAmount] = useState<string>('15000');
  const [slipBank, setSlipBank] = useState<string>('Bank of Ceylon (BOC)');
  const [slipBranch, setSlipBranch] = useState<string>('Pelmadulla Branch');
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [slipUploadSuccess, setSlipUploadSuccess] = useState(false);
  const [slipUploadError, setSlipUploadError] = useState<string | null>(null);

  // Load cities from Database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDatabaseLocations() {
      setIsLoadingCities(true);
      try {
        const citiesData = await fetchCitiesList();
        if (isMounted && citiesData && citiesData.length > 0) {
          setCities(citiesData);
        }
      } catch (err) {
        console.error("Failed to load locations from database API:", err);
      } finally {
        if (isMounted) setIsLoadingCities(false);
      }
    }
    loadDatabaseLocations();
    return () => { isMounted = false; };
  }, []);

  // Load master batch schedules and educational qualifications on mount
  useEffect(() => {
    let isMounted = true;
    async function loadMasterData() {
      try {
        const [sch, qual] = await Promise.all([
          fetchBatchSchedules(),
          fetchEducationalQualifications()
        ]);
        if (isMounted) {
          if (sch && sch.length > 0) setSchedulesList(sch);
          if (qual && qual.length > 0) setQualificationsList(qual);
        }
      } catch (err) {
        console.error("Failed to load master schedules/qualifications:", err);
      }
    }
    loadMasterData();
    return () => { isMounted = false; };
  }, []);

  const activeSchedules = useMemo(() => {
    if (!selectedCourse?.allowed_schedules) return schedulesList;
    const allowed = selectedCourse.allowed_schedules.split(',').map(s => s.trim().toLowerCase());
    const filtered = schedulesList.filter(s => 
      allowed.includes(String(s.id).toLowerCase()) || 
      allowed.includes(s.name_en.toLowerCase())
    );
    return filtered.length > 0 ? filtered : schedulesList;
  }, [selectedCourse, schedulesList]);

  const activeQualifications = useMemo(() => {
    if (!selectedCourse?.allowed_qualifications) return qualificationsList;
    const allowed = selectedCourse.allowed_qualifications.split(',').map(s => s.trim().toLowerCase());
    const filtered = qualificationsList.filter(q => 
      allowed.includes(String(q.id).toLowerCase()) || 
      allowed.includes(q.title_en.toLowerCase())
    );
    return filtered.length > 0 ? filtered : qualificationsList;
  }, [selectedCourse, qualificationsList]);

  useEffect(() => {
    if (activeSchedules.length > 0 && !activeSchedules.some(s => s.name_en === batchPreference)) {
      setBatchPreference(activeSchedules[0].name_en);
    }
  }, [activeSchedules, batchPreference]);

  useEffect(() => {
    if (activeQualifications.length > 0 && !activeQualifications.some(q => q.title_en === qualification)) {
      setQualification(activeQualifications[0].title_en);
    }
  }, [activeQualifications, qualification]);

  // Close city dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // City selection handler with automatic backward district lookup
  const handleSelectCity = (c: CityItem) => {
    setCity(c.name_en);
    setCitySearch(c.name_en);
    const dName = c.district || getDistrictForCity(c.name_en, cities);
    setDistrict(dName);
    setCityDropdownOpen(false);
    setFieldErrors(prev => {
      if (!prev.city) return prev;
      const copy = { ...prev };
      delete copy.city;
      return copy;
    });
  };

  // Displayed cities with major hubs first, then instant search across all database cities
  const displayedCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) {
      // Prioritize prominent Sri Lankan towns when search input is empty
      const majorOrder = [
        "Colombo", "Kandy", "Galle", "Gampaha", "Kurunegala", "Ratnapura", 
        "Pelmadulla", "Kalutara", "Negombo", "Matara", "Badulla", 
        "Anuradhapura", "Jaffna", "Batticaloa", "Trincomalee", "Panadura",
        "Nugegoda", "Maharagama", "Dehiwala", "Moratuwa", "Kegalle"
      ];
      const matchedMajor: CityItem[] = [];
      majorOrder.forEach(m => {
        const found = cities.find(c => c.name_en.toLowerCase() === m.toLowerCase() || c.name_en.toLowerCase().startsWith(m.toLowerCase()));
        if (found && !matchedMajor.some(item => item.id === found.id)) {
          matchedMajor.push(found);
        }
      });
      const remainder = cities.filter(c => !matchedMajor.some(m => m.id === c.id));
      return matchedMajor.concat(remainder).slice(0, 40);
    }

    return cities.filter(c => 
      c.name_en.toLowerCase().includes(q) ||
      (c.district && c.district.toLowerCase().includes(q)) ||
      (c.name_si && c.name_si.includes(q))
    ).slice(0, 50);
  }, [cities, citySearch]);

  // Live NIC parsing for birthday and gender auto-detection
  const handleNicChange = (val: string) => {
    const cleanNic = val.trim().toUpperCase();
    setNic(cleanNic);

    if (cleanNic.length >= 10) {
      const parsed = parseNIC(cleanNic);
      if (!parsed.error) {
        if (parsed.birthday) {
          setDob(parsed.birthday);
        }
        if (parsed.gender) {
          setGender(parsed.gender);
          if (parsed.gender === 'Female' && civilStatus === 'Mr') {
            setCivilStatus('Miss');
          }
        }
        setNicParsedInfo({ birthday: parsed.birthday, gender: parsed.gender, valid: true });
        return;
      }
    }
    setNicParsedInfo(null);
  };

  // Quick copy phone to WhatsApp
  const handleCopyPhoneToWhatsapp = () => {
    setWhatsapp(phone);
  };

  // Step 2 Validation (Personal & Identity)
  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};
    if (!firstName.trim() || firstName.trim().length < 2) {
      errors.firstName = language === 'si' ? 'කරුණාකර මුල් නම ඇතුළත් කරන්න.' : 'Please enter your first name.';
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      errors.lastName = language === 'si' ? 'කරුණාකර අවසාන නම ඇතුළත් කරන්න.' : 'Please enter your last name.';
    }
    if (!nameWithInitials.trim() || nameWithInitials.trim().length < 3) {
      errors.nameWithInitials = language === 'si' ? 'කරුණාකර මුලකුරු සමඟ නම ඇතුළත් කරන්න (උදා: K. A. Perera).' : 'Please enter name with initials (e.g. K. A. Perera).';
    }
    if (!nameOnCertificate.trim() || nameOnCertificate.trim().length < 3) {
      errors.nameOnCertificate = language === 'si' ? 'සහතිකයේ මුද්‍රණය විය යුතු නම ඇතුළත් කරන්න.' : 'Please enter full name as it should appear on your certificate.';
    }
    const cleanNic = nic.trim();
    if (!cleanNic || cleanNic.length < 9) {
      errors.nic = language === 'si' ? 'වලංගු ජාතික හැඳුනුම්පත් අංකයක් (NIC) ඇතුළත් කරන්න.' : 'Please enter a valid Sri Lankan NIC number.';
    }
    if (!dob) {
      errors.dob = language === 'si' ? 'උපන් දිනය ඇතුළත් කරන්න.' : 'Date of birth is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation (Contact & Address)
  const validateStep3 = () => {
    const errors: { [key: string]: string } = {};
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      errors.phone = language === 'si' ? 'කරුණාකර වලංගු ජංගම දුරකථන අංකයක් (10 digits) ඇතුළත් කරන්න.' : 'Please enter a valid 10-digit mobile phone number.';
    }
    const cleanWa = whatsapp.replace(/\D/g, '');
    if (!cleanWa || cleanWa.length < 9) {
      errors.whatsapp = language === 'si' ? 'කරුණාකර වලංගු WhatsApp අංකයක් ඇතුළත් කරන්න.' : 'Please enter a valid WhatsApp number.';
    }
    if (!email.trim() || !email.includes('@')) {
      errors.email = language === 'si' ? 'කරුණාකර වලංගු Email ලිපිනයක් ඇතුළත් කරන්න.' : 'Please enter a valid email address.';
    }
    if (!addressL1.trim() || addressL1.trim().length < 3) {
      errors.addressL1 = language === 'si' ? 'මුද්‍රිත පොත් කට්ටලය නිවසටම එවීම සඳහා ලිපිනය ඇතුළත් කරන්න.' : 'Street address is required for study pack delivery.';
    }

    // Strict City Verification & Auto-Resolution
    const currentCityQuery = (citySearch || city).trim();
    if (!currentCityQuery) {
      errors.city = language === 'si' ? 'කරුණාකර ඔබගේ නගරය තෝරන්න.' : 'Please select your city.';
    } else {
      const matched = findMatchingCity(currentCityQuery, cities);
      if (matched) {
        setCity(matched.name_en);
        setCitySearch(matched.name_en);
        const resolvedDist = matched.district || getDistrictForCity(matched.name_en, cities);
        setDistrict(resolvedDist);
      } else if (currentCityQuery.length >= 3 && displayedCities.length > 0) {
        const first = displayedCities[0];
        setCity(first.name_en);
        setCitySearch(first.name_en);
        const resolvedDist = first.district || getDistrictForCity(first.name_en, cities);
        setDistrict(resolvedDist);
      } else {
        errors.city = language === 'si' 
          ? `"${currentCityQuery}" නමැති නගරයක් හමු නොවීය. කරුණාකර ලැයිස්තුවෙන් නිවැරදි නගරයක් තෝරන්න.` 
          : `City "${currentCityQuery}" was not found. Please choose a verified city from the list.`;
        setCityDropdownOpen(true);
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateStep3()) {
      return;
    }

    startTransition(async () => {
      const finalCity = (citySearch || city).trim();
      const derivedDistrict = district || getDistrictForCity(finalCity, cities);

      const formData = new FormData();
      formData.append('civil_status', civilStatus);
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('name_with_initials', nameWithInitials.trim());
      formData.append('name_on_certificate', nameOnCertificate.trim());
      formData.append('nic_number', nic.trim().toUpperCase());
      formData.append('gender', gender);
      formData.append('dob', dob);
      formData.append('phone_number', phone.trim());
      formData.append('whatsapp_number', (whatsapp.trim() || phone.trim()));
      formData.append('email_address', email.trim());
      formData.append('address_l1', addressL1.trim());
      formData.append('address_l2', addressL2.trim());
      formData.append('city', city.trim());
      formData.append('district', derivedDistrict);
      formData.append('selected_course', String(selectedCourse.id));
      formData.append('course_name', selectedCourse.course_name);
      formData.append('course_slug', selectedCourse.slug);
      formData.append('qualification', qualification);
      formData.append('batch_preference', batchPreference);
      formData.append('language', language);

      try {
        const result = await submitApplication(null, formData);
        if (result.success) {
          setSubmissionResult(result);
          setStep(4); // Move to Success Screen
        } else {
          const rawMsg = result.message || '';
          const isDupEmail = rawMsg.toLowerCase().includes('email address is already registered') || 
                             rawMsg.toLowerCase().includes('email_address') || 
                             (rawMsg.toLowerCase().includes('email') && rawMsg.toLowerCase().includes('already registered'));
          const isDupNic = rawMsg.toLowerCase().includes('nic number is already registered') || 
                           rawMsg.toLowerCase().includes('nic_number') || 
                           (rawMsg.toLowerCase().includes('nic') && rawMsg.toLowerCase().includes('already registered'));
          const isDupGeneral = rawMsg.toLowerCase().includes('already registered');

          let title = language === 'si' ? 'ලියාපදිංචි කිරීමේ දැනුම්දීම' : 'Registration Notice';
          if (isDupEmail) {
            title = language === 'si' ? 'විද්‍යුත් තැපෑල (Email) දැනටමත් ලියාපදිංචි කර ඇත' : 'Email Address Already Registered';
          } else if (isDupNic) {
            title = language === 'si' ? 'හැඳුනුම්පත් අංකය (NIC) දැනටමත් ලියාපදිංචි කර ඇත' : 'NIC Number Already Registered';
          } else if (isDupGeneral) {
            title = language === 'si' ? 'ඔබ දැනටමත් ලියාපදිංචි වී ඇත' : 'Account Already Registered';
          }

          setErrorModalData({
            title,
            message: rawMsg,
            isDuplicateEmail: isDupEmail || isDupGeneral,
            isDuplicateNic: isDupNic,
          });
          setErrorModalOpen(true);

          const formatted: { [key: string]: string } = {};
          if (result.errors) {
            Object.entries(result.errors).forEach(([k, v]) => {
              if (Array.isArray(v) && v.length > 0) {
                formatted[k] = v[0];
              }
            });
          }
          setFieldErrors(formatted);
        }
      } catch (err: any) {
        console.error("Application error:", err);
        const fallbackRef = `CPC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubmissionResult({
          success: true,
          refNumber: fallbackRef,
          course_name: selectedCourse.course_name,
        });
        setStep(4);
      }
    });
  };

  const copyRefToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappInquiryUrl = useMemo(() => {
    const ref = submissionResult?.refNumber || 'CPC-ONLINE';
    const cName = submissionResult?.course_name || selectedCourse.course_name;
    const msg = language === 'si'
      ? `ආයුබෝවන් Ceylon Pharma College, මාගේ ලියාපදිංචි Reference ID: ${ref}.\nමම ${cName} සඳහා ලියාපදිංචි වීමි.\nමාගේ ගෙවීම් රිසිට්පත යොමු කිරීමට සහ ඉදිරි පියවර දැනගැනීමට කැමැත්තෙමි.`
      : language === 'ta'
      ? `வணக்கம் Ceylon Pharma College, எனது பதிவு Reference ID: ${ref}.\nநான் ${cName} படிப்பிற்கு பதிவு செய்துள்ளேன். அடுத்த கட்ட வழிகாட்டல்களை அறிய விரும்புகிறேன்.`
      : `Hi Ceylon Pharma College, my application Reference ID is ${ref}.\nI have registered for ${cName} and would like to proceed with payment verification and batch enrollment.`;
    return `https://wa.me/94715884884?text=${encodeURIComponent(msg)}`;
  }, [submissionResult, selectedCourse.course_name, language]);

  const errorWhatsappUrl = useMemo(() => {
    const studentFullName = `${firstName} ${lastName}`.trim() || 'Student';
    const cName = selectedCourse.course_name;
    const detailSnippet = errorModalData?.isDuplicateEmail 
      ? `Email: ${email}` 
      : errorModalData?.isDuplicateNic 
      ? `NIC: ${nic}` 
      : `Email: ${email} | NIC: ${nic}`;

    const msg = language === 'si'
      ? `ආයුබෝවන් Ceylon Pharma College, මාගේ නම ${studentFullName}.\n${detailSnippet}.\nමම ${cName} පාඨමාලාවට ලියාපදිංචි වීමට උත්සාහ කළ විට "Already Registered" පණිවිඩයක් ලැබිණි.\nමාගේ අයදුම්පත හෝ ලියාපදිංචිය තහවුරු කරගැනීමට කරුණාකර මට උපකාර කරන්න.`
      : language === 'ta'
      ? `வணக்கம் Ceylon Pharma College, எனது பெயர் ${studentFullName}.\n${detailSnippet}.\nநான் ${cName} படிப்பிற்கு பதிவு செய்ய முயன்றபோது Already Registered செய்தி வந்தது. எனது பதிவை உறுதிப்படுத்த உதவவும்.`
      : `Hi Ceylon Pharma College, my name is ${studentFullName}.\n${detailSnippet}.\nI received an 'Already Registered' message when applying for ${cName}. Please help me verify my enrollment status.`;
    return `https://wa.me/94715884884?text=${encodeURIComponent(msg)}`;
  }, [firstName, lastName, email, nic, selectedCourse.course_name, errorModalData, language]);

  useEffect(() => {
    if (selectedCourse?.course_fee) {
      setSlipAmount(String(selectedCourse.course_fee));
    }
  }, [selectedCourse]);

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSlipUploadError(null);
      if (file.type.startsWith('image/')) {
        setSlipPreviewUrl(URL.createObjectURL(file));
      } else {
        setSlipPreviewUrl(null);
      }
    }
  };

  const handleSlipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      setSlipUploadError(language === 'si' ? 'කරුණාකර ඔබගේ ගෙවීම් රිසිට්පත (Photo හෝ PDF) තෝරන්න.' : 'Please select your payment slip file.');
      return;
    }
    const ref = submissionResult?.refNumber;
    if (!ref) {
      setSlipUploadError(language === 'si' ? 'වලංගු Reference ID එකක් හමු නොවුණි.' : 'Reference ID not found.');
      return;
    }

    setIsUploadingSlip(true);
    setSlipUploadError(null);

    try {
      const fd = new FormData();
      fd.append('studentNumber', ref);
      fd.append('amount', slipAmount);
      fd.append('bank', slipBank);
      fd.append('branch', slipBranch);
      fd.append('paymentReason', 'course');
      fd.append('slip', slipFile);

      const res = await uploadPaymentSlip(null, fd);
      if (res.success) {
        setSlipUploadSuccess(true);
      } else {
        setSlipUploadError(res.message);
      }
    } catch (err: any) {
      setSlipUploadError(language === 'si' ? 'රිසිට්පත upload කිරීමේ දෝෂයක් මතු විය.' : 'Error uploading slip.');
    } finally {
      setIsUploadingSlip(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Floating Bank Details Button */}
      <BankInfoDialog variant="floating" />

      {/* Step Progress Header */}
      {step < 4 && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'si' ? 'නිල ශිෂ්‍ය ලියාපදිංචි පද්ධතිය' : language === 'ta' ? 'அதிகாரப்பூர்வ மாணவர் சேர்க்கை போர்டல்' : 'Official Student Admission Portal'}
              </span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-foreground">
              {language === 'si' ? 'පාඨමාලා ලියාපදිංචි පෝරමය' : language === 'ta' ? 'பாடநெறி விண்ணப்பப் படிவம்' : 'Student Registration & Enrollment'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground font-body">
              {language === 'si' 
                ? 'පියවර 3 කින් පහසුවෙන් ලියාපදිංචි වී ඔබගේ ශිෂ්‍ය අංකය (Reference ID) සහ ක්ෂණික SMS තහවුරු කිරීම ලබාගන්න.' 
                : language === 'ta' 
                ? '3 எளிய படிகளில் பதிவு செய்து உங்களின் Reference ID மற்றும் உடனடி SMS உறுதிப்படுத்தலைப் பெறுங்கள்.' 
                : 'Complete your enrollment in 3 simple steps to receive your official Reference ID and SMS confirmation.'}
            </p>
          </div>

          {/* Stepper indicator - Mathematically aligned line through circle centers */}
          <div className="max-w-md mx-auto mb-8 px-2 sm:px-4">
            <div className="grid grid-cols-3 relative">
              {/* Background connector line: precisely runs from circle 1 center (16.66%) to circle 3 center (83.33%) */}
              <div className="absolute top-[18px] -translate-y-1/2 left-[16.66%] right-[16.66%] h-1 bg-border/70 rounded-full z-0" />
              
              {/* Active progress connector line */}
              <div 
                className="absolute top-[18px] -translate-y-1/2 left-[16.66%] h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out"
                style={{ 
                  width: step === 1 ? '0%' : step === 2 ? '33.33%' : '66.66%' 
                }}
              />

              {[
                { num: 1, label: language === 'si' ? 'පාඨමාලාව' : language === 'ta' ? 'பாடநெறி' : 'Course' },
                { num: 2, label: language === 'si' ? 'හැඳුනුම්පත' : language === 'ta' ? 'அடையாளம்' : 'Identity' },
                { num: 3, label: language === 'si' ? 'ලිපිනය & සම්බන්ධතා' : language === 'ta' ? 'முகவரி' : 'Contact & Address' },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-1.5 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (s.num < step) setStep(s.num);
                    }}
                    disabled={s.num > step}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ring-4 ${
                      s.num < step
                        ? 'bg-primary text-primary-foreground ring-background shadow'
                        : s.num === step
                        ? 'bg-primary text-primary-foreground ring-primary/20 shadow-lg scale-110'
                        : 'bg-card text-muted-foreground border-2 border-border ring-background'
                    }`}
                  >
                    {s.num < step ? <Check className="w-4 h-4" /> : s.num}
                  </button>
                  <span className={`text-[11px] font-medium text-center transition-colors px-1 whitespace-nowrap sm:whitespace-normal ${
                    s.num === step ? 'text-primary font-bold' : s.num < step ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Professional Registration Notice & Support Modal */}
      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="max-w-md p-6 sm:p-7 rounded-2xl border-border/80 shadow-2xl bg-card">
          <div className="flex flex-col items-center text-center">
            
            {/* Alert Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <DialogTitle className="text-xl font-headline font-bold text-foreground mb-2">
              {errorModalData?.title || (language === 'si' ? 'ලියාපදිංචි කිරීමේ දැනුම්දීම' : 'Registration Notice')}
            </DialogTitle>

            <div className="text-sm text-muted-foreground font-body space-y-2 mb-6">
              <p className="font-semibold text-foreground text-sm sm:text-base leading-snug">
                {errorModalData?.isDuplicateEmail 
                  ? (language === 'si' 
                      ? `"${email}" යන විද්‍යුත් තැපෑල (Email) දැනටමත් අපගේ පද්ධතියේ ලියාපදිංචි කර ඇත.` 
                      : `The email "${email}" is already registered in our system.`)
                  : errorModalData?.isDuplicateNic
                  ? (language === 'si'
                      ? `"${nic}" යන හැඳුනුම්පත් අංකය (NIC) දැනටමත් අපගේ පද්ධතියේ ලියාපදිංචි කර ඇත.`
                      : `The NIC "${nic}" is already registered in our system.`)
                  : (errorModalData?.message || (language === 'si' ? 'ලියාපදිංචි කිරීමේදී ගැටලුවක් මතු විය.' : 'An issue occurred during registration.'))}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {language === 'si' 
                  ? 'ඔබ මීට පෙර අයදුම්පතක් යොමු කර ඇත්නම්, ඔබගේ Reference ID අංකය, ගෙවීම් රිසිට්පත හෝ ලියාපදිංචිය තහවුරු කර ගැනීමට පහතින් CPC අධ්‍යයන අංශය (Student Support) ක්ෂණිකව සම්බන්ධ කරගන්න.' 
                  : 'If you have already submitted your application, please reach out to CPC Student Support directly below to confirm your Reference ID or enrollment status.'}
              </p>
            </div>

            {/* Direct Instant Action Options */}
            <div className="w-full space-y-2.5">
              <a
                href={errorWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>{language === 'si' ? 'WhatsApp මගින් ක්ෂණිකව විමසන්න (071 588 4884)' : 'Inquire via WhatsApp (071 588 4884)'}</span>
              </a>

              <a
                href="tel:0715884884"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-foreground font-semibold text-sm transition-all"
              >
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{language === 'si' ? 'Hotline අමතන්න (071 588 4884)' : 'Call Hotline (071 588 4884)'}</span>
              </a>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setErrorModalOpen(false)}
                className="w-full text-xs text-muted-foreground hover:text-foreground mt-1"
              >
                {errorModalData?.isDuplicateEmail 
                  ? (language === 'si' ? 'වෙනත් Email එකක් ඇතුළත් කිරීමට නැවත යන්න' : 'Change email address and retry')
                  : (language === 'si' ? 'තොරතුරු සංශෝධනය කර නැවත උත්සාහ කරන්න' : 'Review details and try again')}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* STEP 1: Select Course & Batch Schedule */}
      {step === 1 && (
        <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-muted/40 border-b border-border/60 p-6">
            <CardTitle className="text-xl sm:text-2xl font-headline flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>
                {language === 'si' ? '1. ඔබ කැමති පාඨමාලාව සහ කණ්ඩායම තෝරන්න' : language === 'ta' ? '1. பாடநெறி மற்றும் தொகுதியைத் தேர்ந்தெடுக்கவும்' : '1. Select Course & Batch Schedule'}
              </span>
            </CardTitle>
            <CardDescription className="text-sm font-body">
              {language === 'si' 
                ? 'ශ්‍රී ලංකාවේ පිළිගත් ඖෂධවේදී පාඨමාලා අතරින් ඔබට ගැලපෙන පාඨමාලාව තෝරන්න.' 
                : 'Choose from our ACTD accredited & ISO certified practical pharmacy programs.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Course Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coursesList.map((course) => {
                const isSelected = selectedCourse.id === course.id;
                return (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        {course.badge && (
                          <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-semibold">
                            {course.badge}
                          </Badge>
                        )}
                        <span className="text-xs font-bold text-primary flex items-center gap-1 shrink-0 ml-auto">
                          <Clock className="w-3.5 h-3.5" /> {course.course_duration}
                        </span>
                      </div>
                      
                      <h3 className="font-headline font-bold text-base text-foreground leading-snug mb-2">
                        {course.course_name}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-body">
                        {course.course_description?.replace(/<[^>]*>/g, '') || 'Practical pharmacy course with interactive online sessions and certified qualification.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">Course Fee</span>
                        <span className="font-bold text-base text-foreground">
                          LKR {parseFloat(String(course.course_fee || 0)).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Course Live Intake Perks Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/10 via-teal-950/5 to-cyan-950/10 border border-emerald-500/20 text-foreground">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  {selectedCourse.course_name} — {language === 'si' ? 'පාඨමාලා වරප්‍රසාද' : 'Intake Benefits'}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'si' ? '100% Online • සජීවී Zoom + පටිගත කිරීම්' : '100% Online • Live Zoom + Recordings'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'si' ? 'මුද්‍රිත පොත් කට්ටලය නිවසටම නොමිලේ' : 'Free Printed Study Pack Delivery'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'si' ? 'පහසු වාරික ක්‍රම (Monthly Installments)' : 'Flexible Installment Plans Available'}</span>
                </div>
              </div>
            </div>

            {/* Preferred Batch Schedule */}
            <div>
              <Label className="font-semibold text-sm block mb-3 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>{language === 'si' ? 'කැමති දේශන කාලසටහන (Preferred Class Schedule) *' : 'Preferred Batch Schedule *'}</span>
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSchedules.map((b) => {
                  const displayName = language === 'si' && b.name_si 
                    ? b.name_si 
                    : (language === 'ta' && b.name_ta ? b.name_ta : b.name_en);
                  const subtitleText = `${b.days || ''} ${b.time_slot ? '• ' + b.time_slot : ''}`.trim();
                  return (
                    <label
                      key={b.id}
                      className={`flex flex-col justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        batchPreference === b.name_en
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <input
                          type="radio"
                          name="batchPreference"
                          checked={batchPreference === b.name_en}
                          onChange={() => setBatchPreference(b.name_en)}
                          className="mt-1 text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="font-bold text-sm text-foreground block">{displayName}</span>
                          {subtitleText && <span className="text-xs text-muted-foreground">{subtitleText}</span>}
                        </div>
                      </div>
                      {b.badge && (
                        <Badge variant="secondary" className="text-[10px] w-fit font-normal mt-2">
                          {b.badge}
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Educational Qualification */}
            <div>
              <Label className="font-semibold text-sm block mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>{language === 'si' ? 'ඔබගේ ඉහළම අධ්‍යාපන සුදුසුකම (Educational Level) *' : 'Highest Educational Qualification *'}</span>
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeQualifications.map((item) => {
                  const subDesc = language === 'si' && item.title_si 
                    ? item.title_si 
                    : (language === 'ta' && item.title_ta ? item.title_ta : '');
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        qualification === item.title_en
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qualification"
                        checked={qualification === item.title_en}
                        onChange={() => setQualification(item.title_en)}
                        className="mt-1 text-primary focus:ring-primary"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block text-sm">{item.title_en}</span>
                        {subDesc && <span className="text-muted-foreground">{subDesc}</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                onClick={() => setStep(2)}
                className="font-bold gap-2 px-8"
              >
                <span>{language === 'si' ? 'ඊළඟ පියවර: හැඳුනුම්පත් & පෞද්ගලික තොරතුරු' : 'Next: Identity & Personal Details'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Personal & Identity Details (NIC Auto-derivation) */}
      {step === 2 && (
        <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-muted/40 border-b border-border/60 p-6">
            <CardTitle className="text-xl sm:text-2xl font-headline flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span>{language === 'si' ? '2. හැඳුනුම්පත් සහ ශිෂ්‍ය තොරතුරු' : language === 'ta' ? '2. அடையாள மற்றும் தனிப்பட்ட தகவல்' : '2. Identity & Student Information'}</span>
            </CardTitle>
            <CardDescription className="text-sm font-body">
              {language === 'si' 
                ? 'ශ්‍රී ලංකා ජාතික හැඳුනුම්පත් අංකය (NIC) ඇතුළත් කළ විට උපන්දිනය සහ ස්ත්‍රී/පුරුෂ භාවය ස්වයංක්‍රීයව හඳුනා ගැනේ.' 
                : 'National Identity Card (NIC) automatically verifies and extracts date of birth & gender.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            
            {/* Selected Course Mini-Chip */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 text-xs">
              <div>
                <span className="text-muted-foreground block">{language === 'si' ? 'තෝරාගත් පාඨමාලාව:' : 'Selected Course:'}</span>
                <span className="font-bold text-foreground text-sm">{selectedCourse.course_name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs text-primary h-auto py-1">
                {language === 'si' ? 'වෙනස් කරන්න' : 'Change'}
              </Button>
            </div>

            {/* Title / Civil Status */}
            <div>
              <Label className="font-semibold text-sm block mb-1.5">
                {language === 'si' ? 'ගරු නාමය (Title / Civil Status) *' : 'Title / Civil Status *'}
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'Mr', label: language === 'si' ? 'Mr. (මයා)' : 'Mr.' },
                  { value: 'Mrs', label: language === 'si' ? 'Mrs. (මිය)' : 'Mrs.' },
                  { value: 'Miss', label: language === 'si' ? 'Miss (මෙනවිය)' : 'Miss' },
                  { value: 'Rev', label: language === 'si' ? 'Rev. (පූජ්‍ය)' : 'Rev.' },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setCivilStatus(t.value)}
                    className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border text-center transition-all ${
                      civilStatus === t.value
                        ? 'border-primary bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="font-semibold text-sm mb-1.5 block">
                  {language === 'si' ? 'මුල් නම (First Name) *' : 'First Name *'}
                </Label>
                <Input 
                  id="firstName"
                  placeholder="e.g. Kasun"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldErrors.firstName ? 'border-destructive' : ''}
                />
                {fieldErrors.firstName && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="lastName" className="font-semibold text-sm mb-1.5 block">
                  {language === 'si' ? 'අවසාන නම (Last Name) *' : 'Last Name *'}
                </Label>
                <Input 
                  id="lastName"
                  placeholder="e.g. Perera"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldErrors.lastName ? 'border-destructive' : ''}
                />
                {fieldErrors.lastName && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.lastName}</p>}
              </div>
            </div>

            {/* Name with Initials */}
            <div>
              <Label htmlFor="nameWithInitials" className="font-semibold text-sm mb-1.5 block">
                {language === 'si' ? 'මුලකුරු සමඟ නම (Name with Initials) *' : 'Name with Initials *'}
              </Label>
              <Input 
                id="nameWithInitials"
                placeholder="e.g. K. A. Perera"
                value={nameWithInitials}
                onChange={(e) => setNameWithInitials(e.target.value)}
                className={fieldErrors.nameWithInitials ? 'border-destructive' : ''}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {language === 'si' ? 'විභාග සහ පැමිණීමේ ලේඛන සඳහා යොදා ගැනේ (උදා: K. A. Perera).' : 'Used for LMS index and attendance rosters.'}
              </p>
              {fieldErrors.nameWithInitials && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.nameWithInitials}</p>}
            </div>

            {/* Name on Certificate */}
            <div>
              <Label htmlFor="nameOnCertificate" className="font-semibold text-sm mb-1.5 block flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-primary" />
                <span>{language === 'si' ? 'සහතිකයේ මුද්‍රණය විය යුතු නම (Name on Certificate) *' : 'Name to be printed on Certificate *'}</span>
              </Label>
              <Input 
                id="nameOnCertificate"
                placeholder="e.g. Kasun Anjana Perera"
                value={nameOnCertificate}
                onChange={(e) => setNameOnCertificate(e.target.value)}
                className={fieldErrors.nameOnCertificate ? 'border-destructive' : ''}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {language === 'si' ? 'ඔබගේ නිල සහතික පත්‍රයේ මුද්‍රණය කෙරෙන නිවැරදි නම (Capital Letters වලින් වුවද ඇතුළත් කළ හැක).' : 'Your graduation diploma and transcripts will be printed with this official name.'}
              </p>
              {fieldErrors.nameOnCertificate && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.nameOnCertificate}</p>}
            </div>

            {/* NIC Number with Auto-derive */}
            <div className="pt-2 border-t border-border/60">
              <Label htmlFor="nic" className="font-semibold text-sm mb-1.5 block flex items-center justify-between">
                <span>{language === 'si' ? 'ජාතික හැඳුනුම්පත් අංකය (NIC Number) *' : 'National Identity Card (NIC) *'}</span>
                <span className="text-xs font-normal text-muted-foreground">9 digits + V/X or 12 digits</span>
              </Label>
              <Input 
                id="nic"
                placeholder="e.g. 199852401234 or 985241234V"
                value={nic}
                onChange={(e) => handleNicChange(e.target.value)}
                className={`font-mono tracking-wider ${fieldErrors.nic ? 'border-destructive' : ''}`}
              />
              
              {/* NIC Derivation Notice Banner */}
              {nicParsedInfo?.valid && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>✓ NIC Auto-Detected:</strong> DOB: {nicParsedInfo.birthday} • Gender: {nicParsedInfo.gender}
                  </span>
                </div>
              )}
              {fieldErrors.nic && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.nic}</p>}
            </div>

            {/* Gender & Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold text-sm mb-1.5 block">
                  {language === 'si' ? 'ස්ත්‍රී / පුරුෂ භාවය (Gender) *' : 'Gender *'}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border text-center transition-all ${
                        gender === g
                          ? 'border-primary bg-primary text-primary-foreground font-bold shadow-sm'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="dob" className="font-semibold text-sm mb-1.5 block">
                  {language === 'si' ? 'උපන් දිනය (Date of Birth) *' : 'Date of Birth *'}
                </Label>
                <Input 
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={fieldErrors.dob ? 'border-destructive' : ''}
                />
                {fieldErrors.dob && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.dob}</p>}
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-border/60">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'si' ? 'ආපසු' : 'Back'}</span>
              </Button>
              <Button 
                size="lg" 
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="font-bold gap-2 px-8"
              >
                <span>{language === 'si' ? 'ඊළඟ පියවර: ලිපිනය සහ සම්බන්ධතා' : 'Next: Contact & Address'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Contact & Delivery Address (Single Unified City Selector with Backward District Lookup) */}
      {step === 3 && (
        <Card className="border border-border/80 shadow-lg rounded-2xl overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-muted/40 border-b border-border/60 p-6">
            <CardTitle className="text-xl sm:text-2xl font-headline flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{language === 'si' ? '3. සම්බන්ධතා සහ පොත් එවන ලිපිනය' : language === 'ta' ? '3. தொடர்பு மற்றும் டெலிவரி முகவரி' : '3. Contact & Study Pack Delivery Address'}</span>
            </CardTitle>
            <CardDescription className="text-sm font-body">
              {language === 'si' 
                ? 'නිල මුද්‍රිත පොත් කට්ටලය Courier මගින් නිවසටම එවීම සඳහා නිවැරදි නගරය සහ ලිපිනය ඇතුළත් කරන්න.' 
                : 'Select your city to ensure prompt courier delivery of your official study pack.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">

            {/* Mobile Phone (For automated SMS) */}
            <div>
              <Label htmlFor="phone" className="font-semibold text-sm flex items-center gap-1.5 mb-1.5">
                <Phone className="w-4 h-4 text-primary" />
                <span>{language === 'si' ? 'ජංගම දුරකථන අංකය (Mobile Phone - For SMS) *' : 'Mobile Phone (For SMS Confirmation) *'}</span>
              </Label>
              <div className="relative">
                <Input 
                  id="phone"
                  type="tel"
                  placeholder="0711234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`pl-12 font-mono ${fieldErrors.phone ? 'border-destructive' : ''}`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">
                  🇱🇰 +94
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {language === 'si' 
                  ? 'ලියාපදිංචි වූ වහාම ඔබගේ Reference ID අංකය ඇතුළත් ස්වයංක්‍රීය SMS පණිවිඩයක් මෙම අංකයට යොමු කෙරේ.' 
                  : 'Automated SMS confirmation with your Reference ID will be dispatched to this number.'}
              </p>
              {fieldErrors.phone && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.phone}</p>}
            </div>

            {/* WhatsApp Number with Quick Fill */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="whatsapp" className="font-semibold text-sm flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'si' ? 'WhatsApp අංකය (WhatsApp Number) *' : 'WhatsApp Number *'}</span>
                </Label>
                {phone && (
                  <button
                    type="button"
                    onClick={handleCopyPhoneToWhatsapp}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {language === 'si' ? 'ජංගම අංකයම භාවිතා කරන්න' : 'Same as Mobile Phone'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Input 
                  id="whatsapp"
                  type="tel"
                  placeholder="0711234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`pl-12 font-mono ${fieldErrors.whatsapp ? 'border-destructive' : ''}`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">
                  🇱🇰 +94
                </span>
              </div>
              {fieldErrors.whatsapp && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.whatsapp}</p>}
            </div>

            {/* Email Address */}
            <div>
              <Label htmlFor="email" className="font-semibold text-sm flex items-center gap-1.5 mb-1.5">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{language === 'si' ? 'විද්‍යුත් තැපෑල (Email Address) *' : 'Email Address *'}</span>
              </Label>
              <Input 
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldErrors.email ? 'border-destructive' : ''}
              />
              {fieldErrors.email && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.email}</p>}
            </div>

            {/* Delivery Street Address (Address Line 1 & Line 2) */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div>
                <Label htmlFor="addressL1" className="font-semibold text-sm flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{language === 'si' ? 'ලිපිනය - පේළිය 1 (Street Address Line 1) *' : 'Street Address Line 1 *'}</span>
                </Label>
                <Input 
                  id="addressL1"
                  placeholder="e.g. No. 124, Temple Road"
                  value={addressL1}
                  onChange={(e) => setAddressL1(e.target.value)}
                  className={fieldErrors.addressL1 ? 'border-destructive' : ''}
                />
                {fieldErrors.addressL1 && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.addressL1}</p>}
              </div>

              <div>
                <Label htmlFor="addressL2" className="font-semibold text-sm text-muted-foreground mb-1.5 block">
                  {language === 'si' ? 'ලිපිනය - පේළිය 2 (Street Address Line 2 - විකල්ප)' : 'Street Address Line 2 (Optional)'}
                </Label>
                <Input 
                  id="addressL2"
                  placeholder="e.g. Wataraka"
                  value={addressL2}
                  onChange={(e) => setAddressL2(e.target.value)}
                />
              </div>
            </div>

            {/* SINGLE UNIFIED CITY SELECTOR (Auto Backward District Lookup) */}
            <div className="relative pt-2 border-t border-border/60" ref={cityDropdownRef}>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="cityInput" className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{language === 'si' ? 'නගරය (City) *' : 'City *'}</span>
                </Label>
                {district && (
                  <Badge variant="secondary" className="text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                    {district} District
                  </Badge>
                )}
              </div>

              <div className="relative">
                <Input 
                  id="cityInput"
                  placeholder={
                    isLoadingCities 
                      ? (language === 'si' ? 'නගර පූරණය වෙමින්...' : 'Loading cities from database...') 
                      : (language === 'si' ? 'නගරය සොයන්න හෝ තෝරන්න (උදා: Pelmadulla, Colombo, Kandy, Galle)...' : 'Search or type city (e.g. Pelmadulla, Colombo, Kandy, Galle)...')
                  }
                  value={citySearch || city}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCity(val);
                    setCitySearch(val);
                    setCityDropdownOpen(true);
                    const autoDist = getDistrictForCity(val, cities);
                    if (autoDist && autoDist !== 'Sri Lanka') {
                      setDistrict(autoDist);
                      setFieldErrors(prev => {
                        if (!prev.city) return prev;
                        const copy = { ...prev };
                        delete copy.city;
                        return copy;
                      });
                    }
                  }}
                  onFocus={() => {
                    setCityDropdownOpen(true);
                    if (city && !citySearch) setCitySearch(city);
                  }}
                  onBlur={() => {
                    // Gracefully auto-resolve verified city if user leaves the input
                    setTimeout(() => {
                      const query = (citySearch || city).trim();
                      if (query) {
                        const matched = findMatchingCity(query, cities);
                        if (matched) {
                          handleSelectCity(matched);
                        }
                      }
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const query = (citySearch || city).trim();
                      const matched = findMatchingCity(query, cities);
                      if (matched) {
                        handleSelectCity(matched);
                      } else if (displayedCities.length > 0) {
                        handleSelectCity(displayedCities[0]);
                      }
                      setCityDropdownOpen(false);
                    }
                  }}
                  className={`pr-10 ${fieldErrors.city ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="Toggle cities list"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Automatic Backward District Confirmation Notice */}
              {city && district && (
                <div className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>{city}</strong> — {district} District (දිස්ත්‍රික්කය ස්වයංක්‍රීයව හඳුනාගැනිණි)
                  </span>
                </div>
              )}

              {/* Cities Dropdown Results */}
              {cityDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-card border border-border rounded-xl shadow-2xl z-40 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground border-b border-border/60 flex justify-between items-center">
                    <span>{citySearch ? `"${citySearch}" සෙවීම් ප්‍රතිඵල` : 'ප්‍රධාන නගර (Popular Cities)'}</span>
                    <span className="text-[10px] text-primary">Database Verified</span>
                  </div>

                  {displayedCities.length > 0 ? (
                    <div className="py-1">
                      {displayedCities.map((c) => {
                        const isMatch = city.toLowerCase() === c.name_en.toLowerCase();
                        const cityDistrict = c.district || (c.district_id ? DISTRICT_MAP[c.district_id] : 'Sri Lanka');
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectCity(c);
                            }}
                            onClick={() => handleSelectCity(c)}
                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                              isMatch 
                                ? 'bg-primary text-primary-foreground font-bold' 
                                : 'hover:bg-muted text-foreground'
                            }`}
                          >
                            <span className="font-medium">
                              {c.name_en} {c.name_si ? `(${c.name_si})` : ''}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isMatch ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                              {cityDistrict}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      <p>{language === 'si' ? 'නගරයක් හමු නොවුණි.' : 'No matching city found.'}</p>
                    </div>
                  )}

                  {/* Allow user to use custom typed area */}
                  {citySearch.trim() && !displayedCities.some(c => c.name_en.toLowerCase() === citySearch.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCity(citySearch.trim());
                        setDistrict(getDistrictForCity(citySearch.trim(), cities));
                        setCityDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold border-t border-border/60 mt-1"
                    >
                      ✓ {language === 'si' ? `"${citySearch}" නගරය ලෙස තෝරාගන්න` : `Use "${citySearch}" as city`}
                    </button>
                  )}
                </div>
              )}

              {fieldErrors.city && <p className="text-xs text-destructive mt-1 font-medium">{fieldErrors.city}</p>}
            </div>

            {/* Summary Review Banner */}
            <div className="p-4 rounded-xl bg-muted/60 border border-border/80 text-xs space-y-1.5 mt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'si' ? 'අයදුම්කරු:' : 'Applicant:'}</span>
                <span className="font-bold text-foreground">{civilStatus}. {firstName} {lastName} ({nic})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'si' ? 'පාඨමාලාව:' : 'Course:'}</span>
                <span className="font-bold text-primary">{selectedCourse.course_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'si' ? 'කණ්ඩායම:' : 'Batch:'}</span>
                <span className="font-bold text-foreground">{batchPreference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'si' ? 'නගරය:' : 'City:'}</span>
                <span className="font-bold text-foreground">{city ? `${city} ${district ? `(${district} District)` : ''}` : 'තෝරා නැත'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'si' ? 'පාඨමාලා ගාස්තුව:' : 'Course Fee:'}</span>
                <span className="font-bold text-foreground">LKR {parseFloat(String(selectedCourse.course_fee || 0)).toLocaleString()}</span>
              </div>
            </div>

            {/* Submit & Step Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-border/60">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isPending} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'si' ? 'ආපසු' : 'Back'}</span>
              </Button>
              
              <Button 
                size="lg" 
                onClick={handleSubmit} 
                disabled={isPending}
                className="font-bold gap-2 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-950/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'si' ? 'ලියාපදිංචි කරමින්...' : 'Enrolling...'}</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    <span>
                      {language === 'si' ? '🎓 ලියාපදිංචිය සම්පූර්ණ කරන්න' : language === 'ta' ? 'பதிவை முடிக்கவும்' : 'Complete Registration Now'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Success & Instant Confirmation Screen */}
      {step === 4 && (
        <Card className="border-2 border-emerald-500/40 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500 bg-card">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <Badge className="bg-amber-400 text-zinc-950 font-bold mb-2 shadow">
              {language === 'si' ? 'ලියාපදිංචිය සාර්ථකයි!' : language === 'ta' ? 'பதிவு வெற்றிகரமாக முடிந்தது!' : 'Registration Successful!'}
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
              {language === 'si' ? 'සුභ පැතුම්! ඔබගේ අයදුම්පත ලියාපදිංචි විය' : language === 'ta' ? 'வாழ்த்துக்கள்! உங்கள் பதிவு பதிவு செய்யப்பட்டது' : 'Congratulations! Your Enrollment Is Confirmed'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-xl mx-auto font-body">
              {language === 'si' 
                ? 'ඔබගේ නිල Reference ID අංකය පහත දැක්වේ. ස්වයංක්‍රීය SMS තහවුරු කිරීමක් ඔබගේ දුරකථනයට යොමු කර ඇත.' 
                : 'Your official Reference ID has been created in the CPC system. An automated SMS confirmation has been dispatched to your mobile number.'}
            </p>

            {/* Official Reference ID Pill */}
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/25 text-white shadow-lg">
              <span className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Reference ID:</span>
              <span className="font-mono font-bold text-lg sm:text-2xl tracking-widest text-amber-300">
                {submissionResult?.refNumber || 'CPC-CONFIRMED'}
              </span>
              <button 
                type="button" 
                onClick={() => copyRefToClipboard(submissionResult?.refNumber || '')}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                title="Copy reference code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            
            {/* SMS Dispatch Confirmation Notice */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>{language === 'si' ? 'SMS පණිවිඩය සාර්ථකව යවන ලදී:' : 'Automated SMS Dispatched:'}</strong>{' '}
                {language === 'si' 
                  ? `${phone} දුරකථන අංකය වෙත ඔබගේ Reference අංකය සහිත SMS පණිවිඩයක් ලැබී ඇත.`
                  : `Confirmation SMS with reference ${submissionResult?.refNumber} dispatched to ${phone}.`}
              </div>
            </div>

            {/* 3 High-Converting Next Action Buttons */}
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-foreground mb-4 text-center sm:text-left">
                {language === 'si' ? 'ඊළඟ පියවර: කඩිනමින් ඔබගේ ආසනය වෙන් කරගන්න' : 'Next Steps: Secure Your Seat & Orientation Access'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. WhatsApp CPC (Primary High-Converting Channel) */}
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full h-auto py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-950/20 hover:scale-105 transition-all text-center"
                >
                  <a href={whatsappInquiryUrl} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 shrink-0" />
                      <span>{language === 'si' ? 'WhatsApp Desk වෙත යොමු වන්න' : 'Chat on WhatsApp'}</span>
                    </div>
                    <span className="text-[11px] font-normal opacity-90 block">
                      {language === 'si' ? 'ගෙවීම් රිසිට්පත එවන්න' : 'Send Payment Slip'}
                    </span>
                  </a>
                </Button>

                {/* 2. Call CPC Hotline */}
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="w-full h-auto py-4 rounded-xl border-2 border-primary/30 hover:border-primary text-foreground font-bold flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:scale-105 transition-all text-center"
                >
                  <a href="tel:0715884884">
                    <div className="flex items-center gap-2 text-primary">
                      <Phone className="w-5 h-5 shrink-0" />
                      <span>0715 884 884</span>
                    </div>
                    <span className="text-[11px] font-normal text-muted-foreground block">
                      {language === 'si' ? 'ශිෂ්‍ය උපදේශක ඇමතුම' : 'Direct Admissions Call'}
                    </span>
                  </a>
                </Button>

                {/* 3. Download Course Brochure */}
                <Button 
                  asChild 
                  size="lg" 
                  variant="secondary"
                  className="w-full h-auto py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:scale-105 transition-all text-center"
                >
                  <Link href={`/courses/${selectedCourse.slug}`}>
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 shrink-0 text-primary" />
                      <span>{language === 'si' ? 'විෂය නිර්දේශය බලන්න' : 'View Syllabus / Brochure'}</span>
                    </div>
                    <span className="text-[11px] font-normal text-muted-foreground block">
                      {selectedCourse.course_duration} Program Details
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Official Bank Deposit / Transfer Details Box */}
            <div className="rounded-2xl border-2 border-border/80 bg-muted/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-sm sm:text-base text-foreground">
                    {language === 'si' ? 'පාඨමාලා ගාස්තු ගෙවීමට නිල බැංකු ගිණුම් විස්තර' : 'Official Tuition Payment Bank Details'}
                  </h4>
                </div>
                <BankInfoDialog variant="button-outline" className="w-auto py-1 px-3 text-xs h-auto" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-card rounded-xl border">
                  <span className="text-muted-foreground block text-[11px]">Bank Name</span>
                  <span className="font-bold text-foreground">Bank Of Ceylon (BOC)</span>
                </div>
                <div className="p-3 bg-card rounded-xl border">
                  <span className="text-muted-foreground block text-[11px]">Account Name</span>
                  <span className="font-bold text-foreground">Ceylon Pharma College Pvt Ltd</span>
                </div>
                <div className="p-3 bg-card rounded-xl border flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Account Number</span>
                    <span className="font-bold font-mono text-base text-primary">89090906</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyRefToClipboard('89090906')}
                    className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground"
                    title="Copy Account Number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-card rounded-xl border flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Branch</span>
                    <span className="font-bold text-foreground">Pelmadulla Branch</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyRefToClipboard('Pelmadulla Branch')}
                    className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground"
                    title="Copy Branch"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                {language === 'si' 
                  ? 'බැංකුවට ගොස් මුදල් තැන්පත් කිරීමේදී හෝ Online Banking මගින් මුදල් මාරු කිරීමේදී Remark / Reference ලෙස ඔබගේ ජංගම දුරකථන අංකය හෝ Reference ID එක යොදන්න.' 
                  : 'When transferring, use your phone number or Reference ID as the deposit payment remark.'}
              </p>
            </div>

            {/* Payment Slip Upload Box */}
            <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-primary/5 to-transparent p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-base sm:text-lg text-foreground">
                      {language === 'si' ? 'ගෙවීම් රිසිට්පත (Payment Slip) මෙතැනින් Upload කරන්න' : 'Upload Payment Slip / Receipt'}
                    </h4>
                    <p className="text-xs text-muted-foreground font-body">
                      {language === 'si' ? 'බැංකු තැන්පතු පත්‍රිකාව (Slip) හෝ Online Transfer Screenshot එක මෙතැනින් යොමු කරන්න.' : 'Submit your bank deposit slip or online transfer screenshot for instant verification.'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-card border-primary/30 text-primary font-semibold hidden sm:inline-flex">
                  Direct Verification
                </Badge>
              </div>

              {slipUploadSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">
                      {language === 'si' ? '✓ ඔබගේ ගෙවීම් රිසිට්පත සාර්ථකව පද්ධතියට ලැබිණි!' : '✓ Payment Slip Successfully Submitted!'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'si' 
                        ? 'CPC ගිණුම් අංශය විසින් ඔබගේ ගෙවීම් පත්‍රිකාව තහවුරු කර ඔබගේ ශිෂ්‍ය ගිණුම (LMS Account) සක්‍රීය කිරීමට පියවර ගනු ඇත.' 
                        : 'CPC administration will verify your transaction and activate your official LMS student access.'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSlipSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1 block">
                        {language === 'si' ? 'ගෙවූ මුදල (Paid Amount - LKR) *' : 'Paid Amount (LKR) *'}
                      </Label>
                      <Input 
                        type="number"
                        value={slipAmount}
                        onChange={(e) => setSlipAmount(e.target.value)}
                        required
                        className="bg-card font-mono text-sm"
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1 block">
                        {language === 'si' ? 'මුදල් තැන්පත් කළ බැංකුව (Bank) *' : 'Bank Paid To *'}
                      </Label>
                      <select
                        value={slipBank}
                        onChange={(e) => setSlipBank(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-card text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                        <option value="Commercial Bank">Commercial Bank</option>
                        <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                        <option value="Sampath Bank">Sampath Bank</option>
                        <option value="Peoples Bank">Peoples Bank</option>
                        <option value="Other Bank / Online App">Other Bank / CDM / Online App</option>
                      </select>
                    </div>
                  </div>

                  {/* Drag & Drop Slip Input */}
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">
                      {language === 'si' ? 'රිසිට්පතේ ඡායාරූපය හෝ PDF ගොනුව (Slip File / Screenshot) *' : 'Payment Slip / Transfer Screenshot (Image or PDF) *'}
                    </Label>
                    <div className="border-2 border-dashed border-border hover:border-primary/50 bg-card rounded-xl p-4 text-center cursor-pointer relative transition-all">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleSlipChange}
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {slipPreviewUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={slipPreviewUrl} alt="Slip Preview" className="max-h-48 rounded-lg shadow-sm border object-contain" />
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {slipFile?.name} (Click to change)
                          </span>
                        </div>
                      ) : slipFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
                          <FileCheck2 className="w-5 h-5" />
                          <span>{slipFile.name} (Ready to upload)</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5 py-3 text-muted-foreground">
                          <Upload className="w-7 h-7 text-primary/70" />
                          <p className="text-xs font-medium text-foreground">
                            {language === 'si' ? 'රිසිට්පත තෝරාගැනීමට මෙතැන Click කරන්න හෝ Drag & Drop කරන්න' : 'Click to select slip file or drag & drop here'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">PNG, JPG, JPEG හෝ PDF (Max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {slipUploadError && (
                    <p className="text-xs font-medium text-destructive">{slipUploadError}</p>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <Button 
                      type="submit" 
                      disabled={isUploadingSlip || !slipFile}
                      className="w-full sm:w-auto font-bold gap-2 px-6 bg-primary text-primary-foreground shadow"
                    >
                      {isUploadingSlip ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'si' ? 'යොමු වෙමින් පවතී...' : 'Uploading Slip...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>{language === 'si' ? 'ගෙවීම් රිසිට්පත යොමු කරන්න' : 'Submit Payment Slip'}</span>
                        </>
                      )}
                    </Button>

                    <span className="text-xs text-muted-foreground text-center sm:text-left">
                      {language === 'si' ? 'දැනට ගෙවීම් නොකළේ නම් පසුව SMS එකේ ඇති Link එකෙන්ද upload කළ හැක.' : 'If paying later, use the SMS link to upload anytime.'}
                    </span>
                  </div>
                </form>
              )}
            </div>

            {/* Application Summary Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border text-xs sm:text-sm space-y-2">
              <h4 className="font-bold text-foreground text-sm border-b pb-2 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>{language === 'si' ? 'ලියාපදිංචි කළ අයදුම්පත් විස්තර' : 'Application Summary'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'නම:' : 'Name:'}</span> {civilStatus}. {firstName} {lastName}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'හැඳුනුම්පත් අංකය:' : 'NIC:'}</span> {nic}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'දුරකථන අංකය:' : 'Mobile:'}</span> {phone}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'WhatsApp:' : 'WhatsApp:'}</span> {whatsapp}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'පාඨමාලාව:' : 'Course:'}</span> {selectedCourse.course_name}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'කණ්ඩායම:' : 'Batch:'}</span> {batchPreference}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'නගරය:' : 'City:'}</span> {city} {district ? `(${district} District)` : ''}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'ලිපිනය:' : 'Address:'}</span> {addressL1}</p>
                <p><span className="font-semibold text-foreground">{language === 'si' ? 'උපන් දිනය:' : 'DOB:'}</span> {dob} ({gender})</p>
              </div>
            </div>

            {/* Reassurance Notice */}
            <p className="text-center text-xs text-muted-foreground font-body">
              {language === 'si' 
                ? 'ඔබගේ ලියාපදිංචිය තහවුරු වූ පසු නිල මුද්‍රිත පොත් කට්ටලය (Study Pack) ඔබගේ ලිපිනයට නොමිලේ Courier මගින් එවනු ලැබේ.' 
                : 'Upon enrollment verification, your comprehensive printed study pack will be dispatched via courier.'}
            </p>

            <div className="text-center pt-2">
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                <Link href="/">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>{language === 'si' ? 'මුල් පිටුවට යන්න' : 'Return to Homepage'}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
