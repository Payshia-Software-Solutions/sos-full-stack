'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminKycRecords, verifyKycRecord } from '@/lib/actions/kyc';
import type { StudentDocumentVerification, DocumentVerificationStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  ExternalLink,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminDocumentVerificationPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<StudentDocumentVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Review Dialog State
  const [selectedRecord, setSelectedRecord] = useState<StudentDocumentVerification | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Active document preview in review dialog
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ label: string; url: string } | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAdminKycRecords(statusFilter, searchQuery, currentPage, 20);
      if (res.success) {
        setRecords(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch verification records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOpenReview = (record: StudentDocumentVerification) => {
    setSelectedRecord(record);
    setReviewStatus(record.status === 'rejected' ? 'rejected' : 'approved');
    setRejectionReason(record.rejection_reason || '');

    // Set first available document as default preview
    const firstDoc = record.id_front_image
      ? { label: 'ID Front Side', url: record.id_front_image }
      : record.birth_certificate_front
      ? { label: 'Birth Certificate Front', url: record.birth_certificate_front }
      : null;
    setSelectedDocPreview(firstDoc);

    setIsReviewOpen(true);
  };

  const handleProcessVerification = async () => {
    if (!selectedRecord?.id) return;

    if (reviewStatus === 'rejected' && !rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please specify the reason why the documents are rejected so the student can rectify them.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const res = await verifyKycRecord(
        selectedRecord.id,
        reviewStatus,
        rejectionReason.trim() || undefined,
        user?.name || user?.username || 'Admin'
      );

      if (res.success) {
        toast({
          title: reviewStatus === 'approved' ? 'Approved' : 'Rejected',
          description: `Verification status updated to ${reviewStatus} successfully.`,
        });
        setIsReviewOpen(false);
        fetchRecords();
      }
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err.message || 'Failed to update verification status',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

  const getFullDocUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/student-documents/')) return `${CONTENT_PROVIDER_URL}${path}`;
    if (path.startsWith('/uploads/')) return `https://qa-api.pharmacollege.lk${path}`;
    return `${CONTENT_PROVIDER_URL}/${path.replace(/^\/+/, '')}`;
  };

  const getAvailableDocs = (record: StudentDocumentVerification) => {
    const list: { label: string; url: string; key: string }[] = [];
    if (record.id_front_image) list.push({ label: 'ID Front', url: record.id_front_image, key: 'id_front' });
    if (record.id_back_image) list.push({ label: 'ID Back', url: record.id_back_image, key: 'id_back' });
    if (record.birth_certificate_front) list.push({ label: 'Birth Cert Front', url: record.birth_certificate_front, key: 'bc_front' });
    if (record.birth_certificate_back) list.push({ label: 'Birth Cert Back', url: record.birth_certificate_back, key: 'bc_back' });
    if (record.ol_certificate) list.push({ label: 'O/L Certificate', url: record.ol_certificate, key: 'ol_cert' });
    if (record.al_certificate) list.push({ label: 'A/L Certificate', url: record.al_certificate, key: 'al_cert' });
    return list;
  };

  return (
    <div className="w-full py-6 px-4 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Student Document Verification</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Review student identity cards (NIC / Passport / License), birth certificates, and educational qualifications.
          </p>
        </div>

        <Button onClick={fetchRecords} variant="outline" size="sm" className="gap-1.5 self-start md:self-auto">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Tabs
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="pending" className="gap-1 text-xs md:text-sm">
                  <Clock className="h-3.5 w-3.5" /> Pending
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-1 text-xs md:text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-1 text-xs md:text-sm">
                  <XCircle className="h-3.5 w-3.5" /> Rejected
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-1 text-xs md:text-sm">
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 w-full md:w-80">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student ID, name, NIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
                  className="pl-8 text-sm"
                />
              </div>
              <Button onClick={() => { setCurrentPage(1); fetchRecords(); }} size="sm">
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Records Table */}
      <Card>
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Verification Requests ({totalCount})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span>Loading verification requests...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
              <p className="font-medium">No document verification records found.</p>
              <p className="text-xs mt-1">There are no records matching your current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Info</TableHead>
                    <TableHead>ID Details</TableHead>
                    <TableHead>Submitted Docs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => {
                    const availableDocs = getAvailableDocs(record);
                    return (
                      <TableRow key={record.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="font-semibold text-sm">
                            {record.fname || record.lname ? `${record.fname || ''} ${record.lname || ''}` : record.student_id}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {record.student_id}
                          </div>
                          {record.phone && (
                            <div className="text-xs text-muted-foreground">{record.phone}</div>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {record.id_type?.replace('_', ' ') || 'NIC'}
                          </Badge>
                          <div className="text-xs font-mono mt-1 font-medium">
                            {record.id_number || '-'}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {availableDocs.map((doc) => (
                              <Badge key={doc.key} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                {doc.label}
                              </Badge>
                            ))}
                            {availableDocs.length === 0 && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {record.status === 'approved' && (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </Badge>
                          )}
                          {record.status === 'pending' && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                          {record.status === 'rejected' && (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <XCircle className="h-3 w-3" /> Rejected
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {record.updated_at ? new Date(record.updated_at).toLocaleDateString() : '-'}
                          <div className="text-[10px]">
                            {record.updated_at ? new Date(record.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1.5 text-xs"
                            onClick={() => handleOpenReview(record)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Review & Verify
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review and Verification Modal Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Review Student Documents
            </DialogTitle>
            <DialogDescription>
              Inspect uploaded identification and educational certificates for verification.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 pt-2">
              {/* Student Details Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-muted/40 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block">Student Name:</span>
                  <span className="font-semibold text-sm">
                    {selectedRecord.fname || selectedRecord.lname
                      ? `${selectedRecord.fname || ''} ${selectedRecord.lname || ''}`
                      : selectedRecord.student_id}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Student Username / ID:</span>
                  <span className="font-mono font-semibold text-sm">{selectedRecord.student_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">ID Document:</span>
                  <span className="font-medium uppercase">{selectedRecord.id_type?.replace('_', ' ')}: {selectedRecord.id_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Current Status:</span>
                  <Badge
                    className={
                      selectedRecord.status === 'approved'
                        ? 'bg-green-600 text-white text-[10px]'
                        : selectedRecord.status === 'rejected'
                        ? 'bg-red-600 text-white text-[10px]'
                        : 'bg-amber-500 text-white text-[10px]'
                    }
                  >
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>

              {/* Document Tabs & Image Preview Gallery */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Available Submitted Documents:</Label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableDocs(selectedRecord).map((doc) => {
                    const isSelected = selectedDocPreview?.url === doc.url;
                    return (
                      <Button
                        key={doc.key}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => setSelectedDocPreview({ label: doc.label, url: doc.url })}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {doc.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Preview Box */}
                {selectedDocPreview ? (
                  <div className="border rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center min-h-[340px]">
                    <div className="flex items-center justify-between w-full mb-3 px-2">
                      <span className="text-sm font-semibold">{selectedDocPreview.label}</span>
                      <a
                        href={getFullDocUrl(selectedDocPreview.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline flex items-center gap-1 hover:text-primary/80"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open Full Image / PDF
                      </a>
                    </div>

                    <div className="max-w-full max-h-[460px] overflow-auto flex items-center justify-center rounded border bg-background p-2">
                      {selectedDocPreview.url.endsWith('.pdf') ? (
                        <div className="p-8 text-center space-y-3">
                          <FileText className="h-16 w-16 text-red-500 mx-auto" />
                          <p className="text-sm font-medium">PDF Document</p>
                          <Button asChild size="sm">
                            <a href={getFullDocUrl(selectedDocPreview.url)} target="_blank" rel="noopener noreferrer">
                              Open PDF in New Tab
                            </a>
                          </Button>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={getFullDocUrl(selectedDocPreview.url)}
                          alt={selectedDocPreview.label}
                          className="max-h-[440px] w-auto object-contain rounded"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
                    No documents selected or uploaded.
                  </div>
                )}
              </div>

              {/* Action Decision Section */}
              <div className="border-t pt-4 space-y-4">
                <Label className="text-sm font-semibold">Verification Decision:</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer border rounded-md px-4 py-2 hover:bg-muted/50 has-[:checked]:border-green-500 has-[:checked]:bg-green-50/30">
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={reviewStatus === 'approved'}
                      onChange={() => setReviewStatus('approved')}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Approve KYC Verification</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer border rounded-md px-4 py-2 hover:bg-muted/50 has-[:checked]:border-red-500 has-[:checked]:bg-red-50/30">
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={reviewStatus === 'rejected'}
                      onChange={() => setReviewStatus('rejected')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Reject & Request Re-upload</span>
                  </label>
                </div>

                {reviewStatus === 'rejected' && (
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason" className="text-xs text-red-600 font-semibold">
                      Reason for Rejection (Visible to student) *
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="e.g. The ID Card front photo is blurry. Please upload a clear scan or high-resolution photo."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="text-sm border-red-300 focus-visible:ring-red-400"
                      rows={3}
                      required
                    />
                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-muted-foreground mr-1">Quick Presets:</span>
                      {[
                        'ID copy is blurry or unreadable.',
                        'Missing birth certificate back page.',
                        'Educational certificate is not certified.',
                        'ID document expired or invalid.'
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRejectionReason(preset)}
                          className="text-[11px] bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-0.5 rounded border"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessVerification}
              disabled={isProcessing}
              className={
                reviewStatus === 'approved'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> Processing...
                </>
              ) : reviewStatus === 'approved' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm Approval
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1.5" /> Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
