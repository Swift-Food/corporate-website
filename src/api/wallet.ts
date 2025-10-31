// api/wallet.ts
import apiClient from './client';

export interface WalletStatus {
  organizationId: string;
  organizationName: string;
  stripeCustomerId: string | null;
  walletBalance: number;
  currency: string;
  contactEmail: string | null;
  contactPhone: string | null;
  billingAddress: string | null;
  paymentMethods: PaymentMethodInfo[];
  defaultPaymentMethodId: string | null;
  totalPaymentMethods: number;
  isWalletInitialized: boolean;
  hasPaymentMethod: boolean;
  hasFunds: boolean;
  isFullyOnboarded: boolean;
  onboardingProgress: {
    percentage: number;
    completedSteps: number;
    totalSteps: number;
    steps: {
      contactInfoAdded: boolean;
      walletInitialized: boolean;
      paymentMethodAdded: boolean;
      fundsAdded: boolean;
    };
    nextStep: string | null;
  };
}

export interface PaymentMethodInfo {
  id: string;
  brand: string | undefined;
  last4: string | undefined;
  expMonth: number | undefined;
  expYear: number | undefined;
  isExpired: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'debit' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  stripePaymentIntentId?: string;
  relatedOrderId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export const walletApi = {
  // Get wallet status and onboarding progress
  async getStatus(orgId: string): Promise<WalletStatus> {
    const response = await apiClient.get(`/corporate/organization/wallet/status/${orgId}`)
    return response.data;
  },

  // Initialize wallet
  async initialize(
    data: {
      contactEmail?: string;
      contactPhone?: string;
      billingAddress?: string;
      orgId: string,
      managerId: string
    }
  ) {
    const response = await apiClient.post('/corporate/organization/wallet/initialize', data);
    return response.data;
  },

  // Update contact info
  async updateContactInfo(
    orgId: string,
    data: {
      contactEmail?: string;
      contactPhone?: string;
      billingAddress?: string;
    }
  ) {
    const response = await apiClient.post('/corporate/organization/wallet/contact-info', data, {
      params: { orgId },
    });
    return response.data;
  },

  // Create setup intent for adding payment method
  async createSetupIntent(orgId: string) {
    const response = await apiClient.post(`/corporate/organization/wallet/setup-intent/${orgId}`);
    return response.data;
  },

  // Save payment method
  async savePaymentMethod(
    orgId: string,
    paymentMethodId: string,
    setAsDefault: boolean = false
  ) {
    const response = await apiClient.post(
      `/corporate/organization/wallet/payment-methods/${orgId}`,
      { paymentMethodId },
      {
        params: { setAsDefault },
      }
    );
    return response.data;
  },

  // Get saved payment methods
  async getPaymentMethods(orgId: string): Promise<PaymentMethodInfo[]> {
    const response = await apiClient.get(`/corporate/organization/wallet/payment-methods/${orgId}`);
    return response.data;
  },

  // Remove payment method
  async removePaymentMethod(managerId: string, paymentMethodId: string) {
    const response = await apiClient.delete(
      `/corporate/organization/wallet/payment-methods/${paymentMethodId}`,
      {
        params: { managerId },
      }
    );
    return response.data;
  },

  // Add funds
  async addFunds(orgId: string, managerId: string, amount: number, paymentMethodId: string) {
    const response = await apiClient.post(
      '/corporate/organization/wallet/add-funds',
      {orgId, amount, paymentMethodId, managerId }

    );
    return response.data;
  },

  // Get transaction history
  async getTransactions(
    managerId: string,
    page: number = 1,
    limit: number = 20,
    type?: 'deposit' | 'debit' | 'refund'
  ) {
    const response = await apiClient.get('/corporate/organization/wallet/transactions', {
      params: { managerId, page, limit, type },
    });
    return response.data;
  },

  // Get balance
  async getBalance(managerId: string) {
    const response = await apiClient.get('/corporate/organization/wallet/balance', {
      params: { managerId },
    });
    return response.data;
  },
};