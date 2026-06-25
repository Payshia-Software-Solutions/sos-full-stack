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
