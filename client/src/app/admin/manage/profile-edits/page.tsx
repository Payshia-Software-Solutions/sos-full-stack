"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getPendingProfileEditRequests, 
  getStudentDetailsByUsername, 
  approveProfileEditRequest, 
  rejectProfileEditRequest,
  bulkApproveProfileEditRequests 
} from "@/lib/actions/users";
import type { UserFullDetails } from "@/lib/types";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  ShieldCheck, 
  XCircle, 
  UserCheck, 
  ArrowRight, 
  User, 
  Search, 
  CheckCheck, 
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Award,
  ChevronLeft,
  ChevronRight,
  FilterX
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

export default function AdminProfileEditsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [currentProfiles, setCurrentProfiles] = useState<Record<string, UserFullDetails>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [actioning, setActioning] = useState(false);

  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50); // 25, 50, 100, or -1 (all)

  // Bulk confirmation dialog state
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"selected" | "all">("selected");
  const [bulkActioning, setBulkActioning] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getPendingProfileEditRequests();
      setRequests(data || []);
      setSelectedIds(new Set());
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      const errMsg = error?.message || "Failed to fetch profile edit requests. Please check your backend connection.";
      setFetchError(errMsg);
      toast({ description: errMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests by search query
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase().trim();
    return requests.filter((req) => 
      (req.username && req.username.toLowerCase().includes(q)) ||
      (req.full_name && req.full_name.toLowerCase().includes(q)) ||
      (req.first_name && req.first_name.toLowerCase().includes(q)) ||
      (req.last_name && req.last_name.toLowerCase().includes(q)) ||
      (req.name_on_certificate && req.name_on_certificate.toLowerCase().includes(q)) ||
      (req.nic && req.nic.toLowerCase().includes(q)) ||
      (req.city && req.city.toLowerCase().includes(q)) ||
      (req.e_mail && req.e_mail.toLowerCase().includes(q)) ||
      (req.telephone_1 && req.telephone_1.includes(q)) ||
      (req.telephone_2 && req.telephone_2 && req.telephone_2.includes(q))
    );
  }, [requests, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Paginated items
  const totalFiltered = filteredRequests.length;
  const isAllPages = pageSize === -1;
  const totalPages = isAllPages ? 1 : Math.max(1, Math.ceil(totalFiltered / pageSize));
  
  const paginatedRequests = useMemo(() => {
    if (isAllPages) return filteredRequests;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredRequests, currentPage, pageSize, isAllPages]);

  // Selection handlers
  const isAllSelected = totalFiltered > 0 && filteredRequests.every(r => selectedIds.has(r.id));
  const isPageSelected = paginatedRequests.length > 0 && paginatedRequests.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set<number>();
      filteredRequests.forEach(r => newSet.add(r.id));
      setSelectedIds(newSet);
    }
  };

  const handleToggleSelectPage = () => {
    if (isPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedRequests.forEach(r => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedRequests.forEach(r => next.add(r.id));
        return next;
      });
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Compare & Review: Fetch student profile lazily only when opening dialog
  const handleOpenCompare = async (req: any) => {
    setSelectedRequest(req);
    if (req.username && !currentProfiles[req.username]) {
      setLoadingProfile(true);
      try {
        const profile = await getStudentDetailsByUsername(req.username);
        setCurrentProfiles((prev) => ({ ...prev, [req.username]: profile }));
      } catch (err) {
        console.error(`Failed to fetch current profile for ${req.username}`, err);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const handleApprove = async (id: number) => {
    if (!user?.name) return;
    setActioning(true);
    try {
      await approveProfileEditRequest(id, user.name);
      toast({ description: "Profile edit request approved and user updated successfully!" });
      setSelectedRequest(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast({ description: error.message || "Failed to approve request", variant: "destructive" });
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
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast({ description: error.message || "Failed to reject request", variant: "destructive" });
    } finally {
      setActioning(false);
    }
  };

  // Trigger Bulk Approval
  const openBulkApproveDialog = (type: "selected" | "all") => {
    setBulkActionType(type);
    setBulkConfirmOpen(true);
  };

  const executeBulkApprove = async () => {
    if (!user?.name) return;
    setBulkActioning(true);
    try {
      const isApproveAll = bulkActionType === "all";
      const idsToApprove = isApproveAll ? [] : Array.from(selectedIds);
      
      const res = await bulkApproveProfileEditRequests(idsToApprove, user.name, isApproveAll);
      toast({ 
        description: res.message || `Successfully approved ${res.approved_count} profile edit requests!`,
        className: "bg-emerald-600 text-white font-medium"
      });
      setBulkConfirmOpen(false);
      setSelectedIds(new Set());
      fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast({ 
        description: error.message || "Failed to bulk approve requests", 
        variant: "destructive" 
      });
    } finally {
      setBulkActioning(false);
    }
  };

  const renderComparisonRow = (label: string, fieldName: string, reqVal: any, currentVal: any) => {
    const isDifferent = String(reqVal || '').trim() !== String(currentVal || '').trim();
    
    return (
      <tr className={`border-b border-slate-800 text-sm ${isDifferent ? 'bg-emerald-500/10' : ''}`}>
        <td className="py-3 px-4 font-medium text-slate-400 w-1/4">{label}</td>
        <td className="py-3 px-4 text-slate-300 w-3/8">
          {currentVal || <span className="text-slate-500 italic">Not set</span>}
        </td>
        <td className="py-3 px-4 text-center w-1/12">
          {isDifferent && <ArrowRight className="h-4 w-4 text-amber-400 inline" />}
        </td>
        <td className={`py-3 px-4 font-semibold w-3/8 ${isDifferent ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
          {reqVal || <span className="text-slate-500 italic">Not set</span>}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[450px] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm text-slate-400 font-medium">Loading profile edit requests...</p>
      </div>
    );
  }

  const selectedCount = selectedIds.size;
  const totalCount = requests.length;
  const startIndex = isAllPages ? 1 : (currentPage - 1) * pageSize + 1;
  const endIndex = isAllPages ? totalFiltered : Math.min(currentPage * pageSize, totalFiltered);

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 space-y-6 pb-28">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100">Profile Edit Requests</h1>
            {totalCount > 0 && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 px-3 py-1 text-xs font-semibold">
                {totalCount} Pending
              </Badge>
            )}
            {selectedCount > 0 && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/25 px-3 py-1 text-xs font-semibold">
                {selectedCount} Selected
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">Review, moderate, and approve profile changes submitted by students across all courses.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRequests} 
            disabled={loading}
            className="border-slate-800 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          {selectedCount > 0 && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md shadow-emerald-950/50"
              onClick={() => openBulkApproveDialog("selected")}
            >
              <UserCheck className="h-4 w-4" /> Approve Selected ({selectedCount})
            </Button>
          )}

          {totalCount > 0 && (
            <Button
              size="sm"
              variant="default"
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 shadow-md shadow-emerald-950/40"
              onClick={() => openBulkApproveDialog("all")}
            >
              <CheckCheck className="h-4 w-4" /> Approve All ({totalCount})
            </Button>
          )}
        </div>
      </header>

      {/* Error State */}
      {fetchError && (
        <Card className="border-rose-800/40 bg-rose-950/20 shadow-md p-6 text-center">
          <div className="mx-auto bg-rose-500/10 p-3 rounded-full w-fit mb-3 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-7 h-7" />
          </div>
          <CardTitle className="text-lg text-rose-200">Unable to load requests</CardTitle>
          <CardDescription className="text-slate-400 mt-1 max-w-md mx-auto text-sm">
            {fetchError}
          </CardDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRequests} 
            className="mt-4 border-slate-700 hover:bg-slate-800 text-slate-200 gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </Button>
        </Card>
      )}

      {/* Full Width Toolbar */}
      {!fetchError && totalCount > 0 && (
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur shadow-sm p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px] max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, index, email, phone, NIC, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-slate-950 border-slate-800 text-sm focus-visible:ring-emerald-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <FilterX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selection & Page Size Controls */}
            <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
              {/* Select All in List */}
              <div 
                className="flex items-center gap-2 cursor-pointer select-none bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                onClick={handleToggleSelectAll}
                title="Select all pending requests across all pages"
              >
                <Checkbox 
                  checked={isAllSelected ? true : (isSomeSelected ? "indeterminate" : false)}
                  onCheckedChange={handleToggleSelectAll}
                  aria-label="Select all requests"
                />
                <span className="text-xs font-medium text-slate-300">
                  {isAllSelected ? "Deselect All" : "Select All"} ({totalFiltered})
                </span>
              </div>

              {/* Select Page Only (if paginated) */}
              {!isAllPages && totalPages > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleToggleSelectPage}
                  className="text-xs text-slate-400 hover:text-slate-200 h-9"
                >
                  {isPageSelected ? "Deselect Page" : "Select Page"} ({paginatedRequests.length})
                </Button>
              )}

              {/* Per Page Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>Show:</span>
                {[25, 50, 100, -1].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPageSize(size)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      pageSize === size 
                        ? 'bg-emerald-600 text-white font-semibold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {size === -1 ? 'All' : size}
                  </button>
                ))}
              </div>

              {/* Pagination Info */}
              {totalFiltered > 0 && (
                <span className="text-xs text-slate-400 font-mono">
                  {startIndex}-{endIndex} of {totalFiltered}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main List */}
      {!fetchError && filteredRequests.length === 0 ? (
        <Card className="border-0 shadow-lg text-center p-12 bg-slate-900/40">
          <div className="mx-auto bg-emerald-500/10 p-4 rounded-full w-fit mb-4">
            <UserCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <CardTitle className="text-xl">
            {searchQuery ? "No matching requests found" : "All Caught Up!"}
          </CardTitle>
          <CardDescription className="mt-2 text-slate-400">
            {searchQuery 
              ? "Try adjusting your search query to find the student request you are looking for." 
              : "There are no pending profile edit requests to review at this moment."}
          </CardDescription>
          {searchQuery && (
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-4 border-slate-800">
              Clear Search
            </Button>
          )}
        </Card>
      ) : !fetchError && (
        <div className="space-y-2.5">
          {paginatedRequests.map((req) => {
            const isSelected = selectedIds.has(req.id);
            const studentName = req.full_name || `${req.first_name || ''} ${req.last_name || ''}`.trim() || req.username;

            return (
              <Card 
                key={req.id} 
                className={`transition-all duration-150 border-slate-800/80 ${
                  isSelected 
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-950/40' 
                    : 'bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700/80'
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  {/* Left Section: Checkbox + Avatar + Primary Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-[280px] xl:max-w-md">
                    {/* Checkbox */}
                    <div 
                      className="p-1 cursor-pointer pt-2 sm:pt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(req.id);
                      }}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(req.id)}
                        aria-label={`Select request ${req.id}`}
                      />
                    </div>

                    {/* Avatar Icon */}
                    <div className="p-3 rounded-xl bg-slate-800/90 shrink-0 text-emerald-400 border border-slate-700/60">
                      <User className="w-5 h-5" />
                    </div>

                    {/* Student Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base text-slate-100 truncate">
                          {studentName}
                        </h3>
                        <Badge variant="outline" className="text-xs bg-slate-950/80 border-slate-700 text-emerald-400 font-mono">
                          {req.username}
                        </Badge>
                        {req.civil_status && (
                          <Badge variant="outline" className="text-[11px] bg-slate-950/60 border-slate-800 text-slate-400">
                            {req.civil_status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Submitted: {new Date(req.updated_at).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Center Section: Full-width Details Grid (Visible on md+ screens) */}
                  <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex-1 xl:mx-4">
                    {/* NIC */}
                    <div className="flex items-center gap-2 truncate">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-500">NIC:</span>
                      <span className="font-mono text-slate-300 font-medium truncate">{req.nic || "—"}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-500">Tel:</span>
                      <span className="font-mono text-slate-300 truncate">{req.telephone_1 || "—"}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-300 truncate" title={req.e_mail}>{req.e_mail || "—"}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-500">City:</span>
                      <span className="text-slate-300 truncate">{req.city || "—"}</span>
                    </div>

                    {/* Name on Certificate if present */}
                    {req.name_on_certificate && (
                      <div className="col-span-2 lg:col-span-4 flex items-center gap-2 truncate pt-1 border-t border-slate-800/60 mt-1">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-500">Cert Name:</span>
                        <span className="text-amber-300 font-medium truncate">{req.name_on_certificate}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Section: Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenCompare(req)}
                      className="border-slate-700 hover:bg-slate-800 text-slate-200"
                    >
                      Compare & Review
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm font-medium" 
                      disabled={actioning}
                      onClick={() => handleApprove(req.id)}
                    >
                      <UserCheck className="w-4 h-4" /> Quick Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination Controls Footer */}
          {!isAllPages && totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4 px-2">
              <span className="text-xs text-slate-400">
                Page {currentPage} of {totalPages} ({totalFiltered} total items)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="border-slate-800 hover:bg-slate-800 text-slate-300 h-8 px-2.5"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 text-xs ${
                          currentPage === pageNum 
                            ? 'bg-emerald-600 text-white font-semibold' 
                            : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="border-slate-800 hover:bg-slate-800 text-slate-300 h-8 px-2.5"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Dock for Bulk Approval (Mobile & Desktop convenience) */}
      {!fetchError && selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200 max-w-xl w-[92%]">
          <div className="flex-1 truncate">
            <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-base">{selectedCount}</span> of {totalFiltered} selected
            </p>
            <p className="text-xs text-slate-400 truncate">Ready for fast batch approval in a single transaction</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium shadow-md shadow-emerald-950/60"
              onClick={() => openBulkApproveDialog("selected")}
            >
              <UserCheck className="h-4 w-4" /> Approve ({selectedCount})
            </Button>
          </div>
        </div>
      )}

      {/* Single Request Comparison Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" /> Review Profile Changes
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Comparing changes for <strong className="text-slate-200">{selectedRequest?.username}</strong>. Highlighted rows represent values requested to change.
            </DialogDescription>
          </DialogHeader>

          {loadingProfile ? (
            <div className="flex flex-col items-center justify-center p-8 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm text-slate-400">Loading current profile information...</p>
            </div>
          ) : selectedRequest && (
            <div className="my-4 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                    <th className="py-3 px-4">Field</th>
                    <th className="py-3 px-4">Current Value</th>
                    <th className="py-3 px-4 text-center"></th>
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
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" disabled={actioning} onClick={() => handleApprove(selectedRequest.id)}>
              <UserCheck className="w-4 h-4" /> Approve & Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approval Confirmation Dialog */}
      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCheck className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold">
                {bulkActionType === "all" ? "Approve All Pending Requests" : "Approve Selected Requests"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 text-sm pt-2">
              {bulkActionType === "all" ? (
                <>
                  You are about to batch approve all <strong>{totalCount}</strong> pending profile edit requests at once.
                </>
              ) : (
                <>
                  You are about to approve <strong>{selectedCount}</strong> selected profile edit requests.
                </>
              )}
              <br /><br />
              This will update each student's official details in <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded text-xs">user_full_details</code> and active credentials immediately in a single optimized database transaction.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800" 
              disabled={bulkActioning}
              onClick={() => setBulkConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium" 
              disabled={bulkActioning}
              onClick={executeBulkApprove}
            >
              {bulkActioning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Approving...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" /> Confirm & Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
