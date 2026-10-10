import { LMS_API_URL } from "@/lib/config";

export interface PaymentGateSettingsData {
  id: number;
  is_active: boolean;
  restriction_mode: 'fully_paid' | 'minimum_due';
  minimum_due_amount: number;
  custom_message: string;
  updated_at?: string | null;
}

export const getPaymentGateSettings = async (): Promise<PaymentGateSettingsData> => {
  const response = await fetch(`${LMS_API_URL}/api/payment-gate-settings`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch payment gate settings');
  }
  const data = await response.json();
  return data.settings;
};

export const updatePaymentGateSettings = async (
  payload: Partial<PaymentGateSettingsData>
): Promise<{ success: boolean; message: string; settings: PaymentGateSettingsData }> => {
  const response = await fetch(`${LMS_API_URL}/api/payment-gate-settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update payment gate settings');
  }

  return response.json();
};
