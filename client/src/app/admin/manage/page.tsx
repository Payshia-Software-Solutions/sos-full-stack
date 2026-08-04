"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, UserPlus, CreditCard, ClipboardList, Truck, GraduationCap, Award, Settings, KeyRound, FileSignature, Banknote, Video, Search, UserCheck, Megaphone, UserCog, BookOpen, BarChart, Cake, Library, Percent, Briefcase, BookText, BrainCircuit, ClipboardCheck, FileCheck, Users, MessageSquare, ShieldCheck, Star, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { CeylonPharmacyIcon, DPadIcon, HunterProIcon, LuckyWheelIcon, MediMindIcon, PharmaHunterIcon, PharmaReaderIcon, WinPharmaIcon, WordPalletIcon } from "@/components/icons/module-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ManagementTask = {
    title: string;
    description: string;
    icon: React.ReactElement;
    href: string;
    category: 'Student Management' | 'Financial' | 'Content & System' | 'Certificates & Convocation' | 'Games Management';
};

const managementTasks: ManagementTask[] = [
  {
    title: "Lead Management",
    description: "Track student inquiries, manage conversion stages, and view CRM statistics.",
    icon: <UserPlus className="w-8 h-8 text-white" />,
    href: "/admin/manage/leads",
    category: "Student Management"
  },
  {
    title: "Account Activation",
    description: "Review pending registrations and activate student accounts.",
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    href: "/admin/account-activation",
    category: "Student Management"
  },
  {
    title: "Profile Edit Requests",
    description: "Review and approve/reject student profile update requests.",
    icon: <UserCog className="w-8 h-8 text-white" />,
    href: "/admin/manage/profile-edits",
    category: "Student Management"
  },
  {
    title: "SMS Templates",
    description: "Manage and edit automated SMS message content.",
    icon: <MessageSquare className="w-8 h-8 text-white" />,
    href: "/admin/sms-templates",
    category: "Content & System"
  },
  {
    title: "Announcements",
    description: "Create, edit, and publish announcements.",
    icon: <Megaphone className="w-8 h-8 text-white" />,
    href: "/admin/announcements",
    category: "Content & System"
  },
  {
    title: "Find Student",
    description: "Search for a student to get a full overview.",
    icon: <Search className="w-8 h-8 text-white" />,
    href: "/admin/quick-links",
    category: "Student Management"
  },
  {
    title: "Enroll Students",
    description: "Manage student course enrollments and batches.",
    icon: <UserPlus className="w-8 h-8 text-white" />,
    href: "/admin/manage/enroll",
    category: "Student Management"
  },
  {
    title: "Course Completion Report",
    description: "View and export completion status for courses and batches.",
    icon: <ClipboardCheck className="w-8 h-8 text-white" />,
    href: "/admin/manage/course-completion-report",
    category: "Student Management"
  },
  {
    title: "Student Contact Report",
    description: "View and export student contact information by batch.",
    icon: <Users className="w-8 h-8 text-white" />,
    href: "/admin/manage/student-contact-report",
    category: "Student Management"
  },
  {
    title: "Issued Certificates Report",
    description: "A specialized report mapping students to their issued document IDs.",
    icon: <FileCheck className="w-8 h-8 text-white" />,
    href: "/admin/manage/issued-certificates-report",
    category: "Certificates & Convocation"
  },
   {
    title: "Manage Batches",
    description: "View, add, and edit batch information and fees.",
    icon: <BookOpen className="w-8 h-8 text-white" />,
    href: "/admin/manage/batches",
    category: "Content & System"
  },
  {
    title: "Manage Courses",
    description: "Manage parent courses and their details.",
    icon: <Library className="w-8 h-8 text-white" />,
    href: "/admin/manage/courses",
    category: "Content & System"
  },
  {
    title: "Manage Criteria",
    description: "Manage certificate evaluation criteria.",
    icon: <ClipboardCheck className="w-8 h-8 text-white" />,
    href: "/admin/manage/criteria",
    category: "Content & System"
  },
   {
    title: "Commissions Management",
    description: "Set up staff rates and management commission hierarchies.",
    icon: <Percent className="w-8 h-8 text-white" />,
    href: "/admin/manage/commissions",
    category: "Financial"
  },
  {
    title: "Payment Updates",
    description: "Record and verify student payments.",
    icon: <CreditCard className="w-8 h-8 text-white" />,
    href: "/admin/manage/payment-update",
    category: "Financial"
  },
   {
    title: "Payment Requests",
    description: "View and manage incoming payment requests.",
    icon: <Banknote className="w-8 h-8 text-white" />,
    href: "/admin/manage/payment-requests",
    category: "Financial"
  },
  {
    title: "Assignment Info",
    description: "View and manage assignment submissions.",
    icon: <ClipboardList className="w-8 h-8 text-white" />,
    href: "/admin/manage/assignment-info",
    category: "Student Management"
  },
  {
    title: "Delivery Management",
    description: "Manage delivery orders and configure delivery packages.",
    icon: <Truck className="w-8 h-8 text-white" />,
    href: "/admin/manage/delivery-orders",
    category: "Content & System"
  },
  {
    title: "Create Delivery Order",
    description: "Create a new delivery order for a student.",
    icon: <Truck className="w-8 h-8 text-white" />,
    href: "/admin/manage/create-delivery-order",
    category: "Content & System"
  },
  {
    title: "Generate Confirmation Letter",
    description: "Generate a proof of registration letter for a student.",
    icon: <FileSignature className="w-8 h-8 text-white" />,
    href: "/admin/manage/generate-confirmation-letter",
    category: "Student Management"
  },
  {
    title: "Convocation",
    description: "Handle registrations for convocation ceremonies.",
    icon: <GraduationCap className="w-8 h-8 text-white" />,
    href: "/admin/manage/convocation",
    category: "Certificates & Convocation"
  },
  {
    title: "Convocation Ceremonies",
    description: "Manage convocation event details.",
    icon: <GraduationCap className="w-8 h-8 text-white" />,
    href: "/admin/manage/convocation-ceremonies",
    category: "Certificates & Convocation"
  },
  {
    title: "Convocation Certificate Generation",
    description: "Issue certificates for convocation bookings.",
    icon: <Award className="w-8 h-8 text-white" />,
    href: "/admin/manage/convocation-generate",
    category: "Certificates & Convocation"
  },
  {
    title: "Certificate Orders",
    description: "Process and manage requests for certificates.",
    icon: <Award className="w-8 h-8 text-white" />,
    href: "/admin/manage/certificate-orders",
    category: "Certificates & Convocation"
  },
   {
    title: "Bulk Name Update",
    description: "Update student names on certificates in bulk.",
    icon: <FileSignature className="w-8 h-8 text-white" />,
    href: "/admin/manage/bulk-name-update",
    category: "Certificates & Convocation"
  },
  {
    title: "Convocation Name Edits",
    description: "Edit names for convocation certificates.",
    icon: <FileSignature className="w-8 h-8 text-white" />,
    href: "/admin/manage/convocation-name-edits",
    category: "Certificates & Convocation"
  },
  {
    title: "Certificate Order Name Edits",
    description: "Edit names for all certificate orders.",
    icon: <FileSignature className="w-8 h-8 text-white" />,
    href: "/admin/manage/certificate-order-name-edits",
    category: "Certificates & Convocation"
  },
   {
    title: "Convocation Orders",
    description: "View convocation orders by course and session.",
    icon: <ClipboardList className="w-8 h-8 text-white" />,
    href: "/admin/manage/convocation-orders",
    category: "Certificates & Convocation"
  },
  {
    title: "Generate Certificate",
    description: "Manually generate a certificate for an eligible student.",
    icon: <Award className="w-8 h-8 text-white" />,
    href: "/admin/manage/generate-certificate",
    category: "Certificates & Convocation"
  },
  {
    title: "Transcript Designer",
    description: "Design and manage transcript templates for courses.",
    icon: <FileSignature className="w-8 h-8 text-white" />,
    href: "/admin/manage/transcript-design",
    category: "Certificates & Convocation"
  },
   {
    title: "Manage Course Content",
    description: "Add, edit, or delete course videos, pdfs and links.",
    icon: <Video className="w-8 h-8 text-white" />,
    href: "/admin/recordings",
    category: "Content & System"
  },
  {
    title: "Password Reset",
    description: "Reset a student's account password.",
    icon: <KeyRound className="w-8 h-8 text-white" />,
    href: "/admin/manage/password-reset",
    category: "Student Management"
  },
   {
    title: "Login As Student",
    description: "View the dashboard as a specific student.",
    icon: <UserCheck className="w-8 h-8 text-white" />,
    href: "/admin/manage/login-as",
    category: "Student Management"
  },
  {
    title: "Books Management",
    description: "Add, edit, and manage book index.",
    icon: <BookOpen className="w-8 h-8 text-white" />,
    href: "/admin/manage/bnf",
    category: "Content & System"
  },
  {
    title: "Student Analytics",
    description: "View student data by location and demographics.",
    icon: <BarChart className="w-8 h-8 text-white" />,
    href: "/admin/manage/analytics",
    category: "Student Management"
  },
    {
    title: "Analytics Report",
    description: "Generate and filter detailed student reports.",
    icon: <FileSignature className="w-8 h-8 text-white" />,
    href: "/admin/manage/analytics/report",
    category: "Student Management"
  },
  {
    title: "Birthday Wishes",
    description: "Send birthday greetings to students.",
    icon: <Cake className="w-8 h-8 text-white" />,
    href: "/admin/birthday-wishes",
    category: "Student Management"
  },
  {
    title: "General Settings",
    description: "Configure system-wide settings for the admin panel.",
    icon: <Settings className="w-8 h-8 text-white" />,
    href: "/admin/settings",
    category: "Content & System"
  },
  // Game Management
  {
    title: "Ceylon Pharmacy",
    description: "Manage Ceylon Pharmacy game settings.",
    icon: <CeylonPharmacyIcon className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/ceylon-pharmacy",
    category: "Games Management"
  },
  {
    title: "Pharma Hunter",
    description: "Manage Pharma Hunter game settings.",
    icon: <PharmaHunterIcon className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/pharma-hunter",
    category: "Games Management"
  },
   {
    title: "Pharma Hunter Pro",
    description: "Manage Pharma Hunter Pro game settings.",
    icon: <HunterProIcon className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/pharma-hunter-pro",
    category: "Games Management"
  },
  {
    title: "WinPharma",
    description: "Manage WinPharma game settings.",
    icon: <WinPharmaIcon className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/winpharma",
    category: "Games Management"
  },

  {
    title: "Pharma Reader",
    description: "Manage Pharma Reader game settings.",
    icon: <PharmaReaderIcon className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/pharma-reader",
    category: "Games Management"
  },
  {
    title: "Word Pallet",
    description: "Manage Word Pallet game settings.",
    icon: <WordPalletIcon className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/word-pallet",
    category: "Games Management"
  },
  {
    title: "Sentence Builder",
    description: "Manage Sentence Builder game levels and sentences.",
    icon: <BookText className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/sentence-builder",
    category: "Games Management"
  },
  {
    title: "MediMind",
    description: "Configure all aspects of the MediMind game.",
    icon: <BrainCircuit className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/medimind",
    category: "Games Management"
  },
  {
    title: "D-Pad",
    description: "Manage D-Pad game prescriptions and answer keys.",
    icon: <DPadIcon className="w-8 h-8 text-white"/>,
    href: "/admin/manage/games/d-pad",
    category: "Games Management"
  },
];

const categoryColors: Record<ManagementTask['category'], string> = {
    'Student Management': 'from-blue-400 to-indigo-500',
    'Certificates & Convocation': 'from-purple-400 to-pink-500',
    'Financial': 'from-green-400 to-teal-500',
    'Content & System': 'from-orange-400 to-rose-500',
    'Games Management': 'from-yellow-400 to-amber-500',
}

const TaskCard = ({ task, onClick }: { task: ManagementTask; onClick?: () => void }) => (
    <Link href={task.href} onClick={onClick} className="group block h-full">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 h-full border-0">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-lg bg-gradient-to-br", categoryColors[task.category])}>
                    {task.icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
            </CardContent>
        </Card>
    </Link>
);


export default function AdminManagePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [frequencies, setFrequencies] = useState<Record<string, number>>({});

    useEffect(() => {
        const stored = localStorage.getItem('admin_task_clicks');
        if (stored) {
            try {
                setFrequencies(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleTaskClick = (href: string) => {
        const updated = {
            ...frequencies,
            [href]: (frequencies[href] || 0) + 1
        };
        setFrequencies(updated);
        localStorage.setItem('admin_task_clicks', JSON.stringify(updated));
    };

    const handleResetFrequencies = () => {
        localStorage.removeItem('admin_task_clicks');
        setFrequencies({});
    };

    const frequentlyUsedTasks = useMemo(() => {
        return managementTasks
            .filter(task => (frequencies[task.href] || 0) > 0)
            .sort((a, b) => (frequencies[b.href] || 0) - (frequencies[a.href] || 0))
            .slice(0, 6); // Show top 6 frequently used tasks
    }, [frequencies]);

    const filteredTasks = useMemo(() => {
        if (!searchQuery) return managementTasks;
        const lower = searchQuery.toLowerCase();
        return managementTasks.filter(task => 
            task.title.toLowerCase().includes(lower) || 
            task.description.toLowerCase().includes(lower)
        );
    }, [searchQuery]);

    const groupedTasks = useMemo(() => {
        return filteredTasks.reduce((acc, task) => {
            if (!acc[task.category]) {
                acc[task.category] = [];
            }
            acc[task.category].push(task);
            return acc;
        }, {} as Record<string, ManagementTask[]>);
    }, [filteredTasks]);

    const categoryOrder: (ManagementTask['category'])[] = [
        'Student Management',
        'Games Management',
        'Certificates & Convocation',
        'Financial',
        'Content & System'
    ];


  return (
    <div className="p-4 md:p-8 space-y-8 pb-20">
      <header className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Management Tasks</h1>
          <p className="text-muted-foreground">Access various administrative tools and actions.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9 bg-slate-950 border-slate-800 text-slate-100" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {searchQuery === "" && frequentlyUsedTasks.length > 0 && (
        <section className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Star className="h-5 w-5 fill-current text-yellow-500" />
              <h2 className="text-xl font-bold font-headline">Frequently Used</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFrequencies}
              className="text-muted-foreground hover:text-white"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" /> Reset
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frequentlyUsedTasks.map(task => (
              <TaskCard key={`freq-${task.href}`} task={task} onClick={() => handleTaskClick(task.href)} />
            ))}
          </div>
        </section>
      )}
      
      <div className="space-y-10">
        {categoryOrder.map(category => (
            groupedTasks[category] && groupedTasks[category].length > 0 && (
                <section key={category}>
                    <div className="flex items-center gap-3 mb-4">
                        <UserCog className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-semibold font-headline">{category}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupedTasks[category].sort((a,b) => a.title.localeCompare(b.title)).map(task => (
                            <TaskCard key={task.href} task={task} onClick={() => handleTaskClick(task.href)} />
                        ))}
                    </div>
                </section>
            )
        ))}
        {filteredTasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
                No tasks matching "{searchQuery}"
            </div>
        )}
      </div>
    </div>
  );
}
