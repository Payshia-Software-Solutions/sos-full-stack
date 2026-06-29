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
  course_code?: string;
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
export const getPrescriptions = async (courseCode?: string): Promise<Prescription[]> => {
  if (courseCode) {
    return apiFetch(`/pharma-reader/prescriptions/course/${courseCode}/`);
  }
  return apiFetch('/pharma-reader/prescriptions/');
};

// Get prescription by ID
export const getPrescriptionById = async (id: number): Promise<Prescription> => {
  return apiFetch(`/pharma-reader/prescriptions/${id}/`);
};

// Get a random unanswered prescription for student
export const getRandomPrescription = async (userId: string, difficulty: string, courseCode?: string): Promise<{ finished: boolean; limit_reached?: boolean; prescription?: Prescription; message?: string }> => {
  if (courseCode) {
    return apiFetch(`/pharma-reader/prescription/random/${userId}/${difficulty}/course/${courseCode}/`);
  }
  return apiFetch(`/pharma-reader/prescription/random/${userId}/${difficulty}/`);
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

export interface PharmaReaderSettings {
  pharma_reader_max_easy: number;
  pharma_reader_max_intermediate: number;
  pharma_reader_max_advanced: number;
}

export const getPharmaReaderSettings = async (courseCode?: string): Promise<PharmaReaderSettings> => {
  if (courseCode) {
    return apiFetch(`/pharma-reader/settings/course/${courseCode}/`);
  }
  return apiFetch('/pharma-reader/settings/');
};

export const savePharmaReaderSettings = async (settings: Partial<PharmaReaderSettings>, courseCode?: string): Promise<{ success: boolean; message: string }> => {
  if (courseCode) {
    return apiFetch(`/pharma-reader/settings/course/${courseCode}/`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }
  return apiFetch('/pharma-reader/settings/', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
};

export const getPharmaReaderProgress = async (userId: string, courseCode?: string): Promise<{ Basic: { correct: number, required: number }; Intermediate: { correct: number, required: number }; Advanced: { correct: number, required: number } }> => {
  if (courseCode) {
    return apiFetch(`/pharma-reader/progress/${userId}/course/${courseCode}/`);
  }
  return apiFetch(`/pharma-reader/progress/${userId}/`);
};

// ─── Course Assignments ─────────────────────────────────────────────

export interface PharmaReaderCourseAssignment {
  prescription_id: number;
  course_code: string;
  assigned_by: string;
  assigned_at: string;
}

export const assignPharmaReaderPrescriptionToCourse = async (prescriptionId: string | number, courseCode: string, assignedBy: string): Promise<any> => {
  return apiFetch('/pharma-reader/course-assignments/assign/', {
    method: 'POST',
    body: JSON.stringify({ prescription_id: prescriptionId, course_code: courseCode, assigned_by: assignedBy })
  });
};

export const unassignPharmaReaderPrescriptionFromCourse = async (prescriptionId: string | number, courseCode: string): Promise<any> => {
  return apiFetch('/pharma-reader/course-assignments/unassign/', {
    method: 'POST',
    body: JSON.stringify({ prescription_id: prescriptionId, course_code: courseCode })
  });
};

export const getAllPharmaReaderCourseAssignments = async (): Promise<PharmaReaderCourseAssignment[]> => {
  const response: any = await apiFetch('/pharma-reader/course-assignments/');
  return response.data || [];
};
