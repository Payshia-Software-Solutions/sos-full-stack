"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { PrescriptionPaper, getPrescriptionDisplayDrugs } from "@/components/d-pad/PrescriptionPaper";
import { 
  getDpadPrescriptionDetails, 
  getDpadSubmittedAnswers, 
  submitDpadAnswer,
  getFormSelectionData,
  getDpadActivePrescriptionsByCourse
} from "@/lib/actions/games";
import { 
  ArrowLeft, Pill, CheckCircle, RotateCcw, 
  HelpCircle, Calendar, User, Clipboard, Sun, Sunset, Moon, Clock, Search 
} from "lucide-react";

// --- Languages Definition ---
type Language = "en" | "si" | "ta";

const TRANSLATIONS = {
  en: {
    backToList: "Back to Prescription List",
    title: "D-Pad: Prescription Dispensing Challenge",
    subtitle: "Interpret the prescription and fill out the envelope label correctly for each item.",
    patientName: "Patient Name",
    age: "Age",
    date: "Date",
    doctor: "Doctor",
    dispensingItems: "Dispensing Items",
    selectItemDescription: "Select an item to begin filling out the dispensing label.",
    completed: "Completed",
    pending: "Pending",
    checkAnswer: "Check Answer",
    reset: "Reset Label",
    correctMsg: "Excellent Work! The dispensing label is correct.",
    incorrectMsg: "Some details are incorrect. Please review the highlighted fields.",
    alreadySaved: "You have already completed this envelope correctly!",
    backToItems: "Back to Items",
    fillingLabel: "Filling Label for",
    labelDetails: "Label Details",
    drugName: "Drug Name",
    dosageForm: "Dosage Form",
    quantity: "Total Quantity",
    schedule: "Daily Dosage Schedule",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    mealType: "Meal Type",
    frequency: "Frequency",
    atATime: "à¶¶à·à¶œà·’à¶±à·Š (at a time)",
    atATime: "at a time",
    hourQty: "every __ hours",
    additionalInstructions: "Additional Instructions",
    selectPlaceholder: "Click to select...",
    searchPlaceholder: "Search options...",
    close: "Close",
    incorrectFieldsTitle: "Incorrect Details Found",
    incorrectFieldsDesc: "Please review and correct the following fields on the envelope label:"
  },
  si: {
    backToList: "ප්‍රතිකාර ලැයිස්තුවට නැවත යන්න",
    title: "D-Pad: ඖෂධ නිකුත් කිරීමේ අභියෝගය",
    subtitle: "බෙහෙත් වට්ටෝරුව කියවා එක් එක් ඖෂධය සඳහා ලේබලය නිවැරදිව පුරවන්න.",
    patientName: "රෝගියාගේ නම",
    age: "වයස",
    date: "දිනය",
    doctor: "වෛද්‍යවරයා",
    dispensingItems: "නිකුත් කිරීමට ඇති ඖෂධ",
    selectItemDescription: "ඖෂධ පැකට්ටුව පුරවා ලේබල් කිරීම සඳහා ඖෂධයක් තෝරන්න.",
    completed: "සම්පූර්ණයි",
    pending: "අසම්පූර්ණයි",
    checkAnswer: "පිළිතුර පරීක්ෂා කරන්න",
    reset: "නැවත සකසන්න",
    correctMsg: "විශිෂ්ටයි! ඖෂධ ලේබලය සම්පූර්ණයෙන්ම නිවැරදි වේ.",
    incorrectMsg: "ඇතැම් තොරතුරු වැරදි සහගතයි. කරුණාකර රතු පාටින් ලකුණු කර ඇති කොටස් බලන්න.",
    alreadySaved: "ඔබ දැනටමත් මෙම ඖෂධ පැකට්ටුව නිවැරදිව සම්පූර්ණ කර ඇත!",
    backToItems: "පසුපසට",
    fillingLabel: "ලේබලය පුරවන්නේ",
    labelDetails: "ලේබලයේ විස්තර",
    drugName: "ඖෂධයේ නම",
    dosageForm: "ඖෂධ ආකාරය (Dosage Form)",
    quantity: "මුළු ප්‍රමාණය",
    schedule: "දෛනික කාලසටහන",
    morning: "උදේ",
    afternoon: "දවල්",
    evening: "සවස",
    night: "රාත්‍රී",
    mealType: "ආහාර වේල",
    frequency: "භාවිත වාර ගණන",
    atATime: "බැගින් (ප්‍රමාණය)",
    hourQty: "පැය __ වරක්",
    additionalInstructions: "අමතර උපදෙස්",
    selectPlaceholder: "තෝරාගැනීමට ක්ලික් කරන්න...",
    searchPlaceholder: "සොයන්න...",
    close: "වසා දමන්න",
    incorrectFieldsTitle: "වැරදි තොරතුරු හඳුනාගෙන ඇත",
    incorrectFieldsDesc: "කරුණාකර ලේබලයේ ඇති පහත සඳහන් කොටස් පරීක්ෂා කර නිවැරදි කරන්න:"
  },
  ta: {
    backToList: "மருந்துச்சீட்டு பட்டியலுக்குத் திரும்பு",
    title: "டி-பேட்: மருந்து விநியோக சவால்",
    subtitle: "மருந்துச்சீட்டைப் புரிந்துகொண்டு ஒவ்வொரு மருந்துக்கும் லேபிளைச் சரியாக நிரப்பவும்.",
    patientName: "நோயாளி பெயர்",
    age: "வயது",
    date: "தேதி",
    doctor: "வைத்தியர்",
    dispensingItems: "விநியோகிக்க வேண்டிய பொருட்கள்",
    selectItemDescription: "லேபிளை நிரப்ப ஒரு மருந்தைத் தேர்ந்தெடுக்கவும்.",
    completed: "முடிந்தது",
    pending: "நிலுவையில் உள்ளது",
    checkAnswer: "பதிலைச் சரிபார்க்கவும்",
    reset: "லேபிளை மீட்டமை",
    correctMsg: "மிகவும் நன்று! விநியோக லேபிள் சரியானது.",
    incorrectMsg: "சில விபரங்கள் தவறானவை. சிறப்பிக்கப்பட்ட துறைகளைச் சரிபார்க்கவும்.",
    alreadySaved: "நீங்கள் ஏற்கனவே இந்த லேபிளைச் சரியாகச் சமர்ப்பித்துள்ளீர்கள்!",
    backToItems: "பின்னோக்கி",
    fillingLabel: "இதற்கான லேபிள்",
    labelDetails: "லேபிள் விவரங்கள்",
    drugName: "மருந்து பெயர்",
    dosageForm: "மருந்து வடிவம்",
    quantity: "மொத்த அளவு",
    schedule: "தினசரி அட்டவணை",
    morning: "காலை",
    afternoon: "மதியம்",
    evening: "மாலை",
    night: "இரவு",
    mealType: "உணவு முறை",
    frequency: "பயன்படுத்தும் அதிர்வெண்",
    atATime: "ஒரு நேரத்திற்கு (බැගින්)",
    hourQty: "ஒவ்வொரு __ மணித்தியாலத்திற்கு",
    additionalInstructions: "கூடுதல் அறிவுறுத்தல்கள்",
    selectPlaceholder: "தேர்வு செய்ய கிளிக் செய்யவும்...",
    searchPlaceholder: "தேடல்...",
    close: "மூடு",
    incorrectFieldsTitle: "தவறான விபரங்கள் கண்டறியப்பட்டன",
    incorrectFieldsDesc: "தயவுசெய்து லேபிளில் உள்ள பின்வரும் பகுதிகளைச் சரிபார்த்து திருத்தவும்:"
  }
};

const OPTIONS_MAPPINGS: Record<string, any[]> = {
  dosageForm: [
    { value: "Tablet", label: { en: "Tablet", si: "à¶´à·™à¶­à·’", ta: "à®®à®¾à®¤à¯�à®¤à®¿à®°à¯ˆ" } },
    { value: "Capsule", label: { en: "Capsule", si: "à¶šà¶»à¶½à·Š (Capsule)", ta: "à®•à®¾à®ªà¯�à®¸à¯�à®¯à¯‚à®²à¯�" } },
    { value: "Syrup", label: { en: "Syrup", si: "à·ƒà·’à¶»à¶´à·Š", ta: "à®šà®¿à®°à®ªà¯�" } },
    { value: "Inhaler", label: { en: "Inhaler", si: "à¶‰à¶±à·Šà·„à·šà¶½à¶»à·Š", ta: "à®‡à®©à¯�à®¹à¯‡à®²à®°à¯�" } },
  ],
  mealType: [
    { value: "Before Meal", label: { en: "Before Meal", si: "à¶†à·„à·�à¶»à¶ºà¶§ à¶´à·™à¶»", ta: "à®‰à®£à®µà¯�à®•à¯�à®•à¯� à®®à¯�à®©à¯�" } },
    { value: "With Meal", label: { en: "With Meal", si: "à¶†à·„à·�à¶» à·ƒà¶¸à¶Ÿ", ta: "à®‰à®£à®µà¯�à®Ÿà®©à¯�" } },
    { value: "After Meal", label: { en: "After Meal", si: "à¶†à·„à·�à¶»à¶ºà¶§ à¶´à·ƒà·”", ta: "à®‰à®£à®µà¯�à®•à¯�à®•à¯� à®ªà®¿à®©à¯�" } },
    { value: "N/A", label: { en: "N/A", si: "à¶…à¶¯à·�à·… à¶±à·œà·€à·š", ta: "à®ªà¯Šà®°à¯�à®¨à¯�à®¤à®¾à®¤à¯�" } },
  ],
  usingFrequency: [
    { value: "Daily", label: { en: "Daily", si: "à¶¯à·’à¶±à¶´à¶­à·�", ta: "à®¤à®¿à®©à®šà®°à®¿" } },
    { value: "Weekly", label: { en: "Weekly", si: "à·ƒà¶­à·’à¶´à¶­à·�", ta: "à®µà®¾à®°à®¾à®¨à¯�à®¤à®¿à®°" } },
    { value: "As needed", label: { en: "As needed / SOS", si: "à¶…à·€à·�à·Šâ€�à¶º à·€à·– à·€à·’à¶§ à¶´à¶¸à¶«à¶šà·Š", ta: "à®¤à¯‡à®µà¯ˆà®•à¯�à®•à¯‡à®±à¯�à®ª" } },
  ],
  scheduleQty: [
    { value: "-", label: { en: "-", si: "-", ta: "-" } },
    { value: "1", label: { en: "1", si: "1", ta: "1" } },
    { value: "2", label: { en: "2", si: "2", ta: "2" } },
    { value: "3", label: { en: "3", si: "3", ta: "3" } },
    { value: "1/2", label: { en: "1/2", si: "1/2", ta: "1/2" } },
  ],
};

// --- Reusable Searchable Dialog Component (Mobile Full Screen) ---
interface SearchableSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  onSelect: (val: string) => void;
  lang: Language;
  fieldKey?: string;
  searchPlaceholder: string;
  closeText: string;
}

function SearchableSelectDialog({
  isOpen,
  onClose,
  title,
  options = [],
  onSelect,
  lang,
  fieldKey,
  searchPlaceholder,
  closeText
}: SearchableSelectDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const getOptionLabel = (val: string) => {
    if (!fieldKey) return val;
    const list = OPTIONS_MAPPINGS[fieldKey];
    if (!list) return val;
    const found = list.find((item) => item.value === val);
    return found ? found.label[lang] : val;
  };

  const filteredOptions = useMemo(() => {
    const sorted = [...options].sort((a, b) => {
      if (a === "-") return -1;
      if (b === "-") return 1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });
    return sorted.filter((opt) => {
      const label = getOptionLabel(opt).toLowerCase();
      const val = opt.toLowerCase();
      const query = searchQuery.toLowerCase();
      return label.includes(query) || val.includes(query);
    });
  }, [options, searchQuery, fieldKey, lang]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-card border-border text-card-foreground w-full h-full max-w-none m-0 rounded-none border-none flex flex-col p-4 left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-lg sm:h-auto sm:rounded-xl sm:border sm:p-6 sm:m-auto shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
        </DialogHeader>
        
        {/* Search bar inside popup */}
        <div className="relative my-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-input text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Dynamic Grid Options list */}
        <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar sm:max-h-[300px]">
          {filteredOptions.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs py-6">No results found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredOptions.map((opt) => (
                <Button
                  key={opt}
                  variant="outline"
                  onClick={() => {
                    onSelect(opt);
                    onClose();
                  }}
                  className="w-full justify-start text-left bg-muted/30 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border-border text-foreground py-6 text-sm transition-colors"
                >
                  {getOptionLabel(opt)}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-border mt-2">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">{closeText}</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const FIELD_LABEL_KEYS: Record<string, string> = {
  date: "date",
  name: "patientName",
  drug_name: "drugName",
  drug_type: "dosageForm",
  drug_qty: "quantity",
  morning_qty: "morning",
  afternoon_qty: "afternoon",
  evening_qty: "evening",
  night_qty: "night",
  meal_type: "mealType",
  using_type: "frequency",
  at_a_time: "atATime",
  hour_qty: "hourQty",
  additional_description: "additionalInstructions",
};

export default function DPadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const username = user?.username || "";
  const prescriptionId = params.id as string;

  const [courseCode, setCourseCode] = useState<string | null>(null);

  useEffect(() => {
    setCourseCode(sessionStorage.getItem("selected_course"));
  }, []);

  // UI Language state
  const [lang, setLang] = useState<Language>("en");
  const t = TRANSLATIONS[lang];

  // Active drug selected for envelope filling
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number | null>(null);
  
  // Submit Results highlights
  const [validationResults, setValidationResults] = useState<{
    incorrectFields: string[];
    isSubmitted: boolean;
    isCorrect: boolean;
  }>({ incorrectFields: [], isSubmitted: false, isCorrect: false });

  // Dialog State management
  const [activeDialogField, setActiveDialogField] = useState<string | null>(null);
  const [showIncorrectDialog, setShowIncorrectDialog] = useState(false);

  // Form State matching D-Pad fields
  const [formState, setFormState] = useState({
    date: "",
    name: "",
    drug_name: "",
    drug_type: "",
    drug_qty: "",
    morning_qty: "-",
    afternoon_qty: "-",
    evening_qty: "-",
    night_qty: "-",
    meal_type: "",
    using_type: "",
    at_a_time: "-",
    hour_qty: "-",
    additional_description: "-",
  });

  // Load Prescription details
  const { data: rxDetails, isLoading: rxLoading } = useQuery({
    queryKey: ["dpadPrescriptionDetails", prescriptionId],
    queryFn: () => getDpadPrescriptionDetails(prescriptionId),
    enabled: !!prescriptionId,
  });

  // Load Course Prescriptions (to determine Prescription # sequence for reference)
  const { data: coursePrescriptions = [] } = useQuery({
    queryKey: ["dpadActivePrescriptions", courseCode],
    queryFn: () => getDpadActivePrescriptionsByCourse(courseCode!),
    enabled: !!courseCode,
  });

  const prescriptionIndex = coursePrescriptions.findIndex(
    (p: any) => p.prescription_id === prescriptionId || p.id === prescriptionId
  );
  const prescriptionNumberDisplay = prescriptionIndex !== -1 ? `#${prescriptionIndex + 1}` : "";

  // Load selection datasets from backend
  const { data: selectionData } = useQuery({
    queryKey: ["dpadFormSelectionData"],
    queryFn: getFormSelectionData,
  });

  // Load Submissions
  const { data: submissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["dpadSubmissions", username],
    queryFn: () => getDpadSubmittedAnswers(username),
    enabled: !!username,
  });

  const drugs = rxDetails?.drugs_list 
    ? rxDetails.drugs_list.split(',').map((d: string) => d.trim()).filter(Boolean)
    : [];
  const displayDrugs = getPrescriptionDisplayDrugs(rxDetails);

  // Helper to translate labels dynamically or fallback to database string value
  const getOptionLabel = (field: string, val: string) => {
    const list = OPTIONS_MAPPINGS[field];
    if (!list) return val;
    const found = list.find((item) => item.value === val);
    return found ? found.label[lang] : val;
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload: any) => submitDpadAnswer(username, payload),
    onSuccess: (data) => {
      if (data.status === "error") {
        toast({
          variant: "destructive",
          title: "Setup Required",
          description: data.message || "No answer key configured for this prescription cover.",
        });
        return;
      }

      refetchSubmissions();
      queryClient.invalidateQueries({ queryKey: ["dpadOverallGrade", username] });
      
      const isCorrect = data.answer_status === "Correct";
      setValidationResults({
        incorrectFields: data.incorrect_values || [],
        isSubmitted: true,
        isCorrect
      });

      if (isCorrect) {
        toast({
          title: "🎉 " + t.correctMsg,
          className: "bg-emerald-600 text-white",
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ " + t.incorrectMsg,
        });
        setShowIncorrectDialog(true);
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "API Connection Error",
        description: "Failed to submit answers to the server.",
      });
    }
  });

  // Auto fill date/name if selected
  useEffect(() => {
    if (rxDetails) {
      setFormState((prev) => ({
        ...prev,
        date: rxDetails.pres_date || "",
      }));
    }
  }, [rxDetails]);

  if (rxLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 w-full">
        <Skeleton className="h-10 w-1/4 bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full bg-muted" />
          <Skeleton className="h-[500px] w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (!rxDetails) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Prescription not found</h2>
        <Button onClick={() => router.push("/dashboard/d-pad")}>{t.backToList}</Button>
      </div>
    );
  }

  // Check if a cover is already correct
  const getCoverStatus = (index: number) => {
    const coverId = `Cover${index + 1}`;
    const found = submissions.find(
      (sub: any) => 
        sub.pres_id === prescriptionId && 
        sub.cover_id === coverId && 
        sub.answer_status === "Correct"
    );
    return found ? "Correct" : "Pending";
  };

  const handleSelectDrug = (index: number) => {
    setSelectedDrugIndex(index);
    setValidationResults({ incorrectFields: [], isSubmitted: false, isCorrect: false });
    setShowIncorrectDialog(false);
    
    // Check if there is already a completed correct submission to auto-populate
    const coverId = `Cover${index + 1}`;
    const correctSubmission = submissions.find(
      (sub: any) => 
        sub.pres_id === prescriptionId && 
        sub.cover_id === coverId && 
        sub.answer_status === "Correct"
    );

    if (correctSubmission) {
      setFormState({
        date: correctSubmission.date || rxDetails.pres_date || "",
        name: correctSubmission.name || "",
        drug_name: correctSubmission.drug_name || "",
        drug_type: correctSubmission.drug_type || "",
        drug_qty: correctSubmission.drug_qty || "",
        morning_qty: correctSubmission.morning_qty || "",
        afternoon_qty: correctSubmission.afternoon_qty || "",
        evening_qty: correctSubmission.evening_qty || "",
        night_qty: correctSubmission.night_qty || "",
        meal_type: correctSubmission.meal_type || "",
        using_type: correctSubmission.using_type || "",
        at_a_time: correctSubmission.at_a_time || "",
        hour_qty: correctSubmission.hour_qty || "",
        additional_description: correctSubmission.additional_description || "",
      });
    } else {
      // Clear form except date and prefill patient name
      setFormState({
        date: rxDetails.pres_date || "",
        name: rxDetails.Pres_Name || "",
        drug_name: "",
        drug_type: "",
        drug_qty: "",
        morning_qty: "-",
        afternoon_qty: "-",
        evening_qty: "-",
        night_qty: "-",
        meal_type: "",
        using_type: "",
        at_a_time: "-",
        hour_qty: "-",
        additional_description: "-",
      });
    }
  };

  const handleSubmitLabel = () => {
    if (selectedDrugIndex === null) return;
    const coverId = `Cover${selectedDrugIndex + 1}`;

    const payload = {
      prescriptionID: prescriptionId,
      coverID: coverId,
      ...formState,
      // Pass mapping fields just in case backend expects specific format
      "envelope-date": formState.date,
      "envelope-name": formState.name,
      "envelope-drug-name": formState.drug_name,
      "envelope-dosage-form": formState.drug_type,
      "envelope-drug-quantity": formState.drug_qty,
      "envelope-morning-quantity": formState.morning_qty,
      "envelope-afternoon-quantity": formState.afternoon_qty,
      "envelope-evening-quantity": formState.evening_qty,
      "envelope-night-quantity": formState.night_qty,
      "envelope-meal-type": formState.meal_type,
      "envelope-using-frequency": formState.using_type,
      "envelope-at-a-time": formState.at_a_time,
      "envelope-using-frequency-hour": formState.hour_qty,
      "envelope-additional-instruction": formState.additional_description
    };

    submitMutation.mutate(payload);
  };

  const isFieldIncorrect = (fieldName: string) => {
    return validationResults.isSubmitted && validationResults.incorrectFields.includes(fieldName);
  };

  const isFieldCorrect = (fieldName: string) => {
    return validationResults.isSubmitted && !validationResults.incorrectFields.includes(fieldName) && !validationResults.isCorrect;
  };

  // Fetch dialog configuration based on the active field
  const getActiveDialogProps = () => {
    if (!activeDialogField) return null;

    let title = "";
    let options: string[] = [];
    let onSelect = (val: string) => {};
    let fieldKey: string | undefined = undefined;

    switch (activeDialogField) {
      case "name":
        title = t.patientName;
        const nameOptions = selectionData?.name ? [...selectionData.name] : [];
        if (rxDetails?.Pres_Name && !nameOptions.some(n => n.toLowerCase() === rxDetails.Pres_Name.toLowerCase())) {
          nameOptions.unshift(rxDetails.Pres_Name);
        }
        options = nameOptions;
        onSelect = (val) => setFormState({ ...formState, name: val });
        break;
      case "drug_name":
        title = t.drugName;
        const drugOptions = selectionData?.drug_name ? [...selectionData.drug_name] : [];
        [...drugs, ...displayDrugs].forEach((d: string) => {
          if (d) {
            const clean = d.replace(/\s+(bd|tds|daily|mane|nocte|stat|8h|6h|12h|qds)$/i, '').trim();
            if (clean && !drugOptions.some(item => item.toLowerCase() === clean.toLowerCase())) {
              drugOptions.unshift(clean);
            }
            if (!drugOptions.some(item => item.toLowerCase() === d.toLowerCase())) {
              drugOptions.unshift(d);
            }
          }
        });
        options = drugOptions;
        onSelect = (val) => setFormState({ ...formState, drug_name: val });
        break;
      case "drug_type":
        title = t.dosageForm;
        options = selectionData?.drug_type || OPTIONS_MAPPINGS.dosageForm.map((item) => item.value);
        fieldKey = "dosageForm";
        onSelect = (val) => setFormState({ ...formState, drug_type: val });
        break;
      case "drug_qty":
        title = t.quantity;
        options = selectionData?.drug_qty?.length 
          ? selectionData.drug_qty 
          : ["5", "10", "14", "15", "20", "21", "28", "30", "50", "60", "90", "100", "120"];
        onSelect = (val) => setFormState({ ...formState, drug_qty: val });
        break;
      case "morning_qty":
        title = t.morning;
        options = selectionData?.morning_qty?.length 
          ? (selectionData.morning_qty.includes("-") ? selectionData.morning_qty : ["-", ...selectionData.morning_qty])
          : OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, morning_qty: val });
        break;
      case "afternoon_qty":
        title = t.afternoon;
        options = selectionData?.afternoon_qty?.length 
          ? (selectionData.afternoon_qty.includes("-") ? selectionData.afternoon_qty : ["-", ...selectionData.afternoon_qty])
          : OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, afternoon_qty: val });
        break;
      case "evening_qty":
        title = t.evening;
        options = selectionData?.evening_qty?.length 
          ? (selectionData.evening_qty.includes("-") ? selectionData.evening_qty : ["-", ...selectionData.evening_qty])
          : OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, evening_qty: val });
        break;
      case "night_qty":
        title = t.night;
        options = selectionData?.night_qty?.length 
          ? (selectionData.night_qty.includes("-") ? selectionData.night_qty : ["-", ...selectionData.night_qty])
          : OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, night_qty: val });
        break;
      case "meal_type":
        title = t.mealType;
        options = selectionData?.meal_type?.length ? selectionData.meal_type : OPTIONS_MAPPINGS.mealType.map((item) => item.value);
        fieldKey = "mealType";
        onSelect = (val) => setFormState({ ...formState, meal_type: val });
        break;
      case "using_type":
        title = t.frequency;
        options = selectionData?.using_type?.length ? selectionData.using_type : OPTIONS_MAPPINGS.usingFrequency.map((item) => item.value);
        fieldKey = "usingFrequency";
        onSelect = (val) => setFormState({ ...formState, using_type: val });
        break;
      case "at_a_time":
        title = t.atATime;
        options = selectionData?.at_a_time?.length 
          ? (selectionData.at_a_time.includes("-") ? selectionData.at_a_time : ["-", ...selectionData.at_a_time])
          : ["-", "1", "2", "1/2"];
        onSelect = (val) => setFormState({ ...formState, at_a_time: val });
        break;
      case "hour_qty":
        title = t.hourQty;
        options = selectionData?.hour_qty?.length 
          ? (selectionData.hour_qty.includes("-") ? selectionData.hour_qty : ["-", ...selectionData.hour_qty])
          : ["-", "4", "6", "8", "12"];
        onSelect = (val) => setFormState({ ...formState, hour_qty: val });
        break;
      case "additional_description":
        title = t.additionalInstructions;
        const addOptions = selectionData?.additional_description ? [...selectionData.additional_description] : ["Drink plenty of water", "Complete the full course"];
        if (!addOptions.includes("-")) {
          addOptions.unshift("-");
        }
        options = addOptions;
        onSelect = (val) => setFormState({ ...formState, additional_description: val });
        break;
    }

    return { title, options, onSelect, fieldKey };
  };

  const dialogProps = getActiveDialogProps();

  return (
    <div className="p-4 md:p-8 space-y-6 w-full pb-24">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button variant="ghost" onClick={() => router.push("/dashboard/d-pad")} className="gap-2 pl-0 hover:pl-2 text-muted-foreground hover:text-foreground transition-all h-8">
              <ArrowLeft className="w-4 h-4" /> {t.backToList}
            </Button>
            {courseCode && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none text-xs px-3 py-1 shadow-xs h-8 flex items-center">
                Course: {courseCode}
              </Badge>
            )}
            <Badge variant="outline" className="font-mono font-bold text-xs text-primary border-primary/20 bg-primary/5 px-3 py-1 h-8 flex items-center gap-1.5 shadow-xs">
              <span className="text-muted-foreground font-normal">
                {prescriptionNumberDisplay ? `Prescription ${prescriptionNumberDisplay}` : "Ref"}:
              </span>
              {prescriptionId}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">{t.title}</h1>
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Prescription View */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-sm border border-border overflow-hidden bg-card">
            <div className="bg-muted/30 text-muted-foreground py-3 px-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2 text-foreground">
                <Clipboard className="w-4 h-4 text-primary" />
                Prescription Form
              </div>
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded shadow-xs">
                {prescriptionNumberDisplay ? `${prescriptionNumberDisplay} • ${prescriptionId}` : prescriptionId}
              </span>
            </div>
            <CardContent className="p-0">
              <PrescriptionPaper 
                prescription={rxDetails} 
                labels={{ patientName: t.patientName, date: t.date, age: t.age }} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Envelope Dispensing Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDrugIndex === null ? (
            <Card className="shadow-sm bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground font-headline">
                  <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {t.dispensingItems}
                </CardTitle>
                <CardDescription className="text-muted-foreground">{t.selectItemDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayDrugs.map((drugName: string, index: number) => {
                  const status = getCoverStatus(index);
                  const isCompleted = status === "Correct";
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectDrug(index)}
                      className={`w-full p-4 border rounded-xl flex items-center justify-between transition-all hover:bg-muted/50 text-left ${
                        isCompleted 
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs" 
                          : "border-border hover:border-emerald-500/50"
                      }`}
                    >
                      <div>
                        <Badge className="mb-1 bg-muted text-foreground hover:bg-muted font-semibold">
                          Cover {index + 1}
                        </Badge>
                        <h4 className="font-bold text-foreground text-sm">{drugName}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t.completed}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full border border-border">
                            {t.pending}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            /* Envelope Workbench Interface */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => setSelectedDrugIndex(null)} className="gap-1.5 shadow-xs">
                  <ArrowLeft className="w-4 h-4" /> {t.backToItems}
                </Button>
                <Badge className="bg-emerald-600 text-white font-bold px-3 py-1 text-xs">
                  Cover {selectedDrugIndex + 1}
                </Badge>
              </div>

              <Card className="shadow-sm border border-border overflow-hidden bg-card">
                <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center gap-3">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <Clipboard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground font-headline">{t.fillingLabel} Cover {selectedDrugIndex + 1}</CardTitle>
                    <CardDescription className="text-xs font-semibold text-primary font-mono">
                      {displayDrugs[selectedDrugIndex] || drugs[selectedDrugIndex]}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Label Inputs Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {t.date} *
                      </Label>
                      <Input
                        type="date"
                        value={formState.date}
                        onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                        className={`bg-background border-input text-foreground ${
                          isFieldIncorrect("date") ? "border-destructive bg-destructive/10" : isFieldCorrect("date") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      />
                    </div>

                    {/* Patient Name Button Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-muted-foreground" /> {t.patientName} *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("name")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted/50 ${
                          isFieldIncorrect("name") ? "border-destructive bg-destructive/10 font-bold" : isFieldCorrect("name") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.name || t.selectPlaceholder}</span>
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>

                    {/* Drug Name Button Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-muted-foreground" /> {t.drugName} *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("drug_name")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted/50 ${
                          isFieldIncorrect("drug_name") ? "border-destructive bg-destructive/10 font-bold" : isFieldCorrect("drug_name") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.drug_name || t.selectPlaceholder}</span>
                        <Pill className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>

                    {/* Dosage Form */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">{t.dosageForm} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("drug_type")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted/50 ${
                          isFieldIncorrect("drug_type") ? "border-destructive bg-destructive/10" : isFieldCorrect("drug_type") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{getOptionLabel("dosageForm", formState.drug_type) || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>

                    {/* Total Quantity */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {t.quantity} *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("drug_qty")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted/50 ${
                          isFieldIncorrect("drug_qty") ? "border-destructive bg-destructive/10 font-bold" : isFieldCorrect("drug_qty") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.drug_qty || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Daily Quantities layout with graphical icons */}
                  <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      {t.schedule}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Morning */}
                      <div className="bg-card p-3 rounded-lg border border-border text-center space-y-2 shadow-xs">
                        <div className="flex justify-center text-amber-500"><Sun className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-muted-foreground">{t.morning}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("morning_qty")}
                          className={`w-full h-8 text-xs bg-background border-input text-foreground hover:bg-muted ${
                            isFieldIncorrect("morning_qty") ? "border-destructive bg-destructive/10" : isFieldCorrect("morning_qty") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          {getOptionLabel("scheduleQty", formState.morning_qty) || "-"}
                        </Button>
                      </div>

                      {/* Afternoon */}
                      <div className="bg-card p-3 rounded-lg border border-border text-center space-y-2 shadow-xs">
                        <div className="flex justify-center text-orange-500"><Sun className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-muted-foreground">{t.afternoon}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("afternoon_qty")}
                          className={`w-full h-8 text-xs bg-background border-input text-foreground hover:bg-muted ${
                            isFieldIncorrect("afternoon_qty") ? "border-destructive bg-destructive/10" : isFieldCorrect("afternoon_qty") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          {getOptionLabel("scheduleQty", formState.afternoon_qty) || "-"}
                        </Button>
                      </div>

                      {/* Evening */}
                      <div className="bg-card p-3 rounded-lg border border-border text-center space-y-2 shadow-xs">
                        <div className="flex justify-center text-indigo-500"><Sunset className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-muted-foreground">{t.evening}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("evening_qty")}
                          className={`w-full h-8 text-xs bg-background border-input text-foreground hover:bg-muted ${
                            isFieldIncorrect("evening_qty") ? "border-destructive bg-destructive/10" : isFieldCorrect("evening_qty") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          {getOptionLabel("scheduleQty", formState.evening_qty) || "-"}
                        </Button>
                      </div>

                      {/* Night */}
                      <div className="bg-card p-3 rounded-lg border border-border text-center space-y-2 shadow-xs">
                        <div className="flex justify-center text-slate-500"><Moon className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-muted-foreground">{t.night}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("night_qty")}
                          className={`w-full h-8 text-xs bg-background border-input text-foreground hover:bg-muted ${
                            isFieldIncorrect("night_qty") ? "border-destructive bg-destructive/10" : isFieldCorrect("night_qty") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          {getOptionLabel("scheduleQty", formState.night_qty) || "-"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Meal and Using Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">{t.mealType} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("meal_type")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted/50 ${
                          isFieldIncorrect("meal_type") ? "border-destructive bg-destructive/10" : isFieldCorrect("meal_type") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{getOptionLabel("mealType", formState.meal_type) || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">{t.frequency} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("using_type")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted/50 ${
                          isFieldIncorrect("using_type") ? "border-destructive bg-destructive/10" : isFieldCorrect("using_type") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{getOptionLabel("usingFrequency", formState.using_type) || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Sinhala / Special instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">{t.atATime} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("at_a_time")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted ${
                          isFieldIncorrect("at_a_time") ? "border-destructive bg-destructive/10" : isFieldCorrect("at_a_time") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.at_a_time || "Select quantity..."}</span>
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">{t.hourQty} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("hour_qty")}
                        className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted ${
                          isFieldIncorrect("hour_qty") ? "border-destructive bg-destructive/10" : isFieldCorrect("hour_qty") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.hour_qty || "Select hours..."}</span>
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Additional Instructions */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /> {t.additionalInstructions}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveDialogField("additional_description")}
                      className={`w-full justify-between bg-background border-input text-foreground hover:bg-muted ${
                        isFieldIncorrect("additional_description") ? "border-destructive bg-destructive/10" : isFieldCorrect("additional_description") ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      <span className="truncate">{formState.additional_description || t.selectPlaceholder}</span>
                      <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Button>
                  </div>

                  {/* Form Footer Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setFormState({
                          date: rxDetails.pres_date || "",
                          name: rxDetails.Pres_Name || "",
                          drug_name: "",
                          drug_type: "",
                          drug_qty: "",
                          morning_qty: "-",
                          afternoon_qty: "-",
                          evening_qty: "-",
                          night_qty: "-",
                          meal_type: "",
                          using_type: "",
                          at_a_time: "-",
                          hour_qty: "-",
                          additional_description: "-"
                        });
                        setValidationResults({ incorrectFields: [], isSubmitted: false, isCorrect: false });
                      }}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> {t.reset}
                    </Button>
                    <Button 
                      onClick={handleSubmitLabel} 
                      disabled={submitMutation.isPending} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-xs"
                    >
                      {submitMutation.isPending ? "Validating..." : t.checkAnswer}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Reusable Searchable Dialog for Option Selection */}
      {activeDialogField && dialogProps && (
        <SearchableSelectDialog
          isOpen={!!activeDialogField}
          onClose={() => setActiveDialogField(null)}
          title={dialogProps.title}
          options={dialogProps.options}
          onSelect={dialogProps.onSelect}
          lang={lang}
          fieldKey={dialogProps.fieldKey}
          searchPlaceholder={t.searchPlaceholder}
          closeText={t.close}
        />
      )}

      {/* Incorrect Fields Report Dialog */}
      <Dialog open={showIncorrectDialog} onOpenChange={setShowIncorrectDialog}>
        <DialogContent className="bg-card border-border text-card-foreground w-full max-w-md rounded-xl p-6 shadow-xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 animate-pulse">
              <Clipboard className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold text-destructive font-headline">
              {t.incorrectFieldsTitle}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {t.incorrectFieldsDesc}
            </p>
          </DialogHeader>

          <div className="my-4 space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {validationResults.incorrectFields.map((field) => {
              const labelKey = FIELD_LABEL_KEYS[field] || field;
              const fieldLabel = t[labelKey as keyof typeof t] || field;
              return (
                <div key={field} className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-medium">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-sm font-medium">{fieldLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-full" onClick={() => setShowIncorrectDialog(false)}>
                {t.close}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
