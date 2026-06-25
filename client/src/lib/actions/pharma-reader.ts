"use server";

import { LMS_API_URL } from "@/lib/config";

const API_BASE_URL = LMS_API_URL;

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
      throw new Error(errorData.message || `An unknown error occurred.`);
    }

    if (response.status === 204) {
      return null as T;
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error('An unknown error occurred.');
  }
}

export interface Prescription {
  id: number;
  pres_name: string;
  difficulty: string;
  image_path: string;
  active_status: string;
  PresHelp: string;
  prescription_question: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
  answer_4: string;
  correct_answer: string;
  created_at: string;
  created_by: string;
}

export interface AttemptResult {
  id: number;
  is_correct: boolean;
  score: number;
  correct_answer: string;
  message: string;
}

export interface UserGrades {
  overallGrade: number;
  attemptsCount: number;
  attempts: any[];
}

// Get all prescriptions for Admin
export const getPrescriptions = async (): Promise<Prescription[]> => {
  return apiFetch('/pharma-reader/prescriptions/');
};

// Get prescription by ID
export const getPrescriptionById = async (id: number): Promise<Prescription> => {
  return apiFetch(`/pharma-reader/prescriptions/${id}/`);
};

// Get a random unanswered prescription for student
export const getRandomPrescription = async (userId: string): Promise<{ finished: boolean; prescription?: Prescription; message?: string }> => {
  return apiFetch(`/pharma-reader/prescription/random/${userId}/`);
};

// Save (create or update) a prescription
export const savePrescription = async (data: Partial<Prescription>): Promise<{ id?: number; message: string }> => {
  if (data.id) {
    return apiFetch(`/pharma-reader/prescription/${data.id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  return apiFetch('/pharma-reader/prescription/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Delete a prescription
export const deletePrescription = async (id: number): Promise<{ message: string }> => {
  return apiFetch(`/pharma-reader/prescription/${id}/`, {
    method: 'DELETE',
  });
};

// Submit a student answer attempt
export const submitAttempt = async (presId: number, userId: string, selectedAnswer: string): Promise<AttemptResult> => {
  return apiFetch('/pharma-reader/attempt/', {
    method: 'POST',
    body: JSON.stringify({
      pres_id: presId,
      user_id: userId,
      selected_answer: selectedAnswer,
    }),
  });
};

// Get user grades
export const getUserGrades = async (userId: string): Promise<UserGrades> => {
  return apiFetch(`/pharma-reader/grades/${userId}/`);
};

// Upload prescription image
export const uploadPrescriptionImage = async (formData: FormData): Promise<{ success: boolean; filePath: string }> => {
  return apiFetch('/pharma-reader/upload-image/', {
    method: 'POST',
    body: formData,
  });
};
