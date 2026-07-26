"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentDetailsByUsername, getProfileEditRequestStatus, submitProfileEditRequest, getStudentFullInfo } from "@/lib/actions/users";
import type { UserFullDetails } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Phone, MapPin, Mail, Calendar, AlertCircle, Edit, BookOpen, Gamepad2, CreditCard, Award, Target, Heart, Truck, CheckCircle2, XCircle } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserFullDetails | null>(null);
  const [pendingRequest, setPendingRequest] = useState<any | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [balance, setBalance] = useState<any | null>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    civil_status: "",
    first_name: "",
    last_name: "",
    gender: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    district: 0,
    postal_code: "",
    telephone_1: "",
    telephone_2: "",
    nic: "",
    e_mail: "",
    birth_day: "",
    full_name: "",
    name_with_initials: "",
    name_on_certificate: ""
  });

  const fetchData = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      // Load student full info (using single unified endpoint)
      const fullInfo = await getStudentFullInfo(user.username);
      
      // Fallback details if studentInfo is empty (e.g. for Admin/Staff)
      const details = fullInfo.studentInfo || await getStudentDetailsByUsername(user.username);
      setProfile(details);
      
      // Populate form data
      setFormData({
        civil_status: details.civil_status || "",
        first_name: details.first_name || "",
        last_name: details.last_name || "",
        gender: details.gender || "",
        address_line_1: details.address_line_1 || "",
        address_line_2: details.address_line_2 || "",
        city: details.city || "",
        district: details.district || 0,
        postal_code: details.postal_code || "",
        telephone_1: details.telephone_1 || "",
        telephone_2: details.telephone_2 || "",
        nic: details.nic || "",
        e_mail: details.e_mail || "",
        birth_day: details.birth_day ? details.birth_day.split('T')[0] : "",
        full_name: details.full_name || "",
        name_with_initials: details.name_with_initials || "",
        name_on_certificate: details.name_on_certificate || ""
      });

      // Check request status
      const request = await getProfileEditRequestStatus(user.username);
      if (request && request.active_status === "Pending") {
        setPendingRequest(request);
      } else {
        setPendingRequest(null);
      }

      // Populate enrollments (convert enrollments map to array)
      if (fullInfo.studentEnrollments) {
        setEnrollments(Object.values(fullInfo.studentEnrollments));
      } else {
        setEnrollments([]);
      }

      // Populate balance
      setBalance(fullInfo.studentBalance || null);
      setPendingPayments(fullInfo.pendingPaymentRequests || []);

    } catch (error) {
      console.error(error);
      toast({ description: "Failed to load profile details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) return;
    setSubmitting(true);

    try {
      await submitProfileEditRequest({
        username: user.username,
        ...formData
      });
      toast({ description: "Profile edit request submitted successfully. Waiting for admin approval." });
      setEditMode(false);
      fetchData();
    } catch (error: any) {
      toast({ description: error.message || "Failed to submit request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20 w-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-semibold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and view your activity reports.</p>
        </div>
        {!editMode && !pendingRequest && (
          <Button onClick={() => setEditMode(true)} className="gap-2">
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
        )}
      </header>

      {pendingRequest && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Profile Update Request Pending</h4>
            <p className="text-xs text-yellow-500/80 mt-1">
              You submitted an edit request on {new Date(pendingRequest.updated_at).toLocaleDateString()}. Admin approval is required before your profile can be updated.
            </p>
          </div>
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleSubmit}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Request Profile Changes</CardTitle>
              <CardDescription>Update your personal information. Changes will require admin approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-1 text-primary flex items-center gap-2">
                  <User className="w-4 h-4" /> Name Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name_with_initials">Name with Initials</Label>
                    <Input id="name_with_initials" value={formData.name_with_initials} onChange={(e) => setFormData({...formData, name_with_initials: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name_on_certificate">Name on Certificate</Label>
                    <Input id="name_on_certificate" value={formData.name_on_certificate} onChange={(e) => setFormData({...formData, name_on_certificate: e.target.value})} required />
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold border-b pb-1 text-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nic">NIC Number</Label>
                    <Input id="nic" value={formData.nic} onChange={(e) => setFormData({...formData, nic: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birth_day">Birthday</Label>
                    <Input id="birth_day" type="date" value={formData.birth_day} onChange={(e) => setFormData({...formData, birth_day: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="civil_status">Civil Status</Label>
                    <select id="civil_status" value={formData.civil_status} onChange={(e) => setFormData({...formData, civil_status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold border-b pb-1 text-primary flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-3">
                    <Label htmlFor="e_mail">Email Address</Label>
                    <Input id="e_mail" type="email" value={formData.e_mail} onChange={(e) => setFormData({...formData, e_mail: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="telephone_1">Primary Phone</Label>
                    <Input id="telephone_1" value={formData.telephone_1} onChange={(e) => setFormData({...formData, telephone_1: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="telephone_2">Secondary Phone</Label>
                    <Input id="telephone_2" value={formData.telephone_2} onChange={(e) => setFormData({...formData, telephone_2: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold border-b pb-1 text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address_line_1">Address Line 1</Label>
                    <Input id="address_line_1" value={formData.address_line_1} onChange={(e) => setFormData({...formData, address_line_1: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address_line_2">Address Line 2</Label>
                    <Input id="address_line_2" value={formData.address_line_2} onChange={(e) => setFormData({...formData, address_line_2: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} required />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <div className="space-y-8">
          {/* Profile Details Card */}
          <Card className="shadow-md">
            <CardHeader className="border-b border-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{profile?.full_name}</CardTitle>
                  <CardDescription>Registered Student ID: {profile?.student_id}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-1 text-primary flex items-center gap-2">
                    <User className="w-4 h-4" /> Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Name with Initials:</span> <span className="font-medium text-right">{profile?.name_with_initials}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Name on Certificate:</span> <span className="font-medium text-right">{profile?.name_on_certificate}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Gender:</span> <span className="font-medium">{profile?.gender}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Civil Status:</span> <span className="font-medium">{profile?.civil_status}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">NIC Number:</span> <span className="font-medium">{profile?.nic}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Birthday:</span> <span className="font-medium">{profile?.birth_day ? new Date(profile.birth_day).toLocaleDateString() : '-'}</span></div>
                  </div>
                </div>

                {/* Contact & Address */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-1 text-primary flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact & Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email:</span> <span className="font-medium text-right">{profile?.e_mail}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Primary Phone:</span> <span className="font-medium">{profile?.telephone_1}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Secondary Phone:</span> <span className="font-medium">{profile?.telephone_2 || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address:</span> 
                      <span className="font-medium text-right max-w-[200px]">
                        {profile?.address_line_1}, {profile?.address_line_2 ? profile.address_line_2 + ',' : ''} {profile?.city} (District: {profile?.district})
                      </span>
                    </div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Postal Code:</span> <span className="font-medium">{profile?.postal_code}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fees & Payments Card */}
          <Card className="shadow-md">
            <CardHeader className="border-b border-slate-800/40">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Fees & Payments Summary
              </CardTitle>
              <CardDescription>Summary of course fees, paid amounts, and outstanding dues.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {balance ? (
                <div className="space-y-6">
                  {/* Summary row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                      <p className="text-xs text-muted-foreground">Total Fee</p>
                      <p className="text-2xl font-bold text-slate-100 mt-1">LKR {(balance.totalPaymentAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                      <p className="text-xs text-muted-foreground">Total Paid</p>
                      <p className="text-2xl font-bold text-green-500 mt-1">LKR {(balance.TotalStudentPaymentRecords || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                      <p className="text-xs text-muted-foreground">Due Balance</p>
                      <p className="text-2xl font-bold text-red-500 mt-1">LKR {(balance.studentBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                  </div>

                  {/* Payment receipts list */}
                  {balance.paymentRecords && Object.values(balance.paymentRecords).length > 0 && (
                    <div className="pt-4 border-t border-slate-800/40 space-y-3">
                      <h4 className="text-sm font-bold text-slate-200">Official Payment Receipts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.values(balance.paymentRecords).map((rec: any) => (
                          <div key={rec.id} className="flex justify-between items-center p-3.5 rounded-lg bg-slate-950/20 border border-slate-800 text-xs">
                            <div>
                              <p className="font-bold text-slate-200">{rec.receipt_number}</p>
                              <p className="text-slate-400 mt-0.5">Date: {rec.paid_date} | {rec.payment_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-500">LKR {parseFloat(rec.paid_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Approved</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending payment slips list */}
                  {pendingPayments.length > 0 && (
                    <div className="pt-4 border-t border-slate-800/40 space-y-3">
                      <h4 className="text-sm font-bold text-slate-200">Pending Slip Verification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingPayments.map((req: any) => (
                          <div key={req.id} className="flex justify-between items-center p-3.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-xs">
                            <div>
                              <p className="font-bold text-yellow-500">Ref: {req.payment_reference || req.unique_number}</p>
                              <p className="text-slate-400 mt-0.5">Submitted: {new Date(req.created_at).toLocaleDateString()} | Bank: {req.bank === "1" ? "BOC" : req.bank || "-"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-yellow-500">LKR {parseFloat(req.paid_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                              <p className="text-[10px] text-yellow-500/70 mt-0.5">Pending Approval</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-6">No payment records found.</p>
              )}
            </CardContent>
          </Card>

          {/* Courses & Performance details stack */}
          {enrollments.map((course: any) => (
            <div key={course.course_code} className="space-y-6">
              <div className="border-l-4 border-primary pl-4 py-1 mt-8">
                <h2 className="text-2xl font-bold text-slate-100">{course.batch_name || course.course_code}</h2>
                <p className="text-sm text-muted-foreground">Course Code: {course.course_code} | Registered on: {new Date(course.created_at).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Games performance card */}
                <Card className="shadow-md">
                  <CardHeader className="border-b border-slate-800/40">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-primary" /> Game Progress & Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ceylon Pharmacy */}
                    <div className="p-4 rounded-lg bg-slate-950/30 border border-slate-800 space-y-2">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-500" /> Ceylon Pharmacy</h4>
                      <p className="text-xs text-muted-foreground">Patients Saved: <strong className="text-slate-100">{course.ceylon_pharmacy?.recoveredCount || 0}</strong></p>
                    </div>

                    {/* Pharma Hunter (MediMind) */}
                    <div className="p-4 rounded-lg bg-slate-950/30 border border-slate-800 space-y-2">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><Target className="w-4 h-4 text-purple-400" /> Pharma Hunter</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Correct answers: <strong className="text-slate-100">{course.pharma_hunter?.correctCount || 0}</strong></p>
                        <p>Progress: <strong className="text-slate-100">{course.pharma_hunter?.ProgressValue || 0}%</strong></p>
                      </div>
                    </div>

                    {/* Pharma Hunter Pro */}
                    <div className="p-4 rounded-lg bg-slate-950/30 border border-slate-800 space-y-2">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><Target className="w-4 h-4 text-emerald-400" /> Pharma Hunter Pro</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Progress: <strong className="text-slate-100">{course.pharma_hunter_pro?.progressValue || 0}%</strong></p>
                        <p>Gems / Coins: <strong className="text-slate-100">{course.pharma_hunter_pro?.gemCount || 0} / {course.pharma_hunter_pro?.coinCount || 0}</strong></p>
                      </div>
                    </div>

                    {/* Medi Mind */}
                    <div className="p-4 rounded-lg bg-slate-950/30 border border-slate-800 space-y-2">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><Gamepad2 className="w-4 h-4 text-blue-400" /> Medi Mind</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Completed: <strong className="text-slate-100">{course.medi_mind?.completedTasks || 0} / {course.medi_mind?.totalTasks || 0}</strong></p>
                        <p>Progress: <strong className="text-slate-100">{course.medi_mind?.progressPercentage || 0}%</strong></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam & Assignment results */}
                <Card className="shadow-md">
                  <CardHeader className="border-b border-slate-800/40">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" /> Exam & Assignment Grades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-lg border border-slate-800">
                      <span className="text-sm text-muted-foreground font-medium">Average Grade:</span>
                      <strong className="text-lg text-primary">{course.assignment_grades?.average_grade || "0.00"}%</strong>
                    </div>

                    {course.assignment_grades?.assignments?.length > 0 ? (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                        {course.assignment_grades.assignments.map((assign: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-800/40">
                            <span className="text-slate-300">{assign.assignment_name}</span>
                            <span className="font-bold text-slate-200">{assign.grade}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No assignments recorded.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Delivery orders */}
                <Card className="shadow-md lg:col-span-2">
                  <CardHeader className="border-b border-slate-800/40">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" /> Study Packs & Delivery Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {course.deliveryOrders?.length > 0 ? (
                      <div className="space-y-4">
                        {course.deliveryOrders.map((order: any) => (
                          <div key={order.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg bg-slate-950/20 border border-slate-800 gap-3">
                            <div>
                              <h4 className="text-sm font-bold text-slate-200">{order.delivery_title}</h4>
                              <p className="text-xs text-slate-400">Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
                              {order.tracking_number && <p className="text-xs text-slate-400">Tracking: <strong className="text-slate-300">{order.tracking_number}</strong></p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-300">LKR {order.value}</span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                order.active_status === "Delivered" ? "bg-green-500/10 text-green-500" :
                                order.active_status === "Processing" ? "bg-blue-500/10 text-blue-500" :
                                "bg-yellow-500/10 text-yellow-500"
                              }`}>
                                {order.active_status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No delivery orders found for this course.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Certificate records */}
                <Card className="shadow-md lg:col-span-2">
                  <CardHeader className="border-b border-slate-800/40">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" /> Certificate Records & Eligibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Eligibility:</span>
                      {course.certificate_eligibility ? (
                        <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Eligible</span>
                      ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1"><XCircle className="w-4 h-4" /> Ineligible</span>
                      )}
                    </div>

                    {course.certificate_eligibility_reasons?.length > 0 && (
                      <div className="text-xs text-muted-foreground bg-slate-950/20 p-3 rounded-lg border border-slate-800">
                        <p className="font-semibold text-slate-300 mb-1">Details / Reasons:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {course.certificate_eligibility_reasons.map((reason: string, rIdx: number) => (
                            <li key={rIdx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
