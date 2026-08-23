import { LMS_API_URL } from "@/lib/config";
import type { StudentDocumentVerification } from "@/lib/types";

const API_BASE_URL = LMS_API_URL;

export interface KycResponse {
  success: boolean;
  data: StudentDocumentVerification;
  error?: string;
}

export interface KycListResponse {
  success: boolean;
  data: StudentDocumentVerification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export const getStudentKycStatus = async (studentId: string): Promise<StudentDocumentVerification> => {
  try {
    const response = await fetch(`${API_BASE_URL}/student-kyc/status/${encodeURIComponent(studentId)}/`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch KYC status: ${response.statusText}`);
    }
    
    const result: KycResponse = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    
    return {
      student_id: studentId,
      id_type: 'nic',
      status: 'not_submitted'
    };
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return {
      student_id: studentId,
      id_type: 'nic',
      status: 'not_submitted'
    };
  }
};

export const submitStudentKyc = async (formData: FormData): Promise<{ success: boolean; message: string; id?: number }> => {
  const response = await fetch(`${API_BASE_URL}/student-kyc/submit/`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to submit verification documents');
  }

  return data;
};

export const getAdminKycRecords = async (
  status?: string,
  search?: string,
  page: number = 1,
  limit: number = 50
): Promise<KycListResponse> => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${API_BASE_URL}/admin/student-kyc/?${params.toString()}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch verification records');
  }

  return response.json();
};

export const getAdminKycRecordById = async (id: number | string): Promise<StudentDocumentVerification> => {
  const response = await fetch(`${API_BASE_URL}/admin/student-kyc/${id}/`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch verification record');
  }

  const result = await response.json();
  return result.data;
};

export const verifyKycRecord = async (
  id: number | string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
  verifiedBy: string = 'Admin'
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/student-kyc/${id}/verify/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      rejection_reason: rejectionReason,
      verified_by: verifiedBy
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update verification status');
  }

  return data;
};
