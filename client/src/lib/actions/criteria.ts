import { LMS_API_URL } from "@/lib/config";
import { CriteriaList, CriteriaListFormValues } from '../types';

const QA_API_BASE_URL = LMS_API_URL;

export const getCriteriaLists = async (): Promise<CriteriaList[]> => {
    const response = await fetch(`${QA_API_BASE_URL}/cc_criteria_list/`);
    if (!response.ok) {
        throw new Error('Failed to fetch criteria lists');
    }
    return response.json();
};

export const getCriteriaList = async (id: string): Promise<CriteriaList> => {
    const response = await fetch(`${QA_API_BASE_URL}/cc_criteria_list/${id}/`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch criteria' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};

export const createCriteriaList = async (data: CriteriaListFormValues): Promise<{ message: string, id?: number }> => {
    const response = await fetch(`${QA_API_BASE_URL}/cc_criteria_list/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create criteria' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
};

export const updateCriteriaList = async (id: string, data: CriteriaListFormValues): Promise<{ message: string }> => {
    const response = await fetch(`${QA_API_BASE_URL}/cc_criteria_list/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update criteria' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
};

export const deleteCriteriaList = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${QA_API_BASE_URL}/cc_criteria_list/${id}/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete criteria' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
};
