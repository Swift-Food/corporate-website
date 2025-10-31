// api/corporateOrders.ts (create this file)

import apiClient from './client';

export const corporateOrdersApi = {
  getApprovedOrders: async (managerId: string) => {
    const response = await apiClient.get(`/corporate-orders/approved/${managerId}`);
    return response.data;
  },
};