import { LMS_API_URL } from "@/lib/config";

const QA_API_BASE_URL = LMS_API_URL;

export interface StudentContactReport {
    user_id: string;
    username: string;
    fname: string;
    lname: string;
    batch_id: string;
    phone: string;
    email: string;
    address_line_1: string;
    address_line_2: string;
    original_city: string;
    original_district: string;
    telephone_1: string;
    telephone_2: string;
    city_name: string;
    district_name: string;
}

export const getStudentContactsReport = async (batchId: string): Promise<StudentContactReport[]> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/student-contacts/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch student contact report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
};

export interface WinPharmaLevel {
    level_id: string | number;
    course_code: string;
    level_name: string;
    is_active: number;
    task_count: number;
}

export interface WinPharmaStudentRow {
    index_number: string;
    student_name: string;
    last_completed_level: string;
    level_scores: Record<string | number, { completed: number; total: number }>;
    total_completed: number;
    total_tasks: number;
    percentage: number;
}

export interface WinPharmaReportResponse {
    batch_code: string;
    levels: WinPharmaLevel[];
    total_tasks: number;
    students: WinPharmaStudentRow[];
}

export interface DpadStudentRow {
    index_number: string;
    student_name: string;
    correct_count: number;
    incorrect_count: number;
    overall_grade: number;
}

export interface DpadReportResponse {
    batch_code: string;
    total_envelopes: number;
    prescription_count: number;
    students: DpadStudentRow[];
}

export const getWinPharmaReport = async (batchId: string): Promise<WinPharmaReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/winpharma/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch WinPharma report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export const getDpadReport = async (batchId: string): Promise<DpadReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/d-pad/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch D-Pad report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export interface QuizReportTopic {
    topic_id: number;
    topic_name: string;
    question_count: number;
}

export interface QuizReportStudent {
    student_id: string;
    index_number: string;
    student_name: string;
    topic_scores: Record<string, number>;
    overall_grade: number;
}

export interface QuizReportResponse {
    batch_code: string;
    topics: QuizReportTopic[];
    students: QuizReportStudent[];
}

export const getQuizReport = async (batchId: string): Promise<QuizReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/quiz/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Quiz report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export interface PharmaHunterStudentRow {
    index_number: string;
    student_name: string;
    correct_count: number;
    pending_count: number;
    wrong_count: number;
    gem_count: number;
    coin_count: number;
}

export interface PharmaHunterReportResponse {
    batch_code: string;
    medicine_count: number;
    attempt_per_medicine: number;
    total_possible_attempts: number;
    students: PharmaHunterStudentRow[];
}

export const getPharmaHunterReport = async (batchId: string): Promise<PharmaHunterReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/pharma-hunter/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Pharma Hunter report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export const getPharmaHunterProReport = async (batchId: string): Promise<PharmaHunterReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/pharma-hunter-pro/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Pharma Hunter Pro report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export interface CourseAssignmentItem {
    id: number;
    assignment_name: string;
    due_date?: string;
    type?: string;
    course_code?: string;
}

export interface CourseAssignmentStudentRow {
    index_number: string;
    student_name: string;
    assignment_grades: Record<string, { grade: string; status: string }>;
    submitted_count: number;
    graded_count: number;
}

export interface CourseAssignmentReportResponse {
    batch_code: string;
    assignments: CourseAssignmentItem[];
    students: CourseAssignmentStudentRow[];
}

export const getCourseAssignmentReport = async (batchId: string): Promise<CourseAssignmentReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/course-assignment/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Course Assignment report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export interface CeylonPharmacyStudentRow {
    index_number: string;
    student_name: string;
    recovered_count: number;
    died_count: number;
    pending_count: number;
}

export interface CeylonPharmacyReportResponse {
    batch_code: string;
    total_patients: number;
    students: CeylonPharmacyStudentRow[];
}

export const getCeylonPharmacyReport = async (batchId: string): Promise<CeylonPharmacyReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/ceylon-pharmacy/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Ceylon Pharmacy report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export interface PharmaReaderStudentRow {
    index_number: string;
    student_name: string;
    read_count: number;
    correct_count: number;
    incorrect_count: number;
}

export interface PharmaReaderReportResponse {
    batch_code: string;
    total_prescriptions: number;
    students: PharmaReaderStudentRow[];
}

export const getPharmaReaderReport = async (batchId: string): Promise<PharmaReaderReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/pharma-reader/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Pharma Reader report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export interface AssignmentItem {
    id: number;
    course_code: string;
    assignment_id: string;
    assignment_name: string;
    title?: string;
    due_date?: string;
    file_path?: string;
    description?: string;
}

export interface AssignmentStudentRow {
    index_number: string;
    student_name: string;
    assignment_grades: Record<string, { grade: string; status: string }>;
    submitted_count: number;
    graded_count: number;
}

export interface AssignmentReportResponse {
    batch_code: string;
    assignments: AssignmentItem[];
    students: AssignmentStudentRow[];
}

export const getAssignmentReport = async (batchId: string): Promise<AssignmentReportResponse> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/game/assignment/${batchId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Assignment report' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export const saveAssignmentGradeAction = async (assignmentId: string, studentNumber: string, grade: string): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${QA_API_BASE_URL}/reports/grading/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assignment_id: assignmentId,
            student_number: studentNumber,
            grade: grade
        })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save grade' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};




