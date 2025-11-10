// api/corporateOrders.ts

import apiClient from './client';
import { OrderResponse } from '../types/order';

export const corporateOrdersApi = {
  getApprovedOrders: async (managerId: string) => {
    const response = await apiClient.get(`/corporate-orders/approved/${managerId}`);
    return response.data;
  },

  getEmployeeActiveOrders: async (employeeId: string): Promise<OrderResponse[]> => {
    const response = await apiClient.get(`/corporate-orders/employee/${employeeId}/active`);
    return response.data;
  },
};