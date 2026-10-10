"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit2, Save, X } from "lucide-react";
import { LMS_API_URL } from "@/lib/config";

export function UserActionDialog({ user, courses, onSuccess }: { user: any, courses: any[], onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [selectedCourse, setSelectedCourse] = useState(user.selected_course || "");
  const [loadingAction, setLoadingAction] = useState<'reject' | 'activate' | 'update' | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEnrollments = async () => {
    if (!user.index_number) return;
    setLoadingEnrollments(true);
    try {
      const res = await fetch(`${LMS_API_URL}/studentEnrollments/user/${user.index_number}`);
      if (res.ok) {
        const data = await res.json();
        // The API returns an array directly, or { data: [...] }
        if (Array.isArray(data)) {
          setEnrollments(data);
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          setEnrollments(data.data);
        } else {
          setEnrollments([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEnrollments();
    }
  }, [isOpen, user.id]);

  const handleUpdate = async () => {
    setLoadingAction('update');
    try {
      const res = await fetch(`${LMS_API_URL}/temp-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUser),
      });
      if (res.ok) {
        toast({ description: "User details updated successfully." });
        setIsEditing(false);
        onSuccess();
      } else {
        const data = await res.json();
        toast({ description: `Failed: ${data.error}`, variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Network error", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to reject ${user.first_name}?`)) return;
    setLoadingAction('reject');
    try {
      const res = await fetch(`${LMS_API_URL}/temp-users/${user.id}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        toast({ description: "User rejected." });
        setIsOpen(false);
        onSuccess();
      } else {
        toast({ description: "Failed to reject user", variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Network error", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReverse = async () => {
    if (!confirm('Are you sure you want to reverse this activation? This will delete the user account and course enrollment.')) {
      return;
    }
    setLoadingAction('reverse');
    try {
      const res = await fetch(`${LMS_API_URL}/temp-users/${user.id}/reverse`, {
        method: "POST",
      });
      if (res.ok) {
        toast({ description: "Activation reversed successfully." });
        setIsOpen(false);
        onSuccess();
      } else {
        const data = await res.json();
        toast({ description: `Reverse failed: ${data.error}`, variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Network error", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleActivate = async () => {
    if (!selectedCourse) {
      toast({ description: "Please select a course/batch first", variant: "destructive" });
      return;
    }
    setLoadingAction('activate');
    setActivationError(null);
    try {
      const res = await fetch(`${LMS_API_URL}/temp-users/${user.id}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentBatch: selectedCourse }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ description: `User activated successfully. Index: ${data.username}` });
        setIsOpen(false);
        onSuccess();
      } else {
        setActivationError(data.details || data.error || 'Unknown error');
      }
    } catch (error) {
      setActivationError("Activation failed due to a network error");
    } finally {
      setLoadingAction(null);
    }
  };

  const slips = user.slip_paths ? user.slip_paths.split(',') : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setIsEditing(false);
        setEditedUser(user);
        setActivationError(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant={user.aprroved_status === 'Approved' ? "secondary" : "default"}>
          {user.aprroved_status === 'Approved' ? 'View Details' : 'Review & Activate'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">User Information | REF #{user.id}</DialogTitle>
          </div>
        </DialogHeader>

        {user.existing_approved_index && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-destructive text-sm font-semibold flex items-center gap-2 mt-2">
            ⚠️ This student is already activated with Index Number: {user.existing_approved_index}. You cannot activate this duplicate registration.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Email Address</Label>
                {isEditing ? (
                  <Input value={editedUser.email_address || ''} onChange={e => setEditedUser({...editedUser, email_address: e.target.value})} className="mt-1" />
                ) : (
                  <div className="font-medium mt-1">{editedUser.email_address}</div>
                )}
                <Badge variant={user.aprroved_status === 'Approved' ? 'default' : 'destructive'} className="mt-2">
                  {user.aprroved_status}
                </Badge>
              </div>
              
              <div>
                <Label className="text-muted-foreground text-xs">Student Details</Label>
                {isEditing ? (
                  <div className="space-y-2 mt-1">
                    <Input placeholder="First Name" value={editedUser.first_name || ''} onChange={e => setEditedUser({...editedUser, first_name: e.target.value})} />
                    <Input placeholder="Last Name" value={editedUser.last_name || ''} onChange={e => setEditedUser({...editedUser, last_name: e.target.value})} />
                    <Input placeholder="NIC Number" value={editedUser.nic_number || ''} onChange={e => setEditedUser({...editedUser, nic_number: e.target.value})} />
                    <Input placeholder="Address L1" value={editedUser.address_l1 || ''} onChange={e => setEditedUser({...editedUser, address_l1: e.target.value})} />
                    <Input placeholder="Address L2" value={editedUser.address_l2 || ''} onChange={e => setEditedUser({...editedUser, address_l2: e.target.value})} />
                  </div>
                ) : (
                  <div className="font-medium mt-1">
                    <div>{editedUser.first_name} {editedUser.last_name}</div>
                    <div className="text-sm">{editedUser.nic_number}</div>
                    <div className="text-sm text-muted-foreground">{editedUser.address_l1}, {editedUser.address_l2}</div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Phone Number</Label>
                {isEditing ? (
                  <div className="space-y-2 mt-1">
                    <Input placeholder="Mobile" value={editedUser.phone_number || ''} onChange={e => setEditedUser({...editedUser, phone_number: e.target.value})} />
                    <Input placeholder="WhatsApp" value={editedUser.whatsapp_number || ''} onChange={e => setEditedUser({...editedUser, whatsapp_number: e.target.value})} />
                  </div>
                ) : (
                  <div className="font-medium mt-1">
                    <div>📞 (+94) {editedUser.phone_number}</div>
                    <div>💬 (+94) {editedUser.whatsapp_number}</div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">City / District</Label>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="City" value={editedUser.city || ''} onChange={e => setEditedUser({...editedUser, city: e.target.value})} />
                    <Input placeholder="District" value={editedUser.district || ''} onChange={e => setEditedUser({...editedUser, district: e.target.value})} />
                  </div>
                ) : (
                  <div className="font-medium mt-1">{editedUser.city || '-'}, {editedUser.district || '-'}</div>
                )}
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs">Full Name</Label>
                {isEditing ? (
                  <Input value={editedUser.full_name || ''} onChange={e => setEditedUser({...editedUser, full_name: e.target.value})} className="mt-1" />
                ) : (
                  <div className="font-medium mt-1">{editedUser.full_name || '-'}</div>
                )}
              </div>
              
              <div>
                <Label className="text-muted-foreground text-xs">Name with Initials</Label>
                {isEditing ? (
                  <Input value={editedUser.name_with_initials || ''} onChange={e => setEditedUser({...editedUser, name_with_initials: e.target.value})} className="mt-1" />
                ) : (
                  <div className="font-medium mt-1">{editedUser.name_with_initials || '-'}</div>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Name on Certificate</Label>
                {isEditing ? (
                  <Input value={editedUser.name_on_certificate || ''} onChange={e => setEditedUser({...editedUser, name_on_certificate: e.target.value})} className="mt-1" />
                ) : (
                  <div className="font-medium mt-1">{editedUser.name_on_certificate || '-'}</div>
                )}
              </div>
            </div>

            {user.aprroved_status !== 'Approved' ? (
              <div className="flex items-center gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-muted-foreground text-xs">Paid Amount</Label>
                  <div className="font-bold text-lg">{editedUser.paid_amount || '0.00'} LKR</div>
                </div>
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs mb-1 block">Select Batch / Course</Label>
                  <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course.course_code} value={course.course_code}>
                          {course.course_code} - {course.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <Label className="text-muted-foreground text-xs mb-2 block font-semibold uppercase">Enrollments</Label>
                {loadingEnrollments ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading enrollments...
                  </div>
                ) : enrollments.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {enrollments.map((en: any, idx: number) => {
                      const courseInfo = courses.find((c: any) => c.course_code === en.course_code);
                      return (
                        <li key={idx} className="text-sm font-medium text-primary">
                          {en.course_code} {courseInfo ? `- ${courseInfo.course_name}` : ''}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No active enrollments found.</div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Slips & Actions */}
          <div className="flex flex-col gap-4 border-l pl-6">
            <div className="flex justify-between items-center">
               <Label className="font-semibold text-sm">Slips</Label>
               {isEditing ? (
                 <div className="flex gap-2">
                   <Button size="sm" variant="outline" onClick={() => {setIsEditing(false); setEditedUser(user);}}><X className="h-4 w-4 mr-1"/> Cancel</Button>
                   <Button size="sm" onClick={handleUpdate} disabled={loadingAction === 'update'}>
                     {loadingAction === 'update' ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <Save className="h-4 w-4 mr-1"/>}
                     Save
                   </Button>
                 </div>
               ) : (
                 <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                   <Edit2 className="h-4 w-4 mr-1"/> Edit
                 </Button>
               )}
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {slips.length > 0 ? slips.map((slip: string, i: number) => {
                const fullSlipUrl = `${process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk'}${slip.replace('..', '')}`;
                return (
                <div key={i} className="border rounded-md p-2 flex flex-col gap-2 items-center text-center">
                  <a href={fullSlipUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    {slip.toLowerCase().endsWith('.pdf') ? (
                      <div className="h-24 bg-muted flex items-center justify-center rounded-md border text-sm flex-col gap-2 hover:bg-muted/80 transition-colors">
                        📄 View PDF
                      </div>
                    ) : (
                      <div className="relative h-32 w-full">
                        <img 
                          src={fullSlipUrl} 
                          alt="Slip" 
                          className="object-cover rounded-md h-full w-full hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}
                  </a>
                  <span className="text-xs text-muted-foreground truncate w-full" title={slip}>
                    {slip.split('/').pop()}
                  </span>
                </div>
              )}) : (
                <div className="text-sm text-muted-foreground text-center p-8 border border-dashed rounded-lg">
                  No Slips Uploaded
                </div>
              )}
            </div>

            {user.aprroved_status !== 'Approved' && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleReject}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'reject' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reject
                </Button>
                 {!user.existing_approved_index && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                    onClick={handleActivate}
                    disabled={loadingAction !== null || !courses.some((c: any) => c.course_code === selectedCourse)}
                  >
                    {loadingAction === 'activate' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Approve & Activate
                  </Button>
                )}
              </div>
            )}

            {user.aprroved_status === 'Approved' && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => {
                    window.open(`/admin/manage/payment-update?student_id=${user.index_number}`, '_blank');
                  }}
                >
                  Update Payment
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  onClick={handleReverse}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'reverse' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reverse Activation
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={!!activationError} onOpenChange={(open) => { if (!open) setActivationError(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
               Activation Failed
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-foreground mt-2">
              {activationError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setActivationError(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
