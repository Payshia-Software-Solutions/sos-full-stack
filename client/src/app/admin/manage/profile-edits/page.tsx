"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPendingProfileEditRequests, getStudentDetailsByUsername, approveProfileEditRequest, rejectProfileEditRequest } from "@/lib/actions/users";
import type { UserFullDetails } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, XCircle, UserCheck, AlertTriangle, ArrowRight, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AdminProfileEditsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [currentProfiles, setCurrentProfiles] = useState<Record<string, UserFullDetails>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingProfileEditRequests();
      setRequests(data);
      
      // Fetch current profiles for all request usernames
      const profiles: Record<string, UserFullDetails> = {};
      await Promise.all(
        data.map(async (req) => {
          if (req.username && !profiles[req.username]) {
            try {
              const profile = await getStudentDetailsByUsername(req.username);
              profiles[req.username] = profile;
            } catch (err) {
              console.error(`Failed to fetch profile for ${req.username}`, err);
            }
          }
        })
      );
      setCurrentProfiles(profiles);
    } catch (error) {
      console.error(error);
      toast({ description: "Failed to fetch profile edit requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    if (!user?.name) return;
    setActioning(true);
    try {
      await approveProfileEditRequest(id, user.name);
      toast({ description: "Profile edit request approved and user updated successfully!" });
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast({ description: "Failed to approve request", variant: "destructive" });
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async (id: number) => {
    setActioning(true);
    try {
      await rejectProfileEditRequest(id);
      toast({ description: "Profile edit request rejected." });
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast({ description: "Failed to reject request", variant: "destructive" });
    } finally {
      setActioning(false);
    }
  };

  const renderComparisonRow = (label: string, fieldName: string, reqVal: any, currentVal: any) => {
    const isDifferent = String(reqVal || '').trim() !== String(currentVal || '').trim();
    
    return (
      <tr className={`border-b border-slate-800 text-sm ${isDifferent ? 'bg-emerald-500/5' : ''}`}>
        <td className="py-3 px-4 font-medium text-slate-400 w-1/4">{label}</td>
        <td className="py-3 px-4 text-slate-300 w-3/8">
          {currentVal || <span className="text-slate-500 italic">Not set</span>}
        </td>
        <td className="py-3 px-4 text-right w-1/12">
          {isDifferent && <ArrowRight className="h-4 w-4 text-yellow-500 inline" />}
        </td>
        <td className={`py-3 px-4 font-semibold w-3/8 ${isDifferent ? 'text-emerald-400' : 'text-slate-400'}`}>
          {reqVal || <span className="text-slate-500 italic">Not set</span>}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-20 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-headline font-semibold">Profile Edit Requests</h1>
        <p className="text-muted-foreground">Review and approve changes submitted by students.</p>
      </header>

      {requests.length === 0 ? (
        <Card className="border-0 shadow-lg text-center p-8 bg-slate-900/40">
          <div className="mx-auto bg-green-500/10 p-4 rounded-full w-fit mb-4">
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-xl">All Caught Up!</CardTitle>
          <CardDescription className="mt-2">There are no pending profile edit requests to review.</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => {
            const currentProfile = currentProfiles[req.username];
            return (
              <Card key={req.id} className="shadow-md hover:shadow-lg transition-all duration-200 border-slate-800">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{req.full_name || req.username}</h3>
                      <p className="text-xs text-muted-foreground">Username / Index No: <strong className="text-slate-300">{req.username}</strong></p>
                      <p className="text-xs text-muted-foreground">Submitted: {new Date(req.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>
                      Compare & Review
                    </Button>
                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(req.id)}>
                      Quick Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" /> Review Profile Changes
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Comparing changes for <strong>{selectedRequest?.username}</strong>. Highlighted rows represent values requested to change.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="my-4 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                    <th className="py-3 px-4">Field</th>
                    <th className="py-3 px-4">Current Value</th>
                    <th className="py-3 px-4"></th>
                    <th className="py-3 px-4 text-emerald-400 font-bold">Requested Value</th>
                  </tr>
                </thead>
                <tbody>
                  {renderComparisonRow("First Name", "first_name", selectedRequest.first_name, currentProfiles[selectedRequest.username]?.first_name)}
                  {renderComparisonRow("Last Name", "last_name", selectedRequest.last_name, currentProfiles[selectedRequest.username]?.last_name)}
                  {renderComparisonRow("Full Name", "full_name", selectedRequest.full_name, currentProfiles[selectedRequest.username]?.full_name)}
                  {renderComparisonRow("Name with Initials", "name_with_initials", selectedRequest.name_with_initials, currentProfiles[selectedRequest.username]?.name_with_initials)}
                  {renderComparisonRow("Name on Certificate", "name_on_certificate", selectedRequest.name_on_certificate, currentProfiles[selectedRequest.username]?.name_on_certificate)}
                  {renderComparisonRow("NIC Number", "nic", selectedRequest.nic, currentProfiles[selectedRequest.username]?.nic)}
                  {renderComparisonRow("Birthday", "birth_day", selectedRequest.birth_day ? selectedRequest.birth_day.split('T')[0] : null, currentProfiles[selectedRequest.username]?.birth_day ? currentProfiles[selectedRequest.username].birth_day.split('T')[0] : null)}
                  {renderComparisonRow("Gender", "gender", selectedRequest.gender, currentProfiles[selectedRequest.username]?.gender)}
                  {renderComparisonRow("Civil Status", "civil_status", selectedRequest.civil_status, currentProfiles[selectedRequest.username]?.civil_status)}
                  {renderComparisonRow("Email Address", "e_mail", selectedRequest.e_mail, currentProfiles[selectedRequest.username]?.e_mail)}
                  {renderComparisonRow("Primary Phone", "telephone_1", selectedRequest.telephone_1, currentProfiles[selectedRequest.username]?.telephone_1)}
                  {renderComparisonRow("Secondary Phone", "telephone_2", selectedRequest.telephone_2, currentProfiles[selectedRequest.username]?.telephone_2)}
                  {renderComparisonRow("Address Line 1", "address_line_1", selectedRequest.address_line_1, currentProfiles[selectedRequest.username]?.address_line_1)}
                  {renderComparisonRow("Address Line 2", "address_line_2", selectedRequest.address_line_2, currentProfiles[selectedRequest.username]?.address_line_2)}
                  {renderComparisonRow("City", "city", selectedRequest.city, currentProfiles[selectedRequest.username]?.city)}
                  {renderComparisonRow("District ID", "district", selectedRequest.district, currentProfiles[selectedRequest.username]?.district)}
                  {renderComparisonRow("Postal Code", "postal_code", selectedRequest.postal_code, currentProfiles[selectedRequest.username]?.postal_code)}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
            <Button variant="ghost" className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 gap-1.5" disabled={actioning} onClick={() => handleReject(selectedRequest.id)}>
              <XCircle className="w-4 h-4" /> Reject Request
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-1.5" disabled={actioning} onClick={() => handleApprove(selectedRequest.id)}>
              <UserCheck className="w-4 h-4" /> Approve & Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
