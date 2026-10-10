import { LMS_API_URL } from "@/lib/config";

export interface Lead {
    id: string;
    full_name: string;
    student_number?: string | null;
    email: string | null;
    phone_number: string | null;
    source: 'Call' | 'WhatsApp' | 'Facebook' | 'Website' | 'Email' | 'Other';
    student_type: 'New' | 'Old' | 'Ongoing';
    course_id: string | null;
    requirement_type?: string | null;
    course_completed?: boolean | number | null;
    issue_type?: string | null;
    assigned_department?: string | null;
    status: string;
    assigned_to: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    log_count?: number;
    logs?: LeadLog[];
}

export interface LeadLog {
    id: string;
    lead_id: string;
    staff_name: string;
    action: string;
    notes: string | null;
    created_at: string;
}

export interface LeadStats {
    total_leads: number;
    statuses: Record<string, number>;
    sources: Record<string, number>;
    types: Record<string, number>;
    conversion_rate: number;
    ongoing_count: number;
    follow_up_count: number;
    converted_count: number;
}

export const getLeads = async (filters: {
    source?: string;
    student_type?: string;
    status?: string;
    assigned_to?: string;
    search?: string;
} = {}): Promise<Lead[]> => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });

    const response = await fetch(`${LMS_API_URL}/leads/?${queryParams.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch leads');
    }
    return response.json();
};

export const getLead = async (id: string): Promise<Lead> => {
    const response = await fetch(`${LMS_API_URL}/leads/${id}/`);
    if (!response.ok) {
        throw new Error('Failed to fetch lead');
    }
    return response.json();
};

export const createLead = async (leadData: Partial<Lead> & { creator_name: string }): Promise<{ message: string; id: number }> => {
    const response = await fetch(`${LMS_API_URL}/leads/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create lead');
    }
    return response.json();
};

export const updateLead = async (id: string, leadData: Partial<Lead> & { editor_name: string }): Promise<{ message: string }> => {
    const response = await fetch(`${LMS_API_URL}/leads/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update lead');
    }
    return response.json();
};

export const deleteLead = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${LMS_API_URL}/leads/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete lead');
    }
    return response.json();
};

export const addLeadLog = async (id: string, logData: { staff_name: string; action: string; notes?: string }): Promise<{ message: string }> => {
    const response = await fetch(`${LMS_API_URL}/leads/${id}/logs/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add log');
    }
    return response.json();
};

export const getLeadStats = async (): Promise<LeadStats> => {
    const response = await fetch(`${LMS_API_URL}/leads/stats/`);
    if (!response.ok) {
        throw new Error('Failed to fetch lead stats');
    }
    return response.json();
};
