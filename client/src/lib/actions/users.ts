import { LMS_API_URL } from "@/lib/config";


import type { StudentSearchResult, UserFullDetails, ApiStaffMember, StaffMember, StudentEnrollmentInfo, TempUser, StudentBalanceData, GamePatient, Course } from '../types';

const QA_API_BASE_URL = LMS_API_URL;

// Student Search
export const searchStudents = async (query: string): Promise<StudentSearchResult[]> => {
    if (!query) return Promise.resolve([]);
    const response = await fetch(`${QA_API_BASE_URL}/student-search-new/${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Failed to search students');
    }
    return response.json();
};

export const getPatient = async (studentId: string, courseCode: string): Promise<GamePatient> => {
    const response = await fetch(`${QA_API_BASE_URL}/care-center-courses/student/${studentId}/course/${courseCode}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch game prescriptions' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    
    // The API returns an object where keys are prescription IDs. We need the first one.
    const presId = Object.keys(data)[0];
    if (!presId || !data[presId] || !data[presId].patient) {
      throw new Error("Patient not found in the response for the specified course.");
    }
    
    const patientData = {
        ...data[presId].patient,
        start_data: data[presId].start_data,
    };
    
    return patientData;
};

export const getAllUserFullDetails = async (): Promise<UserFullDetails[]> => {
    const response = await fetch(`${QA_API_BASE_URL}/userFullDetails`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user details' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
}

export const getAllStudents = async (): Promise<ApiStaffMember[]> => {
    const response = await fetch(`${QA_API_BASE_URL}/users`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch students' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const users = await response.json();
    return users.filter((user: any) => user.userlevel === 'Student');
};

const mapApiStaffToStaffMember = (apiStaff: ApiStaffMember): StaffMember => ({
  id: apiStaff.id,
  name: `${apiStaff.fname} ${apiStaff.lname}`,
  username: apiStaff.username,
  email: apiStaff.email,
  avatar: `https://placehold.co/40x40.png?text=${apiStaff.fname[0]}${apiStaff.lname[0]}`,
});

export const getStaffMembers = async (): Promise<StaffMember[]> => {
    const response = await fetch(`${QA_API_BASE_URL}/users/staff/`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch staff members' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    const apiStaffList: ApiStaffMember[] = await response.json();
    return apiStaffList.map(mapApiStaffToStaffMember);
};

export const getStudentFullInfo = async (studentNumber: string): Promise<any> => {
    let formattedUser = studentNumber.trim();
    if (formattedUser.toLowerCase() === 'admin') {
        formattedUser = 'admin';
    } else {
        formattedUser = formattedUser.toUpperCase();
    }
    const response = await fetch(`${QA_API_BASE_URL}/get-student-full-info?loggedUser=${encodeURIComponent(formattedUser)}`, { cache: 'no-store' });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Student full info not found for ${studentNumber}` }));
        throw new Error(errorData.message || 'Failed to fetch student full info');
    }
    const data = await response.json();
    if (!data.studentInfo || !data.studentEnrollments || !data.studentBalance) {
        throw new Error('Incomplete student data received from API');
    }
    return data;
};

export const getStudentEnrollments = async (studentNumber: string): Promise<StudentEnrollmentInfo[]> => {
    try {
        const response = await fetch(`${QA_API_BASE_URL}/student-courses-new/student-number/${encodeURIComponent(studentNumber)}`);
        let enrollments: StudentEnrollmentInfo[] = [];
        if (response.ok) {
            enrollments = await response.json();
        }
        
        if (Array.isArray(enrollments) && enrollments.length > 0) {
            return enrollments;
        }

        // Fallback: If student-courses-new returned empty or 404, check getStudentFullInfo
        try {
            const fullInfo = await getStudentFullInfo(studentNumber);
            if (fullInfo && fullInfo.studentEnrollments && typeof fullInfo.studentEnrollments === 'object') {
                const fallbackList: StudentEnrollmentInfo[] = Object.values(fullInfo.studentEnrollments).map((e: any) => ({
                    student_course_id: e.id,
                    course_code: e.course_code,
                    student_id: e.student_id,
                    enrollment_key: e.enrollment_key,
                    created_at: e.created_at,
                    parent_course_id: e.parent_course_id,
                    course_name: e.parent_course_name || e.batch_name || e.course_code,
                    course_img: e.course_img || '',
                    whatsapp_link: e.whatsapp_link || '',
                    user_id: fullInfo.studentInfo?.id,
                    username: fullInfo.studentInfo?.username,
                    civil_status: fullInfo.studentInfo?.civil_status,
                    first_name: fullInfo.studentInfo?.first_name,
                    last_name: fullInfo.studentInfo?.last_name,
                    gender: fullInfo.studentInfo?.gender,
                    address_line_1: fullInfo.studentInfo?.address_line_1,
                    address_line_2: fullInfo.studentInfo?.address_line_2,
                    city: fullInfo.studentInfo?.city,
                    district: fullInfo.studentInfo?.district,
                    postal_code: fullInfo.studentInfo?.postal_code,
                    telephone_1: fullInfo.studentInfo?.telephone_1,
                    telephone_2: fullInfo.studentInfo?.telephone_2,
                    nic: fullInfo.studentInfo?.nic,
                    e_mail: fullInfo.studentInfo?.e_mail,
                    birth_day: fullInfo.studentInfo?.birth_day,
                    updated_by: fullInfo.studentInfo?.updated_by,
                    updated_at: fullInfo.studentInfo?.updated_at,
                    full_name: fullInfo.studentInfo?.full_name,
                    name_with_initials: fullInfo.studentInfo?.name_with_initials,
                    name_on_certificate: fullInfo.studentInfo?.name_on_certificate,
                }));
                if (fallbackList.length > 0) {
                    return fallbackList;
                }
            }
        } catch {
            // ignore fallback fetch error
        }

        return Array.isArray(enrollments) ? enrollments : [];
    } catch (error) {
        console.error(`Error fetching enrollments for ${studentNumber}:`, error);
        return [];
    }
};

export const addStudentEnrollment = async (data: { student_id: string; course_code: string }): Promise<any> => {
    const payload = {
        student_id: data.student_id,
        course_code: data.course_code,
        enrollment_key: 'ForceAdmin',
        created_at: new Date().toISOString(),
    };
    const response = await fetch(`${QA_API_BASE_URL}/student-courses-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add enrollment' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};

export const removeStudentEnrollment = async (studentCourseId: string): Promise<any> => {
    const response = await fetch(`${QA_API_BASE_URL}/student-courses-new/${studentCourseId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to remove enrollment' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};

export const getStudentDetailsByUsername = async (username: string): Promise<UserFullDetails> => {
    const response = await fetch(`${QA_API_BASE_URL}/userFullDetails/username/${username}/`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch student details for ${username}` }));
        throw new Error(errorData.message || 'Failed to fetch student details');
    }
    return response.json();
};

export const getTempUserDetailsById = async (id: string): Promise<TempUser> => {
    const response = await fetch(`${QA_API_BASE_URL}/temp-users/${id}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch temp user details for ID ${id}` }));
        throw new Error(errorData.message || 'Failed to fetch temp user details');
    }
    return response.json();
};

export const getStudentBalance = async (studentNumber: string): Promise<StudentBalanceData> => {
    const response = await fetch(`${QA_API_BASE_URL}/get-student-balance?loggedUser=${studentNumber}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch student balance for ${studentNumber}`}));
        throw new Error(errorData.message || 'Failed to fetch student balance');
    }
    return response.json();
};

export const submitProfileEditRequest = async (data: any): Promise<any> => {
    const response = await fetch(`${QA_API_BASE_URL}/profile-edits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit profile edit request' }));
        throw new Error(errorData.message || 'Failed to submit profile edit request');
    }
    return response.json();
};

export const getPendingProfileEditRequests = async (): Promise<any[]> => {
    const response = await fetch(`${QA_API_BASE_URL}/profile-edits/pending`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch pending profile edit requests' }));
        throw new Error(errorData.message || 'Failed to fetch pending profile edit requests');
    }
    return response.json();
};

export const getProfileEditRequestStatus = async (username: string): Promise<any> => {
    const response = await fetch(`${QA_API_BASE_URL}/profile-edits/status/${username}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile edit request status' }));
        throw new Error(errorData.message || 'Failed to fetch profile edit request status');
    }
    return response.json();
};

export const approveProfileEditRequest = async (id: string | number, adminUsername: string): Promise<any> => {
    const response = await fetch(`${QA_API_BASE_URL}/profile-edits/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_username: adminUsername }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to approve request' }));
        throw new Error(errorData.message || 'Failed to approve request');
    }
    return response.json();
};

export const rejectProfileEditRequest = async (id: string | number): Promise<any> => {
    const response = await fetch(`${QA_API_BASE_URL}/profile-edits/${id}/reject`, {
        method: 'POST',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to reject request' }));
        throw new Error(errorData.message || 'Failed to reject request');
    }
    return response.json();
};
