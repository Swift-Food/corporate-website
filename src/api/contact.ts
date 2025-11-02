// api/contact.ts
import apiClient from './client';

export enum ContactReason {
  REFUND = 'refund',
  TECHNICAL_ISSUE = 'technical_issue',
  BILLING_QUESTION = 'billing_question',
  FEATURE_REQUEST = 'feature_request',
  GENERAL_INQUIRY = 'general_inquiry',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

export interface SubmitContactFormData {
  organizationId: string;
  managerId: string;
  reason: ContactReason;
  message: string;
  orderId?: string;
  contactEmail?: string;
}

export const contactApi = {
  async submitContactForm(data: SubmitContactFormData) {
    const response = await apiClient.post('organizations/contact', data);
    return response.data;
  },
};