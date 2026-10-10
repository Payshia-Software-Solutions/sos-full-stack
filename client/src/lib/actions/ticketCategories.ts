import { LMS_API_URL } from "@/lib/config";

export interface TicketCategoryItem {
    id: number;
    category_key: string;
    name: string;
    icon?: string;
    color?: string;
    bg_color?: string;
    border_color?: string;
    description?: string;
    display_order: number;
    is_active: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateTicketCategoryPayload {
    name: string;
    category_key?: string;
    icon?: string;
    color?: string;
    bg_color?: string;
    border_color?: string;
    description?: string;
    display_order?: number;
    is_active?: number;
}

const BASE_URL = LMS_API_URL;

// Get only active categories (for ticket creation)
export async function getActiveTicketCategories(): Promise<TicketCategoryItem[]> {
    try {
        const res = await fetch(`${BASE_URL}/ticket-categories/active/`, {
            cache: 'no-store'
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch active categories: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error("Error fetching active ticket categories:", err);
        return [];
    }
}

// Get all categories (for admin management)
export async function getAllTicketCategories(): Promise<TicketCategoryItem[]> {
    const res = await fetch(`${BASE_URL}/ticket-categories/`, {
        cache: 'no-store'
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch ticket categories: ${res.status}`);
    }
    return await res.json();
}

// Create category
export async function createTicketCategory(data: CreateTicketCategoryPayload): Promise<{ message: string; id: number }> {
    const res = await fetch(`${BASE_URL}/ticket-categories/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create category (${res.status})`);
    }
    return await res.json();
}

// Update category
export async function updateTicketCategory(id: number, data: Partial<CreateTicketCategoryPayload>): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/ticket-categories/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to update category (${res.status})`);
    }
    return await res.json();
}

// Delete category
export async function deleteTicketCategory(id: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/ticket-categories/${id}/`, {
        method: 'DELETE'
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete category (${res.status})`);
    }
    return await res.json();
}
