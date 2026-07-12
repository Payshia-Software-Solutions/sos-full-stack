"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { LMS_API_URL } from "@/lib/config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserActionDialog } from "@/components/admin/UserActionDialog";

export default function AccountActivationPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [activationLoading, setActivationLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewSlipUser, setViewSlipUser] = useState<string | null>(null);
  const [slipDetails, setSlipDetails] = useState<any[]>([]);
  const [loadingSlips, setLoadingSlips] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPending, setTotalPending] = useState(0);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedSearchInput, setApprovedSearchInput] = useState("");
  const [approvedSearchQuery, setApprovedSearchQuery] = useState("");
  const [totalApproved, setTotalApproved] = useState(0);
  const [approvedStartDate, setApprovedStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [approvedEndDate, setApprovedEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [resendingSms, setResendingSms] = useState<string | null>(null);

  const { toast } = useToast();

  const handleViewSlips = async (userId: string) => {
    setViewSlipUser(userId);
    setLoadingSlips(true);
    try {
        const res = await fetch(`${LMS_API_URL}/payment-portal-requests/by-reference/${userId}`);
        const data = await res.json();
        setSlipDetails(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error(error);
        setSlipDetails([]);
    } finally {
        setLoadingSlips(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const resPending = await fetch(`${LMS_API_URL}/temp-users/status/Not_Approved?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&start_date=${startDate}&end_date=${endDate}`);
      const dataPending = await resPending.json();
      
      if (dataPending && typeof dataPending === 'object' && !Array.isArray(dataPending) && 'data' in dataPending) {
        setPendingUsers(dataPending.data || []);
        setTotalPending(dataPending.total || 0);
      } else {
        setPendingUsers(Array.isArray(dataPending) ? dataPending : []);
        setTotalPending(0);
      }
    } catch (error) {
      console.error("Failed to fetch pending users", error);
      toast({ description: "Failed to fetch pending users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const resApproved = await fetch(`${LMS_API_URL}/temp-users/status/Approved?page=${approvedPage}&limit=${limit}&search=${encodeURIComponent(approvedSearchQuery)}&start_date=${approvedStartDate}&end_date=${approvedEndDate}`);
      const dataApproved = await resApproved.json();
      
      if (dataApproved && typeof dataApproved === 'object' && !Array.isArray(dataApproved) && 'data' in dataApproved) {
        setApprovedUsers(dataApproved.data || []);
        setTotalApproved(dataApproved.total || 0);
      } else {
        setApprovedUsers(Array.isArray(dataApproved) ? dataApproved : []);
        setTotalApproved(0);
      }
    } catch (error) {
      console.error("Failed to fetch approved users", error);
      toast({ description: "Failed to fetch approved users", variant: "destructive" });
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${LMS_API_URL}/course`);
      const data = await res.json();
      // /course endpoint returns an object keyed by course_code, convert to array
      const coursesArray = typeof data === 'object' && data !== null && !Array.isArray(data) 
        ? Object.values(data) 
        : (Array.isArray(data) ? data : []);
      
      // Sort courses in descending order by ID (newest first)
      const sortedCourses = coursesArray.sort((a: any, b: any) => b.id - a.id);
      
      setCourses(sortedCourses);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [page, searchQuery, startDate, endDate]);

  useEffect(() => {
    fetchApprovedUsers();
  }, [approvedPage, approvedSearchQuery, approvedStartDate, approvedEndDate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setApprovedSearchQuery(approvedSearchInput);
      setApprovedPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [approvedSearchInput]);

  const handleResendSMS = async (userId: string) => {
    setResendingSms(userId);
    try {
      const res = await fetch(`${LMS_API_URL}/temp-users/${userId}/resend-sms`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast({ description: "SMS resent successfully!" });
      } else {
        toast({ description: `Failed: ${data.error || 'Unknown error'}`, variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Network error", variant: "destructive" });
    } finally {
      setResendingSms(null);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleActivate = async () => {
    if (!selectedUserId) {
      toast({ description: "System error: User ID is missing.", variant: "destructive" });
      return;
    }
    if (!selectedCourse) {
      toast({ description: "Please select a course first", variant: "destructive" });
      return;
    }

    setActivationLoading(true);
    try {
      const res = await fetch(`${LMS_API_URL}/temp-users/${selectedUserId}/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentBatch: selectedCourse }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ description: `User activated successfully. Index: ${data.username}` });
        fetchUsers();
      } else {
        toast({ description: `Activation failed: ${data.error || 'Unknown error'}`, variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Activation failed due to a network error", variant: "destructive" });
    } finally {
      setActivationLoading(false);
      setSelectedUserId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Activation</h1>
          <p className="text-muted-foreground">Manage pending student registrations and activations.</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="pending">Pending Registrations</TabsTrigger>
          <TabsTrigger value="approved">Recent Activations</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Pending Registrations</CardTitle>
                <CardDescription>Review and activate students who have requested an account.</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="w-auto text-sm"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="w-auto text-sm"
                  />
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students..." 
                    className="pl-8" 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No pending registrations found.</TableCell>
                        </TableRow>
                      ) : (
                        pendingUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">#{user.id}</TableCell>
                            <TableCell>{user.first_name} {user.last_name}</TableCell>
                            <TableCell>{user.email_address}</TableCell>
                            <TableCell>{user.phone_number}</TableCell>
                            <TableCell>{user.selected_course}</TableCell>
                            <TableCell><Badge variant="destructive">{user.aprroved_status}</Badge></TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {user.slip_paths ? (
                                  <Button size="sm" variant="outline" onClick={() => handleViewSlips(user.id)}>
                                    View Slip{user.slip_paths.includes(',') ? 's' : ''}
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" disabled className="opacity-50">
                                    No Slip
                                  </Button>
                                )}
                                <UserActionDialog 
                                  user={user} 
                                  courses={courses} 
                                  onSuccess={() => { fetchPendingUsers(); fetchApprovedUsers(); }} 
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              {!loading && totalPending > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalPending)} of {totalPending} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm font-medium px-2">Page {page} of {Math.ceil(totalPending / limit)}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(Math.ceil(totalPending / limit), p + 1))}
                      disabled={page >= Math.ceil(totalPending / limit)}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Activations</CardTitle>
                <CardDescription>List of recently approved and activated student accounts.</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    value={approvedStartDate}
                    onChange={(e) => { setApprovedStartDate(e.target.value); setApprovedPage(1); }}
                    className="w-auto text-sm"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input 
                    type="date" 
                    value={approvedEndDate}
                    onChange={(e) => { setApprovedEndDate(e.target.value); setApprovedPage(1); }}
                    className="w-auto text-sm"
                  />
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search approved students..." 
                    className="pl-8" 
                    value={approvedSearchInput}
                    onChange={(e) => setApprovedSearchInput(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref ID</TableHead>
                        <TableHead>Index Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No approved accounts found.</TableCell>
                        </TableRow>
                      ) : (
                        approvedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">#{user.id}</TableCell>
                            <TableCell className="font-bold text-primary">{user.index_number}</TableCell>
                            <TableCell>{user.first_name} {user.last_name}</TableCell>
                            <TableCell>{user.email_address}</TableCell>
                            <TableCell><Badge className="bg-green-600 hover:bg-green-700">{user.aprroved_status}</Badge></TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <UserActionDialog 
                                  user={user} 
                                  courses={courses} 
                                  onSuccess={() => { fetchPendingUsers(); fetchApprovedUsers(); }} 
                                />
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleResendSMS(user.id)}
                                  disabled={resendingSms === user.id}
                                >
                                  {resendingSms === user.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                  Resend SMS
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              {!loading && totalApproved > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {((approvedPage - 1) * limit) + 1} to {Math.min(approvedPage * limit, totalApproved)} of {totalApproved} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setApprovedPage(p => Math.max(1, p - 1))}
                      disabled={approvedPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm font-medium px-2">Page {approvedPage} of {Math.ceil(totalApproved / limit)}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setApprovedPage(p => Math.min(Math.ceil(totalApproved / limit), p + 1))}
                      disabled={approvedPage >= Math.ceil(totalApproved / limit)}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewSlipUser} onOpenChange={(open) => !open && setViewSlipUser(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Slip Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col items-center gap-6 max-h-[75vh] w-full overflow-auto pr-2">
            {loadingSlips ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading payment details...</p>
              </div>
            ) : slipDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment details found.</p>
            ) : (
              slipDetails.map((slip, idx) => {
                const fullUrl = `https://content-provider.pharmacollege.lk${slip.slip_path}`;
                const isPdf = slip.slip_path?.toLowerCase().endsWith('.pdf');
                const isDuplicate = parseInt(slip.duplicate_count) > 1;
                const duplicateRefs = slip.duplicate_refs ? `(Ref: #${slip.duplicate_refs})` : '';

                return (
                  <Card key={idx} className="w-full">
                    <CardHeader className="pb-3 border-b bg-muted/30">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-semibold">Payment Request {idx + 1}</CardTitle>
                        {isDuplicate && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Duplicate Warning {duplicateRefs}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold uppercase">Date</p>
                          <p className="font-medium">{slip.paid_date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold uppercase">Amount</p>
                          <p className="font-medium">Rs. {slip.paid_amount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold uppercase">Reason</p>
                          <p className="font-medium capitalize">{slip.payment_reson?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold uppercase">Bank</p>
                          <p className="font-medium">{slip.bank} {slip.branch ? `(${slip.branch})` : ''}</p>
                        </div>
                      </div>

                      <Accordion type="single" collapsible className="w-full border rounded-md px-4">
                        <AccordionItem value="slip" className="border-b-0">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <span className="text-sm font-medium">View Uploaded Slip</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-2 flex flex-col items-center">
                              {isPdf ? (
                                <iframe 
                                  src={fullUrl} 
                                  className="w-full min-h-[60vh] border rounded-md bg-white mb-2"
                                  title={`Payment Slip PDF ${idx + 1}`}
                                />
                              ) : (
                                <img 
                                  src={fullUrl} 
                                  alt={`Payment Slip ${idx + 1}`} 
                                  className="max-w-full h-auto object-contain border rounded-md bg-white mb-2"
                                />
                              )}
                              <div className="w-full flex justify-end">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={fullUrl} target="_blank" rel="noreferrer">
                                    Open in New Tab
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewSlipUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
