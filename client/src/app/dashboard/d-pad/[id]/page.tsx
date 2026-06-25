"use client";

import { useState, useEffect } from "react";
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
import { 
  getDpadPrescriptionDetails, 
  getDpadSubmittedAnswers, 
  submitDpadAnswer,
  getFormSelectionData
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

  const filteredOptions = options.filter((opt) => {
    const label = getOptionLabel(opt).toLowerCase();
    const val = opt.toLowerCase();
    const query = searchQuery.toLowerCase();
    return label.includes(query) || val.includes(query);
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 w-full h-full max-w-none m-0 rounded-none border-none flex flex-col p-4 left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-lg sm:h-auto sm:rounded-xl sm:border sm:p-6 sm:m-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-100">{title}</DialogTitle>
        </DialogHeader>
        
        {/* Search bar inside popup */}
        <div className="relative my-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {/* Dynamic Grid Options list */}
        <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar sm:max-h-[300px]">
          {filteredOptions.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-6">No results found.</p>
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
                  className="w-full justify-start text-left bg-slate-950/45 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:text-white py-6 text-sm"
                >
                  {getOptionLabel(opt)}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800 mt-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-slate-400 hover:text-white w-full sm:w-auto">{closeText}</Button>
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
    morning_qty: "",
    afternoon_qty: "",
    evening_qty: "",
    night_qty: "",
    meal_type: "",
    using_type: "",
    at_a_time: "",
    hour_qty: "",
    additional_description: "",
  });

  // Load Prescription details
  const { data: rxDetails, isLoading: rxLoading } = useQuery({
    queryKey: ["dpadPrescriptionDetails", prescriptionId],
    queryFn: () => getDpadPrescriptionDetails(prescriptionId),
    enabled: !!prescriptionId,
  });

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

  const drugs = rxDetails?.drugs_list ? rxDetails.drugs_list.split(", ") : [];

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
          title: "ðŸŽ‰ " + t.correctMsg,
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
        <Skeleton className="h-10 w-1/4 bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full bg-slate-800" />
          <Skeleton className="h-[500px] w-full bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!rxDetails) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Prescription not found</h2>
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
      // Clear form except date
      setFormState({
        date: rxDetails.pres_date || "",
        name: "",
        drug_name: "",
        drug_type: "",
        drug_qty: "",
        morning_qty: "",
        afternoon_qty: "",
        evening_qty: "",
        night_qty: "",
        meal_type: "",
        using_type: "",
        at_a_time: "",
        hour_qty: "",
        additional_description: "",
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
        options = selectionData?.name || [rxDetails.Pres_Name];
        onSelect = (val) => setFormState({ ...formState, name: val });
        break;
      case "drug_name":
        title = t.drugName;
        options = selectionData?.drug_name || drugs;
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
        options = selectionData?.drug_qty || ["5", "10", "15", "20", "30"];
        onSelect = (val) => setFormState({ ...formState, drug_qty: val });
        break;
      case "morning_qty":
        title = t.morning;
        options = OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, morning_qty: val });
        break;
      case "afternoon_qty":
        title = t.afternoon;
        options = OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, afternoon_qty: val });
        break;
      case "evening_qty":
        title = t.evening;
        options = OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, evening_qty: val });
        break;
      case "night_qty":
        title = t.night;
        options = OPTIONS_MAPPINGS.scheduleQty.map((item) => item.value);
        fieldKey = "scheduleQty";
        onSelect = (val) => setFormState({ ...formState, night_qty: val });
        break;
      case "meal_type":
        title = t.mealType;
        options = selectionData?.meal_type || OPTIONS_MAPPINGS.mealType.map((item) => item.value);
        fieldKey = "mealType";
        onSelect = (val) => setFormState({ ...formState, meal_type: val });
        break;
      case "using_type":
        title = t.frequency;
        options = selectionData?.using_type || OPTIONS_MAPPINGS.usingFrequency.map((item) => item.value);
        fieldKey = "usingFrequency";
        onSelect = (val) => setFormState({ ...formState, using_type: val });
        break;
      case "at_a_time":
        title = t.atATime;
        options = selectionData?.at_a_time || ["-", "1", "2", "1/2"];
        onSelect = (val) => setFormState({ ...formState, at_a_time: val });
        break;
      case "hour_qty":
        title = t.hourQty;
        options = selectionData?.hour_qty || ["-", "4", "6", "8", "12"];
        onSelect = (val) => setFormState({ ...formState, hour_qty: val });
        break;
      case "additional_description":
        title = t.additionalInstructions;
        options = selectionData?.additional_description || ["Drink plenty of water", "Complete the full course"];
        onSelect = (val) => setFormState({ ...formState, additional_description: val });
        break;
    }

    return { title, options, onSelect, fieldKey };
  };

  const dialogProps = getActiveDialogProps();

  return (
    <div className="p-4 md:p-8 space-y-6 w-full pb-24">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Button variant="ghost" onClick={() => router.push("/dashboard/d-pad")} className="gap-2 mb-2 pl-0 hover:pl-2 text-slate-350 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" /> {t.backToList}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold font-headline text-slate-100">{t.title}</h1>
          <p className="text-slate-400 text-sm">{t.subtitle}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Prescription View */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-lg border-2 border-slate-800 overflow-hidden bg-slate-900/40">
            <div className="bg-slate-950 text-slate-300 py-3 px-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b border-slate-800">
              <Clipboard className="w-4 h-4 text-emerald-400" />
              Prescription Form
            </div>
            <CardContent className="p-6 md:p-8 bg-slate-900/60 relative">
              <div className="space-y-6 font-sans text-slate-200">
                <div className="text-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black font-headline text-emerald-400">
                    {rxDetails.doctor_name || "Dr. Sunil Rathnayaka"}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                    {rxDetails.Pres_Method || "Registered Practitioner"}
                  </p>
                  <p className="text-[10px] text-slate-500">Reg No: MCQ/93801</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-800 pb-4">
                  <div>
                    <span className="font-semibold text-slate-400 block uppercase text-[10px]">{t.patientName}</span>
                    <span className="font-bold text-sm text-slate-100">{rxDetails.Pres_Name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-400 block uppercase text-[10px]">{t.date}</span>
                    <span className="font-mono text-slate-100">{rxDetails.pres_date}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block uppercase text-[10px]">{t.age}</span>
                    <span className="font-bold text-slate-100">{rxDetails.Pres_Age} Years</span>
                  </div>
                </div>

                {/* Rx symbol & list */}
                <div className="relative pl-16 min-h-[180px]">
                  <span className="absolute left-0 top-0 text-5xl font-serif text-slate-700/40 select-none font-bold italic">Rx</span>
                  <div className="space-y-4 pt-2 font-mono text-sm leading-relaxed text-slate-100">
                    {drugs.map((drug: string, i: number) => (
                      <div key={i} className="border-b border-dashed border-slate-800 pb-2">
                        <p className="font-bold text-slate-100">{drug}</p>
                        <p className="text-xs text-slate-400 italic">
                          Dispense as Cover {i + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right text-xs pt-4 border-t border-slate-800 text-slate-400">
                  <p className="italic font-serif text-slate-355">S. Rathnayaka</p>
                  <p className="text-[9px] uppercase tracking-wider font-semibold">Authorized Signature</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Envelope Dispensing Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDrugIndex === null ? (
            <Card className="shadow-md bg-slate-900/30 border-slate-850">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-slate-100 font-headline">
                  <Pill className="w-5 h-5 text-emerald-500" />
                  {t.dispensingItems}
                </CardTitle>
                <CardDescription className="text-slate-400">{t.selectItemDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {drugs.map((drugName: string, index: number) => {
                  const status = getCoverStatus(index);
                  const isCompleted = status === "Correct";
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectDrug(index)}
                      className={`w-full p-4 border rounded-xl flex items-center justify-between transition-all hover:bg-slate-900/40 text-left ${
                        isCompleted 
                          ? "bg-emerald-950/20 border-emerald-800 shadow-sm" 
                          : "border-slate-800 hover:border-emerald-500/50"
                      }`}
                    >
                      <div>
                        <Badge className="mb-1 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-800">
                          Cover {index + 1}
                        </Badge>
                        <h4 className="font-bold text-slate-100">{drugName}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t.completed}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-750">
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
                <Button variant="outline" size="sm" onClick={() => setSelectedDrugIndex(null)} className="gap-1.5 bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4" /> {t.backToItems}
                </Button>
                <Badge className="bg-emerald-600 text-white font-bold px-3 py-1 text-xs">
                  Cover {selectedDrugIndex + 1}
                </Badge>
              </div>

              <Card className="shadow-lg border-2 border-emerald-500/20 overflow-hidden bg-slate-900/30">
                <CardHeader className="bg-emerald-950/25 border-b border-slate-800/60 flex flex-row items-center gap-3">
                  <div className="bg-emerald-600 text-white p-2 rounded-lg">
                    <Clipboard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-100 font-headline">{t.fillingLabel} Cover {selectedDrugIndex + 1}</CardTitle>
                    <CardDescription className="text-xs font-semibold text-emerald-400 font-mono">
                      {drugs[selectedDrugIndex]}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Label Inputs Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-350 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> {t.date} *
                      </Label>
                      <Input
                        type="date"
                        value={formState.date}
                        onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                        className={`bg-slate-950/50 border-slate-800 text-slate-100 ${
                          isFieldIncorrect("date") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("date") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      />
                    </div>

                    {/* Patient Name Button Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-350 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" /> {t.patientName} *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("name")}
                        className={`w-full justify-between bg-slate-950/50 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                          isFieldIncorrect("name") ? "border-rose-600 bg-rose-950/20 font-bold" : isFieldCorrect("name") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.name || t.selectPlaceholder}</span>
                        <User className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>

                    {/* Drug Name Button Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-355 flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-slate-500" /> {t.drugName} *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("drug_name")}
                        className={`w-full justify-between bg-slate-950/50 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                          isFieldIncorrect("drug_name") ? "border-rose-600 bg-rose-950/20 font-bold" : isFieldCorrect("drug_name") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.drug_name || t.selectPlaceholder}</span>
                        <Pill className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>

                    {/* Dosage Form */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-350">{t.dosageForm} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("drug_type")}
                        className={`w-full justify-between bg-slate-950/50 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                          isFieldIncorrect("drug_type") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("drug_type") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{getOptionLabel("dosageForm", formState.drug_type) || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>

                    {/* Total Quantity */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-350 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {t.quantity} *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("drug_qty")}
                        className={`w-full justify-between bg-slate-950/50 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                          isFieldIncorrect("drug_qty") ? "border-rose-600 bg-rose-950/20 font-bold" : isFieldCorrect("drug_qty") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.drug_qty || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Daily Quantities layout with graphical icons */}
                  <div className="bg-slate-950/50 p-4 rounded-xl space-y-3 border border-slate-850">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      {t.schedule}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Morning */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-2">
                        <div className="flex justify-center text-amber-500"><Sun className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-slate-400">{t.morning}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("morning_qty")}
                          className={`w-full h-8 text-xs bg-slate-950 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                            isFieldIncorrect("morning_qty") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("morning_qty") ? "border-emerald-600 bg-emerald-950/20" : ""
                          }`}
                        >
                          {getOptionLabel("scheduleQty", formState.morning_qty) || "-"}
                        </Button>
                      </div>

                      {/* Afternoon */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-2">
                        <div className="flex justify-center text-orange-400"><Sun className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-slate-400">{t.afternoon}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("afternoon_qty")}
                          className={`w-full h-8 text-xs bg-slate-950 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                            isFieldIncorrect("afternoon_qty") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("afternoon_qty") ? "border-emerald-600 bg-emerald-950/20" : ""
                          }`}
                        >
                          {getOptionLabel("scheduleQty", formState.afternoon_qty) || "-"}
                        </Button>
                      </div>

                      {/* Evening */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-2">
                        <div className="flex justify-center text-indigo-400"><Sunset className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-slate-400">{t.evening}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("evening_qty")}
                          className={`w-full h-8 text-xs bg-slate-950 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                            isFieldIncorrect("evening_qty") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("evening_qty") ? "border-emerald-600 bg-emerald-950/20" : ""
                          }`}
                        >
                          {getOptionLabel("scheduleQty", formState.evening_qty) || "-"}
                        </Button>
                      </div>

                      {/* Night */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-2">
                        <div className="flex justify-center text-slate-300"><Moon className="w-5 h-5" /></div>
                        <Label className="text-[10px] font-bold text-slate-400">{t.night}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveDialogField("night_qty")}
                          className={`w-full h-8 text-xs bg-slate-950 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                            isFieldIncorrect("night_qty") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("night_qty") ? "border-emerald-600 bg-emerald-950/20" : ""
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
                      <Label className="text-xs font-bold text-slate-350">{t.mealType} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("meal_type")}
                        className={`w-full justify-between bg-slate-950/50 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                          isFieldIncorrect("meal_type") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("meal_type") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{getOptionLabel("mealType", formState.meal_type) || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-350">{t.frequency} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("using_type")}
                        className={`w-full justify-between bg-slate-950/50 border-slate-800 text-slate-100 hover:bg-slate-900 ${
                          isFieldIncorrect("using_type") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("using_type") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{getOptionLabel("usingFrequency", formState.using_type) || t.selectPlaceholder}</span>
                        <Clock className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Sinhala / Special instructions (à¶¶à·�à¶œà·’à¶±à·Š / à¶´à·�à¶º __ à·€à¶»à¶šà·Š) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/45 rounded-xl border border-slate-850">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black text-slate-300">{t.atATime} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("at_a_time")}
                        className={`w-full justify-between bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800 ${
                          isFieldIncorrect("at_a_time") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("at_a_time") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.at_a_time || "Select quantity..."}</span>
                        <Clock className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-black text-slate-300">{t.hourQty} *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveDialogField("hour_qty")}
                        className={`w-full justify-between bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-850 ${
                          isFieldIncorrect("hour_qty") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("hour_qty") ? "border-emerald-600 bg-emerald-950/20" : ""
                        }`}
                      >
                        <span className="truncate">{formState.hour_qty || "Select hours..."}</span>
                        <Clock className="w-4 h-4 text-slate-550 shrink-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Additional Instructions */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-355 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> {t.additionalInstructions}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveDialogField("additional_description")}
                      className={`w-full justify-between bg-slate-950/50 border-slate-800 text-slate-100 hover:bg-slate-900/60 ${
                        isFieldIncorrect("additional_description") ? "border-rose-600 bg-rose-950/20" : isFieldCorrect("additional_description") ? "border-emerald-600 bg-emerald-950/20" : ""
                      }`}
                    >
                      <span className="truncate">{formState.additional_description || t.selectPlaceholder}</span>
                      <HelpCircle className="w-4 h-4 text-slate-550 shrink-0" />
                    </Button>
                  </div>

                  {/* Form Footer Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setFormState({
                          date: rxDetails.pres_date || "", name: "", drug_name: "", drug_type: "", drug_qty: "",
                          morning_qty: "", afternoon_qty: "", evening_qty: "", night_qty: "",
                          meal_type: "", using_type: "", at_a_time: "", hour_qty: "", additional_description: ""
                        });
                        setValidationResults({ incorrectFields: [], isSubmitted: false, isCorrect: false });
                      }}
                      className="gap-2 bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-350"
                    >
                      <RotateCcw className="w-4 h-4" /> {t.reset}
                    </Button>
                    <Button 
                      onClick={handleSubmitLabel} 
                      disabled={submitMutation.isPending} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-md"
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 w-full max-w-md rounded-xl p-6">
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-950 flex items-center justify-center border border-red-800 animate-pulse">
              <Clipboard className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-500 font-headline">
              {t.incorrectFieldsTitle}
            </DialogTitle>
            <p className="text-slate-450 text-sm">
              {t.incorrectFieldsDesc}
            </p>
          </DialogHeader>

          <div className="my-4 space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {validationResults.incorrectFields.map((field) => {
              const labelKey = FIELD_LABEL_KEYS[field] || field;
              const fieldLabel = t[labelKey as keyof typeof t] || field;
              return (
                <div key={field} className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">{fieldLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <DialogClose asChild>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" onClick={() => setShowIncorrectDialog(false)}>
                {t.close}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
