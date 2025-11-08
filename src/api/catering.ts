// api/cateringOrders.ts
import apiClient from './client';

export const cateringOrdersApi = {
  getOrganizationOrders: async (managerId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `/catering-orders/organization/${managerId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  getSummary: async (managerId: string) => {
    const response = await apiClient.get(`/catering-orders/organization/${managerId}/summary`);
    return response.data;
  },
};